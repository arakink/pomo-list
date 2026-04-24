"use client";

import { FormEvent, useState } from "react";

type Todo = {
  id: string;
  title: string;
  tag: string;
  completed: boolean;
};

type SelectionMode = "complete" | "restore" | "delete" | null;

const initialTodos: Todo[] = [
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

function createTodoId() {
  return `todo-${crypto.randomUUID()}`;
}

export function TodoPanel() {
  const [todos, setTodos] = useState<Todo[]>(initialTodos);
  const [title, setTitle] = useState("");
  const [tag, setTag] = useState("");
  const [selectedTodoIds, setSelectedTodoIds] = useState<string[]>([]);
  const [selectionMode, setSelectionMode] = useState<SelectionMode>(null);
  const [selectionColumn, setSelectionColumn] = useState<"incomplete" | "completed" | null>(null);
  const [editingTodoId, setEditingTodoId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [editingTag, setEditingTag] = useState("");

  const incompleteTodos = todos.filter((todo) => !todo.completed);
  const completedTodos = todos.filter((todo) => todo.completed);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedTitle = title.trim();
    const trimmedTag = tag.trim();

    if (!trimmedTitle) {
      return;
    }

    setTodos((currentTodos) => [
      {
        id: createTodoId(),
        title: trimmedTitle,
        tag: trimmedTag,
        completed: false,
      },
      ...currentTodos,
    ]);
    setTitle("");
    setTag("");
  };

  const toggleTodoSelected = (id: string) => {
    setSelectedTodoIds((currentIds) =>
      currentIds.includes(id)
        ? currentIds.filter((currentId) => currentId !== id)
        : [...currentIds, id],
    );
  };

  const startSelection = (
    mode: Exclude<SelectionMode, null>,
    column: "incomplete" | "completed",
  ) => {
    setSelectionMode(mode);
    setSelectionColumn(column);
    setSelectedTodoIds([]);
  };

  const cancelSelection = () => {
    setSelectionMode(null);
    setSelectionColumn(null);
    setSelectedTodoIds([]);
  };

  const moveSelectedTodos = (completed: boolean) => {
    setTodos((currentTodos) =>
      currentTodos.map((todo) =>
        selectedTodoIds.includes(todo.id) ? { ...todo, completed } : todo,
      ),
    );
    cancelSelection();
  };

  const startEditingTodo = (todo: Todo) => {
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

    setTodos((currentTodos) =>
      currentTodos.map((todo) =>
        todo.id === id
          ? { ...todo, title: trimmedTitle, tag: trimmedTag }
          : todo,
      ),
    );
    cancelEditingTodo();
  };

  const deleteSelectedTodos = () => {
    setTodos((currentTodos) =>
      currentTodos.filter((todo) => !selectedTodoIds.includes(todo.id)),
    );

    if (editingTodoId !== null && selectedTodoIds.includes(editingTodoId)) {
      cancelEditingTodo();
    }

    cancelSelection();
  };

  return (
    <section className="w-full max-w-4xl rounded-[2rem] border border-slate-900/10 bg-white/85 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.12)] backdrop-blur md:p-10">
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
              このブランチでは ToDo の登録、タグ付け、完了切替までをローカル state
              で扱います。タイマーとの接続や保存はまだ行いません。
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
            selectionMode={selectionMode}
            selectionColumn={selectionColumn}
            onStartPrimarySelection={() => startSelection("complete", "incomplete")}
            onStartDeleteSelection={() => startSelection("delete", "incomplete")}
            onConfirmSelection={() => {
              if (selectionMode === "delete") {
                deleteSelectedTodos();
                return;
              }

              moveSelectedTodos(true);
            }}
            onCancelSelection={cancelSelection}
            onEdit={startEditingTodo}
            onSave={saveTodo}
            onCancelEdit={cancelEditingTodo}
            selectedTodoIds={selectedTodoIds}
            onSelect={toggleTodoSelected}
            editingTodoId={editingTodoId}
            editingTitle={editingTitle}
            editingTag={editingTag}
            onEditingTitleChange={setEditingTitle}
            onEditingTagChange={setEditingTag}
            tone="slate"
          />
          <TodoColumn
            title="完了済み"
            count={completedTodos.length}
            emptyMessage="完了したタスクはまだありません。"
            todos={completedTodos}
            columnType="completed"
            selectionMode={selectionMode}
            selectionColumn={selectionColumn}
            onStartPrimarySelection={() => startSelection("restore", "completed")}
            onStartDeleteSelection={() => startSelection("delete", "completed")}
            onConfirmSelection={() => {
              if (selectionMode === "delete") {
                deleteSelectedTodos();
                return;
              }

              moveSelectedTodos(false);
            }}
            onCancelSelection={cancelSelection}
            onEdit={startEditingTodo}
            onSave={saveTodo}
            onCancelEdit={cancelEditingTodo}
            selectedTodoIds={selectedTodoIds}
            onSelect={toggleTodoSelected}
            editingTodoId={editingTodoId}
            editingTitle={editingTitle}
            editingTag={editingTag}
            onEditingTitleChange={setEditingTitle}
            onEditingTagChange={setEditingTag}
            tone="emerald"
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
  columnType: "incomplete" | "completed";
  selectionMode: SelectionMode;
  selectionColumn: "incomplete" | "completed" | null;
  onStartPrimarySelection: () => void;
  onStartDeleteSelection: () => void;
  onConfirmSelection: () => void;
  onCancelSelection: () => void;
  onEdit: (todo: Todo) => void;
  onSave: (id: string) => void;
  onCancelEdit: () => void;
  selectedTodoIds: string[];
  onSelect: (id: string) => void;
  editingTodoId: string | null;
  editingTitle: string;
  editingTag: string;
  onEditingTitleChange: (value: string) => void;
  onEditingTagChange: (value: string) => void;
  tone: "slate" | "emerald";
};

function TodoColumn({
  title,
  count,
  emptyMessage,
  todos,
  columnType,
  selectionMode,
  selectionColumn,
  onStartPrimarySelection,
  onStartDeleteSelection,
  onConfirmSelection,
  onCancelSelection,
  onEdit,
  onSave,
  onCancelEdit,
  selectedTodoIds,
  onSelect,
  editingTodoId,
  editingTitle,
  editingTag,
  onEditingTitleChange,
  onEditingTagChange,
  tone,
}: TodoColumnProps) {
  const panelClassName =
    tone === "emerald"
      ? "bg-emerald-950 text-white"
      : "border border-slate-200 bg-slate-50 text-slate-950";
  const eyebrowClassName =
    tone === "emerald" ? "text-emerald-200" : "text-slate-500";
  const countClassName =
    tone === "emerald" ? "text-white" : "text-slate-950";
  const cardClassName =
    tone === "emerald"
      ? "bg-white/8 ring-1 ring-white/10"
      : "bg-white ring-1 ring-slate-900/6";
  const titleClassName = tone === "emerald" ? "text-white" : "text-slate-950";
  const tagClassName =
    tone === "emerald"
      ? "bg-white/10 text-emerald-100"
      : "bg-emerald-50 text-emerald-800";
  const emptyClassName =
    tone === "emerald" ? "text-slate-300" : "text-slate-500";
  const buttonClassName =
    tone === "emerald"
      ? "border-white/20 bg-white/8 text-white hover:bg-white/14"
      : "border-slate-300 bg-white text-slate-700 hover:border-slate-500";
  const secondaryButtonClassName =
    tone === "emerald"
      ? "border-white/15 bg-transparent text-slate-200 hover:bg-white/10"
      : "border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-200";
  const dangerButtonClassName =
    tone === "emerald"
      ? "border-rose-300/30 bg-rose-400/10 text-rose-100 hover:bg-rose-400/20"
      : "border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100";
  const inputClassName =
    tone === "emerald"
      ? "border-white/15 bg-white/8 text-white placeholder:text-slate-300 focus:border-emerald-300 focus:ring-4 focus:ring-emerald-200/10"
      : "border-slate-200 bg-white text-slate-950 placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10";
  const checkboxClassName =
    tone === "emerald"
      ? "border-white/20 bg-white/8 text-emerald-200 accent-emerald-300"
      : "border-slate-300 bg-white text-emerald-700 accent-emerald-600";
  const selectedIdsInColumn = todos
    .filter((todo) => selectedTodoIds.includes(todo.id))
    .map((todo) => todo.id);
  const hasSelection = selectedIdsInColumn.length > 0;
  const isSelectingInThisColumn = selectionColumn === columnType;
  const primaryActionLabel =
    columnType === "incomplete" ? "完了にする" : "未完了へ戻す";
  const confirmActionLabel =
    selectionMode === "delete"
      ? "削除を実行"
      : columnType === "incomplete"
        ? "完了にする"
        : "未完了へ戻す";
  const selectionDescription =
    selectionMode === "delete"
      ? "対象のタスクを選んで削除します。"
      : columnType === "incomplete"
        ? "完了にしたいタスクを選んでください。"
        : "未完了へ戻したいタスクを選んでください。";

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

      <div className="mt-5 grid gap-2">
        {isSelectingInThisColumn ? (
          <>
            <p className={`text-sm leading-6 ${eyebrowClassName}`}>
              {selectionDescription}
            </p>
            <button
              type="button"
              onClick={onConfirmSelection}
              disabled={!hasSelection}
              className={`rounded-full border px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
                selectionMode === "delete" ? dangerButtonClassName : buttonClassName
              }`}
            >
              {confirmActionLabel}
            </button>
            <button
              type="button"
              onClick={onCancelSelection}
              className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${secondaryButtonClassName}`}
            >
              キャンセル
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={onStartPrimarySelection}
              className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${buttonClassName}`}
            >
              {primaryActionLabel}
            </button>
            <button
              type="button"
              onClick={onStartDeleteSelection}
              className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${dangerButtonClassName}`}
            >
              削除
            </button>
          </>
        )}
      </div>

      {todos.length > 0 ? (
        <ul className="mt-5 space-y-3">
          {todos.map((todo) => (
            <li key={todo.id} className={`rounded-[1.4rem] p-4 ${cardClassName}`}>
              <div className="flex flex-col gap-4">
                {isSelectingInThisColumn ? (
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={selectedTodoIds.includes(todo.id)}
                      onChange={() => onSelect(todo.id)}
                      className={`h-4 w-4 rounded border ${checkboxClassName}`}
                    />
                    <span className={`text-xs font-semibold uppercase tracking-[0.18em] ${eyebrowClassName}`}>
                      選択
                    </span>
                  </label>
                ) : null}

                {editingTodoId === todo.id ? (
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={editingTitle}
                      onChange={(event) => onEditingTitleChange(event.target.value)}
                      placeholder="タスク名"
                      className={`w-full rounded-2xl border px-4 py-3 text-sm outline-none transition ${inputClassName}`}
                    />
                    <input
                      type="text"
                      value={editingTag}
                      onChange={(event) => onEditingTagChange(event.target.value)}
                      placeholder="タグ"
                      className={`w-full rounded-2xl border px-4 py-3 text-sm outline-none transition ${inputClassName}`}
                    />
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className={`text-base font-semibold leading-6 ${titleClassName}`}>
                      {todo.title}
                    </p>
                    {todo.tag ? (
                      <span
                        className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-semibold ${tagClassName}`}
                      >
                        {todo.tag}
                      </span>
                    ) : (
                      <span className={`text-xs ${emptyClassName}`}>タグなし</span>
                    )}
                  </div>
                )}

                <div className="grid gap-2 sm:grid-cols-2">
                  {editingTodoId === todo.id ? (
                    <button
                      type="button"
                      onClick={() => onSave(todo.id)}
                      disabled={!editingTitle.trim()}
                      className={`rounded-full border px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${buttonClassName}`}
                    >
                      保存
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onEdit(todo)}
                      className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${secondaryButtonClassName}`}
                    >
                      編集
                    </button>
                  )}
                  {editingTodoId === todo.id ? (
                    <button
                      type="button"
                      onClick={onCancelEdit}
                      className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${secondaryButtonClassName}`}
                    >
                      キャンセル
                    </button>
                  ) : null}
                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className={`mt-5 text-sm leading-6 ${emptyClassName}`}>{emptyMessage}</p>
      )}
    </section>
  );
}
