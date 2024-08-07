import React, { useState, useEffect } from 'react';
import { getMarketplaceContract, getAccount, connectWallet } from '../utils/web3Config';

function ResearcherDashboard() {
  const [researcher, setResearcher] = useState(null);
  const [purchasedData, setPurchasedData] = useState([]);

  useEffect(() => {
    loadResearcherData();
  }, []);

  async function loadResearcherData() {
    try {
      await connectWallet();
      const accounts = await getAccount();
      if (accounts && accounts.length > 0) {
        const account = accounts[0];
        const marketplaceContract = getMarketplaceContract();
        const researcherData = await marketplaceContract.methods.researchers(account).call();
        setResearcher(researcherData);
        
        // This is a placeholder. You'll need to implement a way to fetch purchased data
        // const purchasedDataIds = await marketplaceContract.methods.getPurchasedDataIds(account).call();
        // const fetchedPurchasedData = await Promise.all(purchasedDataIds.map(id => marketplaceContract.methods.getPurchasedData(id).call()));
        // setPurchasedData(fetchedPurchasedData);
      }
    } catch (error) {
      console.error("Error loading researcher data:", error);
    }
  }

  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold text-white mb-8">Researcher Dashboard</h1>
      {researcher && (
        <div className="bg-white bg-opacity-10 rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold text-white mb-4">Researcher Information</h2>
          <p className="text-white">Name: {researcher.name}</p>
          <p className="text-white">Address: {researcher.addr}</p>
        </div>
      )}
      <div className="bg-white bg-opacity-10 rounded-lg p-6">
        <h2 className="text-2xl font-semibold text-white mb-4">Purchased Data</h2>
        {purchasedData.length > 0 ? (
          purchasedData.map((data, index) => (
            <div key={index} className="bg-white bg-opacity-20 rounded-lg p-4 mb-4">
              <p className="text-white">Patient: {data.patient}</p>
              <p className="text-white">Record Index: {data.recordIndex}</p>
              {/* Display other relevant data */}
            </div>
          ))
        ) : (
          <p className="text-white">No purchased data yet.</p>
        )}
      </div>
    </div>
  );
}

export default ResearcherDashboard;