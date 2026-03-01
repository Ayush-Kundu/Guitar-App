/**
 * Chord Detection — 1:1 port of browser main.js from kundu.dev/c_d
 *
 * This is an EXACT copy of the browser code. The ONLY differences:
 *   1. TypeScript types + React hook wrapper (instead of DOM manipulation)
 *   2. WebSocket URL from serverConfig (instead of window.location)
 *   3. Zero-gain silencer node (prevents mic→speaker feedback on phone)
 *   4. Auto-retry on connection failure
 *   5. Song ID lookup from title (app has titles, browser has IDs)
 *
 * NO resampling. NO iOS-specific audio hacks. If the AudioContext says
 * 44100Hz, we trust it — same as the browser.
 */

import React from 'react';
import { getChordDetectionWsUrl } from './serverConfig';

// ─── Song title → server song_id mapping ────────────────────────────────────
const SONG_ID_MAP: Record<string, string> = {
  'smoke on the water (riff only)': 'nv_rk_001',
  'smoke on the water': 'nv_rk_001',
  'wild thing': 'nv_rk_002',
  'louie louie (simple)': 'nv_rk_003',
  'louie louie': 'nv_rk_003',
  'happy birthday': 'nv_pp_001',
  'twinkle twinkle little star': 'nv_pp_002',
  'row row row your boat': 'nv_pp_003',
  'ode to joy (simple)': 'nv_cl_001',
  'ode to joy': 'nv_cl_001',
  'mary had a little lamb': 'nv_cl_002',
  'this old man': 'nv_fk_001',
  'old macdonald': 'nv_fk_002',
  'kumbaya': 'nv_fk_003',
  'simple 12-bar blues': 'nv_bl_001',
  'freight train': 'nv_bl_002',
  'home on the range': 'nv_ct_001',
  "she'll be coming round": 'nv_ct_002',
  'simple swing': 'nv_jz_001',
  'jazz basics': 'nv_jz_002',
  'easy blues jazz': 'nv_jz_003',
  'first jazz tune': 'nv_jz_004',
  'power chord basics': 'nv_mt_001',
  'simple metal riff': 'nv_mt_002',
  'heavy start': 'nv_mt_003',
  'first metal song': 'nv_mt_004',
  'wonderwall': 'bg_rk_001',
  'horse with no name': 'bg_rk_002',
  'bad moon rising': 'bg_rk_003',
  'paperback writer': 'bg_rk_004',
  'let it be': 'bg_pp_001',
  'perfect': 'bg_pp_002',
  'someone like you': 'bg_pp_003',
  'hey jude': 'bg_pp_004',
  'canon in d (simple)': 'bg_cl_001',
  'canon in d': 'bg_cl_001',
  'minuet in g': 'bg_cl_002',
  'air on g string (simple)': 'bg_cl_003',
  'air on g string': 'bg_cl_003',
  "blowin' in the wind": 'bg_fk_001',
  'blowin in the wind': 'bg_fk_001',
  'scarborough fair': 'bg_fk_002',
  "the times they are a-changin'": 'bg_fk_003',
  'the times they are a-changin': 'bg_fk_003',
  'house of the rising sun': 'bg_bl_001',
  'midnight special': 'bg_bl_002',
  'the thrill is gone (simple)': 'bg_bl_003',
  'the thrill is gone': 'bg_bl_003',
  'take me home, country roads': 'bg_ct_001',
  'take me home country roads': 'bg_ct_001',
  'ring of fire': 'bg_ct_002',
  'friends in low places': 'bg_ct_003',
  'blue moon simple': 'bg_jz_001',
  'summertime easy': 'bg_jz_002',
  'satin doll simple': 'bg_jz_003',
  'take five intro': 'bg_jz_004',
  'iron man riff': 'bg_mt_001',
  'enter sandman intro': 'bg_mt_002',
  'seven nation army': 'bg_mt_003',
  'back in black riff': 'bg_mt_004',
  'zombie': 'el_rk_001',
  'creep': 'el_rk_002',
  'with or without you': 'el_rk_003',
  'someone you loved': 'el_pp_001',
  'all of me': 'el_pp_002',
  'stay with me': 'el_pp_003',
  'fast car': 'el_fk_001',
  'mad world': 'el_fk_002',
  'stormy monday': 'el_bl_001',
  'sweet home chicago': 'el_bl_002',
  'wagon wheel': 'el_ct_001',
  'tennessee whiskey': 'el_ct_002',
  'autumn leaves intro': 'el_jz_001',
  'misty easy': 'el_jz_002',
  'girl from ipanema': 'el_jz_003',
  'paranoid riff': 'el_mt_001',
  'breaking the law': 'el_mt_002',
  'highway to hell': 'el_mt_003',
  'crazy train intro': 'el_mt_004',
  'stairway to heaven': 'im_rk_001',
  'more than words': 'im_rk_002',
  'blackbird': 'im_rk_003',
  'romance de amor': 'im_cl_001',
  'lágrima': 'im_cl_002',
  'lagrima': 'im_cl_002',
  'autumn leaves': 'im_jz_001',
  'fly me to the moon': 'im_jz_002',
  'pride and joy': 'im_bl_001',
  'still got the blues': 'im_bl_002',
  'hurt': 'im_ct_001',
  'folsom prison blues': 'im_ct_002',
  'master of puppets': 'im_mt_001',
  'one intro': 'im_mt_002',
  'hotel california': 'pf_rk_001',
  'nothing else matters': 'pf_rk_002',
  'asturias': 'pf_cl_001',
  'recuerdos de la alhambra': 'pf_cl_002',
  'all the things you are': 'pf_jz_001',
  'body and soul': 'pf_jz_002',
  'born under a bad sign': 'pf_bl_001',
  'texas flood': 'pf_bl_002',
  'orion': 'pf_mt_001',
  'voice unheard': 'pf_mt_002',
  'cliffs of dover': 'av_rk_001',
  'little wing': 'av_rk_002',
  'concierto de aranjuez': 'av_cl_001',
  'capricho árabe': 'av_cl_002',
  'capricho arabe': 'av_cl_002',
  'giant steps': 'av_jz_001',
  'cherokee': 'av_jz_002',
  'voodoo child': 'av_bl_002',
  'crossroads': 'av_bl_003',
  'eruption': 'ex_rk_001',
  'yyz': 'ex_rk_002',
  'for the love of god': 'ex_rk_003',
  'cello suite no. 1': 'ex_cl_001',
  'caprice no. 24': 'ex_cl_002',
  'chaconne': 'ex_cl_003',
  'giant steps (advanced)': 'ex_jz_001',
  'donna lee': 'ex_jz_002',
  'technical difficulties': 'ex_mt_001',
  'the dance of eternity': 'ex_mt_002',
};

function lookupSongId(title: string): string | null {
  return SONG_ID_MAP[title.toLowerCase().trim()] || null;
}

// ─── Exported types ─────────────────────────────────────────────────────────

export interface ChordDetectionResult {
  type: string;
  chord?: string;
  chord_candidate?: string;
  raw_chord?: string;
  final_chord?: string;
  notes?: string[] | [string, number][];
  frequencies?: number[];
  confidence?: number;
  raw_confidence?: number;
  final_confidence?: number;
  chroma?: number[];
  stability?: number;
  timestamp?: number;
  song_matched?: boolean;
  song_constrained?: boolean;
  match_type?: string;
  dominant_notes?: string[];
  song_chords?: string[];
  [key: string]: any;
}

export interface ChordDetectionConfig {
  [key: string]: any;
}

// ─── Service class ──────────────────────────────────────────────────────────
//
// Direct port of browser globals + functions:
//   ws, audioContext, mediaStream, isRecording, config, currentSongId
//   connectWebSocket(), handleWebSocketMessage(), startRecording(), stopRecording()
//   handleSongSelect(), updateChordDisplay(), updateConstrainedDisplay()

export class ChordDetectionService {
  private ws: WebSocket | null = null;
  private audioContext: AudioContext | null = null;
  private mediaStream: MediaStream | null = null;
  private scriptProcessor: ScriptProcessorNode | null = null;
  private isRecording_: boolean = false;
  private config: ChordDetectionConfig;
  private currentSongId: string | null = null;
  private userLevel: string | null = null;

  private pendingSongId: string | null = null;

  // Callbacks (replaces DOM updates)
  private onResult: ((result: ChordDetectionResult) => void) | null = null;
  private onStatusChange: ((connected: boolean, status: string) => void) | null = null;

  constructor() {
    // Browser: getConfigFromURL() defaultConfig — exact copy
    this.config = {
      instrument: 'guitar',
      silence_threshold: 0.005,
      confidence_threshold: 0.45,
      chord_window: 0.3,
      chord_window_confidence: 0.45,
      overlap: 0.75,
      show_frequencies: false,
      show_chroma: false,
      frequencies_only: false,
      notes_only: false,
      debug: false,
      log: false,
      log_interval: 0.5,
      song_influence: 0.7,
      map_similar_variants: true,
      sensitivity: 1.0,
      multi_pitch: true,
      single_pitch: false,
      show_fft: false,
      raw_frequencies: false,
    };
  }

  // ── Public API ──────────────────────────────────────────────────────────

  setOnResult(cb: (result: ChordDetectionResult) => void) { this.onResult = cb; }
  setOnStatusChange(cb: (connected: boolean, status: string) => void) { this.onStatusChange = cb; }
  isConnected(): boolean { return this.ws?.readyState === WebSocket.OPEN; }
  getIsRecording(): boolean { return this.isRecording_; }

  setUserLevel(level: string) {
    this.userLevel = level;
    // If already connected, send level update to server
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type: 'set_level', level }));
      console.log('[CD] set_level:', level);
    }
  }

  getUserLevel(): string | null { return this.userLevel; }

  setSong(title: string, artist: string) {
    const id = lookupSongId(title);
    if (id) {
      this.pendingSongId = id;
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.handleSongSelect(id);
      }
    } else {
      this.pendingSongId = null;
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ 
          type: 'set_song', 
          title, 
          artist,
          ...(this.userLevel && { user_level: this.userLevel })
        }));
        console.log('[CD] set_song fallback:', title, 'by', artist, 'level:', this.userLevel || '(not set)');
      }
    }
  }

  setSongById(songId: string) {
    this.pendingSongId = songId;
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.handleSongSelect(songId);
    }
  }

  clearSongContext() {
    this.pendingSongId = null;
    this.currentSongId = null;
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.handleSongSelect('');
    }
  }

  // ── Browser: handleSongSelect(songId) ─────────────────────────────────

  private handleSongSelect(songId: string) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;
    this.currentSongId = songId || null;
    this.ws.send(JSON.stringify({ 
      type: 'set_song', 
      song_id: songId || null,
      ...(this.userLevel && { user_level: this.userLevel })
    }));
    console.log('[CD] set_song:', songId || '(cleared)', 'level:', this.userLevel || '(not set)');
  }

  // ── Browser: connectWebSocket() — with retry for mobile ───────────────

  async connect(retries: number = 3): Promise<boolean> {
    for (let attempt = 1; attempt <= retries; attempt++) {
      const ok = await this._tryConnect(attempt, retries);
      if (ok) return true;
      if (attempt < retries) {
        const delay = attempt * 2000;
        this.onStatusChange?.(false, `Retrying (${attempt + 1}/${retries})...`);
        await new Promise(r => setTimeout(r, delay));
      }
    }
    this.onStatusChange?.(false, 'Connection Failed');
    return false;
  }

  private _tryConnect(attempt: number, total: number): Promise<boolean> {
    const wsUrl = getChordDetectionWsUrl();

    return new Promise((resolve) => {
      this.onStatusChange?.(false, attempt > 1 ? `Retrying (${attempt}/${total})...` : 'Connecting...');

      if (this.ws) {
        this.ws.onopen = null;
        this.ws.onmessage = null;
        this.ws.onerror = null;
        this.ws.onclose = null;
        try { this.ws.close(); } catch (_) {}
        this.ws = null;
      }

      let resolved = false;
      const done = (ok: boolean) => { if (!resolved) { resolved = true; resolve(ok); } };

      try {
        this.ws = new WebSocket(wsUrl);

        // Browser: ws.onopen → ws.send(JSON.stringify(config))
        this.ws.onopen = () => {
          console.log('[CD] WS opened, sending config...');
          try {
            // Include user level in config if set
            const configWithLevel = {
              ...this.config,
              ...(this.userLevel && { user_level: this.userLevel })
            };
            this.ws!.send(JSON.stringify(configWithLevel));
          } catch (e) {
            console.error('[CD] config send error:', e);
            done(false);
          }
        };

        this.ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);

            // Browser: first message is {type:'connected'}
            if (data.type === 'connected') {
              console.log('[CD] Server confirmed connection');
              this.onStatusChange?.(true, 'Connected');

              if (this.pendingSongId) {
                setTimeout(() => this.handleSongSelect(this.pendingSongId!), 200);
              }

              done(true);
              return;
            }

            this.handleWebSocketMessage(data);
          } catch (e) {
            console.error('[CD] parse error:', e);
          }
        };

        this.ws.onerror = () => done(false);
        this.ws.onclose = () => {
          this.onStatusChange?.(false, 'Disconnected');
          if (this.isRecording_) this.stopRecording();
          done(false);
        };

        // Browser: 5s timeout
        setTimeout(() => {
          if (!resolved) {
            console.error('[CD] Connection timeout');
            this.onStatusChange?.(false, 'Timeout');
            done(false);
          }
        }, 8000);

      } catch (e) {
        console.error('[CD] connect error:', e);
        done(false);
      }
    });
  }

  // ── Browser: handleWebSocketMessage(data) — EXACT PORT ────────────────
  //
  // This is a direct copy of lines 543-653 of main.js.
  // The browser has two display areas:
  //   - chordDisplay (always visible when no song)
  //   - constrainedDisplay (visible when song selected)
  // We simulate this with the onResult callback, passing the raw server
  // data through with NO modifications. The UI layer decides what to show.

  private handleWebSocketMessage(data: any) {
    if (data.type === 'error') {
      console.error('[CD] Server error:', data.message);
      return;
    }

    if (data.type === 'song_loaded') {
      console.log('[CD] Song loaded:', data.chords);
      return;
    }

    if (data.type === 'song_cleared') {
      console.log('[CD] Song cleared');
      return;
    }

    // Browser lines 621-644: Update UI based on detection type
    if (data.type === 'chord') {
      // Browser: updateChordDisplay(data)
      // Pass the raw server data through — let UI layer handle display logic
      this.onResult?.({ ...data, _currentSongId: this.currentSongId });
      return;
    }

    if (data.type === 'notes') {
      // Browser: updateNotesDisplay(data.notes || [])
      // Browser: if chord_candidate → updateChordDisplay({chord, confidence, stability:0})
      // Browser: else → updateChordDisplay(null)
      this.onResult?.({ ...data, _currentSongId: this.currentSongId });
      return;
    }

    if (data.type === 'frequencies') {
      this.onResult?.(data);
      return;
    }

    if (data.type === 'listening') {
      // Browser: "Don't clear everything on listening - keep last state"
      return;
    }

    // Browser has no explicit silence handler — falls through to visualization
    // which does nothing for silence. So we also do nothing.
  }

  // ── Browser: startRecording() — EXACT PORT of lines 765-878 ──────────

  async startRecording(): Promise<boolean> {
    if (this.isRecording_) return true;
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.error('[CD] Cannot record: not connected');
      return false;
    }

    try {
      // Browser lines 780-787: getUserMedia with RAW audio settings
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
          sampleRate: 44100,
        }
      });

      // Browser line 790: AudioContext at 44100Hz
      const Ctx = (window as any).AudioContext || (window as any).webkitAudioContext;
      this.audioContext = new Ctx({ sampleRate: 44100 });

      if (this.audioContext!.state === 'suspended') {
        await this.audioContext!.resume();
      }

      // iOS may suspend in background
      this.audioContext!.onstatechange = () => {
        if (this.audioContext?.state === 'suspended' && this.isRecording_) {
          this.audioContext.resume().catch(() => {});
        }
      };

      // Log actual sample rate for diagnostics
      const actualRate = this.audioContext!.sampleRate;
      console.log(`[CD] AudioContext sampleRate: ${actualRate}Hz`);
      if (actualRate !== 44100) {
        console.warn(`[CD] WARNING: Got ${actualRate}Hz instead of 44100Hz — chord detection may be affected`);
      }

      // Browser lines 798-799: createMediaStreamSource + createScriptProcessor(4096, 1, 1)
      const source = this.audioContext!.createMediaStreamSource(this.mediaStream);
      this.scriptProcessor = this.audioContext!.createScriptProcessor(4096, 1, 1);

      // Browser lines 802-821: onaudioprocess → ws.send(inputData.buffer)
      this.scriptProcessor.onaudioprocess = (e) => {
        if (!this.isRecording_ || !this.ws || this.ws.readyState !== WebSocket.OPEN) return;
        const inputData = e.inputBuffer.getChannelData(0);

        try {
          // Browser line 817: ws.send(inputData.buffer) — EXACT same call
          this.ws.send(inputData.buffer);
        } catch (err) {
          console.error('[CD] send error:', err);
        }
      };

      // Browser line 833: source.connect(processor)
      source.connect(this.scriptProcessor);

      // Browser line 834: processor.connect(audioContext.destination)
      // Only iOS difference: zero-gain silencer to prevent mic→speaker feedback
      const silencer = this.audioContext!.createGain();
      silencer.gain.value = 0;
      this.scriptProcessor.connect(silencer);
      silencer.connect(this.audioContext!.destination);

      this.isRecording_ = true;
      this.onStatusChange?.(true, 'Recording');
      return true;
    } catch (err) {
      console.error('[CD] Mic error:', err);
      this.onStatusChange?.(true, 'Mic Error');
      return false;
    }
  }

  // ── Browser: stopRecording() — lines 881-897 ─────────────────────────

  stopRecording() {
    this.isRecording_ = false;

    if (this.scriptProcessor) {
      this.scriptProcessor.disconnect();
      this.scriptProcessor = null;
    }
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(t => t.stop());
      this.mediaStream = null;
    }
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }

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
}

// ─── React hook ─────────────────────────────────────────────────────────────
//
// Port of browser's updateChordDisplay() + updateConstrainedDisplay() +
// updateNotesDisplay() display logic.
//
// Browser display logic (lines 656-743):
//   updateChordDisplay(data):
//     if (data && data.song_constrained && currentSongId):
//       → updateConstrainedDisplay(data) → shows data.final_chord, data.final_confidence
//     else:
//       → shows data.chord, data.confidence (or '--' if null)
//
//   updateConstrainedDisplay(data):
//     → rawChord = data.raw_chord, rawConfidence = data.raw_confidence
//     → finalChord = data.final_chord, finalConfidence = data.final_confidence

export function useChordDetection(userLevel?: string) {
  const [isConnected, setIsConnected] = React.useState(false);
  const [isRecording, setIsRecording] = React.useState(false);
  const [status, setStatus] = React.useState('Disconnected');
  const [detectedChord, setDetectedChord] = React.useState<string | null>(null);
  const [detectedNotes, setDetectedNotes] = React.useState<string[]>([]);
  const [confidence, setConfidence] = React.useState(0);

  const serviceRef = React.useRef<ChordDetectionService | null>(null);

  React.useEffect(() => {
    serviceRef.current = new ChordDetectionService();
    
    // Set user level if provided
    if (userLevel) {
      serviceRef.current.setUserLevel(userLevel);
    }

    serviceRef.current.setOnStatusChange((connected, newStatus) => {
      setIsConnected(connected);
      setStatus(newStatus);
    });

    // Port of browser display logic
    serviceRef.current.setOnResult((result) => {
      const songId = result._currentSongId;

      if (result.type === 'chord') {
        // Browser: updateChordDisplay(data)
        if (result.song_constrained && songId) {
          // Browser: updateConstrainedDisplay(data) → show final_chord
          if (result.final_chord) {
            setDetectedChord(result.final_chord);
            if (result.final_confidence !== undefined) setConfidence(result.final_confidence);
          } else {
            setDetectedChord('--');
          }
        } else {
          // Browser: regular display → show chord
          if (result.chord) {
            setDetectedChord(result.chord);
            if (result.confidence !== undefined) setConfidence(result.confidence);
          } else {
            setDetectedChord(null);
          }
        }
        // Browser: if (data.notes) updateNotesDisplay(data.notes)
        if (result.notes) {
          setDetectedNotes(result.notes.map((n: any) => Array.isArray(n) ? String(n[0]) : String(n)));
        }
        return;
      }

      if (result.type === 'notes') {
        // Browser: updateNotesDisplay(data.notes || [])
        if (result.notes && result.notes.length > 0) {
          setDetectedNotes(result.notes.map((n: any) => Array.isArray(n) ? String(n[0]) : String(n)));
        } else {
          setDetectedNotes([]);
        }

        // Browser: if chord_candidate → updateChordDisplay({chord, confidence, stability:0})
        //          else → updateChordDisplay(null)
        // BUT: if song is selected, updateChordDisplay routes to the HIDDEN div
        // (because the constructed object has no song_constrained flag).
        // So in song mode, chord_candidate does NOT affect visible display.
        if (!songId) {
          if (result.chord_candidate) {
            setDetectedChord(result.chord_candidate);
            if (result.confidence !== undefined) setConfidence(result.confidence);
          } else {
            setDetectedChord(null);
          }
        }
        // In song mode: don't touch chord display (matches browser hidden div behavior)
        return;
      }

      // silence — browser has no handler, display stays unchanged
      // listening — browser keeps last state
    });

    return () => { serviceRef.current?.disconnect(); };
  }, []);

  return {
    isConnected, isRecording, status, detectedChord, detectedNotes, confidence,
    connect: React.useCallback(async () => serviceRef.current?.connect() || false, []),
    startRecording: React.useCallback(async () => {
      const ok = await serviceRef.current?.startRecording();
      if (ok) setIsRecording(true);
      return ok || false;
    }, []),
    stopRecording: React.useCallback(() => {
      serviceRef.current?.stopRecording();
      setIsRecording(false);
    }, []),
    disconnect: React.useCallback(() => {
      serviceRef.current?.disconnect();
      setIsConnected(false);
      setIsRecording(false);
    }, []),
    setUserLevel: React.useCallback((level: string) => {
      serviceRef.current?.setUserLevel(level);
    }, []),
  };
}
