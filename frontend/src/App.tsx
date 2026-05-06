import { Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import RequireAdminAuth from "./components/RequireAdminAuth";
import HomePage from "./pages/HomePage";
import LessonPage from "./pages/LessonPage";
import TrackDetailPage from "./pages/TrackDetailPage";
import TracksPage from "./pages/TracksPage";
import DashboardPage from "./pages/DashboardPage";
import InterviewModePage from "./pages/InterviewModePage";
import AdminDashboardPage from "./pages/admin/AdminDashboardPage";
import AdminLessonsPage from "./pages/admin/AdminLessonsPage";
import AdminTracksPage from "./pages/admin/AdminTracksPage";
import AdminLessonDetailPage from "./pages/admin/AdminLessonDetailPage";
import AdminTrackDetailPage from "./pages/admin/AdminTrackDetailPage";
import AdminLoginPage from "./pages/admin/AdminLoginPage";
import NotFoundPage from "./pages/NotFoundPage";

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/tracks" element={<TracksPage />} />
        <Route path="/tracks/:trackSlug" element={<TrackDetailPage />} />
        <Route path="/lessons/:lessonSlug" element={<LessonPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/interview-mode" element={<InterviewModePage />} />
        <Route path="*" element={<NotFoundPage />} />
        <Route path="/admin-login" element={<AdminLoginPage />} />

        <Route element={<RequireAdminAuth />}>
          <Route path="/admin" element={<AdminDashboardPage />} />
          <Route path="/admin/tracks" element={<AdminTracksPage />} />
          <Route path="/admin/lessons" element={<AdminLessonsPage />} />
          <Route
            path="/admin/lessons/:lessonSlug"
            element={<AdminLessonDetailPage />}
          />
          <Route
            path="/admin/tracks/:trackSlug"
            element={<AdminTrackDetailPage />}
          />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;