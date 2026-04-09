import { TimerPanel } from "@/components/timer-panel";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col bg-[linear-gradient(180deg,#fff7ed_0%,#f8fafc_38%,#eef2ff_100%)] px-5 py-8 text-slate-950 sm:px-8 lg:px-12 lg:py-12">
      <section className="mx-auto flex w-full max-w-6xl flex-1 flex-col justify-center gap-8">
        <div className="max-w-2xl space-y-4">
          <p className="text-sm font-medium uppercase tracking-[0.34em] text-orange-700">
            Focus Fast, Track Clearly
          </p>
          <h1 className="text-4xl font-semibold tracking-[-0.05em] text-slate-950 sm:text-5xl">
            すぐに集中、しっかり記録するためのポモドーロタイマー。
          </h1>
          <p className="max-w-xl text-base leading-7 text-slate-600 sm:text-lg">
            最初のステップとして、PomoList の核になるタイマーユニットを実装しています。
            作業と休憩を切り替えながら、完了したポモドーロ数をここで積み上げます。
          </p>
        </div>

        <TimerPanel />
      </section>
    </main>
  );
}
