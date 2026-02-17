# Chord Detector — Technical Documentation

A real-time chord detection system with CLI and web interfaces. Uses peak-based harmonic grouping and chroma-template matching to identify chords from live audio input.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Detection Algorithm](#detection-algorithm)
   - [Chroma Extraction (Peak-Based Harmonic Grouping)](#chroma-extraction)
   - [Chord Matching (Precision-Weighted Scoring)](#chord-matching)
   - [Buffer Processing (Overlapping Windows)](#buffer-processing)
   - [Temporal Smoothing (Chord Window)](#temporal-smoothing)
3. [Song Constraint System](#song-constraint-system)
   - [How It Works](#how-song-constraint-works)
   - [Similarity Calculation](#similarity-calculation)
   - [Song Influence Knob](#song-influence-knob)
4. [Chord Variant Mapping](#chord-variant-mapping)
5. [Parameters Reference](#parameters-reference)
   - [Core Detection Parameters](#core-detection-parameters)
   - [Song Constraint Parameters](#song-constraint-parameters)
   - [Output Mode Parameters](#output-mode-parameters)
   - [Device and Timing Parameters](#device-and-timing-parameters)
   - [Frequencies/Notes-Only Mode Parameters](#frequenciesnotes-only-mode-parameters)
   - [Web Server Parameters](#web-server-parameters)
6. [File Structure](#file-structure)
7. [Supported Chords](#supported-chords)
8. [Instrument Presets](#instrument-presets)
9. [Audio Constants](#audio-constants)
10. [Usage Examples](#usage-examples)
    - [CLI Examples](#cli-examples)
    - [Web Interface](#web-interface)

---

## Architecture Overview

```
Audio Input (microphone or browser stream)
       |
       v
+-------------------------------+
| 1. Circular Buffer            |
|    4096-sample frames         |
|    75% overlap (hop = 1024)   |
+-------------------------------+
       |
       v
+-------------------------------+
| 2. Mode Dispatch              |
|    - Chord mode (default)     |
|    - Frequencies-only mode    |
|    - Notes-only mode          |
+-------------------------------+
       |
       v  (chord mode)
+-------------------------------+
| 3. Chroma Extraction          |
|    chroma_from_fft()          |
|    - Blackman window + 4x pad |
|    - Adaptive peak threshold  |
|    - Harmonic grouping        |
|    - Bass note detection      |
|    - 12-bin pitch class vector|
+-------------------------------+
       |
       v
+-------------------------------+
| 4. Multi-Resolution Blend     |
|    detect_chord_from_buffer() |
|    - Short windows (2.7 Hz)   |
|    - Full buffer (1.35 Hz)    |
|    - Bass voting              |
+-------------------------------+
       |
       v
+-------------------------------+
| 5. Chord Matching             |
|    _match_chroma_to_chord()   |
|    - Score all templates      |
|    - Precision-weighted       |
|    - Bass disambiguation      |
|    - Root boost + penalties   |
+-------------------------------+
       |
       v
+-------------------------------+
| 6. Confidence Threshold       |
|    >= 0.45 to output          |
+-------------------------------+
       |
       v
+-------------------------------+
| 7. Temporal Smoothing         |
|    (caller-managed)           |
|    Accumulate over 0.3s       |
|    Exponential weighting      |
|    Hysteresis bonus           |
|    Pick best via voting       |
+-------------------------------+
       |
       v
+-------------------------------+
| 8. Optional: Song Constraint  |
|    Re-weight against song     |
|    Collapse variants          |
+-------------------------------+
       |
       v
+-------------------------------+
| 9. Optional: Variant Mapping  |
|    Em7/Emin -> Em             |
+-------------------------------+
       |
       v
     Output
  (CLI print or WebSocket JSON)
```

The pipeline is shared between CLI (`chord_detector.py`) and web (`web_server.py`) via `process_audio_chunk()` in `lib/audio_processing.py`. Temporal smoothing and song constraints are applied by the callers, not inside the shared function.

---

## Detection Algorithm

### Chroma Extraction

**Function:** `chroma_from_fft()` in `lib/music_understanding.py`

This is the core innovation — a peak-based harmonic grouping approach with bass detection that builds a 12-dimensional chroma vector (one value per pitch class: C, C#, D, ..., B) and identifies the lowest significant fundamental for root disambiguation.

**Step 1: Windowing and FFT**

```
audio frame (4096 samples at 44.1kHz, ~93ms)
    |
    v
Apply Blackman window (reduces spectral leakage)
    |-58 dB sidelobe rejection vs Hann's -43 dB
    v
Zero-pad to 4x length (16384 samples)
    |
    v
Compute FFT -> magnitude spectrum
```

The 4x zero-padding is critical — it gives ~2.7 Hz frequency resolution, necessary for resolving low guitar notes where adjacent semitones are only ~5 Hz apart (e.g., E2 at 82.4 Hz vs F2 at 87.3 Hz).

**Step 2: Adaptive Peak Detection**

Find local maxima in the magnitude spectrum:
- Must be higher than both neighbors and both second-neighbors
- **Adaptive threshold** based on Signal-to-Noise Ratio:
  - Clean signals (SNR > 30): 4% of max (catches subtle notes)
  - Moderate SNR (15-30): 6% of max (balanced)
  - Noisy signals (SNR < 15): 10% of max (rejects noise)
- Frequency must be within the instrument's range (with some margin)
- **Parabolic interpolation** refines each peak's frequency to sub-bin accuracy

**Step 3: Harmonic Grouping**

This is the key step that makes chord detection work for polyphonic signals. For each detected peak:

```
For each peak (frequency, amplitude):
    Check against all existing fundamentals f0:
        For harmonic numbers h = 2, 3, 4, 5, 6, 7:
            If |peak_freq - h * f0| / (h * f0) < 0.03:   (3% tolerance)
                -> This peak is a harmonic of f0
                -> Reinforce f0's energy: fundamentals[f0] += amplitude / h
                -> Skip to next peak

    If no harmonic match found:
        -> This peak is a new fundamental
        -> Add to fundamentals list
```

**Why this matters:** A guitar playing an A note produces harmonics at A (110 Hz), A (220 Hz), E (330 Hz), A (440 Hz), C# (550 Hz), E (660 Hz). Without harmonic grouping, those harmonics would appear as E and C# in the chroma vector, making a single A note look like an A major chord. By grouping harmonics back to their fundamental, only A gets energy.

**Why not harmonic sieving (subtraction)?** Chord notes are often harmonically related — E is the 3rd harmonic of A, so subtracting A's harmonics would kill the actual E note in an Am chord. Grouping avoids this because it only claims a peak as a harmonic if it aligns with an existing stronger fundamental.

**Step 4: Chroma Vector Construction**

```
For each fundamental (frequency, energy):
    Convert to MIDI: midi = 12 * log2(freq / 440) + 69
    Extract pitch class: pc = round(midi) % 12
    Accumulate: chroma[pc] += energy

Normalize: chroma = chroma / ||chroma||   (L2 norm)
```

The result is a 12-element vector where each bin represents the energy in one pitch class:

```
Index:  0    1    2    3    4    5    6    7    8    9   10   11
Note:   C    C#   D    D#   E    F    F#   G    G#   A   A#   B
```

### Chord Matching

**Function:** `_match_chroma_to_chord()` in `lib/music_understanding.py`

Each candidate chord (root + quality) is scored against the chroma vector using precision-weighted scoring with bass note disambiguation.

**For each of 12 roots x 14 chord types (168 candidates):**

```
chord_bins = [(root + interval) % 12 for interval in template]

# Dynamic root weighting based on energy
root_energy_ratio = chroma[root] / total_energy
root_weight = 2.0 if root_energy_ratio >= 0.15 else 1.5

# Energy in chord bins (root gets dynamic weight)
chord_energy = sum(
    chroma[bin] * (root_weight if bin == root else 1.0)
    for bin in chord_bins
)

# Total weighted energy
total_energy = sum(chroma) + chroma[root] * (root_weight - 1.0)

# Precision: what fraction of energy does this chord explain?
precision = chord_energy / total_energy

# Non-chord penalty: energy in bins NOT in the chord
non_chord_energy = sum(chroma[b] for b in range(12) if b not in chord_bins)
noise_penalty = (non_chord_energy / total_energy) * 0.15

# Complexity penalty: simpler chords preferred
complexity_penalty = len(intervals) * 0.02

score = precision - noise_penalty - complexity_penalty

# Bass note disambiguation (if bass detected)
if bass_pitch_class >= 0:
    if bass_pitch_class == root:
        score += 0.12    # Bass matches root: strong evidence
    elif bass_pitch_class in chord_bins:
        score -= 0.04    # Bass is non-root chord tone: inversion (less common)
```

**Why precision-based scoring?**

Previous approaches used cosine similarity between the chroma vector and chord templates. The problem: extended chords (9ths, 13ths, maj7s) have more template entries, so they "capture" more spread spectral energy and score higher than they should. Precision-based scoring measures what fraction of the *actual energy* a chord explains, which naturally favors the correct, simpler chord.

**Dynamic root weighting:** The root gets 2.0x weight if it has strong energy (≥15% of total), otherwise 1.5x. This adapts to inverted voicings where the root may be weaker.

**Bass disambiguation:** The detected bass note (lowest significant fundamental) provides crucial disambiguating information for chords with identical pitch classes. For example, Am7 and C6 both contain {A, C, E, G}, but:
- Am7 played with A in the bass → bass matches Am7's root → +0.12 bonus → Am7 wins
- C6 played with C in the bass → bass matches C6's root → +0.12 bonus → C6 wins

This achieves 100% accuracy on previously ambiguous chord pairs.

The complexity penalty (0.02 per interval) breaks ties in favor of simpler chords — if C major (3 notes) and Cadd9 (4 notes) explain similar energy, C major wins.

### Buffer Processing

**Function:** `detect_chord_from_buffer()` in `lib/music_understanding.py`

The circular audio buffer (8192 samples) is processed using **multi-resolution FFT analysis**:

**Pass 1: Short overlapping windows** (better temporal resolution)
```
For each window (size=4096, hop=1024 samples):
    Compute RMS energy
    If RMS < silence_threshold: skip

    chroma, bass_pc = chroma_from_fft(window)    # ~2.7 Hz resolution
    accumulated_chroma += chroma * rms           # energy-weighted
    bass_votes[bass_pc] += rms                   # vote for bass note
    active_window_count += 1
```

**Pass 2: Full-buffer FFT** (better frequency resolution)
```
full_chroma, full_bass = chroma_from_fft(full_buffer)    # ~1.35 Hz resolution
accumulated_chroma += full_chroma * avg_rms * n_windows * 0.4    # 40% blend
bass_votes[full_bass] += full_rms * 2.0                          # 2x bass weight
```

**Bass consensus:**
```
consensus_bass = max(bass_votes, key=bass_votes.get)    # winner takes all
```

**Chord matching:**
```
Normalize accumulated chroma
chord, confidence, notes = _match_chroma_to_chord(chroma, bass_pitch_class=consensus_bass)
```

**Why multi-resolution?** Low guitar notes (E2=82.4Hz, F2=87.3Hz) are only 5Hz apart. Short windows provide ~2.7Hz resolution (adequate for most notes), while the full-buffer FFT provides ~1.35Hz resolution for better bass note discrimination. Blending gives 60% weight to short windows (temporal accuracy) and 40% to full buffer (frequency accuracy). The full buffer gets 2x voting weight for bass detection because its superior frequency resolution makes it more reliable for identifying the lowest fundamental.

### Temporal Smoothing

Temporal smoothing is handled by the callers (`chord_detector.py` and `web_server.py`), not by the shared `process_audio_chunk()` function.

**How it works:**

1. Each call to `process_audio_chunk()` returns a single chord + confidence
2. The caller accumulates these into a time window (default 0.3 seconds)
3. When the window completes, a weighted vote with **exponential temporal weighting** and **hysteresis** picks the winner:

**Exponential temporal weighting** (recent detections matter more):
```
DECAY_RATE = 2.3    # Half-life of 0.3 seconds
now = time.time()

for detection in chord_accumulator:
    age = now - detection['timestamp']
    time_weight = exp(-DECAY_RATE * age)
    weighted_conf = confidence * time_weight
    chord_scores[chord]['weighted_confidence'] += weighted_conf
```

**Hysteresis bonus** (prevents oscillation between similar chords):
```
HYSTERESIS_BONUS = 0.15    # 15% bonus
if last_chord and chord_stability >= 2:
    chord_scores[last_chord]['weighted_confidence'] *= (1.0 + HYSTERESIS_BONUS)
```

**Winner selection:**
```
Winner: chord with highest weighted_confidence
Average confidence = total_weighted / total_weight
Output if avg_confidence >= chord_window_confidence (default 0.4)
```

**Example:**
```
Window: [Em(0.65, t=0.0s), Em(0.70, t=0.1s), G(0.45, t=0.2s), Em(0.68, t=0.3s)]
  Em: weighted total = 0.65*1.0 + 0.70*0.79 + 0.68*0.50 = 1.54, avg = 0.68
  G:  weighted total = 0.45*0.63 = 0.28, avg = 0.45
  Winner: Em (0.68 confidence, strong temporal support)
  If Em was stable for 2+ frames: Em score *= 1.15 → even stronger
```

This approach provides faster response to real chord changes while preventing brief glitches from causing output changes.

---

## Song Constraint System

### How Song Constraint Works

When you provide a song via `--song <song_id>`, the system loads the song's chord list and uses it to re-weight detection results. This happens *after* the raw chord detection, so the raw algorithm runs identically — the song just biases the final output.

**Flow:**

```
Raw detection: "Em7" at confidence 0.65
Song chords: [C, G, Am, Em, F]
                |
                v
1. Is "Em7" in the song?  No (exact match fails)
2. Find closest song chord:
   Em7 pitch classes = {E, G, B, D} = {4, 7, 11, 2}
   Em pitch classes  = {E, G, B}    = {4, 7, 11}
   Jaccard = |{4,7,11}| / |{4,7,11,2}| = 3/4 = 0.75
   -> "related" match (>= 0.6)
3. Penalize Em7: 0.65 * related_weight
4. Inject "Em" as competing candidate: 0.65 * 0.75 * suggested_boost
5. Pick highest weighted score -> likely "Em" wins
```

### Similarity Calculation

Chord similarity uses **Jaccard similarity** on pitch class sets:

```
Jaccard(A, B) = |A ∩ B| / |A ∪ B|
```

Examples:
- Em vs Em7: {E,G,B} vs {E,G,B,D} = 3/4 = **0.75**
- C vs Am: {C,E,G} vs {A,C,E} = 2/4 = **0.50**
- C vs F: {C,E,G} vs {F,A,C} = 1/5 = **0.20**
- Em vs Em: {E,G,B} vs {E,G,B} = 3/3 = **1.00**

Match categories:
- **Exact:** detected chord appears literally in the song's chord list
- **Related:** Jaccard >= 0.9 (e.g., chord is nearly identical)
- **Partial:** Jaccard >= 0.6 (shares most notes)
- **None:** Jaccard < 0.6 (different chord)

### Song Influence Knob

The `--song-influence` parameter (0.0 to 1.0) controls how strongly the song biases detection. It maps to three internal weights:

| Influence | out_of_song_penalty | related_chord_weight | in_song_weight |
|-----------|--------------------:|---------------------:|---------------:|
| 0.0       | 1.00 (no penalty)   | 1.00 (no reduction)  | 1.00 (no boost) |
| 0.25      | 0.76                | 0.90                 | 1.09           |
| 0.5       | 0.53                | 0.80                 | 1.18           |
| 0.75      | 0.29                | 0.70                 | 1.26           |
| 1.0       | 0.05 (heavy penalty)| 0.60                 | 1.35 (strong boost) |

At influence=0, raw detection is returned unmodified.
At influence=1, non-song chords are penalized to 5% of their original confidence while song chords are boosted to 135%.

Additionally, at higher influence values, the closest song chord is injected as a competing candidate with a boosted score, making it more likely to win over a penalized non-song detection.

---

## Chord Variant Mapping

Two independent mechanisms reduce display noise from near-identical chord variants:

### 1. Display Normalization (no song needed)

`normalize_chord_variant()` collapses similar chord names so the display doesn't jump between variants frame-to-frame:

| Detected | Normalized |
|----------|-----------|
| Em7      | Em        |
| Emin7    | Em        |
| Emin     | Em        |
| Cmaj7    | C         |
| Amaj7    | A         |

**Control:** Enabled by default. Disable with `--no-map-similar-variants` (CLI) or `map_similar_variants=false` (web).

### 2. Song-Based Collapse (requires --song)

When a song is active, detected variants are collapsed to whichever form appears in the song's chord list. If you detect "Em7" but the song lists "Em", the output is "Em".

This is built into the song constraint scoring and cannot be separately disabled — it is integral to the re-weighting logic.

### Controlling Both

| Desired behavior | Settings |
|---|---|
| Raw output, no mapping | No `--song`, add `--no-map-similar-variants` |
| Stable display, no song | Default (variant mapping on, no song) |
| Song-aware mapping | `--song <id>` with desired `--song-influence` |
| Song loaded but raw output | `--song <id> --song-influence 0.0` |

---

## Parameters Reference

### Core Detection Parameters

| Parameter | CLI Flag | Default | Range | Description |
|-----------|----------|---------|-------|-------------|
| Silence Threshold | `--silence-threshold` | 0.005 | 0.0-1.0 | RMS energy below which audio is treated as silence. Lower = more sensitive to quiet playing. |
| Confidence Threshold | `--confidence-threshold` | 0.45 | 0.0-1.0 | Minimum chord match confidence to display a result. Lower = more results but more false positives. |
| Chord Window | `--chord-window` | 0.3 | 0.0+ seconds | Duration of the temporal smoothing window. Collects predictions over this period, then picks the best via exponentially-weighted voting. Set to 0 for instant (per-frame) output. Higher values (1.0-2.0s) give smoother, more stable output. |
| Chord Window Confidence | `--chord-window-confidence` | 0.4 | 0.0-1.0 | Minimum average confidence from the smoothing window to output a result. |
| Instrument | `--instrument` | guitar | See presets | Selects frequency range preset for the instrument being detected. |
| Low Frequency | `--low-freq` | (from preset) | Hz | Custom low frequency cutoff. Overrides instrument preset. |
| High Frequency | `--high-freq` | (from preset) | Hz | Custom high frequency cutoff. Overrides instrument preset. |
| Overlap | `--overlap` | 0.75 | 0.0-0.9 | Window overlap ratio. Higher = more temporal resolution but more computation. 0.75 means each window shares 75% of samples with the previous window. |

### Song Constraint Parameters

| Parameter | CLI Flag | Default | Range | Description |
|-----------|----------|---------|-------|-------------|
| Song | `--song` | (none) | song ID | Load a song to constrain chord detection. Song IDs come from the songs manifest. |
| Song Influence | `--song-influence` | 0.7 | 0.0-1.0 | How strongly the song biases output. 0 = raw detection only, 1 = song chords heavily favored. |
| Map Similar Variants | `--no-map-similar-variants` | enabled | flag | When set, disables collapsing of similar chord variants (Em7 -> Em) for display. |

### Output Mode Parameters

| Parameter | CLI Flag | Default | Description |
|-----------|----------|---------|-------------|
| Show Frequencies | `--show-frequencies` | off | Include detected frequencies alongside chord output. |
| Show Chroma | `--show-chroma` | off | Include the 12-bin chroma vector in output. |
| Log Mode | `--log` | off | Show timestamped chord detections instead of overwriting the line. |
| Log Interval | `--log-interval` | 0.5s | Minimum interval between log entries. |
| Frequencies Only | `--frequencies-only` | off | Skip chord detection entirely; show only detected frequencies. |
| Notes Only | `--notes-only` | off | Skip chord detection entirely; show only detected note names. |
| Debug | `--debug` | off | Show audio levels and detection internals for threshold tuning. |

### Device and Timing Parameters

| Parameter | CLI Flag | Default | Description |
|-----------|----------|---------|-------------|
| List Devices | `--list-devices` | — | List available audio input devices and exit. |
| Device | `--device` | system default | Audio input device ID. Use `--list-devices` to see options. |
| Wait Time | `--wait-time` | 0.0s | Delay between processing iterations. |

### Frequencies/Notes-Only Mode Parameters

These only apply when using `--frequencies-only` or `--notes-only`. They have no effect in the default chord detection mode.

| Parameter | CLI Flag | Default | Description |
|-----------|----------|---------|-------------|
| Sensitivity | `--sensitivity` | 1.0 | Detection sensitivity multiplier (0.1-2.0). Higher = more peaks detected. |
| Single Pitch | `--single-pitch` | off | Use autocorrelation for single fundamental detection instead of multi-pitch FFT. |
| Show FFT | `--show-fft` | off | Show raw FFT analysis data. |
| Raw Frequencies | `--raw-frequencies` | off | Show unfiltered frequency peaks. |

### Web Server Parameters

These are command-line flags for `web_server.py` only:

| Parameter | Flag | Default | Description |
|-----------|------|---------|-------------|
| Host | `--host` | 0.0.0.0 | Network interface to bind to. |
| Port | `--port` | 9103 | Port number. |
| Reload | `--reload` | off | Auto-reload on code changes (development). |
| Log Level | `--log-level` | INFO | Server logging verbosity (DEBUG, INFO, WARNING, ERROR, CRITICAL). |
| Workers | `--workers` | 1 | Number of worker processes. Cannot use with `--reload`. |

All detection parameters can be set via URL query parameters or the web UI settings panel.

---

## File Structure

```
music_test/
├── chord_detector.py            CLI entry point
├── web_server.py                FastAPI web server with WebSocket
├── lib/
│   ├── music_understanding.py   Core algorithms: FFT, chroma, chord matching,
│   │                            song constraints, note detection
│   ├── audio_processing.py      Shared pipeline: process_audio_chunk()
│   ├── state.py                 AudioProcessingState: buffers, history,
│   │                            chord accumulator
│   ├── common.py                Audio constants: CHUNK, RATE, OVERLAP
│   ├── config.py                Unified config interface (argparse + dict)
│   ├── sound_capture.py         Sounddevice microphone capture (CLI)
│   ├── web_audio_processing.py  Web audio processing wrapper
│   ├── song_loader.py           Song data loading, chord similarity
│   └── output.py                Output formatters (console, dict)
├── songs/
│   ├── manifest.json            Song index
│   └── song_*.json              Individual song chord data
├── static/
│   └── js/main.js               Web frontend JavaScript
├── templates/
│   └── index.html               Web UI HTML
└── tests/
    └── conftest.py              Test fixtures
```

### Key Files

| File | Purpose |
|------|---------|
| `lib/music_understanding.py` | All detection algorithms. Contains `chroma_from_fft()`, `_match_chroma_to_chord()`, `detect_chord_from_buffer()`, `constrain_chord_to_song()`, `normalize_chord_variant()`, `CHORD_TEMPLATES`, `INSTRUMENT_PRESETS`. |
| `lib/audio_processing.py` | `process_audio_chunk()` — the shared pipeline that both CLI and web call. Handles mode dispatch (chord/frequencies/notes), calls the detection functions, applies confidence thresholding. Does NOT do temporal smoothing (callers handle that). |
| `lib/state.py` | `AudioProcessingState` — circular audio buffer, detection history (deque maxlen=8), chord stability counter, chord accumulator for temporal smoothing with `accumulate_chord()` / `get_best_chord()` / `is_window_complete()`. |
| `lib/common.py` | Constants: `CHUNK=4096`, `RATE=44100`, `OVERLAP_RATIO=0.75`, `HOP_SIZE=1024`, `BUFFER_SIZE=8192`. Getter/setter functions for overlap ratio. |

---

## Supported Chords

The chord template dictionary defines 14 chord qualities, applied across all 12 roots (168 total candidates):

| Suffix | Name | Intervals (semitones) | Example (C root) |
|--------|------|----------------------|-------------------|
| (none) | Major | 0, 4, 7 | C (C, E, G) |
| m | Minor | 0, 3, 7 | Cm (C, Eb, G) |
| 7 | Dominant 7th | 0, 4, 7, 10 | C7 (C, E, G, Bb) |
| maj7 | Major 7th | 0, 4, 7, 11 | Cmaj7 (C, E, G, B) |
| m7 | Minor 7th | 0, 3, 7, 10 | Cm7 (C, Eb, G, Bb) |
| 5 | Power Chord | 0, 7 | C5 (C, G) |
| sus2 | Suspended 2nd | 0, 2, 7 | Csus2 (C, D, G) |
| sus4 | Suspended 4th | 0, 5, 7 | Csus4 (C, F, G) |
| dim / ° | Diminished | 0, 3, 6 | Cdim (C, Eb, Gb) |
| aug / + | Augmented | 0, 4, 8 | Caug (C, E, G#) |
| 6 | Major 6th | 0, 4, 7, 9 | C6 (C, E, G, A) |
| m6 | Minor 6th | 0, 3, 7, 9 | Cm6 (C, Eb, G, A) |
| add9 | Added 9th | 0, 2, 4, 7 | Cadd9 (C, D, E, G) |
| 9 | Dominant 9th | 0, 2, 4, 7, 10 | C9 (C, D, E, G, Bb) |

---

## Instrument Presets

| Preset | Low Freq (Hz) | High Freq (Hz) | Typical Use |
|--------|--------------|----------------|-------------|
| guitar | 80 | 2000 | Acoustic/electric guitar |
| piano | 100 | 4000 | Piano/keyboard |
| bass | 40 | 800 | Bass guitar |
| violin | 200 | 3000 | Violin |
| cello | 65 | 1000 | Cello |
| flute | 250 | 2500 | Flute |
| clarinet | 150 | 1500 | Clarinet |
| saxophone | 100 | 800 | Saxophone |
| trumpet | 150 | 1000 | Trumpet |
| voice | 80 | 1000 | Vocals |

The frequency range affects which FFT peaks are considered during chroma extraction. Setting the right instrument preset filters out energy outside the instrument's range, reducing false detections from ambient noise or other instruments.

---

## Audio Constants

| Constant | Value | Derived From | Purpose |
|----------|-------|-------------|---------|
| CHUNK | 4096 samples | — | FFT frame size |
| RATE | 44100 Hz | — | Sample rate |
| CHANNELS | 1 | — | Mono audio |
| OVERLAP_RATIO | 0.75 | configurable | Window overlap |
| HOP_SIZE | 1024 samples | CHUNK * (1 - OVERLAP) | Stride between windows |
| BUFFER_SIZE | 8192 samples | CHUNK * 2 | Circular buffer size |
| Frame duration | ~93 ms | CHUNK / RATE | Time per FFT frame |
| Hop duration | ~23 ms | HOP_SIZE / RATE | Time between frames |
| FFT zero-pad | 4x (16384) | CHUNK * 4 | For ~2.7 Hz resolution |
| Peak threshold | 6% of max | — | Minimum peak amplitude |
| Harmonic tolerance | 3% | — | Frequency match for grouping |

---

## Usage Examples

### CLI Examples

**Basic chord detection (guitar, default settings):**
```bash
python chord_detector.py
```

**With a specific audio device:**
```bash
python chord_detector.py --list-devices
python chord_detector.py --device 3
```

**Lower sensitivity for noisy environments:**
```bash
python chord_detector.py --silence-threshold 0.02 --confidence-threshold 0.5
```

**Smoother output (longer smoothing window):**
```bash
python chord_detector.py --chord-window 1.0
```

**Instant output (no smoothing):**
```bash
python chord_detector.py --chord-window 0
```

**With song constraint:**
```bash
python chord_detector.py --song bg_rk_001 --song-influence 0.7
```

**Timestamped log output:**
```bash
python chord_detector.py --log --log-interval 1.0
```

**Debug mode (see audio levels and detection internals):**
```bash
python chord_detector.py --debug
```

**Piano preset with custom frequency range:**
```bash
python chord_detector.py --instrument piano
python chord_detector.py --low-freq 100 --high-freq 3000
```

**Frequencies-only mode (skip chord detection):**
```bash
python chord_detector.py --frequencies-only --sensitivity 1.5
```

**Notes-only mode:**
```bash
python chord_detector.py --notes-only
```

**Show chroma vector and frequencies alongside chords:**
```bash
python chord_detector.py --show-chroma --show-frequencies
```

**Raw output, no variant mapping:**
```bash
python chord_detector.py --no-map-similar-variants
```

### Web Interface

**Start the web server:**
```bash
python web_server.py
python web_server.py --port 8080 --log-level DEBUG
```

Then open `http://localhost:9103/` in a browser.

**Configure via URL parameters:**
```
http://localhost:9103/?instrument=guitar&confidence_threshold=0.5&debug=true
http://localhost:9103/?chord_window=1.0&song_influence=0.8
http://localhost:9103/?frequencies_only=true&sensitivity=1.5
```

All detection parameters from the CLI are available as URL query parameters (use underscores instead of hyphens). The web UI also provides a settings panel with sliders for chord window, chord window confidence, and song influence.
