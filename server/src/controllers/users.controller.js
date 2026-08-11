export function getCurrentUser(req, res) {
  res.status(200).json({ user: req.user });
}
