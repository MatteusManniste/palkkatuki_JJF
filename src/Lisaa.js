import React from 'react';

const PlusIcon = ({ onClick }) => {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
      }}
    >
      <div
        style={{
          fontSize: '4rem',
          cursor: 'pointer',
        }}
        onClick={onClick}
      >
        +
      </div>
    </div>
  );
};

export default PlusIcon;