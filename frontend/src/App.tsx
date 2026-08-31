import { Route, Routes } from 'react-router-dom';

import MainPage from '@/pages/MainPage/MainPage';

import CourseGuideListPage from '@/pages/CourseGuidePage/CourseGuideListPage';
import CourseGuideDetailPage from '@/pages/CourseGuidePage/CourseGuideDetailPage';
import CourseRecommendPage from '@/pages/CourseRecommendPage/CourseRecommendPage';
import MyCoursesPage from '@/pages/MyCourses/MyCoursesPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<MainPage />} />
      <Route path="/course-recommend" element={<CourseRecommendPage />} />
      <Route path="/course-guide" element={<CourseGuideListPage />} />
      <Route path="/course-guide/:courseId" element={<CourseGuideDetailPage />} />
      <Route path="/my-courses" element={<MyCoursesPage />} />
    </Routes>
  );
}

export default App;
