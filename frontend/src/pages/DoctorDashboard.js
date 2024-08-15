import React, { useState, useEffect } from 'react';
import { getHealthContract, getAccount, connectWallet, sendTransaction, web3 } from '../utils/web3Config';

function DoctorDashboard() {
  const [doctor, setDoctor] = useState(null);
  const [patientAddress, setPatientAddress] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [tokenBalance, setTokenBalance] = useState('0');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadDoctorData();
  }, []);

  async function loadDoctorData() {
    setIsLoading(true);
    try {
      await connectWallet();
      const account = await getAccount();
      const healthContract = getHealthContract();
      
      const doctorData = await healthContract.methods.doctors(account).call();
      const formattedDoctorData = {
        name: doctorData.name,
        hospital: doctorData.hospital,
        specialization: doctorData.specialization,
        hasClaimedTokens: doctorData.hasClaimedTokens
      };
      
      setDoctor(formattedDoctorData);

      const balance = await healthContract.methods.balanceOf(account).call();
      setTokenBalance(web3.utils.fromWei(balance, 'ether'));
    } catch (error) {
      console.error("Error loading doctor data:", error);
      setError("Failed to load doctor data. Please ensure you're connected to the correct network and try again.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleClaimTokens() {
    setIsLoading(true);
    setError('');
    setSuccess('');
    try {
      const account = await getAccount();
      const healthContract = getHealthContract();

      await sendTransaction(
        healthContract.methods.claimFreeTokens(),
        { from: account }
      );

      await loadDoctorData();
      setSuccess("Tokens claimed successfully!");
    } catch (error) {
      console.error("Error claiming tokens:", error);
      setError("Failed to claim tokens. " + error.message);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleAddRecord(e) {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');
    try {
      const account = await getAccount();
      const healthContract = getHealthContract();

      const date = new Date().toISOString().split('T')[0]; // Get current date in YYYY-MM-DD format
      await sendTransaction(
        healthContract.methods.addRecord(patientAddress, date, diagnosis, description, []),
        { from: account }
      );
      setPatientAddress('');
      setDiagnosis('');
      setDescription('');
      setSuccess("Record added successfully!");
      await loadDoctorData();
    } catch (error) {
      console.error("Error adding record:", error);
      setError("Failed to add record. " + error.message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {error && <p className="text-red-500 mb-4 bg-red-100 bg-opacity-20 p-3 rounded">{error}</p>}
      {success && <p className="text-green-500 mb-4 bg-green-100 bg-opacity-20 p-3 rounded">{success}</p>}
      {doctor && (
        <div className="bg-white rounded-lg p-6 mb-8 shadow-lg">
          <h2 className="text-2xl font-semibold text-indigo-900 mb-4">Doctor Information</h2>
          <p className="text-gray-700"><span className="font-semibold">Name:</span> {doctor.name || 'N/A'}</p>
          <p className="text-gray-700"><span className="font-semibold">Hospital:</span> {doctor.hospital || 'N/A'}</p>
          <p className="text-gray-700"><span className="font-semibold">Specialization:</span> {doctor.specialization || 'N/A'}</p>
          <p className="text-gray-700"><span className="font-semibold">Token Balance:</span> {tokenBalance} HLT</p>
          {!doctor.hasClaimedTokens && (
            <button
              onClick={handleClaimTokens}
              disabled={isLoading}
              className="mt-4 bg-gradient-to-r from-pink-500 to-yellow-500 text-white font-bold py-2 px-4 rounded-full hover:from-pink-600 hover:to-yellow-600 transition duration-300 shadow-lg disabled:opacity-50"
            >
              {isLoading ? 'Processing...' : 'Claim Free Tokens'}
            </button>
          )}
        </div>
      )}
      <div className="bg-white rounded-lg p-6 shadow-lg">
        <h2 className="text-2xl font-semibold text-indigo-900 mb-4">Add Patient Record</h2>
        <form onSubmit={handleAddRecord}>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2" htmlFor="patientAddress">Patient Address</label>
            <input
              id="patientAddress"
              type="text"
              value={patientAddress}
              onChange={(e) => setPatientAddress(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2" htmlFor="diagnosis">Diagnosis</label>
            <input
              id="diagnosis"
              type="text"
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2" htmlFor="description">Description</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            ></textarea>
          </div>
          <button 
            type="submit" 
            disabled={isLoading}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold py-2 px-4 rounded-full hover:from-indigo-700 hover:to-purple-700 transition duration-300 shadow-lg disabled:opacity-50"
          >
            {isLoading ? 'Processing...' : 'Add Record'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default DoctorDashboard;