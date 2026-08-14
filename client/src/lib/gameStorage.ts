const CLASSIC_PERSONAL_BEST_KEY = "clickrush:classic-personal-best";

export function getClassicPersonalBest(): number {
  const storedValue = localStorage.getItem(CLASSIC_PERSONAL_BEST_KEY);
  const personalBest = Number(storedValue);

  return Number.isSafeInteger(personalBest) && personalBest >= 0
    ? personalBest
    : 0;
}

export function setClassicPersonalBest(score: number): void {
  localStorage.setItem(CLASSIC_PERSONAL_BEST_KEY, String(score));
}
