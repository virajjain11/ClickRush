import { apiRequest } from "../lib/apiClient";
import type {
  ForgotPasswordValues,
  SignInValues,
  SignUpValues,
} from "../schemas/auth";
import type { AuthResponse, ForgotPasswordResponse } from "../types/auth";
import { endpoints } from "./endpoints";

export function signUp(values: SignUpValues): Promise<AuthResponse> {
  return apiRequest<AuthResponse>(endpoints.auth.signUp, {
    method: "POST",
    body: values,
    fallbackErrorMessage: "Unable to create your account",
  });
}

export function signIn(values: SignInValues): Promise<AuthResponse> {
  return apiRequest<AuthResponse>(endpoints.auth.signIn, {
    method: "POST",
    body: values,
    fallbackErrorMessage: "Unable to sign you in",
  });
}

export function signInWithGoogle(idToken: string): Promise<AuthResponse> {
  return apiRequest<AuthResponse>(endpoints.auth.google, {
    method: "POST",
    body: { idToken },
    fallbackErrorMessage: "Unable to sign you in with Google",
  });
}

export function forgotPassword(
  values: ForgotPasswordValues,
): Promise<ForgotPasswordResponse> {
  return apiRequest<ForgotPasswordResponse>(endpoints.auth.forgotPassword, {
    method: "POST",
    body: values,
    fallbackErrorMessage: "Unable to send the reset link",
  });
}
