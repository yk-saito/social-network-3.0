// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.4;

import "hardhat/console.sol";

contract Posting {
    uint256 totalPosts; // PostPortalコントラクトのストレージに永続的に保存される
    uint256 private seed; // 乱数生成のシード
    /**
     * NewPostイベント
     */
    event NewPost(address indexed from, uint256 timestamp, string message);

    struct Post {
        address user;
        string  message;
        uint256 timestamp;
    }

    Post[] posts;

    // addressと数値を関連づける
    mapping(address => uint256) public lastPostedAt;

    // payableをつけることで、コントラクトに送金機能が実装される
    constructor() payable {
        console.log("PostPortal - Smart Contract!");

        seed = (block.difficulty + block.timestamp) % 100;
    }

    /**
     * postとメッセージを受け取り、配列に格納
     *
     * msg.sender: Wallet address of the function caller
     */

    // スマートコントラクトに含まれる関数を呼び出すには、ユーザーは有効なウォレットを接続する必要がある。
    // -> msg.senderは、誰が関数を呼び出したかを正確に把握し、ユーザー認証を行なっている！
    function post(string memory _message) public {
        require(
            lastPostedAt[msg.sender] + 0 seconds < block.timestamp,
            "Wait 15m"
        );
        // ユーザーの現在のタイムスタンプを更新
        lastPostedAt[msg.sender] = block.timestamp;

        totalPosts += 1;
        console.log("%s postd w/ mwssage %s", msg.sender, _message);

        posts.push(Post(msg.sender, _message, block.timestamp));

        // 乱数生成
        seed = (block.difficulty + block.timestamp + seed) % 100;
        console.log("Random # generated: %d", seed);

        // ユーザーがETHを獲得する確率を50%に設定
        if (seed <= 50) {
            // console.log("%s won!", msg.sender);

            // 投稿してくれたユーザーに0.0001ETHを送る
            uint256 prizeAmount = 0.00001 ether;
            require(
                prizeAmount <= address(this).balance,
                "Trying to withdraw more money than the contract has."
            );
            (bool success, ) = (msg.sender).call{value: prizeAmount}("");
            require(success, "Failed to withdraw money from contract.");
        } else {
            // console.log("%s did not win.", msg.sender);
        }

        // コントラクトでemitされたイベントに関する通知をフロントエンド側で取得できるようにする
        emit NewPost(msg.sender, block.timestamp, _message);
    }

    function getAllPosts() public view returns (Post[] memory) {
        return posts;
    }

    function getTotalPosts() public view returns (uint256) {
        // console.log("We have %d total posts!", totalPosts);
        return totalPosts;
    }
}