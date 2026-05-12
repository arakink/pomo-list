# `feature/05-localstorage-persistence`

## 目的

- リロード後も ToDo と集計結果を維持できるようにする
- active task の選択状態を復元できるようにする
- 永続化の責務を UI の polish から切り離して、安全に追加する

## このブランチで含めるもの

- `localStorage` を使った保存処理
- 初期表示時の保存データ読み込み
- `todos` の復元
- `activeTaskId` の復元
- `tagStats` の復元
- 読み込み失敗時のフォールバック
- 復元時の `activeTaskId` 整合性チェック

## 状態とデータの方針

- 保存対象は `todos` `activeTaskId` `tagStats` に絞る
- 保存用データは 1 つのオブジェクトにまとめて扱う
- 保存の起点は `app/page.tsx` に置く
- 復元時に `activeTaskId` の対象 ToDo が存在しない、または完了済みなら `null` に補正する
- 初回表示で保存データが壊れている場合は、既存の初期 state にフォールバックする

## 保存対象

- `todos`
- `activeTaskId`
- `tagStats`

## このブランチで保存しないもの

- `canSetActiveTask`
- `canClearActiveTask`
- `workSessionTask`
- `mode`
- `secondsLeft`
- `isRunning`
- `completedPomodoros`
- `isConfirmingBreakMove`
- `hasStartedCurrentWorkSession`

## 保存しない方針の理由

- `canSetActiveTask` と `canClearActiveTask` は timer 状態から再計算できる制御用 state
- `workSessionTask` は Work 中だけ意味を持つ一時的な固定先
- timer 内の state は進行中のセッション表現であり、閉じていた時間の扱いまで設計しないと自然に復元できない
- confirm 系の state は一時的な UI 状態なので、リロード後に復元すると不自然になりやすい

## 実装メモ

- `app/page.tsx` で初期化時に `localStorage` を読む
- state 更新後は `useEffect` で `localStorage` へ保存する
- 保存 key は branch 内で 1 つにまとめる
- 保存データの型を先に定義してから入出力を実装する
- JSON パース失敗時は例外で落とさず初期値へ戻す
- `activeTaskId` の補正は、読み込み時と通常動作時の両方で安全側に寄せる

## このブランチでやらないこと

- レスポンシブ調整
- 通知音
- 見た目の polish
- timer の途中状態復元
- バックグラウンド経過時間の反映
- `zustand` 導入

## 完了条件

- リロード後も `todos` が維持される
- リロード後も `tagStats` が維持される
- active task が有効な未完了 ToDo なら復元される
- 復元不能な `activeTaskId` は安全に `null` へ戻る
- 保存データが壊れていてもアプリが通常表示できる
- `npm run lint` が通る
