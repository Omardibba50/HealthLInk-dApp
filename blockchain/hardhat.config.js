require("@nomiclabs/hardhat-waffle");
require("dotenv").config();

module.exports = {
  solidity: "0.8.10",
  defaultNetwork: "polygon_amoy",
  networks: {
    hardhat: {},
    polygon_amoy: {
      url: process.env.POLYGON_AMOY_RPC_URL, // Ensure this is correctly referenced
      chainId: 80002,
      accounts: [process.env.PRIVATE_KEY], // No need for `0x` prefix here
      gasPrice: 30000000000, // 30 gwei
      gas: 3000000, // Increased gas limit
    },
  },
};