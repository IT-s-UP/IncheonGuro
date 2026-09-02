export interface Place {
  id: number;
  title: string;
  subtitle: string; // 주소
  district: string; // 구
  category: '관광지' | '카페' | '식당' | '숙소' | '쇼핑';
  imageUrl?: string;
}

export const mockPlaces: Place[] = [
  {
    id: 1,
    title: '차이나타운',
    subtitle: '인천 중구 차이나타운로 12',
    district: '중구',
    category: '관광지',
  },
  {
    id: 2,
    title: '을왕리 해수욕장',
    subtitle: '인천 중구 을왕동 665-4',
    district: '중구',
    category: '관광지',
  },
  {
    id: 3,
    title: '청라 호수공원',
    subtitle: '인천 서구 청라동 123-1',
    district: '서구',
    category: '관광지',
  },
  {
    id: 4,
    title: '커널웨이 카페거리',
    subtitle: '인천 서구 청라커널로 66',
    district: '서구',
    category: '카페',
  },
  {
    id: 5,
    title: '계양산 둘레길',
    subtitle: '인천 계양구 계산동 산 8-1',
    district: '계양구',
    category: '관광지',
  },
  {
    id: 6,
    title: '한옥마을 밥상',
    subtitle: '인천 계양구 계양산로 45',
    district: '계양구',
    category: '식당',
  },
  {
    id: 7,
    title: '부평 문화의거리',
    subtitle: '인천 부평구 부평대로 20',
    district: '부평구',
    category: '쇼핑',
  },
  {
    id: 8,
    title: '호텔 인천 부평',
    subtitle: '인천 부평구 부평문화로 88',
    district: '부평구',
    category: '숙소',
  },
  {
    id: 9,
    title: '동인천 라이스 스테이',
    subtitle: '인천 동구 화도진로 9',
    district: '동구',
    category: '숙소',
  },
  {
    id: 10,
    title: '배다리 헌책방거리',
    subtitle: '인천 동구 창영동 43-1',
    district: '동구',
    category: '관광지',
  },
  {
    id: 11,
    title: '소래포구 어시장',
    subtitle: '인천 남동구 소래포구로 30',
    district: '남동구',
    category: '식당',
  },
  {
    id: 12,
    title: '인천대공원 카페',
    subtitle: '인천 남동구 무네미로 236',
    district: '남동구',
    category: '카페',
  },
  {
    id: 13,
    title: '수봉공원 국밥집',
    subtitle: '인천 미추홀구 수봉로 14',
    district: '미추홀구',
    category: '식당',
  },
  {
    id: 14,
    title: '미추홀 게스트하우스',
    subtitle: '인천 미추홀구 인주대로 100',
    district: '미추홀구',
    category: '숙소',
  },
  {
    id: 15,
    title: '송도 센트럴파크',
    subtitle: '인천 연수구 컨벤시아대로 160',
    district: '연수구',
    category: '관광지',
  },
  {
    id: 16,
    title: '송도 오션뷰 호텔',
    subtitle: '인천 연수구 송도과학로 32',
    district: '연수구',
    category: '숙소',
  },
];
