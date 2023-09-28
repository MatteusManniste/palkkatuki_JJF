import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import TextEditor from '../editor-components/TextEditor';
import '../css/Otsikko.css';
import Painike from '../editor-components/Painike';

const OtsikkoEditor = () => {
  const [otsikkoData, setOtsikkoData] = useState([]);
  const [otsikkoText, setOtsikkoText] = useState(''); // State to store the otsikko text
  const { id } = useParams();
  const [selectedOtsikkoId, setSelectedOtsikkoId] = useState(null); // Define selectedOtsikkoId
  const [kenttaContent, setKenttaContent] = useState(''); // Define kenttaContent
  const [otsikkoTexts, setOtsikkoTexts] = useState(
    otsikkoData.map((otsikko) => otsikko.otsikko)
  );
  const maxOtsikkoCount = 5; // Maximum number of otsikkos
  const [editingOtsikkoId, setEditingOtsikkoId] = useState(null);

  // Create an array to track editing states for each otsikko item
  const [isEditing, setIsEditing] = useState(new Array(otsikkoData.length).fill(false));

  useEffect(() => {
    // Fetch otsikko data from the API when the component mounts or nimikeId changes
    fetchOtsikkoData();
  }, [id]);

  const fetchOtsikkoData = async () => {
    try {
      // Make a GET request to fetch otsikko data from the API based on nimikeId
      const response = await axios.get(`http://localhost:3001/api/get-otsikko/${id}`);
      // Set the fetched otsikko data in the state
      setOtsikkoData(response.data);

      // Handle success or do any necessary UI updates
      console.log('Otsikko data fetched successfully', response.data);
    } catch (error) {
      // Handle errors
      console.error('Error fetching otsikko data:', error);
    }
  };

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

  const handleOtsikkoClick = (otsikkoId) => {
    console.log('Clicked on otsikko item', otsikkoId);
    setSelectedOtsikkoId(otsikkoId);
  
    // Fetch kentta content for the selected otsikko
    fetchKenttaContent(otsikkoId)
      .then((kenttaContent) => {
        setKenttaContent(kenttaContent); // Set the kentta content here
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

  const handleUpdate = async (otsikkoId, index) => {
    try {
      console.log('Attempting to update otsikko with id:', otsikkoId);
      
      // Make a PUT request to update the existing otsikko in the database
      await axios.put(`http://localhost:3001/api/update-otsikko/${otsikkoId}`, {
        otsikko: otsikkoTexts[index], // Use the corresponding otsikkoText value
      });
  
      // Fetch otsikko data again after updating
      fetchOtsikkoData();
  
      // Reset the input field and exit editing mode
      setIsEditing(false);
  
      // Handle success or do any necessary UI updates
      console.log('Otsikko updated successfully');
    } catch (error) {
      // Handle errors
      console.error('Error updating otsikko:', error);
    }
  };
  

  const handlePainikeUpdated = (updatedPainike) => {
    // Handle the updated Painike data, e.g., update state or perform any other actions
    console.log('Updated Painike:', updatedPainike);
  };

  const handleDelete = async (otsikkoId) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this otsikko?');
    if (!confirmDelete) {
      return;
    }
  
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

  const handleOtsikkoSubmit = async (otsikkoId) => {
    try {
      // Check if we are editing an existing otsikko or creating a new one
      if (editingOtsikkoId === null) {
        // Make a POST request to create a new otsikko in the database
        await axios.post('http://localhost:3001/api/create-otsikko', {
          text: otsikkoText,
          runko_id: id, // Pass the nimikeId as runko_id
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
                        className={`otsikko-item ${
                          selectedOtsikkoId === otsikko.id ? 'selected' : ''
                        }`}
                      >
                        {isEditing [index] ? (
  <>
    <input
      type="text"
      value={otsikkoTexts[index]} // Use otsikkoTexts array
      onChange={(e) => {
        // Update the corresponding otsikkoText value in the array
        const newTexts = [...otsikkoTexts];
        newTexts[index] = e.target.value;
        setOtsikkoTexts(newTexts);
      }}
    />
    <button onClick={() => handleUpdate(otsikko.id, index)}>Update</button>
  </>
) : (
  <>
    {otsikko.otsikko}
    <button onClick={() => setEditingOtsikkoId(otsikko.id, index)}>Edit</button>
    <button onClick={() => handleDelete(otsikko.id)}>Delete</button>
  </>
)}

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
      <div>
      {otsikkoData.length < maxOtsikkoCount || editingOtsikkoId !== null ? (
  <div>
    <input
      type="text"
      placeholder="Otsikko"
      value={otsikkoText}
      onChange={(e) => setOtsikkoText(e.target.value)}
    />
    <button
      onClick={() => handleOtsikkoSubmit(editingOtsikkoId)}
      style={{ display: !(otsikkoData.length === maxOtsikkoCount && editingOtsikkoId === null) ? 'block' : 'none' }}
    >
      {editingOtsikkoId !== null ? 'Update Otsikko' : 'Create Otsikko'}
    </button>
  </div>
) : null}
      </div>

      {/* Render the TextEditor and TextPost components */}
      {otsikkoData.map((otsikko) => (
        <div key={otsikko.id} className={`editor-container ${selectedOtsikkoId === otsikko.id ? 'visible' : 'hidden'}`}>
          {otsikko && otsikko.otsikko ? (
            <>
              <h1>Selected Otsikko: {otsikko.otsikko}</h1>
              <TextEditor otsikkoId={selectedOtsikkoId} kenttaContent={kenttaContent} />
              <br />
              <br />
              <Painike otsikkoId={otsikko.id} onPainikeUpdated={handlePainikeUpdated} />
            </>
          ) : null}
        </div>
      ))}
    </div>
  );
};

export default OtsikkoEditor;
