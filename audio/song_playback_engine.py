"""
Guitar Song Playback Engine
============================
A performance-based song playback system that treats songs as performance instructions.

Core Components:
1. Song data format (event-based)
2. Playback engine with synthesis
3. Visual instruction layer
4. Interactivity controls

Usage:
    python song_playback_engine.py [song_file.json]
"""

import json
import math
import wave
import struct
import threading
import time
from dataclasses import dataclass, field
from typing import List, Dict, Optional, Callable
from enum import Enum
import os

# Try to import optional audio libraries
try:
    import pyaudio
    PYAUDIO_AVAILABLE = True
except ImportError:
    PYAUDIO_AVAILABLE = False
    print("⚠️  PyAudio not installed. Install with: pip install pyaudio")

try:
    import numpy as np
    NUMPY_AVAILABLE = True
except ImportError:
    NUMPY_AVAILABLE = False
    print("⚠️  NumPy not installed. Install with: pip install numpy")


# =============================================================================
# 1. SONG DATA FORMAT (Event-Based)
# =============================================================================

class NoteType(Enum):
    """Type of note/technique"""
    PLUCK = "pluck"           # Normal pluck
    HAMMER_ON = "hammer_on"   # Hammer-on
    PULL_OFF = "pull_off"     # Pull-off
    SLIDE = "slide"           # Slide to note
    BEND = "bend"             # Bend note
    MUTE = "mute"             # Palm mute
    HARMONIC = "harmonic"     # Natural harmonic


@dataclass
class NoteEvent:
    """
    Represents a single note event in the song.
    
    Attributes:
        time: Start time in seconds from beginning of song
        string: Guitar string (1-6, where 1=high E, 6=low E)
        fret: Fret number (0=open string)
        duration: How long the note lasts in seconds
        velocity: How hard the note is played (0.0-1.0)
        note_type: Type of technique used
        bend_amount: Semitones to bend (for bend notes)
        slide_to_fret: Target fret for slides
    """
    time: float
    string: int
    fret: int
    duration: float
    velocity: float = 0.8
    note_type: NoteType = NoteType.PLUCK
    bend_amount: float = 0.0
    slide_to_fret: Optional[int] = None
    
    def to_dict(self) -> dict:
        return {
            "time": self.time,
            "string": self.string,
            "fret": self.fret,
            "duration": self.duration,
            "velocity": self.velocity,
            "note_type": self.note_type.value,
            "bend_amount": self.bend_amount,
            "slide_to_fret": self.slide_to_fret
        }
    
    @classmethod
    def from_dict(cls, data: dict) -> 'NoteEvent':
        return cls(
            time=data["time"],
            string=data["string"],
            fret=data["fret"],
            duration=data["duration"],
            velocity=data.get("velocity", 0.8),
            note_type=NoteType(data.get("note_type", "pluck")),
            bend_amount=data.get("bend_amount", 0.0),
            slide_to_fret=data.get("slide_to_fret")
        )


@dataclass
class ChordEvent:
    """
    Represents a chord (multiple simultaneous notes).
    """
    time: float
    chord_name: str
    notes: List[NoteEvent]
    duration: float
    
    def to_dict(self) -> dict:
        return {
            "time": self.time,
            "chord_name": self.chord_name,
            "notes": [n.to_dict() for n in self.notes],
            "duration": self.duration
        }
    
    @classmethod
    def from_dict(cls, data: dict) -> 'ChordEvent':
        return cls(
            time=data["time"],
            chord_name=data["chord_name"],
            notes=[NoteEvent.from_dict(n) for n in data["notes"]],
            duration=data["duration"]
        )


@dataclass
class Song:
    """
    Complete song representation with metadata and events.
    """
    title: str
    artist: str
    bpm: int
    time_signature: tuple = (4, 4)
    tuning: List[str] = field(default_factory=lambda: ["E", "A", "D", "G", "B", "e"])
    capo: int = 0
    events: List[NoteEvent] = field(default_factory=list)
    chords: List[ChordEvent] = field(default_factory=list)
    
    @property
    def duration(self) -> float:
        """Total duration of the song in seconds"""
        if not self.events and not self.chords:
            return 0.0
        
        max_note = max((e.time + e.duration for e in self.events), default=0)
        max_chord = max((c.time + c.duration for c in self.chords), default=0)
        return max(max_note, max_chord)
    
    def add_note(self, note: NoteEvent):
        """Add a note event to the song"""
        self.events.append(note)
        self.events.sort(key=lambda x: x.time)
    
    def add_chord(self, chord: ChordEvent):
        """Add a chord event to the song"""
        self.chords.append(chord)
        self.chords.sort(key=lambda x: x.time)
    
    def get_events_at_time(self, time: float, tolerance: float = 0.05) -> List[NoteEvent]:
        """Get all note events at a specific time"""
        return [e for e in self.events if abs(e.time - time) <= tolerance]
    
    def to_dict(self) -> dict:
        return {
            "title": self.title,
            "artist": self.artist,
            "bpm": self.bpm,
            "time_signature": list(self.time_signature),
            "tuning": self.tuning,
            "capo": self.capo,
            "events": [e.to_dict() for e in self.events],
            "chords": [c.to_dict() for c in self.chords]
        }
    
    def save(self, filepath: str):
        """Save song to JSON file"""
        with open(filepath, 'w') as f:
            json.dump(self.to_dict(), f, indent=2)
    
    @classmethod
    def load(cls, filepath: str) -> 'Song':
        """Load song from JSON file"""
        with open(filepath, 'r') as f:
            data = json.load(f)
        
        return cls(
            title=data["title"],
            artist=data["artist"],
            bpm=data["bpm"],
            time_signature=tuple(data.get("time_signature", [4, 4])),
            tuning=data.get("tuning", ["E", "A", "D", "G", "B", "e"]),
            capo=data.get("capo", 0),
            events=[NoteEvent.from_dict(e) for e in data.get("events", [])],
            chords=[ChordEvent.from_dict(c) for c in data.get("chords", [])]
        )
    
    @classmethod
    def from_dict(cls, data: dict) -> 'Song':
        """Create song from dictionary"""
        return cls(
            title=data["title"],
            artist=data["artist"],
            bpm=data["bpm"],
            time_signature=tuple(data.get("time_signature", [4, 4])),
            tuning=data.get("tuning", ["E", "A", "D", "G", "B", "e"]),
            capo=data.get("capo", 0),
            events=[NoteEvent.from_dict(e) for e in data.get("events", [])],
            chords=[ChordEvent.from_dict(c) for c in data.get("chords", [])]
        )


# =============================================================================
# 2. PLAYBACK ENGINE (Audio Synthesis)
# =============================================================================

class GuitarSynthesizer:
    """
    Synthesizes guitar sounds using Karplus-Strong algorithm.
    """
    
    # Standard tuning frequencies (Hz) for each string
    STANDARD_TUNING = {
        1: 329.63,  # High E (E4)
        2: 246.94,  # B (B3)
        3: 196.00,  # G (G3)
        4: 146.83,  # D (D3)
        5: 110.00,  # A (A2)
        6: 82.41,   # Low E (E2)
    }
    
    def __init__(self, sample_rate: int = 44100):
        self.sample_rate = sample_rate
    
    def get_frequency(self, string: int, fret: int, capo: int = 0) -> float:
        """Calculate frequency for a given string and fret"""
        base_freq = self.STANDARD_TUNING.get(string, 440.0)
        total_frets = fret + capo
        # Frequency increases by 2^(1/12) per semitone (fret)
        return base_freq * (2 ** (total_frets / 12))
    
    def synthesize_note(self, string: int, fret: int, duration: float, 
                        velocity: float = 0.8, capo: int = 0) -> List[float]:
        """
        Synthesize a guitar note using Karplus-Strong algorithm.
        
        This creates a realistic plucked string sound by:
        1. Creating initial noise burst
        2. Applying a feedback delay line
        3. Low-pass filtering the feedback
        """
        if not NUMPY_AVAILABLE:
            # Fallback to simple sine wave if numpy not available
            return self._synthesize_sine(string, fret, duration, velocity, capo)
        
        frequency = self.get_frequency(string, fret, capo)
        num_samples = int(duration * self.sample_rate)
        
        # Delay line length determines pitch
        delay_length = int(self.sample_rate / frequency)
        if delay_length < 2:
            delay_length = 2
        
        # Initialize with noise burst (the "pluck")
        buffer = np.random.uniform(-1, 1, delay_length) * velocity
        
        # Output samples
        output = np.zeros(num_samples)
        
        # Damping factor (higher = longer sustain)
        # Lower strings have longer sustain
        damping = 0.996 + (0.002 * (7 - string) / 6)
        
        # Karplus-Strong synthesis
        for i in range(num_samples):
            # Read from buffer
            output[i] = buffer[i % delay_length]
            
            # Low-pass filter (average of two adjacent samples)
            next_idx = (i + 1) % delay_length
            filtered = 0.5 * (buffer[i % delay_length] + buffer[next_idx])
            
            # Write back with damping
            buffer[i % delay_length] = filtered * damping
        
        # Apply envelope for more natural sound
        attack = int(0.005 * self.sample_rate)  # 5ms attack
        release = int(0.1 * self.sample_rate)   # 100ms release
        
        # Attack envelope
        for i in range(min(attack, num_samples)):
            output[i] *= i / attack
        
        # Release envelope
        release_start = max(0, num_samples - release)
        for i in range(release_start, num_samples):
            output[i] *= (num_samples - i) / release
        
        return output.tolist()
    
    def _synthesize_sine(self, string: int, fret: int, duration: float,
                         velocity: float, capo: int) -> List[float]:
        """Simple sine wave fallback when numpy not available"""
        frequency = self.get_frequency(string, fret, capo)
        num_samples = int(duration * self.sample_rate)
        samples = []
        
        for i in range(num_samples):
            t = i / self.sample_rate
            # Sine wave with exponential decay
            decay = math.exp(-3 * t / duration)
            sample = velocity * decay * math.sin(2 * math.pi * frequency * t)
            samples.append(sample)
        
        return samples
    
    def synthesize_chord(self, notes: List[tuple], duration: float, 
                         velocity: float = 0.8, capo: int = 0) -> List[float]:
        """
        Synthesize a chord (multiple notes together).
        
        Args:
            notes: List of (string, fret) tuples
            duration: Duration in seconds
            velocity: Volume (0-1)
            capo: Capo position
        """
        if not notes:
            return [0.0] * int(duration * self.sample_rate)
        
        # Synthesize each note
        all_notes = []
        for string, fret in notes:
            note_samples = self.synthesize_note(string, fret, duration, velocity, capo)
            all_notes.append(note_samples)
        
        # Mix notes together
        num_samples = max(len(n) for n in all_notes)
        mixed = [0.0] * num_samples
        
        for note_samples in all_notes:
            for i, sample in enumerate(note_samples):
                mixed[i] += sample
        
        # Normalize to prevent clipping
        max_val = max(abs(s) for s in mixed) or 1.0
        if max_val > 1.0:
            mixed = [s / max_val for s in mixed]
        
        return mixed


class PlaybackEngine:
    """
    Main playback engine that handles song playback with real-time audio.
    """
    
    def __init__(self, sample_rate: int = 44100):
        self.sample_rate = sample_rate
        self.synthesizer = GuitarSynthesizer(sample_rate)
        
        self.song: Optional[Song] = None
        self.is_playing = False
        self.is_paused = False
        self.current_time = 0.0
        self.tempo_multiplier = 1.0
        
        self._playback_thread: Optional[threading.Thread] = None
        self._stop_event = threading.Event()
        
        # Callbacks
        self.on_note_played: Optional[Callable[[NoteEvent], None]] = None
        self.on_time_update: Optional[Callable[[float], None]] = None
        self.on_playback_complete: Optional[Callable[[], None]] = None
    
    def load_song(self, song: Song):
        """Load a song for playback"""
        self.song = song
        self.current_time = 0.0
    
    def play(self):
        """Start or resume playback"""
        if not self.song:
            print("❌ No song loaded!")
            return
        
        if self.is_paused:
            self.is_paused = False
            return
        
        self.is_playing = True
        self._stop_event.clear()
        
        self._playback_thread = threading.Thread(target=self._playback_loop)
        self._playback_thread.start()
    
    def pause(self):
        """Pause playback"""
        self.is_paused = True
    
    def stop(self):
        """Stop playback and reset to beginning"""
        self._stop_event.set()
        self.is_playing = False
        self.is_paused = False
        self.current_time = 0.0
        
        if self._playback_thread:
            self._playback_thread.join(timeout=1.0)
    
    def seek(self, time_seconds: float):
        """Seek to a specific time in the song"""
        if self.song:
            self.current_time = max(0.0, min(time_seconds, self.song.duration))
    
    def set_tempo(self, multiplier: float):
        """Set tempo multiplier (1.0 = normal, 0.5 = half speed, 2.0 = double speed)"""
        self.tempo_multiplier = max(0.25, min(4.0, multiplier))
    
    def _playback_loop(self):
        """Main playback loop running in separate thread"""
        if not self.song:
            return
        
        print(f"▶️  Playing: {self.song.title} by {self.song.artist}")
        print(f"   BPM: {self.song.bpm}, Duration: {self.song.duration:.1f}s")
        
        last_update = time.time()
        event_index = 0
        
        # Sort all events by time
        all_events = sorted(self.song.events, key=lambda e: e.time)
        
        while not self._stop_event.is_set() and self.current_time < self.song.duration:
            if self.is_paused:
                time.sleep(0.1)
                last_update = time.time()
                continue
            
            current = time.time()
            delta = (current - last_update) * self.tempo_multiplier
            last_update = current
            
            self.current_time += delta
            
            # Trigger events that should play
            while event_index < len(all_events):
                event = all_events[event_index]
                if event.time <= self.current_time:
                    self._play_note(event)
                    if self.on_note_played:
                        self.on_note_played(event)
                    event_index += 1
                else:
                    break
            
            # Time update callback
            if self.on_time_update:
                self.on_time_update(self.current_time)
            
            time.sleep(0.01)  # 10ms resolution
        
        self.is_playing = False
        if self.on_playback_complete:
            self.on_playback_complete()
        print("⏹️  Playback complete")
    
    def _play_note(self, note: NoteEvent):
        """Play a single note (console output for now)"""
        string_names = ["", "e", "B", "G", "D", "A", "E"]
        string_name = string_names[note.string] if note.string <= 6 else "?"
        
        fret_display = "open" if note.fret == 0 else f"fret {note.fret}"
        print(f"  🎸 String {note.string} ({string_name}) - {fret_display} [{note.duration:.2f}s]")
    
    def render_to_wav(self, output_path: str):
        """Render the entire song to a WAV file"""
        if not self.song:
            print("❌ No song loaded!")
            return
        
        print(f"🎵 Rendering song to: {output_path}")
        
        total_samples = int((self.song.duration + 1.0) * self.sample_rate)
        audio_buffer = [0.0] * total_samples
        
        # Render all note events
        for event in self.song.events:
            start_sample = int(event.time * self.sample_rate)
            note_samples = self.synthesizer.synthesize_note(
                event.string, event.fret, event.duration,
                event.velocity, self.song.capo
            )
            
            for i, sample in enumerate(note_samples):
                idx = start_sample + i
                if idx < total_samples:
                    audio_buffer[idx] += sample
        
        # Render all chord events
        for chord in self.song.chords:
            start_sample = int(chord.time * self.sample_rate)
            notes = [(n.string, n.fret) for n in chord.notes]
            chord_samples = self.synthesizer.synthesize_chord(
                notes, chord.duration, 0.8, self.song.capo
            )
            
            for i, sample in enumerate(chord_samples):
                idx = start_sample + i
                if idx < total_samples:
                    audio_buffer[idx] += sample
        
        # Normalize
        max_val = max(abs(s) for s in audio_buffer) or 1.0
        if max_val > 1.0:
            audio_buffer = [s / max_val for s in audio_buffer]
        
        # Write WAV file
        with wave.open(output_path, 'w') as wav:
            wav.setnchannels(1)
            wav.setsampwidth(2)  # 16-bit
            wav.setframerate(self.sample_rate)
            
            for sample in audio_buffer:
                # Convert to 16-bit integer
                int_sample = int(sample * 32767)
                int_sample = max(-32768, min(32767, int_sample))
                wav.writeframes(struct.pack('<h', int_sample))
        
        print(f"✅ Rendered {len(audio_buffer) / self.sample_rate:.1f}s of audio")


# =============================================================================
# 3. VISUAL INSTRUCTION LAYER
# =============================================================================

class VisualInstructionRenderer:
    """
    Renders visual instructions for the current playback state.
    Uses ASCII art for terminal-based visualization.
    """
    
    STRING_NAMES = ["e", "B", "G", "D", "A", "E"]  # High to low
    
    def __init__(self, song: Song):
        self.song = song
        self.fret_width = 4
        self.visible_frets = 12
    
    def render_fretboard(self, active_notes: List[NoteEvent] = None) -> str:
        """Render ASCII fretboard with active notes highlighted"""
        if active_notes is None:
            active_notes = []
        
        lines = []
        
        # Header with fret numbers
        header = "   "
        for fret in range(self.visible_frets + 1):
            header += f"{fret:^{self.fret_width}}"
        lines.append(header)
        
        # Nut
        lines.append("   " + "║" + "═" * (self.fret_width * self.visible_frets - 1) + "║")
        
        # Strings (high to low)
        for string_idx, string_name in enumerate(self.STRING_NAMES, 1):
            line = f" {string_name} ║"
            
            for fret in range(1, self.visible_frets + 1):
                # Check if this position is being played
                is_active = any(
                    n.string == string_idx and n.fret == fret 
                    for n in active_notes
                )
                
                if is_active:
                    cell = f"[●]"
                else:
                    cell = "─┼─"
                
                line += cell + "│"
            
            lines.append(line)
        
        # Fret markers
        markers = "   "
        for fret in range(1, self.visible_frets + 1):
            if fret in [3, 5, 7, 9, 12]:
                markers += f"{'●':^{self.fret_width}}"
            else:
                markers += " " * self.fret_width
        lines.append(markers)
        
        return "\n".join(lines)
    
    def render_timeline(self, current_time: float, window_seconds: float = 4.0) -> str:
        """Render a timeline view of upcoming notes"""
        lines = []
        
        start_time = current_time
        end_time = current_time + window_seconds
        
        # Header
        lines.append(f"Timeline: {current_time:.1f}s - {end_time:.1f}s")
        lines.append("─" * 60)
        
        # Get events in window
        events_in_window = [
            e for e in self.song.events
            if start_time <= e.time <= end_time
        ]
        
        # Render each string
        for string_idx in range(1, 7):
            string_name = self.STRING_NAMES[string_idx - 1]
            line = f"{string_name} │"
            
            string_events = [e for e in events_in_window if e.string == string_idx]
            
            # Create timeline representation
            timeline = [" "] * 50
            for event in string_events:
                pos = int((event.time - start_time) / window_seconds * 50)
                if 0 <= pos < 50:
                    timeline[pos] = str(event.fret % 10)  # Show fret number
            
            line += "".join(timeline) + "│"
            lines.append(line)
        
        lines.append("─" * 60)
        lines.append("  ▲ NOW")
        
        return "\n".join(lines)
    
    def render_current_instruction(self, event: NoteEvent) -> str:
        """Render instruction for current note"""
        string_name = self.STRING_NAMES[event.string - 1] if event.string <= 6 else "?"
        
        instruction = f"""
╔══════════════════════════════════════╗
║  PLAY NOW:                           ║
║  ──────────────────────────────────  ║
║  String: {event.string} ({string_name})                        
║  Fret:   {event.fret} {"(open)" if event.fret == 0 else "         "}                 
║  Hold:   {event.duration:.2f} seconds                
║  Type:   {event.note_type.value}                      
╚══════════════════════════════════════╝
"""
        return instruction


# =============================================================================
# 4. INTERACTIVITY CONTROLS
# =============================================================================

class InteractiveController:
    """
    Handles interactive controls for the playback engine.
    """
    
    def __init__(self, engine: PlaybackEngine):
        self.engine = engine
        self.visual = None
        if engine.song:
            self.visual = VisualInstructionRenderer(engine.song)
    
    def run_interactive_mode(self):
        """Run interactive terminal-based control"""
        print("""
╔════════════════════════════════════════════════════════════╗
║          🎸 GUITAR PLAYBACK ENGINE - INTERACTIVE MODE 🎸   ║
╠════════════════════════════════════════════════════════════╣
║  Commands:                                                  ║
║    [P]lay / [Space]  - Play/Pause                          ║
║    [S]top            - Stop and reset                       ║
║    [+] / [-]         - Speed up / Slow down (tempo)        ║
║    [←] / [→]         - Seek backward / forward             ║
║    [V]iew            - Toggle fretboard view               ║
║    [R]ender          - Render to WAV file                  ║
║    [Q]uit            - Exit                                ║
╚════════════════════════════════════════════════════════════╝
        """)
        
        if self.engine.song:
            print(f"\n📀 Loaded: {self.engine.song.title} by {self.engine.song.artist}")
            print(f"   Duration: {self.engine.song.duration:.1f}s | BPM: {self.engine.song.bpm}")
            print(f"   Events: {len(self.engine.song.events)} notes, {len(self.engine.song.chords)} chords\n")
        
        # Set up callbacks
        self.engine.on_note_played = self._on_note
        self.engine.on_time_update = self._on_time
        
        while True:
            try:
                cmd = input("\n> ").strip().lower()
                
                if cmd in ['p', 'play', ' ', '']:
                    if self.engine.is_playing:
                        self.engine.pause()
                        print("⏸️  Paused")
                    else:
                        self.engine.play()
                
                elif cmd in ['s', 'stop']:
                    self.engine.stop()
                    print("⏹️  Stopped")
                
                elif cmd == '+':
                    self.engine.set_tempo(self.engine.tempo_multiplier + 0.1)
                    print(f"⏩ Tempo: {self.engine.tempo_multiplier:.1f}x")
                
                elif cmd == '-':
                    self.engine.set_tempo(self.engine.tempo_multiplier - 0.1)
                    print(f"⏪ Tempo: {self.engine.tempo_multiplier:.1f}x")
                
                elif cmd in ['v', 'view']:
                    if self.visual:
                        print(self.visual.render_fretboard())
                
                elif cmd in ['t', 'timeline']:
                    if self.visual:
                        print(self.visual.render_timeline(self.engine.current_time))
                
                elif cmd in ['r', 'render']:
                    output_path = f"{self.engine.song.title.replace(' ', '_')}_rendered.wav"
                    self.engine.render_to_wav(output_path)
                
                elif cmd in ['q', 'quit', 'exit']:
                    self.engine.stop()
                    print("👋 Goodbye!")
                    break
                
                elif cmd == 'status':
                    print(f"Time: {self.engine.current_time:.1f}s / {self.engine.song.duration:.1f}s")
                    print(f"Playing: {self.engine.is_playing}, Paused: {self.engine.is_paused}")
                    print(f"Tempo: {self.engine.tempo_multiplier:.1f}x")
                
                else:
                    print("Unknown command. Type 'q' to quit.")
                    
            except KeyboardInterrupt:
                self.engine.stop()
                print("\n👋 Interrupted. Goodbye!")
                break
    
    def _on_note(self, note: NoteEvent):
        """Callback when a note is played"""
        pass  # Already printed in playback loop
    
    def _on_time(self, time: float):
        """Callback for time updates"""
        pass  # Could update a progress bar


# =============================================================================
# EXAMPLE SONGS
# =============================================================================

def create_smoke_on_the_water() -> Song:
    """Create 'Smoke on the Water' riff as example"""
    song = Song(
        title="Smoke on the Water",
        artist="Deep Purple",
        bpm=112
    )
    
    # The famous riff: G5 - Bb5 - C5 | G5 - Bb5 - Db5 - C5 | G5 - Bb5 - C5 | Bb5 - G5
    beat_duration = 60 / song.bpm
    
    riff = [
        # Measure 1
        (0, 6, 3), (0, 5, 5),     # G5
        (2, 6, 6), (2, 5, 8),     # Bb5
        (4, 6, 8), (4, 5, 10),    # C5
        
        # Measure 2
        (6, 6, 3), (6, 5, 5),     # G5
        (8, 6, 6), (8, 5, 8),     # Bb5
        (9.5, 6, 9), (9.5, 5, 11),  # Db5
        (10.5, 6, 8), (10.5, 5, 10),  # C5
        
        # Measure 3
        (12, 6, 3), (12, 5, 5),   # G5
        (14, 6, 6), (14, 5, 8),   # Bb5
        (16, 6, 8), (16, 5, 10),  # C5
        
        # Measure 4
        (18, 6, 6), (18, 5, 8),   # Bb5
        (20, 6, 3), (20, 5, 5),   # G5
    ]
    
    for beat, string, fret in riff:
        song.add_note(NoteEvent(
            time=beat * beat_duration,
            string=string,
            fret=fret,
            duration=beat_duration * 1.5,
            velocity=0.9
        ))
    
    return song


def create_simple_scale() -> Song:
    """Create a simple C major scale as example"""
    song = Song(
        title="C Major Scale",
        artist="Practice",
        bpm=80
    )
    
    beat_duration = 60 / song.bpm
    
    # C major scale on one string (3rd string)
    scale_frets = [0, 2, 4, 5, 7, 9, 11, 12]  # C D E F G A B C
    
    for i, fret in enumerate(scale_frets):
        song.add_note(NoteEvent(
            time=i * beat_duration,
            string=3,  # G string
            fret=fret,
            duration=beat_duration * 0.9,
            velocity=0.7
        ))
    
    return song


def create_ode_to_joy() -> Song:
    """Create Ode to Joy melody"""
    song = Song(
        title="Ode to Joy",
        artist="Beethoven",
        bpm=100
    )
    
    beat = 60 / song.bpm
    
    # Ode to Joy on high E and B strings
    melody = [
        # E E F G | G F E D | C C D E | E D D
        (2, 1, 0), (2, 1, 0), (2, 1, 1), (2, 1, 3),  
        (2, 1, 3), (2, 1, 1), (2, 1, 0), (2, 2, 3),
        (2, 2, 1), (2, 2, 1), (2, 2, 3), (2, 1, 0),
        (3, 1, 0), (1, 2, 3), (2, 2, 3),
    ]
    
    time = 0
    for duration_beats, string, fret in melody:
        song.add_note(NoteEvent(
            time=time,
            string=string,
            fret=fret,
            duration=duration_beats * beat * 0.9,
            velocity=0.75
        ))
        time += duration_beats * beat
    
    return song


# =============================================================================
# MAIN ENTRY POINT
# =============================================================================

def main():
    print("""
╔═══════════════════════════════════════════════════════════════╗
║     🎸 GUITAR SONG PLAYBACK ENGINE 🎸                         ║
║     Performance-Based Song Instruction System                  ║
╚═══════════════════════════════════════════════════════════════╝
    """)
    
    import sys
    
    # Load or create song
    if len(sys.argv) > 1:
        song_path = sys.argv[1]
        if os.path.exists(song_path):
            print(f"📂 Loading song from: {song_path}")
            song = Song.load(song_path)
        else:
            print(f"❌ File not found: {song_path}")
            return
    else:
        print("📀 Loading example song: Smoke on the Water")
        song = create_smoke_on_the_water()
        
        # Save example songs
        song.save("smoke_on_the_water.json")
        create_simple_scale().save("c_major_scale.json")
        create_ode_to_joy().save("ode_to_joy.json")
        print("   (Saved example songs as JSON files)")
    
    # Create playback engine
    engine = PlaybackEngine()
    engine.load_song(song)
    
    # Show song info
    print(f"\n📀 Song: {song.title} by {song.artist}")
    print(f"   BPM: {song.bpm}")
    print(f"   Duration: {song.duration:.1f} seconds")
    print(f"   Events: {len(song.events)} notes, {len(song.chords)} chords")
    
    # Create visual renderer
    visual = VisualInstructionRenderer(song)
    print("\n" + visual.render_fretboard())
    
    # Run interactive mode
    controller = InteractiveController(engine)
    controller.run_interactive_mode()


if __name__ == "__main__":
    main()

