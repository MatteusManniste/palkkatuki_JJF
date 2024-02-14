import React, { useState } from "react";
import Lisaa from "./Lisaa";
import Editor from "./Editor";
import Runko from "./Runko";

const Hallintapaneeli = () => {
  const [showEditor, setShowEditor] = useState(false);
  const [editMode, setEditMode] = useState(true);

  const handleIconClick = () => {
    setShowEditor(true);
  };

  return (
    <div>
      {!showEditor ? (
        <div>
          <Runko editMode={editMode} />
        </div>
      ) : null}
      {showEditor ? <Editor /> : null}
    </div>
  );
};

export default Hallintapaneeli;
