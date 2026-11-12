import { refreshSchema, signupSchema, loginSchema } from "../validators/auth.validator.js";
import { logout, signup, login, refresh } from "../services/auth.service.js";
import { getProfile } from "../services/user.service.js";
export async function signupHandler(req, res, next) {
    try {
        const input = signupSchema.parse(req.body);
        const result = await signup(input);
        res.status(201).json(result);
    }
    catch (err) {
        next(err);
    }
}
export async function loginHandler(req, res, next) {
    try {
        res.json(await login(loginSchema.parse(req.body)));
    }
    catch (err) {
        next(err);
    }
}
export async function refreshHandler(req, res, next) {
    try {
        const { refreshToken } = refreshSchema.parse(req.body);
        res.json(await refresh(refreshToken));
    }
    catch (err) {
        next(err);
    }
}
export async function logoutHandler(req, res, next) {
    try {
        const { refreshToken } = refreshSchema.parse(req.body);
        await logout(refreshToken);
        res.status(204).end();
    }
    catch (err) {
        next(err);
    }
}
export async function meHandler(req, res, next) {
    try {
        const p = await getProfile(req.auth.userId);
        res.json({
            ...req.auth,
            name: p.name,
            email: p.email,
            roleName: p.role_name,
            organizationName: p.organization_name,
        });
    }
    catch (err) {
        next(err);
    }
}
//# sourceMappingURL=auth.controller.js.map