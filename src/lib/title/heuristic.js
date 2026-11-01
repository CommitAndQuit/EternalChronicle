const MAX_TITLE_WORDS = 9;
const MAX_TITLE_CHARS = 60;

const STOPWORDS = new Set(
  `a about above after again against all am an and any are aren't as at be because been before
   being below between both but by can can't cannot could couldn't did didn't do does doesn't doing
   don't down during each few for from further had hadn't has hasn't have haven't having he he'd
   he'll he's her here here's hers herself him himself his how how's i i'd i'll i'm i've if in into
   is isn't it it's its itself let's me more most mustn't my myself no nor not of off on once only
   or other ought our ours ourselves out over own same shan't she she'd she'll she's should
   shouldn't so some such than that that's the their theirs them themselves then there there's
   these they they'd they'll they're they've this those through to too under until up very was
   wasn't we we'd we'll we're we've were weren't what what's when when's where where's which while
   who who's whom why why's with won't would wouldn't you you'd you'll you're you've your yours
   yourself yourselves today yesterday tomorrow tonight`
    .split(/\s+/)
    .filter(Boolean),
);

const TRAILING_PREPOSITIONS = new Set(
  `about above across after against along amid among around as at before behind below beneath
   beside between beyond by despite down during except for from in inside into like near of off
   on onto out outside over past since than through throughout till to toward towards under
   underneath until unto up upon via with within without`
    .split(/\s+/)
    .filter(Boolean),
);

const TRAILING_PRONOUNS = new Set([
  'me',
  'him',
  'her',
  'us',
  'them',
  'it',
  'you',
  'myself',
  'himself',
  'herself',
  'themselves',
]);

const LEADING_DISCOURSE = [
  /^(today|yesterday|this morning|this afternoon|this evening|tonight|last night|right now)\b[\s,;:–—-]*/i,
  /^(so|and|but|well|okay|ok|anyway|honestly|actually|basically|anyhow|plus)\b[\s,;:–—-]*/i,
  /^(then|after that|later|next|eventually)\b[\s,;:–—-]*/i,
  /^(first|firstly|second|secondly|finally)\b\s*,\s*/i,
  /^(i (just |really |simply )?(want|wanted|need|needed) to (say|write|note|record) that)\b[\s,;:–—-]*/i,
];

const CATEGORY_FALLBACKS = {
  Holiday: ['A holiday worth remembering', 'A day away'],
  Surprise: ['An unexpected surprise', 'A lovely surprise'],
  'Daily Life': ['A quiet day worth keeping', 'Notes from the day'],
  Sports: ['A day in motion', 'Out and about'],
};

const WORD_PATTERN = /[\p{L}\p{N}]+(?:['’][\p{L}]+)?/gu;

const words = (text) => text.match(WORD_PATTERN) || [];

const stripToken = (token) =>
  token.toLowerCase().replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, '');

const contentWords = (text) =>
  words(text)
    .map(stripToken)
    .filter((word) => word && !STOPWORDS.has(word) && word.length > 2);

const sentenceCase = (text) => {
  const trimmed = text.trim();
  if (!trimmed) return '';
  const isShouting = trimmed === trimmed.toUpperCase() && trimmed !== trimmed.toLowerCase();
  const base = isShouting ? trimmed.toLowerCase() : trimmed;
  return base.charAt(0).toUpperCase() + base.slice(1);
};

const trimEdgePunctuation = (text) =>
  text
    .replace(/^[\s"'“”‘’()[\]{}*_#>-]+/u, '')
    .replace(/[\s"'“”‘’()[\]{}*_#<.,;:!?–—-]+$/u, '')
    .trim();

const clampChars = (text) => {
  if (text.length <= MAX_TITLE_CHARS) return text;
  const slice = text.slice(0, MAX_TITLE_CHARS + 1);
  const lastSpace = slice.lastIndexOf(' ');
  const clipped = lastSpace > 20 ? slice.slice(0, lastSpace) : slice.slice(0, MAX_TITLE_CHARS);
  return clipped.replace(/[\s,;:–—-]+$/u, '');
};

const dropTrailingStopwords = (list) => {
  const next = [...list];
  const isTrailingFunction = (token) => {
    const clean = stripToken(token);
    return STOPWORDS.has(clean) || TRAILING_PREPOSITIONS.has(clean) || TRAILING_PRONOUNS.has(clean);
  };
  while (next.length > 2 && isTrailingFunction(next[next.length - 1])) {
    next.pop();
  }
  return next;
};

function truncateWords(text, maxWords) {
  const list = text.split(/\s+/).filter(Boolean);
  if (list.length <= maxWords) return text;
  return dropTrailingStopwords(list.slice(0, maxWords)).join(' ');
}

function stripLeadingDiscourse(text) {
  let next = text;
  for (let pass = 0; pass < 2; pass += 1) {
    for (const pattern of LEADING_DISCOURSE) {
      const without = next.replace(pattern, '');
      if (without !== next && contentWords(without).length >= 2) {
        next = without;
        break;
      }
    }
  }
  return next.trim();
}

function bestCoordinatedClause(text) {
  const parts = text
    .split(/\s+(?:and|but|so|yet)\s+/i)
    .map((part) => part.trim())
    .filter((part) => words(part).length >= 3);

  if (parts.length < 2) return text;

  const score = (part) => contentWords(part).length * 10 + words(part).length;
  return [...parts].sort((a, b) => score(b) - score(a))[0];
}

function shortenSentence(sentence) {
  let text = stripLeadingDiscourse(trimEdgePunctuation(sentence));

  // Prefer the first clause when the sentence is too long for a title.
  if (words(text).length > MAX_TITLE_WORDS) {
    const commaParts = text.split(/\s*[,;—–]\s+/);
    if (commaParts[0] && words(commaParts[0]).length >= 3) {
      text = commaParts[0];
    }
  }

  // Long "and/but" sentences usually have one clause that reads better alone.
  if (words(text).length > MAX_TITLE_WORDS) {
    text = bestCoordinatedClause(text);
  }

  // Cut at a subordinate conjunction if it is still too long.
  if (words(text).length > MAX_TITLE_WORDS) {
    const boundary = text.search(
      /\s+(?:but|because|although|though|while|which|who|whom|where|when|after|before|so that|even though)\s+/i,
    );
    if (boundary > 0 && words(text.slice(0, boundary)).length >= 3) {
      text = text.slice(0, boundary);
    }
  }

  const shortened = dropTrailingStopwords(
    truncateWords(text, MAX_TITLE_WORDS).split(/\s+/).filter(Boolean),
  ).join(' ');

  return sentenceCase(clampChars(trimEdgePunctuation(shortened)));
}

function splitSentences(text) {
  return text
    .split(/(?<=[.!?…])\s+|\n+/u)
    .map((sentence) => sentence.trim())
    .filter((sentence) => words(sentence).length >= 2);
}

function isLikelyEnglish(tokens) {
  if (!tokens.length) return false;
  const hits = tokens.filter((token) => STOPWORDS.has(token)).length;
  return hits / tokens.length >= 0.08;
}

function rankSentences(sentences) {
  const tokens = sentences.flatMap((sentence) => words(sentence).map(stripToken));
  const frequency = new Map();
  for (const token of tokens) {
    if (!token || STOPWORDS.has(token) || token.length <= 2) continue;
    frequency.set(token, (frequency.get(token) || 0) + 1);
  }

  return sentences
    .map((sentence, index) => {
      const sentenceTokens = words(sentence).map(stripToken);
      const content = sentenceTokens.filter(
        (token) => token && !STOPWORDS.has(token) && token.length > 2,
      );
      if (!content.length) return { sentence, score: 0 };

      let score =
        content.reduce((total, token) => total + Math.log(1 + (frequency.get(token) || 1)), 0) /
        Math.sqrt(sentenceTokens.length + 3);

      if (index === 0) score *= 1.12;
      if (index === sentences.length - 1 && sentences.length > 1) score *= 1.08;

      if (/\b(i|we|my|our)\b/i.test(sentence)) score *= 1.08;

      const properNouns = sentence
        .split(/\s+/)
        .slice(1)
        .filter((word) => /^[\p{Lu}]/u.test(word) && /[\p{Ll}]/u.test(word)).length;
      if (properNouns) score *= 1 + Math.min(0.3, properNouns * 0.08);

      const length = sentenceTokens.length;
      if (length > 40) score *= 0.7;
      else if (length > 28) score *= 0.85;

      if (LEADING_DISCOURSE.some((pattern) => pattern.test(sentence))) score *= 0.85;

      return { sentence, score };
    })
    .sort((a, b) => b.score - a.score);
}

function originalCasing(content, word) {
  const match = content.match(new RegExp(`\\b${word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i'));
  return match ? match[0] : word;
}

function keywordTitle(content) {
  const tokens = words(content).map(stripToken);
  const frequency = new Map();
  const firstSeen = new Map();
  tokens.forEach((token, index) => {
    if (!token || STOPWORDS.has(token) || TRAILING_PREPOSITIONS.has(token) || token.length <= 2) {
      return;
    }
    frequency.set(token, (frequency.get(token) || 0) + 1);
    if (!firstSeen.has(token)) firstSeen.set(token, index);
  });

  // Only offer a keyword title when a theme genuinely repeats; otherwise it
  // reads like a random word salad.
  if (!frequency.size) return '';

  const ranked = [...frequency.entries()]
    .sort((a, b) => b[1] - a[1] || firstSeen.get(a[0]) - firstSeen.get(b[0]))
    .slice(0, 3);

  if (ranked.length < 2 || ranked.some(([, hits]) => hits < 2)) return '';

  const display = ranked.map(([token]) => originalCasing(content, token));
  if (display.length === 2) return `${display[0]} and ${display[1]}`;
  return `${display[0]}, ${display[1]} and ${display[2]}`;
  if (ranked.length === 2) return `${ranked[0]} and ${ranked[1]}`;
  return `${ranked[0]}, ${ranked[1]} and ${ranked[2]}`;
}

function fallbackTitle({ journalDate, category }, variant = 0) {
  const date = journalDate ? new Date(journalDate) : new Date();
  const validDate = !Number.isNaN(date.getTime());
  const weekday = validDate
    ? new Intl.DateTimeFormat('en', { weekday: 'long' }).format(date)
    : '';

  if (weekday && variant === 0) return `A ${weekday} worth keeping`;

  const categoryTitles = CATEGORY_FALLBACKS[category] || CATEGORY_FALLBACKS['Daily Life'];
  return categoryTitles[variant % categoryTitles.length];
}

function finalize(title) {
  const cleaned = sentenceCase(clampChars(trimEdgePunctuation(title)));
  return cleaned;
}

function collectTitles(candidates, requested) {
  const seen = new Set();
  const titles = [];
  for (const candidate of candidates) {
    const title = finalize(candidate);
    const key = title.toLowerCase();
    if (!title || seen.has(key)) continue;
    seen.add(key);
    titles.push(title);
    if (titles.length >= requested) break;
  }
  return titles;
}

export function heuristicTitles(
  { content = '', journalDate = '', category = 'Daily Life' } = {},
  count = 3,
) {
  const text = String(content || '')
    .replace(/https?:\/\/\S+|www\.\S+/gi, ' ')
    .replace(/\b[\w.+-]+@[\w-]+\.[\w.]+\b/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 20000);
  const requested = Math.max(1, Number(count) || 1);
  const fallback = () => [
    fallbackTitle({ journalDate, category }),
    fallbackTitle({ journalDate, category }, 1),
  ];

  if (!text) {
    return collectTitles(fallback(), requested);
  }

  const sentences = splitSentences(text);
  if (!sentences.length) {
    return collectTitles(fallback(), requested);
  }

  const tokens = words(text).map(stripToken);
  const candidates = [];

  if (!isLikelyEnglish(tokens)) {
    // Avoid mangling non-English or noun-phrase-only entries: use the opening
    // words as they were written instead of keyword soup.
    candidates.push(shortenSentence(sentences[0]));
  } else {
    const ranked = rankSentences(sentences);
    if (ranked[0]?.score > 0) candidates.push(shortenSentence(ranked[0].sentence));

    const keywords = keywordTitle(text);
    if (keywords) candidates.push(keywords);

    if (ranked[1]?.score > 0) candidates.push(shortenSentence(ranked[1].sentence));
  }

  candidates.push(...fallback());

  return collectTitles(candidates, requested);
}

export function heuristicTitle(input) {
  return heuristicTitles(input, 1)[0];
}
