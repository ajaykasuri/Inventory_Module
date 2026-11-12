import { acceptInvitation, createInvitation } from "../services/invitation.service.js";
import { listRoles, listUsers } from "../services/user.service.js";
import { acceptInvitationSchema, createInvitationSchema, } from "../validators/invitation.validator.js";
// req.auth is always set here, because authenticate runs before these handlers.
export async function listUsersHandler(req, res, next) {
    try {
        res.json(await listUsers(req.auth.organizationId));
    }
    catch (err) {
        next(err);
    }
}
export async function listRolesHandler(req, res, next) {
    try {
        res.json(await listRoles(req.auth.organizationId));
    }
    catch (err) {
        next(err);
    }
}
export async function createInvitationHandler(req, res, next) {
    try {
        const input = createInvitationSchema.parse(req.body);
        const result = await createInvitation(req.auth.organizationId, req.auth.userId, input);
        res.status(201).json(result);
    }
    catch (err) {
        next(err);
    }
}
export async function acceptInvitationHandler(req, res, next) {
    try {
        const input = acceptInvitationSchema.parse(req.body);
        res.status(201).json(await acceptInvitation(input));
    }
    catch (err) {
        next(err);
    }
}
//# sourceMappingURL=user.controller.js.map