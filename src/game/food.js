// Random food placement on a free cell (never inside the snake).
import { COLS, ROWS } from './constants.js';

function key(p) {
  return p.y * COLS + p.x;
}

export function getRandomFood(snake) {
  const occupied = new Set(snake.map(key));
  const freeCount = COLS * ROWS - occupied.size;
  if (freeCount <= 0) return null; // board full — player wins in practice
  // Pick the k-th free cell so distribution stays uniform without retries.
  let target = Math.floor(Math.random() * freeCount);
  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLS; x++) {
      if (occupied.has(y * COLS + x)) continue;
      if (target === 0) return { x, y };
      target--;
    }
  }
  return null;
}
