import bcrypt from "bcryptjs";
import { pool, withTransaction } from "../config/db.js";
import { AppError } from "../middleware/errorHandler.js";
import { randomToken, sha256 } from "../utils/crypto.js";
const INVITE_DAYS = 7;
export async function createInvitation(orgId, invitedBy, input) {
    // 1. The role must belong to THIS business.
    const [roles] = await pool.query("SELECT id FROM roles WHERE id = ? AND organization_id = ?", [input.roleId, orgId]);
    if (roles.length === 0)
        throw new AppError(400, "Role not found");
    // 2. The email must not already have an account.
    const [users] = await pool.query("SELECT id FROM users WHERE email = ?", [input.email]);
    if (users.length > 0)
        throw new AppError(409, "This email already has an account");
    // 3. No second open invitation for the same email.
    const [pending] = await pool.query(`SELECT id FROM invitations
     WHERE organization_id = ? AND email = ? AND accepted_at IS NULL AND expires_at > NOW()`, [orgId, input.email]);
    if (pending.length > 0) {
        throw new AppError(409, "An invitation is already pending for this email");
    }
    // 4. Make the token. Only its hash is stored; the real token goes in the link.
    const token = randomToken();
    await pool.execute(`INSERT INTO invitations (organization_id, role_id, email, token_hash, expires_at, invited_by)
     VALUES (?, ?, ?, ?, DATE_ADD(NOW(), INTERVAL ? DAY), ?)`, [orgId, input.roleId, input.email, sha256(token), INVITE_DAYS, invitedBy]);
    const base = process.env.CLIENT_URL ?? "http://localhost:5173";
    return { email: input.email, inviteLink: `${base}/accept-invitation?token=${token}` };
}
export async function acceptInvitation(input) {
    const passwordHash = await bcrypt.hash(input.password, 12);
    try {
        return await withTransaction(async (conn) => {
            // Lock the invitation row so two people can't use it at the same moment.
            const [rows] = await conn.query(`SELECT id, organization_id, role_id, email FROM invitations
         WHERE token_hash = ? AND accepted_at IS NULL AND expires_at > NOW()
         FOR UPDATE`, [sha256(input.token)]);
            const inv = rows[0];
            if (!inv)
                throw new AppError(400, "This invitation is invalid or has expired");
            // The business, role and email all come from the invitation.
            const [user] = await conn.execute(`INSERT INTO users (organization_id, role_id, name, email, password_hash)
         VALUES (?, ?, ?, ?, ?)`, [inv.organization_id, inv.role_id, input.name, inv.email, passwordHash]);
            await conn.execute("UPDATE invitations SET accepted_at = NOW() WHERE id = ?", [inv.id]);
            return { userId: user.insertId, email: inv.email };
        });
    }
    catch (err) {
        if (err.code === "ER_DUP_ENTRY") {
            throw new AppError(409, "An account with this email already exists");
        }
        throw err;
    }
}
//# sourceMappingURL=invitation.service.js.map