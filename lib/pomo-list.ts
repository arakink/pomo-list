export type Todo = {
  id: string;
  title: string;
  tag: string;
  completed: boolean;
};

export type CurrentTask = {
  title: string;
  tag: string;
};

export type TagStat = {
  tag: string;
  completedCount: number;
};

export function getTagStatLabel(tag: string) {
  const normalizedTag = tag.trim();

  return normalizedTag || "タグなし";
}

export const initialTodos: Todo[] = [
  {
    id: "todo-1",
    title: "朝会の前に進行メモを確認する",
    tag: "仕事",
    completed: false,
  },
  {
    id: "todo-2",
    title: "買い物リストを整理する",
    tag: "生活",
    completed: true,
  },
];
