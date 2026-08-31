export type FestivalDistrict =
  | '제물포구'
  | '영종구'
  | '미추홀구'
  | '연수구'
  | '남동구'
  | '부평구'
  | '계양구'
  | '서해구'
  | '검단구'
  | '강화군'
  | '옹진군';

export interface FestivalItem {
  id: number;

  district: FestivalDistrict;

  name: string;

  address: string;

  contact: string;

  description: string;

  posterUrl?: string;

  featured?: boolean;
}
