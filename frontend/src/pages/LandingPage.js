import React from 'react';
import { Link } from 'react-router-dom';

function LandingPage() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-12 sm:py-16 bg-gradient-to-br from-indigo-900 via-purple-800 to-pink-800 text-white">
        <FloatingShapes />
        <div className="container mx-auto px-4 relative z-10">
          <nav className="flex justify-between items-center mb-12">
            <div className="text-2xl font-bold bg-gradient-to-r from-pink-400 to-yellow-400 text-transparent bg-clip-text">HealthLink Africa</div>
            <div className="flex space-x-6">
              <NavLink to="/">Home</NavLink>
              <NavLink to="/about">About</NavLink>
              <NavLink to="/login">Login</NavLink>
              <NavLink to="/register" isPrimary>Register Now</NavLink>
            </div>
          </nav>
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-5xl sm:text-6xl font-bold mb-6 leading-tight">
              Decentralized Healthcare for Africa
            </h1>
            <p className="text-xl sm:text-2xl mb-8 text-gray-300">
              Secure, Transparent, and Empowering
            </p>
            <Link 
              to="/register" 
              className="inline-block bg-gradient-to-r from-pink-500 to-yellow-500 text-white font-bold py-3 px-8 rounded-full hover:from-pink-600 hover:to-yellow-600 transition duration-300 shadow-lg"
            >
              Register now to claim your free HLA Token
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl sm:text-4xl font-bold mb-12 text-center text-indigo-900">Our Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard 
              title="Blockchain Health Records"
              description="Store and manage your health records securely on the blockchain."
              icon="🔗"
            />
            <FeatureCard 
              title="Data Monetization"
              description="Monetize your health data and contribute to medical research."
              icon="💎"
            />
            <FeatureCard 
              title="Smart Contract Interactions"
              description="Seamless and transparent interactions between patients and healthcare providers."
              icon="📝"
            />
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20 bg-gray-100">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl sm:text-4xl font-bold mb-8 text-center text-indigo-900">About HealthLink Africa</h2>
          <p className="text-lg mb-8 text-center max-w-3xl mx-auto text-gray-600">
            HealthLink Africa is a revolutionary health dApp that leverages blockchain technology to create a secure, 
            transparent, and efficient healthcare ecosystem. Our platform connects patients, doctors, and researchers, 
            facilitating the sharing and monetization of health data while ensuring privacy and security.
          </p>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-indigo-100">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-8 text-indigo-900">Join the HealthLink Network</h2>
          <p className="text-xl mb-8 text-gray-600">Be part of the decentralized future of healthcare in Africa</p>
          <Link 
            to="/register" 
            className="inline-block bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold py-3 px-8 rounded-full hover:from-indigo-700 hover:to-purple-700 transition duration-300 shadow-lg"
          >
            Register now to claim your free HLA Token
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-200 py-8">
        <div className="container mx-auto px-4 text-center text-gray-600">
          <p>&copy; 2024 HealthLink Africa. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

function NavLink({ to, children, isPrimary }) {
  return (
    <Link
      to={to}
      className={`px-4 py-2 rounded-full transition duration-300 ${
        isPrimary
          ? 'bg-gradient-to-r from-pink-500 to-yellow-500 text-white hover:from-pink-600 hover:to-yellow-600'
          : 'text-gray-300 hover:bg-white hover:bg-opacity-10'
      }`}
    >
      {children}
    </Link>
  );
}

function FloatingShapes() {
  return (
    <div className="absolute inset-0">
      {[...Array(20)].map((_, i) => (
        <div
          key={i}
          className="absolute bg-white bg-opacity-10 rounded-lg transform rotate-45"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            width: `${Math.random() * 50 + 20}px`,
            height: `${Math.random() * 50 + 20}px`,
            animation: `float ${Math.random() * 10 + 5}s infinite ease-in-out`,
          }}
        ></div>
      ))}
    </div>
  );
}

function FeatureCard({ title, description, icon }) {
  return (
    <div className="bg-white p-6 rounded-lg text-center shadow-lg hover:shadow-xl transition duration-300 border border-indigo-100">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-xl font-bold mb-2 text-indigo-800">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}

export default LandingPage;