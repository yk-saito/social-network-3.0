import { formatEther, parseEther } from 'viem';
import hre from 'hardhat';

async function main() {
  const Posting = await hre.viem.deployContract('Posting', [], {
    value: parseEther('0.01'),
  });

  const publicClient = await hre.viem.getPublicClient();
  const postingBalance = await publicClient.getBalance({
    address: Posting.address,
  });

  console.log(
    `Deployed to ${Posting.address}\nBalance: ${formatEther(
      postingBalance,
    )} ETH`,
  );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
