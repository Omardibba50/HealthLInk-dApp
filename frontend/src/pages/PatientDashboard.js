import React, { useState, useEffect } from 'react';
import { getHealthContract, getAccount, connectWallet, sendTransaction } from '../utils/web3Config';

function PatientDashboard() {
  const [patient, setPatient] = useState(null);
  const [records, setRecords] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    loadPatientData();
  }, []);

  async function loadPatientData() {
    try {
      await connectWallet();
      const account = await getAccount();
      const healthContract = getHealthContract();
      
      console.log("Fetching patient data for account:", account);
      
      const patientData = await healthContract.methods.patients(account).call();
      console.log("Raw patient data:", patientData);
      
      const formattedPatientData = {
        address: account,
        name: patientData.name,
        email: patientData.email,
        age: patientData.age.toString(),
        tokenBalance: patientData.tokenBalance.toString(),
        recordSize: patientData.recordSize.toString()
      };
      
      setPatient(formattedPatientData);

      const recordSize = parseInt(formattedPatientData.recordSize, 10);
      const recordsData = [];
      for (let i = 0; i < recordSize; i++) {
        const record = await healthContract.methods.getRecordDetails(account, i).call();
        recordsData.push({
          index: i,
          date: record[0],
          doctor: record[1],
          diagnosis: record[2],
          description: record[3],
          isMonetized: record[4]
        });
      }
      setRecords(recordsData);
    } catch (error) {
      console.error("Error loading patient data:", error);
      setError("Failed to load patient data. Please try again.");
    }
  }

  async function handleMonetize(recordIndex) {
    setError('');
    try {
      await connectWallet();
      const account = await getAccount();
      const healthContract = getHealthContract();
      await sendTransaction(
        healthContract.methods.monetizeRecord(recordIndex),
        { from: account }
      );
      await loadPatientData(); // Reload data after monetization
    } catch (error) {
      console.error("Error monetizing record:", error);
      setError("Failed to monetize record. Please try again.");
    }
  }

  return (
    <div className="p-8 bg-gradient-to-r from-blue-500 to-purple-600 min-h-screen">
      <h1 className="text-4xl font-bold text-white mb-8">Patient Dashboard</h1>
      {error && <p className="text-red-300 mb-4 bg-red-100 bg-opacity-20 p-3 rounded">{error}</p>}
      {patient ? (
        <div className="bg-white bg-opacity-10 rounded-lg p-6 mb-8 shadow-lg">
          <h2 className="text-2xl font-semibold text-white mb-4">Personal Information</h2>
          <div className="grid grid-cols-2 gap-4">
            <p className="text-white"><span className="font-semibold">Name:</span> {patient.name || 'N/A'}</p>
            <p className="text-white"><span className="font-semibold">Email:</span> {patient.email || 'N/A'}</p>
            <p className="text-white"><span className="font-semibold">Age:</span> {patient.age || 'N/A'}</p>
            <p className="text-white"><span className="font-semibold">Token Balance:</span> {patient.tokenBalance || '0'}</p>
            <p className="text-white"><span className="font-semibold">Address:</span> {patient.address || 'N/A'}</p>
          </div>
        </div>
      ) : (
        <p className="text-white bg-white bg-opacity-10 rounded-lg p-4">Loading patient data...</p>
      )}
      <div className="bg-white bg-opacity-10 rounded-lg p-6 shadow-lg">
        <h2 className="text-2xl font-semibold text-white mb-4">Health Records</h2>
        {records.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {records.map((record) => (
              <div key={record.index} className="bg-white bg-opacity-20 rounded-lg p-4">
                <p className="text-white"><span className="font-semibold">Date:</span> {record.date}</p>
                <p className="text-white"><span className="font-semibold">Diagnosis:</span> {record.diagnosis}</p>
                <p className="text-white"><span className="font-semibold">Doctor:</span> {record.doctor}</p>
                <p className="text-white"><span className="font-semibold">Description:</span> {record.description}</p>
                <p className="text-white"><span className="font-semibold">Monetized:</span> {record.isMonetized ? 'Yes' : 'No'}</p>
                {!record.isMonetized && (
                  <button
                    onClick={() => handleMonetize(record.index)}
                    className="mt-2 bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out transform hover:scale-105"
                  >
                    Monetize
                  </button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-white">No health records found.</p>
        )}
      </div>
    </div>
  );
}

export default PatientDashboard;
