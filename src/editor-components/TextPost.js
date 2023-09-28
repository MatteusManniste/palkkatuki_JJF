// TextPost.js
import React, { useState } from 'react';
import TextEditor from './TextEditor';
import axios from 'axios';

const TextPost = ({ otsikko }) => {
  const [richText, setRichText] = useState('');

  // Function to handle saving the rich text content
const saveRichText = async () => {
  try {
    console.log('Sending richText data to server:', richText);
    // Send a POST request to save the rich text content for this otsikko
    await axios.post(`http://localhost:3001/api/save-rich-text/${otsikko.id}`, {
      richText,
    });

    // Handle success or display a success message
    console.log('Rich text content saved successfully');
  } catch (error) {
    // Handle errors
    console.error('Error saving rich text content:', error);
  }
};
  
  return (
    <div>
      {/* Render the TextEditor component */}
      <TextEditor value={richText} onChange={setRichText} />

      {/* Add a button to save the rich text content */}
      <button onClick={saveRichText}>Save Rich Text</button>
    </div>
  );
};

export default TextPost;
