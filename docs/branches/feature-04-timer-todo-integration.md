# `feature/04-timer-todo-integration`

## 目的

- ToDo から現在のタスクをタイマーへセットできる
- タイマー下の `Current Task` を実データで表示できる
- Work 完了時に、現在のタスクのタグへ完了回数を加算できる
- ToDo 管理とタイマー表示をひとつの流れとしてつなげる

## このブランチで含めるもの

- ToDo 一覧から現在のタスクをセットする操作
- `Current Task` 表示への active task 反映
- `Tag Stats` 表示への実データ反映
- Work 自然完了時のタグ別完了回数加算
- Work 途中から `Break` へ移る際に「完了として記録して Break へ」を選んだ場合の回数加算
- `TodoPanel` と `TimerPanel` の共有 state 化

## UI の想定

- 未完了タスク一覧の各 ToDo に `セット` ボタンを置く
- 現在セット中のタスクが分かる見せ方を用意する
- `Current Task` セクションは選択中のタスク名とタグを表示する
- `Tag Stats` セクションはタグ別の完了回数を表示する
- タグが空のタスクは `タグなし` として扱う

## 状態とデータの方針

- `todos` は親コンポーネントで持つ
- active task は `id` で管理し、表示時に ToDo 一覧から参照する
- タグ別完了回数はタグ名をキーにした state で管理する
- この段階でも永続化は行わず、メモリ上の state 管理に留める

## 操作方針

- `Current Task` セクションは引き続き表示専用とする
- active task の選択は `TodoPanel` からのみ行う
- 完了回数の加算契機は Work 完了時のみとする
- Break 完了時にはタグ集計を加算しない
- タイマー完了によって ToDo を自動で完了状態にはしない

## 実装メモ

- まず `TodoPanel` と `TimerPanel` に分散している state を親へ持ち上げる
- `TimerPanel` の mock データは廃止し、props で `currentTask` と `tagStats` を受け取る
- Work 完了時の処理は自然完了と手動での完了記録で重複なく加算されるよう整理する
- active task に紐づく ToDo が削除された場合の扱いは安全側で `未設定` に戻す

## このブランチでやらないこと

- `Current Task` から直接タスクを編集する操作
- タイマー完了に合わせた ToDo の自動完了
- `localStorage` 保存
- 通知や効果音
- レスポンシブ調整中心の polish

## 完了条件

- 未完了タスクから任意の ToDo を active task としてセットできる
- `Current Task` にセット済みのタスク名とタグが表示される
- active task がない場合は `未設定` 表示を維持できる
- Work を完了すると active task のタグ別回数が `Tag Stats` に反映される
- タグが空のタスクでも `タグなし` として自然に集計される
- ToDo 管理、タイマー、統計表示が同じ state を参照して動作する
