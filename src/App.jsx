import GameBoard from './components/GameBoard.jsx';
import GameUI from './components/GameUI.jsx';
import Controls from './components/Controls.jsx';
import GameOver from './components/GameOver.jsx';
import PortraitPanel from './components/portraits/PortraitPanel.jsx';
import OperatorPortrait from './components/portraits/OperatorPortrait.jsx';
import SnakePortrait from './components/portraits/SnakePortrait.jsx';
import { useSnakeGame } from './game/useSnakeGame.js';
import './styles.css';

export default function App() {
  const game = useSnakeGame();

  return (
    <div className="crt">
      <div className="scanlines" aria-hidden="true" />
      <div className="vignette" aria-hidden="true" />
      <main className="mg-frame" aria-label="Metal Gear Green Snake tactical terminal">
        <span className="corner tl" aria-hidden="true" />
        <span className="corner tr" aria-hidden="true" />
        <span className="corner bl" aria-hidden="true" />
        <span className="corner br" aria-hidden="true" />

        <GameUI
          score={game.score}
          high={game.high}
          status={game.status}
          tickMs={game.tickMs}
          log={game.log}
          eatPulse={game.eatPulse}
          hearts={game.hearts}
        />

        <div className="codec-row">
          <PortraitPanel
            side="left"
            code="OPERATOR // 01"
            status="ONLINE"
            label="Unknown operator"
          >
            <OperatorPortrait />
          </PortraitPanel>

          <div className="stage">
            <GameBoard
              snake={game.snake}
              food={game.food}
              hazards={game.hazards}
              status={game.status}
              runId={game.runId}
              onScanWrap={game.regenHazards}
              onSwipe={game.move}
            />
            {game.hitPulse > 0 && <div key={game.hitPulse} className="hit-flash" aria-hidden="true" />}
            <GameOver
              status={game.status}
              score={game.score}
              high={game.high}
              won={game.won}
              deathCause={game.deathCause}
              onStart={game.start}
              onRestart={game.restart}
            />
          </div>

          <PortraitPanel
            side="right"
            code="SNAKE // 01"
            status="ACTIVE"
            label="Green Snake"
          >
            <SnakePortrait />
          </PortraitPanel>
        </div>

        <div className="proto-strip" aria-hidden="true">
          <span>SNAKE PROTOCOL // TACTICAL FEED</span>
          <span className="proto-line" />
          <span>STAY LOW. MOVE SMART.</span>
          <span className="sq" />
        </div>

        <Controls
          status={game.status}
          onMove={game.move}
          onPause={game.togglePause}
          onRestart={game.restart}
        />

        <hr className="rule" />
        <footer className="foot">
          <span>
            METAL GEAR GREEN SNAKE
            <br />
            A TACTICAL SNAKE SIMULATION
          </span>
          <span>
            INPUT: KEYBOARD + TOUCH
            <br />
            TRANSMISSION: SECURE // CHANNEL 01
          </span>
          <span>
            CODEC SYSTEM ONLINE
            <br />
            RADAR ACTIVE
          </span>
        </footer>
        <hr className="rule dev-rule" aria-hidden="true" />
        <footer className="dev-foot" aria-label="Developer attribution">
          <div className="dev-foot-title">METAL GEAR GREEN SNAKE</div>
          <div className="dev-foot-sub">A TACTICAL SNAKE SIMULATION</div>
          <div className="dev-foot-by">DEVELOPED BY PHANI CHANDRA</div>
          <nav className="dev-links" aria-label="Developer social links">
            <a
              href="https://github.com/OphioPhani"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Phani Chandra on GitHub"
            >
              [GITHUB]
            </a>
            <a
              href="https://www.linkedin.com/in/ganji-phani-chandra-730809380/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Phani Chandra on LinkedIn"
            >
              [LINKEDIN]
            </a>
            <a
              href="https://www.instagram.com/2h4ni_/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Phani Chandra on Instagram"
            >
              [INSTAGRAM]
            </a>
          </nav>
        </footer>
      </main>
    </div>
  );
}
