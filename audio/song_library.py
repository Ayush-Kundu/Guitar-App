"""
Song Library - Manages a collection of songs.
Tiny but critical component for supporting unlimited songs.

Now supports:
- Genre filtering
- User preference-based recommendations
- Manifest-based loading
- 77+ songs across all levels and genres
"""

import os
import glob
import json
from typing import Dict, List, Optional, Set
from song_loader import Song, SongLoader


class SongLibrary:
    """
    A library that manages multiple songs.
    
    Usage:
        library = SongLibrary()
        library.load_from_manifest("songs/manifest.json")
        
        # Get songs for a beginner who likes rock and pop
        songs = library.get_songs_for_user("beginner", ["rock", "pop"])
        
        # Get all jazz songs
        jazz_songs = library.filter_by_genre("jazz")
    """
    
    # Level hierarchy for progressive access
    LEVEL_ORDER = ["novice", "beginner", "elementary", "intermediate", "proficient", "advanced", "expert"]
    
    # Genre categories
    GENRES = ["rock", "pop", "classical", "folk", "blues", "country", "jazz", "metal"]
    
    def __init__(self):
        self.songs: Dict[str, Song] = {}
        self.manifest: Optional[dict] = None
        self._songs_dir: Optional[str] = None
    
    def add(self, song: Song) -> None:
        """
        Add a song to the library.
        
        Args:
            song: Song object to add
        """
        self.songs[song.song_id] = song
    
    def get(self, song_id: str) -> Optional[Song]:
        """
        Get a song by its ID.
        
        Args:
            song_id: The unique identifier of the song
            
        Returns:
            Song object if found, None otherwise
        """
        return self.songs.get(song_id)
    
    def remove(self, song_id: str) -> bool:
        """
        Remove a song from the library.
        
        Args:
            song_id: The unique identifier of the song
            
        Returns:
            True if removed, False if not found
        """
        if song_id in self.songs:
            del self.songs[song_id]
            return True
        return False
    
    def list_all(self) -> List[Song]:
        """
        Get all songs in the library.
        
        Returns:
            List of all Song objects
        """
        return list(self.songs.values())
    
    def list_ids(self) -> List[str]:
        """
        Get all song IDs in the library.
        
        Returns:
            List of song IDs
        """
        return list(self.songs.keys())
    
    def count(self) -> int:
        """
        Get the number of songs in the library.
        
        Returns:
            Number of songs
        """
        return len(self.songs)
    
    def filter_by_difficulty(self, difficulty: str) -> List[Song]:
        """
        Get songs filtered by difficulty level.
        
        Args:
            difficulty: Difficulty level (beginner, intermediate, advanced, expert)
            
        Returns:
            List of matching songs
        """
        return [s for s in self.songs.values() if s.difficulty == difficulty]
    
    def filter_by_license(self, license_status: str) -> List[Song]:
        """
        Get songs filtered by license status.
        
        Args:
            license_status: License type (public_domain, original, licensed)
            
        Returns:
            List of matching songs
        """
        return [s for s in self.songs.values() if s.license_status == license_status]
    
    def filter_by_genre(self, genre: str) -> List[Song]:
        """
        Get songs filtered by genre.
        
        Args:
            genre: Music genre (rock, pop, classical, folk, blues, country, jazz, metal)
            
        Returns:
            List of matching songs
        """
        return [s for s in self.songs.values() 
                if hasattr(s, 'genre') and s.genre == genre]
    
    def filter_by_genres(self, genres: List[str]) -> List[Song]:
        """
        Get songs matching any of the specified genres.
        
        Args:
            genres: List of genre names
            
        Returns:
            List of matching songs
        """
        genre_set = set(g.lower() for g in genres)
        return [s for s in self.songs.values() 
                if hasattr(s, 'genre') and s.genre.lower() in genre_set]
    
    def get_available_levels(self, user_level: str) -> List[str]:
        """
        Get all levels available to a user based on their current level.
        
        Args:
            user_level: User's current skill level
            
        Returns:
            List of accessible level names
        """
        try:
            level_idx = self.LEVEL_ORDER.index(user_level.lower())
            return self.LEVEL_ORDER[:level_idx + 1]
        except ValueError:
            # Default to beginner if level not found
            return ["novice", "beginner"]
    
    def get_songs_for_user(self, user_level: str, preferred_genres: List[str] = None) -> List[Song]:
        """
        Get songs appropriate for a user based on their level and genre preferences.
        
        Args:
            user_level: User's current skill level (novice, beginner, etc.)
            preferred_genres: List of preferred genre names (optional)
            
        Returns:
            List of appropriate songs, sorted by difficulty
        """
        available_levels = self.get_available_levels(user_level)
        
        # Filter by level first
        level_songs = [s for s in self.songs.values() 
                       if s.difficulty.lower() in available_levels]
        
        # Then filter by genre if specified
        if preferred_genres:
            genre_set = set(g.lower() for g in preferred_genres)
            level_songs = [s for s in level_songs 
                          if hasattr(s, 'genre') and s.genre.lower() in genre_set]
        
        # Sort by difficulty (using level order)
        def level_sort_key(song):
            try:
                return self.LEVEL_ORDER.index(song.difficulty.lower())
            except ValueError:
                return 100
        
        return sorted(level_songs, key=level_sort_key)
    
    def get_recommended_songs(self, user_level: str, preferred_genres: List[str], 
                               limit: int = 10) -> List[Song]:
        """
        Get recommended songs for a user, prioritizing their preferred genres
        but including a mix.
        
        Args:
            user_level: User's current skill level
            preferred_genres: User's preferred genres
            limit: Maximum number of recommendations
            
        Returns:
            List of recommended songs
        """
        available_levels = self.get_available_levels(user_level)
        
        # Get songs at user's current level and one below
        current_idx = len(available_levels) - 1
        target_levels = [available_levels[current_idx]]
        if current_idx > 0:
            target_levels.append(available_levels[current_idx - 1])
        
        current_songs = [s for s in self.songs.values() 
                         if s.difficulty.lower() in target_levels]
        
        # Split into preferred and other genres
        genre_set = set(g.lower() for g in preferred_genres)
        preferred = []
        others = []
        
        for song in current_songs:
            genre = getattr(song, 'genre', '').lower()
            if genre in genre_set:
                preferred.append(song)
            else:
                others.append(song)
        
        # Mix: 70% preferred, 30% discovery
        preferred_count = min(len(preferred), int(limit * 0.7))
        other_count = min(len(others), limit - preferred_count)
        
        recommendations = preferred[:preferred_count] + others[:other_count]
        
        return recommendations[:limit]
    
    def search(self, query: str) -> List[Song]:
        """
        Search songs by title or composer.
        
        Args:
            query: Search string
            
        Returns:
            List of matching songs
        """
        query_lower = query.lower()
        return [
            s for s in self.songs.values()
            if query_lower in s.title.lower() or query_lower in s.composer.lower()
        ]
    
    def load_directory(self, directory: str, pattern: str = "*.json") -> int:
        """
        Load all song files from a directory.
        
        Args:
            directory: Path to directory containing song JSON files
            pattern: Glob pattern for files (default: *.json)
            
        Returns:
            Number of songs loaded
        """
        self._songs_dir = directory
        count = 0
        search_pattern = os.path.join(directory, pattern)
        
        for filepath in glob.glob(search_pattern):
            if "manifest" in filepath:
                continue  # Skip manifest file
            try:
                song = SongLoader.load(filepath)
                self.add(song)
                count += 1
            except Exception as e:
                print(f"⚠️  Failed to load {filepath}: {e}")
        
        return count
    
    def load_from_manifest(self, manifest_path: str) -> int:
        """
        Load songs using a manifest file for efficient loading.
        
        Args:
            manifest_path: Path to the manifest.json file
            
        Returns:
            Number of songs loaded
        """
        songs_dir = os.path.dirname(manifest_path)
        self._songs_dir = songs_dir
        
        with open(manifest_path, 'r') as f:
            self.manifest = json.load(f)
        
        count = 0
        for song_entry in self.manifest.get("songs", []):
            filepath = os.path.join(songs_dir, song_entry["file"])
            try:
                song = SongLoader.load(filepath)
                # Add genre from manifest if not in song file
                if not hasattr(song, 'genre'):
                    song.genre = song_entry.get("genre", "unknown")
                self.add(song)
                count += 1
            except Exception as e:
                print(f"⚠️  Failed to load {song_entry['file']}: {e}")
        
        return count
    
    def get_manifest_stats(self) -> dict:
        """
        Get stats from the loaded manifest.
        
        Returns:
            Manifest statistics or empty dict if no manifest loaded
        """
        if not self.manifest:
            return {}
        
        return {
            "version": self.manifest.get("version", "unknown"),
            "total_songs": self.manifest.get("total_songs", 0),
            "by_level": self.manifest.get("by_level", {}),
            "by_genre": self.manifest.get("by_genre", {})
        }
    
    def get_stats(self) -> dict:
        """
        Get statistics about the library.
        
        Returns:
            Dictionary with library statistics
        """
        if not self.songs:
            return {
                "total_songs": 0,
                "total_notes": 0,
                "total_duration": 0,
                "by_difficulty": {},
                "by_license": {}
            }
        
        by_difficulty = {}
        by_license = {}
        total_notes = 0
        total_duration = 0
        
        for song in self.songs.values():
            # Count by difficulty
            by_difficulty[song.difficulty] = by_difficulty.get(song.difficulty, 0) + 1
            
            # Count by license
            by_license[song.license_status] = by_license.get(song.license_status, 0) + 1
            
            # Totals
            total_notes += song.note_count
            total_duration += song.duration
        
        return {
            "total_songs": len(self.songs),
            "total_notes": total_notes,
            "total_duration": total_duration,
            "by_difficulty": by_difficulty,
            "by_license": by_license
        }
    
    def __len__(self) -> int:
        return len(self.songs)
    
    def __contains__(self, song_id: str) -> bool:
        return song_id in self.songs
    
    def __iter__(self):
        return iter(self.songs.values())


# Example usage
if __name__ == "__main__":
    # Create library
    library = SongLibrary()
    
    # Load songs from manifest (preferred method)
    songs_dir = os.path.join(os.path.dirname(__file__), "songs")
    manifest_path = os.path.join(songs_dir, "manifest.json")
    
    if os.path.exists(manifest_path):
        count = library.load_from_manifest(manifest_path)
        print(f"📚 Loaded {count} songs from manifest")
        
        # Show manifest stats
        manifest_stats = library.get_manifest_stats()
        print(f"\n📋 Manifest Info:")
        print(f"   Version: {manifest_stats['version']}")
        print(f"   Total songs: {manifest_stats['total_songs']}")
        print(f"   By level: {manifest_stats['by_level']}")
        print(f"   By genre: {manifest_stats['by_genre']}")
    elif os.path.exists(songs_dir):
        # Fallback to directory loading
        count = library.load_directory(songs_dir)
        print(f"📚 Loaded {count} songs from {songs_dir}")
    
    # Show library stats
    stats = library.get_stats()
    print(f"\n📊 Library Stats:")
    print(f"   Total songs: {stats['total_songs']}")
    print(f"   Total notes: {stats['total_notes']}")
    print(f"   Total duration: {stats['total_duration']:.1f}s")
    print(f"   By difficulty: {stats['by_difficulty']}")
    print(f"   By license: {stats['by_license']}")
    
    # Demo: Get songs for a beginner who likes rock and pop
    print(f"\n🎸 Songs for a BEGINNER who likes ROCK and POP:")
    user_songs = library.get_songs_for_user("beginner", ["rock", "pop"])
    for song in user_songs[:10]:  # Show first 10
        genre = getattr(song, 'genre', 'unknown')
        print(f"   [{song.difficulty}] {song.title} ({genre})")
    
    # Demo: Get songs for an intermediate player who likes jazz
    print(f"\n🎷 Songs for an INTERMEDIATE player who likes JAZZ:")
    jazz_songs = library.get_songs_for_user("intermediate", ["jazz"])
    for song in jazz_songs:
        genre = getattr(song, 'genre', 'unknown')
        print(f"   [{song.difficulty}] {song.title} ({genre})")
    
    # Demo: Get recommended songs
    print(f"\n⭐ Recommended songs for a BEGINNER who likes FOLK and BLUES:")
    recommendations = library.get_recommended_songs("beginner", ["folk", "blues"], limit=5)
    for song in recommendations:
        genre = getattr(song, 'genre', 'unknown')
        print(f"   {song.title} by {song.composer} ({genre})")
    
    # Demo: Filter by genre
    print(f"\n🎹 All CLASSICAL songs:")
    classical_songs = library.filter_by_genre("classical")
    for song in classical_songs:
        print(f"   [{song.difficulty}] {song.title} by {song.composer}")
    
    # Demo: Search
    print(f"\n🔍 Search for 'Beatles':")
    beatles_songs = library.search("beatles")
    for song in beatles_songs:
        print(f"   {song.title} by {song.composer}")

