import express from "express";
import cors from "cors";
import "dotenv/config";
import { sequelize, Todo, ensureDatabase } from "./db.js";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/api/todos", async (req, res) => {
  res.json(await Todo.findAll({ order: [["createdAt", "DESC"]] }));
});

app.post("/api/todos", async (req, res) => {
  try {
    res.status(201).json(await Todo.create({ title: req.body.title }));
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

app.put("/api/todos/:id", async (req, res) => {
  const todo = await Todo.findByPk(req.params.id);
  if (!todo) return res.status(404).json({ error: "Not found" });
  try {
    const { title, completed } = req.body;
    await todo.update({ ...(title !== undefined && { title }), ...(completed !== undefined && { completed }) });
    res.json(todo);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

app.delete("/api/todos/:id", async (req, res) => {
  const count = await Todo.destroy({ where: { id: req.params.id } });
  if (!count) return res.status(404).json({ error: "Not found" });
  res.status(204).end();
});

const PORT = process.env.PORT || 5000;
await ensureDatabase();
await sequelize.sync();
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
