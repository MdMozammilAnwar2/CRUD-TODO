import { Sequelize, DataTypes } from "sequelize";
import pg from "pg";
import "dotenv/config";

const { DB_NAME, DB_USER, DB_PASS, DB_HOST, DB_PORT } = process.env;

// Create the database if it doesn't exist yet
export async function ensureDatabase() {
  const client = new pg.Client({ user: DB_USER, password: DB_PASS, host: DB_HOST, port: DB_PORT, database: "postgres" });
  await client.connect();
  const { rowCount } = await client.query("SELECT 1 FROM pg_database WHERE datname = $1", [DB_NAME]);
  if (!rowCount) await client.query(`CREATE DATABASE "${DB_NAME}"`);
  await client.end();
}

export const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASS, {
  host: DB_HOST, port: DB_PORT, dialect: "postgres", logging: false,
});

export const Todo = sequelize.define("Todo", {
  title: { type: DataTypes.STRING, allowNull: false, validate: { notEmpty: true } },
  completed: { type: DataTypes.BOOLEAN, defaultValue: false },
});
