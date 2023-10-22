import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import '../css/Painike.css'

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
  const [nimi, setNimi] = useState('');
  const [destinationId, setDestinationId] = useState('');
  const [sisaltoOptions, setSisaltoOptions] = useState([]);
  const [createdPainikes, setCreatedPainikes] = useState([]);
  const [selectedPainikeId, setSelectedPainikeId] = useState(null);
  const [groupedSisaltoOptions, setGroupedSisaltoOptions] = useState({});
  const [runkoNameMapping, setRunkoNameMapping] = useState({});
  const [updatedPainike, setUpdatedPainike] = useState(null);

  const fetchSisaltoOptions = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/get-sisalto-options');
      const sisaltoOptionsData = response.data;

      console.log('Sisältövaihtoehdot haettu:', sisaltoOptionsData);

      const groupedOptions = {};
      sisaltoOptionsData.forEach((sisaltoOption) => {
        if (!groupedOptions[sisaltoOption.runko_id]) {
          groupedOptions[sisaltoOption.runko_id] = [];
        }
        groupedOptions[sisaltoOption.runko_id].push(sisaltoOption);
      });

      setGroupedSisaltoOptions(groupedOptions);

      const updatedRunkoNameMapping = {};
      sisaltoOptionsData.forEach((sisaltoOption) => {
        updatedRunkoNameMapping[sisaltoOption.runko_id] = sisaltoOption.runko_nimi;
      });

      setRunkoNameMapping(updatedRunkoNameMapping);
    } catch (error) {
      console.error('Virhe sisältövaihtoehtojen haussa:', error);
    }
  };

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

  useEffect(() => {
    fetchExistingPainikes();
    fetchSisaltoOptions();
  }, []);

  const handleButtonClick = async () => {
    try {
      if (createdPainikes.length >= 4) {
        console.error('Maksimimäärä Painikkeita saavutettu tälle otsikolle.');
        return;
      }

      if (selectedPainikeId) {
        const updatedPainike = await editPainike(selectedPainikeId, nimi, destinationId);
        console.log('Päivitetty Painike:', updatedPainike);

        console.log('Vastaus palvelimelta muokkauksen jälkeen:', updatedPainike);
        console.log('Nykyinen tila ennen päivitystä:', createdPainikes);

        const updatedPainikesArray = createdPainikes.map((painike) =>
          painike.id === selectedPainikeId ? updatedPainike : painike
        );

        setCreatedPainikes(updatedPainikesArray);
        setSelectedPainikeId(null);

        console.log('Nykyinen tila päivityksen jälkeen:', createdPainikes);
      } else {
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

  const handleEditClick = (painikeId) => {
    const selectedPainike = createdPainikes.find((painike) => painike.id === painikeId);
    if (selectedPainike) {
      setNimi(selectedPainike.nimi);
      setDestinationId(selectedPainike.destinationId);
      setSelectedPainikeId(painikeId);
    }
  };

  const isButtonLimitReached = createdPainikes.length >= 4;

  const handleDeleteClick = async (painikeId) => {
    try {
      await axios.delete(`http://localhost:3001/api/delete-painike/${painikeId}`);

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
              <optgroup key={runkoId} label={`${runkoNameMapping[runkoId]}`}>
                {groupedSisaltoOptions[runkoId].map((sisaltoOption) => (
                  <option key={sisaltoOption.id} value={sisaltoOption.id}>
                    {sisaltoOption.otsikko}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>

          <button className="button" onClick={handleButtonClick}>
      {selectedPainikeId ? 'Muokkaa Painiketta' : 'Luo Painike'}
          </button>
        </>
      )}

      {createdPainikes.map((painike) => (
        <div key={painike.id}>
          <span
className="button-icon"
onClick={() => handleEditClick(painike.id)}
>
<button className="button">{painike.nimi || 'Nimi puuttuu'}</button>
<FontAwesomeIcon icon={faEdit} />
</span>

          <span
className="button-icon"
onClick={() => handleDeleteClick(painike.id)}
>
<FontAwesomeIcon icon={faTrash} />
</span>
        </div>
      ))}
    </div>
  );
};

export default Painike;

