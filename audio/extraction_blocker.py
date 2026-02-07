"""
Extraction Blocker - Prevents song content extraction.

This module HARD-BLOCKS all paths that could allow users to extract
song content in a consumable format.

BLOCKED FEATURES (NON-NEGOTIABLE):
❌ MIDI export
❌ WAV/Audio export
❌ Full-song autoplay without interaction
❌ Clipboard/copy access to raw data
❌ Timeline data export
❌ Event list export
❌ Sheet music generation
❌ Tablature text generation

This answers the publisher question:
"Can users get the song out?" → PROVABLY NO

All extraction attempts raise PermissionError with clear logging.
"""

import functools
import logging
from typing import Any, Callable
from datetime import datetime


# Configure logging for extraction attempts
logging.basicConfig(level=logging.WARNING)
extraction_logger = logging.getLogger("extraction_blocker")


class ExtractionBlockedError(PermissionError):
    """Raised when an extraction attempt is blocked."""
    
    def __init__(self, feature: str, reason: str = None):
        self.feature = feature
        self.reason = reason or "Audio/data export is disabled in instructional mode"
        self.timestamp = datetime.now().isoformat()
        
        message = f"BLOCKED: {feature} - {self.reason}"
        super().__init__(message)
        
        # Log the attempt
        extraction_logger.warning(
            f"Extraction attempt blocked: {feature} at {self.timestamp}"
        )


class AutoplayBlockedError(PermissionError):
    """Raised when full autoplay without interaction is attempted."""
    
    def __init__(self, song_id: str = None):
        self.song_id = song_id
        self.timestamp = datetime.now().isoformat()
        
        message = (
            "Full-song autoplay without interaction is disabled. "
            "Users must interact with the playback (pause, tempo change, section select). "
            "This ensures instructional engagement, not passive consumption."
        )
        super().__init__(message)
        
        extraction_logger.warning(
            f"Autoplay attempt blocked for song '{song_id}' at {self.timestamp}"
        )


def block_extraction(feature_name: str):
    """
    Decorator that blocks a function and raises ExtractionBlockedError.
    
    Usage:
        @block_extraction("MIDI export")
        def export_midi(self, path):
            ...  # This code will never run
    """
    def decorator(func: Callable) -> Callable:
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            raise ExtractionBlockedError(feature_name)
        return wrapper
    return decorator


class ExtractionBlocker:
    """
    Central extraction blocking system.
    
    This class provides explicit blocks for all extraction paths.
    Every method raises PermissionError with detailed logging.
    
    Publishers will ask: "Can users get the song out?"
    This class proves: DEFINITIVELY NO.
    """
    
    # Track all blocked attempts for audit
    _blocked_attempts = []
    
    @classmethod
    def log_attempt(cls, feature: str, details: str = None):
        """Log a blocked extraction attempt."""
        attempt = {
            'timestamp': datetime.now().isoformat(),
            'feature': feature,
            'details': details
        }
        cls._blocked_attempts.append(attempt)
        extraction_logger.warning(f"Extraction blocked: {feature}")
    
    @classmethod
    def get_blocked_attempts(cls) -> list:
        """Get log of all blocked attempts (for audit)."""
        return cls._blocked_attempts.copy()
    
    # ═══════════════════════════════════════════════════════════════
    # AUDIO EXPORT BLOCKS
    # ═══════════════════════════════════════════════════════════════
    
    @staticmethod
    def export_audio(*args, **kwargs) -> None:
        """BLOCKED: Audio export is disabled."""
        raise ExtractionBlockedError(
            "Audio Export (WAV/MP3/OGG)",
            "Audio export is disabled in instructional mode. "
            "Songs are synthesized in real-time for practice only."
        )
    
    @staticmethod
    def export_wav(*args, **kwargs) -> None:
        """BLOCKED: WAV export is disabled."""
        raise ExtractionBlockedError(
            "WAV Export",
            "WAV file export is permanently disabled. "
            "This prevents redistribution of song audio."
        )
    
    @staticmethod
    def export_mp3(*args, **kwargs) -> None:
        """BLOCKED: MP3 export is disabled."""
        raise ExtractionBlockedError(
            "MP3 Export",
            "MP3 file export is permanently disabled."
        )
    
    @staticmethod
    def render_to_file(*args, **kwargs) -> None:
        """BLOCKED: Audio file rendering is disabled."""
        raise ExtractionBlockedError(
            "Audio File Rendering",
            "Rendering audio to files is disabled. "
            "Audio is only available during live practice sessions."
        )
    
    # ═══════════════════════════════════════════════════════════════
    # MIDI EXPORT BLOCKS
    # ═══════════════════════════════════════════════════════════════
    
    @staticmethod
    def export_midi(*args, **kwargs) -> None:
        """BLOCKED: MIDI export is disabled."""
        raise ExtractionBlockedError(
            "MIDI Export",
            "MIDI export is permanently disabled. "
            "MIDI files could be used to recreate sheet music."
        )
    
    @staticmethod
    def get_midi_data(*args, **kwargs) -> None:
        """BLOCKED: MIDI data access is disabled."""
        raise ExtractionBlockedError(
            "MIDI Data Access",
            "Raw MIDI data is not accessible."
        )
    
    @staticmethod
    def export_musicxml(*args, **kwargs) -> None:
        """BLOCKED: MusicXML export is disabled."""
        raise ExtractionBlockedError(
            "MusicXML Export",
            "MusicXML export is permanently disabled. "
            "This prevents conversion to sheet music format."
        )
    
    # ═══════════════════════════════════════════════════════════════
    # DATA EXPORT BLOCKS
    # ═══════════════════════════════════════════════════════════════
    
    @staticmethod
    def export_events(*args, **kwargs) -> None:
        """BLOCKED: Event list export is disabled."""
        raise ExtractionBlockedError(
            "Event Export",
            "Exporting note events is disabled. "
            "Event data is only used for real-time visual guidance."
        )
    
    @staticmethod
    def export_timeline(*args, **kwargs) -> None:
        """BLOCKED: Timeline export is disabled."""
        raise ExtractionBlockedError(
            "Timeline Export",
            "Timeline data export is disabled. "
            "Timelines are rendered in real-time only."
        )
    
    @staticmethod
    def get_raw_events(*args, **kwargs) -> None:
        """BLOCKED: Raw event access is disabled."""
        raise ExtractionBlockedError(
            "Raw Event Access",
            "Direct access to raw event data is blocked. "
            "Use the visual instruction layer instead."
        )
    
    @staticmethod
    def copy_to_clipboard(*args, **kwargs) -> None:
        """BLOCKED: Clipboard copy is disabled."""
        raise ExtractionBlockedError(
            "Clipboard Copy",
            "Copying song data to clipboard is disabled. "
            "This prevents data extraction via copy/paste."
        )
    
    # ═══════════════════════════════════════════════════════════════
    # NOTATION EXPORT BLOCKS
    # ═══════════════════════════════════════════════════════════════
    
    @staticmethod
    def export_sheet_music(*args, **kwargs) -> None:
        """BLOCKED: Sheet music export is disabled."""
        raise ExtractionBlockedError(
            "Sheet Music Export",
            "Sheet music generation is permanently disabled. "
            "This app provides visual guidance, not printable notation."
        )
    
    @staticmethod
    def export_tablature(*args, **kwargs) -> None:
        """BLOCKED: Tablature export is disabled."""
        raise ExtractionBlockedError(
            "Tablature Export",
            "Tab export is permanently disabled. "
            "Fret positions are shown visually during practice only."
        )
    
    @staticmethod
    def export_chord_chart(*args, **kwargs) -> None:
        """BLOCKED: Chord chart export is disabled."""
        raise ExtractionBlockedError(
            "Chord Chart Export",
            "Chord chart export is disabled. "
            "Chords are displayed visually during practice."
        )
    
    @staticmethod
    def print_notation(*args, **kwargs) -> None:
        """BLOCKED: Printing notation is disabled."""
        raise ExtractionBlockedError(
            "Print Notation",
            "Printing any notation is disabled. "
            "This is an interactive practice tool, not a print publisher."
        )
    
    # ═══════════════════════════════════════════════════════════════
    # AUTOPLAY BLOCKS
    # ═══════════════════════════════════════════════════════════════
    
    @staticmethod
    def full_autoplay(song_id: str = None, *args, **kwargs) -> None:
        """BLOCKED: Full song autoplay without interaction is disabled."""
        raise AutoplayBlockedError(song_id)
    
    @staticmethod
    def batch_play(*args, **kwargs) -> None:
        """BLOCKED: Batch/playlist autoplay is disabled."""
        raise ExtractionBlockedError(
            "Batch Autoplay",
            "Automatic playlist playback is disabled. "
            "Each song requires user interaction."
        )
    
    # ═══════════════════════════════════════════════════════════════
    # UTILITY METHODS
    # ═══════════════════════════════════════════════════════════════
    
    @classmethod
    def get_blocked_features(cls) -> list:
        """Get list of all blocked features."""
        return [
            "Audio Export (WAV/MP3/OGG)",
            "MIDI Export",
            "MusicXML Export",
            "Event Data Export",
            "Timeline Export",
            "Raw Event Access",
            "Clipboard Copy",
            "Sheet Music Export",
            "Tablature Export",
            "Chord Chart Export",
            "Print Notation",
            "Full Song Autoplay",
            "Batch/Playlist Autoplay"
        ]
    
    @classmethod
    def get_allowed_features(cls) -> list:
        """Get list of allowed instructional features."""
        return [
            "Real-time synthesized playback",
            "Tempo adjustment (50%-150%)",
            "Section looping",
            "Visual note guidance",
            "Interactive practice mode",
            "Progress tracking",
            "Chord diagram display",
            "Fretboard visualization"
        ]
    
    @classmethod
    def generate_compliance_report(cls) -> str:
        """Generate a compliance report for publishers."""
        blocked = cls.get_blocked_features()
        allowed = cls.get_allowed_features()
        attempts = cls.get_blocked_attempts()
        
        report = [
            "=" * 60,
            "EXTRACTION BLOCKING COMPLIANCE REPORT",
            "=" * 60,
            "",
            "QUESTION: Can users extract song content?",
            "ANSWER: NO - All extraction paths are hard-blocked.",
            "",
            "BLOCKED FEATURES:",
        ]
        
        for feature in blocked:
            report.append(f"  ❌ {feature}")
        
        report.extend([
            "",
            "ALLOWED FEATURES (Instructional Only):",
        ])
        
        for feature in allowed:
            report.append(f"  ✅ {feature}")
        
        report.extend([
            "",
            f"BLOCKED ATTEMPTS LOGGED: {len(attempts)}",
            "",
            "=" * 60,
        ])
        
        return "\n".join(report)


# Create module-level blocked functions for easy import
export_audio = ExtractionBlocker.export_audio
export_wav = ExtractionBlocker.export_wav
export_mp3 = ExtractionBlocker.export_mp3
export_midi = ExtractionBlocker.export_midi
export_musicxml = ExtractionBlocker.export_musicxml
export_events = ExtractionBlocker.export_events
export_timeline = ExtractionBlocker.export_timeline
export_sheet_music = ExtractionBlocker.export_sheet_music
export_tablature = ExtractionBlocker.export_tablature
copy_to_clipboard = ExtractionBlocker.copy_to_clipboard
full_autoplay = ExtractionBlocker.full_autoplay


# Example usage and self-test
if __name__ == "__main__":
    print("Testing Extraction Blocker...")
    print()
    
    # Test each blocked feature
    test_functions = [
        ("Audio Export", ExtractionBlocker.export_audio),
        ("WAV Export", ExtractionBlocker.export_wav),
        ("MIDI Export", ExtractionBlocker.export_midi),
        ("Event Export", ExtractionBlocker.export_events),
        ("Clipboard Copy", ExtractionBlocker.copy_to_clipboard),
        ("Sheet Music", ExtractionBlocker.export_sheet_music),
        ("Autoplay", lambda: ExtractionBlocker.full_autoplay("test_song")),
    ]
    
    for name, func in test_functions:
        try:
            func()
            print(f"❌ FAIL: {name} was NOT blocked!")
        except (ExtractionBlockedError, AutoplayBlockedError) as e:
            print(f"✅ PASS: {name} correctly blocked")
    
    print()
    print(ExtractionBlocker.generate_compliance_report())

