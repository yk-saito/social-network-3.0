const main = async () => {
    const [deployer] = await hre.ethers.getSigners();
    const accountBalance = await deployer.getBalance();
    console.log("Deploying contracts with accout: ", deployer.address);
    console.log("Account balance: ", accountBalance.toString());

    const postingContractFactory = await hre.ethers.getContractFactory("Posting");
    const postingContract = await postingContractFactory.deploy({
        value: hre.ethers.utils.parseEther("0.001"),
    });

    await postingContract.deployed();

    console.log("Contract deployed to: ", postingContract.address);
};

const runMain = async () => {
    try {
        await main();
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

runMain();