// =============================================================================
// INTERACTIVE QUIZ TYPES - Teach concepts through quizzes (fill-in-blank, multiple choice)
// =============================================================================

export type QuizItemType = 'multiple_choice' | 'fill_blank' | 'drag_blank';

export interface MultipleChoiceItem {
  type: 'multiple_choice';
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
}

export interface FillBlankItem {
  type: 'fill_blank';
  sentence: string;  // Use ___ for the blank
  options: string[];  // List of options below the sentence (like multiple choice)
  correctAnswer: number;  // Index of correct option
  explanation?: string;
}

/** Same shape as fill_blank; UI uses drag-and-drop (or tap chip → tap gap) into the sentence. */
export interface DragBlankItem {
  type: 'drag_blank';
  sentence: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
}

export type QuizItem = MultipleChoiceItem | FillBlankItem | DragBlankItem;

export interface LessonContent {
  title: string;
  /** @deprecated Use items instead - kept for fallback */
  content?: string;
  /** Interactive quiz items that teach the concept */
  items: QuizItem[];
  /** @deprecated Legacy quiz - converted to items */
  quiz?: { question: string; options: string[]; correctAnswer: number }[];
}

// =============================================================================
// TECHNIQUE CONTENT - Interactive quiz-based teaching
// =============================================================================

export const techniqueContent: Record<string, LessonContent> = {
  'How to Hold Your Guitar': {
    title: 'How to Hold Your Guitar',
    items: [
      { type: 'fill_blank', sentence: 'When sitting with your guitar (right-handed), the guitar should rest on your _____ thigh.', options: ['right', 'left', 'both', 'either'], correctAnswer: 0, explanation: 'The waist (the curved indentation of the body) rests on your right leg so the neck can tilt slightly upward. This brings the fretboard into a comfortable reach for your fretting hand and keeps the guitar stable without squeezing.' },
      { type: 'multiple_choice', question: 'What angle should the guitar neck be tilted?', options: ['Horizontal', 'About 45° upward', 'Straight up', 'Pointing down'], correctAnswer: 1, explanation: 'A roughly 45° tilt gives your fretting hand a natural angle to the strings and reduces wrist strain. If the neck is horizontal or pointing down, you will tire quickly and risk injury; if straight up, the body is hard to hold. Forty-five degrees is the sweet spot from zero to comfortable playing.' },
      { type: 'fill_blank', sentence: 'The _____ of the guitar (the curved indentation) should rest on your leg.', options: ['waist', 'neck', 'body', 'bridge'], correctAnswer: 0, explanation: 'The waist is the narrow, curved part of the body between the upper and lower bouts. It fits naturally on your thigh and keeps the guitar from sliding, so you can use both hands without gripping the neck.' },
      { type: 'multiple_choice', question: 'Why is wearing the guitar too low a bad idea?', options: ['Looks unprofessional', 'Damages the guitar', 'Forces your wrist into awkward angles', 'Makes it go out of tune'], correctAnswer: 2, explanation: 'A low-slung guitar forces your fretting wrist to bend sharply and your shoulder to reach forward. That leads to strain, slower progress, and possible injury. A comfortable height and angle are the foundation for everything that follows.' },
      { type: 'multiple_choice', question: 'What should you practice first?', options: ['Playing chords', 'Sitting with the guitar without playing', 'Speed exercises', 'Difficult songs'], correctAnswer: 1, explanation: 'Before notes or chords, get used to holding the guitar and finding a relaxed posture. A few minutes of "just holding" with good position will make every later step easier and safer.' }
    ]
  },
  'Your Hands - Where Do They Go?': {
    title: 'Your Hands - Where Do They Go?',
    items: [
      { type: 'fill_blank', sentence: 'Your _____ hand presses the strings on the fretboard.', options: ['left', 'right', 'both', 'either'], correctAnswer: 0, explanation: 'Assuming you are right-handed: your left hand is the "fretting" hand. It presses the strings against the fretboard so that the vibrating length shortens and the pitch changes. Every chord and melody you play depends on this hand choosing which frets to press. From zero: the hand that changes the notes is the one on the neck.' },
      { type: 'fill_blank', sentence: 'Your _____ hand plucks or strums the strings over the sound hole.', options: ['right', 'left', 'both', 'either'], correctAnswer: 0, explanation: 'Your right hand is the "picking" or "strumming" hand. It makes the strings vibrate by plucking or brushing them. On an acoustic, strumming over the sound hole gives the fullest tone. So one hand chooses the notes (left), the other creates the sound (right)—both are essential from day one.' },
      { type: 'multiple_choice', question: 'Where does your fretting hand go?', options: ['On the body', 'On the neck/fretboard', 'On the headstock', 'On the bridge'], correctAnswer: 1, explanation: 'The fretboard (the front of the neck, with the metal frets) is where you press the strings. Your fingers sit behind the frets to change the pitch. The body, headstock, and bridge are not for fretting; keeping your hand on the neck is the foundation for every chord and scale.' },
      { type: 'multiple_choice', question: 'Where does your strumming hand go?', options: ['On the neck', 'Over the sound hole', 'On the headstock', 'On the tuning pegs'], correctAnswer: 1, explanation: 'On an acoustic guitar, the sound hole is the opening in the body. Strumming just above or over it gives the best balance of volume and tone. Too close to the bridge and the sound gets thin; too far toward the neck and you lose clarity. Over the sound hole is the standard "home" position.' },
      { type: 'multiple_choice', question: 'Why do we call one hand "fretting" and the other "picking" or "strumming"?', options: ['It is random.', 'Fretting = pressing frets to change notes; picking/strumming = making the strings sound.', 'Only professionals use these terms.', 'Fretting means strumming.'], correctAnswer: 1, explanation: 'Fretting means pressing the strings against the frets so the note changes. Picking or strumming means setting the strings in motion (with a pick or fingers). Understanding these two roles—one hand chooses the note, the other produces it—is the basis for everything that follows.' },
      { type: 'fill_blank', sentence: 'The fretboard is the part of the _____ where you press the strings.', options: ['neck', 'body', 'bridge', 'headstock'], correctAnswer: 0, explanation: 'The neck is the long piece that connects the body to the headstock. The fretboard is the front face of the neck—the part with the frets and where your fingers press. So "on the neck" and "on the fretboard" both mean the same place: where your fretting hand lives.' }
    ]
  },
  'Making Your First Sound': {
    title: 'Making Your First Sound',
    items: [
      { type: 'fill_blank', sentence: 'Use your _____ or finger to pluck any string to make a sound.', options: ['thumb', 'palm', 'wrist', 'elbow'], correctAnswer: 0, explanation: 'You do not need a pick to start. Your thumb or fingertip can pluck a string and set it vibrating. That vibration is the sound you hear. From zero: any string, plucked with thumb or finger, gives you your first note. Later you can add a pick for a brighter tone.' },
      { type: 'multiple_choice', question: 'What actually creates the sound when you pluck a string?', options: ['The pick', 'String vibration', 'The body', 'The frets'], correctAnswer: 1, explanation: 'The string vibrates back and forth; that motion pushes the air and creates sound waves. The body of the guitar then amplifies those waves so they are loud enough to hear. So the chain is: pluck → string vibrates → body amplifies. No vibration, no sound.' },
      { type: 'fill_blank', sentence: 'Each string makes a _____ sound when plucked.', options: ['different', 'same', 'muted', 'buzzing'], correctAnswer: 0, explanation: 'The six strings are different thicknesses and lengths, so they vibrate at different speeds (frequencies). Thicker or longer strings = lower pitch; thinner or shorter = higher. So each string has its own note, and together they give you the range of the guitar.' },
      { type: 'multiple_choice', question: 'Before you press any frets, what are you playing?', options: ['Chords', 'Open strings', 'A scale', 'Nothing'], correctAnswer: 1, explanation: 'When you pluck a string without pressing any fret, you are playing an "open" string. The note you hear is the string\'s fundamental pitch (e.g. low E, A, D, G, B, high E). All other notes on the guitar are made by shortening the string at a fret, so open strings are the starting point.' },
      { type: 'fill_blank', sentence: 'The guitar\'s _____ amplifies the string vibration so we can hear it clearly.', options: ['body', 'neck', 'tuning pegs', 'frets'], correctAnswer: 0, explanation: 'The hollow body (on an acoustic) acts like a resonator: the vibrating string makes the wood and air inside vibrate too, and that makes the sound much louder and richer. Without the body, the string would be barely audible. So the body is not just for holding the guitar—it is essential to the sound.' }
    ]
  },
  'The Six Strings': {
    title: 'The Six Strings',
    items: [
      { type: 'fill_blank', sentence: 'A standard guitar has _____ strings.', options: ['6', '4', '8', '12'], correctAnswer: 0, explanation: 'Standard guitars have six strings, numbered 1 (thinnest, highest) to 6 (thickest, lowest). Every chord and scale you will learn is built from these six. From zero: we always count string 1 as the thinnest and string 6 as the thickest—this is true in every tab and chord diagram.' },
      { type: 'fill_blank', sentence: 'From thickest to thinnest, the string names are E, A, D, G, B, _____.', options: ['E', 'A', 'D', 'G'], correctAnswer: 0, explanation: 'The order is E–A–D–G–B–E. The thickest and thinnest are both E but at different octaves (low E and high E). This is "standard tuning." Every chord chart and tab assumes this order, so memorizing it is essential.' },
      { type: 'multiple_choice', question: 'Which string is the thickest (lowest sounding)?', options: ['High E', 'B', 'Low E', 'A'], correctAnswer: 2, explanation: 'The low E (6th string) is the thickest and lowest in pitch. When you hold the guitar in playing position, it is the string closest to you (top). High E is the thinnest and highest, furthest from you.' },
      { type: 'multiple_choice', question: 'What mnemonic helps remember the string names from thick to thin?', options: ['Every Apple Does Good', 'Eddie Ate Dynamite, Good Bye Eddie', 'Eat All Day', 'Every Day Gets Better'], correctAnswer: 1, explanation: 'E-A-D-G-B-E: "Eddie Ate Dynamite, Good Bye Eddie." Once you know this, you can name every open string and build from there to chords and melodies.' },
      { type: 'multiple_choice', question: 'Why are the thickest and thinnest strings both called E?', options: ['It is a mistake.', 'They are the same note at different octaves—one low, one high.', 'Only one is E.', 'E is the only letter used.'], correctAnswer: 1, explanation: 'They are both E, but the 6th string is "low E" (low pitch) and the 1st string is "high E" (high pitch). The high E is exactly two octaves above the low E. So we reuse the same letter name when the note repeats at a higher or lower register.' },
      { type: 'fill_blank', sentence: 'Standard tuning (E-A-D-G-B-E) is what almost every chord chart and song assumes, so learning it is _____ for playing with others or reading tabs.', options: ['essential', 'optional', 'rare', 'advanced'], correctAnswer: 0, explanation: 'If you change tuning, chord shapes and tab numbers no longer match. Standard tuning is the default for nearly all teaching materials and band contexts. From zero to playing songs, knowing and using standard tuning is the foundation.' }
    ]
  },
  'What Are Frets?': {
    title: 'What Are Frets?',
    items: [
      {
        type: 'multiple_choice',
        question:
          'A fret is the thin metal wire embedded across the fingerboard. Pressing a string just behind a fret shortens the vibrating part of the string so the pitch changes. Which statement is true?',
        options: [
          'Frets are only decorative paint lines.',
          'Frets are metal strips; the string is pressed behind a fret so that fret becomes the new “end” of the vibrating string.',
          'Frets are the same as the tuning pegs.',
          'Frets are the six long wires you pluck.',
        ],
        correctAnswer: 1,
        explanation:
          'Frets are metal fret wire across the neck. The string vibrates between the bridge and either the nut (open) or the fret you press behind. Shorter vibrating length = higher pitch. The strings you pluck are separate from frets; pegs are only for tuning.',
      },
      {
        type: 'multiple_choice',
        question:
          'String order: With the guitar on your leg (right-handed), the string closest to your eyes is the thickest (low notes). We number strings 1 = thinnest/highest through 6 = thickest/lowest for TAB and diagrams. Which string is the 6th string?',
        options: ['High E (thinnest)', 'B', 'G', 'Low E (thickest)'],
        correctAnswer: 3,
        explanation:
          'String 6 is the thick low E at the top of the fretboard in playing position. String 1 is the thin high E toward the floor. TAB lines match this: bottom line of TAB = high E, top line = low E.',
      },
      {
        type: 'multiple_choice',
        question:
          'Why letters (E, A, D, G, B)? Pitches use the musical alphabet A–G (with sharps/flats between some letters). Open strings are named for the note they sound. Why are both the thickest and thinnest strings called E?',
        options: [
          'They are different instruments.',
          'They are the same pitch.',
          'They are the same note name but different octaves—low E vs high E two octaves apart.',
          'Only one of them is really E.',
        ],
        correctAnswer: 2,
        explanation:
          'Letter names label pitch classes. Low E and high E share the name because they are the same note at different registers (octaves). Standard tuning from thick to thin is E–A–D–G–B–E.',
      },
      {
        type: 'fill_blank',
        sentence:
          'The metal bars going across the neck are called _____.',
        options: ['frets', 'strings', 'markers', 'nuts'],
        correctAnswer: 0,
        explanation:
          'Frets are the thin metal strips that divide the neck. Pressing behind a fret shortens the string and raises pitch in fixed half steps.',
      },
      {
        type: 'multiple_choice',
        question:
          'Clean note: Where should you press the string relative to the fret wire?',
        options: ['On top of the metal fret', 'Just behind the fret (headstock side of the wire)', 'Exactly halfway between two frets', 'On the bridge'],
        correctAnswer: 1,
        explanation:
          'Press just behind the fret so the wire acts as a clean stop for the string. Too far back causes buzz or weak tone.',
      },
      {
        type: 'fill_blank',
        sentence:
          'Moving toward the _____ (higher fret numbers) shortens the vibrating string and raises the pitch.',
        options: ['body', 'headstock', 'pickguard only', 'strap button'],
        correctAnswer: 0,
        explanation:
          'Higher frets are closer to the body. Shorter string length from bridge to your finger = higher pitch.',
      },
      {
        type: 'multiple_choice',
        question:
          'Open string / fret 0: You pluck without pressing a fret, so the string vibrates its full length from the nut to the bridge. What is the nut?',
        options: [
          'The metal frets in the middle of the neck',
          'The slotted bar at the top of the fretboard that sets where the open string ends',
          'Only the bridge',
          'The sound hole',
        ],
        correctAnswer: 1,
        explanation:
          'The nut is the zero point at the headstock end. Open = nut to bridge full length. That is fret 0 for that string.',
      },
      {
        type: 'fill_blank',
        sentence:
          'Each fret raises the pitch by one _____ step (semitone)—the smallest step in common Western music.',
        options: ['half', 'whole', 'octave', 'third'],
        correctAnswer: 0,
        explanation:
          'One fret = one half step. Twelve frets ≈ one octave on the same string. That is why the fretboard maps directly to the chromatic scale.',
      },
    ],
  },
  'How to Press a String': {
    title: 'How to Press a String',
    items: [
      { type: 'fill_blank', sentence: 'Use your _____ (not the flat pad) to press the string.', options: ['fingertip', 'knuckle', 'palm', 'nail'], correctAnswer: 0, explanation: 'The fingertip is the bony, rounded end of your finger. Using it (not the flat pad) lets you press the string down without touching the neighboring strings, so each note rings clearly. From zero: one finger per string, fingertip only, and you avoid muting notes by accident.' },
      { type: 'multiple_choice', question: 'What usually causes a buzzing or dead sound?', options: ['Pressing too hard', 'Pressing too softly or too far from the fret', 'Using a pick', 'Strumming too fast'], correctAnswer: 1, explanation: 'If you press too far from the fret (e.g. in the middle of the space), the string can rattle against the fret or not make a clear note. Press firmly right behind the fret wire so the fret becomes the clean endpoint of the vibrating length. That removes buzz and gives a clear tone.' },
      { type: 'fill_blank', sentence: 'Press _____ behind the fret wire, not in the middle of the space.', options: ['right', 'lightly', 'softly', 'gently'], correctAnswer: 0, explanation: '"Right behind" means as close to the fret as you can without being on top of it. The closer you are to the fret, the less pressure you need and the cleaner the note. This is a fundamental habit for clean playing from day one.' },
      { type: 'multiple_choice', question: 'Why avoid using the flat pad of your finger?', options: ['It looks bad.', 'The pad is softer and can touch adjacent strings and mute them.', 'The pad cannot press hard enough.', 'It does not matter.'], correctAnswer: 1, explanation: 'The flat pad is wider and softer, so it often brushes the strings next to the one you want. Those neighboring strings get muted and the chord or note sounds wrong. The fingertip is smaller and more precise, so you can press one string without touching the others.' },
      { type: 'fill_blank', sentence: 'Building the habit of pressing right behind the fret helps you play with less _____ and clearer sound.', options: ['pressure', 'effort', 'tension', 'noise'], correctAnswer: 2, explanation: 'When you press in the right place, you need less force and your hand stays more relaxed. Tension in the fretting hand leads to fatigue and slower playing. So good technique—right behind the fret, fingertip—is not just for sound; it is for comfort and long-term progress.' }
    ]
  },
  'Where Does Your Thumb Go?': {
    title: 'Where Does Your Thumb Go?',
    items: [
      { type: 'fill_blank', sentence: 'Your thumb should rest on the _____ of the neck.', options: ['back', 'front', 'side', 'top'], correctAnswer: 0, explanation: 'The back of the neck is the rounded side facing you when you look at the guitar from the front. Your thumb sits there, roughly opposite your middle finger. This "classical" position gives your fingers strength and reach without squeezing the neck.' },
      { type: 'multiple_choice', question: 'Where should your thumb point when fretting?', options: ['Over the top of the neck', 'Toward the ceiling (roughly)', 'Toward the floor', 'At the body'], correctAnswer: 1, explanation: 'With the thumb on the back of the neck, it naturally points upward (toward the ceiling). That keeps your hand in an arch so your fingertips can press the strings cleanly and your palm does not mute the strings. It also gives you more reach across the fretboard.' },
      { type: 'fill_blank', sentence: 'Don\'t _____ your thumb around the top of the neck to fret the low E string.', options: ['wrap', 'rest', 'place', 'press'], correctAnswer: 0, explanation: 'Wrapping the thumb over the top of the neck might feel natural at first, but it limits how far your other fingers can reach and can cause tension. Keeping the thumb on the back of the neck is the standard technique that scales from beginner to advanced playing.' },
      { type: 'multiple_choice', question: 'What is the main job of the thumb when fretting?', options: ['To press the 6th string', 'To support the hand from behind the neck so your fingers can press the strings', 'To strum', 'To hold the pick'], correctAnswer: 1, explanation: 'The thumb does not usually fret notes (except in some advanced styles). Its job is to brace your hand against the back of the neck so your fingers can press the strings with control and without gripping too hard. Think of it as an anchor, not a clamp.' },
      { type: 'fill_blank', sentence: 'A good thumb position keeps your wrist relatively _____ so you avoid strain over time.', options: ['straight', 'bent', 'twisted', 'locked'], correctAnswer: 0, explanation: 'When the thumb is on the back of the neck and your fingers arch over the strings, your wrist can stay in a more neutral, straight line. A bent or twisted wrist leads to strain and injury over time. So thumb placement is part of healthy, sustainable technique.' }
    ]
  },
  'One Finger Per Fret': {
    title: 'One Finger Per Fret',
    items: [
      { type: 'fill_blank', sentence: 'At fret 1, use your _____ finger.', options: ['index', 'middle', 'ring', 'pinky'], correctAnswer: 0, explanation: 'We assign index = fret 1, middle = fret 2, ring = fret 3, pinky = fret 4. So when you are playing in a position (e.g. frets 1–4), each finger has a "home" fret. This keeps your hand stable and reduces unnecessary movement.' },
      { type: 'fill_blank', sentence: 'At fret 2, use your _____ finger.', options: ['middle', 'index', 'ring', 'pinky'], correctAnswer: 0, explanation: 'One finger per fret means middle finger handles fret 2 when you are in that position. Your hand stays in one place and each finger reaches its fret. This is the basis for scales, chords, and fast, clean playing.' },
      { type: 'multiple_choice', question: 'Which finger is assigned to fret 4 in the "one finger per fret" rule?', options: ['Index', 'Middle', 'Ring', 'Pinky'], correctAnswer: 3, explanation: 'Index = 1, middle = 2, ring = 3, pinky = 4. So when you play in the first four frets, your pinky covers fret 4. This rule applies in any position: if you are playing around frets 5–8, then index=5, middle=6, ring=7, pinky=8.' },
      { type: 'multiple_choice', question: 'Why use one finger per fret instead of moving one finger to every note?', options: ['It looks better.', 'It keeps the hand in position, reduces movement, and allows faster, more accurate playing.', 'It is only for experts.', 'It does not matter.'], correctAnswer: 1, explanation: 'If one finger had to jump to every fret, your hand would be constantly shifting and you would play more slowly and make more mistakes. Assigning each finger to a fret keeps your hand steady and lets you play scales and phrases without unnecessary motion. It is a core principle from zero to advanced.' },
      { type: 'fill_blank', sentence: 'When you move to a new "position" (e.g. frets 5–8), you still use one finger per fret, but your _____ moves so index takes the new fret 5.', options: ['hand', 'elbow', 'pick', 'thumb'], correctAnswer: 0, explanation: 'A "position" means your hand is centered around a group of four frets. In first position, index is on 1; in fifth position, you shift your whole hand so index is on 5 and pinky on 8. The rule stays the same—one finger per fret—but the hand moves to a new place on the neck.' }
    ]
  },
  'What Is a Chord?': {
    title: 'What Is a Chord?',
    items: [
      { type: 'fill_blank', sentence: 'A chord is _____ or more notes played together.', options: ['3', '2', '4', '5'], correctAnswer: 0, explanation: 'By definition, a chord is at least three different notes sounding at once. Two notes can be a "dyad" or interval; three or more form a chord.' },
      { type: 'multiple_choice', question: 'To build any major chord you need the root, the major third, and the fifth. For C major, which note is the major third?', options: ['E', 'C', 'G', 'B'], correctAnswer: 0, explanation: 'C major = C (root), E (major third), G (fifth). The major third is four half steps above the root.' },
      { type: 'multiple_choice', question: 'What makes a minor chord different from a major chord?', options: ['The third is one half step lower in minor', 'The fifth is different', 'Minor has fewer notes', 'The root changes'], correctAnswer: 0, explanation: 'Minor chords use a minor third (one half step lower than in major), which gives a darker quality. The root and fifth are the same; only the third changes.' },
      { type: 'fill_blank', sentence: 'Chords are the _____ of songs: they support the melody and define the harmony.', options: ['building blocks', 'speed', 'volume', 'tempo'], correctAnswer: 0, explanation: 'When you strum a chord, you are playing the harmony. Most songs are built from a sequence of chords (a chord progression).' },
      { type: 'multiple_choice', question: 'On the guitar, how do we usually play a chord?', options: ['By pressing several strings at different frets and strumming or plucking them together', 'One string at a time', 'Only on the 1st string', 'Without using the fretting hand'], correctAnswer: 0, explanation: 'A chord shape is a pattern of fingers on several strings and frets. When you strum those strings together, you hear the chord.' }
    ]
  },
  'Switching Between Chords': {
    title: 'Switching Between Chords',
    items: [
      { type: 'multiple_choice', question: 'When switching from Em to A to D, what is the main skill you are building?', options: ['Changing finger shapes without long pauses and keeping the beat', 'Playing each chord louder', 'Using only one finger', 'Strumming faster'], correctAnswer: 0, explanation: 'The real skill is switching from one chord shape to the next without long pauses or losing the beat. Start slowly; speed and smoothness come with repetition.' },
      { type: 'fill_blank', sentence: 'Common tips for clean chord changes: look at your hand when you switch, lift fingers _____, and aim for the new shape in one motion.', options: ['together', 'one by one', 'slowly', 'after strumming'], correctAnswer: 0, explanation: 'Lifting fingers together and moving to the new shape in one motion reduces the gap between chords and keeps your timing steady.' },
      { type: 'multiple_choice', question: 'Which of these is a good practice approach for chord switching?', options: ['Play one chord, then move to the next shape and strum—do not rush', 'Play as fast as possible from the start', 'Only practice one chord per day', 'Skip the metronome'], correctAnswer: 0, explanation: 'Start slowly: play one chord, then move your fingers to the next chord shape and strum. Do not rush. Speed and smoothness come with repetition.' }
    ]
  },
  'Your First Strum Pattern': {
    title: 'Your First Strum Pattern',
    items: [
      { type: 'multiple_choice', question: 'The pattern D-D-U-U-D-U fits a huge number of songs. What do D and U stand for?', options: ['Down strum and Up strum', 'Different chord', 'Duration and Volume', 'Downbeat and Upbeat'], correctAnswer: 0, explanation: 'D = down strum (brush from thick to thin strings), U = up strum (return motion). This pattern repeats and fits many songs in 4/4 time.' },
      { type: 'fill_blank', sentence: 'Count the D-D-U-U-D-U pattern over four beats: beat 1 = down, beat 2 = down, "and" of 2 = up, beat 3 = up, beat 4 = down, "and" of 4 = _____.', options: ['up', 'down', 'rest', 'chord change'], correctAnswer: 0, explanation: 'The "and" of beat 4 is an up strum. Keeping your hand moving down-up constantly (even when you skip a strum) keeps timing even.' },
      { type: 'multiple_choice', question: 'Why should your strumming hand keep moving in a constant down-up motion even when you skip a strum?', options: ['So the timing stays even and the pulse is consistent', 'To play louder', 'To change chords faster', 'Only when using a pick'], correctAnswer: 0, explanation: 'Constant motion like a pendulum keeps the pulse. You choose on which beats to hit the strings; the hand motion maintains the rhythm.' }
    ]
  },
  'Muting Strings You Don\'t Want': {
    title: 'Muting Strings You Don\'t Want',
    items: [
      { type: 'multiple_choice', question: 'For D major you use only strings 4, 3, 2, and 1. What should you do with strings 6 and 5?', options: ['Mute them so they do not ring', 'Press them at a fret', 'Strum them anyway', 'Tune them differently'], correctAnswer: 0, explanation: 'Muting means lightly touching a string so it does not ring—with an unused finger, the side of your fretting finger, or your thumb. For D, strings 6 and 5 should stay quiet.' },
      { type: 'fill_blank', sentence: 'Muting is lightly _____ a string so it does not ring—you do not press it down to a fret.', options: ['touching', 'plucking', 'cutting', 'tuning'], correctAnswer: 0, explanation: 'You damp the string so it stays quiet. Learning to mute the strings you do not want is part of clean playing.' },
      { type: 'multiple_choice', question: 'How can you mute an unwanted string?', options: ['With an unused finger, the side of your fretting finger, or your thumb', 'Only with a pick', 'By not touching it', 'By pressing it to the fretboard'], correctAnswer: 0, explanation: 'Lightly touch the string with a finger or thumb so it does not vibrate. That keeps wrong notes from ringing and makes your chords sound intentional.' }
    ]
  },
  'Your First Riff: Smoke on the Water': {
    title: 'Your First Riff: Smoke on the Water',
    items: [
      { type: 'multiple_choice', question: 'What is a riff?', options: ['A short, repeating melodic phrase—often the most recognizable part of a song', 'A chord progression', 'A strum pattern', 'A type of pick'], correctAnswer: 0, explanation: 'A riff is a short melodic phrase that repeats. The Smoke on the Water riff uses only a few notes on one or two strings.' },
      { type: 'multiple_choice', question: 'To play a riff cleanly, what do you need to coordinate?', options: ['Fretting hand holds the correct frets while the picking hand plays the right string at the right time', 'Only the picking hand', 'Only the fretting hand', 'Your foot and your pick'], correctAnswer: 0, explanation: 'Both hands work together: the fretting hand holds the correct frets while the picking hand plays the right string at the right time.' },
      { type: 'fill_blank', sentence: 'Learning the Smoke on the Water riff ties together single-note picking and _____ so you play real music.', options: ['fretting', 'singing', 'tuning', 'strumming'], correctAnswer: 0, explanation: 'You use the fretting hand for the correct frets and the picking hand for the right string at the right time. That ties single-note picking and fretting into real music.' }
    ]
  },
  'Simple Fingerpicking Pattern': {
    title: 'Simple Fingerpicking Pattern',
    items: [
      { type: 'multiple_choice', question: 'What does the pattern p-i-m-a-m-i mean in fingerpicking?', options: ['Thumb, index, middle, ring, middle, index—which finger plucks in order', 'Play only the bass', 'A chord name', 'A strum direction'], correctAnswer: 0, explanation: 'p = thumb, i = index, m = middle, a = ring. So p-i-m-a-m-i tells you which finger plucks which string in order, creating a flowing arpeggio.' },
      { type: 'multiple_choice', question: 'When you play p-i-m-a-m-i repeatedly over a chord, what are you playing?', options: ['An arpeggio—the notes of the chord one after another', 'A scale', 'A single note', 'A strum'], correctAnswer: 0, explanation: 'An arpeggio is when you play the notes of a chord one after another instead of all at once. The pattern creates a flowing, harp-like sound.' },
      { type: 'fill_blank', sentence: 'In the p-i-m-a-m-i pattern, the thumb (p) typically plays the _____ strings (6, 5, 4).', options: ['bass', 'treble', 'middle', 'open'], correctAnswer: 0, explanation: 'Thumb handles the bass strings (6, 5, 4); index, middle, and ring handle the treble strings (3, 2, 1).' }
    ]
  },
  'Vibrato - Making Notes Sing': {
    title: 'Vibrato - Making Notes Sing',
    items: [
      { type: 'multiple_choice', question: 'What is vibrato?', options: ['A slight, rapid wavering of the pitch of a note—makes a held note wobble slightly', 'A type of chord', 'Playing two notes at once', 'A strum pattern'], correctAnswer: 0, explanation: 'Vibrato is a slight wavering of the pitch. It makes the guitar sound vocal and human; without it, sustained notes can sound flat and lifeless.' },
      { type: 'multiple_choice', question: 'How do you create vibrato on a fretted note?', options: ['Gently shake your finger side-to-side or use small, repeated bends', 'Press harder', 'Move to another fret', 'Strum faster'], correctAnswer: 0, explanation: 'After fretting a note, you create vibrato by gently shaking your finger side-to-side (parallel to the frets) or by using small, repeated bends.' },
      { type: 'fill_blank', sentence: 'Vibrato makes the guitar sound _____ and human; it is one of the main tools for expression.', options: ['vocal', 'quiet', 'sharp', 'muted'], correctAnswer: 0, explanation: 'Vibrato makes sustained notes sound vocal and expressive. It is one of the main tools for expression from zero to professional playing.' }
    ]
  },
  'Moving Barre Shapes': {
    title: 'Moving Barre Shapes',
    items: [
      { type: 'multiple_choice', question: 'When you move the F major barre shape from fret 1 to fret 3, what chord do you get?', options: ['G major', 'A major', 'F minor', 'Bb major'], correctAnswer: 0, explanation: 'F at fret 1, G at fret 3, A at fret 5, B at fret 7. The root note on the low E string names the chord.' },
      { type: 'multiple_choice', question: 'What names the chord when you move a barre shape to a new fret?', options: ['The root note—the note under your barre on the low E (or A) string', 'The fret number', 'The shape only', 'The picking hand'], correctAnswer: 0, explanation: 'The root is the note your index finger is barring on the low E string (or the string you use for the root). So the same shape at different frets gives different chords.' },
      { type: 'fill_blank', sentence: 'The same barre _____ can be moved up and down the neck to play different chords; one shape gives you every major or minor chord in that form.', options: ['shape', 'finger', 'pick', 'string'], correctAnswer: 0, explanation: 'The same finger shape moved to different frets gives different chords. F at fret 1, G at fret 3, A at fret 5, etc. This is why barre chords are essential.' }
    ]
  },
  'E Minor - Your First Chord': {
    title: 'E Minor - Your First Chord',
    items: [
      { type: 'multiple_choice', question: 'Build E minor from its components. Which three notes form an Em chord?', options: ['E, G, B', 'E, G#, B', 'E, F#, B', 'E, A, B'], correctAnswer: 0, explanation: 'E minor is built from the root (E), minor third (G), and fifth (B). So Em = E, G, B. The minor third is one half step lower than in E major, which gives Em its darker sound.' },
      { type: 'multiple_choice', question: 'In E minor, which note is the minor third (the note that makes it minor)?', options: ['E', 'G', 'B', 'D'], correctAnswer: 1, explanation: 'The minor third of Em is G. In E major the third would be G#; lowering it to G makes the chord minor. So the third is the note that defines the chord quality.' },
      { type: 'fill_blank', sentence: 'E minor uses just _____ fingers on the fretboard.', options: ['2', '1', '3', '4'], correctAnswer: 0, explanation: 'E minor (Em) needs only two fingers: middle finger on string 5 fret 2, ring finger on string 4 fret 2. The other strings are open. That makes Em one of the first chords beginners learn.' },
      { type: 'multiple_choice', question: 'Which fingers play E minor?', options: ['Index and middle', 'Middle and ring', 'Ring and pinky', 'Index and pinky'], correctAnswer: 1, explanation: 'Middle finger on string 5 (A string) fret 2, ring finger on string 4 (D string) fret 2. Strings 6, 3, 2, and 1 are played open.' },
      { type: 'fill_blank', sentence: 'E minor is often written as _____ on chord charts.', options: ['Em', 'E', 'Emin', 'E-'], correctAnswer: 0, explanation: 'Chord charts use "Em" or "Emin" or "E-" for E minor. The lowercase "m" means minor.' }
    ]
  },
  'A Minor - The Sad Sister': {
    title: 'A Minor - The Sad Sister',
    items: [
      { type: 'multiple_choice', question: 'Build A minor from its components. Which three notes form an Am chord?', options: ['A, C, E', 'A, C#, E', 'A, B, E', 'A, D, E'], correctAnswer: 0, explanation: 'A minor is built from the root (A), minor third (C), and fifth (E). So Am = A, C, E. The minor third C is one half step lower than C#, which would be in A major.' },
      { type: 'multiple_choice', question: 'In A minor, which note is the root (the note the chord is named after)?', options: ['C', 'E', 'A', 'G'], correctAnswer: 2, explanation: 'The root of Am is A. Every chord is named after its root note. The root is the foundation of the chord.' },
      { type: 'multiple_choice', question: 'In A minor, which note is the fifth?', options: ['A', 'C', 'E', 'G'], correctAnswer: 2, explanation: 'The fifth of Am is E. A basic triad has root, third, and fifth. In Am: root = A, minor third = C, fifth = E.' },
      { type: 'fill_blank', sentence: 'Am and C major share two notes (C and E); the difference is that Am has _____ as the root and a darker sound.', options: ['A', 'C', 'E', 'G'], correctAnswer: 0, explanation: 'Am has A as the root; C major has C as the root. They share C and E, which is why the finger shapes are similar and switching between them is easier.' }
    ]
  },
  'A Major - The Happy Sound': {
    title: 'A Major - The Happy Sound',
    items: [
      { type: 'multiple_choice', question: 'Build A major from its components. Which three notes form an A major chord?', options: ['A, C#, E', 'A, C, E', 'A, B, E', 'A, D, E'], correctAnswer: 0, explanation: 'A major is built from the root (A), major third (C#), and fifth (E). So A = A, C#, E. The major third is four half steps above the root.' },
      { type: 'multiple_choice', question: 'In A major, which note is the major third?', options: ['A', 'C#', 'E', 'G#'], correctAnswer: 1, explanation: 'The major third of A major is C#. That raised third (compared to C in Am) is what gives A major its bright, happy quality.' },
      { type: 'fill_blank', sentence: 'For A major you place index, middle, and ring fingers on strings 4, 3, and 2, all at fret _____.', options: ['2', '1', '3', '4'], correctAnswer: 0, explanation: 'All three fingers go at fret 2. Strum strings 5 through 1; do not play the low E string.' }
    ]
  },
  'D Major - The Classic': {
    title: 'D Major - The Classic',
    items: [
      { type: 'multiple_choice', question: 'Build D major from its components. Which three notes form a D major chord?', options: ['D, F#, A', 'D, F, A', 'D, G, A', 'D, E, A'], correctAnswer: 0, explanation: 'D major is built from the root (D), major third (F#), and fifth (A). So D = D, F#, A.' },
      { type: 'multiple_choice', question: 'In D major, which note is the fifth?', options: ['D', 'F#', 'A', 'C#'], correctAnswer: 2, explanation: 'The fifth of D major is A. The triad is root (D), major third (F#), fifth (A).' },
      { type: 'fill_blank', sentence: 'D major uses only the _____ thinnest strings (4, 3, 2, 1)—do not strum the two thickest.', options: ['four', 'three', 'five', 'six'], correctAnswer: 0, explanation: 'D major is played on strings 4, 3, 2, and 1 only. The low E and A strings are not played in the standard D shape.' }
    ]
  },
  'G Major - The Big Stretch': {
    title: 'G Major - The Big Stretch',
    items: [
      { type: 'multiple_choice', question: 'Build G major from its components. Which three notes form a G major chord?', options: ['G, B, D', 'G, A#, D', 'G, A, D', 'G, C, D'], correctAnswer: 0, explanation: 'G major is built from the root (G), major third (B), and fifth (D). So G = G, B, D.' },
      { type: 'multiple_choice', question: 'In G major, which note is the major third?', options: ['G', 'B', 'D', 'F#'], correctAnswer: 1, explanation: 'The major third of G major is B. That gives G its bright, full sound.' },
      { type: 'fill_blank', sentence: 'G major uses all four fretting fingers, including the _____, and you strum all six strings.', options: ['pinky', 'index', 'middle', 'ring'], correctAnswer: 0, explanation: 'G often uses the pinky on string 1 fret 3. Strum all six strings for the full chord.' }
    ]
  },
  'C Major - The Most Popular': {
    title: 'C Major - The Most Popular',
    items: [
      { type: 'multiple_choice', question: 'Build C major from its components. Which three notes form a C major chord?', options: ['C, E, G', 'C, D#, G', 'C, D, G', 'C, F, G'], correctAnswer: 0, explanation: 'C major is built from the root (C), major third (E), and fifth (G). So C = C, E, G.' },
      { type: 'multiple_choice', question: 'In C major, which note is the root?', options: ['E', 'G', 'C', 'A'], correctAnswer: 2, explanation: 'The root of C major is C. The chord is named after its root note.' },
      { type: 'fill_blank', sentence: 'For C major you strum from string _____ down to string 1; do not play the thickest string (low E).', options: ['5', '6', '4', '3'], correctAnswer: 0, explanation: 'Strum strings 5, 4, 3, 2, and 1. The low E (string 6) is not played in the standard C shape.' }
    ]
  },
  'E Major - Power and Brightness': {
    title: 'E Major - Power and Brightness',
    items: [
      { type: 'multiple_choice', question: 'Build E major from its components. Which three notes form an E major chord?', options: ['E, G#, B', 'E, G, B', 'E, A, B', 'E, F#, B'], correctAnswer: 0, explanation: 'E major is built from the root (E), major third (G#), and fifth (B). So E = E, G#, B. Compared to Em, the third is G# instead of G.' },
      { type: 'multiple_choice', question: 'To turn E minor into E major, which note do you add or change?', options: ['Add G# (major third) on string 3 fret 1', 'Add B on string 2', 'Add E on string 6', 'Add A on string 5'], correctAnswer: 0, explanation: 'Em has E, G, B. E major has E, G#, B. So you add the index finger on string 3 (G string) fret 1 to play G#, which raises the third and makes the chord major.' }
    ]
  },
  'F Major - The First Barre Chord': {
    title: 'F Major - The First Barre Chord',
    items: [
      { type: 'multiple_choice', question: 'Build F major from its components. Which three notes form an F major chord?', options: ['F, A, C', 'F, G#, C', 'F, G, C', 'F, Bb, C'], correctAnswer: 0, explanation: 'F major is built from the root (F), major third (A), and fifth (C). So F = F, A, C.' },
      { type: 'multiple_choice', question: 'In F major, which note is the fifth?', options: ['F', 'A', 'C', 'E'], correctAnswer: 2, explanation: 'The fifth of F major is C. The triad is root (F), major third (A), fifth (C).' },
      { type: 'fill_blank', sentence: 'For F major you barre all six strings at fret 1 with your index finger, then form an _____ major shape with the other fingers.', options: ['E', 'A', 'D', 'G'], correctAnswer: 0, explanation: 'F is the E major shape moved up one fret, with the index finger barring fret 1 and acting as the nut. So you use the "E shape" with a barre.' }
    ]
  },
  'The 4-Chord Song': {
    title: 'The 4-Chord Song',
    items: [
      { type: 'multiple_choice', question: 'Which four chords make up the classic "four-chord song" progression (in any order)?', options: ['G, D, Em, C', 'G, Am, Bm, C', 'A, D, E, F#m', 'C, F, G, Am'], correctAnswer: 0, explanation: 'The most common four-chord progression in pop and rock is G, D, Em, C (or similar order). It appears in Let It Be, No Woman No Cry, With or Without You, and hundreds more.' },
      { type: 'multiple_choice', question: 'Build G from its components. Which notes form G major?', options: ['G, B, D', 'G, A, D', 'G, C, E', 'G, A#, D'], correctAnswer: 0, explanation: 'G major = root G, major third B, fifth D.' },
      { type: 'multiple_choice', question: 'Build Em from its components. Which notes form E minor?', options: ['E, G, B', 'E, G#, B', 'E, A, B', 'E, F#, B'], correctAnswer: 0, explanation: 'E minor = root E, minor third G, fifth B.' },
      { type: 'multiple_choice', question: 'In the progression G–D–Em–C, which chord is minor?', options: ['Em', 'G', 'D', 'C'], correctAnswer: 0, explanation: 'Em (E minor) is the only minor chord in that progression. G, D, and C are major.' }
    ]
  },
  'Parts of the Guitar': {
    title: 'Parts of the Guitar',
    items: [
      { type: 'fill_blank', sentence: 'The _____ holds the tuning machines (tuning pegs).', options: ['headstock', 'bridge', 'body', 'sound hole'], correctAnswer: 0, explanation: 'The headstock is the flat or angled piece at the top of the neck. The tuning pegs (machines) are mounted there; you turn them to change string tension and thus the pitch of each string. So the headstock is where you go to tune the guitar.' },
      { type: 'multiple_choice', question: 'What guides the strings from headstock to fretboard and sets their spacing?', options: ['The bridge', 'The nut', 'The saddle', 'The pickguard'], correctAnswer: 1, explanation: 'The nut is the small strip (often white) at the top of the fretboard, between the headstock and the frets. It has a groove for each string so they stay in place and at the correct spacing. The nut is one of two endpoints of the "speaking" length of the string (the other is the bridge saddle).' },
      { type: 'fill_blank', sentence: 'The _____ are thin metal strips across the neck that divide it into fixed note positions.', options: ['frets', 'strings', 'markers', 'saddles'], correctAnswer: 0, explanation: 'Frets are the metal bars embedded in the fretboard. When you press a string behind a fret, the vibrating length runs from that fret to the bridge, so the pitch is fixed and repeatable. Without frets, we would have no standard "notes"—just a continuous slide of pitch.' },
      { type: 'multiple_choice', question: 'Where are pickups typically found?', options: ['All guitars', 'Acoustic guitars only', 'Electric guitars', 'Bass only'], correctAnswer: 2, explanation: 'Pickups are magnetic (or piezoelectric) devices that "pick up" string vibration and convert it to an electrical signal, which is then amplified. Acoustic guitars rely on the hollow body to amplify sound; electric guitars need pickups because the solid body does not resonate enough on its own. So: acoustic = body amplifies, electric = pickup + amplifier.' },
      { type: 'fill_blank', sentence: 'The _____ anchors the strings at the body end and transfers their vibration to the body.', options: ['bridge', 'nut', 'headstock', 'fretboard'], correctAnswer: 0, explanation: 'The bridge is where the strings attach to the body (often with bridge pins on an acoustic). The strings pass over the "saddle" (a small strip on the bridge), which sets the other endpoint of the vibrating length. So the bridge both holds the strings and sends their vibration into the body for amplification.' },
      { type: 'multiple_choice', question: 'What is the "sound hole" for?', options: ['To store picks', 'To let the vibrating air inside the body project sound outward on an acoustic', 'To tune the guitar', 'To attach a strap'], correctAnswer: 1, explanation: 'On an acoustic guitar, the body is a hollow box. When the strings vibrate, they move the bridge and the top (soundboard), which moves the air inside the body. The sound hole lets that air move in and out so the sound projects. So the sound hole is essential to the volume and tone of an acoustic.' },
      { type: 'fill_blank', sentence: 'The neck and _____ together give you the playing surface: frets on the neck, strings over the body.', options: ['fretboard', 'bridge', 'headstock', 'nut'], correctAnswer: 0, explanation: 'The fretboard (or fingerboard) is the flat or slightly curved front of the neck where the frets are. You press the strings against the fretboard behind the frets. So "neck" and "fretboard" are often used together: the neck is the whole piece, the fretboard is the playing surface with the frets.' }
    ]
  },
  'How Guitars Make Sound': {
    title: 'How Guitars Make Sound',
    items: [
      { type: 'fill_blank', sentence: 'When you pluck a string, it _____.', options: ['vibrates', 'breaks', 'mutes', 'bends'], correctAnswer: 0, explanation: 'Plucking the string sets it in motion—it vibrates back and forth. That motion pushes the air and creates sound waves. So the chain is: you pluck → string vibrates → air moves → we hear sound. No vibration, no sound. This is true for every stringed instrument.' },
      { type: 'multiple_choice', question: 'What amplifies the sound on an acoustic guitar?', options: ['Pickups', 'The hollow body', 'The frets', 'The nut'], correctAnswer: 1, explanation: 'The body is a hollow box with a thin top (soundboard). The vibrating strings pull and push the bridge, which moves the soundboard. The soundboard and the air inside the body then move a lot more air than the string alone could, so the sound gets louder and richer. That is "acoustic" amplification—no electricity needed.' },
      { type: 'fill_blank', sentence: 'A shorter vibrating length (e.g. when you press a fret) gives a _____ pitch.', options: ['higher', 'lower', 'louder', 'softer'], correctAnswer: 0, explanation: 'The shorter the vibrating part of the string, the faster it can vibrate, so the pitch goes up. That is why pressing at fret 1 raises the note, and why moving toward the body (higher frets) keeps raising it. This physical fact is the basis for every note and chord on the guitar.' },
      { type: 'multiple_choice', question: 'Why does the same string sound different at different frets?', options: ['The frets are different sizes.', 'Pressing a fret shortens the vibrating length, which raises the pitch.', 'The body changes shape.', 'It does not.'], correctAnswer: 1, explanation: 'When you press behind a fret, the string now vibrates only from that fret to the bridge. So the "speaking" length is shorter, and a shorter length = higher frequency = higher note. Each fret shortens the length by a fixed amount, so each fret gives a new, repeatable note.' },
      { type: 'fill_blank', sentence: 'On an electric guitar, _____ convert string vibration into an electrical signal that an amplifier then turns into sound.', options: ['pickups', 'frets', 'the nut', 'the bridge'], correctAnswer: 0, explanation: 'Electric guitars have little magnets (pickups) under the strings. When the metal string vibrates, it disturbs the magnetic field and creates a tiny current in the pickup. That signal goes to an amplifier and speaker, which make it loud. So electric sound still starts with string vibration—but amplification is electronic, not acoustic.' }
    ]
  },
  'High vs Low Sounds': {
    title: 'High vs Low Sounds',
    items: [
      { type: 'fill_blank', sentence: 'The _____ the string (or the longer its vibrating length), the lower the sound.', options: ['thicker', 'thinner', 'tighter', 'looser'], correctAnswer: 0, explanation: 'Thicker strings are heavier and vibrate more slowly, so they produce a lower pitch. The same is true if you make the vibrating length longer. So the low E string is thick and long; the high E is thin and (when fretted) can be short. Physics of vibration is the basis for all pitch on the guitar.' },
      { type: 'multiple_choice', question: 'Which string normally sounds highest in pitch?', options: ['Low E', 'A', 'High E', 'D'], correctAnswer: 2, explanation: 'The 1st string (high E) is the thinnest and, when played open or at low frets, has the highest pitch. "High" and "low" in music refer to pitch: high = faster vibration = higher note; low = slower vibration = lower note. So we say "high E" and "low E" for the thinnest and thickest strings.' },
      { type: 'fill_blank', sentence: 'Pitch means how _____ or low a note sounds—high pitch = high note, low pitch = low note.', options: ['high', 'loud', 'fast', 'bright'], correctAnswer: 0, explanation: 'Pitch is the property that makes one note "higher" or "lower" than another (like C vs. G). It is determined by how many times the string (or air) vibrates per second (frequency). More vibrations per second = higher pitch. So when we say "high" and "low" in music, we mean pitch, not volume.' },
      { type: 'multiple_choice', question: 'Why do thick strings sound lower than thin strings?', options: ['They are longer.', 'They vibrate more slowly (lower frequency) for the same length and tension.', 'They are looser.', 'They are made of different material.'], correctAnswer: 1, explanation: 'For the same length and tension, a thicker (heavier) string vibrates more slowly, so its frequency is lower and we hear a lower pitch. That is why the 6th string is thick (low E) and the 1st is thin (high E). Understanding this helps you understand the whole instrument from zero.' }
    ]
  },
  'What Is Tuning?': {
    title: 'What Is Tuning?',
    items: [
      { type: 'fill_blank', sentence: 'Tuning means adjusting each string so it plays the _____ pitch (note).', options: ['correct', 'wrong', 'loud', 'high'], correctAnswer: 0, explanation: 'Standard tuning is E-A-D-G-B-E (thick to thin). If a string is too loose, it sounds flat (too low); if too tight, it sounds sharp (too high). Tuning is making each string match that target note so chords and melodies sound right. Always tune before you play—it is the first step from zero.' },
      { type: 'multiple_choice', question: 'What do tuning pegs (machines) actually change?', options: ['Volume', 'String tension and therefore pitch', 'Tone only', 'Nothing'], correctAnswer: 1, explanation: 'Turning a tuning peg winds or unwinds the string. More tension = string vibrates faster = higher pitch. Less tension = lower pitch. So you use the pegs to raise or lower each string until it matches the correct note (e.g. E, A, D, G, B, E). A tuner or app can tell you when you are there.' },
      { type: 'fill_blank', sentence: 'Standard tuning is E-A-D-G-B-E from the _____ string to the thinnest.', options: ['thickest', 'thinnest', 'middle', 'open'], correctAnswer: 0, explanation: 'We always list tuning from the thickest (6th) to the thinnest (1st): E, A, D, G, B, E. That is what "standard tuning" means. Every chord chart and tab assumes this unless they say otherwise (e.g. "drop D"). So memorizing E-A-D-G-B-E is part of the foundation.' },
      { type: 'multiple_choice', question: 'Why does the guitar go out of tune?', options: ['Strings do not change.', 'Temperature, humidity, playing, and stretching gradually change string tension.', 'Only when you break a string.', 'Tuning is permanent.'], correctAnswer: 1, explanation: 'Strings stretch slightly with playing and with changes in temperature and humidity. New strings go out of tune quickly until they settle. So checking your tuning often—especially at the start of a practice or session—keeps everything sounding right. It only takes a minute and makes a huge difference.' }
    ]
  },
  'Down Strums': {
    title: 'Down Strums',
    items: [
      { type: 'fill_blank', sentence: 'A down strum brushes from the _____ string toward the thinnest.', options: ['thickest', 'middle', 'open', 'muted'], correctAnswer: 0, explanation: 'Down strums move from thick to thin strings. The motion usually comes from a loose wrist, not a stiff elbow.' },
      { type: 'multiple_choice', question: 'What is the steady pulse you strum along with called?', options: ['Melody', 'Beat', 'Harmony', 'Capo'], correctAnswer: 1, explanation: 'The beat is the repeating pulse (1-2-3-4). Staying on the beat is what makes strumming sound musical.' },
      { type: 'multiple_choice', question: 'Where should most of the strumming motion come from?', options: ['Elbow only', 'Wrist (loose)', 'Shoulder', 'Neck'], correctAnswer: 1, explanation: 'A loose wrist gives control and endurance; big elbow-only swings are harder to keep even.' }
    ]
  },
  'Up Strums': {
    title: 'Up Strums',
    items: [
      { type: 'multiple_choice', question: 'On an up strum, which strings are usually emphasized?', options: ['Only the thickest two', 'Often the thinner treble strings', 'Only string 6', 'None'], correctAnswer: 1, explanation: 'The return motion often catches the higher strings; down strums tend to cover more of the set.' },
      { type: 'fill_blank', sentence: 'Down and _____ strums together form the basis of almost every strum pattern.', options: ['up', 'side', 'mute', 'tap'], correctAnswer: 0, explanation: 'Alternating down and up motion is the foundation; patterns choose which strokes actually hit the strings.' },
      { type: 'multiple_choice', question: 'Why is the up strum often lighter than the down strum?', options: ['It is always wrong to strum up', 'You may hit fewer strings and use less force on the return', 'Up strums are only for bass', 'Strings cannot vibrate upward'], correctAnswer: 1, explanation: 'Many grooves use a lighter upstroke on the treble side for feel and clarity.' }
    ]
  },
  'Down-Up Pattern': {
    title: 'Down-Up Pattern',
    items: [
      { type: 'multiple_choice', question: 'Why keep your strumming hand moving like a pendulum even when you skip a strum?', options: ['To look busy', 'So timing stays even and the pulse is steady', 'To tune the guitar', 'To mute all strings'], correctAnswer: 1, explanation: 'Constant motion preserves the beat; you choose which strokes contact the strings.' },
      { type: 'fill_blank', sentence: 'Skipping a strum but keeping the hand moving is a core skill for _____ rhythm.', options: ['steady', 'random', 'silent', 'broken'], correctAnswer: 0, explanation: 'Ghost strokes keep your internal clock running so patterns like D-D-U-U-D-U feel natural.' },
      { type: 'multiple_choice', question: 'Down-Up-Down-Up is best described as:', options: ['A chord name', 'The foundation that other strum patterns vary', 'A type of capo', 'Only for fingerstyle'], correctAnswer: 1, explanation: 'Most patterns are just choosing which downs and ups hit the strings.' }
    ]
  },
  'Holding a Pick Properly': {
    title: 'Holding a Pick Properly',
    items: [
      { type: 'fill_blank', sentence: 'Hold the pick between _____ and index finger with only a small tip exposed.', options: ['thumb', 'middle', 'ring', 'pinky'], correctAnswer: 0, explanation: 'Thumb and index give a stable grip; too much pick sticking out causes flapping and noise.' },
      { type: 'multiple_choice', question: 'Why avoid a "death grip" on the pick?', options: ['It sounds better', 'Tension tires your hand and can make tone harsh', 'Picks break instantly', 'You cannot strum'], correctAnswer: 1, explanation: 'Firm but relaxed control beats squeezing as hard as possible.' },
      { type: 'multiple_choice', question: 'What is a pick (plectrum) used for?', options: ['Tuning only', 'Striking or brushing the strings', 'Replacing frets', 'Muting the neck'], correctAnswer: 1, explanation: 'The pick transfers energy to the strings for strums and single notes.' }
    ]
  },
  'Picking One String at a Time': {
    title: 'Picking One String at a Time',
    items: [
      { type: 'multiple_choice', question: 'For clean single-string picking, what works better than huge arm swings?', options: ['Only using the elbow', 'Small, precise wrist movements', 'Plucking with the fretting hand only', 'Ignoring string spacing'], correctAnswer: 1, explanation: 'Small wrist motions help you aim at one string without hitting neighbors.' },
      { type: 'fill_blank', sentence: 'Resting your palm or pinky on the body or bridge for stability is called _____ the hand.', options: ['planting', 'sliding', 'barring', 'hammering'], correctAnswer: 0, explanation: 'Planting gives a reference so your pick returns to the same place each stroke.' },
      { type: 'multiple_choice', question: 'Picking one string at a time is the path from strumming chords to:', options: ['Only tuning', 'Melodies, riffs, and solos', 'Removing strings', 'Capo use'], correctAnswer: 1, explanation: 'Single-note accuracy unlocks melodic playing.' }
    ]
  },
  'Alternate Picking': {
    title: 'Alternate Picking',
    items: [
      { type: 'fill_blank', sentence: 'Alternate picking means alternating _____ and upstrokes.', options: ['downstrokes', 'slides', 'hammers', 'rests'], correctAnswer: 0, explanation: 'Down-up-down-up keeps the hand efficient and is standard for scales and fast lines.' },
      { type: 'multiple_choice', question: 'Why alternate instead of only downstrokes for many notes in a row?', options: ['Downstrokes are illegal', 'It is often faster and keeps the hand in continuous motion', 'Upstrokes are silent', 'It changes the guitar tuning'], correctAnswer: 1, explanation: 'Each stroke sets up the next; constant direction changes reduce wasted motion.' },
      { type: 'multiple_choice', question: 'Alternate picking is especially useful for:', options: ['Only open chords', 'Scales, riffs, and solos', 'Changing strings on the headstock', 'Reading TAB only'], correctAnswer: 1, explanation: 'It is the default engine for single-note lines on guitar.' }
    ]
  },
  'Fixing String Buzz': {
    title: 'Fixing String Buzz',
    items: [
      { type: 'multiple_choice', question: 'Buzz often happens when you press too far from the fret. Where should you press?', options: ['On top of the fret wire', 'Just behind the fret wire', 'Halfway between frets', 'Past the 12th fret only'], correctAnswer: 1, explanation: 'Close to the fret minimizes buzz and needed pressure.' },
      { type: 'fill_blank', sentence: 'Use your _____ tip, not the soft pad, for a clear note.', options: ['finger', 'palm', 'knuckle', 'nail'], correctAnswer: 0, explanation: 'The fingertip gives a small, precise contact point.' },
      { type: 'multiple_choice', question: 'String buzz is best described as:', options: ['A pleasant effect', 'A rattling or fuzzy sound from poor contact with the fret', 'Normal tuning drift', 'Only caused by picks'], correctAnswer: 1, explanation: 'Clean contact at the fret ends the string cleanly; buzz means something is off in pressure or placement.' }
    ]
  },
  'Fixing Muted Strings': {
    title: 'Fixing Muted Strings',
    items: [
      { type: 'multiple_choice', question: 'Accidentally muted strings in a chord are often fixed by:', options: ['Flattening all fingers across the neck', 'Arching fingers so only fingertips touch', 'Pressing with the palm on all strings', 'Removing the thumb'], correctAnswer: 1, explanation: 'An arched hand keeps neighboring strings free to vibrate.' },
      { type: 'fill_blank', sentence: 'Keep knuckles bent and pointing away from the neck so fingers do not _____ adjacent strings.', options: ['touch', 'strengthen', 'tune', 'paint'], correctAnswer: 0, explanation: 'Collateral contact is the usual cause of dead notes in chords.' },
      { type: 'multiple_choice', question: 'A "dead" string in a chord usually means:', options: ['It is louder than the rest', 'It does not ring clearly—often touched by another finger', 'It is the only correct string', 'It is always string 1'], correctAnswer: 1, explanation: 'Diagnose by playing each string alone while holding the shape.' }
    ]
  },
  'The Chord Check': {
    title: 'The Chord Check',
    items: [
      { type: 'multiple_choice', question: 'What is the chord check?', options: ['Tune with a capo', 'Play each string one at a time while holding the chord', 'Only strum down', 'Remove all fingers'], correctAnswer: 1, explanation: 'You hear which string buzzes, mutes, or rings so you can adjust.' },
      { type: 'fill_blank', sentence: 'If one string buzzes during the check, move that finger closer to the _____ .', options: ['fret', 'bridge', 'headstock', 'sound hole'], correctAnswer: 0, explanation: 'Proximity to the fret wire usually fixes buzz.' },
      { type: 'multiple_choice', question: 'When should you use the chord check?', options: ['Never', 'When learning any new chord shape', 'Only on barre chords after a year', 'Only on electric guitar'], correctAnswer: 1, explanation: 'It builds the habit of clean, intentional notes from the start.' }
    ]
  },
  'Practice: Em, A, and D': {
    title: 'Practice: Em, A, and D',
    items: [
      { type: 'multiple_choice', question: 'This practice session focuses on which chords?', options: ['G, C, F', 'Em, A, and D', 'Only power chords', 'Barre chords only'], correctAnswer: 1, explanation: 'You reinforce the shapes from the unit with the chord recognizer.' },
      { type: 'multiple_choice', question: 'Why use the chord recognizer here?', options: ['To replace tuning', 'To verify each chord is clear and correctly recognized', 'To change your strings', 'To read standard notation'], correctAnswer: 1, explanation: 'Feedback helps you hear and fix problems before moving on.' },
      { type: 'fill_blank', sentence: 'Smooth switching between Em, A, and D is the bridge from single chords to playing _____.', options: ['songs', 'scales', 'harmonics', 'feedback'], correctAnswer: 0, explanation: 'Real music is chord sequences in time.' }
    ]
  },
  'Fingers Have Names': {
    title: 'Fingers Have Names',
    items: [
      { type: 'fill_blank', sentence: 'In fingerpicking notation, the thumb is _____.', options: ['p', 'i', 'm', 'a'], correctAnswer: 0, explanation: 'p = pulgar (thumb), i = index, m = middle, a = ring.' },
      { type: 'multiple_choice', question: 'Which finger is "i"?', options: ['Thumb', 'Index', 'Ring', 'Pinky'], correctAnswer: 1, explanation: 'i = index; m = middle; a = ring.' },
      { type: 'multiple_choice', question: 'The picking-hand pinky usually:', options: ['Plucks string 6 fastest', 'Rests on the guitar for stability instead of plucking', 'Replaces the thumb', 'Tunes the guitar'], correctAnswer: 1, explanation: 'Classical and folk technique often anchors the hand with the pinky side or palm.' }
    ]
  },
  'Thumb on Bass Strings': {
    title: 'Thumb on Bass Strings',
    items: [
      { type: 'multiple_choice', question: 'Which strings are the "bass" strings in standard numbering?', options: ['1, 2, 3', '4, 5, 6', 'Only 6', 'Only 1'], correctAnswer: 1, explanation: 'Strings 6, 5, and 4 (E, A, D) are the bass side; the thumb usually plays them.' },
      { type: 'fill_blank', sentence: 'The thumb typically plucks bass strings with a motion away from the _____ .', options: ['palm', 'fretboard', 'pick', 'capo'], correctAnswer: 0, explanation: 'Thumb moves downward through the bass strings, away from the palm.' },
      { type: 'multiple_choice', question: 'The "root" of a chord is:', options: ['Always the thinnest string', 'The note the chord is named after and often played on the bass side', 'The pick', 'The capo fret'], correctAnswer: 1, explanation: 'The thumb often plays the root on the 6th or 5th string in patterns.' }
    ]
  },
  'Fingers on Treble Strings': {
    title: 'Fingers on Treble Strings',
    items: [
      { type: 'multiple_choice', question: 'Treble strings 3, 2, 1 are typically plucked by:', options: ['Thumb only', 'Index, middle, and ring (i, m, a)', 'Only the pinky', 'The fretting hand thumb'], correctAnswer: 1, explanation: 'i on 3, m on 2, a on 1 is a common assignment.' },
      { type: 'fill_blank', sentence: 'Treble fingers often pluck _____ , toward the palm, while the thumb plucks bass downward.', options: ['upward', 'sideways', 'downward only', 'never'], correctAnswer: 0, explanation: 'Opposite directions help separate voices and timing.' },
      { type: 'multiple_choice', question: 'String 1 is:', options: ['The thickest string', 'The thinnest, highest-pitched string', 'Always muted', 'The bass E'], correctAnswer: 1, explanation: 'Numbering runs thin = 1, thick = 6.' }
    ]
  },
  'Hammer-Ons': {
    title: 'Hammer-Ons',
    items: [
      { type: 'fill_blank', sentence: 'A hammer-on sounds a higher note on the same string with _____ picking again.', options: ['without', 'double', 'slow', 'muted'], correctAnswer: 0, explanation: 'You pick once, then hammer a finger onto a higher fret so the string keeps vibrating.' },
      { type: 'multiple_choice', question: 'Hammer-ons add:', options: ['Only volume', 'Smooth legato connections between notes', 'Open tuning', 'Capo placement'], correctAnswer: 1, explanation: 'They let you play more notes per pick stroke.' },
      { type: 'multiple_choice', question: '"Higher" fret means:', options: ['Toward the headstock', 'Toward the body (larger fret numbers)', 'Only fret 1', 'Muted only'], correctAnswer: 1, explanation: 'Higher fret number = shorter string = higher pitch.' }
    ]
  },
  'Pull-Offs': {
    title: 'Pull-Offs',
    items: [
      { type: 'multiple_choice', question: 'A pull-off starts from:', options: ['An open string only', 'Two fingers on the same string; pick the higher note then pull off to the lower', 'A barre only', 'The pick alone'], correctAnswer: 1, explanation: 'The lower note must already be fretted or open; the snap-off restarts vibration.' },
      { type: 'fill_blank', sentence: 'Pull-offs pair with hammer-ons for _____ (smooth) playing.', options: ['legato', 'staccato', 'palm-muted', 'slide'], correctAnswer: 0, explanation: 'Legato means connected notes with fewer picks.' },
      { type: 'multiple_choice', question: 'Compared to a hammer-on, a pull-off:', options: ['Is identical', 'Goes to a lower pitch on the same string without a new pick', 'Only works on bass', 'Requires a capo'], correctAnswer: 1, explanation: 'Opposite direction of finger action, same idea of extra notes per stroke.' }
    ]
  },
  'Slides': {
    title: 'Slides',
    items: [
      { type: 'multiple_choice', question: 'In a slide you:', options: ['Lift and repluck every fret', 'Keep finger pressure and glide along the string to a new fret', 'Only use open strings', 'Stop the string'], correctAnswer: 1, explanation: 'Continuous contact lets pitch glide between notes.' },
      { type: 'fill_blank', sentence: 'Sliding "up" the neck means moving toward the _____ (higher frets).', options: ['body', 'headstock', 'nut', 'tuner'], correctAnswer: 0, explanation: 'Higher frets are closer to the body.' },
      { type: 'multiple_choice', question: 'Slides are useful for:', options: ['Only classical music', 'Vocal, expressive connections between notes', 'Breaking strings', 'Tuning'], correctAnswer: 1, explanation: 'They connect melody notes smoothly.' }
    ]
  },
  'Basic Bends': {
    title: 'Basic Bends',
    items: [
      { type: 'multiple_choice', question: 'A string bend raises pitch by:', options: ['Loosening the string only', 'Stretching the string sideways after fretting', 'Capo only', 'Muting'], correctAnswer: 1, explanation: 'Increased tension raises the frequency.' },
      { type: 'fill_blank', sentence: 'Use supporting fingers behind the fretting finger to help _____ the string.', options: ['push', 'cut', 'ignore', 'detune'], correctAnswer: 0, explanation: 'Shared strength keeps bends in tune and reduces strain.' },
      { type: 'multiple_choice', question: 'A small bend that matches the next half step is called:', options: ['A whole-step bend only', 'A half-step bend', 'A rest', 'Harmonics'], correctAnswer: 1, explanation: 'Start small and match pitch by ear.' }
    ]
  },
  'What Is a Barre Chord?': {
    title: 'What Is a Barre Chord?',
    items: [
      { type: 'fill_blank', sentence: 'A barre uses the index finger like a moveable _____ across all strings at one fret.', options: ['nut', 'pick', 'slide', 'capo'], correctAnswer: 0, explanation: 'The nut is the fixed end at the headstock; the barre replaces it at any fret.' },
      { type: 'multiple_choice', question: 'Why are barre chords powerful?', options: ['They only work on string 1', 'The same shape moved along the neck gives many different chords', 'They remove the need to tune', 'They replace all open chords'], correctAnswer: 1, explanation: 'One shape + barre = chords in every key.' },
      { type: 'multiple_choice', question: 'Barre chords build on shapes you know from:', options: ['Only piano', 'Open E and Em (and similar) moved up with the index barre', 'Harmonics only', 'Fingerpicking only'], correctAnswer: 1, explanation: 'F major is essentially E major moved up one fret with a barre at 1.' }
    ]
  },
  'Building Barre Strength': {
    title: 'Building Barre Strength',
    items: [
      { type: 'multiple_choice', question: 'When checking a barre, you should:', options: ['Only strum once ever', 'Pluck each string and fix buzz with index angle and pressure', 'Avoid the first three frets', 'Never use the thumb'], correctAnswer: 1, explanation: 'Per-string clarity shows whether the barre is even.' },
      { type: 'fill_blank', sentence: 'Lower frets (1–3) often feel _____ because the string is farther from the fretboard.', options: ['harder', 'easier', 'impossible', 'tuned'], correctAnswer: 0, explanation: 'More pressure and technique are needed; improvement takes consistent practice.' },
      { type: 'multiple_choice', question: 'Building barre strength is:', options: ['Instant for everyone', 'A process that can take weeks of short daily practice', 'Only for electric guitar', 'Not related to pressure'], correctAnswer: 1, explanation: 'Patience and repetition train the hand.' }
    ]
  }
};

// =============================================================================
// THEORY CONTENT - Interactive quiz-based teaching
// =============================================================================

export const theoryContent: Record<string, LessonContent> = {
  'Parts of the Guitar': techniqueContent['Parts of the Guitar'],
  'How Guitars Make Sound': techniqueContent['How Guitars Make Sound'],
  'High vs Low Sounds': techniqueContent['High vs Low Sounds'],
  'What Is Tuning?': techniqueContent['What Is Tuning?'],
  'The Musical Alphabet': {
    title: 'The Musical Alphabet',
    items: [
      { type: 'fill_blank', sentence: 'The musical alphabet has _____ letter names: A through G.', options: ['7', '5', '12', '8'], correctAnswer: 0, explanation: 'Western music uses only seven letter names: A, B, C, D, E, F, and G. There is no H—after G we go back to A. This repeating cycle is the foundation for every chord, scale, and melody. These seven are called the "natural" notes (they correspond to the white keys on a piano).' },
      { type: 'multiple_choice', question: 'What comes after G in the musical alphabet?', options: ['H', 'A', 'Z', '1'], correctAnswer: 1, explanation: 'The musical alphabet cycles: … F, G, A, B, C, D, E, F, G, A … So after G we return to A (a higher or lower A, depending on octave). This is different from the regular alphabet and is essential for reading music and understanding the fretboard.' },
      { type: 'fill_blank', sentence: 'The seven letters A–G are also called _____ notes.', options: ['natural', 'sharp', 'flat', 'chromatic'], correctAnswer: 0, explanation: 'The seven notes A, B, C, D, E, F, G are the "natural" notes. When we add sharps (#) and flats (b), we get the in-between notes. Every chord symbol and scale you will see is built from these seven letter names plus sharps and flats.' },
      { type: 'multiple_choice', question: 'Why is the musical alphabet important for guitar?', options: ['It is only for piano.', 'Chord names, scales, and the fretboard all use these letter names.', 'It is optional.', 'It has 12 letters.'], correctAnswer: 1, explanation: 'Chord names (C, Am, G7), scale names (C major, A minor), and every note on the fretboard use these seven letters. Understanding the cycle A–G is the first step from zero to reading and playing any music.' },
      { type: 'multiple_choice', question: 'How is the musical alphabet different from the regular alphabet?', options: ['It has more letters.', 'It has only 7 letters and then repeats (no H, I, J...).', 'It has numbers.', 'It is the same.'], correctAnswer: 1, explanation: 'In the regular alphabet we have A through Z. In music we use only A through G, and then we start again at A (at a higher or lower "octave"). So the musical alphabet is a cycle, not a straight line. That is why we can have "low A" and "high A"—same letter, different octave.' },
      { type: 'fill_blank', sentence: 'Every chord name and scale name you will see (C, F, G major, A minor, etc.) is built from these _____ letter names.', options: ['seven', 'twelve', 'five', 'eight'], correctAnswer: 0, explanation: 'Chord and scale names always use the seven letters A–G, sometimes with symbols like # (sharp), b (flat), or m (minor). So learning the seven natural notes is not optional—it is the language that every lesson, chart, and song uses. From zero to hero, this is step one.' }
    ]
  },
  'Sharps and Flats': {
    title: 'Sharps and Flats',
    items: [
      { type: 'fill_blank', sentence: 'A sharp (♯ or #) _____ a note by one half step.', options: ['raises', 'lowers', 'sustains', 'mutes'], correctAnswer: 0, explanation: 'A sharp means "one half step higher." On the guitar, one half step is one fret. So A# is the note one fret above A. The sharp symbol (#) always means "go up by the smallest step we use in Western music."' },
      { type: 'fill_blank', sentence: 'A flat (♭ or b) _____ a note by one half step.', options: ['lowers', 'raises', 'sustains', 'mutes'], correctAnswer: 0, explanation: 'A flat means "one half step lower." So Bb is one fret below B. Sharp = up one half step, flat = down one half step. On the guitar, half step = one fret, so this is how we name every note on the neck.' },
      { type: 'multiple_choice', question: 'On the guitar, one half step equals _____.', options: ['one string', 'one fret', 'two frets', 'one open string'], correctAnswer: 1, explanation: 'Moving up or down one fret changes the pitch by one half step. So the chromatic scale (all 12 notes in order) is simply: play every fret in order on any string. This is the foundation for understanding sharps, flats, and every scale.' },
      { type: 'multiple_choice', question: 'Which pair of natural notes has NO note between them (in basic theory)?', options: ['A and B', 'B and C', 'G and A', 'F and G'], correctAnswer: 1, explanation: 'B and C are only one half step apart (like E and F). So there is no B# or Cb in the basic chromatic scale—we go straight from B to C. Same for E to F. Between all other consecutive letters (A–A#–B, C–C#–D, etc.) there is one in-between note.' },
      { type: 'multiple_choice', question: 'What is the same pitch as C#?', options: ['B', 'Db', 'D', 'Cb'], correctAnswer: 1, explanation: 'C# (C sharp) is one half step above C. Db (D flat) is one half step below D. So C# and Db are the same note on the guitar—same fret, same sound. Two names for one pitch is called "enharmonic." You will see both used depending on the key or context.' },
      { type: 'fill_blank', sentence: 'The full set of 12 notes in order (A, A#, B, C, C#, D, D#, E, F, F#, G, G#, then A again) is called the _____ scale.', options: ['chromatic', 'major', 'minor', 'pentatonic'], correctAnswer: 0, explanation: 'The chromatic scale is all 12 notes in order, each one half step apart. On the guitar you play it by moving up one fret at a time. Every other scale and chord in Western music is built by choosing certain notes from these 12. Sharps and flats are the names we use for the in-between notes, so understanding them is the bridge from the seven natural notes to the full chromatic scale.' },
      { type: 'multiple_choice', question: 'Why do we need two names for the same note (e.g. A# and Bb)?', options: ['We do not; they are different notes.', 'In different keys or contexts, one spelling makes the notation clearer (e.g. each letter used once per scale step).', 'A# is for guitar, Bb for piano.', 'It is random.'], correctAnswer: 1, explanation: 'A# and Bb are the same pitch (enharmonic). In the key of A we might write A# (going up from A); in the key of Bb we write Bb (going down from B). So the name depends on context. On the guitar you play the same fret either way—understanding both names takes you from zero to reading any key.' },
      { type: 'fill_blank', sentence: 'Between B and C, and between E and F, there is _____ half step—no sharp or flat in between in basic theory.', options: ['one', 'two', 'zero', 'three'], correctAnswer: 0, explanation: 'B to C and E to F are already one half step apart (one fret on the guitar). So we do not usually have B# or Cb, or E# or Fb, in the basic chromatic scale—we go straight from B to C and E to F. Every other pair of natural notes (e.g. A to B, C to D) has a note in between (A#, C#, etc.).' }
    ]
  },
  'The 12 Notes in Music': {
    title: 'The 12 Notes in Music',
    items: [
      { type: 'fill_blank', sentence: 'In Western music there are _____ different notes before the pattern repeats (same note, higher or lower).', options: ['12', '7', '5', '8'], correctAnswer: 0, explanation: 'We have 12 distinct pitches: A, A#/Bb, B, C, C#/Db, D, D#/Eb, E, F, F#/Gb, G, G#/Ab, then the next A (an octave higher). Every chord, scale, and melody uses only these 12 notes in different combinations. Learning them is the foundation for everything that follows.' },
      { type: 'multiple_choice', question: 'After the 12 notes, the next note has the same letter name as the first because _____.', options: ['it is a mistake', 'the pattern repeats at a higher or lower octave', 'there are only 7 notes', 'sharps and flats do not count'], correctAnswer: 1, explanation: 'The 13th note is the same as the 1st but one "octave" higher (or lower). So we still only have 12 different note names; they repeat in every octave. This is why the fretboard makes sense: fret 12 is the same note as the open string, one octave higher.' },
      { type: 'multiple_choice', question: 'Why do we write some notes as A# and others as Bb?', options: ['They are different notes.', 'They are the same pitch; the name depends on key and context.', 'A# is louder.', 'Bb is for bass only.'], correctAnswer: 1, explanation: 'A# and Bb are the same pitch (enharmonic). We use one name or the other depending on the key and spelling of the scale so that notation stays clear. On the guitar you play the same fret either way.' },
      { type: 'fill_blank', sentence: 'Every melody, chord, and scale in Western music uses only these _____ notes (in different orders and combinations).', options: ['12', '7', '5', '26'], correctAnswer: 0, explanation: 'No matter how complex a piece gets, it is still built from the same 12 pitches repeating in different octaves. So learning the 12 notes and their names (including sharps/flats) is the final step from "letters" to "all the notes that exist" in our system.' },
      { type: 'multiple_choice', question: 'What is an "octave"?', options: ['Eight notes', 'The same note at a higher or lower register—the 13th note in the chromatic order is the octave of the 1st', 'A chord with 8 notes', 'A scale'], correctAnswer: 1, explanation: 'When we go through all 12 notes and land on the same letter again (e.g. A to A), we have moved one octave. The higher A vibrates exactly twice as fast as the lower A (for a 2:1 ratio). So "octave" means "same note name, double (or half) the frequency." Fret 12 on any string is one octave above the open string.' }
    ]
  },
  'Notes on the Guitar': {
    title: 'Notes on the Guitar',
    items: [
      { type: 'fill_blank', sentence: 'Each fret raises the pitch by one _____ step.', options: ['half', 'whole', 'octave', 'tone'], correctAnswer: 0, explanation: 'Moving up one fret = one half step. So on any string you get all 12 notes in order (the chromatic scale) by playing fret 0, 1, 2, 3, … up to 12, where you get the same note as the open string one octave higher.' },
      { type: 'multiple_choice', question: 'On the low E string, open is E. What note is at fret 12?', options: ['F', 'E one octave higher', 'G', 'A'], correctAnswer: 1, explanation: 'Fret 12 is exactly half the string length, so the note is the same as the open string (E) but one octave higher. This pattern holds for every string: the 12th fret is always the same note as the open string, one octave up.' },
      { type: 'fill_blank', sentence: 'On the low E string, the notes in order are E, F, F#, G, G#, A, and so on, because each fret is one _____ step.', options: ['half', 'whole', 'octave', 'scale'], correctAnswer: 0, explanation: 'The chromatic scale on one string is just "one fret = one half step." So you can name every fret: open E, 1=F, 2=F#, 3=G, 4=G#, 5=A, etc. This is how you connect the musical alphabet and sharps/flats to the actual guitar.' },
      { type: 'multiple_choice', question: 'Why is it useful to know the notes on at least the low E and A strings?', options: ['Only for reading sheet music.', 'Those strings are the roots for most chord shapes and barre chords, so you can find any chord up the neck.', 'They are the thickest.', 'It is not useful.'], correctAnswer: 1, explanation: 'Barre chords and many moveable shapes use the low E or A string as the "root" (the note that names the chord). If you know the notes on those strings (E, F, F#, G, … on the 6th; A, A#, B, C, … on the 5th), you can place the same shape at the right fret to get any chord. So note names on the neck are the map from zero to playing in every key.' },
      { type: 'fill_blank', sentence: 'The same note (e.g. G) appears in several places on the fretboard—on different _____ and frets.', options: ['strings', 'guitars', 'picks', 'hands'], correctAnswer: 0, explanation: 'Because each string has the full chromatic scale (all 12 notes) along its frets, the same pitch can be played on more than one string. For example, G can be played on the 6th string at fret 3, the 5th string at fret 10, the 1st string at fret 3, and so on. That gives you options for fingering and tone.' }
    ]
  },
  'What Is Rhythm?': {
    title: 'What Is Rhythm?',
    items: [
      { type: 'fill_blank', sentence: 'Rhythm is the _____ of sounds (and silences) in time.', options: ['pattern', 'volume', 'pitch', 'speed'], correctAnswer: 0, explanation: 'Rhythm is when notes happen and how long they last. It is what makes you tap your foot or nod your head. Without rhythm, notes are just a list; with it, they become music. Every strum pattern, drum part, and bass line is rhythm.' },
      { type: 'multiple_choice', question: 'What is the steady, repeating pulse of music called?', options: ['Melody', 'Beat', 'Harmony', 'Dynamics'], correctAnswer: 1, explanation: 'The beat is the steady pulse you feel (like a heartbeat). We count beats in groups (often 4: 1-2-3-4). Tempo is how fast the beat goes (e.g. 120 BPM = 120 beats per minute). Rhythm is how your notes line up with that beat.' },
      { type: 'fill_blank', sentence: '_____ is how fast the beat goes (e.g. 120 BPM = 120 beats per minute).', options: ['Tempo', 'Pitch', 'Volume', 'Dynamics'], correctAnswer: 0, explanation: 'Tempo is the speed of the beat. Slow tempo = fewer beats per minute (e.g. 60 BPM); fast tempo = more (e.g. 140 BPM). So rhythm tells you when to play, and tempo tells you how fast the "when" is happening. Both are essential from zero to playing any song.' },
      { type: 'multiple_choice', question: 'What is a "strum pattern"?', options: ['The chords in a song', 'A pattern of when you strum down or up and when you pause, creating rhythm', 'The tempo', 'The key of the song'], correctAnswer: 1, explanation: 'A strum pattern is the rhythm of your strumming hand: down, up, down-down-up, etc. It fits over the beat (e.g. 1-2-3-4) and gives the song its groove. So rhythm is not just the beat—it is how you place your strums and notes on that beat.' }
    ]
  },
  'What Is a Scale?': {
    title: 'What Is a Scale?',
    items: [
      { type: 'fill_blank', sentence: 'A scale is a _____ of notes chosen from the 12, played in order, that define a key or mood.', options: ['collection', 'single', 'pair', 'chord'], correctAnswer: 0, explanation: 'From the 12 notes we choose a subset and put them in order: that is a scale. Melodies and solos usually use scale notes; chords are built from scale notes. So scales are the "palette" for a key—they take you from zero (12 random notes) to a clear, usable set (e.g. C major scale).' },
      { type: 'multiple_choice', question: 'How many different notes are in a major scale (before repeating the root an octave higher)?', options: ['5', '6', '7', '12'], correctAnswer: 2, explanation: 'A major scale has 7 notes (e.g. C D E F G A B, then C again). We call that "Do Re Mi Fa Sol La Ti Do." The 8th note is the same as the 1st, one octave higher. Every major scale follows the same pattern of half and whole steps.' },
      { type: 'fill_blank', sentence: 'Melodies and solos are usually made from notes in the song\'s _____ (scale), so they sound "right" with the chords.', options: ['scale', 'chord', 'tempo', 'beat'], correctAnswer: 0, explanation: 'When a song is "in the key of G," the melody and solo typically use notes from the G major scale. That is why scales matter: they tell you which notes will fit over the chords. From zero to improvising, the scale is your roadmap.' },
      { type: 'multiple_choice', question: 'What is the "root" of a scale?', options: ['The lowest note', 'The note the scale is named after and that it starts and often ends on (e.g. C in C major)', 'The loudest note', 'The 5th note'], correctAnswer: 1, explanation: 'The root (or "tonic") is the note that names the scale and that feels like "home." In C major, C is the root. The scale starts and often ends on the root, and chords in the key often resolve to the chord built on the root. So the root is the center of the key.' }
    ]
  },
  'Major vs Minor': {
    title: 'Major vs Minor',
    items: [
      { type: 'fill_blank', sentence: 'Major chords and keys typically sound _____.', options: ['bright or happy', 'sad', 'dark', 'tense'], correctAnswer: 0, explanation: 'Major has a bright, stable, often "happy" quality. Most pop and rock songs use a mix of major and minor; the major chords often mark the uplifting moments.' },
      { type: 'fill_blank', sentence: 'Minor chords and keys typically sound _____.', options: ['darker or sadder', 'happy', 'bright', 'cheerful'], correctAnswer: 0, explanation: 'Minor has a darker, more melancholic or serious quality. The difference from major comes from one note: the "third" of the chord is one half step lower in minor.' },
      { type: 'multiple_choice', question: 'What actually differs between a major chord and a minor chord?', options: ['The third interval (one half step lower in minor)', 'The root note', 'The fifth', 'The number of notes'], correctAnswer: 0, explanation: 'Both have a root and a fifth; the "third" is what changes. In major the third is 4 half steps above the root; in minor it is 3 half steps. That one half step is why minor sounds sadder.' },
      { type: 'multiple_choice', question: 'In chord symbols, how do we usually indicate minor?', options: ['Lowercase "m" or "min" or a minus sign (e.g. Am, Amin, A-)', 'Capital M', 'The number 3', 'We do not.'], correctAnswer: 0, explanation: 'A chord with no letter after the root is usually major (e.g. C = C major). For minor we add "m" or "min" or "-": Am, Amin, A- all mean A minor.' },
      { type: 'fill_blank', sentence: 'The "third" in a chord is the note that decides if the chord sounds major or _____ .', options: ['minor', 'diminished', 'augmented', 'seventh'], correctAnswer: 0, explanation: 'Basic chords are built from the root, third, and fifth. The third is either "major" (4 half steps above the root) or "minor" (3 half steps). So the third defines the chord\'s major vs. minor quality.' }
    ]
  },
  'Root, Third, Fifth': {
    title: 'Root, Third, Fifth',
    items: [
      { type: 'multiple_choice', question: 'Build a C major chord from its components. Which note is the root?', options: ['C', 'E', 'G', 'B'], correctAnswer: 0, explanation: 'In C major, C is the root—the note the chord is named after. The triad is root (C), major third (E), fifth (G).' },
      { type: 'multiple_choice', question: 'In a major triad, how many half steps are there from the root to the major third?', options: ['4', '3', '5', '2'], correctAnswer: 0, explanation: 'The major third is 4 half steps above the root. The fifth is 7 half steps above the root. So every basic major chord has this structure.' },
      { type: 'multiple_choice', question: 'In an A minor chord (A, C, E), which note is the fifth?', options: ['E', 'A', 'C', 'G'], correctAnswer: 0, explanation: 'A minor = root A, minor third C, fifth E. The fifth is the same in both major and minor triads built on the same root.' }
    ]
  },
  'Building from the Root': {
    title: 'Building from the Root',
    items: [
      { type: 'multiple_choice', question: 'To build G major from its root, which note is the major third?', options: ['B', 'G', 'D', 'F#'], correctAnswer: 0, explanation: 'G major = root G, major third B (4 half steps above G), fifth D.' },
      { type: 'multiple_choice', question: 'To build D minor from its root, which three notes form the chord?', options: ['D, F, A', 'D, F#, A', 'D, G, A', 'D, E, A'], correctAnswer: 0, explanation: 'D minor = root D, minor third F (3 half steps above D), fifth A. The minor third is one half step lower than F# in D major.' },
      { type: 'fill_blank', sentence: 'The formula for any major chord is: root + major third (_____ half steps up) + fifth (7 half steps up).', options: ['4', '3', '5', '2'], correctAnswer: 0, explanation: 'Major third = 4 half steps above the root; fifth = 7 half steps above the root. From the root you count half steps to build the chord.' }
    ]
  },
  'Chord Roots and Half Steps': {
    title: 'Chord Roots and Half Steps',
    items: [
      { type: 'multiple_choice', question: 'Which note is the root of an Em chord?', options: ['E', 'G', 'B', 'A'], correctAnswer: 0, explanation: 'The root is the note the chord is named after. Em = E minor, so the root is E. Em is built from E (root), G (minor third), B (fifth).' },
      { type: 'multiple_choice', question: 'On the guitar, one fret equals how many half steps?', options: ['One', 'Two', 'Zero', 'Three'], correctAnswer: 0, explanation: 'One fret = one half step. So you can find the same note on different strings by counting frets and using the note names on the E and A strings.' },
      { type: 'multiple_choice', question: 'The root of an open C major chord is C. Where does that root note appear in the C chord shape?', options: ['On string 5 (A string) at fret 3', 'On string 1', 'On string 6', 'Only on string 2'], correctAnswer: 0, explanation: 'In the open C shape, the lowest note is C on the A string at fret 3—that is the root. Identifying roots helps you see how chord shapes relate to the fretboard.' }
    ]
  },
  'Note Names on E and A': {
    title: 'Note Names on E and A',
    items: [
      { type: 'multiple_choice', question: 'On the low E string, what note is at fret 3?', options: ['G', 'F', 'A', 'F#'], correctAnswer: 0, explanation: 'Low E string: open E, 1=F, 2=F#, 3=G. So fret 3 is G. These are the roots for E-shaped barre chords.' },
      { type: 'multiple_choice', question: 'On the A string, what note is at fret 2?', options: ['B', 'A#', 'C', 'C#'], correctAnswer: 0, explanation: 'A string: open A, 1=A#, 2=B. So fret 2 is B. The A string gives you the roots for A-shaped barre chords.' },
      { type: 'fill_blank', sentence: 'Knowing the notes on the E and A strings helps you find the _____ of barre chords and moveable shapes.', options: ['root', 'fifth', 'third', 'octave'], correctAnswer: 0, explanation: 'Barre chords use the low E or A string as the root. If you know the notes on those strings, you can name and place any barre chord.' }
    ]
  },
  'What Is TAB?': {
    title: 'What Is TAB?',
    items: [
      {
        type: 'multiple_choice',
        question: 'In standard guitar TAB, the bottom line of the staff usually represents:',
        options: ['The thinnest string (high E)', 'The thickest string (low E)', 'The capo only', 'Pick direction'],
        correctAnswer: 1,
        explanation:
          'Six lines = six strings: top line = thin high E (string 1); bottom line = thick low E (string 6). That vertical order is flipped compared to glancing down at the strings in your lap.',
      },
      {
        type: 'multiple_choice',
        question:
          'Compared to glancing down at your guitar in playing position, standard TAB lines are arranged so that:',
        options: [
          'The thinnest (highest-pitch) string is on the top line and the thickest (lowest-pitch) string is on the bottom line—so the page is flipped versus the up-down you see in your lap.',
          'The string closest to your face always appears on the top line of TAB.',
          'TAB lines are not tied to specific strings.',
          'Only the middle two strings appear in TAB.',
        ],
        correctAnswer: 0,
        explanation:
          'TAB reads like a front-facing diagram: high E up top, low E on the bottom. That is different from the vertical stack you see when you look down at the neck.',
      },
      { type: 'fill_blank', sentence: 'A _____ on a TAB line tells you which fret to press on that string.', options: ['number', 'letter', 'dot', 'star'], correctAnswer: 0, explanation: '0 = open string; other numbers = fret to press.' },
      {
        type: 'multiple_choice',
        question: 'The top line of standard TAB corresponds to which string?',
        options: ['String 1 (thinnest, high E)', 'String 6 (thickest, low E)', 'Only the D string', 'Muted strings only'],
        correctAnswer: 0,
        explanation: 'Line 1 from the top = string 1, the high E.',
      },
      {
        type: 'multiple_choice',
        question: 'TAB is especially useful because it shows:',
        options: ['Only tempo', 'Exactly where to play on the neck (string + fret)', 'Only chord symbols with no strings', 'Standard drum notation only'],
        correctAnswer: 1,
        explanation: 'Tablature maps directly to strings and frets.',
      },
      {
        type: 'multiple_choice',
        question: 'In TAB, a column of numbers stacked on several lines at once usually means:',
        options: ['Ignore those strings', 'Play those strings at those frets together (often a chord)', 'Play from bottom to top only', 'The song is in drop tuning'],
        correctAnswer: 1,
        explanation: 'Vertical alignment = simultaneous notes—often a chord shape.',
      },
      {
        type: 'multiple_choice',
        question: 'The digit 0 on a TAB line means:',
        options: ['Mute that string', 'Play that string open (no fret pressed)', 'Rest for a beat', 'Use harmonics only'],
        correctAnswer: 1,
        explanation: 'Zero marks the open string.',
      },
      {
        type: 'fill_blank',
        sentence: 'TAB is a type of _____ that uses lines for strings and digits for frets.',
        options: ['notation', 'tuning chart', 'pick gauge', 'strap length'],
        correctAnswer: 0,
        explanation: 'Tablature is a notation system for fretted instruments.',
      },
      {
        type: 'multiple_choice',
        question: 'Why is TAB so common for guitar online?',
        options: [
          'It replaces learning chords',
          'It shows finger placement without needing to read standard notation first',
          'It only works for bass',
          'It hides which string to use',
        ],
        correctAnswer: 1,
        explanation: 'You can follow charts quickly once you know how the lines map to strings.',
      },
      {
        type: 'multiple_choice',
        question: 'Standard TAB assumes:',
        options: [
          'A four-string instrument',
          'Six strings in standard tuning unless the chart says otherwise',
          'No numbers are allowed',
          'Only downstrokes',
        ],
        correctAnswer: 1,
        explanation: 'Most guitar TAB is written for six strings in E-A-D-G-B-E unless noted.',
      },
    ]
  },
  'Reading Fret Numbers': {
    title: 'Reading Fret Numbers',
    items: [
      { type: 'fill_blank', sentence: 'In TAB, _____ means play the string open (no fret pressed).', options: ['0', '1', 'x', '12'], correctAnswer: 0, explanation: 'Zero is the open string; other numbers are frets.' },
      { type: 'multiple_choice', question: 'Numbers stacked in a column across lines mean:', options: ['Ignore those strings', 'Play those strings at those frets at the same time (a chord)', 'Only pick the top line', 'Rest for a measure'], correctAnswer: 1, explanation: 'Vertical alignment = simultaneous notes.' },
      { type: 'multiple_choice', question: 'TAB fret numbers refer to:', options: ['Finger numbers only', 'Fret positions on the named string', 'Volume levels', 'Pick thickness'], correctAnswer: 1, explanation: 'Each line is a string; the digit is the fret.' }
    ]
  },
  'TAB Symbols': {
    title: 'TAB Symbols',
    items: [
      { type: 'multiple_choice', question: 'In TAB, "h" commonly means:', options: ['Harmonics only', 'Hammer-on', 'Hold forever', 'High capo'], correctAnswer: 1, explanation: 'h connects two frets on one string without a second pick.' },
      { type: 'multiple_choice', question: '"p" between two fret numbers usually means:', options: ['Pause', 'Pull-off', 'Palm mute', 'Piano'], correctAnswer: 1, explanation: 'Pull-off snaps from a higher fretted note to a lower one.' },
      { type: 'fill_blank', sentence: 'Symbols like / or \\ often indicate a _____ between frets.', options: ['slide', 'rest', 'bend', 'tap'], correctAnswer: 0, explanation: 'Slides connect pitches smoothly along the string.' },
      { type: 'multiple_choice', question: '"b" in TAB often marks:', options: ['A barre chord chart', 'A bend', 'A bass clef', 'A break'], correctAnswer: 1, explanation: 'Bends raise pitch after the note is struck.' }
    ]
  },
  'Reading Real TAB': {
    title: 'Reading Real TAB',
    items: [
      { type: 'multiple_choice', question: 'When reading a full TAB, you combine:', options: ['Only down strums', 'String lines, fret numbers, rhythm (if shown), and technique symbols', 'Capo position only', 'Pick brand'], correctAnswer: 1, explanation: 'Real charts mix single notes, chords, and articulations.' },
      { type: 'fill_blank', sentence: 'TAB tells you _____ to play; rhythm notation or listening tells you when.', options: ['where', 'why', 'who', 'if'], correctAnswer: 0, explanation: 'TAB is pitch/position-first; timing may come from standard notation, chord charts, or your ear.' },
      { type: 'multiple_choice', question: 'Why learn TAB early in theory?', options: ['To avoid ever learning chords', 'To unlock thousands of song charts online', 'TAB replaces tuning', 'TAB is only for bass'], correctAnswer: 1, explanation: 'It is the most common guitar notation on the web.' }
    ]
  },
  'Beats and Tempo': {
    title: 'Beats and Tempo',
    items: [
      { type: 'fill_blank', sentence: 'Tempo is how _____ the beat goes, often measured in BPM.', options: ['fast', 'loud', 'high', 'sharp'], correctAnswer: 0, explanation: 'BPM = beats per minute; higher BPM = faster pulse.' },
      { type: 'multiple_choice', question: 'The beat is best described as:', options: ['A chord symbol', 'The steady pulse you feel (1-2-3-4…)', 'Only the melody', 'The guitar brand'], correctAnswer: 1, explanation: 'Everything in rhythm aligns to the beat.' },
      { type: 'multiple_choice', question: '60 BPM means:', options: ['Sixty bars per minute', 'About one beat per second', 'Sixty strings', 'Sixty frets'], correctAnswer: 1, explanation: 'Each beat lasts one second on average at 60 BPM.' }
    ]
  },
  'Counting 4/4 Time': {
    title: 'Counting 4/4 Time',
    items: [
      { type: 'multiple_choice', question: 'In 4/4 time, each measure has:', options: ['Three beats', 'Four beats', 'Five beats', 'No beats'], correctAnswer: 1, explanation: 'Count 1-2-3-4, repeat; that is one bar in four-four.' },
      { type: 'fill_blank', sentence: 'Beat _____ is often the strongest downbeat in the bar.', options: ['1', '4', 'and', '0'], correctAnswer: 0, explanation: 'Downbeats anchor chord changes and strums.' },
      { type: 'multiple_choice', question: 'Why count out loud with music?', options: ['It is only for drummers', 'It locks your playing to the measure and helps you hear form', 'It replaces practice', 'It changes the key'], correctAnswer: 1, explanation: 'Counting builds internal time.' }
    ]
  },
  'Note Lengths': {
    title: 'Note Lengths',
    items: [
      { type: 'multiple_choice', question: 'In 4/4, a whole note lasts:', options: ['One beat', 'The whole measure (four beats)', 'Half a beat', 'Twelve beats'], correctAnswer: 1, explanation: 'Whole note = four quarter beats in 4/4.' },
      { type: 'multiple_choice', question: 'A quarter note in 4/4 equals:', options: ['Four beats', 'One beat', 'Half the whole piece', 'Zero beats'], correctAnswer: 1, explanation: 'Quarter note gets one beat in 4/4.' },
      { type: 'fill_blank', sentence: 'Two eighth notes fit in _____ quarter-note beat.', options: ['one', 'four', 'zero', 'eight'], correctAnswer: 0, explanation: 'Each eighth is half a beat in 4/4.' }
    ]
  },
  'What Makes a Chord?': {
    title: 'What Makes a Chord?',
    items: [
      { type: 'multiple_choice', question: 'A basic chord in Western music usually needs at least:', options: ['One note', 'Two notes', 'Three different notes', 'Twelve notes'], correctAnswer: 2, explanation: 'Three notes (root, third, fifth) form a triad—the standard chord.' },
      { type: 'fill_blank', sentence: 'The note that names the chord is the _____.', options: ['root', 'fifth', 'octave', 'tempo'], correctAnswer: 0, explanation: 'C major is built from C as the foundation.' },
      { type: 'multiple_choice', question: 'Root, third, and fifth refer to:', options: ['Pick directions', 'Scale steps above the root', 'String numbers only', 'Tuning pegs'], correctAnswer: 1, explanation: 'They are intervals from the chord root within the scale.' }
    ]
  },
  'Reading Chord Names': {
    title: 'Reading Chord Names',
    items: [
      { type: 'multiple_choice', question: 'In "Am", the letter A is the:', options: ['Third', 'Root', 'Seventh', 'Tempo'], correctAnswer: 1, explanation: 'The letter names the root note.' },
      { type: 'multiple_choice', question: '"C7" typically indicates:', options: ['C major with no extra notes', 'A C chord with a dominant seventh added', 'Seven C chords at once', 'Capo 7'], correctAnswer: 1, explanation: '7 adds a specific seventh interval—often bluesy or tense.' },
      { type: 'fill_blank', sentence: '_____ after the root letter means major seventh (e.g. Cmaj7).', options: ['maj7', 'm', 'dim', 'sus'], correctAnswer: 0, explanation: 'maj7 is different from plain 7 (dominant).' }
    ]
  },
  'Common Chord Progressions': {
    title: 'Common Chord Progressions',
    items: [
      { type: 'multiple_choice', question: 'A chord progression is:', options: ['A single chord held forever', 'The sequence of chords in a song', 'Only strum direction', 'The guitar strap length'], correctAnswer: 1, explanation: 'Songs move through chords in order; that order is the progression.' },
      { type: 'multiple_choice', question: 'Roman numerals (I, IV, V, vi) help because:', options: ['They are decorative', 'The same pattern works in any key once you know the scale', 'They replace chord shapes', 'They mean pick speed'], correctAnswer: 1, explanation: 'Numbers describe function, not just one key.' },
      { type: 'fill_blank', sentence: 'I–V–vi–IV is one of the most common _____ in pop music.', options: ['patterns', 'tunings', 'picks', 'straps'], correctAnswer: 0, explanation: 'It appears in countless hits in different keys.' }
    ]
  },
  'The Major Scale': {
    title: 'The Major Scale',
    items: [
      { type: 'fill_blank', sentence: 'The major scale has _____ different notes before repeating the root at the octave.', options: ['7', '5', '12', '3'], correctAnswer: 0, explanation: 'Do Re Mi Fa Sol La Ti (then Do again).' },
      { type: 'multiple_choice', question: 'The major scale pattern of whole and half steps is the same:', options: ['Only in C', 'Starting from any root note', 'Only on bass', 'Only in TAB'], correctAnswer: 1, explanation: 'Transposing keeps the W-W-H-W-W-W-H pattern.' },
      { type: 'multiple_choice', question: 'Major scales are the basis for:', options: ['Only drums', 'Major chords and most melodies in major keys', 'Tuning pegs', 'Capo placement only'], correctAnswer: 1, explanation: 'Chords and melodies draw from scale notes.' }
    ]
  },
  'The Minor Scale': {
    title: 'The Minor Scale',
    items: [
      { type: 'multiple_choice', question: 'Natural minor differs from major mainly by:', options: ['Number of strings', 'Its pattern of whole and half steps (darker third and sixth, etc.)', 'Using only open strings', 'Having no root'], correctAnswer: 1, explanation: 'Different interval pattern gives the minor sound.' },
      { type: 'multiple_choice', question: 'Relative minor shares:', options: ['No notes with its relative major', 'The same seven notes as its relative major, different tonic', 'Only the pick', 'Only power chords'], correctAnswer: 1, explanation: 'C major and A minor use the same notes; the center note changes.' },
      { type: 'fill_blank', sentence: 'In a major key, the relative minor starts on the _____ scale degree.', options: ['6th', '1st', '4th', '7th'], correctAnswer: 0, explanation: 'Example: A minor is relative to C major.' }
    ]
  },
  'The Pentatonic Scale': {
    title: 'The Pentatonic Scale',
    items: [
      { type: 'fill_blank', sentence: 'Penta means _____, so the pentatonic scale has five notes per octave.', options: ['five', 'seven', 'twelve', 'two'], correctAnswer: 0, explanation: 'Five notes chosen from the major or minor scale.' },
      { type: 'multiple_choice', question: 'Minor pentatonic is widely used for:', options: ['Classical counterpoint only', 'Rock, blues, and country solos', 'Tuning', 'Reading bass clef'], correctAnswer: 1, explanation: 'It is forgiving and melodic on guitar.' },
      { type: 'multiple_choice', question: 'Why does pentatonic often "always work"?', options: ['It has no notes', 'Leaving out two scale degrees reduces clashes over many chords', 'It is only one string', 'It replaces chords'], correctAnswer: 1, explanation: 'Fewer notes = fewer wrong choices in many progressions.' }
    ]
  },
  'What Is a Key?': {
    title: 'What Is a Key?',
    items: [
      { type: 'multiple_choice', question: 'The key of a song is roughly:', options: ['The pick thickness', 'The harmonic home—the scale and chord that feel resolved', 'The strap length', 'The number of frets'], correctAnswer: 1, explanation: 'The tonic chord feels like "home."' },
      { type: 'fill_blank', sentence: 'Most notes and chords in a song come from the _____ of the key.', options: ['scale', 'bridge', 'nut', 'pick'], correctAnswer: 0, explanation: 'The key defines which pitches fit best.' },
      { type: 'multiple_choice', question: 'Knowing the key helps you:', options: ['Avoid ever using a capo', 'Choose scales, chords, and capo positions that fit the song', 'Remove strings', 'Mute everything'], correctAnswer: 1, explanation: 'It is a map for improvisation and accompaniment.' }
    ]
  },
  'Finding the Key': {
    title: 'Finding the Key',
    items: [
      { type: 'multiple_choice', question: 'A simple ear strategy for key is to notice:', options: ['Only the fastest note', 'Which chord feels like "home" at cadences or section ends', 'The pick color', 'The lightest string'], correctAnswer: 1, explanation: 'Resolution points often reveal the tonic.' },
      { type: 'fill_blank', sentence: 'If G major feels like home, the key is likely G _____ .', options: ['major', 'minor', 'diminished', 'suspended'], correctAnswer: 0, explanation: 'Major vs minor still matters; listen for bright vs dark center.' },
      { type: 'multiple_choice', question: 'The root of the home chord often matches:', options: ['The key name', 'Only the thinnest string', 'The bridge pin', 'The pick angle'], correctAnswer: 0, explanation: 'Key of E centers on E (usually E major or E minor context).' }
    ]
  },
  'Chords in a Key': {
    title: 'Chords in a Key',
    items: [
      { type: 'multiple_choice', question: 'Diatonic chords are built from:', options: ['Random frets', 'Only the notes of the key scale', 'Drum beats', 'Open strings only'], correctAnswer: 1, explanation: 'They use only scale tones stacked in thirds.' },
      { type: 'multiple_choice', question: 'In C major, common diatonic chords include:', options: ['Only C', 'C, Dm, Em, F, G, Am, Bdim', 'Only power chords', 'No minor chords'], correctAnswer: 1, explanation: 'Each scale step gets a chord quality in the major key.' },
      { type: 'fill_blank', sentence: 'Songs in one key mostly use chords from that key\'s _____, which is why certain progressions sound "right."', options: ['family', 'case', 'pick', 'strap'], correctAnswer: 0, explanation: 'Shared scale keeps harmony coherent.' }
    ]
  },
  'Using a Capo to Change Keys': {
    title: 'Using a Capo to Change Keys',
    items: [
      { type: 'multiple_choice', question: 'A capo:', options: ['Cuts strings', 'Shortens all strings at once, raising pitch like a moveable nut', 'Replaces the bridge', 'Only works on bass'], correctAnswer: 1, explanation: 'It transposes open shapes without new fingerings.' },
      { type: 'fill_blank', sentence: 'Capo at fret 2 with a G shape sounds _____ higher than open G.', options: ['two half steps', 'one octave', 'zero', 'twelve half steps'], correctAnswer: 0, explanation: 'Each fret is a half step for every string.' },
      { type: 'multiple_choice', question: 'Capos are especially useful when:', options: ['You never want open chords', 'A singer needs a different key but you want easy shapes', 'You remove frets', 'You only play harmonics'], correctAnswer: 1, explanation: 'Same grips, new key center.' }
    ]
  },
  'Notes on String 6 (Low E)': {
    title: 'Notes on String 6 (Low E)',
    items: [
      { type: 'fill_blank', sentence: 'Open string 6 is _____.', options: ['E', 'A', 'D', 'G'], correctAnswer: 0, explanation: 'Standard tuning low E is the 6th string.' },
      { type: 'multiple_choice', question: 'Fret 5 on the low E string is:', options: ['F', 'A', 'G', 'B'], correctAnswer: 1, explanation: 'E F F# G G# A — fret 5 is A, matching the open A string pitch class.' },
      { type: 'multiple_choice', question: 'Why memorize string 6 notes?', options: ['They are unused', 'E-shape barre roots and bass lines use this string constantly', 'Only for violin', 'TAB never uses string 6'], correctAnswer: 1, explanation: 'The root on string 6 names many barre chords.' }
    ]
  },
  'Notes on String 5 (A)': {
    title: 'Notes on String 5 (A)',
    items: [
      { type: 'multiple_choice', question: 'Open string 5 is:', options: ['E', 'A', 'D', 'B'], correctAnswer: 1, explanation: 'Fifth string is A in standard tuning.' },
      { type: 'fill_blank', sentence: 'A-shaped barre chords use string _____ for the root.', options: ['5', '1', '3', '6'], correctAnswer: 0, explanation: 'The barre across five strings with root on A is a core shape.' },
      { type: 'multiple_choice', question: 'Knowing strings 5 and 6 together lets you:', options: ['Avoid all barres', 'Find roots for most common barre and power-chord shapes', 'Tune without a tuner', 'Remove the nut'], correctAnswer: 1, explanation: 'Two strings cover the majority of movable roots.' }
    ]
  },
  'The Octave Shapes': {
    title: 'The Octave Shapes',
    items: [
      { type: 'multiple_choice', question: 'Octave shapes help you:', options: ['Break strings', 'Find the same note name in different places on the neck', 'Only play open chords', 'Read drum tabs'], correctAnswer: 1, explanation: 'They reduce brute-force memorization of every fret.' },
      { type: 'multiple_choice', question: 'The same pitch on guitar can appear on:', options: ['Only one string', 'Multiple strings and frets', 'Only fret 0', 'Only the bridge'], correctAnswer: 1, explanation: 'The layout is redundant by design.' },
      { type: 'fill_blank', sentence: 'Octave shapes connect the _____ you already know on strings 6 and 5 to the rest of the neck.', options: ['roots', 'picks', 'straps', 'nuts'], correctAnswer: 0, explanation: 'You map familiar roots through the pattern library.' }
    ]
  },
  'Finding Notes Quickly': {
    title: 'Finding Notes Quickly',
    items: [
      { type: 'multiple_choice', question: 'Fret 12 on any string is:', options: ['Always silent', 'The same note as the open string, one octave higher', 'Always F', 'The capo'], correctAnswer: 1, explanation: 'Half string length = double frequency = octave.' },
      { type: 'multiple_choice', question: 'On most strings, fret 5 matches:', options: ['The next thinner string open (except G to B)', 'The bridge', 'Only harmonics', 'No pattern'], correctAnswer: 0, explanation: 'Landmarks like 5 and 12 speed navigation.' },
      { type: 'fill_blank', sentence: 'Landmarks turn the fretboard into a _____ you can use in real time.', options: ['map', 'pick', 'song', 'loop'], correctAnswer: 0, explanation: 'Reference points beat memorizing every dot blindly.' }
    ]
  },
  'Intervals: The Building Blocks': {
    title: 'Intervals: The Building Blocks',
    items: [
      { type: 'fill_blank', sentence: 'On guitar, one fret equals one _____ step.', options: ['half', 'whole', 'double', 'quarter'], correctAnswer: 0, explanation: 'Half step = semitone = one fret.' },
      { type: 'multiple_choice', question: 'A major third above the root is how many half steps?', options: ['3', '4', '7', '12'], correctAnswer: 1, explanation: 'Major third = 4 half steps; perfect fifth = 7.' },
      { type: 'multiple_choice', question: 'Intervals matter because:', options: ['They are only for piano', 'They explain how chords and scales are built from any root', 'They replace TAB', 'They tune the guitar'], correctAnswer: 1, explanation: 'Stack intervals → chords; walk them → scales.' }
    ]
  },
  'Building Major Chords': {
    title: 'Building Major Chords',
    items: [
      { type: 'multiple_choice', question: 'A major triad is:', options: ['Root + minor third + fifth', 'Root + major third + perfect fifth', 'Root only', 'Root + two random notes'], correctAnswer: 1, explanation: 'Major third = 4 half steps up; fifth = 7 half steps up from root.' },
      { type: 'fill_blank', sentence: 'C major uses the notes C, E, and _____.', options: ['G', 'F', 'A', 'B'], correctAnswer: 0, explanation: 'Root C, major third E, fifth G.' },
      { type: 'multiple_choice', question: 'On guitar, a chord shape may double notes, but the harmony is still defined by:', options: ['Pick color', 'The unique triad tones present', 'Strap length', 'How many picks you own'], correctAnswer: 1, explanation: 'Doubling reinforces sound; the chord quality comes from R-3-5.' }
    ]
  },
  'Building Minor Chords': {
    title: 'Building Minor Chords',
    items: [
      { type: 'multiple_choice', question: 'Minor triad vs major on the same root:', options: ['Same third', 'Minor third is one half step lower than major third', 'No fifth', 'Different instrument'], correctAnswer: 1, explanation: 'Lower the third by one semitone: major → minor.' },
      { type: 'fill_blank', sentence: 'A minor = A, _____, E.', options: ['C', 'C#', 'D', 'F'], correctAnswer: 0, explanation: 'Minor third C; fifth E.' },
      { type: 'multiple_choice', question: 'The fifth in a minor triad compared to major on the same root:', options: ['Always tritone', 'Still a perfect fifth (7 half steps from root)', 'Missing', 'Octave only'], correctAnswer: 1, explanation: 'Only the third quality changes in basic minor/major pairs.' }
    ]
  },
  'Seventh Chords': {
    title: 'Seventh Chords',
    items: [
      { type: 'multiple_choice', question: 'Dominant 7 (e.g. G7) adds:', options: ['Only the root again', 'A seventh interval that creates tension toward the tonic', 'A drum beat', 'Capo 7'], correctAnswer: 1, explanation: 'The b7 pulls toward resolution in major key harmony.' },
      { type: 'multiple_choice', question: 'Major 7 chords (e.g. Cmaj7) tend to sound:', options: ['Only dissonant', 'Smooth or jazzy compared to plain major', 'Like power chords', 'Muted'], correctAnswer: 1, explanation: 'Natural 7 on a major triad is a different color than dominant 7.' },
      { type: 'fill_blank', sentence: '_____7 as in "Cm7" means minor triad plus minor seventh.', options: ['m', 'maj', 'dim', 'sus'], correctAnswer: 0, explanation: 'Symbol m7 = minor seventh chord.' }
    ]
  },
  'Why Use Numbers?': {
    title: 'Why Use Numbers?',
    items: [
      { type: 'multiple_choice', question: 'The number system describes progressions:', options: ['Only in C major', 'In any key using scale degrees (1 = tonic chord)', 'Without any chords', 'Only for drums'], correctAnswer: 1, explanation: '1-5-6-4 is a pattern; letter names change with key.' },
      { type: 'fill_blank', sentence: 'Numbers help you transpose because the _____ stays the same while chord letters change.', options: ['pattern', 'guitar', 'pick', 'strap'], correctAnswer: 0, explanation: 'Functional relationships are portable.' },
      { type: 'multiple_choice', question: 'Nashville-style numbers are useful for:', options: ['Hiding the song', 'Quick communication and on-the-fly key changes with a band', 'Replacing practice', 'Reading bass TAB only'], correctAnswer: 1, explanation: 'Pros use numerals to move fast.' }
    ]
  },
  'The 7 Chords in a Key': {
    title: 'The 7 Chords in a Key',
    items: [
      { type: 'multiple_choice', question: 'In major, Roman I is usually:', options: ['Minor', 'Major', 'Diminished only', 'Suspended'], correctAnswer: 1, explanation: 'Tonic major chord in major key.' },
      { type: 'multiple_choice', question: 'Lowercase ii, iii, vi in a major key mean:', options: ['Major chords', 'Minor chords built on those degrees', 'Power chords only', 'Rests'], correctAnswer: 1, explanation: 'Case shows quality in Roman numeral analysis.' },
      { type: 'fill_blank', sentence: 'In C major, vi is typically _____ minor.', options: ['A', 'D', 'E', 'G'], correctAnswer: 0, explanation: 'Sixth degree of C major is A; chord is Am.' }
    ]
  },
  'Common Number Progressions': {
    title: 'Common Number Progressions',
    items: [
      { type: 'multiple_choice', question: 'I–V–vi–IV is:', options: ['Rare', 'One of the most common pop progressions', 'Only jazz', 'Only open strings'], correctAnswer: 1, explanation: 'Same numerals, many hit songs in different keys.' },
      { type: 'multiple_choice', question: 'ii–V–I is strongly associated with:', options: ['Only punk', 'Jazz and classical cadential resolution', 'Tuning', 'Palm muting'], correctAnswer: 1, explanation: 'Two chord leads to five chord leads to one.' },
      { type: 'fill_blank', sentence: 'Recognizing progressions by _____ trains your ear for any key.', options: ['numbers', 'picks', 'brands', 'straps'], correctAnswer: 0, explanation: 'You hear function, not just letter names.' }
    ]
  },
  'Transposing with Numbers': {
    title: 'Transposing with Numbers',
    items: [
      { type: 'multiple_choice', question: 'To transpose with numbers you:', options: ['Change the pattern for each key', 'Keep the numerals and map them to the new key roots', 'Remove the capo', 'Only play string 1'], correctAnswer: 1, explanation: '1-4-5 in G is G-C-D; in Eb it is Eb-Ab-Bb.' },
      { type: 'fill_blank', sentence: 'The numerals stay the same; only the _____ names change.', options: ['chord', 'pick', 'strap', 'fret wire'], correctAnswer: 0, explanation: 'That is the power of the system.' },
      { type: 'multiple_choice', question: 'Transposing is essential when:', options: ['Strings never change', 'A vocalist needs a different key or you join a jam in a new center', 'You only use a metronome', 'You read TAB only'], correctAnswer: 1, explanation: 'Flexibility is a professional skill.' }
    ]
  }
};

// =============================================================================
// FALLBACK - Generate interactive content for lessons without specific content
// =============================================================================

export function getContentByTitle(title: string): LessonContent | null {
  const t = title.trim();
  if (!t) return null;
  if (techniqueContent[t]) return techniqueContent[t];
  if (theoryContent[t]) return theoryContent[t];
  const lower = t.toLowerCase();
  for (const key of Object.keys(techniqueContent)) {
    if (key.toLowerCase() === lower) return techniqueContent[key];
  }
  for (const key of Object.keys(theoryContent)) {
    if (key.toLowerCase() === lower) return theoryContent[key];
  }
  return null;
}

/** No padding: quizzes use only topic-specific questions. */
export function ensureMinQuizItems(content: LessonContent): LessonContent {
  return content;
}

/** Truncate option text for display only if very long (avoid UI cut-off); keep explanations full. */
function optionText(text: string, maxLen: number = 280): string {
  const t = text.trim();
  if (t.length <= maxLen) return t.endsWith('.') || t.endsWith('?') || t.endsWith('!') ? t : t + '.';
  return t.slice(0, maxLen - 3).trim() + '…';
}

/** Topic phrase from lesson title for use in questions (e.g. "barre chords", "the major scale"). */
function topicFromTitle(title: string): string {
  const stop = ['the', 'your', 'and', 'with', 'for', 'from', 'how', 'what', 'when', 'where', 'why'];
  const words = title.split(/\s+/).filter(w => w.length > 1 && !stop.includes(w.toLowerCase()));
  if (words.length === 0) return 'this technique';
  if (words.length === 1) return words[0].toLowerCase();
  return words.slice(0, 2).join(' ').toLowerCase();
}

/** Fisher–Yates shuffle. Mutates array and returns it. */
function shuffleArray<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/** Shuffle options and update correctAnswer so the correct answer is in a random position. */
export function shuffleQuizItemOptions(item: QuizItem): QuizItem {
  if (item.type === 'multiple_choice') {
    const correct = item.options[item.correctAnswer];
    const opts = shuffleArray([...item.options]);
    const newIndex = opts.indexOf(correct);
    if (newIndex === -1) return item;
    return { ...item, options: opts, correctAnswer: newIndex };
  }
  if (item.type === 'fill_blank' || item.type === 'drag_blank') {
    const correct = item.options[item.correctAnswer];
    const opts = shuffleArray([...item.options]);
    const newIndex = opts.indexOf(correct);
    if (newIndex === -1) return item;
    return { ...item, options: opts, correctAnswer: newIndex };
  }
  return item;
}

function cloneQuizItem(item: QuizItem): QuizItem {
  return JSON.parse(JSON.stringify(item)) as QuizItem;
}

/** Technique/theory quiz length (one round; pool is enriched from the lesson text when needed). */
export const TECHNIQUE_THEORY_QUIZ_PRIMARY = 14;
export const TECHNIQUE_THEORY_QUIZ_REPETITION = 0;
export const TECHNIQUE_THEORY_QUIZ_TOTAL =
  TECHNIQUE_THEORY_QUIZ_PRIMARY + TECHNIQUE_THEORY_QUIZ_REPETITION;

/** Adds a drag_blank twin for every fill_blank so sessions can vary interaction without duplicating authored copy. */
export function expandQuizPoolWithDragVariants(items: QuizItem[]): QuizItem[] {
  const out: QuizItem[] = [];
  for (const item of items) {
    out.push(cloneQuizItem(item));
    if (item.type === 'fill_blank') {
      const fb = item as FillBlankItem;
      out.push({
        type: 'drag_blank',
        sentence: fb.sentence,
        options: [...fb.options],
        correctAnswer: fb.correctAnswer,
        explanation: fb.explanation,
      });
    }
  }
  return out;
}

/** Same conceptual question whether shown as fill_blank or drag_blank (avoid back-to-back duplicate). */
export function quizStemKey(it: QuizItem): string {
  if (it.type === 'multiple_choice') return `mc:${(it as MultipleChoiceItem).question}`;
  const s = it.type === 'fill_blank' ? (it as FillBlankItem).sentence : (it as DragBlankItem).sentence;
  return `s:${s}`;
}

/**
 * Dedupe by stem, then add lesson-derived questions until there are at least `minStems` unique stems
 * (uses the journey description via createFallbackContent).
 */
export function enrichLessonQuizBaseToMinStems(
  baseItems: QuizItem[],
  title: string,
  description: string,
  minStems: number,
): QuizItem[] {
  const seen = new Set<string>();
  const out: QuizItem[] = [];
  for (const it of baseItems) {
    const k = quizStemKey(it);
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(cloneQuizItem(it));
  }
  if (out.length >= minStems) return out;
  const extra = createFallbackContent(title, description).items;
  for (const it of extra) {
    if (out.length >= minStems) break;
    const k = quizStemKey(it);
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(cloneQuizItem(it));
  }
  return out;
}

/**
 * Build a 14-question session from an expanded pool, avoiding back-to-back same stem.
 * When the authored set is small, the pool is grown with questions tied to the lesson description.
 * Ensures a solid mix of drag_blank interactions (not only tap-to-choose fill_blank).
 */
export function buildTechniqueTheoryQuizSequence(
  baseItems: QuizItem[],
  lessonTitle?: string,
  lessonDescription?: string,
): QuizItem[] {
  if (!baseItems.length) return [];
  const title = (lessonTitle ?? '').trim() || 'Lesson';
  const desc =
    (lessonDescription ?? '').trim() || 'This topic covers essential guitar concepts.';
  const enriched = enrichLessonQuizBaseToMinStems(baseItems, title, desc, TECHNIQUE_THEORY_QUIZ_TOTAL);
  const pool = expandQuizPoolWithDragVariants(enriched.map(cloneQuizItem));
  const target = TECHNIQUE_THEORY_QUIZ_TOTAL;
  const stream: QuizItem[] = [];
  for (let r = 0; r < 12; r++) {
    stream.push(...shuffleArray(pool.map(cloneQuizItem)));
  }
  const out: QuizItem[] = [];
  for (const raw of stream) {
    if (out.length >= target) break;
    const stem = quizStemKey(raw);
    if (out.length > 0 && quizStemKey(out[out.length - 1]) === stem) continue;
    out.push(shuffleQuizItemOptions(cloneQuizItem(raw)));
  }
  let pad = 0;
  while (out.length < target) {
    out.push(shuffleQuizItemOptions(cloneQuizItem(pool[pad % pool.length])));
    pad++;
  }
  const trimmed = out.slice(0, target);
  const minDrag = Math.max(4, Math.round(target * 0.36));
  let dragCount = trimmed.filter((x) => x.type === 'drag_blank').length;
  const fillIdx = trimmed
    .map((x, i) => (x.type === 'fill_blank' ? i : -1))
    .filter((i) => i >= 0);
  shuffleArray(fillIdx);
  for (const i of fillIdx) {
    if (dragCount >= minDrag) break;
    const it = trimmed[i] as FillBlankItem;
    trimmed[i] = {
      type: 'drag_blank',
      sentence: it.sentence,
      options: [...it.options],
      correctAnswer: it.correctAnswer,
      explanation: it.explanation,
    };
    dragCount++;
  }
  return trimmed;
}

/** Build lesson-specific, in-depth quiz from description. Questions and wrong options are derived from the actual text; no generic one-size-fits-all shortcuts. */
export function createFallbackContent(title: string, description: string): LessonContent {
  const rawSentences = description.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 15);
  const sentences = rawSentences.map(s => optionText(s, 220));
  const topic = topicFromTitle(title);
  const fullExplanation = description.trim();
  const lowerDesc = description.toLowerCase();
  const items: QuizItem[] = [];

  // Build a pool of statements from the description (for use as correct and wrong options)
  const factPool = sentences.filter((s, i) => s.length >= 22 && sentences.indexOf(s) === i);
  const usedForCorrect = new Set<number>();

  // Helper: pick wrong options only from this lesson's description — no generic presets
  function wrongOptionsFor(correctOption: string, count: number): string[] {
    const wrong: string[] = [];
    const others = factPool.filter(f => f !== correctOption && !f.slice(0, 40).includes(correctOption.slice(0, 30)));
    for (let i = 0; i < others.length && wrong.length < count; i++) {
      const c = others[i];
      if (!wrong.includes(c) && c.length > 18) wrong.push(c);
    }
    // If we still need more, use shorter phrases from the description (split on commas or clauses)
    if (wrong.length < count) {
      const clauses = description.split(/[,;:]|\s+and\s+|\s+so\s+/).map(s => s.trim()).filter(s => s.length >= 20 && s.length <= 180);
      for (const cl of clauses) {
        const normalized = optionText(cl, 200);
        if (!wrong.includes(normalized) && normalized !== correctOption && wrong.length < count) wrong.push(normalized);
      }
    }
    while (wrong.length < count) {
      const fallback = `Not stated in this lesson.`;
      if (!wrong.includes(fallback)) wrong.push(fallback);
      else wrong.push(`This lesson does not say that.`);
      if (wrong.length >= count) break;
    }
    return wrong.slice(0, count);
  }

  // 1) Primary: one MC per meaningful sentence — each stem names the lesson title so quizzes feel specific.
  const safeTitle = title.trim() || 'this lesson';
  const questionStems = [
    `For "${safeTitle}", which statement matches what the lesson says?`,
    `In the lesson "${safeTitle}", which of these is accurate?`,
    `According to "${safeTitle}", which description fits the lesson?`,
    `Which line reflects what "${safeTitle}" teaches?`,
    `After "${safeTitle}", which of these would the lesson agree with?`,
    `Which option best summarizes a point from "${safeTitle}"?`,
    `Which claim aligns with "${safeTitle}"?`,
    `Which of these echoes "${safeTitle}"?`,
    `For "${safeTitle}", pick the statement the lesson supports.`,
    `Which answer fits the ideas in "${safeTitle}"?`,
  ];
  for (let i = 0; i < factPool.length && items.length < 10; i++) {
    const correct = factPool[i];
    if (usedForCorrect.has(i) || correct.length < 25) continue;
    const wrong = wrongOptionsFor(correct, 3);
    const options = [correct, ...wrong];
    const stem = questionStems[items.length % questionStems.length];
    items.push({ type: 'multiple_choice', question: stem, options, correctAnswer: 0, explanation: fullExplanation });
    usedForCorrect.add(i);
  }

  // 2) Concept questions only when the description explicitly uses that concept — phrased using lesson context
  if (items.length < 10 && lowerDesc.includes('barre') && (lowerDesc.includes('index') || lowerDesc.includes('across'))) {
    const opts = ['Index finger', 'Middle finger', 'Ring finger', 'Pinky'];
    const correctIdx = opts.indexOf('Index finger');
    if (correctIdx >= 0) items.push({ type: 'multiple_choice', question: `In the context of ${title}, which finger is used to barre across the strings?`, options: opts, correctAnswer: correctIdx, explanation: fullExplanation });
  }
  if (items.length < 10 && (lowerDesc.includes('behind the fret') || lowerDesc.includes('right behind'))) {
    const correct = 'Just behind the fret wire';
    const opts = [correct, 'In the middle between two frets', 'On top of the fret wire', 'Near the nut'];
    items.push({ type: 'multiple_choice', question: `Where does this lesson say you should press the string to get a clear note?`, options: opts, correctAnswer: opts.indexOf(correct), explanation: fullExplanation });
  }
  if (items.length < 10 && lowerDesc.includes('half step') && lowerDesc.includes('fret')) {
    const opts = ['half', 'whole', 'octave', 'tone'];
    items.push({ type: 'fill_blank', sentence: `This lesson refers to moving one fret as one _____ step.`, options: opts, correctAnswer: opts.indexOf('half'), explanation: fullExplanation });
  }
  if (items.length < 10 && lowerDesc.includes('root') && (lowerDesc.includes('chord') || lowerDesc.includes('name'))) {
    const opts = ['The root note', 'The third', 'The fifth', 'The seventh'];
    items.push({ type: 'multiple_choice', question: `According to this lesson, which note gives the chord its name?`, options: opts, correctAnswer: opts.indexOf('The root note'), explanation: fullExplanation });
  }
  if (items.length < 10 && (lowerDesc.includes('metronome') || (lowerDesc.includes('count') && lowerDesc.includes('beat')))) {
    const correct = 'Practice with a metronome and count out loud';
    const opts = [correct, 'Play as fast as possible', 'Ignore the beat', 'Practice only once a week'];
    items.push({ type: 'multiple_choice', question: `What does this lesson recommend for improving timing?`, options: opts, correctAnswer: opts.indexOf(correct), explanation: fullExplanation });
  }
  if (items.length < 10 && (lowerDesc.includes('move the shape') || lowerDesc.includes('movable')) && lowerDesc.includes('fret')) {
    const correct = 'The key (pitch) of the chord changes';
    const opts = [correct, 'The chord becomes minor', 'The number of strings changes', 'Nothing changes'];
    items.push({ type: 'multiple_choice', question: `When you move the same chord shape to a different fret, what does this lesson say changes?`, options: opts, correctAnswer: opts.indexOf(correct), explanation: fullExplanation });
  }

  if (items.length < 10 && lowerDesc.includes('thumb') && (lowerDesc.includes('neck') || lowerDesc.includes('fret'))) {
    const correct = 'Support the neck and relax the fretting hand';
    const opts = [
      correct,
      'Squeeze the neck as hard as possible',
      'Point the thumb away from the neck at all times',
      'Remove the thumb completely for every chord',
    ];
    items.push({
      type: 'multiple_choice',
      question: `About "${safeTitle}" and thumb placement, which does the lesson favor?`,
      options: opts,
      correctAnswer: opts.indexOf(correct),
      explanation: fullExplanation,
    });
  }
  if (items.length < 10 && (lowerDesc.includes('pick') || lowerDesc.includes('plectrum'))) {
    const correct = 'A stable grip with a little tip showing';
    const opts = [correct, 'Hold only with two fingers loosely', 'Grip at the very tip only', 'Do not use a pick at all'];
    items.push({
      type: 'multiple_choice',
      question: `For "${safeTitle}", which pick approach sounds most like typical lesson advice?`,
      options: opts,
      correctAnswer: opts.indexOf(correct),
      explanation: fullExplanation,
    });
  }
  if (items.length < 10 && (lowerDesc.includes('strum') || lowerDesc.includes('strumming'))) {
    const correct = 'Smooth motion through the strings you mean to sound';
    const opts = [correct, 'Only hit string 1', 'Stop at the first string every time', 'Avoid the sound hole entirely'];
    items.push({
      type: 'multiple_choice',
      question: `Which strumming idea fits "${safeTitle}" best?`,
      options: opts,
      correctAnswer: opts.indexOf(correct),
      explanation: fullExplanation,
    });
  }
  if (items.length < 10 && (lowerDesc.includes('tension') || lowerDesc.includes('relax'))) {
    const correct = 'Stay relaxed; tension slows you down and causes pain';
    const opts = [correct, 'Grip harder for speed', 'Lock every joint', 'Only relax after the song ends'];
    items.push({
      type: 'multiple_choice',
      question: `What does "${safeTitle}" imply about tension in your hands or arms?`,
      options: opts,
      correctAnswer: opts.indexOf(correct),
      explanation: fullExplanation,
    });
  }
  if (items.length < 10 && (lowerDesc.includes('posture') || lowerDesc.includes('sit') || lowerDesc.includes('hold your guitar'))) {
    const correct = 'Comfortable position you can sustain without strain';
    const opts = [correct, 'Hunch far over the guitar', 'Stand on one foot only', 'Ignore how the guitar rests on your body'];
    items.push({
      type: 'multiple_choice',
      question: `For "${safeTitle}", which goal matches how lessons usually frame posture?`,
      options: opts,
      correctAnswer: opts.indexOf(correct),
      explanation: fullExplanation,
    });
  }

  // 3) Fill-blank from a specific sentence (lesson-specific) — use single-word options
  if (items.length < 10 && factPool.length > 0) {
    const first = factPool[0];
    const words = first.split(/\s+/).filter(w => w.length > 2);
    const fillWord = words.find(w => w.length > 3 && !/^(the|and|for|with|from|this|that|your|when|where|which|should|does|will|have|been|being|practice|lesson)$/i.test(w));
    if (fillWord && first.length > 40) {
      const blanked = first.replace(new RegExp(fillWord.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'), '_____');
      const wrongWords = ['whole', 'octave', 'tone', 'finger', 'hand', 'speed', 'beat', 'chord', 'note', 'key'].filter(w => w.toLowerCase() !== fillWord.toLowerCase()).slice(0, 3);
      const opts = [fillWord, ...wrongWords];
      const uniq = [...new Set(opts)].slice(0, 4);
      const correctIdx = uniq.indexOf(fillWord);
      if (correctIdx >= 0 && blanked.includes('_____')) items.push({ type: 'fill_blank', sentence: blanked, options: uniq, correctAnswer: correctIdx, explanation: fullExplanation });
    }
  }

  // 4) Fallback if we still have too few items
  if (items.length < 6 && factPool.length > 0) {
    for (let i = 0; i < factPool.length && items.length < 10; i++) {
      if (usedForCorrect.has(i)) continue;
      const correct = factPool[i];
      const wrong = wrongOptionsFor(correct, 3);
      items.push({ type: 'multiple_choice', question: `Which of these does the lesson "${title}" state or recommend?`, options: [correct, ...wrong], correctAnswer: 0, explanation: fullExplanation });
      usedForCorrect.add(i);
    }
  }
  if (items.length === 0) {
    const first = optionText(description.slice(0, 250));
    const wrong = wrongOptionsFor(first, 3);
    items.push({ type: 'multiple_choice', question: `What does the lesson "${title}" emphasize?`, options: [first, ...wrong], correctAnswer: 0, explanation: fullExplanation });
  }
  return { title, items: items.slice(0, 10) };
}

/** Quiz length for a lesson — matches technique/theory session length. */
export function getLessonQuizItemCount(lessonTitle: string, lessonDescription: string): number {
  const desc = lessonDescription?.trim() || 'This topic covers essential guitar concepts.';
  let content: LessonContent | null = getContentByTitle(lessonTitle);
  if (content?.items?.length) return TECHNIQUE_THEORY_QUIZ_TOTAL;
  if (content?.quiz?.length) return TECHNIQUE_THEORY_QUIZ_TOTAL;
  content = createFallbackContent(lessonTitle, desc);
  return content.items?.length ? TECHNIQUE_THEORY_QUIZ_TOTAL : 0;
}

/** Lesson titles that map to chord practice (SongPractice). Includes novice and all level-specific chord lessons so the practice popup applies across levels. */
export const LESSON_PRACTICE_CHORDS: Record<string, string[]> = {
  // Novice
  'E Minor - Your First Chord': ['Em'],
  'E minor': ['Em'],
  'A Minor - Your Second Chord': ['Am'],
  'A minor': ['Am'],
  'D Major - Your Third Chord': ['D'],
  'D major': ['D'],
  'G Major': ['G'],
  'G major': ['G'],
  'G Major - The Big Stretch': ['G'],
  'C Major': ['C'],
  'C major': ['C'],
  'A minor and C major': ['Am', 'C'],
  'Switching Between Chords': ['Em', 'A', 'D'],
  'The 4-Chord Song': ['G', 'D', 'Em', 'C'],
  'F Major - The First Barre Chord': ['F'],
  'F major': ['F'],
  // Beginner (level-specific)
  'Em, A, D Together': ['Em', 'A', 'D'],
  'Adding G and C': ['G', 'C'],
  'Faster Chord Changes': ['Em', 'A', 'D', 'G', 'C'],
  'A Minor and E Major': ['Am', 'E'],
  'B7 and Dominant 7ths': ['B7', 'E', 'A'],
  'Full Open Chord Set': ['G', 'D', 'Em', 'C'],
  'Open Chords: Final Review': ['G', 'D', 'Em', 'C', 'Am', 'E', 'B7'],
  'Learning the Progression': ['G', 'C', 'Em', 'D'],
  'Playing Through': ['G', 'D', 'Em', 'C'],
  // Elementary
  'F Major and F Minor': ['F', 'Fm'],
  'Moving Barre Shapes': ['F', 'G', 'A', 'B'],
  'Power Chord Shape': ['E5', 'A5'],
  'Power Chord Progressions': ['E5', 'A5', 'B5'],
  'Movable Minor Shape': ['Fm', 'Gm', 'Am'],
  // Intermediate (comping / rhythm)
  'Straight Eighth Comping': ['Em', 'A', 'D', 'G'],
  'Syncopated Chords': ['Dm', 'G7', 'C'],
  'Dynamic Comping': ['Cmaj7', 'Dm7', 'G7'],
  // Proficient (jazz / chord melody)
  'Shell Voicings': ['Dm7', 'G7', 'Cmaj7'],
  'Comping Rhythm': ['Dm7', 'G7', 'Cmaj7'],
  'Comping a Standard': ['Am', 'Dm', 'G7', 'C'],
  'Simple Chord Melody': ['C', 'G', 'Am', 'F'],
  'Arranging a Tune': ['C', 'G', 'Am', 'F'],
};

/** Get chords to practice for a lesson title (for chord recognizer / SongPractice). Returns null if not a chord-practice lesson. */
export function getPracticeChordsForLesson(lessonTitle: string): string[] | null {
  const exact = LESSON_PRACTICE_CHORDS[lessonTitle];
  if (exact?.length) return exact;
  const lower = lessonTitle.toLowerCase();
  for (const [key, chords] of Object.entries(LESSON_PRACTICE_CHORDS)) {
    if (key.toLowerCase() === lower || lower.includes(key.toLowerCase())) return chords;
  }
  return null;
}

/**
 * Chords for the "practice" session when the lesson isn't in LESSON_PRACTICE_CHORDS.
 * Maps posture / non-chord topics to a concrete shape you can hold while applying the idea.
 */
export function getPracticeChordsOrPhysicalFallback(lessonTitle: string, lessonDescription = ''): string[] {
  const mapped = getPracticeChordsForLesson(lessonTitle);
  if (mapped?.length) return mapped;
  const text = `${lessonTitle} ${lessonDescription}`.toLowerCase();
  if (
    /\b(posture|how to hold|holding the|guitar position|sitting|standing|strap|comfort|anatomy|wrist|thumb behind|neck angle)\b/.test(
      text
    )
  ) {
    return ['E'];
  }
  if (/\b(strum|downstroke|upstroke|pattern|pick(ing)?|plectrum|mute strings)\b/.test(text)) {
    return ['Em', 'A'];
  }
  if (/\b(scale|interval|fretboard|finger|stretch|warm[- ]?up|dexterity)\b/.test(text)) {
    return ['Am'];
  }
  if (/\b(rhythm|tempo|beat|time signature|count|metronome)\b/.test(text)) {
    return ['Em', 'D'];
  }
  if (/\b(note|pitch|octave|half step|whole step|key signature|circle of fifths|theory)\b/.test(text)) {
    return ['C', 'G'];
  }
  return ['Em'];
}

/**
 * Audit: which lessons have explicit quiz content vs fallback, and which have SongPractice (chord practice popup).
 * Use this to verify every technique/theory quiz has its own specific questions and chord lessons have practice popup.
 *
 * - explicitTechniqueTitles: lesson titles that have their own quiz items in techniqueContent (topic-specific).
 * - explicitTheoryTitles: lesson titles that have their own quiz items in theoryContent (topic-specific).
 * - practiceChordTitles: lesson titles that open the chord practice popup (SongPractice) after quiz; add here for chord lessons.
 *
 * Lessons not in explicit* get questions from createFallbackContent(description). Sessions use
 * enrichLessonQuizBaseToMinStems so pools reach 10 unique stems (lesson text + fallback). To give a lesson its own
 * questions, add an entry to techniqueContent or theoryContent in this file. To add chord practice after a lesson,
 * add the lesson title to LESSON_PRACTICE_CHORDS (and optionally set practiceChords on the lesson in learning-journey*.ts).
 */
export function getQuizAndPracticeAudit(): {
  explicitTechniqueTitles: string[];
  explicitTheoryTitles: string[];
  practiceChordTitles: string[];
} {
  return {
    explicitTechniqueTitles: Object.keys(techniqueContent),
    explicitTheoryTitles: Object.keys(theoryContent),
    practiceChordTitles: Object.keys(LESSON_PRACTICE_CHORDS),
  };
}
