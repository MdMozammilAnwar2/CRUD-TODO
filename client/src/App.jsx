import { useEffect, useState } from "react";

const API = "/api/todos";

export default function App() {
  const [todos, setTodos] = useState([]);
  const [title, setTitle] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");
  const [error, setError] = useState("");

  const request = async (url, options = {}) => {
    setError("");
    const res = await fetch(url, { headers: { "Content-Type": "application/json" }, ...options });
    if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || "Request failed");
    return res.status === 204 ? null : res.json();
  };

  useEffect(() => {
    request(API).then(setTodos).catch((e) => setError(e.message));
  }, []);

  const addTodo = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    try {
      const todo = await request(API, { method: "POST", body: JSON.stringify({ title: title.trim() }) });
      setTodos([todo, ...todos]);
      setTitle("");
    } catch (e) { setError(e.message); }
  };

  const updateTodo = async (id, data) => {
    try {
      const updated = await request(`${API}/${id}`, { method: "PUT", body: JSON.stringify(data) });
      setTodos(todos.map((t) => (t.id === id ? updated : t)));
    } catch (e) { setError(e.message); }
  };

  const deleteTodo = async (id) => {
    try {
      await request(`${API}/${id}`, { method: "DELETE" });
      setTodos(todos.filter((t) => t.id !== id));
    } catch (e) { setError(e.message); }
  };

  const saveEdit = async (id) => {
    if (editText.trim()) await updateTodo(id, { title: editText.trim() });
    setEditingId(null);
  };

  const remaining = todos.filter((t) => !t.completed).length;

  return (
    <div className="min-h-screen bg-slate-100 py-12 px-4">
      <div className="mx-auto max-w-lg rounded-2xl bg-white p-6 shadow-lg">
        <h1 className="mb-6 text-3xl font-bold text-slate-800">Todo List</h1>

        <form onSubmit={addTodo} className="mb-4 flex gap-2">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What needs to be done?"
            className="flex-1 rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-indigo-500"
          />
          <button className="rounded-lg bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-700">Add</button>
        </form>

        {error && <p className="mb-4 rounded bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

        <ul className="divide-y divide-slate-200">
          {todos.map((todo) => (
            <li key={todo.id} className="flex items-center gap-3 py-3">
              <input
                type="checkbox"
                checked={todo.completed}
                onChange={() => updateTodo(todo.id, { completed: !todo.completed })}
                className="h-5 w-5 accent-indigo-600"
              />
              {editingId === todo.id ? (
                <input
                  autoFocus
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") saveEdit(todo.id);
                    if (e.key === "Escape") setEditingId(null);
                  }}
                  className="flex-1 rounded border border-slate-300 px-2 py-1"
                />
              ) : (
                <span className={`flex-1 ${todo.completed ? "text-slate-400 line-through" : "text-slate-700"}`}>
                  {todo.title}
                </span>
              )}
              {editingId === todo.id ? (
                <button onClick={() => saveEdit(todo.id)} className="text-sm text-green-600 hover:underline">Save</button>
              ) : (
                <button
                  onClick={() => { setEditingId(todo.id); setEditText(todo.title); }}
                  className="text-sm text-indigo-600 hover:underline"
                >Edit</button>
              )}
              <button onClick={() => deleteTodo(todo.id)} className="text-sm text-red-600 hover:underline">Delete</button>
            </li>
          ))}
        </ul>

        {todos.length === 0 && <p className="py-6 text-center text-slate-400">No todos yet. Add one above!</p>}
        {todos.length > 0 && <p className="mt-4 text-sm text-slate-500">{remaining} of {todos.length} remaining</p>}
      </div>
    </div>
  );
}
