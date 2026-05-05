"use client";

import { useState } from "react";

import { TimerPanel } from "@/components/timer-panel";
import { TodoPanel } from "@/components/todo-panel";
import { CurrentTask, TagStat, initialTodos } from "@/lib/pomo-list";

export default function Home() {
  const [todos] = useState(initialTodos);
  const [activeTaskId] = useState<string | null>(null);
  const [tagStats] = useState<TagStat[]>([]);
  const currentTask: CurrentTask | null =
    todos.find((todo) => todo.id === activeTaskId) ?? null;

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

        <TimerPanel currentTask={currentTask} tagStats={tagStats} />
        <TodoPanel initialTodos={todos} />
      </section>
    </main>
  );
}
