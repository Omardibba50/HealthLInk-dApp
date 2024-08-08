import Web3 from 'web3';
import HealthABI from '../abis/Health.json';
import HealthDataMarketplaceABI from '../abis/HealthDataMarketplace.json';

let web3;
let healthContract;
let marketplaceContract;

const healthContractAddress = '0x3964A03b63C7575c000312f3EA15588656b07Dc3';
const marketplaceContractAddress = '0x8D52f7C67fCBB453321FB40c5Ce262EDc2eFd6e5';

const POLYGON_AMOY_CHAIN_ID = 80002;

const RPC_URLS = [
  'https://rpc-amoy.polygon.technology/',
  'https://polygon-amoy-testnet.public.blastapi.io',
  'https://polygon-amoy.blockpi.network/v1/rpc/public'
];

let currentRpcUrlIndex = 0;

const getNextRpcUrl = () => {
  currentRpcUrlIndex = (currentRpcUrlIndex + 1) % RPC_URLS.length;
  return RPC_URLS[currentRpcUrlIndex];
};

const createWeb3Instance = (provider) => {
  return new Web3(provider || Web3.givenProvider || getNextRpcUrl());
};

export const connectWallet = async () => {
  if (window.ethereum) {
    try {
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      web3 = createWeb3Instance(window.ethereum);

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
              rpcUrls: RPC_URLS,
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

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const sendTransaction = async (method, params, retries = 3) => {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      console.log(`Attempt ${attempt + 1} of ${retries}`);
      console.log('Estimating gas...');
      const gas = await method.estimateGas(params);
      console.log('Estimated gas:', gas);

      console.log('Getting gas price...');
      const gasPrice = await web3.eth.getGasPrice();
      console.log('Gas price:', gasPrice);

      console.log('Sending transaction...');
      const result = await method.send({
        ...params,
        gas: Math.floor(Number(gas) * 1.2).toString(),
        gasPrice: gasPrice.toString(),
      });
      console.log('Transaction result:', result);
      return result;
    } catch (error) {
      console.error(`Transaction error (Attempt ${attempt + 1}):`, error);
      if (error.message.includes('execution reverted')) {
        console.error('Contract execution reverted. Check your contract logic.');
        throw error; // Don't retry for contract logic errors
      }
      if (attempt < retries - 1) {
        console.log(`Switching RPC URL and retrying in 2 seconds...`);
        web3.setProvider(getNextRpcUrl());
        await delay(2000); // Wait for 2 seconds before retrying
      } else {
        throw new Error(`Transaction failed after ${retries} attempts: ${error.message}`);
      }
    }
  }
};

export { web3 };

export default web3;