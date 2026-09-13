/**
 * Deterministic pseudo-random alphanumeric text.
 *
 * Used by the collage "character block" — a signature texture element that
 * renders a dense grid of characters. The generator is seeded and pure so
 * server and client produce identical output (no hydration mismatch), and
 * the output is stable across builds.
 */

const CHARSET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

/** Linear congruential generator constants (Numerical Recipes). */
const LCG_A = 1664525;
const LCG_C = 1013904223;
const LCG_M = 2 ** 32;

/**
 * Generate a deterministic block of characters.
 *
 * @param seed  Positive integer seed; the same seed always yields the same text.
 * @param rows  Number of lines.
 * @param cols  Characters per line.
 * @returns The block, one row per line (no trailing newline).
 */
export function seededCharBlock(seed: number, rows: number, cols: number): string {
  const safeSeed = Math.floor(Math.abs(seed)) % LCG_M || 1;
  const safeRows = Math.min(Math.max(Math.floor(rows), 1), 200);
  const safeCols = Math.min(Math.max(Math.floor(cols), 1), 200);

  let state = safeSeed % LCG_M;
  const lines: string[] = [];

  for (let r = 0; r < safeRows; r++) {
    let line = "";
    for (let c = 0; c < safeCols; c++) {
      state = (LCG_A * state + LCG_C) % LCG_M;
      line += CHARSET[Math.floor((state / LCG_M) * CHARSET.length)];
    }
    lines.push(line);
  }

  return lines.join("\n");
}
