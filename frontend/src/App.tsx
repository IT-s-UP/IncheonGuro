import { Route, Routes } from 'react-router-dom';

import MainPage from '@/pages/MainPage/MainPage';
import CourseRecommendPage from './pages/CourseRecommendPage/CourseRecommendPage';
import CourseGuideListPage from '@/pages/CourseGuidePage/CourseGuideListPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<MainPage />} />

      <Route path="/course-recommend" element={<CourseRecommendPage />} />
      <Route path="/course-guide" element={<CourseGuideListPage />} />
    </Routes>
  );
}

export default App;
