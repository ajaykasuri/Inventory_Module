import { Router } from "express";
import { loginHandler, logoutHandler, meHandler, refreshHandler, signupHandler, } from "../controllers/auth.controller.js";
import { acceptInvitationHandler } from "../controllers/user.controller.js";
import { authenticate } from "../middleware/auth.js";
import { authLimiter } from "../middleware/rateLimit.js";
const router = Router();
router.post("/signup", authLimiter, signupHandler);
router.post("/login", authLimiter, loginHandler);
router.post("/accept-invitation", authLimiter, acceptInvitationHandler);
router.post("/refresh", refreshHandler);
router.post("/logout", logoutHandler);
router.get("/me", authenticate, meHandler);
export default router;
//# sourceMappingURL=auth.routes.js.map