/* global BigInt */
import Web3 from 'web3';
import HealthABI from '../abis/Health.json';
import HealthDataMarketplaceABI from '../abis/HealthDataMarketplace.json';

let web3;
let healthContract;
let marketplaceContract;

const healthContractAddress = '0xD701c5B7A180ff6Bbdba5D9afDF442F8508B3365';
const marketplaceContractAddress = '0x62eF0A6569b8AD6a6b354A9701A8c308De8e0D3d';

const POLYGON_AMOY_CHAIN_ID = 80002;
const POLYGON_AMOY_RPC_URL = 'https://rpc-amoy.polygon.technology/';

export const connectWallet = async () => {
  if (window.ethereum) {
    try {
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      web3 = new Web3(window.ethereum);

      const chainId = await web3.eth.getChainId();
      if (chainId !== POLYGON_AMOY_CHAIN_ID) {
        await switchToPolygonAmoy();
      }

      initializeContracts();
    } catch (error) {
      console.error("Wallet connection error:", error);
      throw new Error(error.message || "User denied account access");
    }
  } else {
    throw new Error("No Ethereum browser extension detected, please install MetaMask");
  }
};

const switchToPolygonAmoy = async () => {
  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: Web3.utils.toHex(POLYGON_AMOY_CHAIN_ID) }],
    });
  } catch (switchError) {
    if (switchError.code === 4902) {
      try {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [
            {
              chainId: Web3.utils.toHex(POLYGON_AMOY_CHAIN_ID),
              chainName: 'Polygon Amoy Testnet',
              nativeCurrency: {
                name: 'MATIC',
                symbol: 'MATIC',
                decimals: 18
              },
              rpcUrls: [POLYGON_AMOY_RPC_URL],
              blockExplorerUrls: ['https://www.oklink.com/amoy'],
            },
          ],
        });
      } catch (addError) {
        throw new Error("Failed to add Polygon Amoy network");
      }
    } else {
      throw new Error("Failed to switch to Polygon Amoy network");
    }
  }
};

const initializeContracts = () => {
  try {
    healthContract = new web3.eth.Contract(HealthABI.abi, healthContractAddress);
    marketplaceContract = new web3.eth.Contract(HealthDataMarketplaceABI.abi, marketplaceContractAddress);
  } catch (error) {
    console.error("Contract initialization error:", error);
    throw new Error("Failed to initialize contracts");
  }
};

export const getAccount = async () => {
  if (!web3) {
    await connectWallet();
  }
  const accounts = await web3.eth.getAccounts();
  return accounts[0];
};

export const getHealthContract = () => {
  if (!healthContract) {
    throw new Error("Health contract not initialized. Please connect wallet first.");
  }
  return healthContract;
};

export const getMarketplaceContract = () => {
  if (!marketplaceContract) {
    throw new Error("Marketplace contract not initialized. Please connect wallet first.");
  }
  return marketplaceContract;
};

export const sendTransaction = async (method, params) => {
  try {
    console.log('Estimating gas...');
    const gas = await method.estimateGas(params);
    console.log('Estimated gas:', gas);

    console.log('Getting gas price...');
    const gasPrice = await web3.eth.getGasPrice();
    console.log('Gas price:', gasPrice);

    console.log('Sending transaction...');
    const result = await method.send({
      ...params,
      gas: Math.floor(Number(gas) * 1.2).toString(), // Add 20% buffer and convert to string
      gasPrice: gasPrice.toString(), // Ensure gas price is a string
    });
    console.log('Transaction result:', result);
    return result;
  } catch (error) {
    console.error("Transaction error:", error);
    if (error.message.includes('execution reverted')) {
      console.error('Contract execution reverted. Check your contract logic.');
    }
    throw new Error("Transaction failed: " + error.message);
  }
};

export default web3;
