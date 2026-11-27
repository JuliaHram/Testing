import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home'; // <-- Импортируем новую страницу
import StudentTest from './pages/StudentTest';
import TeacherLogin from './pages/TeacherLogin';
import TeacherDashboard from './pages/TeacherDashboard';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/test/:id" element={<StudentTest />} />
        <Route path="/teacher/login" element={<TeacherLogin />} />
        <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}