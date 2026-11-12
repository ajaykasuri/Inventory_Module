import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { pool } from "./config/db.js";
import authRoutes from "./routes/auth.routes.js";
import { errorHandler } from "./middleware/errorHandler.js";
import userRoutes from "./routes/user.routes.js";
import catalogRoutes from "./routes/catalog.routes.js";
const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api", catalogRoutes);
app.get("/api/health", async (_req, res) => {
    try {
        await pool.query("SELECT 1");
        res.json({ status: "ok", db: "connected" });
    }
    catch {
        res.status(500).json({ status: "error", db: "disconnected" });
    }
});
app.use(errorHandler);
const port = Number(process.env.PORT) || 5000;
app.listen(port, () => console.log(`Server running on http://localhost:${port}`));
//# sourceMappingURL=server.js.map