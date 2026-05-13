export type Todo = {
  id: string;
  title: string;
  tag: string;
  completed: boolean;
};

export type CurrentTask = {
  title: string;
  tag: string;
};

export type TagStat = {
  tag: string;
  completedCount: number;
};

export type PersistedAppState = {
  todos: Todo[];
  activeTaskId: string | null;
  tagStats: TagStat[];
};

export const LOCAL_STORAGE_KEY = "pomo-list-app-state";

export function getTagStatLabel(tag: string) {
  const normalizedTag = tag.trim();

  return normalizedTag || "タグなし";
}

function isTodo(value: unknown): value is Todo {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return (
    typeof candidate.id === "string" &&
    typeof candidate.title === "string" &&
    typeof candidate.tag === "string" &&
    typeof candidate.completed === "boolean"
  );
}

function isTagStat(value: unknown): value is TagStat {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return (
    typeof candidate.tag === "string" &&
    typeof candidate.completedCount === "number"
  );
}

export function sanitizeActiveTaskId(
  todos: Todo[],
  activeTaskId: string | null,
) {
  if (activeTaskId === null) {
    return null;
  }

  const activeTodo = todos.find((todo) => todo.id === activeTaskId);

  if (!activeTodo || activeTodo.completed) {
    return null;
  }

  return activeTaskId;
}

export function parsePersistedAppState(
  value: string,
): PersistedAppState | null {
  const parsedValue: unknown = JSON.parse(value);

  if (typeof parsedValue !== "object" || parsedValue === null) {
    return null;
  }

  const candidate = parsedValue as Record<string, unknown>;

  if (!Array.isArray(candidate.todos) || !candidate.todos.every(isTodo)) {
    return null;
  }

  if (
    candidate.activeTaskId !== null &&
    typeof candidate.activeTaskId !== "string"
  ) {
    return null;
  }

  if (
    !Array.isArray(candidate.tagStats) ||
    !candidate.tagStats.every(isTagStat)
  ) {
    return null;
  }

  return {
    todos: candidate.todos,
    activeTaskId: sanitizeActiveTaskId(candidate.todos, candidate.activeTaskId),
    tagStats: candidate.tagStats,
  };
}

export function createInitialPersistedAppState(): PersistedAppState {
  return {
    todos: initialTodos,
    activeTaskId: null,
    tagStats: [],
  };
}

export function loadPersistedAppState(): PersistedAppState {
  const initialState = createInitialPersistedAppState();

  if (typeof window === "undefined") {
    return initialState;
  }

  const storedValue = window.localStorage.getItem(LOCAL_STORAGE_KEY);

  if (!storedValue) {
    return initialState;
  }

  try {
    return parsePersistedAppState(storedValue) ?? initialState;
  } catch {
    return initialState;
  }
}

export const initialTodos: Todo[] = [
  {
    id: "todo-1",
    title: "朝会の前に進行メモを確認する",
    tag: "仕事",
    completed: false,
  },
  {
    id: "todo-2",
    title: "買い物リストを整理する",
    tag: "生活",
    completed: true,
  },
];
