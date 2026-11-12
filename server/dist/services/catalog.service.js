import { pool } from "../config/db.js";
import { AppError } from "../middleware/errorHandler.js";
// ---------- helpers ----------
// Every id that comes from the client must belong to THIS business.
// The table name is safe to put in the SQL because the type allows only these two words.
async function assertOwned(table, id, orgId, label) {
    const [rows] = await pool.query(`SELECT id FROM ${table} WHERE id = ? AND organization_id = ?`, [id, orgId]);
    if (rows.length === 0)
        throw new AppError(400, `${label} not found`);
}
function rethrowDuplicate(err, message) {
    const e = err;
    if (e.code === "ER_DUP_ENTRY" || e.errno === 1062) {
        const duplicateDetails = `${e.sqlMessage ?? ""} ${e.message ?? ""}`;
        const isBarcode = duplicateDetails.includes("uq_item_barcode");
        throw new AppError(409, isBarcode ? "This barcode is already used by another item" : message);
    }
    throw err;
}
// ---------- units ----------
export async function listUnits(orgId) {
    const [rows] = await pool.query("SELECT id, name, abbreviation FROM units WHERE organization_id = ? ORDER BY name", [orgId]);
    return rows;
}
export async function createUnit(orgId, input) {
    try {
        const [res] = await pool.execute("INSERT INTO units (organization_id, name, abbreviation) VALUES (?, ?, ?)", [orgId, input.name, input.abbreviation]);
        return { id: res.insertId, ...input };
    }
    catch (err) {
        rethrowDuplicate(err, "A unit with this name already exists");
    }
}
// ---------- categories ----------
export async function listCategories(orgId) {
    const [rows] = await pool.query(`SELECT c.id, c.name, COUNT(i.id) AS item_count
     FROM categories c
     LEFT JOIN items i ON i.category_id = c.id AND i.is_active = 1
     WHERE c.organization_id = ?
     GROUP BY c.id, c.name
     ORDER BY c.name`, [orgId]);
    return rows;
}
export async function createCategory(orgId, input) {
    try {
        const [res] = await pool.execute("INSERT INTO categories (organization_id, name) VALUES (?, ?)", [orgId, input.name]);
        return { id: res.insertId, name: input.name };
    }
    catch (err) {
        rethrowDuplicate(err, "A category with this name already exists");
    }
}
export async function renameCategory(orgId, id, input) {
    await assertOwned("categories", id, orgId, "Category");
    try {
        await pool.execute("UPDATE categories SET name = ? WHERE id = ? AND organization_id = ?", [input.name, id, orgId]);
        return { id, name: input.name };
    }
    catch (err) {
        rethrowDuplicate(err, "A category with this name already exists");
    }
}
export async function deleteCategory(orgId, id) {
    await assertOwned("categories", id, orgId, "Category");
    const [rows] = await pool.query("SELECT COUNT(*) AS item_count FROM items WHERE category_id = ? AND organization_id = ?", [id, orgId]);
    const categoryItems = rows[0];
    if (!categoryItems)
        throw new AppError(500, "Unable to check whether the category can be deleted");
    if (Number(categoryItems.item_count) > 0) {
        throw new AppError(409, "Cannot delete a category while items are assigned to it");
    }
    try {
        await pool.execute("DELETE FROM categories WHERE id = ? AND organization_id = ?", [id, orgId]);
    }
    catch (err) {
        const e = err;
        if (e.code === "ER_ROW_IS_REFERENCED_2" || e.errno === 1451) {
            throw new AppError(409, "Cannot delete a category while items are assigned to it");
        }
        throw err;
    }
}
// ---------- items ----------
const ITEM_COLUMNS = `i.id, i.sku, i.name, i.description, i.category_id, c.name AS category,
  i.unit_id, u.name AS unit_name, u.abbreviation AS unit, i.tracking_type, i.barcode,
  i.tax_rate, i.reorder_level, i.is_active, i.created_at, i.updated_at`;
const PRICE_COLUMNS = ", i.cost_price, i.selling_price";
const ITEM_JOINS = `FROM items i
  LEFT JOIN categories c ON c.id = i.category_id
  JOIN units u ON u.id = i.unit_id`;
export async function listItems(orgId, canSeePrice, q) {
    const where = ["i.organization_id = ?"];
    const params = [orgId];
    if (q.search) {
        where.push("(i.name LIKE ? OR i.sku LIKE ? OR i.barcode = ?)");
        params.push(`%${q.search}%`, `%${q.search}%`, q.search);
    }
    if (q.categoryId) {
        where.push("i.category_id = ?");
        params.push(q.categoryId);
    }
    if (q.active !== "all") {
        where.push("i.is_active = ?");
        params.push(q.active === "active" ? 1 : 0);
    }
    const whereSql = where.join(" AND ");
    const [rows] = await pool.query(`SELECT ${ITEM_COLUMNS}${canSeePrice ? PRICE_COLUMNS : ""}
     ${ITEM_JOINS}
     WHERE ${whereSql}
     ORDER BY i.name
     LIMIT ? OFFSET ?`, [...params, q.pageSize, (q.page - 1) * q.pageSize]);
    const [countRows] = await pool.query(`SELECT COUNT(*) AS total FROM items i WHERE ${whereSql}`, params);
    return { items: rows, total: countRows[0].total, page: q.page, pageSize: q.pageSize };
}
export async function getItem(orgId, canSeePrice, id) {
    const [rows] = await pool.query(`SELECT ${ITEM_COLUMNS}${canSeePrice ? PRICE_COLUMNS : ""}
     ${ITEM_JOINS}
     WHERE i.id = ? AND i.organization_id = ?`, [id, orgId]);
    if (rows.length === 0)
        throw new AppError(404, "Item not found");
    return rows[0];
}
export async function createItem(orgId, canSeePrice, input) {
    if (input.categoryId)
        await assertOwned("categories", input.categoryId, orgId, "Category");
    await assertOwned("units", input.unitId, orgId, "Unit");
    try {
        const [res] = await pool.execute(`INSERT INTO items (organization_id, sku, name, description, category_id, unit_id,
         tracking_type, barcode, cost_price, selling_price, tax_rate, reorder_level)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
            orgId, input.sku, input.name, input.description ?? null, input.categoryId ?? null, input.unitId,
            input.trackingType, input.barcode, canSeePrice ? input.costPrice : 0,
            canSeePrice ? input.sellingPrice : 0, input.taxRate, input.reorderLevel,
        ]);
        return getItem(orgId, canSeePrice, res.insertId);
    }
    catch (err) {
        rethrowDuplicate(err, "This SKU is already used by another item");
    }
}
export async function updateItem(orgId, canSeePrice, id, input) {
    const existing = await getItem(orgId, true, id); // 404 if it is not in this business
    if (input.categoryId)
        await assertOwned("categories", input.categoryId, orgId, "Category");
    await assertOwned("units", input.unitId, orgId, "Unit");
    try {
        await pool.execute(`UPDATE items SET sku = ?, name = ?, description = ?, category_id = ?, unit_id = ?,
         tracking_type = ?, barcode = ?, cost_price = ?, selling_price = ?, tax_rate = ?, reorder_level = ?
       WHERE id = ? AND organization_id = ?`, [
            input.sku, input.name, input.description ?? null, input.categoryId ?? null, input.unitId,
            input.trackingType, input.barcode,
            // Someone who cannot see prices cannot change them: keep what is stored.
            canSeePrice ? input.costPrice : existing.cost_price,
            canSeePrice ? input.sellingPrice : existing.selling_price,
            input.taxRate, input.reorderLevel, id, orgId,
        ]);
    }
    catch (err) {
        rethrowDuplicate(err, "This SKU is already used by another item");
    }
    return getItem(orgId, canSeePrice, id);
}
export async function setItemActive(orgId, id, isActive) {
    await getItem(orgId, false, id); // 404 if not in this business
    await pool.execute("UPDATE items SET is_active = ? WHERE id = ? AND organization_id = ?", [isActive ? 1 : 0, id, orgId]);
    return { id, isActive };
}
//# sourceMappingURL=catalog.service.js.map