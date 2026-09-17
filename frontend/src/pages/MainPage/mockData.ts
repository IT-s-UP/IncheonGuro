import type { RegionCard } from './types';

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
