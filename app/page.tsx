import { LevelCard } from "@/components/LevelCard";
import { LEVELS } from "@/lib/levels";

export default function HomePage() {
  return (
    <div className="safe-pad mx-auto flex min-h-[100dvh] w-full max-w-lg flex-col px-4 py-6 md:max-w-2xl">
      <header className="mb-8 text-center">
        <p className="text-sm font-medium text-sky-300">아이와 함께 배우는 일본어</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
          ShortJapan
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-slate-300 text-balance">
          5초 안에 발음을 떠올려 보세요.
          <br className="sm:hidden" /> 히라가나 · 카타카나 암기 연습
        </p>
      </header>

      <section className="grid flex-1 gap-3 sm:grid-cols-2 sm:gap-4">
        {LEVELS.map((level) => (
          <LevelCard key={level.id} level={level} />
        ))}
      </section>

      <footer className="mt-8 pb-2 text-center text-xs text-slate-500">
        초급 · 중급 이용 가능 · 모바일 최적화
      </footer>
    </div>
  );
}
