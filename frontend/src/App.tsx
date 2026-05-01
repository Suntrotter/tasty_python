import { Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import HomePage from "./pages/HomePage";
import LessonPage from "./pages/LessonPage";
import TrackDetailPage from "./pages/TrackDetailPage";
import TracksPage from "./pages/TracksPage";

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/tracks" element={<TracksPage />} />
        <Route path="/tracks/:trackSlug" element={<TrackDetailPage />} />
        <Route path="/lessons/:lessonSlug" element={<LessonPage />} />
      </Route>
    </Routes>
  );
}

export default App;