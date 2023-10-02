import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Funktio Painikkeen luomiseksi
const createPainike = async (sisaltoId, nimi, destinationId) => {
  try {
    const response = await axios.post('http://localhost:3001/api/create-painike', {
      sisaltoId,
      nimi,
      destinationId,
    });

    const newPainike = response.data;
    console.log(`Uusi Painike ID: ${newPainike.id}`);
    console.log(`Uusi Painike nimi: ${newPainike.nimi}`);

    return newPainike;
  } catch (error) {
    console.error('Virhe Painikkeen luonnissa:', error);
    throw error;
  }
};

// Funktio Painikkeen muokkaamiseksi
const editPainike = async (painikeId, nimi, destinationId) => {
  try {
    const response = await axios.put(`http://localhost:3001/api/edit-painike/${painikeId}`, {
      nimi,
      destinationId,
    });

    const updatedPainike = response.data;
    console.log(`Päivitetty Painike ID: ${updatedPainike.id}`);
    console.log(`Päivitetty Painike nimi: ${updatedPainike.nimi}`);

    return updatedPainike;
  } catch (error) {
    console.error('Virhe Painikkeen muokkauksessa:', error);
    throw error;
  }
};

const Painike = ({ otsikkoId, onPainikeUpdated }) => {
  // Tilamuuttujat
  const [nimi, setNimi] = useState('');
  const [destinationId, setDestinationId] = useState('');
  const [sisaltoOptions, setSisaltoOptions] = useState([]);
  const [createdPainikes, setCreatedPainikes] = useState([]);
  const [selectedPainikeId, setSelectedPainikeId] = useState(null);
  const [groupedSisaltoOptions, setGroupedSisaltoOptions] = useState({});
  const [runkoNameMapping, setRunkoNameMapping] = useState({});
  const [updatedPainike, setUpdatedPainike] = useState(null);

  // Haetaan sisältövaihtoehdot
  const fetchSisaltoOptions = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/get-sisalto-options');
      const sisaltoOptionsData = response.data;

      console.log('Sisältövaihtoehdot haettu:', sisaltoOptionsData);

      // Ryhmitellään sisältövaihtoehdot runko_id:n mukaan
      const groupedOptions = {};
      sisaltoOptionsData.forEach((sisaltoOption) => {
        if (!groupedOptions[sisaltoOption.runko_id]) {
          groupedOptions[sisaltoOption.runko_id] = [];
        }
        groupedOptions[sisaltoOption.runko_id].push(sisaltoOption);
      });

      setGroupedSisaltoOptions(groupedOptions);

      // Luodaan kartta runko_id:n ja runko_nimen välillä
      const updatedRunkoNameMapping = {};
      sisaltoOptionsData.forEach((sisaltoOption) => {
        updatedRunkoNameMapping[sisaltoOption.runko_id] = sisaltoOption.runko_nimi;
      });

      setRunkoNameMapping(updatedRunkoNameMapping);
    } catch (error) {
      console.error('Virhe sisältövaihtoehtojen haussa:', error);
    }
  };

  // Haetaan olemassa olevat Painikkeet
  const fetchExistingPainikes = async () => {
    try {
      const response = await axios.get(`http://localhost:3001/api/painike/${otsikkoId}`);
      const existingPainikes = response.data;

      console.log('Olemassa olevat Painikkeet haettu:', existingPainikes);

      setCreatedPainikes(existingPainikes);
    } catch (error) {
      console.error('Virhe olemassa olevien Painikkeiden haussa:', error);
    }
  };

  // Effekti, joka suoritetaan komponentin latauksen yhteydessä
  useEffect(() => {
    fetchExistingPainikes();
    fetchSisaltoOptions();
  }, []);

  // Käsittelijä Painikkeen luomiselle tai muokkaukselle
  const handleButtonClick = async () => {
    try {
      if (createdPainikes.length >= 4) {
        console.error('Maksimimäärä Painikkeita saavutettu tälle otsikolle.');
        return;
      }

      if (selectedPainikeId) {
        // Jos Painike on valittu muokkaukseen, kutsutaan editPainike-funktiota
        const updatedPainike = await editPainike(selectedPainikeId, nimi, destinationId);
        console.log('Päivitetty Painike:', updatedPainike);

        console.log('Vastaus palvelimelta muokkauksen jälkeen:', updatedPainike);
        console.log('Nykyinen tila ennen päivitystä:', createdPainikes);

        // Päivitetään tila muokatulla Painikkeella
        const updatedPainikesArray = createdPainikes.map((painike) =>
          painike.id === selectedPainikeId ? updatedPainike : painike
        );

        setCreatedPainikes(updatedPainikesArray);
        setSelectedPainikeId(null); // Nollataan valittu Painike

        console.log('Nykyinen tila päivityksen jälkeen:', createdPainikes);
      } else {
        // Muussa tapauksessa luodaan uusi Painike
        const newPainike = await createPainike(otsikkoId, nimi, destinationId);
        setCreatedPainikes([...createdPainikes, newPainike]);
      }

      setNimi('');
      setDestinationId('');
      onPainikeUpdated(updatedPainike);
    } catch (error) {
      console.error('Virhe Painikkeen luomisessa/muokkauksessa:', error);
    }
  };

  // Käsittelijä muokkauspainikkeen klikkaukselle
  const handleEditClick = (painikeId) => {
    // Asetetaan valittu Painike muokkaukseen
    const selectedPainike = createdPainikes.find((painike) => painike.id === painikeId);
    if (selectedPainike) {
      setNimi(selectedPainike.nimi);
      setDestinationId(selectedPainike.destinationId);
      setSelectedPainikeId(painikeId);
    }
  };

  // Tarkistetaan onko Painikkeiden enimmäismäärä saavutettu
  const isButtonLimitReached = createdPainikes.length >= 4;

  // Käsittelijä Painikkeen poistamiselle
  const handleDeleteClick = async (painikeId) => {
    try {
      // Lähetetään HTTP DELETE -pyyntö palvelimelle Painikkeen poistamiseksi
      await axios.delete(`http://localhost:3001/api/delete-painike/${painikeId}`);

      // Onnistuneen poiston jälkeen päivitetään tila poistetulla Painikkeella
      const updatedPainikesArray = createdPainikes.filter((painike) => painike.id !== painikeId);
      setCreatedPainikes(updatedPainikesArray);

      console.log('Painike poistettu onnistuneesti');
    } catch (error) {
      console.error('Virhe Painikkeen poistamisessa:', error);
    }
  };

  console.log('Runko-nimikartoitus:', runkoNameMapping);

  return (
    <div>
      {isButtonLimitReached ? (
        <p>Painikkeiden enimmäismäärä saavutettu (4/4). Syötekentät ovat piilotettu.</p>
      ) : (
        <>
          <input
            type="text"
            placeholder="Syötä nimi"
            value={nimi}
            onChange={(e) => setNimi(e.target.value)}
          />

          <select
            value={destinationId}
            onChange={(e) => setDestinationId(e.target.value)}
          >
            <option value="">Valitse kohde</option>
            {Object.keys(groupedSisaltoOptions).map((runkoId) => (
              <optgroup key={runkoId} label={`Runko: ${runkoNameMapping[runkoId]}`}>
                {groupedSisaltoOptions[runkoId].map((sisaltoOption) => (
                  <option key={sisaltoOption.id} value={sisaltoOption.id}>
                    {sisaltoOption.otsikko}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>

          <button onClick={handleButtonClick}>
            {selectedPainikeId ? 'Muokkaa Painiketta' : 'Luo Painike'}
          </button>
        </>
      )}

      {createdPainikes.map((painike) => (
        <div key={painike.id}>
          <button onClick={() => handleEditClick(painike.id)}>Muokkaa</button>
          <button>{painike.nimi || 'Nimi puuttuu'}</button>
          <button onClick={() => handleDeleteClick(painike.id)}>Poista</button>
        </div>
      ))}
    </div>
  );
};

export default Painike;
