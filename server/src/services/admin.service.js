import * as gameRepository from "../repositories/game.repository.js";
import * as userRepository from "../repositories/user.repository.js";

export async function listUsers() {
  const users = await userRepository.findAllForAdmin();

  return { users };
}

export async function listGames() {
  const games = await gameRepository.findAllWithPlayer();

  return { games };
}
