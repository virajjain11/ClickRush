import { memo } from "react";
import styles from "./Play.module.css";

type GameTimerProps = {
  remainingMs: number;
};

function GameTimer({ remainingMs }: GameTimerProps) {
  const remainingSeconds = Math.ceil(remainingMs / 1_000);
  const announcement = [30, 10, 5].includes(remainingSeconds)
    ? `${remainingSeconds} seconds remaining`
    : "";

  return (
    <>
      <span className={styles.timer} aria-hidden="true">
        {formatTime(remainingSeconds)}
      </span>
      <span className={styles.srOnly} aria-live="polite">
        {announcement}
      </span>
    </>
  );
}

function formatTime(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

export default memo(GameTimer);
