const express = require('express');
const cors = require('cors');
const multer = require('multer');
const app = express();
const port = process.env.PORT || 3001;

// Tuodaan Data.js-moduuli
const Data = require('./data');

// Käytä JSON-muotoista dataa ja salli CORS
app.use(express.json());
app.use(cors());
const corsOptions = {
  origin: 'http://localhost:3000', // Replace with the URL of your React app
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true, // Enable credentials (cookies, authorization headers, etc.)
};

app.use(cors(corsOptions));




// Määritellään API-reitit

// Hae tiedot 'runko'-taulusta Data-komponentin avulla
app.get('/api/runko', (req, res) => {
  try {
    // Use the Data module to fetch runkos and order them by jarjestysNro
    Data.haeRunkoData((err, result) => {
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

  // Fetch runko data based on the runkoId
  Data.haeRunkoById(runkoId, (err, runkoData) => {
    if (err) {
      // Handle errors
      res.status(500).json({ error: 'Internal Server Error' });
      return;
    }

    // Send the fetched runko data as a response without modifying it
    res.json(runkoData);
  });
});

app.delete('/api/delete-title/:id', (req, res) => {
  const { id } = req.params;

  // Call the function to delete the nimike by its ID
  Data.deleteNimikeById(id, (err, result) => {
    if (err) {
      console.error('Error deleting Nimike:', err);
      res.status(500).json({ error: 'Internal Server Error' });
      return;
    }

    if (result.affectedRows === 0) {
      // If no nimike with the specified ID is found, return an error
      res.status(404).json({ error: 'Nimike not found' });
      return;
    }

    // Nimike deleted successfully
    console.log('Nimike deleted successfully');
    res.status(204).send(); // Send a 204 No Content response
  });
});

// API-piste sisältötietojen noutamiseen 'otsikko'-parametrin perusteella
app.get('/api/sisalto/:otsikko', (req, res) => {
  const { otsikko } = req.params;

  // Hae tiedot 'sisalto'-taulusta Data-komponentin avulla
  Data.haeSisaltoDataOtsikolla(otsikko, (err, data) => {
    if (err) {
      // Käsittele virheet ja kirjaa ne
      console.error('Virhe sisällön noutamisessa:', err);
      res.status(500).json({ error: 'Sisäinen palvelinvirhe' });
      return;
    }

    // Lähetä haetut tiedot JSON-vastauksena
    res.json(data);
  });
});

// API-piste sisältötietojen noutamiseen 'runkoId'-parametrin perusteella
app.get('/api/sisalto/runko/:runkoId', (req, res) => {
  const { runkoId } = req.params;

  // Hae tiedot 'sisalto'-taulusta Data-komponentin avulla
  Data.haeSisaltoDataRunkoIdlla(runkoId, (err, data) => {
    if (err) {
      // Käsittele virheet
      res.status(500).json({ error: 'Sisäinen palvelinvirhe' });
      return;
    }

    // Lähetä haetut tiedot JSON-vastauksena
    res.json(data);
  });
});

// API-piste painiketietojen noutamiseen 'sisaltoId'-parametrin perusteella
app.get('/api/painike/:sisaltoId', (req, res) => {
  const { sisaltoId } = req.params;

  // Hae tiedot 'painike'-taulusta Data-komponentin avulla
  Data.haePainikkeetSisaltoIdlla(sisaltoId, (err, data) => {
    if (err) {
      // Käsittele virheet
      res.status(500).json({ error: 'Sisäinen palvelinvirhe' });
      return;
    }

    // Lähetä haetut tiedot JSON-vastauksena
    res.json(data);
  });
});

// API-piste sisältötietojen noutamiseen 'id'-parametrin perusteella
app.get('/api/sisalto/id/:id', (req, res) => {
  const { id } = req.params;

  // Hae tiedot 'sisalto'-taulusta Data-komponentin avulla
  Data.haeSisaltoDataIdlla(id, (err, data) => {
    if (err) {
      // Käsittele virheet ja kirjaa ne
      console.error('Virhe sisällön noutamisessa:', err);
      res.status(500).json({ error: 'Sisäinen palvelinvirhe' });
      return;
    }

    // Lähetä haetut tiedot JSON-vastauksena
    res.json(data);
  });
});

app.get('/api/get-new-title', (req, res) => {
  Data.getNewTitle((err, title) => {
    if (err) {
      console.error('Error retrieving new title:', err);
      res.status(500).json({ error: 'Internal Server Error' });
      return;
    }

    res.json({ title });
  });
});



// POST FEATURES

// POST FEATURES

app.post('/api/create-title', (req, res) => {
  const { text } = req.body;

  // Call the insertTitle function to insert the title into the database
  Data.insertTitle(text, (err, result) => {
    if (err) {
      // Handle errors
      console.error('Error creating title:', err);
      res.status(500).json({ error: 'Internal Server Error' });
      return;
    }

    const newTitleId = result.insertId; // Assuming result contains the new title's ID

    console.log('Title inserted successfully with ID:', newTitleId);

    res.json({ id: newTitleId }); // Send the new title's ID in the response
  });
});


// UPDATE FEATURES

app.put('/api/update-otsikko/:id', (req, res) => {
  const { id } = req.params;
  const { text } = req.body;

  // Update the otsikko in your database using the provided id
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
  const { id } = req.params; // Change from Id to id
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

  // Hae tiedot 'sisalto'-taulusta Data-komponentin avulla
  Data.getOtsikkoByRunkoId(runko_id, (err, data) => {
    if (err) {
      console.error('Error retrieving otsikko data:', err);
      res.status(500).json({ error: 'Internal Server Error' });
      return;
    }

    res.json(data);
  });
});


// API endpoint to create or update otsikko
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
  const otsikkos = req.body; // Assuming the request body contains the updated otsikko order

  try {
    // Call the updateOtsikkoOrder function to update the database
    await updateOtsikkoOrder(otsikkos);

    // Respond with a success message or status
    res.status(200).json({ message: 'Otsikko order updated successfully' });
  } catch (error) {
    // Handle errors and respond with an error message
    console.error('Error updating otsikko order:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/delete-otsikko/:id', (req, res) => {
  const otsikkoId = req.params.id;

  try {
    // Call the deleteOtsikko function to delete the otsikko by its ID
    Data.deleteOtsikko(otsikkoId, (err, result) => {
      if (err) {
        console.error('Error deleting otsikko:', err);
        res.status(500).json({ error: 'Internal Server Error' });
        return;
      }

      // Check if any rows were affected (indicating successful deletion)
      if (result.affectedRows > 0) {
        // Respond with a success message
        res.json({ message: 'Otsikko deleted successfully' });
      } else {
        // Respond with a not found message if no rows were affected
        res.status(404).json({ error: 'Otsikko not found' });
      }
    });
  } catch (error) {
    // Handle errors and respond with an error message
    console.error('Error handling delete request:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


app.post('/api/save-rich-text/:id', async (req, res) => {
  const { id } = req.params;
  const { richText } = req.body;

  try {
    console.log('Received richText data on the server:', richText);
    // Update the "kentta" column with the rich text content
    Data.updateRichTextForOtsikko(id, richText, (err, result) => {
      if (err) {
        console.error('Error updating rich text content for otsikko:', err);
        res.status(500).json({ error: 'Internal server error' });
        return;
      }

      // Respond with a success message or status
      res.status(200).json({ message: 'Rich text content saved successfully' });
    });
  } catch (error) {
    // Handle errors and respond with an error message
    console.error('Error saving rich text content:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/create-painike', (req, res) => {
  const { sisaltoId, nimi, destinationId } = req.body;

  // Call the insertPainike function to insert the painike into the database
  Data.insertPainike(sisaltoId, nimi, destinationId, (err, result) => {
    if (err) {
      // Handle errors
      console.error('Error creating painike:', err);
      res.status(500).json({ error: 'Internal Server Error' });
      return;
    }

    const newPainikeId = result.insertId; // Assuming result contains the new painike's ID

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

      // Send sisaltoOptions in the response instead of wrapping it in an object
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

  // Call a function in your data module to delete the Painike by ID
  Data.deletePainike(id, (err, deletedPainike) => {
    if (err) {
      console.error('Error deleting Painike:', err);
      res.status(500).json({ error: 'Internal Server Error' });
      return;
    }

    console.log('Painike deleted successfully:', deletedPainike);

    res.json(deletedPainike); // Return the deleted Painike object
  });
});

app.get('/api/get-kentta-content/:otsikkoId', (req, res) => {
  const { otsikkoId } = req.params;
  
  // Call the getKenttaContent function with a callback
  Data.getKenttaContent(parseInt(otsikkoId, 10), (err, kenttaContent) => {
    if (err) {
      // Handle the error if there's an issue with the database query
      console.error('Error fetching kentta content:', err);
      res.status(500).json({ error: 'Internal Server Error' });
      return;
    }

    if (kenttaContent !== null) {
      // Return the kentta content if found
      res.json({ kentta: kenttaContent });
    } else {
      // Otsikko not found
      res.status(404).json({ error: 'Otsikko not found' });
    }
  });
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Specify the directory where files will be stored
  },
  filename: (req, file, cb) => {
    // Generate a unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

// Handle image uploads
app.post('/api/upload-image', upload.single('image'), (req, res) => {
  try {
    const imageUrl = `http://localhost:${port}/${req.file.path}`;
    res.json({ url: imageUrl });
  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).json({ error: 'Image upload failed' });
  }
});







// Käynnistä palvelin
app.listen(port, () => {
  console.log(`Palvelin on käynnissä portissa ${port}`);
});
