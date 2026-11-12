import { Router } from "express";
import { partnerHandlers } from "../controllers/partner.controller.js";
import { can } from "../middleware/auth.js";
import { wrap } from "../utils/wrap.js";

const router = Router();

// One loop registers the same five routes for both kinds.
const kinds = [
  ["suppliers", "supplier"],
  ["customers", "customer"],
] as const;

for (const [path, type] of kinds) {
  const h = partnerHandlers(type);
  router.get(`/${path}`, can("supplier.view"), wrap(h.list));
  router.get(`/${path}/:id`, can("supplier.view"), wrap(h.get));
  router.post(`/${path}`, can("supplier.manage"), wrap(h.create));
  router.put(`/${path}/:id`, can("supplier.manage"), wrap(h.update));
  router.patch(`/${path}/:id/active`, can("supplier.manage"), wrap(h.setActive));
}

export default router;