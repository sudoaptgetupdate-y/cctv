import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import MainLayout from './layouts/MainLayout';
import DashboardHome from './pages/DashboardHome';
import Cameras from './pages/Cameras';
import Groups from './pages/Groups';
import Settings from './pages/Settings';
import AuditLogs from './pages/AuditLogs';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<DashboardHome />} />
            <Route path="/cameras" element={<Cameras />} />
            <Route path="/groups" element={<Groups />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/logs" element={<AuditLogs />} />
          </Route>
        </Route>
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
