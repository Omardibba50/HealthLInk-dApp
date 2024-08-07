require("@nomiclabs/hardhat-waffle");
require("dotenv").config();

module.exports = {
  solidity: "0.8.10",
  defaultNetwork: "polygon_amoy",
  networks: {
    hardhat: {},
    polygon_amoy: {
      url: process.env.POLYGON_AMOY_RPC_URL,
      chainId: 80002,
      accounts: [`0x${process.env.PRIVATE_KEY}`],
      gasPrice: 50000000000, // 50 gwei
      gas: 5000000, // Increased gas limit
    }
  }
};
