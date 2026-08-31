// 코스 안내 페이지 - 코스 목록 MOCK 데이터
export interface Place {
  name: string;
  address: string;
}

export interface Course {
  courseId: number;
  name: string;
  description: string;
  places: Place[];
}

export const mockCourses: Course[] = [
  {
    courseId: 1,
    name: '청라 호수공원 산책 코스',
    description: '청라국제도시의 호수와 공원을 여유롭게 둘러보는 코스입니다.',
    places: [
      { name: '청라호수공원', address: '인천 서구 청라동' },
      { name: '커널웨이', address: '인천 서구 청라커널로' },
      { name: '청라시티타워', address: '인천 서구 로봇랜드로' },
      { name: '청라국제업무단지', address: '인천 서구 로봇랜드로' }, // 경유지 하나 추가
    ],
  },
  {
    courseId: 2,
    name: '송도 센트럴파크 나들이',
    description: '송도국제도시의 랜드마크와 공원을 함께 즐기는 코스입니다.',
    places: [
      { name: '센트럴파크', address: '인천 연수구 컨벤시아대로' },
      { name: '트리플스트리트', address: '인천 연수구 송도과학로' },
      { name: '인천대교 전망대', address: '인천 연수구 아암대로' },
      { name: '송도국제도시홍보관', address: '인천 연수구 컨벤시아대로' }, // 경유지 하나 추가
      { name: '달빛축제공원', address: '인천 연수구 컨벤시아대로' }, // 하나 더 추가
    ],
  },
  {
    courseId: 3,
    name: '차이나타운 문화 탐방',
    description: '이국적인 거리와 근대 문화유산을 함께 둘러보는 코스입니다.',
    places: [
      { name: '인천차이나타운', address: '인천 중구 차이나타운로' },
      { name: '자유공원', address: '인천 중구 응봉산길' },
      { name: '신포국제시장', address: '인천 중구 신포로' },
    ],
  },
  {
    courseId: 4,
    name: '소래포구 미식 여행',
    description: '싱싱한 해산물과 갯벌 풍경을 함께 즐기는 코스입니다.',
    places: [
      { name: '소래포구', address: '인천 남동구 소래포구로' },
      { name: '소래습지생태공원', address: '인천 남동구 propose논현동' },
      { name: '소래철교', address: '인천 남동구 소래역로' },
    ],
  },
  {
    courseId: 5,
    name: '월미도 바다 여행',
    description: '바다를 배경으로 놀이시설과 거리를 즐기는 코스입니다.',
    places: [
      { name: '월미테마파크', address: '인천 중구 월미문화로' },
      { name: '월미바다열차', address: '인천 중구 월미로' },
      { name: '월미문화의거리', address: '인천 중구 월미문화의거리' },
    ],
  },
  {
    courseId: 6,
    name: '강화도 역사 탐방',
    description: '고려산과 강화역사관을 함께 둘러보는 역사 여행 코스입니다.',
    places: [
      { name: '강화역사박물관', address: '인천 강화군 하점면' },
      { name: '고려산', address: '인천 강화군 강화읍' },
      { name: '전등사', address: '인천 강화군 길상면' },
    ],
  },
  {
    courseId: 7,
    name: '을왕리 해변 드라이브',
    description: '서해 낙조와 해변 산책을 즐길 수 있는 드라이브 코스입니다.',
    places: [
      { name: '을왕리해수욕장', address: '인천 중구 을왕동' },
      { name: '왕산해수욕장', address: '인천 중구 을왕동' },
      { name: '마시란해변', address: '인천 중구 마시란로' },
    ],
  },
  {
    courseId: 8,
    name: '구월동 로데오거리 쇼핑',
    description: '트렌디한 카페와 쇼핑거리를 즐기는 도심 나들이 코스입니다.',
    places: [
      { name: '구월동로데오거리', address: '인천 남동구 구월동' },
      { name: '인천시청', address: '인천 남동구 정각로' },
      { name: '인천종합문화예술회관', address: '인천 남동구 예술로' },
    ],
  },
  {
    courseId: 9,
    name: '영종도 하늘 산책',
    description: '공항 주변 자연과 전망대를 함께 즐기는 코스입니다.',
    places: [
      { name: '영종해변공원', address: '인천 중구 운서동' },
      { name: '왕산마리나', address: '인천 중구 왕산해안북로' },
      { name: '인천공항전망대', address: '인천 중구 공항로' },
    ],
  },
  {
    courseId: 10,
    name: '부평 문화의거리 탐방',
    description: '젊음의 거리와 지하상가를 함께 둘러보는 도심 코스입니다.',
    places: [
      { name: '부평문화의거리', address: '인천 부평구 부평동' },
      { name: '부평역지하상가', address: '인천 부평구 부평대로' },
      { name: '부평공원', address: '인천 부평구 부흥로' },
    ],
  },
];

// 오늘의 추천 코스 (전체 코스 중 엄선한 5개, 코스 추천 탭 전용)
export const mockRecommendedCourses: Course[] = [
  mockCourses[0], // 청라 호수공원 산책 코스
  mockCourses[1], // 송도 센트럴파크 나들이
  mockCourses[2], // 차이나타운 문화 탐방
  mockCourses[3], // 소래포구 미식 여행
  mockCourses[4], // 월미도 바다 여행
];
