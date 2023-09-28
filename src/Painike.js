import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const Painike = ({ sisaltoId }) => {
  const [painikes, setPainikes] = useState([]);

  useEffect(() => {
    // Haetaan painikkeet sisalto_id:n perusteella
    axios
      .get(`http://localhost:3001/api/painike/${sisaltoId}`)
      .then((response) => {
        console.log('API Vastaus:', response.data);
        setPainikes(response.data);
      })
      .catch((error) => {
        console.error('Virhe painikkeiden hakemisessa:', error);
      });
  }, [sisaltoId]);

  return (
    <div className="painike-container">
      <h3>Painikkeet:</h3>
      <ul className="painike-lista">
        {painikes.map((painike) => (
          <li key={painike.id} className="painike-kohta">
            {/* Käytetään item.otsikko-kenttää kohdesivun URL-osoitteena */}
            <Link to={`/sivu/${encodeURIComponent(painike.destination_id)}`}>
              <button className="painike-nappi">{painike.nimi}</button>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Painike;
