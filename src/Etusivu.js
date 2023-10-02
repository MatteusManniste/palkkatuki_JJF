import React from 'react';
import Runko from './Runko';

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
        <Runko />
      </div>
    </div>
  );
};

export default Etusivu;
