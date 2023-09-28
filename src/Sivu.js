import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import Painike from './Painike';
import Breadcrumb from './Breadcrumb';

const Sivu = () => {
  const { otsikko } = useParams();
  const [content, setContent] = useState(null);
  const [breadcrumbs, setBreadcrumbs] = useState([]);

  useEffect(() => {
    console.log('Pyydetään API:sta id:llä:', otsikko);
    axios.get(`http://localhost:3001/api/sisalto/id/${otsikko}`)
      .then((response) => {
        console.log('API-vastaus:', response.data);
        setContent(response.data);

        // Luodaan uusi murupolku-taulukko aiempien murupolkujen perusteella
        setBreadcrumbs((prevBreadcrumbs) => {
          const newBreadcrumbs = [...prevBreadcrumbs];

          if (response.data) {
            // Tarkista, onko murupolku jo olemassa ennen kuin lisätään se
            const breadcrumbExists = newBreadcrumbs.some(
              (breadcrumb) => breadcrumb.label === response.data.otsikko
            );

            if (!breadcrumbExists) {
              newBreadcrumbs.push({
                id: response.data.id, // Uniikki tunniste murupolulle
                label: response.data.otsikko,
                path: `/sivu/${encodeURIComponent(response.data.id)}`,
              });
            } else {
              // Jos murupolku on jo olemassa, poista mahdolliset seuraavat murupolut
              const index = newBreadcrumbs.findIndex(
                (breadcrumb) => breadcrumb.id === response.data.id
              );
              newBreadcrumbs.splice(index + 1);
            }
          }

          return newBreadcrumbs;
        });
      })
      .catch((error) => {
        console.error('Virhe sisällön noutamisessa:', error);
      });
  }, [otsikko]);

  return (
    <div>
      {/* Renderöi Murupolku-komponentti ja välitä murupolut propina */}
      <Breadcrumb breadcrumbs={breadcrumbs} />

      <div className="content">
        <h2>{otsikko}</h2>
        {content ? (
          <div dangerouslySetInnerHTML={{ __html: content.kentta }} />
        ) : (
          <p>Ei saatavilla olevaa sisältöä</p>
        )}
      </div>

      {/* Renderöi Painike-komponentti tässä */}
      {content && <Painike sisaltoId={content.id} destinationId={content.id} />}
    </div>
  );
};

export default Sivu;
