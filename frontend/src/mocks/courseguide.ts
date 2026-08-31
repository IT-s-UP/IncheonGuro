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
];
