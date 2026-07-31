import type { KanjiItem, KanjiReading, KanjiStageId, KanjiStageInfo } from "@/lib/types";

/** 3 kid-friendly stages for advanced kanji track. */
export const KANJI_STAGES: KanjiStageInfo[] = [
  {
    id: "1",
    step: 1,
    title: "1단계",
    subtitle: "길·표지",
    emoji: "🪧",
    description: "입구·출구·화장실처럼 길에서 보는 한자예요",
    accent: "from-amber-400 to-orange-500",
  },
  {
    id: "2",
    step: 2,
    title: "2단계",
    subtitle: "편의점·식품",
    emoji: "🍙",
    description: "음료·유통기한처럼 먹을 때 보는 한자예요",
    accent: "from-orange-400 to-rose-500",
  },
  {
    id: "3",
    step: 3,
    title: "3단계",
    subtitle: "짧은 말",
    emoji: "📘",
    description: "한자가 이어진 짧은 말을 읽어 봐요",
    accent: "from-rose-400 to-pink-500",
  },
];

export function getKanjiStage(id: string): KanjiStageInfo | undefined {
  return KANJI_STAGES.find((s) => s.id === id);
}

export function isKanjiStageId(id: string): id is KanjiStageId {
  return id === "1" || id === "2" || id === "3";
}

type Ex = { word: string; readingJa: string; readingKo: string; meaningKo: string };

function on(ja: string, ko: string, ex?: Ex): KanjiReading {
  return ex ? { ja, ko, example: ex } : { ja, ko };
}

function kun(ja: string, ko: string, ex?: Ex): KanjiReading {
  return ex ? { ja, ko, example: ex } : { ja, ko };
}

/**
 * readingKo = 테스트·말하기 기본 정답 (한국어)
 * onYomi / kunYomi = 히라가나 + 한국어 + 예시
 */
export const KANJI_ITEMS: KanjiItem[] = [
  // ─── 1단계 ───
  {
    id: "k-in",
    char: "入",
    readingKo: "이리",
    meaningKo: "들어가다",
    stage: "1",
    onYomi: [
      on("にゅう", "뉴", {
        word: "入学",
        readingJa: "にゅうがく",
        readingKo: "뉴가쿠",
        meaningKo: "입학",
      }),
    ],
    kunYomi: [
      kun("はい", "하이", {
        word: "入る",
        readingJa: "はいる",
        readingKo: "하이루",
        meaningKo: "들어가다",
      }),
      kun("い", "이", {
        word: "入れる",
        readingJa: "いれる",
        readingKo: "이레루",
        meaningKo: "넣다",
      }),
      kun("いり", "이리", {
        word: "入口",
        readingJa: "いりぐち",
        readingKo: "이리구치",
        meaningKo: "입구",
      }),
    ],
  },
  {
    id: "k-out",
    char: "出",
    readingKo: "데",
    meaningKo: "나가다",
    stage: "1",
    onYomi: [
      on("しゅつ", "슈츠", {
        word: "出発",
        readingJa: "しゅっぱつ",
        readingKo: "슛파츠",
        meaningKo: "출발",
      }),
    ],
    kunYomi: [
      kun("で", "데", {
        word: "出る",
        readingJa: "でる",
        readingKo: "데루",
        meaningKo: "나가다",
      }),
      kun("だ", "다", {
        word: "出す",
        readingJa: "だす",
        readingKo: "다스",
        meaningKo: "꺼내다",
      }),
      kun("で", "데", {
        word: "出口",
        readingJa: "でぐち",
        readingKo: "데구치",
        meaningKo: "출구",
      }),
    ],
  },
  {
    id: "k-mouth",
    char: "口",
    readingKo: "구치",
    meaningKo: "입 · 출입구",
    stage: "1",
    onYomi: [
      on("こう", "코우", {
        word: "人口",
        readingJa: "じんこう",
        readingKo: "진코우",
        meaningKo: "인구",
      }),
    ],
    kunYomi: [
      kun("くち", "구치", {
        word: "入口",
        readingJa: "いりぐち",
        readingKo: "이리구치",
        meaningKo: "입구",
      }),
    ],
  },
  {
    id: "k-left",
    char: "左",
    readingKo: "히다리",
    meaningKo: "왼쪽",
    stage: "1",
    onYomi: [
      on("さ", "사", {
        word: "左右",
        readingJa: "さゆう",
        readingKo: "사유우",
        meaningKo: "좌우",
      }),
    ],
    kunYomi: [
      kun("ひだり", "히다리", {
        word: "左",
        readingJa: "ひだり",
        readingKo: "히다리",
        meaningKo: "왼쪽",
      }),
    ],
  },
  {
    id: "k-right",
    char: "右",
    readingKo: "미기",
    meaningKo: "오른쪽",
    stage: "1",
    onYomi: [
      on("う", "우", {
        word: "左右",
        readingJa: "さゆう",
        readingKo: "사유우",
        meaningKo: "좌우",
      }),
    ],
    kunYomi: [
      kun("みぎ", "미기", {
        word: "右",
        readingJa: "みぎ",
        readingKo: "미기",
        meaningKo: "오른쪽",
      }),
    ],
  },
  {
    id: "k-up",
    char: "上",
    readingKo: "우에",
    meaningKo: "위",
    stage: "1",
    onYomi: [
      on("じょう", "조우", {
        word: "上手",
        readingJa: "じょうず",
        readingKo: "조우즈",
        meaningKo: "잘하다",
      }),
    ],
    kunYomi: [
      kun("うえ", "우에", {
        word: "上",
        readingJa: "うえ",
        readingKo: "우에",
        meaningKo: "위",
      }),
      // 훈독 あ + 예시 上がる = あがる
      kun("あ", "아", {
        word: "上がる",
        readingJa: "あがる",
        readingKo: "아가루",
        meaningKo: "올라가다",
      }),
    ],
  },
  {
    id: "k-down",
    char: "下",
    readingKo: "시타",
    meaningKo: "아래",
    stage: "1",
    onYomi: [
      on("か", "카", {
        word: "地下",
        readingJa: "ちか",
        readingKo: "치카",
        meaningKo: "지하",
      }),
    ],
    kunYomi: [
      kun("した", "시타", {
        word: "下",
        readingJa: "した",
        readingKo: "시타",
        meaningKo: "아래",
      }),
    ],
  },
  {
    id: "k-mid",
    char: "中",
    readingKo: "나카",
    meaningKo: "안 · 중간",
    stage: "1",
    onYomi: [
      on("ちゅう", "츄우", {
        word: "中国",
        readingJa: "ちゅうごく",
        readingKo: "츄우고쿠",
        meaningKo: "중국",
      }),
    ],
    kunYomi: [
      kun("なか", "나카", {
        word: "中",
        readingJa: "なか",
        readingKo: "나카",
        meaningKo: "안",
      }),
    ],
  },
  {
    id: "k-out2",
    char: "外",
    readingKo: "소토",
    meaningKo: "밖",
    stage: "1",
    onYomi: [
      on("がい", "가이", {
        word: "外国",
        readingJa: "がいこく",
        readingKo: "가이코쿠",
        meaningKo: "외국",
      }),
    ],
    kunYomi: [
      kun("そと", "소토", {
        word: "外",
        readingJa: "そと",
        readingKo: "소토",
        meaningKo: "밖",
      }),
    ],
  },
  {
    id: "k-big",
    char: "大",
    readingKo: "오오",
    meaningKo: "크다",
    stage: "1",
    onYomi: [
      on("だい", "다이", {
        word: "大学",
        readingJa: "だいがく",
        readingKo: "다가쿠",
        meaningKo: "대학",
      }),
    ],
    kunYomi: [
      kun("おお", "오오", {
        word: "大きい",
        readingJa: "おおきい",
        readingKo: "오오키이",
        meaningKo: "크다",
      }),
    ],
  },
  {
    id: "k-small",
    char: "小",
    readingKo: "치이",
    meaningKo: "작다",
    stage: "1",
    onYomi: [
      on("しょう", "쇼우", {
        word: "小学校",
        readingJa: "しょうがっこう",
        readingKo: "쇼갓코우",
        meaningKo: "초등학교",
      }),
    ],
    kunYomi: [
      kun("ちい", "치이", {
        word: "小さい",
        readingJa: "ちいさい",
        readingKo: "치이사이",
        meaningKo: "작다",
      }),
    ],
  },
  {
    id: "k-man",
    char: "男",
    readingKo: "오토코",
    meaningKo: "남자",
    stage: "1",
    onYomi: [
      on("だん", "단", {
        word: "男子",
        readingJa: "だんし",
        readingKo: "단시",
        meaningKo: "남자",
      }),
    ],
    kunYomi: [
      kun("おとこ", "오토코", {
        word: "男の人",
        readingJa: "おとこのひと",
        readingKo: "오토코노히토",
        meaningKo: "남자 분",
      }),
    ],
  },
  {
    id: "k-woman",
    char: "女",
    readingKo: "온나",
    meaningKo: "여자",
    stage: "1",
    onYomi: [
      on("じょ", "조", {
        word: "女子",
        readingJa: "じょし",
        readingKo: "조시",
        meaningKo: "여자",
      }),
    ],
    kunYomi: [
      kun("おんな", "온나", {
        word: "女の人",
        readingJa: "おんなのひと",
        readingKo: "온나노히토",
        meaningKo: "여자 분",
      }),
    ],
  },
  {
    id: "k-child",
    char: "子",
    readingKo: "코",
    meaningKo: "아이",
    stage: "1",
    onYomi: [
      on("し", "시", {
        word: "女子",
        readingJa: "じょし",
        readingKo: "조시",
        meaningKo: "여자",
      }),
    ],
    kunYomi: [
      kun("こ", "코", {
        word: "子供",
        readingJa: "こども",
        readingKo: "코도모",
        meaningKo: "아이",
      }),
    ],
  },
  {
    id: "k-person",
    char: "人",
    readingKo: "히토",
    meaningKo: "사람",
    stage: "1",
    onYomi: [
      on("じん", "진", {
        word: "日本人",
        readingJa: "にほんじん",
        readingKo: "니혼진",
        meaningKo: "일본인",
      }),
    ],
    kunYomi: [
      kun("ひと", "히토", {
        word: "人",
        readingJa: "ひと",
        readingKo: "히토",
        meaningKo: "사람",
      }),
    ],
  },
  {
    id: "k-station",
    char: "駅",
    readingKo: "에키",
    meaningKo: "역",
    stage: "1",
    onYomi: [
      on("えき", "에키", {
        word: "駅",
        readingJa: "えき",
        readingKo: "에키",
        meaningKo: "역",
      }),
    ],
    kunYomi: [],
  },
  {
    id: "k-shop",
    char: "店",
    readingKo: "미세",
    meaningKo: "가게",
    stage: "1",
    onYomi: [
      on("てん", "텐", {
        word: "店員",
        readingJa: "てんいん",
        readingKo: "텐인",
        meaningKo: "점원",
      }),
    ],
    kunYomi: [
      kun("みせ", "미세", {
        word: "店",
        readingJa: "みせ",
        readingKo: "미세",
        meaningKo: "가게",
      }),
    ],
  },
  {
    id: "k-car",
    char: "車",
    readingKo: "쿠루마",
    meaningKo: "차",
    stage: "1",
    onYomi: [
      on("しゃ", "샤", {
        word: "電車",
        readingJa: "でんしゃ",
        readingKo: "덴샤",
        meaningKo: "전철",
      }),
    ],
    kunYomi: [
      kun("くるま", "쿠루마", {
        word: "車",
        readingJa: "くるま",
        readingKo: "쿠루마",
        meaningKo: "자동차",
      }),
    ],
  },
  {
    id: "k-elec",
    char: "電",
    readingKo: "덴",
    meaningKo: "전기",
    stage: "1",
    onYomi: [
      on("でん", "덴", {
        word: "電車",
        readingJa: "でんしゃ",
        readingKo: "덴샤",
        meaningKo: "전철",
      }),
    ],
    kunYomi: [],
  },
  {
    id: "k-hospital",
    char: "病",
    readingKo: "야마이",
    meaningKo: "병",
    stage: "1",
    onYomi: [
      on("びょう", "뵤우", {
        word: "病院",
        readingJa: "びょういん",
        readingKo: "뵤우인",
        meaningKo: "병원",
      }),
    ],
    kunYomi: [
      kun("やまい", "야마이", {
        word: "病",
        readingJa: "やまい",
        readingKo: "야마이",
        meaningKo: "병",
      }),
    ],
  },
  {
    id: "k-in2",
    char: "院",
    readingKo: "인",
    meaningKo: "관 · 시설 · 병원",
    stage: "1",
    onYomi: [
      on("いん", "인", {
        word: "病院",
        readingJa: "びょういん",
        readingKo: "뵤우인",
        meaningKo: "병원",
      }),
    ],
    kunYomi: [],
  },
  {
    id: "k-year",
    char: "年",
    readingKo: "토시",
    meaningKo: "해 · 년",
    stage: "1",
    onYomi: [
      on("ねん", "넨", {
        word: "来年",
        readingJa: "らいねん",
        readingKo: "라이넨",
        meaningKo: "내년",
      }),
    ],
    kunYomi: [
      kun("とし", "토시", {
        word: "年",
        readingJa: "とし",
        readingKo: "토시",
        meaningKo: "나이 · 해",
      }),
    ],
  },
  {
    id: "k-month",
    char: "月",
    readingKo: "츠키",
    meaningKo: "달 · 월",
    stage: "1",
    onYomi: [
      on("がつ", "가츠", {
        word: "一月",
        readingJa: "いちがつ",
        readingKo: "이치가츠",
        meaningKo: "1월",
      }),
    ],
    kunYomi: [
      kun("つき", "츠키", {
        word: "月",
        readingJa: "つき",
        readingKo: "츠키",
        meaningKo: "달",
      }),
    ],
  },
  {
    id: "k-day",
    char: "日",
    readingKo: "히",
    meaningKo: "날 · 해",
    stage: "1",
    onYomi: [
      on("にち", "니치", {
        word: "毎日",
        readingJa: "まいにち",
        readingKo: "마이니치",
        meaningKo: "매일",
      }),
    ],
    kunYomi: [
      kun("ひ", "히", {
        word: "日",
        readingJa: "ひ",
        readingKo: "히",
        meaningKo: "날",
      }),
    ],
  },
  {
    id: "k-time",
    char: "時",
    readingKo: "토키",
    meaningKo: "때 · 시",
    stage: "1",
    onYomi: [
      on("じ", "지", {
        word: "一時",
        readingJa: "いちじ",
        readingKo: "이치지",
        meaningKo: "1시",
      }),
    ],
    kunYomi: [
      kun("とき", "토키", {
        word: "時",
        readingJa: "とき",
        readingKo: "토키",
        meaningKo: "때",
      }),
    ],
  },
  {
    id: "k-min",
    char: "分",
    readingKo: "분",
    meaningKo: "분 · 나누다",
    stage: "1",
    onYomi: [
      on("ふん", "훈", {
        word: "五分",
        readingJa: "ごふん",
        readingKo: "고훈",
        meaningKo: "5분",
      }),
    ],
    kunYomi: [
      kun("わ", "와", {
        word: "分ける",
        readingJa: "わける",
        readingKo: "와케루",
        meaningKo: "나누다",
      }),
    ],
  },
  {
    id: "k-yen",
    char: "円",
    readingKo: "엔",
    meaningKo: "엔 (돈)",
    stage: "1",
    onYomi: [
      on("えん", "엔", {
        word: "百円",
        readingJa: "ひゃくえん",
        readingKo: "햐쿠엔",
        meaningKo: "100엔",
      }),
    ],
    kunYomi: [],
  },
  {
    id: "k-stop",
    char: "止",
    readingKo: "토메",
    meaningKo: "멈추다",
    stage: "1",
    onYomi: [
      on("し", "시", {
        word: "中止",
        readingJa: "ちゅうし",
        readingKo: "츄우시",
        meaningKo: "중지",
      }),
    ],
    kunYomi: [
      kun("と", "토", {
        word: "止まれ",
        readingJa: "とまれ",
        readingKo: "토마레",
        meaningKo: "멈춰 (표지)",
      }),
    ],
  },
  {
    id: "k-ban",
    char: "番",
    readingKo: "반",
    meaningKo: "번호 · 차례",
    stage: "1",
    onYomi: [
      on("ばん", "반", {
        word: "一番",
        readingJa: "いちばん",
        readingKo: "이치반",
        meaningKo: "가장 · 1번",
      }),
    ],
    kunYomi: [],
  },
  {
    id: "k-note",
    char: "記",
    readingKo: "시루",
    meaningKo: "적다 · 기록",
    stage: "1",
    onYomi: [
      on("き", "키", {
        word: "日記",
        readingJa: "にっき",
        readingKo: "닛키",
        meaningKo: "일기",
      }),
    ],
    kunYomi: [
      kun("しる", "시루", {
        word: "記す",
        readingJa: "しるす",
        readingKo: "시루스",
        meaningKo: "적다",
      }),
    ],
  },
  {
    id: "k-mind",
    char: "心",
    readingKo: "코코로",
    meaningKo: "마음",
    stage: "1",
    onYomi: [
      on("しん", "신", {
        word: "安心",
        readingJa: "あんしん",
        readingKo: "안신",
        meaningKo: "안심",
      }),
    ],
    kunYomi: [
      kun("こころ", "코코로", {
        word: "心",
        readingJa: "こころ",
        readingKo: "코코로",
        meaningKo: "마음",
      }),
    ],
  },

  // ─── 2단계 ───
  {
    id: "k-eat",
    char: "食",
    readingKo: "타베",
    meaningKo: "먹다",
    stage: "2",
    onYomi: [
      on("しょく", "쇼쿠", {
        word: "食事",
        readingJa: "しょくじ",
        readingKo: "쇼쿠지",
        meaningKo: "식사",
      }),
    ],
    kunYomi: [
      kun("た", "타", {
        word: "食べる",
        readingJa: "たべる",
        readingKo: "타베루",
        meaningKo: "먹다",
      }),
    ],
  },
  {
    id: "k-drink",
    char: "飲",
    readingKo: "노",
    meaningKo: "마시다",
    stage: "2",
    onYomi: [
      on("いん", "인", {
        word: "飲食",
        readingJa: "いんしょく",
        readingKo: "인쇼쿠",
        meaningKo: "음식",
      }),
    ],
    kunYomi: [
      kun("の", "노", {
        word: "飲む",
        readingJa: "のむ",
        readingKo: "노무",
        meaningKo: "마시다",
      }),
    ],
  },
  {
    id: "k-meat",
    char: "肉",
    readingKo: "니쿠",
    meaningKo: "고기",
    stage: "2",
    onYomi: [
      on("にく", "니쿠", {
        word: "牛肉",
        readingJa: "ぎゅうにく",
        readingKo: "규우니쿠",
        meaningKo: "소고기",
      }),
    ],
    kunYomi: [],
  },
  {
    id: "k-fish",
    char: "魚",
    readingKo: "사카나",
    meaningKo: "물고기",
    stage: "2",
    onYomi: [
      on("ぎょ", "교", {
        word: "魚介",
        readingJa: "ぎょかい",
        readingKo: "교카이",
        meaningKo: "어패류",
      }),
    ],
    kunYomi: [
      kun("さかな", "사카나", {
        word: "魚",
        readingJa: "さかな",
        readingKo: "사카나",
        meaningKo: "물고기",
      }),
    ],
  },
  {
    id: "k-egg",
    char: "卵",
    readingKo: "타마고",
    meaningKo: "달걀",
    stage: "2",
    onYomi: [
      on("らん", "란", {
        word: "鶏卵",
        readingJa: "けいらん",
        readingKo: "케이란",
        meaningKo: "달걀(계란)",
      }),
    ],
    kunYomi: [
      kun("たまご", "타마고", {
        word: "卵",
        readingJa: "たまご",
        readingKo: "타마고",
        meaningKo: "달걀",
      }),
    ],
  },
  {
    id: "k-milk",
    char: "乳",
    readingKo: "뉴우",
    meaningKo: "젖 · 우유",
    stage: "2",
    onYomi: [
      on("にゅう", "뉴우", {
        word: "牛乳",
        readingJa: "ぎゅうにゅう",
        readingKo: "규우뉴우",
        meaningKo: "우유",
      }),
    ],
    kunYomi: [],
  },
  {
    id: "k-rice",
    char: "米",
    readingKo: "코메",
    meaningKo: "쌀",
    stage: "2",
    onYomi: [
      on("べい", "베이", {
        word: "米国",
        readingJa: "べいこく",
        readingKo: "베이코쿠",
        meaningKo: "미국",
      }),
    ],
    kunYomi: [
      kun("こめ", "코메", {
        word: "米",
        readingJa: "こめ",
        readingKo: "코메",
        meaningKo: "쌀",
      }),
    ],
  },
  {
    id: "k-tea",
    char: "茶",
    readingKo: "차",
    meaningKo: "차",
    stage: "2",
    onYomi: [
      on("ちゃ", "차", {
        word: "お茶",
        readingJa: "おちゃ",
        readingKo: "오차",
        meaningKo: "차",
      }),
    ],
    kunYomi: [],
  },
  {
    id: "k-water2",
    char: "水",
    readingKo: "미즈",
    meaningKo: "물",
    stage: "2",
    onYomi: [
      on("すい", "스이", {
        word: "水曜日",
        readingJa: "すいようび",
        readingKo: "스이요우비",
        meaningKo: "수요일",
      }),
    ],
    kunYomi: [
      kun("みず", "미즈", {
        word: "水",
        readingJa: "みず",
        readingKo: "미즈",
        meaningKo: "물",
      }),
    ],
  },
  {
    id: "k-fire",
    char: "火",
    readingKo: "히",
    meaningKo: "불",
    stage: "2",
    onYomi: [
      on("か", "카", {
        word: "火曜日",
        readingJa: "かようび",
        readingKo: "카요우비",
        meaningKo: "화요일",
      }),
    ],
    kunYomi: [
      kun("ひ", "히", {
        word: "火",
        readingJa: "ひ",
        readingKo: "히",
        meaningKo: "불",
      }),
    ],
  },
  {
    id: "k-taste",
    char: "味",
    readingKo: "아지",
    meaningKo: "맛",
    stage: "2",
    onYomi: [
      on("み", "미", {
        word: "意味",
        readingJa: "いみ",
        readingKo: "이미",
        meaningKo: "의미",
      }),
    ],
    kunYomi: [
      kun("あじ", "아지", {
        word: "味",
        readingJa: "あじ",
        readingKo: "아지",
        meaningKo: "맛",
      }),
    ],
  },
  {
    id: "k-term",
    char: "期",
    readingKo: "키",
    meaningKo: "기간",
    stage: "2",
    onYomi: [
      on("き", "키", {
        word: "期間",
        readingJa: "きかん",
        readingKo: "키칸",
        meaningKo: "기간",
      }),
    ],
    kunYomi: [],
  },
  {
    id: "k-limit",
    char: "限",
    readingKo: "카기",
    meaningKo: "한하다 · 기한",
    stage: "2",
    onYomi: [
      on("げん", "겐", {
        word: "期限",
        readingJa: "きげん",
        readingKo: "키겐",
        meaningKo: "기한",
      }),
    ],
    kunYomi: [
      kun("かぎ", "카기", {
        word: "限る",
        readingJa: "かぎる",
        readingKo: "카기루",
        meaningKo: "한정하다",
      }),
    ],
  },
  {
    id: "k-prize",
    char: "賞",
    readingKo: "쇼우",
    meaningKo: "상",
    stage: "2",
    onYomi: [
      on("しょう", "쇼우", {
        word: "賞味",
        readingJa: "しょうみ",
        readingKo: "쇼우미",
        meaningKo: "맛있게 먹다",
      }),
    ],
    kunYomi: [],
  },
  {
    id: "k-use",
    char: "用",
    readingKo: "모치",
    meaningKo: "쓰다 · 용도",
    stage: "2",
    onYomi: [
      on("よう", "요우", {
        word: "使用",
        readingJa: "しよう",
        readingKo: "시요우",
        meaningKo: "사용",
      }),
    ],
    kunYomi: [
      kun("もち", "모치", {
        word: "用いる",
        readingJa: "もちいる",
        readingKo: "모치이루",
        meaningKo: "쓰다",
      }),
    ],
  },
  {
    id: "k-fee",
    char: "料",
    readingKo: "료우",
    meaningKo: "요금 · 재료",
    stage: "2",
    onYomi: [
      on("りょう", "료우", {
        word: "無料",
        readingJa: "むりょう",
        readingKo: "무료우",
        meaningKo: "무료",
      }),
    ],
    kunYomi: [],
  },
  {
    id: "k-cold",
    char: "冷",
    readingKo: "츠메",
    meaningKo: "차갑다",
    stage: "2",
    onYomi: [
      on("れい", "레이", {
        word: "冷蔵庫",
        readingJa: "れいぞうこ",
        readingKo: "레이조우코",
        meaningKo: "냉장고",
      }),
    ],
    kunYomi: [
      kun("つめ", "츠메", {
        word: "冷たい",
        readingJa: "つめたい",
        readingKo: "츠메타이",
        meaningKo: "차갑다",
      }),
    ],
  },
  {
    id: "k-warm",
    char: "温",
    readingKo: "아타타",
    meaningKo: "따뜻하다",
    stage: "2",
    onYomi: [
      on("おん", "온", {
        word: "温度",
        readingJa: "おんど",
        readingKo: "온도",
        meaningKo: "온도",
      }),
    ],
    kunYomi: [
      kun("あたた", "아타타", {
        word: "温かい",
        readingJa: "あたたかい",
        readingKo: "아타타카이",
        meaningKo: "따뜻하다",
      }),
    ],
  },
  {
    id: "k-hot",
    char: "熱",
    readingKo: "아츠",
    meaningKo: "뜨겁다 · 열",
    stage: "2",
    onYomi: [
      on("ねつ", "네츠", {
        word: "発熱",
        readingJa: "はつねつ",
        readingKo: "하츠네츠",
        meaningKo: "열이 남",
      }),
    ],
    kunYomi: [
      kun("あつ", "아츠", {
        word: "熱い",
        readingJa: "あつい",
        readingKo: "아츠이",
        meaningKo: "뜨겁다",
      }),
    ],
  },
  {
    id: "k-sweet",
    char: "甘",
    readingKo: "아마",
    meaningKo: "달다",
    stage: "2",
    onYomi: [
      on("かん", "칸", {
        word: "甘味",
        readingJa: "かんみ",
        readingKo: "칸미",
        meaningKo: "단맛",
      }),
    ],
    kunYomi: [
      kun("あま", "아마", {
        word: "甘い",
        readingJa: "あまい",
        readingKo: "아마이",
        meaningKo: "달다",
      }),
    ],
  },
  {
    id: "k-spicy",
    char: "辛",
    readingKo: "카라",
    meaningKo: "맵다",
    stage: "2",
    onYomi: [
      on("しん", "신", {
        word: "香辛料",
        readingJa: "こうしんりょう",
        readingKo: "코우신료우",
        meaningKo: "향신료",
      }),
    ],
    kunYomi: [
      kun("から", "카라", {
        word: "辛い",
        readingJa: "からい",
        readingKo: "카라이",
        meaningKo: "맵다",
      }),
    ],
  },
  {
    id: "k-salt",
    char: "塩",
    readingKo: "시오",
    meaningKo: "소금",
    stage: "2",
    onYomi: [
      on("えん", "엔", {
        word: "塩分",
        readingJa: "えんぶん",
        readingKo: "엔분",
        meaningKo: "염분",
      }),
    ],
    kunYomi: [
      kun("しお", "시오", {
        word: "塩",
        readingJa: "しお",
        readingKo: "시오",
        meaningKo: "소금",
      }),
    ],
  },
  {
    id: "k-oil",
    char: "油",
    readingKo: "아부라",
    meaningKo: "기름",
    stage: "2",
    onYomi: [
      on("ゆ", "유", {
        word: "石油",
        readingJa: "せきゆ",
        readingKo: "세키유",
        meaningKo: "석유",
      }),
    ],
    kunYomi: [
      kun("あぶら", "아부라", {
        word: "油",
        readingJa: "あぶら",
        readingKo: "아부라",
        meaningKo: "기름",
      }),
    ],
  },
  {
    id: "k-bean",
    char: "豆",
    readingKo: "마메",
    meaningKo: "콩",
    stage: "2",
    onYomi: [
      on("とう", "토우", {
        word: "豆腐",
        readingJa: "とうふ",
        readingKo: "토우후",
        meaningKo: "두부",
      }),
    ],
    kunYomi: [
      kun("まめ", "마메", {
        word: "豆",
        readingJa: "まめ",
        readingKo: "마메",
        meaningKo: "콩",
      }),
    ],
  },
  {
    id: "k-wheat",
    char: "麦",
    readingKo: "무기",
    meaningKo: "보리 · 밀",
    stage: "2",
    onYomi: [
      on("ばく", "바쿠", {
        word: "麦芽",
        readingJa: "ばくが",
        readingKo: "바쿠가",
        meaningKo: "맥아",
      }),
    ],
    kunYomi: [
      kun("むぎ", "무기", {
        word: "麦",
        readingJa: "むぎ",
        readingKo: "무기",
        meaningKo: "보리",
      }),
    ],
  },
  {
    id: "k-bird",
    char: "鳥",
    readingKo: "토리",
    meaningKo: "새",
    stage: "2",
    onYomi: [
      on("ちょう", "쵸우", {
        word: "鳥類",
        readingJa: "ちょうるい",
        readingKo: "쵸우루이",
        meaningKo: "조류",
      }),
    ],
    kunYomi: [
      kun("とり", "토리", {
        word: "鳥",
        readingJa: "とり",
        readingKo: "토리",
        meaningKo: "새 · 닭고기",
      }),
    ],
  },
  {
    id: "k-pig",
    char: "豚",
    readingKo: "부타",
    meaningKo: "돼지",
    stage: "2",
    onYomi: [
      on("とん", "톤", {
        word: "豚カツ",
        readingJa: "とんかつ",
        readingKo: "톤카츠",
        meaningKo: "돈가스",
      }),
    ],
    kunYomi: [
      kun("ぶた", "부타", {
        word: "豚",
        readingJa: "ぶた",
        readingKo: "부타",
        meaningKo: "돼지",
      }),
    ],
  },
  {
    id: "k-cow",
    char: "牛",
    readingKo: "우시",
    meaningKo: "소",
    stage: "2",
    onYomi: [
      on("ぎゅう", "규우", {
        word: "牛肉",
        readingJa: "ぎゅうにく",
        readingKo: "규우니쿠",
        meaningKo: "소고기",
      }),
    ],
    kunYomi: [
      kun("うし", "우시", {
        word: "牛",
        readingJa: "うし",
        readingKo: "우시",
        meaningKo: "소",
      }),
    ],
  },
  {
    id: "k-buy",
    char: "買",
    readingKo: "카",
    meaningKo: "사다",
    stage: "2",
    onYomi: [
      on("ばい", "바이", {
        word: "売買",
        readingJa: "ばいばい",
        readingKo: "바이바이",
        meaningKo: "사고팔기",
      }),
    ],
    kunYomi: [
      kun("か", "카", {
        word: "買う",
        readingJa: "かう",
        readingKo: "카우",
        meaningKo: "사다",
      }),
    ],
  },
  {
    id: "k-sell",
    char: "売",
    readingKo: "우",
    meaningKo: "팔다",
    stage: "2",
    onYomi: [
      on("ばい", "바이", {
        word: "発売",
        readingJa: "はつばい",
        readingKo: "하츠바이",
        meaningKo: "발매",
      }),
    ],
    kunYomi: [
      kun("う", "우", {
        word: "売る",
        readingJa: "うる",
        readingKo: "우루",
        meaningKo: "팔다",
      }),
    ],
  },

  // ─── 3단계 (짧은 말) ───
  {
    id: "k-iriguchi",
    char: "入口",
    readingKo: "이리구치",
    meaningKo: "입구",
    stage: "3",
    onYomi: [],
    kunYomi: [
      kun("いりぐち", "이리구치", {
        word: "入口",
        readingJa: "いりぐち",
        readingKo: "이리구치",
        meaningKo: "입구",
      }),
    ],
  },
  {
    id: "k-deguchi",
    char: "出口",
    readingKo: "데구치",
    meaningKo: "출구",
    stage: "3",
    onYomi: [],
    kunYomi: [
      kun("でぐち", "데구치", {
        word: "出口",
        readingJa: "でぐち",
        readingKo: "데구치",
        meaningKo: "출구",
      }),
    ],
  },
  {
    id: "k-kinshi",
    char: "禁止",
    readingKo: "킨시",
    meaningKo: "금지",
    stage: "3",
    onYomi: [
      on("きんし", "킨시", {
        word: "立入禁止",
        readingJa: "たちいりきんし",
        readingKo: "타치이리킨시",
        meaningKo: "출입 금지",
      }),
    ],
    kunYomi: [],
  },
  {
    id: "k-chui",
    char: "注意",
    readingKo: "츄우이",
    meaningKo: "주의",
    stage: "3",
    onYomi: [
      on("ちゅうい", "츄우이", {
        word: "注意",
        readingJa: "ちゅうい",
        readingKo: "츄우이",
        meaningKo: "주의",
      }),
    ],
    kunYomi: [],
  },
  {
    id: "k-kinen",
    char: "禁煙",
    readingKo: "킨엔",
    meaningKo: "금연",
    stage: "3",
    onYomi: [
      on("きんえん", "킨엔", {
        word: "禁煙",
        readingJa: "きんえん",
        readingKo: "킨엔",
        meaningKo: "금연",
      }),
    ],
    kunYomi: [],
  },
  {
    id: "k-eigyo",
    char: "営業",
    readingKo: "에이교우",
    meaningKo: "영업",
    stage: "3",
    onYomi: [
      on("えいぎょう", "에이교우", {
        word: "営業中",
        readingJa: "えいぎょうちゅう",
        readingKo: "에이교우츄우",
        meaningKo: "영업 중",
      }),
    ],
    kunYomi: [],
  },
  {
    id: "k-kaiten",
    char: "開店",
    readingKo: "카이텐",
    meaningKo: "개점",
    stage: "3",
    onYomi: [
      on("かいてん", "카이텐", {
        word: "開店",
        readingJa: "かいてん",
        readingKo: "카이텐",
        meaningKo: "가게 열기",
      }),
    ],
    kunYomi: [],
  },
  {
    id: "k-heiten",
    char: "閉店",
    readingKo: "헤이텐",
    meaningKo: "폐점",
    stage: "3",
    onYomi: [
      on("へいてん", "헤이텐", {
        word: "閉店",
        readingJa: "へいてん",
        readingKo: "헤이텐",
        meaningKo: "가게 닫기",
      }),
    ],
    kunYomi: [],
  },
  {
    id: "k-densha",
    char: "電車",
    readingKo: "덴샤",
    meaningKo: "전철",
    stage: "3",
    onYomi: [
      on("でんしゃ", "덴샤", {
        word: "電車",
        readingJa: "でんしゃ",
        readingKo: "덴샤",
        meaningKo: "전철",
      }),
    ],
    kunYomi: [],
  },
  {
    id: "k-chikatetsu",
    char: "地下鉄",
    readingKo: "치카테츠",
    meaningKo: "지하철",
    stage: "3",
    onYomi: [
      on("ちかてつ", "치카테츠", {
        word: "地下鉄",
        readingJa: "ちかてつ",
        readingKo: "치카테츠",
        meaningKo: "지하철",
      }),
    ],
    kunYomi: [],
  },
  {
    id: "k-byouin",
    char: "病院",
    readingKo: "뵤우인",
    meaningKo: "병원",
    stage: "3",
    onYomi: [
      on("びょういん", "뵤우인", {
        word: "病院",
        readingJa: "びょういん",
        readingKo: "뵤우인",
        meaningKo: "병원",
      }),
    ],
    kunYomi: [],
  },
  {
    id: "k-gakkou",
    char: "学校",
    readingKo: "갓코우",
    meaningKo: "학교",
    stage: "3",
    onYomi: [
      on("がっこう", "갓코우", {
        word: "学校",
        readingJa: "がっこう",
        readingKo: "갓코우",
        meaningKo: "학교",
      }),
    ],
    kunYomi: [],
  },
  {
    id: "k-sensei",
    char: "先生",
    readingKo: "센세이",
    meaningKo: "선생님",
    stage: "3",
    onYomi: [
      on("せんせい", "센세이", {
        word: "先生",
        readingJa: "せんせい",
        readingKo: "센세이",
        meaningKo: "선생님",
      }),
    ],
    kunYomi: [],
  },
  {
    id: "k-nihon",
    char: "日本",
    readingKo: "니혼",
    meaningKo: "일본",
    stage: "3",
    onYomi: [
      on("にほん", "니혼", {
        word: "日本",
        readingJa: "にほん",
        readingKo: "니혼",
        meaningKo: "일본",
      }),
    ],
    kunYomi: [],
  },
  {
    id: "k-namae",
    char: "名前",
    readingKo: "나마에",
    meaningKo: "이름",
    stage: "3",
    onYomi: [],
    kunYomi: [
      kun("なまえ", "나마에", {
        word: "名前",
        readingJa: "なまえ",
        readingKo: "나마에",
        meaningKo: "이름",
      }),
    ],
  },
  {
    id: "k-denwa",
    char: "電話",
    readingKo: "덴와",
    meaningKo: "전화",
    stage: "3",
    onYomi: [
      on("でんわ", "덴와", {
        word: "電話",
        readingJa: "でんわ",
        readingKo: "덴와",
        meaningKo: "전화",
      }),
    ],
    kunYomi: [],
  },
  {
    id: "k-kyou",
    char: "今日",
    readingKo: "쿄우",
    meaningKo: "오늘",
    stage: "3",
    onYomi: [],
    kunYomi: [
      kun("きょう", "쿄우", {
        word: "今日",
        readingJa: "きょう",
        readingKo: "쿄우",
        meaningKo: "오늘",
      }),
    ],
  },
  {
    id: "k-ashita",
    char: "明日",
    readingKo: "아시타",
    meaningKo: "내일",
    stage: "3",
    onYomi: [],
    kunYomi: [
      kun("あした", "아시타", {
        word: "明日",
        readingJa: "あした",
        readingKo: "아시타",
        meaningKo: "내일",
      }),
    ],
  },
  {
    id: "k-shoumi",
    char: "賞味",
    readingKo: "쇼우미",
    meaningKo: "맛있게 먹다 (기한)",
    stage: "3",
    onYomi: [
      on("しょうみ", "쇼우미", {
        word: "賞味期限",
        readingJa: "しょうみきげん",
        readingKo: "쇼우미키겐",
        meaningKo: "유통기한",
      }),
    ],
    kunYomi: [],
  },
  {
    id: "k-shouhi",
    char: "消費",
    readingKo: "쇼우히",
    meaningKo: "소비",
    stage: "3",
    onYomi: [
      on("しょうひ", "쇼우히", {
        word: "消費税",
        readingJa: "しょうひぜい",
        readingKo: "쇼우히제이",
        meaningKo: "소비세",
      }),
    ],
    kunYomi: [],
  },
  {
    id: "k-toire-m",
    char: "男性",
    readingKo: "단세이",
    meaningKo: "남성",
    stage: "3",
    onYomi: [
      on("だんせい", "단세이", {
        word: "男性",
        readingJa: "だんせい",
        readingKo: "단세이",
        meaningKo: "남성",
      }),
    ],
    kunYomi: [],
  },
  {
    id: "k-toire-w",
    char: "女性",
    readingKo: "조세이",
    meaningKo: "여성",
    stage: "3",
    onYomi: [
      on("じょせい", "조세이", {
        word: "女性",
        readingJa: "じょせい",
        readingKo: "조세이",
        meaningKo: "여성",
      }),
    ],
    kunYomi: [],
  },
  {
    id: "k-okane",
    char: "お金",
    readingKo: "오카네",
    meaningKo: "돈",
    stage: "3",
    onYomi: [],
    kunYomi: [
      kun("おかね", "오카네", {
        word: "お金",
        readingJa: "おかね",
        readingKo: "오카네",
        meaningKo: "돈",
      }),
    ],
  },
  {
    id: "k-yasui",
    char: "安い",
    readingKo: "야스이",
    meaningKo: "싸다",
    stage: "3",
    onYomi: [
      on("あん", "안", {
        word: "安心",
        readingJa: "あんしん",
        readingKo: "안신",
        meaningKo: "안심",
      }),
    ],
    kunYomi: [
      kun("やす", "야스", {
        word: "安い",
        readingJa: "やすい",
        readingKo: "야스이",
        meaningKo: "싸다",
      }),
    ],
  },
  {
    id: "k-takai",
    char: "高い",
    readingKo: "타카이",
    meaningKo: "비싸다 · 높다",
    stage: "3",
    onYomi: [
      on("こう", "코우", {
        word: "高校",
        readingJa: "こうこう",
        readingKo: "코우코우",
        meaningKo: "고교",
      }),
    ],
    kunYomi: [
      kun("たか", "타카", {
        word: "高い",
        readingJa: "たかい",
        readingKo: "타카이",
        meaningKo: "비싸다 · 높다",
      }),
    ],
  },
];

export function getKanjiByStage(stage: KanjiStageId): KanjiItem[] {
  return KANJI_ITEMS.filter((k) => k.stage === stage);
}

export function countKanjiByStage(stage: KanjiStageId): number {
  return getKanjiByStage(stage).length;
}

/** All Korean readings that count as correct for speech (훈독 + 예시 단어 발음). */
export function kanjiSpeechAnswers(item: KanjiItem): string[] {
  const set = new Set<string>([item.readingKo]);
  for (const r of item.onYomi) {
    set.add(r.ko);
    if (r.example?.readingKo) set.add(r.example.readingKo);
  }
  for (const r of item.kunYomi) {
    set.add(r.ko);
    if (r.example?.readingKo) set.add(r.example.readingKo);
  }
  return Array.from(set);
}
