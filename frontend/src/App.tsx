import { Route, Routes } from 'react-router-dom';

import MainPage from '@/pages/MainPage/MainPage';
import CourseRecommendPage from './pages/CourseRecommendPage/CourseRecommendPage';
import CourseGuideListPage from '@/pages/CourseGuidePage/CourseGuideListPage';
import CourseGuideDetailPage from '@/pages/CourseGuidePage/CourseGuideDetailPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<MainPage />} />
      <Route path="/course-recommend" element={<CourseRecommendPage />} />
      <Route path="/course-guide" element={<CourseGuideListPage />} />
      <Route path="/course-guide/:courseId" element={<CourseGuideDetailPage />} />
    </Routes>
  );
}

export default App;
