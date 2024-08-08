import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { logout } from '../utils/web3Config';

function Sidebar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="w-64 bg-gradient-to-b from-indigo-900 to-purple-800 text-white h-screen">
      <div className="p-4">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-400 to-yellow-400 text-transparent bg-clip-text">HealthLink Africa</h1>
      </div>
      <nav className="mt-8">
        <Link to="/patient" className="block py-2 px-4 hover:bg-white hover:bg-opacity-10 transition duration-300">Patient Dashboard</Link>
        <Link to="/doctor" className="block py-2 px-4 hover:bg-white hover:bg-opacity-10 transition duration-300">Doctor Dashboard</Link>
        <Link to="/marketplace" className="block py-2 px-4 hover:bg-white hover:bg-opacity-10 transition duration-300">Marketplace</Link>
        <button 
          onClick={handleLogout} 
          className="w-full text-left py-2 px-4 hover:bg-white hover:bg-opacity-10 transition duration-300"
        >
          Logout
        </button>
      </nav>
    </div>
  );
}

export default Sidebar;