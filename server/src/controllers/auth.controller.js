import * as authService from "../services/auth.service.js";

export async function signUp(req, res) {
  const result = await authService.signUp(req.body);

  res.status(201).json(result);
}

export async function signIn(req, res) {
  const result = await authService.signIn(req.body);

  res.status(200).json(result);
}

export async function forgotPassword(req, res) {
  await authService.requestPasswordReset(req.body);

  res.status(200).json({
    message: "A reset link has been sent.",
  });
}

export async function signInWithGoogle(req, res) {
  const result = await authService.signInWithGoogle(req.body);

  res.status(200).json(result);
}
