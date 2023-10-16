import React from 'react';

const PostList = ({ post, handleLike }) => {
  return (
    <li>
      {/* ユーザーのウォレットアドレスを表示 */}
      <p>
        <span>{post.user}</span>
      </p>
      {/* 投稿された日時を表示 */}
      <p>
        <span>{post.timestamp.toUTCString()}</span>
      </p>
      {/* 投稿内容を表示 */}
      <br />
      <p className="listMessage">{post.message}</p>
      <br />
      {/* いいね機能を表示 */}
      <div className="likeContainer">
        <div
          className="likeButton"
          onClick={() => handleLike(post.id)}
          onKeyPress={() => handleLike(post.id)}
        >
          Like!
        </div>
        {/* いいねの数を表示 */}
        <div className="likeCounter">{post.allLikes}</div>
      </div>
    </li>
  );
};

export default PostList;
