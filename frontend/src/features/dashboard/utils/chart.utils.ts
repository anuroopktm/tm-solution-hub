/**
 * Derives distinct, solid shades of the primary Conforge Teal brand color (Hue 180).
 * Generates an even monochromatic gradient ranging from deep primary teal (L: 25%, S: 100%)
 * up to bright cyan (L: 65%, S: 75%) based on the total number of categories.
 */
export function getCategoryShade(index: number, totalItems: number): string {
  if (totalItems <= 1) {
    return "hsl(var(--primary))";
  }

  const minLightness = 25;
  const maxLightness = 65;
  const lightness = (
    minLightness +
    (index / (totalItems - 1)) * (maxLightness - minLightness)
  ).toFixed(1);

  const saturation = (100 - (index / (totalItems - 1)) * 25).toFixed(1);

  return `hsl(180 ${saturation}% ${lightness}%)`;
}

/**
 * Algorithmic shorthand generator for category labels:
 * - Single word: first 4 characters (e.g. "Security" -> "Secu", "Web" -> "WEB")
 * - Two words: takes first 2-3 characters from each word and concatenates (e.g. "Cloud Infrastructure" -> "CloInf")
 * - Three+ words: takes first 2 characters of the first 3 words (e.g. "Enterprise Asset Management" -> "EnAsMa")
 */
export function getCategoryShorthand(name: string): string {
  if (!name || typeof name !== "string") return "";

  // Split into words, cleaning punctuation and connector words
  const cleanWords = name
    .replace(/&/g, " ")
    .replace(/[^a-zA-Z0-9\s]/g, " ")
    .trim()
    .split(/\s+/)
    .filter(
      (w) =>
        w.length > 0 &&
        !["and", "of", "the", "for", "in", "to"].includes(w.toLowerCase()),
    );

  if (cleanWords.length === 0) {
    return name.trim().slice(0, 4).toUpperCase();
  }

  // Single word: first 4 characters
  if (cleanWords.length === 1) {
    const word = cleanWords[0];
    if (word.length <= 4) return word.toUpperCase();
    return word.slice(0, 1).toUpperCase() + word.slice(1, 4).toLowerCase();
  }

  // Two words: take first 2-3 characters from each word
  if (cleanWords.length === 2) {
    const [w1, w2] = cleanWords;
    const len1 = w1.length <= 3 ? w1.length : 3;
    const len2 = w2.length <= 3 ? w2.length : 3;
    const p1 = w1.slice(0, 1).toUpperCase() + w1.slice(1, len1).toLowerCase();
    const p2 = w2.slice(0, 1).toUpperCase() + w2.slice(1, len2).toLowerCase();
    return `${p1}${p2}`;
  }

  // Three or more words: first 2 characters of each word (up to 3 words)
  return cleanWords
    .slice(0, 3)
    .map((w) => w.slice(0, 1).toUpperCase() + w.slice(1, 2).toLowerCase())
    .join("");
}
