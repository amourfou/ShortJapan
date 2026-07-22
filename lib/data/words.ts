import type { WordItem } from "@/lib/types";

export const INTERMEDIATE_WORDS: WordItem[] = [
  // 동물
  { id: "neko", word: "ねこ", readingKo: "네코", meaningKo: "고양이", script: "hiragana", category: "동물" },
  { id: "inu", word: "いぬ", readingKo: "이누", meaningKo: "강아지", script: "hiragana", category: "동물" },
  { id: "tori", word: "とり", readingKo: "토리", meaningKo: "새", script: "hiragana", category: "동물" },
  { id: "sakana", word: "さかな", readingKo: "사카나", meaningKo: "물고기", script: "hiragana", category: "동물" },
  { id: "uma", word: "うま", readingKo: "우마", meaningKo: "말", script: "hiragana", category: "동물" },
  { id: "usagi", word: "うさぎ", readingKo: "우사기", meaningKo: "토끼", script: "hiragana", category: "동물" },
  { id: "kuma", word: "くま", readingKo: "쿠마", meaningKo: "곰", script: "hiragana", category: "동물" },
  { id: "kaeru", word: "かえる", readingKo: "카에루", meaningKo: "개구리", script: "hiragana", category: "동물" },

  // 가족
  { id: "okaasan", word: "おかあさん", readingKo: "오카아산", meaningKo: "엄마", script: "hiragana", category: "가족" },
  { id: "otousan", word: "おとうさん", readingKo: "오토우산", meaningKo: "아빠", script: "hiragana", category: "가족" },
  { id: "oneesan", word: "おねえさん", readingKo: "오네에산", meaningKo: "언니/누나", script: "hiragana", category: "가족" },
  { id: "oniisan", word: "おにいさん", readingKo: "오니이산", meaningKo: "형/오빠", script: "hiragana", category: "가족" },
  { id: "imouto", word: "いもうと", readingKo: "이모우토", meaningKo: "여동생", script: "hiragana", category: "가족" },
  { id: "otouto", word: "おとうと", readingKo: "오토우토", meaningKo: "남동생", script: "hiragana", category: "가족" },
  { id: "tomodachi", word: "ともだち", readingKo: "토모다치", meaningKo: "친구", script: "hiragana", category: "가족" },

  // 색깔
  { id: "aka", word: "あか", readingKo: "아카", meaningKo: "빨강", script: "hiragana", category: "색깔" },
  { id: "ao", word: "あお", readingKo: "아오", meaningKo: "파랑", script: "hiragana", category: "색깔" },
  { id: "kiiro", word: "きいろ", readingKo: "키이로", meaningKo: "노랑", script: "hiragana", category: "색깔" },
  { id: "midori", word: "みどり", readingKo: "미도리", meaningKo: "초록", script: "hiragana", category: "색깔" },
  { id: "shiro", word: "しろ", readingKo: "시로", meaningKo: "하양", script: "hiragana", category: "색깔" },
  { id: "kuro", word: "くろ", readingKo: "쿠로", meaningKo: "검정", script: "hiragana", category: "색깔" },
  { id: "pinku", word: "ピンク", readingKo: "핑쿠", meaningKo: "분홍", script: "katakana", category: "색깔" },

  // 음식
  { id: "gohan", word: "ごはん", readingKo: "고한", meaningKo: "밥", script: "hiragana", category: "음식" },
  { id: "mizu", word: "みず", readingKo: "미즈", meaningKo: "물", script: "hiragana", category: "음식" },
  { id: "tamago", word: "たまご", readingKo: "타마고", meaningKo: "계란", script: "hiragana", category: "음식" },
  { id: "pan", word: "パン", readingKo: "판", meaningKo: "빵", script: "katakana", category: "음식" },
  { id: "miruku", word: "ミルク", readingKo: "미루쿠", meaningKo: "우유", script: "katakana", category: "음식" },
  { id: "ringo", word: "りんご", readingKo: "링고", meaningKo: "사과", script: "hiragana", category: "음식" },
  { id: "banana", word: "バナナ", readingKo: "바나나", meaningKo: "바나나", script: "katakana", category: "음식" },
  { id: "aisukuriimu", word: "アイスクリーム", readingKo: "아이스쿠리무", meaningKo: "아이스크림", script: "katakana", category: "음식" },
  { id: "sushi", word: "すし", readingKo: "스시", meaningKo: "초밥", script: "hiragana", category: "음식" },

  // 학교/일상
  { id: "hon", word: "ほん", readingKo: "혼", meaningKo: "책", script: "hiragana", category: "일상" },
  { id: "enpitsu", word: "えんぴつ", readingKo: "엔피츠", meaningKo: "연필", script: "hiragana", category: "일상" },
  { id: "gakkou", word: "がっこう", readingKo: "갓코우", meaningKo: "학교", script: "hiragana", category: "일상" },
  { id: "sensei", word: "せんせい", readingKo: "센세이", meaningKo: "선생님", script: "hiragana", category: "일상" },
  { id: "ie", word: "いえ", readingKo: "이에", meaningKo: "집", script: "hiragana", category: "일상" },
  { id: "kuruma", word: "くるま", readingKo: "쿠루마", meaningKo: "자동차", script: "hiragana", category: "일상" },
  { id: "denwa", word: "でんわ", readingKo: "덴와", meaningKo: "전화", script: "hiragana", category: "일상" },
  { id: "tokei", word: "とけい", readingKo: "토케이", meaningKo: "시계", script: "hiragana", category: "일상" },

  // 자연
  { id: "hi", word: "ひ", readingKo: "히", meaningKo: "해/불", script: "hiragana", category: "자연" },
  { id: "tsuki", word: "つき", readingKo: "츠키", meaningKo: "달", script: "hiragana", category: "자연" },
  { id: "hoshi", word: "ほし", readingKo: "호시", meaningKo: "별", script: "hiragana", category: "자연" },
  { id: "ame", word: "あめ", readingKo: "아메", meaningKo: "비", script: "hiragana", category: "자연" },
  { id: "yuki", word: "ゆき", readingKo: "유키", meaningKo: "눈", script: "hiragana", category: "자연" },
  { id: "yama", word: "やま", readingKo: "야마", meaningKo: "산", script: "hiragana", category: "자연" },
  { id: "kawa", word: "かわ", readingKo: "카와", meaningKo: "강", script: "hiragana", category: "자연" },
  { id: "umi", word: "うみ", readingKo: "우미", meaningKo: "바다", script: "hiragana", category: "자연" },
  { id: "hana", word: "はな", readingKo: "하나", meaningKo: "꽃", script: "hiragana", category: "자연" },
  { id: "ki", word: "き", readingKo: "키", meaningKo: "나무", script: "hiragana", category: "자연" },

  // 인사/기본
  { id: "ohayou", word: "おはよう", readingKo: "오하요우", meaningKo: "좋은 아침", script: "hiragana", category: "인사" },
  { id: "konnichiwa", word: "こんにちは", readingKo: "콘니치와", meaningKo: "안녕하세요", script: "hiragana", category: "인사" },
  { id: "arigatou", word: "ありがとう", readingKo: "아리가토우", meaningKo: "고마워", script: "hiragana", category: "인사" },
  { id: "sayounara", word: "さようなら", readingKo: "사요우나라", meaningKo: "잘 가", script: "hiragana", category: "인사" },
];
