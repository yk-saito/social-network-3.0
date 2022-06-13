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
     * 5回 waves を送るシミュレーションを行う
     */
    const postTxn = await postingContract.post("Hello #1");
    await postTxn.wait();

    const postTxn2 = await postingContract.post("Hello #2");
    await postTxn2.wait();

    const postTxn3 = await postingContract.post("Hello #3");
    await postTxn3.wait();

    const postTxn4 = await postingContract.post("Hello #4");
    await postTxn4.wait();

    const postTxn5 = await postingContract.post("Hello #5");
    await postTxn5.wait();

    // Postした後のコントラクトの残高を確認(残高 - 0.0001ETH)
    contractBalance = await hre.ethers.provider.getBalance(postingContract.address);
    console.log(
        "Contract balance:",
        hre.ethers.utils.formatEther(contractBalance)
    );

    // いいねの数を更新してみる
    let allPosts = await postingContract.getAllPosts();
    console.log(allPosts);

    await postingContract.updateTotalLikes(0);
    let allPosts2 = await postingContract.getAllPosts();
    console.log(allPosts2);

    await postingContract.updateTotalLikes(0);
    let allPosts3 = await postingContract.getAllPosts();
    console.log(allPosts3);

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