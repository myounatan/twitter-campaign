import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { BigNumber, Contract, ethers } from 'ethers';

// cosntructorArgs is an array here
export const verify = async (hre: HardhatRuntimeEnvironment, contract: Contract, contractPath: string, constructorArgs: any) => {
  console.log('Verifying contract...');

  // wait 6 blocks before verification to ensure etherscan is up to date
  const numBlocks = 6;
  for (let i = 1; i <= numBlocks; i++) {
    //if (i % 2 == 0) {
    console.log(`Waiting for block ${i}/${numBlocks}...`);
    //}
    await contract.deployTransaction.wait(i);
  }

  await hre.run('verify:verify', { address: contract.address, contract: contractPath, constructorArguments: constructorArgs });

  console.log('Contract verified (still check etherscan)!');
};

export const CONVERT_WEI = (amount: number): BigNumber => {
  return ethers.utils.parseEther(amount.toString());
};