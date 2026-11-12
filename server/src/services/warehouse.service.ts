import type { ResultSetHeader, RowDataPacket } from "mysql2/promise";
import { pool } from "../config/db.js";
import { AppError } from "../middleware/errorHandler.js";
import { rethrowDuplicate } from "../utils/dbErrors.js";
import type { LocationEditInput, LocationInput, WarehouseInput } from "../validators/warehouse.validator.js";

const LEVEL = { zone: 1, rack: 2, shelf: 3, bin: 4 } as const;
type LocationType = keyof typeof LEVEL;

const DUP_WAREHOUSE = {
  uq_wh_name: "A warehouse with this name already exists",
  uq_wh_code: "A warehouse with this code already exists",
};

// ---------- warehouses ----------

export async function listWarehouses(orgId: number, active: "active" | "inactive" | "all") {
  const params: (string | number)[] = [orgId];
  let filter = "";
  if (active !== "all") {
    filter = "AND w.is_active = ?";
    params.push(active === "active" ? 1 : 0);
  }
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT w.id, w.code, w.name, w.address, w.contact_person, w.phone, w.is_active,
            COUNT(l.id) AS location_count
     FROM warehouses w
     LEFT JOIN locations l ON l.warehouse_id = w.id AND l.is_active = 1
     WHERE w.organization_id = ? ${filter}
     GROUP BY w.id
     ORDER BY w.name`,
    params
  );
  return rows;
}

export async function getWarehouse(orgId: number, id: number) {
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT id, code, name, address, contact_person, phone, is_active
     FROM warehouses WHERE id = ? AND organization_id = ?`,
    [id, orgId]
  );
  if (rows.length === 0) throw new AppError(404, "Warehouse not found");
  return rows[0];
}

export async function createWarehouse(orgId: number, input: WarehouseInput) {
  try {
    const [res] = await pool.execute<ResultSetHeader>(
      `INSERT INTO warehouses (organization_id, code, name, address, contact_person, phone)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [orgId, input.code, input.name, input.address, input.contactPerson, input.phone]
    );
    return getWarehouse(orgId, res.insertId);
  } catch (err) {
    rethrowDuplicate(err, "This warehouse already exists", DUP_WAREHOUSE);
  }
}

export async function updateWarehouse(orgId: number, id: number, input: WarehouseInput) {
  await getWarehouse(orgId, id); // 404 if it is not in this business
  try {
    await pool.execute(
      `UPDATE warehouses SET code = ?, name = ?, address = ?, contact_person = ?, phone = ?
       WHERE id = ? AND organization_id = ?`,
      [input.code, input.name, input.address, input.contactPerson, input.phone, id, orgId]
    );
  } catch (err) {
    rethrowDuplicate(err, "This warehouse already exists", DUP_WAREHOUSE);
  }
  return getWarehouse(orgId, id);
}

export async function setWarehouseActive(orgId: number, id: number, isActive: boolean) {
  await getWarehouse(orgId, id);
  await pool.execute("UPDATE warehouses SET is_active = ? WHERE id = ? AND organization_id = ?", [isActive ? 1 : 0, id, orgId]);
  return { id, isActive };
}

// ---------- locations ----------

export async function listLocations(orgId: number, warehouseId: number) {
  await getWarehouse(orgId, warehouseId);
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT l.id, l.type, l.code, l.description, l.parent_id, p.code AS parent_code, l.is_active
     FROM locations l
     LEFT JOIN locations p ON p.id = l.parent_id
     WHERE l.warehouse_id = ? AND l.organization_id = ?
     ORDER BY l.code`,
    [warehouseId, orgId]
  );
  return rows;
}

export async function createLocation(orgId: number, warehouseId: number, input: LocationInput) {
  await getWarehouse(orgId, warehouseId);

  if (input.parentId) {
    // The parent must be in this business AND in this same warehouse.
    const [parents] = await pool.query<RowDataPacket[]>(
      "SELECT type FROM locations WHERE id = ? AND warehouse_id = ? AND organization_id = ?",
      [input.parentId, warehouseId, orgId]
    );
    if (parents.length === 0) throw new AppError(400, "Parent location not found");
    const parentType = parents[0].type as LocationType;
    if (LEVEL[input.type] <= LEVEL[parentType]) {
      throw new AppError(400, `A ${input.type} cannot be placed inside a ${parentType}`);
    }
  }

  try {
    const [res] = await pool.execute<ResultSetHeader>(
      `INSERT INTO locations (organization_id, warehouse_id, parent_id, type, code, description)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [orgId, warehouseId, input.parentId ?? null, input.type, input.code, input.description]
    );
    return { id: res.insertId, ...input };
  } catch (err) {
    rethrowDuplicate(err, "This code is already used in this warehouse");
  }
}

async function findLocation(orgId: number, id: number) {
  const [rows] = await pool.query<RowDataPacket[]>(
    "SELECT id, warehouse_id FROM locations WHERE id = ? AND organization_id = ?",
    [id, orgId]
  );
  if (rows.length === 0) throw new AppError(404, "Location not found");
  return rows[0];
}

export async function updateLocation(orgId: number, id: number, input: LocationEditInput) {
  await findLocation(orgId, id);
  try {
    await pool.execute(
      "UPDATE locations SET code = ?, description = ? WHERE id = ? AND organization_id = ?",
      [input.code, input.description, id, orgId]
    );
    return { id, ...input };
  } catch (err) {
    rethrowDuplicate(err, "This code is already used in this warehouse");
  }
}

export async function setLocationActive(orgId: number, id: number, isActive: boolean) {
  await findLocation(orgId, id);
  if (!isActive) {
    const [kids] = await pool.query<RowDataPacket[]>(
      "SELECT id FROM locations WHERE parent_id = ? AND organization_id = ? AND is_active = 1 LIMIT 1",
      [id, orgId]
    );
    if (kids.length > 0) throw new AppError(400, "Deactivate the locations inside it first");
  }
  await pool.execute("UPDATE locations SET is_active = ? WHERE id = ? AND organization_id = ?", [isActive ? 1 : 0, id, orgId]);
  return { id, isActive };
}