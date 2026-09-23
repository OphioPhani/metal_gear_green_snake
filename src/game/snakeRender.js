// Maps grid coordinates -> SVG segment layout.
// Pure helpers: given the snake cell list, decide each segment's glyph
// (head / straight / corner / tail) and its rotation. All glyphs are drawn
// "facing UP" (feature toward -y); rotation is clockwise degrees:
// UP=0, RIGHT=90, DOWN=180, LEFT=270.

export const CELL = 24;

function sub(a, b) {
  return { x: a.x - b.x, y: a.y - b.y };
}

function rotForDir(d) {
  if (d.x === 0 && d.y === -1) return 0; // UP
  if (d.x === 1 && d.y === 0) return 90; // RIGHT
  if (d.x === 0 && d.y === 1) return 180; // DOWN
  return 270; // LEFT
}

// Facing of the head = direction of last move (head minus neck).
export function headDir(snake) {
  if (snake.length < 2) return { x: 1, y: 0 };
  return sub(snake[0], snake[1]);
}

// Corner glyph connects the TOP edge to the RIGHT edge of its cell.
// A snake travelling with direction d through a cell ENTERS via the edge
// opposite d and EXITS via the edge along d — so the required edge pair
// is { -dIn, dOut }, matched against rotations of the base glyph:
//   TOP_TO_RIGHT     {T,R} -> rotate 0
//   RIGHT_TO_BOTTOM  {R,B} -> rotate 90
//   BOTTOM_TO_LEFT   {B,L} -> rotate 180
//   LEFT_TO_TOP      {L,T} -> rotate 270
// (Getting this backwards renders an arm into empty space — the classic
// "diagonal leak" at turns. Rotations are exact multiples of 90° only.)
function cornerLayout(dIn, dOut) {
  const edge = (v) => (v.y === -1 ? 'T' : v.y === 1 ? 'B' : v.x === -1 ? 'L' : 'R');
  const enter = edge({ x: -dIn.x, y: -dIn.y });
  const exit = edge(dOut);
  const pair = [enter, exit].sort().join('');
  switch (pair) {
    case 'RT':
      return { rotate: 0, corner: 'TOP_TO_RIGHT' };
    case 'BR':
      return { rotate: 90, corner: 'RIGHT_TO_BOTTOM' };
    case 'BL':
      return { rotate: 180, corner: 'BOTTOM_TO_LEFT' };
    case 'LT':
      return { rotate: 270, corner: 'LEFT_TO_TOP' };
    default:
      return { rotate: 0, corner: 'TOP_TO_RIGHT' };
  }
}

// Classify segment i. Returns { kind, rotate } (+ corner/detail names).
// Positioning stays strictly grid-based: pixel = cell * CELL, every glyph
// is centered on its cell center, rotations are exact multiples of 90°.
export function classifySegment(snake, i) {
  if (i === 0) {
    return { kind: 'head', rotate: rotForDir(headDir(snake)) };
  }
  if (i === snake.length - 1) {
    // Tail tip points away from the body: direction body -> tip.
    const tip = sub(snake[i], snake[i - 1]);
    return { kind: 'tail', rotate: rotForDir(tip) };
  }
  const dIn = sub(snake[i], snake[i - 1]);
  const dOut = sub(snake[i + 1], snake[i]);
  if (dIn.x === dOut.x && dIn.y === dOut.y) {
    // Straight: vertical glyph; rotate 90 for horizontal travel.
    const vertical = dIn.x === 0;
    return { kind: 'straight', rotate: vertical ? 0 : 90, detail: vertical ? 'V' : 'H' };
  }
  return { kind: 'corner', ...cornerLayout(dIn, dOut) };
}

// Pixel position of a cell's top-left corner in board viewBox units.
export function cellPos(cell) {
  return { x: cell.x * CELL, y: cell.y * CELL };
}
