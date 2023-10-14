import { ethers } from 'ethers';
import React, { useEffect, useMemo, useState } from 'react';
import './App.css';
import PostList from './components/PostList.js';
import SortButton from './components/SortButton.js';
import PostingArtifact from './artifacts/contracts/Posting.sol/Posting.json';

const App = () => {
  /* デプロイされたコントラクトのアドレスを保持する */
  const contractAddress = process.env.REACT_APP_CONTRACT_ADDRESS;

  /* ABIの内容を参照 */
  const contractABI = PostingArtifact.abi;

  /* ユーザーのパブリックウォレットを保存する */
  const [currentAccount, setCurrentAccount] = useState('');
  // console.log("currentAccount: ", currentAccount);

  /* ユーザーの投稿を保存する */
  const [messageValue, setMessageValue] = useState('');

  /* 全ての投稿を保存する */
  const [allPosts, setAllPosts] = useState([]);

  /* ソートの条件を保存する */
  const [sort, setSort] = useState({ key: 'timestamp', order: -1 });

  /* ソートボタンで使用するプロパティ名を設定 */
  const KEYS = ['timestamp', 'allLikes'];

  const getAllPosts = async () => {
    /* ユーザーが認証可能なウォレットアドレスを持っているか確認 */
    const { ethereum } = window;

    try {
      if (ethereum) {
        /* provider(=MetaMask)を取得。フロントがこれを介してイーサリアムノードに接続 */
        const provider = new ethers.providers.Web3Provider(ethereum);
        /* ユーザーのウォレットアドレス(=signer)を取得 */
        const signer = provider.getSigner();
        /* コントラクトのインスタンスを生成。コントラクトへの接続を行う */
        const postingContract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer,
        );
        /* コントラクトからメソッドを呼び出す */
        const posts = await postingContract.getAllPosts();
        /* UIで使用するデータを設定 */
        const postsCleaned = posts.map((post) => {
          return {
            id: post.id,
            user: post.user,
            rawTimestamp: post.timestamp,
            timestamp: new Date(post.timestamp * 1000),
            message: post.message,
            allLikes: post.totalLikes.toNumber(),
          };
        });

        /* React Stateにデータを格納 */
        setAllPosts(postsCleaned);
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
      console.log('NewPost', from, timestamp, message);
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

    /* NewPostイベント発生時に、情報を受け取る */
    if (window.ethereum) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      postingContract = new ethers.Contract(
        contractAddress,
        contractABI,
        signer,
      );
      /* イベントリスナを呼び出す */
      postingContract.on('NewPost', onNewPost);
    }
    return () => {
      if (postingContract) {
        /* イベントリスナを停止 */
        postingContract.off('NewPost', onNewPost);
      }
    };
  }, [contractABI]);

  const checkIfWalletIsConnected = async () => {
    try {
      const { ethereum } = window;
      if (!ethereum) {
        console.log('Make sure you have MetaMask!');
        return;
      } else {
        console.log('We have the ethereum object', ethereum);
      }

      /**
       * 確認したウォレットへ、アクセスが許可されているか確認
       *  eth_accounts: 空の配列、または単一のアカウントアドレスを含む配列を返す特別なメソッド
       */
      const accounts = await ethereum.request({ method: 'eth_accounts' });
      if (accounts.length !== 0) {
        const account = accounts[0];
        console.log('Found an authorized account:', account);
        setCurrentAccount(account);
        getAllPosts();
      } else {
        console.log('No authorized account found');
      }
    } catch (error) {
      console.log(error);
    }
  };

  const connectWallet = async () => {
    try {
      const { ethereum } = window;
      if (!ethereum) {
        alert('Get MetaMask!');
        return;
      }
      /* ユーザーに対してウォレットへのアクセス許可を求める */
      const accounts = await ethereum.request({
        method: 'eth_requestAccounts',
      });
      console.log('Connected: ', accounts[0]);
      /* 許可されたらセット */
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
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const postingContract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer,
        );
        const contractBalance = await provider.getBalance(
          postingContract.address,
        );
        console.log(
          'Contract balance:',
          ethers.utils.formatEther(contractBalance),
        );

        /* コントラクタに投稿を書き込む */
        const postTxn = await postingContract.post(messageValue, {
          gasLimit: 300000,
        });
        console.log('[post] Mining...', postTxn.hash);
        await postTxn.wait();
        console.log('[post] Mined -- ', postTxn.hash);

        const contractBalance_post = await provider.getBalance(
          postingContract.address,
        );

        /* コントラクトの残高確認 */
        if (contractBalance_post < contractBalance) {
          console.log('User won ETH!');
        } else {
          console.log("User didn't win ETH.");
        }
        console.log(
          'Contract balance after post:',
          ethers.utils.formatEther(contractBalance_post),
        );
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  };

  /**
   * ソートの条件に沿って投稿を並べ替える
   */
  const handleSort = (key) => {
    console.log(`click:·${key}`);
    if (sort.key === key) {
      setSort({ ...sort, order: -sort.order });
    } else {
      setSort({
        key: key,
        order: 1,
      });
    }
  };

  /**
   * ソート後のデータを格納する
   *  配列(allPosts)に変更があった場合のみ実行される
   */
  const sortedPosts = useMemo(() => {
    let _sortedPosts = allPosts;
    if (sort.key) {
      _sortedPosts = _sortedPosts.sort((a, b) => {
        const keyOfA = a[sort.key];
        const keyOfB = b[sort.key];

        if (keyOfA === keyOfB) {
          return 0;
        }
        if (keyOfA > keyOfB) {
          return 1 * sort.order;
        }
        return -1 * sort.order;
      });
    }
    return _sortedPosts;
  }, [sort, allPosts]);

  /**
   * Like!ボタンを押した時のハンドラ関数
   */
  const handleLike = async (postId) => {
    console.log(`click·postID:·${postId}`);
    try {
      const { ethereum } = window;
      if (!ethereum) {
        alert("Ethereum object doesn't exist!");
        return;
      }
      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner();
      const postingContract = new ethers.Contract(
        contractAddress,
        contractABI,
        signer,
      );
      /* コントラクタにいいねの数を書き込む */
      const likedTxn = await postingContract.updateTotalLikes(postId, {
        gasLimit: 300000,
      });
      console.log('[likeButton] Mining...', likedTxn.hash);
      await likedTxn.wait();
      console.log('[likeButton] Mined -- ', likedTxn.hash);
    } catch (error) {
      console.log(error);
    }
  };

  /* Webページがロードされた時、以下を実行 */
  useEffect(() => {
    checkIfWalletIsConnected();
  }, []);

  return (
    <div>
      <header className="headerContainer">
        <div className="headerButton">
          {/* ウォレットコネクトボタンを表示 */}
          {!currentAccount && (
            <button onClick={connectWallet} type="button">
              Connect Wallet
            </button>
          )}
          {currentAccount && (
            <button
              className="postButton"
              type="button"
              onClick={connectWallet}
            >
              Wallet Connected
            </button>
          )}
        </div>
      </header>
      <div className="mainContainer">
        <div className="dataContainer">
          {!currentAccount && (
            <div>
              <div className="mainHeader">WELCOME!</div>
              <div className="bio">Please connect wallet.</div>
            </div>
          )}
          {currentAccount && (
            <div>
              <div className="bio">
                Create a message and "Tubuut" it{' '}
                <span role="img" aria-label="shine">
                  🪶
                </span>
              </div>
            </div>
          )}
          <br />
          {/* メッセージボックスを表示 */}
          {currentAccount && (
            <textarea
              name="messageArea"
              placeholder="message"
              type="text"
              id="message"
              value={messageValue}
              onChange={(e) => setMessageValue(e.target.value)}
            />
          )}
          <div className="postFooter">
            {/* 投稿を送信するボタンを表示 */}
            {currentAccount && (
              <button className="postButton" type="button" onClick={post}>
                Tubuut
              </button>
            )}
          </div>
          {/* ソートボタンを表示 */}
          {currentAccount && (
            <div key={currentAccount} className="sortButton">
              <h2>Sort by</h2>
              {KEYS.map((sortKey) => (
                <SortButton
                  key={sortKey.toString()}
                  button={sortKey}
                  handleSort={handleSort}
                  sort={sort}
                />
              ))}
            </div>
          )}
          {/* 全ての投稿を表示する */}
          {currentAccount && (
            <ul className="postList">
              {sortedPosts.map((post) => (
                <PostList key={post.id} post={post} handleLike={handleLike} />
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};
export default App;
