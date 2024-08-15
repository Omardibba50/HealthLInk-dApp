import Web3 from 'web3';
import HealthABIImport from '../abis/Health.json';
import HealthDataMarketplaceABIImport from '../abis/HealthDataMarketplace.json';

let web3;
let healthContract;
let marketplaceContract;

const healthContractAddress = process.env.REACT_APP_HEALTH_CONTRACT_ADDRESS;
const marketplaceContractAddress = process.env.REACT_APP_MARKETPLACE_CONTRACT_ADDRESS;

const HealthABI = HealthABIImport.abi || HealthABIImport;
const HealthDataMarketplaceABI = HealthDataMarketplaceABIImport.abi || HealthDataMarketplaceABIImport;

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

const switchRpcUrl = () => {
  const newRpcUrl = getNextRpcUrl();
  console.log(`Switching to RPC URL: ${newRpcUrl}`);
  web3.setProvider(newRpcUrl);
};

export const connectWallet = async () => {
  if (window.ethereum) {
    try {
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      web3 = createWeb3Instance(window.ethereum);
      const chainId = await web3.eth.getChainId();
      console.log('Connected to chain ID:', chainId);
      if (chainId !== POLYGON_AMOY_CHAIN_ID) {
        await switchToPolygonAmoy();
      }
      await initializeContracts();
      return true;
    } catch (error) {
      console.error("Wallet connection error:", error);
      throw new Error("Failed to connect wallet: " + error.message);
    }
  } else {
    throw new Error("No Ethereum browser extension detected, please install MetaMask");
  }
};

export const logout = () => {
  web3 = null;
  healthContract = null;
  marketplaceContract = null;
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
              nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 },
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

const initializeContracts = async () => {
  try {
    if (!web3) {
      throw new Error("Web3 is not initialized");
    }
    console.log("Initializing Health contract with address:", healthContractAddress);
    console.log("Health ABI:", HealthABI);
    healthContract = new web3.eth.Contract(HealthABI, healthContractAddress);
    console.log("Health Contract initialized:", healthContract);

    console.log("Initializing Marketplace contract with address:", marketplaceContractAddress);
    console.log("Marketplace ABI:", HealthDataMarketplaceABI);
    marketplaceContract = new web3.eth.Contract(HealthDataMarketplaceABI, marketplaceContractAddress);
    console.log("Marketplace Contract initialized:", marketplaceContract);
  } catch (error) {
    console.error("Contract initialization error:", error);
    throw new Error("Failed to initialize contracts: " + error.message);
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
        console.error('Contract execution reverted. Error:', error.message);
        throw new Error('Contract execution reverted: ' + error.message);
      }
      if (error.message.includes('Internal JSON-RPC error')) {
        console.error('RPC error details:', error.data);
        if (attempt < retries - 1) {
          console.log('Switching RPC URL and retrying...');
          switchRpcUrl();
          await new Promise(resolve => setTimeout(resolve, 2000));
          continue;
        }
      }
      if (attempt === retries - 1) {
        throw new Error('Transaction failed after ' + retries + ' attempts: ' + error.message);
      }
    }
  }
};
export const checkUserRole = async (address) => {
  const healthContract = getHealthContract();
  const isPatient = await healthContract.methods.hasRole(web3.utils.soliditySha3('PATIENT_ROLE'), address).call();
  const isDoctor = await healthContract.methods.hasRole(web3.utils.soliditySha3('DOCTOR_ROLE'), address).call();
  return { isPatient, isDoctor };
};

export const claimTokens = async (account) => {
  const healthContract = getHealthContract();
  await sendTransaction(healthContract.methods.claimFreeTokens(), { from: account });
};
export const callViewFunction = async (method, params) => {
  try {
    const result = await method.call(params);
    return result;
  } catch (error) {
    console.error('Error calling view function:', error);
    if (error.message.includes('Internal JSON-RPC error')) {
      console.error('RPC error details:', error.data);
    }
    throw error;
  }
};

export { web3 };
export default web3;