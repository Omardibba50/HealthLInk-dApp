const hre = require("hardhat");

async function main() {
  const Health = await hre.ethers.getContractFactory("Health");
  const health = await Health.deploy();
  await health.deployed();
  console.log("Health contract deployed to:", health.address);

  const HealthDataMarketplace = await hre.ethers.getContractFactory("HealthDataMarketplace");
  const marketplace = await HealthDataMarketplace.deploy(health.address);
  await marketplace.deployed();
  console.log("HealthDataMarketplace deployed to:", marketplace.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
