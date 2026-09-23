// Shared game tuning.
// Kept in one place so board size, speed and scoring stay consistent.
//
// NOTE: deliberately no persistent storage here. The high score lives only
// in runtime memory (React state) and resets on page refresh — the game is
// a fully static, client-side site with no backend of any kind.

export const COLS = 28;
export const ROWS = 18;

// Single fixed movement interval for the entire game. The snake NEVER
// speeds up: length/score have zero effect on timing.
export const GAME_SPEED_MS = 150;
export const POINTS_PER_FOOD = 10;

// Radar scan tuning — fully independent of snake speed.
export const RADAR_SCAN_DURATION_MS = 4000; // one left-to-right sweep

// Hazard / health tuning — all gameplay knobs live here, nowhere else.
export const MAX_HEARTS = 5;
export const HAZARD_COUNT = 4;
export const OBJECT_HIDE_DISTANCE_CELLS = 4; // hide obj when scan is this far past it
export const DAMAGE_COOLDOWN = 750; // ms of mercy after a hazard hit

export const DIRECTIONS = {
  UP: { x: 0, y: -1 },
  DOWN: { x: 0, y: 1 },
  LEFT: { x: -1, y: 0 },
  RIGHT: { x: 1, y: 0 },
};

export function formatScore(n) {
  return String(Math.max(0, Math.floor(n))).padStart(5, '0');
}
