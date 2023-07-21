import { HardhatUserConfig } from 'hardhat/config';
import '@nomicfoundation/hardhat-toolbox';
import '@nomiclabs/hardhat-ethers';
import 'dotenv/config';

import dotenv from 'dotenv';
dotenv.config();

const config: HardhatUserConfig = {
  solidity: "0.8.18",
  networks: {
    mumbai: {
      url: "https://fragrant-late-asphalt.matic-testnet.discover.quiknode.pro/9820b93170b99024e4b616370542626027b0f3fd/",
      accounts: [process.env.DEV_PRIVATE_KEY || ''],
      chainId: 80001,
    },
  },
};

export default config;
