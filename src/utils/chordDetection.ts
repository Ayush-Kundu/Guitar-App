/**
 * Chord Detection Service
 * Connects to kundu.dev/c_d WebSocket API for real-time chord/note detection
 * Matches browser behavior exactly
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

// Match browser defaults EXACTLY from kundu.dev/c_d
const DEFAULT_CONFIG: ChordDetectionConfig = {
  instrument: 'guitar',
  sensitivity: 1.0,              // Browser default is 1.0, NOT 0.8
  confidence_threshold: 0.2,     // Browser default
  silence_threshold: 0.005,      // Browser default
  overlap: 0.75,
  chord_window: 0.3,
  chord_window_confidence: 0.45,
  multi_pitch: true,
  song_influence: 0.6,           // Browser default slider position
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
  private pendingSongId: string | null = null;

  constructor() {
    this.config = { ...DEFAULT_CONFIG };
  }

  setConfig(config: Partial<ChordDetectionConfig>) {
    this.config = { ...this.config, ...config };

    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'config_update',
        config: { ...config }
      }));
    }
  }

  /**
   * Load a song by server-side song ID (matches browser behavior exactly)
   * This is the ONLY way to enable song-constrained detection
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
      // Save for after connection
      this.pendingSongId = songId;
      console.log('[ChordDetection] Song ID saved for after connection:', songId);
    }
  }

  /**
   * @deprecated Use setSongById instead - this fallback method may not work correctly
   */
  setSongContext(chords: string[], songTitle?: string) {
    console.warn('[ChordDetection] setSongContext is deprecated - use setSongById for reliable song-constrained detection');
    // Try to use set_song with a guessed ID instead
    if (songTitle) {
      const guessedId = songTitle.toLowerCase().replace(/[^a-z0-9]+/g, '_');
      this.setSongById(guessedId);
    }
  }

  clearSongContext() {
    this.pendingSongId = null;
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'clear_song'
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

          // Send clean initial config (no song_chords - browser behavior)
          const cleanConfig = { ...this.config };
          delete cleanConfig.song_chords; // Don't include song_chords in initial config
          console.log('[ChordDetection] Sending initial config:', cleanConfig);
          this.ws?.send(JSON.stringify(cleanConfig));

          // If we have a pending song, load it AFTER config (browser behavior)
          if (this.pendingSongId) {
            setTimeout(() => {
              this.setSongById(this.pendingSongId!);
            }, 100);
          }

          resolve(true);
        };

        this.ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
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

  private handleMessage(data: any) {
    // Log all messages for debugging
    console.log('[ChordDetection] Received:', data.type, data);

    if (data.type === 'connected') {
      console.log('[ChordDetection] Server confirmed connection');
      return;
    }
    
    if (data.type === 'error') {
      console.error('[ChordDetection] Server error:', data);
      return;
    }
    
    if (data.type === 'song_loaded') {
      console.log('[ChordDetection] Song loaded:', data);
      return;
    }
    
    if (data.type === 'song_cleared') {
      console.log('[ChordDetection] Song cleared');
      return;
    }

    // Handle silence - CRITICAL: pass to callback so chord clears
    if (data.type === 'silence' || data.type === 'listening') {
      this.onResult?.({
        type: 'silence',
        chord: undefined,
        notes: [],
      });
      return;
    }

    // Handle chord messages - main detection result
    if (data.type === 'chord') {
      this.onResult?.(data);
      return;
    }

    // Handle notes messages - may include chord_candidate for low-confidence
    if (data.type === 'notes') {
      // Pass through the FULL data including chord_candidate (browser behavior)
      this.onResult?.(data);
      return;
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

      const AudioCtx = (window as any).AudioContext || (window as any).webkitAudioContext;
      this.audioContext = new AudioCtx({ sampleRate: 44100 });

      if (this.audioContext!.state === 'suspended') {
        await this.audioContext!.resume();
      }

      this.audioContext!.onstatechange = () => {
        console.log('[ChordDetection] AudioContext state:', this.audioContext?.state);
        if (this.audioContext?.state === 'suspended' && this.isRecording) {
          this.audioContext.resume().catch(e => console.error('[ChordDetection] Resume failed:', e));
        }
      };

      this.actualSampleRate = this.audioContext!.sampleRate;
      const needsResample = this.actualSampleRate !== 44100;
      console.log('[ChordDetection] AudioContext sample rate:', this.actualSampleRate,
        needsResample ? '(will resample to 44100)' : '(native 44100)');

      const source = this.audioContext!.createMediaStreamSource(this.mediaStream);
      this.scriptProcessor = this.audioContext!.createScriptProcessor(4096, 1, 1);

      this.scriptProcessor.onaudioprocess = (event) => {
        if (!this.isRecording || !this.ws || this.ws.readyState !== WebSocket.OPEN) return;

        const inputData = event.inputBuffer.getChannelData(0);

        try {
          if (needsResample) {
            // Use higher quality resampling to reduce artifacts
            const resampled = this.resampleBufferHighQuality(inputData, this.actualSampleRate, 44100);
            this.ws.send(resampled.buffer);
          } else {
            const copy = new Float32Array(inputData);
            this.ws.send(copy.buffer);
          }
        } catch (error) {
          console.error('[ChordDetection] Send error:', error);
        }
      };

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

  /**
   * Higher quality resampling using sinc interpolation (reduces aliasing)
   */
  private resampleBufferHighQuality(input: Float32Array, fromRate: number, toRate: number): Float32Array {
    const ratio = fromRate / toRate;
    const outputLength = Math.round(input.length / ratio);
    const output = new Float32Array(outputLength);

    // Use windowed sinc interpolation for better quality
    const filterSize = 8;
    
    for (let i = 0; i < outputLength; i++) {
      const srcIndex = i * ratio;
      let sum = 0;
      let weightSum = 0;

      for (let j = -filterSize; j <= filterSize; j++) {
        const idx = Math.floor(srcIndex) + j;
        if (idx >= 0 && idx < input.length) {
          const x = srcIndex - idx;
          // Lanczos window
          const sinc = x === 0 ? 1 : Math.sin(Math.PI * x) / (Math.PI * x);
          const lanczos = Math.abs(x) < filterSize ? 
            (Math.sin(Math.PI * x / filterSize) / (Math.PI * x / filterSize)) : 0;
          const weight = sinc * (x === 0 ? 1 : lanczos);
          sum += input[idx] * weight;
          weightSum += weight;
        }
      }
      
      output[i] = weightSum > 0 ? sum / weightSum : 0;
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
      // Handle silence - clear chord
      if (result.type === 'silence') {
        setDetectedChord(null);
        setDetectedNotes([]);
        setConfidence(0);
        return;
      }

      // Handle chord type - main detection
      if (result.type === 'chord' && result.chord) {
        setDetectedChord(result.chord);
        if (result.confidence !== undefined) setConfidence(result.confidence);
      }
      
      // Handle notes type - may have chord_candidate
      if (result.type === 'notes') {
        if (result.chord_candidate) {
          // Low-confidence chord - display it (browser behavior)
          setDetectedChord(result.chord_candidate);
        } else if (!result.notes?.length) {
          // No notes and no candidate = silence, clear chord
          setDetectedChord(null);
        }
        // If notes but no chord_candidate, keep previous chord (browser behavior)
      }

      // Update notes from any message type
      if (result.notes) {
        const notes = result.notes.map(n => Array.isArray(n) ? String(n[0]) : String(n));
        setDetectedNotes(notes);
      } else if (result.dominant_notes) {
        setDetectedNotes(result.dominant_notes);
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
