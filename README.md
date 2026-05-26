# PomoFlowy

PomoFlowy は、ポモドーロタイマーと ToDo 管理をひとつにまとめた集中支援アプリです。  
「すぐに集中、しっかり記録」をテーマに、今やるタスクの明確化と作業回数の可視化を扱います。

## できること

- 25 分 `Work` / 5 分 `Break` のタイマー切り替え
- タスクの追加・編集・完了・削除
- 未完了タスクから現在の作業タスクをセット
- `Work` 完了時のタグ別完了回数の集計
- `localStorage` を使ったタスク・現在のタスク・統計の保存

## 画面構成

- `Timer Panel`: タイマー操作、現在のタスク表示、タグ別統計
- `Todo Management`: タスク追加、未完了 / 完了タスクの管理

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

README では全体像を案内し、ブランチごとの詳細仕様は `docs/` 配下に分離しています。
