"""
Guitar Audio Engine Package
===========================

A performance-based song playback system that treats songs as 
performance instructions, not sheet music.

Core Components:
- song_loader: Load songs from JSON files
- song_library: Manage a collection of songs  
- song_playback_engine: Synthesize and play guitar sounds

Usage:
    from audio import SongLoader, SongLibrary, PlaybackEngine
    
    library = SongLibrary()
    library.add(SongLoader.load("songs/pd_001.json"))
    
    engine = PlaybackEngine()
    engine.load_song(library.get("pd_001"))
    engine.play()
"""

from .song_loader import NoteEvent, Song, SongLoader
from .song_library import SongLibrary
from .song_playback_engine import (
    PlaybackEngine,
    GuitarSynthesizer,
    VisualInstructionRenderer
)

__all__ = [
    "NoteEvent",
    "Song", 
    "SongLoader",
    "SongLibrary",
    "PlaybackEngine",
    "GuitarSynthesizer",
    "VisualInstructionRenderer"
]

__version__ = "1.0.0"

