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
      const connected = await connectWallet();
      if (connected) {
        const account = await getAccount();
        const healthContract = getHealthContract();

        let transaction;
        if (userType === 'patient') {
          transaction = healthContract.methods.addPatient(aadhar, name, email, parseInt(age));
        } else if (userType === 'doctor') {
          transaction = healthContract.methods.addDoctor(name, 'Hospital', 'Specialization', parseInt(age));
        } else {
          throw new Error('Invalid user type');
        }

        await sendTransaction(transaction, { from: account });
        setIsRegistered(true);
      }
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
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-800 to-pink-800 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl overflow-hidden">
        <div className="py-10 px-6 sm:px-10">
          <h2 className="text-3xl font-bold text-center text-indigo-900 mb-6">HealthLink Africa</h2>
          <h3 className="text-xl font-semibold mb-4 text-center text-gray-700">Login / Register</h3>
          {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
          {!isRegistered ? (
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2" htmlFor="name">Name</label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2" htmlFor="email">Email</label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
              {userType === 'patient' && (
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2" htmlFor="aadhar">Aadhar Number</label>
                  <input
                    id="aadhar"
                    type="text"
                    value={aadhar}
                    onChange={(e) => setAadhar(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
              )}
              <div className="mb-4">
                <label className="block text-gray-700 mb-2" htmlFor="age">Age</label>
                <input
                  id="age"
                  type="number"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
              <div className="mb-6">
                <label className="block text-gray-700 mb-2" htmlFor="userType">User Type</label>
                <select
                  id="userType"
                  value={userType}
                  onChange={(e) => setUserType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="patient">Patient</option>
                  <option value="doctor">Doctor</option>
                </select>
              </div>
              <button 
                type="submit" 
                className="w-full bg-gradient-to-r from-pink-500 to-yellow-500 text-white font-bold py-2 rounded-full hover:from-pink-600 hover:to-yellow-600 transition duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading}
              >
                {isLoading ? 'Processing...' : 'Register'}
              </button>
            </form>
          ) : (
            <div>
              <p className="text-gray-700 mb-4">Registration successful! Claim your free tokens to get started.</p>
              <button 
                onClick={handleClaimTokens}
                className="w-full bg-gradient-to-r from-pink-500 to-yellow-500 text-white font-bold py-2 rounded-full hover:from-pink-600 hover:to-yellow-600 transition duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading}
              >
                {isLoading ? 'Processing...' : 'Claim Free Tokens'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Login;