import React, { useState } from 'react';

const buttonMakerStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
};

const addButtonContainerStyle = {
  display: 'flex',
  alignItems: 'center',
  marginBottom: '10px',
};

const addButtonStyle = {
  padding: '10px 20px',
  fontSize: '16px',
  backgroundColor: 'lightblue',
  border: 'none',
  borderRadius: '5px',
  cursor: 'pointer',
};

const buttonContainerStyle = {
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
};

const buttonStyle = {
  padding: '10px 20px',
  fontSize: '16px',
  backgroundColor: 'lightgreen',
  border: 'none',
  borderRadius: '5px',
  cursor: 'pointer',
  marginLeft: '10px',
};

const ButtonMaker = () => {
  const [buttons, setButtons] = useState([]);

  const handleAddButton = () => {
    if (buttons.length >= 4) {
      alert('You can only add up to 4 buttons.');
      return;
    }
    const name = prompt('Enter a name for the button:');
    if (name) {
      setButtons([...buttons, { name, destination: '' }]);
    }
  };

  const handleChangeButtonName = (index) => {
    const updatedButtons = [...buttons];
    const newName = prompt('Enter a new name for the button:');
    if (newName) {
      updatedButtons[index].name = newName;
      setButtons(updatedButtons);
    }
  };

  const handleDestinationChange = (index, event) => {
    const updatedButtons = [...buttons];
    updatedButtons[index].destination = event.target.value;
    setButtons(updatedButtons);
  };

  return (
    <div style={buttonMakerStyle}>
      <div style={addButtonContainerStyle}>
        <div style={buttonContainerStyle}>
          {buttons.map((button, index) => (
            <div key={index} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <button
                onClick={() => handleChangeButtonName(index)}
                style={buttonStyle}
              >
                {button.name}
              </button>
              <select
                value={button.destination}
                onChange={(event) => handleDestinationChange(index, event)}
              >
                <option value="">Select Destination</option>
                <option value="destination1">Destination 1</option>
                <option value="destination2">Destination 2</option>
              </select>
            </div>
          ))}
        </div>
        {buttons.length < 4 && (
          <button onClick={handleAddButton} style={addButtonStyle}>
            +
          </button>
        )}
      </div>
    </div>
  );
};

export default ButtonMaker;
