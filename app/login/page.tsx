"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { PrimaryButton } from "@/components/PrimaryButton";
import { useAuth } from "@/components/AuthProvider";

export default function LoginPage() {
  const { login, user } = useAuth();
  const router = useRouter();
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  if (user) {
    router.replace("/");
    return null;
  }

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    const result = await login(name);
    setBusy(false);
    if (!result.ok) {
      setError(result.message ?? "로그인 실패");
      return;
    }
    router.replace("/");
  };

  return (
    <div className="safe-pad mx-auto flex min-h-[100dvh] w-full max-w-md flex-col justify-center px-4">
      <div className="rounded-3xl border border-white/10 bg-white/10 p-6 shadow-xl backdrop-blur-sm">
        <p className="text-center text-sm font-medium text-sky-300">ShortJapan</p>
        <h1 className="mt-2 text-center text-2xl font-bold text-white">로그인</h1>
        <p className="mt-2 text-center text-sm text-slate-300">
          HaanRiver / 공유 DB의 <strong className="text-white">users</strong> 테이블에
          등록된 이름만 접속할 수 있어요.
        </p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-slate-200">
              이름
            </label>
            <input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={10}
              autoComplete="username"
              placeholder="등록된 이름 입력"
              className="w-full rounded-2xl border border-white/15 bg-black/30 px-4 py-3 text-base text-white placeholder:text-slate-500 focus:border-sky-400 focus:outline-none focus:ring-1 focus:ring-sky-400"
              required
            />
          </div>

          {error && (
            <p className="rounded-xl bg-rose-500/15 px-3 py-2 text-sm text-rose-200">{error}</p>
          )}

          <PrimaryButton type="submit" disabled={busy || !name.trim()}>
            {busy ? "확인 중…" : "로그인"}
          </PrimaryButton>
        </form>
      </div>
    </div>
  );
}
