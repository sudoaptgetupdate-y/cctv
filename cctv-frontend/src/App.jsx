import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login/Login';
import MainLayout from './layouts/MainLayout';
import AdminDashboard from './pages/AdminDashboard/AdminDashboard';
import PublicDashboard from './pages/PublicDashboard/PublicDashboard';
import Cameras from './pages/Cameras/Cameras';
import CameraGroups from './pages/CameraGroups/CameraGroups';
import Settings from './pages/Settings/Settings';
import AuditLogs from './pages/AuditLogs/AuditLogs';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<PublicDashboard />} />
        <Route path="/login" element={<Login />} />
        
        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            <Route path="/dashboard" element={<AdminDashboard />} />
            <Route path="/cameras" element={<Cameras />} />
            <Route path="/groups" element={<CameraGroups />} />
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
