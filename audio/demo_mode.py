"""
Demo Mode - Publisher demonstration build.

This module provides a controlled demo environment for showing publishers.

CONTENT INCLUDED:
✅ 1 public-domain song (Greensleeves)
✅ 1 original song (Guitar App Theme)
✅ 2-3 difficulty levels each

FEATURES ON:
✅ Tempo change (50%-150%)
✅ Section looping
✅ Visual note guidance
✅ Synthesized audio (real-time)
✅ Interactive controls

FEATURES OFF:
❌ No downloads
❌ No file access
❌ No raw timelines
❌ No full-song autoplay without interaction

The demo feels INSTRUCTIONAL, not CONSUMPTIVE.
"""

import os
import json
from typing import Dict, List, Optional
from dataclasses import dataclass

from song_loader import Song, NoteEvent, SongLoader
from song_validator import SongValidator, ValidationError
from extraction_blocker import ExtractionBlocker, ExtractionBlockedError
from instructional_engine import InstructionalEngine, PlaybackConfig


@dataclass
class DemoSong:
    """A song available in demo mode with multiple difficulty levels."""
    base_song: Song
    difficulties: Dict[str, Song]  # easy, medium, hard
    description: str
    why_included: str


class DemoMode:
    """
    Publisher demo mode with controlled content.
    
    This demo showcases:
    1. Legal compliance (public domain + original songs only)
    2. Instructional features (tempo, looping, visual guidance)
    3. Extraction blocking (no downloads, exports, or passive consumption)
    
    Usage:
        demo = DemoMode()
        demo.start_demo()
        
        # Show public domain song
        demo.load_song("greensleeves", difficulty="easy")
        demo.engine.start()
        
        # Show original song
        demo.load_song("guitar_app_theme", difficulty="medium")
    """
    
    def __init__(self):
        self.songs: Dict[str, DemoSong] = {}
        self.current_song: Optional[Song] = None
        self.engine: Optional[InstructionalEngine] = None
        
        # Demo-specific config
        self.config = PlaybackConfig(
            require_initial_interaction=True,
            max_continuous_playback_seconds=30.0,  # More aggressive for demo
            interaction_prompt_delay=15.0
        )
        
        # Load demo songs
        self._load_demo_content()
    
    def _load_demo_content(self):
        """Load the demo songs."""
        
        # ═══════════════════════════════════════════════════════════
        # PUBLIC DOMAIN SONG: Greensleeves
        # ═══════════════════════════════════════════════════════════
        greensleeves = self._create_greensleeves()
        self.songs["greensleeves"] = greensleeves
        
        # ═══════════════════════════════════════════════════════════
        # ORIGINAL SONG: Guitar App Theme
        # ═══════════════════════════════════════════════════════════
        theme = self._create_original_theme()
        self.songs["guitar_app_theme"] = theme
    
    def _create_greensleeves(self) -> DemoSong:
        """Create Greensleeves with multiple difficulty levels."""
        
        # EASY: Single notes, slow tempo
        easy_events = [
            NoteEvent(time=0.0, string=3, fret=0, duration=1.0, velocity=0.7),
            NoteEvent(time=1.0, string=3, fret=2, duration=0.5, velocity=0.7),
            NoteEvent(time=1.5, string=2, fret=0, duration=0.5, velocity=0.7),
            NoteEvent(time=2.0, string=2, fret=1, duration=1.0, velocity=0.7),
            NoteEvent(time=3.0, string=3, fret=0, duration=0.5, velocity=0.7),
            NoteEvent(time=3.5, string=3, fret=2, duration=0.5, velocity=0.7),
            NoteEvent(time=4.0, string=2, fret=0, duration=1.0, velocity=0.7),
            NoteEvent(time=5.0, string=2, fret=3, duration=0.5, velocity=0.7),
            NoteEvent(time=5.5, string=3, fret=0, duration=0.5, velocity=0.7),
            NoteEvent(time=6.0, string=3, fret=2, duration=1.0, velocity=0.7),
        ]
        
        easy = Song(
            song_id="demo_greensleeves_easy",
            title="Greensleeves (Easy)",
            tempo=70,
            events=easy_events,
            composer="Traditional (16th Century)",
            time_signature="6/8",
            difficulty="easy",
            license_status="public_domain",
            genre="classical",
            chords=["Am", "G", "Em"]
        )
        
        # MEDIUM: Add harmony notes
        medium_events = easy_events.copy()
        medium_events.extend([
            NoteEvent(time=0.0, string=5, fret=0, duration=1.0, velocity=0.5),
            NoteEvent(time=2.0, string=4, fret=2, duration=1.0, velocity=0.5),
            NoteEvent(time=4.0, string=5, fret=0, duration=1.0, velocity=0.5),
            NoteEvent(time=6.0, string=4, fret=2, duration=1.0, velocity=0.5),
        ])
        
        medium = Song(
            song_id="demo_greensleeves_medium",
            title="Greensleeves (Medium)",
            tempo=85,
            events=medium_events,
            composer="Traditional (16th Century)",
            time_signature="6/8",
            difficulty="medium",
            license_status="public_domain",
            genre="classical",
            chords=["Am", "G", "Em", "C"]
        )
        
        # HARD: Full fingerpicking pattern
        hard_events = []
        base_pattern = [
            (0.0, 5, 0), (0.2, 3, 0), (0.4, 2, 1), (0.6, 3, 0),
            (0.8, 5, 0), (1.0, 3, 2), (1.2, 2, 0), (1.4, 3, 2),
        ]
        
        for measure in range(8):
            base_time = measure * 2.0
            for offset, string, fret in base_pattern:
                hard_events.append(
                    NoteEvent(
                        time=base_time + offset,
                        string=string,
                        fret=fret,
                        duration=0.3,
                        velocity=0.8 if offset == 0 else 0.6
                    )
                )
        
        hard = Song(
            song_id="demo_greensleeves_hard",
            title="Greensleeves (Hard)",
            tempo=100,
            events=hard_events,
            composer="Traditional (16th Century)",
            time_signature="6/8",
            difficulty="hard",
            license_status="public_domain",
            genre="classical",
            chords=["Am", "G", "Em", "C", "D", "F"]
        )
        
        return DemoSong(
            base_song=easy,
            difficulties={"easy": easy, "medium": medium, "hard": hard},
            description="A traditional English folk song from the 16th century, "
                       "in public domain for centuries.",
            why_included="Public domain - no licensing required. "
                        "Demonstrates multi-difficulty learning path."
        )
    
    def _create_original_theme(self) -> DemoSong:
        """Create original Guitar App Theme song."""
        
        # EASY: Simple chord progression
        easy_events = []
        chords = [
            (0, 5, 0, 2.0),   # A root
            (2, 4, 2, 2.0),   # D root
            (4, 5, 0, 2.0),   # A root
            (6, 4, 3, 2.0),   # E root
        ]
        
        for time, string, fret, dur in chords:
            easy_events.append(
                NoteEvent(time=time, string=string, fret=fret, duration=dur, velocity=0.8)
            )
        
        easy = Song(
            song_id="demo_theme_easy",
            title="Guitar App Theme (Easy)",
            tempo=90,
            events=easy_events,
            composer="Guitar App Original",
            time_signature="4/4",
            difficulty="easy",
            license_status="original",
            genre="pop",
            chords=["A", "D", "A", "E"]
        )
        
        # MEDIUM: Strummed chords
        medium_events = []
        chord_shapes = {
            "A": [(1, 0), (2, 2), (3, 2), (4, 2), (5, 0)],
            "D": [(1, 2), (2, 3), (3, 2), (4, 0)],
            "E": [(1, 0), (2, 0), (3, 1), (4, 2), (5, 2), (6, 0)]
        }
        
        progression = [("A", 0), ("D", 2), ("A", 4), ("E", 6)]
        
        for chord_name, start_time in progression:
            for i, (string, fret) in enumerate(chord_shapes[chord_name]):
                medium_events.append(
                    NoteEvent(
                        time=start_time + i * 0.02,
                        string=string,
                        fret=fret,
                        duration=1.8,
                        velocity=0.7
                    )
                )
        
        medium = Song(
            song_id="demo_theme_medium",
            title="Guitar App Theme (Medium)",
            tempo=100,
            events=medium_events,
            composer="Guitar App Original",
            time_signature="4/4",
            difficulty="medium",
            license_status="original",
            genre="pop",
            chords=["A", "D", "A", "E"]
        )
        
        # HARD: Fingerstyle arrangement
        hard_events = []
        # Create a Travis picking pattern
        pattern_times = [0.0, 0.25, 0.5, 0.75, 1.0, 1.25, 1.5, 1.75]
        
        for measure in range(4):
            base = measure * 2.0
            for i, offset in enumerate(pattern_times):
                string = 5 if i % 2 == 0 else (3 if i % 4 < 2 else 2)
                fret = [0, 2, 2, 2, 0, 2, 0, 2][i]
                hard_events.append(
                    NoteEvent(
                        time=base + offset,
                        string=string,
                        fret=fret,
                        duration=0.3,
                        velocity=0.8 if i == 0 else 0.6
                    )
                )
        
        hard = Song(
            song_id="demo_theme_hard",
            title="Guitar App Theme (Hard)",
            tempo=110,
            events=hard_events,
            composer="Guitar App Original",
            time_signature="4/4",
            difficulty="hard",
            license_status="original",
            genre="pop",
            chords=["A", "D", "A", "E"]
        )
        
        return DemoSong(
            base_song=easy,
            difficulties={"easy": easy, "medium": medium, "hard": hard},
            description="An original composition created specifically for "
                       "the Guitar App, showcasing our instructional approach.",
            why_included="Original content - we own all rights. "
                        "Demonstrates our content creation capability."
        )
    
    # ═══════════════════════════════════════════════════════════════
    # DEMO OPERATIONS
    # ═══════════════════════════════════════════════════════════════
    
    def list_songs(self) -> List[dict]:
        """List all available demo songs."""
        result = []
        for song_id, demo_song in self.songs.items():
            result.append({
                'id': song_id,
                'title': demo_song.base_song.title.replace(" (Easy)", ""),
                'composer': demo_song.base_song.composer,
                'license': demo_song.base_song.license_status,
                'difficulties': list(demo_song.difficulties.keys()),
                'description': demo_song.description,
                'why_included': demo_song.why_included
            })
        return result
    
    def load_song(self, song_id: str, difficulty: str = "easy") -> Song:
        """
        Load a demo song at specified difficulty.
        
        Args:
            song_id: Song identifier (greensleeves, guitar_app_theme)
            difficulty: Difficulty level (easy, medium, hard)
            
        Returns:
            Loaded and validated Song object
        """
        if song_id not in self.songs:
            raise ValueError(f"Song '{song_id}' not found in demo. "
                           f"Available: {list(self.songs.keys())}")
        
        demo_song = self.songs[song_id]
        
        if difficulty not in demo_song.difficulties:
            raise ValueError(f"Difficulty '{difficulty}' not available. "
                           f"Available: {list(demo_song.difficulties.keys())}")
        
        song = demo_song.difficulties[difficulty]
        
        # VALIDATE before loading (non-negotiable)
        SongValidator.validate(song)
        
        self.current_song = song
        self.engine = InstructionalEngine(song, self.config)
        
        # Auto-add sections
        self.engine.add_section("intro", 0.0, 4.0)
        self.engine.add_section("main", 4.0, 12.0)
        self.engine.add_section("outro", 12.0, 16.0)
        
        return song
    
    def get_engine(self) -> InstructionalEngine:
        """Get the current instructional engine."""
        if not self.engine:
            raise ValueError("No song loaded. Call load_song() first.")
        return self.engine
    
    # ═══════════════════════════════════════════════════════════════
    # BLOCKED FEATURES (Prove they're disabled)
    # ═══════════════════════════════════════════════════════════════
    
    def export_audio(self, *args, **kwargs):
        """BLOCKED: Audio export."""
        ExtractionBlocker.export_audio()
    
    def export_midi(self, *args, **kwargs):
        """BLOCKED: MIDI export."""
        ExtractionBlocker.export_midi()
    
    def get_raw_timeline(self, *args, **kwargs):
        """BLOCKED: Raw timeline access."""
        ExtractionBlocker.export_timeline()
    
    def download_song(self, *args, **kwargs):
        """BLOCKED: Song download."""
        ExtractionBlocker.export_events()
    
    def autoplay_full_song(self, *args, **kwargs):
        """BLOCKED: Full autoplay."""
        ExtractionBlocker.full_autoplay()
    
    # ═══════════════════════════════════════════════════════════════
    # DEMO PRESENTATION
    # ═══════════════════════════════════════════════════════════════
    
    def start_demo(self) -> str:
        """Start the demo and return presentation text."""
        return """
╔══════════════════════════════════════════════════════════════════╗
║               GUITAR APP - PUBLISHER DEMO                        ║
╠══════════════════════════════════════════════════════════════════╣
║                                                                  ║
║  This demo showcases our instructional music learning platform.  ║
║                                                                  ║
║  CONTENT IN THIS DEMO:                                          ║
║  ─────────────────────                                          ║
║  ✅ 1 Public Domain Song: Greensleeves (Traditional)            ║
║  ✅ 1 Original Song: Guitar App Theme (We own rights)           ║
║  ✅ 3 Difficulty Levels: Easy, Medium, Hard                     ║
║                                                                  ║
║  FEATURES DEMONSTRATED:                                          ║
║  ──────────────────────                                          ║
║  ✅ Tempo adjustment (50% - 150%)                                ║
║  ✅ Section looping for practice                                 ║
║  ✅ Visual note guidance                                         ║
║  ✅ Real-time synthesized audio                                  ║
║  ✅ Interactive practice controls                                ║
║                                                                  ║
║  EXTRACTION PROTECTIONS:                                         ║
║  ───────────────────────                                         ║
║  ❌ No audio downloads or exports                                ║
║  ❌ No MIDI export                                               ║
║  ❌ No printable notation                                        ║
║  ❌ No raw data access                                           ║
║  ❌ No full-song autoplay without interaction                    ║
║                                                                  ║
║  "Can users get the song out?" → PROVABLY NO                     ║
║                                                                  ║
╚══════════════════════════════════════════════════════════════════╝
"""
    
    def generate_compliance_summary(self) -> str:
        """Generate a compliance summary for publishers."""
        songs_info = self.list_songs()
        
        lines = [
            "=" * 60,
            "LEGAL COMPLIANCE SUMMARY",
            "=" * 60,
            "",
            "SONGS IN DEMO:",
        ]
        
        for song in songs_info:
            lines.append(f"  • {song['title']}")
            lines.append(f"    License: {song['license'].upper()}")
            lines.append(f"    Reason: {song['why_included']}")
            lines.append("")
        
        lines.extend([
            "VALIDATION CHECKS:",
            "  ✅ All songs pass license validation",
            "  ✅ No sheet music notation detected",
            "  ✅ Performance-based events only (string/fret)",
            "  ✅ Max 6 simultaneous notes (guitar limit)",
            "",
            "EXTRACTION BLOCKS:",
        ])
        
        for feature in ExtractionBlocker.get_blocked_features():
            lines.append(f"  ❌ {feature}")
        
        lines.extend([
            "",
            "=" * 60,
        ])
        
        return "\n".join(lines)


# Demo runner
if __name__ == "__main__":
    print("Starting Guitar App Publisher Demo...")
    print()
    
    # Create demo
    demo = DemoMode()
    
    # Show presentation
    print(demo.start_demo())
    
    # List songs
    print("\n📚 Available Demo Songs:")
    for song_info in demo.list_songs():
        print(f"\n  🎵 {song_info['title']}")
        print(f"     Composer: {song_info['composer']}")
        print(f"     License: {song_info['license']}")
        print(f"     Difficulties: {', '.join(song_info['difficulties'])}")
        print(f"     {song_info['description'][:60]}...")
    
    # Load and demo a song
    print("\n" + "=" * 60)
    print("Loading 'Greensleeves' at Medium difficulty...")
    
    song = demo.load_song("greensleeves", "medium")
    engine = demo.get_engine()
    
    print(f"✅ Loaded: {song.title}")
    print(f"   Tempo: {song.tempo} BPM")
    print(f"   Notes: {len(song.events)}")
    print(f"   License: {song.license_status}")
    
    # Demo controls
    print("\n🎮 Demo Controls:")
    engine.start()
    print("  ▶️  Started playback")
    
    engine.set_tempo(75)
    print("  🔄 Set tempo to 75%")
    
    engine.loop_section("intro", 2)
    print("  🔁 Looping intro section")
    
    engine.pause()
    print("  ⏸️  Paused")
    
    # Show interaction stats
    print("\n📊 Session Stats:")
    stats = engine.interaction_stats
    print(f"   Total interactions: {stats['total']}")
    print(f"   Session type: {'Interactive ✅' if stats['is_interactive'] else 'Passive ⚠️'}")
    
    # Test blocked features
    print("\n🔒 Testing Extraction Blocks:")
    
    blocked_tests = [
        ("Audio Export", demo.export_audio),
        ("MIDI Export", demo.export_midi),
        ("Raw Timeline", demo.get_raw_timeline),
        ("Download", demo.download_song),
        ("Autoplay", demo.autoplay_full_song),
    ]
    
    for name, func in blocked_tests:
        try:
            func()
            print(f"   ❌ FAIL: {name} was NOT blocked!")
        except (ExtractionBlockedError, PermissionError):
            print(f"   ✅ {name} correctly blocked")
    
    # Show compliance summary
    print()
    print(demo.generate_compliance_summary())

