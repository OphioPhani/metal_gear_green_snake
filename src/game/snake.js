// Pure snake helpers: creation + movement. No React, no side effects.
import { COLS, ROWS, DIRECTIONS } from './constants.js';

export function createInitialSnake() {
  const y = Math.floor(ROWS / 2);
  const x = Math.floor(COLS / 2);
  // Head first. Body trails to the left, moving right.
  return [
    { x, y },
    { x: x - 1, y },
    { x: x - 2, y },
  ];
}

export function isOpposite(a, b) {
  return a.x === -b.x && a.y === -b.y;
}

// Advance one cell. When growQueued > 0 the tail is kept (snake lengthens).
export function stepSnake(snake, dir, growQueued) {
  const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };
  if (growQueued > 0) {
    return { next: [head, ...snake], growLeft: growQueued - 1 };
  }
  return { next: [head, ...snake.slice(0, -1)], growLeft: 0 };
}

export { DIRECTIONS };
