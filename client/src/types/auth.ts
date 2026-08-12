export type AuthenticatedUser = {
  id: string;
  username: string;
  name: string;
  email: string;
  role: "user" | "admin";
  createdAt: string;
};

export type AuthResponse = {
  user: AuthenticatedUser;
  accessToken: string;
};

export type CurrentUserResponse = {
  user: AuthenticatedUser;
};

export type ForgotPasswordResponse = {
  message: string;
};
