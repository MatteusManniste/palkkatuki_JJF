import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../css/Editor.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit } from '@fortawesome/free-solid-svg-icons';

const NimikeEditor = () => {
  const { id } = useParams();
  const [titleText, setTitleText] = useState('');
  const [editing, setEditing] = useState(false);
  const [fetchedData, setFetchedData] = useState(null);
  const navigate = useNavigate();

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
      axios
        .delete(`http://localhost:3001/api/delete-title/${id}`)
        .then(() => {
          console.log('Nimike deleted successfully');
          navigate('/hallintapaneeli');
        })
        .catch((error) => {
          console.error('Error deleting Nimike:', error);
        });
    }
  };

  return (
    <div className="nimike-editor-container">
      {editing ? (
        <div className="centered-content">
          <input
            type="text"
            placeholder="Title"
            value={titleText}
            onChange={(e) => setTitleText(e.target.value)}
          />
          <button className="save-button" onClick={handleTitleSubmit}>Save</button>
        </div>
      ) : (
        <div className="centered-content">
          <h2>
            {titleText}
            <a href="#" onClick={() => setEditing(true)}>
            <FontAwesomeIcon icon={faEdit} style={{ marginLeft: '10px', color: '#A5CE3A' }} />
            </a>
          </h2>
        </div>
      )}
    </div>
  );
};

export default NimikeEditor;
