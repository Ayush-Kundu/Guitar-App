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
      { type: 'fill_blank', sentence: 'The metal bars going across the neck are called _____.', options: ['frets', 'strings', 'markers', 'nuts'], correctAnswer: 0, explanation: 'Frets are the thin metal strips (fret wire) that divide the neck into segments. When you press a string down just behind a fret, the vibrating length shortens and the pitch goes up. So frets give you fixed, repeatable notes—the foundation for every chord and scale.' },
      { type: 'multiple_choice', question: 'Where do you press the string to change the note cleanly?', options: ['On top of the fret', 'Just behind the fret', 'In the middle between frets', 'On the body'], correctAnswer: 1, explanation: 'Press the string down firmly just behind the fret wire (closer to the headstock than the middle of the space). That way the fret acts as the endpoint of the vibrating length and the note rings clearly. Too far from the fret and you get buzz or a dead sound.' },
      { type: 'fill_blank', sentence: 'Moving toward the _____ shortens the string and raises the pitch.', options: ['body', 'headstock', 'bridge', 'nut'], correctAnswer: 0, explanation: 'The vibrating length is from the fret (or nut) to the bridge. So the closer your finger is to the body (higher fret number), the shorter the length and the higher the note. This is why the same string gives different notes at different frets—each fret is one half step higher.' },
      { type: 'multiple_choice', question: 'What is "fret 0" or an "open" string?', options: ['A broken string', 'When you do not press any fret and the string vibrates full length', 'The 12th fret', 'A muted note'], correctAnswer: 1, explanation: 'When you do not press any fret, the string vibrates from the nut to the bridge—that is "open" or "fret 0." So we have open E, open A, etc. Every other note on that string is made by pressing at fret 1, 2, 3, and so on.' },
      { type: 'fill_blank', sentence: 'Each fret raises the pitch by one _____ step—the smallest step we use in Western music.', options: ['half', 'whole', 'octave', 'tone'], correctAnswer: 0, explanation: 'One fret = one half step (semitone). So on any string you get all 12 notes in order by going fret by fret. That connects the fretboard directly to the musical alphabet and to scales and chords.' }
    ]
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
      { type: 'fill_blank', sentence: 'A chord is _____ or more notes played together.', options: ['3', '2', '4', '5'], correctAnswer: 0, explanation: 'By definition, a chord is at least three different notes sounding at once. Two notes can be a "dyad" or interval, but chords are the building blocks of harmony in songs. Most guitar chords use three to six notes (sometimes with repeats across strings). From zero: think of a chord as a "stack" of notes that create one harmony.' },
      { type: 'multiple_choice', question: 'What do we call chords that sound bright or happy?', options: ['Minor', 'Major', 'Diminished', 'Seventh'], correctAnswer: 1, explanation: 'Major chords use a specific pattern of intervals (root, major third, perfect fifth) that sounds stable and bright. They are the "happy" or resolved sound in most music. Songs mix major and minor to create emotion and tension.' },
      { type: 'multiple_choice', question: 'What do we call chords that sound darker or sadder?', options: ['Major', 'Minor', 'Augmented', 'Power'], correctAnswer: 1, explanation: 'Minor chords use a minor third (one half step lower than in major), which gives a darker, more melancholic quality. The difference between major and minor is just one note, but it changes the whole mood—this is the basis of harmony from zero to hero.' },
      { type: 'fill_blank', sentence: 'Chords are the _____ of songs: they support the melody and define the harmony.', options: ['building blocks', 'speed', 'volume', 'tempo'], correctAnswer: 0, explanation: 'When you strum a chord, you are playing the harmony—the background that supports the tune. Most songs are built from a sequence of chords (a "chord progression"). So learning chords is not optional; it is how you go from single notes to real music.' },
      { type: 'multiple_choice', question: 'On the guitar, how do we usually play a chord?', options: ['One string at a time', 'By pressing several strings at different frets and strumming or plucking them together', 'Only on the 1st string', 'Without using the fretting hand'], correctAnswer: 1, explanation: 'A chord shape is a pattern of fingers on several strings and frets. When you strum or pluck those strings together (or in a pattern), you hear the chord. So chord "shapes" are the key: learn the shape, and you can play the chord anywhere or in any song that uses it.' }
    ]
  },
  'E Minor - Your First Chord': {
    title: 'E Minor - Your First Chord',
    items: [
      { type: 'fill_blank', sentence: 'E minor uses just _____ fingers on the fretboard.', options: ['2', '1', '3', '4'], correctAnswer: 0, explanation: 'E minor (Em) needs only two fingers: middle finger on string 5 fret 2, ring finger on string 4 fret 2. The other strings are either open or not played. That makes Em one of the first chords beginners learn—simple shape, full sound, and it appears in hundreds of songs.' },
      { type: 'multiple_choice', question: 'Which fingers play E minor?', options: ['Index and middle', 'Middle and ring', 'Ring and pinky', 'Index and pinky'], correctAnswer: 1, explanation: 'Middle finger on string 5 (A string) fret 2, ring finger on string 4 (D string) fret 2. Strings 6, 3, 2, and 1 are played open. Memorizing "middle and ring on 5 and 4 at fret 2" is the first step to playing Em without looking.' },
      { type: 'fill_blank', sentence: 'E minor has a _____ sound because it is a minor chord.', options: ['darker or sadder', 'happy', 'bright', 'cheerful'], correctAnswer: 0, explanation: 'Minor chords have a lower "third" than major chords, which gives that darker, more melancholic quality. Em is used in ballads, rock, and pop for emotional moments. So from your first chord you are already hearing the difference between major and minor.' },
      { type: 'multiple_choice', question: 'When you play E minor, which strings do you strum?', options: ['Only string 1', 'All six strings', 'Only the bass strings', 'Only strings 4 and 5'], correctAnswer: 1, explanation: 'For Em you strum all six strings. The open 6th (low E), 3rd (G), 2nd (B), and 1st (high E) strings are part of the chord; your two fingers add the notes on strings 5 and 4. So the full chord uses both open strings and fretted notes.' },
      { type: 'fill_blank', sentence: 'E minor is often written as _____ on chord charts.', options: ['Em', 'E', 'Emin', 'E-'], correctAnswer: 0, explanation: 'Chord charts use "Em" or "Emin" or "E-" for E minor. The lowercase "m" means minor. So when you see "Em" in a song, you play the two-finger E minor shape. This is the notation you will see everywhere from tabs to sheet music.' }
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
      { type: 'multiple_choice', question: 'What actually differs between a major chord and a minor chord?', options: ['The root note', 'The third interval (one half step lower in minor)', 'The fifth', 'The number of notes'], correctAnswer: 1, explanation: 'Both have a root and a fifth; the "third" is what changes. In major the third is 4 half steps above the root; in minor it is 3 half steps. That one half step is why minor sounds sadder and is the core of going from zero to understanding chord quality.' },
      { type: 'multiple_choice', question: 'In chord symbols, how do we usually indicate minor?', options: ['Capital M', 'Lowercase "m" or "min" or a minus sign (e.g. Am, Amin, A-)', 'The number 3', 'We do not.'], correctAnswer: 1, explanation: 'A chord with no letter after the root is usually major (e.g. C = C major). For minor we add "m" or "min" or "-": Am, Amin, A- all mean A minor. So reading chord charts requires knowing that "m" = minor and that minor has that one half step lower third.' },
      { type: 'fill_blank', sentence: 'The "third" in a chord is the note that decides if the chord sounds major or _____ .', options: ['minor', 'diminished', 'augmented', 'seventh'], correctAnswer: 0, explanation: 'Basic chords are built from the root, third, and fifth (from the scale). The third is the note that is either "major" (4 half steps above the root) or "minor" (3 half steps). So the third is the single note that defines the chord\'s major vs. minor quality—the core of harmony from zero to hero.' }
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
  const correct = item.options[item.correctAnswer];
  const opts = shuffleArray([...item.options]);
  const newIndex = opts.indexOf(correct);
  if (newIndex === -1) return item;
  return { ...item, options: opts, correctAnswer: newIndex };
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

  // Helper: pick wrong options that are not the correct one — use other sentences from this lesson, or topic-specific distractors
  function wrongOptionsFor(correctOption: string, count: number): string[] {
    const wrong: string[] = [];
    const others = factPool.filter(f => f !== correctOption && !f.slice(0, 40).includes(correctOption.slice(0, 30)));
    for (let i = 0; i < others.length && wrong.length < count; i++) {
      const c = others[i];
      if (!wrong.includes(c) && c.length > 18) wrong.push(c);
    }
    const distractors = [
      'This applies only to instruments other than the guitar.',
      'The lesson recommends skipping this until you are advanced.',
      'Speed is more important than accuracy here.',
      'You should avoid using a metronome for this.',
      'The lesson says to press in the middle between two frets.',
      'Only the third of the chord matters, not the root or fifth.',
      'Moving the same shape up the neck does not change the key.',
      'The lesson suggests practicing for long sessions once a week only.',
      'Your strumming hand should stay near the bridge for full tone.',
      'The flat pad of the finger is preferred for clean notes.',
    ];
    while (wrong.length < count) {
      const d = distractors[wrong.length % distractors.length];
      if (!wrong.includes(d) && d !== correctOption) wrong.push(d);
      else if (wrong.length < count) wrong.push(`This lesson does not cover that.`);
      if (wrong.length >= count) break;
    }
    return wrong.slice(0, count);
  }

  // 1) Primary: one question per meaningful sentence — "What does this lesson say or recommend about [topic]?" with THAT sentence as correct
  const questionStems = [
    `What does this lesson specifically state or recommend about ${topic}?`,
    `According to this lesson, which of the following is true or recommended?`,
    `Which of these does the lesson describe or advise?`,
  ];
  for (let i = 0; i < factPool.length && items.length < 8; i++) {
    const correct = factPool[i];
    if (usedForCorrect.has(i) || correct.length < 25) continue;
    const wrong = wrongOptionsFor(correct, 3);
    const options = [correct, ...wrong];
    const stem = questionStems[items.length % questionStems.length];
    items.push({ type: 'multiple_choice', question: stem, options, correctAnswer: 0, explanation: fullExplanation });
    usedForCorrect.add(i);
  }

  // 2) Concept questions only when the description explicitly uses that concept — phrased using lesson context
  if (items.length < 6 && lowerDesc.includes('barre') && (lowerDesc.includes('index') || lowerDesc.includes('across'))) {
    const opts = ['Index finger', 'Middle finger', 'Ring finger', 'Pinky'];
    const correctIdx = opts.indexOf('Index finger');
    if (correctIdx >= 0) items.push({ type: 'multiple_choice', question: `In the context of ${title}, which finger is used to barre across the strings?`, options: opts, correctAnswer: correctIdx, explanation: fullExplanation });
  }
  if (items.length < 6 && (lowerDesc.includes('behind the fret') || lowerDesc.includes('right behind'))) {
    const correct = 'Just behind the fret wire';
    const opts = [correct, 'In the middle between two frets', 'On top of the fret wire', 'Near the nut'];
    items.push({ type: 'multiple_choice', question: `Where does this lesson say you should press the string to get a clear note?`, options: opts, correctAnswer: opts.indexOf(correct), explanation: fullExplanation });
  }
  if (items.length < 6 && lowerDesc.includes('half step') && lowerDesc.includes('fret')) {
    const opts = ['half', 'whole', 'octave', 'tone'];
    items.push({ type: 'fill_blank', sentence: `This lesson refers to moving one fret as one _____ step.`, options: opts, correctAnswer: opts.indexOf('half'), explanation: fullExplanation });
  }
  if (items.length < 6 && lowerDesc.includes('root') && (lowerDesc.includes('chord') || lowerDesc.includes('name'))) {
    const opts = ['The root note', 'The third', 'The fifth', 'The seventh'];
    items.push({ type: 'multiple_choice', question: `According to this lesson, which note gives the chord its name?`, options: opts, correctAnswer: opts.indexOf('The root note'), explanation: fullExplanation });
  }
  if (items.length < 6 && (lowerDesc.includes('metronome') || lowerDesc.includes('count') && lowerDesc.includes('beat'))) {
    const correct = 'Practice with a metronome and count out loud';
    const opts = [correct, 'Play as fast as possible', 'Ignore the beat', 'Practice only once a week'];
    items.push({ type: 'multiple_choice', question: `What does this lesson recommend for improving timing?`, options: opts, correctAnswer: opts.indexOf(correct), explanation: fullExplanation });
  }
  if (items.length < 6 && (lowerDesc.includes('move the shape') || lowerDesc.includes('movable')) && lowerDesc.includes('fret')) {
    const correct = 'The key (pitch) of the chord changes';
    const opts = [correct, 'The chord becomes minor', 'The number of strings changes', 'Nothing changes'];
    items.push({ type: 'multiple_choice', question: `When you move the same chord shape to a different fret, what does this lesson say changes?`, options: opts, correctAnswer: opts.indexOf(correct), explanation: fullExplanation });
  }

  // 3) Fill-blank from a specific sentence (lesson-specific) — use single-word options
  if (items.length < 6 && factPool.length > 0) {
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
  if (items.length < 4 && factPool.length > 0) {
    for (let i = 0; i < factPool.length && items.length < 6; i++) {
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
  return { title, items: items.slice(0, 8) };
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
