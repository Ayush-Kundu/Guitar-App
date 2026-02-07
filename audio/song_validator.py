"""
Song Validator - Legal and compliance validation for songs.

This module provides validation to ensure songs comply with legal
requirements and instructional-mode restrictions.

NON-NEGOTIABLE RULES:
1. License must be valid (public_domain, licensed, original)
2. No printable notation (staff_position, sheet_music, tablature_text)
3. No excessive simultaneous notes (max 6 - guitar limitation)
4. Events must be performance-based (string/fret), not sheet music

This validator MUST pass before any song can be loaded.
"""

from typing import List, Tuple, Optional
from dataclasses import dataclass


class ValidationError(Exception):
    """Raised when song validation fails."""
    pass


class LicenseViolationError(ValidationError):
    """Raised when license status is invalid or missing."""
    pass


class NotationViolationError(ValidationError):
    """Raised when prohibited notation elements are detected."""
    pass


class SimultaneousNotesError(ValidationError):
    """Raised when too many simultaneous notes are detected."""
    pass


class MissingRequiredFieldError(ValidationError):
    """Raised when required performance fields are missing."""
    pass


@dataclass
class ValidationResult:
    """Result of song validation."""
    valid: bool
    song_id: str
    errors: List[str]
    warnings: List[str]
    
    def __bool__(self):
        return self.valid


class SongValidator:
    """
    Validates songs for legal compliance and instructional mode.
    
    This validator ensures:
    1. Valid license status (public_domain, licensed, original)
    2. No printable notation (staff positions, sheet music)
    3. Performance-based events only (string/fret required)
    4. Max 6 simultaneous notes (guitar physical limitation)
    
    Usage:
        SongValidator.validate(song)  # Raises on failure
        result = SongValidator.validate_safe(song)  # Returns ValidationResult
    """
    
    # Valid license statuses - NO EXCEPTIONS
    VALID_LICENSES = frozenset([
        "public_domain",      # Free to use (Beethoven, Bach, Traditional)
        "licensed",           # We have explicit permission
        "original",           # Created by us/for us
        "educational_use"     # Educational fair use (simplified arrangements)
    ])
    
    # Prohibited fields that indicate sheet music
    PROHIBITED_FIELDS = frozenset([
        "staff_position",
        "staff_line",
        "ledger_lines",
        "note_head",
        "stem_direction",
        "beam_group",
        "tablature_text",
        "sheet_notation",
        "clef",
        "key_signature_display",
        "time_signature_display",
        "bar_lines",
        "measure_number"
    ])
    
    # Required fields for performance-based events
    REQUIRED_EVENT_FIELDS = frozenset([
        "string",  # Which guitar string
        "fret"     # Which fret position
    ])
    
    # Guitar has 6 strings - physical maximum
    MAX_SIMULTANEOUS_NOTES = 6
    
    # Time window for simultaneous note detection (seconds)
    SIMULTANEOUS_WINDOW = 0.05  # 50ms
    
    @classmethod
    def validate(cls, song) -> None:
        """
        Validate a song. Raises ValidationError on any violation.
        
        Args:
            song: Song object to validate
            
        Raises:
            LicenseViolationError: Invalid or missing license
            NotationViolationError: Prohibited notation detected
            MissingRequiredFieldError: Missing string/fret fields
            SimultaneousNotesError: Too many simultaneous notes
        """
        result = cls.validate_safe(song)
        
        if not result.valid:
            # Raise the most severe error
            for error in result.errors:
                if "license" in error.lower():
                    raise LicenseViolationError(error)
                elif "notation" in error.lower() or "prohibited" in error.lower():
                    raise NotationViolationError(error)
                elif "required" in error.lower() or "missing" in error.lower():
                    raise MissingRequiredFieldError(error)
                elif "simultaneous" in error.lower():
                    raise SimultaneousNotesError(error)
            
            # Generic error if no specific type matched
            raise ValidationError(f"Validation failed: {'; '.join(result.errors)}")
    
    @classmethod
    def validate_safe(cls, song) -> ValidationResult:
        """
        Validate a song and return a result object.
        
        Args:
            song: Song object to validate
            
        Returns:
            ValidationResult with valid status, errors, and warnings
        """
        errors = []
        warnings = []
        song_id = getattr(song, 'song_id', 'unknown')
        
        # 1. Validate license status
        license_status = getattr(song, 'license_status', None)
        if license_status is None:
            errors.append(f"Missing license_status field - every song must declare license")
        elif license_status not in cls.VALID_LICENSES:
            errors.append(
                f"Invalid license '{license_status}' - must be one of: "
                f"{', '.join(sorted(cls.VALID_LICENSES))}"
            )
        
        # 2. Check for prohibited notation fields on song object
        for field in cls.PROHIBITED_FIELDS:
            if hasattr(song, field):
                errors.append(
                    f"Prohibited notation field '{field}' detected on song - "
                    f"this indicates sheet music representation"
                )
        
        # 3. Validate events
        events = getattr(song, 'events', [])
        if not events:
            warnings.append("Song has no events - may be incomplete")
        
        for i, event in enumerate(events):
            # Check required fields
            for required in cls.REQUIRED_EVENT_FIELDS:
                if not hasattr(event, required):
                    # Try dict access for dict-style events
                    if isinstance(event, dict):
                        if required not in event:
                            errors.append(
                                f"Event {i}: Missing required field '{required}' - "
                                f"events must be performance-based (string/fret)"
                            )
                    else:
                        errors.append(
                            f"Event {i}: Missing required field '{required}' - "
                            f"events must be performance-based (string/fret)"
                        )
            
            # Check for prohibited fields
            event_fields = event.keys() if isinstance(event, dict) else dir(event)
            for field in cls.PROHIBITED_FIELDS:
                if field in event_fields:
                    errors.append(
                        f"Event {i}: Prohibited notation field '{field}' - "
                        f"sheet music elements are not allowed"
                    )
        
        # 4. Check simultaneous notes
        max_simultaneous = cls._count_max_simultaneous(events)
        if max_simultaneous > cls.MAX_SIMULTANEOUS_NOTES:
            errors.append(
                f"Excessive simultaneous notes ({max_simultaneous}) - "
                f"max allowed is {cls.MAX_SIMULTANEOUS_NOTES} (guitar physical limit)"
            )
        
        # 5. Additional checks
        if hasattr(song, 'difficulties'):
            # Multi-difficulty song
            for diff_name, diff_data in song.difficulties.items():
                diff_events = getattr(diff_data, 'events', diff_data.get('events', []) if isinstance(diff_data, dict) else [])
                for i, event in enumerate(diff_events):
                    for required in cls.REQUIRED_EVENT_FIELDS:
                        has_field = (
                            hasattr(event, required) or 
                            (isinstance(event, dict) and required in event)
                        )
                        if not has_field:
                            errors.append(
                                f"Difficulty '{diff_name}' Event {i}: Missing '{required}'"
                            )
        
        return ValidationResult(
            valid=len(errors) == 0,
            song_id=song_id,
            errors=errors,
            warnings=warnings
        )
    
    @classmethod
    def _count_max_simultaneous(cls, events) -> int:
        """
        Count the maximum number of simultaneous notes.
        
        Args:
            events: List of note events
            
        Returns:
            Maximum simultaneous note count
        """
        if not events:
            return 0
        
        # Extract times
        times = []
        for e in events:
            if isinstance(e, dict):
                times.append(e.get('time', 0))
            else:
                times.append(getattr(e, 'time', 0))
        
        if not times:
            return 0
        
        # Sort and count simultaneous notes
        sorted_times = sorted(times)
        max_count = 1
        current_count = 1
        window_start = sorted_times[0]
        
        for time in sorted_times[1:]:
            if time - window_start <= cls.SIMULTANEOUS_WINDOW:
                current_count += 1
                max_count = max(max_count, current_count)
            else:
                window_start = time
                current_count = 1
        
        return max_count
    
    @classmethod
    def is_public_domain(cls, song) -> bool:
        """Check if a song is public domain."""
        return getattr(song, 'license_status', '') == 'public_domain'
    
    @classmethod
    def is_licensed(cls, song) -> bool:
        """Check if a song is properly licensed."""
        return getattr(song, 'license_status', '') in cls.VALID_LICENSES
    
    @classmethod
    def get_license_info(cls, song) -> dict:
        """Get license information for a song."""
        return {
            'status': getattr(song, 'license_status', 'unknown'),
            'valid': cls.is_licensed(song),
            'public_domain': cls.is_public_domain(song)
        }


def validate_song(song):
    """
    Convenience function to validate a song.
    
    Args:
        song: Song object to validate
        
    Raises:
        ValidationError: If validation fails
    """
    SongValidator.validate(song)


# Example usage
if __name__ == "__main__":
    from song_loader import Song, NoteEvent
    
    # Create a valid song
    valid_song = Song(
        song_id="test_001",
        title="Test Song",
        tempo=120,
        events=[
            NoteEvent(time=0.0, string=1, fret=0, duration=0.5),
            NoteEvent(time=0.5, string=2, fret=2, duration=0.5),
        ],
        license_status="public_domain"
    )
    
    # Validate
    result = SongValidator.validate_safe(valid_song)
    print(f"✅ Valid song test: {result.valid}")
    
    # Create an invalid song (missing license)
    invalid_song = Song(
        song_id="test_002",
        title="Invalid Song",
        tempo=120,
        events=[
            NoteEvent(time=0.0, string=1, fret=0, duration=0.5),
        ],
        license_status="unknown_license"
    )
    
    result = SongValidator.validate_safe(invalid_song)
    print(f"❌ Invalid license test: {result.valid}")
    print(f"   Errors: {result.errors}")

