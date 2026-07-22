# ShortJapan — 일본어 글자 암기

아이들에게 히라가나·카타카나 발음과 단어를 암기시키는 모바일 우선 Next.js 앱입니다.

## 실행 방법

```bash
pnpm install
pnpm dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000) 으로 접속하세요.

## 기술 스택

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- pnpm

## 기능

| 레벨 | 내용 | 상태 |
|------|------|------|
| **초급** | 히라가나/카타카나 글자, 음차 필터, 5초 타이머 후 한국어 발음 | ✅ |
| **중급** | 단어, 5초 타이머 후 뜻·읽는 법 | ✅ |
| **고급** | 문장 | 준비중 |
| **현지인** | 한자 포함 | 준비중 |

### 초급 사용법

1. 히라가나 또는 카타카나 선택
2. 연습할 음차(아행, 카행 … 탁음·반탁음) 체크
3. 시작 → 글자가 나오면 5초 안에 발음을 떠올리기
4. 타이머 종료 후 한국어 발음 확인 → 다음

### 중급 사용법

1. 시작 → 단어 표시
2. 5초 안에 뜻 떠올리기
3. 한국어 뜻과 읽는 법 확인 → 다음

## Git

```bash
git init
git add .
git commit -m "Initial commit: ShortJapan beginner + intermediate"
# GitHub에서 빈 저장소 생성 후
git remote add origin https://github.com/<user>/ShortJapan.git
git branch -M main
git push -u origin main
```

## Vercel 배포

1. [Vercel](https://vercel.com) → Import Git Repository
2. Framework Preset: **Next.js**
3. Build Command: `pnpm build` (기본값으로 충분)
4. 환경 변수: 없음

배포 후 제공 URL로 핸드폰에서 확인하면 됩니다.
