import type { LeaderboardPeriod } from "../types/game";

const UTC_DATE: Intl.DateTimeFormatOptions = {
  timeZone: "UTC",
};

export function formatGameDate(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Unknown";
  }

  return date.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function formatLeaderboardWindow(
  period: LeaderboardPeriod,
  start: string,
  end: string,
): string {
  const startDate = new Date(start);
  const lastIncluded = new Date(Date.parse(end) - 1);

  if (
    Number.isNaN(startDate.getTime()) ||
    Number.isNaN(lastIncluded.getTime())
  ) {
    return "UTC";
  }

  if (period === "daily") {
    return `${formatUtcDate(startDate)} · UTC`;
  }

  if (period === "monthly") {
    return `${startDate.toLocaleDateString(undefined, {
      ...UTC_DATE,
      month: "long",
      year: "numeric",
    })} · UTC`;
  }

  const startLabel = startDate.toLocaleDateString(undefined, {
    ...UTC_DATE,
    month: "short",
    day: "numeric",
  });
  const endLabel = lastIncluded.toLocaleDateString(undefined, {
    ...UTC_DATE,
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return `${startLabel} – ${endLabel} · UTC`;
}

function formatUtcDate(date: Date): string {
  return date.toLocaleDateString(undefined, {
    ...UTC_DATE,
    dateStyle: "medium",
  });
}
