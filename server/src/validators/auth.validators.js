import { z } from "zod";

const email = z
  .string()
  .trim()
  .toLowerCase()
  .pipe(z.email("Enter a valid email address"));

const password = z
  .string()
  .min(1, "Password is required")
  .min(8, "Password must be at least 8 characters");

export const signUpSchema = z.object({
  email,
  password,
});

export const signInSchema = z.object({
  email,
  password,
});

export const forgotPasswordSchema = z.object({
  email,
});
