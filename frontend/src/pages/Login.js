import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getHealthContract, getMarketplaceContract, getAccount, connectWallet, sendTransaction } from '../utils/web3Config';

function Login() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userType, setUserType] = useState('patient');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await connectWallet();
      const account = await getAccount();
      const healthContract = getHealthContract();
      const marketplaceContract = getMarketplaceContract();

      switch (userType) {
        case 'patient':
          await sendTransaction(
            healthContract.methods.addPatient(name, name, email, 0, password),
            { from: account }
          );
          navigate('/patient');
          break;
        case 'doctor':
          await sendTransaction(
            healthContract.methods.addDoctor(name, 'Hospital', 'Specialization', 0, password),
            { from: account }
          );
          navigate('/doctor');
          break;
        case 'researcher':
          await sendTransaction(
            marketplaceContract.methods.registerResearcher(name),
            { from: account }
          );
          navigate('/researcher');
          break;
        default:
          throw new Error('Invalid user type');
      }
    } catch (error) {
      console.error('Error during registration:', error);
      setError(error.message || 'An error occurred during registration. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-500 to-purple-600">
      <div className="bg-white bg-opacity-10 p-8 rounded-lg shadow-lg w-96">
        <h2 className="text-3xl font-bold mb-6 text-white text-center">HealthLink Africa</h2>
        <h3 className="text-xl font-semibold mb-4 text-white text-center">Login / Register</h3>
        {error && <p className="text-red-300 mb-4 text-center">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-white mb-2" htmlFor="name">Name</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 bg-white bg-opacity-20 rounded text-white placeholder-gray-300"
              placeholder="Enter your name"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-white mb-2" htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 bg-white bg-opacity-20 rounded text-white placeholder-gray-300"
              placeholder="Enter your email"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-white mb-2" htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 bg-white bg-opacity-20 rounded text-white placeholder-gray-300"
              placeholder="Enter your password"
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-white mb-2" htmlFor="userType">User Type</label>
            <select
              id="userType"
              value={userType}
              onChange={(e) => setUserType(e.target.value)}
              className="w-full px-3 py-2 bg-white bg-opacity-20 rounded text-white"
            >
              <option value="patient">Patient</option>
              <option value="doctor">Doctor</option>
              <option value="researcher">Researcher</option>
            </select>
          </div>
          <button 
            type="submit" 
            className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 transition duration-300 ease-in-out transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading}
          >
            {isLoading ? 'Processing...' : 'Login / Register'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
