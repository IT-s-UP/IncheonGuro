export interface StampItem {
  id: number;

  region: string;

  festivalName?: string;

  /*
   * 사용자가 획득했는지 여부
   */
  owned: boolean;
}

export interface BadgeItem {
  id: number;

  name: string;

  imageUrl?: string;

  /*
   * 사용자가 획득했는지 여부
   */
  owned: boolean;
}

/* =========================
   사용자 정보
========================= */

export const STAMP_USER = {
  nickname: 'OOO',
};

/* =========================
   전체 스탬프
========================= */

export const STAMP_MOCK_DATA: StampItem[] = [
  {
    id: 1,
    region: '강화군',
    festivalName: '강화 고려인삼축제',
    owned: true,
  },

  {
    id: 2,
    region: '검단구',
    festivalName: '검단 가족문화축제',
    owned: true,
  },

  {
    id: 3,
    region: '계양구',
    festivalName: '계양산 국악제',
    owned: false,
  },

  {
    id: 4,
    region: '남동구',
    festivalName: '소래포구 축제',
    owned: true,
  },

  {
    id: 5,
    region: '미추홀구',
    festivalName: '주안미디어문화축제',
    owned: false,
  },

  {
    id: 6,
    region: '부평구',
    festivalName: '부평풍물대축제',
    owned: false,
  },

  {
    id: 7,
    region: '서해구',
    festivalName: '서해 노을축제',
    owned: false,
  },

  {
    id: 8,
    region: '연수구',
    festivalName: '송도 바다축제',
    owned: true,
  },

  {
    id: 9,
    region: '영종구',
    festivalName: '영종 바다축제',
    owned: false,
  },

  {
    id: 10,
    region: '옹진군',
    festivalName: '옹진 섬 문화축제',
    owned: false,
  },

  {
    id: 11,
    region: '제물포구',
    festivalName: '개항장 문화축제',
    owned: false,
  },
];

/* =========================
   전체 배지
========================= */

export const BADGE_MOCK_DATA: BadgeItem[] = [
  {
    id: 1,
    name: '첫 여행 배지',
    owned: true,
  },

  {
    id: 2,
    name: '바다 여행 배지',
    owned: true,
  },

  {
    id: 3,
    name: '축제 탐험가 배지',
    owned: false,
  },

  {
    id: 4,
    name: '인천 여행자 배지',
    owned: true,
  },

  {
    id: 5,
    name: '섬 여행 배지',
    owned: false,
  },

  {
    id: 6,
    name: '문화 탐험 배지',
    owned: false,
  },

  {
    id: 7,
    name: '맛집 탐험 배지',
    owned: false,
  },

  {
    id: 8,
    name: '인천 마스터 배지',
    owned: false,
  },

  {
    id: 9,
    name: '스탬프 마스터 배지',
    owned: false,
  },
];
