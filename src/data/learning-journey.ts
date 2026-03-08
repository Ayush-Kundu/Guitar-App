/**
 * Learning Journey - A guided path from zero to hero
 * 
 * This file defines the complete learning curriculum organized into
 * Units > Lessons with clear prerequisites and beginner-friendly language.
 */

// =============================================================================
// TYPES
// =============================================================================

export interface Lesson {
  id: string;
  title: string;
  subtitle: string;  // Beginner-friendly explanation
  description: string;
  estimatedTime: string;
  type: 'technique' | 'theory';
  videoId?: string;
  quizRequired?: boolean;
  /** When set, this topic opens the Technique Theory practice popup (chord recognizer) instead of the quiz. Use as its own topic at the end of a unit; post-quiz practice is a subtopic (no separate card). */
  practiceChords?: string[];
}

export interface Unit {
  id: string;
  number: number;
  title: string;
  subtitle: string;
  description: string;
  icon: string;  // Emoji for visual
  lessons: Lesson[];
  prerequisiteUnits: string[];  // Unit IDs that must be completed first
}

export interface LearningPath {
  technique: Unit[];
  theory: Unit[];
}

// =============================================================================
// TECHNIQUE LEARNING PATH
// =============================================================================

export const techniquePath: Unit[] = [
  // UNIT 1: Getting Started
  {
    id: 'tech-unit-1',
    number: 1,
    title: 'Getting Started',
    subtitle: 'Your first steps with the guitar',
    description: 'Learn how to hold your guitar, sit properly, and make your first sounds. No experience needed!',
    icon: '🎸',
    prerequisiteUnits: [],
    lessons: [
      {
        id: 'tech-1-1',
        title: 'How to Hold Your Guitar',
        subtitle: 'The right way to sit and hold your instrument',
        description: 'Before you play a single note, you need to know how to hold your guitar comfortably. Bad posture leads to pain and bad habits. We\'ll show you the proper way to sit (or stand) with your guitar so you can play for hours without strain.',
        estimatedTime: '5 min',
        type: 'technique'
      },
      {
        id: 'tech-1-2',
        title: 'Your Hands - Where Do They Go?',
        subtitle: 'Left hand on the neck, right hand on the strings',
        description: 'Your left hand presses the strings on the fretboard (the long wooden part with metal bars). Your right hand plucks or strums the strings over the sound hole. Let\'s learn where each hand should rest.',
        estimatedTime: '5 min',
        type: 'technique'
      },
      {
        id: 'tech-1-3',
        title: 'Making Your First Sound',
        subtitle: 'Pluck a string and hear it ring!',
        description: 'Use your thumb or finger to pluck any string. Congratulations - you\'ve just played your first note! Now let\'s try each string one by one and hear the different sounds they make.',
        estimatedTime: '5 min',
        type: 'technique'
      },
      {
        id: 'tech-1-4',
        title: 'The Six Strings',
        subtitle: 'E-A-D-G-B-E from thick to thin',
        description: 'The guitar has 6 strings. The thickest one (closest to your chin) is the low E string. The thinnest one is also called E but sounds higher. We remember them with: "Eddie Ate Dynamite, Good Bye Eddie"',
        estimatedTime: '10 min',
        type: 'technique',
        quizRequired: true
      }
    ]
  },

  // UNIT 2: Using Your Fingers
  {
    id: 'tech-unit-2',
    number: 2,
    title: 'Using Your Fingers',
    subtitle: 'Press strings to change the notes',
    description: 'Learn how to press down on the strings to create different notes. This is called "fretting" and it\'s how you\'ll play melodies and chords.',
    icon: '👆',
    prerequisiteUnits: ['tech-unit-1'],
    lessons: [
      {
        id: 'tech-2-1',
        title: 'What Are Frets?',
        subtitle: 'The metal bars on the neck',
        description: 'Those metal bars going across the neck are called "frets". When you press a string down just behind a fret (not on top of it!), the note changes. The closer to the body, the higher the note.',
        estimatedTime: '5 min',
        type: 'technique'
      },
      {
        id: 'tech-2-2',
        title: 'How to Press a String',
        subtitle: 'Fingertip, not the pad - right behind the fret',
        description: 'Use your fingertip (not the flat part) to press the string down firmly. Press right behind the fret wire, not in the middle of the space. Too little pressure = buzzing sound. Too much = sore fingers. Let\'s find the sweet spot!',
        estimatedTime: '10 min',
        type: 'technique'
      },
      {
        id: 'tech-2-3',
        title: 'Where Does Your Thumb Go?',
        subtitle: 'Behind the neck, pointing up',
        description: 'Your thumb should rest on the back of the neck, roughly behind your middle finger. Don\'t wrap it around the top! A proper thumb position gives your fingers more strength and reach.',
        estimatedTime: '5 min',
        type: 'technique'
      },
      {
        id: 'tech-2-4',
        title: 'One Finger Per Fret',
        subtitle: 'Index=1, Middle=2, Ring=3, Pinky=4',
        description: 'Here\'s a rule that will help forever: assign each finger to a fret. If you\'re at fret 1, use your index finger. Fret 2 = middle finger. Fret 3 = ring. Fret 4 = pinky. This keeps your hand in position.',
        estimatedTime: '10 min',
        type: 'technique',
        quizRequired: true
      }
    ]
  },

  // UNIT 3: Your First Chords
  {
    id: 'tech-unit-3',
    number: 3,
    title: 'Your First Chords',
    subtitle: 'Play multiple notes at once',
    description: 'A chord is multiple notes played together. You\'ll learn your first easy chords that sound great and appear in thousands of songs!',
    icon: '🎵',
    prerequisiteUnits: ['tech-unit-2'],
    lessons: [
      {
        id: 'tech-3-1',
        title: 'What Is a Chord?',
        subtitle: '3 or more notes ringing together',
        description: 'When you play 3 or more notes at the same time, that\'s a chord! Chords are the building blocks of songs. Some sound happy (major), some sound sad (minor). Let\'s learn your first one.',
        estimatedTime: '5 min',
        type: 'technique'
      },
      {
        id: 'tech-3-2',
        title: 'E Minor - Your First Chord',
        subtitle: 'Just 2 fingers - sounds amazing!',
        description: 'Put your middle finger on string 5, fret 2. Put your ring finger on string 4, fret 2. Now strum all 6 strings. That beautiful sad sound is E minor (Em). It\'s in hundreds of rock songs!',
        estimatedTime: '10 min',
        type: 'technique'
      },
      {
        id: 'tech-3-3',
        title: 'A Major - The Happy Sound',
        subtitle: '3 fingers in a row on fret 2',
        description: 'Place your index, middle, and ring fingers on strings 4, 3, and 2, all at fret 2. Strum strings 5 through 1 (skip the thickest string). That bright, happy sound is A major!',
        estimatedTime: '10 min',
        type: 'technique'
      },
      {
        id: 'tech-3-4',
        title: 'D Major - The Classic',
        subtitle: 'A triangle shape on the thin strings',
        description: 'This one takes some finger stretching but sounds beautiful. Index on string 3 fret 2, ring on string 2 fret 3, middle on string 1 fret 2. Strum only the 4 thinnest strings.',
        estimatedTime: '15 min',
        type: 'technique'
      },
      {
        id: 'tech-3-5',
        title: 'Switching Between Chords',
        subtitle: 'The real skill - changing smoothly',
        description: 'Playing one chord is easy. The hard part is switching between them without stopping! Let\'s practice going from Em to A to D. Start slow - speed comes with practice.',
        estimatedTime: '15 min',
        type: 'technique',
        quizRequired: true
      },
      {
        id: 'tech-3-6',
        title: 'Practice: Em, A, and D',
        subtitle: 'Chord recognizer practice (own topic)',
        description: 'Practice E minor, A major, and D major with the chord recognizer. This topic is at the end of the unit and opens the practice popup.',
        estimatedTime: '5 min',
        type: 'technique',
        practiceChords: ['Em', 'A', 'D']
      }
    ]
  },

  // UNIT 4: Strumming Basics
  {
    id: 'tech-unit-4',
    number: 4,
    title: 'Strumming Basics',
    subtitle: 'Create rhythm with your picking hand',
    description: 'Learn how to strum the strings to create rhythm. This is what makes songs come alive!',
    icon: '🎶',
    prerequisiteUnits: ['tech-unit-3'],
    lessons: [
      {
        id: 'tech-4-1',
        title: 'Down Strums',
        subtitle: 'Brush down across all strings',
        description: 'Hold your pick (or use your thumb) and brush downward across the strings. Keep your wrist loose - the motion should come from your wrist, not your elbow. Try strumming in a steady rhythm: 1, 2, 3, 4.',
        estimatedTime: '10 min',
        type: 'technique'
      },
      {
        id: 'tech-4-2',
        title: 'Up Strums',
        subtitle: 'The return trip catches the thin strings',
        description: 'After strumming down, bring your hand back up and catch the strings on the way. You don\'t need to hit all 6 - usually just the thinnest 3-4 strings. Down catches them all, up catches the treble.',
        estimatedTime: '10 min',
        type: 'technique'
      },
      {
        id: 'tech-4-3',
        title: 'Down-Up Pattern',
        subtitle: 'The foundation of all strumming',
        description: 'Combine down and up strums: Down-Up-Down-Up. Keep your arm moving constantly like a pendulum. Even when you skip a strum, keep the arm moving. This is the secret to good rhythm!',
        estimatedTime: '15 min',
        type: 'technique'
      },
      {
        id: 'tech-4-4',
        title: 'Your First Strum Pattern',
        subtitle: 'D-D-U-U-D-U (works with tons of songs)',
        description: 'This pattern works with hundreds of songs: Down, Down, Up, Up, Down, Up. Try it slowly first, then speed up. Once you can do this without thinking, you can play so many songs!',
        estimatedTime: '15 min',
        type: 'technique',
        quizRequired: true
      }
    ]
  },

  // UNIT 5: More Essential Chords
  {
    id: 'tech-unit-5',
    number: 5,
    title: 'More Essential Chords',
    subtitle: 'Complete your chord vocabulary',
    description: 'Learn G, C, and other essential chords. With these plus what you know, you can play thousands of songs!',
    icon: '✋',
    prerequisiteUnits: ['tech-unit-4'],
    lessons: [
      {
        id: 'tech-5-1',
        title: 'G Major - The Big Stretch',
        subtitle: 'Use your pinky for the first time',
        description: 'G major uses your pinky! Middle finger on string 5 fret 2, index on string 5 fret 2, ring on string 6 fret 3, pinky on string 1 fret 3. Strum all 6 strings. This one takes practice!',
        estimatedTime: '15 min',
        type: 'technique'
      },
      {
        id: 'tech-5-2',
        title: 'C Major - The Most Popular',
        subtitle: 'The most used chord in music',
        description: 'Ring finger on string 5 fret 3, middle on string 4 fret 2, index on string 2 fret 1. Strum from string 5 down. C major appears in almost every genre of music!',
        estimatedTime: '15 min',
        type: 'technique'
      },
      {
        id: 'tech-5-3',
        title: 'A Minor - The Sad Sister',
        subtitle: 'Just move one finger from C!',
        description: 'Great news - A minor is just like C major but move your ring finger from string 5 to string 3 (still fret 2 and 1). These two chords are best friends and switch easily!',
        estimatedTime: '10 min',
        type: 'technique'
      },
      {
        id: 'tech-5-4',
        title: 'E Major - Power and Brightness',
        subtitle: 'Similar to Em but with one extra finger',
        description: 'Remember E minor? Add your index finger on string 3 fret 1, and you\'ve got E major! Strum all 6 strings for a full, bright sound.',
        estimatedTime: '10 min',
        type: 'technique'
      },
      {
        id: 'tech-5-5',
        title: 'The 4-Chord Song',
        subtitle: 'G-D-Em-C: Play hundreds of songs',
        description: 'These 4 chords (G, D, Em, C) are used in SO many songs: Let It Be, No Woman No Cry, With or Without You, and hundreds more. Practice switching between them!',
        estimatedTime: '20 min',
        type: 'technique',
        quizRequired: true
      }
    ]
  },

  // UNIT 6: Clean Playing
  {
    id: 'tech-unit-6',
    number: 6,
    title: 'Clean Playing',
    subtitle: 'Make every note ring clearly',
    description: 'Learn techniques to make your playing sound professional - no buzzing, no muted strings, just clean sound.',
    icon: '✨',
    prerequisiteUnits: ['tech-unit-5'],
    lessons: [
      {
        id: 'tech-6-1',
        title: 'Fixing String Buzz',
        subtitle: 'Press harder and check your position',
        description: 'If a string buzzes, you\'re either not pressing hard enough, or your finger is too far from the fret. Move closer to the fret wire and press firmly. The buzz will disappear!',
        estimatedTime: '10 min',
        type: 'technique'
      },
      {
        id: 'tech-6-2',
        title: 'Fixing Muted Strings',
        subtitle: 'Arch your fingers - don\'t flatten them',
        description: 'If a string sounds dead/muted, another finger is touching it. The solution: arch your fingers more so only the fingertips touch. Keep those knuckles high!',
        estimatedTime: '10 min',
        type: 'technique'
      },
      {
        id: 'tech-6-3',
        title: 'The Chord Check',
        subtitle: 'Play each string one by one',
        description: 'To diagnose problems, play each string individually while holding a chord. Does every string ring clearly? If not, adjust your fingers until every note sounds clean.',
        estimatedTime: '10 min',
        type: 'technique'
      },
      {
        id: 'tech-6-4',
        title: 'Muting Strings You Don\'t Want',
        subtitle: 'Sometimes silence is golden',
        description: 'The D chord shouldn\'t include the 6th string. Learn to lightly touch unwanted strings with unused fingers or your thumb to keep them quiet.',
        estimatedTime: '15 min',
        type: 'technique',
        quizRequired: true
      }
    ]
  },

  // UNIT 7: Picking Individual Notes
  {
    id: 'tech-unit-7',
    number: 7,
    title: 'Picking Individual Notes',
    subtitle: 'Play melodies and riffs',
    description: 'Move beyond strumming to play individual notes. This is how you play melodies, riffs, and solos!',
    icon: '🎯',
    prerequisiteUnits: ['tech-unit-6'],
    lessons: [
      {
        id: 'tech-7-1',
        title: 'Holding a Pick Properly',
        subtitle: 'Grip firm but relaxed',
        description: 'Hold the pick between your thumb and index finger. Only a small tip should stick out. Grip it firmly but don\'t tense up - a death grip will tire your hand and kill your tone.',
        estimatedTime: '5 min',
        type: 'technique'
      },
      {
        id: 'tech-7-2',
        title: 'Picking One String at a Time',
        subtitle: 'Aim with your wrist, not your arm',
        description: 'To hit one string cleanly, use small wrist movements. Plant your hand on the guitar body for stability. Practice going string to string without hitting neighbors.',
        estimatedTime: '10 min',
        type: 'technique'
      },
      {
        id: 'tech-7-3',
        title: 'Alternate Picking',
        subtitle: 'Down-Up-Down-Up for speed',
        description: 'When playing individual notes, alternate between down and up picks: Down, Up, Down, Up. This is faster and more efficient than all downstrokes.',
        estimatedTime: '15 min',
        type: 'technique'
      },
      {
        id: 'tech-7-4',
        title: 'Your First Riff: Smoke on the Water',
        subtitle: 'The most famous guitar riff ever',
        description: 'Let\'s play something cool! The Smoke on the Water riff uses just a few notes and sounds awesome. You\'ll learn to coordinate both hands to play real music!',
        estimatedTime: '20 min',
        type: 'technique',
        quizRequired: true
      }
    ]
  },

  // UNIT 8: Fingerpicking Introduction
  {
    id: 'tech-unit-8',
    number: 8,
    title: 'Fingerpicking Introduction',
    subtitle: 'Use your fingers instead of a pick',
    description: 'Learn to pluck strings with your fingers for a softer, more intimate sound. Great for folk, classical, and ballads.',
    icon: '🤚',
    prerequisiteUnits: ['tech-unit-7'],
    lessons: [
      {
        id: 'tech-8-1',
        title: 'Fingers Have Names',
        subtitle: 'p-i-m-a: Thumb, Index, Middle, Ring',
        description: 'In fingerpicking, we use letters: p (pulgar/thumb), i (index), m (middle), a (ring). Your pinky usually rests on the guitar. Each finger is assigned specific strings.',
        estimatedTime: '5 min',
        type: 'technique'
      },
      {
        id: 'tech-8-2',
        title: 'Thumb on Bass Strings',
        subtitle: 'p plays strings 6, 5, and 4',
        description: 'Your thumb handles the thick bass strings (6, 5, 4). It plucks downward, away from your palm. The thumb often plays the root note of chords.',
        estimatedTime: '10 min',
        type: 'technique'
      },
      {
        id: 'tech-8-3',
        title: 'Fingers on Treble Strings',
        subtitle: 'i-m-a play strings 3, 2, 1',
        description: 'Your index (i) plays string 3, middle (m) plays string 2, ring (a) plays string 1. They pluck upward, toward your palm.',
        estimatedTime: '10 min',
        type: 'technique'
      },
      {
        id: 'tech-8-4',
        title: 'Simple Fingerpicking Pattern',
        subtitle: 'p-i-m-a-m-i: A beautiful arpeggio',
        description: 'Try this pattern: Thumb, Index, Middle, Ring, Middle, Index. Repeat while holding a chord. This creates a beautiful flowing sound used in countless songs!',
        estimatedTime: '20 min',
        type: 'technique',
        quizRequired: true
      }
    ]
  },

  // UNIT 9: Expression Techniques
  {
    id: 'tech-unit-9',
    number: 9,
    title: 'Expression Techniques',
    subtitle: 'Make your guitar sing and cry',
    description: 'Learn hammer-ons, pull-offs, slides, and bends - the techniques that add emotion and style to your playing.',
    icon: '💫',
    prerequisiteUnits: ['tech-unit-8'],
    lessons: [
      {
        id: 'tech-9-1',
        title: 'Hammer-Ons',
        subtitle: 'Make a note without picking',
        description: 'A hammer-on is when you "hammer" your finger down on a fret to create a note - no pick needed! Pick a note, then slam another finger down on a higher fret. The second note should ring out.',
        estimatedTime: '15 min',
        type: 'technique'
      },
      {
        id: 'tech-9-2',
        title: 'Pull-Offs',
        subtitle: 'The opposite of a hammer-on',
        description: 'A pull-off is like plucking with your fretting hand. Start with two fingers down, pick the higher note, then pull that finger off and slightly down - the lower note will sound!',
        estimatedTime: '15 min',
        type: 'technique'
      },
      {
        id: 'tech-9-3',
        title: 'Slides',
        subtitle: 'Glide smoothly from note to note',
        description: 'A slide is moving from one note to another without lifting your finger. Pick a note, then slide your finger up or down to a new fret while maintaining pressure. Smooth and expressive!',
        estimatedTime: '10 min',
        type: 'technique'
      },
      {
        id: 'tech-9-4',
        title: 'Basic Bends',
        subtitle: 'Push the string to raise the pitch',
        description: 'Bends are when you push a string up (or down) to raise its pitch. This creates that "crying guitar" sound. Start small - just bend up a little, matching the pitch of the next fret.',
        estimatedTime: '15 min',
        type: 'technique'
      },
      {
        id: 'tech-9-5',
        title: 'Vibrato - Making Notes Sing',
        subtitle: 'Wiggle the string for warmth',
        description: 'Vibrato is a slight, rapid wavering of pitch that makes notes come alive. After fretting a note, gently shake your finger side-to-side or use small bends. This is what makes guitar sound human!',
        estimatedTime: '15 min',
        type: 'technique',
        quizRequired: true
      }
    ]
  },

  // UNIT 10: Barre Chords
  {
    id: 'tech-unit-10',
    number: 10,
    title: 'Barre Chords',
    subtitle: 'The gateway to all chords everywhere',
    description: 'Learn to use your index finger as a moveable capo. This unlocks every chord in every position!',
    icon: '🔓',
    prerequisiteUnits: ['tech-unit-9'],
    lessons: [
      {
        id: 'tech-10-1',
        title: 'What Is a Barre Chord?',
        subtitle: 'One finger pressing all strings',
        description: 'A "barre" (bar) is when your index finger lays flat across all strings, acting like a moveable nut. Combined with other finger shapes, you can play any chord anywhere on the neck!',
        estimatedTime: '5 min',
        type: 'technique'
      },
      {
        id: 'tech-10-2',
        title: 'Building Barre Strength',
        subtitle: 'Exercises to build finger strength',
        description: 'Barre chords are hard at first! Let\'s do exercises to build strength. Press all strings at fret 1 and check each one rings. Move up and down the neck. It takes weeks to build this strength.',
        estimatedTime: '15 min',
        type: 'technique'
      },
      {
        id: 'tech-10-3',
        title: 'F Major - The First Barre Chord',
        subtitle: 'The chord everyone struggles with at first',
        description: 'F major is infamous for being hard. Barre all strings at fret 1 with your index, then form an E shape with your other fingers. Don\'t give up - everyone struggles at first!',
        estimatedTime: '20 min',
        type: 'technique'
      },
      {
        id: 'tech-10-4',
        title: 'Moving Barre Shapes',
        subtitle: 'Same shape, different frets = different chords',
        description: 'Here\'s the magic: move that F shape up to fret 3 and it\'s G. Fret 5 = A. Fret 7 = B. One shape, any chord! Same works with minor shapes. This is why barre chords are essential.',
        estimatedTime: '15 min',
        type: 'technique',
        quizRequired: true
      }
    ]
  }
];

// =============================================================================
// THEORY LEARNING PATH
// =============================================================================

export const theoryPath: Unit[] = [
  // UNIT 1: The Basics
  {
    id: 'theory-unit-1',
    number: 1,
    title: 'Understanding Your Guitar',
    subtitle: 'Know your instrument inside and out',
    description: 'Before learning music theory, let\'s understand the guitar itself - its parts, how it makes sound, and basic musical concepts.',
    icon: '🎸',
    prerequisiteUnits: [],
    lessons: [
      {
        id: 'theory-1-1',
        title: 'Parts of the Guitar',
        subtitle: 'Body, neck, headstock, and more',
        description: 'The body is the big curvy part. The neck is the long part with frets. The headstock holds the tuning pegs. The bridge anchors the strings. Let\'s learn every part!',
        estimatedTime: '10 min',
        type: 'theory',
        quizRequired: true
      },
      {
        id: 'theory-1-2',
        title: 'How Guitars Make Sound',
        subtitle: 'Strings vibrate, body resonates',
        description: 'When you pluck a string, it vibrates. These vibrations travel through the bridge into the body, which amplifies them into the sound we hear. Shorter strings = higher pitch.',
        estimatedTime: '5 min',
        type: 'theory'
      },
      {
        id: 'theory-1-3',
        title: 'High vs Low Sounds',
        subtitle: 'Pitch: the thicker the string, the lower the sound',
        description: 'The thick strings produce low sounds (bass). The thin strings produce high sounds (treble). When you press a fret, you shorten the string, making the pitch higher.',
        estimatedTime: '5 min',
        type: 'theory'
      },
      {
        id: 'theory-1-4',
        title: 'What Is Tuning?',
        subtitle: 'Making sure your strings play the right notes',
        description: 'Each string needs to be at the right tightness to play the correct note. Standard tuning is E-A-D-G-B-E. Too tight = too high. Too loose = too low. Always tune before playing!',
        estimatedTime: '10 min',
        type: 'theory',
        quizRequired: true
      }
    ]
  },

  // UNIT 2: Notes and the Musical Alphabet
  {
    id: 'theory-unit-2',
    number: 2,
    title: 'Notes and the Musical Alphabet',
    subtitle: 'The building blocks of all music',
    description: 'Learn the 12 notes that make up all Western music and how they\'re organized on the guitar.',
    icon: '🔤',
    prerequisiteUnits: ['theory-unit-1'],
    lessons: [
      {
        id: 'theory-2-1',
        title: 'The Musical Alphabet',
        subtitle: 'A-B-C-D-E-F-G and back to A',
        description: 'Music only uses 7 letter names: A, B, C, D, E, F, G. After G, it goes back to A! These are called "natural" notes. You\'ll see them written on sheet music and chord charts.',
        estimatedTime: '5 min',
        type: 'theory'
      },
      {
        id: 'theory-2-2',
        title: 'Sharps and Flats',
        subtitle: 'The notes between the letters',
        description: 'Between most letters are extra notes: A-A#-B-C-C#-D-D#-E-F-F#-G-G#. The "#" means "sharp" (slightly higher). "b" means "flat" (slightly lower). A# and Bb are the same note!',
        estimatedTime: '10 min',
        type: 'theory'
      },
      {
        id: 'theory-2-3',
        title: 'The 12 Notes in Music',
        subtitle: 'That\'s it - just 12 notes, repeated',
        description: 'There are only 12 different notes in Western music: A, A#/Bb, B, C, C#/Db, D, D#/Eb, E, F, F#/Gb, G, G#/Ab. Then it repeats! Every song ever written uses just these 12.',
        estimatedTime: '10 min',
        type: 'theory',
        quizRequired: true
      },
      {
        id: 'theory-2-4',
        title: 'Notes on the Guitar',
        subtitle: 'Finding notes on the fretboard',
        description: 'Each fret raises the pitch by one note (half step). Start on the open E string, go up: E, F, F#, G, G#, A, etc. By fret 12, you\'re back to E - just an octave higher!',
        estimatedTime: '15 min',
        type: 'theory',
        quizRequired: true
      }
    ]
  },

  // UNIT 3: Reading Music - TAB
  {
    id: 'theory-unit-3',
    number: 3,
    title: 'Reading Guitar TAB',
    subtitle: 'The easy way to read guitar music',
    description: 'TAB (tablature) shows you exactly where to put your fingers. It\'s much easier than standard notation!',
    icon: '📖',
    prerequisiteUnits: ['theory-unit-2'],
    lessons: [
      {
        id: 'theory-3-1',
        title: 'What Is TAB?',
        subtitle: '6 lines = 6 strings',
        description: 'TAB uses 6 horizontal lines representing your 6 strings. The bottom line is the thickest string (low E), top line is the thinnest (high e). Numbers on the lines tell you which fret to press.',
        estimatedTime: '10 min',
        type: 'theory'
      },
      {
        id: 'theory-3-2',
        title: 'Reading Fret Numbers',
        subtitle: '0 means open, 3 means fret 3',
        description: 'Numbers on the lines are fret numbers. "0" = play the string open (no finger). "3" = press fret 3. Multiple numbers stacked = play them together (a chord)!',
        estimatedTime: '10 min',
        type: 'theory',
        quizRequired: true
      },
      {
        id: 'theory-3-3',
        title: 'TAB Symbols',
        subtitle: 'h = hammer, p = pull, / = slide, b = bend',
        description: 'TAB uses letters for techniques: h (hammer-on), p (pull-off), / or \\ (slide), b (bend), v or ~ (vibrato). Now you can read how to play, not just what notes!',
        estimatedTime: '10 min',
        type: 'theory'
      },
      {
        id: 'theory-3-4',
        title: 'Reading Real TAB',
        subtitle: 'Let\'s read a simple song',
        description: 'Time to put it together! We\'ll read through a simple song tab, identifying chords, single notes, and techniques. This skill will let you learn any song online!',
        estimatedTime: '15 min',
        type: 'theory',
        quizRequired: true
      }
    ]
  },

  // UNIT 4: Rhythm Basics
  {
    id: 'theory-unit-4',
    number: 4,
    title: 'Rhythm Basics',
    subtitle: 'Understanding timing and beats',
    description: 'Music isn\'t just notes - it\'s when you play them! Learn about rhythm, tempo, and time signatures.',
    icon: '⏱️',
    prerequisiteUnits: ['theory-unit-3'],
    lessons: [
      {
        id: 'theory-4-1',
        title: 'What Is Rhythm?',
        subtitle: 'The pattern of sounds in time',
        description: 'Rhythm is the timing of music - when notes happen and how long they last. It\'s why you tap your foot or nod your head. Without rhythm, notes are just random sounds!',
        estimatedTime: '5 min',
        type: 'theory'
      },
      {
        id: 'theory-4-2',
        title: 'Beats and Tempo',
        subtitle: 'The steady pulse of music',
        description: 'The beat is the steady pulse you feel in music. Tempo is how fast the beat goes, measured in BPM (beats per minute). 60 BPM = one beat per second. 120 BPM = twice as fast.',
        estimatedTime: '10 min',
        type: 'theory'
      },
      {
        id: 'theory-4-3',
        title: 'Counting 4/4 Time',
        subtitle: '1-2-3-4, 1-2-3-4 - the most common pattern',
        description: 'Most songs are in "4/4 time" - 4 beats per measure, counted 1-2-3-4, 1-2-3-4. The "1" is usually the strongest beat. Clap along: 1-2-3-4!',
        estimatedTime: '10 min',
        type: 'theory',
        quizRequired: true
      },
      {
        id: 'theory-4-4',
        title: 'Note Lengths',
        subtitle: 'Whole, half, quarter, eighth notes',
        description: 'Notes can be long or short. A whole note lasts 4 beats. Half note = 2 beats. Quarter note = 1 beat. Eighth note = half a beat. These determine how long you hold each note.',
        estimatedTime: '15 min',
        type: 'theory',
        quizRequired: true
      }
    ]
  },

  // UNIT 5: Understanding Chords
  {
    id: 'theory-unit-5',
    number: 5,
    title: 'Understanding Chords',
    subtitle: 'Why chords sound the way they do',
    description: 'Learn what makes a chord major or minor, and how chord names tell you exactly what notes are inside.',
    icon: '🎹',
    prerequisiteUnits: ['theory-unit-4'],
    lessons: [
      {
        id: 'theory-5-1',
        title: 'What Makes a Chord?',
        subtitle: '3+ notes played together',
        description: 'A chord is 3 or more notes sounding together. The most basic chords have 3 notes: the root (1st), third (3rd), and fifth (5th). These numbers refer to scale positions.',
        estimatedTime: '10 min',
        type: 'theory'
      },
      {
        id: 'theory-5-2',
        title: 'Major vs Minor',
        subtitle: 'Why some chords sound happy, others sad',
        description: 'Major chords sound bright and happy. Minor chords sound sad or dark. The difference? Just one note! The "third" in a minor chord is one fret lower than in a major chord.',
        estimatedTime: '10 min',
        type: 'theory',
        quizRequired: true
      },
      {
        id: 'theory-5-3',
        title: 'Reading Chord Names',
        subtitle: 'C, Am, G7, Dmaj7 - what do they mean?',
        description: 'Chord names are codes! The letter is the root note. Nothing after = major. "m" = minor. "7" = add the 7th. "maj7" = major 7th. Once you crack the code, you can decode any chord!',
        estimatedTime: '15 min',
        type: 'theory',
        quizRequired: true
      },
      {
        id: 'theory-5-4',
        title: 'Common Chord Progressions',
        subtitle: 'The patterns behind your favorite songs',
        description: 'Songs use chord progressions - patterns of chords. The I-V-vi-IV progression (like C-G-Am-F) is in hundreds of hit songs! Learning these patterns helps you learn songs faster.',
        estimatedTime: '15 min',
        type: 'theory'
      }
    ]
  },

  // UNIT 6: Scales - The Foundation
  {
    id: 'theory-unit-6',
    number: 6,
    title: 'Scales - The Foundation',
    subtitle: 'The building blocks of melodies',
    description: 'Scales are the foundation of all music. Learn what they are and why they matter.',
    icon: '📐',
    prerequisiteUnits: ['theory-unit-5'],
    lessons: [
      {
        id: 'theory-6-1',
        title: 'What Is a Scale?',
        subtitle: 'A collection of notes that sound good together',
        description: 'A scale is a specific set of notes arranged in order. When you play within a scale, the notes sound "right" together. Melodies, chords, and solos all come from scales!',
        estimatedTime: '10 min',
        type: 'theory'
      },
      {
        id: 'theory-6-2',
        title: 'The Major Scale',
        subtitle: 'Do-Re-Mi-Fa-Sol-La-Ti-Do',
        description: 'The major scale is the most important scale in music. It\'s the "Do-Re-Mi" you learned as a kid. It has 7 notes plus the octave. Happy, bright sound.',
        estimatedTime: '10 min',
        type: 'theory',
        quizRequired: true
      },
      {
        id: 'theory-6-3',
        title: 'The Minor Scale',
        subtitle: 'The same notes, different starting point',
        description: 'The minor scale uses the same notes as a major scale but starts on a different note! C major and A minor have the same notes, but A minor sounds sad because it centers on A.',
        estimatedTime: '10 min',
        type: 'theory'
      },
      {
        id: 'theory-6-4',
        title: 'The Pentatonic Scale',
        subtitle: 'Just 5 notes - sounds great for solos!',
        description: 'The pentatonic scale has only 5 notes (penta = 5). It\'s impossible to play a "wrong" note! This is the go-to scale for rock, blues, and country solos.',
        estimatedTime: '15 min',
        type: 'theory',
        quizRequired: true
      }
    ]
  },

  // UNIT 7: Keys and Key Signatures
  {
    id: 'theory-unit-7',
    number: 7,
    title: 'Keys and Key Signatures',
    subtitle: 'The home base of a song',
    description: 'Every song is in a "key" - understanding keys helps you find the right chords and notes to play.',
    icon: '🔑',
    prerequisiteUnits: ['theory-unit-6'],
    lessons: [
      {
        id: 'theory-7-1',
        title: 'What Is a Key?',
        subtitle: 'The "home" note and scale of a song',
        description: 'A key tells you which note feels like "home" and which scale the song uses. A song in the key of G uses the G major scale. The G note and G chord feel like resolution.',
        estimatedTime: '10 min',
        type: 'theory'
      },
      {
        id: 'theory-7-2',
        title: 'Finding the Key',
        subtitle: 'Which note feels like home?',
        description: 'To find the key, listen for which chord feels like "home" or "resolved". Usually it\'s the first or last chord. That chord\'s root note is likely the key!',
        estimatedTime: '10 min',
        type: 'theory',
        quizRequired: true
      },
      {
        id: 'theory-7-3',
        title: 'Chords in a Key',
        subtitle: 'Which chords go with which key?',
        description: 'Each key has a family of chords that "belong" together. In key of C: C, Dm, Em, F, G, Am, Bdim. Songs usually stick to these chords. This is why some chord progressions sound "right"!',
        estimatedTime: '15 min',
        type: 'theory',
        quizRequired: true
      },
      {
        id: 'theory-7-4',
        title: 'Using a Capo to Change Keys',
        subtitle: 'Same shapes, different key!',
        description: 'A capo clamps across all strings, raising all notes equally. If a song in Eb is too hard, put a capo on fret 1 and play D shapes. Same key, easier fingering!',
        estimatedTime: '10 min',
        type: 'theory'
      }
    ]
  },

  // UNIT 8: The Fretboard Map
  {
    id: 'theory-unit-8',
    number: 8,
    title: 'The Fretboard Map',
    subtitle: 'Know where every note lives',
    description: 'Learn to navigate the fretboard like a map. Find any note anywhere!',
    icon: '🗺️',
    prerequisiteUnits: ['theory-unit-7'],
    lessons: [
      {
        id: 'theory-8-1',
        title: 'Notes on String 6 (Low E)',
        subtitle: 'Your foundation for finding notes',
        description: 'Memorize the notes on the low E string: E (open), F (1), F#/Gb (2), G (3), G#/Ab (4), A (5), etc. Barre chords use this string as the root!',
        estimatedTime: '15 min',
        type: 'theory',
        quizRequired: true
      },
      {
        id: 'theory-8-2',
        title: 'Notes on String 5 (A)',
        subtitle: 'Another key string for barre chords',
        description: 'String 5 notes: A (open), A#/Bb (1), B (2), C (3), C#/Db (4), D (5), etc. With strings 6 and 5 memorized, you can find any chord anywhere!',
        estimatedTime: '15 min',
        type: 'theory',
        quizRequired: true
      },
      {
        id: 'theory-8-3',
        title: 'The Octave Shapes',
        subtitle: 'Same note, different position',
        description: 'The same note appears multiple places on the guitar. Learn the "octave shapes" - patterns that help you find the same note on different strings.',
        estimatedTime: '10 min',
        type: 'theory'
      },
      {
        id: 'theory-8-4',
        title: 'Finding Notes Quickly',
        subtitle: 'Tricks and landmarks',
        description: 'Use landmarks! Fret 5 = same as next open string (except string 3). Fret 12 = same note as open, one octave higher. These shortcuts help you navigate fast.',
        estimatedTime: '15 min',
        type: 'theory',
        quizRequired: true
      }
    ]
  },

  // UNIT 9: Chord Construction
  {
    id: 'theory-unit-9',
    number: 9,
    title: 'Chord Construction',
    subtitle: 'Build chords from scratch',
    description: 'Understand how chords are built so you can create any chord you need.',
    icon: '🏗️',
    prerequisiteUnits: ['theory-unit-8'],
    lessons: [
      {
        id: 'theory-9-1',
        title: 'Intervals: The Building Blocks',
        subtitle: 'The distance between notes',
        description: 'An interval is the distance between two notes. Half step = 1 fret. Whole step = 2 frets. Major third = 4 half steps. Perfect fifth = 7 half steps. Chords are made of specific intervals!',
        estimatedTime: '15 min',
        type: 'theory',
        quizRequired: true
      },
      {
        id: 'theory-9-2',
        title: 'Building Major Chords',
        subtitle: 'Root + Major 3rd + Perfect 5th',
        description: 'A major chord = Root, then 4 half steps up (major 3rd), then 3 more half steps (perfect 5th). C major = C, E, G. You can build any major chord with this formula!',
        estimatedTime: '15 min',
        type: 'theory'
      },
      {
        id: 'theory-9-3',
        title: 'Building Minor Chords',
        subtitle: 'Root + Minor 3rd + Perfect 5th',
        description: 'Minor chord = Root, then 3 half steps (minor 3rd), then 4 more half steps (perfect 5th). That lower third is why minor sounds sad! A minor = A, C, E.',
        estimatedTime: '15 min',
        type: 'theory',
        quizRequired: true
      },
      {
        id: 'theory-9-4',
        title: 'Seventh Chords',
        subtitle: 'Adding a fourth note for color',
        description: 'Add one more note (the 7th) for richer chords! Major 7th chords sound jazzy. Dominant 7th (just "7") sounds bluesy. Minor 7th sounds sophisticated. More notes = more flavor!',
        estimatedTime: '15 min',
        type: 'theory'
      }
    ]
  },

  // UNIT 10: The Nashville Number System
  {
    id: 'theory-unit-10',
    number: 10,
    title: 'The Number System',
    subtitle: 'A universal language for chord progressions',
    description: 'Learn the Nashville Number System - a way to describe chord progressions in any key using numbers.',
    icon: '🔢',
    prerequisiteUnits: ['theory-unit-9'],
    lessons: [
      {
        id: 'theory-10-1',
        title: 'Why Use Numbers?',
        subtitle: 'Same progression, any key',
        description: 'Instead of saying "C-G-Am-F", say "1-5-6-4". Now you can play the same progression in any key! Just change what "1" is. This is how pros communicate quickly.',
        estimatedTime: '10 min',
        type: 'theory'
      },
      {
        id: 'theory-10-2',
        title: 'The 7 Chords in a Key',
        subtitle: 'I-ii-iii-IV-V-vi-vii°',
        description: 'Each scale degree has a chord: 1=major, 2=minor, 3=minor, 4=major, 5=major, 6=minor, 7=diminished. Upper case = major, lower = minor. These apply to every major key!',
        estimatedTime: '15 min',
        type: 'theory',
        quizRequired: true
      },
      {
        id: 'theory-10-3',
        title: 'Common Number Progressions',
        subtitle: 'I-V-vi-IV, I-IV-V, ii-V-I',
        description: 'Learn these and you know countless songs! 1-5-6-4 = hundreds of pop songs. 1-4-5 = classic rock and blues. 2-5-1 = jazz standard. Numbers make patterns obvious!',
        estimatedTime: '15 min',
        type: 'theory',
        quizRequired: true
      },
      {
        id: 'theory-10-4',
        title: 'Transposing with Numbers',
        subtitle: 'Change key instantly',
        description: 'If someone says "play this in Eb instead of G", numbers make it easy. The singer says "1-4-5", you find 1-4-5 in any key instantly. This skill is used at every jam session!',
        estimatedTime: '10 min',
        type: 'theory'
      }
    ]
  }
];

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

export function getLessonById(lessonId: string): Lesson | undefined {
  const allLessons = [...techniquePath, ...theoryPath].flatMap(unit => unit.lessons);
  return allLessons.find(lesson => lesson.id === lessonId);
}

export function getUnitById(unitId: string): Unit | undefined {
  return [...techniquePath, ...theoryPath].find(unit => unit.id === unitId);
}

export function getNextLesson(currentLessonId: string, type: 'technique' | 'theory'): Lesson | undefined {
  const path = type === 'technique' ? techniquePath : theoryPath;
  const allLessons = path.flatMap(unit => unit.lessons);
  const currentIndex = allLessons.findIndex(l => l.id === currentLessonId);
  return currentIndex >= 0 && currentIndex < allLessons.length - 1 
    ? allLessons[currentIndex + 1] 
    : undefined;
}

export function getUnitProgress(unitId: string, completedLessons: Set<string>): number {
  const unit = getUnitById(unitId);
  if (!unit) return 0;
  const completed = unit.lessons.filter(l => completedLessons.has(l.id)).length;
  return Math.round((completed / unit.lessons.length) * 100);
}

export function isUnitUnlocked(unitId: string, completedUnits: Set<string>): boolean {
  const unit = getUnitById(unitId);
  if (!unit) return false;
  return unit.prerequisiteUnits.every(prereq => completedUnits.has(prereq));
}

export function isUnitComplete(unitId: string, completedLessons: Set<string>): boolean {
  const unit = getUnitById(unitId);
  if (!unit) return false;
  return unit.lessons.every(l => completedLessons.has(l.id));
}
