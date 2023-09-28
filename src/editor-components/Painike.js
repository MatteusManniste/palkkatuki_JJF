import React, { useState, useEffect } from 'react';
import axios from 'axios';

const createPainike = async (sisaltoId, nimi, destinationId) => {
  try {
    const response = await axios.post('http://localhost:3001/api/create-painike', {
      sisaltoId,
      nimi,
      destinationId,
    });

    const newPainike = response.data;
    console.log(`New Painike ID: ${newPainike.id}`);
    console.log(`New Painike nimi: ${newPainike.nimi}`);

    return newPainike;
  } catch (error) {
    console.error('Error creating Painike:', error);
    throw error;
  }
};



const editPainike = async (painikeId, nimi, destinationId) => {
  try {
    const response = await axios.put(`http://localhost:3001/api/edit-painike/${painikeId}`, {
      nimi,
      destinationId,
    });

    const updatedPainike = response.data;
    console.log(`Updated Painike ID: ${updatedPainike.id}`);
    console.log(`Updated Painike nimi: ${updatedPainike.nimi}`);

    return updatedPainike;
  } catch (error) {
    console.error('Error editing Painike:', error);
    throw error;
  }
};

const Painike = ({ otsikkoId, onPainikeUpdated }) => {
  const [nimi, setNimi] = useState('');
  const [destinationId, setDestinationId] = useState('');
  const [sisaltoOptions, setSisaltoOptions] = useState([]);
  const [createdPainikes, setCreatedPainikes] = useState([]);
  const [selectedPainikeId, setSelectedPainikeId] = useState(null); // Add a state to track the selected Painike for editing
  const [updatedPainike, setUpdatedPainike] = useState(null); // Declare it here

  const fetchSisaltoOptions = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/get-sisalto-options');
      const sisaltoOptionsData = response.data;

      console.log('Fetched sisalto options:', sisaltoOptionsData);

      const filteredSisaltoOptions = sisaltoOptionsData.filter((sisaltoOption) => {
        return !createdPainikes.some((painike) => painike.sisaltoId === sisaltoOption.id);
      });

      const filteredOptions = filteredSisaltoOptions.filter((sisaltoOption) => sisaltoOption.id !== otsikkoId);

      setSisaltoOptions(filteredOptions);
    } catch (error) {
      console.error('Error fetching sisalto options:', error);
    }
  };

  const fetchExistingPainikes = async () => {
    try {
      const response = await axios.get(`http://localhost:3001/api/painike/${otsikkoId}`);
      const existingPainikes = response.data;
  
      console.log('Fetched existing painikes:', existingPainikes);
  
      // Set the existing painikes in the state
      setCreatedPainikes(existingPainikes);
    } catch (error) {
      console.error('Error fetching existing painikes:', error);
    }
  };

  useEffect(() => {
    fetchExistingPainikes();
    fetchSisaltoOptions();
  }, []);

  const handleButtonClick = async () => {
    try {
      if (createdPainikes.length >= 4) {
        console.error('Maximum limit of buttons reached for this otsikko.');
        return;
      }

      if (selectedPainikeId) {
        // If a Painike is selected for editing, call editPainike instead of createPainike
        const updatedPainike = await editPainike(selectedPainikeId, nimi, destinationId);
        console.log('Updated Painike:', updatedPainike);

        // Log the response from the server and the current state
        console.log('Response from server after edit:', updatedPainike);
        console.log('Current state before update:', createdPainikes);

        // Update the state with the edited button
        const updatedPainikesArray = createdPainikes.map((painike) =>
          painike.id === selectedPainikeId ? updatedPainike : painike
        );

        setCreatedPainikes(updatedPainikesArray);
        setSelectedPainikeId(null); // Reset the selected Painike ID

        // Log the current state after update
        console.log('Current state after update:', createdPainikes);
      } else {
        const newPainike = await createPainike(otsikkoId, nimi, destinationId);
        setCreatedPainikes([...createdPainikes, newPainike]);
      }

      setNimi('');
      setDestinationId('');
      // Notify the parent component about the updated Painike
      onPainikeUpdated(updatedPainike);
    } catch (error) {
      console.error('Error creating/editing Painike:', error);
    }
  };

  const handleEditClick = (painikeId) => {
    // Handle edit button click by setting the selected Painike ID for editing
    const selectedPainike = createdPainikes.find((painike) => painike.id === painikeId);
    if (selectedPainike) {
      setNimi(selectedPainike.nimi);
      setDestinationId(selectedPainike.destinationId);
      setSelectedPainikeId(painikeId);
    }
  };

  const isButtonLimitReached = createdPainikes.length >= 4;

  const handleDeleteClick = async (painikeId) => {
    try {
      // Make an HTTP DELETE request to the server to delete the Painike
      await axios.delete(`http://localhost:3001/api/delete-painike/${painikeId}`);
  
      // After successful deletion, update the state to remove the deleted Painike
      const updatedPainikesArray = createdPainikes.filter((painike) => painike.id !== painikeId);
      setCreatedPainikes(updatedPainikesArray);
  
      console.log('Painike deleted successfully');
    } catch (error) {
      console.error('Error deleting Painike:', error);
    }
  };
  

  return (
    <div>
      {isButtonLimitReached ? (
        <p>Button limit reached (4/4). Input fields are hidden.</p>
      ) : (
        <>
          <input
            type="text"
            placeholder="Enter Nimi"
            value={nimi}
            onChange={(e) => setNimi(e.target.value)}
          />

          <select
            value={destinationId}
            onChange={(e) => setDestinationId(e.target.value)}
          >
            <option value="">Select Destination</option>
            {sisaltoOptions.map((sisaltoOption) => (
              <option key={sisaltoOption.id} value={sisaltoOption.id}>
                {sisaltoOption.otsikko}
              </option>
            ))}
          </select>

          <button onClick={handleButtonClick}>
            {selectedPainikeId ? 'Edit Painike' : 'Create Painike'}
          </button>
        </>
      )}

{createdPainikes.map((painike) => (
  <div key={painike.id}>
    <button onClick={() => handleEditClick(painike.id)}>Edit</button>
    <button>{painike.nimi || 'No Name'}</button>
    <button onClick={() => handleDeleteClick(painike.id)}>Delete</button> {/* Add this */}
  </div>
))}
    </div>
  );
};

export default Painike;
