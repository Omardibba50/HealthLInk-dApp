import React from 'react';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import PatientDashboard from './pages/PatientDashboard';
import DoctorDashboard from './pages/DoctorDashboard';
import Marketplace from './pages/Marketplace';

function App() {
  return (
    <Router>
      <div className="flex h-screen bg-gradient-to-br from-purple-500 to-indigo-600">
        <Sidebar />
        <div className="flex-1 overflow-auto">
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/patient" element={<PatientDashboard />} />
            <Route path="/doctor" element={<DoctorDashboard />} />
            <Route path="/marketplace" element={<Marketplace />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;