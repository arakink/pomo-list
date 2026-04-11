"use client";

import { useEffect, useState } from "react";

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

export function TimerPanel() {
  const [mode, setMode] = useState<TimerMode>("work");
  const [secondsLeft, setSecondsLeft] = useState(WORK_DURATION_SECONDS);
  const [isRunning, setIsRunning] = useState(false);
  const [completedPomodoros, setCompletedPomodoros] = useState(0);
  const nextMode = getNextMode(mode);
  const canStart = secondsLeft > 0;

  useEffect(() => {
    if (!isRunning) {
      return;
    }

    const intervalId = window.setInterval(() => {
      setSecondsLeft((currentSeconds) => {
        if (currentSeconds === 1) {
          window.clearInterval(intervalId);
          setIsRunning(false);

          if (mode === "work") {
            setCompletedPomodoros((count) => count + 1);
          }

          return 0;
        }

        return currentSeconds - 1;
      });
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [isRunning, mode]);

  const handleModeChange = (nextMode: TimerMode) => {
    setMode(nextMode);
    setSecondsLeft(getDurationByMode(nextMode));
    setIsRunning(false);
  };

  const handleReset = () => {
    setSecondsLeft(getDurationByMode(mode));
    setIsRunning(false);
  };

  const handleStartPause = () => {
    if (isRunning) {
      setIsRunning(false);
      return;
    }

    if (!canStart) {
      return;
    }

    setIsRunning(true);
  };

  return (
    <section className="w-full max-w-4xl rounded-[2rem] border border-white/60 bg-white/80 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.12)] backdrop-blur md:p-10">
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
          </div>

          <div className="flex flex-wrap gap-3">
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

        <aside className="grid gap-4 rounded-[1.75rem] bg-slate-950 p-6 text-white md:grid-cols-2 lg:grid-cols-1">
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
    </section>
  );
}
