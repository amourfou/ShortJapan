import Link from "next/link";
import { BookOpen, Clock, Sparkles } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { INTERMEDIATE_WORDS } from "@/lib/data/words";

export default function IntermediateIntroPage() {
  return (
    <PageShell
      title="중급"
      subtitle="단어를 보고 5초 안에 뜻과 읽는 법을 떠올려 보세요"
      backHref="/"
    >
      <div className="flex flex-1 flex-col gap-6">
        <div className="rounded-3xl border border-white/10 bg-white/10 p-5">
          <p className="font-jp text-center text-4xl font-bold text-white">ねこ</p>
          <p className="mt-3 text-center text-sm text-slate-300">예시 · 타이머 후 정답 공개</p>
          <div className="mt-4 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-center">
            <p className="text-lg font-bold text-white">고양이</p>
            <p className="text-sm text-slate-300">읽는 법: 네코</p>
          </div>
        </div>

        <ul className="space-y-3 text-sm text-slate-200">
          <li className="flex items-start gap-3 rounded-2xl bg-black/20 px-4 py-3">
            <BookOpen className="mt-0.5 h-5 w-5 shrink-0 text-violet-300" />
            <span>
              단어 <strong className="text-white">{INTERMEDIATE_WORDS.length}개</strong>
              (동물, 가족, 색깔, 음식, 일상 등)
            </span>
          </li>
          <li className="flex items-start gap-3 rounded-2xl bg-black/20 px-4 py-3">
            <Clock className="mt-0.5 h-5 w-5 shrink-0 text-sky-300" />
            <span>5초 타이머 후 한국어 뜻과 발음이 나와요</span>
          </li>
          <li className="flex items-start gap-3 rounded-2xl bg-black/20 px-4 py-3">
            <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-amber-300" />
            <span>히라가나 · 카타카나 단어가 섞여 있어요</span>
          </li>
        </ul>

        <div className="mt-auto pt-2">
          <Link
            href="/intermediate/practice"
            className="inline-flex w-full min-h-12 touch-manipulation items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-sky-400 to-indigo-500 px-5 py-3.5 text-base font-semibold text-white shadow-lg shadow-indigo-500/30 transition hover:from-sky-300 hover:to-indigo-400 active:scale-[0.98]"
          >
            연습 시작
          </Link>
        </div>
      </div>
    </PageShell>
  );
}
