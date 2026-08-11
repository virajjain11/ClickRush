export type AuthenticatedUser = {
  id: string;
  name: string;
  email: string;
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
