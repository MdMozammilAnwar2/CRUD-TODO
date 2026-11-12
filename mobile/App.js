import { useEffect, useState } from "react";
import {
  SafeAreaView, View, Text, TextInput, TouchableOpacity, FlatList,
  StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform, StatusBar,
} from "react-native";

// Phone can't reach "localhost" — use your computer's LAN IP (run `ipconfig`).
// Android emulator: http://10.0.2.2:5000/api/todos
const API = "http://192.168.1.12:5000/api/todos";

export default function App() {
  const [todos, setTodos] = useState([]);
  const [title, setTitle] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const request = async (url, options = {}) => {
    setError("");
    const res = await fetch(url, { headers: { "Content-Type": "application/json" }, ...options });
    if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || "Request failed");
    return res.status === 204 ? null : res.json();
  };

  useEffect(() => {
    request(API).then(setTodos).catch((e) => setError(e.message)).finally(() => setLoading(false));
  }, []);

  const addTodo = async () => {
    if (!title.trim()) return;
    try {
      const todo = await request(API, { method: "POST", body: JSON.stringify({ title: title.trim() }) });
      setTodos((prev) => [todo, ...prev]);
      setTitle("");
    } catch (e) { setError(e.message); }
  };

  const updateTodo = async (id, data) => {
    try {
      const updated = await request(`${API}/${id}`, { method: "PUT", body: JSON.stringify(data) });
      setTodos((prev) => prev.map((t) => (t.id === id ? updated : t)));
    } catch (e) { setError(e.message); }
  };

  const deleteTodo = async (id) => {
    try {
      await request(`${API}/${id}`, { method: "DELETE" });
      setTodos((prev) => prev.filter((t) => t.id !== id));
    } catch (e) { setError(e.message); }
  };

  const saveEdit = async (id) => {
    if (editText.trim()) await updateTodo(id, { title: editText.trim() });
    setEditingId(null);
  };

  const remaining = todos.filter((t) => !t.completed).length;

  const renderItem = ({ item }) => {
    const editing = editingId === item.id;
    return (
      <View style={styles.row}>
        <TouchableOpacity
          style={[styles.check, item.completed && styles.checkOn]}
          onPress={() => updateTodo(item.id, { completed: !item.completed })}
        >
          {item.completed && <Text style={styles.checkMark}>✓</Text>}
        </TouchableOpacity>
        {editing ? (
          <TextInput
            autoFocus
            value={editText}
            onChangeText={setEditText}
            onSubmitEditing={() => saveEdit(item.id)}
            style={[styles.input, styles.flex]}
          />
        ) : (
          <Text style={[styles.flex, styles.title, item.completed && styles.done]}>{item.title}</Text>
        )}
        {editing ? (
          <TouchableOpacity onPress={() => saveEdit(item.id)}><Text style={styles.save}>Save</Text></TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={() => { setEditingId(item.id); setEditText(item.title); }}>
            <Text style={styles.edit}>Edit</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity onPress={() => deleteTodo(item.id)}><Text style={styles.del}>Delete</Text></TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar barStyle="dark-content" />
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <View style={styles.card}>
          <Text style={styles.h1}>Todo List</Text>
          <View style={styles.form}>
            <TextInput
              value={title}
              onChangeText={setTitle}
              onSubmitEditing={addTodo}
              placeholder="What needs to be done?"
              style={[styles.input, styles.flex]}
            />
            <TouchableOpacity style={styles.addBtn} onPress={addTodo}><Text style={styles.addText}>Add</Text></TouchableOpacity>
          </View>
          {!!error && <Text style={styles.error}>{error}</Text>}
          {loading ? (
            <ActivityIndicator style={{ marginTop: 24 }} color="#4f46e5" />
          ) : (
            <FlatList
              data={todos}
              keyExtractor={(t) => String(t.id)}
              renderItem={renderItem}
              ItemSeparatorComponent={() => <View style={styles.sep} />}
              ListEmptyComponent={<Text style={styles.empty}>No todos yet. Add one above!</Text>}
            />
          )}
          {todos.length > 0 && <Text style={styles.count}>{remaining} of {todos.length} remaining</Text>}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#f1f5f9", paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0 },
  flex: { flex: 1 },
  card: { flex: 1, margin: 16, padding: 20, backgroundColor: "#fff", borderRadius: 16, elevation: 3,
    shadowColor: "#000", shadowOpacity: 0.08, shadowRadius: 10, shadowOffset: { width: 0, height: 4 } },
  h1: { fontSize: 28, fontWeight: "700", color: "#1e293b", marginBottom: 16 },
  form: { flexDirection: "row", gap: 8, marginBottom: 12 },
  input: { borderWidth: 1, borderColor: "#cbd5e1", borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, fontSize: 16 },
  addBtn: { backgroundColor: "#4f46e5", borderRadius: 8, paddingHorizontal: 16, justifyContent: "center" },
  addText: { color: "#fff", fontWeight: "600", fontSize: 16 },
  error: { backgroundColor: "#fef2f2", color: "#dc2626", padding: 8, borderRadius: 6, marginBottom: 12 },
  row: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 12 },
  check: { width: 24, height: 24, borderRadius: 6, borderWidth: 2, borderColor: "#4f46e5", alignItems: "center", justifyContent: "center" },
  checkOn: { backgroundColor: "#4f46e5" },
  checkMark: { color: "#fff", fontWeight: "700" },
  title: { fontSize: 16, color: "#334155" },
  done: { color: "#94a3b8", textDecorationLine: "line-through" },
  edit: { color: "#4f46e5" },
  save: { color: "#16a34a" },
  del: { color: "#dc2626" },
  sep: { height: 1, backgroundColor: "#e2e8f0" },
  empty: { textAlign: "center", color: "#94a3b8", paddingVertical: 24 },
  count: { marginTop: 12, color: "#64748b", fontSize: 14 },
});
