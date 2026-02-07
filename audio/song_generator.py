"""
Song Generator - Generates song JSON files from chord progressions.

This script creates playable note events from chord data, generating
realistic guitar arrangements based on the specified chords and tempo.
"""

import json
import os
from dataclasses import dataclass
from typing import List, Dict, Tuple
import random

# Chord fingerings: string -> fret (0 = open, -1 = muted)
# Strings: 1=high e, 2=B, 3=G, 4=D, 5=A, 6=low E
CHORD_FINGERINGS = {
    # Major chords (open)
    "C": [(1, 0), (2, 1), (3, 0), (4, 2), (5, 3)],  # x32010
    "D": [(1, 2), (2, 3), (3, 2), (4, 0)],  # xx0232
    "E": [(1, 0), (2, 0), (3, 1), (4, 2), (5, 2), (6, 0)],  # 022100
    "G": [(1, 3), (2, 3), (3, 0), (4, 0), (5, 2), (6, 3)],  # 320033
    "A": [(1, 0), (2, 2), (3, 2), (4, 2), (5, 0)],  # x02220
    "F": [(1, 1), (2, 1), (3, 2), (4, 3), (5, 3), (6, 1)],  # 133211 (barre)
    "B": [(1, 2), (2, 4), (3, 4), (4, 4), (5, 2)],  # x24442 (barre)
    
    # Minor chords
    "Am": [(1, 0), (2, 1), (3, 2), (4, 2), (5, 0)],  # x02210
    "Dm": [(1, 1), (2, 3), (3, 2), (4, 0)],  # xx0231
    "Em": [(1, 0), (2, 0), (3, 0), (4, 2), (5, 2), (6, 0)],  # 022000
    "Bm": [(1, 2), (2, 3), (3, 4), (4, 4), (5, 2)],  # x24432 (barre)
    "Cm": [(1, 3), (2, 4), (3, 5), (4, 5), (5, 3)],  # x35543 (barre)
    "Fm": [(1, 1), (2, 1), (3, 1), (4, 3), (5, 3), (6, 1)],  # 133111 (barre)
    "Gm": [(1, 3), (2, 3), (3, 3), (4, 5), (5, 5), (6, 3)],  # 355333 (barre)
    
    # 7th chords
    "G7": [(1, 1), (2, 0), (3, 0), (4, 0), (5, 2), (6, 3)],  # 320001
    "C7": [(1, 0), (2, 1), (3, 3), (4, 2), (5, 3)],  # x32310
    "D7": [(1, 2), (2, 1), (3, 2), (4, 0)],  # xx0212
    "E7": [(1, 0), (2, 0), (3, 1), (4, 0), (5, 2), (6, 0)],  # 020100
    "A7": [(1, 0), (2, 2), (3, 0), (4, 2), (5, 0)],  # x02020
    "B7": [(1, 2), (2, 0), (3, 2), (4, 1), (5, 2)],  # x21202
    
    # Minor 7th chords
    "Am7": [(1, 0), (2, 1), (3, 0), (4, 2), (5, 0)],  # x02010
    "Dm7": [(1, 1), (2, 1), (3, 2), (4, 0)],  # xx0211
    "Em7": [(1, 0), (2, 0), (3, 0), (4, 0), (5, 2), (6, 0)],  # 020000
    
    # Major 7th chords
    "CMaj7": [(1, 0), (2, 0), (3, 0), (4, 2), (5, 3)],  # x32000
    "DMaj7": [(1, 2), (2, 2), (3, 2), (4, 0)],  # xx0222
    "FMaj7": [(1, 0), (2, 1), (3, 2), (4, 3), (5, 3)],  # x33210
    "GMaj7": [(1, 2), (2, 3), (3, 0), (4, 0), (5, 2), (6, 3)],  # 320032
    
    # Diminished
    "Bdim": [(1, 1), (2, 0), (3, 2), (4, 0)],  # xx0101
    
    # Augmented
    "Caug": [(1, 1), (2, 1), (3, 0), (4, 2), (5, 3)],  # x32110
    
    # Suspended chords
    "Dsus4": [(1, 3), (2, 3), (3, 2), (4, 0)],  # xx0233
    "Asus4": [(1, 0), (2, 3), (3, 2), (4, 2), (5, 0)],  # x02230
    "Esus4": [(1, 0), (2, 0), (3, 2), (4, 2), (5, 2), (6, 0)],  # 022200
    
    # Power chords (root + 5th)
    "G5": [(4, 5), (5, 5), (6, 3)],  # 355xxx
    "A5": [(4, 7), (5, 7), (6, 5)],  # 577xxx
    "D5": [(3, 7), (4, 7), (5, 5)],  # x577xx
    "E5": [(4, 2), (5, 2), (6, 0)],  # 022xxx
    "C5": [(4, 5), (5, 3)],  # x35xxx
    
    # Extended chords (simplified voicings)
    "Bb": [(1, 1), (2, 3), (3, 3), (4, 3), (5, 1)],  # x13331 (barre)
    "Eb": [(1, 3), (2, 4), (3, 3), (4, 5), (5, 6), (6, 3)],  # 365343
    "Ab": [(1, 4), (2, 4), (3, 5), (4, 6), (5, 6), (6, 4)],  # 466544
    "Db": [(1, 1), (2, 2), (3, 1), (4, 3), (5, 4)],  # x43121 (barre)
    "F#": [(1, 2), (2, 2), (3, 3), (4, 4), (5, 4), (6, 2)],  # 244322
    
    # Jazz chords (simplified voicings)
    "Cm7": [(1, 3), (2, 4), (3, 3), (4, 5), (5, 3)],  # x35343
    "Fm7": [(1, 1), (2, 1), (3, 1), (4, 1), (5, 3), (6, 1)],  # 131111
    "BbMaj7": [(1, 1), (2, 3), (3, 2), (4, 3), (5, 1)],  # x13231
    "EbMaj7": [(1, 3), (2, 3), (3, 3), (4, 5), (5, 6), (6, 3)],  # 365333
    "AbMaj7": [(1, 3), (2, 4), (3, 5), (4, 5), (5, 6), (6, 4)],  # 465534
    "DbMaj7": [(1, 1), (2, 1), (3, 1), (4, 3), (5, 4)],  # x43111
    "Am7b5": [(1, 0), (2, 1), (3, 0), (4, 1), (5, 0)],  # x01010
    "Bm7b5": [(1, 1), (2, 0), (3, 2), (4, 0), (5, 2)],  # x20201
    "Dm7b5": [(1, 1), (2, 1), (3, 1), (4, 0)],  # xx0111
    "F7": [(1, 1), (2, 1), (3, 2), (4, 1), (5, 3), (6, 1)],  # 131211
}


def get_chord_notes(chord_name: str) -> List[Tuple[int, int]]:
    """
    Get the string/fret pairs for a chord.
    Returns list of (string, fret) tuples.
    Falls back to power chord if chord not found.
    """
    # Clean the chord name
    clean_name = chord_name.strip()
    
    if clean_name in CHORD_FINGERINGS:
        return CHORD_FINGERINGS[clean_name]
    
    # Try without numbers or modifiers
    base_chord = ''.join(c for c in clean_name if c.isalpha() or c == '#' or c == 'b')
    if base_chord in CHORD_FINGERINGS:
        return CHORD_FINGERINGS[base_chord]
    
    # Default to a simple power chord shape
    return [(4, 5), (5, 5), (6, 3)]  # G5


def generate_strum_events(chord: str, start_time: float, duration: float, 
                          tempo: int, pattern: str = "simple") -> List[dict]:
    """
    Generate note events for strumming a chord.
    
    Args:
        chord: Chord name
        start_time: When to start strumming
        duration: How long to strum
        tempo: BPM for timing
        pattern: Strumming pattern type
        
    Returns:
        List of note event dictionaries
    """
    events = []
    chord_notes = get_chord_notes(chord)
    beat_duration = 60.0 / tempo
    
    if pattern == "simple":
        # Simple downstrum on each beat
        strums_per_measure = 4
        strum_interval = duration / strums_per_measure if duration > 0 else beat_duration
        
        current_time = start_time
        while current_time < start_time + duration:
            # Strum all strings with slight time offset (natural strum)
            for i, (string, fret) in enumerate(chord_notes):
                events.append({
                    "time": round(current_time + i * 0.02, 3),  # Slight strum delay
                    "string": string,
                    "fret": fret,
                    "duration": round(strum_interval * 0.9, 3),  # Slight gap
                    "velocity": 0.7 + random.uniform(-0.1, 0.1),
                    "technique": "strum"
                })
            current_time += strum_interval
    
    elif pattern == "fingerpick":
        # Arpeggio-style fingerpicking
        pick_interval = beat_duration / 4  # Sixteenth notes
        current_time = start_time
        note_idx = 0
        
        while current_time < start_time + duration:
            note = chord_notes[note_idx % len(chord_notes)]
            events.append({
                "time": round(current_time, 3),
                "string": note[0],
                "fret": note[1],
                "duration": round(pick_interval * 2, 3),  # Let notes ring
                "velocity": 0.6 if note_idx % 4 == 0 else 0.5,
                "technique": "pluck"
            })
            current_time += pick_interval
            note_idx += 1
    
    elif pattern == "power":
        # Heavy rock strumming
        eighth_note = beat_duration / 2
        current_time = start_time
        
        while current_time < start_time + duration:
            # Strong downstroke
            for string, fret in chord_notes:
                events.append({
                    "time": round(current_time, 3),
                    "string": string,
                    "fret": fret,
                    "duration": round(eighth_note * 0.8, 3),
                    "velocity": 0.9,
                    "technique": "strum"
                })
            current_time += eighth_note
            
            # Palm muted eighth
            if current_time < start_time + duration:
                for string, fret in chord_notes:
                    events.append({
                        "time": round(current_time, 3),
                        "string": string,
                        "fret": fret,
                        "duration": round(eighth_note * 0.5, 3),
                        "velocity": 0.6,
                        "technique": "mute"
                    })
                current_time += eighth_note
    
    return events


def generate_song_events(chords: List[str], tempo: int, duration_seconds: float, 
                        genre: str = "pop") -> List[dict]:
    """
    Generate a complete sequence of note events for a song.
    
    Args:
        chords: List of chord names
        tempo: BPM
        duration_seconds: Total song duration
        genre: Genre for pattern selection
        
    Returns:
        List of note event dictionaries
    """
    events = []
    beat_duration = 60.0 / tempo
    measure_duration = beat_duration * 4  # Assuming 4/4
    
    # Choose pattern based on genre
    pattern = "simple"
    if genre in ["rock", "metal"]:
        pattern = "power"
    elif genre in ["folk", "classical"]:
        pattern = "fingerpick"
    
    # Calculate time per chord
    if len(chords) == 0:
        return events
    
    chord_duration = duration_seconds / (len(chords) * 2)  # Repeat progression twice
    chord_duration = max(chord_duration, measure_duration)  # At least one measure per chord
    
    current_time = 0.0
    chord_idx = 0
    
    while current_time < duration_seconds:
        chord = chords[chord_idx % len(chords)]
        chord_events = generate_strum_events(
            chord, current_time, chord_duration, tempo, pattern
        )
        events.extend(chord_events)
        current_time += chord_duration
        chord_idx += 1
    
    return events


def duration_to_seconds(duration_str: str) -> float:
    """Convert duration string like '4:23' to seconds."""
    parts = duration_str.split(':')
    if len(parts) == 2:
        return int(parts[0]) * 60 + int(parts[1])
    return 180  # Default 3 minutes


def create_song_json(song_data: dict, song_id: str, level: str, genre: str) -> dict:
    """
    Create a complete song JSON structure.
    
    Args:
        song_data: Song data from guitar-content.json
        song_id: Unique identifier
        level: Difficulty level
        genre: Music genre
        
    Returns:
        Complete song dictionary ready for JSON export
    """
    title = song_data.get("title", "Unknown Song")
    artist = song_data.get("artist", "Unknown Artist")
    chords = song_data.get("chords", ["C", "G", "Am", "F"])
    tempo = song_data.get("bpm", 120)
    duration_str = song_data.get("duration", "3:00")
    duration_seconds = duration_to_seconds(duration_str)
    
    # Generate events
    events = generate_song_events(chords, tempo, duration_seconds, genre)
    
    return {
        "song_id": song_id,
        "title": title,
        "composer": artist,
        "tempo": tempo,
        "time_signature": "4/4",
        "difficulty": level,
        "license_status": "educational_use",
        "genre": genre,
        "chords": chords,
        "original_duration": duration_str,
        "learning_time": song_data.get("learningTime", "1 week"),
        "tuning": "standard",
        "capo": 0,
        "events": events
    }


def generate_all_songs(guitar_content_path: str, output_dir: str) -> int:
    """
    Generate all song JSON files from guitar-content.json.
    
    Args:
        guitar_content_path: Path to guitar-content.json
        output_dir: Directory to save song files
        
    Returns:
        Number of songs generated
    """
    # Load guitar content
    with open(guitar_content_path, 'r') as f:
        content = json.load(f)
    
    songs_data = content.get("songs", {})
    count = 0
    
    # Map levels to short codes
    level_codes = {
        "novice": "nv",
        "beginner": "bg",
        "elementary": "el",
        "intermediate": "im",
        "proficient": "pf",
        "advanced": "av",
        "expert": "ex"
    }
    
    # Map genres to short codes
    genre_codes = {
        "rock": "rk",
        "pop": "pp",
        "classical": "cl",
        "folk": "fk",
        "blues": "bl",
        "country": "ct",
        "jazz": "jz",
        "metal": "mt"
    }
    
    for level, genres in songs_data.items():
        level_code = level_codes.get(level, level[:2])
        
        for genre, songs in genres.items():
            genre_code = genre_codes.get(genre, genre[:2])
            
            for idx, song in enumerate(songs, 1):
                # Create song ID
                song_id = f"{level_code}_{genre_code}_{idx:03d}"
                
                # Generate song JSON
                song_json = create_song_json(song, song_id, level, genre)
                
                # Create filename (sanitize title)
                safe_title = "".join(c if c.isalnum() or c == ' ' else '_' for c in song["title"])
                safe_title = safe_title.replace(' ', '_').lower()[:30]
                filename = f"{song_id}_{safe_title}.json"
                filepath = os.path.join(output_dir, filename)
                
                # Save to file
                with open(filepath, 'w') as f:
                    json.dump(song_json, f, indent=2)
                
                print(f"✅ Generated: {filename}")
                count += 1
    
    return count


def create_song_manifest(songs_dir: str, output_path: str) -> dict:
    """
    Create a manifest file listing all songs with metadata.
    
    Args:
        songs_dir: Directory containing song JSON files
        output_path: Path to save manifest
        
    Returns:
        Manifest dictionary
    """
    import glob
    
    manifest = {
        "version": "1.0",
        "total_songs": 0,
        "by_level": {},
        "by_genre": {},
        "songs": []
    }
    
    for filepath in sorted(glob.glob(os.path.join(songs_dir, "*.json"))):
        if "manifest" in filepath:
            continue
            
        try:
            with open(filepath, 'r') as f:
                song = json.load(f)
            
            entry = {
                "song_id": song["song_id"],
                "title": song["title"],
                "composer": song["composer"],
                "difficulty": song["difficulty"],
                "genre": song.get("genre", "unknown"),
                "tempo": song["tempo"],
                "file": os.path.basename(filepath)
            }
            manifest["songs"].append(entry)
            
            # Count by level
            level = song["difficulty"]
            manifest["by_level"][level] = manifest["by_level"].get(level, 0) + 1
            
            # Count by genre
            genre = song.get("genre", "unknown")
            manifest["by_genre"][genre] = manifest["by_genre"].get(genre, 0) + 1
            
        except Exception as e:
            print(f"⚠️  Error reading {filepath}: {e}")
    
    manifest["total_songs"] = len(manifest["songs"])
    
    # Save manifest
    with open(output_path, 'w') as f:
        json.dump(manifest, f, indent=2)
    
    print(f"\n📋 Manifest saved: {output_path}")
    print(f"   Total songs: {manifest['total_songs']}")
    print(f"   By level: {manifest['by_level']}")
    print(f"   By genre: {manifest['by_genre']}")
    
    return manifest


if __name__ == "__main__":
    # Paths
    script_dir = os.path.dirname(os.path.abspath(__file__))
    project_dir = os.path.dirname(script_dir)
    
    guitar_content_path = os.path.join(project_dir, "src", "data", "guitar-content.json")
    songs_dir = os.path.join(script_dir, "songs")
    manifest_path = os.path.join(songs_dir, "manifest.json")
    
    # Create songs directory if needed
    os.makedirs(songs_dir, exist_ok=True)
    
    # Check if guitar-content.json exists
    if not os.path.exists(guitar_content_path):
        print(f"❌ Guitar content not found: {guitar_content_path}")
        exit(1)
    
    print(f"🎸 Generating songs from: {guitar_content_path}")
    print(f"📁 Output directory: {songs_dir}")
    print()
    
    # Generate all songs
    count = generate_all_songs(guitar_content_path, songs_dir)
    print(f"\n✨ Generated {count} songs!")
    
    # Create manifest
    create_song_manifest(songs_dir, manifest_path)

