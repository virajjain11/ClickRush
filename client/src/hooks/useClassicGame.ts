import { useCallback, useEffect, useRef, useState } from "react";
import {
  CLASSIC_DURATION_MS,
  COUNTDOWN_DURATION_MS,
  GAME_TIMER_INTERVAL_MS,
} from "../config/game";
import { getClassicPersonalBest } from "../lib/gameStorage";
import type { StartGameResponse } from "../types/game";

export type GamePhase = "idle" | "countdown" | "running" | "finished";

type GameState = {
  phase: GamePhase;
  score: number;
  countdown: number;
  remainingMs: number;
  personalBest: number;
  isNewPersonalBest: boolean;
  gameSessionToken: string | null;
  roundDurationMs: number;
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
    gameSessionToken: null,
    roundDurationMs: CLASSIC_DURATION_MS,
  }));

  const beginRound = useCallback((session: StartGameResponse) => {
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
      remainingMs: session.durationMs,
      isNewPersonalBest: false,
      gameSessionToken: session.gameSessionToken,
      roundDurationMs: session.durationMs,
    }));
  }, []);

  const confirmSavedScore = useCallback((savedScore: number) => {
    if (phaseRef.current !== "finished") {
      return;
    }

    scoreRef.current = savedScore;
    setState((current) => {
      const personalBest = Math.max(current.personalBest, savedScore);

      return {
        ...current,
        score: savedScore,
        personalBest,
        isNewPersonalBest:
          savedScore > 0 && savedScore > current.personalBest,
      };
    });
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
        roundDeadlineRef.current =
          performance.now() + state.roundDurationMs;
        setState((current) => ({
          ...current,
          phase: "running",
          countdown: 0,
          remainingMs: state.roundDurationMs,
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
  }, [state.phase, state.roundDurationMs]);

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

        setState((current) => ({
          ...current,
          phase: "finished",
          score: finalScore,
          remainingMs: 0,
          isNewPersonalBest: false,
        }));
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
    beginRound,
    confirmSavedScore,
  };
}
