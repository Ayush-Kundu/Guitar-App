"""
Multi-Difficulty Song Loader

This module provides support for loading songs with multiple difficulty levels.
Publishers LOVE this feature because it demonstrates:

1. EDUCATIONAL TRANSFORMATION - We're teaching, not distributing
2. NO MASTER RECORDING - Each level is a simplified interpretation
3. YOUSICIAN/SIMPLY GUITAR MODEL - Industry-standard approach

Each difficulty level is a SEPARATE interpretation:
- easy.json    → Simplified notes, root notes only
- medium.json  → Closer to original, basic chords
- full.json    → Full transcription with all techniques

This proves we are an educational tool, not a music distribution platform.
"""

import os
import glob
import json
from dataclasses import dataclass, field
from typing import Dict, List, Optional, Tuple

from song_loader import Song, SongLoader
from song_validator import SongValidator, ValidationResult


@dataclass
class DifficultyLevel:
    """Represents a single difficulty level of a song."""
    difficulty: str  # easy, medium, full/advanced
    song: Song
    note_count: int
    techniques: List[str]
    simplification_level: str
    notes_removed_percent: float
    
    @property
    def duration(self) -> float:
        return self.song.duration


@dataclass
class MultiDifficultySong:
    """
    A song with multiple difficulty levels.
    
    This structure is crucial for licensing because it shows:
    - Educational transformation at each level
    - Progressive learning path
    - Not a 1:1 copy of the original
    """
    licensed_song_id: str
    title: str
    composer: str
    difficulties: Dict[str, DifficultyLevel]
    
    @property
    def available_difficulties(self) -> List[str]:
        """Get list of available difficulty levels."""
        return sorted(self.difficulties.keys())
    
    @property
    def easiest(self) -> Optional[DifficultyLevel]:
        """Get the easiest difficulty level."""
        order = ["easy", "beginner", "novice", "medium", "intermediate", "hard", "advanced", "full", "expert"]
        for level in order:
            if level in self.difficulties:
                return self.difficulties[level]
        return list(self.difficulties.values())[0] if self.difficulties else None
    
    @property
    def hardest(self) -> Optional[DifficultyLevel]:
        """Get the hardest difficulty level."""
        order = ["expert", "full", "advanced", "hard", "intermediate", "medium", "novice", "beginner", "easy"]
        for level in order:
            if level in self.difficulties:
                return self.difficulties[level]
        return list(self.difficulties.values())[-1] if self.difficulties else None
    
    def get_difficulty(self, level: str) -> Optional[DifficultyLevel]:
        """Get a specific difficulty level."""
        return self.difficulties.get(level)
    
    def get_educational_summary(self) -> Dict:
        """
        Generate a summary showing educational transformation.
        This is CRITICAL for publisher licensing discussions.
        """
        if not self.difficulties:
            return {}
        
        easiest = self.easiest
        hardest = self.hardest
        
        return {
            "song_title": self.title,
            "composer": self.composer,
            "licensed_song_id": self.licensed_song_id,
            "difficulty_levels": len(self.difficulties),
            "available_levels": self.available_difficulties,
            "easiest_level": {
                "name": easiest.difficulty if easiest else None,
                "note_count": easiest.note_count if easiest else 0,
                "techniques": easiest.techniques if easiest else [],
                "simplification": easiest.simplification_level if easiest else None,
                "notes_removed_percent": easiest.notes_removed_percent if easiest else 0
            },
            "hardest_level": {
                "name": hardest.difficulty if hardest else None,
                "note_count": hardest.note_count if hardest else 0,
                "techniques": hardest.techniques if hardest else [],
                "simplification": hardest.simplification_level if hardest else None,
                "notes_removed_percent": hardest.notes_removed_percent if hardest else 0
            },
            "progressive_learning": True,
            "educational_transformation": True,
            "not_master_recording": True
        }


class MultiDifficultyLoader:
    """
    Loads songs with multiple difficulty levels.
    
    Supports two formats:
    1. Directory-based: songs/song_name/easy.json, medium.json, full.json
    2. Prefix-based: songs/song_name_easy.json, song_name_medium.json, etc.
    """
    
    # Standard difficulty suffixes
    DIFFICULTY_SUFFIXES = ["easy", "medium", "hard", "advanced", "full", "beginner", "intermediate", "expert"]
    
    @classmethod
    def load_from_directory(cls, directory: str) -> MultiDifficultySong:
        """
        Load all difficulty levels from a directory.
        
        Args:
            directory: Path to directory containing difficulty JSON files
            
        Returns:
            MultiDifficultySong with all available difficulty levels
        """
        difficulties = {}
        licensed_song_id = None
        title = None
        composer = None
        
        # Find all JSON files in the directory
        json_files = glob.glob(os.path.join(directory, "*.json"))
        
        for filepath in json_files:
            try:
                song = SongLoader.load(filepath)
                
                # Validate
                result = SongValidator.validate_safe(song)
                if not result.valid:
                    print(f"⚠️  Skipping {filepath}: Validation failed")
                    continue
                
                # Extract difficulty from filename or song data
                filename = os.path.basename(filepath)
                name_without_ext = os.path.splitext(filename)[0]
                
                # Get difficulty from song or filename
                difficulty = getattr(song, 'difficulty', name_without_ext)
                
                # Normalize difficulty names
                difficulty = difficulty.lower()
                if difficulty == "advanced":
                    difficulty = "full"
                
                # Get educational transformation metadata
                edu_transform = {}
                if hasattr(song, 'educational_transformation'):
                    edu_transform = song.educational_transformation if isinstance(song.educational_transformation, dict) else {}
                
                # Extract techniques
                techniques = set()
                for event in song.events:
                    tech = getattr(event, 'technique', 'pluck')
                    techniques.add(tech)
                
                # Create difficulty level
                diff_level = DifficultyLevel(
                    difficulty=difficulty,
                    song=song,
                    note_count=song.note_count,
                    techniques=sorted(list(techniques)),
                    simplification_level=edu_transform.get('simplification_level', 'unknown'),
                    notes_removed_percent=edu_transform.get('notes_removed_percent', 0)
                )
                
                difficulties[difficulty] = diff_level
                
                # Get common metadata from first song
                if licensed_song_id is None:
                    licensed_song_id = getattr(song, 'licensed_song_id', song.song_id)
                    title = song.title
                    composer = song.composer
                    
            except Exception as e:
                print(f"⚠️  Error loading {filepath}: {e}")
        
        if not difficulties:
            raise ValueError(f"No valid difficulty levels found in {directory}")
        
        return MultiDifficultySong(
            licensed_song_id=licensed_song_id or "unknown",
            title=title or "Unknown Song",
            composer=composer or "Unknown",
            difficulties=difficulties
        )
    
    @classmethod
    def load_by_prefix(cls, directory: str, song_prefix: str) -> MultiDifficultySong:
        """
        Load all difficulty levels matching a prefix.
        
        Args:
            directory: Path to directory containing song files
            song_prefix: Prefix for song files (e.g., "smoke_on_water")
            
        Returns:
            MultiDifficultySong with all matching difficulty levels
        """
        difficulties = {}
        licensed_song_id = None
        title = None
        composer = None
        
        # Find all matching files
        pattern = os.path.join(directory, f"{song_prefix}*.json")
        json_files = glob.glob(pattern)
        
        for filepath in json_files:
            try:
                song = SongLoader.load(filepath)
                
                # Validate
                result = SongValidator.validate_safe(song)
                if not result.valid:
                    print(f"⚠️  Skipping {filepath}: Validation failed")
                    continue
                
                # Extract difficulty from filename
                filename = os.path.basename(filepath)
                name_without_ext = os.path.splitext(filename)[0]
                
                # Try to extract difficulty suffix
                difficulty = None
                for suffix in cls.DIFFICULTY_SUFFIXES:
                    if name_without_ext.endswith(f"_{suffix}"):
                        difficulty = suffix
                        break
                
                if difficulty is None:
                    difficulty = getattr(song, 'difficulty', 'unknown')
                
                # Get educational transformation metadata
                edu_transform = {}
                if hasattr(song, 'educational_transformation'):
                    edu_transform = song.educational_transformation if isinstance(song.educational_transformation, dict) else {}
                
                # Extract techniques
                techniques = set()
                for event in song.events:
                    tech = getattr(event, 'technique', 'pluck')
                    techniques.add(tech)
                
                # Create difficulty level
                diff_level = DifficultyLevel(
                    difficulty=difficulty,
                    song=song,
                    note_count=song.note_count,
                    techniques=sorted(list(techniques)),
                    simplification_level=edu_transform.get('simplification_level', 'unknown'),
                    notes_removed_percent=edu_transform.get('notes_removed_percent', 0)
                )
                
                difficulties[difficulty] = diff_level
                
                # Get common metadata
                if licensed_song_id is None:
                    licensed_song_id = getattr(song, 'licensed_song_id', song.song_id)
                    title = song.title
                    composer = song.composer
                    
            except Exception as e:
                print(f"⚠️  Error loading {filepath}: {e}")
        
        if not difficulties:
            raise ValueError(f"No valid difficulty levels found for prefix '{song_prefix}' in {directory}")
        
        return MultiDifficultySong(
            licensed_song_id=licensed_song_id or "unknown",
            title=title or "Unknown Song",
            composer=composer or "Unknown",
            difficulties=difficulties
        )


def print_educational_summary(multi_song: MultiDifficultySong):
    """Print a formatted educational summary for publisher review."""
    summary = multi_song.get_educational_summary()
    
    print(f"""
╔══════════════════════════════════════════════════════════════╗
║           EDUCATIONAL TRANSFORMATION SUMMARY                  ║
╚══════════════════════════════════════════════════════════════╝

🎵 Song: {summary['song_title']}
🎸 Composer: {summary['composer']}
🔑 Licensed ID: {summary['licensed_song_id']}

📚 DIFFICULTY LEVELS: {summary['difficulty_levels']}
   Available: {', '.join(summary['available_levels'])}

┌─────────────────────────────────────────────────────────────┐
│ EASIEST LEVEL: {summary['easiest_level']['name'].upper() if summary['easiest_level']['name'] else 'N/A':^43} │
├─────────────────────────────────────────────────────────────┤
│ Notes:          {summary['easiest_level']['note_count']:>40} │
│ Techniques:     {', '.join(summary['easiest_level']['techniques'] or ['N/A']):>40} │
│ Simplification: {summary['easiest_level']['simplification'] or 'N/A':>40} │
│ Notes Removed:  {summary['easiest_level']['notes_removed_percent']:>39}% │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ HARDEST LEVEL: {summary['hardest_level']['name'].upper() if summary['hardest_level']['name'] else 'N/A':^43} │
├─────────────────────────────────────────────────────────────┤
│ Notes:          {summary['hardest_level']['note_count']:>40} │
│ Techniques:     {', '.join(summary['hardest_level']['techniques'] or ['N/A']):>40} │
│ Simplification: {summary['hardest_level']['simplification'] or 'N/A':>40} │
│ Notes Removed:  {summary['hardest_level']['notes_removed_percent']:>39}% │
└─────────────────────────────────────────────────────────────┘

✅ Progressive Learning: {summary['progressive_learning']}
✅ Educational Transformation: {summary['educational_transformation']}
✅ Not a Master Recording: {summary['not_master_recording']}

⚖️  LEGAL STATUS:
   This is an EDUCATIONAL INTERPRETATION, not a copy.
   Each difficulty level represents a teaching tool.
   Users learn to PLAY, they don't RECEIVE the song.
""")


# Demo
if __name__ == "__main__":
    import os
    
    print("=" * 60)
    print("  MULTI-DIFFICULTY SONG DEMO")
    print("=" * 60)
    
    # Get the multi_difficulty directory
    script_dir = os.path.dirname(os.path.abspath(__file__))
    multi_diff_dir = os.path.join(script_dir, "songs", "multi_difficulty")
    
    if os.path.exists(multi_diff_dir):
        print(f"\n📁 Loading from: {multi_diff_dir}")
        
        try:
            # Load the multi-difficulty song
            multi_song = MultiDifficultyLoader.load_from_directory(multi_diff_dir)
            
            print(f"\n✅ Loaded: {multi_song.title}")
            print(f"   Composer: {multi_song.composer}")
            print(f"   Difficulties: {multi_song.available_difficulties}")
            
            # Show each difficulty
            print("\n📊 DIFFICULTY COMPARISON:")
            print("-" * 60)
            print(f"{'Level':<12} {'Notes':>8} {'Duration':>10} {'Techniques':<30}")
            print("-" * 60)
            
            for level_name in ["easy", "medium", "full", "advanced"]:
                diff = multi_song.get_difficulty(level_name)
                if diff:
                    techs = ', '.join(diff.techniques[:3])
                    if len(diff.techniques) > 3:
                        techs += f" (+{len(diff.techniques)-3})"
                    print(f"{diff.difficulty:<12} {diff.note_count:>8} {diff.duration:>9.1f}s {techs:<30}")
            
            # Print full educational summary
            print_educational_summary(multi_song)
            
        except Exception as e:
            print(f"❌ Error: {e}")
    else:
        print(f"\n⚠️  Directory not found: {multi_diff_dir}")
        print("   Run this after creating the multi-difficulty song files.")

