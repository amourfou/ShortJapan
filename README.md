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

nextLotto와 **동일한 GitHub 계정**을 사용합니다.

| 항목 | 값 |
|------|-----|
| GitHub 계정 | `amourfou` |
| Git user | `amourfou` / `amour_fou@hanmail.net` |
| 원격 저장소 (권장) | `https://github.com/amourfou/ShortJapan.git` |
| 기본 브랜치 | `main` |
| Vercel 팀 (참고) | `amourfous-projects` (예: haan-river 등) |

로컬 커밋은 이미 되어 있습니다. GitHub에서 빈 저장소 `ShortJapan` 생성 후:

```bash
git remote add origin https://github.com/amourfou/ShortJapan.git
git push -u origin main
```

참고 프로젝트 remote: `https://github.com/amourfou/next-lotto.git`

## Vercel 배포

nextLotto와 같이 Vercel에 연결합니다.

1. [Vercel](https://vercel.com) → Import Git Repository
2. `amourfou/ShortJapan` 선택
3. Framework Preset: **Next.js**, Build: `pnpm build`
4. 환경 변수: **없음** (DB/API 미사용)

### 배포 URL

**https://short-japan.vercel.app/**

`main` 브랜치에 push하면 Vercel이 자동으로 다시 빌드·배포합니다.
