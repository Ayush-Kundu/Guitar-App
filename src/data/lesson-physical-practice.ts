/**
 * Physical practice between quiz questions + copy for dedicated practice sessions.
 * Keeps technique/theory grounded in something you can do with the guitar in your hands.
 */

const DEFAULT_INTER_QUIZ: string[] = [
  'Relax your shoulders and jaw. Pluck each open string once, listening for a clear ring.',
  'Curve your fretting fingers; press one string behind a fret and pluck—no buzz.',
  'Hold any comfortable open chord; strum down slowly once, then mute and reset your posture.',
  'Tap your foot on beats 1–4 while muting strings with your fretting hand—feel the pulse.',
  'Without a pick, pluck the top three strings with thumb–index–middle once each.',
  'Slide your hand to a new fret; press and pluck one note—notice the pitch change.',
  'Check your thumb on the back of the neck; strum a gentle down–up on open strings.',
  'Hum a steady note while you play one long open string—match your voice to the pitch.',
];

/** Per-lesson prompts between quiz questions (extended or cycled). */
const LESSON_INTER_QUIZ: Record<string, string[]> = {
  'How to Hold Your Guitar': [
    'Sit or stand with the guitar balanced; neck slightly up. Rest both hands on your lap, then bring the guitar up without hunching.',
    'Place your fretting thumb behind the neck (not over the top). Hover fingers over the strings without pressing yet.',
    'Hold an E major shape lightly—strum once. If your shoulder rises, drop it and try again.',
  ],
  'Your Hands - Where Do They Go?': [
    'Left fingers hover over frets 1–4; right hand rests above the soundhole or pickups.',
    'Tap each string with your picking hand thumb, one at a time, keeping the wrist loose.',
  ],
  'Making Your First Sound': [
    'Pluck the high E string open—let it ring. Stop it with your palm, then pluck again.',
    'Try the low E the same way—compare the thicker vibration in your body.',
  ],
  'The Six Strings': [
    'Say the string names out loud while plucking from thick E to thin e.',
    'Pluck 6-4-2 then 5-3-1—notice low vs high without looking at TAB.',
  ],
  'What Are Frets?': [
    'Press behind fret 3 on the low E; pluck. Release to open—hear the pitch jump.',
    'Slide your finger along one string without plucking—hear the slide between frets.',
  ],
  'How to Press a String': [
    'Press the tip of your finger right behind a fret; pluck until there is zero buzz.',
    'Compare pad vs fingertip on the same fret—fingertip should win for clarity.',
  ],
  'Where Does Your Thumb Go?': [
    'Put thumb mid-back of neck; play one note per string on one fret.',
    'Move thumb slightly higher on the neck; notice how reach changes—return to neutral.',
  ],
  'One Finger Per Fret': [
    'On one string, place index–middle–ring–pinky on four frets in a row; pluck each once.',
    'Keep the curve: no flat “pancake” fingers—check each note rings alone.',
  ],
  'What Is a Chord?': [
    'Strum all strings open once, then mute—feel the difference vs one note.',
    'Hold Em; pluck each string one by one to hear three pitches at once.',
  ],
  'E Minor - Your First Chord': [
    'Form Em without strumming—lift and reset fingers twice for muscle memory.',
    'Strum Em four slow downs, counting 1-2-3-4.',
  ],
  'A Major - The Happy Sound': [
    'Arc your fingers so the high E rings clear in A major.',
    'Switch hand shape: air-A to Em shape twice without the guitar buzzing.',
  ],
  'D Major - The Classic': [
    'Mute the low E with your thumb tip; strum D so only intended strings ring.',
    'Downstrum D twice—check the triangle shape didn’t collapse.',
  ],
  'Switching Between Chords': [
    'Slow change Em → A: land fingers together, one strum each.',
    'Slow change A → D: minimal motion—only fingers that must move.',
  ],
  'Practice: Em, A, and D': [
    'One bar each: Em, A, D—tap foot, don’t rush the landing.',
  ],
  'Down Strums': [
    'Mute strings with fretting hand; practice 8 silent down strums from the elbow.',
    'Open strum down on Em—follow through so the pick crosses every string.',
  ],
  'Up Strums': [
    'Brush up across thin strings only—wrist flex, not whole-arm flail.',
    'Down-up on muted strings, then one real up on Em.',
  ],
  'Down-Up Pattern': [
    'Say “down-up” aloud while doing it on muted strings—sync voice and hand.',
  ],
  'Your First Strum Pattern': [
    'Clap the pattern first, then transfer to muted guitar, then to a chord.',
  ],
  'G Major - The Big Stretch': [
    'Place G shape; wiggle pinky on the high string until it’s curved, not flat.',
  ],
  'C Major - The Most Popular': [
    'Pluck C string by string—fix any finger that blocks the high E.',
  ],
  'A Minor - The Sad Sister': [
    'Move from C to Am by moving one finger—strum each once.',
  ],
  'E Major - Power and Brightness': [
    'Compare Em vs E: add the finger, strum both—hear major vs minor.',
  ],
  'The 4-Chord Song': [
    'Loop G–D–Em–C once slowly with only down strums.',
  ],
  'Fixing String Buzz': [
    'Buzz on purpose, then fix with more pressure + closer to fret—feel the difference.',
  ],
  'Fixing Muted Strings': [
    'Play an arpeggio on any chord—find the dead string and arch a finger.',
  ],
  'The Chord Check': [
    'Pick one chord you know; check each string slowly like a mechanic.',
  ],
  'Muting Strings You Don\'t Want': [
    'Touch low strings lightly with thumb; strum a treble-only fragment.',
  ],
  'Holding a Pick Properly': [
    'Grip pick at the tip; alternate down-up on one muted string.',
  ],
  'Picking One String at a Time': [
    'Play open 6-5-4-3-2-1 in order, then reverse—no looking if you can.',
  ],
  'Alternate Picking': [
    'On one string: down-up-down-up sixteen times at a comfortable tempo.',
  ],
  'Your First Riff: Smoke on the Water': [
    'Play the first three notes ultra-slow; add speed only when clean.',
  ],
  'Fingers Have Names': [
    'Rest pinky on the top of the guitar; pluck 6-3-2-1 with p-i-m-a once.',
  ],
  'Thumb on Bass Strings': [
    'Thumb only on E, A, D—one pluck each, steady rhythm.',
  ],
  'Fingers on Treble Strings': [
    'i-m-a on G-B-e in order; repeat four times.',
  ],
  'Simple Fingerpicking Pattern': [
    'Hold G or C; speak “p-i-m-a-m-i” while plucking once through the pattern.',
  ],
  'Hammer-Ons': [
    'Pick fret 5, hammer to 7 on one string—listen for volume without a second pick.',
  ],
  'Pull-Offs': [
    'Fret two notes; pick high, pull off to lower—second note must speak.',
  ],
  'Slides': [
    'Slide 3→5 on one string in one motion—no gap of silence in the middle.',
  ],
  'Basic Bends': [
    'On G string, tiny bend until pitch “kisses” the next fret—stop if it hurts.',
  ],
  'Vibrato - Making Notes Sing': [
    'Hold any sustained note; add tiny parallel wobble—smaller is often better.',
  ],
  'What Is a Barre Chord?': [
    'Lay index lightly across all strings; pluck each—goal is awareness, not perfection yet.',
  ],
  'Building Barre Strength': [
    'Barre at fret 5 (easier); pluck each string; move to fret 3 if clean.',
  ],
  'F Major - The First Barre Chord': [
    'F shape: reset barre, pluck 1-2-3-4-5-6 slowly.',
  ],
  'Moving Barre Shapes': [
    'Slide F shape from 1 to 3 without losing shape—two strums total.',
  ],
  // Theory – still physical on guitar
  'Parts of the Guitar': [
    'Point to bridge, nut, and frets on your instrument while naming them aloud.',
    'Pluck once near bridge vs over soundhole—hear tone difference.',
  ],
  'How Guitars Make Sound': [
    'Pluck softly vs firmly—same note, different volume; feel the string move.',
  ],
  'High vs Low Sounds': [
    'Play low E then high e open—sing which is higher without looking.',
  ],
  'What Is Tuning?': [
    'Turn one peg a tiny bit; hear pitch drift—return to in-tune with a tuner.',
  ],
  'The Musical Alphabet': [
    'Play open E; move up one fret at a time saying letter names to fret 4.',
  ],
  'Sharps and Flats': [
    'On low E: open=E, fret1=F, fret2=F#—say “sharp” as you move up a fret.',
  ],
  'The 12 Notes in Music': [
    'Climb frets 0–12 on one string naming each pitch (use sharp names).',
  ],
  'Notes on the Guitar': [
    'Find two different places to play the same pitch on two strings—listen for match.',
  ],
  'What Is TAB?': [
    'Mute strings; “air tab” the bottom line with your finger in the air—then pluck string 6 open.',
  ],
  'Reading Fret Numbers': [
    'Play 0-3-5 on the low E as if reading numbers on the lowest TAB line.',
  ],
  'TAB Symbols': [
    'On one string, play a tiny hammer between two frets you know well.',
  ],
  'Reading Real TAB': [
    'Play the first bar of any simple TAB ultra-slow—accuracy over speed.',
  ],
  'What Is Rhythm?': [
    'Clap quarter notes; add guitar on muted strings on the same pulse.',
  ],
  'Beats and Tempo': [
    'Foot tap at 60 BPM; strum down on each tap with muted strings.',
  ],
  'Counting 4/4 Time': [
    'Count 1-2-3-4 aloud while strumming downs on each number.',
  ],
  'Note Lengths': [
    'Play a long note (4 beats) vs short notes (1 beat each) on one pitch.',
  ],
  'What Makes a Chord?': [
    'Arpeggiate a triad you know—say “root, third, fifth” as you pluck.',
  ],
  'Major vs Minor': [
    'Play C then Cm (or E vs Em)—hum which feels brighter vs darker.',
  ],
  'Reading Chord Names': [
    'Finger G, Am, C in order reading symbols only—no chart peek if you can.',
  ],
  'Common Chord Progressions': [
    'Loop I–V–vi–IV in a key you know—down strums only.',
  ],
};

const TOPIC_COPY: Record<
  string,
  { focusTitle: string; instructions: string[] }
> = {
  'How to Hold Your Guitar': {
    focusTitle: 'Posture & balance',
    instructions: [
      'Balance the guitar on your leg or strap so the neck angles slightly upward.',
      'Keep shoulders low; wrists straight enough that nothing cramps.',
      'Use the E chord to check: strum once—good posture should feel sustainable for minutes.',
    ],
  },
  'Your Hands - Where Do They Go?': {
    focusTitle: 'Hand placement',
    instructions: [
      'Fretting hand: thumb opposite the middle of the neck, fingers curved over the fretboard.',
      'Picking hand: rest lightly near the soundhole or bridge—stable but not locked.',
    ],
  },
  'Making Your First Sound': {
    focusTitle: 'First plucks',
    instructions: ['Pluck one string with your finger or pick and let it ring until it fades.'],
  },
  'The Six Strings': {
    focusTitle: 'String names & order',
    instructions: ['Pluck from thickest to thinnest naming E-A-D-G-B-e aloud.'],
  },
  'What Are Frets?': {
    focusTitle: 'Frets change pitch',
    instructions: ['Press behind one fret, pluck, release—connect metal bar = higher pitch.'],
  },
  'How to Press a String': {
    focusTitle: 'Clean fretting',
    instructions: ['Fingertip behind the fret, enough pressure for a clear note—no adjacent string mute.'],
  },
  'Where Does Your Thumb Go?': {
    focusTitle: 'Thumb position',
    instructions: ['Thumb on the back of the neck supports curved fingers—try a small four-fret stretch.'],
  },
  'One Finger Per Fret': {
    focusTitle: 'Four-fret frame',
    instructions: ['In one position, one finger per fret on a single string—four plucks in a row.'],
  },
  'What Is a Chord?': {
    focusTitle: 'Hearing harmony',
    instructions: ['Strum Em and hear multiple notes; compare to a single plucked string.'],
  },
  'E Minor - Your First Chord': {
    focusTitle: 'Em shape',
    instructions: ['Land both fingers together; strum until every string rings.'],
  },
  'A Major - The Happy Sound': {
    focusTitle: 'A major shape',
    instructions: ['Keep fingertips vertical so the high E is not blocked.'],
  },
  'D Major - The Classic': {
    focusTitle: 'D triangle',
    instructions: ['Mute or avoid strings that aren’t in the chord; strum top four cleanly.'],
  },
  'Switching Between Chords': {
    focusTitle: 'Chord changes',
    instructions: ['Move slowly Em ↔ A ↔ D—accuracy before speed.'],
  },
  'Practice: Em, A, and D': {
    focusTitle: 'Em, A, D loop',
    instructions: ['One strum per chord in a loop; tap your foot in 4/4.'],
  },
  'Down Strums': {
    focusTitle: 'Downstrokes',
    instructions: ['From the elbow/wrist, brush through all strings on a down beat.'],
  },
  'Up Strums': {
    focusTitle: 'Upstrokes',
    instructions: ['Catch treble strings on the way back up—light and even.'],
  },
  'Down-Up Pattern': {
    focusTitle: 'Down & up',
    instructions: ['Alternate down-up on muted strings, then apply to a chord you know.'],
  },
  'Your First Strum Pattern': {
    focusTitle: 'Pattern in the body',
    instructions: ['Clap or speak the pattern, then play it on guitar.'],
  },
  'G Major - The Big Stretch': {
    focusTitle: 'G shape & pinky',
    instructions: ['Pinky on high E; stretch from a relaxed shoulder, not a locked wrist.'],
  },
  'C Major - The Most Popular': {
    focusTitle: 'C shape',
    instructions: ['Index clears the high E; arpeggiate to verify every note.'],
  },
  'A Minor - The Sad Sister': {
    focusTitle: 'Am vs C',
    instructions: ['Move one finger between C and Am; hear major vs minor.'],
  },
  'E Major - Power and Brightness': {
    focusTitle: 'E major',
    instructions: ['Compare E and Em—one finger is the whole mood change.'],
  },
  'The 4-Chord Song': {
    focusTitle: 'G D Em C',
    instructions: ['Loop the four chords slowly; voice the next chord before you land it.'],
  },
  'Fixing String Buzz': {
    focusTitle: 'Kill the buzz',
    instructions: ['More pressure + closer to the fret; if still buzzing, check neck relief later.'],
  },
  'Fixing Muted Strings': {
    focusTitle: 'Arch the fingers',
    instructions: ['Come onto fingertips so one string doesn’t touch the pad below.'],
  },
  'The Chord Check': {
    focusTitle: 'Per-string audit',
    instructions: ['Pick each string of a chord alone—fix the first dead string you find.'],
  },
  'Muting Strings You Don\'t Want': {
    focusTitle: 'Controlled silence',
    instructions: ['Touch unused strings with thumb or finger tips to stop them ringing.'],
  },
  'Holding a Pick Properly': {
    focusTitle: 'Pick grip',
    instructions: ['Pinch firmly but not white-knuckle; angle slightly for smooth pass through strings.'],
  },
  'Picking One String at a Time': {
    focusTitle: 'Accuracy',
    instructions: ['Rest hand lightly; aim pick at one string—no sweeping neighbors by accident.'],
  },
  'Alternate Picking': {
    focusTitle: 'Down-up engine',
    instructions: ['Metronome-slow: constant down-up on one note until it feels automatic.'],
  },
  'Your First Riff: Smoke on the Water': {
    focusTitle: 'Riff coordination',
    instructions: ['Tiny cell of the riff on repeat before chaining the whole phrase.'],
  },
  'Fingers Have Names': {
    focusTitle: 'p i m a',
    instructions: ['Assign thumb to bass, i-m-a to treble; pluck one clean cycle.'],
  },
  'Thumb on Bass Strings': {
    focusTitle: 'Thumb plucks',
    instructions: ['p on 6, 5, 4 only—steady quarter notes.'],
  },
  'Fingers on Treble Strings': {
    focusTitle: 'Treble team',
    instructions: ['i on G, m on B, a on high e—upward plucks.'],
  },
  'Simple Fingerpicking Pattern': {
    focusTitle: 'p-i-m-a-m-i',
    instructions: ['Hold a chord; loop the pattern once slowly, then speed up a notch.'],
  },
  'Hammer-Ons': {
    focusTitle: 'Hammer energy',
    instructions: ['Second note must be almost as loud as the picked note—firm hammer.'],
  },
  'Pull-Offs': {
    focusTitle: 'Pull pluck',
    instructions: ['Pull slightly downward so the string snaps against the lower fret.'],
  },
  'Slides': {
    focusTitle: 'Connected glide',
    instructions: ['Maintain pressure while moving—no lift in the middle of the slide.'],
  },
  'Basic Bends': {
    focusTitle: 'Small bends in tune',
    instructions: ['Match the next fret by ear; stop if your finger or wrist hurts.'],
  },
  'Vibrato - Making Notes Sing': {
    focusTitle: 'Vibrato',
    instructions: ['Small motion parallel to frets; let the note speak first, then add motion.'],
  },
  'What Is a Barre Chord?': {
    focusTitle: 'Barre awareness',
    instructions: ['Index across all strings; pluck to map which strings need more pressure.'],
  },
  'Building Barre Strength': {
    focusTitle: 'Barre endurance',
    instructions: ['Start higher on the neck where tension is lower; descend when cleaner.'],
  },
  'F Major - The First Barre Chord': {
    focusTitle: 'F major barre',
    instructions: ['Barre + E-shape; celebrate any day a new string rings clear.'],
  },
  'Moving Barre Shapes': {
    focusTitle: 'Moveable shapes',
    instructions: ['Slide the shape without collapsing the index barre.'],
  },
  'Parts of the Guitar': {
    focusTitle: 'Know your instrument',
    instructions: ['Touch each part as you name it; pluck over soundhole vs near bridge.'],
  },
  'How Guitars Make Sound': {
    focusTitle: 'Vibration',
    instructions: ['Feel the top move on an acoustic when you play loudly vs softly.'],
  },
  'High vs Low Sounds': {
    focusTitle: 'Pitch direction',
    instructions: ['Thick vs thin string; connect the feel in your body to “low” and “high.”'],
  },
  'What Is Tuning?': {
    focusTitle: 'Tuning by ear + tuner',
    instructions: ['Detune slightly and bring one string back—train your ear to “home.”'],
  },
  'The Musical Alphabet': {
    focusTitle: 'Letters on the neck',
    instructions: ['Walk up frets naming naturals; say sharp names for in-between frets.'],
  },
  'Sharps and Flats': {
    focusTitle: 'Half steps',
    instructions: ['One fret = one half step; play A, A#, B on one string.'],
  },
  'The 12 Notes in Music': {
    focusTitle: 'Chromatic climb',
    instructions: ['Play all 12 on one string slowly—connect theory to the fretboard.'],
  },
  'Notes on the Guitar': {
    focusTitle: 'Same note, different string',
    instructions: ['Find two places for one pitch; tune by matching timbre.'],
  },
  'What Is TAB?': {
    focusTitle: 'TAB ↔ strings',
    instructions: ['Bottom line of TAB = thickest string; pluck what you “read.”'],
  },
  'Reading Fret Numbers': {
    focusTitle: 'Numbers = frets',
    instructions: ['0 = open; other numbers = press that fret on that line’s string.'],
  },
  'TAB Symbols': {
    focusTitle: 'Technique in TAB',
    instructions: ['Try one hammer or slide on a string you already know well.'],
  },
  'Reading Real TAB': {
    focusTitle: 'Real music',
    instructions: ['First phrase only—loop until your hands remember it.'],
  },
  'What Is Rhythm?': {
    focusTitle: 'Time & pulse',
    instructions: ['Clap while strumming muted strings on the same beats.'],
  },
  'Beats and Tempo': {
    focusTitle: 'Steady beat',
    instructions: ['Foot + downstrum together; change tempo slightly and keep alignment.'],
  },
  'Counting 4/4 Time': {
    focusTitle: 'Four beats',
    instructions: ['Say 1-2-3-4; strum down on each number.'],
  },
  'Note Lengths': {
    focusTitle: 'Long vs short',
    instructions: ['Hold vs staccato on one note—control stop and start with both hands.'],
  },
  'What Makes a Chord?': {
    focusTitle: 'Triad ear training',
    instructions: ['Arpeggiate root–third–fifth; strum the full chord—same notes, different texture.'],
  },
  'Major vs Minor': {
    focusTitle: 'Third defines mood',
    instructions: ['Toggle major/minor with same root; listen for the third’s color.'],
  },
  'Reading Chord Names': {
    focusTitle: 'Symbols → hands',
    instructions: ['Read G, Am, C7 from symbols only if you can—then verify by sound.'],
  },
  'Common Chord Progressions': {
    focusTitle: 'Progression loop',
    instructions: ['Play a famous four-chord loop; hum the root movement.'],
  },
};

const ALL_LESSON_KEYS = [...new Set([...Object.keys(LESSON_INTER_QUIZ), ...Object.keys(TOPIC_COPY)])];

/** Match journey lesson title to our copy keys (exact, then longest substring). */
export function resolveLessonPhysicalKey(title: string): string | null {
  const lower = title.toLowerCase().trim();
  const exact = ALL_LESSON_KEYS.find((k) => k.toLowerCase() === lower);
  if (exact) return exact;
  const sorted = [...ALL_LESSON_KEYS].sort((a, b) => b.length - a.length);
  return sorted.find((k) => lower.includes(k.toLowerCase())) ?? null;
}

function pickInterQuizForLesson(title: string, description: string, gapIndex: number): string {
  const key = resolveLessonPhysicalKey(title);
  const list = key ? LESSON_INTER_QUIZ[key] : null;
  if (list?.length) {
    return list[gapIndex % list.length];
  }
  const text = `${title} ${description}`.toLowerCase();
  const themed: string[] = [];
  if (/posture|hold|sit|strap|comfort|anatomy|wrist|thumb behind|neck/.test(text)) {
    themed.push(
      'Reset posture: feet flat, guitar balanced, neck slightly up—strum one open chord.',
      'Roll shoulders back; mute strings and do 4 silent down strums with a straight wrist.'
    );
  }
  if (/strum|pattern|pick|plectrum|downstroke|upstroke/.test(text)) {
    themed.push(
      'Mute all strings; practice 8 down-ups keeping the pick angle steady.',
      'Play one chord you know with only down strums on beats 1–4.'
    );
  }
  if (/fret|press|finger|chord|scale|hammer|pull|slide|bend|barre|fingerpick|p-i-m-a/.test(text)) {
    themed.push(
      'Slow arpeggio on any chord—fix the first buzzy or dead string you hear.',
      'Press-release-press on one fret; train fingertip memory without speed.'
    );
  }
  if (/tab|read|notation|rhythm|tempo|beat|theory|note|key|progression/.test(text)) {
    themed.push(
      'Play one bar you know by heart while counting 1-2-3-4 out loud.',
      'Find any two frets a whole step apart; play them back and forth naming the idea (whole step).'
    );
  }
  const pool = themed.length ? themed : DEFAULT_INTER_QUIZ;
  return pool[gapIndex % pool.length];
}

/** Short card title from the instruction (first sentence, trimmed). */
export function derivePhysicalTopicTitle(instruction: string): string {
  const first = instruction.split(/(?<=[.!?])\s+/)[0]?.trim() || instruction.trim();
  if (first.length <= 64) return first;
  return `${first.slice(0, 61)}…`;
}

/** One journey row per physical topic (same prompts as former inter-quiz breaks). */
export function getSeparatePhysicalPracticeTopics(
  lessonTitle: string,
  lessonDescription: string,
  numQuizItems: number
): { stepIndex: number; topicTitle: string; instruction: string }[] {
  const steps = getInterQuizPhysicalSteps(lessonTitle, lessonDescription, numQuizItems);
  return steps.map((instruction, i) => ({
    stepIndex: i,
    topicTitle: derivePhysicalTopicTitle(instruction),
    instruction,
  }));
}

/** Between-question physical prompts; length = max(0, numQuizItems - 1). */
export function getInterQuizPhysicalSteps(
  lessonTitle: string,
  lessonDescription: string,
  numQuizItems: number
): string[] {
  const gaps = Math.max(0, numQuizItems - 1);
  const out: string[] = [];
  const key = resolveLessonPhysicalKey(lessonTitle);
  const explicit = key ? LESSON_INTER_QUIZ[key] : null;
  for (let g = 0; g < gaps; g++) {
    if (explicit?.[g]) out.push(explicit[g]);
    else if (explicit?.length) out.push(explicit[g % explicit.length]);
    else out.push(pickInterQuizForLesson(lessonTitle, lessonDescription, g));
  }
  return out;
}

/** Title + bullets for the dedicated practice session (alternating “practice” day). */
export function getLessonPracticeTopicCopy(
  lessonTitle: string,
  lessonDescription: string
): { focusTitle: string; instructions: string[] } {
  const direct = TOPIC_COPY[lessonTitle];
  if (direct) return direct;
  const key = resolveLessonPhysicalKey(lessonTitle);
  if (key && TOPIC_COPY[key]) return TOPIC_COPY[key];
  const text = `${lessonTitle} ${lessonDescription}`.toLowerCase();
  if (/posture|hold|sit|strap/.test(text)) {
    return {
      focusTitle: 'Comfort & posture',
      instructions: [
        'Sit or stand with the guitar stable; relax shoulders.',
        'Hold an E major shape and strum once—adjust until nothing hurts.',
      ],
    };
  }
  if (/strum|pattern|rhythm|tempo|beat/.test(text)) {
    return {
      focusTitle: 'Rhythm on the instrument',
      instructions: [
        'Mute strings; tap foot and strum down on each beat.',
        'Add a simple down-up on Em or Am when the pulse feels steady.',
      ],
    };
  }
  if (/tab|read|note|theory|scale|chord name|key|interval/.test(text)) {
    return {
      focusTitle: 'Connect ideas to the neck',
      instructions: [
        'Play one octave of notes slowly on a single string while saying names or counts.',
        'Form any open chord you know and arpeggiate—link the shape to what you studied.',
      ],
    };
  }
  return {
    focusTitle: 'Hands-on review',
    instructions: [
      'Apply what you just learned: slow, small movements, clear sound on every note.',
      'If something buzzes, adjust pressure or posture before speeding up.',
    ],
  };
}
