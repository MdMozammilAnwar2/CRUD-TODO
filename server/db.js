import { Sequelize, DataTypes } from "sequelize";
import pg from "pg";
import { readFileSync } from "node:fs";
import "dotenv/config";

const { DB_NAME, DB_USER, DB_PASS, DB_HOST, DB_PORT } = process.env;

// Remote hosts (AWS RDS) require SSL, verified against the RDS CA bundle; local ones don't
const ssl = ["localhost", "127.0.0.1"].includes(DB_HOST)
  ? false
  : { ca: readFileSync(new URL("./rds-ca.pem", import.meta.url), "utf8") };

// Create the database if it doesn't exist yet
export async function ensureDatabase() {
  const client = new pg.Client({ user: DB_USER, password: DB_PASS, host: DB_HOST, port: DB_PORT, database: "postgres", ssl });
  await client.connect();
  const { rowCount } = await client.query("SELECT 1 FROM pg_database WHERE datname = $1", [DB_NAME]);
  if (!rowCount) await client.query(`CREATE DATABASE "${DB_NAME}"`);
  await client.end();
}

export const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASS, {
  host: DB_HOST, port: DB_PORT, dialect: "postgres", logging: false,
  dialectOptions: { ssl },
});

export const Todo = sequelize.define("Todo", {
  title: { type: DataTypes.STRING, allowNull: false, validate: { notEmpty: true } },
  completed: { type: DataTypes.BOOLEAN, defaultValue: false },
});
