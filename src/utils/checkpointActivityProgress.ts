/** Completion for journey checkpoint activities (e.g. Getting Started interactive rows). */

function key(userId: string, checkpointId: string): string {
  return `strummy-checkpoint-done-${userId}-${checkpointId}`;
}

export function isCheckpointActivityComplete(userId: string, checkpointId: string): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return localStorage.getItem(key(userId, checkpointId)) === '1';
  } catch {
    return false;
  }
}

export function markCheckpointActivityComplete(userId: string, checkpointId: string): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key(userId, checkpointId), '1');
  } catch {
    /* ignore */
  }
}
