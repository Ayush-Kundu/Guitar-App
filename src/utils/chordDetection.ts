/**
 * Chord Detection Service
 * Connects to kundu.dev/c_d WebSocket API for real-time chord/note detection
 */

import React from 'react';
import { getChordDetectionWsUrl } from './serverConfig';

export interface ChordDetectionResult {
  type: string;
  chord?: string;
  chord_candidate?: string;
  notes?: string[] | [string, number][];
  frequencies?: number[];
  confidence?: number;
  chroma?: number[];
  stability?: number;
  timestamp?: number;
  raw_chord?: string;
  song_matched?: boolean;
  dominant_notes?: string[];
}

export interface ChordDetectionConfig {
  instrument?: string;
  sensitivity?: number;
  confidence_threshold?: number;
  silence_threshold?: number;
  overlap?: number;
  chord_window?: number;
  chord_window_confidence?: number;
  multi_pitch?: boolean;
  song_chords?: string[];
  song_influence?: number;
  map_similar_variants?: boolean;
  debug?: boolean;
}

// Default config matching kundu.dev/c_d defaults
const DEFAULT_CONFIG: ChordDetectionConfig = {
  instrument: 'guitar',
  sensitivity: 0.8,
  confidence_threshold: 0.2,
  silence_threshold: 0.005,
  overlap: 0.75,
  chord_window: 0.3,
  chord_window_confidence: 0.45,
  multi_pitch: true,
  song_influence: 0.7,
  map_similar_variants: true,
  debug: false
};

export class ChordDetectionService {
  private ws: WebSocket | null = null;
  private audioContext: AudioContext | null = null;
  private mediaStream: MediaStream | null = null;
  private scriptProcessor: ScriptProcessorNode | null = null;
  private config: ChordDetectionConfig;
  private isRecording: boolean = false;
  private onResult: ((result: ChordDetectionResult) => void) | null = null;
  private onStatusChange: ((connected: boolean, status: string) => void) | null = null;

  constructor() {
    this.config = { ...DEFAULT_CONFIG };
  }

  setConfig(config: Partial<ChordDetectionConfig>) {
    this.config = { ...this.config, ...config };
    
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'config_update',
        ...this.config
      }));
    }
  }

  setSongContext(chords: string[], songTitle?: string) {
    this.config.song_chords = chords;
    
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'config_update',
        song_chords: chords,
        song_info: songTitle ? { title: songTitle } : undefined
      }));
      console.log(`[ChordDetection] Set song context: ${chords.join(', ')}`);
    }
  }

  clearSongContext() {
    this.config.song_chords = undefined;
    
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'config_update',
        song_chords: [],
        song_info: null
      }));
    }
  }

  setOnResult(callback: (result: ChordDetectionResult) => void) {
    this.onResult = callback;
  }

  setOnStatusChange(callback: (connected: boolean, status: string) => void) {
    this.onStatusChange = callback;
  }

  async connect(): Promise<boolean> {
    const wsUrl = getChordDetectionWsUrl();
    
    return new Promise((resolve) => {
      try {
        console.log('[ChordDetection] Connecting to:', wsUrl);
        this.onStatusChange?.(false, 'Connecting...');
        
        this.ws = new WebSocket(wsUrl);

        this.ws.onopen = () => {
          console.log('[ChordDetection] Connected to', wsUrl);
          this.onStatusChange?.(true, 'Connected');
          
          // Send configuration
          console.log('[ChordDetection] Sending config:', this.config);
          this.ws?.send(JSON.stringify(this.config));
          
          resolve(true);
        };

        this.ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            
            if (data.type === 'connected') {
              console.log('[ChordDetection] Server confirmed:', data.message || 'OK');
            }
            
            this.handleMessage(data);
          } catch (error) {
            console.error('[ChordDetection] Parse error:', error);
          }
        };

        this.ws.onerror = (error) => {
          console.error('[ChordDetection] WebSocket error:', error);
          this.onStatusChange?.(false, 'Connection Error');
          resolve(false);
        };

        this.ws.onclose = (event) => {
          console.log('[ChordDetection] Closed:', event.code, event.reason);
          this.onStatusChange?.(false, 'Disconnected');
          this.stopRecording();
        };

        // Timeout after 10 seconds
        setTimeout(() => {
          if (this.ws?.readyState !== WebSocket.OPEN) {
            console.error('[ChordDetection] Connection timeout');
            this.onStatusChange?.(false, 'Timeout');
            resolve(false);
          }
        }, 10000);

      } catch (error) {
        console.error('[ChordDetection] Error:', error);
        this.onStatusChange?.(false, 'Failed');
        resolve(false);
      }
    });
  }

  private handleMessage(data: ChordDetectionResult) {
    if (data.type === 'connected') return;
    if (data.type === 'error') {
      console.error('[ChordDetection] Server error:', data);
      return;
    }

    if (data.type === 'chord' || data.type === 'notes' || data.type === 'frequencies') {
      if (data.type === 'notes' && data.chord_candidate && !data.chord) {
        data.chord = data.chord_candidate;
        data.stability = 0;
      }
      this.onResult?.(data);
    }
  }

  async startRecording(): Promise<boolean> {
    if (this.isRecording) return true;
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.error('[ChordDetection] Not connected');
      return false;
    }

    try {
      // Get microphone
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
          sampleRate: 44100
        }
      });

      // Create audio context
      this.audioContext = new AudioContext({ sampleRate: 44100 });
      const source = this.audioContext.createMediaStreamSource(this.mediaStream);
      
      // Create processor (512 samples = ~12ms latency for faster response)
      this.scriptProcessor = this.audioContext.createScriptProcessor(512, 1, 1);

      this.scriptProcessor.onaudioprocess = (event) => {
        if (!this.isRecording || !this.ws || this.ws.readyState !== WebSocket.OPEN) return;

        const inputData = event.inputBuffer.getChannelData(0);
        
        try {
          // Send Float32 audio data
          this.ws.send(inputData.buffer);
        } catch (error) {
          console.error('[ChordDetection] Send error:', error);
        }
      };

      source.connect(this.scriptProcessor);
      this.scriptProcessor.connect(this.audioContext.destination);

      this.isRecording = true;
      this.onStatusChange?.(true, 'Recording');
      console.log('[ChordDetection] Recording started');
      return true;

    } catch (error) {
      console.error('[ChordDetection] Microphone error:', error);
      this.onStatusChange?.(true, 'Mic Error');
      return false;
    }
  }

  stopRecording() {
    if (this.scriptProcessor) {
      this.scriptProcessor.disconnect();
      this.scriptProcessor = null;
    }

    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
      this.mediaStream = null;
    }

    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }

    this.isRecording = false;
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.onStatusChange?.(true, 'Connected');
    }
  }

  disconnect() {
    this.stopRecording();
    
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  getIsRecording(): boolean {
    return this.isRecording;
  }
}

// React hook for chord detection
export function useChordDetection() {
  const [isConnected, setIsConnected] = React.useState(false);
  const [isRecording, setIsRecording] = React.useState(false);
  const [status, setStatus] = React.useState('Disconnected');
  const [detectedChord, setDetectedChord] = React.useState<string | null>(null);
  const [detectedNotes, setDetectedNotes] = React.useState<string[]>([]);
  const [confidence, setConfidence] = React.useState(0);

  const serviceRef = React.useRef<ChordDetectionService | null>(null);

  React.useEffect(() => {
    serviceRef.current = new ChordDetectionService();

    serviceRef.current.setOnStatusChange((connected, newStatus) => {
      setIsConnected(connected);
      setStatus(newStatus);
    });

    serviceRef.current.setOnResult((result) => {
      if (result.chord) {
        setDetectedChord(result.chord);
      }
      if (result.notes) {
        const notes = result.notes.map(n => Array.isArray(n) ? String(n[0]) : String(n));
        setDetectedNotes(notes);
      }
      if (result.confidence !== undefined) {
        setConfidence(result.confidence);
      }
    });

    return () => {
      serviceRef.current?.disconnect();
    };
  }, []);

  const connect = React.useCallback(async () => {
    return serviceRef.current?.connect() || false;
  }, []);

  const startRecording = React.useCallback(async () => {
    const success = await serviceRef.current?.startRecording();
    if (success) setIsRecording(true);
    return success || false;
  }, []);

  const stopRecording = React.useCallback(() => {
    serviceRef.current?.stopRecording();
    setIsRecording(false);
  }, []);

  const disconnect = React.useCallback(() => {
    serviceRef.current?.disconnect();
    setIsConnected(false);
    setIsRecording(false);
  }, []);

  return {
    isConnected,
    isRecording,
    status,
    detectedChord,
    detectedNotes,
    confidence,
    connect,
    startRecording,
    stopRecording,
    disconnect
  };
}
