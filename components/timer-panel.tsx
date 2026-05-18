"use client";

import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { CurrentTask, TagStat, getTagStatLabel } from "@/lib/pomo-list";

const WORK_DURATION_SECONDS = 25 * 60;
const BREAK_DURATION_SECONDS = 5 * 60;

type TimerMode = "work" | "break";

const modeLabels: Record<TimerMode, string> = {
  work: "Work",
  break: "Break",
};

const modeDescriptions: Record<TimerMode, string> = {
  work: "ひと区切りの集中時間",
  break: "短いリセット時間",
};

function getDurationByMode(mode: TimerMode) {
  return mode === "work" ? WORK_DURATION_SECONDS : BREAK_DURATION_SECONDS;
}

function getNextMode(mode: TimerMode): TimerMode {
  return mode === "work" ? "break" : "work";
}

function formatTime(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (totalSeconds % 60).toString().padStart(2, "0");

  return `${minutes}:${seconds}`;
}

function getCurrentTaskDescription(currentTask: CurrentTask | null) {
  if (!currentTask) {
    return "未完了タスクからセットすると、ここに現在取り組むタスクが表示されます。";
  }

  if (!currentTask.tag.trim()) {
    return "このタスクにはタグがありません。完了回数は「タグなし」として集計されます。";
  }

  return "現在取り組むタスクです。\nWork完了時に、タグ別の完了回数に反映されます。";
}

function getCurrentTaskActionDescription(canClearActiveTask: boolean) {
  if (canClearActiveTask) {
    return "必要に応じて、ここから現在のタスク設定を解除できます。";
  }

  return "Work の進行中はタスクを固定しています。解除は Break に移ってから行えます。";
}

function getTagStatKey(tag: string) {
  return getTagStatLabel(tag);
}

function getTagStatsDescription(tagStats: TagStat[]) {
  if (tagStats.length === 0) {
    return "完了した作業はタグごとに集計されます。最初の1回が記録されると、ここから傾向を確認できます。";
  }

  return "Work を完了すると、現在のタスクのタグごとに回数が反映されます。必要になったらこの場で集計をリセットできます。";
}

type TimerPanelProps = {
  currentTask: CurrentTask | null;
  tagStats: TagStat[];
  canClearActiveTask: boolean;
  onBrowseIncompleteTodos: () => void;
  onWorkComplete: () => void;
  onWorkSessionStart: () => void;
  onResetTagStats: () => void;
  onActiveTaskAvailabilityChange: (canChange: boolean) => void;
  onActiveTaskClearAvailabilityChange: (canClear: boolean) => void;
  onClearActiveTask: () => void;
};

export function TimerPanel({
  currentTask,
  tagStats,
  canClearActiveTask,
  onBrowseIncompleteTodos,
  onWorkComplete,
  onWorkSessionStart,
  onResetTagStats,
  onActiveTaskAvailabilityChange,
  onActiveTaskClearAvailabilityChange,
  onClearActiveTask,
}: TimerPanelProps) {
  const [mode, setMode] = useState<TimerMode>("work");
  const [secondsLeft, setSecondsLeft] = useState(WORK_DURATION_SECONDS);
  const [isRunning, setIsRunning] = useState(false);
  const [completedPomodoros, setCompletedPomodoros] = useState(0);
  const [isConfirmingBreakMove, setIsConfirmingBreakMove] = useState(false);
  const [isConfirmingStatsReset, setIsConfirmingStatsReset] = useState(false);
  const [hasStartedCurrentWorkSession, setHasStartedCurrentWorkSession] =
    useState(false);
  const intervalRef = useRef<number | null>(null);
  const defaultTitleRef = useRef<string>("");
  const secondsLeftRef = useRef(WORK_DURATION_SECONDS);
  const modeRef = useRef<TimerMode>("work");
  const activeTaskAvailabilityRef = useRef<boolean | null>(null);
  const activeTaskClearAvailabilityRef = useRef<boolean | null>(null);
  const nextMode = getNextMode(mode);
  const canStart = secondsLeft > 0;
  const hasCurrentTask = currentTask !== null;
  const hasCurrentTaskTag = Boolean(currentTask?.tag.trim());
  const hasTagStats = tagStats.length > 0;

  const clearRunningTimer = () => {
    if (intervalRef.current !== null) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const switchMode = (nextMode: TimerMode) => {
    clearRunningTimer();
    setMode(nextMode);
    setSecondsLeft(getDurationByMode(nextMode));
    setIsRunning(false);
    setHasStartedCurrentWorkSession(false);
  };

  const moveWorkToBreak = (shouldCountAsCompleted: boolean) => {
    if (shouldCountAsCompleted) {
      setCompletedPomodoros((count) => count + 1);
      onWorkComplete();
    }

    setIsConfirmingBreakMove(false);
    switchMode("break");
  };

  useEffect(() => {
    defaultTitleRef.current = document.title;
  }, []);

  useEffect(() => {
    secondsLeftRef.current = secondsLeft;
  }, [secondsLeft]);

  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);

  useEffect(() => {
    if (!isRunning) {
      document.title = defaultTitleRef.current;
      return;
    }

    document.title = `${formatTime(secondsLeft)} | ${modeLabels[mode]} | ${defaultTitleRef.current}`;

    return () => {
      document.title = defaultTitleRef.current;
    };
  }, [isRunning, mode, secondsLeft]);

  useEffect(() => {
    if (!isRunning) {
      clearRunningTimer();
      return;
    }

    clearRunningTimer();

    intervalRef.current = window.setInterval(() => {
      const nextSeconds = Math.max(secondsLeftRef.current - 1, 0);
      secondsLeftRef.current = nextSeconds;
      setSecondsLeft(nextSeconds);

      if (nextSeconds === 0) {
        clearRunningTimer();
        setIsRunning(false);

        if (modeRef.current === "work") {
          setCompletedPomodoros((count) => count + 1);
          onWorkComplete();
        }
      }
    }, 1000);

    return clearRunningTimer;
  }, [isRunning, mode, onWorkComplete]);

  useEffect(() => {
    const isReadyToStartWork =
      mode === "work" &&
      !isRunning &&
      !hasStartedCurrentWorkSession &&
      secondsLeft === WORK_DURATION_SECONDS;
    const canChangeActiveTask = mode === "break" || isReadyToStartWork;
    const canClearActiveTask = mode === "break" || isReadyToStartWork;

    if (activeTaskAvailabilityRef.current !== canChangeActiveTask) {
      activeTaskAvailabilityRef.current = canChangeActiveTask;
      onActiveTaskAvailabilityChange(canChangeActiveTask);
    }

    if (activeTaskClearAvailabilityRef.current !== canClearActiveTask) {
      activeTaskClearAvailabilityRef.current = canClearActiveTask;
      onActiveTaskClearAvailabilityChange(canClearActiveTask);
    }
  }, [
    hasStartedCurrentWorkSession,
    isRunning,
    mode,
    onActiveTaskAvailabilityChange,
    onActiveTaskClearAvailabilityChange,
    secondsLeft,
  ]);

  const handleModeChange = (nextMode: TimerMode) => {
    const hasStartedWorkSession =
      mode === "work" &&
      nextMode === "break" &&
      secondsLeft > 0 &&
      secondsLeft < WORK_DURATION_SECONDS;

    if (hasStartedWorkSession) {
      setIsConfirmingBreakMove(true);
      return;
    }

    setIsConfirmingBreakMove(false);
    switchMode(nextMode);
  };

  const handleReset = () => {
    clearRunningTimer();
    setSecondsLeft(getDurationByMode(mode));
    setIsRunning(false);
  };

  const handleConfirmStatsReset = () => {
    onResetTagStats();
    setIsConfirmingStatsReset(false);
  };

  const handleStartPause = () => {
    if (isRunning) {
      clearRunningTimer();
      setIsRunning(false);
      return;
    }

    if (!canStart) {
      return;
    }

    const isStartingFreshWorkSession =
      mode === "work" &&
      secondsLeft === WORK_DURATION_SECONDS &&
      !hasStartedCurrentWorkSession;

    if (isStartingFreshWorkSession) {
      onWorkSessionStart();
      setHasStartedCurrentWorkSession(true);
    }

    setIsRunning(true);
  };

  return (
    <section className="mx-auto w-full max-w-4xl rounded-[2rem] border border-white/60 bg-white/80 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.12)] backdrop-blur md:p-10">
      <div className="grid gap-8 lg:grid-cols-[1.45fr_0.85fr] lg:items-center">
        <div className="space-y-8">
          <div className="space-y-4">
            <p className="text-sm font-medium uppercase tracking-[0.32em] text-orange-700">
              PomoList Timer
            </p>
            <div className="flex flex-wrap gap-3">
              {(["work", "break"] as TimerMode[]).map((item) => {
                const isActive = item === mode;

                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => handleModeChange(item)}
                    aria-pressed={isActive}
                    className={`rounded-full border px-5 py-2 text-sm font-semibold transition ${
                      isActive
                        ? "border-slate-900 bg-slate-900 text-white"
                        : "border-slate-300 bg-white text-slate-700 hover:border-slate-500"
                    }`}
                  >
                    {modeLabels[item]}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="rounded-[1.75rem] bg-[radial-gradient(circle_at_top,#fff7ed,transparent_55%),linear-gradient(135deg,#0f172a,#1e293b)] px-6 py-8 text-white shadow-inner sm:px-10 sm:py-12">
            <p className="text-sm uppercase tracking-[0.3em] text-orange-200">
              {modeLabels[mode]}
            </p>
            <div className="mt-4 font-mono text-[4.5rem] font-semibold leading-none tracking-[-0.08em] sm:text-[6.5rem]">
              {formatTime(secondsLeft)}
            </div>
            <p className="mt-4 max-w-sm text-sm leading-6 text-slate-300">
              {modeDescriptions[mode]}。終了時に手動で次のモードへ切り替えます。
            </p>
            <p className="mt-3 max-w-sm text-xs leading-5 text-slate-400">
              Work を始めるとタスクは固定されます。切り替えは Break に移ってから行います。
            </p>
          </div>

          <div className="grid gap-3 sm:flex sm:flex-wrap">
            <button
              type="button"
              onClick={handleStartPause}
              disabled={!isRunning && !canStart}
              className="min-w-36 rounded-full bg-orange-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:bg-orange-300"
            >
              {isRunning ? "Pause" : "Start"}
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="min-w-36 rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-500"
            >
              Reset
            </button>
            <button
              type="button"
              onClick={() => handleModeChange(nextMode)}
              className="min-w-36 rounded-full border border-slate-900 bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              {mode === "work" ? "Breakに移行" : "Workに移行"}
            </button>
          </div>
        </div>

        <aside className="grid gap-4 rounded-[1.75rem] bg-slate-950 p-6 text-white sm:grid-cols-2 lg:grid-cols-1">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
              Current Mode
            </p>
            <p className="text-2xl font-semibold">{modeLabels[mode]}</p>
          </div>
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
              Completed
            </p>
            <p className="text-5xl font-semibold tracking-[-0.06em]">
              {completedPomodoros}
            </p>
            <p className="text-sm text-slate-400">
              作業セッションを完了するたびに加算されます。
            </p>
          </div>
        </aside>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
        <section className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5 sm:p-6">
          <h2 className="text-xs font-medium uppercase tracking-[0.24em] text-slate-500">
            Current Task
          </h2>
          <div className="mt-3 space-y-5">
            <p
              className={`text-2xl font-semibold tracking-[-0.04em] sm:text-[2rem] ${
                hasCurrentTask ? "text-slate-950" : "text-slate-400"
              }`}
            >
              {hasCurrentTask ? currentTask.title : "未設定"}
            </p>
            {hasCurrentTask ? (
              hasCurrentTaskTag ? (
                <span className="inline-flex w-fit rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
                  {currentTask.tag}
                </span>
              ) : (
                <span className="inline-flex w-fit rounded-full border border-dashed border-slate-300 bg-white px-3 py-1 text-xs font-semibold text-slate-500">
                  タグなし
                </span>
              )
            ) : (
              <div className="space-y-5">
                <div>
                  <Button
                    onClick={onBrowseIncompleteTodos}
                    variant="default"
                    className="h-11 rounded-2xl bg-emerald-600 px-5 text-sm font-semibold text-white shadow-[0_14px_30px_rgba(16,185,129,0.18)] hover:bg-emerald-700"
                  >
                    タスクを選ぶ
                  </Button>
                </div>
              </div>
            )}
            <p className="text-sm leading-6 whitespace-pre-line text-slate-600">
              {hasCurrentTask
                ? getCurrentTaskDescription(currentTask)
                : "選択したタスクがここに表示されます。"}
            </p>
            {hasCurrentTask ? (
              <div className="space-y-3 pt-1">
                <button
                  type="button"
                  onClick={onClearActiveTask}
                  disabled={!canClearActiveTask}
                  className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-500 hover:bg-slate-50 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400"
                >
                  セットを解除
                </button>
                <p className="text-xs leading-5 text-slate-500">
                  {getCurrentTaskActionDescription(canClearActiveTask)}
                </p>
              </div>
            ) : null}
          </div>
        </section>

        <section className="rounded-[1.5rem] bg-white p-5 ring-1 ring-slate-900/8 sm:p-6">
          <div className="space-y-2">
            <h2 className="text-xs font-medium uppercase tracking-[0.24em] text-slate-500">
              Tag Stats
            </h2>
            <p className="text-2xl font-semibold tracking-[-0.04em] text-slate-950 sm:text-[2rem]">
              タグ別の完了回数
            </p>
          </div>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            {getTagStatsDescription(tagStats)}
          </p>

          {hasTagStats ? (
            <ul className="mt-5 space-y-3">
              {tagStats.map((stat) => {
                const normalizedTagLabel = getTagStatLabel(stat.tag);

                return (
                  <li
                    key={getTagStatKey(stat.tag)}
                    className="flex items-center justify-between border-t border-slate-200 px-1 py-4 first:border-t-0 first:pt-0 last:pb-0"
                  >
                    <div className="flex items-center gap-3">
                      <span className="inline-flex rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-800">
                        {normalizedTagLabel}
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-semibold tracking-[-0.05em] text-slate-950">
                        {stat.completedCount}
                      </p>
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                        completed
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-5">
              <p className="text-sm font-semibold text-slate-700">まだ集計はありません</p>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                タスクをセットした状態で Work を完了すると、タグごとの回数がここに並びます。
              </p>
            </div>
          )}

          <div className="mt-6 flex justify-end border-t border-slate-200 pt-4">
            <Button
              onClick={() => setIsConfirmingStatsReset(true)}
              disabled={!hasTagStats}
              variant="ghost"
              className="h-auto rounded-xl px-2 py-1.5 text-sm font-medium text-slate-500 shadow-none hover:bg-slate-100 hover:text-rose-600 disabled:bg-transparent disabled:text-slate-300"
            >
              完了回数をリセット
            </Button>
          </div>
        </section>
      </div>

      {isConfirmingBreakMove ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 px-5">
          <div className="w-full max-w-md rounded-[1.5rem] bg-white p-6 shadow-[0_24px_80px_rgba(15,23,42,0.24)]">
            <p className="text-sm font-medium uppercase tracking-[0.28em] text-orange-700">
              Work Session
            </p>
            <h2 className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-slate-950">
              この Work をどう記録しますか？
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Break に移行する前に、このセッションを完了として記録するか選択してください。
            </p>
            <div className="mt-6 grid gap-3">
              <button
                type="button"
                onClick={() => moveWorkToBreak(true)}
                className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                完了として記録して Break へ
              </button>
              <button
                type="button"
                onClick={() => moveWorkToBreak(false)}
                className="rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-500"
              >
                未完了のまま Break へ
              </button>
              <button
                type="button"
                onClick={() => setIsConfirmingBreakMove(false)}
                className="rounded-full px-5 py-3 text-sm font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
              >
                キャンセル
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {isConfirmingStatsReset ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 px-5">
          <div className="w-full max-w-md rounded-[1.5rem] bg-white p-6 shadow-[0_24px_80px_rgba(15,23,42,0.24)]">
            <p className="text-sm font-medium uppercase tracking-[0.28em] text-orange-700">
              Tag Stats
            </p>
            <h2 className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-slate-950">
              集計をリセットしますか？
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              保存済みのタグ別完了回数をすべてクリアします。ToDo 自体は削除されません。
            </p>
            <div className="mt-6 grid gap-3">
              <button
                type="button"
                onClick={handleConfirmStatsReset}
                className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                リセットする
              </button>
              <button
                type="button"
                onClick={() => setIsConfirmingStatsReset(false)}
                className="rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-500"
              >
                キャンセル
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
