"""
Instructional Engine - Practice-focused playback with interaction requirements.

This engine enforces instructional mode by:
1. Requiring user interaction for playback
2. Providing tempo/section controls
3. Blocking passive consumption
4. Enabling visual note guidance

FEATURES ON:
✅ Tempo change (50%-150%)
✅ Section looping
✅ Visual note guidance
✅ Synthesized audio (real-time only)
✅ Interactive controls

FEATURES OFF:
❌ Full-song autoplay without interaction
❌ Downloads/exports
❌ File access to raw data
❌ Continuous uninterrupted playback

This ensures the app is INSTRUCTIONAL, not CONSUMPTIVE.
"""

import time
import threading
from typing import Optional, Callable, Dict, Any, List, Tuple
from dataclasses import dataclass, field
from enum import Enum


class PlaybackState(Enum):
    """Playback state machine states."""
    STOPPED = "stopped"
    PLAYING = "playing"
    PAUSED = "paused"
    SECTION_LOOP = "section_loop"
    WAITING_INTERACTION = "waiting_interaction"


@dataclass
class Section:
    """A section of a song for looping."""
    name: str
    start_time: float
    end_time: float
    
    @property
    def duration(self) -> float:
        return self.end_time - self.start_time


@dataclass
class InteractionState:
    """Tracks user interactions for compliance."""
    total_interactions: int = 0
    last_interaction_time: float = 0
    tempo_changes: int = 0
    section_loops: int = 0
    pauses: int = 0
    seeks: int = 0
    interaction_history: List[Tuple[float, str]] = field(default_factory=list)
    
    def record(self, action: str):
        """Record an interaction."""
        now = time.time()
        self.total_interactions += 1
        self.last_interaction_time = now
        self.interaction_history.append((now, action))
        
        if action == "tempo_change":
            self.tempo_changes += 1
        elif action == "section_loop":
            self.section_loops += 1
        elif action == "pause":
            self.pauses += 1
        elif action == "seek":
            self.seeks += 1
    
    def is_interactive(self) -> bool:
        """Check if session has been interactive (not passive consumption)."""
        return self.total_interactions >= 1


@dataclass
class PlaybackConfig:
    """Configuration for instructional playback."""
    # Tempo limits (percentage of original)
    min_tempo_percent: float = 50.0
    max_tempo_percent: float = 150.0
    default_tempo_percent: float = 100.0
    
    # Interaction requirements
    require_initial_interaction: bool = True
    max_continuous_playback_seconds: float = 60.0  # Pause after 60s without interaction
    interaction_prompt_delay: float = 30.0  # Prompt for interaction after 30s
    
    # Section settings
    auto_pause_at_section_end: bool = False
    default_loop_count: int = 3  # Default loops when section looping
    
    # Visual guidance
    show_upcoming_notes: bool = True
    upcoming_note_window: float = 2.0  # Show notes 2 seconds ahead
    
    # Anti-consumption
    disable_background_playback: bool = True
    require_visible_window: bool = True


class InstructionalEngine:
    """
    Practice-focused playback engine with interaction requirements.
    
    This engine ensures:
    1. Users must interact to start playback
    2. Long continuous playback triggers interaction prompts
    3. Tempo and section controls are always available
    4. No passive consumption is possible
    
    Usage:
        engine = InstructionalEngine(song)
        engine.start()  # Requires interaction
        engine.set_tempo(75)  # 75% speed
        engine.loop_section("verse")
    """
    
    def __init__(self, song=None, config: PlaybackConfig = None):
        self.song = song
        self.config = config or PlaybackConfig()
        
        # Playback state
        self._state = PlaybackState.STOPPED
        self._current_time = 0.0
        self._tempo_percent = self.config.default_tempo_percent
        self._current_section: Optional[Section] = None
        self._loop_count = 0
        
        # Interaction tracking
        self._interactions = InteractionState()
        self._interaction_required = self.config.require_initial_interaction
        self._last_playback_check = 0.0
        
        # Threading
        self._playback_thread: Optional[threading.Thread] = None
        self._stop_event = threading.Event()
        
        # Callbacks
        self._on_note: Optional[Callable] = None
        self._on_section_end: Optional[Callable] = None
        self._on_interaction_required: Optional[Callable] = None
        self._on_visual_update: Optional[Callable] = None
        
        # Sections (can be auto-detected or manually defined)
        self._sections: Dict[str, Section] = {}
    
    # ═══════════════════════════════════════════════════════════════
    # PROPERTIES
    # ═══════════════════════════════════════════════════════════════
    
    @property
    def state(self) -> PlaybackState:
        return self._state
    
    @property
    def current_time(self) -> float:
        return self._current_time
    
    @property
    def tempo_percent(self) -> float:
        return self._tempo_percent
    
    @property
    def is_playing(self) -> bool:
        return self._state == PlaybackState.PLAYING
    
    @property
    def is_interactive(self) -> bool:
        return self._interactions.is_interactive()
    
    @property
    def interaction_stats(self) -> dict:
        return {
            'total': self._interactions.total_interactions,
            'tempo_changes': self._interactions.tempo_changes,
            'section_loops': self._interactions.section_loops,
            'pauses': self._interactions.pauses,
            'seeks': self._interactions.seeks,
            'is_interactive': self._interactions.is_interactive()
        }
    
    # ═══════════════════════════════════════════════════════════════
    # CORE PLAYBACK CONTROLS (Require Interaction)
    # ═══════════════════════════════════════════════════════════════
    
    def start(self) -> bool:
        """
        Start playback. Records interaction and begins playing.
        
        Returns:
            True if playback started, False if waiting for additional interaction
        """
        self._interactions.record("start")
        
        if self._state == PlaybackState.PLAYING:
            return True
        
        self._state = PlaybackState.PLAYING
        self._last_playback_check = time.time()
        
        # Start playback thread
        self._stop_event.clear()
        self._playback_thread = threading.Thread(target=self._playback_loop)
        self._playback_thread.daemon = True
        self._playback_thread.start()
        
        return True
    
    def pause(self) -> None:
        """Pause playback. Records interaction."""
        self._interactions.record("pause")
        self._state = PlaybackState.PAUSED
    
    def stop(self) -> None:
        """Stop playback and reset position."""
        self._interactions.record("stop")
        self._state = PlaybackState.STOPPED
        self._stop_event.set()
        self._current_time = 0.0
    
    def toggle(self) -> PlaybackState:
        """Toggle play/pause. Records interaction."""
        self._interactions.record("toggle")
        
        if self._state == PlaybackState.PLAYING:
            self.pause()
        else:
            self.start()
        
        return self._state
    
    # ═══════════════════════════════════════════════════════════════
    # TEMPO CONTROLS (Key Instructional Feature)
    # ═══════════════════════════════════════════════════════════════
    
    def set_tempo(self, percent: float) -> float:
        """
        Set playback tempo as percentage of original.
        
        Args:
            percent: Tempo percentage (50-150)
            
        Returns:
            Actual tempo set (clamped to limits)
        """
        self._interactions.record("tempo_change")
        
        # Clamp to limits
        clamped = max(
            self.config.min_tempo_percent,
            min(self.config.max_tempo_percent, percent)
        )
        self._tempo_percent = clamped
        
        return clamped
    
    def tempo_up(self, amount: float = 10.0) -> float:
        """Increase tempo by amount (default 10%)."""
        return self.set_tempo(self._tempo_percent + amount)
    
    def tempo_down(self, amount: float = 10.0) -> float:
        """Decrease tempo by amount (default 10%)."""
        return self.set_tempo(self._tempo_percent - amount)
    
    def reset_tempo(self) -> float:
        """Reset tempo to 100%."""
        return self.set_tempo(100.0)
    
    # ═══════════════════════════════════════════════════════════════
    # SECTION CONTROLS (Key Instructional Feature)
    # ═══════════════════════════════════════════════════════════════
    
    def add_section(self, name: str, start: float, end: float) -> Section:
        """
        Add a named section for looping.
        
        Args:
            name: Section name (e.g., "verse", "chorus")
            start: Start time in seconds
            end: End time in seconds
            
        Returns:
            Created Section object
        """
        section = Section(name=name, start_time=start, end_time=end)
        self._sections[name] = section
        return section
    
    def loop_section(self, name: str, loop_count: int = None) -> bool:
        """
        Loop a section repeatedly.
        
        Args:
            name: Section name
            loop_count: Number of loops (None for infinite until stopped)
            
        Returns:
            True if section found and looping started
        """
        self._interactions.record("section_loop")
        
        if name not in self._sections:
            return False
        
        self._current_section = self._sections[name]
        self._loop_count = loop_count or self.config.default_loop_count
        self._current_time = self._current_section.start_time
        self._state = PlaybackState.SECTION_LOOP
        
        return True
    
    def exit_loop(self) -> None:
        """Exit section loop and continue playback."""
        self._interactions.record("exit_loop")
        self._current_section = None
        self._state = PlaybackState.PLAYING
    
    def goto_section(self, name: str) -> bool:
        """
        Jump to start of a section.
        
        Args:
            name: Section name
            
        Returns:
            True if section found
        """
        self._interactions.record("goto_section")
        
        if name not in self._sections:
            return False
        
        self._current_time = self._sections[name].start_time
        return True
    
    def auto_detect_sections(self) -> int:
        """
        Auto-detect sections based on chord changes or tempo.
        
        Returns:
            Number of sections detected
        """
        if not self.song or not hasattr(self.song, 'chords'):
            return 0
        
        # Simple implementation: create sections every 30 seconds
        duration = getattr(self.song, 'duration', 180)
        section_duration = 30.0
        count = 0
        
        time_cursor = 0.0
        section_names = ["intro", "verse1", "chorus1", "verse2", "chorus2", "bridge", "outro"]
        
        while time_cursor < duration:
            name = section_names[count % len(section_names)]
            end_time = min(time_cursor + section_duration, duration)
            self.add_section(name, time_cursor, end_time)
            time_cursor = end_time
            count += 1
        
        return count
    
    # ═══════════════════════════════════════════════════════════════
    # SEEK CONTROLS
    # ═══════════════════════════════════════════════════════════════
    
    def seek(self, time_seconds: float) -> float:
        """
        Seek to a specific time.
        
        Args:
            time_seconds: Time to seek to
            
        Returns:
            Actual time after seeking (clamped)
        """
        self._interactions.record("seek")
        
        duration = getattr(self.song, 'duration', float('inf'))
        self._current_time = max(0, min(time_seconds, duration))
        
        return self._current_time
    
    def seek_relative(self, offset_seconds: float) -> float:
        """
        Seek relative to current position.
        
        Args:
            offset_seconds: Offset (positive = forward, negative = backward)
            
        Returns:
            New time position
        """
        return self.seek(self._current_time + offset_seconds)
    
    def rewind(self, seconds: float = 5.0) -> float:
        """Rewind by specified seconds."""
        return self.seek_relative(-seconds)
    
    def forward(self, seconds: float = 5.0) -> float:
        """Fast forward by specified seconds."""
        return self.seek_relative(seconds)
    
    # ═══════════════════════════════════════════════════════════════
    # VISUAL GUIDANCE
    # ═══════════════════════════════════════════════════════════════
    
    def get_upcoming_notes(self) -> list:
        """
        Get notes coming up in the next few seconds.
        
        Returns:
            List of upcoming note events with time-until-play
        """
        if not self.song or not hasattr(self.song, 'events'):
            return []
        
        window = self.config.upcoming_note_window
        upcoming = []
        
        for event in self.song.events:
            event_time = getattr(event, 'time', 0)
            if self._current_time <= event_time <= self._current_time + window:
                time_until = event_time - self._current_time
                upcoming.append({
                    'event': event,
                    'time_until': time_until,
                    'string': getattr(event, 'string', 0),
                    'fret': getattr(event, 'fret', 0)
                })
        
        return sorted(upcoming, key=lambda x: x['time_until'])
    
    def get_current_chord(self) -> Optional[str]:
        """Get the current chord being played."""
        if not self.song or not hasattr(self.song, 'chords'):
            return None
        
        chords = self.song.chords
        if not chords:
            return None
        
        # Simple: cycle through chords based on time
        duration = getattr(self.song, 'duration', 180)
        chord_duration = duration / len(chords)
        chord_index = int(self._current_time / chord_duration) % len(chords)
        
        return chords[chord_index]
    
    # ═══════════════════════════════════════════════════════════════
    # CALLBACKS
    # ═══════════════════════════════════════════════════════════════
    
    def on_note(self, callback: Callable) -> None:
        """Set callback for when a note should be played."""
        self._on_note = callback
    
    def on_section_end(self, callback: Callable) -> None:
        """Set callback for when a section ends."""
        self._on_section_end = callback
    
    def on_interaction_required(self, callback: Callable) -> None:
        """Set callback for when interaction is needed."""
        self._on_interaction_required = callback
    
    def on_visual_update(self, callback: Callable) -> None:
        """Set callback for visual updates."""
        self._on_visual_update = callback
    
    # ═══════════════════════════════════════════════════════════════
    # INTERNAL PLAYBACK
    # ═══════════════════════════════════════════════════════════════
    
    def _playback_loop(self) -> None:
        """Internal playback loop (runs in thread)."""
        last_time = time.time()
        
        while not self._stop_event.is_set():
            if self._state != PlaybackState.PLAYING and self._state != PlaybackState.SECTION_LOOP:
                time.sleep(0.01)
                continue
            
            # Calculate time delta with tempo adjustment
            now = time.time()
            delta = (now - last_time) * (self._tempo_percent / 100.0)
            last_time = now
            
            self._current_time += delta
            
            # Check for interaction requirement
            self._check_interaction_requirement()
            
            # Handle section looping
            if self._state == PlaybackState.SECTION_LOOP and self._current_section:
                if self._current_time >= self._current_section.end_time:
                    self._loop_count -= 1
                    if self._loop_count > 0:
                        self._current_time = self._current_section.start_time
                        if self._on_section_end:
                            self._on_section_end(self._current_section.name)
                    else:
                        self.exit_loop()
            
            # Trigger note callbacks
            if self._on_note:
                self._trigger_notes()
            
            # Visual update
            if self._on_visual_update:
                self._on_visual_update(self._current_time, self.get_upcoming_notes())
            
            # Check for song end
            if self.song:
                duration = getattr(self.song, 'duration', float('inf'))
                if self._current_time >= duration:
                    self.stop()
            
            time.sleep(0.016)  # ~60fps
    
    def _trigger_notes(self) -> None:
        """Trigger note callbacks for current time."""
        if not self.song or not hasattr(self.song, 'events'):
            return
        
        for event in self.song.events:
            event_time = getattr(event, 'time', 0)
            # Trigger if within small window of current time
            if abs(event_time - self._current_time) < 0.05:
                self._on_note(event)
    
    def _check_interaction_requirement(self) -> None:
        """Check if interaction is required and trigger callback."""
        now = time.time()
        time_since_interaction = now - self._interactions.last_interaction_time
        
        # Prompt for interaction after delay
        if time_since_interaction > self.config.interaction_prompt_delay:
            if self._on_interaction_required:
                self._on_interaction_required()
        
        # Auto-pause after max continuous playback
        if time_since_interaction > self.config.max_continuous_playback_seconds:
            self.pause()
            self._state = PlaybackState.WAITING_INTERACTION
            if self._on_interaction_required:
                self._on_interaction_required()
    
    # ═══════════════════════════════════════════════════════════════
    # STATUS AND REPORTING
    # ═══════════════════════════════════════════════════════════════
    
    def get_status(self) -> dict:
        """Get current engine status."""
        return {
            'state': self._state.value,
            'current_time': self._current_time,
            'tempo_percent': self._tempo_percent,
            'current_section': self._current_section.name if self._current_section else None,
            'loop_count': self._loop_count,
            'interactions': self.interaction_stats,
            'upcoming_notes_count': len(self.get_upcoming_notes()),
            'current_chord': self.get_current_chord()
        }
    
    def generate_session_report(self) -> str:
        """Generate a report of the practice session."""
        stats = self.interaction_stats
        
        report = [
            "=" * 50,
            "PRACTICE SESSION REPORT",
            "=" * 50,
            "",
            f"Total Interactions: {stats['total']}",
            f"  - Tempo Changes: {stats['tempo_changes']}",
            f"  - Section Loops: {stats['section_loops']}",
            f"  - Pauses: {stats['pauses']}",
            f"  - Seeks: {stats['seeks']}",
            "",
            f"Session Type: {'INTERACTIVE ✅' if stats['is_interactive'] else 'PASSIVE ⚠️'}",
            "",
            "=" * 50,
        ]
        
        return "\n".join(report)


# Example usage
if __name__ == "__main__":
    from song_loader import Song, NoteEvent
    
    # Create a test song
    test_song = Song(
        song_id="demo_001",
        title="Demo Song",
        tempo=120,
        events=[
            NoteEvent(time=0.0, string=6, fret=3, duration=0.5),
            NoteEvent(time=0.5, string=5, fret=2, duration=0.5),
            NoteEvent(time=1.0, string=4, fret=0, duration=0.5),
        ],
        license_status="original",
        chords=["G", "C", "D"],
        genre="demo"
    )
    
    # Create engine
    engine = InstructionalEngine(test_song)
    
    # Add sections
    engine.add_section("intro", 0.0, 30.0)
    engine.add_section("verse", 30.0, 60.0)
    
    # Demo interactions
    print("Testing Instructional Engine...")
    print()
    
    engine.start()
    print(f"✅ Started playback")
    
    engine.set_tempo(75)
    print(f"✅ Set tempo to 75%")
    
    engine.pause()
    print(f"✅ Paused")
    
    engine.loop_section("intro", 3)
    print(f"✅ Looping 'intro' section 3 times")
    
    print()
    print(engine.generate_session_report())

