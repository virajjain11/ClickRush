import { Link } from "react-router";
import { useGameHistoryQuery } from "../hooks/useGameHistoryQuery";
import { formatGameDate } from "../utils/formatDate";
import styles from "./Stats.module.css";

export default function Stats() {
  const { data, isPending, isError, error, isFetching, refetch } =
    useGameHistoryQuery("classic");

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <Link to="/home" className={styles.homeLink}>
          ClickRush
        </Link>
        <span className={styles.mode}>Classic</span>
      </header>

      <main className={styles.main}>
        <div>
          <h1 className={styles.title}>Your stats</h1>
          <p className={styles.subtitle}>
            Server-backed classic history. Personal best is the highest saved
            score across every completed round.
          </p>
        </div>

        {isPending && (
          <p className={styles.status} role="status">
            Loading your stats…
          </p>
        )}

        {isError && (
          <div className={styles.errorGroup} role="alert">
            <p className={styles.error}>{getErrorMessage(error)}</p>
            <button
              type="button"
              className={styles.retry}
              onClick={() => refetch()}
              disabled={isFetching}
            >
              {isFetching ? "Retrying…" : "Try again"}
            </button>
          </div>
        )}

        {data && (
          <>
            <section className={styles.summary}>
              <div className={styles.stat}>
                <strong>{data.personalBest}</strong>
                <span>personal best</span>
              </div>
              <div className={styles.stat}>
                <strong>{data.gamesPlayed}</strong>
                <span>games played</span>
              </div>
              <div className={styles.stat}>
                <strong>{data.averageScore.toFixed(1)}</strong>
                <span>average score</span>
              </div>
            </section>

            <section className={styles.card}>
              <h2 className={styles.cardTitle}>Recent rounds</h2>

              {data.games.length === 0 ? (
                <p className={styles.status}>
                  Play a classic round to start your history.
                </p>
              ) : (
                <ol className={styles.history}>
                  {data.games.map((game) => (
                    <li key={game.id} className={styles.historyItem}>
                      <div>
                        <p className={styles.historyScore}>{game.score}</p>
                        <p className={styles.historyMeta}>
                          {formatClicksPerSecond(game.score, data.durationMs)}{" "}
                          clicks / second
                        </p>
                      </div>
                      <time
                        className={styles.historyDate}
                        dateTime={game.endedAt}
                      >
                        {formatGameDate(game.endedAt)}
                      </time>
                    </li>
                  ))}
                </ol>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  );
}

function formatClicksPerSecond(score: number, durationMs: number): string {
  return (score / (durationMs / 1_000)).toFixed(2);
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Unable to load your stats";
}
