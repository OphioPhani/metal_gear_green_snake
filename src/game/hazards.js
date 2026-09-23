// Hazard layout generation — pure, no React.
// Picks HAZARD_COUNT distinct free cells, avoiding the snake, the food,
// and a 1-cell fairness buffer around the head (so nothing can spawn
// where the head is forced to be next tick). Returns fewer when the
// board is too crowded rather than failing.
import { COLS, ROWS } from './constants.js';

export function spawnHazards(snake, food, count) {
  const taken = new Set(snake.map((p) => p.y * COLS + p.x));
  if (food) taken.add(food.y * COLS + food.x);
  const head = snake[0];
  const free = [];
  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLS; x++) {
      if (taken.has(y * COLS + x)) continue;
      if (head && Math.abs(x - head.x) + Math.abs(y - head.y) <= 1) continue;
      free.push({ x, y });
    }
  }
  // Fisher-Yates shuffle, then take.
  for (let i = free.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [free[i], free[j]] = [free[j], free[i]];
  }
  return free.slice(0, Math.max(0, Math.min(count, free.length)));
}
