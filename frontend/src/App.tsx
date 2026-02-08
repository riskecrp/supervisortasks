import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import HomePage from './pages/HomePage';
import TasksPage from './pages/TasksPage';
import DiscussionsPage from './pages/DiscussionsPage';
import SupervisorsPage from './pages/SupervisorsPage';
import LOAPage from './pages/LOAPage';
import AnalyticsPage from './pages/AnalyticsPage';

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/tasks" element={<TasksPage />} />
        <Route path="/discussions" element={<DiscussionsPage />} />
        <Route path="/supervisors" element={<SupervisorsPage />} />
        <Route path="/loa" element={<LOAPage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}

export default App;
