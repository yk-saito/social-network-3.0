// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.19;

contract Posting {
    error InsufficientBalance(uint256 available, uint256 required);
    error WithdrawalFailed();
    event NewPost(address indexed from, uint256 timestamp, string message, uint256 randomNumber);

    struct Post {
        uint256 id;
        address user;
        string  message;
        uint256 timestamp;
        uint256 totalLikes;
    }

    Post[] private _posts;

    uint256 private _totalPosts;
    uint256 private _seed; // 乱数生成のシード
    mapping(uint256 => mapping(address => address)) public likedUsers; //PostのIdと、いいねを押したユーザーのアドレスをマッピング

    constructor() payable {
        _seed = (block.difficulty + block.timestamp) % 100;
    }

    /**
     * 投稿を受け取り、配列に格納
     */
    function post(string memory _message) public {
        _posts.push(Post(_totalPosts, msg.sender, _message, block.timestamp, 0));

        _totalPosts += 1;

        // 乱数生成
        _seed = (block.difficulty + block.timestamp + _seed) % 100;

        // ユーザーがETHを獲得する確率を20%に設定
        if (_seed <= 20) {
            uint256 prizeAmount = 0.0001 ether;

            // コントラクトが持つ資金が足りるかチェック
            if (prizeAmount > address(this).balance) {
                revert InsufficientBalance(address(this).balance, prizeAmount);
            }
            // 投稿してくれたユーザーに0.0001ETHを送る
            (bool success, ) = (msg.sender).call{value: prizeAmount}("");
            if (!success) {
                revert WithdrawalFailed();
            }
        }

        // フロントエンドにイベント発生を通知
        emit NewPost(msg.sender, block.timestamp, _message, _seed);
    }

    /**
     * いいねの数を更新する
     */
    function updateTotalLikes(uint256 id) public {
        // ユーザーが既にいいねを押していたら、いいねを解除する
        if (likedUsers[id][msg.sender] == msg.sender) {
            _posts[id].totalLikes -= 1;
            delete likedUsers[id][msg.sender];
        } else {
            _posts[id].totalLikes += 1;
            likedUsers[id][msg.sender] = msg.sender;
        }
    }

    /**
     * 全ての投稿を返す
     */
    function getAllPosts() public view returns (Post[] memory) {
        Post[] memory allPosts = new Post[](_totalPosts);

        for (uint256 i = 0; i < _totalPosts; ++i) {
            allPosts[i] = _posts[i];
        }
        return allPosts;
    }

    /**
     * 投稿数を返す
     */
    function getTotalPosts() public view returns (uint256) {
        return _totalPosts;
    }
}