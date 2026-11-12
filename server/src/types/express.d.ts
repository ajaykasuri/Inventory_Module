export interface AuthContext {
  userId: number;
  organizationId: number;
  roleId: number;
  permissions: string[];
}

declare global {
  namespace Express {
    interface Request {
      auth?: AuthContext;
    }
  }
}