import {
  randomBytes,
  scrypt as scryptCallback,
  timingSafeEqual,
} from "node:crypto";
import { promisify } from "node:util";

const scrypt = promisify(scryptCallback);

const SALT_BYTES = 16;
const KEY_BYTES = 64;

export async function hashPassword(plainPassword) {
  const salt = randomBytes(SALT_BYTES).toString("hex");
  const derivedKey = await scrypt(plainPassword, salt, KEY_BYTES);

  return `${salt}:${derivedKey.toString("hex")}`;
}

export async function verifyPassword(plainPassword, passwordHash) {
  const [salt, storedKey] = String(passwordHash).split(":");
  if (!salt || !storedKey) {
    return false;
  }

  const storedKeyBuffer = Buffer.from(storedKey, "hex");
  if (storedKeyBuffer.length !== KEY_BYTES) {
    return false;
  }

  const derivedKey = await scrypt(plainPassword, salt, KEY_BYTES);

  return timingSafeEqual(storedKeyBuffer, derivedKey);
}
