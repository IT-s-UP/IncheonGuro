import ganghwa from './Mascot/강화군마스코트.png';
import geomdan from './Mascot/검단구마스코트.png';
import gyeyang from './Mascot/계양구마스코트.png';
import namdong from './Mascot/남동구마스코트.png';
import michuhol from './Mascot/미추홀구마스코트.png';
import bupyeong from './Mascot/부평구마스코트.webp';
import seohae from './Mascot/서해구마스코트.png';
import yeonsu from './Mascot/연수구마스코트.png';
import yeongjong from './Mascot/영종구마스코트.png';
import ongjin from './Mascot/옹진군마스코트.png';
import jemulpo from './Mascot/제물포구마스코트.png';

export interface Mascot {
  key: string;
  name: string;
  imageUrl: string;
}

export const MASCOTS: Mascot[] = [
  { key: 'ganghwa', name: '강화군', imageUrl: ganghwa },
  { key: 'geomdan', name: '검단구', imageUrl: geomdan },
  { key: 'gyeyang', name: '계양구', imageUrl: gyeyang },
  { key: 'namdong', name: '남동구', imageUrl: namdong },
  { key: 'michuhol', name: '미추홀구', imageUrl: michuhol },
  { key: 'bupyeong', name: '부평구', imageUrl: bupyeong },
  { key: 'seohae', name: '서해구', imageUrl: seohae },
  { key: 'yeonsu', name: '연수구', imageUrl: yeonsu },
  { key: 'yeongjong', name: '영종구', imageUrl: yeongjong },
  { key: 'ongjin', name: '옹진군', imageUrl: ongjin },
  { key: 'jemulpo', name: '제물포구', imageUrl: jemulpo },
];

export function mascotImageOf(key: string | null): string | null {
  return MASCOTS.find((mascot) => mascot.key === key)?.imageUrl ?? null;
}

export function mascotKeyOfRegionName(regionName: string | null): string | null {
  return MASCOTS.find((mascot) => mascot.name === regionName)?.key ?? null;
}
