import type { KeyboardEvent, PointerEvent } from "react";
import type { GamePhase } from "../../hooks/useClassicGame";
import ClickCounter from "./ClickCounter";
import GameTimer from "./GameTimer";
import styles from "./Play.module.css";

type GameTargetProps = {
  phase: GamePhase;
  score: number;
  countdown: number;
  remainingMs: number;
  onStart: () => void;
  onScore: () => void;
};

export default function GameTarget({
  phase,
  score,
  countdown,
  remainingMs,
  onStart,
  onScore,
}: GameTargetProps) {
  const activate = () => {
    if (phase === "running") {
      onScore();
    } else if (phase === "idle" || phase === "finished") {
      onStart();
    }
  };

  const handlePointerDown = (event: PointerEvent<HTMLButtonElement>) => {
    if (
      event.button !== 0 ||
      !event.isPrimary ||
      !event.nativeEvent.isTrusted
    ) {
      return;
    }

    activate();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (
      (event.key !== " " && event.key !== "Enter") ||
      event.repeat ||
      !event.nativeEvent.isTrusted
    ) {
      return;
    }

    event.preventDefault();
    activate();
  };

  return (
    <div className={styles.targetArea}>
      {phase === "running" && (
        <div className={styles.runningHud}>
          <ClickCounter score={score} />
          <span className={styles.clickLabel}>clicks</span>
          <GameTimer remainingMs={remainingMs} />
        </div>
      )}

      {phase === "countdown" ? (
        <span className={styles.countdown} aria-live="assertive">
          {countdown}
        </span>
      ) : (
        <button
          type="button"
          className={styles.target}
          onPointerDown={handlePointerDown}
          onKeyDown={handleKeyDown}
          onContextMenu={(event) => event.preventDefault()}
          aria-label={getTargetLabel(phase)}
        >
          {phase === "idle" && "Start"}
          {phase === "running" && "Click"}
          {phase === "finished" && "Play again"}
        </button>
      )}
    </div>
  );
}

function getTargetLabel(phase: GamePhase): string {
  switch (phase) {
    case "idle":
      return "Start 60 second classic game";
    case "running":
      return "Click target";
    case "finished":
      return "Play another 60 second classic game";
    case "countdown":
      return "Game starts after countdown";
  }
}
