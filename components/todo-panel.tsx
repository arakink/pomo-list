"use client";

import { FormEvent, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Todo } from "@/lib/pomo-list";
import { cn } from "@/lib/utils";

type ColumnType = "incomplete" | "completed";
type TodoColumnEditing = {
  todoId: string | null;
  title: string;
  tag: string;
  onStart: (todo: Todo) => void;
  onSave: (id: string) => void;
  onCancel: () => void;
  onTitleChange: (value: string) => void;
  onTagChange: (value: string) => void;
};

function getPrimaryActionLabel(columnType: ColumnType) {
  return columnType === "incomplete" ? "完了にする" : "未完了へ戻す";
}

function createTodoId() {
  return `todo-${crypto.randomUUID()}`;
}

type TodoPanelProps = {
  todos: Todo[];
  activeTaskId: string | null;
  canSetActiveTask: boolean;
  canClearActiveTask: boolean;
  onAddTodo: (todo: Todo) => void;
  onUpdateTodo: (todo: Todo) => void;
  onUpdateTodoCompletion: (targetTodoIds: string[], completed: boolean) => void;
  onDeleteTodos: (targetTodoIds: string[]) => void;
  onSetActiveTask: (todoId: string) => void;
  onClearActiveTask: () => void;
};

export function TodoPanel({
  todos,
  activeTaskId,
  canSetActiveTask,
  canClearActiveTask,
  onAddTodo,
  onUpdateTodo,
  onUpdateTodoCompletion,
  onDeleteTodos,
  onSetActiveTask,
  onClearActiveTask,
}: TodoPanelProps) {
  const [title, setTitle] = useState("");
  const [tag, setTag] = useState("");
  const [editingTodoId, setEditingTodoId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [editingTag, setEditingTag] = useState("");
  const [openMenuTodoId, setOpenMenuTodoId] = useState<string | null>(null);

  const incompleteTodos = todos.filter((todo) => !todo.completed);
  const completedTodos = todos.filter((todo) => todo.completed);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedTitle = title.trim();
    const trimmedTag = tag.trim();

    if (!trimmedTitle) {
      return;
    }

    onAddTodo({
      id: createTodoId(),
      title: trimmedTitle,
      tag: trimmedTag,
      completed: false,
    });
    setTitle("");
    setTag("");
  };

  const startEditingTodo = (todo: Todo) => {
    setOpenMenuTodoId(null);
    setEditingTodoId(todo.id);
    setEditingTitle(todo.title);
    setEditingTag(todo.tag);
  };

  const cancelEditingTodo = () => {
    setEditingTodoId(null);
    setEditingTitle("");
    setEditingTag("");
  };

  const saveTodo = (id: string) => {
    const trimmedTitle = editingTitle.trim();
    const trimmedTag = editingTag.trim();

    if (!trimmedTitle) {
      return;
    }

    const todo = todos.find((currentTodo) => currentTodo.id === id);

    if (!todo) {
      cancelEditingTodo();
      return;
    }

    onUpdateTodo({
      ...todo,
      title: trimmedTitle,
      tag: trimmedTag,
    });
    cancelEditingTodo();
  };

  const handleToggleTodoCompletion = (todo: Todo) => {
    onUpdateTodoCompletion([todo.id], !todo.completed);
    setOpenMenuTodoId(null);

    if (editingTodoId === todo.id) {
      cancelEditingTodo();
    }
  };

  const handleDeleteTodo = (todoId: string) => {
    onDeleteTodos([todoId]);
    setOpenMenuTodoId(null);

    if (editingTodoId === todoId) {
      cancelEditingTodo();
    }
  };

  const editing: TodoColumnEditing = {
    todoId: editingTodoId,
    title: editingTitle,
    tag: editingTag,
    onStart: startEditingTodo,
    onSave: saveTodo,
    onCancel: cancelEditingTodo,
    onTitleChange: setEditingTitle,
    onTagChange: setEditingTag,
  };

  return (
    <section className="mx-auto w-full max-w-4xl rounded-[2rem] border border-slate-900/10 bg-white/85 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.12)] backdrop-blur md:p-10">
      <div className="grid gap-8 lg:grid-cols-[0.88fr_1.12fr]">
        <div className="space-y-6">
          <div className="space-y-3">
            <p className="text-sm font-medium uppercase tracking-[0.32em] text-emerald-700">
              Todo Management
            </p>
            <h2 className="text-3xl font-semibold tracking-[-0.05em] text-slate-950">
              今日のタスクを追加して、状態ごとに整理する。
            </h2>
            <p className="max-w-md text-sm leading-6 text-slate-600">
              このブランチでは ToDo の登録、タグ付け、完了切替に加えて、
              アクティブタスクとしてタイマーへセットする操作までを扱います。追加したタスクとタグ集計はこの端末に保存されます。
            </p>
            <p className="max-w-md text-sm leading-6 text-slate-600">
              Work 開始後はタスクを固定し、切り替えは Break に移ってから行います。
            </p>
          </div>

          <form
            className="space-y-4 rounded-[1.75rem] bg-[linear-gradient(180deg,#ecfeff_0%,#f8fafc_100%)] p-5 ring-1 ring-slate-900/5"
            onSubmit={handleSubmit}
          >
            <div className="space-y-2">
              <label
                htmlFor="todo-title"
                className="text-sm font-semibold text-slate-700"
              >
                タスク名
              </label>
              <input
                id="todo-title"
                type="text"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="例: 企画書の構成をまとめる"
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="todo-tag"
                className="text-sm font-semibold text-slate-700"
              >
                タグ
              </label>
              <input
                id="todo-tag"
                type="text"
                value={tag}
                onChange={(event) => setTag(event.target.value)}
                placeholder="例: 仕事"
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
              />
            </div>

            <button
              type="submit"
              disabled={!title.trim()}
              className="w-full rounded-full bg-emerald-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-300"
            >
              追加
            </button>
          </form>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <TodoColumn
            title="未完了"
            count={incompleteTodos.length}
            emptyMessage="まだタスクはありません。追加するとここに表示されます。"
            todos={incompleteTodos}
            columnType="incomplete"
            editing={editing}
            tone="slate"
            activeTaskId={activeTaskId}
            canSetActiveTask={canSetActiveTask}
            canClearActiveTask={canClearActiveTask}
            onSetActiveTask={onSetActiveTask}
            onClearActiveTask={onClearActiveTask}
            onToggleTodoCompletion={handleToggleTodoCompletion}
            onDeleteTodo={handleDeleteTodo}
            openMenuTodoId={openMenuTodoId}
            onToggleMenu={(todoId) =>
              setOpenMenuTodoId((currentId) =>
                currentId === todoId ? null : todoId,
              )
            }
            onCloseMenu={() => setOpenMenuTodoId(null)}
          />
          <TodoColumn
            title="完了済み"
            count={completedTodos.length}
            emptyMessage="完了したタスクはまだありません。"
            todos={completedTodos}
            columnType="completed"
            editing={editing}
            tone="emerald"
            activeTaskId={activeTaskId}
            canSetActiveTask={canSetActiveTask}
            canClearActiveTask={canClearActiveTask}
            onSetActiveTask={onSetActiveTask}
            onClearActiveTask={onClearActiveTask}
            onToggleTodoCompletion={handleToggleTodoCompletion}
            onDeleteTodo={handleDeleteTodo}
            openMenuTodoId={openMenuTodoId}
            onToggleMenu={(todoId) =>
              setOpenMenuTodoId((currentId) =>
                currentId === todoId ? null : todoId,
              )
            }
            onCloseMenu={() => setOpenMenuTodoId(null)}
          />
        </div>
      </div>
    </section>
  );
}

type TodoColumnProps = {
  title: string;
  count: number;
  emptyMessage: string;
  todos: Todo[];
  columnType: ColumnType;
  editing: TodoColumnEditing;
  tone: "slate" | "emerald";
  activeTaskId: string | null;
  canSetActiveTask: boolean;
  canClearActiveTask: boolean;
  onSetActiveTask: (todoId: string) => void;
  onClearActiveTask: () => void;
  onToggleTodoCompletion: (todo: Todo) => void;
  onDeleteTodo: (todoId: string) => void;
  openMenuTodoId: string | null;
  onToggleMenu: (todoId: string) => void;
  onCloseMenu: () => void;
};

function TodoColumn({
  title,
  count,
  emptyMessage,
  todos,
  columnType,
  editing,
  tone,
  activeTaskId,
  canSetActiveTask,
  canClearActiveTask,
  onSetActiveTask,
  onClearActiveTask,
  onToggleTodoCompletion,
  onDeleteTodo,
  openMenuTodoId,
  onToggleMenu,
  onCloseMenu,
}: TodoColumnProps) {
  const panelClassName =
    tone === "emerald"
      ? "border border-emerald-200 bg-[linear-gradient(180deg,#f3fbf6_0%,#e8f7ee_100%)] text-slate-950"
      : "border border-slate-200 bg-slate-50 text-slate-950";
  const eyebrowClassName =
    tone === "emerald" ? "text-emerald-700" : "text-slate-500";
  const countClassName =
    tone === "emerald" ? "text-emerald-950" : "text-slate-950";
  const titleClassName = "text-slate-950";
  const emptyClassName =
    tone === "emerald" ? "text-slate-500" : "text-slate-500";
  const inputClassName =
    tone === "emerald"
      ? "border-emerald-200 bg-white text-slate-950 placeholder:text-slate-400 focus-visible:border-emerald-500 focus-visible:ring-emerald-500/10"
      : "";
  const primaryActionLabel = getPrimaryActionLabel(columnType);
  const canSetTask = columnType === "incomplete";
  const todoCardClassName =
    tone === "emerald"
      ? "border-emerald-100 bg-white shadow-[0_10px_28px_rgba(16,185,129,0.08)]"
      : "bg-white";
  const actionAreaClassName =
    tone === "emerald"
      ? "border-emerald-100 bg-emerald-50/70"
      : "border-slate-200 bg-slate-50";
  const primaryButtonVariant = "default";
  const secondaryButtonVariant = "secondary";
  const actionButtonClassName =
    "h-auto min-h-11 whitespace-normal px-4 py-3 text-center leading-[1.25] shadow-none";
  const primaryButtonClassName =
    tone === "emerald"
      ? "border-emerald-600 bg-emerald-600 text-white hover:border-emerald-700 hover:bg-emerald-700"
      : "";
  const secondaryButtonClassName =
    tone === "emerald"
      ? "border-emerald-200 bg-white text-emerald-900 hover:border-emerald-300 hover:bg-emerald-50"
      : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50";

  return (
    <section className={`rounded-[1.75rem] p-5 ${panelClassName}`}>
      <div className="flex items-end justify-between gap-4">
        <div className="space-y-2">
          <p className={`text-xs uppercase tracking-[0.24em] ${eyebrowClassName}`}>
            {title}
          </p>
          <p className={`text-4xl font-semibold tracking-[-0.06em] ${countClassName}`}>
            {count}
          </p>
        </div>
      </div>

      {todos.length > 0 ? (
        <ul className="mt-5 space-y-3">
          {todos.map((todo) => (
            <li key={todo.id}>
              <Card className={cn("overflow-hidden rounded-2xl transition", todoCardClassName)}>
                {editing.todoId === todo.id ? (
                  <>
                    <CardHeader>
                      <CardTitle className={titleClassName}>タスクを編集</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="space-y-2">
                        <label htmlFor={`edit-title-${todo.id}`} className="sr-only">
                          タスク名
                        </label>
                        <Input
                          id={`edit-title-${todo.id}`}
                          type="text"
                          value={editing.title}
                          onChange={(event) => editing.onTitleChange(event.target.value)}
                          placeholder="タスク名"
                          className={inputClassName}
                        />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor={`edit-tag-${todo.id}`} className="sr-only">
                          タグ
                        </label>
                        <Input
                          id={`edit-tag-${todo.id}`}
                          type="text"
                          value={editing.tag}
                          onChange={(event) => editing.onTagChange(event.target.value)}
                          placeholder="タグ"
                          className={inputClassName}
                        />
                      </div>
                    </CardContent>
                  </>
                ) : (
                  <>
                    <CardHeader className="space-y-3">
                      <div className="relative flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1 space-y-2">
                          <CardTitle className={cn("leading-6", titleClassName)}>
                            {todo.title}
                          </CardTitle>
                          {todo.tag ? (
                            <Badge
                              variant="secondary"
                              className={cn(
                                "w-fit",
                                tone === "emerald"
                                  ? "bg-emerald-100 text-emerald-800"
                                  : "bg-emerald-50 text-emerald-800",
                              )}
                            >
                              {todo.tag}
                            </Badge>
                          ) : (
                            <p className={`text-xs font-medium ${emptyClassName}`}>タグなし</p>
                          )}
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                        {activeTaskId === todo.id ? (
                          <Badge
                            className={cn(
                              "bg-orange-100 text-orange-800",
                              tone === "emerald" && "bg-emerald-700 text-white",
                            )}
                          >
                            Current Focus
                          </Badge>
                        ) : null}
                          <button
                            type="button"
                            onClick={() => onToggleMenu(todo.id)}
                            aria-label="タスクメニューを開く"
                            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-700"
                          >
                            ⋯
                          </button>
                        </div>
                        {openMenuTodoId === todo.id ? (
                          <div className="absolute top-11 right-0 z-10 w-40 rounded-xl border border-slate-200 bg-white p-1.5 shadow-[0_18px_32px_rgba(15,23,42,0.12)]">
                            {canSetTask ? (
                              <button
                                type="button"
                                onClick={() => {
                                  if (activeTaskId === todo.id && canClearActiveTask) {
                                    onClearActiveTask();
                                  } else {
                                    onSetActiveTask(todo.id);
                                  }
                                  onCloseMenu();
                                }}
                                disabled={
                                  activeTaskId === todo.id
                                    ? !canClearActiveTask
                                    : !canSetActiveTask
                                }
                                className="flex w-full items-center rounded-lg px-3 py-2 text-left text-sm text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-400"
                              >
                                {activeTaskId === todo.id
                                  ? canClearActiveTask
                                    ? "セットを解除"
                                    : "セット中"
                                  : "タスクをセット"}
                              </button>
                            ) : null}
                            <button
                              type="button"
                              onClick={() => {
                                editing.onStart(todo);
                                onCloseMenu();
                              }}
                              className="flex w-full items-center rounded-lg px-3 py-2 text-left text-sm text-slate-700 transition hover:bg-slate-50"
                            >
                              編集
                            </button>
                            <button
                              type="button"
                              onClick={() => onDeleteTodo(todo.id)}
                              className="flex w-full items-center rounded-lg px-3 py-2 text-left text-sm text-rose-700 transition hover:bg-rose-50"
                            >
                              削除
                            </button>
                          </div>
                        ) : null}
                      </div>
                    </CardHeader>
                  </>
                )}

                <CardFooter className="pt-0">
                  <div
                    className={cn(
                      "w-full rounded-xl border p-2.5",
                      actionAreaClassName,
                    )}
                  >
                    <Button
                      onClick={() => onToggleTodoCompletion(todo)}
                      variant={primaryButtonVariant}
                      className={cn(
                        "w-full rounded-2xl",
                        actionButtonClassName,
                        primaryButtonClassName,
                      )}
                    >
                      {primaryActionLabel}
                    </Button>
                    {editing.todoId === todo.id ? (
                      <Button
                        onClick={() => editing.onSave(todo.id)}
                        disabled={!editing.title.trim()}
                        variant={secondaryButtonVariant}
                        className={cn(
                          "mt-2 w-full rounded-2xl",
                          actionButtonClassName,
                          secondaryButtonClassName,
                        )}
                      >
                        保存
                      </Button>
                    ) : null}
                    {editing.todoId === todo.id ? (
                      <Button
                        onClick={editing.onCancel}
                        variant={secondaryButtonVariant}
                        className={cn(
                          "mt-2 w-full rounded-2xl",
                          actionButtonClassName,
                          secondaryButtonClassName,
                        )}
                      >
                        キャンセル
                      </Button>
                    ) : null}
                  </div>
                </CardFooter>
              </Card>
            </li>
          ))}
        </ul>
      ) : (
        <p className={`mt-5 text-sm leading-6 ${emptyClassName}`}>{emptyMessage}</p>
      )}
    </section>
  );
}
