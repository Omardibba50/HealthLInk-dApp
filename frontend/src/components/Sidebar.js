import React from 'react';
import { Link } from 'react-router-dom';

function Sidebar() {
  return (
    <div className="w-64 bg-white bg-opacity-10 text-white">
      <div className="p-4">
        <h1 className="text-2xl font-bold">HealthLink Africa</h1>
      </div>
      <nav className="mt-8">
        <Link to="/patient" className="block py-2 px-4 hover:bg-white hover:bg-opacity-10">Patient Dashboard</Link>
        <Link to="/doctor" className="block py-2 px-4 hover:bg-white hover:bg-opacity-10">Doctor Dashboard</Link>
        <Link to="/marketplace" className="block py-2 px-4 hover:bg-white hover:bg-opacity-10">Marketplace</Link>
      </nav>
    </div>
  );
}

export default Sidebar;