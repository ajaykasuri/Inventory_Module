import bcrypt from "bcryptjs";
import type { ResultSetHeader, RowDataPacket } from "mysql2/promise";
import { withTransaction } from "../config/db.js";
import { OWNER_ROLE, ROLE_PERMISSIONS } from "../config/roles.js";
import { AppError } from "../middleware/errorHandler.js";
import type { SignupInput } from "../validators/auth.validator.js";
import crypto from "node:crypto";
import jwt from "jsonwebtoken";
import { pool } from "../config/db.js";
import { env } from "../config/env.js";
import type { LoginInput } from "../validators/auth.validator.js";

interface PermissionRow extends RowDataPacket {
  id: number;
  code: string;
}

export async function signup(input: SignupInput) {
  const passwordHash = await bcrypt.hash(input.password, 12);

  try {
    return await withTransaction(async (conn) => {
      // 1. the business
      const [org] = await conn.execute<ResultSetHeader>(
        "INSERT INTO organizations (name) VALUES (?)",
        [input.organizationName]
      );
      const orgId = org.insertId;

      // 2. the list of permissions
      const [perms] = await conn.query<PermissionRow[]>("SELECT id, code FROM permissions");
      const permIdByCode = new Map(perms.map((p) => [p.code, p.id]));

      // 3. this business's own copy of each default role
      let ownerRoleId = 0;
      for (const [roleName, list] of Object.entries(ROLE_PERMISSIONS)) {
        const [role] = await conn.execute<ResultSetHeader>(
          "INSERT INTO roles (organization_id, name, is_system) VALUES (?, ?, 1)",
          [orgId, roleName]
        );
        const codes = list === "ALL" ? [...permIdByCode.keys()] : list;
        const pairs = codes.map((code) => {
          const permId = permIdByCode.get(code);
          if (!permId) throw new Error(`Unknown permission: ${code}`);
          return [role.insertId, permId];
        });
        await conn.query("INSERT INTO role_permissions (role_id, permission_id) VALUES ?", [pairs]);
        if (roleName === OWNER_ROLE) ownerRoleId = role.insertId;
      }

      // 4. the owner user
      const [user] = await conn.execute<ResultSetHeader>(
        "INSERT INTO users (organization_id, role_id, name, email, password_hash) VALUES (?, ?, ?, ?, ?)",
        [orgId, ownerRoleId, input.name, input.email, passwordHash]
      );

      return { organizationId: orgId, userId: user.insertId, name: input.name, email: input.email };
    });
  } catch (err) {
    if ((err as { code?: string }).code === "ER_DUP_ENTRY") {
      throw new AppError(409, "An account with this email already exists");
    }
    throw err;
  }
}
interface TokenUser {
  id: number;
  organization_id: number;
  role_id: number;
}
interface UserRow extends RowDataPacket, TokenUser {
  name: string;
  email: string;
  password_hash: string;
  is_active: number;
  org_active: number;
}
interface RefreshRow extends RowDataPacket, TokenUser {
  token_id: number;
  is_active: number;
}

const sha256 = (value: string) => crypto.createHash("sha256").update(value).digest("hex");

async function issueTokens(user: TokenUser) {
  const [perms] = await pool.query<(RowDataPacket & { code: string })[]>(
    `SELECT p.code FROM role_permissions rp
     JOIN permissions p ON p.id = rp.permission_id
     WHERE rp.role_id = ?`,
    [user.role_id]
  );

  const accessToken = jwt.sign(
    {
      userId: user.id,
      organizationId: user.organization_id,
      roleId: user.role_id,
      permissions: perms.map((p) => p.code),
    },
    env.jwtSecret,
    { expiresIn: env.accessTokenTtl }
  );

  const refreshToken = crypto.randomBytes(48).toString("hex");
  await pool.execute(
    `INSERT INTO refresh_tokens (user_id, token_hash, expires_at)
     VALUES (?, ?, DATE_ADD(NOW(), INTERVAL ? DAY))`,
    [user.id, sha256(refreshToken), env.refreshTokenDays]
  );

  return { accessToken, refreshToken };
}

export async function login(input: LoginInput) {
  const [rows] = await pool.query<UserRow[]>(
    `SELECT u.id, u.organization_id, u.role_id, u.name, u.email, u.password_hash,
            u.is_active, o.is_active AS org_active
     FROM users u JOIN organizations o ON o.id = u.organization_id
     WHERE u.email = ?`,
    [input.email]
  );
  const user = rows[0];
  const passwordOk = user ? await bcrypt.compare(input.password, user.password_hash) : false;

  // Same message for every failure, so attackers can't tell which emails exist.
  if (!user || !passwordOk || !user.is_active || !user.org_active) {
    throw new AppError(401, "Invalid email or password");
  }

  const tokens = await issueTokens(user);
  return { ...tokens, user: { id: user.id, name: user.name, email: user.email } };
}

export async function refresh(refreshToken: string) {
  const [rows] = await pool.query<RefreshRow[]>(
    `SELECT rt.id AS token_id, u.id, u.organization_id, u.role_id, u.is_active
     FROM refresh_tokens rt JOIN users u ON u.id = rt.user_id
     WHERE rt.token_hash = ? AND rt.revoked_at IS NULL AND rt.expires_at > NOW()`,
    [sha256(refreshToken)]
  );
  const row = rows[0];
  if (!row || !row.is_active) throw new AppError(401, "Session expired, please log in again");

  // Rotation: the old refresh token can be used only once.
  await pool.execute("UPDATE refresh_tokens SET revoked_at = NOW() WHERE id = ?", [row.token_id]);
  return issueTokens(row);
}

export async function logout(refreshToken: string) {
  await pool.execute(
    "UPDATE refresh_tokens SET revoked_at = NOW() WHERE token_hash = ? AND revoked_at IS NULL",
    [sha256(refreshToken)]
  );
}