import { Link } from "react-router";
import { CLASSIC_DURATION_MS } from "../../config/game";
import { useClassicGame } from "../../hooks/useClassicGame";
import GameTarget from "./GameTarget";
import styles from "./Play.module.css";

export default function Play() {
  const game = useClassicGame();
  const clicksPerSecond = game.score / (CLASSIC_DURATION_MS / 1_000);

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <Link to="/home" className={styles.homeLink}>
          ClickRush
        </Link>
        <span className={styles.mode}>Classic · 60 seconds</span>
      </header>

      <main className={styles.main}>
        <div className={styles.intro}>
          <h1>How fast can you click?</h1>
          <p>
            Use the primary mouse button, a single touch, Space, or Enter.
          </p>
        </div>

        <GameTarget
          phase={game.phase}
          score={game.score}
          countdown={game.countdown}
          remainingMs={game.remainingMs}
          onStart={game.startCountdown}
          onScore={game.addClick}
        />

        <div className={styles.resultSlot}>
          {game.phase === "idle" && (
            <p className={styles.personalBest}>
              Personal best: <strong>{game.personalBest}</strong>
            </p>
          )}

          {game.phase === "countdown" && (
            <p className={styles.status}>Get ready…</p>
          )}

          {game.phase === "running" && (
            <p className={styles.status}>Keep going!</p>
          )}

          {game.phase === "finished" && (
            <section className={styles.results} aria-live="polite">
              <h2>{game.isNewPersonalBest ? "New personal best!" : "Time!"}</h2>
              <div className={styles.resultStats}>
                <p>
                  <strong>{game.score}</strong>
                  <span>clicks</span>
                </p>
                <p>
                  <strong>{clicksPerSecond.toFixed(2)}</strong>
                  <span>clicks / second</span>
                </p>
                <p>
                  <strong>{game.personalBest}</strong>
                  <span>personal best</span>
                </p>
              </div>
            </section>
          )}
        </div>
      </main>
    </div>
  );
}
