import { HardhatUserConfig } from 'hardhat/config';
import '@nomicfoundation/hardhat-toolbox-viem';
require('dotenv').config();

const { ALCHEMY_SEPOLIA_HTTPS, ETHERSCAN_API_KEY, PRIVATE_KEY } = process.env;

const config: HardhatUserConfig = {
  solidity: '0.8.19',
  etherscan: {
    apiKey: ETHERSCAN_API_KEY,
  },
  defaultNetwork: 'hardhat',
  networks: {
    sepolia: {
      url: ALCHEMY_SEPOLIA_HTTPS || '',
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

export default config;
