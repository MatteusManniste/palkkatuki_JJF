import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom'; // Import useHistory
import axios from 'axios';


const NimikeEditor = () => {
  const { id } = useParams(); // Extract the ID from the route path
  const [titleText, setTitleText] = useState('');
  const [editing, setEditing] = useState(false);
  const [fetchedData, setFetchedData] = useState(null);
  const navigate = useNavigate(); // Initialize history

  useEffect(() => {
    if (id) {
      axios
        .get(`http://localhost:3001/api/runko/${id}`)
        .then((response) => {
          const updatedNimike = response.data.nimike;
          setTitleText(updatedNimike);
          setFetchedData(response.data);
        })
        .catch((error) => {
          console.error('Error fetching Nimike:', error);
        });
    }
  }, [id]);

  const handleTitleSubmit = async () => {
    try {
      console.log('Submitting updated title:', titleText);
      setEditing(false);
    } catch (error) {
      console.error('Error updating title:', error);
    }
  };

  const handleDeleteClick = () => {
    const shouldDelete = window.confirm('Are you sure you want to delete this Nimike?');

    if (shouldDelete) {
      // Send a DELETE request to delete the Nimike
      axios
        .delete(`http://localhost:3001/api/delete-title/${id}`)
        .then(() => {
          console.log('Nimike deleted successfully');
          // Redirect to a different page after deletion
          navigate('/hallintapaneeli'); // Replace '/' with the desired URL
        })
        .catch((error) => {
          console.error('Error deleting Nimike:', error);
        });
    }
  };

  return (
    <div>
      {fetchedData && (
        <div>
          <p>Fetched Data:</p>
          <pre>{JSON.stringify(fetchedData, null, 2)}</pre>
        </div>
      )}

      {editing ? (
        <div>
          <input
            type="text"
            placeholder="Title"
            value={titleText}
            onChange={(e) => setTitleText(e.target.value)}
          />
          <button onClick={handleTitleSubmit}>Save</button>
        </div>
      ) : (
        <div>
          <p>Title: {titleText}</p>
          <button onClick={() => setEditing(true)}>Edit Title</button>
          <button onClick={handleDeleteClick}>Delete</button>
        </div>
      )}
    </div>
  );
};

export default NimikeEditor;
