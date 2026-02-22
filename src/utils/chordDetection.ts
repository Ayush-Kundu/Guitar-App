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

// Match browser defaults from kundu.dev/c_d
const DEFAULT_CONFIG: ChordDetectionConfig = {
  instrument: 'guitar',
  sensitivity: 0.8,
  confidence_threshold: 0.45,
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
  private actualSampleRate: number = 44100;
  private needsResample: boolean = false;

  constructor() {
    this.config = { ...DEFAULT_CONFIG };
  }

  setConfig(config: Partial<ChordDetectionConfig>) {
    this.config = { ...this.config, ...config };

    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      // Server expects config nested inside a 'config' key
      this.ws.send(JSON.stringify({
        type: 'config_update',
        config: { ...this.config }
      }));
    }
  }

  /**
   * Load a song by server-side song ID (matches browser behavior)
   * This is the preferred way to set song context
   */
  setSongById(songId: string) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      const message = {
        type: 'set_song',
        song_id: songId
      };
      console.log('[ChordDetection] Setting song by ID:', songId);
      this.ws.send(JSON.stringify(message));
    } else {
      console.log('[ChordDetection] Song ID saved for after connection:', songId);
    }
  }

  setSongContext(chords: string[], songTitle?: string) {
    this.config.song_chords = chords;
    this.config.song_influence = 0.7;

    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      // Server expects config values nested inside 'config' key
      this.ws.send(JSON.stringify({
        type: 'config_update',
        config: {
          song_chords: chords,
          song_influence: 0.7,
          map_similar_variants: true
        }
      }));
      console.log('[ChordDetection] Sending song context:', chords);
    } else {
      console.log('[ChordDetection] Song context saved for next connection:', chords);
    }
  }

  clearSongContext() {
    this.config.song_chords = undefined;

    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'config_update',
        config: {
          song_chords: [],
          song_info: null
        }
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
        this.ws.binaryType = 'arraybuffer';

        this.ws.onopen = () => {
          console.log('[ChordDetection] Connected to', wsUrl);
          this.onStatusChange?.(true, 'Connected');

          // Send initial configuration (no type field, matches browser behavior)
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
    if (data.type === 'song_loaded' || data.type === 'song_cleared') {
      console.log('[ChordDetection]', data.type, data);
      return;
    }

    if (data.type === 'chord') {
      this.onResult?.(data);
    } else if (data.type === 'notes') {
      const notesOnlyData: ChordDetectionResult = {
        type: 'notes',
        notes: data.notes,
        dominant_notes: data.dominant_notes,
        frequencies: data.frequencies,
      };
      this.onResult?.(notesOnlyData);
    }
  }

  async startRecording(): Promise<boolean> {
    if (this.isRecording) return true;
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.error('[ChordDetection] Not connected');
      return false;
    }

    try {
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
          sampleRate: 44100
        }
      });

      // Match browser: use AudioContext or webkitAudioContext, request 44100Hz
      const AudioCtx = (window as any).AudioContext || (window as any).webkitAudioContext;
      this.audioContext = new AudioCtx({ sampleRate: 44100 });

      // iOS requires explicit resume after user gesture
      if (this.audioContext!.state === 'suspended') {
        await this.audioContext!.resume();
      }

      // Handle iOS interruptions that suspend the context
      this.audioContext!.onstatechange = () => {
        console.log('[ChordDetection] AudioContext state:', this.audioContext?.state);
        if (this.audioContext?.state === 'suspended' && this.isRecording) {
          this.audioContext.resume().catch(e => console.error('[ChordDetection] Resume failed:', e));
        }
      };

      this.actualSampleRate = this.audioContext!.sampleRate;
      this.needsResample = this.actualSampleRate !== 44100;
      console.log('[ChordDetection] AudioContext sample rate:', this.actualSampleRate,
        this.needsResample ? '(will resample to 44100)' : '(native 44100)');

      const source = this.audioContext!.createMediaStreamSource(this.mediaStream);

      // Use 4096 buffer size to match browser exactly
      this.scriptProcessor = this.audioContext!.createScriptProcessor(4096, 1, 1);

      this.scriptProcessor.onaudioprocess = (event) => {
        if (!this.isRecording || !this.ws || this.ws.readyState !== WebSocket.OPEN) return;

        const inputData = event.inputBuffer.getChannelData(0);

        try {
          if (this.needsResample) {
            const resampled = this.resampleBuffer(inputData, this.actualSampleRate, 44100);
            this.ws.send(resampled.buffer);
          } else {
            // Copy buffer to prevent WKWebView buffer reuse issues
            const copy = new Float32Array(inputData);
            this.ws.send(copy.buffer);
          }
        } catch (error) {
          console.error('[ChordDetection] Send error:', error);
        }
      };

      // Mute the output to prevent feedback loop on iOS
      // ScriptProcessor must connect to destination to fire events,
      // but we zero the gain so no audio reaches the speaker
      const silencer = this.audioContext!.createGain();
      silencer.gain.value = 0;

      source.connect(this.scriptProcessor);
      this.scriptProcessor.connect(silencer);
      silencer.connect(this.audioContext!.destination);

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

  private resampleBuffer(input: Float32Array, fromRate: number, toRate: number): Float32Array {
    const ratio = fromRate / toRate;
    const outputLength = Math.round(input.length / ratio);
    const output = new Float32Array(outputLength);

    for (let i = 0; i < outputLength; i++) {
      const srcIndex = i * ratio;
      const srcFloor = Math.floor(srcIndex);
      const srcCeil = Math.min(srcFloor + 1, input.length - 1);
      const frac = srcIndex - srcFloor;
      output[i] = input[srcFloor] * (1 - frac) + input[srcCeil] * frac;
    }

    return output;
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
