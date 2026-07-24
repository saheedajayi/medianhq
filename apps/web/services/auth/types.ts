export type AuthRole = "MENTEE" | "MENTOR" | "ADMIN";

export type AuthUser = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: AuthRole;
  isEmailVerified: boolean;
};

export type AuthResponse = {
  user: AuthUser;
  message?: string;
};

export type RegisterPayload = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: Exclude<AuthRole, "ADMIN">;
};

export type LoginPayload = {
  email: string;
  password: string;
};
