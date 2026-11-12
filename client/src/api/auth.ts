import { api } from "./http";

export interface Profile {
  userId: number;
  organizationId: number;
  roleId: number;
  permissions: string[];
  name: string;
  email: string;
  roleName: string;
  organizationName: string;
}

export const authApi = {
  signup: (body: { organizationName: string; name: string; email: string; password: string }) =>
    api<{ organizationId: number; userId: number }>("/auth/signup", { method: "POST", body, auth: false }),

  login: (body: { email: string; password: string }) =>
    api<{ accessToken: string; refreshToken: string }>("/auth/login", { method: "POST", body, auth: false }),

  acceptInvitation: (body: { token: string; name: string; password: string }) =>
    api<{ userId: number; email: string }>("/auth/accept-invitation", { method: "POST", body, auth: false }),

  me: () => api<Profile>("/auth/me"),

  logout: (refreshToken: string) =>
    api<void>("/auth/logout", { method: "POST", body: { refreshToken }, auth: false }),
};
