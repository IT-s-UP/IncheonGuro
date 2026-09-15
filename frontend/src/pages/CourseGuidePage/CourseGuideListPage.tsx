// 코스 안내 페이지 - 코스 추천 / 코스 목록 탭
import { useEffect, useState } from 'react';
import { RotateCw } from 'lucide-react';
import './CourseGuideListPage.css';

import Header from '@/components/Header/Header';
import CourseGuideCourseList from '@/components/CourseGuide/CourseGuideCourseList';
import Button from '@/components/Button/Button';
import CourseGuideBackButton from '@/components/CourseGuide/CourseGuideBackButton';
import CourseGuideTab from '@/components/CourseGuide/CourseGuideTab';
import type { CourseGuideTabType } from '@/components/CourseGuide/CourseGuideTab';
import CourseGuideSearchBox from '@/components/CourseGuide/CourseGuideSearchBox';
import CourseGuideRouteList from '@/components/CourseGuide/CourseGuideRouteList';
import CourseGuideMiniMap from '@/components/CourseGuide/CourseGuideMiniMap';
import { getCourseDetail, getRecommendedCourses } from '@/api/courseGuide';
import type { CourseSummary, Place } from '@/api/courseGuide';

function CourseGuideListPage() {
  // 탭 상태 변경 [코스 추천 | 코스 목록]
  const [activeTab, setActiveTab] = useState<CourseGuideTabType>('recommend');

  // 검색어 - 입력창 값(keyword)과, 실제로 검색 실행된 값(submittedKeyword)을 분리
  // Enter/아이콘 클릭 전까지는 목록에 영향 안 주기 위함
  const [keyword, setKeyword] = useState('');
  const [submittedKeyword, setSubmittedKeyword] = useState('');

  // 오늘의 추천 코스 5개
  const [recommendedCourses, setRecommendedCourses] = useState<CourseSummary[]>([]);
  const [recommendIndex, setRecommendIndex] = useState(0);
  const [isRecommendLoading, setIsRecommendLoading] = useState(true);

  // 지금 보여지는 추천 코스의 장소 목록. courseId별로 캐싱해서 같은 코스 재조회 방지
  const [placesByCourseId, setPlacesByCourseId] = useState<Record<string, Place[]>>({});
  const [isPlacesLoading, setIsPlacesLoading] = useState(false);

  const totalRecommend = recommendedCourses.length;
  const currentCourse = recommendedCourses[recommendIndex];

  // 오늘의 추천 코스 5개를 최초 1회 조회
  useEffect(() => {
    getRecommendedCourses()
      .then(setRecommendedCourses)
      .catch(() => setRecommendedCourses([]))
      .finally(() => setIsRecommendLoading(false));
  }, []);

  // 지금 보여지는 추천 코스의 장소 목록을, 아직 안 불러왔으면 상세 조회로 가져옴
  // (백엔드 CourseSummary엔 장소 목록이 없어서, 상세 API의 routes.walk에서 place 노드만 뽑아 씀)
  useEffect(() => {
    if (!currentCourse || placesByCourseId[currentCourse.courseId]) {
      return;
    }

    let isCancelled = false;
    setIsPlacesLoading(true);

    getCourseDetail(currentCourse.courseId)
      .then((detail) => {
        if (isCancelled) return;

        const places: Place[] = detail.routes.walk
          .filter((node) => node.type === 'place')
          .map((node) => ({
            name: node.name,
            address: node.address,
            latitude: node.latitude,
            longitude: node.longitude,
          }));

        setPlacesByCourseId((previous) => ({ ...previous, [currentCourse.courseId]: places }));
      })
      .catch(() => {
        if (!isCancelled) {
          setPlacesByCourseId((previous) => ({ ...previous, [currentCourse.courseId]: [] }));
        }
      })
      .finally(() => {
        if (!isCancelled) {
          setIsPlacesLoading(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [currentCourse, placesByCourseId]);

  // 버튼 클릭 시 다음 추천 코스로 이동, 마지막 다음엔 다시 처음으로 복귀
  const handleNextRecommend = () => {
    setRecommendIndex((previous) => (previous + 1) % totalRecommend);
  };

  // 검색 실행 - "코스 목록" 탭으로 전환하며 그 키워드로 필터링
  const handleSearchSubmit = () => {
    setSubmittedKeyword(keyword);
    setActiveTab('list');
  };

  const currentPlaces = currentCourse ? (placesByCourseId[currentCourse.courseId] ?? []) : [];

  return (
    <div className="course-guide-list-page">
      {/* 높이가 고정된 상단 영역: 헤더 + 뒤로가기 + 탭 + 검색창 */}
      <div className="course-guide-list-page__top">
        <Header />
        <CourseGuideBackButton />

        {/* 코스 추천 / 코스 목록 탭 버튼 컴포넌트 */}
        <CourseGuideTab activeTab={activeTab} onChange={setActiveTab} />

        {/* 검색창 컴포넌트 - Enter/아이콘 클릭 시 코스 목록 탭에서 검색 실행 */}
        <CourseGuideSearchBox value={keyword} onChange={setKeyword} onSubmit={handleSearchSubmit} />
      </div>

      {/* 남는 공간을 전부 차지하고, 내용이 넘치면 이 영역만 스크롤됨 */}
      <div className="course-guide-list-page__content">
        {/* activeTab이 'recommend'면 추천 코스 화면, 아니면 목록 화면을 보여줌 */}
        {activeTab === 'recommend' ? (
          <div className="recommend-view">
            {isRecommendLoading ? (
              <p style={{ textAlign: 'center', padding: '60px 0', color: '#828585' }}>
                추천 코스를 불러오는 중...
              </p>
            ) : !currentCourse ? (
              <p style={{ textAlign: 'center', padding: '60px 0', color: '#828585' }}>
                추천 코스가 없습니다.
              </p>
            ) : (
              <>
                <h2 className="course-name">{currentCourse.name}</h2>

                {/* 간략 지도 - 실제 연동 전까진 그냥 회색 박스 */}
                <CourseGuideMiniMap places={currentPlaces} />

                {/* 코스 경로 안내 컴포넌트 - 길어지면 스크롤 추가 */}
                {isPlacesLoading ? (
                  <p style={{ textAlign: 'center', color: '#828585' }}>
                    장소 정보를 불러오는 중...
                  </p>
                ) : (
                  <CourseGuideRouteList places={currentPlaces} />
                )}

                {/* "오늘의 추천 코스 n/전체" 버튼 - 누르면 다음 코스로 새로고침 */}
                <div className="recommend-button-wrap">
                  <Button size="main" variant="primary" onClick={handleNextRecommend}>
                    <span className="recommend-btn-content">
                      <RotateCw className="refresh-icon" size={25} />
                      오늘의 추천 코스 {recommendIndex + 1}/{totalRecommend}
                    </span>
                  </Button>
                </div>
              </>
            )}
          </div>
        ) : (
          <CourseGuideCourseList keyword={submittedKeyword} />
        )}
      </div>
    </div>
  );
}

export default CourseGuideListPage;
