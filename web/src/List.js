import React from 'react';

// getAllPost系を全てこっちに移行

const List = ( {post, handleLike} ) => {
  return (
    <div>
      <p>
        <span className="listPropaty">Address : </span>
        <span className="listInfo">{post.user}</span>
      </p>
      <p>
        <span className="listPropaty">Time : </span>
        <span className="listInfo">{post.timestamp.toUTCString()}</span>
      </p>
      <p>
        {post.message}
      </p>
      {/* いいねボタンを表示 */}
      <p className="likeButton" onClick={() => handleLike(post.id)}>
        Like!
      </p>
      {/* いいねの数を表示 */}
      <p className="counter">
        {post.allLikes}
      </p>
    </div>
  );
};

export default List;