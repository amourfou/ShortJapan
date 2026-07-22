export interface SituationCategory {
  id: string;
  labelKo: string;
  description: string;
}

/** Shared situation filters for intermediate (words) and advanced (sentences). */
export const SITUATION_CATEGORIES: SituationCategory[] = [
  {
    id: "greeting",
    labelKo: "인사·예절",
    description: "만남, 감사, 사과",
  },
  {
    id: "restaurant",
    labelKo: "식당·카페",
    description: "주문, 계산, 음식",
  },
  {
    id: "shopping",
    labelKo: "쇼핑",
    description: "가게, 가격, 결제",
  },
  {
    id: "transport",
    labelKo: "교통",
    description: "전철, 버스, 택시",
  },
  {
    id: "hotel",
    labelKo: "숙소",
    description: "체크인, 편의시설",
  },
  {
    id: "directions",
    labelKo: "길 묻기",
    description: "위치, 방향",
  },
  {
    id: "school",
    labelKo: "학교·공부",
    description: "교실, 친구, 공부",
  },
  {
    id: "daily",
    labelKo: "일상",
    description: "집, 시간, 날씨",
  },
  {
    id: "family",
    labelKo: "가족·사람",
    description: "가족, 호칭",
  },
  {
    id: "help",
    labelKo: "도움 요청",
    description: "곤란할 때 쓰는 말",
  },
];

export function allCategoryIds(): string[] {
  return SITUATION_CATEGORIES.map((c) => c.id);
}

export function getCategoryLabel(id: string): string {
  return SITUATION_CATEGORIES.find((c) => c.id === id)?.labelKo ?? id;
}
