#!/usr/bin/env python3
"""
Guitar App Song Playback System - Main Entry Point

This script demonstrates the complete song playback system:
1. Loading all 77+ songs from the library
2. Filtering songs by user level and genre preferences
3. Playing songs with the synthesizer
4. Interactive controls

Usage:
    python main.py

The system loads songs from the 'songs/' directory using the manifest.
Songs are organized by difficulty level and genre, matching the user's
preferences from the frontend app.
"""

import os
import sys
from typing import List

# Import local modules
from song_library import SongLibrary
from song_loader import Song, SongLoader


def display_banner():
    """Display the app banner."""
    print("""
╔═══════════════════════════════════════════════════════════════╗
║                    🎸 GUITAR APP                              ║
║               Song Playback Engine v1.0                       ║
╚═══════════════════════════════════════════════════════════════╝
    """)


def display_song_list(songs: List[Song], title: str = "Songs"):
    """Display a formatted list of songs."""
    print(f"\n🎵 {title} ({len(songs)} songs)")
    print("─" * 60)
    for i, song in enumerate(songs, 1):
        genre = song.genre if hasattr(song, 'genre') else 'unknown'
        chords = ', '.join(song.chords[:4]) if song.chords else 'N/A'
        if len(song.chords) > 4:
            chords += '...'
        print(f"  {i:2}. [{song.difficulty:12}] {song.title[:30]:30} ({genre})")
        print(f"      └─ by {song.composer[:25]:25} | {song.tempo} BPM | Chords: {chords}")
    print("─" * 60)


def interactive_mode(library: SongLibrary):
    """Run interactive song selection and playback."""
    print("\n🎮 Interactive Mode")
    print("=" * 60)
    
    # Get user preferences
    print("\n📊 What's your skill level?")
    for i, level in enumerate(SongLibrary.LEVEL_ORDER, 1):
        count = len(library.filter_by_difficulty(level))
        print(f"  {i}. {level.title()} ({count} songs)")
    
    try:
        level_choice = int(input("\nEnter number (1-7): ")) - 1
        user_level = SongLibrary.LEVEL_ORDER[level_choice]
    except (ValueError, IndexError):
        user_level = "beginner"
        print(f"  Using default: {user_level}")
    
    # Get genre preferences
    print("\n🎸 What genres do you like? (comma-separated)")
    print(f"   Options: {', '.join(SongLibrary.GENRES)}")
    genre_input = input("Enter genres: ").strip()
    
    if genre_input:
        user_genres = [g.strip().lower() for g in genre_input.split(',')]
    else:
        user_genres = ["rock", "pop"]  # Default
        print(f"  Using defaults: {user_genres}")
    
    # Get appropriate songs
    user_songs = library.get_songs_for_user(user_level, user_genres)
    
    if not user_songs:
        print(f"\n⚠️  No songs found for {user_level} level with genres {user_genres}")
        print("   Showing all songs at your level...")
        user_songs = library.filter_by_difficulty(user_level)
    
    display_song_list(user_songs, f"Songs for {user_level.title()} ({', '.join(user_genres)})")
    
    # Song selection
    try:
        song_choice = int(input("\nEnter song number to view details (0 to exit): "))
        if song_choice == 0:
            return
        
        selected_song = user_songs[song_choice - 1]
        display_song_details(selected_song)
        
    except (ValueError, IndexError):
        print("Invalid selection")


def display_song_details(song: Song):
    """Display detailed information about a song."""
    print(f"""
╔═══════════════════════════════════════════════════════════════╗
  🎵 {song.title}
  👤 {song.composer}
╠═══════════════════════════════════════════════════════════════╣
  Level:      {song.difficulty.title()}
  Genre:      {song.genre.title() if hasattr(song, 'genre') else 'Unknown'}
  Tempo:      {song.tempo} BPM
  Time Sig:   {song.time_signature}
  Chords:     {', '.join(song.chords) if song.chords else 'N/A'}
  Duration:   {song.original_duration or f'{song.duration:.1f}s'}
  Learn Time: {song.learning_time or 'Not specified'}
  
  Note Count: {song.note_count}
  Song ID:    {song.song_id}
╚═══════════════════════════════════════════════════════════════╝
    """)


def demo_mode(library: SongLibrary):
    """Run demo showcasing various library features."""
    print("\n🎯 Demo Mode - Showcasing Library Features")
    print("=" * 60)
    
    # 1. Show all genres
    print("\n1️⃣  Songs by Genre:")
    for genre in SongLibrary.GENRES:
        genre_songs = library.filter_by_genre(genre)
        if genre_songs:
            print(f"   • {genre.title()}: {len(genre_songs)} songs")
    
    # 2. Show all levels
    print("\n2️⃣  Songs by Level:")
    for level in SongLibrary.LEVEL_ORDER:
        level_songs = library.filter_by_difficulty(level)
        if level_songs:
            print(f"   • {level.title()}: {len(level_songs)} songs")
    
    # 3. Demo user scenarios
    print("\n3️⃣  User Scenarios:")
    
    # Beginner rock fan
    rock_songs = library.get_songs_for_user("beginner", ["rock"])
    print(f"\n   🤘 Beginner Rock Fan: {len(rock_songs)} songs available")
    for song in rock_songs[:3]:
        print(f"      • {song.title} ({song.difficulty})")
    
    # Intermediate jazz enthusiast
    jazz_songs = library.get_songs_for_user("intermediate", ["jazz"])
    print(f"\n   🎷 Intermediate Jazz Enthusiast: {len(jazz_songs)} songs available")
    for song in jazz_songs[:3]:
        print(f"      • {song.title} ({song.difficulty})")
    
    # Expert classical player
    classical_songs = library.get_songs_for_user("expert", ["classical"])
    print(f"\n   🎻 Expert Classical Player: {len(classical_songs)} songs available")
    for song in classical_songs[:3]:
        print(f"      • {song.title} ({song.difficulty})")
    
    # 4. Search demo
    print("\n4️⃣  Search Demo:")
    searches = ["Beatles", "Bach", "Traditional"]
    for query in searches:
        results = library.search(query)
        print(f"   🔍 '{query}': {len(results)} songs found")
    
    # 5. Recommendations
    print("\n5️⃣  Personalized Recommendations:")
    recommendations = library.get_recommended_songs("beginner", ["rock", "blues"], limit=5)
    print(f"\n   For a Beginner who likes Rock & Blues:")
    for song in recommendations:
        genre = song.genre if hasattr(song, 'genre') else 'unknown'
        print(f"      ⭐ {song.title} ({genre})")


def main():
    """Main entry point."""
    display_banner()
    
    # Initialize library
    library = SongLibrary()
    
    # Load songs
    script_dir = os.path.dirname(os.path.abspath(__file__))
    manifest_path = os.path.join(script_dir, "songs", "manifest.json")
    songs_dir = os.path.join(script_dir, "songs")
    
    if os.path.exists(manifest_path):
        print(f"📂 Loading songs from manifest...")
        count = library.load_from_manifest(manifest_path)
    elif os.path.exists(songs_dir):
        print(f"📂 Loading songs from directory...")
        count = library.load_directory(songs_dir)
    else:
        print(f"❌ No songs directory found at: {songs_dir}")
        print("   Run 'python song_generator.py' to generate songs first.")
        sys.exit(1)
    
    print(f"✅ Loaded {count} songs")
    
    # Show manifest stats
    manifest_stats = library.get_manifest_stats()
    if manifest_stats:
        print(f"\n📊 Library Overview:")
        print(f"   Levels: {manifest_stats.get('by_level', {})}")
        print(f"   Genres: {manifest_stats.get('by_genre', {})}")
    
    # Menu
    print("\n" + "=" * 60)
    print("What would you like to do?")
    print("  1. Interactive mode (select level/genre and browse)")
    print("  2. Demo mode (showcase library features)")
    print("  3. Show all songs")
    print("  4. Exit")
    
    try:
        choice = input("\nEnter choice (1-4): ").strip()
        
        if choice == "1":
            interactive_mode(library)
        elif choice == "2":
            demo_mode(library)
        elif choice == "3":
            display_song_list(library.list_all(), "All Songs in Library")
        elif choice == "4":
            print("\n👋 Goodbye!")
        else:
            # Default to demo
            demo_mode(library)
            
    except KeyboardInterrupt:
        print("\n\n👋 Goodbye!")


if __name__ == "__main__":
    main()
