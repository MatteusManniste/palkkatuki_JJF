import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";
import "./css/Sisalto.css";

const Sisalto = ({ runkoId }) => {
  const [sisalto, setSisalto] = useState([]);
  const location = useLocation();

  useEffect(() => {
    axios
      .get(`http://localhost:3001/api/sisalto/runko/${runkoId}`, { withCredentials: true })
      .then((response) => {
        console.log("API-vastaus:", response.data);
        setSisalto(response.data);
      })
      .catch((error) => {
        console.error("Virhe sisallon hakemisessa:", error);
      });
  }, [runkoId]);

  return (
    <div className="sisalto-container">
      <div className="sisalto-links">
        {sisalto.map((item) =>
          location.pathname.includes("hallintapaneeli") ? (
            <div className="sisalto-link disabled" key={item.id}>
              <h3>{item.otsikko}</h3>
              <span className="arrow-icon">
                <FontAwesomeIcon icon={faArrowRight} />
              </span>
            </div>
          ) : (
            <Link
              to={`/sivu/${encodeURIComponent(item.id)}`}
              className="sisalto-link"
              key={item.id}
            >
              <h3>{item.otsikko}</h3>
              <span className="arrow-icon">
                <FontAwesomeIcon icon={faArrowRight} />
              </span>
            </Link>
          ),
        )}
      </div>
    </div>
  );
};

export default Sisalto;
