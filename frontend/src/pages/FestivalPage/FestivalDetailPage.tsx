import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import Header from '@/components/Header/Header';
import BackHeader from '@/components/Header/BackHeader';
import Button from '@/components/Button/Button';
import Typography from '@/components/Typography/Typography';
import SingleCard from '@/components/Card/SingleCard';

import { apiFetch } from '@/auth/api';

import './FestivalDetailPage.css';

/* =========================
   축제 상세 API 응답 타입
========================= */

interface FestivalDetail {
  contentId?: string;
  title: string;
  imageUrl: string;
  location: string;
  tel: string;
  description: string;
  startDate: string;
  endDate: string;
}

/* =========================
   내 코스 API 타입
========================= */

interface CoursePlace {
  id: number;
  name: string;
  address: string;
}

interface CourseDay {
  id: number;
  day: number;
  transport: string;
  places: CoursePlace[];
  costs: {
    transportation: number;
    food: number;
    admission: number;
    etc: number;
  };
}

interface Course {
  id: number;
  name: string;
  days: CourseDay[];
  createdAt?: string;
  updatedAt?: string;
}

/* =========================
   API 주소
========================= */

const API_BASE_URL = 'http://localhost:8080';

/* =========================
   + 아이콘
========================= */

function PlusCircleIcon() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true" className="festival-detail-add-icon">
      <circle cx="10" cy="10" r="7" fill="none" stroke="currentColor" strokeWidth="1.5" />

      <path
        d="M10 6.5V13.5M6.5 10H13.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

/* =========================
   날짜 형식 변경
   20261002 → 2026.10.02
========================= */

function formatDate(date: string) {
  if (!date || date.length !== 8) {
    return date;
  }

  return `${date.slice(0, 4)}.${date.slice(4, 6)}.${date.slice(6, 8)}`;
}

/* =========================
   FestivalDetailPage
========================= */

function FestivalDetailPage() {
  const navigate = useNavigate();

  const { festivalId } = useParams<{ festivalId: string }>();

  /* =========================
     축제 상태
  ========================= */

  const [festival, setFestival] = useState<FestivalDetail | null>(null);

  const [isLoading, setIsLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  /* =========================
     내 코스 모달 상태
  ========================= */

  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);

  const [courses, setCourses] = useState<Course[]>([]);

  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  const [isCoursesLoading, setIsCoursesLoading] = useState(false);

  const [isAdding, setIsAdding] = useState(false);

  const [courseModalError, setCourseModalError] = useState<string | null>(null);

  /* =========================
     추가 성공 메시지
  ========================= */

  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  /* =========================
     축제 상세 조회
  ========================= */

  useEffect(() => {
    if (!festivalId) {
      setError('축제 정보를 찾을 수 없습니다.');
      setIsLoading(false);
      return;
    }

    const fetchFestivalDetail = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch(`${API_BASE_URL}/festivals/${festivalId}`);

        if (!response.ok) {
          throw new Error(`축제 상세 조회에 실패했습니다. (${response.status})`);
        }

        const data: FestivalDetail = await response.json();

        setFestival(data);
      } catch (error) {
        console.error('축제 상세 조회 실패:', error);

        setError('축제 / 행사 정보를 불러오지 못했습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchFestivalDetail();
  }, [festivalId]);

  /* =========================
     내 코스 조회
  ========================= */

  const fetchCourses = async () => {
    try {
      setIsCoursesLoading(true);
      setCourseModalError(null);

      const response = await apiFetch('/api/courses');

      if (!response.ok) {
        throw new Error(`내 코스 조회에 실패했습니다. (${response.status})`);
      }

      const data: Course[] = await response.json();

      setCourses(data);
    } catch (error) {
      console.error('내 코스 조회 실패:', error);

      setCourseModalError('내 코스 정보를 불러오지 못했습니다.');
    } finally {
      setIsCoursesLoading(false);
    }
  };

  /* =========================
     내 코스에 추가 버튼
  ========================= */

  const handleAddToCourse = async () => {
    setIsCourseModalOpen(true);
    setSelectedCourse(null);
    setSuccessMessage(null);
    setCourseModalError(null);

    await fetchCourses();
  };

  /* =========================
     코스 선택
  ========================= */

  const handleSelectCourse = (course: Course) => {
    setSelectedCourse(course);
    setSuccessMessage(null);
    setCourseModalError(null);
  };

  /* =========================
     코스 다시 선택
  ========================= */

  const handleBackToCourseList = () => {
    setSelectedCourse(null);
    setSuccessMessage(null);
    setCourseModalError(null);
  };

  /* =========================
     모달 닫기
  ========================= */

  const handleCloseCourseModal = () => {
    if (isAdding) {
      return;
    }

    setIsCourseModalOpen(false);
    setSelectedCourse(null);
    setSuccessMessage(null);
    setCourseModalError(null);
  };

  /* =========================
     축제를 DAY에 추가
  ========================= */

  const handleAddFestivalToDay = async (dayNumber: number) => {
    if (!selectedCourse || !festival) {
      return;
    }

    try {
      setIsAdding(true);
      setCourseModalError(null);

      /*
       * 기존 코스의 모든 DAY 유지
       * 선택한 DAY의 마지막 장소에 축제 추가
       *
       * 중복 체크를 하지 않기 때문에
       * 같은 축제도 여러 번 추가 가능
       */

      const updatedDays = selectedCourse.days.map((day) => {
        if (day.day !== dayNumber) {
          return {
            day: day.day,
            transport: day.transport,
            places: day.places.map((place) => ({
              name: place.name,
              address: place.address,
            })),
            costs: {
              transportation: day.costs.transportation,
              food: day.costs.food,
              admission: day.costs.admission,
              etc: day.costs.etc,
            },
          };
        }

        return {
          day: day.day,
          transport: day.transport,

          places: [
            ...day.places.map((place) => ({
              name: place.name,
              address: place.address,
            })),

            {
              name: festival.title,
              address: festival.location,
            },
          ],

          costs: {
            transportation: day.costs.transportation,
            food: day.costs.food,
            admission: day.costs.admission,
            etc: day.costs.etc,
          },
        };
      });

      const response = await apiFetch(`/api/courses/${selectedCourse.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: selectedCourse.name,
          days: updatedDays,
        }),
      });

      if (!response.ok) {
        const responseBody = await response.json().catch(() => null);

        throw new Error(responseBody?.message ?? `축제 추가에 실패했습니다. (${response.status})`);
      }

      /* =========================
         추가 성공
      ========================= */

      setSuccessMessage(
        `${selectedCourse.name}의 DAY ${dayNumber}에 "${festival.title}"이(가) 추가되었습니다.`,
      );

      /* =========================
         변경된 코스 다시 조회
      ========================= */

      const updatedCourseResponse = await apiFetch(`/api/courses/${selectedCourse.id}`);

      if (updatedCourseResponse.ok) {
        const updatedCourse: Course = await updatedCourseResponse.json();

        setSelectedCourse(updatedCourse);

        setCourses((prevCourses) =>
          prevCourses.map((course) => (course.id === updatedCourse.id ? updatedCourse : course)),
        );
      }
    } catch (error) {
      console.error('축제 추가 실패:', error);

      setCourseModalError(
        error instanceof Error ? error.message : '축제를 코스에 추가하지 못했습니다.',
      );
    } finally {
      setIsAdding(false);
    }
  };

  /* =========================
     성공 확인
  ========================= */

  const handleConfirmSuccess = () => {
    setIsCourseModalOpen(false);
    setSelectedCourse(null);
    setSuccessMessage(null);
    setCourseModalError(null);
  };

  /* =========================
     로딩
  ========================= */

  if (isLoading) {
    return (
      <div className="festival-detail-page">
        <Header />

        <main className="festival-detail-content">
          <BackHeader title="축제 / 행사 정보" onBack={() => navigate(-1)} />

          <div className="festival-detail-empty">
            <Typography variant="p2">축제 / 행사 정보를 불러오는 중입니다.</Typography>
          </div>
        </main>
      </div>
    );
  }

  /* =========================
     에러
  ========================= */

  if (error || !festival) {
    return (
      <div className="festival-detail-page">
        <Header />

        <main className="festival-detail-content">
          <BackHeader title="축제 / 행사 정보" onBack={() => navigate(-1)} />

          <div className="festival-detail-empty">
            <Typography variant="p2">{error ?? '축제 / 행사 정보를 찾을 수 없습니다.'}</Typography>
          </div>
        </main>
      </div>
    );
  }

  /* =========================
     화면
  ========================= */

  return (
    <div className="festival-detail-page">
      <Header />

      <main className="festival-detail-content">
        <BackHeader title="축제 / 행사 정보" onBack={() => navigate(-1)} />

        <section className="festival-detail-main">
          {/* =========================
              포스터
          ========================= */}

          <div className="festival-detail-poster">
            {festival.imageUrl ? (
              <img src={festival.imageUrl} alt={`${festival.title} 포스터`} />
            ) : (
              <Typography variant="p0">축제 포스터</Typography>
            )}
          </div>

          {/* =========================
              축제 이름
          ========================= */}

          <Typography as="h1" variant="head2" className="festival-detail-title">
            {festival.title}
          </Typography>

          {/* =========================
              상세정보
          ========================= */}

          <div className="festival-detail-info">
            <div className="festival-detail-info-card">
              <Typography as="h3" variant="head3" className="festival-detail-info-card__title">
                주소
              </Typography>

              <Typography
                as="p"
                variant="subtitle2"
                color="#666666"
                className="festival-detail-info-card__content"
              >
                {festival.location}
              </Typography>
            </div>

            <div className="festival-detail-info-card">
              <Typography as="h3" variant="head3" className="festival-detail-info-card__title">
                연락처
              </Typography>

              <Typography
                as="p"
                variant="subtitle2"
                color="#666666"
                className="festival-detail-info-card__content"
              >
                {festival.tel || '정보 없음'}
              </Typography>
            </div>

            <div className="festival-detail-info-card">
              <Typography as="h3" variant="head3" className="festival-detail-info-card__title">
                행사 기간
              </Typography>

              <Typography
                as="p"
                variant="subtitle2"
                color="#666666"
                className="festival-detail-info-card__content"
              >
                {formatDate(festival.startDate)}
                {' ~ '}
                {formatDate(festival.endDate)}
              </Typography>
            </div>

            <div className="festival-detail-info-card festival-detail-info-card--description">
              <Typography as="h3" variant="head3" className="festival-detail-info-card__title">
                축제 소개
              </Typography>

              <Typography
                as="p"
                variant="subtitle2"
                color="#666666"
                className="festival-detail-info-card__content"
              >
                {festival.description}
              </Typography>
            </div>
          </div>
        </section>

        {/* =========================
            내 코스에 추가
        ========================= */}

        <div className="festival-detail-bottom">
          <Button size="main" variant="primary" onClick={handleAddToCourse}>
            <span className="festival-detail-add-button">
              <PlusCircleIcon />
              <span>내 코스에 추가하기</span>
            </span>
          </Button>
        </div>
      </main>

      {/* =====================================================
          내 코스에 추가 모달
      ===================================================== */}

      {isCourseModalOpen && (
        <div
          className="festival-course-modal-overlay"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              handleCloseCourseModal();
            }
          }}
        >
          <div
            className="festival-course-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="festival-course-modal-title"
          >
            {/* =========================
                모달 헤더
            ========================= */}

            <div className="festival-course-modal__header">
              <Typography as="h2" variant="head2" className="festival-course-modal__title">
                내 코스에 추가
              </Typography>

              <button
                type="button"
                className="festival-course-modal__close"
                onClick={handleCloseCourseModal}
                disabled={isAdding}
                aria-label="닫기"
              >
                ×
              </button>
            </div>

            {/* =========================
                성공 화면
            ========================= */}

            {successMessage ? (
              <div className="festival-course-success">
                <Typography variant="p2" className="festival-course-success__message">
                  {successMessage}
                </Typography>

                <Button size="small" variant="primary" onClick={handleConfirmSuccess}>
                  확인
                </Button>
              </div>
            ) : selectedCourse ? (
              /* =========================
                 DAY 선택
              ========================= */

              <div className="festival-day-select">
                <div className="festival-day-select-header">
                  <Typography as="h3" variant="head3" className="festival-day-course-name">
                    {selectedCourse.name}
                  </Typography>

                  <Typography
                    variant="subtitle3"
                    color="#666666"
                    className="festival-day-select-description"
                  >
                    축제를 추가할 DAY를 선택해주세요.
                  </Typography>
                </div>

                <div className="festival-day-list">
                  {selectedCourse.days.map((day) => (
                    <button
                      key={day.id}
                      type="button"
                      className="festival-day-item"
                      onClick={() => handleAddFestivalToDay(day.day)}
                      disabled={isAdding}
                    >
                      <Typography as="span" variant="head3" className="festival-day-item__day">
                        DAY {day.day}
                      </Typography>

                      <div className="festival-day-item__right">
                        <Typography as="span" variant="subtitle3" color="#888888">
                          장소 {day.places.length}개
                        </Typography>

                        <span className="festival-day-arrow">›</span>
                      </div>
                    </button>
                  ))}
                </div>

                {/* =========================
                    코스 다시 선택
                ========================= */}

                <button
                  type="button"
                  className="festival-course-reselect"
                  onClick={handleBackToCourseList}
                  disabled={isAdding}
                >
                  코스 다시 선택
                </button>
              </div>
            ) : (
              /* =========================
                 코스 선택
              ========================= */

              <div className="festival-course-select">
                <Typography variant="p2" className="festival-course-select__description">
                  추가할 내 코스를 선택해주세요.
                </Typography>

                {isCoursesLoading ? (
                  <div className="festival-course-modal__empty">
                    <Typography variant="p2">내 코스를 불러오는 중입니다.</Typography>
                  </div>
                ) : courseModalError ? (
                  <div className="festival-course-modal__empty">
                    <Typography variant="p2">{courseModalError}</Typography>
                  </div>
                ) : courses.length === 0 ? (
                  <div className="festival-course-modal__empty">
                    <Typography variant="p2">등록된 내 코스가 없습니다.</Typography>
                  </div>
                ) : (
                  <div className="festival-course-list">
                    {courses.map((course) => (
                      <div
                        key={course.id}
                        className="festival-course-card-wrapper"
                        onClick={() => handleSelectCourse(course)}
                      >
                        <SingleCard title={course.name} subtitle={`${course.days.length}일 일정`} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* =========================
                에러
            ========================= */}

            {courseModalError && selectedCourse && !successMessage && (
              <div className="festival-course-modal__error">
                <Typography variant="p2">{courseModalError}</Typography>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default FestivalDetailPage;
