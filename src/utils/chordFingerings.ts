/**
 * Shared 6-string chord diagrams (string 6 = low E … string 1 = high e).
 * -1 = mute, 0 = open, 1+ = fret
 */
const CHORD_FINGERINGS: Record<string, number[]> = {
  Em: [0, 0, 0, 2, 2, 0],
  E: [0, 0, 1, 2, 2, 0],
  A: [0, 2, 2, 2, 0, -1],
  Am: [0, 1, 2, 2, 0, -1],
  D: [2, 3, 2, 0, -1, -1],
  G: [3, 0, 0, 0, 2, 3],
  C: [0, 1, 0, 2, 3, -1],
  F: [1, 1, 2, 3, 3, 1],
  B7: [2, 1, 2, 0, 2, 0],
  Dm: [-1, -1, 0, 2, 3, 1],
  G7: [3, 2, 0, 0, 0, 1],
  Fm: [1, 1, 1, 3, 3, 1],
  Gm: [3, 5, 5, 3, 3, 3],
  Cmaj7: [-1, 3, 2, 0, 0, 0],
  Dm7: [-1, -1, 0, 2, 1, 1],
  Am7: [-1, 0, 2, 0, 1, 0],
  E5: [0, 2, 2, -1, -1, -1],
  A5: [-1, 0, 2, 2, -1, -1],
  B5: [-1, 2, 4, 4, -1, -1],
  Bb: [-1, 1, 3, 3, 3, 1],
  Eb: [-1, -1, 1, 3, 3, 3],
  Ab: [4, 6, 6, 5, 4, 4],
  Db: [-1, 4, 3, 1, 2, 1],
  Bm: [2, 2, 4, 4, 3, 2],
  'F#m': [2, 4, 4, 2, 2, 2],
  'F#': [2, 4, 4, 3, 2, 2],
  B: [2, 2, 4, 4, 4, 2],
  BbMaj7: [-1, 1, 3, 2, 3, 1],
  EbMaj7: [-1, -1, 1, 3, 3, 2],
  AbMaj7: [4, 6, 5, 5, 4, 4],
  DbMaj7: [-1, 4, 3, 1, 1, 1],
};

export function getChordFingering(chordName: string): number[] {
  const raw = chordName.replace(/\s/g, '');
  if (CHORD_FINGERINGS[raw]) return [...CHORD_FINGERINGS[raw]];
  const keyExact = Object.keys(CHORD_FINGERINGS).find((k) => k.toLowerCase() === raw.toLowerCase());
  if (keyExact) return [...CHORD_FINGERINGS[keyExact]];

  const isMinor = /\bmin|m$/i.test(raw) || raw.toLowerCase().includes('minor');
  const base =
    raw.replace(/minor|min|m$/gi, '').replace(/major|maj7|maj|7|5/gi, '') || raw.charAt(0);
  const letter = base.charAt(0).toUpperCase() + base.slice(1).replace(/[^A-Za-z#b]/g, '');
  const key = letter + (isMinor ? 'm' : '');
  if (CHORD_FINGERINGS[key]) return [...CHORD_FINGERINGS[key]];
  if (CHORD_FINGERINGS[letter]) return [...CHORD_FINGERINGS[letter]];
  if (CHORD_FINGERINGS[letter + 'm']) return [...CHORD_FINGERINGS[letter + 'm']];
  return [...CHORD_FINGERINGS.Em];
}

/** String numbers (6…1) that should ring (not muted) for this shape */
export function highlightStringsForFingering(fingering: number[]): number[] {
  return [6, 5, 4, 3, 2, 1].filter((sn) => {
    const i = 6 - sn;
    return fingering[i] !== -1;
  });
}
