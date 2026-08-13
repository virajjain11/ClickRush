import { useCallback, useEffect, useRef, useState } from "react";
import {
  CLASSIC_DURATION_MS,
  COUNTDOWN_DURATION_MS,
  GAME_TIMER_INTERVAL_MS,
} from "../config/game";
import {
  getClassicPersonalBest,
  setClassicPersonalBest,
} from "../lib/gameStorage";

export type GamePhase = "idle" | "countdown" | "running" | "finished";

type GameState = {
  phase: GamePhase;
  score: number;
  countdown: number;
  remainingMs: number;
  personalBest: number;
  isNewPersonalBest: boolean;
};

const INITIAL_COUNTDOWN = COUNTDOWN_DURATION_MS / 1_000;

export function useClassicGame() {
  const scoreRef = useRef(0);
  const phaseRef = useRef<GamePhase>("idle");
  const roundDeadlineRef = useRef(0);
  const [state, setState] = useState<GameState>(() => ({
    phase: "idle",
    score: 0,
    countdown: INITIAL_COUNTDOWN,
    remainingMs: CLASSIC_DURATION_MS,
    personalBest: getClassicPersonalBest(),
    isNewPersonalBest: false,
  }));

  const startCountdown = useCallback(() => {
    if (
      phaseRef.current !== "idle" &&
      phaseRef.current !== "finished"
    ) {
      return;
    }

    phaseRef.current = "countdown";
    scoreRef.current = 0;
    setState((current) => ({
      ...current,
      phase: "countdown",
      score: 0,
      countdown: INITIAL_COUNTDOWN,
      remainingMs: CLASSIC_DURATION_MS,
      isNewPersonalBest: false,
    }));
  }, []);

  const addClick = useCallback(() => {
    if (phaseRef.current !== "running") {
      return;
    }

    scoreRef.current += 1;
    setState((current) => ({ ...current, score: scoreRef.current }));
  }, []);

  useEffect(() => {
    if (state.phase !== "countdown") {
      return;
    }

    const countdownDeadline = performance.now() + COUNTDOWN_DURATION_MS;
    const intervalId = window.setInterval(() => {
      const remainingMs = countdownDeadline - performance.now();

      if (remainingMs <= 0) {
        phaseRef.current = "running";
        roundDeadlineRef.current = performance.now() + CLASSIC_DURATION_MS;
        setState((current) => ({
          ...current,
          phase: "running",
          countdown: 0,
          remainingMs: CLASSIC_DURATION_MS,
        }));
        return;
      }

      const countdown = Math.ceil(remainingMs / 1_000);
      setState((current) =>
        current.countdown === countdown
          ? current
          : { ...current, countdown },
      );
    }, GAME_TIMER_INTERVAL_MS);

    return () => window.clearInterval(intervalId);
  }, [state.phase]);

  useEffect(() => {
    if (state.phase !== "running") {
      return;
    }

    const updateTimer = () => {
      const remainingMs = Math.max(
        0,
        roundDeadlineRef.current - performance.now(),
      );

      if (remainingMs === 0) {
        phaseRef.current = "finished";
        const finalScore = scoreRef.current;

        setState((current) => {
          const personalBest = Math.max(current.personalBest, finalScore);
          const isNewPersonalBest =
            finalScore > 0 && finalScore > current.personalBest;

          if (isNewPersonalBest) {
            setClassicPersonalBest(personalBest);
          }

          return {
            ...current,
            phase: "finished",
            score: finalScore,
            remainingMs: 0,
            personalBest,
            isNewPersonalBest,
          };
        });
        return;
      }

      setState((current) => ({ ...current, remainingMs }));
    };

    const intervalId = window.setInterval(
      updateTimer,
      GAME_TIMER_INTERVAL_MS,
    );
    document.addEventListener("visibilitychange", updateTimer);

    return () => {
      window.clearInterval(intervalId);
      document.removeEventListener("visibilitychange", updateTimer);
    };
  }, [state.phase]);

  return {
    ...state,
    addClick,
    startCountdown,
  };
}
