import type { CourseCard, IncheonRegion, RegionCard, SpotCard } from './types';

/* =========================
   마스코트 이미지
========================= */

import ganghwaMascot from '@/assets/Mascot/강화군마스코트.png';
import geomdanMascot from '@/assets/Mascot/검단구마스코트.png';
import gyeyangMascot from '@/assets/Mascot/계양구마스코트.png';
import namdongMascot from '@/assets/Mascot/남동구마스코트.png';
import michuholMascot from '@/assets/Mascot/미추홀구마스코트.png';
import bupyeongMascot from '@/assets/Mascot/부평구마스코트.webp';
import seohaeMascot from '@/assets/Mascot/서해구마스코트.png';
import yeonsuMascot from '@/assets/Mascot/연수구마스코트.png';
import yeongjongMascot from '@/assets/Mascot/영종구마스코트.png';
import ongjinMascot from '@/assets/Mascot/옹진군마스코트.png';
import jemulpoMascot from '@/assets/Mascot/제물포구마스코트.png';

/* =========================
   추천 지역
========================= */

export const RECOMMENDED_REGIONS: IncheonRegion[] = ['서해구', '제물포구'];

/* =========================
   추천 장소
========================= */

export const SPOT_CARDS: SpotCard[] = [
  /* 서해구 */

  {
    id: 1,
    name: '야생화 단지',
    tag: '관광지',
    region: '서해구',
  },
  {
    id: 2,
    name: '청라 하늘 대교',
    tag: '관광지',
    region: '서해구',
  },
  {
    id: 3,
    name: '정서진 중앙시장',
    tag: '쇼핑',
    region: '서해구',
  },

  /* 제물포구 */

  {
    id: 4,
    name: '개항장 거리',
    tag: '관광지',
    region: '제물포구',
  },
  {
    id: 5,
    name: '월미도',
    tag: '관광지',
    region: '제물포구',
  },
  {
    id: 6,
    name: '신포국제시장',
    tag: '쇼핑',
    region: '제물포구',
  },
];

/* =========================
   인천 전체 구 / 군
========================= */

export const REGION_CARDS: RegionCard[] = [
  {
    id: 1,
    name: '강화군',
    mascotUrl: ganghwaMascot,
  },
  {
    id: 2,
    name: '검단구',
    mascotUrl: geomdanMascot,
  },
  {
    id: 3,
    name: '계양구',
    mascotUrl: gyeyangMascot,
  },
  {
    id: 4,
    name: '남동구',
    mascotUrl: namdongMascot,
  },
  {
    id: 5,
    name: '미추홀구',
    mascotUrl: michuholMascot,
  },
  {
    id: 6,
    name: '부평구',
    mascotUrl: bupyeongMascot,
  },
  {
    id: 7,
    name: '서해구',
    mascotUrl: seohaeMascot,
  },
  {
    id: 8,
    name: '연수구',
    mascotUrl: yeonsuMascot,
  },
  {
    id: 9,
    name: '영종구',
    mascotUrl: yeongjongMascot,
  },
  {
    id: 10,
    name: '옹진군',
    mascotUrl: ongjinMascot,
  },
  {
    id: 11,
    name: '제물포구',
    mascotUrl: jemulpoMascot,
  },
];

/* =========================
   추천 코스
========================= */

export const COURSE_CARDS: CourseCard[] = [
  {
    id: 1,
    name: '개항로 투어 코스',
  },
  {
    id: 2,
    name: '차이나타운 구경 코스',
  },
  {
    id: 3,
    name: '오션뷰 산책 / 액티비티 코스',
  },
];
