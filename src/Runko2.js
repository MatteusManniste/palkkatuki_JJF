import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Sisalto from './Sisalto';

const runkoStyle = {
  backgroundColor: 'yellow',
  padding: '10px',
  margin: '10px',
  boxShadow: '2px 2px 5px rgba(0, 0, 0, 0.2)',
  borderRadius: '5px',
  width: '300px',
  position: 'relative',
};

const Runko = () => {
  const [runkos, setRunkos] = useState([]);

  useEffect(() => {
    // Fetch runkos from your Express.js API endpoint
    axios.get('http://localhost:3001/api/runko')
      .then((response) => {
        setRunkos(response.data);
      })
      .catch((error) => {
        console.error('Error fetching runkos:', error);
      });
  }, []);

  return (
    <div>
        {runkos.map((runko) => (
            <div style={runkoStyle}> {/* Apply runkoStyle here */}
              <h2>{runko.nimike}</h2>
              <Sisalto runkoId={runko.id} /> {/* Pass the runkoId to fetch and display sisalto */}
            </div>
        ))}
    </div>
  );
};

export default Runko;
