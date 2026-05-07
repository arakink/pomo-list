"use client";

import { useState } from "react";

import { TimerPanel } from "@/components/timer-panel";
import { TodoPanel } from "@/components/todo-panel";
import {
  CurrentTask,
  TagStat,
  Todo,
  getTagStatLabel,
  initialTodos,
} from "@/lib/pomo-list";

export default function Home() {
  const [todos, setTodos] = useState(initialTodos);
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [tagStats, setTagStats] = useState<TagStat[]>([]);
  const [canSetActiveTask, setCanSetActiveTask] = useState(true);
  const [canClearActiveTask, setCanClearActiveTask] = useState(false);
  const [workSessionTask, setWorkSessionTask] = useState<{
    taskId: string;
    title: string;
    tag: string;
  } | null>(null);
  const activeTaskFromTodos =
    todos.find((todo) => todo.id === activeTaskId) ?? null;
  const isWorkSessionLocked = !canSetActiveTask && !canClearActiveTask;
  const currentTask: CurrentTask | null =
    activeTaskFromTodos ??
    (isWorkSessionLocked && workSessionTask
      ? {
          title: workSessionTask.title,
          tag: workSessionTask.tag,
        }
      : null);

  const clearInvalidActiveTaskIfNeeded = (canChangeActiveTask: boolean) => {
    if (!canChangeActiveTask || activeTaskId === null) {
      return;
    }

    const activeTodo = todos.find((todo) => todo.id === activeTaskId);

    if (!activeTodo || activeTodo.completed) {
      setActiveTaskId(null);
    }
  };

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

  const handleWorkComplete = () => {
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
  };

  const handleWorkSessionStart = () => {
    if (!activeTaskId || !activeTaskFromTodos) {
      setWorkSessionTask(null);
      return;
    }

    setWorkSessionTask({
      taskId: activeTaskId,
      title: activeTaskFromTodos.title,
      tag: activeTaskFromTodos.tag,
    });
  };

  return (
    <main className="flex min-h-screen flex-col bg-[linear-gradient(180deg,#fff7ed_0%,#f8fafc_38%,#eef2ff_100%)] px-5 py-8 text-slate-950 sm:px-8 lg:px-12 lg:py-12">
      <section className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8">
        <div className="max-w-2xl space-y-4">
          <p className="text-sm font-medium uppercase tracking-[0.34em] text-orange-700">
            Focus Fast, Track Clearly
          </p>
          <h1 className="text-4xl font-semibold tracking-[-0.05em] text-slate-950 sm:text-5xl">
            すぐに集中し、タスクの流れを見失わないための PomoList。
          </h1>
          <p className="max-w-xl text-base leading-7 text-slate-600 sm:text-lg">
            タイマーの核はそのままに、今回は ToDo 管理の土台を追加しました。タスクを登録し、
            タグで見分けながら未完了と完了済みを切り替えられます。
          </p>
        </div>

        <TimerPanel
          currentTask={currentTask}
          tagStats={tagStats}
          onWorkComplete={handleWorkComplete}
          onWorkSessionStart={handleWorkSessionStart}
          onActiveTaskAvailabilityChange={handleActiveTaskAvailabilityChange}
          onActiveTaskClearAvailabilityChange={setCanClearActiveTask}
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
