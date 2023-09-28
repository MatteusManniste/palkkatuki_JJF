import React from 'react';
import Runko from './Runko'; // Import the Runko component

const Etusivu = () => {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <Runko /> {/* Render the Runko component */}
      </div>
    </div>
  );
};

export default Etusivu;
