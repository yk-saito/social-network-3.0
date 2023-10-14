const { Console } = require("console");

const main = async () => {
    const [randomPerson, randomPerson2, randomPerson3] = await hre.ethers.getSigners();
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
     * 5回投稿を送るシミュレーションを行う
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

    // 投稿した後のコントラクトの残高を確認(残高 - 0.0001ETH)
    contractBalance = await hre.ethers.provider.getBalance(postingContract.address);
    console.log(
        "Contract balance:",
        hre.ethers.utils.formatEther(contractBalance)
    );

    // 投稿を確認
    let allPosts = await postingContract.getAllPosts();
    console.log(allPosts);

    // いいねの数を更新してみる
    await postingContract.connect(randomPerson).updateTotalLikes(0);
    await postingContract.connect(randomPerson2).updateTotalLikes(0);
    await postingContract.connect(randomPerson3).updateTotalLikes(0);

    let allPost2 = await postingContract.getAllPosts();
    console.log(allPost2);

    // いいねの数を一つ減らしてみる
    await postingContract.connect(randomPerson).updateTotalLikes(0);

    let allPost3 = await postingContract.getAllPosts();
    console.log(allPost3);
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