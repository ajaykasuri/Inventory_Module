import { AppError } from "../middleware/errorHandler.js";

// Turns a MySQL "duplicate" error into a 409 with a readable message.
// byKey maps the name of a unique key to the message for that key.
export function rethrowDuplicate(err: unknown, message: string, byKey: Record<string, string> = {}): never {
  const e = err as { code?: string; sqlMessage?: string };
  if (e.code === "ER_DUP_ENTRY") {
    for (const [key, text] of Object.entries(byKey)) {
      if (e.sqlMessage?.includes(key)) throw new AppError(409, text);
    }
    throw new AppError(409, message);
  }
  throw err;
}