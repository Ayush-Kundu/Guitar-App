/**
 * Chord matching for Technique / Theory practice popups.
 * Keep in sync with TechniqueTheoryPractice “Heard” matching behavior.
 */

export function normalizeChordForTechniqueTheoryMatch(s: string): string {
  return s.replace(/\s/g, '').toUpperCase().replace(/MINOR|MIN$/gi, 'M').replace(/MAJOR|MAJ$/gi, '').trim();
}

/** True if detector label matches the expected chord (same rules as TechniqueTheoryPractice). */
export function techniqueTheoryChordMatch(detected: string | null, expected: string): boolean {
  if (!detected) return false;
  const nd = normalizeChordForTechniqueTheoryMatch(detected);
  const nc = normalizeChordForTechniqueTheoryMatch(expected);
  return nd === nc || nd.startsWith(nc) || nc.startsWith(nd);
}
