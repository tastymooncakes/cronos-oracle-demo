// scripts/deploy.js
// This script deploys the PythPrice smart contract and connects it to the Pyth Network Oracle
const { ethers } = require("hardhat");

async function main() {
    
    // Address for Pyth Oracle Contract on Cronos (testnet)
    // Make sure to this matches correct deployment target
    const PYTH_CONTRACT_ADDRESS = "0x36825bf3Fbdf5a29E2d5148bfe7Dcf7B5639e320";

    console.log("Deploying PythPrice contract ...");
    console.log("Using Pyth Oracle Address: ", PYTH_CONTRACT_ADDRESS);
    
    // Loads the contract factory for the PythPrice contract
    const ContractFactory = await ethers.getContractFactory("PythPrice");
    
    // Deploys the contract and pass in the Pyth Contract Address as constructor argument
    const contract = await ContractFactory.deploy(PYTH_CONTRACT_ADDRESS);
    
    // Wait until the contract is fully deployed to the network
    await contract.waitForDeployment();
    
    // Output : Deployed Contract Address
    console.log(`Deployed PythPrice to: ${contract.target}`);
}

// Error handling to catch any issues during deployment
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});