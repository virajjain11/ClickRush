import { useMutation } from "@tanstack/react-query";
import { startGame } from "../api/games";

export function useStartGameMutation() {
  return useMutation({
    mutationFn: startGame,
  });
}
