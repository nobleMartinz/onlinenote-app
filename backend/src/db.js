import "dotenv/config";
import { readFile } from "node:fs/promises";
import { Pool } from "pg";

const pool = new Pool({
  host: process.env.PGHOST ?? "localhost",
  port: Number.parseInt(process.env.PGPORT ?? "5432", 10),
  database: process.env.PGDATABASE ?? "postgres",
  user: process.env.PGUSER ?? "postgres",
  password: process.env.PGPASSWORD
});

export const connectDatabase = async () => {
  const client = await pool.connect();

  try {
    await client.query("SELECT 1");
    console.log("PostgreSQL connected");
  } finally {
    client.release();
  }
};

export const initializeDatabase = async () => {
  const schema = await readFile(new URL("./db/schema.sql", import.meta.url), "utf8");
  await pool.query(schema);
  console.log("Database schema initialized");
};

export default pool;
