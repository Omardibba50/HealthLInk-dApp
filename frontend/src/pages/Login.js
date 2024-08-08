import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getHealthContract, getAccount, connectWallet, sendTransaction } from '../utils/web3Config';

function Login() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [aadhar, setAadhar] = useState('');
  const [age, setAge] = useState('');
  const [userType, setUserType] = useState('patient');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isRegistered, setIsRegistered] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await connectWallet();
      const account = await getAccount();
      const healthContract = getHealthContract();

      let transaction;
      if (userType === 'patient') {
        transaction = healthContract.methods.addPatient(aadhar, name, email, 0);
      } else if (userType === 'doctor') {
        transaction = healthContract.methods.addDoctor(name, 'Hospital', 'Specialization', 0);
      } else {
        throw new Error('Invalid user type');
      }

      await sendTransaction(transaction, { from: account });
      setIsRegistered(true);
    } catch (error) {
      console.error('Error during registration:', error);
      setError(error.message || 'An error occurred during registration. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClaimTokens = async () => {
    setIsLoading(true);
    setError('');

    try {
      const account = await getAccount();
      const healthContract = getHealthContract();

      await sendTransaction(
        healthContract.methods.claimFreeTokens(),
        { from: account }
      );

      navigate(userType === 'patient' ? '/patient' : '/doctor');
    } catch (error) {
      console.error('Error claiming tokens:', error);
      setError(error.message || 'An error occurred while claiming tokens. Please try again.');
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
        {!isRegistered ? (
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
            {userType === 'patient' && (
              <div className="mb-4">
                <label className="block text-white mb-2" htmlFor="aadhar">Aadhar Number</label>
                <input
                  id="aadhar"
                  type="text"
                  value={aadhar}
                  onChange={(e) => setAadhar(e.target.value)}
                  className="w-full px-3 py-2 bg-white bg-opacity-20 rounded text-white placeholder-gray-300"
                  placeholder="Enter your Aadhar number"
                  required
                />
              </div>
            )}
            <div className="mb-4">
              <label className="block text-white mb-2" htmlFor="age">Age</label>
              <input
                id="age"
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="w-full px-3 py-2 bg-white bg-opacity-20 rounded text-white placeholder-gray-300"
                placeholder="Enter your age"
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
              </select>
            </div>
            <button 
              type="submit" 
              className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 transition duration-300 ease-in-out transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              {isLoading ? 'Processing...' : 'Register'}
            </button>
          </form>
        ) : (
          <div>
            <p className="text-white mb-4">Registration successful! Claim your free tokens to get started.</p>
            <button 
              onClick={handleClaimTokens}
              className="w-full bg-green-500 text-white py-2 rounded hover:bg-green-600 transition duration-300 ease-in-out transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              {isLoading ? 'Processing...' : 'Claim Free Tokens'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Login;