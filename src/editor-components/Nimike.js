import React, { useState } from 'react';
import axios from 'axios';

const Nimike = ({ onTitleCreated }) => {
  const [titleText, setTitleText] = useState('');
  const [newTitle, setNewTitle] = useState(''); // State to store the newly created title
  const [editing, setEditing] = useState(false); // State to track whether we are editing

  const handleTitleSubmit = async () => {
    try {
      if (editing) {
        // Make a PUT request to update the title in the database
        await axios.put(`http://localhost:3001/api/update-title/:id`, {
          newText: titleText,
        });

        // Reset editing state
        setEditing(false);

        // Update the new title in the local state
        setNewTitle(titleText);

        // Handle success or do any necessary UI updates
        console.log('Title updated successfully');
      } else {
        // Make a POST request to create the title in the database
        const response = await axios.post('http://localhost:3001/api/create-title', { text: titleText });

        // Retrieve the ID of the newly created title from the server response
        const newTitleId = response.data.id;

        console.log('New Title ID:', newTitleId);
        // Set the new title in the local state
        setNewTitle(titleText);

        // Notify the parent component that a title has been created
        onTitleCreated(newTitleId);

        // Reset the input field
        setTitleText('');
      }
    } catch (error) {
      // Handle errors
      console.error('Error creating/updating title:', error);
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
            {editing ? 'Update Title' : 'Create Title'}
          </button>
        </div>
      )}
    </div>
  );
};

export default Nimike;