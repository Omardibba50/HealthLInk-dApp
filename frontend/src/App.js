import React from 'react';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Sidebar from './components/Sidebar';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import PatientDashboard from './pages/PatientDashboard';
import DoctorDashboard from './pages/DoctorDashboard';
import Marketplace from './pages/Marketplace';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/*" element={
          <div className="flex min-h-screen bg-gray-50 text-gray-800">
            <Sidebar />
            <div className="flex-1 overflow-auto">
              <Routes>
                
                <Route path="/patient" element={<PatientDashboard />} />
                <Route path="/doctor" element={<DoctorDashboard />} />
                <Route path="/marketplace" element={<Marketplace />} />
              </Routes>
            </div>
          </div>
        } />
      </Routes>
    </Router>
  );
}

export default App;