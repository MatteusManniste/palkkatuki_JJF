import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import TextEditor from './TextEditor';
import '../css/Otsikko.css';
import Painike from './Painike';

const Otsikko = ({ nimikeId }) => {
  const [otsikkoText, setOtsikkoText] = useState('');
  const [otsikkoData, setOtsikkoData] = useState([]);
  const [editingOtsikkoId, setEditingOtsikkoId] = useState(null);
  const [selectedOtsikkoId, setSelectedOtsikkoId] = useState(null);
  const maxOtsikkoCount = 5;
  const [kenttaContent, setKenttaContent] = useState('');

  useEffect(() => {
    fetchOtsikkoData();
  }, [nimikeId]);
  const fetchOtsikkoData = async () => {
    try {
      const response = await axios.get(`http://localhost:3001/api/get-otsikko/${nimikeId}`);
  
      const initialOtsikkoData = response.data.map((otsikko, index) => ({
        ...otsikko,
        jarjestysNro: index + 1,
      }));
      setOtsikkoData(initialOtsikkoData);
  
      console.log('Otsikko data fetched successfully');
    } catch (error) {
      console.error('Error fetching otsikko data:', error);
    }
  };

  useEffect(() => {
    if (otsikkoData.length > 0) {
      setSelectedOtsikkoId(otsikkoData[0].id);
    }
  }, [otsikkoData]);
  
  const onDragEnd = async (result) => {
    if (!result.destination) {
      return;
    }
  
    const { source, destination } = result;
  
    const reorderedData = [...otsikkoData];
    const [movedItem] = reorderedData.splice(source.index, 1);
    reorderedData.splice(destination.index, 0, movedItem);
    setOtsikkoData(reorderedData);
  
    try {
      const newData = reorderedData.map((item, index) => ({
        id: item.id,
        order: index + 1,
        jarjestysNro: item.jarjestysNro,
      }));
  
      await axios.put('http://localhost:3001/api/update-otsikko-order', newData);
  
      console.log('Order updated successfully');
    } catch (error) {
      console.error('Error updating order:', error);
    }
  };

  const handleOtsikkoSubmit = async (otsikkoId) => {
    try {
      if (editingOtsikkoId === null) {
        await axios.post('http://localhost:3001/api/create-otsikko', {
          text: otsikkoText,
          runko_id: nimikeId,
        });
      } else {
        await axios.put(`http://localhost:3001/api/update-otsikko/${otsikkoId}`, {
          text: otsikkoText,
        });

        setEditingOtsikkoId(null);
      }

      fetchOtsikkoData();

      setOtsikkoText('');

      console.log('Otsikko created/updated successfully');
    } catch (error) {
      console.error('Error creating/updating otsikko:', error);
    }
  };

  const handleDeleteOtsikko = async (otsikkoId) => {
    try {
      await axios.delete(`http://localhost:3001/api/delete-otsikko/${otsikkoId}`);

      fetchOtsikkoData();

      console.log('Otsikko deleted successfully');
    } catch (error) {
      console.error('Error deleting otsikko:', error);
    }
  };

  const handleOtsikkoClick = (otsikkoId) => {
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
      return response.data.kentta;
    } catch (error) {
      console.error('Error fetching kentta content:', error);
      return null;
    }
  };
  const handlePainikeUpdated = (updatedPainike) => {
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
