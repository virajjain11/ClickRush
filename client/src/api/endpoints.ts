const API_PREFIX = "/api/v1";

export const endpoints = {
  auth: {
    signUp: `${API_PREFIX}/auth/sign-up`,
    signIn: `${API_PREFIX}/auth/sign-in`,
    forgotPassword: `${API_PREFIX}/auth/forgot-password`,
    google: `${API_PREFIX}/auth/google`,
  },
  games: {
    start: `${API_PREFIX}/games`,
    finish: `${API_PREFIX}/games/finish`,
    history: `${API_PREFIX}/games/history`,
    leaderboard: `${API_PREFIX}/games/leaderboard`,
  },
  users: {
    me: `${API_PREFIX}/users/me`,
  },
  admin: {
    users: `${API_PREFIX}/admin/users`,
    games: `${API_PREFIX}/admin/games`,
  },
} as const;
