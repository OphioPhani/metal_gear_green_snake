// Codec HUD: top bar, hero title block, telemetry strip, comms log.
// Pure presentation over game state — no logic lives here.
import { useEffect, useState } from 'react';
import { formatScore, MAX_HEARTS, POINTS_PER_FOOD } from '../game/constants.js';

function useSystemTime() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  const p = (n) => String(n).padStart(2, '0');
  return `${p(now.getHours())}:${p(now.getMinutes())}:${p(now.getSeconds())}`;
}

function SignalBars({ status, total = 10, level }) {
  // Decorative only — real state is conveyed by the STATUS text.
  const fallback =
    status === 'playing' ? 8 : status === 'paused' ? 5 : status === 'gameover' ? 2 : 6;
  const raw = level ?? fallback;
  // Clamp: String.repeat throws on negative counts, and level may exceed
  // a smaller `total` (e.g. playing=8 with total=6).
  const filled = Math.max(0, Math.min(total, raw));
  const empty = Math.max(0, total - filled);
  const alert = status === 'gameover';
  return (
    <span className={`signal-bars${alert ? ' alert' : ''}`} aria-hidden="true">
      {'█'.repeat(filled)}
      <span className="signal-dim">{'░'.repeat(empty)}</span>
    </span>
  );
}

// Live Codec signal monitor: a scrolling radio trace. New samples enter
// on the right each column-tick and age leftward (ring buffer, so the
// loop is seamless — never a visible reset). Re-renders are scoped to
// this panel only.
const WAVE_COLS = 48; // 2 units each across the 96-unit viewBox
const WAVE_MID = 14;

const clamp1 = (v) => Math.max(-1, Math.min(1, v));

// Irregular tactical signal: wandering base + small jitter, occasional
// medium peaks, rare large spikes, rare dips. Never a clean sine.
function nextSample(s) {
  s.base = Math.max(-0.35, Math.min(0.35, s.base + (Math.random() - 0.5) * 0.5));
  let v = s.base + (Math.random() - 0.5) * 0.25;
  if (s.spikeT > 0) {
    s.spikeT -= 1;
    v += s.spikeAmp * Math.sin(((s.spikeDur - s.spikeT) / s.spikeDur) * Math.PI);
  } else if (Math.random() < 0.06) {
    s.spikeDur = 3 + Math.floor(Math.random() * 6);
    s.spikeT = s.spikeDur;
    const big = Math.random() < 0.2;
    s.spikeAmp = (big ? 0.9 : 0.45 + Math.random() * 0.2) * (Math.random() < 0.5 ? 1 : -1);
  }
  if (Math.random() < 0.03) v -= 0.4;
  return clamp1(v);
}

function SignalMonitor({ status }) {
  // Samples + generator live in refs; `frame` just schedules repaints.
  const colsRef = useState(() =>
    Array.from({ length: WAVE_COLS }, () => (Math.random() - 0.5) * 0.3),
  )[0];
  const genRef = useState(() => ({ base: 0, spikeT: 0, spikeDur: 0, spikeAmp: 0 }))[0];
  const emaRef = useState(() => ({ v: 0.3 }))[0];
  const [, setFrame] = useState(0);
  const [level, setLevel] = useState(6);
  const [freq, setFreq] = useState('140.85');

  const active = status === 'playing';
  const idle = status === 'idle';

  useEffect(() => {
    // Paused: frozen frame. Game over: flattened dim line, no updates.
    if (!active && !idle) return undefined;
    const step = active ? 110 : 400;
    const scale = active ? 1 : 0.25; // idle drift is a faint whisper
    let n = 0;
    const id = setInterval(() => {
      const v = nextSample(genRef) * scale;
      colsRef.shift();
      colsRef.push(v);
      emaRef.v += (Math.abs(v) - emaRef.v) * 0.25;
      if (active) {
        setLevel(Math.max(4, Math.min(10, 5 + Math.round(emaRef.v * 5))));
        n += 1;
        if (n % 9 === 0) setFreq((140.85 + (Math.random() - 0.5) * 0.06).toFixed(2));
      }
      setFrame((f) => f + 1);
    }, step);
    return () => clearInterval(id);
  }, [status, active, idle, colsRef, genRef, emaRef]);

  const flat = status === 'gameover';
  const pts = flat
    ? Array.from({ length: WAVE_COLS }, (_, i) => `${i * 2},${WAVE_MID}`).join(' ')
    : colsRef.map((v, i) => `${i * 2},${(WAVE_MID + v * 11).toFixed(1)}`).join(' ');

  return (
    <>
      <div className="sig-row">
        <span className="lbl">SIGNAL</span>
        <SignalBars status={status} level={active ? level : undefined} />
      </div>
      <svg
        className={`wave${flat ? ' flat' : ''}`}
        viewBox="0 0 96 28"
        aria-hidden="true"
        preserveAspectRatio="none"
      >
        <line x1="0" y1={WAVE_MID} x2="96" y2={WAVE_MID} className="wave-mid" />
        {!flat && <polygon points={`${pts} 96,28 0,28`} className="wave-fill" />}
        <polyline points={pts} className="wave-line" />
      </svg>
      <div className="sig-row small">
        <span>FREQ. {freq}</span>
        <span>VER 1.0</span>
      </div>
    </>
  );
}

const STATUS_TEXT = {
  playing: 'OPERATIONAL',
  paused: 'HELD // PAUSED',
  gameover: 'SIGNAL LOST',
  idle: 'STANDBY',
};

export default function GameUI({ score, high, status, tickMs, log, eatPulse, hearts }) {
  const time = useSystemTime();
  // SPEED is fixed at 01 for the whole game — length never affects pace.
  const speed = '01';
  const targets = String(Math.floor(score / POINTS_PER_FOOD)).padStart(2, '0');

  return (
    <>
      <div className="topbar panel-box">
        <span className="top-left">
          <span className="sq" aria-hidden="true" />
          CODEC // CHANNEL 01 <SignalBars status={status} total={6} />
        </span>
        <span className="top-right">SNAKE PROTOCOL v1.0.0</span>
      </div>

      <div className="hero">
        <div className="motto panel-box" aria-hidden="true">
          <span>TACTICAL</span>
          <span>AWARENESS</span>
          <span>SURVIVAL</span>
          <span className="motto-hi">IS VICTORY</span>
        </div>

        <div className="title-block">
          <div className="sys-tag">SYSTEM: MG-GS // TACTICAL FEED</div>
          <h1 className="game-title">
            <span className="t-line1">METAL GEAR</span>
            <span className="t-line2">GREEN SNAKE</span>
          </h1>
          <p className="subtitle">STEALTH&nbsp;&nbsp;//&nbsp;&nbsp;STRATEGY&nbsp;&nbsp;//&nbsp;&nbsp;SURVIVAL</p>
        </div>

        <div className="signal panel-box">
          <SignalMonitor status={status} />
        </div>
      </div>

      <section className="telemetry panel-box" aria-live="polite" aria-label="Telemetry">
        <div className="tele-score">
          <span>
            SCORE&nbsp;:&nbsp;<strong key={eatPulse} className="tele-val flash">{formatScore(score)}</strong>
          </span>
          <span className="tele-high">
            HIGH&nbsp;:&nbsp;<strong className="tele-val">{formatScore(high)}</strong>
          </span>
        </div>
        <div className="tele-grid">
          <span>
            STATUS&nbsp;:&nbsp;
            <strong className={`st st-${status}`}>{STATUS_TEXT[status]}</strong>
          </span>
          <span>
            SPEED&nbsp;:&nbsp;<strong className="tele-val">{speed}</strong>
          </span>
          <span className="tele-dim">TICK&nbsp;:&nbsp;{tickMs}MS</span>
          <span className="tele-dim">TARGETS&nbsp;:&nbsp;{targets}</span>
          <span>
            HEALTH&nbsp;:&nbsp;
            <strong className={hearts <= 2 ? 'hp-low' : 'hp-full'} aria-label={`${hearts} of ${MAX_HEARTS} hearts`}>
              {'♥'.repeat(hearts)}
              <span className="hp-empty">{'♡'.repeat(MAX_HEARTS - hearts)}</span>
            </strong>
          </span>
          <span className="tele-dim">THREAT&nbsp;:&nbsp;NONE</span>
        </div>
      </section>

      <div className="comms">
        <div className="transmission panel-box" aria-label="Codec communication log">
          {log.map((m) => (
            <div key={m.id} className="tx-line">
              {m.text}
              {m.id === log[log.length - 1]?.id ? (
                <span className="cursor" aria-hidden="true">
                  ▌
                </span>
              ) : null}
          </div>
          ))}
        </div>
        <aside className="sysinfo panel-box" aria-label="System information">
          <div><span className="lbl">LOCATION</span><span>:</span><span className="val">UNKNOWN</span></div>
          <div><span className="lbl">MODE</span><span>:</span><span className="val">TACTICAL</span></div>
          <div><span className="lbl">ENCRYPTION</span><span>:</span><span className="val">ACTIVE</span></div>
          <div><span className="lbl">TIME</span><span>:</span><span className="val">{time}</span></div>
        </aside>
      </div>
    </>
  );
}
