import type { ResultSetHeader, RowDataPacket } from "mysql2/promise";
import { pool } from "../config/db.js";
import { AppError } from "../middleware/errorHandler.js";
import { rethrowDuplicate } from "../utils/dbErrors.js";
import type { PartnerInput, PartnerQuery } from "../validators/partner.validator.js";

export type PartnerType = "supplier" | "customer";
const LABEL: Record<PartnerType, string> = { supplier: "Supplier", customer: "Customer" };

const COLUMNS = `id, type, name, contact_person, email, phone, address, tax_id,
  payment_terms_days, notes, is_active`;

export async function listPartners(orgId: number, type: PartnerType, q: PartnerQuery) {
  const where = ["organization_id = ?", "type = ?"];
  const params: (string | number)[] = [orgId, type];

  if (q.search) {
    const like = `%${q.search}%`;
    where.push("(name LIKE ? OR contact_person LIKE ? OR phone LIKE ? OR email LIKE ?)");
    params.push(like, like, like, like);
  }
  if (q.active !== "all") {
    where.push("is_active = ?");
    params.push(q.active === "active" ? 1 : 0);
  }
  const whereSql = where.join(" AND ");

  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT ${COLUMNS} FROM partners WHERE ${whereSql} ORDER BY name LIMIT ? OFFSET ?`,
    [...params, q.pageSize, (q.page - 1) * q.pageSize]
  );
  const [count] = await pool.query<RowDataPacket[]>(
    `SELECT COUNT(*) AS total FROM partners WHERE ${whereSql}`,
    params
  );
  return { items: rows, total: count[0].total as number, page: q.page, pageSize: q.pageSize };
}

// The type is part of the lookup, so a customer id used on /suppliers is "not found".
export async function getPartner(orgId: number, type: PartnerType, id: number) {
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT ${COLUMNS} FROM partners WHERE id = ? AND organization_id = ? AND type = ?`,
    [id, orgId, type]
  );
  if (rows.length === 0) throw new AppError(404, `${LABEL[type]} not found`);
  return rows[0];
}

export async function createPartner(orgId: number, type: PartnerType, input: PartnerInput) {
  try {
    const [res] = await pool.execute<ResultSetHeader>(
      `INSERT INTO partners (organization_id, type, name, contact_person, email, phone,
         address, tax_id, payment_terms_days, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [orgId, type, input.name, input.contactPerson, input.email, input.phone,
       input.address, input.taxId, input.paymentTermsDays, input.notes]
    );
    return getPartner(orgId, type, res.insertId);
  } catch (err) {
    rethrowDuplicate(err, `A ${type} with this name already exists`);
  }
}

export async function updatePartner(orgId: number, type: PartnerType, id: number, input: PartnerInput) {
  await getPartner(orgId, type, id);
  try {
    await pool.execute(
      `UPDATE partners SET name = ?, contact_person = ?, email = ?, phone = ?, address = ?,
         tax_id = ?, payment_terms_days = ?, notes = ?
       WHERE id = ? AND organization_id = ? AND type = ?`,
      [input.name, input.contactPerson, input.email, input.phone, input.address,
       input.taxId, input.paymentTermsDays, input.notes, id, orgId, type]
    );
  } catch (err) {
    rethrowDuplicate(err, `A ${type} with this name already exists`);
  }
  return getPartner(orgId, type, id);
}

export async function setPartnerActive(orgId: number, type: PartnerType, id: number, isActive: boolean) {
  await getPartner(orgId, type, id);
  await pool.execute(
    "UPDATE partners SET is_active = ? WHERE id = ? AND organization_id = ? AND type = ?",
    [isActive ? 1 : 0, id, orgId, type]
  );
  return { id, isActive };
}