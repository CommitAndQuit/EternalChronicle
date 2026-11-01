import { heuristicTitle, heuristicTitles } from './heuristic.js';

export { heuristicTitle, heuristicTitles };

export const TITLE_MODEL = 'heuristic-v1';

/**
 * Generate title candidates for a journal entry.
 *
 * This is the seam where an on-device or hosted model can be added later:
 * providers should return the same `{ titles, source, model }` shape and keep
 * the heuristic as the synchronous fallback.
 */
export async function suggestTitles(input, { count = 3 } = {}) {
  return {
    titles: heuristicTitles(input, count),
    source: 'heuristic',
    model: TITLE_MODEL,
  };
}

export function titleFor(input) {
  return heuristicTitle(input);
}
