export const guitarContent = {
  songs: {
    novice: {
      rock: [
        { title: "Smoke on the Water (Riff Only)", artist: "Deep Purple", difficulty: 1, chords: ["G", "Bb", "C"], genre: "rock", duration: "2:30", bpm: 112, learningTime: "1 week" },
        { title: "Wild Thing", artist: "The Troggs", difficulty: 1, chords: ["A", "D", "E"], genre: "rock", duration: "2:45", bpm: 108, learningTime: "3 days" },
        { title: "Louie Louie (Simple)", artist: "The Kingsmen", difficulty: 1, chords: ["A", "D", "Em"], genre: "rock", duration: "2:20", bpm: 126, learningTime: "4 days" }
      ],
      pop: [
        { title: "Happy Birthday", artist: "Traditional", difficulty: 1, chords: ["C", "F", "G"], genre: "pop", duration: "1:30", bpm: 120, learningTime: "2 days" },
        { title: "Twinkle Twinkle Little Star", artist: "Traditional", difficulty: 1, chords: ["C", "G"], genre: "pop", duration: "1:00", bpm: 120, learningTime: "1 day" },
        { title: "Row Row Row Your Boat", artist: "Traditional", difficulty: 1, chords: ["C", "G7"], genre: "pop", duration: "1:15", bpm: 100, learningTime: "2 days" }
      ],
      classical: [
        { title: "Ode to Joy (Simple)", artist: "Beethoven", difficulty: 1, chords: ["C", "G", "Am"], genre: "classical", duration: "2:00", bpm: 120, learningTime: "5 days" },
        { title: "Mary Had a Little Lamb", artist: "Traditional", difficulty: 1, chords: ["C", "F", "G"], genre: "classical", duration: "1:30", bpm: 108, learningTime: "3 days" }
      ],
      folk: [
        { title: "This Old Man", artist: "Traditional", difficulty: 1, chords: ["C", "G"], genre: "folk", duration: "2:00", bpm: 110, learningTime: "3 days" },
        { title: "Old MacDonald", artist: "Traditional", difficulty: 1, chords: ["C", "F", "G"], genre: "folk", duration: "2:30", bpm: 120, learningTime: "4 days" },
        { title: "Kumbaya", artist: "Traditional", difficulty: 1, chords: ["C", "F", "G"], genre: "folk", duration: "3:00", bpm: 90, learningTime: "4 days" }
      ],
      blues: [
        { title: "Simple 12-Bar Blues", artist: "Traditional", difficulty: 1, chords: ["E", "A", "B7"], genre: "blues", duration: "3:00", bpm: 80, learningTime: "1 week" },
        { title: "Freight Train", artist: "Elizabeth Cotten", difficulty: 1, chords: ["C", "G"], genre: "blues", duration: "2:45", bpm: 100, learningTime: "5 days" }
      ],
      country: [
        { title: "Home on the Range", artist: "Traditional", difficulty: 1, chords: ["C", "F", "G"], genre: "country", duration: "3:00", bpm: 110, learningTime: "5 days" },
        { title: "She'll Be Coming Round", artist: "Traditional", difficulty: 1, chords: ["C", "G"], genre: "country", duration: "2:30", bpm: 130, learningTime: "4 days" }
      ]
    },
    beginner: {
      rock: [
        { title: "Wonderwall", artist: "Oasis", difficulty: 2, chords: ["Em", "C", "D", "G"], genre: "rock", duration: "4:18", bpm: 87, learningTime: "2 weeks" },
        { title: "Horse with No Name", artist: "America", difficulty: 2, chords: ["Em", "D"], genre: "rock", duration: "4:08", bpm: 120, learningTime: "1 week" },
        { title: "Bad Moon Rising", artist: "CCR", difficulty: 2, chords: ["D", "A", "G"], genre: "rock", duration: "2:20", bpm: 180, learningTime: "1 week" },
        { title: "Paperback Writer", artist: "The Beatles", difficulty: 2, chords: ["G", "C"], genre: "rock", duration: "2:18", bpm: 132, learningTime: "1 week" }
      ],
      pop: [
        { title: "Let It Be", artist: "The Beatles", difficulty: 2, chords: ["C", "G", "Am", "F"], genre: "pop", duration: "4:03", bpm: 73, learningTime: "2 weeks" },
        { title: "Perfect", artist: "Ed Sheeran", difficulty: 2, chords: ["G", "Em", "C", "D"], genre: "pop", duration: "4:23", bpm: 95, learningTime: "2 weeks" },
        { title: "Someone Like You", artist: "Adele", difficulty: 2, chords: ["G", "D", "Em", "C"], genre: "pop", duration: "4:45", bpm: 67, learningTime: "2 weeks" },
        { title: "Hey Jude", artist: "The Beatles", difficulty: 2, chords: ["F", "C", "G", "Am"], genre: "pop", duration: "7:11", bpm: 75, learningTime: "3 weeks" }
      ],
      classical: [
        { title: "Canon in D (Simple)", artist: "Pachelbel", difficulty: 2, chords: ["D", "A", "Bm", "G"], genre: "classical", duration: "5:00", bpm: 50, learningTime: "3 weeks" },
        { title: "Minuet in G", artist: "Bach", difficulty: 2, chords: ["G", "D", "C"], genre: "classical", duration: "2:30", bpm: 120, learningTime: "2 weeks" },
        { title: "Air on G String (Simple)", artist: "Bach", difficulty: 2, chords: ["D", "G", "A"], genre: "classical", duration: "3:00", bpm: 60, learningTime: "2 weeks" }
      ],
      folk: [
        { title: "Blowin' in the Wind", artist: "Bob Dylan", difficulty: 2, chords: ["C", "F", "G"], genre: "folk", duration: "2:48", bpm: 90, learningTime: "1 week" },
        { title: "Scarborough Fair", artist: "Traditional", difficulty: 2, chords: ["Am", "C", "Dm"], genre: "folk", duration: "3:10", bpm: 100, learningTime: "2 weeks" },
        { title: "The Times They Are A-Changin'", artist: "Bob Dylan", difficulty: 2, chords: ["G", "Em", "C", "D"], genre: "folk", duration: "3:14", bpm: 120, learningTime: "2 weeks" }
      ],
      blues: [
        { title: "House of the Rising Sun", artist: "The Animals", difficulty: 2, chords: ["Am", "C", "D", "F"], genre: "blues", duration: "4:29", bpm: 90, learningTime: "2 weeks" },
        { title: "Midnight Special", artist: "Traditional", difficulty: 2, chords: ["E", "A", "B7"], genre: "blues", duration: "3:30", bpm: 120, learningTime: "1 week" },
        { title: "The Thrill Is Gone (Simple)", artist: "B.B. King", difficulty: 2, chords: ["Am", "Dm", "E7"], genre: "blues", duration: "5:24", bpm: 60, learningTime: "2 weeks" }
      ],
      country: [
        { title: "Take Me Home, Country Roads", artist: "John Denver", difficulty: 2, chords: ["G", "Em", "C", "D"], genre: "country", duration: "3:15", bpm: 80, learningTime: "2 weeks" },
        { title: "Ring of Fire", artist: "Johnny Cash", difficulty: 2, chords: ["G", "C", "D"], genre: "country", duration: "2:38", bpm: 150, learningTime: "1 week" },
        { title: "Friends in Low Places", artist: "Garth Brooks", difficulty: 2, chords: ["A", "D", "E"], genre: "country", duration: "4:28", bpm: 120, learningTime: "2 weeks" }
      ]
    },
    elementary: {
      rock: [
        { title: "Zombie", artist: "The Cranberries", difficulty: 3, chords: ["Em", "C", "G", "D"], genre: "rock", duration: "5:07", bpm: 84, learningTime: "3 weeks" },
        { title: "Creep", artist: "Radiohead", difficulty: 3, chords: ["G", "B", "C", "Cm"], genre: "rock", duration: "3:58", bpm: 92, learningTime: "3 weeks" },
        { title: "With or Without You", artist: "U2", difficulty: 3, chords: ["D", "A", "Bm", "G"], genre: "rock", duration: "4:56", bpm: 110, learningTime: "3 weeks" }
      ],
      pop: [
        { title: "Someone You Loved", artist: "Lewis Capaldi", difficulty: 3, chords: ["C", "G", "Am", "F"], genre: "pop", duration: "3:02", bpm: 110, learningTime: "2 weeks" },
        { title: "All of Me", artist: "John Legend", difficulty: 3, chords: ["Em", "C", "G", "D"], genre: "pop", duration: "4:29", bpm: 120, learningTime: "3 weeks" },
        { title: "Stay With Me", artist: "Sam Smith", difficulty: 3, chords: ["Am", "C", "F"], genre: "pop", duration: "2:52", bpm: 84, learningTime: "2 weeks" }
      ],
      folk: [
        { title: "Fast Car", artist: "Tracy Chapman", difficulty: 3, chords: ["C", "G", "Em", "D"], genre: "folk", duration: "4:56", bpm: 104, learningTime: "3 weeks" },
        { title: "Mad World", artist: "Gary Jules", difficulty: 3, chords: ["Em", "G", "D", "C"], genre: "folk", duration: "3:07", bpm: 75, learningTime: "2 weeks" }
      ]
    },
    intermediate: {
      rock: [
        { title: "Stairway to Heaven", artist: "Led Zeppelin", difficulty: 4, chords: ["Am", "C", "D", "F", "G"], genre: "rock", duration: "8:02", bpm: 82, learningTime: "4 weeks" },
        { title: "More Than Words", artist: "Extreme", difficulty: 4, chords: ["G", "C", "Am", "D", "Em"], genre: "rock", duration: "5:34", bpm: 91, learningTime: "4 weeks" },
        { title: "Blackbird", artist: "The Beatles", difficulty: 4, chords: ["G", "Am", "C", "D", "Em"], genre: "rock", duration: "2:18", bpm: 96, learningTime: "5 weeks" }
      ],
      classical: [
        { title: "Romance de Amor", artist: "Anonymous", difficulty: 4, chords: ["Em", "Am", "B7", "C", "D"], genre: "classical", duration: "3:30", bpm: 60, learningTime: "6 weeks" },
        { title: "Lágrima", artist: "Francisco Tárrega", difficulty: 4, chords: ["E", "Am", "C", "G"], genre: "classical", duration: "2:45", bpm: 70, learningTime: "8 weeks" }
      ],
      jazz: [
        { title: "Autumn Leaves", artist: "Joseph Kosma", difficulty: 4, chords: ["Cm", "F7", "BbMaj7", "EbMaj7", "Am7b5", "D7", "Gm"], genre: "jazz", duration: "3:00", bpm: 120, learningTime: "6 weeks" },
        { title: "Fly Me to the Moon", artist: "Frank Sinatra", difficulty: 4, chords: ["Am", "Dm", "G", "C", "F", "Bm7b5", "E7"], genre: "jazz", duration: "2:30", bpm: 110, learningTime: "5 weeks" }
      ]
    },
    proficient: {
      rock: [
        { title: "Hotel California", artist: "Eagles", difficulty: 5, chords: ["Bm", "F#", "A", "E", "G", "D", "Em"], genre: "rock", duration: "6:30", bpm: 74, learningTime: "6 weeks" },
        { title: "Nothing Else Matters", artist: "Metallica", difficulty: 5, chords: ["Em", "Am", "C", "D", "G", "B7"], genre: "rock", duration: "6:28", bpm: 72, learningTime: "8 weeks" }
      ],
      classical: [
        { title: "Asturias", artist: "Isaac Albéniz", difficulty: 5, chords: ["Em", "Am", "B7", "C", "D", "G"], genre: "classical", duration: "6:00", bpm: 120, learningTime: "12 weeks" },
        { title: "Recuerdos de la Alhambra", artist: "Francisco Tárrega", difficulty: 5, chords: ["Am", "E7", "Dm", "G7", "C"], genre: "classical", duration: "4:20", bpm: 60, learningTime: "16 weeks" }
      ],
      jazz: [
        { title: "All The Things You Are", artist: "Jerome Kern", difficulty: 5, chords: ["Fm", "Bb7", "EbMaj7", "AbMaj7", "DbMaj7", "G7", "CMaj7"], genre: "jazz", duration: "4:00", bpm: 120, learningTime: "8 weeks" },
        { title: "Body and Soul", artist: "Johnny Green", difficulty: 5, chords: ["DbMaj7", "Dm7b5", "G7", "CMaj7", "Em7", "A7", "Dm7"], genre: "jazz", duration: "3:30", bpm: 60, learningTime: "10 weeks" }
      ]
    },
    advanced: {
      rock: [
        { title: "Cliffs of Dover", artist: "Eric Johnson", difficulty: 6, chords: ["G", "D", "Em", "C", "Am", "F"], genre: "rock", duration: "4:16", bpm: 134, learningTime: "12 weeks" },
        { title: "Little Wing", artist: "Jimi Hendrix", difficulty: 6, chords: ["Em", "G", "Am", "C", "D", "Bm", "Bb"], genre: "rock", duration: "2:24", bpm: 63, learningTime: "10 weeks" }
      ],
      classical: [
        { title: "Concierto de Aranjuez", artist: "Joaquín Rodrigo", difficulty: 6, chords: ["Am", "E7", "F", "C", "G", "Dm"], genre: "classical", duration: "11:24", bpm: 60, learningTime: "6 months" },
        { title: "Capricho Árabe", artist: "Francisco Tárrega", difficulty: 6, chords: ["Dm", "A7", "Gm", "C7", "F", "Bb"], genre: "classical", duration: "5:30", bpm: 80, learningTime: "4 months" }
      ],
      jazz: [
        { title: "Giant Steps", artist: "John Coltrane", difficulty: 6, chords: ["B", "D7", "G", "Bb7", "Eb", "Am7", "D7"], genre: "jazz", duration: "4:43", bpm: 266, learningTime: "12 weeks" },
        { title: "Cherokee", artist: "Ray Noble", difficulty: 6, chords: ["BbMaj7", "G7", "Cm7", "F7", "Dm7", "G7", "CMaj7"], genre: "jazz", duration: "3:00", bpm: 300, learningTime: "10 weeks" }
      ]
    },
    expert: {
      rock: [
        { title: "Eruption", artist: "Van Halen", difficulty: 7, chords: ["E", "A", "D", "G"], genre: "rock", duration: "1:42", bpm: 100, learningTime: "6 months" },
        { title: "YYZ", artist: "Rush", difficulty: 7, chords: ["E", "F#", "G#", "A"], genre: "rock", duration: "4:24", bpm: 88, learningTime: "8 months" },
        { title: "For the Love of God", artist: "Steve Vai", difficulty: 7, chords: ["Em", "C", "G", "D"], genre: "rock", duration: "6:02", bpm: 65, learningTime: "1 year" }
      ],
      classical: [
        { title: "Cello Suite No. 1", artist: "Bach", difficulty: 7, chords: ["G", "D", "C"], genre: "classical", duration: "18:00", bpm: 60, learningTime: "1 year" },
        { title: "Caprice No. 24", artist: "Paganini", difficulty: 7, chords: ["Am", "E", "F", "G"], genre: "classical", duration: "4:30", bpm: 120, learningTime: "2 years" },
        { title: "Chaconne", artist: "Bach", difficulty: 7, chords: ["Dm", "A", "Bb", "F"], genre: "classical", duration: "13:30", bpm: 60, learningTime: "2 years" }
      ],
      jazz: [
        { title: "Giant Steps (Advanced)", artist: "John Coltrane", difficulty: 7, chords: ["B", "D", "G", "Bb", "Eb"], genre: "jazz", duration: "4:43", bpm: 266, learningTime: "1 year" },
        { title: "Donna Lee", artist: "Charlie Parker", difficulty: 7, chords: ["AbMaj7", "F7", "BbMaj7", "G7", "CMaj7", "C7"], genre: "jazz", duration: "2:33", bpm: 200, learningTime: "8 months" }
      ],
      metal: [
        { title: "Technical Difficulties", artist: "Paul Gilbert", difficulty: 7, chords: ["Em", "G", "D", "C"], genre: "metal", duration: "3:14", bpm: 140, learningTime: "10 months" },
        { title: "The Dance of Eternity", artist: "Dream Theater", difficulty: 7, chords: ["Em", "C", "G", "D"], genre: "metal", duration: "6:13", bpm: 120, learningTime: "1 year" }
      ]
    }
  },
  techniques: {
    novice: {
      foundation: [
        { name: "Proper Posture", category: "Foundation", difficulty: 1, description: "Learn correct sitting and standing positions", practiceTime: "5 min daily", masteryTime: "1 week" },
        { name: "Hand Positioning", category: "Foundation", difficulty: 1, description: "Proper fretting and picking hand placement", practiceTime: "10 min daily", masteryTime: "1 week" },
        { name: "String Names", category: "Foundation", difficulty: 1, description: "Memorize E-A-D-G-B-E", practiceTime: "5 min daily", masteryTime: "3 days" },
        { name: "Fret Numbers", category: "Foundation", difficulty: 1, description: "Understanding fret numbering system", practiceTime: "5 min daily", masteryTime: "3 days" }
      ],
      picking: [
        { name: "Single Note Picking", category: "Picking", difficulty: 1, description: "Clean individual string picking", practiceTime: "10 min daily", masteryTime: "1 week" },
        { name: "Downstrokes Only", category: "Picking", difficulty: 1, description: "Basic downstroke rhythm", practiceTime: "10 min daily", masteryTime: "5 days" }
      ],
      chords: [
        { name: "Open E Major", category: "Chords", difficulty: 1, description: "First chord - E major", practiceTime: "15 min daily", masteryTime: "3 days" },
        { name: "Open A Major", category: "Chords", difficulty: 1, description: "Second chord - A major", practiceTime: "15 min daily", masteryTime: "4 days" },
        { name: "Open D Major", category: "Chords", difficulty: 1, description: "Third chord - D major", practiceTime: "15 min daily", masteryTime: "5 days" }
      ]
    },
    beginner: {
      chords: [
        { name: "Major Chord Family", category: "Chords", difficulty: 2, description: "C, D, E, G, A major chords", practiceTime: "20 min daily", masteryTime: "2 weeks" },
        { name: "Minor Chord Family", category: "Chords", difficulty: 2, description: "Am, Dm, Em minor chords", practiceTime: "20 min daily", masteryTime: "2 weeks" },
        { name: "Chord Transitions", category: "Chords", difficulty: 2, description: "Smooth changes between chords", practiceTime: "15 min daily", masteryTime: "3 weeks" },
        { name: "Barre Chord Preparation", category: "Chords", difficulty: 2, description: "Building finger strength for barres", practiceTime: "10 min daily", masteryTime: "4 weeks" }
      ],
      strumming: [
        { name: "Down-Up Strumming", category: "Rhythm", difficulty: 2, description: "Basic down-up pattern", practiceTime: "15 min daily", masteryTime: "1 week" },
        { name: "Quarter Note Rhythm", category: "Rhythm", difficulty: 2, description: "Steady quarter note strumming", practiceTime: "10 min daily", masteryTime: "5 days" },
        { name: "Eighth Note Rhythm", category: "Rhythm", difficulty: 2, description: "Basic eighth note patterns", practiceTime: "15 min daily", masteryTime: "2 weeks" }
      ],
      picking: [
        { name: "Alternate Picking", category: "Picking", difficulty: 2, description: "Down-up picking technique", practiceTime: "15 min daily", masteryTime: "3 weeks" },
        { name: "Single String Scales", category: "Picking", difficulty: 2, description: "Scale practice on one string", practiceTime: "10 min daily", masteryTime: "2 weeks" }
      ]
    },
    elementary: {
      chords: [
        { name: "F Major Barre", category: "Chords", difficulty: 3, description: "First barre chord", practiceTime: "25 min daily", masteryTime: "4 weeks" },
        { name: "B Minor Barre", category: "Chords", difficulty: 3, description: "Minor barre chord", practiceTime: "25 min daily", masteryTime: "3 weeks" },
        { name: "Seventh Chords", category: "Chords", difficulty: 3, description: "G7, C7, D7, E7", practiceTime: "20 min daily", masteryTime: "3 weeks" },
        { name: "Sus Chords", category: "Chords", difficulty: 3, description: "sus2 and sus4 variations", practiceTime: "15 min daily", masteryTime: "2 weeks" }
      ],
      scales: [
        { name: "Pentatonic Minor", category: "Scales", difficulty: 3, description: "Box 1 pentatonic pattern", practiceTime: "20 min daily", masteryTime: "3 weeks" },
        { name: "Major Scale (1 Position)", category: "Scales", difficulty: 3, description: "Basic major scale pattern", practiceTime: "15 min daily", masteryTime: "4 weeks" }
      ],
      techniques: [
        { name: "Palm Muting", category: "Techniques", difficulty: 3, description: "Muted strumming technique", practiceTime: "15 min daily", masteryTime: "2 weeks" },
        { name: "Basic Fingerpicking", category: "Techniques", difficulty: 3, description: "P-i-m-a finger assignments", practiceTime: "20 min daily", masteryTime: "4 weeks" }
      ]
    },
    intermediate: {
      chords: [
        { name: "Extended Chords", category: "Chords", difficulty: 4, description: "maj7, min7, dom7 variations", practiceTime: "25 min daily", masteryTime: "4 weeks" },
        { name: "Moveable Barre Shapes", category: "Chords", difficulty: 4, description: "Major and minor barre patterns", practiceTime: "30 min daily", masteryTime: "6 weeks" },
        { name: "Slash Chords", category: "Chords", difficulty: 4, description: "Chords with bass notes", practiceTime: "20 min daily", masteryTime: "3 weeks" }
      ],
      scales: [
        { name: "Complete Pentatonic", category: "Scales", difficulty: 4, description: "All 5 pentatonic positions", practiceTime: "30 min daily", masteryTime: "8 weeks" },
        { name: "Major Scale (CAGED)", category: "Scales", difficulty: 4, description: "5 major scale positions", practiceTime: "35 min daily", masteryTime: "10 weeks" },
        { name: "Natural Minor Scale", category: "Scales", difficulty: 4, description: "Minor scale patterns", practiceTime: "25 min daily", masteryTime: "6 weeks" }
      ],
      techniques: [
        { name: "Travis Picking", category: "Fingerpicking", difficulty: 4, description: "Alternating bass fingerpicking", practiceTime: "25 min daily", masteryTime: "6 weeks" },
        { name: "Hammer-ons and Pull-offs", category: "Techniques", difficulty: 4, description: "Legato techniques", practiceTime: "20 min daily", masteryTime: "4 weeks" },
        { name: "Basic Bending", category: "Techniques", difficulty: 4, description: "Half and whole step bends", practiceTime: "15 min daily", masteryTime: "3 weeks" }
      ]
    },
    proficient: {
      chords: [
        { name: "Jazz Chord Voicings", category: "Chords", difficulty: 5, description: "Drop 2 and drop 3 voicings", practiceTime: "30 min daily", masteryTime: "8 weeks" },
        { name: "Altered Dominants", category: "Chords", difficulty: 5, description: "b5, #5, b9, #9 alterations", practiceTime: "25 min daily", masteryTime: "6 weeks" },
        { name: "Quartal Harmony", category: "Chords", difficulty: 5, description: "Fourth-based chord structures", practiceTime: "20 min daily", masteryTime: "4 weeks" }
      ],
      scales: [
        { name: "Modes of Major Scale", category: "Scales", difficulty: 5, description: "Ionian through Locrian", practiceTime: "40 min daily", masteryTime: "12 weeks" },
        { name: "Harmonic Minor", category: "Scales", difficulty: 5, description: "Harmonic minor and its modes", practiceTime: "30 min daily", masteryTime: "8 weeks" },
        { name: "Diminished Scales", category: "Scales", difficulty: 5, description: "Half-whole and whole-half", practiceTime: "25 min daily", masteryTime: "6 weeks" }
      ],
      techniques: [
        { name: "Advanced Fingerpicking", category: "Fingerpicking", difficulty: 5, description: "Complex arpeggiated patterns", practiceTime: "35 min daily", masteryTime: "10 weeks" },
        { name: "Artificial Harmonics", category: "Techniques", difficulty: 5, description: "Pinch and tap harmonics", practiceTime: "20 min daily", masteryTime: "6 weeks" },
        { name: "Advanced Bending", category: "Techniques", difficulty: 5, description: "Pre-bends, release bends", practiceTime: "25 min daily", masteryTime: "4 weeks" }
      ]
    },
    advanced: {
      techniques: [
        { name: "Sweep Picking", category: "Advanced", difficulty: 6, description: "Arpeggiated sweep technique", practiceTime: "45 min daily", masteryTime: "16 weeks" },
        { name: "Tapping", category: "Advanced", difficulty: 6, description: "Two-handed tapping", practiceTime: "30 min daily", masteryTime: "12 weeks" },
        { name: "Economy Picking", category: "Advanced", difficulty: 6, description: "Efficient picking technique", practiceTime: "40 min daily", masteryTime: "10 weeks" },
        { name: "String Skipping", category: "Advanced", difficulty: 6, description: "Non-adjacent string technique", practiceTime: "25 min daily", masteryTime: "8 weeks" }
      ],
      scales: [
        { name: "Exotic Scales", category: "Scales", difficulty: 6, description: "Hungarian, Byzantine, etc.", practiceTime: "35 min daily", masteryTime: "12 weeks" },
        { name: "Bebop Scales", category: "Scales", difficulty: 6, description: "Jazz bebop variations", practiceTime: "30 min daily", masteryTime: "8 weeks" }
      ],
      classical: [
        { name: "Classical Tremolo", category: "Classical", difficulty: 6, description: "p-a-m-i tremolo technique", practiceTime: "30 min daily", masteryTime: "20 weeks" },
        { name: "Rasgueado", category: "Classical", difficulty: 6, description: "Flamenco strumming technique", practiceTime: "25 min daily", masteryTime: "12 weeks" }
      ]
    },
    expert: {
      techniques: [
        { name: "Advanced Tremolo", category: "Master", difficulty: 7, description: "Rapid alternation classical technique", practiceTime: "60 min daily", masteryTime: "6 months" },
        { name: "Polyphonic Playing", category: "Master", difficulty: 7, description: "Multiple independent voices", practiceTime: "45 min daily", masteryTime: "8 months" },
        { name: "Extended Techniques", category: "Master", difficulty: 7, description: "Harmonics, rasgueado, and more", practiceTime: "40 min daily", masteryTime: "1 year" },
        { name: "Eight-Finger Tapping", category: "Master", difficulty: 7, description: "Advanced two-handed tapping", practiceTime: "50 min daily", masteryTime: "1 year" }
      ],
      classical: [
        { name: "Chord Melody", category: "Master", difficulty: 7, description: "Melody and harmony simultaneously", practiceTime: "60 min daily", masteryTime: "1 year" },
        { name: "Advanced Comping", category: "Master", difficulty: 7, description: "Complex jazz accompaniment", practiceTime: "45 min daily", masteryTime: "8 months" }
      ],
      metal: [
        { name: "Sweep Picking Mastery", category: "Master", difficulty: 7, description: "Advanced sweep picking patterns", practiceTime: "45 min daily", masteryTime: "1 year" },
        { name: "Extreme Alternate Picking", category: "Master", difficulty: 7, description: "High-speed precision picking", practiceTime: "60 min daily", masteryTime: "2 years" }
      ]
    }
  },
  theory: {
    novice: {
      basics: [
        { name: "Guitar Anatomy", category: "Basics", difficulty: 1, description: "Parts of the guitar", studyTime: "30 min", masteryTime: "1 day" },
        { name: "String Names", category: "Basics", difficulty: 1, description: "Learn the six string names", studyTime: "15 min", masteryTime: "1 day" },
        { name: "Fret Numbers", category: "Basics", difficulty: 1, description: "Understanding fret positions", studyTime: "20 min", masteryTime: "2 days" },
        { name: "Tablature Reading", category: "Basics", difficulty: 1, description: "How to read guitar tabs", studyTime: "45 min", masteryTime: "3 days" }
      ],
      rhythm: [
        { name: "Beat and Tempo", category: "Rhythm", difficulty: 1, description: "Understanding musical time", studyTime: "30 min", masteryTime: "2 days" },
        { name: "Counting Time", category: "Rhythm", difficulty: 1, description: "1-2-3-4 counting", studyTime: "20 min", masteryTime: "1 day" }
      ]
    },
    beginner: {
      chords: [
        { name: "Major vs Minor", category: "Chords", difficulty: 2, description: "Understanding chord quality", studyTime: "45 min", masteryTime: "3 days" },
        { name: "Chord Symbols", category: "Chords", difficulty: 2, description: "Reading chord charts", studyTime: "30 min", masteryTime: "2 days" },
        { name: "Triad Construction", category: "Chords", difficulty: 2, description: "How chords are built", studyTime: "60 min", masteryTime: "1 week" }
      ],
      scales: [
        { name: "Major Scale", category: "Scales", difficulty: 2, description: "The foundation scale", studyTime: "90 min", masteryTime: "2 weeks" },
        { name: "Scale Degrees", category: "Scales", difficulty: 2, description: "1-2-3-4-5-6-7-8 system", studyTime: "45 min", masteryTime: "1 week" }
      ],
      intervals: [
        { name: "Basic Intervals", category: "Intervals", difficulty: 2, description: "Unison to octave", studyTime: "75 min", masteryTime: "1 week" },
        { name: "Half Steps and Whole Steps", category: "Intervals", difficulty: 2, description: "Building blocks of music", studyTime: "30 min", masteryTime: "3 days" }
      ]
    },
    elementary: {
      keys: [
        { name: "Key Signatures", category: "Keys", difficulty: 3, description: "Major key signatures", studyTime: "90 min", masteryTime: "2 weeks" },
        { name: "Relative Minor", category: "Keys", difficulty: 3, description: "Major-minor relationships", studyTime: "60 min", masteryTime: "1 week" }
      ],
      progressions: [
        { name: "I-IV-V Progression", category: "Progressions", difficulty: 3, description: "Most common progression", studyTime: "75 min", masteryTime: "1 week" },
        { name: "vi-IV-I-V Progression", category: "Progressions", difficulty: 3, description: "Pop progression", studyTime: "60 min", masteryTime: "1 week" }
      ],
      scales: [
        { name: "Natural Minor Scale", category: "Scales", difficulty: 3, description: "Minor scale construction", studyTime: "90 min", masteryTime: "2 weeks" },
        { name: "Pentatonic Scales", category: "Scales", difficulty: 3, description: "5-note scales", studyTime: "75 min", masteryTime: "1 week" }
      ]
    },
    intermediate: {
      harmony: [
        { name: "Diatonic Harmony", category: "Harmony", difficulty: 4, description: "Chords in major keys", studyTime: "120 min", masteryTime: "3 weeks" },
        { name: "Secondary Dominants", category: "Harmony", difficulty: 4, description: "V/V, V/vi, etc.", studyTime: "90 min", masteryTime: "2 weeks" },
        { name: "Borrowed Chords", category: "Harmony", difficulty: 4, description: "Modal interchange", studyTime: "105 min", masteryTime: "3 weeks" }
      ],
      modes: [
        { name: "Church Modes", category: "Modes", difficulty: 4, description: "Dorian, Phrygian, etc.", studyTime: "150 min", masteryTime: "4 weeks" },
        { name: "Modal Harmony", category: "Modes", difficulty: 4, description: "Using modes harmonically", studyTime: "120 min", masteryTime: "3 weeks" }
      ],
      progressions: [
        { name: "Circle of Fifths", category: "Progressions", difficulty: 4, description: "Key relationships", studyTime: "90 min", masteryTime: "2 weeks" },
        { name: "Tritone Substitution", category: "Progressions", difficulty: 4, description: "Jazz substitution", studyTime: "75 min", masteryTime: "2 weeks" }
      ]
    },
    proficient: {
      jazz: [
        { name: "Jazz Chord Symbols", category: "Jazz", difficulty: 5, description: "Extended chord notation", studyTime: "120 min", masteryTime: "3 weeks" },
        { name: "ii-V-I Progressions", category: "Jazz", difficulty: 5, description: "Jazz standard progression", studyTime: "90 min", masteryTime: "2 weeks" },
        { name: "Chord Scales", category: "Jazz", difficulty: 5, description: "Scales for chord types", studyTime: "180 min", masteryTime: "6 weeks" }
      ],
      advanced_harmony: [
        { name: "Voice Leading", category: "Advanced", difficulty: 5, description: "Smooth chord connections", studyTime: "150 min", masteryTime: "4 weeks" },
        { name: "Chromatic Harmony", category: "Advanced", difficulty: 5, description: "Non-diatonic progressions", studyTime: "120 min", masteryTime: "3 weeks" }
      ]
    },
    advanced: {
      composition: [
        { name: "Song Form", category: "Composition", difficulty: 6, description: "AABA, verse-chorus, etc.", studyTime: "180 min", masteryTime: "4 weeks" },
        { name: "Motivic Development", category: "Composition", difficulty: 6, description: "Developing musical ideas", studyTime: "150 min", masteryTime: "6 weeks" },
        { name: "Counterpoint Basics", category: "Composition", difficulty: 6, description: "Independent melodic lines", studyTime: "240 min", masteryTime: "8 weeks" }
      ],
      analysis: [
        { name: "Roman Numeral Analysis", category: "Analysis", difficulty: 6, description: "Harmonic analysis system", studyTime: "120 min", masteryTime: "4 weeks" },
        { name: "Form Analysis", category: "Analysis", difficulty: 6, description: "Analyzing musical structure", studyTime: "150 min", masteryTime: "6 weeks" }
      ]
    },
    expert: {
      master_theory: [
        { name: "Advanced Jazz Harmony", category: "Master", difficulty: 7, description: "Complex jazz chord progressions", studyTime: "300 min", masteryTime: "12 weeks" },
        { name: "Counterpoint", category: "Master", difficulty: 7, description: "Bach-style voice leading", studyTime: "400 min", masteryTime: "6 months" },
        { name: "Modal Interchange", category: "Master", difficulty: 7, description: "Borrowing from parallel modes", studyTime: "240 min", masteryTime: "8 weeks" },
        { name: "Advanced Analysis", category: "Master", difficulty: 7, description: "Deep harmonic analysis", studyTime: "360 min", masteryTime: "4 months" }
      ],
      composition: [
        { name: "Serialism", category: "Master", difficulty: 7, description: "12-tone composition", studyTime: "480 min", masteryTime: "1 year" },
        { name: "Neo-Riemannian Theory", category: "Master", difficulty: 7, description: "Modern harmonic theory", studyTime: "360 min", masteryTime: "8 months" }
      ]
    }
  },
  competitions: {
    novice: [
      { name: "Chord Speed Challenge", type: "speed", difficulty: 1, description: "Switch between 3 chords in 30 seconds", timeLimit: 30, minScore: 15 },
      { name: "String Name Quiz", type: "knowledge", difficulty: 1, description: "Identify string names", timeLimit: 60, minScore: 80 },
      { name: "Simple Rhythm Match", type: "rhythm", difficulty: 1, description: "Clap along to basic beats", timeLimit: 45, minScore: 70 }
    ],
    beginner: [
      { name: "Chord Progression Race", type: "speed", difficulty: 2, description: "Play G-C-D progression cleanly", timeLimit: 45, minScore: 20 },
      { name: "Scale Knowledge Test", type: "knowledge", difficulty: 2, description: "Major scale intervals", timeLimit: 90, minScore: 75 },
      { name: "Strumming Pattern Challenge", type: "rhythm", difficulty: 2, description: "Down-up strumming accuracy", timeLimit: 60, minScore: 80 }
    ],
    elementary: [
      { name: "Barre Chord Endurance", type: "endurance", difficulty: 3, description: "Hold F major for 2 minutes", timeLimit: 120, minScore: 90 },
      { name: "Key Signature Challenge", type: "knowledge", difficulty: 3, description: "Identify major key signatures", timeLimit: 120, minScore: 70 },
      { name: "Fingerpicking Accuracy", type: "technique", difficulty: 3, description: "Basic fingerpicking pattern", timeLimit: 90, minScore: 75 }
    ],
    intermediate: [
      { name: "Scale Speed Test", type: "speed", difficulty: 4, description: "Pentatonic scale at 120 BPM", timeLimit: 60, minScore: 85 },
      { name: "Chord Theory Challenge", type: "knowledge", difficulty: 4, description: "Identify chord progressions", timeLimit: 180, minScore: 80 },
      { name: "Technique Showcase", type: "technique", difficulty: 4, description: "Demonstrate 5 techniques", timeLimit: 300, minScore: 85 }
    ],
    proficient: [
      { name: "Modal Mastery", type: "knowledge", difficulty: 5, description: "Modes and their applications", timeLimit: 240, minScore: 85 },
      { name: "Jazz Comping Test", type: "technique", difficulty: 5, description: "Chord melody playing", timeLimit: 180, minScore: 80 },
      { name: "Improvisation Challenge", type: "creativity", difficulty: 5, description: "Solo over changes", timeLimit: 120, minScore: 75 }
    ],
    advanced: [
      { name: "Sweep Picking Precision", type: "technique", difficulty: 6, description: "Clean arpeggiated sweeps", timeLimit: 90, minScore: 90 },
      { name: "Advanced Theory Test", type: "knowledge", difficulty: 6, description: "Voice leading and analysis", timeLimit: 300, minScore: 85 },
      { name: "Speed Demon Challenge", type: "speed", difficulty: 6, description: "16th notes at 160 BPM", timeLimit: 45, minScore: 95 }
    ],
    expert: [
      { name: "Master's Showcase", type: "performance", difficulty: 7, description: "Perform a complete piece", timeLimit: 600, minScore: 95 },
      { name: "Theory Doctorate", type: "knowledge", difficulty: 7, description: "Advanced harmonic analysis", timeLimit: 480, minScore: 90 },
      { name: "Technique Perfection", type: "technique", difficulty: 7, description: "Flawless execution test", timeLimit: 180, minScore: 98 }
    ]
  }
} as const;

export default guitarContent;