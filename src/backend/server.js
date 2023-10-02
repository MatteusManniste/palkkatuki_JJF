const express = require('express');
const cors = require('cors');
const multer = require('multer');
const app = express();
const port = process.env.PORT || 3001;

const Data = require('./data');

app.use(express.json());
app.use(cors());
const corsOptions = {
  origin: 'http://localhost:3000',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
};

app.use(cors(corsOptions));

// API-reitit

app.get('/api/runko', (req, res) => {
  try {
    Data.SelectFromRunko((err, result) => {
      if (err) {
        console.error('Error fetching runkos:', err);
        res.status(500).json({ error: 'Internal Server Error' });
        return;
      }
      res.json(result);
    });
  } catch (error) {
    console.error('Error fetching runkos:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/api/runko/:runkoId', (req, res) => {
  const { runkoId } = req.params;
  Data.SelectFromRunkoById(runkoId, (err, runkoData) => {
    if (err) {
      res.status(500).json({ error: 'Internal Server Error' });
      return;
    }
    res.json(runkoData);
  });
});

app.delete('/api/delete-title/:id', (req, res) => {
  const { id } = req.params;
  Data.deleteNimikeById(id, (err, result) => {
    if (err) {
      console.error('Error deleting Nimike:', err);
      res.status(500).json({ error: 'Internal Server Error' });
      return;
    }
    if (result.affectedRows === 0) {
      res.status(404).json({ error: 'Nimike not found' });
      return;
    }
    console.log('Nimike deleted successfully');
    res.status(204).send();
  });
});

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

app.get('/api/get-new-title', (req, res) => {
  Data.SelectNimikeFromRunko((err, title) => {
    if (err) {
      console.error('Error retrieving new title:', err);
      res.status(500).json({ error: 'Internal Server Error' });
      return;
    }
    res.json({ title });
  });
});

app.post('/api/create-title', (req, res) => {
  const { text } = req.body;
  Data.insertTitle(text, (err, result) => {
    if (err) {
      console.error('Error creating title:', err);
      res.status(500).json({ error: 'Internal Server Error' });
      return;
    }
    const newTitleId = result.insertId;
    console.log('Title inserted successfully with ID:', newTitleId);
    res.json({ id: newTitleId });
  });
});

app.put('/api/update-otsikko/:id', (req, res) => {
  const { id } = req.params;
  const { text } = req.body;
  Data.updateOtsikko(id, text, (err, result) => {
    if (err) {
      console.error('Error updating otsikko:', err);
      res.status(500).json({ error: 'Internal Server Error' });
      return;
    }
    res.json({ message: 'Otsikko updated successfully' });
  });
});

app.put('/api/update-title/:id', (req, res) => {
  const { id } = req.params;
  const { newText } = req.body;
  Data.updateTitle(id, newText, (err, result) => {
    if (err) {
      console.error('Error updating title:', err);
      res.status(500).json({ error: 'Internal Server Error' });
      return;
    }
    res.json({ message: 'Title updated successfully' });
  });
});

app.get('/api/get-otsikko/:runko_id', (req, res) => {
  const { runko_id } = req.params;
  Data.getOtsikkoByRunkoId(runko_id, (err, data) => {
    if (err) {
      console.error('Error retrieving otsikko data:', err);
      res.status(500).json({ error: 'Internal Server Error' });
      return;
    }
    res.json(data);
  });
});

app.post('/api/create-otsikko', (req, res) => {
  const { text, runko_id } = req.body;
  Data.createOrUpdateOtsikko(text, runko_id, (err, result, otsikkoIds) => {
    if (err) {
      console.error('Error creating/updating otsikko:', err);
      res.status(500).json({ error: 'Internal Server Error' });
      return;
    }

    console.log(result);
    res.json({ message: result, otsikkoIds });
  });
});

const { updateOtsikkoOrder } = require('./data');
app.put('/api/update-otsikko-order', async (req, res) => {
  const otsikkos = req.body;
  try {
    await updateOtsikkoOrder(otsikkos);
    res.status(200).json({ message: 'Otsikko order updated successfully' });
  } catch (error) {
    console.error('Error updating otsikko order:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/delete-otsikko/:id', (req, res) => {
  const otsikkoId = req.params.id;
  try {
    Data.deleteOtsikko(otsikkoId, (err, result) => {
      if (err) {
        console.error('Error deleting otsikko:', err);
        res.status(500).json({ error: 'Internal Server Error' });
        return;
      }
      if (result.affectedRows > 0) {
        res.json({ message: 'Otsikko deleted successfully' });
      } else {
        res.status(404).json({ error: 'Otsikko not found' });
      }
    });
  } catch (error) {
    console.error('Error handling delete request:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


app.post('/api/save-rich-text/:id', async (req, res) => {
  const { id } = req.params;
  const { richText } = req.body;
  try {
    console.log('Received richText data on the server:', richText);
    Data.updateRichTextForOtsikko(id, richText, (err, result) => {
      if (err) {
        console.error('Error updating rich text content for otsikko:', err);
        res.status(500).json({ error: 'Internal server error' });
        return;
      }
      res.status(200).json({ message: 'Rich text content saved successfully' });
    });
  } catch (error) {
    console.error('Error saving rich text content:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/create-painike', (req, res) => {
  const { sisaltoId, nimi, destinationId } = req.body;
  Data.insertPainike(sisaltoId, nimi, destinationId, (err, result) => {
    if (err) {
      console.error('Error creating painike:', err);
      res.status(500).json({ error: 'Internal Server Error' });
      return;
    }
    const newPainikeId = result.insertId;
    console.log('Painike inserted successfully with ID:', newPainikeId);
    res.json({ id: newPainikeId, nimi: nimi });
  });
});

app.get('/api/get-sisalto-options', (req, res) => {
  try {
    Data.haeSisaltoOptions((err, sisaltoOptions) => {
      if (err) {
        console.error('Error fetching sisalto options:', err);
        res.status(500).json({ error: 'Internal Server Error' });
        return;
      }
      res.json(sisaltoOptions);
    });
  } catch (error) {
    console.error('Error fetching sisalto options:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.put('/api/edit-painike/:id', async (req, res) => {
  const { id } = req.params;
  const { nimi, destinationId } = req.body;
  try {
    const updatedPainike = await Data.editPainike(id, nimi, destinationId);
    console.log('Painike edited successfully:', updatedPainike);
    res.json(updatedPainike);
  } catch (err) {
    console.error('Error editing Painike:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.delete('/api/delete-painike/:id', (req, res) => {
  const { id } = req.params;
  Data.deletePainike(id, (err, deletedPainike) => {
    if (err) {
      console.error('Error deleting Painike:', err);
      res.status(500).json({ error: 'Internal Server Error' });
      return;
    }
    console.log('Painike deleted successfully:', deletedPainike);
    res.json(deletedPainike);
  });
});

app.get('/api/get-kentta-content/:otsikkoId', (req, res) => {
  const { otsikkoId } = req.params;
  Data.getKenttaContent(parseInt(otsikkoId, 10), (err, kenttaContent) => {
    if (err) {
      console.error('Error fetching kentta content:', err);
      res.status(500).json({ error: 'Internal Server Error' });
      return;
    }
    if (kenttaContent !== null) {
      res.json({ kentta: kenttaContent });
    } else {
      res.status(404).json({ error: 'Otsikko not found' });
    }
  });
});

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

app.post('/api/upload-image', upload.single('image'), (req, res) => {
  try {
    const imageUrl = `http://localhost:${port}/${req.file.path}`;
    res.json({ url: imageUrl });
  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).json({ error: 'Image upload failed' });
  }
});


app.listen(port, () => {
  console.log(`Palvelin on käynnissä portissa ${port}`);
});
