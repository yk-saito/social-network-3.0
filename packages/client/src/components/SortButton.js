import React from 'react';

const SortButton = ( {button, handleSort, sort} ) => {
  return (
    <button
      // ソートの条件によって、cssを切り替え
      className={sort.key === button ? sort.order === 1 ? "focus asc" : "focus desc" : ""}
      onClick={() => handleSort(button)}>
      {button}
    </button>
  );
};

export default SortButton;