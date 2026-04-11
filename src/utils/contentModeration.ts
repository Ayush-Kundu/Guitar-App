/**
 * Community / DM content policy (code-defined patterns).
 * Expand `BLOCKED_PHRASES` and `BLOCKED_REGEXES` as needed; keep server copy in
 * `make-server-4ea82950/index.ts` in sync for trusted-ban verification.
 */

const BLOCKED_PHRASES: string[] = [
  // Self-harm / violence (abbreviated / common evasions)
  'kys',
  'kill yourself',
  'kill urself',
  'neck yourself',
  'end yourself',
  'suicide',
  // Threats
  'i will kill you',
  "i'll kill you",
  'im going to kill you',
  "i'm going to kill you",
  'murder you',
  'rape you',
  'child porn',
  'cp link',
  'terrorist attack',
  // Slurs — add further phrases your community rejects (kept minimal here)
  'nazi',
  'hitler',
];

/** Obfuscated severe slurs via character-class patterns (extend cautiously). */
const BLOCKED_REGEXES: RegExp[] = [
  /\bn[i1!|]g+[a3@e]*\b/i,
  /\bf[a@4]g+[o0]+t*\b/i,
  /\bc[u\*]nt\b/i,
  /\br[e3]t[a@4]rd\b/i,
];

function normalizeForScan(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[\s_\-./]+/g, ' ')
    .replace(/0/g, 'o')
    .replace(/1/g, 'i')
    .replace(/3/g, 'e')
    .replace(/4/g, 'a')
    .replace(/5/g, 's')
    .replace(/7/g, 't')
    .trim();
}

export function textViolatesContentPolicy(text: string): boolean {
  const raw = text.trim();
  if (!raw) return false;
  const norm = normalizeForScan(raw);
  const collapsed = norm.replace(/\s+/g, '');

  for (const phrase of BLOCKED_PHRASES) {
    const p = phrase.toLowerCase();
    if (norm.includes(p) || collapsed.includes(p.replace(/\s+/g, ''))) {
      return true;
    }
  }
  for (const re of BLOCKED_REGEXES) {
    if (re.test(raw) || re.test(norm)) {
      return true;
    }
  }
  return false;
}

export function assertContentAllowed(text: string): void {
  if (textViolatesContentPolicy(text)) {
    throw new Error('CONTENT_POLICY_VIOLATION');
  }
}
