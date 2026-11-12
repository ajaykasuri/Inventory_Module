import type { RowDataPacket } from "mysql2/promise";
export declare function listUsers(orgId: number): Promise<RowDataPacket[]>;
export declare function listRoles(orgId: number): Promise<RowDataPacket[]>;
export declare function getProfile(userId: number): Promise<RowDataPacket | undefined>;
//# sourceMappingURL=user.service.d.ts.map