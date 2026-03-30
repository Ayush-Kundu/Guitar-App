/**
 * Level-specific technique and theory paths (beginner through expert).
 * Novice uses the main techniquePath/theoryPath in learning-journey.ts.
 */

import type { Unit, Lesson } from './learning-journey';

function lesson(
  id: string,
  title: string,
  subtitle: string,
  description: string,
  estimatedTime: string,
  type: 'technique' | 'theory',
  quizRequired?: boolean,
  practiceChords?: string[]
): Lesson {
  return { id, title, subtitle, description, estimatedTime, type, quizRequired, practiceChords };
}

function unit(
  id: string,
  number: number,
  title: string,
  subtitle: string,
  description: string,
  icon: string,
  prerequisiteUnits: string[],
  lessons: Lesson[]
): Unit {
  return { id, number, title, subtitle, description, icon, prerequisiteUnits, lessons };
}

// =============================================================================
// BEGINNER — Build on novice: refine fundamentals, add open chord mastery and basic theory application
// =============================================================================

export const techniquePathBeginner: Unit[] = [
  unit('tech-b-unit-1', 1, 'Refining Fundamentals', 'Sharpen what you learned', 'Strengthen posture, hand position, and clean fretting so every note rings clearly. Build speed and accuracy on the basics.', '🎸', [], [
    lesson('tech-b-1-1', 'Posture Check', 'Sit and hold for long practice', 'Review sitting position, guitar angle, and where each hand rests. Small adjustments prevent fatigue and injury.', '5 min', 'technique'),
    lesson('tech-b-1-2', 'Clean Fretting and String Clarity', 'Fingertip, behind the fret', 'Revisit pressing right behind the fret wire and using fingertips. Play each chord and check every string rings. Fix buzz and muting with finger arch and thumb position.', '10 min', 'technique', true)
  ]),
  unit('tech-b-unit-2', 2, 'Open Chords Mastery', 'Em, A, D, G, C — clear and fast', 'Get every open chord clean and switch between them without pausing. Build the foundation for hundreds of songs.', '🎵', ['tech-b-unit-1'], [
    lesson('tech-b-2-1', 'Em, A, D Together', 'The core three', 'Practice Em, A, and D until each sounds full. Then switch between them in time: Em–A–D–A.', '15 min', 'technique'),
    lesson('tech-b-2-2', 'Adding G and C', 'Expand your chord set', 'Add G major and C major. Practice G–C–Em–D and other common progressions.', '15 min', 'technique'),
    lesson('tech-b-2-3', 'Faster Chord Changes', 'No dead time', 'Reduce the gap between chords. Use a metronome and slow tempo, then speed up.', '15 min', 'technique'),
    lesson('tech-b-2-4', 'Full Open Chord Set', 'All together', 'Review all open chords and play a 4-chord progression (e.g. G–D–Em–C) with clean changes.', '15 min', 'technique', true)
  ]),
  unit('tech-b-unit-3', 3, 'Strumming Foundations', 'Down, up, and patterns', 'Lock in down-up motion and learn 2–3 common strum patterns. Apply them to the chords you know.', '🎶', ['tech-b-unit-2'], [
    lesson('tech-b-3-1', 'Steady Down-Up', 'Constant motion', 'Keep your hand moving down-up in time even when you skip a strum. Build rhythm consistency.', '10 min', 'technique'),
    lesson('tech-b-3-2', 'D-D-U-U-D-U', 'Your first full pattern', 'Learn this pattern and play it over G, C, Em, D. Count 1-2-&-3-4-& out loud.', '15 min', 'technique'),
    lesson('tech-b-3-3', 'Patterns in Songs', 'Apply to real tunes', 'Use your strum patterns with simple song progressions. Match the feel of the song.', '15 min', 'technique', true)
  ]),
  unit('tech-b-unit-4', 4, 'Basic Rhythm and Timing', 'Play in time', 'Understand beat, tempo, and how to stay in time. Use a metronome and count out loud.', '⏱️', ['tech-b-unit-3'], [
    lesson('tech-b-4-1', 'Finding the Beat', 'Tap and count', 'Tap your foot to music and count 1-2-3-4. Then strum on the beat only.', '10 min', 'technique'),
    lesson('tech-b-4-2', 'Metronome Basics', 'Play with a click', 'Set a slow BPM and play one chord per click. Then two strums per click.', '10 min', 'technique'),
    lesson('tech-b-4-3', 'Strumming on the Beat', 'No rushing or dragging', 'Keep your strum pattern aligned with the metronome. Practice until it feels natural.', '15 min', 'technique', true)
  ]),
  unit('tech-b-unit-5', 5, 'More Chord Shapes', 'Am, E, B7 and variants', 'Add A minor, E major, and B7. These open up more songs and progressions.', '✋', ['tech-b-unit-4'], [
    lesson('tech-b-5-1', 'A Minor and E Major', 'Two essential chords', 'Am and E are used in countless songs. Practice switching between C, Am, G, Em.', '15 min', 'technique'),
    lesson('tech-b-5-2', 'B7 and Dominant 7ths', 'The bluesy sound', 'B7 introduces the dominant seventh. Use it in progressions like E–A–B7–E.', '15 min', 'technique'),
    lesson('tech-b-5-3', 'Open Chords: Final Review', 'All together', 'Review all open chords and play a 4-chord song (e.g. G–D–Em–C) with a strum pattern.', '15 min', 'technique', true)
  ]),
  unit('tech-b-unit-6', 6, 'First Songs and Application', 'Play real songs', 'Apply everything: chords, strumming, and timing. Learn 1–2 simple songs from start to finish.', '🎤', ['tech-b-unit-5'], [
    lesson('tech-b-6-1', 'Choosing a First Song', 'Right difficulty', 'Pick a song that uses only chords you know and a simple strum pattern.', '5 min', 'technique'),
    lesson('tech-b-6-2', 'Learning the Progression', 'Chords in order', 'Memorize the chord order and practice the changes before adding the full pattern.', '15 min', 'technique'),
    lesson('tech-b-6-3', 'Playing Through', 'Start to finish', 'Play the song with a metronome or backing track. Focus on steady time and clean chords.', '20 min', 'technique', true)
  ]),
  unit('tech-b-unit-7', 7, 'Reading Chord Charts', 'Decode symbols and diagrams', 'Understand chord diagrams, capo notation, and common symbols (repeat, strum direction). Apply to any song sheet.', '📋', ['tech-b-unit-6'], [
    lesson('tech-b-7-1', 'Chord Diagram Basics', 'Dots and numbers', 'Read a chord box: strings, frets, which finger where. Practice from a chart.', '10 min', 'technique'),
    lesson('tech-b-7-2', 'Capo and Transposition', 'Same shape, new key', 'What a capo does. How "capo 2" changes the written chords. Play in a new key.', '15 min', 'technique'),
    lesson('tech-b-7-3', 'Charts in the Wild', 'Real song sheets', 'Use a full chord chart: verse, chorus, repeat signs. Play through a song from a chart.', '15 min', 'technique', true)
  ]),
  unit('tech-b-unit-8', 8, 'Building a Practice Routine', 'What to do when you pick up the guitar', 'Structure your practice: warm-up, chords, strumming, one song. Short daily sessions beat rare long ones.', '📅', ['tech-b-unit-7'], [
    lesson('tech-b-8-1', 'Warm-Up and Finger Stretch', 'Five minutes first', 'Simple finger exercises and slow chord changes to start. Prevent strain and improve consistency.', '10 min', 'technique'),
    lesson('tech-b-8-2', 'Chunk Your Time', 'Technique, then songs', 'Divide practice: 5 min warm-up, 10 min chord changes, 10 min strumming, 10 min one song.', '10 min', 'technique'),
    lesson('tech-b-8-3', 'Staying Consistent', 'Little and often', 'Why 15–20 minutes daily beats 2 hours once a week. Set a time and stick to it.', '10 min', 'technique', true)
  ]),
  unit('tech-b-unit-9', 9, 'Introduction to Fingerpicking', 'Thumb and fingers', 'Assign your thumb to bass strings and fingers to treble. Simple patterns to prepare for fingerstyle.', '🤚', ['tech-b-unit-8'], [
    lesson('tech-b-9-1', 'Thumb on Bass Strings', 'Alternating bass', 'Play the root note with your thumb on beats 1 and 3. Keep a steady pulse.', '10 min', 'technique'),
    lesson('tech-b-9-2', 'Adding Finger Plucks', 'Bass and treble', 'Add index and middle finger on the higher strings. Simple p-i-m pattern over one chord.', '15 min', 'technique', true)
  ]),
  unit('tech-b-unit-10', 10, 'Next Steps and Review', 'Solidify and look ahead', 'Review posture, open chords, strumming, and timing. Identify one area to improve and what comes next (barre chords, more songs).', '🎯', ['tech-b-unit-9'], [
    lesson('tech-b-10-1', 'Full Review', 'Run through the basics', 'Play your best 4-chord song with a strum pattern. Check posture, clean chords, and steady time.', '15 min', 'technique'),
    lesson('tech-b-10-2', 'Set a Next Goal', 'What to tackle next', 'Choose one goal: faster changes, a new song, or preparing for barre chords. Plan your next week of practice.', '10 min', 'technique', true)
  ])
];

export const theoryPathBeginner: Unit[] = [
  unit('theory-b-unit-1', 1, 'Notes and Frets in Practice', 'Apply the basics', 'Review the musical alphabet and note names on the fretboard. Connect theory to the chords you play.', '🔤', [], [
    lesson('theory-b-1-1', 'Note Names on E and A', 'Roots of your chords', 'Name the notes on the low E and A strings. These are the roots of most open and barre chords.', '10 min', 'theory'),
    lesson('theory-b-1-2', 'Chord Roots and Half Steps', 'Which note names the chord?', 'Identify the root of C, G, D, A, E, Am, Em. Review: one fret = one half step. Find the same note on different strings.', '10 min', 'theory', true)
  ]),
  unit('theory-b-unit-2', 2, 'Intervals and Chord Building', 'Why chords sound the way they do', 'Learn how major and minor chords are built from the root, third, and fifth. Apply to open chords.', '🎹', ['theory-b-unit-1'], [
    lesson('theory-b-2-1', 'Root, Third, Fifth', 'The triad', 'Every basic chord has these three notes. See how they appear in your open C, G, and D shapes.', '15 min', 'theory'),
    lesson('theory-b-2-2', 'Major vs Minor Third', 'One note difference', 'The third is what makes a chord major or minor. Hear and see the difference in E vs Em.', '10 min', 'theory'),
    lesson('theory-b-2-3', 'Building from the Root', 'Formula for major and minor', 'Use the interval formula to build any major or minor chord from its root note.', '15 min', 'theory', true)
  ]),
  unit('theory-b-unit-3', 3, 'Keys and I–IV–V', 'The most common progression', 'Understand what a "key" is and why I–IV–V (and I–V–vi–IV) appear in so many songs.', '🔑', ['theory-b-unit-2'], [
    lesson('theory-b-3-1', 'What Is a Key?', 'Home base', 'The key tells you which note and chord feel like "home." Listen for resolution in simple songs.', '10 min', 'theory'),
    lesson('theory-b-3-2', 'I, IV, and V in a Key', 'The primary chords', 'In any major key, the I, IV, and V chords are major. Example: in G, that\'s G, C, D.', '15 min', 'theory'),
    lesson('theory-b-3-3', 'Applying I–IV–V', 'Play in different keys', 'Play the same I–IV–V pattern in G and in C. Hear how the key changes the sound.', '15 min', 'theory', true)
  ]),
  unit('theory-b-unit-4', 4, 'Rhythm and Time', 'Beats, measures, and counting', 'Deepen your understanding of 4/4 time, beat, and how strum patterns fit the measure.', '⏱️', ['theory-b-unit-3'], [
    lesson('theory-b-4-1', 'Measures and Beats', 'Four beats per bar', 'Count 1-2-3-4 for one measure. Understand downbeats and upbeats.', '10 min', 'theory'),
    lesson('theory-b-4-2', 'Where Strumming Fits', 'On the beat and between', 'Map your strum pattern to beat numbers. "And" = the upbeat between beats.', '10 min', 'theory'),
    lesson('theory-b-4-3', 'Tempo and Feel', 'Slow vs fast', 'Same pattern at 60 BPM vs 120 BPM. How tempo changes the feel of a song.', '10 min', 'theory', true)
  ]),
  unit('theory-b-unit-5', 5, 'Chord Families', 'Which chords belong together', 'Learn which chords naturally appear in a key. Understand why some progressions sound "right."', '🏠', ['theory-b-unit-4'], [
    lesson('theory-b-5-1', 'Diatonic Chords', 'Chords in the key', 'In C major: C, Dm, Em, F, G, Am, Bdim. Only these chords use notes from the scale.', '15 min', 'theory'),
    lesson('theory-b-5-2', 'Common Progressions', 'I–V–vi–IV and more', 'Why G–D–Em–C and similar patterns work. Roman numerals for chord progressions.', '15 min', 'theory'),
    lesson('theory-b-5-3', 'Minor Key Basics', 'A minor and its family', 'A minor shares notes with C major. Introduction to relative major/minor.', '10 min', 'theory', true)
  ]),
  unit('theory-b-unit-6', 6, 'Ear and Application', 'Hear and apply', 'Simple ear training: recognize major vs minor, and match chord progressions by ear.', '👂', ['theory-b-unit-5'], [
    lesson('theory-b-6-1', 'Major vs Minor by Ear', 'Bright vs dark', 'Listen to chord progressions and identify when the mood shifts from major to minor.', '10 min', 'theory'),
    lesson('theory-b-6-2', 'Recognizing I–IV–V', 'Hear the pattern', 'Play and listen to I–IV–V in different keys. Train your ear to hear the "home" chord.', '15 min', 'theory'),
    lesson('theory-b-6-3', 'Using Theory in Songs', 'Put it together', 'Analyze a simple song: key, chord family, and where I, IV, V appear.', '15 min', 'theory', true)
  ]),
  unit('theory-b-unit-7', 7, 'Scale Basics', 'The major scale and Do Re Mi', 'Learn the major scale in one position. How it relates to chords and melody. Do-Re-Mi and scale degrees.', '📐', ['theory-b-unit-6'], [
    lesson('theory-b-7-1', 'The Major Scale Pattern', 'Whole and half steps', 'Major scale formula: W-W-H-W-W-W-H. Find it on one string and in one position.', '15 min', 'theory'),
    lesson('theory-b-7-2', 'Scale Degrees 1–7', 'Numbering the notes', 'Root = 1, then 2, 3, 4, 5, 6, 7. How chord tones (1, 3, 5) come from the scale.', '10 min', 'theory'),
    lesson('theory-b-7-3', 'Playing a Melody in the Scale', 'Notes that fit', 'Play a simple melody using only major scale notes. Hear how scale and melody connect.', '15 min', 'theory', true)
  ]),
  unit('theory-b-unit-8', 8, 'Putting It All Together', 'Theory in real music', 'Review: notes, intervals, keys, rhythm, chord families, and ear. Apply to one song from start to finish.', '🎯', ['theory-b-unit-7'], [
    lesson('theory-b-8-1', 'Review: From Note to Chord', 'The chain', 'Note → interval → chord. Key → scale → chord family. One page summary.', '15 min', 'theory'),
    lesson('theory-b-8-2', 'Analyze One Song', 'Full pass', 'Pick a song. Write key, scale, chord progression (Roman numerals), and form.', '20 min', 'theory'),
    lesson('theory-b-8-3', 'Theory as a Map', 'Use it, don\'t memorize and forget', 'How to keep using theory when you learn new songs and play with others.', '10 min', 'theory', true)
  ]),
  unit('theory-b-unit-9', 9, 'Sharps and Flats on the Neck', 'Black keys on guitar', 'Sharps raise a note by one half step; flats lower it. Find sharp and flat notes on the E and A strings. Same fret, different name (e.g. F#/Gb).', '🎵', ['theory-b-unit-8'], [
    lesson('theory-b-9-1', 'Sharp and Flat Names', 'One fret, two names', 'Every fret can have two note names: F# is the same as Gb. Learn the pattern on the neck.', '10 min', 'theory'),
    lesson('theory-b-9-2', 'Applying to Chords', 'Why F and F# matter', 'Open chords use natural notes; barre chords use sharps and flats. See how chord names match fretboard positions.', '10 min', 'theory', true)
  ]),
  unit('theory-b-unit-10', 10, 'Summary and Next Steps', 'Bridge to elementary theory', 'Review: notes, intervals, keys, chord families, and the major scale. Plan what to study next: diatonic harmony, seventh chords, or transposition.', '📚', ['theory-b-unit-9'], [
    lesson('theory-b-10-1', 'One-Page Theory Summary', 'Key concepts', 'Write or say: musical alphabet, half step, root-third-fifth, key, I–IV–V, major scale formula.', '15 min', 'theory'),
    lesson('theory-b-10-2', 'Set a Theory Goal', 'What to learn next', 'Choose one: seventh chords, natural minor, transposition with capo, or ear training. Find one resource and one practice habit.', '10 min', 'theory', true)
  ])
];

// =============================================================================
// ELEMENTARY — Barre foundations, movable shapes, and deeper harmony
// =============================================================================

export const techniquePathElementary: Unit[] = [
  unit('tech-e-unit-1', 1, 'Clean Tone and Dynamics', 'Control volume and clarity', 'Play with consistent tone and introduce soft/loud dynamics. Mute unwanted strings cleanly.', '✨', [], [
    lesson('tech-e-1-1', 'Even Pressure and Tone', 'No weak strings', 'Every note in a chord should be equally clear. Diagnose and fix dead or buzzing strings.', '10 min', 'technique'),
    lesson('tech-e-1-2', 'Dynamic Control and Muting', 'Soft, loud, and silence', 'Play the same chord softly then loudly. Use fretting fingers or palm to mute strings that shouldn\'t ring.', '15 min', 'technique', true)
  ]),
  unit('tech-e-unit-2', 2, 'Barre Chord Foundations', 'One finger across the neck', 'Build strength and accuracy for barre chords. Master the F major and F minor shapes.', '🔓', ['tech-e-unit-1'], [
    lesson('tech-e-2-1', 'Barre Strength Exercises', 'All strings at once', 'Press the index across all six strings at fret 1. Check each string rings. Move to other frets.', '15 min', 'technique'),
    lesson('tech-e-2-2', 'F Major and F Minor', 'The first barre chords', 'F major (E shape) and F minor. Practice until clean, then move the shape up the neck.', '20 min', 'technique'),
    lesson('tech-e-2-3', 'Moving Barre Shapes', 'Same shape, new key', 'F at fret 1, G at fret 3, A at fret 5. Root on the low E string.', '15 min', 'technique'),
    lesson('tech-e-2-4', 'Barre Chord Endurance', 'Clean and consistent', 'Hold a barre for 30 seconds. Switch between F and Fm. Build strength without tension.', '15 min', 'technique', true)
  ]),
  unit('tech-e-unit-3', 3, 'Strumming Variations', 'Accents and patterns', 'Add accents and syncopation. Learn patterns that fit different genres.', '🎶', ['tech-e-unit-2'], [
    lesson('tech-e-3-1', 'Accented Beats', 'Stress the 1 and 3', 'Emphasize certain beats in your strum pattern. Downstroke accent on 1 and 3.', '10 min', 'technique'),
    lesson('tech-e-3-2', 'Syncopation Basics', 'Off the beat', 'Strum on the "and" of the beat. Simple syncopated pattern: D-U-D-U with skips.', '15 min', 'technique'),
    lesson('tech-e-3-3', 'Genre-Style Patterns', 'Folk, rock, ballad', 'One pattern for folk, one for rock, one for ballad. Match pattern to song style.', '15 min', 'technique', true)
  ]),
  unit('tech-e-unit-4', 4, 'Fingerstyle Introduction', 'Thumb and fingers', 'Assign thumb to bass strings and fingers to treble. Simple arpeggio patterns.', '🤚', ['tech-e-unit-3'], [
    lesson('tech-e-4-1', 'p-i-m-a and String Assignment', 'Thumb and three fingers', 'Thumb on 6-5-4, index-middle-ring on 3-2-1. Practice alternating bass and treble.', '15 min', 'technique'),
    lesson('tech-e-4-2', 'Simple Arpeggio', 'p-i-m-i pattern', 'Play p-i-m-i repeatedly over a chord. Keep the bass steady, treble flowing.', '15 min', 'technique'),
    lesson('tech-e-4-3', 'Travis Picking Basics', 'Alternating bass', 'Alternate bass between root and fifth while fingers play treble notes.', '20 min', 'technique', true)
  ]),
  unit('tech-e-unit-5', 5, 'Movable Shapes and Power Chords', 'Play any key with one shape', 'Power chords (root-fifth) and other movable shapes. Essential for rock and transposition.', '🎸', ['tech-e-unit-4'], [
    lesson('tech-e-5-1', 'Power Chord Shape', 'Two or three notes', 'Root on low E or A, fifth two frets up. Move the shape to any fret for any key.', '15 min', 'technique'),
    lesson('tech-e-5-2', 'Power Chord Progressions', 'Rock rhythm', 'Play I–IV–V in power chords. Palm muting for a tighter sound.', '15 min', 'technique'),
    lesson('tech-e-5-3', 'Movable Minor Shape', 'Em shape up the neck', 'Use the Em barre shape to play Fm, Gm, Am, etc. Root on the low E string.', '15 min', 'technique', true)
  ]),
  unit('tech-e-unit-6', 6, 'Expression and Timing', 'Bends, vibrato, and groove', 'Add expression: light bends and vibrato. Lock in with a click and play with a backing track.', '💫', ['tech-e-unit-5'], [
    lesson('tech-e-6-1', 'Half-Step Bends', 'Pitch with your finger', 'Bend a note up to match the next fret. Use multiple fingers behind the fretting finger.', '15 min', 'technique'),
    lesson('tech-e-6-2', 'Vibrato on Sustained Notes', 'Make it sing', 'Add vibrato to long notes. Wobble the pitch slightly with your fretting hand.', '10 min', 'technique'),
    lesson('tech-e-6-3', 'Playing With a Backing Track', 'Real-world timing', 'Play along with a simple backing track. Focus on staying in time and fitting the groove.', '20 min', 'technique', true)
  ]),
  unit('tech-e-unit-7', 7, 'A Shape and E Shape Barres', 'Two families of barre chords', 'Master both the E-based and A-based barre shapes. Root on low E vs root on A. Move them anywhere.', '🔒', ['tech-e-unit-6'], [
    lesson('tech-e-7-1', 'E Shape Up the Neck', 'F, G, A, B', 'The F major shape moved to fret 3 = G, fret 5 = A. Root on string 6.', '15 min', 'technique'),
    lesson('tech-e-7-2', 'A Shape Barre', 'Bm, Cm, Dm', 'Barre at fret 2 with A minor shape = Bm. Move to get Cm, Dm, etc. Root on string 5.', '20 min', 'technique'),
    lesson('tech-e-7-3', 'Choosing E vs A Shape', 'When to use which', 'Same chord, two shapes. Use E for low register, A for higher or different voicing.', '15 min', 'technique', true)
  ]),
  unit('tech-e-unit-8', 8, 'Songs With Barre Chords', 'Apply barres to real tunes', 'Learn 1–2 songs that use barre chords. Switch between open and barre shapes in one song.', '🎤', ['tech-e-unit-7'], [
    lesson('tech-e-8-1', 'Songs That Use F and Bm', 'Common barre chords', 'Many songs use F, Bm, or moveable shapes. Find one that fits your level.', '15 min', 'technique'),
    lesson('tech-e-8-2', 'Mixing Open and Barre', 'One song, both worlds', 'Play a verse with open chords and a chorus with barres (or vice versa). Smooth transitions.', '20 min', 'technique'),
    lesson('tech-e-8-3', 'Performance Ready', 'Play through without stopping', 'Run the song start to finish. Focus on clean barres and steady time.', '20 min', 'technique', true)
  ]),
  unit('tech-e-unit-9', 9, 'Reading and Memorizing', 'Charts and memory', 'Read a full song chart: verse, chorus, bridge, repeat signs. Memorize one song so you can play without the sheet.', '📋', ['tech-e-unit-8'], [
    lesson('tech-e-9-1', 'Full Chart Reading', 'Sections and repeats', 'Follow a chart from top to bottom. D.S., D.C., and repeat bars. Play one song from a chart only.', '15 min', 'technique'),
    lesson('tech-e-9-2', 'Memorization Strategies', 'Chunk by section', 'Memorize verse, then chorus, then bridge. Use chord progression logic (I–IV–V) to recall.', '15 min', 'technique', true)
  ]),
  unit('tech-e-unit-10', 10, 'Elementary Recap and Next Level', 'Solidify and look ahead', 'Review: clean tone, barres, strumming, fingerstyle, power chords, expression. Identify one strength and one area to grow before intermediate (e.g. alternate picking, arpeggios).', '🎯', ['tech-e-unit-9'], [
    lesson('tech-e-10-1', 'Run Through Your Repertoire', 'Play 2–3 songs', 'Play two or three songs that use open and barre chords. Focus on time and tone.', '20 min', 'technique'),
    lesson('tech-e-10-2', 'Set an Intermediate Goal', 'What to tackle next', 'Choose one: alternate picking, arpeggios, lead basics, or a harder song. Plan your next month.', '10 min', 'technique', true)
  ])
];

export const theoryPathElementary: Unit[] = [
  unit('theory-e-unit-1', 1, 'Diatonic Harmony', 'Chords in the key', 'Deepen understanding of how chords are built from the scale. Diatonic triads in major and minor.', '🎹', [], [
    lesson('theory-e-1-1', 'Scale Degrees and Triads', 'Building from each note', 'Build a triad on each degree of the major scale. I, ii, iii, IV, V, vi, vii°.', '15 min', 'theory'),
    lesson('theory-e-1-2', 'Chord Quality in the Key', 'Major, minor, diminished', 'Why I, IV, V are major; ii, iii, vi are minor; vii° is diminished.', '15 min', 'theory'),
    lesson('theory-e-1-3', 'Natural Minor Scale', 'The minor key', 'Natural minor scale and its diatonic chords. Relative major and minor.', '15 min', 'theory', true)
  ]),
  unit('theory-e-unit-2', 2, 'Seventh Chords', 'Adding the seventh', 'Major 7, dominant 7, and minor 7. How they sound and where they appear.', '🎵', ['theory-e-unit-1'], [
    lesson('theory-e-2-1', 'Dominant 7 (7)', 'The bluesy sound', 'Add a minor 7th to a major triad. C7, G7, A7. Used in blues and dominant function.', '15 min', 'theory'),
    lesson('theory-e-2-2', 'Major 7 (maj7)', 'Jazzy and smooth', 'Add a major 7th to a major triad. Cmaj7, Fmaj7. Tension and color.', '10 min', 'theory'),
    lesson('theory-e-2-3', 'Minor 7 (m7)', 'Darker color', 'Minor triad plus minor 7th. Dm7, Em7, Am7. Common in jazz and soul.', '15 min', 'theory', true)
  ]),
  unit('theory-e-unit-3', 3, 'Cadences and Resolution', 'How phrases end', 'Authentic, plagal, and half cadences. Hear how progressions resolve or leave tension.', '🔚', ['theory-e-unit-2'], [
    lesson('theory-e-3-1', 'V–I (Authentic)', 'Full resolution', 'The strongest resolution. Dominant to tonic. Hear it in songs.', '10 min', 'theory'),
    lesson('theory-e-3-2', 'IV–I (Plagal)', 'The "amen" cadence', 'Softer resolution. Common at the end of hymns and pop songs.', '10 min', 'theory'),
    lesson('theory-e-3-3', 'Half Cadence', 'Ending on V', 'Phrase ends on the dominant. Creates expectation for the next section.', '10 min', 'theory', true)
  ]),
  unit('theory-e-unit-4', 4, 'Transposition and the Capo', 'Same song, different key', 'Transpose chord progressions to new keys. Use the capo to keep shapes and change key.', '🔑', ['theory-e-unit-3'], [
    lesson('theory-e-4-1', 'Transposing by Scale Degree', 'Numbers stay the same', 'I–V–vi–IV in G vs in C. Find the new root and build the progression.', '15 min', 'theory'),
    lesson('theory-e-4-2', 'Capo as a Tool', 'Raise the pitch', 'Capo on fret 2: open shapes sound a whole step higher. Play in B with G shapes.', '10 min', 'theory'),
    lesson('theory-e-4-3', 'Singer-Friendly Keys', 'When to transpose', 'Transpose to suit vocal range. Use capo or new chord shapes.', '10 min', 'theory', true)
  ]),
  unit('theory-e-unit-5', 5, 'Fretboard Logic', 'Notes and shapes', 'Octave shapes and note locations. Find any note quickly. Connect barre chords to the fretboard map.', '🗺️', ['theory-e-unit-4'], [
    lesson('theory-e-5-1', 'Octave Shapes', 'Same note, different place', 'Patterns to find the same note on different strings. Essential for navigation.', '15 min', 'theory'),
    lesson('theory-e-5-2', 'Roots of Barre Chords', 'Where the chord lives', 'Barre chord root on E and A strings. Name the chord at any fret.', '15 min', 'theory'),
    lesson('theory-e-5-3', 'Quick Note Finding', 'Landmarks', 'Fret 5 = next string (except G–B). Fret 12 = octave. Use them to find notes fast.', '10 min', 'theory', true)
  ]),
  unit('theory-e-unit-6', 6, 'Modes Introduction', 'Beyond major and minor', 'What is a mode? Ionian, Aeolian, and Mixolydian in simple terms.', '📐', ['theory-e-unit-5'], [
    lesson('theory-e-6-1', 'Modes as Scale Starting Points', 'Same notes, new root', 'C major scale starting on A = A Aeolian (natural minor). Starting on G = G Mixolydian.', '15 min', 'theory'),
    lesson('theory-e-6-2', 'Mixolydian and Dominant', 'The bluesy mode', 'G Mixolydian = G major with flat 7. Used in rock and blues.', '15 min', 'theory'),
    lesson('theory-e-6-3', 'Hearing Modes', 'Apply to playing', 'Play the same pattern in Ionian vs Mixolydian. Hear the difference.', '15 min', 'theory', true)
  ]),
  unit('theory-e-unit-7', 7, 'Chord Voicings and Inversions', 'Same chord, different shapes', 'Different ways to play the same chord: open, barre, and simple inversions. Bass note changes the color.', '🎹', ['theory-e-unit-6'], [
    lesson('theory-e-7-1', 'Voicing and Bass Note', 'Which note is lowest', 'C major with E in the bass vs G in the bass. How it changes the sound.', '15 min', 'theory'),
    lesson('theory-e-7-2', 'Inversions on Guitar', 'First and second inversion', 'Root position, first inversion (3rd in bass), second inversion (5th in bass). Find them on the neck.', '20 min', 'theory'),
    lesson('theory-e-7-3', 'Using Inversions for Smooth Bass', 'Voice leading in progressions', 'Connect chords with stepwise bass motion using inversions.', '15 min', 'theory', true)
  ]),
  unit('theory-e-unit-8', 8, 'Application to Repertoire', 'Theory in the songs you play', 'Take 2–3 songs you know. Identify key, chord function, and where theory explains the "why."', '🎯', ['theory-e-unit-7'], [
    lesson('theory-e-8-1', 'Song 1: Key and Progression', 'Full analysis', 'Write the key, chord symbols, and Roman numerals for one song.', '20 min', 'theory'),
    lesson('theory-e-8-2', 'Song 2: Cadences and Form', 'Where it resolves', 'Mark the cadences (V–I, IV–I) and label the form (verse, chorus).', '20 min', 'theory'),
    lesson('theory-e-8-3', 'Song 3: Modes or 7ths', 'If applicable', 'If the song uses Mixolydian or 7th chords, identify them and say why they work.', '15 min', 'theory', true)
  ]),
  unit('theory-e-unit-9', 9, 'Ear and Sight', 'Recognize and notate', 'Recognize I–IV–V and I–V–vi–IV by ear. Write a short progression in Roman numerals and play it in two keys.', '👂', ['theory-e-unit-8'], [
    lesson('theory-e-9-1', 'Progressions by Ear', 'I–IV–V and I–V–vi–IV', 'Listen to a progression and identify whether it is I–IV–V or I–V–vi–IV. Play along once you hear it.', '15 min', 'theory'),
    lesson('theory-e-9-2', 'Notate and Transpose', 'Write then move', 'Write a 4-bar progression in Roman numerals. Play it in C and in G (or A).', '15 min', 'theory', true)
  ]),
  unit('theory-e-unit-10', 10, 'Elementary Theory Summary', 'Bridge to intermediate', 'Review: diatonic harmony, 7th chords, cadences, capo, fretboard logic, modes, voicings. Pick one topic to deepen and one song to fully analyze.', '📚', ['theory-e-unit-9'], [
    lesson('theory-e-10-1', 'One-Page Summary', 'Key concepts', 'List: diatonic triads, dom7/maj7/min7, V–I and IV–I, transposition, octave shapes, Mixolydian.', '15 min', 'theory'),
    lesson('theory-e-10-2', 'Next Theory Goal', 'Modal harmony or blues', 'Choose: modal progressions, voice leading, or blues harmony. Find one resource and one practice habit.', '10 min', 'theory', true)
  ])
];

// =============================================================================
// INTERMEDIATE — Lead basics, arpeggios, and harmony in action
// =============================================================================

export const techniquePathIntermediate: Unit[] = [
  unit('tech-i-unit-1', 1, 'Alternate Picking and Accuracy', 'Speed and clarity', 'Strict alternate picking for scales and riffs. Build speed without sacrificing tone.', '🎯', [], [
    lesson('tech-i-1-1', 'Alternate Picking Rules', 'Down-up-down-up', 'One note per pick stroke, alternating direction. Start slow with a metronome.', '15 min', 'technique'),
    lesson('tech-i-1-2', 'Scale in One Position', 'One finger per fret', 'Play a major scale in one position with alternate picking. Keep notes even.', '15 min', 'technique'),
    lesson('tech-i-1-3', 'Riff with Alternate Picking', 'Apply to a real line', 'Learn a short riff using strict alternate picking. Increase tempo gradually.', '20 min', 'technique', true)
  ]),
  unit('tech-i-unit-2', 2, 'Arpeggios', 'Chord tones one by one', 'Play chord tones in sequence. Major and minor arpeggios in one position.', '🎵', ['tech-i-unit-1'], [
    lesson('tech-i-2-1', 'Major Arpeggio Shape', 'Root, third, fifth', 'Pick each note of a major chord in order. One position on the neck.', '15 min', 'technique'),
    lesson('tech-i-2-2', 'Minor Arpeggio', 'Lower the third', 'Same shape as major but with a flatted third. Practice over a backing chord.', '15 min', 'technique'),
    lesson('tech-i-2-3', 'Arpeggio in a Solo', 'Use in a phrase', 'Insert an arpeggio into a simple solo idea. Connect chord tones to scales.', '20 min', 'technique', true)
  ]),
  unit('tech-i-unit-3', 3, 'Hammer-Ons, Pull-Offs, and Legato', 'Smooth and fast', 'Develop legato technique. Hammer-ons and pull-offs in scale patterns and licks.', '💫', ['tech-i-unit-2'], [
    lesson('tech-i-3-1', 'Legato Scale Runs', 'Minimal picking', 'Play a scale with mostly hammer-ons and pull-offs. Build speed and fluidity.', '15 min', 'technique'),
    lesson('tech-i-3-2', 'Combining Picking and Legato', 'Mix techniques', 'Alternate between picked notes and legato. Common in lead playing.', '15 min', 'technique'),
    lesson('tech-i-3-3', 'Lick with Legato', 'Real-world phrase', 'Learn a lick that uses hammer-ons and pull-offs. Vary the rhythm.', '20 min', 'technique', true)
  ]),
  unit('tech-i-unit-4', 4, 'Rhythm Guitar Styles', 'Comping and groove', 'Different rhythm approaches: straight eighths, syncopation, and genre-specific comping.', '🎶', ['tech-i-unit-3'], [
    lesson('tech-i-4-1', 'Straight Eighth Comping', 'Lock with the band', 'Play chord stabs on every eighth note. Essential for funk and R&B.', '15 min', 'technique'),
    lesson('tech-i-4-2', 'Syncopated Chords', 'Off-beat accents', 'Hit chords on the "and" of the beat. Reggae and ska style.', '15 min', 'technique'),
    lesson('tech-i-4-3', 'Dynamic Comping', 'Leave space', 'Vary density: full strums vs single hits. Support the song without crowding.', '15 min', 'technique', true)
  ]),
  unit('tech-i-unit-5', 5, 'Lead Basics', 'Melody and phrasing', 'Simple lead concepts: targeting chord tones, phrasing in short bursts, and call-and-response.', '🎸', ['tech-i-unit-4'], [
    lesson('tech-i-5-1', 'Targeting Chord Tones', 'Land on the right note', 'When soloing, aim to land on the root, third, or fifth on strong beats.', '15 min', 'technique'),
    lesson('tech-i-5-2', 'Short Phrases', 'Breathe between ideas', 'Play 2–4 note phrases, then pause. Call-and-response with yourself or the track.', '15 min', 'technique'),
    lesson('tech-i-5-3', 'Pentatonic in a Solo', 'Five-note safety', 'Use minor pentatonic over a simple backing. Stay in one position and phrase melodically.', '20 min', 'technique', true)
  ]),
  unit('tech-i-unit-6', 6, 'Tone and Expression', 'Bends, vibrato, and dynamics', 'Full-step bends, consistent vibrato, and dynamic control in lead playing.', '✨', ['tech-i-unit-5'], [
    lesson('tech-i-6-1', 'Full-Step Bends', 'Reach the next note', 'Bend up a whole step. Match pitch with the note two frets higher. In tune.', '15 min', 'technique'),
    lesson('tech-i-6-2', 'Vibrato Control', 'Width and speed', 'Vary vibrato width and speed for expression. Practice on sustained notes.', '10 min', 'technique'),
    lesson('tech-i-6-3', 'Putting It Together', 'Solo with expression', 'Play a short solo using bends, vibrato, and dynamics. Record and listen.', '20 min', 'technique', true)
  ]),
  unit('tech-i-unit-7', 7, 'Pentatonic Positions', 'Five shapes across the neck', 'Learn the five CAGED-style pentatonic positions. Connect them and move between positions while soloing.', '🎸', ['tech-i-unit-6'], [
    lesson('tech-i-7-1', 'Position 1 (E shape)', 'The box', 'Minor pentatonic position 1. Root on low E. Most common rock/blues position.', '20 min', 'technique'),
    lesson('tech-i-7-2', 'Position 2 and 3', 'Connect the neck', 'Positions 2 and 3. How they connect to position 1. Move between them in a solo.', '20 min', 'technique'),
    lesson('tech-i-7-3', 'All Five Positions', 'Full neck coverage', 'Map all five positions for one key. Play the same lick in different positions.', '20 min', 'technique', true)
  ]),
  unit('tech-i-unit-8', 8, 'Playing With Others', 'Lock in and listen', 'How to stay in time with a drummer or backing track. Dynamics, cues, and leaving space.', '👥', ['tech-i-unit-7'], [
    lesson('tech-i-8-1', 'Listening While You Play', 'Lock with the groove', 'Focus on the bass and drums. Your part supports the whole.', '15 min', 'technique'),
    lesson('tech-i-8-2', 'Dynamics in a Band', 'When to lay back', 'Not everyone plays full volume all the time. Verse vs chorus, fills vs groove.', '15 min', 'technique'),
    lesson('tech-i-8-3', 'A Simple Jam', 'I–IV–V with others', 'Jam on a simple progression with a track or friend. Take turns soloing and comping.', '25 min', 'technique', true)
  ]),
  unit('tech-i-unit-9', 9, 'Single-Note Riffs and Melodies', 'Play lines, not just chords', 'Learn 2–3 short riffs or melody lines. Use alternate picking and legato. Apply to a song intro or verse.', '🎸', ['tech-i-unit-8'], [
    lesson('tech-i-9-1', 'Learning a Riff', 'Note-by-note', 'Learn a 4–8 bar riff slowly. Use alternate picking. Bring it up to tempo.', '20 min', 'technique'),
    lesson('tech-i-9-2', 'Riff and Chords', 'Combine in one song', 'Play a verse that mixes a riff with chord stabs or full strums. Keep time steady.', '20 min', 'technique', true)
  ]),
  unit('tech-i-unit-10', 10, 'Intermediate Recap and Goals', 'Solidify and advance', 'Review: alternate picking, arpeggios, legato, comping, lead basics, pentatonic positions, playing with others. Set one proficiency-level goal (sweep picking, chord melody, or jazz comping).', '🎯', ['tech-i-unit-9'], [
    lesson('tech-i-10-1', 'Full Skill Run-Through', 'Scales, chords, and a solo', 'Play one scale position, one arpeggio, one comp pattern, and one short solo. Record and listen.', '25 min', 'technique'),
    lesson('tech-i-10-2', 'Proficiency Goal', 'What to study next', 'Choose: sweep picking, chord melody, jazz comping, or fingerstyle mastery. Plan your next block of practice.', '10 min', 'technique', true)
  ])
];

export const theoryPathIntermediate: Unit[] = [
  unit('theory-i-unit-1', 1, 'Modal Harmony', 'Using modes in progressions', 'How modes create different colors. Progressions in Ionian, Aeolian, Mixolydian.', '🎹', [], [
    lesson('theory-i-1-1', 'Mode and Tonal Center', 'Where home is', 'Same notes, different root. How the "home" note defines the mode.', '15 min', 'theory'),
    lesson('theory-i-1-2', 'Chord Progressions in Modes', 'Dorian, Mixolydian', 'Typical progressions in D Dorian and G Mixolydian. Hear the flavor.', '15 min', 'theory'),
    lesson('theory-i-1-3', 'Applying Modes to Improv', 'Scale choice', 'Choose the right scale for the chord or key. Major vs Mixolydian over a dominant.', '15 min', 'theory', true)
  ]),
  unit('theory-i-unit-2', 2, 'Voice Leading', 'Smooth chord movement', 'How individual notes move between chords. Minimize jumps and create flow.', '🔀', ['theory-i-unit-1'], [
    lesson('theory-i-2-1', 'Common Tones', 'Notes that stay', 'When changing chords, some notes stay. Find them to smooth the transition.', '15 min', 'theory'),
    lesson('theory-i-2-2', 'Stepwise Motion', 'Move by step', 'Prefer moving chord tones by step when possible. Voice leading in practice.', '15 min', 'theory'),
    lesson('theory-i-2-3', 'Voice Leading on Guitar', 'Practical shapes', 'Choose chord voicings that allow smooth voice leading. Inversions and position.', '15 min', 'theory', true)
  ]),
  unit('theory-i-unit-3', 3, 'Blues and Dominant Harmony', 'The blues progression', '12-bar blues. Dominant 7 chords and why they work. Blues scale and blue notes.', '🎵', ['theory-i-unit-2'], [
    lesson('theory-i-3-1', '12-Bar Blues Form', 'I–IV–V in 12 bars', 'Standard blues structure. Play and recognize it in any key.', '15 min', 'theory'),
    lesson('theory-i-3-2', 'Dominant 7 and Tension', 'Wanting to resolve', 'Dominant 7 creates tension that resolves to the tonic. Hear it in blues.', '10 min', 'theory'),
    lesson('theory-i-3-3', 'Blues Scale and Blue Notes', 'The flattened notes', 'Blues scale: add flat 5 (and flat 3 in major context). Expressive color.', '15 min', 'theory', true)
  ]),
  unit('theory-i-unit-4', 4, 'Form and Analysis', 'How songs are built', 'Verse, chorus, bridge. Common forms (AABA, verse-chorus). Analyze a real song.', '📋', ['theory-i-unit-3'], [
    lesson('theory-i-4-1', 'Sections of a Song', 'Verse, chorus, bridge', 'Label sections and see how progressions repeat or change. Map the form.', '15 min', 'theory'),
    lesson('theory-i-4-2', 'AABA and Verse-Chorus', 'Classic forms', 'AABA (e.g. many standards) vs verse-chorus (most pop/rock).', '10 min', 'theory'),
    lesson('theory-i-4-3', 'Analyzing a Full Song', 'From start to finish', 'Take one song and write out form, key, and chord progression for each section.', '20 min', 'theory', true)
  ]),
  unit('theory-i-unit-5', 5, 'Reharmonization Basics', 'Changing the chords', 'Replace chords with others that share function or add color. Simple substitutions.', '🔄', ['theory-i-unit-4'], [
    lesson('theory-i-5-1', 'Diatonic Substitution', 'Same function', 'Replace a chord with another from the key. iii for I, vi for I, etc.', '15 min', 'theory'),
    lesson('theory-i-5-2', 'Adding 7ths', 'Richer harmony', 'Turn triads into 7th chords. When to use maj7 vs dom7 vs m7.', '15 min', 'theory'),
    lesson('theory-i-5-3', 'Secondary Dominants', 'V of V', 'Dominant of the dominant (e.g. D7 in key of C). Temporary tension.', '15 min', 'theory', true)
  ]),
  unit('theory-i-unit-6', 6, 'Ear Training and Transcription', 'Hear and write', 'Transcribe short phrases. Identify intervals and chord progressions by ear.', '👂', ['theory-i-unit-5'], [
    lesson('theory-i-6-1', 'Interval Recognition', 'Hear the distance', 'Practice identifying intervals: major 3rd, perfect 5th, etc. Use reference songs.', '15 min', 'theory'),
    lesson('theory-i-6-2', 'Transcribing a Lick', 'Write what you hear', 'Slow down a recording and write out a short lick in TAB or notation.', '20 min', 'theory'),
    lesson('theory-i-6-3', 'Progressions by Ear', 'I–IV–V and beyond', 'Listen to a progression and identify the chords (or at least I, IV, V).', '15 min', 'theory', true)
  ]),
  unit('theory-i-unit-7', 7, 'Pentatonic and Blues Theory', 'Why the pentatonic works', 'How the minor pentatonic and blues scale relate to chords. Which scale over which chord.', '🎵', ['theory-i-unit-6'], [
    lesson('theory-i-7-1', 'Minor Pentatonic Structure', 'Five notes', 'Root, b3, 4, 5, b7. How it fits over minor chords and the blues.', '15 min', 'theory'),
    lesson('theory-i-7-2', 'Blues Scale and Blue Notes', 'The b5', 'Add the flat 5 to pentatonic. How it creates tension and release in blues.', '15 min', 'theory'),
    lesson('theory-i-7-3', 'Scale Choice Over Chords', 'One key, one scale', 'In a simple blues or rock progression, one pentatonic scale can work over all chords. Why.', '15 min', 'theory', true)
  ]),
  unit('theory-i-unit-8', 8, 'Songwriting Basics', 'From idea to short song', 'Use your theory: choose a key, write a 4–8 bar progression, add a simple melody or riff.', '✍️', ['theory-i-unit-7'], [
    lesson('theory-i-8-1', 'Chord Progression from the Key', 'Diatonic choices', 'Pick I, IV, V, vi. Arrange them in an order that has tension and resolution.', '20 min', 'theory'),
    lesson('theory-i-8-2', 'Melody from Scale Notes', 'Chord tones on strong beats', 'Write a 4-bar melody using notes from the scale. Land on chord tones on beat 1.', '20 min', 'theory'),
    lesson('theory-i-8-3', 'One Short Piece', 'Verse or chorus', 'Complete 8 bars: progression and melody. Record or write it down.', '25 min', 'theory', true)
  ]),
  unit('theory-i-unit-9', 9, 'Secondary Dominants in Practice', 'V of V and more', 'Recognize and play secondary dominants (e.g. D7 in key of C). Hear how they create tension toward a chord other than I.', '🔑', ['theory-i-unit-8'], [
    lesson('theory-i-9-1', 'What Is a Secondary Dominant?', 'V of X', 'A dominant 7 chord that resolves to a chord other than the tonic. D7 → G in key of C.', '15 min', 'theory'),
    lesson('theory-i-9-2', 'Using V/V and V/IV', 'Common choices', 'Play progressions that use V/V (e.g. D7–G) and V/IV. Identify them in a song.', '15 min', 'theory', true)
  ]),
  unit('theory-i-unit-10', 10, 'Intermediate Theory Summary', 'Bridge to proficient', 'Review: modes, voice leading, blues, form, reharmonization, ear training, pentatonic/blues theory, songwriting. Choose one area for deeper study (jazz harmony, counterpoint, or analysis).', '📚', ['theory-i-unit-9'], [
    lesson('theory-i-10-1', 'Concept Map', 'Key ideas', 'Draw or list: modal progressions, voice leading, 12-bar blues, secondary dominants, form. Connect to songs you know.', '20 min', 'theory'),
    lesson('theory-i-10-2', 'Proficient Theory Goal', 'Jazz or classical', 'Choose: ii–V–I and extensions, counterpoint, or form analysis. One resource and one habit.', '10 min', 'theory', true)
  ])
];

// =============================================================================
// PROFICIENT — Advanced techniques and jazz/blues theory
// =============================================================================

export const techniquePathProficient: Unit[] = [
  unit('tech-p-unit-1', 1, 'Sweep Picking Introduction', 'One direction per string', 'Basic sweep: one pick stroke per string, same direction. Triad and arpeggio shapes.', '⚡', [], [
    lesson('tech-p-1-1', 'Three-String Sweep', 'Down or up', 'Sweep down across 3 strings, then up. Keep notes even and clean.', '15 min', 'technique'),
    lesson('tech-p-1-2', 'Major Arpeggio Sweep', 'Root position', 'One sweep shape for major arpeggio. Start slow; speed comes with accuracy.', '20 min', 'technique'),
    lesson('tech-p-1-3', 'Integrating Sweeps', 'In a phrase', 'Add a short sweep to a lick. Connect to alternate picking.', '20 min', 'technique', true)
  ]),
  unit('tech-p-unit-2', 2, 'Chord Melody', 'Melody and chords together', 'Play a melody on top while holding chord voicings. Fingerstyle or hybrid.', '🎹', ['tech-p-unit-1'], [
    lesson('tech-p-2-1', 'Simple Chord Melody', 'One melody note + chord', 'Add a single melody note to a chord shape. Voice leading matters.', '20 min', 'technique'),
    lesson('tech-p-2-2', 'Arranging a Tune', 'Melody in the top voice', 'Take a simple melody and put chord tones under it. Basic arrangement.', '25 min', 'technique'),
    lesson('tech-p-2-3', 'Chord Melody Etude', 'Full short piece', 'Learn or create a short chord melody. Balance melody and harmony.', '25 min', 'technique', true)
  ]),
  unit('tech-p-unit-3', 3, 'Jazz Comping', 'Rhythm and voicings', 'Comp with 7th chords and syncopation. Voice leading in a progression.', '🎷', ['tech-p-unit-2'], [
    lesson('tech-p-3-1', 'Shell Voicings', 'Root, 3rd, 7th', 'Minimal jazz voicings: root, 3rd, 7th. Move them through ii–V–I.', '20 min', 'technique'),
    lesson('tech-p-3-2', 'Comping Rhythm', 'Syncopated hits', 'Typical jazz comping: off-beat chords, space, and swing feel.', '15 min', 'technique'),
    lesson('tech-p-3-3', 'Comping a Standard', 'Full tune', 'Comp through a simple standard (e.g. Autumn Leaves). Voice leading and rhythm.', '25 min', 'technique', true)
  ]),
  unit('tech-p-unit-4', 4, 'Fingerstyle Mastery', 'Complex patterns', 'Advanced fingerstyle: alternating bass, melody, and inner voices.', '🤚', ['tech-p-unit-3'], [
    lesson('tech-p-4-1', 'Three-Part Fingerstyle', 'Bass, chord, melody', 'Layer bass pattern, chord punches, and a top melody line.', '25 min', 'technique'),
    lesson('tech-p-4-2', 'Classical-Style Arpeggios', 'p-i-m-a patterns', 'Classical arpeggio patterns. Even tone and rhythm.', '20 min', 'technique'),
    lesson('tech-p-4-3', 'Arranging for Fingerstyle', 'Full arrangement', 'Arrange a song for solo fingerstyle. Bass, harmony, and melody.', '30 min', 'technique', true)
  ]),
  unit('tech-p-unit-5', 5, 'Solo Construction', 'Building a full solo', 'Structure a solo: theme, development, climax, resolution. Use scales, arpeggios, and expression.', '🎸', ['tech-p-unit-4'], [
    lesson('tech-p-5-1', 'Theme and Variation', 'One idea, many ways', 'State a short motif, then vary it (rhythm, register, notes).', '20 min', 'technique'),
    lesson('tech-p-5-2', 'Tension and Release', 'Build and resolve', 'Use register, dynamics, and harmony to create tension, then resolve.', '20 min', 'technique'),
    lesson('tech-p-5-3', 'Full Solo Outline', 'Beginning, middle, end', 'Plan a solo: intro phrase, build, peak, come down. Record and evaluate.', '25 min', 'technique', true)
  ]),
  unit('tech-p-unit-6', 6, 'Extended Techniques', 'Tapping and harmonics', 'Basic tapping and natural/artificial harmonics. Use sparingly for color.', '🌟', ['tech-p-unit-5'], [
    lesson('tech-p-6-1', 'Natural Harmonics', '5th, 7th, 12th fret', 'Touch the string at node points and pluck. Clear bell-like tone.', '15 min', 'technique'),
    lesson('tech-p-6-2', 'Tap Harmonics', 'Artificial harmonics', 'Tap at 12 frets above a fretted note. Add shimmer to chords or melody.', '15 min', 'technique'),
    lesson('tech-p-6-3', 'Two-Hand Tapping', 'Basic tap phrase', 'Simple tapping phrase: tap, pull-off, tap. One short idea.', '20 min', 'technique', true)
  ]),
  unit('tech-p-unit-7', 7, 'Drop 2 and Drop 3 Voicings', 'Jazz chord vocabulary', 'Drop 2 and drop 3 voicings for 7th chords. Voice leading through ii–V–I in several positions.', '🎷', ['tech-p-unit-6'], [
    lesson('tech-p-7-1', 'What Is Drop 2?', 'Lower the second voice', 'Take a close voicing and drop the second-highest note an octave. Bigger, guitar-friendly.', '20 min', 'technique'),
    lesson('tech-p-7-2', 'ii–V–I in Drop 2', 'Move through the progression', 'Play Dm7–G7–Cmaj7 with drop 2 voicings. Keep voice leading smooth.', '25 min', 'technique'),
    lesson('tech-p-7-3', 'Drop 3 and Inversions', 'More options', 'Drop 3 voicings and when to use root position vs inversions.', '20 min', 'technique', true)
  ]),
  unit('tech-p-unit-8', 8, 'Repertoire and Performance Prep', 'Bring pieces to performance level', 'Choose 2–3 pieces (chord melody, solo, or comping). Polish them and plan a short set.', '🎤', ['tech-p-unit-7'], [
    lesson('tech-p-8-1', 'Selecting Repertoire', 'Balance and contrast', 'Pick pieces that show range: tempo, key, style. One ballad, one medium, one uptempo.', '15 min', 'technique'),
    lesson('tech-p-8-2', 'Memorization and Cues', 'Internalize the form', 'Memorize form and chord changes. Use cues (lyrics, riff) if you need a safety net.', '20 min', 'technique'),
    lesson('tech-p-8-3', 'Run-Through and Feedback', 'Record and critique', 'Record a full run-through. Listen for time, tone, and clarity. Fix one thing at a time.', '25 min', 'technique', true)
  ]),
  unit('tech-p-unit-9', 9, 'Arranging for Solo Guitar', 'One guitar, full sound', 'Arrange a simple tune for solo guitar: melody, bass, and harmony. Use chord melody or fingerstyle.', '🎹', ['tech-p-unit-8'], [
    lesson('tech-p-9-1', 'Melody and Bass', 'Two voices', 'Play the melody on top strings and a simple bass line on 6 and 5. Keep time steady.', '25 min', 'technique'),
    lesson('tech-p-9-2', 'Adding Harmony', 'Chords under the melody', 'Fill in chord tones between bass and melody. One short section (e.g. 8 bars).', '25 min', 'technique', true)
  ]),
  unit('tech-p-unit-10', 10, 'Proficient Recap and Advanced Goals', 'Polish and stretch', 'Review: sweep picking, chord melody, comping, fingerstyle, solo construction, extended techniques, drop voicings, repertoire. Set one advanced goal (polyphony, sight-reading, or interpretation).', '🎯', ['tech-p-unit-9'], [
    lesson('tech-p-10-1', 'Performance Set', '2–3 pieces', 'Play your set as if for an audience. No stops. Note one strength and one fix.', '30 min', 'technique'),
    lesson('tech-p-10-2', 'Advanced Goal', 'Next level', 'Choose: polyphonic playing, sight-reading, or interpretation. Plan your next phase.', '10 min', 'technique', true)
  ])
];

export const theoryPathProficient: Unit[] = [
  unit('theory-p-unit-1', 1, 'Jazz Harmony', 'ii–V–I and extensions', 'The fundamental jazz progression. 9ths, 11ths, and 13ths. Altered dominants intro.', '🎷', [], [
    lesson('theory-p-1-1', 'ii–V–I in Major', 'The core progression', 'Dm7–G7–Cmaj7. Tension and resolution. Voice leading.', '20 min', 'theory'),
    lesson('theory-p-1-2', 'Extensions: 9, 11, 13', 'Adding color', 'Add 9th, 11th, or 13th to 7th chords. Which extensions fit which chord.', '20 min', 'theory'),
    lesson('theory-p-1-3', 'Altered Dominant', 'b9, #9, #11', 'Alter the dominant for more tension. G7alt resolving to C.', '20 min', 'theory', true)
  ]),
  unit('theory-p-unit-2', 2, 'Counterpoint Basics', 'Two lines at once', 'Simple two-voice counterpoint. Independence and consonance.', '🔀', ['theory-p-unit-1'], [
    lesson('theory-p-2-1', 'Two-Voice Motion', 'Parallel, contrary, oblique', 'How two lines move: parallel, contrary, oblique. Avoid parallels in 5ths/8ves.', '20 min', 'theory'),
    lesson('theory-p-2-2', 'Simple Counterpoint', 'Cantus and line', 'Write a short second line against a given melody. First species style.', '25 min', 'theory'),
    lesson('theory-p-2-3', 'Counterpoint on Guitar', 'Bass and melody', 'Apply counterpoint thinking to bass line and melody in fingerstyle.', '20 min', 'theory', true)
  ]),
  unit('theory-p-unit-3', 3, 'Form and Analysis Deep Dive', 'Sonata, AABA, through-composed', 'Larger forms. How sections relate. Analyzing classical and jazz forms.', '📋', ['theory-p-unit-2'], [
    lesson('theory-p-3-1', 'Binary and Ternary', 'AB and ABA', 'Simple forms. How B contrasts with A. Return of A.', '15 min', 'theory'),
    lesson('theory-p-3-2', 'Jazz Standard Forms', 'AABA, ABAC', 'Common jazz forms. Where the bridge goes. Key relationships.', '20 min', 'theory'),
    lesson('theory-p-3-3', 'Analyzing a Full Piece', 'From start to end', 'Analyze a complete piece: form, key areas, and harmonic rhythm.', '25 min', 'theory', true)
  ]),
  unit('theory-p-unit-4', 4, 'Composition Projects', 'Write your own', 'Compose a short piece: chord progression, melody, and form.', '✍️', ['theory-p-unit-3'], [
    lesson('theory-p-4-1', 'Chord Progression', 'Design the harmony', 'Choose a key and write 8–16 bars of progression. Use diatonic and one or two surprises.', '25 min', 'theory'),
    lesson('theory-p-4-2', 'Melody Over Chords', 'Shape a line', 'Write a melody that fits the progression. Chord tones on strong beats.', '25 min', 'theory'),
    lesson('theory-p-4-3', 'Short Full Piece', 'Beginning to end', 'Complete a short piece with intro, main section, and ending.', '30 min', 'theory', true)
  ]),
  unit('theory-p-unit-5', 5, 'Historical Styles', 'Baroque to modern', 'Brief overview: how harmony and form evolved. Baroque, Classical, Romantic, 20th century.', '📜', ['theory-p-unit-4'], [
    lesson('theory-p-5-1', 'Baroque and Classical', 'Bass lines and form', 'Basso continuo, classical symmetry. How it influenced later music.', '20 min', 'theory'),
    lesson('theory-p-5-2', 'Romantic and Impressionist', 'Color and ambiguity', 'Richer harmony, modal flavor. Debussy and color.', '20 min', 'theory'),
    lesson('theory-p-5-3', '20th Century and Jazz', 'Extensions and rhythm', 'Jazz harmony, syncopation, and form. Connection to today.', '20 min', 'theory', true)
  ]),
  unit('theory-p-unit-6', 6, 'Teaching and Communicating', 'Explain to others', 'How to explain theory to another musician. Simplify without dumbing down.', '📢', ['theory-p-unit-5'], [
    lesson('theory-p-6-1', 'Explaining Keys and Chords', 'Clear language', 'Describe key, I–IV–V, and chord quality in plain terms.', '15 min', 'theory'),
    lesson('theory-p-6-2', 'Chart Writing', 'Lead sheets', 'Write a lead sheet: melody, chords, form. Standards of notation.', '25 min', 'theory'),
    lesson('theory-p-6-3', 'Running a Session', 'Calling changes', 'Communicate form and key in a jam. Count off, cue sections.', '20 min', 'theory', true)
  ]),
  unit('theory-p-unit-7', 7, 'Diminished and Augmented Harmony', 'Altered triads', 'Diminished and augmented chords. How they work and where they appear. Half-diminished 7th.', '🔺', ['theory-p-unit-6'], [
    lesson('theory-p-7-1', 'Diminished Triad and dim7', 'Symmetry and resolution', 'Diminished chord structure. Dim7 and its role in dominant function and passing chords.', '20 min', 'theory'),
    lesson('theory-p-7-2', 'Augmented Chord', 'The +5', 'Augmented triad. How it creates tension and moves to major or minor.', '15 min', 'theory'),
    lesson('theory-p-7-3', 'Half-Diminished (m7b5)', 'The ii in minor', 'Half-diminished 7th. Common in minor key ii–V and in jazz.', '20 min', 'theory', true)
  ]),
  unit('theory-p-unit-8', 8, 'Analysis Project', 'One piece in depth', 'Choose one piece (jazz standard, classical, or pop). Full analysis: form, harmony, voice leading, and performance choices.', '📋', ['theory-p-unit-7'], [
    lesson('theory-p-8-1', 'Choose and Map the Form', 'Sections and key areas', 'Label all sections. Note where the key changes or the progression modulates.', '25 min', 'theory'),
    lesson('theory-p-8-2', 'Harmonic Analysis', 'Roman numerals and functions', 'Every chord in Roman numerals. Identify secondary dominants and borrowed chords.', '30 min', 'theory'),
    lesson('theory-p-8-3', 'Write a One-Page Summary', 'Share your analysis', 'One page: form, key(s), main progressions, and one insight about why the piece works.', '25 min', 'theory', true)
  ]),
  unit('theory-p-unit-9', 9, 'Borrowed Chords and Modal Mixture', 'Chords from parallel key', 'Use chords from the parallel minor in a major key (e.g. bVI, iv in major). Hear the color and when to use them.', '🎹', ['theory-p-unit-8'], [
    lesson('theory-p-9-1', 'Parallel Major and Minor', 'Same root, different scale', 'C major vs C minor. Borrow iv, bVI, bVII from minor in a major key progression.', '20 min', 'theory'),
    lesson('theory-p-9-2', 'Using Borrowed Chords', 'When and why', 'Play a progression that uses one or two borrowed chords. Hear the emotional shift.', '20 min', 'theory', true)
  ]),
  unit('theory-p-unit-10', 10, 'Proficient Theory Summary', 'Bridge to advanced', 'Review: jazz harmony, counterpoint, form, composition, history, teaching, diminished/augmented, analysis. Choose one advanced topic: post-tonal concepts, Schenkerian reduction, or chord-scale theory.', '📚', ['theory-p-unit-9'], [
    lesson('theory-p-10-1', 'Full Concept Review', 'From triads to analysis', 'List key ideas: ii–V–I, extensions, voice leading, form, reharmonization, borrowed chords. Connect to one piece.', '25 min', 'theory'),
    lesson('theory-p-10-2', 'Advanced Theory Goal', 'Depth or breadth', 'Choose: post-tonal intro, advanced analysis, or jazz theory mastery. One resource and a plan.', '15 min', 'theory', true)
  ])
];

// =============================================================================
// ADVANCED — Virtuosity, interpretation, and advanced harmony
// =============================================================================

export const techniquePathAdvanced: Unit[] = [
  unit('tech-a-unit-1', 1, 'Virtuoso Techniques', 'Speed and precision', 'Maximize alternate picking and legato speed. Clean execution at high tempo.', '⚡', [], [
    lesson('tech-a-1-1', 'Speed Building', 'Incremental tempo', 'Increase metronome 2–5 BPM at a time. Stay clean before speeding up.', '20 min', 'technique'),
    lesson('tech-a-1-2', 'Economy Picking', 'Efficiency of motion', 'When crossing strings, continue pick direction when it saves a stroke.', '20 min', 'technique'),
    lesson('tech-a-1-3', 'Precision Under Pressure', 'Performance tempo', 'Practice at target tempo in short bursts. Build stamina.', '20 min', 'technique', true)
  ]),
  unit('tech-a-unit-2', 2, 'Polyphonic Playing', 'Multiple lines', 'Bach-style two- and three-voice playing. Independence of fingers.', '🎹', ['tech-a-unit-1'], [
    lesson('tech-a-2-1', 'Two Voices', 'Bass and melody', 'Play a two-voice piece. Keep both lines clear and independent.', '25 min', 'technique'),
    lesson('tech-a-2-2', 'Three Voices', 'Add inner voice', 'Manage three parts: bass, middle, and melody. Voice leading.', '25 min', 'technique'),
    lesson('tech-a-2-3', 'Contrapuntal Etude', 'Full short piece', 'Learn or write a short contrapuntal piece for guitar.', '30 min', 'technique', true)
  ]),
  unit('tech-a-unit-3', 3, 'Genre Fusion', 'Combine styles', 'Blend techniques from different genres: classical, jazz, rock, fingerstyle.', '🌐', ['tech-a-unit-2'], [
    lesson('tech-a-3-1', 'Jazz in a Rock Context', 'Chord melody in a band', 'Apply jazz voicings and comping to a rock or pop setting.', '25 min', 'technique'),
    lesson('tech-a-3-2', 'Classical and Fingerstyle', 'Arpeggios and melody', 'Classical technique in fingerstyle arrangement.', '25 min', 'technique'),
    lesson('tech-a-3-3', 'Your Hybrid Style', 'Personal blend', 'Create a short piece that combines two or more influences.', '30 min', 'technique', true)
  ]),
  unit('tech-a-unit-4', 4, 'Sight-Reading', 'Read in real time', 'Read notation or TAB at first sight. Start slow, increase difficulty.', '📖', ['tech-a-unit-3'], [
    lesson('tech-a-4-1', 'Rhythm Reading', 'Clap and count', 'Sight-read rhythm only. Then add pitch.', '20 min', 'technique'),
    lesson('tech-a-4-2', 'Simple Melodies', 'First sight', 'Read a simple melody at first sight. Don\'t stop; keep the pulse.', '20 min', 'technique'),
    lesson('tech-a-4-3', 'Chord Charts and Leadsheets', 'Read and comp', 'Sight-read a lead sheet: chords and melody. Comp and play melody.', '25 min', 'technique', true)
  ]),
  unit('tech-a-unit-5', 5, 'Interpretation', 'Make it yours', 'Phrasing, dynamics, and tempo variation. Interpret a piece, don\'t just play the notes.', '🎭', ['tech-a-unit-4'], [
    lesson('tech-a-5-1', 'Phrasing and Breath', 'Where to breathe', 'Shape phrases with dynamics and slight rubato. Musical sentences.', '20 min', 'technique'),
    lesson('tech-a-5-2', 'Tempo and Expression', 'When to slow or speed', 'Use tempo variation for expression. Don\'t overdo it.', '20 min', 'technique'),
    lesson('tech-a-5-3', 'Recording and Critique', 'Hear yourself', 'Record an interpreted piece. Listen and refine.', '25 min', 'technique', true)
  ]),
  unit('tech-a-unit-6', 6, 'Ensemble and Performance', 'Play with others', 'Lock with a band. Cues, dynamics, and listening. Stage presence.', '🎤', ['tech-a-unit-5'], [
    lesson('tech-a-6-1', 'Listening in the Band', 'Lock with bass and drums', 'How to lock rhythm and dynamics with other players.', '20 min', 'technique'),
    lesson('tech-a-6-2', 'Cues and Signals', 'Non-verbal communication', 'Eye contact, nods, and body language. Starting and ending together.', '15 min', 'technique'),
    lesson('tech-a-6-3', 'Performance Run-Through', 'Full set', 'Run a short set as if live. No stops; recover from mistakes.', '30 min', 'technique', true)
  ]),
  unit('tech-a-unit-7', 7, 'Repertoire at Speed', 'Technical maintenance', 'Keep difficult pieces at performance tempo. Efficient practice strategies for hard passages.', '⚡', ['tech-a-unit-6'], [
    lesson('tech-a-7-1', 'Chunking Hard Passages', 'Small sections', 'Isolate 2–4 bar difficult spots. Slow to fast with metronome. Then connect.', '25 min', 'technique'),
    lesson('tech-a-7-2', 'Consistency Drills', 'Same tempo, many runs', 'Play a piece 3–5 times in a row at performance tempo. Note where you slip.', '25 min', 'technique'),
    lesson('tech-a-7-3', 'Endurance and Focus', 'Full piece under pressure', 'Simulate performance: one take, no restarts. Build mental and physical stamina.', '30 min', 'technique', true)
  ]),
  unit('tech-a-unit-8', 8, 'Recording and Self-Critique', 'Hear yourself objectively', 'Record regularly. Listen for time, tone, and phrasing. Use critique to set practice goals.', '🎙️', ['tech-a-unit-7'], [
    lesson('tech-a-8-1', 'Recording Setup (Simple)', 'Phone or interface', 'Get a clean recording: room, mic position, or direct. Good enough to hear details.', '15 min', 'technique'),
    lesson('tech-a-8-2', 'What to Listen For', 'Time, tone, clarity', 'Check timing first, then tone and articulation. Note one strength and one fix per take.', '20 min', 'technique'),
    lesson('tech-a-8-3', 'Iterate and Compare', 'Before and after', 'Record the same piece after a week of focused practice. Compare and note improvement.', '25 min', 'technique', true)
  ]),
  unit('tech-a-unit-9', 9, 'Alternate Tunings and Textures', 'New colors', 'Explore one alternate tuning (e.g. DADGAD, open G). Learn one short piece or pattern in that tuning. Use it for texture or composition.', '🌐', ['tech-a-unit-8'], [
    lesson('tech-a-9-1', 'Choosing a Tuning', 'What and why', 'Pick one tuning and tune the guitar. Learn the new open string notes and one chord shape.', '20 min', 'technique'),
    lesson('tech-a-9-2', 'One Piece or Pattern', 'In the new tuning', 'Learn a short piece or 4–8 bar pattern that uses the tuning. Focus on tone and clarity.', '25 min', 'technique', true)
  ]),
  unit('tech-a-unit-10', 10, 'Advanced Recap and Expert Goals', 'Mastery and leadership', 'Review: virtuosity, polyphony, genre fusion, sight-reading, interpretation, ensemble, repertoire maintenance, recording. Set one expert-level goal (master classes, signature style, or teaching).', '🎯', ['tech-a-unit-9'], [
    lesson('tech-a-10-1', 'Full Run-Through', 'Multiple styles', 'Play one piece each from two different styles (e.g. classical and jazz). Record and self-assess.', '30 min', 'technique'),
    lesson('tech-a-10-2', 'Expert Goal', 'Mastery or mentorship', 'Choose: bring repertoire to master level, develop signature style, or teach at a high level. Plan the next 3–6 months.', '15 min', 'technique', true)
  ])
];

export const theoryPathAdvanced: Unit[] = [
  unit('theory-a-unit-1', 1, 'Post-Tonal Concepts', 'Beyond functional harmony', 'Introduction to atonality, set theory, and modern harmony. No need to master—awareness.', '🔮', [], [
    lesson('theory-a-1-1', 'Atonality and Chromaticism', 'No key center', 'Music that avoids a clear tonic. How it sounds and how it\'s organized.', '25 min', 'theory'),
    lesson('theory-a-1-2', 'Set Theory Basics', 'Pitch class sets', 'Groups of notes as sets. Prime form. Brief introduction.', '25 min', 'theory'),
    lesson('theory-a-1-3', 'Applying or Rejecting', 'Your own taste', 'When modern harmony might inspire your writing vs when to stay tonal.', '20 min', 'theory', true)
  ]),
  unit('theory-a-unit-2', 2, 'Advanced Analysis', 'Schenker and beyond', 'Reduction, prolongation, and structural analysis. Find the skeleton of a piece.', '🔬', ['theory-a-unit-1'], [
    lesson('theory-a-2-1', 'Prolongation', 'One chord, many notes', 'How a single harmony can be prolonged over many measures.', '25 min', 'theory'),
    lesson('theory-a-2-2', 'Structural Levels', 'Background and foreground', 'Background (big picture) vs foreground (surface). Simplify a progression.', '25 min', 'theory'),
    lesson('theory-a-2-3', 'Analyze a Masterwork', 'Full analysis', 'Analyze a short piece in depth: form, harmony, and structure.', '30 min', 'theory', true)
  ]),
  unit('theory-a-unit-3', 3, 'Jazz Theory Mastery', 'Advanced harmony', 'Reharmonization, modal interchange, and chord-scale theory in depth.', '🎷', ['theory-a-unit-2'], [
    lesson('theory-a-3-1', 'Modal Interchange', 'Borrowed chords', 'Chords from parallel minor in major key (and vice versa). Color and surprise.', '25 min', 'theory'),
    lesson('theory-a-3-2', 'Chord-Scale Theory', 'Scale for every chord', 'Assign a scale to each chord type. Melodic freedom and consistency.', '25 min', 'theory'),
    lesson('theory-a-3-3', 'Reharmonization in Practice', 'Rewrite a standard', 'Reharmonize a standard. Substitute and extend. Play through.', '30 min', 'theory', true)
  ]),
  unit('theory-a-unit-4', 4, 'Composition at Level', 'Large-scale writing', 'Compose a longer piece: multiple sections, key changes, and development.', '✍️', ['theory-a-unit-3'], [
    lesson('theory-a-4-1', 'Key Relationships', 'Modulation', 'Move to a new key and return. Pivot chords and preparation.', '25 min', 'theory'),
    lesson('theory-a-4-2', 'Development', 'Expand an idea', 'Take a motif and develop it: sequence, inversion, fragmentation.', '25 min', 'theory'),
    lesson('theory-a-4-3', 'Full Piece', 'Multi-section work', 'Compose a piece with at least two contrasting sections and a clear form.', '35 min', 'theory', true)
  ]),
  unit('theory-a-unit-5', 5, 'Research and Context', 'History and criticism', 'Place music in historical and cultural context. Read and summarize theory writing.', '📚', ['theory-a-unit-4'], [
    lesson('theory-a-5-1', 'Historical Context', 'When and why', 'Why a style or form emerged. Social and technological factors.', '25 min', 'theory'),
    lesson('theory-a-5-2', 'Critical Listening', 'Evaluate performances', 'Listen critically to recordings. What makes an interpretation effective?', '25 min', 'theory'),
    lesson('theory-a-5-3', 'Writing About Music', 'Describe and argue', 'Write a short essay analyzing or comparing pieces. Clear language.', '30 min', 'theory', true)
  ]),
  unit('theory-a-unit-6', 6, 'Pedagogy', 'Teach others', 'Design a curriculum. Sequence concepts. Assess progress.', '👩‍🏫', ['theory-a-unit-5'], [
    lesson('theory-a-6-1', 'Curriculum Design', 'Order of concepts', 'What to teach first, second, third. Dependencies and goals.', '25 min', 'theory'),
    lesson('theory-a-6-2', 'Assessment', 'Check understanding', 'How to test theory knowledge: written and practical.', '20 min', 'theory'),
    lesson('theory-a-6-3', 'One Lesson Plan', 'Full session', 'Write a complete lesson plan for one topic. Objectives, activities, assessment.', '30 min', 'theory', true)
  ]),
  unit('theory-a-unit-7', 7, 'Extended Harmony in Practice', 'Beyond triads and 7ths', '9ths, 11ths, 13ths in context. When to add them and how they change the sound.', '🎹', ['theory-a-unit-6'], [
    lesson('theory-a-7-1', 'Adding 9ths', 'Color and tension', 'Add 9th to major 7 and dominant 7. Open voicings on guitar.', '25 min', 'theory'),
    lesson('theory-a-7-2', '11ths and 13ths', 'Upper extensions', 'When the 11th or 13th works. Avoid notes and voicing choices.', '25 min', 'theory'),
    lesson('theory-a-7-3', 'Reharmonization with Extensions', 'Richer progressions', 'Take a simple progression and add extensions. Hear the difference.', '25 min', 'theory', true)
  ]),
  unit('theory-a-unit-8', 8, 'Critical Listening and Comparison', 'Compare recordings', 'Listen to 2–3 recordings of the same piece. Compare tempo, phrasing, harmony, and production.', '👂', ['theory-a-unit-7'], [
    lesson('theory-a-8-1', 'Same Piece, Different Artists', 'Interpretation', 'How do different performers shape the same piece? Tempo, dynamics, articulation.', '25 min', 'theory'),
    lesson('theory-a-8-2', 'Production and Arrangement', 'Beyond the notes', 'How arrangement and production affect the listening experience.', '25 min', 'theory'),
    lesson('theory-a-8-3', 'Write a Short Review', 'Articulate your taste', 'Write 200 words comparing two versions. What works and why.', '25 min', 'theory', true)
  ]),
  unit('theory-a-unit-9', 9, 'Analysis and Teaching', 'Explain and assess', 'Analyze a piece you teach or perform. Write a one-page handout that explains form, harmony, and one interpretive choice. Use it in a lesson or workshop.', '👩‍🏫', ['theory-a-unit-8'], [
    lesson('theory-a-9-1', 'Analysis for Teaching', 'Handout outline', 'Create a one-page analysis: form, key areas, main progressions, one insight. Language suitable for students.', '25 min', 'theory'),
    lesson('theory-a-9-2', 'Use It in Practice', 'Teach or present', 'Use the handout in a lesson, workshop, or blog post. Refine based on clarity.', '25 min', 'theory', true)
  ]),
  unit('theory-a-unit-10', 10, 'Advanced Theory Summary', 'Bridge to expert', 'Review: post-tonal concepts, advanced analysis, jazz mastery, composition, research, pedagogy, extended harmony, critical listening. Choose one expert path: graduate-level topic, original research, or curriculum design.', '📚', ['theory-a-unit-9'], [
    lesson('theory-a-10-1', 'Concept Map', 'From basics to advanced', 'List all major topics you have studied. Identify gaps and strengths.', '25 min', 'theory'),
    lesson('theory-a-10-2', 'Expert Theory Goal', 'Research or teaching', 'Choose: depth in one graduate topic, small research project, or full curriculum design. Plan the next 6–12 months.', '15 min', 'theory', true)
  ])
];

// =============================================================================
// EXPERT — Mastery, innovation, and leadership
// =============================================================================

export const techniquePathExpert: Unit[] = [
  unit('tech-x-unit-1', 1, 'Master Classes', 'Refine and polish', 'Bring repertoire to performance level. Nuance, consistency, and stage readiness.', '🏆', [], [
    lesson('tech-x-1-1', 'Repertoire at Performance Level', 'No weak spots', 'Identify and fix any technical or musical weak spots in key pieces.', '30 min', 'technique'),
    lesson('tech-x-1-2', 'Consistency', 'Same quality every time', 'Practice performing under pressure. Record and compare runs.', '25 min', 'technique'),
    lesson('tech-x-1-3', 'Program Building', 'Set list and flow', 'Order pieces for a set. Balance keys, tempos, and moods.', '25 min', 'technique', true)
  ]),
  unit('tech-x-unit-2', 2, 'Signature Style', 'Develop your voice', 'What makes your playing recognizable? Refine your phrasing, tone, and choice of material.', '🎨', ['tech-x-unit-1'], [
    lesson('tech-x-2-1', 'Identifying Your Strengths', 'What you do best', 'List your strengths. Double down on what is unique to you.', '20 min', 'technique'),
    lesson('tech-x-2-2', 'Phrasing Fingerprint', 'Your melodic DNA', 'Consistent phrasing habits. Develop and refine them.', '25 min', 'technique'),
    lesson('tech-x-2-3', 'Original Material', 'Compose and arrange', 'Create original material that reflects your style. Record and refine.', '35 min', 'technique', true)
  ]),
  unit('tech-x-unit-3', 3, 'Innovation', 'New techniques and sounds', 'Experiment with extended techniques, alternate tunings, or technology. Push boundaries.', '🌟', ['tech-x-unit-2'], [
    lesson('tech-x-3-1', 'Alternate Tunings', 'New colors', 'Explore open tunings or other setups. Write in a tuning.', '30 min', 'technique'),
    lesson('tech-x-3-2', 'Technology and Effects', 'Pedals and processing', 'Use effects thoughtfully. How they serve the music.', '25 min', 'technique'),
    lesson('tech-x-3-3', 'Hybrid and New Sounds', 'Combine and invent', 'Combine techniques or invent a new approach. Document it.', '30 min', 'technique', true)
  ]),
  unit('tech-x-unit-4', 4, 'Teaching Performance', 'Pass it on', 'Teach others at a high level. Diagnose and fix. Give master-class style feedback.', '👩‍🏫', ['tech-x-unit-3'], [
    lesson('tech-x-4-1', 'Diagnosing Problems', 'Hear and fix', 'Listen to another player and identify technical or musical issues.', '25 min', 'technique'),
    lesson('tech-x-4-2', 'Giving Feedback', 'Constructive and clear', 'Deliver feedback that is specific, actionable, and kind.', '20 min', 'technique'),
    lesson('tech-x-4-3', 'Master Class Format', 'Public teaching', 'Run a short master class: one student, one piece, 15–20 minutes.', '30 min', 'technique', true)
  ]),
  unit('tech-x-unit-5', 5, 'Recording and Production', 'Studio-level output', 'Record at a high standard. Mic placement, takes, and basic mix awareness.', '🎙️', ['tech-x-unit-4'], [
    lesson('tech-x-5-1', 'Recording Best Takes', 'Performance in the booth', 'How to get your best take. Comping and editing basics.', '25 min', 'technique'),
    lesson('tech-x-5-2', 'Tone and Mix', 'Guitar in the track', 'Where the guitar sits in a mix. EQ and balance.', '25 min', 'technique'),
    lesson('tech-x-5-3', 'Full Production', 'From idea to release', 'Take one idea from demo to finished track. Full process.', '40 min', 'technique', true)
  ]),
  unit('tech-x-unit-6', 6, 'Lifelong Practice', 'Sustain and grow', 'Avoid injury. Maintain motivation. Plan long-term growth and repertoire.', '🌱', ['tech-x-unit-5'], [
    lesson('tech-x-6-1', 'Injury Prevention', 'Sustainable technique', 'Warm-up, posture, and rest. Signs of overuse. When to see a professional.', '20 min', 'technique'),
    lesson('tech-x-6-2', 'Motivation and Goals', 'Long-term vision', 'Set multi-year goals. Balance maintenance and new challenges.', '20 min', 'technique'),
    lesson('tech-x-6-3', 'Legacy Repertoire', 'What you leave behind', 'Choose and polish pieces that represent you. Record and document.', '30 min', 'technique', true)
  ]),
  unit('tech-x-unit-7', 7, 'Cross-Genre Fluency', 'Play in many styles', 'Maintain ability in classical, jazz, rock, fingerstyle. One piece or etude per style.', '🌐', ['tech-x-unit-6'], [
    lesson('tech-x-7-1', 'Style-Specific Technique', 'What each genre demands', 'Classical: nails and tone. Jazz: comping and walking. Rock: gain and articulation.', '25 min', 'technique'),
    lesson('tech-x-7-2', 'One Piece Per Style', 'Keep the toolbox', 'Learn or maintain one piece in each of 3–4 styles. Rotate practice.', '30 min', 'technique'),
    lesson('tech-x-7-3', 'Fusion and Blending', 'Combine when appropriate', 'When to blend styles in one piece or performance. Taste and context.', '25 min', 'technique', true)
  ]),
  unit('tech-x-unit-8', 8, 'Mentorship and Legacy', 'Pass it on at a high level', 'Mentor one or more players. Document your approach. Leave material for others.', '🤝', ['tech-x-unit-7'], [
    lesson('tech-x-8-1', 'Structured Mentorship', 'Goals and check-ins', 'Set goals with a mentee. Regular check-ins and accountability.', '25 min', 'technique'),
    lesson('tech-x-8-2', 'Documenting Your Method', 'Write it down', 'Outline your teaching or practice method. So others can use it.', '30 min', 'technique'),
    lesson('tech-x-8-3', 'Legacy Projects', 'Videos, transcriptions, courses', 'Consider creating lasting material: videos, transcriptions, or a short course.', '30 min', 'technique', true)
  ]),
  unit('tech-x-unit-9', 9, 'Innovation and Collaboration', 'New sounds and teams', 'Collaborate with another musician on a short project. Experiment with one new technique, tuning, or technology and document the result.', '🌟', ['tech-x-unit-8'], [
    lesson('tech-x-9-1', 'Collaboration Project', 'With another musician', 'Choose a short project: duet, arrangement, or original. Rehearse and record a draft.', '40 min', 'technique'),
    lesson('tech-x-9-2', 'One New Experiment', 'Technique or tech', 'Try one new technique, effect, or tuning. Record a short idea and note what you learned.', '30 min', 'technique', true)
  ]),
  unit('tech-x-unit-10', 10, 'Expert Summit', 'Ongoing mastery', 'Review your entire path: fundamentals through mentorship. Set 1–2 long-term goals (repertoire, teaching, recording, or innovation). Plan how you will maintain and grow for the next year.', '🏆', ['tech-x-unit-9'], [
    lesson('tech-x-10-1', 'Full Path Review', 'Where you started, where you are', 'List key milestones from novice to expert. Identify what you want to maintain and what to deepen.', '30 min', 'technique'),
    lesson('tech-x-10-2', 'Next Year Plan', 'Goals and habits', 'Write 1–2 concrete goals for the next 12 months. One practice habit and one teaching or creation habit.', '20 min', 'technique', true)
  ])
];

export const theoryPathExpert: Unit[] = [
  unit('theory-x-unit-1', 1, 'Graduate-Level Topics', 'Advanced study', 'Explore a topic at depth: serialism, neo-Riemannian theory, or another area of interest.', '📐', [], [
    lesson('theory-x-1-1', 'Choose a Depth Area', 'One topic', 'Select one advanced topic. Research and outline.', '30 min', 'theory'),
    lesson('theory-x-1-2', 'Literature Review', 'What others have said', 'Read key papers or chapters. Summarize and compare.', '40 min', 'theory'),
    lesson('theory-x-1-3', 'Synthesis', 'Your take', 'Write or present your synthesis. Connect to your playing or teaching.', '35 min', 'theory', true)
  ]),
  unit('theory-x-unit-2', 2, 'Original Research', 'Contribute', 'Pursue a small research question. Collect data or analyze repertoire. Document findings.', '🔬', ['theory-x-unit-1'], [
    lesson('theory-x-2-1', 'Research Question', 'What to ask', 'Formulate a clear question. Scope it to something answerable.', '25 min', 'theory'),
    lesson('theory-x-2-2', 'Method', 'How to answer', 'How you will gather or analyze. Repertoire analysis, survey, or experiment.', '30 min', 'theory'),
    lesson('theory-x-2-3', 'Findings and Write-Up', 'Share results', 'Document results and write a short paper or blog post.', '40 min', 'theory', true)
  ]),
  unit('theory-x-unit-3', 3, 'Curriculum Design', 'Build a program', 'Design a full curriculum for a course or workshop. Sequence, materials, and assessment.', '📋', ['theory-x-unit-2'], [
    lesson('theory-x-3-1', 'Learning Outcomes', 'What students will do', 'Define measurable outcomes for a course or workshop.', '30 min', 'theory'),
    lesson('theory-x-3-2', 'Unit and Lesson Sequence', 'Order of topics', 'Break the course into units and lessons. Dependencies and timing.', '35 min', 'theory'),
    lesson('theory-x-3-3', 'Materials and Assessment', 'Resources and grading', 'Choose or create materials. Design assignments and assessments.', '35 min', 'theory', true)
  ]),
  unit('theory-x-unit-4', 4, 'Philosophy of Music', 'Why it matters', 'Reflect on why we make and study music. Aesthetics, meaning, and value.', '🤔', ['theory-x-unit-3'], [
    lesson('theory-x-4-1', 'Aesthetics', 'What is beautiful?', 'Different views of musical beauty. Historical and personal.', '30 min', 'theory'),
    lesson('theory-x-4-2', 'Meaning and Expression', 'What does music mean?', 'How music carries meaning. Absolute vs programmatic.', '30 min', 'theory'),
    lesson('theory-x-4-3', 'Your Philosophy', 'Write it down', 'Articulate your own philosophy of music in a short essay.', '35 min', 'theory', true)
  ]),
  unit('theory-x-unit-5', 5, 'Leadership', 'Guide others', 'Mentor, lead a section or band, or run a workshop. Communication and responsibility.', '👑', ['theory-x-unit-4'], [
    lesson('theory-x-5-1', 'Mentoring', 'One-on-one growth', 'Mentor a less experienced musician. Set goals and check in.', '30 min', 'theory'),
    lesson('theory-x-5-2', 'Leading a Section', 'Section leader', 'Run a section rehearsal. Give clear cues and feedback.', '25 min', 'theory'),
    lesson('theory-x-5-3', 'Workshop or Clinic', 'Group teaching', 'Design and run a short workshop. Present and facilitate.', '45 min', 'theory', true)
  ]),
  unit('theory-x-unit-6', 6, 'Scholarship', 'Publish and present', 'Prepare work for publication or presentation. Conference, journal, or blog.', '📢', ['theory-x-unit-5'], [
    lesson('theory-x-6-1', 'Abstract and Proposal', 'Pitch your work', 'Write an abstract or proposal for a conference or publication.', '35 min', 'theory'),
    lesson('theory-x-6-2', 'Full Paper or Post', 'Complete piece', 'Write a full paper, article, or long-form blog post.', '50 min', 'theory'),
    lesson('theory-x-6-3', 'Present', 'Share publicly', 'Present your work live or record a presentation. Handle Q&A.', '45 min', 'theory', true)
  ]),
  unit('theory-x-unit-7', 7, 'Interdisciplinary Connections', 'Music and other fields', 'Connect music theory to psychology, acoustics, or other disciplines. Broaden your perspective.', '🔗', ['theory-x-unit-6'], [
    lesson('theory-x-7-1', 'Music and Cognition', 'How we hear', 'Brief overview of perception and cognition in music. Why some progressions "work."', '35 min', 'theory'),
    lesson('theory-x-7-2', 'Acoustics and Tuning', 'Why 12 notes', 'Why equal temperament. How harmonics and intervals relate to physics.', '35 min', 'theory'),
    lesson('theory-x-7-3', 'Your Connection', 'One link', 'Choose one connection (e.g. theory and emotion) and write or present on it.', '40 min', 'theory', true)
  ]),
  unit('theory-x-unit-8', 8, 'Ongoing Study', 'Never stop learning', 'Plan your next 1–2 years of theory study. New topics, deeper dives, and teaching.', '📚', ['theory-x-unit-7'], [
    lesson('theory-x-8-1', 'Gaps and Interests', 'What next?', 'List areas you have not studied or want to deepen. Prioritize one.', '30 min', 'theory'),
    lesson('theory-x-8-2', 'Resources and Community', 'Books, courses, people', 'Identify resources and people who can support your next phase of study.', '30 min', 'theory'),
    lesson('theory-x-8-3', 'A Two-Year Plan', 'Concrete goals', 'Write 3–5 concrete theory goals for the next two years. Review quarterly.', '35 min', 'theory', true)
  ]),
  unit('theory-x-unit-9', 9, 'Synthesis and Communication', 'Bring it all together', 'Write or present a short piece that synthesizes two or more areas (e.g. analysis and composition, or history and pedagogy). Share it with a peer or audience.', '🔗', ['theory-x-unit-8'], [
    lesson('theory-x-9-1', 'Choose a Synthesis', 'Two areas, one piece', 'Pick two areas (e.g. jazz harmony and form). Write a short essay, lesson plan, or analysis that uses both.', '40 min', 'theory'),
    lesson('theory-x-9-2', 'Share and Refine', 'Peer or public', 'Share with a peer, in a workshop, or online. Refine based on feedback.', '35 min', 'theory', true)
  ]),
  unit('theory-x-unit-10', 10, 'Expert Theory Summit', 'Lifelong learning', 'Review your full theory path from basics to expert. Set 1–2 long-term theory goals: research, teaching, or continued study. Plan how you will stay engaged for the next year.', '📐', ['theory-x-unit-9'], [
    lesson('theory-x-10-1', 'Full Theory Review', 'From notes to research', 'List every major topic you have studied. Note what you use most and what you want to revisit.', '35 min', 'theory'),
    lesson('theory-x-10-2', 'Next Phase', 'Goals and community', 'Write 1–2 theory goals for the next 12 months. Identify one resource and one person or group for accountability.', '25 min', 'theory', true)
  ])
];
