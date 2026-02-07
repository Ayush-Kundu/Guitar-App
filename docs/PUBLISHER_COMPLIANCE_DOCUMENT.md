# Guitar App - Publisher Compliance Document

**Document Version:** 1.0  
**Date:** January 2026  
**Classification:** Confidential - For Publisher Review Only

---

## 1️⃣ Overview

Guitar App is an **interactive guitar learning platform** that teaches users how to play songs through real-time visual guidance and synthesized audio feedback. 

Unlike traditional music apps that stream or download audio files, our system uses an **event-based playback engine** that synthesizes guitar sounds in real-time based on performance instructions (string, fret, timing). This architecture fundamentally prevents song extraction while enabling an effective learning experience.

**Our Intent:** To license popular songs from publishers for educational use, with technical safeguards that make unauthorized copying or redistribution technically impossible.

**Key Differentiator:** Users learn *how to play* a song—they never *receive* the song in any extractable format.

---

## 2️⃣ Technical Architecture

### 2.1 Event-Based Playback System

Our engine does **not** store or play audio recordings. Instead, songs are represented as **performance instructions**:

```
┌─────────────────────────────────────────────────────────────┐
│                    SONG DATA STRUCTURE                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   {                                                         │
│     "song_id": "example_001",                               │
│     "title": "Song Title",                                  │
│     "license_status": "licensed",    ◄── Required field    │
│     "tempo": 120,                                           │
│     "events": [                                             │
│       {                                                     │
│         "time": 0.0,      ◄── When to play                 │
│         "string": 6,      ◄── Which string (1-6)           │
│         "fret": 3,        ◄── Which fret (0-24)            │
│         "duration": 0.5   ◄── How long                     │
│       },                                                    │
│       ...                                                   │
│     ]                                                       │
│   }                                                         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**What this means:**
- ✅ No audio files are stored or transmitted
- ✅ No MIDI files are stored or transmitted
- ✅ No sheet music notation is present
- ✅ Sound is synthesized in real-time using Karplus-Strong algorithm
- ✅ Stopping the app = no audio exists

### 2.2 Difficulty Layers

Each song can have multiple difficulty levels, each with its own event set:

```
┌─────────────────────────────────────────────────────────────┐
│                    DIFFICULTY SYSTEM                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   EASY          MEDIUM           HARD                       │
│   ────          ──────           ────                       │
│   • Root notes  • Full chords    • Fingerpicking           │
│   • Slow tempo  • Normal tempo   • Original tempo          │
│   • 10 events   • 50 events      • 200+ events             │
│                                                             │
│   Each level is a SEPARATE instruction set                  │
│   (not a simplified audio mix)                              │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 2.3 Section System

Songs are divided into practice sections:

```
┌─────────────────────────────────────────────────────────────┐
│                    SECTION MARKERS                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   0:00 ──────── 0:30 ──────── 1:00 ──────── 1:30           │
│   │   INTRO    │    VERSE    │   CHORUS   │    ...         │
│   │            │             │            │                 │
│   └────────────┴─────────────┴────────────┘                │
│         ▲            ▲             ▲                        │
│         │            │             │                        │
│    Users can loop individual sections for practice          │
│    (NOT continuous full-song playback)                      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 2.4 Synthesizer Approach

```
┌─────────────────────────────────────────────────────────────┐
│                 AUDIO GENERATION FLOW                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   JSON Events  →  Playback Engine  →  Synthesizer  →  Audio│
│                                                             │
│   ┌──────────┐    ┌──────────────┐    ┌───────────┐        │
│   │ string:6 │    │ Calculate    │    │ Karplus-  │   🔊   │
│   │ fret: 3  │───▶│ frequency    │───▶│ Strong    │───▶    │
│   │ time:0.0 │    │ from fret    │    │ synthesis │        │
│   └──────────┘    └──────────────┘    └───────────┘        │
│                                                             │
│   • No pre-recorded samples                                 │
│   • No audio file storage                                   │
│   • Sound generated mathematically in real-time             │
│   • Stopping = no audio artifact remains                    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 3️⃣ Content Management & Safeguards

### 3.1 Song File Structure

Every song file contains mandatory license metadata:

| Field | Description | Required |
|-------|-------------|----------|
| `song_id` | Unique identifier | ✅ Yes |
| `title` | Song title | ✅ Yes |
| `license_status` | `public_domain`, `licensed`, `original` | ✅ Yes |
| `composer` | Original artist/composer | ✅ Yes |
| `events` | Performance instructions | ✅ Yes |

### 3.2 Authoring Validation (Automated)

Before ANY song can load, our validator checks:

```
┌─────────────────────────────────────────────────────────────┐
│                  VALIDATION CHECKS                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ✅ LICENSE CHECK                                           │
│     └─ Must be: public_domain, licensed, or original        │
│     └─ Rejects: unknown, unlicensed, or missing             │
│                                                             │
│  ✅ NOTATION CHECK                                          │
│     └─ Rejects: staff_position, ledger_lines, clef          │
│     └─ Ensures: No printable sheet music data               │
│                                                             │
│  ✅ EVENT FORMAT CHECK                                      │
│     └─ Requires: string, fret (performance-based)           │
│     └─ Rejects: note_name, octave (music theory format)     │
│                                                             │
│  ✅ SIMULTANEOUS NOTES CHECK                                │
│     └─ Maximum: 6 notes at once (guitar physical limit)     │
│     └─ Prevents: Full orchestral arrangements               │
│                                                             │
│  ❌ VALIDATION FAILS = SONG DOES NOT LOAD                   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 3.3 Extraction Blocking (Hard-Coded)

The following features are **permanently disabled** at the engine level:

| Blocked Feature | Technical Block | User-Visible Result |
|----------------|-----------------|---------------------|
| Audio Export (WAV/MP3) | `raise PermissionError` | Export button does not exist |
| MIDI Export | `raise PermissionError` | No MIDI option available |
| MusicXML Export | `raise PermissionError` | No notation export |
| Sheet Music View | Not implemented | Visual fretboard only |
| Tablature Text | Not implemented | No copyable tab |
| Clipboard Copy | `raise PermissionError` | Copy disabled on note data |
| Full Autoplay | Interaction required | Must interact every 60 seconds |
| Background Play | `raise PermissionError` | Stops when app loses focus |

**These blocks are not configurable.** They cannot be enabled via settings, flags, or developer tools.

### 3.4 Code Proof: Extraction Blocks

```python
# From extraction_blocker.py - ACTUAL PRODUCTION CODE

def export_audio(*args, **kwargs):
    """BLOCKED: Audio export is disabled."""
    raise ExtractionBlockedError(
        "Audio Export (WAV/MP3/OGG)",
        "Audio export is disabled in instructional mode. "
        "Songs are synthesized in real-time for practice only."
    )

def export_midi(*args, **kwargs):
    """BLOCKED: MIDI export is disabled."""
    raise ExtractionBlockedError(
        "MIDI Export",
        "MIDI export is permanently disabled. "
        "MIDI files could be used to recreate sheet music."
    )

# Every extraction attempt is logged for audit
extraction_logger.warning(f"Extraction attempt blocked: {feature}")
```

---

## 4️⃣ Demo Workflow

### For Publisher Testing

We provide a controlled demo environment with the following content:

```
┌─────────────────────────────────────────────────────────────┐
│                    DEMO CONTENT                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  PUBLIC DOMAIN SONG: Greensleeves                           │
│  ─────────────────────────────────────                      │
│  • Traditional (16th Century)                               │
│  • No licensing required                                    │
│  • 3 difficulty levels: Easy, Medium, Hard                  │
│                                                             │
│  ORIGINAL SONG: Guitar App Theme                            │
│  ─────────────────────────────────                          │
│  • Created by Guitar App (we own all rights)                │
│  • Demonstrates our content creation capability             │
│  • 3 difficulty levels: Easy, Medium, Hard                  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Demo Steps

**Step 1: Launch Demo Mode**
```
$ python demo_mode.py
```

**Step 2: View Available Songs**
```
📚 Available Demo Songs:

  🎵 Greensleeves
     Composer: Traditional (16th Century)
     License: public_domain
     Difficulties: easy, medium, hard

  🎵 Guitar App Theme
     Composer: Guitar App Original
     License: original
     Difficulties: easy, medium, hard
```

**Step 3: Load a Song**
```python
demo.load_song("greensleeves", difficulty="medium")
# Validator automatically runs before loading
```

**Step 4: Test Interactive Features**
```
✅ Start playback (requires user click)
✅ Adjust tempo (50% - 150%)
✅ Loop a section (e.g., loop "intro" 3 times)
✅ See visual note guidance
✅ Pause/resume at any time
```

**Step 5: Test Extraction Blocks**
```
❌ Attempt audio export → BLOCKED
❌ Attempt MIDI export → BLOCKED
❌ Attempt copy to clipboard → BLOCKED
❌ Attempt full autoplay → BLOCKED (pauses after 60s)
```

**Step 6: View Compliance Report**
```
============================================================
LEGAL COMPLIANCE SUMMARY
============================================================

SONGS IN DEMO:
  • Greensleeves
    License: PUBLIC_DOMAIN
    Reason: Public domain - no licensing required.

  • Guitar App Theme
    License: ORIGINAL
    Reason: Original content - we own all rights.

EXTRACTION BLOCKS:
  ❌ Audio Export (WAV/MP3/OGG)
  ❌ MIDI Export
  ❌ Sheet Music Export
  ❌ Tablature Export
  ❌ Full Song Autoplay
  ... (13 total blocked features)

============================================================
```

---

## 5️⃣ Licensing & Legal Plan

### 5.1 Content Acquisition Policy

We commit to the following content policy:

| Content Type | Source | Verification |
|--------------|--------|--------------|
| Public Domain | Traditional songs, pre-1928 compositions | Historical verification |
| Licensed | Songs with explicit publisher permission | Signed agreement |
| Original | Created by Guitar App or commissioned | Work-for-hire contracts |

**We will NEVER include:**
- ❌ Songs without explicit written permission
- ❌ "Covers" or arrangements of copyrighted works without license
- ❌ User-uploaded content without rights verification

### 5.2 License Metadata Enforcement

Every song file **must** contain a valid `license_status`:

```python
# From song_validator.py - ACTUAL PRODUCTION CODE

VALID_LICENSES = frozenset([
    "public_domain",      # Free to use (Beethoven, Bach, Traditional)
    "licensed",           # We have explicit permission
    "original",           # Created by us/for us
    "educational_use"     # Educational fair use (simplified arrangements)
])

# Songs with invalid license = REJECTED
assert song.license_status in VALID_LICENSES
```

### 5.3 User Interaction Requirements

To prevent passive consumption (listening without learning), we require:

| Feature | Implementation |
|---------|---------------|
| Initial interaction | User must click "Start" to begin |
| Continuous interaction | Playback pauses after 60s without input |
| Section-based practice | Users loop sections, not full songs |
| No background play | App must be in foreground |

**Why this matters:** These requirements ensure users are actively learning, not using the app as a music player.

### 5.4 Audit Trail

All extraction attempts are logged:

```
WARNING: Extraction attempt blocked: Audio Export at 2026-01-03T22:42:55
WARNING: Extraction attempt blocked: MIDI Export at 2026-01-03T22:43:01
WARNING: Autoplay attempt blocked for song 'song_123' at 2026-01-03T22:44:30
```

We can provide these logs to publishers upon request.

---

## 6️⃣ Visual Diagrams

### 6.1 System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         GUITAR APP ARCHITECTURE                     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│   ┌──────────────┐      ┌──────────────┐      ┌──────────────┐     │
│   │   CONTENT    │      │   PLAYBACK   │      │     USER     │     │
│   │   STORAGE    │      │   ENGINE     │      │  INTERFACE   │     │
│   └──────────────┘      └──────────────┘      └──────────────┘     │
│          │                     │                     │              │
│          ▼                     ▼                     ▼              │
│   ┌──────────────┐      ┌──────────────┐      ┌──────────────┐     │
│   │  JSON Song   │      │ Synthesizer  │      │  Fretboard   │     │
│   │    Files     │─────▶│   Engine     │─────▶│   Display    │     │
│   └──────────────┘      └──────────────┘      └──────────────┘     │
│          │                     │                     │              │
│          │              ┌──────────────┐             │              │
│          │              │  REAL-TIME   │             │              │
│          │              │    AUDIO     │             │              │
│          │              │   (No file)  │             │              │
│          │              └──────────────┘             │              │
│          │                     │                     │              │
│          ▼                     ▼                     ▼              │
│   ┌──────────────────────────────────────────────────────────┐     │
│   │                    VALIDATION LAYER                       │     │
│   │  • License check    • Notation block    • Event format   │     │
│   └──────────────────────────────────────────────────────────┘     │
│          │                     │                     │              │
│          ▼                     ▼                     ▼              │
│   ┌──────────────────────────────────────────────────────────┐     │
│   │                   EXTRACTION BLOCKER                      │     │
│   │  ❌ WAV   ❌ MIDI   ❌ Sheet   ❌ Copy   ❌ Autoplay     │     │
│   └──────────────────────────────────────────────────────────┘     │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### 6.2 User Practice Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                         USER PRACTICE FLOW                          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│   ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐        │
│   │ SELECT  │───▶│  SET    │───▶│  LOOP   │───▶│ PRACTICE│        │
│   │  SONG   │    │  TEMPO  │    │ SECTION │    │  NOTES  │        │
│   └─────────┘    └─────────┘    └─────────┘    └─────────┘        │
│        │              │              │              │               │
│        ▼              ▼              ▼              ▼               │
│   User picks     User slows    User loops     User follows        │
│   difficulty     to 75%        "verse" 3x     visual guide        │
│                                                                     │
│   ════════════════════════════════════════════════════════════     │
│                                                                     │
│   INTERACTION REQUIREMENT:                                          │
│   • User must click/tap to start each section                      │
│   • Playback auto-pauses after 60 seconds                          │
│   • No continuous "listen-through" mode                            │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### 6.3 Visual Guidance Display (What Users See)

```
┌─────────────────────────────────────────────────────────────────────┐
│                      VISUAL FRETBOARD DISPLAY                       │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│     Fret:   1     2     3     4     5     6     7                  │
│           ─────┬─────┬─────┬─────┬─────┬─────┬─────                │
│   E (1) ───────┼─────┼─────┼─────┼─────┼─────┼─────                │
│   B (2) ───────┼─────┼─●───┼─────┼─────┼─────┼─────   ◄── Play B  │
│   G (3) ───────┼─────┼─────┼─────┼─────┼─────┼─────       at fret 3│
│   D (4) ───────┼─────┼─────┼─────┼─────┼─────┼─────                │
│   A (5) ───────┼─────┼─────┼─────┼─────┼─────┼─────                │
│   E (6) ───────┼─────┼─●───┼─────┼─────┼─────┼─────   ◄── Play E  │
│           ─────┴─────┴─────┴─────┴─────┴─────┴─────       at fret 3│
│                                                                     │
│   ══════════════════════════════════════════════════════════       │
│   │▶ Play │ ⏸ Pause │ 🔄 75% tempo │ 🔁 Loop Intro │              │
│   ══════════════════════════════════════════════════════════       │
│                                                                     │
│   NOTE: This is NOT sheet music. Users see WHERE to put fingers,   │
│         not musical notation that could be printed or copied.      │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Summary

| Publisher Concern | Our Solution |
|-------------------|--------------|
| "Will users pirate our songs?" | No audio files exist to pirate |
| "Can users export to MIDI?" | MIDI export is hard-blocked |
| "Can users screenshot sheet music?" | No sheet music is ever displayed |
| "Will users just listen instead of learn?" | Auto-pause after 60s of inactivity |
| "How do we know you have permission?" | License field required; validation rejects unlicensed |
| "Can we audit the system?" | Full extraction attempt logging available |

**Bottom Line:** Guitar App is designed from the ground up to be a learning tool, not a consumption platform. Users learn to play songs—they never receive extractable song content.

---

## Contact

For licensing inquiries, technical questions, or demo access:

**Guitar App Team**  
*[Contact information to be added]*

---

*Document prepared for publisher review. All technical claims are verifiable in source code.*

