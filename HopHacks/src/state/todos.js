import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "lifelens_todos_v1";

export async function getTodos() {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export async function setTodos(list) {
  await AsyncStorage.setItem(KEY, JSON.stringify(list));
}

export async function addTodoFromCard(card) {
  const list = await getTodos();
  const exists = list.some((t) => t.actionId === card.actionId);
  if (exists) return list;

  const next = [
    {
      actionId: card.actionId,
      title: (card.title || "").replace(/^Try this:\s*/i, "") || "Action",
      note: card.body || "",
      chips: card.metric_callouts || [],
      done: false,
      ts: Date.now(),
    },
    ...list,
  ];
  await setTodos(next);
  return next;
}

export async function toggleTodo(actionId) {
  const list = await getTodos();
  const next = list.map((t) =>
    t.actionId === actionId ? { ...t, done: !t.done } : t
  );
  await setTodos(next);
  return next;
}

export async function removeTodo(actionId) {
  const list = await getTodos();
  const next = list.filter((t) => t.actionId !== actionId);
  await setTodos(next);
  return next;
}

export async function clearTodos() {
  await setTodos([]);
  return [];
}
