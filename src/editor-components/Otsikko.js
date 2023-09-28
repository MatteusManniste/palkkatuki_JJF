import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import TextEditor from './TextEditor'; // Import the TextEditor component
import '../css/Otsikko.css';
import Painike from './Painike'; // Import the Painike component



const Otsikko = ({ nimikeId }) => {
  const [otsikkoText, setOtsikkoText] = useState('');
  const [otsikkoData, setOtsikkoData] = useState([]);
  const [editingOtsikkoId, setEditingOtsikkoId] = useState(null);
  const [selectedOtsikkoId, setSelectedOtsikkoId] = useState(null); // State for selected otsikko ID
  const maxOtsikkoCount = 5; // Maximum number of otsikkos
  const [kenttaContent, setKenttaContent] = useState('');


  useEffect(() => {
    // Fetch otsikko data from the API when the component mounts
    fetchOtsikkoData();
  }, [nimikeId]); // Fetch data whenever nimikeId changes
  const fetchOtsikkoData = async () => {
    try {
      // Make a GET request to fetch otsikko data from the API based on nimikeId
      const response = await axios.get(`http://localhost:3001/api/get-otsikko/${nimikeId}`);
  
      // Set the otsikko data in the state with initial jarjestysNro values
      const initialOtsikkoData = response.data.map((otsikko, index) => ({
        ...otsikko,
        jarjestysNro: index + 1,
      }));
      setOtsikkoData(initialOtsikkoData);
  
      // Handle success or do any necessary UI updates
      console.log('Otsikko data fetched successfully');
    } catch (error) {
      // Handle errors
      console.error('Error fetching otsikko data:', error);
    }
  };

  useEffect(() => {
    // Set the selected otsikko ID to the ID of the first otsikko when the otsikkoData changes
    if (otsikkoData.length > 0) {
      setSelectedOtsikkoId(otsikkoData[0].id);
    }
  }, [otsikkoData]);
  
  
  // Update the reorder logic to use jarjestysNro
  const onDragEnd = async (result) => {
    if (!result.destination) {
      return;
    }
  
    const { source, destination } = result;
  
    // Reorder the items in the otsikkoData state
    const reorderedData = [...otsikkoData];
    const [movedItem] = reorderedData.splice(source.index, 1);
    reorderedData.splice(destination.index, 0, movedItem);
    setOtsikkoData(reorderedData);
  
    // Update the database with the new order and jarjestysNro
    try {
      // Prepare the data to send to the server, including the new order and jarjestysNro
      const newData = reorderedData.map((item, index) => ({
        id: item.id, // Add the unique identifier of each item
        order: index + 1, // Update the order field according to the new order
        jarjestysNro: item.jarjestysNro, // Preserve the jarjestysNro
      }));
  
      // Send a PUT or POST request to the server to update the database
      await axios.put('http://localhost:3001/api/update-otsikko-order', newData);
  
      // Handle success or display a message to the user
      console.log('Order updated successfully');
    } catch (error) {
      // Handle errors
      console.error('Error updating order:', error);
    }
  };

  const handleOtsikkoSubmit = async (otsikkoId) => {
    try {
      // Check if we are editing an existing otsikko or creating a new one
      if (editingOtsikkoId === null) {
        // Make a POST request to create a new otsikko in the database
        await axios.post('http://localhost:3001/api/create-otsikko', {
          text: otsikkoText,
          runko_id: nimikeId, // Pass the nimikeId as runko_id
        });
      } else {
        // Make a PUT request to update the existing otsikko in the database
        await axios.put(`http://localhost:3001/api/update-otsikko/${otsikkoId}`, {
          text: otsikkoText,
        });

        // Reset the editingOtsikkoId after updating
        setEditingOtsikkoId(null);
      }

      // Fetch otsikko data again after creating/updating
      fetchOtsikkoData();

      // Reset the input field
      setOtsikkoText('');

      // Handle success or do any necessary UI updates
      console.log('Otsikko created/updated successfully');
    } catch (error) {
      // Handle errors
      console.error('Error creating/updating otsikko:', error);
    }
  };

  const handleDeleteOtsikko = async (otsikkoId) => {
    try {
      // Make a DELETE request to remove the otsikko from the database
      await axios.delete(`http://localhost:3001/api/delete-otsikko/${otsikkoId}`);

      // Fetch otsikko data again after deleting
      fetchOtsikkoData();

      // Handle success or do any necessary UI updates
      console.log('Otsikko deleted successfully');
    } catch (error) {
      // Handle errors
      console.error('Error deleting otsikko:', error);
    }
  };

  const handleOtsikkoClick = (otsikkoId) => {
    // Set the selected otsikko ID when an otsikko is clicked
    setSelectedOtsikkoId(otsikkoId);

    fetchKenttaContent(otsikkoId)
    .then((kenttaContent) => {
      setKenttaContent(kenttaContent);
    })
    .catch((error) => {
      console.error('Error fetching kentta content:', error);
    });
  };

  const fetchKenttaContent = async (otsikkoId) => {
    try {
      const response = await axios.get(`http://localhost:3001/api/get-kentta-content/${otsikkoId}`);
      return response.data.kentta; // Assuming the API returns the kentta content
    } catch (error) {
      console.error('Error fetching kentta content:', error);
      return null;
    }
  };
  const handlePainikeUpdated = (updatedPainike) => {
    // Handle the updated Painike data, e.g., update state or perform any other actions
    console.log('Updated Painike:', updatedPainike);
  };

  return (
    <div>
      <h2>Otsikko Component</h2>
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="otsikkos">
          {(provided) => (
            <ul {...provided.droppableProps} ref={provided.innerRef}>
              {otsikkoData.map((otsikko, index) => (
                <Draggable
                  key={otsikko.id.toString()}
                  draggableId={otsikko.id.toString()}
                  index={index}
                >
                  {(provided) => (
                    <li
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                    >
                      <div
                        onClick={() => handleOtsikkoClick(otsikko.id)}
                        className={`otsikko-item ${selectedOtsikkoId === otsikko.id ? 'selected' : ''}`}
                      >
                        {otsikko.otsikko}
                        <button onClick={() => handleDeleteOtsikko(otsikko.id)}>Delete</button>
                        {/* Add the Edit button */}
                        <button onClick={() => setEditingOtsikkoId(otsikko.id)}>Edit</button>
                      </div>
                    </li>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </ul>
          )}
        </Droppable>
      </DragDropContext>
      <p>
        Otsikko count: {otsikkoData.length}/{maxOtsikkoCount}
      </p>
      {otsikkoData.length < maxOtsikkoCount && (
        <div>
          <input
            type="text"
            placeholder="Otsikko"
            value={otsikkoText}
            onChange={(e) => setOtsikkoText(e.target.value)}
          />
          <button onClick={() => handleOtsikkoSubmit(editingOtsikkoId)}>
            {editingOtsikkoId ? 'Update Otsikko' : 'Create Otsikko'}
          </button>
        </div>
      )}
      {/* Render the TextPost component for the selected otsikko */}
      {otsikkoData.map((otsikko) => (
                <div key={otsikko.id} className={`editor-container ${selectedOtsikkoId === otsikko.id ? 'visible' : 'hidden'}`}>
                
                {otsikko && otsikko.otsikko ? (
      <>
        <h1>Selected Otsikko: {otsikko.otsikko}</h1>
        <TextEditor otsikkoId={selectedOtsikkoId} kenttaContent={kenttaContent} />
        <br></br>
        <br></br>
        <Painike otsikkoId={otsikko.id} onPainikeUpdated={handlePainikeUpdated} />
      </>
                ) : null}
              </div>
      ))}
    </div>
  );
  
  
  
  
};

export default Otsikko;
