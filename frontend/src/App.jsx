import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/common/Sidebar';
import Toast from './components/common/Toast';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Dashboard from './pages/Dashboard';
import SkuEdit from './pages/SkuEdit';
import ReviewQueue from './pages/ReviewQueue';
import Maturity from './pages/Maturity';
import AiAudit from './pages/AiAudit';
import Clusters from './pages/ClustersPage';
import Channels from './pages/Channels';
import Config from './pages/Config';
import TierMgmt from './pages/TierMgmt';
import Briefs from './pages/Briefs';
import AuditTrail from './pages/AuditTrail';
import BulkOps from './pages/BulkOps';
import StaffKpis from './pages/StaffKpis';

const AppLayout = ({ children }) => (
  <div className="app-layout">
    <Sidebar />
    <div className="main-content">
      {children}
    </div>
    <Toast />
  </div>
);

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<AppLayout><Dashboard /></AppLayout>} />
        <Route path="/sku-edit/:id" element={<AppLayout><SkuEdit /></AppLayout>} />
        <Route path="/sku-edit" element={<AppLayout><SkuEdit /></AppLayout>} />
        <Route path="/review" element={<AppLayout><ReviewQueue /></AppLayout>} />
        <Route path="/maturity" element={<AppLayout><Maturity /></AppLayout>} />
        <Route path="/audit" element={<AppLayout><AiAudit /></AppLayout>} />
        <Route path="/clusters" element={<AppLayout><Clusters /></AppLayout>} />
        <Route path="/channels" element={<AppLayout><Channels /></AppLayout>} />
        <Route path="/config" element={<AppLayout><Config /></AppLayout>} />
        <Route path="/tiers" element={<AppLayout><TierMgmt /></AppLayout>} />
        <Route path="/briefs" element={<AppLayout><Briefs /></AppLayout>} />
        <Route path="/audit-trail" element={<AppLayout><AuditTrail /></AppLayout>} />
        <Route path="/bulk" element={<AppLayout><BulkOps /></AppLayout>} />
        <Route path="/staff" element={<AppLayout><StaffKpis /></AppLayout>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
