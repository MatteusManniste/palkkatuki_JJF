import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useLocation } from 'react-router-dom';
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
  const location = useLocation();

  useEffect(() => {
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
      <div key={runko.id} style={runkoStyle}>
        <h2>{runko.nimike}</h2>
        {location.pathname.includes('hallintapaneeli') && (
          <Link to={`/sivueditor/${encodeURIComponent(runko.id)}`}>
            Sivueditor
          </Link>
        )}
        <Sisalto runkoId={runko.id} />
      </div>
    ))}
    </div>
  );
};

export default Runko;
