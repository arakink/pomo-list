# PomoFlowy

PomoFlowy は、ポモドーロタイマーと ToDo 管理をひとつにまとめた集中支援アプリです。  
「すぐに集中、しっかり記録」をテーマに、今やるタスクの明確化と作業回数の可視化を扱います。

## できること

- 25 分 `Work` / 5 分 `Break` のタイマー切り替え
- タスクの追加・編集・完了・削除
- 未完了タスクから現在の作業タスクをセット
- `Work` 完了時のタグ別完了回数の集計
- `localStorage` を使ったタスク・現在のタスク・完了回数・統計の保存

## 画面構成

- `Timer Panel`: タイマー操作、現在のタスク表示、タグ別統計
- `Todo Management`: タスク追加、未完了 / 完了タスクの管理

## 機能詳細

### タイマー

- `Work` は 25 分、`Break` は 5 分で切り替わります
- 開始、停止、リセットができます
- `Work` を完了すると完了回数が加算されます
- 完了回数はリロード後も保持され、タグ別完了回数とまとめてリセットできます
- `Work` の途中で `Break` に移る場合は、そのセッションを完了として記録するか選べます

### Current Task

- 未完了タスクから現在の作業タスクを 1 件セットできます
- `Work` 中は作業タスクを固定し、切り替えや解除は `Break` 中に行います
- タスクが未設定のときは空状態メッセージを表示します
- タグ未設定タスクは `タグなし` として扱います

### Tag Stats

- `Work` 完了時に、現在の作業タスクのタグへ完了回数を加算します
- タグごとの回数を一覧で確認できます
- 集計がまだない場合は空状態を表示します
- 必要に応じて集計をリセットできます

### Todo Management

- タスク名とタグを入力して追加できます
- タスクの編集、完了、未完了への戻し、削除ができます
- 未完了 / 完了で分けて表示します
- 現在の作業タスクにセットできるのは未完了タスクのみです

### 保存

- ToDo、現在の作業タスク、完了回数、タグ集計を `localStorage` に保存します
- リロード後も前回の状態を復元します
- 保存データが不正な場合は安全な初期状態に戻します

## 技術スタック

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 4

## セットアップ

```bash
npm install
npm run dev
```

`http://localhost:3000` を開くと確認できます。

## スクリプト

- `npm run dev`: 開発サーバー起動
- `npm run lint`: ESLint 実行
- `npm run build`: 本番ビルド作成
- `npm run start`: 本番ビルド起動

## 開発の進め方

このリポジトリは、機能を段階的に積み上げる前提で設計しています。  
実装順と各フェーズの責務は、次のドキュメントを参照してください。

- `docs/implementation-plan.md`
- `docs/branches/`

ブランチ戦略:

1. `feature/01-timer-core`
2. `feature/02-todo-management`
3. `feature/03-current-task-and-stats`
4. `feature/04-timer-todo-integration`
5. `feature/05-localstorage-persistence`
6. `feature/06-polish-ui-feedback`
7. `feature/07-completed-pomodoros-persistence`

README では全体像を案内し、ブランチごとの詳細仕様は `docs/` 配下に分離しています。
