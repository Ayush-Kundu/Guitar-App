// =============================================================================
// INTERACTIVE QUIZ TYPES - Teach concepts through quizzes (fill-in-blank, multiple choice)
// =============================================================================

export type QuizItemType = 'multiple_choice' | 'fill_blank';

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

export type QuizItem = MultipleChoiceItem | FillBlankItem;

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
      { type: 'fill_blank', sentence: 'When sitting with your guitar (right-handed), the guitar should rest on your _____ thigh.', options: ['right', 'left', 'both', 'either'], correctAnswer: 0, explanation: 'The waist of the guitar rests naturally on your right leg, with the neck tilted slightly upward.' },
      { type: 'multiple_choice', question: 'What angle should the guitar neck be tilted?', options: ['Horizontal', 'About 45° upward', 'Straight up', 'Pointing down'], correctAnswer: 1, explanation: 'A 45° tilt gives your fretting hand better access without straining your wrist.' },
      { type: 'fill_blank', sentence: 'The _____ of the guitar (the curved indentation) should rest on your leg.', options: ['waist', 'neck', 'body', 'bridge'], correctAnswer: 0, explanation: 'The waist is the curved part of the body that fits naturally on your thigh.' },
      { type: 'multiple_choice', question: 'Why is wearing the guitar too low a bad idea?', options: ['Looks unprofessional', 'Damages the guitar', 'Forces your wrist into awkward angles', 'Makes it go out of tune'], correctAnswer: 2, explanation: 'A low guitar forces poor wrist angles and will slow your progress.' },
      { type: 'multiple_choice', question: 'In classical position, which thigh holds the guitar?', options: ['Right thigh', 'Left thigh', 'Neither', 'Both'], correctAnswer: 1, explanation: 'Classical players use the left thigh with a footstool for better fretboard access.' },
      { type: 'fill_blank', sentence: 'Your hands should reach the strings without your wrists being bent at _____ angles.', options: ['extreme', 'comfortable', 'relaxed', 'natural'], correctAnswer: 0, explanation: 'Comfortable wrist position prevents strain and injury.' },
      { type: 'multiple_choice', question: 'What should you practice first?', options: ['Playing chords', 'Sitting with the guitar without playing', 'Speed exercises', 'Difficult songs'], correctAnswer: 1, explanation: 'Get comfortable holding the guitar before trying to play.' }
    ]
  },
  'Your Hands - Where Do They Go?': {
    title: 'Your Hands - Where Do They Go?',
    items: [
      { type: 'fill_blank', sentence: 'Your _____ hand presses the strings on the fretboard.', options: ['left', 'right', 'both', 'either'], correctAnswer: 0, explanation: 'The fretting hand changes notes by pressing strings.' },
      { type: 'fill_blank', sentence: 'Your _____ hand plucks or strums the strings over the sound hole.', options: ['right', 'left', 'both', 'either'], correctAnswer: 0, explanation: 'The picking/strumming hand creates the sound.' },
      { type: 'multiple_choice', question: 'Where does your fretting hand go?', options: ['On the body', 'On the neck/fretboard', 'On the headstock', 'On the bridge'], correctAnswer: 1, explanation: 'The fretboard is where you press strings to change notes.' },
      { type: 'multiple_choice', question: 'Where does your strumming hand go?', options: ['On the neck', 'Over the sound hole', 'On the headstock', 'On the tuning pegs'], correctAnswer: 1, explanation: 'Strum over the sound hole for the best acoustic sound.' }
    ]
  },
  'Making Your First Sound': {
    title: 'Making Your First Sound',
    items: [
      { type: 'fill_blank', sentence: 'Use your _____ or finger to pluck any string to make a sound.', options: ['thumb', 'palm', 'wrist', 'elbow'], correctAnswer: 0, explanation: 'A simple pluck creates your first note!' },
      { type: 'multiple_choice', question: 'What creates the sound when you pluck a string?', options: ['The pick', 'String vibration', 'The body', 'The frets'], correctAnswer: 1, explanation: 'The vibrating string creates sound that the body amplifies.' },
      { type: 'fill_blank', sentence: 'Each string makes a _____ sound when plucked.', options: ['different', 'same', 'muted', 'buzzing'], correctAnswer: 0, explanation: 'Thicker strings sound lower, thinner strings sound higher.' }
    ]
  },
  'The Six Strings': {
    title: 'The Six Strings',
    items: [
      { type: 'fill_blank', sentence: 'The guitar has _____ strings.', options: ['6', '4', '8', '12'], correctAnswer: 0, explanation: 'Standard guitars have six strings.' },
      { type: 'fill_blank', sentence: 'From thickest to thinnest, the strings are E, A, D, G, B, _____.', options: ['E', 'A', 'D', 'G'], correctAnswer: 0, explanation: 'Both the thickest and thinnest strings are E, but different octaves.' },
      { type: 'multiple_choice', question: 'Which string is the thickest (lowest sounding)?', options: ['High E', 'B', 'Low E', 'A'], correctAnswer: 2, explanation: 'The low E string is closest to your chin when holding the guitar.' },
      { type: 'multiple_choice', question: 'What mnemonic helps remember the string names?', options: ['Every Apple Does Good', 'Eddie Ate Dynamite, Good Bye Eddie', 'Eat All Day', 'Every Day Gets Better'], correctAnswer: 1, explanation: 'E-A-D-G-B-E: Eddie Ate Dynamite, Good Bye Eddie!' }
    ]
  },
  'What Are Frets?': {
    title: 'What Are Frets?',
    items: [
      { type: 'fill_blank', sentence: 'The metal bars going across the neck are called _____.', options: ['frets', 'strings', 'markers', 'nuts'], correctAnswer: 0, explanation: 'Frets divide the neck into segments.' },
      { type: 'multiple_choice', question: 'Where do you press the string to change the note?', options: ['On top of the fret', 'Just behind the fret', 'In the middle between frets', 'On the body'], correctAnswer: 1, explanation: 'Press right behind the fret wire for a clean sound.' },
      { type: 'fill_blank', sentence: 'The closer to the _____, the higher the note.', options: ['body', 'headstock', 'bridge', 'nut'], correctAnswer: 0, explanation: 'Shorter vibrating length = higher pitch.' }
    ]
  },
  'How to Press a String': {
    title: 'How to Press a String',
    items: [
      { type: 'fill_blank', sentence: 'Use your _____ (not the flat pad) to press the string.', options: ['fingertip', 'knuckle', 'palm', 'nail'], correctAnswer: 0, explanation: 'Fingertips give cleaner notes and avoid muting neighbors.' },
      { type: 'multiple_choice', question: 'What causes a buzzing sound?', options: ['Pressing too hard', 'Pressing too softly or too far from fret', 'Using a pick', 'Strumming too fast'], correctAnswer: 1, explanation: 'Press firmly right behind the fret for a clean note.' },
      { type: 'fill_blank', sentence: 'Press _____ behind the fret wire, not in the middle.', options: ['right', 'lightly', 'softly', 'gently'], correctAnswer: 0, explanation: 'Closer to the fret = less pressure needed.' }
    ]
  },
  'Where Does Your Thumb Go?': {
    title: 'Where Does Your Thumb Go?',
    items: [
      { type: 'fill_blank', sentence: 'Your thumb should rest on the _____ of the neck.', options: ['back', 'front', 'side', 'top'], correctAnswer: 0, explanation: 'The thumb supports your fingers from behind.' },
      { type: 'multiple_choice', question: 'Where should your thumb point?', options: ['Over the top of the neck', 'Toward the ceiling', 'Toward the floor', 'At the body'], correctAnswer: 1, explanation: 'Thumb pointing up gives your fingers more strength and reach.' },
      { type: 'fill_blank', sentence: 'Don\'t _____ your thumb around the top of the neck!', options: ['wrap', 'rest', 'place', 'press'], correctAnswer: 0, explanation: 'Wrapping limits your finger reach and flexibility.' }
    ]
  },
  'One Finger Per Fret': {
    title: 'One Finger Per Fret',
    items: [
      { type: 'fill_blank', sentence: 'At fret 1, use your _____ finger.', options: ['index', 'middle', 'ring', 'pinky'], correctAnswer: 0, explanation: 'Index = fret 1, Middle = 2, Ring = 3, Pinky = 4.' },
      { type: 'fill_blank', sentence: 'At fret 2, use your _____ finger.', options: ['middle', 'index', 'ring', 'pinky'], correctAnswer: 0, explanation: 'One finger per fret keeps your hand in position.' },
      { type: 'multiple_choice', question: 'Which finger plays fret 4?', options: ['Index', 'Middle', 'Ring', 'Pinky'], correctAnswer: 3, explanation: 'Index=1, Middle=2, Ring=3, Pinky=4.' }
    ]
  },
  'What Is a Chord?': {
    title: 'What Is a Chord?',
    items: [
      { type: 'fill_blank', sentence: 'A chord is _____ or more notes played together.', options: ['3', '2', '4', '5'], correctAnswer: 0, explanation: 'Chords are the building blocks of songs.' },
      { type: 'multiple_choice', question: 'What do we call chords that sound happy?', options: ['Minor', 'Major', 'Diminished', 'Seventh'], correctAnswer: 1, explanation: 'Major chords sound bright and happy.' },
      { type: 'multiple_choice', question: 'What do we call chords that sound sad?', options: ['Major', 'Minor', 'Augmented', 'Power'], correctAnswer: 1, explanation: 'Minor chords have a darker, sadder quality.' }
    ]
  },
  'E Minor - Your First Chord': {
    title: 'E Minor - Your First Chord',
    items: [
      { type: 'fill_blank', sentence: 'E minor uses just _____ fingers.', options: ['2', '1', '3', '4'], correctAnswer: 0, explanation: 'Em is one of the easiest chords!' },
      { type: 'multiple_choice', question: 'Which fingers play E minor?', options: ['Index and middle', 'Middle and ring', 'Ring and pinky', 'Index and pinky'], correctAnswer: 1, explanation: 'Middle on string 5 fret 2, ring on string 4 fret 2.' },
      { type: 'fill_blank', sentence: 'E minor has a _____ sound.', options: ['sad', 'happy', 'bright', 'cheerful'], correctAnswer: 0, explanation: 'Minor chords often sound melancholic.' }
    ]
  },
  'Parts of the Guitar': {
    title: 'Parts of the Guitar',
    items: [
      { type: 'fill_blank', sentence: 'The _____ holds the tuning machines.', options: ['headstock', 'bridge', 'body', 'sound hole'], correctAnswer: 0, explanation: 'The headstock is at the top of the neck.' },
      { type: 'multiple_choice', question: 'What guides the strings from headstock to fretboard?', options: ['The bridge', 'The nut', 'The saddle', 'The pickguard'], correctAnswer: 1, explanation: 'The nut has grooves for each string.' },
      { type: 'fill_blank', sentence: 'The _____ are thin metal strips across the neck.', options: ['frets', 'strings', 'markers', 'saddles'], correctAnswer: 0, explanation: 'Frets divide the neck into segments.' },
      { type: 'multiple_choice', question: 'Where are pickups found?', options: ['All guitars', 'Acoustic guitars', 'Electric guitars', 'Bass only'], correctAnswer: 2, explanation: 'Pickups convert string vibration to electrical signal.' },
      { type: 'fill_blank', sentence: 'The _____ anchors the strings at the body end.', options: ['bridge', 'nut', 'headstock', 'fretboard'], correctAnswer: 0, explanation: 'The bridge holds the strings and transmits vibration.' }
    ]
  },
  'How Guitars Make Sound': {
    title: 'How Guitars Make Sound',
    items: [
      { type: 'fill_blank', sentence: 'When you pluck a string, it _____.', options: ['vibrates', 'breaks', 'mutes', 'bends'], correctAnswer: 0, explanation: 'Vibration creates the sound.' },
      { type: 'multiple_choice', question: 'What amplifies the sound on an acoustic guitar?', options: ['Pickups', 'The hollow body', 'The frets', 'The nut'], correctAnswer: 1, explanation: 'The body acts as a resonating chamber.' },
      { type: 'fill_blank', sentence: 'Shorter vibrating string = _____ pitch.', options: ['higher', 'lower', 'louder', 'softer'], correctAnswer: 0, explanation: 'Shorter length = higher frequency = higher note.' }
    ]
  },
  'High vs Low Sounds': {
    title: 'High vs Low Sounds',
    items: [
      { type: 'fill_blank', sentence: 'The _____ the string, the lower the sound.', options: ['thicker', 'thinner', 'longer', 'shorter'], correctAnswer: 0, explanation: 'Thicker strings vibrate slower = lower pitch.' },
      { type: 'multiple_choice', question: 'Which string sounds highest?', options: ['Low E', 'A', 'High E', 'D'], correctAnswer: 2, explanation: 'The thinnest string (high E) has the highest pitch.' }
    ]
  },
  'What Is Tuning?': {
    title: 'What Is Tuning?',
    items: [
      { type: 'fill_blank', sentence: 'Tuning means making each string play the _____ note.', options: ['right', 'wrong', 'loud', 'high'], correctAnswer: 0, explanation: 'Proper tuning ensures your guitar sounds right.' },
      { type: 'multiple_choice', question: 'What do tuning pegs adjust?', options: ['Volume', 'String tension and pitch', 'Tone', 'Nothing'], correctAnswer: 1, explanation: 'Tightening raises pitch, loosening lowers it.' }
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
      { type: 'fill_blank', sentence: 'The musical alphabet has _____ letters: A through G.', options: ['7', '5', '12', '8'], correctAnswer: 0, explanation: 'A, B, C, D, E, F, G - then it repeats.' },
      { type: 'multiple_choice', question: 'What comes after G in the musical alphabet?', options: ['H', 'A', 'Z', '1'], correctAnswer: 1, explanation: 'The alphabet cycles: ...F, G, A, B, C...' },
      { type: 'fill_blank', sentence: 'There are _____ notes in the full chromatic scale.', options: ['12', '7', '5', '8'], correctAnswer: 0, explanation: 'Including sharps/flats, we have 12 unique pitches.' }
    ]
  },
  'Sharps and Flats': {
    title: 'Sharps and Flats',
    items: [
      { type: 'fill_blank', sentence: 'A sharp (♯) _____ a note by one half step.', options: ['raises', 'lowers', 'sustains', 'mutes'], correctAnswer: 0, explanation: 'Sharp = up, flat = down.' },
      { type: 'fill_blank', sentence: 'A flat (♭) _____ a note by one half step.', options: ['lowers', 'raises', 'sustains', 'mutes'], correctAnswer: 0, explanation: 'Flat = down a half step.' },
      { type: 'multiple_choice', question: 'What is the same as C#?', options: ['B', 'Db', 'D', 'Cb'], correctAnswer: 1, explanation: 'C# and Db are enharmonic - same pitch, different names.' }
    ]
  },
  'What Is Rhythm?': {
    title: 'What Is Rhythm?',
    items: [
      { type: 'fill_blank', sentence: 'Rhythm is the _____ of sounds in time.', options: ['pattern', 'volume', 'pitch', 'speed'], correctAnswer: 0, explanation: 'Rhythm organizes when notes happen.' },
      { type: 'multiple_choice', question: 'What is the steady pulse of music called?', options: ['Melody', 'Beat', 'Harmony', 'Dynamics'], correctAnswer: 1, explanation: 'The beat is the underlying pulse we tap our foot to.' }
    ]
  },
  'What Is a Scale?': {
    title: 'What Is a Scale?',
    items: [
      { type: 'fill_blank', sentence: 'A scale is a _____ of notes that sound good together.', options: ['collection', 'single', 'pair', 'chord'], correctAnswer: 0, explanation: 'Scales provide the notes for melodies and solos.' },
      { type: 'multiple_choice', question: 'How many notes in a major scale?', options: ['5', '6', '7', '8'], correctAnswer: 2, explanation: 'Seven notes (plus the octave) - Do Re Mi Fa Sol La Ti Do.' }
    ]
  },
  'Major vs Minor': {
    title: 'Major vs Minor',
    items: [
      { type: 'fill_blank', sentence: 'Major chords typically sound _____.', options: ['happy', 'sad', 'dark', 'tense'], correctAnswer: 0, explanation: 'Major = bright, happy quality.' },
      { type: 'fill_blank', sentence: 'Minor chords typically sound _____.', options: ['sad', 'happy', 'bright', 'cheerful'], correctAnswer: 0, explanation: 'Minor = darker, sadder quality.' },
      { type: 'multiple_choice', question: 'What differs between major and minor chords?', options: ['The root note', 'The third interval', 'The fifth', 'The number of notes'], correctAnswer: 1, explanation: 'Major has a major 3rd, minor has a minor 3rd.' }
    ]
  }
};

// =============================================================================
// FALLBACK - Generate interactive content for lessons without specific content
// =============================================================================

export function getContentByTitle(title: string): LessonContent | null {
  if (techniqueContent[title]) return techniqueContent[title];
  if (theoryContent[title]) return theoryContent[title];
  const allContent = { ...techniqueContent, ...theoryContent };
  for (const key of Object.keys(allContent)) {
    if (key.toLowerCase().includes(title.toLowerCase()) || title.toLowerCase().includes(key.toLowerCase())) {
      return allContent[key];
    }
  }
  return null;
}

/** Generic quiz items used to pad quizzes to at least 5 questions */
const PAD_ITEMS: QuizItem[] = [
  { type: 'multiple_choice', question: 'What helps you improve most?', options: ['Consistent practice', 'Playing only when inspired', 'Skipping basics', 'Learning many songs at once'], correctAnswer: 0, explanation: 'Short, regular practice builds skill faster than rare long sessions.' },
  { type: 'fill_blank', sentence: 'You should practice at a _____ pace at first.', options: ['comfortable', 'very fast', 'random', 'competitive'], correctAnswer: 0, explanation: 'Start slow to build accuracy, then speed up.' },
  { type: 'multiple_choice', question: 'What should you do if something feels difficult?', options: ['Give up', 'Slow down and repeat until it feels easier', 'Skip it', 'Play something else'], correctAnswer: 1, explanation: 'Breaking difficult parts into smaller steps helps.' },
  { type: 'fill_blank', sentence: 'Good form and _____ prevent injury.', options: ['posture', 'speed', 'volume', 'complexity'], correctAnswer: 0, explanation: 'Proper posture lets you play longer without strain.' },
  { type: 'multiple_choice', question: 'When learning something new, what works best?', options: ['Rushing through', 'Repeating correctly many times', 'Practicing once', 'Only reading about it'], correctAnswer: 1, explanation: 'Repetition builds muscle memory.' },
];

const MIN_QUIZ_ITEMS = 5;

/** Ensure content has at least MIN_QUIZ_ITEMS; pad with generic items if needed */
export function ensureMinQuizItems(content: LessonContent): LessonContent {
  const items = content.items || [];
  if (items.length >= MIN_QUIZ_ITEMS) return content;
  const needed = MIN_QUIZ_ITEMS - items.length;
  const pad = PAD_ITEMS.slice(0, needed);
  return { ...content, items: [...items, ...pad] };
}

/** Create fallback interactive content from lesson description for topics without content */
export function createFallbackContent(title: string, description: string): LessonContent {
  const shortDesc = description.length > 60 ? description.slice(0, 57) + '...' : description;
  const keyWord = title.split(' ').filter(w => w.length > 3)[0]?.toLowerCase() || 'guitar';
  const items: QuizItem[] = [
    { type: 'multiple_choice', question: `What is the main focus of "${title}"?`, options: [shortDesc, 'Advanced techniques', 'Music history', 'Guitar maintenance'], correctAnswer: 0, explanation: description },
    { type: 'fill_blank', sentence: `This lesson helps you learn about _____.`, options: [keyWord, 'technique', 'theory', 'practice'], correctAnswer: 0, explanation: 'Keep practicing to master this concept!' },
    ...PAD_ITEMS.slice(0, 3),
  ];
  return ensureMinQuizItems({ title, items });
}

/** Lesson titles that map to chord practice (SongPractice). Only chord-playing lessons are included. */
export const LESSON_PRACTICE_CHORDS: Record<string, string[]> = {
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
