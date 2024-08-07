import React, { useState, useEffect } from 'react';
import { getHealthContract, getAccount, connectWallet, sendTransaction } from '../utils/web3Config';

function DoctorDashboard() {
  const [doctor, setDoctor] = useState(null);
  const [patientAddress, setPatientAddress] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    loadDoctorData();
  }, []);

  async function loadDoctorData() {
    try {
      await connectWallet();
      const account = await getAccount();
      const healthContract = getHealthContract();
      
      console.log("Fetching doctor data for account:", account);
      
      const doctorData = await healthContract.methods.doctors(account).call();
      console.log("Raw doctor data:", doctorData);
      
      // Convert BigInt values to strings
      const formattedDoctorData = {
        name: doctorData.name,
        hospital: doctorData.hospital,
        specialization: doctorData.specialization,
        tokenBalance: doctorData.tokenBalance.toString()
      };
      
      setDoctor(formattedDoctorData);
    } catch (error) {
      console.error("Error loading doctor data:", error);
      setError("Failed to load doctor data. Please try again.");
      if (error.message.includes('Web3ValidatorError')) {
        console.error("Validation error. Check contract method signatures and data types.");
      }
    }
  }

  async function handleAddRecord(e) {
    e.preventDefault();
    setError('');
    try {
      await connectWallet();
      const account = await getAccount();
      const healthContract = getHealthContract();
      const date = new Date().toISOString();
      await sendTransaction(
        healthContract.methods.addRecord(patientAddress, date, diagnosis, description, []),
        { from: account }
      );
      setPatientAddress('');
      setDiagnosis('');
      setDescription('');
    } catch (error) {
      console.error("Error adding record:", error);
      setError("Failed to add record. Please try again.");
    }
  }

  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold text-white mb-8">Doctor Dashboard</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {doctor && (
        <div className="bg-white bg-opacity-10 rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold text-white mb-4">Doctor Information</h2>
          <p className="text-white">Name: {doctor.name || 'N/A'}</p>
          <p className="text-white">Hospital: {doctor.hospital || 'N/A'}</p>
          <p className="text-white">Specialization: {doctor.specialization || 'N/A'}</p>
          <p className="text-white">Token Balance: {doctor.tokenBalance || '0'}</p>
        </div>
      )}
      <div className="bg-white bg-opacity-10 rounded-lg p-6">
        <h2 className="text-2xl font-semibold text-white mb-4">Add Patient Record</h2>
        <form onSubmit={handleAddRecord}>
          <div className="mb-4">
            <label className="block text-white mb-2">Patient Address</label>
            <input
              type="text"
              value={patientAddress}
              onChange={(e) => setPatientAddress(e.target.value)}
              className="w-full px-3 py-2 bg-white bg-opacity-20 rounded text-white"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-white mb-2">Diagnosis</label>
            <input
              type="text"
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
              className="w-full px-3 py-2 bg-white bg-opacity-20 rounded text-white"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-white mb-2">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 bg-white bg-opacity-20 rounded text-white"
              required
            ></textarea>
          </div>
          <button type="submit" className="bg-indigo-600 text-white py-2 px-4 rounded hover:bg-indigo-700">
            Add Record
          </button>
        </form>
      </div>
    </div>
  );
}

export default DoctorDashboard;
