import React, { useEffect, useState } from 'react';

const NimikeEdit = ({ id, runkos }) => {
  // Find the runko data based on the ID
  const selectedRunko = runkos.find((runko) => runko.id === id);

  return (
    <div>
      <h1>Edit Nimike</h1>
      {/* Check if selectedRunko is defined before accessing its properties */}
      {selectedRunko ? (
        <div>
          <p>ID: {selectedRunko.id}</p>
          <p>Nimike: {selectedRunko.nimike}</p>
          {/* Additional editing components and logic */}
        </div>
      ) : (
        <p>No data found for the selected ID</p>
      )}
    </div>
  );
};

export default NimikeEdit;
