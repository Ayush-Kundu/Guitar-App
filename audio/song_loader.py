"""
Song Loader - Simple, mechanical loading of song JSON files.
No logic, no music theory, no transformations.
Load exactly what's authored.

VALIDATION:
All songs are validated before loading to ensure:
- Valid license status (public_domain, licensed, original, educational_use)
- Performance-based events only (string/fret required)
- No sheet music notation elements
- Max 6 simultaneous notes (guitar physical limit)
"""

import json
from dataclasses import dataclass
from typing import List, Optional


# Validation will be done via SongValidator (imported where needed to avoid circular imports)
VALID_LICENSES = frozenset([
    "public_domain",
    "licensed", 
    "original",
    "educational_use"
])


@dataclass
class NoteEvent:
    """
    A single note event in the song.
    Represents: time, which string, which fret, how long.
    """
    time: float       # Start time in seconds
    string: int       # Guitar string (1-6, where 6=low E, 1=high e)
    fret: int         # Fret number (0=open string)
    duration: float   # How long the note lasts in seconds
    
    # Optional extended properties
    velocity: float = 0.8      # How hard (0.0-1.0)
    technique: str = "pluck"   # pluck, hammer, pull, slide, bend, mute


@dataclass
class Song:
    """
    Complete song representation.
    Contains metadata and a list of note events.
    """
    song_id: str
    title: str
    tempo: int
    events: List[NoteEvent]
    
    # Optional metadata
    composer: str = "Unknown"
    time_signature: str = "4/4"
    difficulty: str = "beginner"
    license_status: str = "unknown"
    tuning: str = "standard"
    capo: int = 0
    genre: str = "unknown"
    chords: Optional[List[str]] = None
    original_duration: str = ""
    learning_time: str = ""
    
    # Multi-difficulty and licensing fields
    licensed_song_id: Optional[str] = None  # Reference to licensed song
    subtitle: str = ""  # Difficulty subtitle
    difficulty_description: str = ""  # Description of difficulty level
    educational_transformation: Optional[dict] = None  # Transformation metadata
    sections: Optional[List[dict]] = None  # Song sections for looping
    
    def __post_init__(self):
        if self.chords is None:
            self.chords = []
        if self.sections is None:
            self.sections = []
        if self.educational_transformation is None:
            self.educational_transformation = {}
    
    @property
    def duration(self) -> float:
        """Total duration of the song in seconds"""
        if not self.events:
            return 0.0
        return max(e.time + e.duration for e in self.events)
    
    @property
    def note_count(self) -> int:
        """Number of note events"""
        return len(self.events)


class SongLoader:
    """
    Simple, mechanical loader for song JSON files.
    
    No logic. No music theory. No transformations.
    Load exactly what's authored.
    
    IMPORTANT: Use load_validated() for production to ensure compliance.
    """
    
    # Track whether validation is enabled globally
    _validation_enabled = True
    
    @classmethod
    def enable_validation(cls, enabled: bool = True):
        """Enable or disable validation globally."""
        cls._validation_enabled = enabled
    
    @classmethod
    def load_validated(cls, path: str, check_license: bool = True) -> "Song":
        """
        Load and validate a song from a JSON file.
        
        This is the RECOMMENDED method for production use.
        Validates the song AND checks license before returning.
        
        Args:
            path: Path to the JSON file
            check_license: If True, also verify license (default: True)
            
        Returns:
            Validated Song object
            
        Raises:
            ValidationError: If song fails validation
            LicenseError: If song fails license check
        """
        song = cls.load(path)
        
        # Import here to avoid circular imports
        from song_validator import SongValidator
        SongValidator.validate(song)
        
        # License gate check
        if check_license:
            from license_gate import check_license as verify_license
            verify_license(song)
        
        return song
    
    @staticmethod
    def load(path: str) -> "Song":
        """
        Load a song from a JSON file.
        
        Args:
            path: Path to the JSON file
            
        Returns:
            Song object with all events loaded
        """
        with open(path, 'r') as f:
            data = json.load(f)
        
        # Load events - exactly as authored
        events = [
            NoteEvent(
                time=e["time"],
                string=e["string"],
                fret=e["fret"],
                duration=e["duration"],
                velocity=e.get("velocity", 0.8),
                technique=e.get("technique", "pluck")
            )
            for e in data.get("events", [])
        ]
        
        # Create song object
        return Song(
            song_id=data["song_id"],
            title=data["title"],
            tempo=data.get("tempo", 120),
            events=events,
            composer=data.get("composer", "Unknown"),
            time_signature=data.get("time_signature", "4/4"),
            difficulty=data.get("difficulty", "beginner"),
            license_status=data.get("license_status", "unknown"),
            tuning=data.get("tuning", "standard"),
            capo=data.get("capo", 0),
            genre=data.get("genre", "unknown"),
            chords=data.get("chords"),
            original_duration=data.get("original_duration", ""),
            learning_time=data.get("learning_time", ""),
            # Multi-difficulty fields
            licensed_song_id=data.get("licensed_song_id"),
            subtitle=data.get("subtitle", ""),
            difficulty_description=data.get("difficulty_description", ""),
            educational_transformation=data.get("educational_transformation"),
            sections=data.get("sections")
        )
    
    @staticmethod
    def save(song: Song, path: str) -> None:
        """
        Save a song to a JSON file.
        
        Args:
            song: Song object to save
            path: Path to save the JSON file
        """
        data = {
            "song_id": song.song_id,
            "title": song.title,
            "composer": song.composer,
            "tempo": song.tempo,
            "time_signature": song.time_signature,
            "difficulty": song.difficulty,
            "license_status": song.license_status,
            "genre": song.genre,
            "tuning": song.tuning,
            "capo": song.capo,
            "chords": song.chords or [],
            "original_duration": song.original_duration,
            "learning_time": song.learning_time,
            "events": [
                {
                    "time": e.time,
                    "string": e.string,
                    "fret": e.fret,
                    "duration": e.duration,
                    "velocity": e.velocity,
                    "technique": e.technique
                }
                for e in song.events
            ]
        }
        
        with open(path, 'w') as f:
            json.dump(data, f, indent=2)

