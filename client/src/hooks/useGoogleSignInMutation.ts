import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { signInWithGoogle } from "../api/auth";
import { startSession } from "../lib/authSession";

export function useGoogleSignInMutation() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: signInWithGoogle,
    onSuccess: (data) => {
      startSession(queryClient, data);
      navigate("/");
    },
  });
}
