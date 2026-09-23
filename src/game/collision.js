// Collision detection kept separate from movement for testability.
import { COLS, ROWS } from './constants.js';

export function hitsWall(head) {
  return head.x < 0 || head.y < 0 || head.x >= COLS || head.y >= ROWS;
}

// Self collision: head overlapping any body segment. The tail cell that is
// about to vacate this tick is excluded by the caller when not growing.
export function hitsSelf(snake, head) {
  for (let i = 1; i < snake.length; i++) {
    if (snake[i].x === head.x && snake[i].y === head.y) return true;
  }
  return false;
}
