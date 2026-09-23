// Buttons + touch D-pad. Every action is also on the keyboard;
// buttons expose the same handlers with accessible labels.
export default function Controls({ status, onMove, onPause, onRestart }) {
  const playing = status === 'playing';
  const paused = status === 'paused';

  const dirBtn = (name, label, hint) => (
    <button
      type="button"
      className="tbtn"
      aria-label={`Move ${label}`}
      onClick={() => onMove(name)}
    >
      {hint}
    </button>
  );

  return (
    <div className="controls">
      {status !== 'idle' && (
        <div className="btn-row">
          <button
            type="button"
            className="abtn"
            onClick={onRestart}
            aria-label="Restart game (R)"
          >
            [ RESTART ]
          </button>
          <button
            type="button"
            className="abtn"
            onClick={onPause}
            aria-label={paused ? 'Resume game (P)' : 'Pause game (P)'}
            disabled={!(playing || paused)}
          >
            {paused ? '[ RESUME ]' : '[ PAUSE ]'}
          </button>
        </div>
      )}

      <div className="dpad" aria-label="Directional controls">
        <div className="dpad-row">
          {dirBtn('UP', 'up', '▲')}
        </div>
        <div className="dpad-row">
          {dirBtn('LEFT', 'left', '◀')}
          {dirBtn('DOWN', 'down', '▼')}
          {dirBtn('RIGHT', 'right', '▶')}
        </div>
      </div>

      <p className="hints" aria-label="Keyboard controls">
        [↑][↓][←][→] / [W][A][S][D] MOVE&nbsp;&nbsp;·&nbsp;&nbsp;[P] PAUSE&nbsp;&nbsp;·&nbsp;&nbsp;[R]
        RESTART
      </p>
    </div>
  );
}
