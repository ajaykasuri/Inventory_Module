import { Router } from "express";
import { acceptInvitationHandler, createInvitationHandler, listRolesHandler, listUsersHandler, } from "../controllers/user.controller.js";
import { authenticate, requirePermission } from "../middleware/auth.js";
const router = Router();
router.use(authenticate);
router.get("/", requirePermission("user.manage"), listUsersHandler);
router.get("/roles", requirePermission("user.manage"), listRolesHandler);
router.post("/invitations", requirePermission("user.manage"), createInvitationHandler);
router.post("/accept-invitation", acceptInvitationHandler);
export default router;
//# sourceMappingURL=user.routes.js.map