import { ZodError } from "zod";
export class AppError extends Error {
    status;
    constructor(status, message) {
        super(message);
        this.status = status;
    }
}
export const errorHandler = (err, _req, res, _next) => {
    if (err instanceof ZodError) {
        res.status(400).json({ error: "Validation failed", details: err.issues });
        return;
    }
    if (err instanceof AppError) {
        res.status(err.status).json({ error: err.message });
        return;
    }
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
};
//# sourceMappingURL=errorHandler.js.map