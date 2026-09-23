// Central game state + loop. Rendering and input stay in components;
// this hook owns the tick, direction queue and scoring.
//
// Session-only high score: held in React state, never persisted anywhere,
// so a page refresh resets it to zero. No backend, no storage APIs.
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  COLS,
  ROWS,
  DIRECTIONS,
  POINTS_PER_FOOD,
  GAME_SPEED_MS,
  MAX_HEARTS,
  HAZARD_COUNT,
  DAMAGE_COOLDOWN,
} from './constants.js';
import { spawnHazards } from './hazards.js';
import { unlockAudio } from './sound.js';
import { createInitialSnake, isOpposite } from './snake.js';
import { getRandomFood } from './food.js';
import { hitsWall, hitsSelf } from './collision.js';

let logId = 0;
function bootLog() {
  return [
    { id: logId++, text: '> ESTABLISHING CONNECTION...' },
    { id: logId++, text: '> CHANNEL SECURE' },
    { id: logId++, text: '> SNAKE PROTOCOL INITIALIZED' },
    { id: logId++, text: '> AWAITING INPUT...' },
  ];
}

export function useSnakeGame() {
  const [status, setStatus] = useState('idle'); // idle | playing | paused | gameover
  const [snake, setSnake] = useState(() => createInitialSnake());
  const [food, setFood] = useState(() => getRandomFood(createInitialSnake()));
  const [score, setScore] = useState(0);
  // Session high score: in-memory only. Survives restarts within this
  // visit, resets to 0 on refresh/close by design.
  const [high, setHigh] = useState(0);
  const [log, setLog] = useState(bootLog);
  const [won, setWon] = useState(false);
  const [eatPulse, setEatPulse] = useState(0); // increments per food, drives score flash
  const [hearts, setHearts] = useState(MAX_HEARTS);
  const [hazards, setHazards] = useState([]); // fixed cells until hit or rescan
  const [hitPulse, setHitPulse] = useState(0); // increments per hazard hit, drives damage flash
  const [deathCause, setDeathCause] = useState(null); // wall | self | hazards | win
  // Run counter: increments on every start/restart so the radar scan can
  // reset to the left edge. Gameplay logic never reads it.
  const [runId, setRunId] = useState(0);

  // Refs are the loop's source of truth (written directly in start/tick/
  // pause handlers); state mirrors them for rendering.
  const statusRef = useRef(status);
  const snakeRef = useRef(snake);
  const dirRef = useRef(DIRECTIONS.RIGHT);
  const queueRef = useRef([]);
  const foodRef = useRef(food);
  const scoreRef = useRef(0);
  const hazardsRef = useRef(hazards);
  const heartsRef = useRef(hearts);
  const lastDamageRef = useRef(0);

  const pushLog = useCallback((text) => {
    setLog((prev) => [...prev.slice(-3), { id: logId++, text }]);
  }, []);

  // Fixed tick: identical from first move until game over.
  const tickMs = GAME_SPEED_MS;

  // Queue a direction change; 180-degree reversals are dropped by
  // comparing against the last queued (or currently applied) direction.
  const setDirection = useCallback((next) => {
    if (statusRef.current !== 'playing') return;
    const q = queueRef.current;
    const last = q.length > 0 ? q[q.length - 1] : dirRef.current;
    if (next === last || isOpposite(next, last)) return;
    if (q.length < 3) q.push(next);
  }, []);

  const move = useCallback(
    (name) => {
      const d = DIRECTIONS[name];
      if (d) setDirection(d);
    },
    [setDirection],
  );

  const start = useCallback(() => {
    unlockAudio(); // user gesture: lets the radar sweep sound play
    const fresh = createInitialSnake();
    snakeRef.current = fresh;
    dirRef.current = DIRECTIONS.RIGHT;
    queueRef.current = [];
    scoreRef.current = 0;
    const f = getRandomFood(fresh);
    foodRef.current = f;
    const hz = spawnHazards(fresh, f, HAZARD_COUNT);
    hazardsRef.current = hz;
    heartsRef.current = MAX_HEARTS;
    lastDamageRef.current = 0;
    setSnake(fresh);
    setFood(f);
    setScore(0);
    setHazards(hz);
    setHearts(MAX_HEARTS);
    setDeathCause(null);
    setWon(false);
    setStatus('playing');
    statusRef.current = 'playing';
    setRunId((id) => id + 1);
    pushLog('> CONNECTION ESTABLISHED');
    pushLog('> SNAKE PROTOCOL ONLINE');
    pushLog('> BEGIN OPERATION');
  }, [pushLog]);

  const togglePause = useCallback(() => {
    if (statusRef.current === 'playing') {
      setStatus('paused');
      statusRef.current = 'paused';
      pushLog('> TRANSMISSION HELD // PAUSED');
    } else if (statusRef.current === 'paused') {
      setStatus('playing');
      statusRef.current = 'playing';
      queueRef.current = [];
      pushLog('> TRANSMISSION RESUMED');
    }
  }, [pushLog]);

  const restart = useCallback(() => {
    start();
    pushLog('> OPERATION RESTARTED');
  }, [start, pushLog]);

  // Called by the radar board on every scan wrap: fresh hazard layout for
  // the next sweep. Reads live positions via refs; no-ops unless playing.
  const regenHazards = useCallback(() => {
    if (statusRef.current !== 'playing') return;
    const next = spawnHazards(snakeRef.current, foodRef.current, HAZARD_COUNT);
    hazardsRef.current = next;
    setHazards(next);
  }, []);

  // ---- game loop ----
  // One fixed interval (GAME_SPEED_MS). Independent of score/length, so
  // the timer is never re-armed by pickups — only by status changes.
  useEffect(() => {
    if (status !== 'playing') return;
    const id = setInterval(() => {
      // Drain one queued turn per tick so fast key presses play back in order.
      const q = queueRef.current;
      if (q.length > 0) dirRef.current = q.shift();
      const dir = dirRef.current;
      const prev = snakeRef.current;
      const head = { x: prev[0].x + dir.x, y: prev[0].y + dir.y };

      if (hitsWall(head)) {
        setDeathCause('wall');
        setStatus('gameover');
        statusRef.current = 'gameover';
        pushLog('> SIGNAL LOST');
        pushLog('> OPERATION TERMINATED');
        return;
      }

      const f = foodRef.current;
      const ate = f != null && head.x === f.x && head.y === f.y;
      // When not eating, the tail vacates — exclude it from self-collision.
      const body = ate ? prev : prev.slice(0, -1);
      if (hitsSelf(body, head)) {
        setDeathCause('self');
        setStatus('gameover');
        statusRef.current = 'gameover';
        pushLog('> SIGNAL LOST');
        pushLog('> COLLISION // FRIENDLY UNIT');
        return;
      }

      // Hazard hit: visibility is irrelevant — the cell is hot regardless.
      const hi = hazardsRef.current.findIndex((p) => p.x === head.x && p.y === head.y);
      if (hi >= 0 && Date.now() - lastDamageRef.current >= DAMAGE_COOLDOWN) {
        lastDamageRef.current = Date.now();
        hazardsRef.current = hazardsRef.current.filter((_, i) => i !== hi);
        setHazards(hazardsRef.current);
        const h = heartsRef.current - 1;
        heartsRef.current = h;
        setHearts(h);
        setHitPulse((p) => p + 1);
        pushLog('> HAZARD IMPACT // -1 HEART');
        if (h <= 0) {
          setDeathCause('hazards');
          setStatus('gameover');
          statusRef.current = 'gameover';
          pushLog('> ALL UNITS LOST');
          pushLog('> OPERATION TERMINATED');
          return;
        }
      }

      const next = [head, ...body];
      snakeRef.current = next;
      setSnake(next);

      if (ate) {
        const s = scoreRef.current + POINTS_PER_FOOD;
        scoreRef.current = s;
        setScore(s);
        setEatPulse((p) => p + 1);
        setHigh((prev) => (s > prev ? s : prev));
        pushLog('> TARGET ACQUIRED // +10');
        pushLog('> BIOMETRIC SIGNAL DETECTED');
        if (next.length >= COLS * ROWS) {
          setWon(true);
          setDeathCause('win');
          setStatus('gameover');
          statusRef.current = 'gameover';
          pushLog('> SECTOR SECURED // BOARD CLEAR');
          return;
        }
        const nf = getRandomFood(next);
        foodRef.current = nf;
        setFood(nf);
      }
    }, GAME_SPEED_MS);
    return () => clearInterval(id);
  }, [status, pushLog]);

  // ---- global keyboard ----
  useEffect(() => {
    const onKey = (e) => {
      const k = e.key;
      const lower = k.length === 1 ? k.toLowerCase() : k;
      const st = statusRef.current;

      if (k === 'ArrowUp' || lower === 'w') {
        e.preventDefault();
        setDirection(DIRECTIONS.UP);
      } else if (k === 'ArrowDown' || lower === 's') {
        e.preventDefault();
        setDirection(DIRECTIONS.DOWN);
      } else if (k === 'ArrowLeft' || lower === 'a') {
        e.preventDefault();
        setDirection(DIRECTIONS.LEFT);
      } else if (k === 'ArrowRight' || lower === 'd') {
        e.preventDefault();
        setDirection(DIRECTIONS.RIGHT);
      } else if (lower === 'p') {
        if (st === 'playing' || st === 'paused') togglePause();
      } else if (lower === 'r') {
        if (st !== 'idle') restart();
        else start();
      } else if (k === ' ' || k === 'Enter') {
        // Space/Enter: start from menus, pause/resume mid-game.
        if (st === 'idle' || st === 'gameover') {
          e.preventDefault();
          start();
        } else if (st === 'playing' || st === 'paused') {
          e.preventDefault();
          togglePause();
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [setDirection, start, restart, togglePause]);

  return {
    status,
    snake,
    food,
    score,
    high,
    log,
    won,
    eatPulse,
    tickMs,
    runId,
    hearts,
    hazards,
    hitPulse,
    deathCause,
    start,
    restart,
    togglePause,
    move,
    regenHazards,
  };
}
