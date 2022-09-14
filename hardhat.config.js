require("hardhat-gas-reporter");
require("@nomicfoundation/hardhat-toolbox");
require("@nomiclabs/hardhat-solhint");
require("solidity-coverage");
require("hardhat-docgen");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.9",
  networks: {
    hardhat: {
      forking: {
        url: "https://eth-mainnet.g.alchemy.com/v2/RJmOanDm040GR9lLO-trPXwOo0gxzOzc",
      },
    },
  },
  gasReporter: {
    enabled: true,
    currency: "USD",
    coinmarketcap: "2c8e44a1-d1b1-4ea9-bdbe-1bc019d5f248",
  },
  docgen: {
    path: "./docs",
  },
};
