require('@nomiclabs/hardhat-etherscan');
require('@nomicfoundation/hardhat-toolbox');
require('dotenv').config();

const { ETHERSCAN_API_KEY, ALCHEMY_SEPOLIA_HTTP, PRIVATE_KEY } = process.env;

module.exports = {
  solidity: '0.8.18',
  etherscan: {
    apiKey: ETHERSCAN_API_KEY,
  },
  defaultNetwork: 'hardhat',
  networks: {
    sepolia: {
      url: ALCHEMY_SEPOLIA_HTTP || '',
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
    },
  },
  paths: {
    artifacts: '../client/src/artifacts',
  },
  typechain: {
    outDir: '../client/types/typechain',
    target: 'ethers-v5',
  },
};