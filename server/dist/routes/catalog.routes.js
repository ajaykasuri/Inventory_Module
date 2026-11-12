import { Router } from "express";
import * as c from "../controllers/catalog.controller.js";
import { authenticate, requirePermission } from "../middleware/auth.js";
import { wrap } from "../utils/wrap.js";
const router = Router();
// Each route gets its own login check and permission check.
const can = (permission) => [authenticate, requirePermission(permission)];
router.get("/units", can("item.view"), wrap(c.listUnits));
router.post("/units", can("item.manage"), wrap(c.createUnit));
router.get("/categories", can("item.view"), wrap(c.listCategories));
router.post("/categories", can("item.manage"), wrap(c.createCategory));
router.put("/categories/:id", can("item.manage"), wrap(c.renameCategory));
router.delete("/categories/:id", can("item.manage"), wrap(c.deleteCategory));
router.get("/items", can("item.view"), wrap(c.listItems));
router.get("/items/:id", can("item.view"), wrap(c.getItem));
router.post("/items", can("item.manage"), wrap(c.createItem));
router.put("/items/:id", can("item.manage"), wrap(c.updateItem));
router.patch("/items/:id/active", can("item.manage"), wrap(c.setItemActive));
export default router;
//# sourceMappingURL=catalog.routes.js.map