function normalize(text) {
  return String(text || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function levenshtein(a, b) {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;

  const matrix = [];
  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      const cost = b[i - 1] === a[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }
  return matrix[b.length][a.length];
}

function tokenMatchesField(token, field) {
  if (!token) return 0;
  if (field.includes(token)) return token.length * 3;

  const words = field.split(" ");
  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    if (word.startsWith(token)) return token.length * 2;
    const dist = levenshtein(token, word);
    const maxDist = token.length <= 4 ? 1 : 2;
    if (dist <= maxDist && word.length >= 3) {
      return Math.max(1, token.length - dist);
    }
  }
  return 0;
}

export function fuzzyScore(query) {
  const fields = Array.prototype.slice.call(arguments, 1);
  const q = normalize(query);
  if (!q) return 0;

  const tokens = q.split(" ").filter(Boolean);
  const normalizedFields = fields.map(normalize);
  let score = 0;

  for (let t = 0; t < tokens.length; t++) {
    const token = tokens[t];
    let best = 0;
    for (let f = 0; f < normalizedFields.length; f++) {
      best = Math.max(best, tokenMatchesField(token, normalizedFields[f]));
    }
    if (best === 0) return 0;
    score += best;
  }

  const fullHaystack = normalizedFields.join(" ");
  if (fullHaystack.includes(q)) score += q.length * 2;

  return score;
}
