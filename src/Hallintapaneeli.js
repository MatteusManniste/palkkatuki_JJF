import React, { useState } from 'react';
import Lisaa from './Lisaa';
import Editor from './Editor'; // Import the Editor component
import Runko from './Runko'; // Import the Runko component

const Hallintapaneeli = () => {
  const [showEditor, setShowEditor] = useState(false);
  const [editMode, setEditMode] = useState(true); // Set edit mode to true by default

  const handleIconClick = () => {
    setShowEditor(true);
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
      }}
    >
      {!showEditor ? (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <Runko editMode={editMode} />
          <Lisaa onClick={handleIconClick} /> {/* Render the Lisaa component with the "+" icon */}
        </div>
      ) : null}
      {showEditor ? <Editor /> : null} {/* Conditionally render the Editor component */}
    </div>
  );
};

export default Hallintapaneeli;
