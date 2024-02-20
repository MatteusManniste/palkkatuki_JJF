import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import Painike from "./Painike";
import Breadcrumb from "./Breadcrumb";
import "./css/Sivu.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHome } from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";

const Sivu = () => {
  const { otsikko } = useParams();
  const [content, setContent] = useState(null);
  const [breadcrumbs, setBreadcrumbs] = useState([]);

  useEffect(() => {
    console.log("Pyydetään API:sta id:llä:", otsikko);
    axios
      .get(`http://localhost:3001/api/sisalto/id/${otsikko}`, { withCredentials: true })
      .then((response) => {
        console.log("API-vastaus:", response.data);
        setContent(response.data);

        setBreadcrumbs((prevBreadcrumbs) => {
          const newBreadcrumbs = [...prevBreadcrumbs];

          if (response.data) {
            const breadcrumbExists = newBreadcrumbs.some(
              (breadcrumb) => breadcrumb.label === response.data.otsikko,
            );

            if (!breadcrumbExists) {
              newBreadcrumbs.push({
                id: response.data.id,
                label: response.data.otsikko,
                path: `/sivu/${encodeURIComponent(response.data.id)}`,
              });
            } else {
              const index = newBreadcrumbs.findIndex(
                (breadcrumb) => breadcrumb.id === response.data.id,
              );
              newBreadcrumbs.splice(index + 1);
            }
          }

          return newBreadcrumbs;
        });
      })
      .catch((error) => {
        console.error("Virhe sisällön noutamisessa:", error);
      });
  }, [otsikko]);

  return (
    <div>
      <div className="sivu-content">
        <div className="breadcrumb-container">
          <Breadcrumb breadcrumbs={breadcrumbs} />
        </div>
        <h2 style={{ textAlign: "center" }}>
          {content && content.otsikko ? content.otsikko : otsikko}
        </h2>
        {content ? (
          <div dangerouslySetInnerHTML={{ __html: content.kentta }} />
        ) : (
          <p>Ei saatavilla olevaa sisältöä</p>
        )}
        {content && (
          <Painike sisaltoId={content.id} destinationId={content.id} />
        )}
      </div>
      <div className="home-link-container">
        <Link to="/" className="home-link">
          <FontAwesomeIcon icon={faHome} />
        </Link>
      </div>
    </div>
  );
};

export default Sivu;
