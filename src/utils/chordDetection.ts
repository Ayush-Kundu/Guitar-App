/**
 * Chord Detection Service
 * Connects to the music_test WebSocket server for real-time chord/note detection
 */

import { getChordDetectionWsUrl } from './serverConfig';

export interface ChordDetectionResult {
  type: string;
  chord?: string;
  chord_candidate?: string;
  notes?: string[];
  frequencies?: number[];
  confidence?: number;
  chroma?: number[];
  progression?: string[];
  stability?: number;
  timestamp?: number;
}

export interface ChordDetectionConfig {
  instrument?: string;
  sensitivity?: number;
  confidence_threshold?: number;
  silence_threshold?: number;
  overlap?: number;
  progression?: boolean;
  multi_pitch?: boolean;
  debug?: boolean;
}

const DEFAULT_CONFIG: ChordDetectionConfig = {
  instrument: 'guitar',
  sensitivity: 1.2,            // Slightly higher sensitivity for faster response
  confidence_threshold: 0.35,  // Lower threshold to detect faster
  silence_threshold: 0.003,    // Lower threshold for quicker detection
  overlap: 0.5,                // 50% overlap for lower latency
  progression: false,          // Disable progression for faster response
  multi_pitch: true,           // Keep multi-pitch
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
  private serverUrl: string;

  constructor(serverUrl?: string) {
    this.serverUrl = serverUrl || getChordDetectionWsUrl();
    this.config = { ...DEFAULT_CONFIG };
  }

  setConfig(config: Partial<ChordDetectionConfig>) {
    this.config = { ...this.config, ...config };
  }

  setOnResult(callback: (result: ChordDetectionResult) => void) {
    this.onResult = callback;
  }

  setOnStatusChange(callback: (connected: boolean, status: string) => void) {
    this.onStatusChange = callback;
  }

  async connect(): Promise<boolean> {
    return new Promise((resolve) => {
      try {
        this.ws = new WebSocket(this.serverUrl);

        this.ws.onopen = () => {
          console.log('[ChordDetection] WebSocket connected');
          this.onStatusChange?.(true, 'Connecting...');
          
          // Send configuration
          this.ws?.send(JSON.stringify(this.config));
        };

        this.ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            this.handleMessage(data);
            
            if (data.type === 'connected') {
              this.onStatusChange?.(true, 'Connected');
              resolve(true);
            }
          } catch (error) {
            console.error('[ChordDetection] Error parsing message:', error);
          }
        };

        this.ws.onerror = (error) => {
          console.error('[ChordDetection] WebSocket error:', error);
          this.onStatusChange?.(false, 'Connection Error');
          resolve(false);
        };

        this.ws.onclose = () => {
          console.log('[ChordDetection] WebSocket closed');
          this.onStatusChange?.(false, 'Disconnected');
          this.stopRecording();
        };

        // Timeout after 5 seconds
        setTimeout(() => {
          if (this.ws?.readyState !== WebSocket.OPEN) {
            resolve(false);
          }
        }, 5000);

      } catch (error) {
        console.error('[ChordDetection] Connection error:', error);
        this.onStatusChange?.(false, 'Connection Failed');
        resolve(false);
      }
    });
  }

  private handleMessage(data: ChordDetectionResult) {
    if (data.type === 'connected') {
      console.log('[ChordDetection] Server confirmed connection');
      return;
    }

    if (data.type === 'error') {
      console.error('[ChordDetection] Server error:', data);
      return;
    }

    // Handle chord detection (same as main.js handleWebSocketMessage)
    if (data.type === 'chord') {
      this.onResult?.(data);
    } else if (data.type === 'notes') {
      // If there's a chord candidate with low confidence, include it
      if (data.chord_candidate) {
        this.onResult?.({
          ...data,
          chord: data.chord_candidate,
          stability: 0
        });
      } else {
        this.onResult?.(data);
      }
    } else if (data.type === 'frequencies') {
      this.onResult?.(data);
    }
    // Ignore 'listening' type - keep last state
  }

  async startRecording(): Promise<boolean> {
    if (this.isRecording) return true;

    try {
      // Get microphone access
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
      
      // Create script processor for audio data
      // Smaller buffer = lower latency (1024 samples = ~23ms at 44100Hz)
      const bufferSize = 1024;
      this.scriptProcessor = this.audioContext.createScriptProcessor(bufferSize, 1, 1);

      this.scriptProcessor.onaudioprocess = (event) => {
        if (!this.isRecording || !this.ws || this.ws.readyState !== WebSocket.OPEN) return;

        const inputData = event.inputBuffer.getChannelData(0);
        
        // Send raw binary audio data (same as main.js does)
        // Server expects: np.frombuffer(data, dtype=np.float32)
        try {
          this.ws.send(inputData.buffer);
        } catch (error) {
          console.error('[ChordDetection] Error sending audio:', error);
        }
      };

      source.connect(this.scriptProcessor);
      this.scriptProcessor.connect(this.audioContext.destination);

      this.isRecording = true;
      this.onStatusChange?.(true, 'Recording');
      console.log('[ChordDetection] Recording started');
      return true;

    } catch (error) {
      console.error('[ChordDetection] Failed to start recording:', error);
      this.onStatusChange?.(false, 'Microphone Error');
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
    console.log('[ChordDetection] Recording stopped');
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

// Singleton instance
let chordDetectionInstance: ChordDetectionService | null = null;

export function getChordDetectionService(serverUrl?: string): ChordDetectionService {
  if (!chordDetectionInstance) {
    chordDetectionInstance = new ChordDetectionService(serverUrl);
  }
  return chordDetectionInstance;
}

// React hook for chord detection
export function useChordDetection(serverUrl?: string) {
  const wsUrl = serverUrl || getChordDetectionWsUrl();
  const [isConnected, setIsConnected] = React.useState(false);
  const [isRecording, setIsRecording] = React.useState(false);
  const [status, setStatus] = React.useState('Disconnected');
  const [detectedChord, setDetectedChord] = React.useState<string | null>(null);
  const [detectedNotes, setDetectedNotes] = React.useState<string[]>([]);
  const [confidence, setConfidence] = React.useState(0);
  
  const serviceRef = React.useRef<ChordDetectionService | null>(null);

  React.useEffect(() => {
    serviceRef.current = new ChordDetectionService(wsUrl);

    serviceRef.current.setOnStatusChange((connected, statusText) => {
      setIsConnected(connected);
      setStatus(statusText);
      setIsRecording(serviceRef.current?.getIsRecording() || false);
    });

    serviceRef.current.setOnResult((result) => {
      if (result.chord) {
        setDetectedChord(result.chord);
      }
      if (result.notes) {
        setDetectedNotes(result.notes);
      }
      if (result.confidence !== undefined) {
        setConfidence(result.confidence);
      }
    });

    return () => {
      serviceRef.current?.disconnect();
    };
  }, [wsUrl]);

  const connect = React.useCallback(async () => {
    return serviceRef.current?.connect() || false;
  }, []);

  const startRecording = React.useCallback(async () => {
    const success = await serviceRef.current?.startRecording();
    if (success) {
      setIsRecording(true);
    }
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

// Need to import React for the hook
import React from 'react';

