# Technique & Theory Quiz and SongPractice Verification

This doc explains how to verify that every quiz has its own specific questions and that chord lessons use the SongPractice (chord practice) popup where appropriate.

## 1. Quiz content: explicit vs fallback

- **Explicit content:** Each key in `techniqueContent` and `theoryContent` in `lesson-content.ts` has its own quiz `items` (topic-specific questions and answers).
- **Fallback:** If a lesson title does not match any key (exact or fuzzy match via `getContentByTitle`), the app uses `createFallbackContent(title, description)`, which builds questions from the lesson description only (no generic presets).

**How to see which lessons have explicit content**

- In code: import `getQuizAndPracticeAudit` from `../data/lesson-content` and log the result (e.g. in a `useEffect` or a dev-only button):
  ```ts
  import { getQuizAndPracticeAudit } from '../data/lesson-content';
  console.log(getQuizAndPracticeAudit());
  ```
- Or open `lesson-content.ts` and inspect the keys of `techniqueContent`, `theoryContent`, and `LESSON_PRACTICE_CHORDS`.

**Adding topic-specific questions for a lesson**

1. Open `src/data/lesson-content.ts`.
2. Add an entry to `techniqueContent` or `theoryContent` with the **exact lesson title** (or one that fuzzily matches; see `getContentByTitle`).
3. Set `items` to an array of `QuizItem` (e.g. `multiple_choice`, `fill_blank`) with that topic’s questions and answers.

## 2. SongPractice (chord practice) popup

- **Source of truth:** `LESSON_PRACTICE_CHORDS` in `lesson-content.ts` maps lesson titles to chord symbols (e.g. `['Em', 'A', 'D']`).
- **Usage:** When a lesson has `practiceChords` in the learning journey (or matches a key in `LESSON_PRACTICE_CHORDS`), the Technique Theory flow can open the chord practice popup (SongPractice-style) after the quiz so the user can practice those chords.

**How to see which lessons have chord practice**

- Same audit: call `getQuizAndPracticeAudit()` and read `practiceChordTitles`.
- Or inspect `LESSON_PRACTICE_CHORDS` in `lesson-content.ts`.

**Adding chord practice for a lesson**

1. In `lesson-content.ts`, add the lesson title to `LESSON_PRACTICE_CHORDS` with the chord list, e.g. `'My Chord Lesson': ['C', 'G', 'Am']`.
2. Optionally, in `learning-journey.ts` or `learning-journey-levels.ts`, set `practiceChords: ['C', 'G', 'Am']` on that lesson so the UI knows to show “Practice” and open the popup after the quiz.

## 3. Quick checklist

- **Quizzes:** All technique/theory lessons with a quiz should ideally have an entry in `techniqueContent` or `theoryContent` so they use topic-specific questions instead of fallback.
- **Chord practice:** Every chord-focused lesson (e.g. “E Minor - Your First Chord”, “F Major - The First Barre Chord”, “The 4-Chord Song”) should appear in `LESSON_PRACTICE_CHORDS` (and optionally have `practiceChords` on the lesson) so users get the chord practice popup after the quiz.
