import { Link, useSearchParams } from "react-router";
import { useLeaderboardQuery } from "../hooks/useLeaderboardQuery";
import type { LeaderboardPeriod } from "../types/game";
import { formatLeaderboardWindow } from "../utils/formatDate";
import styles from "./Leaderboard.module.css";

const PERIODS: { id: LeaderboardPeriod; label: string }[] = [
  { id: "daily", label: "Daily" },
  { id: "weekly", label: "Weekly" },
  { id: "monthly", label: "Monthly" },
];

export default function Leaderboard() {
  const [searchParams, setSearchParams] = useSearchParams();
  const period = parsePeriod(searchParams.get("period"));
  const { data, isPending, isError, error, isFetching, refetch } =
    useLeaderboardQuery("classic", period);

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
          <h1 className={styles.title}>Hi-scores</h1>
          <p className={styles.subtitle}>
            Best classic score per player. Periods close on the UTC calendar,
            and the first player to a tied score ranks higher.
          </p>
        </div>

        <div
          className={styles.periods}
          role="tablist"
          aria-label="Leaderboard period"
        >
          {PERIODS.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={period === id}
              className={
                period === id
                  ? `${styles.period} ${styles.periodActive}`
                  : styles.period
              }
              onClick={() =>
                setSearchParams({ period: id }, { replace: true })
              }
            >
              {label}
            </button>
          ))}
        </div>

        <section className={styles.card}>
          {data && (
            <p className={styles.window}>
              {formatLeaderboardWindow(
                data.period,
                data.window.start,
                data.window.end,
              )}
            </p>
          )}

          {isPending && (
            <p className={styles.status} role="status">
              Loading the leaderboard…
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

          {data && data.entries.length === 0 && (
            <p className={styles.status}>
              No scores yet this period. Play a round to take first place.
            </p>
          )}

          {data && data.entries.length > 0 && (
            <table className={styles.table}>
              <caption className={styles.srOnly}>
                {period} classic leaderboard
              </caption>
              <thead>
                <tr>
                  <th scope="col">Rank</th>
                  <th scope="col">Player</th>
                  <th scope="col">Score</th>
                </tr>
              </thead>
              <tbody>
                {data.entries.map((entry) => (
                  <tr
                    key={entry.gameId}
                    className={entry.isViewer ? styles.viewerRow : undefined}
                  >
                    <td className={styles.rank}>
                      {String(entry.rank).padStart(2, "0")}
                    </td>
                    <td>
                      <span className={styles.playerName}>{entry.name}</span>
                      <span className={styles.username}>@{entry.username}</span>
                      {entry.isViewer && (
                        <span className={styles.you}>YOU</span>
                      )}
                    </td>
                    <td className={styles.score}>{entry.score}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        {data && (
          <p className={styles.viewerStatus}>
            {getViewerMessage(data.viewer, data.entries.length)}
          </p>
        )}
      </main>
    </div>
  );
}

function parsePeriod(value: string | null): LeaderboardPeriod {
  if (value === "weekly" || value === "monthly" || value === "daily") {
    return value;
  }

  return "daily";
}

function getViewerMessage(
  viewer: { rank: number; score: number } | null,
  entryCount: number,
): string {
  if (!viewer) {
    return "You have not posted a score this period yet.";
  }

  if (viewer.rank <= entryCount) {
    return `You are #${viewer.rank} with ${viewer.score} clicks.`;
  }

  return `You are #${viewer.rank} with ${viewer.score} clicks, just outside the top ${entryCount}.`;
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error
    ? error.message
    : "Unable to load the leaderboard";
}
