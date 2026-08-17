import * as adminService from "../services/admin.service.js";

export async function listUsers(req, res) {
  const result = await adminService.listUsers();

  res.status(200).json(result);
}

export async function listGames(req, res) {
  const result = await adminService.listGames();

  res.status(200).json(result);
}
