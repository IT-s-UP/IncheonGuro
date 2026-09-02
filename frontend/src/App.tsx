import { Route, Routes } from 'react-router-dom';

import MainPage from '@/pages/MainPage/MainPage';

import LoginPage from './pages/LoginPage/LoginPage';
import SignupPage from './pages/SignupPage/SignupPage';

import CourseGuideListPage from '@/pages/CourseGuidePage/CourseGuideListPage';
import CourseGuideDetailPage from '@/pages/CourseGuidePage/CourseGuideDetailPage';
import CourseRecommendPage from '@/pages/CourseRecommendPage/CourseRecommendPage';
import MyCoursesPage from '@/pages/MyCourses/MyCoursesPage';
import RegionRecommendPage from './pages/RegionRecommendPage/RegionRecommendPage';
import FestivalListPage from './pages/FestivalPage/FestivalListPage';
import FestivalDetailPage from './pages/FestivalPage/FestivalDetailPage';
import StampTourPage from './pages/StampTourPage/StampTourPage';
import PlaceGuideMainPage from '@/pages/PlaceGuidePage/PlaceGuideMainPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<MainPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/course-recommend" element={<CourseRecommendPage />} />
      <Route path="/course-guide" element={<CourseGuideListPage />} />
      <Route path="/course-guide/:courseId" element={<CourseGuideDetailPage />} />
      <Route path="/my-courses" element={<MyCoursesPage />} />
      <Route path="/region-recommend" element={<RegionRecommendPage />} />
      <Route path="/festivals" element={<FestivalListPage />} />
      <Route path="/festivals/:festivalId" element={<FestivalDetailPage />} />
      <Route path="/stamp-tour" element={<StampTourPage />} />
      <Route path="/place-guide" element={<PlaceGuideMainPage />} />
    </Routes>
  );
}

export default App;
