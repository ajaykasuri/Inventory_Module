import type { RowDataPacket } from "mysql2/promise";
import { pool } from "../config/db.js";

export async function listUsers(orgId: number) {
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT u.id, u.name, u.email, u.is_active, r.name AS role
     FROM users u JOIN roles r ON r.id = u.role_id
     WHERE u.organization_id = ?
     ORDER BY u.id`,
    [orgId]
  );
  return rows;
}

export async function listRoles(orgId: number) {
  const [rows] = await pool.query<RowDataPacket[]>(
    "SELECT id, name FROM roles WHERE organization_id = ? ORDER BY id",
    [orgId]
  );
  return rows;
}
export async function getProfile(userId: number) {
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT u.name, u.email, r.name AS role_name, o.name AS organization_name
     FROM users u
     JOIN roles r ON r.id = u.role_id
     JOIN organizations o ON o.id = u.organization_id
     WHERE u.id = ?`,
    [userId]
  );
  return rows[0];
}