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
    <div className="container mx-auto px-4 py-8">
      {error && <p className="text-red-500 mb-4 bg-red-100 bg-opacity-20 p-3 rounded">{error}</p>}
      {patient && (
        <div className="bg-white rounded-lg p-6 mb-8 shadow-lg">
          <h2 className="text-2xl font-semibold text-indigo-900 mb-4">Personal Information</h2>
          <p className="text-gray-700"><span className="font-semibold">Name:</span> {patient.name}</p>
          <p className="text-gray-700"><span className="font-semibold">Email:</span> {patient.email}</p>
          <p className="text-gray-700"><span className="font-semibold">Age:</span> {patient.age}</p>
          <p className="text-gray-700"><span className="font-semibold">Token Balance:</span> {tokenBalance} HLT</p>
          <p className="text-gray-700 break-all"><span className="font-semibold">Address:</span> {patient.address}</p>
        </div>
      )}
      <div className="bg-white rounded-lg p-6 shadow-lg">
        <h2 className="text-2xl font-semibold text-indigo-900 mb-4">Medical Records</h2>
        {records.length === 0 ? (
          <p className="text-gray-700">No medical records found.</p>
        ) : (
          records.map((record, index) => (
            <div key={index} className="bg-gray-100 rounded-lg p-4 mb-4">
              <p className="text-gray-700"><span className="font-semibold">Date:</span> {record.date}</p>
              <p className="text-gray-700"><span className="font-semibold">Doctor:</span> {record.doctor}</p>
              <p className="text-gray-700"><span className="font-semibold">Diagnosis:</span> {record.diagnosis}</p>
              <p className="text-gray-700"><span className="font-semibold">Description:</span> {record.description}</p>
              {!record.isMonetized && (
                <button
                  onClick={() => handleMonetize(index)}
                  className="mt-2 bg-gradient-to-r from-pink-500 to-yellow-500 text-white font-bold py-2 px-4 rounded-full hover:from-pink-600 hover:to-yellow-600 transition duration-300 shadow-lg"
                >
                  Monetize
                </button>
              )}
              {record.isMonetized && (
                <p className="text-green-600 mt-2">This record has been monetized</p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default PatientDashboard;