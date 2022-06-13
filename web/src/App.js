import React, { useEffect, useMemo, useState } from "react";
import { ethers } from "ethers";
import abi from './utils/Posting.json';
import './App.css';
import List from './List.js';
import SortButton from './SortButton.js';

const App = () => {
  /* デプロイされたコントラクトのアドレスを保持する */
  const contractAddress = "0x48EAc03d91857adA0b97211Fc88a65bBA9e98E23";

  /* ABIの内容を参照 */
  const contractABI = abi.abi;

  /* ユーザーのパブリックウォレットを保存する */
  const [currentAccount, setCurrentAccount] = useState("");
  console.log("currentAccount: ", currentAccount);

  /* ユーザーの投稿(tubuut)を保存する */
  const [messageValue, setMessageValue] = useState("");
  /* 全ての投稿(posts)を保存する */
  const [allPosts, setAllPosts] = useState([]);

  /* ソートの条件を保存する */
  const [sort, setSort] = useState({key: "timestamp", order: -1});

  const getAllPosts = async () => {
    const { ethereum } = window;

    try {
      if (ethereum) {
        // provider(=MetaMask)を取得。フロントがこれを介してイーサリアムノードに接続
        const provider = new ethers.providers.Web3Provider(ethereum);
        // ユーザーのウォレットアドレス(=signer)を取得
        const signer = provider.getSigner();
        // コントラクトのインスタンスを生成。コントラクトへの接続を行う
        const postingContract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );
        // コントラクトからメソッドを呼び出す
        const posts = await postingContract.getAllPosts();
        // UIで使用するデータを設定
        const postsCleaned = posts.map((post) => {
          console.log("raw timestamp: ", post.timestamp);
          return {
            id: post.id,
            user: post.user,
            rawTimestamp: post.timestamp,
            timestamp: new Date(post.timestamp * 1000),
            message: post.message,
            allLikes: post.totalLikes.toNumber(),
          };
        });

        // React Stateにデータを格納
        setAllPosts(postsCleaned);
        console.log("Object key: ", Object.keys(allPosts[0]));

      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  };

  /**
   * `emit`されたイベントをフロントエンドに反映
   */
  useEffect(() => {
    let postingContract;

    /**
     * NewPostのイベントリスナ
     *
     * @param {address} from
     * @param {uint256} timestamp
     * @param {string} message
     */
    const onNewPost = (from, timestamp, message) => {
      console.log("NewPost", from, timestamp, message);
      setAllPosts((prevState) => [
        ...prevState,
        {
          address: from,
          rawTimestamp: timestamp,
          timestamp: new Date(timestamp * 1000),
          message: message,
        },
      ]);
    };

    // NewPostイベント発生時に、情報を受け取る
    if (window.ethereum) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      postingContract = new ethers.Contract(
        contractAddress,
        contractABI,
        signer
      );
      // イベントリスナを呼び出す
      postingContract.on("NewPost", onNewPost);
    }
    return () => {
      if (postingContract) {
        // イベントリスナを停止
        postingContract.off("NewPost", onNewPost);
      }
    };
  }, []);

  /**
   * window.ethereumにアクセスできることを確認（ウェブサイトを訪問したユーザーがMetaMaskを持っているか）
   */
  const checkIfWalletIsConnected = async () => {
    try {
      const { ethereum } = window;
      if (!ethereum) {
        console.log("Make sure you have MetaMask!");
        return;
      } else {
        console.log("We have the ethereum object", ethereum);
      }

      /**
       * 確認したウォレットへ、アクセスが許可されているか確認
       * - eth_accounts
       *   空の配列、または単一のアカウントアドレスを含む配列を返す特別なメソッド
       * - accounts
       *   ユーザーが複数のウォレットアカウントを持っていることも加味
       */
      const accounts = await ethereum.request({ method: "eth_accounts" });
      if (accounts.length !== 0) {
        const account = accounts[0];
        console.log("Found an authorized account:", account);
        setCurrentAccount(account);
        getAllPosts();
      } else {
        console.log("No authorized account found");
      }
    } catch (error) {
      console.log(error)
    }
  };

  /**
   * connectWalletメソッドを実装
   */
  const connectWallet = async () => {
    try {
      // ユーザーが認証可能なウォレットアドレスを持っているか確認
      const { ethereum } = window;
      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }
      // ユーザーに対してウォレットへのアクセス許可を求める
      const accounts = await ethereum.request({ method: "eth_requestAccounts" });
      console.log("Connected: ", accounts[0]);
      // 許可されたらセット
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error);
    }
  };

  /**
   * 投稿をコンストラクタに書き込む
   */
  const post = async () => {
    try {
      // ユーザーがMetaMaskを持っているか確認
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const postingContract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );
        let count = await postingContract.getTotalPosts();
        console.log("Retrieved total post count...", count.toNumber());

        let contractBalance = await provider.getBalance(postingContract.address);
        console.log("Contract balance:", ethers.utils.formatEther(contractBalance));

        // コントラクタに投稿を書き込む
        const postTxn = await postingContract.post(messageValue, {
          gasLimit: 300000,
        });
        console.log("[post] Mining...", postTxn.hash);
        await postTxn.wait();
        console.log("[post] Mined -- ", postTxn.hash);
        count = await postingContract.getTotalPosts();
        console.log("Retrieved total post count...", count.toNumber());

        let contractBalance_post = await provider.getBalance(
          postingContract.address
        );
        // コントラクトの残高確認
        if (contractBalance_post < contractBalance) {
          console.log("User won ETH!");
        } else {
          console.log("User didn't win ETH.");
        }
        console.log(
          "Contract balance after post:",
          ethers.utils.formatEther(contractBalance_post)
        );
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  };

  // ソートボタン
  const KEYS = ['timestamp', 'allLikes'];

  /**
   * ソートの条件に沿って投稿を並べ替える
   * @param {*} key
   */
  const handleSort = (key) => {
    console.log('clike: ' + key);
    if (sort.key === key) {
      setSort({ ...sort, order: -sort.order });
    } else {
      setSort({
        key: key,
        order: 1
      })
    }
  };

  /**
   * ソート後のデータを格納する
   */
  let sortedPosts = useMemo(() => {
    let _sortedPosts = allPosts;
    if (sort.key) {
      _sortedPosts = _sortedPosts.sort((a, b) => {
        a = a[sort.key];
        b = b[sort.key];

        if (a === b) {
          return 0;
        }
        if (a > b) {
          return 1 * sort.order;
        }
        return -1 * sort.order;
      });
    }
    return _sortedPosts;
  }, [sort, allPosts]);

  /**
   * Like!ボタンを押した時のハンドラ
   */
  const handleLike = async (postId) => {
    console.log("clike: " + postId);
    try {
      const { ethereum } = window;
      if (!ethereum) {
        alert("Ethereum object doesn't exist!");
        return;
      }
      // コントラクトのインスタンスを生成。コントラクトへの接続を行う
      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner();
      const postingContract = new ethers.Contract(
        contractAddress,
        contractABI,
        signer
      );
      // コントラクタにいいねの数を書き込む
      const likedTxn = await postingContract.updateTotalLikes(postId, {
        gasLimit: 300000,
      });
      console.log("[likeButton] Mining...", likedTxn.hash);
      await likedTxn.wait();
      console.log("[likeButton] Mined -- ", likedTxn.hash);
    } catch(error) {
      console.log(error);
    }
  };

  // Webページがロードされた時、以下の関数を実行
  useEffect(() => {
    checkIfWalletIsConnected();
  }, []);

  return (
    <div className="mainContainer">
      <div className="dataContainer">
        <div className="header">WELCOME!</div>

        <div className="bio">
        イーサリアムウォレットを接続して、メッセージを作成したら、ツブートしてください<span role="img" aria-label="shine">🪶</span>
        </div>
        <br />
        {/* メッセージボックスを実装 */}
        {
          currentAccount && (
            <textarea
              name="messageArea"
              placeholder="メッセージはこちら"
              type="text"
              id="message"
              value={messageValue}
              onChange={(e) => setMessageValue(e.target.value)}
            />
          )
        }
        {/* postボタンにpost関数を連動 */}
        {
          currentAccount && (
            <button className="postButton" onClick={post}>
              Tubuut
            </button>
          )
        }
        {/* ウォレットコネクトボタンを実装 */}
        {
          !currentAccount && (
            <button className="postButton" onClick={connectWallet}>
              Connect Wallet
            </button>
          )
        }
        {
          currentAccount && (
            <button className="postButton" onClick={connectWallet}>
              Wallet Connected
            </button>
          )
        }
        {/* ソートボタンを表示 */}
        <div className="sortButton">
          <h2>Sort by</h2>
          {
            KEYS.map((key, index) => (
              <SortButton
                key={index}
                button={key}
                handleSort={handleSort}
                sort={sort} />
            ))
          }
        </div>
        <div className="listContainer">
        {/* 履歴を表示する */}
        {
          currentAccount &&
            sortedPosts.map((post) => (
              <List
                key={post.id}
                post={post}
                handleLike={handleLike}/>
            ))
        }
        </div>
      </div>
    </div>
  );
};
export default App;
