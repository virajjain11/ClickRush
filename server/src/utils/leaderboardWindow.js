import { LEADERBOARD_PERIODS } from "../constants/game.js";

// Calendar periods in UTC. Rolling last-N-hours windows never crown a winner;
// these bounds close so each day, ISO week, and month has one board.
export function getLeaderboardWindow(period, now = new Date()) {
  switch (period) {
    case LEADERBOARD_PERIODS.DAILY:
      return getUtcDayWindow(now);
    case LEADERBOARD_PERIODS.WEEKLY:
      return getUtcIsoWeekWindow(now);
    case LEADERBOARD_PERIODS.MONTHLY:
      return getUtcMonthWindow(now);
    default:
      return null;
  }
}

function getUtcDayWindow(now) {
  const start = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  );
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 1);

  return toIsoWindow(start, end);
}

function getUtcIsoWeekWindow(now) {
  const daysFromMonday = (now.getUTCDay() + 6) % 7;
  const start = new Date(
    Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate() - daysFromMonday,
    ),
  );
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 7);

  return toIsoWindow(start, end);
}

function getUtcMonthWindow(now) {
  const start = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1),
  );
  const end = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1),
  );

  return toIsoWindow(start, end);
}

function toIsoWindow(start, end) {
  return {
    start: start.toISOString(),
    end: end.toISOString(),
  };
}
