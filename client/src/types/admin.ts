export type AdminUser = {
  id: string;
  name: string;
  username: string;
  email: string;
  createdAt: string;
};

export type AdminUsersResponse = {
  users: AdminUser[];
};

export type AdminGame = {
  id: string;
  name: string;
  username: string;
  score: number;
  playedAt: string;
};

export type AdminGamesResponse = {
  games: AdminGame[];
};

export type DashboardTab = "users" | "games";
