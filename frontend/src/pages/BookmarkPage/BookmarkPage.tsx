import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bookmark } from 'lucide-react';

import Header from '@/components/Header/Header';
import BackHeader from '@/components/Header/BackHeader';
import Typography from '@/components/Typography/Typography';
import PlaceCard from '@/components/PlaceGuide/PlaceCard'; // 장소 카드는 place-guide의 PlaceCard 그대로 재사용

import { getBookmarkedPlaces, removeBookmark } from '@/api/placeGuide';
import type { PlaceSummary } from '@/api/placeGuide';
import { getCourses } from '@/api/courseGuide';
import type { CourseSummary } from '@/api/courseGuide';

import './BookmarkPage.css';

function BookmarkPage() {
  const navigate = useNavigate();

  const [places, setPlaces] = useState<PlaceSummary[]>([]);
  const [courses, setCourses] = useState<CourseSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    Promise.all([
      getBookmarkedPlaces(),
      getCourses(), // 전용 북마크 API가 없어서, 전체 목록 중 isBookmarked만 걸러 씀
    ])
      .then(([placeList, courseList]) => {
        if (cancelled) return;
        setPlaces(placeList);
        setCourses(courseList.filter((course) => course.isBookmarked));
      })
      .catch((error) => {
        console.error('북마크 조회 실패:', error);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // PlaceCard의 북마크 아이콘을 눌러서 바로 해제 - 목록에서도 즉시 제거
  const handleUnbookmarkPlace = async (placeId: string) => {
    try {
      await removeBookmark(placeId);
      setPlaces((previous) => previous.filter((place) => place.placeId !== placeId));
    } catch (error) {
      console.error('북마크 해제 실패:', error);
    }
  };

  // // 코스 이름이 일정 글자 수를 넘으면 뒤를 "..."으로 생략
  // const COURSE_NAME_MAX_LENGTH = 25;

  // function truncateCourseName(name: string) {
  //   if (name.length <= COURSE_NAME_MAX_LENGTH) {
  //     return name;
  //   }
  //   return `${name.slice(0, COURSE_NAME_MAX_LENGTH)}...`;
  // }

  return (
    <div className="bookmark-page">
      <Header />
      <BackHeader title="북마크 목록" onBack={() => navigate(-1)} />

      {isLoading ? (
        <p className="bookmark-page__empty">불러오는 중...</p>
      ) : (
        <>
          <section className="bookmark-page__section">
            <Typography as="h2" variant="head2" className="bookmark-page__section-title">
              장소
            </Typography>

            {places.length === 0 ? (
              <p className="bookmark-page__empty">북마크한 장소가 없습니다.</p>
            ) : (
              <div className="bookmark-page__place-list">
                {places.map((place) => (
                  <PlaceCard
                    key={place.placeId}
                    title={place.title}
                    subtitle={place.subtitle}
                    imageUrl={place.imageUrl}
                    bookmarked
                    onClick={() => navigate(`/place-guide/${place.placeId}`)}
                    onBookmarkClick={() => handleUnbookmarkPlace(place.placeId)}
                  />
                ))}
              </div>
            )}
          </section>

          <section className="bookmark-page__section">
            <Typography as="h2" variant="head2" className="bookmark-page__section-title">
              코스
            </Typography>

            {courses.length === 0 ? (
              <p className="bookmark-page__empty">북마크한 코스가 없습니다.</p>
            ) : (
              <ul className="bookmark-page__course-list">
                {courses.map((course) => (
                  <li key={course.courseId}>
                    <button
                      type="button"
                      className="bookmark-page__course-card"
                      onClick={() => navigate(`/course-guide/${course.courseId}`)}
                    >
                      <Bookmark
                        size={18}
                        fill="currentColor"
                        className="bookmark-page__course-icon"
                      />

                      <Typography
                        as="strong"
                        variant="head3"
                        className="bookmark-page__course-name"
                      >
                        {course.name}
                      </Typography>
                      <Typography as="p" variant="p3" className="bookmark-page__course-desc">
                        {course.description}
                      </Typography>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}
    </div>
  );
}

export default BookmarkPage;
