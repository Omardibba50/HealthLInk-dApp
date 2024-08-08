const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  // Deploy Health contract
  const Health = await hre.ethers.getContractFactory("Health");
  const health = await Health.deploy();
  await health.deployed();

  console.log("Health contract deployed to:", health.address);

  // Deploy HealthDataMarketplace
  const HealthDataMarketplace = await hre.ethers.getContractFactory("HealthDataMarketplace");
  const marketplace = await HealthDataMarketplace.deploy(health.address);
  await marketplace.deployed();

  console.log("HealthDataMarketplace deployed to:", marketplace.address);

  // Set the marketplace address in the Health contract
  await health.setMarketplace(marketplace.address);
  console.log("Marketplace address set in Health contract");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });