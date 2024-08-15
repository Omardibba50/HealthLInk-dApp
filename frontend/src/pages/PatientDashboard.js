import React, { useState, useEffect } from 'react';
import { getHealthContract, getAccount, connectWallet, sendTransaction, web3 } from '../utils/web3Config';

function PatientDashboard() {
  const [patient, setPatient] = useState(null);
  const [records, setRecords] = useState([]);
  const [error, setError] = useState('');
  const [tokenBalance, setTokenBalance] = useState('0');
  const [isLoading, setIsLoading] = useState(false);
  const [newRecord, setNewRecord] = useState({ date: '', diagnosis: '', description: '' });

  useEffect(() => {
    loadPatientData();
  }, []);

  async function loadPatientData() {
    setIsLoading(true);
    setError('');
    try {
      await connectWallet();
      const account = await getAccount();
      const healthContract = getHealthContract();
      
      console.log('Connected account:', account);
      console.log('Health contract address:', healthContract.options.address);

      // Check if the account has the PATIENT_ROLE
      const patientRole = await healthContract.methods.PATIENT_ROLE().call();
      const hasPatientRole = await healthContract.methods.hasRole(patientRole, account).call();
      console.log('Has PATIENT_ROLE:', hasPatientRole);

      if (!hasPatientRole) {
        throw new Error('Account is not registered as a patient');
      }

      let patientData;
      try {
        patientData = await healthContract.methods.patients(account).call();
        console.log('Raw patient data:', patientData);
      } catch (error) {
        console.error('Error fetching patient data:', error);
        throw new Error('Failed to fetch patient data: ' + error.message);
      }

      const formattedPatientData = {
        address: account,
        name: patientData.name,
        email: patientData.email,
        age: patientData.age.toString(),
        recordCount: patientData.recordCount.toString()
      };
      
      setPatient(formattedPatientData);

      let balance;
      try {
        balance = await healthContract.methods.balanceOf(account).call();
        console.log('Raw balance:', balance);
        setTokenBalance(web3.utils.fromWei(balance, 'ether'));
      } catch (error) {
        console.error('Error fetching balance:', error);
        setTokenBalance('Error');
      }

      let recordsData;
      try {
        console.log('Fetching records for account:', account);
        recordsData = await healthContract.methods.viewRecords(account).call({ from: account });
        console.log('Raw records data:', recordsData);
      } catch (error) {
        console.error('Error fetching records:', error);
        if (error.message.includes('Internal JSON-RPC error')) {
          console.error('RPC error details:', error.data);
          // If it's an RPC error, we'll set records to an empty array and continue
          recordsData = [];
        } else {
          throw new Error('Failed to fetch records: ' + error.message);
        }
      }
      
      const formattedRecords = Array.isArray(recordsData) ? recordsData.map((record, index) => ({
        date: record.date,
        creator: record.creator,
        diagnosis: record.diagnosis,
        description: record.description,
        isMonetized: record.isMonetized,
        index: index
      })) : [];
      
      setRecords(formattedRecords);
    } catch (error) {
      console.error("Error loading patient data:", error);
      setError("Failed to load patient data. Error: " + error.message);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleMonetize(recordIndex) {
    setIsLoading(true);
    setError('');
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
      setError("Failed to monetize record. Error: " + error.message);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleAddRecord(e) {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const account = await getAccount();
      const healthContract = getHealthContract();

      console.log('Adding new record:', newRecord);

      await sendTransaction(
        healthContract.methods.addPatientRecord(
          newRecord.date,
          newRecord.diagnosis,
          newRecord.description,
          []  // Empty array for files, as file handling is not implemented in this example
        ),
        { from: account }
      );

      setNewRecord({ date: '', diagnosis: '', description: '' });
      await loadPatientData();
    } catch (error) {
      console.error("Error adding record:", error);
      setError("Failed to add record. Error: " + error.message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {error && <p className="text-red-500 mb-4 bg-red-100 bg-opacity-20 p-3 rounded">{error}</p>}
      {isLoading && <p className="text-blue-500 mb-4">Loading...</p>}
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
      <div className="bg-white rounded-lg p-6 shadow-lg mb-8">
        <h2 className="text-2xl font-semibold text-indigo-900 mb-4">Add New Record</h2>
        <form onSubmit={handleAddRecord}>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2" htmlFor="date">Date</label>
            <input
              type="date"
              id="date"
              value={newRecord.date}
              onChange={(e) => setNewRecord({...newRecord, date: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2" htmlFor="diagnosis">Diagnosis</label>
            <input
              type="text"
              id="diagnosis"
              value={newRecord.diagnosis}
              onChange={(e) => setNewRecord({...newRecord, diagnosis: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2" htmlFor="description">Description</label>
            <textarea
              id="description"
              value={newRecord.description}
              onChange={(e) => setNewRecord({...newRecord, description: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            ></textarea>
          </div>
          <button
            type="submit"
            className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold py-2 px-4 rounded-full hover:from-indigo-600 hover:to-purple-600 transition duration-300 shadow-lg"
            disabled={isLoading}
          >
            {isLoading ? 'Processing...' : 'Add Record'}
          </button>
        </form>
      </div>
      <div className="bg-white rounded-lg p-6 shadow-lg">
        <h2 className="text-2xl font-semibold text-indigo-900 mb-4">Medical Records</h2>
        {records.length === 0 ? (
          <p className="text-gray-700">No medical records found.</p>
        ) : (
          records.map((record, index) => (
            <div key={index} className="bg-gray-100 rounded-lg p-4 mb-4">
              <p className="text-gray-700"><span className="font-semibold">Date:</span> {record.date}</p>
              <p className="text-gray-700"><span className="font-semibold">Creator:</span> {record.creator === patient.address ? 'Self' : `Doctor (${record.creator})`}</p>
              <p className="text-gray-700"><span className="font-semibold">Diagnosis:</span> {record.diagnosis}</p>
              <p className="text-gray-700"><span className="font-semibold">Description:</span> {record.description}</p>
              {!record.isMonetized && (
                <button
                  onClick={() => handleMonetize(record.index)}
                  className="mt-2 bg-gradient-to-r from-pink-500 to-yellow-500 text-white font-bold py-2 px-4 rounded-full hover:from-pink-600 hover:to-yellow-600 transition duration-300 shadow-lg"
                  disabled={isLoading}
                >
                  {isLoading ? 'Processing...' : 'Monetize'}
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