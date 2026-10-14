"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { PrimaryButton } from "@/components/PrimaryButton";
import { PinPad } from "@/components/PinPad";
import { useAuth } from "@/components/AuthProvider";
import { getLastName } from "@/lib/auth";

type Step = "name" | "pin" | "register";

const inputClass =
  "w-full rounded-2xl border border-white/15 bg-black/30 px-4 py-4 text-2xl text-white placeholder:text-slate-500 focus:border-sky-400 focus:outline-none focus:ring-1 focus:ring-sky-400";

export default function LoginPage() {
  const { login, register, signupEnabled } = useAuth();
  const [step, setStep] = useState<Step>("name");
  const [name, setName] = useState("");
  const [organization, setOrganization] = useState("");
  const [regPin, setRegPin] = useState("");
  const [message, setMessage] = useState("");
  const [locked, setLocked] = useState(false);
  const [busy, setBusy] = useState(false);
  const [resetKey, setResetKey] = useState(0);
  const [shake, setShake] = useState(false);

  useEffect(() => {
    const last = getLastName();
    if (last) {
      setName(last);
      setStep("pin");
    }
  }, []);

  const onPin = useCallback(
    async (pin: string) => {
      setBusy(true);
      setMessage("");
      const r = await login(name, pin);
      setBusy(false);
      if (r.ok) return; // AuthProvider redirects to "/"
      setResetKey((k) => k + 1);
      setShake(true);
      setTimeout(() => setShake(false), 450);
      if (r.code === "locked" || r.code === "rate_limited") {
        setLocked(true);
        setMessage("조금 쉬었다가 다시 해요. 잘 모르겠으면 엄마·아빠에게 물어봐요 🙂");
      } else if (r.code === "no_pin") {
        setLocked(true);
        setMessage("아직 비밀 숫자가 없어요. 엄마·아빠에게 받아 와요 🙂");
      } else if (r.code === "wrong") {
        setMessage("앗, 다시 해 볼까? 🙂");
      } else if (r.code === "network") {
        setMessage("인터넷이 잠깐 안 돼요. 다시 눌러 볼까?");
      } else {
        setMessage("잠깐 문제가 생겼어요. 조금 뒤에 다시 해 봐요.");
      }
    },
    [login, name]
  );

  const onRegister = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const r = await register(name, organization, regPin);
    setBusy(false);
    if (!r.ok) setMessage(r.message ?? "등록하지 못했어요.");
  };

  return (
    <div className="safe-pad mx-auto flex min-h-[100dvh] w-full max-w-md flex-col justify-center px-4">
      <div className="rounded-3xl border border-white/10 bg-white/10 p-6 shadow-xl backdrop-blur-sm">
        <p className="text-center text-base font-medium text-sky-300">ShortJapan</p>

        {step === "name" && (
          <form
            className="mt-4 space-y-5"
            onSubmit={(e) => {
              e.preventDefault();
              if (name.trim()) {
                setMessage("");
                setLocked(false);
                setStep("pin");
              }
            }}
          >
            <h1 className="text-center text-3xl font-bold text-white">이름이 뭐예요?</h1>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={10}
              autoComplete="username"
              placeholder="이름"
              className={inputClass}
              autoFocus
            />
            <PrimaryButton type="submit" disabled={!name.trim()}>
              다음 ➜
            </PrimaryButton>
            {signupEnabled && (
              <button type="button" className="w-full py-3 text-base text-slate-300 underline" onClick={() => setStep("register")}>
                처음이에요 (등록)
              </button>
            )}
          </form>
        )}

        {step === "pin" && (
          <div className="mt-4">
            <h1 className="text-center text-3xl font-bold text-white">{name} 👋</h1>
            <p className="mb-6 mt-2 text-center text-lg text-slate-200">비밀 숫자 6개를 눌러요</p>
            <PinPad length={6} onComplete={onPin} disabled={busy || locked} resetKey={resetKey} shake={shake} />
            {message && (
              <p className={["mt-5 rounded-2xl px-4 py-3 text-center text-lg", locked ? "bg-amber-500/20 text-amber-100" : "bg-rose-500/15 text-rose-100"].join(" ")}>
                {message}
              </p>
            )}
            {locked && (
              <button type="button" className="mt-3 w-full py-3 text-base text-sky-300 underline" onClick={() => setLocked(false)}>
                다시 해 보기
              </button>
            )}
            <button
              type="button"
              className="mt-4 w-full py-3 text-base text-slate-400 underline"
              onClick={() => {
                setStep("name");
                setMessage("");
                setLocked(false);
              }}
            >
              내 이름이 아니에요
            </button>
          </div>
        )}

        {step === "register" && signupEnabled && (
          <form onSubmit={onRegister} className="mt-4 space-y-4">
            <h1 className="text-center text-2xl font-bold text-white">등록</h1>
            <input value={name} onChange={(e) => setName(e.target.value)} maxLength={10} placeholder="이름" className={inputClass} required />
            <input value={organization} onChange={(e) => setOrganization(e.target.value)} maxLength={15} placeholder="소속 (예: 가족)" className={inputClass} required />
            <input
              value={regPin}
              onChange={(e) => setRegPin(e.target.value.replace(/\D/g, "").slice(0, 6))}
              inputMode="numeric"
              autoComplete="one-time-code"
              type="password"
              placeholder="PIN 6자리"
              className={inputClass}
              required
            />
            {message && <p className="rounded-xl bg-rose-500/15 px-3 py-2 text-base text-rose-200">{message}</p>}
            <PrimaryButton type="submit" disabled={busy || !name.trim() || !organization.trim() || regPin.length !== 6}>
              등록하고 시작
            </PrimaryButton>
            <button type="button" className="w-full py-3 text-base text-slate-400 underline" onClick={() => setStep("name")}>
              돌아가기
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
