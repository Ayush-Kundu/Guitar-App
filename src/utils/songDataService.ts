/**
 * Song Data Service
 *
 * Loads embedded demo timelines or builds a practice timeline from the song’s chord list.
 */

import { getChordFingering } from './chordFingerings';

export interface NoteEvent {
  time: number;      // Start time in seconds
  string: number;    // Guitar string (1-6, where 6=low E, 1=high e)
  fret: number;      // Fret number (0=open string)
  duration: number;  // How long the note lasts in seconds
  velocity?: number; // Volume (0-1)
  technique?: string; // pluck, hammer, pull, slide, etc.
}

export interface SongSection {
  name: string;
  start: number;
  end: number;
}

export interface SongData {
  song_id: string;
  title: string;
  composer: string;
  tempo: number;
  time_signature: string;
  difficulty: string;
  license_status: string;
  genre: string;
  tuning: string;
  capo: number;
  chords: string[];
  sections?: SongSection[];
  events: NoteEvent[];
  original_duration?: string;
  learning_time?: string;
}

// String names for display
export const STRING_NAMES = ['e', 'B', 'G', 'D', 'A', 'E']; // Index 0 = string 1 (high e)

// Get note name from string and fret
export function getNoteName(string: number, fret: number): string {
  const openStringNotes = ['E4', 'B3', 'G3', 'D3', 'A2', 'E2'];
  const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  
  const openNote = openStringNotes[string - 1] || 'E4';
  const notePart = openNote.slice(0, -1);
  const octave = parseInt(openNote.slice(-1));
  
  const noteIndex = noteNames.indexOf(notePart);
  const newNoteIndex = (noteIndex + fret) % 12;
  const octaveIncrease = Math.floor((noteIndex + fret) / 12);
  
  return noteNames[newNoteIndex] + (octave + octaveIncrease);
}

// Demo song data (embedded for immediate use)
// These will be used when JSON files aren't available
const DEMO_SONGS: Record<string, SongData> = {
  // Ode to Joy - simplified version for demo
  'ode_to_joy': {
    song_id: 'demo_pd_ode_to_joy',
    title: 'Ode to Joy',
    composer: 'Ludwig van Beethoven',
    tempo: 120,
    time_signature: '4/4',
    difficulty: 'beginner',
    license_status: 'public_domain',
    genre: 'classical',
    tuning: 'standard',
    capo: 0,
    chords: ['C', 'G'],
    sections: [
      { name: 'theme_a', start: 0, end: 8 },
      { name: 'theme_b', start: 8, end: 16 }
    ],
    events: [
      { time: 0.0, string: 2, fret: 1, duration: 0.5, technique: 'pluck' },
      { time: 0.5, string: 2, fret: 1, duration: 0.5, technique: 'pluck' },
      { time: 1.0, string: 2, fret: 3, duration: 0.5, technique: 'pluck' },
      { time: 1.5, string: 1, fret: 0, duration: 0.5, technique: 'pluck' },
      { time: 2.0, string: 1, fret: 0, duration: 0.5, technique: 'pluck' },
      { time: 2.5, string: 2, fret: 3, duration: 0.5, technique: 'pluck' },
      { time: 3.0, string: 2, fret: 1, duration: 0.5, technique: 'pluck' },
      { time: 3.5, string: 2, fret: 0, duration: 0.5, technique: 'pluck' },
      { time: 4.0, string: 3, fret: 2, duration: 0.5, technique: 'pluck' },
      { time: 4.5, string: 3, fret: 2, duration: 0.5, technique: 'pluck' },
      { time: 5.0, string: 2, fret: 0, duration: 0.5, technique: 'pluck' },
      { time: 5.5, string: 2, fret: 1, duration: 0.5, technique: 'pluck' },
      { time: 6.0, string: 2, fret: 1, duration: 0.75, technique: 'pluck' },
      { time: 6.75, string: 2, fret: 0, duration: 0.25, technique: 'pluck' },
      { time: 7.0, string: 2, fret: 0, duration: 1.0, technique: 'pluck' },
      { time: 8.0, string: 2, fret: 1, duration: 0.5, technique: 'pluck' },
      { time: 8.5, string: 2, fret: 1, duration: 0.5, technique: 'pluck' },
      { time: 9.0, string: 2, fret: 3, duration: 0.5, technique: 'pluck' },
      { time: 9.5, string: 1, fret: 0, duration: 0.5, technique: 'pluck' },
      { time: 10.0, string: 1, fret: 0, duration: 0.5, technique: 'pluck' },
      { time: 10.5, string: 2, fret: 3, duration: 0.5, technique: 'pluck' },
      { time: 11.0, string: 2, fret: 1, duration: 0.5, technique: 'pluck' },
      { time: 11.5, string: 2, fret: 0, duration: 0.5, technique: 'pluck' },
      { time: 12.0, string: 3, fret: 2, duration: 0.5, technique: 'pluck' },
      { time: 12.5, string: 3, fret: 2, duration: 0.5, technique: 'pluck' },
      { time: 13.0, string: 2, fret: 0, duration: 0.5, technique: 'pluck' },
      { time: 13.5, string: 2, fret: 1, duration: 0.5, technique: 'pluck' },
      { time: 14.0, string: 2, fret: 0, duration: 0.75, technique: 'pluck' },
      { time: 14.75, string: 3, fret: 2, duration: 0.25, technique: 'pluck' },
      { time: 15.0, string: 3, fret: 2, duration: 1.0, technique: 'pluck' }
    ]
  },
  
  // Smoke on the Water - famous riff
  'smoke_on_the_water': {
    song_id: 'smoke_on_water_easy',
    title: 'Smoke on the Water',
    composer: 'Deep Purple',
    tempo: 112,
    time_signature: '4/4',
    difficulty: 'beginner',
    license_status: 'educational_use',
    genre: 'rock',
    tuning: 'standard',
    capo: 0,
    chords: ['G5', 'Bb5', 'C5'],
    events: [
      { time: 0.0, string: 4, fret: 0, duration: 0.5, technique: 'pluck' },
      { time: 0.75, string: 4, fret: 3, duration: 0.5, technique: 'pluck' },
      { time: 1.5, string: 4, fret: 5, duration: 0.75, technique: 'pluck' },
      { time: 2.5, string: 4, fret: 0, duration: 0.5, technique: 'pluck' },
      { time: 3.25, string: 4, fret: 3, duration: 0.5, technique: 'pluck' },
      { time: 4.0, string: 4, fret: 6, duration: 0.25, technique: 'pluck' },
      { time: 4.25, string: 4, fret: 5, duration: 0.75, technique: 'pluck' },
      { time: 5.25, string: 4, fret: 0, duration: 0.5, technique: 'pluck' },
      { time: 6.0, string: 4, fret: 3, duration: 0.5, technique: 'pluck' },
      { time: 6.75, string: 4, fret: 5, duration: 0.75, technique: 'pluck' },
      { time: 7.75, string: 4, fret: 3, duration: 0.5, technique: 'pluck' },
      { time: 8.5, string: 4, fret: 0, duration: 1.0, technique: 'pluck' }
    ]
  },

  // Amazing Grace
  'amazing_grace': {
    song_id: 'demo_pd_amazing_grace',
    title: 'Amazing Grace',
    composer: 'John Newton',
    tempo: 72,
    time_signature: '3/4',
    difficulty: 'beginner',
    license_status: 'public_domain',
    genre: 'folk',
    tuning: 'standard',
    capo: 0,
    chords: ['G', 'C', 'D', 'Em'],
    events: [
      { time: 0.0, string: 4, fret: 0, duration: 1.5, technique: 'pluck' },
      { time: 1.5, string: 6, fret: 3, duration: 2.0, technique: 'pluck' },
      { time: 3.5, string: 3, fret: 0, duration: 1.0, technique: 'pluck' },
      { time: 4.5, string: 2, fret: 0, duration: 0.5, technique: 'pluck' },
      { time: 5.0, string: 3, fret: 0, duration: 1.0, technique: 'pluck' },
      { time: 6.0, string: 2, fret: 1, duration: 1.5, technique: 'pluck' },
      { time: 7.5, string: 3, fret: 0, duration: 0.5, technique: 'pluck' },
      { time: 8.0, string: 6, fret: 3, duration: 2.0, technique: 'pluck' },
      { time: 10.0, string: 4, fret: 0, duration: 1.5, technique: 'pluck' },
      { time: 11.5, string: 5, fret: 3, duration: 2.0, technique: 'pluck' },
      { time: 13.5, string: 4, fret: 0, duration: 1.0, technique: 'pluck' },
      { time: 14.5, string: 4, fret: 2, duration: 0.5, technique: 'pluck' },
      { time: 15.0, string: 4, fret: 0, duration: 1.0, technique: 'pluck' }
    ]
  },

  // Wonderwall
  'wonderwall': {
    song_id: 'wonderwall',
    title: 'Wonderwall',
    composer: 'Oasis',
    tempo: 87,
    time_signature: '4/4',
    difficulty: 'beginner',
    license_status: 'educational_use',
    genre: 'rock',
    tuning: 'standard',
    capo: 2,
    chords: ['Em7', 'G', 'Dsus4', 'A7sus4'],
    events: [
      { time: 0.0, string: 6, fret: 0, duration: 0.5, technique: 'pluck' },
      { time: 0.5, string: 3, fret: 0, duration: 0.25, technique: 'pluck' },
      { time: 0.75, string: 2, fret: 3, duration: 0.25, technique: 'pluck' },
      { time: 1.0, string: 1, fret: 3, duration: 0.5, technique: 'pluck' },
      { time: 1.5, string: 2, fret: 3, duration: 0.25, technique: 'pluck' },
      { time: 1.75, string: 3, fret: 0, duration: 0.25, technique: 'pluck' },
      { time: 2.0, string: 6, fret: 3, duration: 0.5, technique: 'pluck' },
      { time: 2.5, string: 3, fret: 0, duration: 0.25, technique: 'pluck' },
      { time: 2.75, string: 2, fret: 3, duration: 0.25, technique: 'pluck' },
      { time: 3.0, string: 1, fret: 3, duration: 0.5, technique: 'pluck' },
      { time: 3.5, string: 2, fret: 3, duration: 0.25, technique: 'pluck' },
      { time: 3.75, string: 3, fret: 0, duration: 0.25, technique: 'pluck' },
      { time: 4.0, string: 4, fret: 0, duration: 0.5, technique: 'pluck' },
      { time: 4.5, string: 3, fret: 2, duration: 0.25, technique: 'pluck' },
      { time: 4.75, string: 2, fret: 3, duration: 0.25, technique: 'pluck' },
      { time: 5.0, string: 1, fret: 3, duration: 0.5, technique: 'pluck' },
      { time: 5.5, string: 2, fret: 3, duration: 0.25, technique: 'pluck' },
      { time: 5.75, string: 3, fret: 2, duration: 0.25, technique: 'pluck' },
      { time: 6.0, string: 5, fret: 0, duration: 0.5, technique: 'pluck' },
      { time: 6.5, string: 3, fret: 0, duration: 0.25, technique: 'pluck' },
      { time: 6.75, string: 2, fret: 3, duration: 0.25, technique: 'pluck' },
      { time: 7.0, string: 1, fret: 3, duration: 0.5, technique: 'pluck' },
      { time: 7.5, string: 2, fret: 3, duration: 0.25, technique: 'pluck' },
      { time: 7.75, string: 3, fret: 0, duration: 0.25, technique: 'pluck' }
    ]
  }
};

// Normalize song title to match our data
function normalizeTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');
}

/** Exact title / key only — avoids wrong timeline from fuzzy substring matches. */
export function findSongDataExact(title: string): SongData | null {
  const normalized = normalizeTitle(title);
  if (DEMO_SONGS[normalized]) return DEMO_SONGS[normalized];
  for (const data of Object.values(DEMO_SONGS)) {
    if (normalizeTitle(data.title) === normalized) return data;
  }
  return null;
}

/** @deprecated Prefer findSongDataExact + chord timeline; kept for duration helpers. */
export function findSongData(title: string): SongData | null {
  const exact = findSongDataExact(title);
  if (exact) return exact;
  const normalized = normalizeTitle(title);
  for (const [key, data] of Object.entries(DEMO_SONGS)) {
    if (normalized.includes(key) || key.includes(normalized)) return data;
  }
  return null;
}

/** Pluck positions for one chord from shared fingerings (string 6 = low E … 1 = high e). */
export function chordToPluckPositions(chordName: string): { string: number; fret: number }[] {
  const f = getChordFingering(chordName);
  const out: { string: number; fret: number }[] = [];
  for (let i = 0; i < 6; i++) {
    const stringNum = 6 - i;
    const fret = f[i];
    if (fret >= 0) out.push({ string: stringNum, fret });
  }
  return out;
}

/** Timeline from this song’s chord list + tempo (matches what the user is practicing). */
export function generateDefaultEvents(
  chords: string[],
  bpm: number,
  durationStr: string
): NoteEvent[] {
  const events: NoteEvent[] = [];
  const list = chords.length ? chords : ['C'];
  const [mins, secs] = durationStr.split(':').map(Number);
  const totalSeconds = Math.max(16, (mins || 0) * 60 + (secs || 0));
  const beatsPerSecond = bpm / 60;
  const secondsPerChord = Math.max(0.35, 4 / beatsPerSecond);

  let currentTime = 0;
  let chordIndex = 0;

  while (currentTime < totalSeconds) {
    const chord = list[chordIndex % list.length].trim();
    const positions = chordToPluckPositions(chord);
    for (const pos of positions) {
      events.push({
        time: currentTime,
        string: pos.string,
        fret: pos.fret,
        duration: secondsPerChord * 0.85,
        technique: 'pluck',
      });
    }
    currentTime += secondsPerChord;
    chordIndex++;
  }

  return events;
}

/** One pluck per chord change — highest string in the voicing (melody string). */
function melodyNoteFromChord(chordName: string): { string: number; fret: number } {
  const positions = chordToPluckPositions(chordName);
  if (positions.length === 0) return { string: 2, fret: 1 };
  return positions.reduce((best, p) => (p.string < best.string ? p : best));
}

/** Single-note timeline for early levels (no stacked chord strums). */
export function generateMelodyOnlyEvents(
  chords: string[],
  bpm: number,
  durationStr: string
): NoteEvent[] {
  const events: NoteEvent[] = [];
  const list = chords.length ? chords : ['C'];
  const [mins, secs] = durationStr.split(':').map(Number);
  const totalSeconds = Math.max(16, (mins || 0) * 60 + (secs || 0));
  const beatsPerSecond = bpm / 60;
  const secondsPerChord = Math.max(0.35, 4 / beatsPerSecond);

  let currentTime = 0;
  let chordIndex = 0;

  while (currentTime < totalSeconds) {
    const chord = list[chordIndex % list.length].trim();
    const pos = melodyNoteFromChord(chord);
    events.push({
      time: currentTime,
      string: pos.string,
      fret: pos.fret,
      duration: Math.min(secondsPerChord * 0.92, 1.2),
      technique: 'pluck',
    });
    currentTime += secondsPerChord;
    chordIndex++;
  }

  return events;
}

export interface GetSongDataOptions {
  /** Skip embedded demos; build a single-note line from the chord list. */
  melodyOnly?: boolean;
}

/**
 * Practice popup data: use curated demo only when the title matches exactly;
 * otherwise build events from the passed chord progression (per-song / per-activity).
 */
export function getSongData(
  title: string,
  chords: string[],
  bpm: number,
  duration: string,
  options?: GetSongDataOptions
): SongData {
  if (!options?.melodyOnly) {
    const exact = findSongDataExact(title);
    if (exact) {
      return exact;
    }
  }

  const events = options?.melodyOnly
    ? generateMelodyOnlyEvents(chords, bpm, duration)
    : generateDefaultEvents(chords, bpm, duration);
  return {
    song_id: normalizeTitle(title),
    title: title,
    composer: 'Unknown',
    tempo: bpm,
    time_signature: '4/4',
    difficulty: 'beginner',
    license_status: 'unknown',
    genre: 'unknown',
    tuning: 'standard',
    capo: 0,
    chords: chords.length ? chords : ['C'],
    events,
  };
}

// Get current note based on playback time
export function getCurrentNotes(events: NoteEvent[], currentTime: number): NoteEvent[] {
  return events.filter(e => 
    currentTime >= e.time && currentTime < e.time + e.duration
  );
}

// Get upcoming notes (next N seconds)
export function getUpcomingNotes(events: NoteEvent[], currentTime: number, windowSeconds: number = 3): NoteEvent[] {
  return events.filter(e => 
    e.time >= currentTime && e.time < currentTime + windowSeconds
  ).sort((a, b) => a.time - b.time);
}

// Get the next note to play
export function getNextNote(events: NoteEvent[], currentTime: number): NoteEvent | null {
  const upcoming = events
    .filter(e => e.time > currentTime)
    .sort((a, b) => a.time - b.time);
  
  return upcoming[0] || null;
}

// Calculate actual song duration from note events (in seconds)
export function calculateDurationFromEvents(events: NoteEvent[]): number {
  if (!events || events.length === 0) {
    return 0;
  }
  
  // Find the last note and add its duration
  let maxEndTime = 0;
  for (const event of events) {
    const endTime = event.time + event.duration;
    if (endTime > maxEndTime) {
      maxEndTime = endTime;
    }
  }
  
  return maxEndTime;
}

// Format duration in seconds to "M:SS" format
export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// Get song duration from song data
export function getSongDuration(songData: SongData): string {
  const durationSeconds = calculateDurationFromEvents(songData.events);
  return formatDuration(durationSeconds);
}

// Get the accurate duration for a song by title (for card display)
export function getAccurateSongDuration(title: string, fallbackDuration: string = '3:00'): string {
  const songData = findSongData(title);
  if (songData) {
    return getSongDuration(songData);
  }
  return fallbackDuration;
}

