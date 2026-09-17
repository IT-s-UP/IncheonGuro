export type IncheonRegion =
  | '강화군'
  | '검단구'
  | '계양구'
  | '남동구'
  | '미추홀구'
  | '부평구'
  | '서해구'
  | '연수구'
  | '영종구'
  | '옹진군'
  | '제물포구';

/* =========================
   지역 카드
========================= */

export interface RegionCard {
  id: number;

  name: IncheonRegion;

  mascotUrl?: string;
}
