import * as gamesService from "../services/games.service.js";

export async function startGame(req, res) {
  const result = await gamesService.startGame(req.user.id, req.body);

  res.status(201).json(result);
}

export async function finishGame(req, res) {
  const result = await gamesService.finishGame(req.user.id, req.body);

  res.status(200).json(result);
}
