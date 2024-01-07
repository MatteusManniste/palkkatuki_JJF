import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import TextEditor from '../editor-components/TextEditor';
import '../css/Otsikko.css';
import Painike from '../editor-components/Painike';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';

const OtsikkoEditor = () => {
  const [otsikkoData, setOtsikkoData] = useState([]);
  const [otsikkoText, setOtsikkoText] = useState('');
  const { id } = useParams();
  const [selectedOtsikkoId, setSelectedOtsikkoId] = useState(null);
  const [kenttaContent, setKenttaContent] = useState('');
  const [otsikkoTexts, setOtsikkoTexts] = useState(
    otsikkoData.map((otsikko) => otsikko.otsikko)
  );
  const maxOtsikkoCount = 10;
  const [editingOtsikkoId, setEditingOtsikkoId] = useState(null);
  const [isEditing, setIsEditing] = useState(new Array(otsikkoData.length).fill(false));

  useEffect(() => {
    fetchOtsikkoData();
  }, [id]);

  const fetchOtsikkoData = async () => {
    try {
      const response = await axios.get(`http://localhost:3001/api/get-otsikko/${id}`);
      setOtsikkoData(response.data);

      console.log('Otsikko data fetched successfully', response.data);
    } catch (error) {
      console.error('Error fetching otsikko data:', error);
    }
  };

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

  const handleOtsikkoClick = (otsikkoId) => {
    console.log('Clicked on otsikko item', otsikkoId);
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

  const handleUpdate = async (otsikkoId, index) => {
    try {
      console.log('Attempting to update otsikko with id:', otsikkoId);
      
      await axios.put(`http://localhost:3001/api/update-otsikko/${otsikkoId}`, {
        otsikko: otsikkoTexts[index],
      });
      fetchOtsikkoData();
  
      setIsEditing(false);
  
      console.log('Otsikko updated successfully');
    } catch (error) {
      console.error('Error updating otsikko:', error);
    }
  };
  

  const handlePainikeUpdated = (updatedPainike) => {
    console.log('Updated Painike:', updatedPainike);
  };

const handleDelete = async (otsikkoId) => {
  const otsikkoToDelete = otsikkoData.find((otsikko) => otsikko.id === otsikkoId);

  if (!otsikkoToDelete) {
    console.error('Otsikko not found for ID:', otsikkoId);
    return;
  }

  const confirmDelete = window.confirm('Poistetaanko ' + otsikkoToDelete.otsikko + '?');
  if (!confirmDelete) {
    return;
  }

  try {
    await axios.delete(`http://localhost:3001/api/delete-otsikko/${otsikkoId}`);

    fetchOtsikkoData();

    console.log('Otsikko deleted successfully');
  } catch (error) {
    console.error('Error deleting otsikko:', error);
  }
};

  const handleOtsikkoSubmit = async (otsikkoId) => {
    try {
      if (editingOtsikkoId === null) {
        await axios.post('http://localhost:3001/api/create-otsikko', {
          text: otsikkoText,
          runko_id: id,
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
  
  return (
    <div>
    <div className="kappale">
    <p>
      Kappale määrä: {otsikkoData.length}/{maxOtsikkoCount}
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
className="otsikko-submit-button"
onClick={() => handleOtsikkoSubmit(editingOtsikkoId)}
style={{ display: !(otsikkoData.length === maxOtsikkoCount && editingOtsikkoId === null) ? 'block' : 'none' }}
>
{editingOtsikkoId !== null ? 'Päivitä kappale' : 'Lisää kappale'}
</button>
</div>
) : null}
</div>
    </div>

    <div className="container">
            <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="otsikkos">
          {(provided) => (
            <ul  className="custom-list" {...provided.droppableProps} ref={provided.innerRef}>
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
  onClick={(e) => {
    if (!e.target.classList.contains('button-icon') && !e.target.closest('.button-icon')) {
      handleOtsikkoClick(otsikko.id);
    }
  }}
  className={`otsikko-item ${
    selectedOtsikkoId === otsikko.id ? 'selected' : ''
  }`}
>

<div>
  {isEditing[index] ? (
    <div>
      <input
        type="text"
        value={otsikkoTexts[index]}
        onChange={(e) => {
          const newTexts = [...otsikkoTexts];
          newTexts[index] = e.target.value;
          setOtsikkoTexts(newTexts);
        }}
      />
      <button className="edit-button" onClick={() => handleUpdate(otsikko.id, index)}>
        Päivitä
      </button>
    </div>
  ) : (
<div className={`otsikko-view ${selectedOtsikkoId === otsikko.id ? 'visible' : 'hidden'}`}>
  <h4>{otsikko.otsikko}</h4>
  <span
    className="button-icon"
    onClick={() => setEditingOtsikkoId(otsikko.id, index)}
  >
    <FontAwesomeIcon icon={faEdit} />
  </span>
  <span
    className="button-icon"
    onClick={() => handleDelete(otsikko.id)}
  >
    <FontAwesomeIcon icon={faTrash} />
  </span>
</div>
  )}
</div>
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
      <div className="centered-content">
      {otsikkoData.map((otsikko) => (
        <div key={otsikko.id} className={`editor-container ${selectedOtsikkoId === otsikko.id ? 'visible' : 'hidden'}`}>
          {otsikko && otsikko.otsikko ? (
            <>
              <h3>Muokataan: {otsikko.otsikko}</h3>
              <TextEditor otsikkoId={selectedOtsikkoId} kenttaContent={kenttaContent} />
              <br />
              <br />
              <Painike otsikkoId={otsikko.id} onPainikeUpdated={handlePainikeUpdated} />
            </>
          ) : null}
        </div>
      ))}
      </div>
    </div>
    </div>
  );
};

export default OtsikkoEditor;
