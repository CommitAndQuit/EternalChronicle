import test from 'node:test';
import assert from 'node:assert/strict';

import {
  TITLE_MODEL,
  heuristicTitle,
  heuristicTitles,
  suggestTitles,
  titleFor,
} from '../src/lib/title/index.js';

const MAX_CHARS = 60;

const titleCount = (title) => title.split(/\s+/).filter(Boolean).length;

test('always returns a title, even for empty content', () => {
  const titles = heuristicTitles({ content: '' }, 3);
  assert.ok(titles.length >= 2);
  for (const title of titles) {
    assert.ok(title.length > 0);
    assert.notEqual(title, 'Untitled journal');
  }
});

test('returns the requested number of candidates', () => {
  const content =
    'We drove to the coast early in the morning, packed sandwiches, and arrived just as the tide was coming in. The kids ran straight for the water.';
  assert.equal(heuristicTitles({ content }, 1).length, 1);
  assert.equal(heuristicTitles({ content }, 3).length, 3);
});

test('titles stay within the size budget', () => {
  const content =
    'Today I went cycling with my friends along the river. We stopped at a small cafe and watched the sunset over the old bridge while the market slowly packed up around us.';
  for (const title of heuristicTitles({ content }, 3)) {
    assert.ok(title.length <= MAX_CHARS, `${title} is ${title.length} chars`);
    assert.ok(titleCount(title) <= 9, `${title} has too many words`);
  }
});

test('uses sentence case and strips surrounding punctuation', () => {
  const title = heuristicTitle({ content: '"Rain all day."' });
  assert.equal(title, 'Rain all day');
});

test('keeps an already-good one-liner intact', () => {
  assert.equal(
    heuristicTitle({ content: 'Cycling and enjoy the city view' }),
    'Cycling and enjoy the city view',
  );
});

test('compresses long sentences instead of copying them', () => {
  const content =
    'We took the early train out of the city with one bag between us and no real plan. By noon we were sharing a plate of dumplings beside a river neither of us could name.';
  const [title] = heuristicTitles({ content }, 1);
  assert.ok(title.length < content.length);
  assert.ok(titleCount(title) <= 9);
});

test('drops leading time and discourse markers', () => {
  assert.equal(heuristicTitle({ content: 'Today I went cycling with my friends' }), 'I went cycling with my friends');
  assert.equal(
    heuristicTitle({ content: 'It was a good day. Then I took a nap and finished my book.' }),
    'I took a nap and finished my book',
  );
});

test('falls back to a date-based title when content is empty', () => {
  const [title] = heuristicTitles({ content: '', journalDate: '2026-11-01T12:00:00Z' }, 1);
  assert.match(title, /worth keeping/);
});

test('handles non-English entries without keyword soup', () => {
  const content =
    'मैं आज सुबह जल्दी उठा और पहाड़ों पर ट्रेकिंग के लिए गया। रास्ते में बहुत सुंदर नज़ारे थे।';
  const [title] = heuristicTitles({ content }, 1);
  assert.ok(title.startsWith('मैं आज'));
  assert.ok(!title.includes(','));
});

test('strips links and emails before titling', () => {
  const title = heuristicTitle({
    content: 'Check this out https://example.com/a/very/long/path and write to me@example.com about the trip.',
  });
  assert.ok(!title.includes('http'));
  assert.ok(!title.includes('@'));
});

test('is deterministic for the same input', () => {
  const content = 'The river was calm. I walked by the river again. The river always helps me think.';
  assert.deepEqual(heuristicTitles({ content }, 3), heuristicTitles({ content }, 3));
});

test('suggestTitles exposes the provider contract', async () => {
  const result = await suggestTitles({ content: 'Rain all day.' }, { count: 2 });
  assert.equal(result.source, 'heuristic');
  assert.equal(result.model, TITLE_MODEL);
  assert.ok(Array.isArray(result.titles));
  assert.equal(result.titles[0], 'Rain all day');
});

test('titleFor always resolves to a single string', () => {
  assert.equal(typeof titleFor({ content: '' }), 'string');
  assert.ok(titleFor({ content: '' }).length > 0);
});
