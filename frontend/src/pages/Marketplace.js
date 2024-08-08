import React, { useState, useEffect } from 'react';
import { getHealthContract, getMarketplaceContract, getAccount, connectWallet, sendTransaction, web3 } from '../utils/web3Config';

function Marketplace() {
  const [listings, setListings] = useState([]);
  const [error, setError] = useState('');
  const [tokenBalance, setTokenBalance] = useState('0');

  useEffect(() => {
    loadMarketplaceData();
  }, []);

  async function loadMarketplaceData() {
    try {
      await connectWallet();
      const account = await getAccount();
      const marketplaceContract = getMarketplaceContract();
      const healthContract = getHealthContract();
      
      const activeListings = await marketplaceContract.methods.getActiveListings().call();
      
      const listingsData = await Promise.all(activeListings.map(async (listingId) => {
        const listing = await marketplaceContract.methods.getListingDetails(listingId).call();
        return {
          id: listingId,
          patient: listing[0],
          recordIndex: listing[1],
          price: listing[2],
          isActive: listing[3]
        };
      }));

      setListings(listingsData);

      const balance = await healthContract.methods.balanceOf(account).call();
      setTokenBalance(web3.utils.fromWei(balance, 'ether'));
    } catch (error) {
      console.error("Error loading marketplace data:", error);
      setError("Failed to load marketplace data. Please try again.");
    }
  }

  async function handlePurchase(listingId) {
    try {
      const account = await getAccount();
      const marketplaceContract = getMarketplaceContract();
      const healthContract = getHealthContract();
      
      const listing = await marketplaceContract.methods.getListingDetails(listingId).call();
      const price = listing[2];

      // First, approve the marketplace contract to spend tokens on behalf of the user
      await sendTransaction(
        healthContract.methods.approve(marketplaceContract.options.address, price),
        { from: account }
      );

      // Then, purchase the data
      await sendTransaction(
        marketplaceContract.methods.purchaseData(listingId),
        { from: account }
      );

      // Reload marketplace data to reflect changes
      await loadMarketplaceData();
    } catch (error) {
      console.error("Error purchasing data:", error);
      setError("Failed to purchase data. Please try again.");
    }
  }

  function formatPrice(price) {
    try {
      return web3.utils.fromWei(price, 'ether');
    } catch (error) {
      console.error("Error formatting price:", error);
      return "N/A";
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {error && <p className="text-red-500 mb-4 bg-red-100 bg-opacity-20 p-3 rounded">{error}</p>}
      <div className="bg-white rounded-lg p-6 mb-8 shadow-lg">
        <h2 className="text-2xl font-semibold text-indigo-900 mb-4">Your Token Balance</h2>
        <p className="text-2xl text-gray-700">{tokenBalance} HLT</p>
      </div>
      <div className="bg-white rounded-lg p-6 shadow-lg">
        <h2 className="text-2xl font-semibold text-indigo-900 mb-4">Available Data Listings</h2>
        {listings.length === 0 ? (
          <p className="text-gray-700">No active listings available at the moment.</p>
        ) : (
          listings.map((listing) => (
            <div key={listing.id} className="bg-gray-100 rounded-lg p-4 mb-4">
              <p className="text-gray-700">Patient: {listing.patient}</p>
              <p className="text-gray-700">Record Index: {listing.recordIndex}</p>
              <p className="text-gray-700">Price: {formatPrice(listing.price)} HLT</p>
              <button
                onClick={() => handlePurchase(listing.id)}
                className="mt-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold py-2 px-4 rounded-full hover:from-indigo-700 hover:to-purple-700 transition duration-300 shadow-lg"
              >
                Purchase
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Marketplace;