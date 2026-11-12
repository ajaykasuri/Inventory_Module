import { Router } from "express";
import * as c from "../controllers/warehouse.controller.js";
import { can } from "../middleware/auth.js";
import { wrap } from "../utils/wrap.js";

const router = Router();

router.get("/warehouses", can("warehouse.view"), wrap(c.listWarehouses));
router.get("/warehouses/:id", can("warehouse.view"), wrap(c.getWarehouse));
router.post("/warehouses", can("warehouse.manage"), wrap(c.createWarehouse));
router.put("/warehouses/:id", can("warehouse.manage"), wrap(c.updateWarehouse));
router.patch("/warehouses/:id/active", can("warehouse.manage"), wrap(c.setWarehouseActive));

router.get("/warehouses/:id/locations", can("warehouse.view"), wrap(c.listLocations));
router.post("/warehouses/:id/locations", can("warehouse.manage"), wrap(c.createLocation));
router.put("/locations/:id", can("warehouse.manage"), wrap(c.updateLocation));
router.patch("/locations/:id/active", can("warehouse.manage"), wrap(c.setLocationActive));

export default router;