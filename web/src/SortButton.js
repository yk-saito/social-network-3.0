import React from 'react';

const SortButton = ( {button, handleSort, sort} ) => {
  return (
    <button
      onClick={() => handleSort(button)}
      className={sort.key === button ? sort.order === 1 ? 'focus asc' : 'focus desc' : ''}>
      {button}
    </button>
  );
};

export default SortButton;