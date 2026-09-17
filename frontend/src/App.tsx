import { Route, Routes } from 'react-router-dom';
import { AuthProvider } from '@/auth/AuthContext';
import RequireAuth from '@/auth/RequireAuth';
import ScrollToTop from '@/components/ScrollToTop';

import MainPage from '@/pages/MainPage/MainPage';

import LoginPage from './pages/LoginPage/LoginPage';
import SignupPage from './pages/SignupPage/SignupPage';

import BookmarkPage from '@/pages/BookmarkPage/BookmarkPage'; // [추가]

import CourseGuideListPage from '@/pages/CourseGuidePage/CourseGuideListPage';
import CourseGuideDetailPage from '@/pages/CourseGuidePage/CourseGuideDetailPage';
import CourseRecommendPage from '@/pages/CourseRecommendPage/CourseRecommendPage';
import MyCoursesPage from '@/pages/MyCourses/MyCoursesPage';
import RegionRecommendPage from './pages/RegionRecommendPage/RegionRecommendPage';
import FestivalListPage from './pages/FestivalPage/FestivalListPage';
import FestivalDetailPage from './pages/FestivalPage/FestivalDetailPage';
import StampTourPage from './pages/StampTourPage/StampTourPage';

import PlaceGuideMainPage from '@/pages/PlaceGuidePage/PlaceGuideMainPage';
import PlaceGuideSearchPage from '@/pages/PlaceGuidePage/PlaceGuideSearchPage';
import PlaceGuideDetailPage from '@/pages/PlaceGuidePage/PlaceGuideDetailPage';
import PlaceGuideAddToCoursePage from '@/pages/PlaceGuidePage/PlaceGuideAddToCoursePage';

import MyPage from '@/pages/MyPage/MyPage';

import { ContactPage, PoliciesPage, PolicyDetailPage } from '@/pages/ServicePages/ServicePages';

function App() {
  return (
    <AuthProvider>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/bookmarks" element={<BookmarkPage />} />
        <Route
          path="/course-recommend"
          element={
            <RequireAuth>
              <CourseRecommendPage />
            </RequireAuth>
          }
        />
        <Route path="/course-guide" element={<CourseGuideListPage />} />
        <Route path="/course-guide/:courseId" element={<CourseGuideDetailPage />} />
        <Route
          path="/my-courses"
          element={
            <RequireAuth>
              <MyCoursesPage />
            </RequireAuth>
          }
        />
        <Route path="/region-recommend" element={<RegionRecommendPage />} />
        <Route path="/festivals" element={<FestivalListPage />} />
        <Route path="/festivals/:festivalId" element={<FestivalDetailPage />} />
        <Route path="/stamp-tour" element={<StampTourPage />} />

        <Route path="/place-guide" element={<PlaceGuideMainPage />} />
        <Route path="/place-guide/search" element={<PlaceGuideSearchPage />} />
        <Route path="/place-guide/:placeId" element={<PlaceGuideDetailPage />} />
        <Route
          path="/place-guide/:placeId/add-to-course"
          element={
            <RequireAuth>
              <PlaceGuideAddToCoursePage />
            </RequireAuth>
          }
        />

        <Route path="/contact" element={<ContactPage />} />
        <Route path="/policies" element={<PoliciesPage />} />
        <Route path="/policies/:policyId" element={<PolicyDetailPage />} />
        <Route path="/my-page" element={<MyPage />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
