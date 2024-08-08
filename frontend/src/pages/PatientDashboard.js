import React, { useState, useEffect } from 'react';
import { getHealthContract, getAccount, connectWallet, sendTransaction, web3 } from '../utils/web3Config';

function PatientDashboard() {
  const [patient, setPatient] = useState(null);
  const [records, setRecords] = useState([]);
  const [error, setError] = useState('');
  const [tokenBalance, setTokenBalance] = useState('0');

  useEffect(() => {
    loadPatientData();
  }, []);

  async function loadPatientData() {
    try {
      await connectWallet();
      const account = await getAccount();
      const healthContract = getHealthContract();
      
      const patientData = await healthContract.methods.patients(account).call();
      const formattedPatientData = {
        address: account,
        name: patientData.name,
        email: patientData.email,
        age: patientData.age.toString(),
        recordSize: patientData.recordSize.toString()
      };
      
      setPatient(formattedPatientData);

      const balance = await healthContract.methods.balanceOf(account).call();
      setTokenBalance(web3.utils.fromWei(balance, 'ether'));

      const recordSize = parseInt(formattedPatientData.recordSize, 10);
      const recordsData = [];
      for (let i = 0; i < recordSize; i++) {
        const record = await healthContract.methods.viewRecords(account).call();
        recordsData.push({
          index: i,
          date: record[i].date,
          doctor: record[i].doctor,
          diagnosis: record[i].diagnosis,
          description: record[i].description,
          isMonetized: record[i].isMonetized
        });
      }
      setRecords(recordsData);
    } catch (error) {
      console.error("Error loading patient data:", error);
      setError("Failed to load patient data. Please try again.");
    }
  }

  async function handleMonetize(recordIndex) {
    try {
      const account = await getAccount();
      const healthContract = getHealthContract();
      
      const price = web3.utils.toWei('10', 'ether'); // 10 tokens

      await sendTransaction(
        healthContract.methods.monetizeRecord(recordIndex, price),
        { from: account }
      );

      await loadPatientData();
    } catch (error) {
      console.error("Error monetizing record:", error);
      setError("Failed to monetize record. Please try again.");
    }
  }

  return (
    <div className="p-8 bg-gradient-to-r from-blue-500 to-purple-600 min-h-screen">
      <h1 className="text-4xl font-bold text-white mb-8">Patient Dashboard</h1>
      {error && <p className="text-red-300 mb-4 bg-red-100 bg-opacity-20 p-3 rounded">{error}</p>}
      {patient && (
        <div className="bg-white bg-opacity-10 rounded-lg p-6 mb-8 shadow-lg">
          <h2 className="text-2xl font-semibold text-white mb-4">Personal Information</h2>
          <p className="text-white"><span className="font-semibold">Name:</span> {patient.name}</p>
          <p className="text-white"><span className="font-semibold">Email:</span> {patient.email}</p>
          <p className="text-white"><span className="font-semibold">Age:</span> {patient.age}</p>
          <p className="text-white"><span className="font-semibold">Token Balance:</span> {tokenBalance} HLT</p>
          <p className="text-white break-all"><span className="font-semibold">Address:</span> {patient.address}</p>
        </div>
      )}
      <div className="bg-white bg-opacity-10 rounded-lg p-6 shadow-lg">
        <h2 className="text-2xl font-semibold text-white mb-4">Medical Records</h2>
        {records.length === 0 ? (
          <p className="text-white">No medical records found.</p>
        ) : (
          records.map((record, index) => (
            <div key={index} className="bg-white bg-opacity-20 rounded-lg p-4 mb-4">
              <p className="text-white"><span className="font-semibold">Date:</span> {record.date}</p>
              <p className="text-white"><span className="font-semibold">Doctor:</span> {record.doctor}</p>
              <p className="text-white"><span className="font-semibold">Diagnosis:</span> {record.diagnosis}</p>
              <p className="text-white"><span className="font-semibold">Description:</span> {record.description}</p>
              {!record.isMonetized && (
                <button
                  onClick={() => handleMonetize(index)}
                  className="mt-2 bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out transform hover:scale-105"
                >
                  Monetize
                </button>
              )}
              {record.isMonetized && (
                <p className="text-green-300 mt-2">This record has been monetized</p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default PatientDashboard;