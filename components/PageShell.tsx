import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";

interface PageShellProps {
  title: string;
  subtitle?: string;
  backHref?: string;
  children: ReactNode;
}

export function PageShell({ title, subtitle, backHref, children }: PageShellProps) {
  return (
    <div className="safe-pad mx-auto flex min-h-[100dvh] w-full max-w-lg flex-col px-4 md:max-w-2xl">
      <header className="mb-5 flex items-start gap-3 pt-2">
        {backHref && (
          <Link
            href={backHref}
            className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-200 touch-manipulation hover:bg-white/10"
            aria-label="뒤로 가기"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
        )}
        <div className="min-w-0">
          <h1 className="text-xl font-bold text-white sm:text-2xl">{title}</h1>
          {subtitle && (
            <p className="mt-1 text-sm text-slate-300 text-balance">{subtitle}</p>
          )}
        </div>
      </header>
      <main className="flex flex-1 flex-col pb-6">{children}</main>
    </div>
  );
}
