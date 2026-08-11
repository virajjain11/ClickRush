import { useQueryClient } from "@tanstack/react-query";
import { useCurrentUserQuery } from "../hooks/useCurrentUserQuery";
import { endSession } from "../lib/authSession";
import styles from "./Home.module.css";

export default function Home() {
  const queryClient = useQueryClient();
  const { data: user, isPending, isError, error, isFetching, refetch } =
    useCurrentUserQuery();

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <span className={styles.brand}>ClickRush</span>
        <button
          type="button"
          className={styles.signOut}
          onClick={() => endSession(queryClient)}
        >
          Sign out
        </button>
      </header>

      <main className={styles.main}>
        <div>
          <h1 className={styles.title}>
            {user ? `Welcome back, ${user.name}` : "Welcome back"}
          </h1>
          <p className={styles.subtitle}>
            Pick a mode below to start your next run.
          </p>
        </div>

        <section className={styles.card}>
          <h2 className={styles.cardTitle}>Your profile</h2>

          {isPending && (
            <p className={styles.cardBody} role="status">
              Loading your profile…
            </p>
          )}

          {isError && (
            <div className={styles.errorGroup} role="alert">
              <p className={styles.error}>{getProfileErrorMessage(error)}</p>
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

          {user && (
            <>
              <div className={styles.profile}>
                <span className={styles.avatar} aria-hidden="true">
                  {getInitial(user.name, user.email)}
                </span>
                <div>
                  <p className={styles.profileName}>{user.name}</p>
                  <p className={styles.profileEmail}>{user.email}</p>
                </div>
              </div>

              <dl className={styles.details}>
                <div className={styles.detailRow}>
                  <dt className={styles.detailLabel}>Member since</dt>
                  <dd className={styles.detailValue}>
                    {formatMemberSince(user.createdAt)}
                  </dd>
                </div>
                <div className={styles.detailRow}>
                  <dt className={styles.detailLabel}>User ID</dt>
                  <dd className={styles.detailValue}>{user.id}</dd>
                </div>
              </dl>
            </>
          )}
        </section>

        <div className={styles.cards}>
          <section className={styles.card}>
            <h2 className={styles.cardTitle}>Quick match</h2>
            <p className={styles.cardBody}>
              Jump into a 30 second round against a random opponent.
            </p>
          </section>

          <section className={styles.card}>
            <h2 className={styles.cardTitle}>Leaderboard</h2>
            <p className={styles.cardBody}>
              See how your best score stacks up against everyone else.
            </p>
          </section>

          <section className={styles.card}>
            <h2 className={styles.cardTitle}>Your stats</h2>
            <p className={styles.cardBody}>
              Track clicks per second, accuracy, and win streaks over time.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}

function getProfileErrorMessage(error: unknown): string {
  return error instanceof Error
    ? error.message
    : "Unable to load your profile";
}

function getInitial(name: string, email: string): string {
  return (name.trim() || email).charAt(0).toUpperCase();
}

function formatMemberSince(createdAt: string): string {
  const date = new Date(createdAt);

  if (Number.isNaN(date.getTime())) {
    return "Unknown";
  }

  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
