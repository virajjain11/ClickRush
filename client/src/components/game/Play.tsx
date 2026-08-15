import { useCallback, useEffect, useRef } from "react";
import { Link } from "react-router";
import { useClassicGame } from "../../hooks/useClassicGame";
import { useFinishGameMutation } from "../../hooks/useFinishGameMutation";
import { useGameHistoryQuery } from "../../hooks/useGameHistoryQuery";
import { useStartGameMutation } from "../../hooks/useStartGameMutation";
import GameTarget from "./GameTarget";
import styles from "./Play.module.css";

export default function Play() {
  const historyQuery = useGameHistoryQuery("classic");
  const game = useClassicGame(historyQuery.data?.personalBest);
  const startGameMutation = useStartGameMutation();
  const {
    mutate: finishGame,
    reset: resetFinishGame,
    error: finishError,
    isError: isFinishError,
    isPending: isFinishPending,
    isSuccess: isFinishSuccess,
  } = useFinishGameMutation();
  const submittedTokenRef = useRef<string | null>(null);
  const { confirmSavedScore, gameSessionToken, score } = game;
  const clicksPerSecond = game.score / (game.roundDurationMs / 1_000);

  const submitScore = useCallback(() => {
    if (!gameSessionToken) {
      return;
    }

    finishGame(
      {
        gameSessionToken,
        score,
      },
      {
        onSuccess: ({ game: savedGame }) => {
          confirmSavedScore(savedGame.score);
        },
      },
    );
  }, [confirmSavedScore, finishGame, gameSessionToken, score]);

  useEffect(() => {
    if (
      game.phase !== "finished" ||
      !gameSessionToken ||
      submittedTokenRef.current === gameSessionToken
    ) {
      return;
    }

    submittedTokenRef.current = gameSessionToken;
    submitScore();
  }, [game.phase, gameSessionToken, submitScore]);

  const handleStart = async () => {
    try {
      const session = await startGameMutation.mutateAsync({ mode: "classic" });

      resetFinishGame();
      game.beginRound(session);
    } catch {
      // The mutation error is rendered below; the current phase stays put.
    }
  };

  const isReplayDisabled =
    startGameMutation.isPending || !isFinishSuccess;

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
          isStarting={startGameMutation.isPending}
          isSaving={isFinishPending}
          isReplayDisabled={isReplayDisabled}
          onStart={handleStart}
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

              {isFinishPending && (
                <p className={styles.saveStatus}>Saving score…</p>
              )}

              {isFinishSuccess && (
                <p className={styles.saveStatus}>Score saved</p>
              )}

              {isFinishError && (
                <div className={styles.saveError} role="alert">
                  <p>{getErrorMessage(finishError)}</p>
                  <button
                    type="button"
                    className={styles.retry}
                    onClick={submitScore}
                  >
                    Try saving again
                  </button>
                </div>
              )}
            </section>
          )}

          {startGameMutation.isError && (
            <p className={styles.startError} role="alert">
              {getErrorMessage(startGameMutation.error)}
            </p>
          )}
        </div>
      </main>
    </div>
  );
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Something went wrong";
}
