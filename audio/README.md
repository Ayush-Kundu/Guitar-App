# 🎸 Guitar App - Song Playback Engine

## Quick Start - One Command Demo

```bash
cd audio
python demo.py
```

That's it! The demo will:
1. Show available songs
2. Let you pick one
3. Choose tempo (slow it down for learning!)
4. Play with visual fretboard

## Direct Song Playback

```bash
python demo.py songs/demo_pd_scarborough_fair.json
```

## Available Demo Songs

| Song | Type | Difficulty | Notes |
|------|------|------------|-------|
| Scarborough Fair | Public Domain 🔓 | Beginner | 71 |
| Amazing Grace | Public Domain 🔓 | Beginner | 60 |
| 12-Bar Blues Riff | Original 🎵 | Beginner | 88 |
| Chord Transitions | Original 🎵 | Beginner | 124 |
| Fingerstyle Etude | Original 🎵 | Intermediate | 247 |

## Multi-Difficulty Example

```bash
# Smoke on the Water with 3 difficulty levels
python multi_difficulty_loader.py
```

| Level | Notes | Techniques |
|-------|-------|------------|
| Easy | 12 | pluck |
| Medium | 40 | pluck (chords) |
| Full | 103 | pluck, palm_mute, mute |

## What This Proves to Publishers

### ✅ Technical Safeguards
- **Event-based playback** - Not audio files
- **Synthesized sound** - Karplus-Strong algorithm
- **License gate** - Blocks unlicensed content
- **Validation** - Rejects invalid songs

### ✅ Educational Model
- **Difficulty layers** - Easy → Medium → Full
- **Tempo control** - Slow down for learning
- **Visual fretboard** - Interactive guidance
- **Section looping** - Practice specific parts

### ✅ Compliance Built-In
```
Public Domain    → ✅ Always allowed
Original         → ✅ Always allowed  
Licensed (valid) → ✅ Allowed
Licensed (none)  → ❌ BLOCKED
Unknown          → ❌ BLOCKED
```

## File Structure

```
audio/
├── demo.py                    # 🎯 ONE-COMMAND DEMO
├── song_loader.py             # Load songs from JSON
├── song_validator.py          # Compliance validation
├── license_gate.py            # License enforcement
├── multi_difficulty_loader.py # Multi-level songs
├── song_library.py            # Song collection
├── song_playback_engine.py    # Core synthesis
│
├── songs/
│   ├── demo_pd_*.json         # Public domain demos
│   ├── demo_orig_*.json       # Original content
│   └── multi_difficulty/      # Difficulty layers
│
├── data/
│   └── license_registry.json  # License database
│
└── docs/
    ├── PUBLISHER_COMPLIANCE_DOCUMENT.md
    └── EXECUTIVE_SUMMARY.md
```

## Requirements

```bash
pip install numpy pyaudio  # For audio synthesis
```

Note: Demo works without these (visual only).

## For Publishers

Contact us to:
1. Review compliance documentation
2. Test the demo environment  
3. Discuss licensing terms
4. Access full catalog integration

---

*Guitar App - Learn to play, not just listen.*

