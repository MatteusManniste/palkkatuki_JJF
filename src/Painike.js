import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import "./css/Painike.css";

const Painike = ({ sisaltoId }) => {
  const [painikes, setPainikes] = useState([]);

  useEffect(() => {
    axios
      .get(`http://localhost:3001/api/painike/${sisaltoId}`)
      .then((response) => {
        console.log("API Vastaus:", response.data);
        setPainikes(response.data);
      })
      .catch((error) => {
        console.error("Virhe painikkeiden hakemisessa:", error);
      });
  }, [sisaltoId]);

  return (
    <div className="painike-container">
      {painikes.map((painike) => (
        <div key={painike.id} className="painike-kohta">
          <Link to={`/sivu/${encodeURIComponent(painike.destination_id)}`}>
            <button className="painike-nappi">{painike.nimi}</button>
          </Link>
        </div>
      ))}
    </div>
  );
};

export default Painike;
