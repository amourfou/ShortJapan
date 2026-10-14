# ShortJapan 프로젝트 노트

## 목적
초등 3학년 딸(약 9세)용 일본어 공부 PWA. 히라가나·카타카나 → 단어 → 문장 → 한자(현지인) 순으로 "짧게 보고 5초 안에 떠올리기" 연습과 20문제 4지선다 테스트를 해요.

## 스택
- Next.js 14.2.18 (App Router), TypeScript, Tailwind, pnpm 9.15
- Supabase (`@supabase/supabase-js`, **anon 키로 브라우저에서 직접 읽기/쓰기**)
- PWA: `@ducanh2912/next-pwa` (+ `worker/index.js` 푸시 핸들러, 오프라인 폴백 `/offline`)
- Web Push: `web-push` + VAPID, Vercel Cron
- 통계 그래프: recharts / 음성: 브라우저 Web Speech API(STT, `lib/speechRecognition.ts`)

## 구조
- `app/` 페이지: `/`(레벨 선택), `/login`, `/beginner`(글자), `/intermediate`(단어), `/advanced`·`/advanced/[stage]`(문장), `/native`(한자), 각 `practice`·`test`, `/stats`, `/offline`, `manifest.ts`
- `app/api/push/subscribe` (POST 구독 저장 / DELETE 삭제), `app/api/push/send` (POST 개인 테스트·cron 전체, GET cron)
- `components/`: TestQuiz, PracticeCard, CountdownTimer, PushNotifyCard, AuthProvider 등
- `lib/`: `supabase.ts`(클라이언트·타입), `auth.ts`(이름 로그인/가입), `db.ts`(설정·테스트 결과·오답 통계), `push.ts`/`pushClient.ts`, `testEngine.ts`, `practice.ts`, `kanaFilter.ts`, `data/*`(가나·단어·문장·한자 정적 데이터, 약 3천 줄)
- `scripts/`: 아이콘·VAPID 생성, 푸시 테스트

## 데이터 모델 (Supabase `tmavfy…` 프로젝트, genshin-guide·WordCatch·HaanRiver와 공유)
- `users`(공유): id, name, organization, high_score, is_admin, role… → **이름만 일치하면 로그인**, 가입도 anon insert
- `shortjapan_settings`(user_id, level, settings JSONB)
- `shortjapan_test_sessions`(score, total, correct_count, settings, played_at)
- `shortjapan_test_answers`(문항별 정답/오답 로그)
- `shortjapan_wrong_stats`(문항별 누적 오답 수, 약점 우선 출제용)
- `push_subscriptions`(공유, `app='shortjapan'`로 구분, endpoint/p256dh/auth/remind_hour_kst)
- RLS는 켜져 있지만 정책이 전부 `FOR ALL USING (true) WITH CHECK (true)` (스키마: `supabase-schema.sql`)
- 주의: 테이블 CHECK가 `level IN ('beginner','intermediate','advanced')`인데 코드는 `native` 레벨도 저장함

## 환경변수 (`.env.local`, 값은 기록하지 않음)
| 변수 | 사용 위치 |
|---|---|
| NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY | `lib/supabase.ts` (브라우저·API 공용) |
| NEXT_PUBLIC_VAPID_PUBLIC_KEY | `lib/pushClient.ts`, `lib/push.ts` |
| VAPID_PRIVATE_KEY, VAPID_SUBJECT | `lib/push.ts` (서버) |
| CRON_SECRET (없으면 PUSH_CRON_SECRET) | `app/api/push/send` 인증 |

## 배포
- GitHub `amourfou/ShortJapan` `main` push → Vercel 자동 배포. Vercel 프로젝트 `short-japan`, https://short-japan.vercel.app (README와 GitHub homepage 일치, 로컬 `.vercel` 링크는 없음)
- `vercel.json` 크론: 매일 10:00 UTC(19:00 KST) GET `/api/push/send` (Vercel이 `Authorization: Bearer CRON_SECRET` 자동 첨부)
- README의 "환경 변수: 없음"은 낡은 내용, 위 변수들이 Vercel에 있어야 함

## 실행
```bash
export COREPACK_HOME=$HOME/.cache/corepack
corepack pnpm install && corepack pnpm dev      # http://localhost:3000
corepack pnpm build                              # 2026-10-14 기준 성공
ENABLE_PWA_DEV=1 pnpm dev                        # 개발 모드에서 SW/푸시 테스트
```
- `pnpm lint`는 ESLint 설정이 없어서 대화형 설정 질문에서 멈춰요(.eslintrc 추가 필요)

## 보안 개편 (브랜치 `security/server-api`)
- 브라우저는 Supabase에 직접 접속하지 않아요. 모든 데이터는 `/api/*` → `lib/server/db.ts`(service role, server-only).
- 로그인: 이름 + 6자리 PIN (`/api/session`), HMAC 서명 HttpOnly 쿠키 `sj_session`(30일, PIN 바뀌면 무효), role은 요청마다 DB에서 읽음. 5번 틀리면 10분 잠금, IP당 10분 20회 실패 시 429.
- PIN은 관리자(`/api/admin/pin`) 또는 `node scripts/set-pin.mjs`(입력 숨김)로만 지정. PIN 없는 이름은 로그인 불가.
- 공개 가입은 `ALLOW_PUBLIC_SIGNUP=1`일 때만(기본 꺼짐).
- 푸시: 구독/발송 모두 세션 필요, 고정 템플릿과 같은 사이트 경로만. 크론은 `Authorization: Bearer CRON_SECRET`만.
- 새 환경변수: `SUPABASE_SERVICE_ROLE_KEY`, `SESSION_SECRET`(앱별 32바이트 랜덤). `PUSH_CRON_SECRET`은 더 이상 쓰지 않음.
