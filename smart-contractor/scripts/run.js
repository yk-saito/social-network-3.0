const main = async () => {
    const postingContractFactory = await hre.ethers.getContractFactory("Posting");
    const postingContract = await postingContractFactory.deploy({
        // コントラクトに0.1ETHを提供
        value: hre.ethers.utils.parseEther("0.1"),
    });
    await postingContract.deployed();
    console.log("Contract deployed to: ", postingContract.address);

    // コントラクトの残高を確認(0.1ETH)
    let contractBalance = await hre.ethers.provider.getBalance(
        postingContract.address
    );
    console.log(
        "Contract balance:",
        hre.ethers.utils.formatEther(contractBalance)
    );

    /*
     * 2回 waves を送るシミュレーションを行う
     */
    const postTxn = await postingContract.post("Hello #1");
    await postTxn.wait();

    const postTxn2 = await postingContract.post("Hello #2");
    await postTxn2.wait();

    // Postした後のコントラクトの残高を確認(残高 - 0.0001ETH)
    contractBalance = await hre.ethers.provider.getBalance(postingContract.address);
    console.log(
        "Contract balance:",
        hre.ethers.utils.formatEther(contractBalance)
    );

    let allPosts = await postingContract.getAllPosts();
    console.log(allPosts);
};

const runMain = async () => {
    try {
        await main();
        process.exit(0);
    } catch (error) {
        console.log(error);
        process.exit(1);
    }
};

runMain();