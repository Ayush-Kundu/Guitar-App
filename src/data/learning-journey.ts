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
        description: 'Before you play a single note, you need to know how to hold your guitar comfortably—assuming no prior experience. The "guitar" here means the whole instrument: the body (the big curvy part with the sound hole), the neck (the long part with metal bars called frets), and the headstock (where the tuning pegs are). Bad posture leads to pain and bad habits. We\'ll show you the proper way to sit (or stand) with your guitar: the body rests on one thigh, the neck tilts slightly upward so your fretting hand can reach the strings easily, and you avoid squeezing the neck. This way you can play for hours without strain and build a solid foundation from zero.',
        estimatedTime: '5 min',
        type: 'technique'
      },
      {
        id: 'tech-1-2',
        title: 'Your Hands - Where Do They Go?',
        subtitle: 'Left hand on the neck, right hand on the strings',
        description: 'We assume you have never held a guitar before. The "fretboard" is the front of the neck—the long wooden part with thin metal bars (frets) across it. Your left hand (for right-handed players) is the "fretting" hand: it presses the strings down against the fretboard so the pitch changes. Your right hand is the "picking" or "strumming" hand: it plucks or brushes the strings to make them sound. The "sound hole" is the round opening in the body of an acoustic guitar; strumming over it gives the fullest tone. Let\'s learn exactly where each hand should rest so that one hand chooses the notes and the other produces the sound—the basis for everything that follows.',
        estimatedTime: '5 min',
        type: 'technique'
      },
      {
        id: 'tech-1-3',
        title: 'Making Your First Sound',
        subtitle: 'Pluck a string and hear it ring!',
        description: 'You do not need a pick or any prior experience. "Pluck" means to pull a string and let it go so it vibrates. Use your thumb or a finger to pluck any string—that vibration is your first note. The guitar\'s hollow body amplifies the string so we can hear it. Now try each string one by one: each string is a different thickness and length, so each makes a different pitch (high or low). When you do not press any fret, you are playing "open" strings. This is the very first step from zero: making a clear, intentional sound.',
        estimatedTime: '5 min',
        type: 'technique'
      },
      {
        id: 'tech-1-4',
        title: 'The Six Strings',
        subtitle: 'E-A-D-G-B-E from thick to thin',
        description: 'A standard guitar has six strings—no more, no less. We number them 1 (thinnest, highest-sounding) to 6 (thickest, lowest-sounding). From thickest to thinnest their note names are E, A, D, G, B, E. So the thickest and thinnest are both "E" but at different octaves (low E and high E). We remember the order with the phrase: "Eddie Ate Dynamite, Good Bye Eddie" (E-A-D-G-B-E). This is "standard tuning." Every chord chart and tab you will ever see assumes these six strings and this order, so learning them is essential from day one.',
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
        description: 'The "neck" is the long part of the guitar that connects the body to the headstock. The thin metal bars going across the neck are called "frets" (or fret wire). When you press a string down just behind a fret—not on top of it, and not in the middle of the space between frets—the vibrating length of the string shortens and the note gets higher. So "fret 1" means the space between the nut and the first metal bar; "fret 2" is the next, and so on. The closer your finger is to the body (higher fret number), the shorter the string and the higher the pitch. Each fret raises the pitch by one "half step," the smallest step we use in Western music. So frets are how we get fixed, repeatable notes from the guitar—the foundation for every chord and melody.',
        estimatedTime: '5 min',
        type: 'technique'
      },
      {
        id: 'tech-2-2',
        title: 'How to Press a String',
        subtitle: 'Fingertip, not the pad - right behind the fret',
        description: 'We assume you have never fretted a note before. "Fretting" means pressing a string down so it touches a fret and the pitch changes. Use your fingertip—the bony, rounded end of your finger—not the flat pad. The pad is wider and can touch neighboring strings and mute them. Press right behind the fret wire (the metal bar), not in the middle of the space between frets. Too far from the fret and the string will buzz or sound dead; right behind the fret you need less pressure and get a clear tone. Too much pressure causes sore fingers and tension. This "sweet spot" is the foundation for clean playing from zero to advanced.',
        estimatedTime: '10 min',
        type: 'technique'
      },
      {
        id: 'tech-2-3',
        title: 'Where Does Your Thumb Go?',
        subtitle: 'Behind the neck, pointing up',
        description: 'The "neck" is the long part of the guitar; the "back" of the neck is the rounded side that faces you when you look at the guitar from the front. Your thumb should rest there, roughly behind your middle finger, pointing upward (toward the ceiling). Do not wrap your thumb over the top of the neck to fret the low E string—that limits your other fingers and can cause tension. The thumb\'s job is to support your hand from behind so your fingers can press the strings with control. A proper thumb position keeps your wrist straighter and gives your fingers more strength and reach, which is essential from beginner to advanced playing.',
        estimatedTime: '5 min',
        type: 'technique'
      },
      {
        id: 'tech-2-4',
        title: 'One Finger Per Fret',
        subtitle: 'Index=1, Middle=2, Ring=3, Pinky=4',
        description: 'We use a simple rule that works from zero to hero: assign each finger to a fret. Index finger = fret 1, middle = fret 2, ring = fret 3, pinky = fret 4. So when you are playing in "first position" (frets 1–4), each finger has a home fret and your hand stays in one place. That reduces unnecessary movement and makes scales and chords easier and faster. When you move to a new "position" (e.g. frets 5–8), your whole hand shifts so the index takes fret 5 and the pinky fret 8—same rule, different place on the neck. This is the basis for accurate, relaxed playing.',
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
        description: 'A "chord" is three or more different notes played together (at the same time or in quick succession). So a single note is not a chord; two notes are usually called an "interval"; three or more together form a chord. Chords are the building blocks of songs—they provide the harmony that supports the melody. "Major" chords sound bright or happy; "minor" chords sound darker or sadder. The difference is just one note (the "third") being one half step lower in minor. On the guitar we play chords by pressing several strings at different frets and strumming or plucking them together. Let\'s learn your first chord from zero.',
        estimatedTime: '5 min',
        type: 'technique'
      },
      {
        id: 'tech-3-2',
        title: 'E Minor - Your First Chord',
        subtitle: 'Just 2 fingers - sounds amazing!',
        description: 'E minor (written "Em" or "Emin") uses only two fingers on the fretboard. "String 5" is the second-thickest string (the A string); "string 4" is the D string. Put your middle finger on string 5, fret 2, and your ring finger on string 4, fret 2. The other strings (6, 3, 2, 1) are played "open" (no finger). Now strum all six strings. That darker, sadder sound is E minor—a "minor" chord because the third is one half step lower than in E major. Em appears in hundreds of rock, pop, and ballad songs, so it is one of the most useful first chords you will learn.',
        estimatedTime: '10 min',
        type: 'technique'
      },
      {
        id: 'tech-3-3',
        title: 'A Major - The Happy Sound',
        subtitle: '3 fingers in a row on fret 2',
        description: 'A major is a "major" chord—it sounds bright and happy because the third of the chord is a "major third" (four half steps above the root). Place your index, middle, and ring fingers on strings 4, 3, and 2, all at fret 2. Strings are numbered 1 (thinnest) to 6 (thickest), so "strings 5 through 1" means strum from the second-thickest down to the thinnest; do not play the thickest string (low E). That full, bright sound is A major. It is one of the most common chords in rock, pop, and country and pairs well with D and E minor.',
        estimatedTime: '10 min',
        type: 'technique'
      },
      {
        id: 'tech-3-4',
        title: 'D Major - The Classic',
        subtitle: 'A triangle shape on the thin strings',
        description: 'D major uses only the four thinnest strings (4, 3, 2, 1)—do not strum the two thickest. Place your index finger on string 3 fret 2, your ring finger on string 2 fret 3, and your middle finger on string 1 fret 2. That triangle-like shape gives a clear, classic sound. It takes a bit of finger stretching at first; keep your fingertips close to the frets and your thumb on the back of the neck. D major appears in countless songs and works beautifully with G, A, and Em in progressions.',
        estimatedTime: '15 min',
        type: 'technique'
      },
      {
        id: 'tech-3-5',
        title: 'Switching Between Chords',
        subtitle: 'The real skill - changing smoothly',
        description: 'Playing one chord by itself is easy; the skill that makes real songs possible is "switching"—changing from one chord to another without long pauses or losing the beat. We will practice switching between E minor (Em), A major (A), and D major (D). Start slowly: play one chord, then move your fingers to the next chord shape and strum. Do not rush. Speed and smoothness come with repetition. Common tips: look at your hand when you switch, lift fingers together, and aim for the new shape in one motion. This is the bridge from single chords to actually playing songs from zero to hero.',
        estimatedTime: '15 min',
        type: 'technique',
        quizRequired: true
      },
      {
        id: 'tech-3-6',
        title: 'Practice: Em, A, and D',
        subtitle: 'Chord recognizer practice (own topic)',
        description: 'This lesson is a dedicated practice session using the chord recognizer. You will play E minor (Em), A major (A), and D major (D) while the app listens and gives feedback. The chord recognizer helps you check that each chord sounds clear and correct. This topic is at the end of the unit and opens the practice popup so you can reinforce what you learned before moving on. No prior theory is required—just use the finger shapes you learned in the previous lessons.',
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
        description: 'Strumming means brushing across the strings with a pick or your fingers to play several notes at once. A "down strum" is when you brush from the thickest string toward the thinnest (downward in space). Hold the pick between your thumb and index finger (or use your thumb) and keep your wrist loose—the motion should come from the wrist, not the elbow. Try strumming in a steady rhythm: 1, 2, 3, 4. The "beat" is the steady pulse; staying on the beat is what makes strumming sound musical. We assume no prior strumming experience—this is the first step from zero to rhythm.',
        estimatedTime: '10 min',
        type: 'technique'
      },
      {
        id: 'tech-4-2',
        title: 'Up Strums',
        subtitle: 'The return trip catches the thin strings',
        description: 'An "up strum" is the return motion: after strumming down (thick to thin), bring your hand back up so the pick or fingers brush the strings on the way. You do not need to hit all six strings on the upstroke—usually the up strum catches the thinnest three or four strings (the "treble" strings). So: down = full strum across all strings; up = lighter, often just the higher strings. This back-and-forth (down-up-down-up) is the basis of almost every strum pattern and gives songs their groove. We build from zero: down and up are the two directions your strumming hand can move.',
        estimatedTime: '10 min',
        type: 'technique'
      },
      {
        id: 'tech-4-3',
        title: 'Down-Up Pattern',
        subtitle: 'The foundation of all strumming',
        description: 'Combine down and up strums in a steady pattern: Down-Up-Down-Up. Your hand should move constantly like a pendulum—even when you "skip" a strum (do not actually hit the strings on that beat), keep the arm moving so the timing stays even. That constant motion is the secret to good rhythm: your body keeps the pulse, and you choose on which beats to hit the strings. This down-up pattern is the foundation of all strumming; every other pattern (D-D-U-U-D-U, etc.) is a variation of when you strike on these down and up motions. We assume no prior rhythm training—this is how we build from zero.',
        estimatedTime: '15 min',
        type: 'technique'
      },
      {
        id: 'tech-4-4',
        title: 'Your First Strum Pattern',
        subtitle: 'D-D-U-U-D-U (works with tons of songs)',
        description: 'A "strum pattern" is a specific sequence of down and up strums that repeats. This one—Down, Down, Up, Up, Down, Up (often written D-D-U-U-D-U)—fits a huge number of songs in 4/4 time. Count it over four beats: beat 1 = down, beat 2 = down, "and" of 2 = up, beat 3 = up, beat 4 = down, "and" of 4 = up. Try it slowly first with one chord (e.g. G or Em), then speed up. Once you can keep this pattern steady without thinking, you can play hundreds of songs. We build from zero: this is your first full strum pattern.',
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
        description: 'G major is a full, bright chord that uses all four fretting fingers, including the pinky—often for the first time. One common shape: middle finger on string 5 fret 2, index on string 2 fret 2, ring on string 6 fret 3, pinky on string 1 fret 3. Strum all six strings. String 6 is the thickest, string 1 the thinnest. G major takes practice because of the stretch; keep your thumb on the back of the neck and your fingertips close to the frets so each note rings clearly. G is one of the most used chords in folk, rock, and pop and is essential for the classic four-chord progressions.',
        estimatedTime: '15 min',
        type: 'technique'
      },
      {
        id: 'tech-5-2',
        title: 'C Major - The Most Popular',
        subtitle: 'The most used chord in music',
        description: 'C major is one of the most important chords in all of music. Place your ring finger on string 5 (A string) fret 3, middle finger on string 4 (D string) fret 2, and index finger on string 2 (B string) fret 1. "Strum from string 5 down" means play strings 5, 4, 3, 2, and 1—do not play the thickest string (6). C major appears in almost every genre and is the "home" chord in the key of C. Getting the stretch comfortable and keeping the open strings ringing clearly is the goal; we build from zero with clear finger placement.',
        estimatedTime: '15 min',
        type: 'technique'
      },
      {
        id: 'tech-5-3',
        title: 'A Minor - The Sad Sister',
        subtitle: 'Just move one finger from C!',
        description: 'A minor (Am) sounds darker than A major because the "third" of the chord is one half step lower. Great news: Am is very similar to C major. If you know C major (ring on string 5 fret 3, middle on string 4 fret 2, index on string 2 fret 1), move your ring finger from string 5 to string 3 at fret 2 (or adjust: a common Am shape is index string 2 fret 1, middle string 4 fret 2, ring string 3 fret 2). C and Am share two notes and often appear together in songs, so switching between them is easier once you see the relationship. We assume you have learned C; from there Am is a small step.',
        estimatedTime: '10 min',
        type: 'technique'
      },
      {
        id: 'tech-5-4',
        title: 'E Major - Power and Brightness',
        subtitle: 'Similar to Em but with one extra finger',
        description: 'E major sounds bright and "happy" compared to E minor. If you already know E minor (middle and ring on strings 5 and 4 at fret 2), add your index finger on string 3 (G string) at fret 1. That one extra note raises the third and turns Em into E major. Strum all six strings for a full, powerful sound. E major is used in countless rock and pop songs. We build from what you know: Em plus one finger gives you E.',
        estimatedTime: '10 min',
        type: 'technique'
      },
      {
        id: 'tech-5-5',
        title: 'The 4-Chord Song',
        subtitle: 'G-D-Em-C: Play hundreds of songs',
        description: 'The "four-chord song" uses the same progression in many hits: G, D, E minor (Em), and C. In that order (or similar), these four chords appear in Let It Be, No Woman No Cry, With or Without You, and hundreds more. "Chord progression" means the sequence of chords that repeats through the song. Practicing switching between G, D, Em, and C in time is one of the most useful things you can do—once you can do it smoothly, you can play a huge number of songs. We assume you have learned each chord shape; now we put them together from zero to playing real tunes.',
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
        description: 'String "buzz" is a rattling or fuzzy sound that happens when the string is not pressed firmly enough or is pressed too far from the fret. The fix: press the string down right behind the fret wire (the metal bar), not in the middle of the space between frets. Use your fingertip, not the flat pad, and press firmly enough that the string contacts the fret cleanly. We assume no prior jargon—"fret wire" is the thin metal strip; "right behind" means as close to it as you can without being on top of it. Clean fretting from zero removes buzz and makes every chord sound professional.',
        estimatedTime: '10 min',
        type: 'technique'
      },
      {
        id: 'tech-6-2',
        title: 'Fixing Muted Strings',
        subtitle: 'Arch your fingers - don\'t flatten them',
        description: 'A "muted" or "dead" string is one that does not ring—it sounds dull or is silent. Usually this happens because another finger (or part of your hand) is accidentally touching that string. The solution: arch your fingers more so that only the fingertips contact the strings, and keep your knuckles bent so they point away from the neck. That way each string can vibrate freely. We build from zero: "arch" means a curved finger shape; "knuckles high" means the knuckles of your fretting hand are not collapsed. Clean chord sound depends on no string being muted by mistake.',
        estimatedTime: '10 min',
        type: 'technique'
      },
      {
        id: 'tech-6-3',
        title: 'The Chord Check',
        subtitle: 'Play each string one by one',
        description: 'The "chord check" is a simple way to find out why a chord does not sound right. While holding the chord shape, play each string one at a time (e.g. with your pick or thumb). Listen: does every string ring clearly? If one is buzzing, muted, or dead, adjust that finger—move it closer to the fret, arch it more, or make sure no other finger is touching that string. We assume no prior experience: "ring clearly" means a full, sustained tone with no rattle or thud. Doing this check on every new chord builds the habit of clean playing from zero to hero.',
        estimatedTime: '10 min',
        type: 'technique'
      },
      {
        id: 'tech-6-4',
        title: 'Muting Strings You Don\'t Want',
        subtitle: 'Sometimes silence is golden',
        description: 'Some chords use only certain strings. For example, the D major chord uses only the four thinnest strings (4, 3, 2, 1); the two thickest strings (6 and 5) should not sound. "Muting" means lightly touching a string so it does not ring—either with an unused finger, the side of your fretting finger, or your thumb. You do not press the string down to a fret; you just damp it so it stays quiet. Learning to mute the strings you do not want is part of clean playing and prevents wrong notes from ringing. We build from zero: muting is a skill that makes your chords sound intentional and professional.',
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
        description: 'A "pick" (or plectrum) is a small flat piece of plastic or other material used to strike the strings. Hold it between your thumb and index finger so that only a small tip sticks out past your fingers—enough to hit the strings cleanly without the pick flapping. Grip it firmly but stay relaxed; a "death grip" will tire your hand and make your tone harsh. We assume you have never held a pick: the goal is a stable, comfortable hold that lets you strum and pick single strings with control. This is the foundation for all pick-based playing from zero.',
        estimatedTime: '5 min',
        type: 'technique'
      },
      {
        id: 'tech-7-2',
        title: 'Picking One String at a Time',
        subtitle: 'Aim with your wrist, not your arm',
        description: 'Picking "one string at a time" means striking a single string with the pick instead of strumming several. To hit one string cleanly without touching the others, use small wrist movements rather than big arm motions. You can "plant" your picking hand—rest your palm or pinky edge on the guitar body or bridge—for stability. Practice moving from string to string (e.g. 6, 5, 4, 3, 2, 1 and back) so you learn to aim. We assume no prior experience: this is the first step from strumming full chords to playing melodies and riffs one note at a time.',
        estimatedTime: '10 min',
        type: 'technique'
      },
      {
        id: 'tech-7-3',
        title: 'Alternate Picking',
        subtitle: 'Down-Up-Down-Up for speed',
        description: '"Alternate picking" means you alternate the direction of your pick: one note with a downstroke (pick moving toward the floor), the next with an upstroke (pick moving back up). So the pattern is Down, Up, Down, Up. This is faster and more efficient than using only downstrokes because your hand is always in motion and each stroke prepares the next. We assume you have tried single-note picking; alternate picking is the standard technique for scales, riffs, and solos from zero to advanced playing.',
        estimatedTime: '15 min',
        type: 'technique'
      },
      {
        id: 'tech-7-4',
        title: 'Your First Riff: Smoke on the Water',
        subtitle: 'The most famous guitar riff ever',
        description: 'A "riff" is a short, repeating melodic phrase—often the most recognizable part of a song. The Smoke on the Water riff is one of the most famous guitar riffs; it uses only a few notes on one or two strings and is playable with basic fretting and picking. You will learn to coordinate both hands: the fretting hand holds the correct frets while the picking hand plays the right string at the right time. We assume you have learned to pick one string at a time and to fret single notes; this lesson ties it together so you play real music from zero.',
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
        description: 'Fingerpicking means plucking the strings with your fingers instead of a pick. We use standard letters for the right-hand fingers: p = thumb (pulgar), i = index, m = middle, a = ring. The pinky usually rests on the guitar body for stability and is not used to pluck. Each finger is often assigned to specific strings—thumb for the bass strings (6, 5, 4), and i, m, a for the treble strings (3, 2, 1). We assume no prior fingerpicking: this naming system is used in classical and folk guitar and helps you read and learn patterns from zero.',
        estimatedTime: '5 min',
        type: 'technique'
      },
      {
        id: 'tech-8-2',
        title: 'Thumb on Bass Strings',
        subtitle: 'p plays strings 6, 5, and 4',
        description: 'The "bass strings" are the thickest strings—numbers 6, 5, and 4 (low E, A, D). In fingerpicking, your thumb (p) handles these. It plucks downward, moving away from your palm. The thumb often plays the "root" note of the chord—the note that names the chord (e.g. the root of C major is C). We assume you know string numbers; "root" is the foundational note of a chord. Thumb on bass is the first step in building fingerpicking patterns from zero.',
        estimatedTime: '10 min',
        type: 'technique'
      },
      {
        id: 'tech-8-3',
        title: 'Fingers on Treble Strings',
        subtitle: 'i-m-a play strings 3, 2, 1',
        description: 'The "treble strings" are the thinnest—numbers 3, 2, and 1 (G, B, high E). In fingerpicking we assign: index (i) to string 3, middle (m) to string 2, ring (a) to string 1. These fingers pluck upward, toward your palm, while the thumb plucks the bass strings downward. So you have a division of labor: thumb = bass, i-m-a = treble. We assume you have learned the finger names (p-i-m-a); this lesson places them on the strings so you can play full patterns from zero.',
        estimatedTime: '10 min',
        type: 'technique'
      },
      {
        id: 'tech-8-4',
        title: 'Simple Fingerpicking Pattern',
        subtitle: 'p-i-m-a-m-i: A beautiful arpeggio',
        description: 'An "arpeggio" is when you play the notes of a chord one after another instead of all at once. The pattern p-i-m-a-m-i (Thumb, Index, Middle, Ring, Middle, Index) is a simple fingerpicking pattern: play it repeatedly while holding a chord (e.g. G or C). Each letter tells you which finger plucks which string (p = bass, i-m-a = treble). This creates a flowing, harp-like sound used in folk, ballads, and pop. We assume you have learned p-i-m-a and thumb on bass; this ties them into your first full pattern from zero to playing real songs.',
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
        description: 'A "hammer-on" is a technique where you get a second note to sound without picking again. You pick the first note, then quickly "hammer" another finger down on a higher fret on the same string. The energy of that finger landing makes the string vibrate at the new pitch. So you hear two notes with one pick stroke. We assume no prior jargon: "fret" is the metal bar; "higher" means toward the body (e.g. fret 5 is higher than fret 3). Hammer-ons add smoothness and speed and are used in almost every style from zero to advanced.',
        estimatedTime: '15 min',
        type: 'technique'
      },
      {
        id: 'tech-9-2',
        title: 'Pull-Offs',
        subtitle: 'The opposite of a hammer-on',
        description: 'A "pull-off" is the opposite of a hammer-on: you get a lower note to sound without picking again. Start with two fingers on the same string at two different frets. Pick the higher note, then "pull off" that finger—pull it slightly down and off the string so that the lower (already fretted) note rings. The motion of the finger leaving the string gives the string a little pluck. So you hear two notes with one pick stroke. We assume you have tried hammer-ons; pull-offs often pair with them in licks and riffs. Together they are the basis of legato (smooth) playing from zero to hero.',
        estimatedTime: '15 min',
        type: 'technique'
      },
      {
        id: 'tech-9-3',
        title: 'Slides',
        subtitle: 'Glide smoothly from note to note',
        description: 'A "slide" is when you move from one note to another on the same string without lifting your finger. You pick the first note, then slide that finger along the string to a new fret (up = toward the body, down = toward the headstock) while keeping pressure so the string keeps sounding. The pitch glides smoothly from the first note to the second. Slides add expression and connect notes without repicking. We assume you know what a fret is; sliding is one of the first "expression" techniques that make guitar sound vocal and human, from zero to advanced.',
        estimatedTime: '10 min',
        type: 'technique'
      },
      {
        id: 'tech-9-4',
        title: 'Basic Bends',
        subtitle: 'Push the string to raise the pitch',
        description: 'A "bend" is when you push (or pull) a string sideways after fretting it, which stretches the string and raises its pitch. So you can go from one note to a higher note without moving to another fret—the bend does the work. This creates the "crying" or singing quality in blues and rock. Start small: bend the string just enough so the pitch matches the next fret (a "half-step" bend). We assume no prior experience: the key is to use several fingers behind the fretting finger to help push the string and to listen so the bent note is in tune. Bends are essential for expression from zero to hero.',
        estimatedTime: '15 min',
        type: 'technique'
      },
      {
        id: 'tech-9-5',
        title: 'Vibrato - Making Notes Sing',
        subtitle: 'Wiggle the string for warmth',
        description: 'Vibrato is a slight, rapid wavering of the pitch of a note—it makes a held note "wobble" slightly instead of staying perfectly steady. After fretting a note, you create it by gently shaking your finger side-to-side (parallel to the frets) or by using small, repeated bends. Vibrato makes the guitar sound vocal and human; without it, sustained notes can sound flat and lifeless. We assume you have tried bends; vibrato is like a small, repeated bend or a gentle hand motion. It is one of the main tools for expression from zero to professional playing.',
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
        description: 'A "barre" (or "bar") chord is one where your index finger lays flat across all six strings at one fret, pressing them down at once. That finger acts like a "moveable nut"—the nut is the strip at the top of the neck that holds the strings in place; by barring, you create a new "nut" at any fret. Combined with other fingers forming a shape (e.g. E major or E minor shape), you can play that chord in any key anywhere on the neck. We assume you know open E and Em; the barre lets you play F, F#m, G, Gm, etc. with the same shapes. This is the gateway from zero to playing every chord everywhere.',
        estimatedTime: '5 min',
        type: 'technique'
      },
      {
        id: 'tech-10-2',
        title: 'Building Barre Strength',
        subtitle: 'Exercises to build finger strength',
        description: 'Barre chords require more hand strength than open chords because one finger must press all six strings firmly. We assume you have never held a full barre. Start by pressing your index finger flat across all strings at fret 1 (or another fret) and pluck each string one by one—every string should ring clearly. If some buzz or mute, adjust the angle or pressure of your index finger. Practice this at different frets; the lower frets (1–3) are often the hardest. It can take weeks to build the strength and consistency. This lesson gives you the exercises to go from zero to a reliable barre.',
        estimatedTime: '15 min',
        type: 'technique'
      },
      {
        id: 'tech-10-3',
        title: 'F Major - The First Barre Chord',
        subtitle: 'The chord everyone struggles with at first',
        description: 'F major is the first barre chord most players learn and is famous for being difficult. Barre all six strings at fret 1 with your index finger (lay it flat across the strings). Then form an "E major" shape with your other fingers: the shape you would use for open E major, but now your index is acting as the nut. So your middle finger goes on string 3 fret 2, ring on string 5 fret 3, pinky on string 4 fret 3. Strum all six strings. Do not give up—almost everyone finds this hard at first. Once F is clear, you can move the same shape up the neck to get G, A, B, etc. We build from zero: F is the first step to every barre chord.',
        estimatedTime: '20 min',
        type: 'technique'
      },
      {
        id: 'tech-10-4',
        title: 'Moving Barre Shapes',
        subtitle: 'Same shape, different frets = different chords',
        description: 'The "magic" of barre chords is that the same finger shape can be moved up and down the neck to play different chords. The F major shape at fret 1 is F; move it to fret 3 and it becomes G major; fret 5 = A major; fret 7 = B major. The root note is the note your index finger is barring on the low E string (or the string you use for the root). The same idea works for minor shapes (e.g. Em shape barre = Fm, Gm, Am…). So one shape gives you every major or minor chord in that form. We assume you can play F; from there you have the whole neck from zero to hero. This is why barre chords are essential.',
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
        description: 'We assume you have never studied the parts of a guitar. The "body" is the large, curvy hollow box (on an acoustic) that amplifies the sound; it has a "sound hole" in the middle. The "neck" is the long piece that connects the body to the "headstock"—the headstock is at the far end and holds the "tuning pegs" (machines you turn to tune each string). The "fretboard" is the front of the neck with the metal "frets" (thin bars) across it. The "bridge" is on the body and anchors the strings at the other end; the "nut" is the small strip at the top of the fretboard that guides the strings. Learning these names is the first step to understanding how the guitar works and how to talk about it from zero to hero.',
        estimatedTime: '10 min',
        type: 'theory',
        quizRequired: true
      },
      {
        id: 'theory-1-2',
        title: 'How Guitars Make Sound',
        subtitle: 'Strings vibrate, body resonates',
        description: 'We assume no prior physics. When you pluck a string, it "vibrates"—it moves back and forth very quickly. That motion pushes the air and creates sound waves. On an acoustic guitar, the vibrations travel through the "bridge" (where the strings attach to the body) into the hollow "body"; the body and the air inside it vibrate too and make the sound much louder. So: pluck → string vibrates → body amplifies → we hear sound. "Pitch" is how high or low a note sounds. A shorter vibrating length (e.g. when you press a fret) gives a higher pitch; a longer or thicker string gives a lower pitch. This is the foundation for understanding every note on the guitar from zero.',
        estimatedTime: '5 min',
        type: 'theory'
      },
      {
        id: 'theory-1-3',
        title: 'High vs Low Sounds',
        subtitle: 'Pitch: the thicker the string, the lower the sound',
        description: 'In music we use "high" and "low" to mean pitch—how high or low a note sounds, not how loud it is. The thick strings (6, 5, 4) produce low sounds—we call these the "bass" strings. The thin strings (3, 2, 1) produce high sounds—the "treble" strings. When you press a string down behind a fret, you shorten the part of the string that can vibrate, so the pitch goes higher. So: thicker or longer = lower pitch; thinner or shorter = higher pitch. We assume no prior jargon: this lesson connects the physical instrument to the words we use for sound from zero to hero.',
        estimatedTime: '5 min',
        type: 'theory'
      },
      {
        id: 'theory-1-4',
        title: 'What Is Tuning?',
        subtitle: 'Making sure your strings play the right notes',
        description: 'Tuning means adjusting each string so it plays the correct pitch (note). Each string is wound around a "tuning peg" on the headstock; turning the peg changes the string\'s tension. More tension = higher pitch ("sharp" if too high); less tension = lower pitch ("flat" if too low). "Standard tuning" is the usual setup: from thickest to thinnest string the notes are E, A, D, G, B, E. We assume you have never tuned: use a tuner or app to match each string to that note. Always tune before playing—strings drift with temperature and playing. This is essential from zero to sounding right with others.',
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
        description: 'In Western music we name pitches using only seven letters: A, B, C, D, E, F, and G. There is no H—after G we go back to A. So the "musical alphabet" is a repeating cycle: … A B C D E F G A B C … Each letter is called a "natural" note. These are the white keys on a piano. Every chord symbol, scale, and melody you will ever see is built from these seven letter names (plus sharps and flats, which we meet next). Learning this cycle is the first step to understanding how music is written and how the guitar fretboard is organized.',
        estimatedTime: '5 min',
        type: 'theory'
      },
      {
        id: 'theory-2-2',
        title: 'Sharps and Flats',
        subtitle: 'The notes between the letters',
        description: 'Between most of the seven natural notes (A–G) there is one extra note. We need names for those in-between pitches. A sharp (written ♯ or #) means "one half step higher." So A sharp (A#) is the note one half step above A. A flat (written ♭ or b) means "one half step lower." So B flat (Bb) is one half step below B. On the guitar, one half step = one fret. So moving up one fret = one half step. Some letter pairs have no note between them: B and C are already one half step apart, and so are E and F. So we have B, then C (no B# or Cb in basic theory), and E, then F (no E# or Fb). The full set of 12 notes in order is: A, A#, B, C, C#, D, D#, E, F, F#, G, G#, then A again. Two names can mean the same pitch: A# and Bb are the same note (enharmonic). This lesson builds on the musical alphabet and leads to the chromatic scale and every scale and chord you will ever play.',
        estimatedTime: '10 min',
        type: 'theory'
      },
      {
        id: 'theory-2-3',
        title: 'The 12 Notes in Music',
        subtitle: 'That\'s it - just 12 notes, repeated',
        description: 'Once you know the seven natural notes (A–G) and the in-between notes (sharps and flats), you have the full set: 12 distinct pitches. In order they are A, A#/Bb, B, C, C#/Db, D, D#/Eb, E, F, F#/Gb, G, G#/Ab—then the pattern repeats at a higher or lower "octave." Every chord, scale, and melody in Western music uses only these 12 notes in different combinations. No song uses a 13th different note; we just repeat the same 12 in every octave. This is the final piece that takes you from "letters and sharps/flats" to "every note that exists" on the guitar.',
        estimatedTime: '10 min',
        type: 'theory',
        quizRequired: true
      },
      {
        id: 'theory-2-4',
        title: 'Notes on the Guitar',
        subtitle: 'Finding notes on the fretboard',
        description: 'On the guitar, each fret raises the pitch by one half step. So on the low E string: open = E, fret 1 = F, fret 2 = F#, fret 3 = G, and so on through all 12 notes. At fret 12 you get E again—one octave higher—because the string is exactly half its open length. The same pattern applies to every string: one fret = one half step. So you can name every note on the neck using the musical alphabet and sharps/flats. This connects everything you learned (letters, sharps, flats, the 12 notes) to the actual instrument and is the foundation for finding chords and scales anywhere on the fretboard.',
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
        description: 'TAB (tablature) is a way to write guitar music that shows exactly where to put your fingers—no need to read standard sheet music. We assume you have never seen TAB. It uses 6 horizontal lines, one for each string. The bottom line = your thickest string (low E, string 6); the top line = your thinnest (high E, string 1). So the lines look like the strings from your point of view. Numbers written on the lines tell you which fret to press: "0" means play the string open (no finger). TAB is the most common way to learn songs online; understanding it from zero opens up thousands of songs.',
        estimatedTime: '10 min',
        type: 'theory'
      },
      {
        id: 'theory-3-2',
        title: 'Reading Fret Numbers',
        subtitle: '0 means open, 3 means fret 3',
        description: 'In TAB, every number on a line is a "fret number"—which fret to press on that string. "0" means do not press any fret; play the string "open." "3" means press that string at fret 3. When several numbers appear in a vertical column (one per line), you play those strings at those frets at the same time—that is a chord. So TAB tells you both single-note lines and chord shapes. We assume you know what a fret is; this lesson is the bridge from "what is TAB?" to actually reading and playing from zero.',
        estimatedTime: '10 min',
        type: 'theory',
        quizRequired: true
      },
      {
        id: 'theory-3-3',
        title: 'TAB Symbols',
        subtitle: 'h = hammer, p = pull, / = slide, b = bend',
        description: 'TAB can include symbols for techniques, not just fret numbers. Common ones: "h" = hammer-on (sound a higher note without picking again), "p" = pull-off (sound a lower note by pulling a finger off), "/" or "\\" = slide (glide from one fret to another), "b" = bend (push the string to raise the pitch), "v" or "~" = vibrato (waver the pitch slightly). We assume you have seen basic TAB; these symbols tell you how to play the notes—smooth, bent, or vibrating—so you can read real tabs from zero to hero.',
        estimatedTime: '10 min',
        type: 'theory'
      },
      {
        id: 'theory-3-4',
        title: 'Reading Real TAB',
        subtitle: 'Let\'s read a simple song',
        description: 'This lesson ties everything together: we read through a simple song in TAB form. You will see single notes (one number per string), chord shapes (stacked numbers), and possibly technique symbols (h, p, /, b, etc.). We assume you know how to read fret numbers and what the lines mean; now we apply it to a real song so you can learn any song you find online. From zero to hero, reading real TAB is the skill that unlocks the whole repertoire.',
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
        description: 'Rhythm is the pattern of sounds (and silences) in time—when notes happen and how long they last. It is what makes you tap your foot or nod your head to music. We assume no prior theory: "timing" means the placement of each note in time; "beat" is the steady pulse (like a heartbeat). Without rhythm, notes are just a list; with rhythm, they become music. Strum patterns, drum parts, and bass lines are all rhythm. This lesson is the first step from zero to understanding how music is organized in time.',
        estimatedTime: '5 min',
        type: 'theory'
      },
      {
        id: 'theory-4-2',
        title: 'Beats and Tempo',
        subtitle: 'The steady pulse of music',
        description: 'The "beat" is the steady, repeating pulse you feel in music—like a heartbeat. We often count beats in groups of four: 1-2-3-4, 1-2-3-4. "Tempo" is how fast the beat goes. It is measured in BPM (beats per minute): 60 BPM = one beat per second; 120 BPM = two beats per second (twice as fast). We assume no prior jargon: knowing the difference between beat (when things happen) and tempo (how fast) is the foundation for playing in time and with others, from zero to hero.',
        estimatedTime: '10 min',
        type: 'theory'
      },
      {
        id: 'theory-4-3',
        title: 'Counting 4/4 Time',
        subtitle: '1-2-3-4, 1-2-3-4 - the most common pattern',
        description: 'Most songs are in "4/4 time" (said "four-four"). That means we group beats into "measures" (bars) of 4 beats each, counted 1-2-3-4, 1-2-3-4. The "1" is usually the strongest beat—the "downbeat." We assume you have learned what a beat is; now we give it structure. Clapping or tapping 1-2-3-4 while listening to music helps you feel the measure. Strum patterns and chord changes often align with these beats, so counting in 4/4 is essential from zero to playing with others.',
        estimatedTime: '10 min',
        type: 'theory',
        quizRequired: true
      },
      {
        id: 'theory-4-4',
        title: 'Note Lengths',
        subtitle: 'Whole, half, quarter, eighth notes',
        description: 'Note lengths tell you how long to hold each note (or how long a rest lasts). We assume no prior reading. In 4/4 time: a "whole note" lasts 4 beats (the whole measure). A "half note" = 2 beats. A "quarter note" = 1 beat. An "eighth note" = half a beat (so two eighth notes fit in one beat). Shorter notes (sixteenths, etc.) divide the beat further. These lengths determine the rhythm of melodies and strum patterns—when you strum and when you pause. From zero to hero, note lengths are how we write and read rhythm precisely.',
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
        description: 'A chord is three or more notes sounding together. We assume you know that much. The most basic chords have three notes: the "root" (the note that names the chord, also called the 1st), the "third" (the 3rd note of the scale from that root), and the "fifth" (the 5th note). So "root, third, fifth" are scale positions—if the root is C, the C major scale is C D E F G A B; the third is E and the fifth is G. So C major = C, E, G. This pattern is how chords are built from zero to understanding any chord symbol.',
        estimatedTime: '10 min',
        type: 'theory'
      },
      {
        id: 'theory-5-2',
        title: 'Major vs Minor',
        subtitle: 'Why some chords sound happy, others sad',
        description: 'Major chords sound bright and stable—often "happy." Minor chords sound darker or sadder. We assume you have heard the difference. The cause is just one note: the "third" of the chord. In a major chord the third is 4 half steps (4 frets) above the root; in a minor chord it is 3 half steps above the root—one fret lower. So the third is what defines major vs. minor. Chord symbols reflect this: "C" = C major; "Cm" or "Cmin" = C minor. Understanding this one note takes you from zero to hearing and reading chord quality correctly.',
        estimatedTime: '10 min',
        type: 'theory',
        quizRequired: true
      },
      {
        id: 'theory-5-3',
        title: 'Reading Chord Names',
        subtitle: 'C, Am, G7, Dmaj7 - what do they mean?',
        description: 'Chord names follow a simple code. We assume you have seen symbols like C, Am, G7. The letter is always the "root" note—the note the chord is named after. Nothing after the letter = major (e.g. C = C major). "m" or "min" = minor (e.g. Am = A minor). "7" means add the seventh note of the scale (a "dominant 7th" chord, often bluesy). "maj7" = major 7th (jazzy). So C, Cm, C7, Cmaj7 are four different chords with the same root. Once you know the code, you can decode any chord symbol and know what kind of chord to play, from zero to hero.',
        estimatedTime: '15 min',
        type: 'theory',
        quizRequired: true
      },
      {
        id: 'theory-5-4',
        title: 'Common Chord Progressions',
        subtitle: 'The patterns behind your favorite songs',
        description: 'A "chord progression" is the sequence of chords a song uses—often repeating (e.g. verse, chorus). We assume you have learned a few chord names. Progressions are often described with Roman numerals: I, IV, V, vi, etc., so the same pattern can be played in any key. The I–V–vi–IV progression (in C that is C–G–Am–F) appears in hundreds of hit songs. Learning these common patterns helps you recognize songs quickly and transpose them to any key. From zero to hero, progressions are the backbone of song structure.',
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
        description: 'A scale is a chosen set of notes from the 12 we have in music, arranged in order (usually from a "root" note up to the same note an octave higher). We assume you know there are 12 notes. When you play within a scale, those notes tend to sound "right" together—they define a "key" or mood. Melodies, chords, and solos are mostly built from scale notes. So a scale is like a palette: you pick which notes to use. The major scale has 7 notes; the pentatonic has 5. From zero to hero, scales are the foundation of melody and harmony.',
        estimatedTime: '10 min',
        type: 'theory'
      },
      {
        id: 'theory-6-2',
        title: 'The Major Scale',
        subtitle: 'Do-Re-Mi-Fa-Sol-La-Ti-Do',
        description: 'The major scale is the most important scale in Western music. It is the "Do-Re-Mi-Fa-Sol-La-Ti-Do" you may know—seven different notes plus the octave (the same note again, higher). For example, C major is C, D, E, F, G, A, B, C. The pattern of half steps and whole steps between these notes is always the same, no matter which note you start on. The major scale has a bright, "happy" sound and is the basis for most melodies and for building major chords. We assume you know what a scale is; this lesson is the core of tonal music from zero to hero.',
        estimatedTime: '10 min',
        type: 'theory',
        quizRequired: true
      },
      {
        id: 'theory-6-3',
        title: 'The Minor Scale',
        subtitle: 'The same notes, different starting point',
        description: 'The "natural" minor scale has a different pattern of half and whole steps than the major scale—it sounds darker or sadder. One useful fact: every major scale has a "relative" minor that uses the same seven notes but starts on the 6th note. So C major (C D E F G A B) and A minor (A B C D E F G) use the same notes; the difference is which note feels like "home." In A minor, A is the center, so the mood is minor. We assume you know the major scale; the minor scale is the other main palette for melodies and minor chords, from zero to hero.',
        estimatedTime: '10 min',
        type: 'theory'
      },
      {
        id: 'theory-6-4',
        title: 'The Pentatonic Scale',
        subtitle: 'Just 5 notes - sounds great for solos!',
        description: 'The pentatonic scale has only five notes ("penta" = five). We take five notes from the major (or minor) scale and leave two out, which makes it very forgiving—almost every note sounds good over the right chord. The "minor pentatonic" is the go-to scale for rock, blues, and country solos; the "major pentatonic" is used in country and pop. We assume you know what a scale is; the pentatonic is the first scale many guitarists use for improvising because it is simple and sounds great from zero to hero.',
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
        description: 'The "key" of a song is its harmonic home—the note and scale that everything revolves around. We assume you have learned about scales. A song "in the key of G" uses the G major scale; the G note and G chord feel like "resolution" or "home," and other chords and notes are heard in relation to that. So the key tells you which notes and chords are most likely to appear and which chord will feel like the end. From zero to hero, knowing the key helps you choose the right chords, scales, and capo position.',
        estimatedTime: '10 min',
        type: 'theory'
      },
      {
        id: 'theory-7-2',
        title: 'Finding the Key',
        subtitle: 'Which note feels like home?',
        description: 'To find the key of a song by ear, listen for which chord feels like "home" or "resolved"—often the first or last chord of the song or of a section. That chord\'s root note is usually the key (e.g. if G major feels like home, the key is likely G major). We assume you know what a key and a root are; this lesson gives you a simple listening strategy so you can identify keys from zero and then play along or transpose correctly.',
        estimatedTime: '10 min',
        type: 'theory',
        quizRequired: true
      },
      {
        id: 'theory-7-3',
        title: 'Chords in a Key',
        subtitle: 'Which chords go with which key?',
        description: 'Each key has a set of chords built from its scale—the "diatonic" chords. In the key of C major, those chords are C, Dm, Em, F, G, Am, and Bdim (diminished). Most songs in that key use mostly these chords; that is why certain progressions (e.g. C–G–Am–F) sound "right"—they are all in the key. We assume you know major/minor and chord symbols; this lesson shows how keys organize chords into families, from zero to understanding why songs use the chords they do.',
        estimatedTime: '15 min',
        type: 'theory',
        quizRequired: true
      },
      {
        id: 'theory-7-4',
        title: 'Using a Capo to Change Keys',
        subtitle: 'Same shapes, different key!',
        description: 'A "capo" is a clamp you put across all the strings at a certain fret. It acts like a moveable nut: everything sounds higher. So if you put a capo on fret 1 and play an open D chord shape, you actually hear Eb. We assume you know keys and chord shapes. The capo lets you keep using the same easy shapes (e.g. G, C, D) but in a different key—great when a song is in Eb or B and you want easier fingering or to match a singer. From zero to hero, the capo is an essential tool for changing keys without learning new shapes.',
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
        description: 'The low E string (string 6, the thickest) is the foundation for finding notes and for barre chords. We assume you know the musical alphabet and that one fret = one half step. On the low E string: open = E, fret 1 = F, fret 2 = F# or Gb, fret 3 = G, fret 4 = G# or Ab, fret 5 = A, and so on. At fret 12 you get E again (one octave higher). Memorizing this string lets you name every fret on it and know the root of barre chords that use the E shape. From zero to hero, string 6 is your map for the low end of the neck.',
        estimatedTime: '15 min',
        type: 'theory',
        quizRequired: true
      },
      {
        id: 'theory-8-2',
        title: 'Notes on String 5 (A)',
        subtitle: 'Another key string for barre chords',
        description: 'String 5 (the A string) is the other main string for barre chords and for finding roots. We assume you know the note names and half steps. On string 5: open = A, fret 1 = A# or Bb, fret 2 = B, fret 3 = C, fret 4 = C# or Db, fret 5 = D, and so on. Many barre chords use the A string as the root (e.g. the A-shaped barre). With strings 6 and 5 memorized, you can find the root of almost any chord and play it anywhere on the neck. From zero to hero, string 5 completes your fretboard map for chord roots.',
        estimatedTime: '15 min',
        type: 'theory',
        quizRequired: true
      },
      {
        id: 'theory-8-3',
        title: 'The Octave Shapes',
        subtitle: 'Same note, different position',
        description: 'The same pitch (e.g. the note G) can be played in several places on the fretboard—on different strings and frets. "Octave shapes" are simple patterns that show where the same note appears: for example, the note at fret X on the low E string also appears at fret X+2 on the D string (two strings over, two frets up), and in other relationships. We assume you know the notes on strings 6 and 5; octave shapes let you find any note quickly and move around the neck without memorizing every single fret. From zero to hero, these shapes are the key to navigating the guitar.',
        estimatedTime: '10 min',
        type: 'theory'
      },
      {
        id: 'theory-8-4',
        title: 'Finding Notes Quickly',
        subtitle: 'Tricks and landmarks',
        description: 'Landmarks are frets or positions that make finding notes easier. We assume you know the open string names (E-A-D-G-B-E). On most strings, fret 5 gives you the same note as the next thicker string open (e.g. fret 5 on A = D, same as open D string)—except between G and B strings, where fret 4 on G = B. Fret 12 on any string is the same note as that string open, one octave higher. Using these landmarks helps you navigate the fretboard quickly without memorizing every fret. From zero to hero, landmarks turn the neck into a map you can use in real time.',
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
        description: 'An "interval" is the distance between two notes, measured in half steps (frets). We assume you know that one fret = one half step. So: half step = 1 fret; whole step = 2 frets. A "major third" = 4 half steps (e.g. C to E); a "perfect fifth" = 7 half steps (e.g. C to G). Chords are built from specific intervals: major chord = root + major third + perfect fifth. Learning intervals is how you understand why chords sound the way they do and how to build them from any root. From zero to hero, intervals are the building blocks of harmony.',
        estimatedTime: '15 min',
        type: 'theory',
        quizRequired: true
      },
      {
        id: 'theory-9-2',
        title: 'Building Major Chords',
        subtitle: 'Root + Major 3rd + Perfect 5th',
        description: 'A major chord is built from three notes: the root, then 4 half steps up (the "major 3rd"), then 3 more half steps up from the 3rd (the "perfect 5th"). So C major = C (root), E (major 3rd), G (perfect 5th). We assume you know intervals; this formula works from any root note. On the guitar you often play more than three strings, but the chord still contains these three notes (sometimes doubled). From zero to hero, this is how you understand and build any major chord.',
        estimatedTime: '15 min',
        type: 'theory'
      },
      {
        id: 'theory-9-3',
        title: 'Building Minor Chords',
        subtitle: 'Root + Minor 3rd + Perfect 5th',
        description: 'A minor chord is built from the root, then 3 half steps up (the "minor 3rd"—one half step lower than the major 3rd), then 4 half steps up from the 3rd (the "perfect 5th"). So A minor = A (root), C (minor 3rd), E (perfect 5th). That lower third is what makes minor sound darker or sadder than major. We assume you know how major chords are built; minor is the same except for that one interval. From zero to hero, this is how you build and understand any minor chord.',
        estimatedTime: '15 min',
        type: 'theory',
        quizRequired: true
      },
      {
        id: 'theory-9-4',
        title: 'Seventh Chords',
        subtitle: 'Adding a fourth note for color',
        description: 'Seventh chords add a fourth note to the basic triad: the "7th" note of the scale. We assume you know root, 3rd, and 5th. A "major 7th" chord (e.g. Cmaj7) adds the 7th note of the major scale and sounds jazzy or smooth. A "dominant 7th" (e.g. C7) uses a different 7th and sounds bluesy or tense. A "minor 7th" (e.g. Cm7) combines a minor chord with a 7th and sounds sophisticated. Chord symbols: "7" = dominant 7th; "maj7" = major 7th; "m7" = minor 7th. From zero to hero, seventh chords add color and variety to your playing.',
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
        description: 'The number system (often called the Nashville or Roman numeral system) describes chord progressions with numbers instead of letter names. We assume you know chord progressions. "1" = the root chord of the key (e.g. C in key of C); "4" = the fourth chord (F in C); "5" = the fifth (G in C); "6" = the sixth (often minor, e.g. Am in C). So "1-5-6-4" means the same pattern in any key—in C it is C-G-Am-F; in G it is G-D-Em-C. Pros use numbers to communicate quickly and transpose on the spot. From zero to hero, numbers unlock playing in any key.',
        estimatedTime: '10 min',
        type: 'theory'
      },
      {
        id: 'theory-10-2',
        title: 'The 7 Chords in a Key',
        subtitle: 'I-ii-iii-IV-V-vi-vii°',
        description: 'In any major key, the seven scale degrees have standard chord types. We use Roman numerals: I = major, ii = minor, iii = minor, IV = major, V = major, vi = minor, vii° = diminished. So in C major: I=C, ii=Dm, iii=Em, IV=F, V=G, vi=Am, vii°=Bdim. Upper case (I, IV, V) = major; lower case (ii, iii, vi) = minor. This pattern is the same in every major key—only the letter names change. We assume you know keys and chord types; this lesson gives you the full "chord scale" from zero to hero.',
        estimatedTime: '15 min',
        type: 'theory',
        quizRequired: true
      },
      {
        id: 'theory-10-3',
        title: 'Common Number Progressions',
        subtitle: 'I-V-vi-IV, I-IV-V, ii-V-I',
        description: 'Certain number progressions appear everywhere. We assume you know the number system. 1-5-6-4 (or I-V-vi-IV) is in hundreds of pop songs. 1-4-5 (I-IV-V) is classic rock and blues. 2-5-1 (ii-V-I) is a jazz standard resolution. Learning these patterns in numbers lets you recognize them in any key and play them instantly. Numbers make the pattern obvious—you see the structure, not just the chords. From zero to hero, these progressions are the backbone of most music you will play.',
        estimatedTime: '15 min',
        type: 'theory',
        quizRequired: true
      },
      {
        id: 'theory-10-4',
        title: 'Transposing with Numbers',
        subtitle: 'Change key instantly',
        description: 'Transposing means playing the same song or progression in a different key. We assume you know the number system. If someone says "play this in Eb instead of G," you find what 1, 4, and 5 are in Eb (Eb, Ab, Bb) and play those chords. The numbers stay the same; only the root changes. So "1-4-5" in G = G-C-D; in Eb = Eb-Ab-Bb. This skill is used at every jam session and when accompanying singers who need a different key. From zero to hero, transposing with numbers is how you stay flexible in real time.',
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
