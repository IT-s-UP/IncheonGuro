import type { RegionRecommendAnswers, RegionRecommendResult } from './types';

type RegionType = 'seohae' | 'jung' | 'yeonsu' | 'ganghwa';

/* =========================
   지역 추천 결과 목데이터
========================= */

const REGION_RESULTS: Record<RegionType, RegionRecommendResult> = {
  seohae: {
    id: 'seohae',
    regionName: '서해구',
    title: '도심과 자연을 함께 즐기는 여행자',
    description:
      '여유로운 공원부터 시장, 도심의 볼거리까지 다양하게 즐기고 싶은 당신에게 서해구를 추천드려요! 청라와 정서진을 중심으로 인천의 새로운 매력을 만나보세요.',
    recommendedPlaces: [
      {
        id: 1,
        name: '인천아시아드주경기장',
        category: '도심 / 여가',
        description: '넓은 공간과 주변 산책로를 함께 즐길 수 있는 장소',
      },
      {
        id: 2,
        name: '정서진 중앙시장',
        category: '시장 / 먹거리',
        description: '지역의 분위기와 다양한 먹거리를 즐길 수 있는 시장',
      },
      {
        id: 3,
        name: '청라호수공원',
        category: '공원 / 자연',
        description: '호수를 따라 산책하며 여유롭게 시간을 보내기 좋은 공원',
      },
    ],
  },

  jung: {
    id: 'jung',
    regionName: '중구',
    title: '먹거리와 감성, 역사를 좋아하는 여행자',
    description:
      '골목을 걸으며 맛집과 오래된 건물, 감성적인 장소를 발견하는 것을 좋아하는 당신에게 중구를 추천드려요! 인천의 개항 역사와 다양한 먹거리를 함께 경험해보세요.',
    recommendedPlaces: [
      {
        id: 4,
        name: '차이나타운',
        category: '맛집 / 관광',
        description: '다양한 중화요리와 볼거리를 함께 즐길 수 있는 거리',
      },
      {
        id: 5,
        name: '개항장 거리',
        category: '역사 / 문화',
        description: '인천 개항기의 건축물과 분위기를 느껴볼 수 있는 거리',
      },
      {
        id: 6,
        name: '월미도',
        category: '바다 / 관광',
        description: '바다와 놀이시설, 먹거리를 함께 즐길 수 있는 관광지',
      },
    ],
  },

  yeonsu: {
    id: 'yeonsu',
    regionName: '연수구',
    title: '핫플레이스와 도심 여행을 좋아하는 여행자',
    description:
      '예쁜 공간과 쇼핑, 야경처럼 세련된 도시 여행을 좋아하는 당신에게 연수구를 추천드려요! 송도를 중심으로 인천의 현대적인 분위기를 마음껏 즐겨보세요.',
    recommendedPlaces: [
      {
        id: 7,
        name: '송도 센트럴파크',
        category: '공원 / 야경',
        description: '도심 속에서 자연과 송도의 야경을 함께 즐길 수 있는 공원',
      },
      {
        id: 8,
        name: '트라이볼',
        category: '문화 / 핫플',
        description: '독특한 외관과 문화 콘텐츠를 함께 즐길 수 있는 공간',
      },
      {
        id: 9,
        name: '송도 현대프리미엄아울렛',
        category: '쇼핑',
        description: '쇼핑과 식사를 한 공간에서 즐기기 좋은 장소',
      },
    ],
  },

  ganghwa: {
    id: 'ganghwa',
    regionName: '강화군',
    title: '자연과 역사 속에서 쉬고 싶은 여행자',
    description:
      '복잡한 도심보다는 자연 속에서 여유롭게 시간을 보내고 역사적인 장소를 둘러보는 것을 좋아하는 당신에게 강화군을 추천드려요!',
    recommendedPlaces: [
      {
        id: 10,
        name: '전등사',
        category: '역사 / 문화',
        description: '강화도의 역사와 고즈넉한 분위기를 느낄 수 있는 사찰',
      },
      {
        id: 11,
        name: '강화풍물시장',
        category: '시장 / 먹거리',
        description: '강화도의 특색 있는 먹거리와 시장 분위기를 즐길 수 있는 장소',
      },
      {
        id: 12,
        name: '석모도',
        category: '자연 / 힐링',
        description: '바다와 자연을 여유롭게 즐기기 좋은 강화도의 섬',
      },
    ],
  },
};

/* =========================
   테스트용 추천 알고리즘
========================= */

export function getMockRegionResult(answers: RegionRecommendAnswers): RegionRecommendResult {
  const score: Record<RegionType, number> = {
    seohae: 0,
    jung: 0,
    yeonsu: 0,
    ganghwa: 0,
  };

  /* =========================
     1. 가장 가고 싶은 장소
  ========================= */

  switch (answers.place) {
    case '해변 / 섬':
      score.jung += 3;
      score.ganghwa += 3;
      break;

    case '공원 / 자연':
      score.seohae += 2;
      score.yeonsu += 2;
      score.ganghwa += 3;
      break;

    case '카페 / 핫플':
      score.yeonsu += 3;
      score.jung += 2;
      break;

    case '시장 / 골목':
      score.jung += 3;
      score.seohae += 2;
      break;

    case '전시 / 문화 공간':
      score.jung += 3;
      score.yeonsu += 2;
      break;

    case '쇼핑몰 / 번화가':
      score.yeonsu += 3;
      score.seohae += 2;
      break;

    case '맛집 / 먹자골목':
      score.jung += 3;
      score.seohae += 2;
      break;

    case '유적지 / 역사명소':
      score.ganghwa += 4;
      score.jung += 2;
      break;
  }

  /* =========================
     2. 이동 방식
  ========================= */

  switch (answers.moveType) {
    case '많이 걸어도 괜찮다':
      score.jung += 2;
      break;

    case '대중교통 위주':
      score.jung += 2;
      score.yeonsu += 2;
      score.seohae += 1;
      break;

    case '자차 위주':
      score.ganghwa += 3;
      score.seohae += 1;
      break;

    case '이동은 최소화':
      score.yeonsu += 2;
      score.seohae += 1;
      break;
  }

  /* =========================
     3. 여행 분위기
  ========================= */

  switch (answers.mood) {
    case '바다 / 자연':
      score.ganghwa += 3;
      score.jung += 2;
      break;

    case '감성 / 힐링':
      score.ganghwa += 3;
      score.yeonsu += 1;
      break;

    case '역사 / 문화':
      score.jung += 3;
      score.ganghwa += 3;
      break;

    case '맛집 / 먹방':
      score.jung += 3;
      score.seohae += 1;
      break;

    case '액티비티 / 체험':
      score.yeonsu += 2;
      score.ganghwa += 2;
      break;

    case '쇼핑 / 핫플레이스':
      score.yeonsu += 3;
      score.seohae += 1;
      break;

    case '도심 / 야경':
      score.yeonsu += 3;
      score.seohae += 2;
      break;

    case '레트로 / 빈티지':
      score.jung += 3;
      break;
  }

  /* =========================
     4. 동행인
  ========================= */

  switch (answers.companion) {
    case '혼자':
      score.jung += 1;
      score.ganghwa += 1;
      break;

    case '연인':
      score.yeonsu += 2;
      score.jung += 2;
      break;

    case '친구':
      score.yeonsu += 2;
      score.seohae += 1;
      break;

    case '가족':
      score.ganghwa += 2;
      score.seohae += 2;
      break;
  }

  /* 가장 높은 점수를 받은 지역 */
  const recommendedRegion = (Object.keys(score) as RegionType[]).reduce((best, current) =>
    score[current] > score[best] ? current : best,
  );

  return REGION_RESULTS[recommendedRegion];
}
