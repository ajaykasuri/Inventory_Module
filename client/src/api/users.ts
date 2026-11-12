import { api } from "./http";

export interface TeamUser {
  id: number;
  name: string;
  email: string;
  is_active: number;
  role: string;
}
export interface Role {
  id: number;
  name: string;
}

export const usersApi = {
  list: () => api<TeamUser[]>("/users"),
  roles: () => api<Role[]>("/users/roles"),
  invite: (body: { email: string; roleId: number }) =>
    api<{ email: string; inviteLink: string }>("/users/invitations", { method: "POST", body }),
};