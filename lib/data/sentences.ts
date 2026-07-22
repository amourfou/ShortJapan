import type { SentenceItem } from "@/lib/types";

/** Practical sentences for real situations in Japan (kana-focused for kids). */
export const ADVANCED_SENTENCES: SentenceItem[] = [
  // 인사·예절
  { id: "s-ohayou", sentence: "おはようございます。", readingKo: "오하요우 고자이마스", meaningKo: "안녕하세요 (아침, 공손)", categoryId: "greeting" },
  { id: "s-arigatou", sentence: "ありがとうございます。", readingKo: "아리가토우 고자이마스", meaningKo: "감사합니다", categoryId: "greeting" },
  { id: "s-sumimasen", sentence: "すみません。", readingKo: "스미마센", meaningKo: "실례합니다 / 죄송합니다", categoryId: "greeting" },
  { id: "s-onegaishimasu", sentence: "よろしくおねがいします。", readingKo: "요로시쿠 오네가이시마스", meaningKo: "잘 부탁드립니다", categoryId: "greeting" },
  { id: "s-gomen", sentence: "ごめんなさい。", readingKo: "고멘나사이", meaningKo: "미안합니다", categoryId: "greeting" },
  { id: "s-itadakimasu", sentence: "いただきます。", readingKo: "이타다키마스", meaningKo: "잘 먹겠습니다", categoryId: "greeting" },
  { id: "s-gochisousama", sentence: "ごちそうさまでした。", readingKo: "고치소우사마 데시타", meaningKo: "잘 먹었습니다", categoryId: "greeting" },
  { id: "s-shitsurei", sentence: "しつれいします。", readingKo: "시츠레이시마스", meaningKo: "실례합니다 (들어가며)", categoryId: "greeting" },

  // 식당·카페
  { id: "s-menu", sentence: "メニューをください。", readingKo: "메뉴 오 쿠다사이", meaningKo: "메뉴 주세요", categoryId: "restaurant" },
  { id: "s-mizu", sentence: "おみずをください。", readingKo: "오미즈 오 쿠다사이", meaningKo: "물 주세요", categoryId: "restaurant" },
  { id: "s-kore-kudasai", sentence: "これください。", readingKo: "코레 쿠다사이", meaningKo: "이거 주세요", categoryId: "restaurant" },
  { id: "s-okaikei", sentence: "おかいけいをおねがいします。", readingKo: "오카이케이 오 오네가이시마스", meaningKo: "계산 부탁합니다", categoryId: "restaurant" },
  { id: "s-oishii", sentence: "とてもおいしいです。", readingKo: "토테모 오이시이 데스", meaningKo: "정말 맛있어요", categoryId: "restaurant" },
  { id: "s-futari", sentence: "ふたりです。", readingKo: "후타리 데스", meaningKo: "두 명이에요", categoryId: "restaurant" },
  { id: "s-omakase", sentence: "おまかせします。", readingKo: "오마카세 시마스", meaningKo: "알아서 해주세요", categoryId: "restaurant" },
  { id: "s-takeout", sentence: "もちかえりで。", readingKo: "모치카에리 데", meaningKo: "포장으로요", categoryId: "restaurant" },

  // 쇼핑
  { id: "s-ikura", sentence: "これはいくらですか。", readingKo: "코레 와 이쿠라 데스 카", meaningKo: "이거 얼마예요?", categoryId: "shopping" },
  { id: "s-kore-kaimasu", sentence: "これをください。", readingKo: "코레 오 쿠다사이", meaningKo: "이거 살게요", categoryId: "shopping" },
  { id: "s-card", sentence: "カードでいいですか。", readingKo: "카도 데 이이 데스 카", meaningKo: "카드로 되나요?", categoryId: "shopping" },
  { id: "s-fukuro", sentence: "ふくろはいりません。", readingKo: "후쿠로 와 이리마센", meaningKo: "봉지는 괜찮아요", categoryId: "shopping" },
  { id: "s-shichaku", sentence: "しちゃくできますか。", readingKo: "시차쿠 데키마스 카", meaningKo: "입어 볼 수 있나요?", categoryId: "shopping" },
  { id: "s-chotto", sentence: "ちょっとたかいです。", readingKo: "촛토 타카이 데스", meaningKo: "조금 비싸요", categoryId: "shopping" },
  { id: "s-hoka", sentence: "ほかのいろはありますか。", readingKo: "호카 노 이로 와 아리마스 카", meaningKo: "다른 색 있나요?", categoryId: "shopping" },

  // 교통
  { id: "s-eki", sentence: "えきはどこですか。", readingKo: "에키 와 도코 데스 카", meaningKo: "역이 어디예요?", categoryId: "transport" },
  { id: "s-kippu", sentence: "きっぷをかいたいです。", readingKo: "킷푸 오 카이타이 데스", meaningKo: "표를 사고 싶어요", categoryId: "transport" },
  { id: "s-norikae", sentence: "どこでのりかえますか。", readingKo: "도코 데 노리카에마스 카", meaningKo: "어디서 갈아타요?", categoryId: "transport" },
  { id: "s-tsugi", sentence: "つぎはなんえきですか。", readingKo: "츠기 와 난에키 데스 카", meaningKo: "다음 역은 어디예요?", categoryId: "transport" },
  { id: "s-toire-eki", sentence: "トイレはどこですか。", readingKo: "토이레 와 도코 데스 카", meaningKo: "화장실 어디예요?", categoryId: "transport" },
  { id: "s-takushii", sentence: "タクシーをおねがいします。", readingKo: "타쿠시 오 오네가이시마스", meaningKo: "택시 부탁합니다", categoryId: "transport" },
  { id: "s-kuukou", sentence: "くうこうまでおねがいします。", readingKo: "쿠우코우 마데 오네가이시마스", meaningKo: "공항까지 부탁합니다", categoryId: "transport" },

  // 숙소
  { id: "s-yoyaku", sentence: "よやくがあります。", readingKo: "요야쿠 가 아리마스", meaningKo: "예약이 있어요", categoryId: "hotel" },
  { id: "s-checkin", sentence: "チェックインをおねがいします。", readingKo: "쳇쿠인 오 오네가이시마스", meaningKo: "체크인 부탁합니다", categoryId: "hotel" },
  { id: "s-wifi", sentence: "ワイファイはありますか。", readingKo: "와이파이 와 아리마스 카", meaningKo: "와이파이 있나요?", categoryId: "hotel" },
  { id: "s-heya", sentence: "へやのかぎをください。", readingKo: "헤야 노 카기 오 쿠다사이", meaningKo: "방 열쇠 주세요", categoryId: "hotel" },
  { id: "s-checkout", sentence: "チェックアウトはなんじですか。", readingKo: "쳇쿠아우토 와 난지 데스 카", meaningKo: "체크아웃이 몇 시예요?", categoryId: "hotel" },
  { id: "s-nimotsu", sentence: "にもつをあずかれますか。", readingKo: "니모츠 오 아즈카레마스 카", meaningKo: "짐 맡아 주실 수 있나요?", categoryId: "hotel" },

  // 길 묻기
  { id: "s-doko", sentence: "すみません、ここはどこですか。", readingKo: "스미마센, 코코 와 도코 데스 카", meaningKo: "실례지만, 여기가 어디예요?", categoryId: "directions" },
  { id: "s-massugu", sentence: "まっすぐいってください。", readingKo: "맛스구 잇테 쿠다사이", meaningKo: "직진해 주세요", categoryId: "directions" },
  { id: "s-migi", sentence: "みぎにまがってください。", readingKo: "미기 니 마갓테 쿠다사이", meaningKo: "오른쪽으로 돌아 주세요", categoryId: "directions" },
  { id: "s-hidari", sentence: "ひだりにまがってください。", readingKo: "히다리 니 마갓테 쿠다사이", meaningKo: "왼쪽으로 돌아 주세요", categoryId: "directions" },
  { id: "s-chikai", sentence: "ちかいですか。", readingKo: "치카이 데스 카", meaningKo: "가까워요?", categoryId: "directions" },
  { id: "s-koko-made", sentence: "ここまでおねがいします。", readingKo: "코코 마데 오네가이시마스", meaningKo: "여기까지 부탁합니다", categoryId: "directions" },

  // 학교·공부
  { id: "s-gakkou", sentence: "がっこうにいきます。", readingKo: "갓코우 니 이키마스", meaningKo: "학교에 가요", categoryId: "school" },
  { id: "s-sensei", sentence: "せんせい、おはようございます。", readingKo: "센세이, 오하요우 고자이마스", meaningKo: "선생님, 안녕하세요", categoryId: "school" },
  { id: "s-wakarimasen", sentence: "わかりません。", readingKo: "와카리마센", meaningKo: "모르겠어요", categoryId: "school" },
  { id: "s-mouichido", sentence: "もういちどおねがいします。", readingKo: "모우 이치도 오네가이시마스", meaningKo: "한 번 더 부탁합니다", categoryId: "school" },
  { id: "s-benkyou", sentence: "にほんごをべんきょうします。", readingKo: "니홍고 오 벤쿄우 시마스", meaningKo: "일본어를 공부해요", categoryId: "school" },
  { id: "s-tomodachi", sentence: "ともだちとあそびます。", readingKo: "토모다치 토 아소비마스", meaningKo: "친구와 놀아요", categoryId: "school" },

  // 일상
  { id: "s-kyou", sentence: "きょうはいいてんきです。", readingKo: "쿄우 와 이이 텐키 데스", meaningKo: "오늘은 날씨가 좋아요", categoryId: "daily" },
  { id: "s-nanji", sentence: "いまなんじですか。", readingKo: "이마 난지 데스 카", meaningKo: "지금 몇 시예요?", categoryId: "daily" },
  { id: "s-ashita", sentence: "あしたあいましょう。", readingKo: "아시타 아이마쇼우", meaningKo: "내일 만나요", categoryId: "daily" },
  { id: "s-ie", sentence: "うちにかえります。", readingKo: "우치 니 카에리마스", meaningKo: "집에 돌아가요", categoryId: "daily" },
  { id: "s-genki", sentence: "げんきですか。", readingKo: "겐키 데스 카", meaningKo: "잘 지내요?", categoryId: "daily" },
  { id: "s-ame", sentence: "あめがふっています。", readingKo: "아메 가 훗테 이마스", meaningKo: "비가 오고 있어요", categoryId: "daily" },

  // 가족·사람
  { id: "s-namae", sentence: "なまえはなんですか。", readingKo: "나마에 와 난 데스 카", meaningKo: "이름이 뭐예요?", categoryId: "family" },
  { id: "s-kazoku", sentence: "かぞくはなんにんですか。", readingKo: "카조쿠 와 난닌 데스 카", meaningKo: "가족이 몇 명이에요?", categoryId: "family" },
  { id: "s-okaasan", sentence: "おかあさんはげんきです。", readingKo: "오카아산 와 겐키 데스", meaningKo: "엄마는 건강하세요", categoryId: "family" },
  { id: "s-tomodachi2", sentence: "かれはともだちです。", readingKo: "카레 와 토모다치 데스", meaningKo: "그는 친구예요", categoryId: "family" },

  // 도움 요청
  { id: "s-tasukete", sentence: "たすけてください。", readingKo: "타스케테 쿠다사이", meaningKo: "도와 주세요", categoryId: "help" },
  { id: "s-wakarimasen2", sentence: "にほんごがわかりません。", readingKo: "니홍고 가 와카리마센", meaningKo: "일본어를 모르겠어요", categoryId: "help" },
  { id: "s-eigo", sentence: "えいごができますか。", readingKo: "에이고 가 데키마스 카", meaningKo: "영어 가능하신가요?", categoryId: "help" },
  { id: "s-byouin", sentence: "びょういんはどこですか。", readingKo: "뵤우인 와 도코 데스 카", meaningKo: "병원이 어디예요?", categoryId: "help" },
  { id: "s-itai", sentence: "ここがいたいです。", readingKo: "코코 가 이타이 데스", meaningKo: "여기가 아파요", categoryId: "help" },
  { id: "s-mayotta", sentence: "みちにまよいました。", readingKo: "미치 니 마요이마시타", meaningKo: "길을 잃었어요", categoryId: "help" },
  { id: "s-daijoubu", sentence: "だいじょうぶですか。", readingKo: "다이조우부 데스 카", meaningKo: "괜찮으세요?", categoryId: "help" },
];
