import { randomUUID } from "node:crypto";

/**
 * testing: In-memory store, keyed by email. Swap the body of these functions for real
 * database queries; nothing outside this file knows how users are persisted.
 */
const usersByEmail = new Map();

export async function findByEmail(email) {
  const user = usersByEmail.get(email);

  return user ? { ...user } : null;
}

export async function findById(id) {
  const user = [...usersByEmail.values()].find(
    (candidate) => candidate.id === id,
  );

  return user ? { ...user } : null;
}

export async function create({ email, name, passwordHash }) {
  const user = {
    id: randomUUID(),
    name,
    email,
    passwordHash,
    passwordResetToken: null,
    passwordResetTokenExpiresAt: null,
    createdAt: new Date().toISOString(),
  };

  usersByEmail.set(email, user);

  return { ...user };
}

export async function update(email, changes) {
  const user = usersByEmail.get(email);
  if (!user) {
    return null;
  }

  const updatedUser = { ...user, ...changes, id: user.id, email: user.email };
  usersByEmail.set(email, updatedUser);

  return { ...updatedUser };
}
