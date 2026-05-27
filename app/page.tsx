"use client";

import { useCallback, useEffect, useState } from "react";

import { TimerPanel } from "@/components/timer-panel";
import { TodoPanel } from "@/components/todo-panel";
import {
  CurrentTask,
  createInitialPersistedAppState,
  LOCAL_STORAGE_KEY,
  PersistedAppState,
  TagStat,
  Todo,
  getTagStatLabel,
  parsePersistedAppState,
  sanitizeActiveTaskId,
} from "@/lib/pomoflowy";

export default function Home() {
  const [persistedState, setPersistedState] = useState<PersistedAppState>(
    createInitialPersistedAppState,
  );
  const [hasHydrated, setHasHydrated] = useState(false);
  const [todos, setTodos] = useState(persistedState.todos);
  const [activeTaskId, setActiveTaskId] = useState<string | null>(
    persistedState.activeTaskId,
  );
  const [tagStats, setTagStats] = useState<TagStat[]>(persistedState.tagStats);
  const [completedPomodoros, setCompletedPomodoros] = useState(
    persistedState.completedPomodoros,
  );
  const [canSetActiveTask, setCanSetActiveTask] = useState(true);
  const [canClearActiveTask, setCanClearActiveTask] = useState(true);
  const [workSessionTask, setWorkSessionTask] = useState<CurrentTask | null>(null);
  const activeTaskFromTodos =
    todos.find((todo) => todo.id === activeTaskId) ?? null;
  const isWorkSessionLocked = !canSetActiveTask && !canClearActiveTask;
  const currentTask: CurrentTask | null = isWorkSessionLocked
    ? workSessionTask
      ? {
          title: workSessionTask.title,
          tag: workSessionTask.tag,
        }
      : null
    : activeTaskFromTodos;

  const clearInvalidActiveTaskIfNeeded = (canChangeActiveTask: boolean) => {
    if (!canChangeActiveTask || activeTaskId === null) {
      return;
    }

    if (sanitizeActiveTaskId(todos, activeTaskId) === null) {
      setActiveTaskId(null);
    }
  };

  useEffect(() => {
    queueMicrotask(() => {
      try {
        const storedValue = window.localStorage.getItem(LOCAL_STORAGE_KEY);

        if (!storedValue) {
          return;
        }

        const nextPersistedState =
          parsePersistedAppState(storedValue) ??
          createInitialPersistedAppState();

        setPersistedState(nextPersistedState);
        setTodos(nextPersistedState.todos);
        setActiveTaskId(nextPersistedState.activeTaskId);
        setTagStats(nextPersistedState.tagStats);
        setCompletedPomodoros(nextPersistedState.completedPomodoros);
      } catch {
        const initialState = createInitialPersistedAppState();

        setPersistedState(initialState);
        setTodos(initialState.todos);
        setActiveTaskId(initialState.activeTaskId);
        setTagStats(initialState.tagStats);
        setCompletedPomodoros(initialState.completedPomodoros);
      } finally {
        setHasHydrated(true);
      }
    });
  }, []);

  useEffect(() => {
    if (!hasHydrated) {
      return;
    }

    try {
      window.localStorage.setItem(
        LOCAL_STORAGE_KEY,
        JSON.stringify({
          todos,
          activeTaskId: sanitizeActiveTaskId(todos, activeTaskId),
          tagStats,
          completedPomodoros,
        }),
      );
    } catch {
      return;
    }
  }, [activeTaskId, completedPomodoros, hasHydrated, tagStats, todos]);

  const handleActiveTaskAvailabilityChange = (canChangeActiveTask: boolean) => {
    setCanSetActiveTask(canChangeActiveTask);
    clearInvalidActiveTaskIfNeeded(canChangeActiveTask);
  };

  const handleAddTodo = (todo: Todo) => {
    setTodos((currentTodos) => [todo, ...currentTodos]);
  };

  const handleUpdateTodo = (updatedTodo: Todo) => {
    setTodos((currentTodos) =>
      currentTodos.map((todo) =>
        todo.id === updatedTodo.id ? updatedTodo : todo,
      ),
    );
  };

  const handleUpdateTodoCompletion = (
    targetTodoIds: string[],
    completed: boolean,
  ) => {
    setTodos((currentTodos) =>
      currentTodos.map((todo) =>
        targetTodoIds.includes(todo.id) ? { ...todo, completed } : todo,
      ),
    );

    if (
      completed &&
      activeTaskId !== null &&
      targetTodoIds.includes(activeTaskId)
    ) {
      setActiveTaskId(null);
    }
  };

  const handleDeleteTodos = (targetTodoIds: string[]) => {
    setTodos((currentTodos) =>
      currentTodos.filter((todo) => !targetTodoIds.includes(todo.id)),
    );

    if (
      activeTaskId !== null &&
      targetTodoIds.includes(activeTaskId)
    ) {
      setActiveTaskId(null);
    }
  };

  const handleSetActiveTask = (todoId: string) => {
    if (!canSetActiveTask) {
      return;
    }

    setActiveTaskId(todoId);
  };

  const handleClearActiveTask = () => {
    if (!canClearActiveTask) {
      return;
    }

    setActiveTaskId(null);
  };

  const handleWorkComplete = useCallback(() => {
    setCompletedPomodoros((currentCount) => currentCount + 1);

    if (!workSessionTask) {
      return;
    }

    const targetTag = getTagStatLabel(workSessionTask.tag);

    setTagStats((currentStats) => {
      const existingStat = currentStats.find((stat) => stat.tag === targetTag);

      if (!existingStat) {
        return [
          ...currentStats,
          {
            tag: targetTag,
            completedCount: 1,
          },
        ];
      }

      return currentStats.map((stat) =>
        stat.tag === targetTag
          ? { ...stat, completedCount: stat.completedCount + 1 }
          : stat,
      );
    });
    setWorkSessionTask(null);
  }, [workSessionTask]);

  const handleWorkSessionStart = useCallback(() => {
    if (!activeTaskId || !activeTaskFromTodos) {
      setWorkSessionTask(null);
      return;
    }

    setWorkSessionTask({
      title: activeTaskFromTodos.title,
      tag: activeTaskFromTodos.tag,
    });
  }, [activeTaskFromTodos, activeTaskId]);

  const handleResetCompletedCounts = useCallback(() => {
    setTagStats([]);
    setCompletedPomodoros(0);
  }, []);

  const handleBrowseIncompleteTodos = useCallback(() => {
    const todoSection = document.getElementById("todo-panel");

    if (!todoSection) {
      return;
    }

    todoSection.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  return (
    <main className="flex min-h-screen flex-col bg-[linear-gradient(180deg,#fff7ed_0%,#f8fafc_38%,#eef2ff_100%)] px-5 py-8 text-slate-950 sm:px-8 lg:px-12 lg:py-12">
      <section className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8">
        <div className="max-w-2xl space-y-4">
          <p className="text-sm font-medium uppercase tracking-[0.34em] text-orange-700">
            Focus Fast, Track Clearly
          </p>
          <h1 className="text-4xl font-semibold tracking-[-0.05em] text-slate-950 sm:text-5xl">
            PomoFlowy
          </h1>
          <p className="max-w-xl text-base leading-7 text-slate-600 sm:text-lg">
            ポモドーロタイマー × ToDoリストで、集中と進捗をつなぐ
          </p>
        </div>

        <TimerPanel
          currentTask={currentTask}
          tagStats={tagStats}
          completedPomodoros={completedPomodoros}
          canClearActiveTask={canClearActiveTask}
          onBrowseIncompleteTodos={handleBrowseIncompleteTodos}
          onWorkComplete={handleWorkComplete}
          onWorkSessionStart={handleWorkSessionStart}
          onResetCompletedCounts={handleResetCompletedCounts}
          onActiveTaskAvailabilityChange={handleActiveTaskAvailabilityChange}
          onActiveTaskClearAvailabilityChange={setCanClearActiveTask}
          onClearActiveTask={handleClearActiveTask}
        />
        <TodoPanel
          todos={todos}
          activeTaskId={activeTaskId}
          canSetActiveTask={canSetActiveTask}
          canClearActiveTask={canClearActiveTask}
          onAddTodo={handleAddTodo}
          onUpdateTodo={handleUpdateTodo}
          onUpdateTodoCompletion={handleUpdateTodoCompletion}
          onDeleteTodos={handleDeleteTodos}
          onSetActiveTask={handleSetActiveTask}
          onClearActiveTask={handleClearActiveTask}
        />
      </section>
    </main>
  );
}
