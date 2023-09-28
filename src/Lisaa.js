import React from 'react';

const PlusIcon = ({ onClick }) => {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh', // Set the component to cover the entire viewport vertically
      }}
    >
      <div
        style={{
          fontSize: '4rem', // Adjust the size of the "+" icon
          cursor: 'pointer', // Make the icon clickable (optional)
        }}
        onClick={onClick} // Attach the click event handler
      >
        +
      </div>
    </div>
  );
};

export default PlusIcon;