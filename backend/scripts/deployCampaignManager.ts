import hre, { ethers } from 'hardhat';

import 'dotenv/config';
import { verify } from '../utils';

async function main() {
  const backendAdmin = '0x0D0bA03CFd9f99B4aAa19e75Ee7C4C4FA4EB55BC';

  const constructorArgs = [backendAdmin];
  const campaignManager = await ethers.deployContract('CampaignManager', constructorArgs);

  await campaignManager.deployed();

  console.log('CampaignManager deployed to:', campaignManager.address);

  // if network is mumbai
  if (hre.network.name === 'mumbai') {
    await verify(hre, campaignManager, 'contracts/CampaignManager.sol:CampaignManager', constructorArgs);
  }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
