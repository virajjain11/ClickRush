import confetti from "canvas-confetti";

const COLORS = ["#22d3ee", "#ffb703", "#f472b6", "#67e8f9", "#e8f4ff", "#fb7185"];
const DURATION_MS = 2500;
const WAVES = [
  [
    { x: 0.16, y: 0.2 },
    { x: 0.34, y: 0.14 },
  ],
  [
    { x: 0.68, y: 0.18 },
    { x: 0.86, y: 0.26 },
  ],
] as const;

let fireworksTimer: number | undefined;
const waveTimers: number[] = [];

function randomInRange(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

function burst(origin: { x: number; y: number }, particleCount: number) {
  void confetti({
    particleCount,
    startVelocity: 34,
    spread: 360,
    ticks: 90,
    gravity: 0.75,
    decay: 0.9,
    scalar: 1,
    origin,
    colors: COLORS,
    disableForReducedMotion: true,
    zIndex: 20,
  });
}

function fireWave(origins: readonly { x: number; y: number }[]) {
  for (const origin of origins) {
    burst(
      {
        x: origin.x + randomInRange(-0.04, 0.04),
        y: origin.y + randomInRange(-0.04, 0.04),
      },
      80,
    );
  }
}

function clearCelebration() {
  window.clearInterval(fireworksTimer);
  fireworksTimer = undefined;

  for (const timer of waveTimers) {
    window.clearTimeout(timer);
  }

  waveTimers.length = 0;
}

export function celebrateHiScore() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return;
  }

  clearCelebration();

  WAVES.forEach((origins, index) => {
    const timer = window.setTimeout(() => {
      fireWave(origins);
    }, index * 700);

    waveTimers.push(timer);
  });

  const animationEnd = Date.now() + DURATION_MS;

  fireworksTimer = window.setInterval(() => {
    const timeLeft = animationEnd - Date.now();

    if (timeLeft <= 0) {
      clearCelebration();
      return;
    }

    const particleCount = Math.round(55 * (timeLeft / DURATION_MS)) + 20;

    burst(
      { x: randomInRange(0.08, 0.32), y: randomInRange(0.1, 0.38) },
      particleCount,
    );
    burst(
      { x: randomInRange(0.4, 0.6), y: randomInRange(0.16, 0.46) },
      particleCount,
    );
    burst(
      { x: randomInRange(0.68, 0.92), y: randomInRange(0.1, 0.38) },
      particleCount,
    );
  }, 240);
}
