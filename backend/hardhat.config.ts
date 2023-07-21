import 'dotenv/config'

import { HardhatUserConfig } from 'hardhat/config';
import '@nomicfoundation/hardhat-toolbox';
import '@nomiclabs/hardhat-ethers';

const config: HardhatUserConfig = {
  solidity: "0.8.18",
  networks: {
    localhost: {
      url: 'http://127.0.0.1:8545/',
      chainId: 31337,
    },
    mumbai: {
      url: process.env.QUICKNODE_MUMBAI,
      accounts: [process.env.DEV_PRIVATE_KEY || ''],
      chainId: 80001,
    },
  },
  etherscan: {
    apiKey: process.env.MUMBAI_SCAN_KEY
  }
};

export default config;
