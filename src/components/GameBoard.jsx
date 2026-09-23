// Radar surveillance display with a memory mechanic: food and hazards
// exist at fixed hidden grid coordinates and are only REVEALED while the
// vertical scan line is over them. Visibility never affects collision —
// the hook eats food and takes hazard hits at actual coordinates, seen
// or not. Gameplay objects are vector graphics — SnakeHead / Straight /
// Corner / Tail glyphs positioned per grid cell and rotated by travel
// direction, a red SVG target for food, yellow boxes for hazards.
import { memo, useEffect, useMemo, useRef, useState } from 'react';
import { COLS, ROWS, OBJECT_HIDE_DISTANCE_CELLS, RADAR_SCAN_DURATION_MS } from '../game/constants.js';
import { CELL, classifySegment } from '../game/snakeRender.js';
import SnakeHead from './snake/SnakeHead.jsx';
import SnakeStraight from './snake/SnakeStraight.jsx';
import SnakeCorner from './snake/SnakeCorner.jsx';
import SnakeTail from './snake/SnakeTail.jsx';
import SnakeFood from './snake/SnakeFood.jsx';
import HazardBox from './HazardBox.jsx';
import { playSweep, stopSweep } from '../game/sound.js';

const W = COLS * CELL; // 672
const H = ROWS * CELL; // 432
const CX = W / 2;
const CY = H / 2;

// Minimum swipe distance: shorter drags/taps never steer (avoids turning
// scroll intent or thumb jitter into movement).
const SWIPE_MIN_PX = 24;

const BLIPS = [
  { x: 118, y: 86, pulse: true },
  { x: 545, y: 318, pulse: false },
  { x: 468, y: 128, pulse: false },
  { x: 250, y: 340, pulse: false },
];

function Segment({ cell, layout }) {
  const cx = cell.x * CELL + CELL / 2;
  const cy = cell.y * CELL + CELL / 2;
  // Grid-exact placement: every glyph is centered on its cell center and
  // rotated by an exact multiple of 90°. No interpolation, no freeform
  // offsets — the centerline always passes through cell centers.
  const transform = `translate(${cx} ${cy}) rotate(${layout.rotate})`;
  return (
    <g transform={transform}>
      {layout.kind === 'head' && <SnakeHead />}
      {layout.kind === 'straight' && <SnakeStraight />}
      {layout.kind === 'corner' && <SnakeCorner />}
      {layout.kind === 'tail' && <SnakeTail />}
    </g>
  );
}

// Column labels every 4 cells, row labels every 3 — faint telemetry.
function CoordLabels() {
  const cols = [];
  for (let x = 0; x < COLS; x += 4) {
    cols.push(
      <text key={`c${x}`} x={x * CELL + 3} y={10} className="tac-coord">
        {String(x).padStart(2, '0')}
      </text>,
    );
  }
  const rows = [];
  for (let y = 0; y < ROWS; y += 3) {
    rows.push(
      <text key={`r${y}`} x={3} y={y * CELL + 11} className="tac-coord">
        {String(y).padStart(2, '0')}
      </text>,
    );
  }
  return (
    <g aria-hidden="true">
      {cols}
      {rows}
    </g>
  );
}

function GameBoard({ snake, food, hazards, status, runId, onScanWrap, onSwipe }) {
  // Ticks derive purely from grid state — logic untouched.
  const segments = useMemo(
    () => snake.map((cell, i) => ({ cell, layout: classifySegment(snake, i) })),
    [snake],
  );
  const head = snake[0] || { x: 0, y: 0 };
  const pad = (n) => String(n).padStart(2, '0');

  // ---- horizontal radar scan + object visibility (presentation only) ----
  // An object at grid column ox is visible while the scan covers it:
  //   scanCell >= ox && scanCell < ox + OBJECT_HIDE_DISTANCE_CELLS
  // The line moves via direct DOM updates (no re-renders); `vis` state
  // flips only when the visible SET changes. A sweep wrap drops scanCell
  // below every ox, so nothing stale survives the reset.
  const [vis, setVis] = useState({ sig: '', items: [], keys: {} });
  const scanT = useRef(0);
  const visSig = useRef('');
  const keySeq = useRef(0);
  const keysRef = useRef({});
  const statusRef = useRef(status);
  const foodRef = useRef(food);
  const hazardsRef = useRef(hazards);
  const runRef = useRef(runId);
  const wrapRef = useRef(onScanWrap);
  const scanLineRef = useRef(null);
  const trailRef = useRef(null);
  const touchRef = useRef(null);
  const onSwipeRef = useRef(onSwipe);

  useEffect(() => {
    statusRef.current = status;
    foodRef.current = food;
    hazardsRef.current = hazards;
    runRef.current = runId;
    wrapRef.current = onScanWrap;
    onSwipeRef.current = onSwipe;
    // Audio follows game state: silence whenever the radar isn't running.
    if (status !== 'playing') stopSweep();
  });

  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    let seenRun = runRef.current;
    const collect = (scanCell) => {
      const items = [];
      const f = foodRef.current;
      if (f && scanCell >= f.x && scanCell < f.x + OBJECT_HIDE_DISTANCE_CELLS) {
        items.push({ id: `F${f.x},${f.y}`, kind: 'food', x: f.x, y: f.y });
      }
      for (const hz of hazardsRef.current) {
        if (scanCell >= hz.x && scanCell < hz.x + OBJECT_HIDE_DISTANCE_CELLS) {
          items.push({ id: `H${hz.x},${hz.y}`, kind: 'hazard', x: hz.x, y: hz.y });
        }
      }
      return items;
    };
    const frame = (now) => {
      raf = requestAnimationFrame(frame);
      const dt = Math.min(64, now - last);
      last = now;
      // New run: scan restarts at the left edge, nothing visible.
      if (runRef.current !== seenRun) {
        seenRun = runRef.current;
        scanT.current = 0;
        visSig.current = '';
        setVis({ sig: '', items: [], keys: {} });
        playSweep(); // one sweep sound per radar cycle
      }
      // Frozen unless playing: pause holds everything, gameover stops it.
      if (statusRef.current !== 'playing') return;
      const prevCell = ((scanT.current % RADAR_SCAN_DURATION_MS) / RADAR_SCAN_DURATION_MS) * COLS;
      scanT.current += dt;
      const cell = ((scanT.current % RADAR_SCAN_DURATION_MS) / RADAR_SCAN_DURATION_MS) * COLS;
      const x = (cell / COLS) * W;
      scanLineRef.current?.setAttribute('x1', x);
      scanLineRef.current?.setAttribute('x2', x);
      const tx = Math.max(0, x - 14);
      trailRef.current?.setAttribute('x1', tx);
      trailRef.current?.setAttribute('x2', tx);
      if (cell < prevCell) {
        wrapRef.current?.(); // sweep wrapped: fresh hazard layout
        playSweep(); // one sweep sound per radar cycle
      }
      const items = collect(cell);
      const sig = items.map((i) => i.id).join('|');
      if (sig !== visSig.current) {
        visSig.current = sig;
        const keys = {};
        for (const it of items) {
          keys[it.id] = keysRef.current[it.id] ?? ++keySeq.current;
        }
        keysRef.current = keys; // prune ids that left the window
        setVis({ sig, items, keys });
      }
    };
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      stopSweep();
    };
  }, []);

  return (
    <div
      className="board-wrap"
      onTouchStart={(e) => {
        // Track the first finger only; multi-touch is ignored.
        if (touchRef.current || !e.changedTouches.length) return;
        const t = e.changedTouches[0];
        touchRef.current = { id: t.identifier, x: t.clientX, y: t.clientY };
      }}
      onTouchEnd={(e) => {
        const cur = touchRef.current;
        touchRef.current = null;
        if (!cur || statusRef.current !== 'playing') return;
        const t = [...e.changedTouches].find((x) => x.identifier === cur.id);
        if (!t) return;
        const dx = t.clientX - cur.x;
        const dy = t.clientY - cur.y;
        // Deliberate swipes only: taps and small drifts are ignored so
        // scrolling intent and imprecise thumbs never steer the snake.
        if (Math.max(Math.abs(dx), Math.abs(dy)) < SWIPE_MIN_PX) return;
        onSwipeRef.current?.(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'RIGHT' : 'LEFT') : dy > 0 ? 'DOWN' : 'UP');
      }}
      onTouchCancel={() => {
        touchRef.current = null;
      }}
    >
      <svg
        className="tac-board"
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label={`Radar snake display. Game is ${status}. Snake length ${snake.length}.`}
      >
        <defs>
          <pattern id="tac-grid-sm" width={CELL} height={CELL} patternUnits="userSpaceOnUse">
            <path d={`M${CELL},0 L0,0 L0,${CELL}`} fill="none" stroke="#00FF66" strokeOpacity="0.07" strokeWidth="1" />
          </pattern>
          <pattern id="tac-grid-lg" width={CELL * 4} height={CELL * 4} patternUnits="userSpaceOnUse">
            <path
              d={`M${CELL * 4},0 L0,0 L0,${CELL * 4}`}
              fill="none"
              stroke="#00FF66"
              strokeOpacity="0.13"
              strokeWidth="1"
            />
          </pattern>
        </defs>

        {/* radar backdrop */}
        <rect x="0" y="0" width={W} height={H} fill="#000500" />
        <rect x="0" y="0" width={W} height={H} fill="url(#tac-grid-sm)" />
        <rect x="0" y="0" width={W} height={H} fill="url(#tac-grid-lg)" />

        {/* range rings + cardinal ticks */}
        <g aria-hidden="true" stroke="#00FF66" fill="none">
          <circle cx={CX} cy={CY} r="70" strokeOpacity="0.1" strokeWidth="1" />
          <circle cx={CX} cy={CY} r="130" strokeOpacity="0.1" strokeWidth="1" />
          <circle cx={CX} cy={CY} r="190" strokeOpacity="0.12" strokeWidth="1" />
          <g strokeOpacity="0.3" strokeWidth="1.5">
            <line x1={CX} y1={CY - 190} x2={CX} y2={CY - 198} />
            <line x1={CX} y1={CY + 190} x2={CX} y2={CY + 198} />
            <line x1={CX - 190} y1={CY} x2={CX - 198} y2={CY} />
            <line x1={CX + 190} y1={CY} x2={CX + 198} y2={CY} />
          </g>
        </g>

        {/* radar blips */}
        <g aria-hidden="true" fill="#00FF66">
          {BLIPS.map((b, i) =>
            b.pulse ? (
              <circle key={i} cx={b.x} cy={b.y} r="2" opacity="0.5">
                <animate attributeName="opacity" values="0.2;0.9;0.2" dur="2.8s" repeatCount="indefinite" />
              </circle>
            ) : (
              <circle key={i} cx={b.x} cy={b.y} r="2" opacity="0.4" />
            ),
          )}
        </g>

        <CoordLabels />

        {/* centre crosshair marker */}
        <g aria-hidden="true" stroke="#00CC55" opacity="0.35">
          <circle cx={CX} cy={CY} r="10" fill="none" strokeWidth="1" />
          <line x1={CX - 16} y1={CY} x2={CX - 12} y2={CY} strokeWidth="1" />
          <line x1={CX + 12} y1={CY} x2={CX + 16} y2={CY} strokeWidth="1" />
          <line x1={CX} y1={CY - 16} x2={CX} y2={CY - 12} strokeWidth="1" />
          <line x1={CX} y1={CY + 12} x2={CX} y2={CY + 16} strokeWidth="1" />
          <circle cx={CX} cy={CY} r="1" fill="#00CC55" stroke="none" />
        </g>

        {/* area tags */}
        <g aria-hidden="true" className="tac-tag">
          <text x="14" y="34">AREA 01</text>
          <text x="14" y="46">GRID {COLS}×{ROWS}</text>
          <text x="14" y="58">CELL 024px</text>
        </g>

        {/* north marker */}
        <g aria-hidden="true" transform={`translate(${W - 30} 46)`}>
          <text y="-10" textAnchor="middle" className="tac-tag">N</text>
          <polygon points="0,0 -5,12 0,9 5,12" fill="#00FF66" opacity="0.8" />
        </g>

        {/* mini scope + radar status */}
        <g aria-hidden="true">
          <g stroke="#00CC55" fill="none" opacity="0.6">
            <circle cx="44" cy={H - 46} r="15" strokeWidth="1" />
            <circle cx="44" cy={H - 46} r="9" strokeWidth="1" opacity="0.7" />
            <circle cx="44" cy={H - 46} r="1.5" fill="#00CC55" stroke="none" />
          </g>
          <text x="68" y={H - 50} className="tac-tag">RADAR</text>
          <text x="68" y={H - 38} className="tac-tag">ONLINE</text>
        </g>

        {/* zoom + tracked head coordinates */}
        <g aria-hidden="true" className="tac-tag">
          <text x={W - 14} y={H - 40} textAnchor="end">ZOOM 1.0x</text>
          <text x={W - 14} y={H - 26} textAnchor="end">
            X: {pad(head.x)} Y: {pad(head.y)}
          </text>
        </g>

        {/* gameplay objects */}
        <g className="snake-layer">
          {segments.map((s, i) => (
            <Segment key={i} cell={s.cell} layout={s.layout} />
          ))}
        </g>
        {/* food + hazards render ONLY while the scan covers their cell —
            coordinates stay fixed and live the whole time, seen or not */}
        {vis.items.map((it) =>
          it.kind === 'food' ? (
            <g
              key={it.id}
              transform={`translate(${it.x * CELL + CELL / 2} ${it.y * CELL + CELL / 2})`}
            >
              <circle
                key={vis.keys[it.id]}
                r="6"
                fill="none"
                stroke="#FF3030"
                strokeWidth="1.5"
                opacity="0.8"
              >
                <animate attributeName="r" values="6;15" dur="0.8s" repeatCount="1" fill="freeze" />
                <animate attributeName="opacity" values="0.8;0" dur="0.8s" repeatCount="1" fill="freeze" />
              </circle>
              <SnakeFood />
              <text
                y={it.y < 2 ? 19 : -17}
                textAnchor="middle"
                className="tac-tag"
                fill="#FF3030"
                opacity="0.9"
              >
                CONTACT
              </text>
            </g>
          ) : (
            <g
              key={it.id}
              className="hazard-box"
              transform={`translate(${it.x * CELL + CELL / 2} ${it.y * CELL + CELL / 2})`}
            >
              <circle
                key={vis.keys[it.id]}
                r="9"
                fill="none"
                stroke="#FFCC00"
                strokeWidth="1.5"
                opacity="0.8"
              >
                <animate attributeName="r" values="9;18" dur="0.8s" repeatCount="1" fill="freeze" />
                <animate attributeName="opacity" values="0.8;0" dur="0.8s" repeatCount="1" fill="freeze" />
              </circle>
              <HazardBox />
            </g>
          ),
        )}

        {/* vertical radar scan — the only food-reveal mechanism */}
        <line ref={trailRef} className="scan-trail" x1="0" y1="0" x2="0" y2={H} aria-hidden="true" />
        <line ref={scanLineRef} className="scan-line" x1="0" y1="0" x2="0" y2={H} aria-hidden="true" />

        {/* frame + corner brackets */}
        <rect x="1" y="1" width={W - 2} height={H - 2} fill="none" stroke="#00CC55" strokeWidth="1.5" />
        <g aria-hidden="true" stroke="#00FF66" strokeWidth="2" fill="none" opacity="0.9">
          <path d="M6,22 L6,6 L22,6" />
          <path d={`M${W - 22},6 L${W - 6},6 L${W - 6},22`} />
          <path d={`M${W - 6},${H - 22} L${W - 6},${H - 6} L${W - 22},${H - 6}`} />
          <path d={`M22,${H - 6} L6,${H - 6} L6,${H - 22}`} />
        </g>
      </svg>
    </div>
  );
}

export default memo(GameBoard);
