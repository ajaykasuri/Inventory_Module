import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { AppError } from "./errorHandler.js";
export function authenticate(req, _res, next) {
    const header = req.headers.authorization;
    if (!header?.startsWith("Bearer ")) {
        return next(new AppError(401, "Not logged in"));
    }
    try {
        const p = jwt.verify(header.slice(7), env.jwtSecret);
        req.auth = {
            userId: p.userId,
            organizationId: p.organizationId,
            roleId: p.roleId,
            permissions: p.permissions,
        };
        next();
    }
    catch {
        next(new AppError(401, "Session expired"));
    }
}
export function requirePermission(code) {
    return (req, _res, next) => {
        if (!req.auth?.permissions.includes(code)) {
            return next(new AppError(403, "You do not have permission to do this"));
        }
        next();
    };
}
//# sourceMappingURL=auth.js.map