import { Link, useSearchParams } from "react-router";
import { useAdminGamesQuery } from "../hooks/useAdminGamesQuery";
import { useAdminUsersQuery } from "../hooks/useAdminUsersQuery";
import type { DashboardTab } from "../types/admin";
import { formatGameDate } from "../utils/formatDate";
import styles from "./Dashboard.module.css";

const TABS: { id: DashboardTab; label: string }[] = [
  { id: "users", label: "All users" },
  { id: "games", label: "Games" },
];

export default function Dashboard() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = parseTab(searchParams.get("tab"));
  const usersQuery = useAdminUsersQuery(tab === "users");
  const gamesQuery = useAdminGamesQuery(tab === "games");

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <Link to="/home" className={styles.homeLink}>
          ClickRush
        </Link>
        <span className={styles.mode}>Admin</span>
      </header>

      <main className={styles.main}>
        <div>
          <h1 className={styles.title}>Dashboard</h1>
          <p className={styles.subtitle}>
            Activity across every account and completed round.
          </p>
        </div>

        <div className={styles.tabs} role="tablist" aria-label="Dashboard views">
          {TABS.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={tab === id}
              className={
                tab === id ? `${styles.tab} ${styles.tabActive}` : styles.tab
              }
              onClick={() => setSearchParams({ tab: id }, { replace: true })}
            >
              {label}
            </button>
          ))}
        </div>

        <section className={styles.card}>
          {tab === "users" ? (
            <UsersPanel query={usersQuery} />
          ) : (
            <GamesPanel query={gamesQuery} />
          )}
        </section>
      </main>
    </div>
  );
}

function UsersPanel({
  query,
}: {
  query: ReturnType<typeof useAdminUsersQuery>;
}) {
  const { data, isPending, isError, error, isFetching, refetch } = query;

  if (isPending) {
    return (
      <p className={styles.status} role="status">
        Loading users…
      </p>
    );
  }

  if (isError) {
    return (
      <QueryError
        message={getErrorMessage(error, "Unable to load users")}
        isFetching={isFetching}
        onRetry={() => refetch()}
      />
    );
  }

  if (!data || data.users.length === 0) {
    return <p className={styles.status}>No users yet.</p>;
  }

  return (
    <table className={styles.table}>
      <caption className={styles.srOnly}>All users</caption>
      <thead>
        <tr>
          <th scope="col">Name</th>
          <th scope="col">Username</th>
          <th scope="col">Email</th>
        </tr>
      </thead>
      <tbody>
        {data.users.map((user) => (
          <tr key={user.id}>
            <td>{user.name}</td>
            <td className={styles.meta}>@{user.username}</td>
            <td className={styles.meta}>{user.email}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function GamesPanel({
  query,
}: {
  query: ReturnType<typeof useAdminGamesQuery>;
}) {
  const { data, isPending, isError, error, isFetching, refetch } = query;

  if (isPending) {
    return (
      <p className={styles.status} role="status">
        Loading games…
      </p>
    );
  }

  if (isError) {
    return (
      <QueryError
        message={getErrorMessage(error, "Unable to load games")}
        isFetching={isFetching}
        onRetry={() => refetch()}
      />
    );
  }

  if (!data || data.games.length === 0) {
    return <p className={styles.status}>No games logged yet.</p>;
  }

  return (
    <table className={styles.table}>
      <caption className={styles.srOnly}>All games</caption>
      <thead>
        <tr>
          <th scope="col">Name</th>
          <th scope="col">Username</th>
          <th scope="col">Played at</th>
          <th scope="col" className={styles.score}>
            Score
          </th>
        </tr>
      </thead>
      <tbody>
        {data.games.map((game) => (
          <tr key={game.id}>
            <td>{game.name}</td>
            <td className={styles.meta}>@{game.username}</td>
            <td className={styles.meta}>
              <time dateTime={game.playedAt}>
                {formatGameDate(game.playedAt)}
              </time>
            </td>
            <td className={styles.score}>{game.score}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function QueryError({
  message,
  isFetching,
  onRetry,
}: {
  message: string;
  isFetching: boolean;
  onRetry: () => void;
}) {
  return (
    <div className={styles.errorGroup} role="alert">
      <p className={styles.error}>{message}</p>
      <button
        type="button"
        className={styles.retry}
        onClick={onRetry}
        disabled={isFetching}
      >
        {isFetching ? "Retrying…" : "Try again"}
      </button>
    </div>
  );
}

function parseTab(value: string | null): DashboardTab {
  if (value === "games" || value === "users") {
    return value;
  }

  return "users";
}

function getErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}
