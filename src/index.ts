type CalculateRelevance = (query: string, content: string) => number;
type Search<T> = (query: string, items: T[]) => T[];

type Options =
  | 'natural'
  | {
      tokenizer?: (value: string) => string[];
    };

export function nonWhitespace(value: string): string[] {
  return value.split(/\s/);
}

export function prepareMatcher(options: Options): CalculateRelevance {
  const config = options === 'natural' ? {} : options;
  const tokenizer = config.tokenizer ?? nonWhitespace;
  function match(originalQuery: string, originalContent: string) {
    const query = originalQuery.toLocaleLowerCase();
    const content = originalContent.toLocaleLowerCase();
    if (originalQuery === originalContent) {
      return 100;
    } else if (query === content) {
      return 99.99;
    } else if (content.startsWith(query)) {
      return 99 + (0.99 * query.length) / content.length;
    }

    const queryTokens = tokenizer(query).filter(Boolean);
    const contentTokens = tokenizer(content).filter(Boolean);
    let score = 0;
    for (let i = 0, len = queryTokens.length; i < len; i += 1) {
      for (let j = 0, total = contentTokens.length; j < total; j += 1) {
        const needle = queryTokens[i];
        const haystack = contentTokens[j];
        const offset = haystack.indexOf(needle);
        if (offset >= 0) {
          const max = ((99 - score) * (10 - Math.min(Math.abs(i - j), 3))) / 10;
          score += (max * (haystack.length - offset + needle.length)) / (haystack.length + haystack.length);
        }
      }
    }

    return score;
  }
  return match;
}

export function compareUsing(calculate: CalculateRelevance): (query: string) => (a: string, b: string) => number {
  return (query) => {
    const cache = new Map<string, number>();
    return function compare(a, b) {
      const aScore = cache.get(a) ?? calculate(query, a);
      const bScore = cache.get(b) ?? calculate(query, b);
      cache.set(a, aScore);
      cache.set(b, bScore);
      return bScore - aScore;
    };
  };
}

export function searchUsing<T>(calculate: CalculateRelevance, read: (value: T) => string | string[]): Search<T> {
  const cache = new Map<T, number>();
  return function search(query, items) {
    cache.clear();
    const sortable: T[] = [];
    items.forEach((item) => {
      const content = read(item);
      const score = Array.isArray(content)
        ? content.map((text) => calculate(query, String(text))).reduce((x, y) => Math.max(x, y), 0)
        : typeof content === 'string'
        ? calculate(query, content)
        : 0;
      if (score > 0) {
        sortable.push(item);
        cache.set(item, score);
      }
    });
    return sortable.sort((a, b) => (cache.get(b) ?? 0) - (cache.get(a) ?? 0));
  };
}
