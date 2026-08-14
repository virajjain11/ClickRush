import { memo } from "react";
import styles from "./Play.module.css";

type ClickCounterProps = {
  score: number;
};

function ClickCounter({ score }: ClickCounterProps) {
  return (
    <span className={styles.score} aria-live="off" aria-label={`${score} clicks`}>
      {score}
    </span>
  );
}

export default memo(ClickCounter);
