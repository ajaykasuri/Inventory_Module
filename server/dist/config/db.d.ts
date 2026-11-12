import "dotenv/config";
import mysql from "mysql2/promise";
import type { PoolConnection } from "mysql2/promise";
export declare const pool: mysql.Pool;
export declare function withTransaction<T>(work: (conn: PoolConnection) => Promise<T>): Promise<T>;
//# sourceMappingURL=db.d.ts.map