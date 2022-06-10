// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.4;

import "hardhat/console.sol";

contract Posting {
    event NewPost(address indexed from, uint256 timestamp, string message);

    struct Post {
        address user;
        string  message;
        uint256 timestamp;
    }

    Post[] posts;
    uint256 totalPosts;
    uint256 private seed; // 乱数生成のシード

    // addressと数値を関連づける
    mapping(address => uint256) public lastPostedAt;

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
        // 現在ユーザーが投稿している時刻と、前回の投稿時刻が15分以上離れていることを確認
        require(
            lastPostedAt[msg.sender] + 1 minutes < block.timestamp,
            "Wait 1m"
        );
        // ユーザーの現在のタイムスタンプを更新
        lastPostedAt[msg.sender] = block.timestamp;

        totalPosts += 1;
        console.log("%s postd w/ mwssage %s", msg.sender, _message);

        // 投稿を配列に格納
        posts.push(Post(msg.sender, _message, block.timestamp));

        // 乱数生成
        seed = (block.difficulty + block.timestamp + seed) % 100;
        console.log("Random # generated: %d", seed);

        // ユーザーがETHを獲得する確率を50%に設定
        if (seed <= 50) {
            // console.log("%s won!", msg.sender);

            // 投稿してくれたユーザーに0.0001ETHを送る
            uint256 prizeAmount = 0.0001 ether;
            require(
                // コントラクトが持つ資金が足りるかチェック
                prizeAmount <= address(this).balance,
                "Trying to withdraw more money than the contract has."
            );
            (bool success, ) = (msg.sender).call{value: prizeAmount}("");
            require(success, "Failed to withdraw money from contract.");
        } else {
            console.log("%s did not win.", msg.sender);
        }

        // フロントエンドにイベント発生を通知
        emit NewPost(msg.sender, block.timestamp, _message);
    }

    function getAllPosts() public view returns (Post[] memory) {
        return posts;
    }

    function getTotalPosts() public view returns (uint256) {
        console.log("total posts: %d", totalPosts);
        return totalPosts;
    }
}