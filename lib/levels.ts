import type { LevelInfo } from "@/lib/types";

export const LEVELS: LevelInfo[] = [
  {
    id: "beginner",
    title: "초급",
    description: "히라가나 · 카타카나 글자 암기",
    href: "/beginner",
    available: true,
    accent: "from-sky-400 to-blue-500",
  },
  {
    id: "intermediate",
    title: "중급",
    description: "단어 읽고 뜻 맞추기",
    href: "/intermediate",
    available: true,
    accent: "from-violet-400 to-purple-500",
  },
  {
    id: "advanced",
    title: "고급",
    description: "문장 읽기 (준비중)",
    available: false,
    accent: "from-amber-400 to-orange-500",
  },
  {
    id: "native",
    title: "현지인",
    description: "한자 섞어 보기 (준비중)",
    available: false,
    accent: "from-rose-400 to-pink-500",
  },
];
