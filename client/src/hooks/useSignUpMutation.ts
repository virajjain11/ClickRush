import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { signUp } from "../api/auth";
import { startSession } from "../lib/authSession";

export function useSignUpMutation() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: signUp,
    onSuccess: (data) => {
      startSession(queryClient, data);
      navigate("/");
    },
  });
}
