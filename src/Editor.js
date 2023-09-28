import React, { useState } from 'react';
import Nimike from './editor-components/Nimike';
import NimikeEdit from './editor-components/NimikeEdit'; // Import NimikeEdit component
import Otsikko from './editor-components/Otsikko';
import TextPost from './editor-components/TextPost';

const Editor = () => {
  const [newTitleId, setNewTitleId] = useState(null);
  const [editMode, setEditMode] = useState(false); // Add editMode state

  const handleTitleCreated = (titleId) => {
    setNewTitleId(titleId);
  };

  // Check if you are in edit mode
  const isEditMode = window.location.search.includes('editMode=true');

  return (
    <div>
      <h1>Editor</h1>
      {/* Render Nimike or NimikeEdit based on edit mode */}
      {isEditMode ? (
        <NimikeEdit />
      ) : (
        <Nimike onTitleCreated={handleTitleCreated} />
      )}
      {newTitleId !== null && (
        <Otsikko nimikeId={newTitleId}>
          {/* Pass the TextPost component as a child */}
          <TextPost />
        </Otsikko>
      )}
    </div>
  );
};

export default Editor;
