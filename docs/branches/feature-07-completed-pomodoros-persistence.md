# `feature/07-completed-pomodoros-persistence`

## 目的

- 画面の `Completed` 回数をリロード後も維持する
- 全体の完了回数とタグ別完了回数を一貫してリセットできるようにする

## このブランチで含めるもの

- `completedPomodoros` の `localStorage` 保存と復元
- 既存保存データからの移行
- 完了回数リセット操作での `completedPomodoros` と `tagStats` の同時クリア
- 保存内容と一致する説明文の更新

## 状態とデータの方針

- `completedPomodoros` はタスクの有無にかかわらず完了した Work の全体回数として扱う
- `tagStats` はタスクをセットした Work のタグ別集計として扱う
- 2 つの値は常に一致するとは限らないため、別々に保存する
- `completedPomodoros` がない既存データは、復元可能な記録である `tagStats` の合計値を初期値として移行する

## 完了条件

- Work 完了後の `Completed` 回数がリロード後も復元される
- タスク未設定で完了した Work も、以後の全体回数には保存される
- 完了回数リセット後に全体回数とタグ別集計がともに空状態へ反映される
- 旧形式の保存データを読み込んでも既存のタグ集計が失われない
- `npm run lint` が通る
