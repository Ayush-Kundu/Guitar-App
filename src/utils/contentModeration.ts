/**
 * Community / DM text moderation. Tune lists for your standards.
 * Also reads VITE_MODERATION_EXTRA_TERMS (comma-separated, case-insensitive).
 */

const NORMALIZE_SEPARATORS = /[\s_*.+\-]+/g;

/** Obvious injection / spam shapes */
const STRUCTURAL_PATTERNS: RegExp[] = [
  /<script/i,
  /javascript:/i,
  /data:text\/html/i,
  /on\w+\s*=/i,
];

/** Harassment / self-harm phrases (add more in EXTRA_TERMS as needed) */
const DEFAULT_PHRASES: string[] = [
  'kill yourself',
  'kys',
  'neck yourself',
  'hope you die',
  'go die',
];

function normalizeForMatch(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(NORMALIZE_SEPARATORS, '')
    .replace(/0/g, 'o')
    .replace(/1/g, 'i')
    .replace(/3/g, 'e')
    .replace(/4/g, 'a')
    .replace(/5/g, 's')
    .replace(/7/g, 't')
    .replace(/@/g, 'a');
}

function loadExtraTerms(): string[] {
  const raw = import.meta.env.VITE_MODERATION_EXTRA_TERMS;
  if (!raw || typeof raw !== 'string') return [];
  return raw
    .split(',')
    .map(s => s.trim().toLowerCase())
    .filter(Boolean);
}

export type ModerationResult = { ok: true } | { ok: false; reason: string };

/**
 * Returns violation if text matches coded blocklists or env extras.
 * Does not call the network.
 */
export function scanUserGeneratedText(text: string): ModerationResult {
  const trimmed = (text || '').trim();
  if (!trimmed) return { ok: true };

  for (const re of STRUCTURAL_PATTERNS) {
    if (re.test(trimmed)) {
      return { ok: false, reason: 'disallowed_content' };
    }
  }

  const collapsed = normalizeForMatch(trimmed);
  const extras = loadExtraTerms();

  for (const phrase of [...DEFAULT_PHRASES, ...extras]) {
    const n = normalizeForMatch(phrase);
    if (n.length >= 2 && collapsed.includes(n)) {
      return { ok: false, reason: 'policy_violation' };
    }
  }

  return { ok: true };
}
