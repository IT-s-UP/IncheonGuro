import type { CourseRecommendAnswers, CourseRecommendResult, CourseDay } from './types';

type CourseType = 'healing' | 'hotplace' | 'culture';

/* =========================
   코스별 하루 단위 목데이터
========================= */

const COURSE_DAY_TEMPLATES: Record<CourseType, CourseDay[]> = {
  healing: [
    {
      day: 1,
      title: '송도에서 여유롭게 시작하기',
      places: [
        {
          id: 1,
          name: '송도 센트럴파크',
          category: '자연',
          description: '도심 속에서 산책과 휴식을 즐길 수 있는 공간',
        },
        {
          id: 2,
          name: '트라이볼',
          category: '문화',
          description: '독특한 건축물과 함께 둘러보기 좋은 문화 공간',
        },
      ],
      costs: [
        {
          id: 1,
          label: '교통비',
          amount: 10000,
        },
        {
          id: 2,
          label: '식비',
          amount: 30000,
        },
        {
          id: 3,
          label: '입장료',
          amount: 10000,
        },
      ],
      totalCost: 50000,
    },

    {
      day: 2,
      title: '영종도의 바다 즐기기',
      places: [
        {
          id: 3,
          name: '을왕리 해수욕장',
          category: '바다',
          description: '바다를 바라보며 여유로운 시간을 보내기 좋은 장소',
        },
        {
          id: 4,
          name: '왕산마리나',
          category: '자연',
          description: '해안 풍경을 감상하며 산책하기 좋은 장소',
        },
      ],
      costs: [
        {
          id: 1,
          label: '교통비',
          amount: 15000,
        },
        {
          id: 2,
          label: '식비',
          amount: 35000,
        },
        {
          id: 3,
          label: '기타 비용',
          amount: 10000,
        },
      ],
      totalCost: 60000,
    },

    {
      day: 3,
      title: '청라에서 여행 마무리하기',
      places: [
        {
          id: 5,
          name: '청라호수공원',
          category: '자연',
          description: '호수를 따라 천천히 산책하기 좋은 공원',
        },
        {
          id: 6,
          name: '정서진',
          category: '관광',
          description: '인천의 노을을 감상하기 좋은 명소',
        },
      ],
      costs: [
        {
          id: 1,
          label: '교통비',
          amount: 10000,
        },
        {
          id: 2,
          label: '식비',
          amount: 25000,
        },
        {
          id: 3,
          label: '기타 비용',
          amount: 5000,
        },
      ],
      totalCost: 40000,
    },
  ],

  hotplace: [
    {
      day: 1,
      title: '개항장 감성 여행',
      places: [
        {
          id: 7,
          name: '개항장 거리',
          category: '핫플레이스',
          description: '인천의 개항기 분위기를 느낄 수 있는 거리',
        },
        {
          id: 8,
          name: '인천아트플랫폼',
          category: 'SNS 핫플레이스',
          description: '사진과 전시를 함께 즐길 수 있는 공간',
        },
      ],
      costs: [
        {
          id: 1,
          label: '교통비',
          amount: 10000,
        },
        {
          id: 2,
          label: '카페 / 식비',
          amount: 40000,
        },
        {
          id: 3,
          label: '체험 비용',
          amount: 15000,
        },
      ],
      totalCost: 65000,
    },

    {
      day: 2,
      title: '신포와 차이나타운 먹거리 여행',
      places: [
        {
          id: 9,
          name: '신포국제시장',
          category: '맛집',
          description: '다양한 인천 먹거리를 즐길 수 있는 시장',
        },
        {
          id: 10,
          name: '차이나타운',
          category: '맛집',
          description: '다양한 중화요리와 관광을 함께 즐길 수 있는 거리',
        },
      ],
      costs: [
        {
          id: 1,
          label: '교통비',
          amount: 8000,
        },
        {
          id: 2,
          label: '식비',
          amount: 45000,
        },
        {
          id: 3,
          label: '카페',
          amount: 15000,
        },
      ],
      totalCost: 68000,
    },

    {
      day: 3,
      title: '월미도에서 신나게 즐기기',
      places: [
        {
          id: 11,
          name: '월미도',
          category: '관광',
          description: '바다와 놀이시설을 함께 즐길 수 있는 관광지',
        },
        {
          id: 12,
          name: '월미문화의거리',
          category: '핫플레이스',
          description: '먹거리와 볼거리가 많은 활기찬 거리',
        },
      ],
      costs: [
        {
          id: 1,
          label: '교통비',
          amount: 10000,
        },
        {
          id: 2,
          label: '식비',
          amount: 30000,
        },
        {
          id: 3,
          label: '놀이시설',
          amount: 25000,
        },
      ],
      totalCost: 65000,
    },
  ],

  culture: [
    {
      day: 1,
      title: '인천 개항의 흔적 따라가기',
      places: [
        {
          id: 13,
          name: '개항박물관',
          category: '역사',
          description: '인천 개항기의 역사를 살펴볼 수 있는 공간',
        },
        {
          id: 14,
          name: '개항장 거리',
          category: '역사',
          description: '근대 건축물과 인천의 역사를 만날 수 있는 거리',
        },
      ],
      costs: [
        {
          id: 1,
          label: '교통비',
          amount: 8000,
        },
        {
          id: 2,
          label: '식비',
          amount: 25000,
        },
        {
          id: 3,
          label: '입장료',
          amount: 10000,
        },
      ],
      totalCost: 43000,
    },

    {
      day: 2,
      title: '문화와 예술 즐기기',
      places: [
        {
          id: 15,
          name: '인천아트플랫폼',
          category: '문화 / 예술',
          description: '전시와 다양한 문화 콘텐츠를 즐길 수 있는 공간',
        },
        {
          id: 16,
          name: '한국근대문학관',
          category: '문화',
          description: '한국 근대문학의 흐름을 살펴볼 수 있는 공간',
        },
      ],
      costs: [
        {
          id: 1,
          label: '교통비',
          amount: 8000,
        },
        {
          id: 2,
          label: '식비',
          amount: 30000,
        },
        {
          id: 3,
          label: '관람 비용',
          amount: 10000,
        },
      ],
      totalCost: 48000,
    },

    {
      day: 3,
      title: '강화도의 역사 만나기',
      places: [
        {
          id: 17,
          name: '강화도',
          category: '역사',
          description: '다양한 역사 유적을 만날 수 있는 인천의 대표 지역',
        },
        {
          id: 18,
          name: '강화풍물시장',
          category: '관광',
          description: '지역 특색과 전통시장 분위기를 즐길 수 있는 장소',
        },
      ],
      costs: [
        {
          id: 1,
          label: '교통비',
          amount: 15000,
        },
        {
          id: 2,
          label: '식비',
          amount: 30000,
        },
        {
          id: 3,
          label: '입장료',
          amount: 5000,
        },
      ],
      totalCost: 50000,
    },
  ],
};

/* =========================
   여행 일수 계산
========================= */

function getTravelDays(startDate: string, endDate: string) {
  const [startYear, startMonth, startDay] = startDate.split('-').map(Number);

  const [endYear, endMonth, endDay] = endDate.split('-').map(Number);

  const start = Date.UTC(startYear, startMonth - 1, startDay);

  const end = Date.UTC(endYear, endMonth - 1, endDay);

  const diff = end - start;

  return Math.floor(diff / (1000 * 60 * 60 * 24)) + 1;
}

/* =========================
   목 추천 알고리즘
========================= */

export function getMockCourseResult(answers: CourseRecommendAnswers): CourseRecommendResult {
  const score: Record<CourseType, number> = {
    healing: 0,
    hotplace: 0,
    culture: 0,
  };

  answers.travelStyles.forEach((style) => {
    if (style === '힐링' || style === '자연') {
      score.healing += 3;
    }

    if (style === '맛집 탐방' || style === '쇼핑' || style === 'SNS 핫플레이스') {
      score.hotplace += 3;
    }

    if (style === '관광' || style === '문화 / 예술 / 역사' || style === '체험 / 액티비티') {
      score.culture += 3;
    }
  });

  if (answers.scheduleType === '여유롭고 널널한, 적은 일정') {
    score.healing += 2;
  }

  if (answers.scheduleType === '빡빡하고 바쁜, 많은 일정') {
    score.hotplace += 1;
    score.culture += 1;
  }

  if (
    answers.companion === '가족' ||
    answers.companion === '아이' ||
    answers.companion === '부모님'
  ) {
    score.healing += 2;
  }

  if (answers.companion === '친구' || answers.companion === '연인') {
    score.hotplace += 2;
  }

  if (answers.companion === '혼자') {
    score.culture += 1;
    score.healing += 1;
  }

  if (answers.transport === '자차' || answers.transport === '공유차 / 렌터카') {
    score.healing += 1;
  }

  if (answers.transport === '대중교통' || answers.transport === '택시') {
    score.hotplace += 1;
  }

  if (answers.transport === '도보' || answers.transport === '자전거') {
    score.culture += 1;
  }

  const recommendedType = (Object.keys(score) as CourseType[]).reduce((best, current) =>
    score[current] > score[best] ? current : best,
  );

  const travelDays = getTravelDays(answers.startDate, answers.endDate);

  const templates = COURSE_DAY_TEMPLATES[recommendedType];

  /*
   * 테스트 단계이므로 3일보다 긴 여행은
   * 3개 템플릿을 반복해서 사용
   */
  const days = Array.from({ length: travelDays }, (_, index) => {
    const template = templates[index % templates.length];

    return {
      ...template,
      day: index + 1,

      places: template.places.map((place) => ({
        ...place,
        id: place.id + index * 100,
      })),

      costs: template.costs.map((cost) => ({
        ...cost,
        id: cost.id + index * 100,
      })),
    };
  });

  const courseInfo = {
    healing: {
      id: 'healing',
      title: '바다와 자연을 여유롭게 즐기는 코스',
      description: '힐링과 자연을 좋아하는 여행자에게 추천드리는 코스예요.',
      mapLabel: '힐링 맞춤 코스 지도',
    },

    hotplace: {
      id: 'hotplace',
      title: '맛집과 핫플레이스를 즐기는 코스',
      description: '맛있는 음식과 인천의 인기 장소를 중심으로 구성한 코스예요.',
      mapLabel: '핫플 맞춤 코스 지도',
    },

    culture: {
      id: 'culture',
      title: '인천의 역사와 문화를 발견하는 코스',
      description: '인천의 역사와 문화를 천천히 발견할 수 있는 코스예요.',
      mapLabel: '역사 · 문화 맞춤 코스 지도',
    },
  };

  return {
    ...courseInfo[recommendedType],
    days,
  };
}
