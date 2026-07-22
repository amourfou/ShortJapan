"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { PrimaryButton } from "@/components/PrimaryButton";
import { useAuth } from "@/components/AuthProvider";

type Mode = "login" | "register";

const inputClass =
  "w-full rounded-2xl border border-white/15 bg-black/30 px-4 py-3 text-base text-white placeholder:text-slate-500 focus:border-sky-400 focus:outline-none focus:ring-1 focus:ring-sky-400";

export default function LoginPage() {
  const { login, register, user } = useAuth();
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("login");
  const [name, setName] = useState("");
  const [organization, setOrganization] = useState("");
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
    const result =
      mode === "login"
        ? await login(name)
        : await register(name, organization);
    setBusy(false);
    if (!result.ok) {
      setError(result.message ?? "실패했어요");
      return;
    }
    router.replace("/");
  };

  return (
    <div className="safe-pad mx-auto flex min-h-[100dvh] w-full max-w-md flex-col justify-center px-4">
      <div className="rounded-3xl border border-white/10 bg-white/10 p-6 shadow-xl backdrop-blur-sm">
        <p className="text-center text-sm font-medium text-sky-300">ShortJapan</p>
        <h1 className="mt-2 text-center text-2xl font-bold text-white">
          {mode === "login" ? "로그인" : "등록"}
        </h1>
        <p className="mt-2 text-center text-sm text-slate-300">
          {mode === "login"
            ? "이름으로 로그인하세요"
            : "이름과 소속을 입력해 계정을 만들어요"}
        </p>

        <div className="mt-5 grid grid-cols-2 gap-1 rounded-2xl bg-black/25 p-1">
          <button
            type="button"
            onClick={() => {
              setMode("login");
              setError("");
            }}
            className={[
              "rounded-xl py-2.5 text-sm font-semibold touch-manipulation transition",
              mode === "login"
                ? "bg-gradient-to-r from-sky-400 to-indigo-500 text-white"
                : "text-slate-300 hover:bg-white/5",
            ].join(" ")}
          >
            로그인
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("register");
              setError("");
            }}
            className={[
              "rounded-xl py-2.5 text-sm font-semibold touch-manipulation transition",
              mode === "register"
                ? "bg-gradient-to-r from-sky-400 to-indigo-500 text-white"
                : "text-slate-300 hover:bg-white/5",
            ].join(" ")}
          >
            등록
          </button>
        </div>

        <form onSubmit={onSubmit} className="mt-5 space-y-4">
          {mode === "register" && (
            <div>
              <label
                htmlFor="organization"
                className="mb-1.5 block text-sm font-medium text-slate-200"
              >
                소속
              </label>
              <input
                id="organization"
                value={organization}
                onChange={(e) => setOrganization(e.target.value)}
                maxLength={15}
                autoComplete="organization"
                placeholder="예: 가족, 학교…"
                className={inputClass}
                required
              />
              <p className="mt-1 text-right text-xs text-slate-500">
                {organization.length}/15
              </p>
            </div>
          )}

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
              placeholder={mode === "login" ? "이름 입력" : "사용할 이름"}
              className={inputClass}
              required
            />
            {mode === "register" && (
              <p className="mt-1 text-right text-xs text-slate-500">{name.length}/10</p>
            )}
          </div>

          {error && (
            <p className="rounded-xl bg-rose-500/15 px-3 py-2 text-sm text-rose-200">
              {error}
            </p>
          )}

          <PrimaryButton
            type="submit"
            disabled={
              busy ||
              !name.trim() ||
              (mode === "register" && !organization.trim())
            }
          >
            {busy
              ? mode === "login"
                ? "확인 중…"
                : "등록 중…"
              : mode === "login"
                ? "로그인"
                : "등록하고 시작"}
          </PrimaryButton>
        </form>
      </div>
    </div>
  );
}
