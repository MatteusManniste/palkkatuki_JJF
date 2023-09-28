import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useLocation } from 'react-router-dom';

const Sisalto = ({ runkoId }) => {
  const [sisalto, setSisalto] = useState([]);
  const location = useLocation();

  useEffect(() => {
    // Haetaan sisalto annetulle runkoId:lle
    axios.get(`http://localhost:3001/api/sisalto/runko/${runkoId}`)
      .then((response) => {
        console.log('API-vastaus:', response.data);
        setSisalto(response.data);
      })
      .catch((error) => {
        console.error('Virhe sisallon hakemisessa:', error);
      });
  }, [runkoId]);

  return (
    <div className="sisalto-container">
      <ul className="sisalto-lista">
        {sisalto.map((item) => (
          <li className="sisalto-kohta" key={item.id}>
            {/* Käytä item.id kohdesivun ID:ksi */}
            <Link
              to={
                location.pathname.includes('hallintapaneeli')
                  ? `/sivueditor/${encodeURIComponent(item.id)}`
                  : `/sivu/${encodeURIComponent(item.id)}`
              }
            >
              {item.otsikko}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Sisalto;

