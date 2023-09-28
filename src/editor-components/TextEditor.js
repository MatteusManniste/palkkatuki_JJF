import React, { useState, useEffect, useRef } from 'react'; // Import useRef
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import axios from 'axios';

const editorContainerStyle = {
  backgroundColor: 'white',
  height: '40vh',
  width: '80%', // Set the container's width to 80% of its parent
  margin: '0 auto',
};

const textEditorStyle = {
  height: 'calc(100% - 40px)',
  width: '100%', // Make the text editor as wide as its container
};

const logButtonStyle = {
  position: 'absolute', // Position the button absolutely
  top: '100px', // Adjust the top position as needed
  right: '10px', // Adjust the right position as needed
  zIndex: '1', // Ensure it's above the editor
};


const TextEditor = ({ otsikkoId, kenttaContent }) => {
  const [richText, setRichText] = useState(kenttaContent || '');
  const quillRef = useRef(null); // Create a ref for the Quill instance

  useEffect(() => {
    if (kenttaContent !== null && kenttaContent !== undefined) {
      setRichText(kenttaContent);
    }
  }, [kenttaContent]);

  const handleChange = (html) => {
    setRichText(html);
  };
  const handleLogHtml = () => {
    console.log(richText);
  };
  const saveRichText = async () => {
    try {
      console.log('Sending richText data to server:', richText);
      await axios.post(`http://localhost:3001/api/save-rich-text/${otsikkoId}`, {
        richText,
      });
      console.log('Rich text content saved successfully');
    } catch (error) {
      console.error('Error saving rich text content:', error);
    }
  };
  

  // Define a function to handle image uploads
  const handleImageUpload = async (file) => {
    try {
      const formData = new FormData();
      formData.append('image', file);

      // Replace 'YOUR_IMAGE_UPLOAD_URL' with the actual endpoint to upload images
      const response = await axios.post('YOUR_IMAGE_UPLOAD_URL', formData);

      if (response.data && response.data.url) {
        const imageUrl = response.data.url;

        // Insert the image into the editor
        const editor = document.querySelector('.ql-editor');
        const cursorPosition = editor.querySelector('.ql-cursor');
        if (cursorPosition) {
          const img = document.createElement('img');
          img.src = imageUrl;
          cursorPosition.parentNode.insertBefore(img, cursorPosition);
        }
      }
    } catch (error) {
      console.error('Error uploading image:', error);
    }
  };
  

  // Quill editor modules configuration
  const modules = {
    toolbar: {
      container: [
        [{ header: '1' }, { header: '2' }, { font: [] }],
        [{ list: 'ordered' }, { list: 'bullet' }],
        ['bold', 'italic', 'underline'],
        [{ align: [] }],
        ['link', 'image'],
        ['clean'],
      ],

    },
  };
  console.log(kenttaContent);
  return (
    <div style={editorContainerStyle}>
      <pre>
      <ReactQuill
        theme="snow"
        value={richText}
        onChange={handleChange}
        style={textEditorStyle}
        modules={modules}
        ref={quillRef} // Attach the ref to the Quill instance
      />
      </pre>
      <button onClick={() => { saveRichText(); handleLogHtml(); }} style={logButtonStyle}>
        Save Rich Text
      </button>
    </div>
  );
};

export default TextEditor;
