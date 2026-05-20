# PomoFlowy Implementation Plan

## Overview

PomoFlowy is a web app built around the concept:

> "すぐに集中、しっかり記録"
ユーザーは ToDo を管理しつつ、ポモドーロタイマーで集中時間を記録できます。タグ付けと統計機能もあり、どのタスクにどれだけ時間を使ったかが一目でわかります。

## Branch Strategy

1. `feature/01-timer-core`
2. `feature/02-todo-management`
3. `feature/03-current-task-and-stats`
4. `feature/04-timer-todo-integration`
5. `feature/05-localstorage-persistence`
6. `feature/06-polish-ui-feedback`

## Implementation Steps

### `feature/01-timer-core`

タイマー単体を完成させる。25/5 の切替、開始・停止・リセット、完了カウンターまで。ここでは ToDo 連携は入れない。

### `feature/02-todo-management`

ToDo 管理の土台を作る。追加、完了切替、タグ管理、一覧表示までを実装し、タイマー連携はまだ入れない。

詳細: [feature-02-todo-management.md](./branches/feature-02-todo-management.md)

### `feature/03-current-task-and-stats`

タイマー下に「現在のタスク名・タグ表示」と「タグ別完了回数の統計表示」を追加する。まだ ToDo からのセットはせず、仮データまたは空状態を扱えるようにする。

### `feature/04-timer-todo-integration`

ToDo の「セット」ボタンで active task をタイマーへ連携し、作業完了時にそのタスクとタグへ回数加算する。ここが機能的な本体。

詳細: [feature-04-timer-todo-integration.md](./branches/feature-04-timer-todo-integration.md)

### `feature/05-localstorage-persistence`

`localStorage` 保存を追加する。ToDo、active task、統計など、アプリ利用の継続に必要な状態をリロード後も復元できるようにする。

詳細: [feature-05-localstorage-persistence.md](./branches/feature-05-localstorage-persistence.md)

### `feature/06-polish-ui-feedback`

機能本体と永続化の挙動が固まったあとに、UI の polish をまとめて調整する。Tag Stats の集計リセット、文言整合、空状態やボタン状態の改善、モバイル時の見やすさ改善をこの段階で扱う。

詳細: [feature-06-polish-ui-feedback.md](./branches/feature-06-polish-ui-feedback.md)
