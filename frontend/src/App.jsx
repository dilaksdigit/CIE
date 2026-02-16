import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SkuList from './components/sku/SkuList';
import SkuEditForm from './components/sku/SkuEditForm';
import Dashboard from './pages/Dashboard';
import Login from './components/auth/Login';
import Header from './components/common/Header';
import Sidebar from './components/common/Sidebar';

function App() {
  return (
    <Router>
      <div className="app-container">
        <Header />
        <div className="main-content">
          <Sidebar />
          <div className="page-content">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/login" element={<Login />} />
              <Route path="/skus" element={<SkuList />} />
              <Route path="/skus/edit/:id" element={<SkuEditForm />} />
            </Routes>
          </div>
        </div>
      </div>
    </Router>
  );
}

export default App;
