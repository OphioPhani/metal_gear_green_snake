// Overlay screens: standby / held / system-failure panels.
// Board stays faintly visible behind — never a full opaque modal.
import { formatScore } from '../game/constants.js';

function Hazard({ label }) {
  return <div className="hazard" aria-hidden="true" title={label} />;
}

export default function GameOver({ status, score, high, won, deathCause, onStart, onRestart }) {
  if (status === 'playing') return null;

  if (status === 'idle') {
    return (
      <div className="overlay" role="dialog" aria-modal="false" aria-label="Standby screen">
        <div className="tac-panel">
          <Hazard label="standby" />
          <p className="fail-kicker">MG-GS // STANDBY</p>
          <h2 className="fail-title">GREEN SNAKE</h2>
          <p className="panel-line">&gt; AWAITING OPERATOR INPUT</p>
          <button
            type="button"
            className="abtn primary"
            onClick={onStart}
            autoFocus
            aria-label="Start operation"
          >
            [ START OPERATION ]
          </button>
          <p className="panel-line dim">ARROW KEYS / WASD TO MOVE</p>
          <p className="panel-line dim">[P] PAUSE · [R] RESTART</p>
          <Hazard label="standby" />
        </div>
      </div>
    );
  }

  if (status === 'paused') {
    return (
      <div className="overlay thin" role="dialog" aria-label="Paused">
        <div className="tac-panel small">
          <Hazard label="held" />
          <h2 className="fail-title small blink">TRANSMISSION HELD</h2>
          <p className="panel-line dim">PRESS [P] OR RESUME TO CONTINUE</p>
          <Hazard label="held" />
        </div>
      </div>
    );
  }

  // gameover — tactical system failure
  return (
    <div className="overlay thin" role="dialog" aria-modal="false" aria-label="Game over">
      <div className="tac-panel fail">
        <Hazard label="failure" />
        <h2 className="fail-title">{won ? 'SECTOR SECURED' : 'GAME OVER'}</h2>
        <p className="fail-warn" role="alert">
          {deathCause === 'hazards' ? '⚠ ALL UNITS LOST ⚠' : '⚠ SIGNAL LOST ⚠'}
        </p>
        <p className="panel-line">&gt; OPERATION TERMINATED</p>
        <p className="panel-line">
          &gt; SCORE&nbsp;&nbsp;&nbsp;&nbsp;: <strong>{formatScore(score)}</strong>
        </p>
        <p className="panel-line">
          &gt; HIGH SCORE: <strong>{formatScore(high)}</strong>
        </p>
        {won && <p className="panel-line">&gt; BOARD CLEAR // FLAWLESS OPERATION</p>}
        <button
          type="button"
          className="abtn primary"
          onClick={onRestart}
          autoFocus
          aria-label="Restart game"
        >
          [ RESTART ]
        </button>
        <Hazard label="failure" />
      </div>
    </div>
  );
}
