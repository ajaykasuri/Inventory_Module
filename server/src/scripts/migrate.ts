import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import mysql from "mysql2/promise";

const dir = path.resolve(process.cwd(), "db/migrations");

async function main() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    multipleStatements: true,
  });

  await conn.query(`CREATE TABLE IF NOT EXISTS schema_migrations (
    name VARCHAR(190) PRIMARY KEY,
    applied_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`);

  const [rows] = await conn.query("SELECT name FROM schema_migrations");
  const done = new Set((rows as { name: string }[]).map((r) => r.name));

  const files = fs.readdirSync(dir).filter((f) => f.endsWith(".sql")).sort();
  for (const file of files) {
    if (done.has(file)) continue;
    const sql = fs.readFileSync(path.join(dir, file), "utf8");
    console.log("Applying", file);
    await conn.query(sql);
    await conn.query("INSERT INTO schema_migrations (name) VALUES (?)", [file]);
  }
  console.log("Migrations up to date");
  await conn.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});