/**
 * One-off patch: melodyOnly for novice/beginner + bulk new catalog entries.
 * Run: node scripts/patch-guitar-songs.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const p = path.join(__dirname, '../src/data/guitar-content.json');
const j = JSON.parse(fs.readFileSync(p, 'utf8'));

for (const level of ['novice', 'beginner']) {
  const block = j.songs[level];
  if (!block) continue;
  for (const genre of Object.keys(block)) {
    const arr = block[genre];
    if (!Array.isArray(arr)) continue;
    for (const song of arr) {
      song.melodyOnly = true;
    }
  }
}

const add = (level, genre, songs) => {
  if (!j.songs[level][genre]) j.songs[level][genre] = [];
  j.songs[level][genre].push(...songs);
};

// --- ~14 novice (simple melodies / kids / classics) ---
add('novice', 'pop', [
  { title: 'Baa Baa Black Sheep', artist: 'Traditional', difficulty: 1, chords: ['C', 'G', 'F'], genre: 'pop', duration: '1:00', bpm: 100, learningTime: '1 day' },
  { title: 'Frère Jacques', artist: 'Traditional', difficulty: 1, chords: ['C', 'G'], genre: 'pop', duration: '1:00', bpm: 108, learningTime: '1 day' },
  { title: 'The Itsy Bitsy Spider', artist: 'Traditional', difficulty: 1, chords: ['C', 'G', 'Am'], genre: 'pop', duration: '0:45', bpm: 110, learningTime: '1 day' },
  { title: 'London Bridge', artist: 'Traditional', difficulty: 1, chords: ['C', 'F', 'G'], genre: 'pop', duration: '1:10', bpm: 120, learningTime: '2 days' },
  { title: 'Hot Cross Buns', artist: 'Traditional', difficulty: 1, chords: ['C', 'D', 'E'], genre: 'pop', duration: '0:40', bpm: 96, learningTime: '1 day' },
]);

add('novice', 'folk', [
  { title: 'When the Saints Go Marching In', artist: 'Traditional', difficulty: 1, chords: ['C', 'F', 'G'], genre: 'folk', duration: '2:00', bpm: 100, learningTime: '3 days' },
  { title: 'Camptown Races', artist: 'Stephen Foster', difficulty: 1, chords: ['C', 'G7'], genre: 'folk', duration: '1:45', bpm: 120, learningTime: '3 days' },
  { title: 'Yankee Doodle', artist: 'Traditional', difficulty: 1, chords: ['C', 'G', 'F'], genre: 'folk', duration: '1:20', bpm: 120, learningTime: '2 days' },
]);

add('novice', 'classical', [
  { title: 'Brahms Lullaby (Simple)', artist: 'Johannes Brahms', difficulty: 1, chords: ['C', 'G', 'Am'], genre: 'classical', duration: '1:30', bpm: 72, learningTime: '4 days' },
  { title: 'Minuet in G (Fragment)', artist: 'Petzold / Bach notebook', difficulty: 1, chords: ['G', 'C', 'D'], genre: 'classical', duration: '1:15', bpm: 100, learningTime: '4 days' },
  { title: 'Musette in D (Simple)', artist: 'J.S. Bach', difficulty: 1, chords: ['D', 'G', 'A'], genre: 'classical', duration: '1:20', bpm: 96, learningTime: '5 days' },
  { title: 'Au Clair de la Lune', artist: 'Traditional', difficulty: 1, chords: ['C', 'F', 'G'], genre: 'classical', duration: '1:10', bpm: 90, learningTime: '3 days' },
]);

add('novice', 'rock', [
  { title: 'Seven Nation Army (Riff Melody)', artist: 'The White Stripes', difficulty: 1, chords: ['E', 'G', 'A'], genre: 'rock', duration: '1:30', bpm: 124, learningTime: '3 days' },
]);

// --- ~14 beginner (modern hits + requested) ---
add('beginner', 'pop', [
  { title: 'Love Story', artist: 'Taylor Swift', difficulty: 2, chords: ['C', 'G', 'Am', 'F'], genre: 'pop', duration: '3:56', bpm: 120, learningTime: '2 weeks' },
  { title: 'Castle on the Hill', artist: 'Ed Sheeran', difficulty: 2, chords: ['D', 'G', 'Bm', 'A'], genre: 'pop', duration: '4:21', bpm: 87, learningTime: '2 weeks' },
  { title: 'Shake It Off', artist: 'Taylor Swift', difficulty: 2, chords: ['Am', 'C', 'G'], genre: 'pop', duration: '3:39', bpm: 160, learningTime: '2 weeks' },
  { title: 'Viva La Vida', artist: 'Coldplay', difficulty: 2, chords: ['Db', 'Eb', 'Ab', 'Fm'], genre: 'pop', duration: '4:01', bpm: 138, learningTime: '2 weeks' },
  { title: 'Riptide', artist: 'Vance Joy', difficulty: 2, chords: ['Am', 'G', 'C'], genre: 'pop', duration: '3:24', bpm: 150, learningTime: '2 weeks' },
  { title: "I'm Yours", artist: 'Jason Mraz', difficulty: 2, chords: ['G', 'D', 'Em', 'C'], genre: 'pop', duration: '4:03', bpm: 150, learningTime: '2 weeks' },
  { title: 'Watermelon Sugar', artist: 'Harry Styles', difficulty: 2, chords: ['Dm', 'Am', 'C'], genre: 'pop', duration: '2:54', bpm: 95, learningTime: '2 weeks' },
  { title: 'Blinding Lights', artist: 'The Weeknd', difficulty: 2, chords: ['Am', 'F', 'C', 'G'], genre: 'pop', duration: '3:20', bpm: 171, learningTime: '2 weeks' },
  { title: 'As It Was', artist: 'Harry Styles', difficulty: 2, chords: ['F', 'Dm', 'C', 'Bb'], genre: 'pop', duration: '2:47', bpm: 174, learningTime: '2 weeks' },
  { title: 'Flowers', artist: 'Miley Cyrus', difficulty: 2, chords: ['Am', 'Dm', 'G', 'C'], genre: 'pop', duration: '3:20', bpm: 118, learningTime: '2 weeks' },
  { title: 'Counting Stars', artist: 'OneRepublic', difficulty: 2, chords: ['Am', 'C', 'G', 'F'], genre: 'pop', duration: '4:17', bpm: 122, learningTime: '2 weeks' },
  { title: 'Photograph', artist: 'Ed Sheeran', difficulty: 2, chords: ['D', 'Bm', 'G', 'A'], genre: 'pop', duration: '4:18', bpm: 108, learningTime: '2 weeks' },
]);

add('beginner', 'classical', [
  { title: 'Gavotte in G (Simple)', artist: 'J.S. Bach', difficulty: 2, chords: ['G', 'C', 'D', 'Em'], genre: 'classical', duration: '2:00', bpm: 100, learningTime: '3 weeks' },
  { title: 'Bourrée in E Minor (Simple)', artist: 'J.S. Bach', difficulty: 2, chords: ['Em', 'B7', 'Am', 'D'], genre: 'classical', duration: '2:30', bpm: 88, learningTime: '3 weeks' },
]);

// --- ~12 elementary ---
add('elementary', 'pop', [
  { title: 'Anti-Hero', artist: 'Taylor Swift', difficulty: 3, chords: ['C', 'Am', 'F', 'G'], genre: 'pop', duration: '3:20', bpm: 97, learningTime: '3 weeks' },
  { title: 'Levitating', artist: 'Dua Lipa', difficulty: 3, chords: ['Bm', 'F#m', 'E', 'A'], genre: 'pop', duration: '3:23', bpm: 104, learningTime: '3 weeks' },
  { title: 'Shallow', artist: 'Lady Gaga & Bradley Cooper', difficulty: 3, chords: ['Em', 'D', 'G', 'C'], genre: 'pop', duration: '3:37', bpm: 96, learningTime: '3 weeks' },
  { title: 'Easy On Me', artist: 'Adele', difficulty: 3, chords: ['F', 'Am', 'Dm', 'Bb'], genre: 'pop', duration: '3:45', bpm: 142, learningTime: '3 weeks' },
  { title: 'Heat Waves', artist: 'Glass Animals', difficulty: 3, chords: ['C', 'Bm', 'Am', 'G'], genre: 'pop', duration: '3:58', bpm: 81, learningTime: '3 weeks' },
  { title: 'Save Your Tears', artist: 'The Weeknd', difficulty: 3, chords: ['Am', 'Dm', 'G', 'C'], genre: 'pop', duration: '3:35', bpm: 118, learningTime: '3 weeks' },
]);

add('elementary', 'rock', [
  { title: 'Believer', artist: 'Imagine Dragons', difficulty: 3, chords: ['Bm', 'G', 'D', 'A'], genre: 'rock', duration: '3:24', bpm: 125, learningTime: '3 weeks' },
  { title: 'Thunder', artist: 'Imagine Dragons', difficulty: 3, chords: ['C', 'G', 'Am', 'F'], genre: 'rock', duration: '3:07', bpm: 84, learningTime: '3 weeks' },
  { title: 'Good 4 U', artist: 'Olivia Rodrigo', difficulty: 3, chords: ['G', 'Em', 'C', 'D'], genre: 'rock', duration: '2:58', bpm: 166, learningTime: '3 weeks' },
]);

add('elementary', 'country', [
  { title: 'Before He Cheats', artist: 'Carrie Underwood', difficulty: 3, chords: ['Fm', 'Bb', 'Eb', 'Ab'], genre: 'country', duration: '3:19', bpm: 148, learningTime: '3 weeks' },
  { title: 'Take Me To Church', artist: 'Hozier', difficulty: 3, chords: ['Em', 'Am', 'G', 'D'], genre: 'country', duration: '4:01', bpm: 129, learningTime: '3 weeks' },
]);

add('elementary', 'folk', [
  { title: 'Calm Down', artist: 'Rema & Selena Gomez', difficulty: 3, chords: ['Am', 'F', 'C', 'G'], genre: 'folk', duration: '3:59', bpm: 107, learningTime: '3 weeks' },
]);

// --- Intermediate +8 ---
add('intermediate', 'rock', [
  { title: 'Californication', artist: 'Red Hot Chili Peppers', difficulty: 4, chords: ['Am', 'F', 'C', 'G', 'Dm'], genre: 'rock', duration: '5:21', bpm: 92, learningTime: '4 weeks' },
  { title: 'Everlong', artist: 'Foo Fighters', difficulty: 4, chords: ['D', 'Bm', 'G', 'A'], genre: 'rock', duration: '4:10', bpm: 158, learningTime: '5 weeks' },
  { title: 'Fix You', artist: 'Coldplay', difficulty: 4, chords: ['Eb', 'Gm', 'Cm', 'Bb'], genre: 'rock', duration: '4:55', bpm: 138, learningTime: '4 weeks' },
]);

add('intermediate', 'pop', [
  { title: 'Clocks', artist: 'Coldplay', difficulty: 4, chords: ['D', 'Am', 'Em'], genre: 'pop', duration: '5:07', bpm: 131, learningTime: '4 weeks' },
  { title: 'Valerie', artist: 'Amy Winehouse', difficulty: 4, chords: ['Bb', 'F', 'Gm', 'Eb'], genre: 'pop', duration: '3:39', bpm: 105, learningTime: '4 weeks' },
]);

add('intermediate', 'classical', [
  { title: 'Prelude in C Major (WTC I)', artist: 'J.S. Bach', difficulty: 4, chords: ['C', 'G', 'Am', 'F', 'Dm', 'Em'], genre: 'classical', duration: '2:20', bpm: 72, learningTime: '6 weeks' },
  { title: 'Gymnopédie No. 1 (Simple)', artist: 'Erik Satie', difficulty: 4, chords: ['Em', 'B7', 'C', 'Am'], genre: 'classical', duration: '3:30', bpm: 60, learningTime: '6 weeks' },
  { title: 'Canon in D (Melody Study)', artist: 'Pachelbel', difficulty: 4, chords: ['D', 'A', 'Bm', 'F#m', 'G'], genre: 'classical', duration: '4:00', bpm: 56, learningTime: '5 weeks' },
]);

// --- Proficient +8 ---
add('proficient', 'rock', [
  { title: 'Sultans of Swing (Intro)', artist: 'Dire Straits', difficulty: 5, chords: ['Dm', 'C', 'Bb', 'A'], genre: 'rock', duration: '2:30', bpm: 148, learningTime: '8 weeks' },
  { title: 'Layla (Unplugged feel)', artist: 'Eric Clapton', difficulty: 5, chords: ['Dm', 'Bb', 'C', 'A'], genre: 'rock', duration: '4:40', bpm: 96, learningTime: '8 weeks' },
]);

add('proficient', 'classical', [
  { title: 'Sarabande (Suite in D Minor)', artist: 'G.F. Handel', difficulty: 5, chords: ['Dm', 'Bb', 'C', 'Gm', 'A'], genre: 'classical', duration: '3:45', bpm: 52, learningTime: '10 weeks' },
  { title: 'Les Barricades Mystérieuses', artist: 'F. Couperin', difficulty: 5, chords: ['F', 'Bb', 'C', 'Dm', 'Am'], genre: 'classical', duration: '3:00', bpm: 60, learningTime: '12 weeks' },
  { title: 'Gigue from BWV 997', artist: 'J.S. Bach', difficulty: 5, chords: ['Am', 'G', 'C', 'Dm', 'E7'], genre: 'classical', duration: '2:45', bpm: 100, learningTime: '10 weeks' },
]);

add('proficient', 'jazz', [
  { title: 'Sunny', artist: 'Bobby Hebb', difficulty: 5, chords: ['Am7', 'Dm7', 'G7', 'CMaj7', 'Fm7', 'Bb7'], genre: 'jazz', duration: '3:00', bpm: 126, learningTime: '8 weeks' },
  { title: 'Blue in Green (Simple)', artist: 'Miles Davis', difficulty: 5, chords: ['Gm7', 'C7alt', 'FMaj7'], genre: 'jazz', duration: '3:00', bpm: 60, learningTime: '10 weeks' },
  { title: 'Take Five (Head)', artist: 'Dave Brubeck', difficulty: 5, chords: ['Em', 'Bbm', 'Dm'], genre: 'jazz', duration: '2:00', bpm: 175, learningTime: '8 weeks' },
]);

// --- Advanced +7 ---
add('advanced', 'classical', [
  { title: 'Goldberg Variations: Aria', artist: 'J.S. Bach', difficulty: 6, chords: ['G', 'D', 'Em', 'C', 'Am', 'B7'], genre: 'classical', duration: '3:20', bpm: 42, learningTime: '4 months' },
  { title: 'Sonata K. 87 (Scarlatti)', artist: 'D. Scarlatti', difficulty: 6, chords: ['Am', 'E7', 'Dm', 'G', 'C'], genre: 'classical', duration: '3:10', bpm: 120, learningTime: '3 months' },
  { title: 'Winter (Largo) from Four Seasons', artist: 'A. Vivaldi', difficulty: 6, chords: ['Cm', 'Ab', 'Bb', 'Eb', 'G'], genre: 'classical', duration: '3:30', bpm: 40, learningTime: '4 months' },
  { title: 'Fugue in G Minor BWV 578 (Little)', artist: 'J.S. Bach', difficulty: 6, chords: ['Gm', 'Bb', 'F', 'Cm', 'D'], genre: 'classical', duration: '3:45', bpm: 96, learningTime: '5 months' },
]);

add('advanced', 'rock', [
  { title: 'Master of Puppets (Intro)', artist: 'Metallica', difficulty: 6, chords: ['E', 'F', 'Dm', 'Am'], genre: 'rock', duration: '2:00', bpm: 212, learningTime: '3 months' },
  { title: 'Comfortably Numb (Solo section)', artist: 'Pink Floyd', difficulty: 6, chords: ['Bm', 'A', 'G', 'D', 'Em'], genre: 'rock', duration: '4:00', bpm: 72, learningTime: '4 months' },
]);

add('advanced', 'jazz', [
  { title: 'Spain (Intro motif)', artist: 'Chick Corea', difficulty: 6, chords: ['Bm7', 'E7', 'AMaj7', 'F#m7'], genre: 'jazz', duration: '2:30', bpm: 120, learningTime: '6 months' },
]);

// --- Expert +7 ---
add('expert', 'classical', [
  { title: 'Chaconne from BWV 1004 (Excerpt)', artist: 'J.S. Bach', difficulty: 7, chords: ['Dm', 'A', 'Bb', 'F', 'Gm', 'C'], genre: 'classical', duration: '4:00', bpm: 40, learningTime: '2 years' },
  { title: 'Partita No. 2: Sarabanda', artist: 'J.S. Bach', difficulty: 7, chords: ['Dm', 'Gm', 'A', 'Bb', 'C'], genre: 'classical', duration: '3:30', bpm: 48, learningTime: '18 months' },
  { title: 'Contrapunctus I (Art of Fugue excerpt)', artist: 'J.S. Bach', difficulty: 7, chords: ['Dm', 'Gm', 'C', 'F', 'Bb'], genre: 'classical', duration: '3:00', bpm: 72, learningTime: '2 years' },
  { title: 'Toccata and Fugue in D Minor (Riff)', artist: 'J.S. Bach', difficulty: 7, chords: ['Dm', 'A', 'Gm', 'Bb'], genre: 'classical', duration: '2:30', bpm: 120, learningTime: '1 year' },
]);

add('expert', 'metal', [
  { title: 'Through the Fire and Flames (Intro)', artist: 'DragonForce', difficulty: 7, chords: ['Em', 'C', 'D', 'G'], genre: 'metal', duration: '2:00', bpm: 200, learningTime: '1 year' },
]);

add('expert', 'jazz', [
  { title: 'Donna Lee (Head)', artist: 'Charlie Parker', difficulty: 7, chords: ['Bb', 'F7', 'Eb', 'Cm7'], genre: 'jazz', duration: '1:30', bpm: 200, learningTime: '10 months' },
  { title: 'Giant Steps (Slow study)', artist: 'John Coltrane', difficulty: 7, chords: ['B', 'D7', 'G', 'Bb7', 'Eb'], genre: 'jazz', duration: '2:00', bpm: 120, learningTime: '1 year' },
]);

// Re-apply melodyOnly for novice/beginner after push (new songs need flag)
for (const level of ['novice', 'beginner']) {
  const block = j.songs[level];
  for (const genre of Object.keys(block)) {
    const arr = block[genre];
    if (!Array.isArray(arr)) continue;
    for (const song of arr) song.melodyOnly = true;
  }
}

fs.writeFileSync(p, JSON.stringify(j, null, 2) + '\n');
console.log('Wrote', p);
