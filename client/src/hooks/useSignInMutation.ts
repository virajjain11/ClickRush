import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { signIn } from "../api/auth";
import { startSession } from "../lib/authSession";

export function useSignInMutation() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: signIn,
    onSuccess: (data) => {
      startSession(queryClient, data);
      navigate("/");
    },
  });
}
