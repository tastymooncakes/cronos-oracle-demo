require("dotenv").config();
require("@nomicfoundation/hardhat-toolbox");

module.exports = {
  solidity: "0.8.13",
  networks: {
    cronos_testnet: {
      url: process.env.CRONOS_RPC,
      accounts: [process.env.PRIVATE_KEY],
    },
  },
};