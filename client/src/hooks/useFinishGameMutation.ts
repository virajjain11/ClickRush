import { useMutation, useQueryClient } from "@tanstack/react-query";
import { finishGame } from "../api/games";
import { queryKeys } from "../api/queryKeys";
import {
  getClassicPersonalBest,
  setClassicPersonalBest,
} from "../lib/gameStorage";

export function useFinishGameMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: finishGame,
    onSuccess: ({ game }) => {
      const personalBest = Math.max(getClassicPersonalBest(), game.score);

      setClassicPersonalBest(personalBest);
      queryClient.setQueryData(
        queryKeys.games.personalBest(game.mode),
        personalBest,
      );
      void queryClient.invalidateQueries({ queryKey: queryKeys.games.all });
    },
  });
}
