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
    description: "상황별 단어 · 실제 일본에서 쓰기",
    href: "/intermediate",
    available: true,
    accent: "from-violet-400 to-purple-500",
  },
  {
    id: "advanced",
    title: "고급",
    description: "한자 3단계 · 표지·편의점·짧은 말",
    href: "/advanced",
    available: true,
    accent: "from-amber-400 to-orange-500",
  },
  {
    id: "native",
    title: "최고급",
    description: "문장 읽기 · 히라→카타→한자",
    href: "/native",
    available: true,
    accent: "from-rose-400 to-pink-500",
  },
];
