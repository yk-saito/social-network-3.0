// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.4;

import "hardhat/console.sol";

contract Posting {
    event NewPost(address indexed from, uint256 timestamp, string message);

    struct Post {
        uint256 id;
        address user;
        string  message;
        uint256 timestamp;
        uint256 totalLikes;
    }

    Post[] posts;

    uint256 totalPosts;
    uint256 private seed; // 乱数生成のシード
    mapping(uint256 => mapping(address => address)) public likedUsers; //PostのIdと、いいねを押したユーザーのアドレスをマッピング

    constructor() payable {
        console.log("PostPortal - Smart Contract!");

        seed = (block.difficulty + block.timestamp) % 100;
    }

    /**
     * postとメッセージを受け取り、配列に格納
     *
     * msg.sender: post関数を読んだユーザーのウォレットアドレス
     */
    function post(string memory _message) public {
        // 投稿を配列に格納
        posts.push(Post(totalPosts, msg.sender, _message, block.timestamp, 0));

        totalPosts += 1;
        console.log("%s postd w/ mwssage %s", msg.sender, _message);

        // 乱数生成
        seed = (block.difficulty + block.timestamp + seed) % 100;
        console.log("Random # generated: %d", seed);

        // ユーザーがETHを獲得する確率を20%に設定
        if (seed <= 20) {
            console.log("%s won!", msg.sender);

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

    /**
     * いいねの数を更新する
     */
    function updateTotalLikes(uint256 id) public {
        // ユーザーが既にいいねを押していたら、いいねを解除する
        if (likedUsers[id][msg.sender] == msg.sender) {
            posts[id].totalLikes -= 1;
            delete likedUsers[id][msg.sender];
            console.log("decrement");
        } else {
            posts[id].totalLikes += 1;
            likedUsers[id][msg.sender] = msg.sender;
            console.log("increment");
        }
    }

    /**
     * 全ての投稿を返す
     */
    function getAllPosts() public view returns (Post[] memory) {
        Post[] memory allPosts = new Post[](totalPosts);

        for (uint256 i = 0; i < totalPosts; ++i) {
            allPosts[i] = posts[i];
        }
        return allPosts;
    }

    /**
     * 投稿数を返す
     */
    function getTotalPosts() public view returns (uint256) {
        console.log("total posts: %d", totalPosts);
        return totalPosts;
    }
}