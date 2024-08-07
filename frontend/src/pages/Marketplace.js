import React, { useState, useEffect } from 'react';
import { getHealthContract, getMarketplaceContract, getAccount, connectWallet } from '../utils/web3Config';

function Marketplace() {
  const [listings, setListings] = useState([]);
  const [userType, setUserType] = useState(null);

  useEffect(() => {
    loadMarketplaceData();
  }, []);

  async function loadMarketplaceData() {
    try {
      await connectWallet();
      const account = await getAccount();
      const healthContract = getHealthContract();
      const marketplaceContract = getMarketplaceContract();
      
      const userData = await healthContract.methods.users(account).call();
      setUserType(userData.categ);

      const listingCount = await marketplaceContract.methods.listingCount().call();
      const listingsData = [];
      for (let i = 0; i < listingCount; i++) {
        const listing = await marketplaceContract.methods.listings(i).call();
        if (listing.isActive) {
          listingsData.push({ ...listing, id: i });
        }
      }
      setListings(listingsData);
    } catch (error) {
      console.error("Error loading marketplace data:", error);
    }
  }

  async function handlePurchase(listingId) {
    try {
      await connectWallet();
      const account = await getAccount();
      const marketplaceContract = getMarketplaceContract();
      await marketplaceContract.methods.purchaseData(listingId).send({ from: account });
      loadMarketplaceData();
    } catch (error) {
      console.error("Error purchasing data:", error);
    }
  }

  async function handleList(e) {
    e.preventDefault();
    try {
      await connectWallet();
      const account = await getAccount();
      const marketplaceContract = getMarketplaceContract();
      const recordIndex = e.target.recordIndex.value;
      const price = e.target.price.value;
      await marketplaceContract.methods.listData(recordIndex, price).send({ from: account });
      loadMarketplaceData();
    } catch (error) {
      console.error("Error listing data:", error);
    }
  }

  return (
    <div className="p-8 bg-gradient-to-r from-blue-500 to-purple-600 min-h-screen">
      <h1 className="text-4xl font-bold text-white mb-8">Marketplace</h1>
      {userType === '0' && ( // Patient
        <div className="bg-white bg-opacity-10 rounded-lg p-6 mb-8 shadow-lg">
          <h2 className="text-2xl font-semibold text-white mb-4">List Data</h2>
          <form onSubmit={handleList}>
            <div className="mb-4">
              <label className="block text-white mb-2">Record Index</label>
              <input
                type="number"
                name="recordIndex"
                className="w-full px-3 py-2 bg-white bg-opacity-20 rounded text-white"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-white mb-2">Price (in tokens)</label>
              <input
                type="number"
                name="price"
                className="w-full px-3 py-2 bg-white bg-opacity-20 rounded text-white"
                required
              />
            </div>
            <button type="submit" className="bg-indigo-600 text-white py-2 px-4 rounded hover:bg-indigo-700">
              List Data
            </button>
          </form>
        </div>
      )}
      <div className="bg-white bg-opacity-10 rounded-lg p-6 shadow-lg">
        <h2 className="text-2xl font-semibold text-white mb-4">Available Listings</h2>
        {listings.map((listing) => (
          <div key={listing.id} className="bg-white bg-opacity-20 rounded-lg p-4 mb-4">
            <p className="text-white">Patient: {listing.patient}</p>
            <p className="text-white">Record Index: {listing.recordIndex}</p>
            <p className="text-white">Price: {listing.price} tokens</p>
            {userType === '2' && ( // Researcher
              <button
                onClick={() => handlePurchase(listing.id)}
                className="mt-2 bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
              >
                Purchase
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Marketplace;
