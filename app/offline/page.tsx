import Link from "next/link";

export default function OfflinePage() {
  return (
    <main className="safe-pad mx-auto flex min-h-[100dvh] w-full max-w-lg flex-col items-center justify-center px-6 text-center">
      <p className="text-5xl font-bold text-sky-300" aria-hidden>
        あ
      </p>
      <h1 className="mt-4 text-2xl font-bold text-white">오프라인이에요</h1>
      <p className="mt-2 text-sm leading-relaxed text-slate-400">
        인터넷 연결을 확인한 뒤 다시 시도해 주세요.
      </p>
      <Link
        href="/"
        className="mt-8 rounded-xl border border-sky-400/40 bg-sky-500/20 px-5 py-3 text-sm font-semibold text-sky-100 touch-manipulation hover:bg-sky-500/30"
      >
        홈으로 돌아가기
      </Link>
    </main>
  );
}
