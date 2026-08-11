const API_PREFIX = "/api/v1";

export const endpoints = {
  auth: {
    signUp: `${API_PREFIX}/auth/sign-up`,
    signIn: `${API_PREFIX}/auth/sign-in`,
    forgotPassword: `${API_PREFIX}/auth/forgot-password`,
  },
  users: {
    me: `${API_PREFIX}/users/me`,
  },
} as const;
