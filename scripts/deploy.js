const { ethers } = require("hardhat");

async function main() {
  const PYTH_CONTRACT_ADDRESS = "0x36825bf3Fbdf5a29E2d5148bfe7Dcf7B5639e320";

  const Contract = await ethers.getContractFactory("PythPrice");

  const contract = await Contract.deploy(PYTH_CONTRACT_ADDRESS);

  await contract.waitForDeployment();

  console.log("Deployed PythPrice to:", await contract.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
