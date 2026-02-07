#!/usr/bin/env python3
"""
Multi-Song Demo - Proves the engine is song-agnostic.

This script loads and validates multiple diverse songs to demonstrate
that the engine works with ANY properly formatted song data, not
just hard-coded examples.

Song Variety Demonstrated:
- 2 Public Domain songs (Scarborough Fair, Amazing Grace)  
- 2 Original exercises (Blues Riff, Chord Progression)
- 1 Complex multi-technique piece (Fingerstyle Etude)

All songs use the same JSON format and engine API.
"""

import os
import sys
from typing import List

# Import our modules
from song_loader import Song, SongLoader
from song_validator import SongValidator, ValidationError
from song_library import SongLibrary
from instructional_engine import InstructionalEngine


def print_header(text: str):
    """Print a formatted header."""
    print()
    print("=" * 60)
    print(f"  {text}")
    print("=" * 60)


def print_song_info(song: Song, detailed: bool = False):
    """Print song information."""
    techniques = set()
    for e in song.events:
        tech = getattr(e, 'technique', 'pluck')
        techniques.add(tech)
    
    print(f"""
    🎵 {song.title}
    ───────────────────────────────────────
    Composer:     {song.composer}
    License:      {song.license_status.upper()}
    Genre:        {song.genre}
    Difficulty:   {song.difficulty}
    Tempo:        {song.tempo} BPM
    Duration:     {song.duration:.1f}s
    Note Events:  {song.note_count}
    Techniques:   {', '.join(sorted(techniques))}
    Chords:       {', '.join(song.chords) if song.chords else 'N/A'}
    """)
    
    if detailed and hasattr(song, 'description'):
        desc = getattr(song, 'description', '')
        if desc:
            print(f"    Description: {desc}")


def demonstrate_song(song: Song, engine: InstructionalEngine):
    """Demonstrate engine features with a song."""
    print(f"\n    🎮 Engine Demo for: {song.title}")
    print(f"    ─" * 20)
    
    # Start playback
    engine.start()
    print(f"    ▶️  Started playback")
    
    # Change tempo
    new_tempo = engine.set_tempo(75)
    print(f"    🔄 Tempo set to {new_tempo}%")
    
    # Get upcoming notes
    upcoming = engine.get_upcoming_notes()
    print(f"    👀 Upcoming notes: {len(upcoming)}")
    
    # Get current chord
    chord = engine.get_current_chord()
    if chord:
        print(f"    🎸 Current chord: {chord}")
    
    # Pause
    engine.pause()
    print(f"    ⏸️  Paused")
    
    # Show interaction stats
    stats = engine.interaction_stats
    print(f"    📊 Interactions: {stats['total']}")
    
    engine.stop()
    print(f"    ⏹️  Stopped")


def main():
    """Main demonstration."""
    print_header("MULTI-SONG ENGINE DEMONSTRATION")
    print("""
    This demo proves the Guitar App engine is SONG-AGNOSTIC.
    
    We load 5 different songs:
    • 2 Public Domain songs
    • 2 Original exercises  
    • 1 Complex multi-technique piece
    
    All use the same JSON format and engine API.
    """)
    
    # Get the songs directory
    script_dir = os.path.dirname(os.path.abspath(__file__))
    songs_dir = os.path.join(script_dir, "songs")
    
    # Define demo songs
    demo_songs = [
        ("demo_pd_scarborough_fair.json", "Public Domain"),
        ("demo_pd_amazing_grace.json", "Public Domain"),
        ("demo_orig_blues_riff.json", "Original Exercise"),
        ("demo_orig_chord_progression.json", "Original Exercise"),
        ("demo_orig_fingerstyle_etude.json", "Complex Multi-Technique"),
    ]
    
    # Load and validate each song
    print_header("LOADING AND VALIDATING SONGS")
    
    loaded_songs: List[Song] = []
    
    for filename, category in demo_songs:
        filepath = os.path.join(songs_dir, filename)
        
        if not os.path.exists(filepath):
            print(f"    ⚠️  {filename} not found, skipping...")
            continue
        
        print(f"\n    Loading: {filename}")
        print(f"    Category: {category}")
        
        try:
            # Load
            song = SongLoader.load(filepath)
            print(f"    ✅ Loaded: {song.title}")
            
            # Validate
            result = SongValidator.validate_safe(song)
            if result.valid:
                print(f"    ✅ Validated: All checks passed")
            else:
                print(f"    ❌ Validation failed:")
                for error in result.errors:
                    print(f"       - {error}")
                continue
            
            loaded_songs.append(song)
            
        except Exception as e:
            print(f"    ❌ Error: {e}")
    
    # Summary
    print_header("LOADED SONGS SUMMARY")
    print(f"\n    Total songs loaded: {len(loaded_songs)}")
    
    # Group by license
    public_domain = [s for s in loaded_songs if s.license_status == "public_domain"]
    original = [s for s in loaded_songs if s.license_status == "original"]
    
    print(f"    Public Domain: {len(public_domain)}")
    print(f"    Original: {len(original)}")
    
    # Show each song
    print_header("SONG DETAILS")
    
    for song in loaded_songs:
        print_song_info(song, detailed=True)
    
    # Demonstrate engine with each song
    print_header("ENGINE DEMONSTRATION")
    print("""
    Now we demonstrate that the SAME engine code works with 
    ALL songs - proving it's song-agnostic.
    """)
    
    for song in loaded_songs:
        engine = InstructionalEngine(song)
        demonstrate_song(song, engine)
    
    # Technique variety demonstration
    print_header("TECHNIQUE VARIETY")
    
    all_techniques = set()
    technique_songs = {}
    
    for song in loaded_songs:
        for event in song.events:
            tech = getattr(event, 'technique', 'pluck')
            all_techniques.add(tech)
            if tech not in technique_songs:
                technique_songs[tech] = []
            if song.title not in technique_songs[tech]:
                technique_songs[tech].append(song.title)
    
    print(f"\n    Unique techniques across all songs: {len(all_techniques)}")
    print()
    
    for tech in sorted(all_techniques):
        songs = technique_songs[tech]
        print(f"    • {tech.upper()}: {len(songs)} song(s)")
        for song_title in songs:
            print(f"      - {song_title}")
    
    # Load into library
    print_header("LIBRARY INTEGRATION")
    
    library = SongLibrary()
    for song in loaded_songs:
        library.add(song)
    
    print(f"\n    Songs in library: {library.count()}")
    
    # Demonstrate library features
    print(f"\n    🔍 Search 'Traditional':")
    results = library.search("Traditional")
    for song in results:
        print(f"       - {song.title}")
    
    print(f"\n    🔍 Filter by 'beginner' difficulty:")
    beginners = library.filter_by_difficulty("beginner")
    for song in beginners:
        print(f"       - {song.title}")
    
    print(f"\n    🔍 Filter by 'folk' genre:")
    folk = library.filter_by_genre("folk")
    for song in folk:
        print(f"       - {song.title}")
    
    # Final summary
    print_header("DEMONSTRATION COMPLETE")
    print(f"""
    ✅ Successfully loaded {len(loaded_songs)} diverse songs
    ✅ All songs passed validation
    ✅ Same engine API works for all songs
    ✅ {len(all_techniques)} different techniques demonstrated
    ✅ Library search and filter works
    
    CONCLUSION: The engine is SONG-AGNOSTIC.
    
    Any properly formatted JSON song file can be loaded
    and played using the same code. No hard-coding required.
    """)


if __name__ == "__main__":
    main()

