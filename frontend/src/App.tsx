import { Route, Routes } from 'react-router-dom';

import MainPage from '@/pages/MainPage/MainPage';
import CourseRecommendPage from './pages/CourseRecommendPage/CourseRecommendPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<MainPage />} />

      <Route path="/course-recommend" element={<CourseRecommendPage />} />
    </Routes>
  );
}

export default App;
