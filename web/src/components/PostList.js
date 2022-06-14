import React from 'react';

const PostList = ( {post, handleLike} ) => {
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
      <p className="listMessage">
        {post.message}
      </p>
      <br />
      {/* いいねボタンを表示 */}
      <p>
        <button onClick={() => handleLike(post.id)}>Like!</button>
      </p>
      {/* いいねの数を表示 */}
      <p className="likeCounter">
        {post.allLikes}
      </p>
    </li>
  );
};

export default PostList;