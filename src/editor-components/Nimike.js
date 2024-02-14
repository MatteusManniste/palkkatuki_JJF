import React, { useState } from "react";
import axios from "axios";

const Nimike = ({ onTitleCreated }) => {
  const [titleText, setTitleText] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [editing, setEditing] = useState(false);

  const handleTitleSubmit = async () => {
    try {
      if (editing) {
        await axios.put(`http://localhost:3001/api/update-title/:id`, {
          newText: titleText,
        });

        setEditing(false);

        setNewTitle(titleText);

        console.log("Title updated successfully");
      } else {
        const response = await axios.post(
          "http://localhost:3001/api/create-title",
          { text: titleText },
        );

        const newTitleId = response.data.id;

        console.log("New Title ID:", newTitleId);
        setNewTitle(titleText);
        onTitleCreated(newTitleId);
        setTitleText("");
      }
    } catch (error) {
      console.error("Error creating/updating title:", error);
    }
  };

  return (
    <div>
      {newTitle && !editing ? (
        <div>
          <p>New Title: {newTitle}</p>
          <button onClick={() => setEditing(true)}>Edit Title</button>
        </div>
      ) : (
        <div>
          <input
            type="text"
            placeholder="Title"
            value={titleText}
            onChange={(e) => setTitleText(e.target.value)}
          />
          <button onClick={handleTitleSubmit}>
            {editing ? "Update Title" : "Create Title"}
          </button>
        </div>
      )}
    </div>
  );
};

export default Nimike;
