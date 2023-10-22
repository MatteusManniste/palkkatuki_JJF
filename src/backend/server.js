const express = require('express');
const cors = require('cors');
const multer = require('multer');
const app = express();
const port = process.env.PORT || 3001;

const Data = require('./data');

// Käytetään JSON-muotoista dataa
app.use(express.json());
// Käytetään CORS-middlewarea sallimaan ristikkomainen pyyntöjen käsittely
app.use(cors());
// Asetetaan CORS-asetukset
const corsOptions = {
  origin: 'http://localhost:3000', // Sallitaan vain pyynnöt localhostin osoitteesta
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', // Sallitut HTTP-metodit
  credentials: true, // Sallitaan evästeiden (cookies) käyttö
};

// Käytetään CORS-asetuksia
app.use(cors(corsOptions));

// API-reitit

// Määritellään reitit ja niiden toiminnot

// Hakee kaikki "runko"-tietueet
app.get('/api/runko', (req, res) => {
  try {
    Data.SelectFromRunko((err, result) => {
      if (err) {
        console.error('Virhe hakiessa runkoja:', err);
        res.status(500).json({ error: 'Sisäinen palvelinvirhe' });
        return;
      }
      res.json(result);
    });
  } catch (error) {
    console.error('Virhe hakiessa runkoja:', error);
    res.status(500).json({ error: 'Sisäinen palvelinvirhe' });
  }
});

// Hakee "runko"-tietueen tietyn ID:n perusteella
app.get('/api/runko/:runkoId', (req, res) => {
  const { runkoId } = req.params;
  Data.SelectFromRunkoById(runkoId, (err, runkoData) => {
    if (err) {
      res.status(500).json({ error: 'Sisäinen palvelinvirhe' });
      return;
    }
    res.json(runkoData);
  });
});

// Poistaa "runko"-tietueen tietyn ID:n perusteella
app.delete('/api/delete-title/:id', (req, res) => {
  const { id } = req.params;
  Data.deleteNimikeById(id, (err, result) => {
    if (err) {
      console.error('Virhe poistettaessa Nimikettä:', err);
      res.status(500).json({ error: 'Sisäinen palvelinvirhe' });
      return;
    }
    if (result.affectedRows === 0) {
      res.status(404).json({ error: 'Nimikettä ei löydy' });
      return;
    }
    console.log('Nimike poistettu onnistuneesti');
    res.status(204).send();
  });
});

// Hakee "sisalto"-tietueen tietyn otsikon perusteella
app.get('/api/sisalto/:otsikko', (req, res) => {
  const { otsikko } = req.params;
  Data.SelectFromSisaltoByOtsikko(otsikko, (err, data) => {
    if (err) {
      console.error('Virhe sisällön noutamisessa:', err);
      res.status(500).json({ error: 'Sisäinen palvelinvirhe' });
      return;
    }
    res.json(data);
  });
});

// Hakee "sisalto"-tietueen tietyn "runko"-tietueen ID:n perusteella
app.get('/api/sisalto/runko/:runkoId', (req, res) => {
  const { runkoId } = req.params;
  Data.SelectFromSisaltoByRunkoId(runkoId, (err, data) => {
    if (err) {
      res.status(500).json({ error: 'Sisäinen palvelinvirhe' });
      return;
    }
    res.json(data);
  });
});

// Hakee "painike"-tietueet tietyn "sisalto"-tietueen ID:n perusteella
app.get('/api/painike/:sisaltoId', (req, res) => {
  const { sisaltoId } = req.params;
  Data.SelectFromPainikeBySisaltoId(sisaltoId, (err, data) => {
    if (err) {
      res.status(500).json({ error: 'Sisäinen palvelinvirhe' });
      return;
    }
    res.json(data);
  });
});

// Hakee "sisalto"-tietueen tietyn ID:n perusteella
app.get('/api/sisalto/id/:id', (req, res) => {
  const { id } = req.params;
  Data.SelectFromSisaltoById(id, (err, data) => {
    if (err) {
      console.error('Virhe sisällön noutamisessa:', err);
      res.status(500).json({ error: 'Sisäinen palvelinvirhe' });
      return;
    }
    res.json(data);
  });
});

// Hakee uusimman "runko"-tietueen nimikkeen
app.get('/api/get-new-title', (req, res) => {
  Data.SelectNimikeFromRunko((err, title) => {
    if (err) {
      console.error('Virhe haettaessa uutta nimikettä:', err);
      res.status(500).json({ error: 'Sisäinen palvelinvirhe' });
      return;
    }
    res.json({ title });
  });
});

// Luo uuden "runko"-tietueen nimikkeen
app.post('/api/create-title', (req, res) => {
  const { text } = req.body;
  Data.insertTitle(text, (err, result) => {
    if (err) {
      console.error('Virhe luotaessa nimikettä:', err);
      res.status(500).json({ error: 'Sisäinen palvelinvirhe' });
      return;
    }
    const newTitleId = result.insertId;
    console.log('Nimike luotu onnistuneesti ID:llä:', newTitleId);
    res.json({ id: newTitleId });
  });
});


// Päivittää "otsikko"-tietueen tietyn ID:n perusteella
app.put('/api/update-otsikko/:id', (req, res) => {
  const { id } = req.params;
  const { text } = req.body;
  Data.updateOtsikko(id, text, (err, result) => {
    if (err) {
      console.error('Virhe päivitettäessä otsikkoa:', err);
      res.status(500).json({ error: 'Sisäinen palvelinvirhe' });
      return;
    }
    res.json({ message: 'Otsikko päivitetty onnistuneesti' });
  });
});

// Päivittää "nimike"-tietueen tietyn ID:n perusteella
app.put('/api/update-title/:id', (req, res) => {
  const { id } = req.params;
  const { newText } = req.body;
  Data.updateTitle(id, newText, (err, result) => {
    if (err) {
      console.error('Virhe päivitettäessä nimikettä:', err);
      res.status(500).json({ error: 'Sisäinen palvelinvirhe' });
      return;
    }
    res.json({ message: 'Nimike päivitetty onnistuneesti' });
  });
});

// Hakee "otsikko"-tietueen tietyn "runko"-tietueen ID:n perusteella
app.get('/api/get-otsikko/:runko_id', (req, res) => {
  const { runko_id } = req.params;
  Data.getOtsikkoByRunkoId(runko_id, (err, data) => {
    if (err) {
      console.error('Virhe otsikon tietojen hakemisessa:', err);
      res.status(500).json({ error: 'Sisäinen palvelinvirhe' });
      return;
    }
    res.json(data);
  });
});

// Luo tai päivittää "otsikko"-tietueen tietyn "runko"-tietueen ja tekstin perusteella
app.post('/api/create-otsikko', (req, res) => {
  const { text, runko_id } = req.body;
  Data.createOrUpdateOtsikko(text, runko_id, (err, result, otsikkoIds) => {
    if (err) {
      console.error('Virhe luotaessa/päivitettäessä otsikkoa:', err);
      res.status(500).json({ error: 'Sisäinen palvelinvirhe' });
      return;
    }

    console.log(result);
    res.json({ message: result, otsikkoIds });
  });
});

// Päivittää "otsikko"-tietueiden järjestyksen
const { updateOtsikkoOrder } = require('./data');
app.put('/api/update-otsikko-order', async (req, res) => {
  const otsikkos = req.body;
  try {
    await updateOtsikkoOrder(otsikkos);
    res.status(200).json({ message: 'Otsikkojen järjestys päivitetty onnistuneesti' });
  } catch (error) {
    console.error('Virhe päivitettäessä otsikkojen järjestystä:', error);
    res.status(500).json({ error: 'Sisäinen palvelinvirhe' });
  }
});

// Poistaa "otsikko"-tietueen tietyn ID:n perusteella
app.delete('/api/delete-otsikko/:id', (req, res) => {
  const otsikkoId = req.params.id;
  try {
    Data.deleteOtsikko(otsikkoId, (err, result) => {
      if (err) {
        console.error('Virhe poistettaessa otsikkoa:', err);
        res.status(500).json({ error: 'Sisäinen palvelinvirhe' });
        return;
      }
      if (result.affectedRows > 0) {
        res.json({ message: 'Otsikko poistettu onnistuneesti' });
      } else {
        res.status(404).json({ error: 'Otsikkoa ei löytynyt' });
      }
    });
  } catch (error) {
    console.error('Virhe käsiteltäessä poistopyyntöä:', error);
    res.status(500).json({ error: 'Sisäinen palvelinvirhe' });
  }
});

// Tallentaa rikkaan tekstin "otsikko"-tietueelle
app.post('/api/save-rich-text/:id', async (req, res) => {
  const { id } = req.params;
  const { richText } = req.body;
  try {
    console.log('Vastaanotettiin rikas tekstidata palvelimella:', richText);
    Data.updateRichTextForOtsikko(id, richText, (err, result) => {
      if (err) {
        console.error('Virhe päivitettäessä rikasta tekstisisältöä otsikolle:', err);
        res.status(500).json({ error: 'Sisäinen palvelinvirhe' });
        return;
      }
      res.status(200).json({ message: 'Rikas tekstisisältö tallennettu onnistuneesti' });
    });
  } catch (error) {
    console.error('Virhe tallennettaessa rikasta tekstisisältöä:', error);
    res.status(500).json({ error: 'Sisäinen palvelinvirhe' });
  }
});

// Luo uuden "painike"-tietueen
app.post('/api/create-painike', (req, res) => {
  const { sisaltoId, nimi, destinationId } = req.body;
  Data.insertPainike(sisaltoId, nimi, destinationId, (err, result) => {
    if (err) {
      console.error('Virhe luotaessa painiketta:', err);
      res.status(500).json({ error: 'Sisäinen palvelinvirhe' });
      return;
    }
    const newPainikeId = result.insertId;
    console.log('Painike luotu onnistuneesti ID:llä:', newPainikeId);
    res.json({ id: newPainikeId, nimi: nimi });
  });
});

// Hakee "sisalto"-tietueiden asetukset
app.get('/api/get-sisalto-options', (req, res) => {
  try {
    Data.haeSisaltoOptions((err, sisaltoOptions) => {
      if (err) {
        console.error('Virhe haettaessa sisällön asetuksia:', err);
        res.status(500).json({ error: 'Sisäinen palvelinvirhe' });
        return;
      }
      res.json(sisaltoOptions);
    });
  } catch (error) {
    console.error('Virhe haettaessa sisällön asetuksia:', error);
    res.status(500).json({ error: 'Sisäinen palvelinvirhe' });
  }
});

// Päivittää "painike"-tietueen tietyn ID:n perusteella
app.put('/api/edit-painike/:id', async (req, res) => {
  const { id } = req.params;
  const { nimi, destinationId } = req.body;
  try {
    const updatedPainike = await Data.editPainike(id, nimi, destinationId);
    console.log('Painike päivitetty onnistuneesti:', updatedPainike);
    res.json(updatedPainike);
  } catch (err) {
    console.error('Virhe painikkeen päivittämisessä:', err);
    res.status(500).json({ error: 'Sisäinen palvelinvirhe' });
  }
});

// Poistaa "painike"-tietueen tietyn ID:n perusteella
app.delete('/api/delete-painike/:id', (req, res) => {
  const { id } = req.params;
  Data.deletePainike(id, (err, deletedPainike) => {
    if (err) {
      console.error('Virhe poistettaessa painiketta:', err);
      res.status(500).json({ error: 'Sisäinen palvelinvirhe' });
      return;
    }
    console.log('Painike poistettu onnistuneesti:', deletedPainike);
    res.json(deletedPainike);
  });
});

// Hakee "kentta"-sisällön tietyn "otsikko"-tietueen ID:n perusteella
app.get('/api/get-kentta-content/:otsikkoId', (req, res) => {
  const { otsikkoId } = req.params;
  Data.getKenttaContent(parseInt(otsikkoId, 10), (err, kenttaContent) => {
    if (err) {
      console.error('Virhe haettaessa kenttäsisältöä:', err);
      res.status(500).json({ error: 'Sisäinen palvelinvirhe' });
      return;
    }
    if (kenttaContent !== null) {
      res.json({ kentta: kenttaContent });
    } else {
      res.status(404).json({ error: 'Otsikkoa ei löydy' });
    }
  });
});

// Asetukset tiedostojen tallennukselle
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

// Lataa kuvan palvelimelle ja palauttaa sen URL:n
app.post('/api/upload-image', upload.single('image'), (req, res) => {
  try {
    const imageUrl = `http://localhost:${port}/${req.file.path}`;
    res.json({ url: imageUrl });
  } catch (error) {
    console.error('Virhe kuvan lataamisessa:', error);
    res.status(500).json({ error: 'Kuvan lataus epäonnistui' });
  }
});

// Hakee kaikki kysymykset
app.get('/api/questions', (req, res) => {
  Data.SelectFromQuestions((err, data) => {
    if (err) {
      console.error('Virhe datan hakemisessa:', err);
      res.status(500).json({ error: 'Sisäinen palvelinvirhe' });
      return;
    }
    res.json(data);
  });
});

// Hakee "vastaus"-tietueet
app.get('/api/vastaus', (req, res) => {
  Data.SelectFromQuestionsAnswers((err, data) => {
    if (err) {
      console.error('Virhe datan hakemisessa:', err);
      res.status(500).json({ error: 'Sisäinen palvelinvirhe' });
      return;
    }
    res.json(data);
  });
});

// Hakee kaikki vastaukset
app.get('/api/answers', (req, res) => {
  Data.SelectAllAnswers((err, data) => {
    if (err) {
      console.error('Virhe datan hakemisessa:', err);
      res.status(500).json({ error: 'Sisäinen palvelinvirhe' });
      return;
    }
    res.json(data);
  });
});

// Suorittaa matriisin kyselyn
app.post('/api/matrix/query', (req, res) => {
  const { sql } = req.body;

  Data.ExecuteMatrixQuery(sql, (err, data) => {
    if (err) {
      console.error('Virhe matriisin kyselyn suorittamisessa:', err);
      res.status(500).json({ error: 'Sisäinen palvelinvirhe' });
      return;
    }
    res.json(data);
  });
});

app.listen(port, () => {
  console.log(`Palvelin on käynnissä portissa ${port}`);
});
