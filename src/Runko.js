import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useLocation } from 'react-router-dom';
import Sisalto from './Sisalto';
import Laskuri from './Laskuri';
import './css/Runko.css';

const Runko = () => {
  const [runkos, setRunkos] = useState([]);
  const location = useLocation();

  useEffect(() => {
    axios
      .get('http://localhost:3001/api/runko')
      .then((response) => {
        setRunkos(response.data);
      })
      .catch((error) => {
        console.error('Error fetching runkos:', error);
      });
  }, []);

  return (
    <div className="runko-container">
      {runkos.map((runko) => (
        <div key={runko.id} className="runko-box">
          <h1>{runko.nimike}</h1>
          {location.pathname.includes('hallintapaneeli') && (
            <Link to={`/sivueditor/${encodeURIComponent(runko.id)}`}>
              Muokkaa
            </Link>
          )}
          <Sisalto runkoId={runko.id} />
        </div>
      ))}

      <div className="laskuri-box">
        <Laskuri />
      </div>
    </div>
  );
};

export default Runko;
