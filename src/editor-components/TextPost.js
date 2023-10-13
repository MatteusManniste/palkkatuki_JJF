// TextPost.js
import React, { useState } from 'react';
import TextEditor from './TextEditor';
import axios from 'axios';

const TextPost = ({ otsikko }) => {
  const [richText, setRichText] = useState('');

const saveRichText = async () => {
  try {
    console.log('Sending richText data to server:', richText);
    await axios.post(`http://localhost:3001/api/save-rich-text/${otsikko.id}`, {
      richText,
    });

    console.log('Rich text content saved successfully');
  } catch (error) {
    // Handle errors
    console.error('Error saving rich text content:', error);
  }
};
  
  return (
    <div>
      <TextEditor value={richText} onChange={setRichText} />
      <button onClick={saveRichText}>Save Rich Text</button>
    </div>
  );
};

export default TextPost;
