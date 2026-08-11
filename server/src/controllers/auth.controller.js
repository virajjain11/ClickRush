import * as authService from "../services/auth.service.js";

export async function signUp(req, res) {
  const user = await authService.signUp(req.body);

  res.status(201).json({ user });
}

export async function signIn(req, res) {
  const user = await authService.signIn(req.body);

  res.status(200).json({ user });
}

export async function forgotPassword(req, res) {
  await authService.requestPasswordReset(req.body);

  res.status(200).json({
    message: "A reset link has been sent.",
  });
}
