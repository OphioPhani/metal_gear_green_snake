// Radar sweep sound — tiny WebAudio synth, no assets, no libraries.
// One soft 1990s-style beam sweep per radar cycle: a sine gliding up with
// a faint octave shimmer, a slow warble, and a lowpass to keep it mellow.
// `sweepStats` is a read-only diagnostic counter (used by smoke tests).

export const RADAR_SCAN_VOLUME = 0.15;
export const SWEEP_DURATION_S = 1.4;

export const sweepStats = { plays: 0, stops: 0 };

let ctx = null;
let voice = null; // active nodes, if any

export function unlockAudio() {
  // Must run inside a user gesture (START OPERATION click / keypress) so
  // browser autoplay policy lets the context run. Safe to call repeatedly.
  try {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      ctx = new AC();
    }
    if (ctx.state === 'suspended') void ctx.resume().catch(() => {});
  } catch {
    ctx = null; // audio unavailable — the game stays silent, never crashes
  }
}

function halt(fade = 0.08) {
  // Stop the active voice, if any. Counts only real halts.
  if (!ctx || !voice) return;
  sweepStats.stops += 1;
  const { nodes, timer } = voice;
  voice = null;
  clearTimeout(timer);
  try {
    const t = ctx.currentTime;
    nodes.gain.gain.cancelScheduledValues(t);
    nodes.gain.gain.setValueAtTime(nodes.gain.gain.value, t);
    nodes.gain.gain.linearRampToValueAtTime(0.0001, t + fade);
    for (const o of nodes.oscs) o.stop(t + fade + 0.05);
  } catch {
    // already stopped — nothing to do
  }
}

export function stopSweep() {
  halt();
}

export function playSweep() {
  // One voice at a time: a retrigger (e.g. rapid restarts) fades the
  // previous sweep out instead of overlapping it.
  if (!ctx || ctx.state !== 'running') return;
  halt(0.03);
  try {
    const t = ctx.currentTime;
    const dur = SWEEP_DURATION_S;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(RADAR_SCAN_VOLUME, t + 0.06);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 1600;

    // main beam: soft sine gliding up
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(280, t);
    osc.frequency.exponentialRampToValueAtTime(840, t + dur * 0.85);

    // faint octave shimmer
    const shimmer = ctx.createOscillator();
    shimmer.type = 'triangle';
    shimmer.frequency.setValueAtTime(560, t);
    shimmer.frequency.exponentialRampToValueAtTime(1680, t + dur * 0.85);
    const shimmerGain = ctx.createGain();
    shimmerGain.gain.value = 0.18;

    // slow retro warble on the output level
    const lfo = ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.value = 8;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = RADAR_SCAN_VOLUME * 0.2;

    osc.connect(filter);
    shimmer.connect(shimmerGain);
    shimmerGain.connect(filter);
    filter.connect(gain);
    lfo.connect(lfoGain);
    lfoGain.connect(gain.gain);
    gain.connect(ctx.destination);

    osc.start(t);
    shimmer.start(t);
    lfo.start(t);
    const end = t + dur + 0.1;
    osc.stop(end);
    shimmer.stop(end);
    lfo.stop(end);

    const nodes = { gain, oscs: [osc, shimmer, lfo] };
    const v = { nodes, timer: 0 };
    voice = v;
    sweepStats.plays += 1;
    v.timer = setTimeout(() => {
      if (voice === v) voice = null;
    }, (dur + 0.2) * 1000);
    osc.onended = () => {
      if (voice === v) voice = null;
    };
  } catch {
    voice = null;
  }
}
