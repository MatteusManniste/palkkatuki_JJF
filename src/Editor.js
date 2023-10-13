import React, { useState } from 'react';
import Nimike from './editor-components/Nimike';
import Otsikko from './editor-components/Otsikko';
import TextPost from './editor-components/TextPost';

const Editor = () => {
  const [newTitleId, setNewTitleId] = useState(null);
  const handleTitleCreated = (titleId) => {
    setNewTitleId(titleId);
  };
  return (
    <div>
      <h1>Editor</h1>
        <Nimike onTitleCreated={handleTitleCreated} />
      {newTitleId !== null && (
        <Otsikko nimikeId={newTitleId}>
          <TextPost />
        </Otsikko>
      )}
    </div>
  );
};

export default Editor;
