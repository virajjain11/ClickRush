import { z } from "zod";
import {
  NAME_MAX_LENGTH,
  USERNAME_MAX_LENGTH,
  USERNAME_MIN_LENGTH,
} from "../constants/user.js";

const email = z
  .string()
  .trim()
  .toLowerCase()
  .pipe(z.email("Enter a valid email address"));

const password = z
  .string()
  .min(1, "Password is required")
  .min(8, "Password must be at least 8 characters");

export const nameSchema = z
  .string()
  .trim()
  .min(1, "Name is required")
  .max(NAME_MAX_LENGTH, `Name must be at most ${NAME_MAX_LENGTH} characters`);

export const usernameSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(
    USERNAME_MIN_LENGTH,
    `Username must be at least ${USERNAME_MIN_LENGTH} characters`,
  )
  .max(
    USERNAME_MAX_LENGTH,
    `Username must be at most ${USERNAME_MAX_LENGTH} characters`,
  )
  .regex(
    /^(?=.*[a-z])[a-z0-9_]+$/,
    "Username can contain lowercase letters, numbers, and underscores, and must include a letter",
  );

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
