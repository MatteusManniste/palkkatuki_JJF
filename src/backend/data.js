const mysql = require('mysql');

// Luo tietokantayhteys
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'palkkatuki',
});

// Yhdistetään tietokantaan
db.connect((err) => {
  if (err) {
    console.error('Virhe yhdistettäessä MySQL-tietokantaan:', err);
    return;
  }
  console.log('Yhdistetty MySQL-tietokantaan');
});

// Hae runkojen tiedot tietokannasta
const haeRunkoData = (callback) => {
  const sql = 'SELECT * FROM runko';

  db.query(sql, (err, tulokset) => {
    if (err) {
      console.error('Virhe datan hakemisessa tietokannasta:', err);
      callback(err, null);
      return;
    }

    callback(null, tulokset);
  });
};

const haeRunkoById = (runkoId, callback) => {
  // Define the SQL query to fetch the runko data based on its ID
  const sql = 'SELECT * FROM runko WHERE id = ?';
  const values = [runkoId];

  // Execute the query
  db.query(sql, values, (err, result) => {
    if (err) {
      console.error('Error fetching runko by ID:', err);
      callback(err, null);
      return;
    }

    if (result.length === 0) {
      // If no runko with the specified ID is found, return null
      callback(null, null);
      return;
    }

    // Extract the runko data from the result
    const runkoData = result[0];

    // You can add additional processing here if needed

    // Return the runko data
    callback(null, runkoData);
  })
}

// Hae sisällön tiedot runko_id:n perusteella
const haeSisaltoDataRunkoIdlla = (runkoId, callback) => {
  const sql = 'SELECT * FROM sisalto WHERE runko_id = ?  ORDER BY jarjestysNro ASC';

  db.query(sql, [runkoId], (err, tulokset) => {
    if (err) {
      console.error('Virhe sisällön hakemisessa:', err);
      callback(err, null);
      return;
    }

    callback(null, tulokset);
  });
};

// Hae sisällön tiedot otsikon perusteella
const haeSisaltoDataOtsikolla = (otsikko, callback) => {
  const sql = 'SELECT id, otsikko, kentta FROM sisalto WHERE otsikko = ?';

  db.query(sql, [otsikko], (err, tulokset) => {
    if (err) {
      console.error('Virhe sisällön hakemisessa:', err);
      callback(err, null);
      return;
    }

    callback(null, tulokset[0]); // Lähetä ensimmäinen tulos (olettaen, että otsikko on uniikki)
  });
};

// Lisää uusi funktio painikkeiden hakemiseksi sisalto_id:n perusteella
const haePainikkeetSisaltoIdlla = (sisaltoId, callback) => {
  const sql = 'SELECT * FROM painike WHERE sisalto_id = ?';

  db.query(sql, [sisaltoId], (err, tulokset) => {
    if (err) {
      console.error('Virhe painikkeiden hakemisessa sisalto_id:n perusteella:', err);
      callback(err, null);
      return;
    }

    callback(null, tulokset);
  });
};

// Hae sisällön tiedot id:n perusteella
function haeSisaltoDataIdlla(id, callback) {
  const kysely = `SELECT * FROM sisalto WHERE id = ?`;

  // Suorita kysely annetulla 'id':llä
  db.query(kysely, [id], (virhe, tulokset) => {
    if (virhe) {
      callback(virhe, null);
      return;
    }
    const data = tulokset[0] || null;
    callback(null, data);
  });
}

const getNewTitle = (callback) => {
  const sql = 'SELECT nimike FROM runko ORDER BY id DESC LIMIT 1';

  db.query(sql, (err, result) => {
    if (err) {
      console.error('Error retrieving new title:', err);
      callback(err, null);
      return;
    }

    callback(null, result[0] ? result[0].nimike : '');
  });
};

const getOtsikko = (callback) => {
  const sql = 'SELECT otsikko FROM sisalto ORDER BY id DESC LIMIT 1';

  db.query(sql, (err, result) => {
    if (err) {
      callback(err, null);
      return;
    }

    callback(null, result[0] || null);
  });
};

// LÄHETYS //

const insertTitle = (titleText, callback) => {
  const sql = 'INSERT INTO runko (nimike) VALUES (?)';

  db.query(sql, [titleText], (err, result) => {
    if (err) {
      console.error('Error inserting title:', err);
      callback(err, null);
      return;
    }

    callback(null, result);
  });
};


// PÄIVITYS //

const updateTitle = (id, newText, callback) => {
  const sql = 'UPDATE runko SET nimike = ? WHERE id = ?';

  db.query(sql, [newText, id], (err, result) => {
    if (err) {
      console.error('Error updating title:', err);
      callback(err, null);
      return;
    }

    callback(null, result);
  });
};

const createOrUpdateOtsikko = (text, runko_id, callback) => {
  // Insert a new otsikko into the "sisalto" table
  const insertSql = 'INSERT INTO sisalto (otsikko, runko_id) VALUES (?, ?)';
  db.query(insertSql, [text, runko_id], (err) => {
    if (err) {
      callback(err, null);
      return;
    }

    callback(null, 'Otsikko created successfully');
  });
};


const getOtsikkoByRunkoId = (runko_id, callback) => {
  const sql = 'SELECT id, otsikko, jarjestysNro FROM sisalto WHERE runko_id = ? ORDER BY jarjestysNro ASC';

  db.query(sql, [runko_id], (err, result) => {
    if (err) {
      callback(err, null);
      return;
    }

    callback(null, result);
  });
};


const updateOtsikko = (id, text, callback) => {
  const sql = 'UPDATE sisalto SET otsikko = ? WHERE id = ?';

  db.query(sql, [text, id], (err, result) => {
    if (err) {
      console.error('Error updating otsikko:', err);
      callback(err, null);
      return;
    }

    callback(null, result);
  });
};

const updateOtsikkoOrder = async (otsikkos) => {
  try {
    const updateQueries = otsikkos.map((otsikko) => {
      return db.query(
        'UPDATE sisalto SET jarjestysNro = ? WHERE id = ?',
        [otsikko.order, otsikko.id]
      );
    });

    await Promise.all(updateQueries);
  } catch (error) {
    throw error;
  }
};

const deleteOtsikko = (otsikkoId, callback) => {
  const sql = 'DELETE FROM sisalto WHERE id = ?';

  db.query(sql, [otsikkoId], (err, result) => {
    if (err) {
      console.error('Error deleting otsikko from the database:', err);
      callback(err, null);
      return;
    }

    callback(null, result);
  });
};

const updateRichTextForOtsikko = (otsikkoId, richText, callback) => {
  const sql = 'UPDATE sisalto SET kentta = ? WHERE id = ?';
  console.log('Rich Text:', richText);

  db.query(sql, [richText, otsikkoId], (err, result) => {
    if (err) {
      console.error('Error updating rich text content for otsikko:', err);
      callback(err, null);
      return;
    }

    callback(null, result);
  });
};

const insertPainike = (sisaltoId, nimi, destinationId, callback) => {
  const sql = 'INSERT INTO painike (sisalto_id, nimi, destination_id) VALUES (?, ?, ?)';

  db.query(sql, [sisaltoId, nimi, destinationId], (err, result) => {
    if (err) {
      console.error('Error inserting painike:', err);
      callback(err, null);
      return;
    }

    callback(null, result);
  });
};

const haeSisaltoOptions = (callback) => {
  const sql = 'SELECT id, otsikko FROM sisalto';

  db.query(sql, (err, tulokset) => {
    if (err) {
      console.error('Error fetching sisalto options:', err);
      callback(err, null);
      return;
    }

    console.log('Sisalto options fetched successfully:', tulokset); // Add this line for logging
    callback(null, tulokset);
  });
};

const editPainike = async (id, nimi, destinationId) => {
  console.log('Received data for editing Painike:', { id, nimi, destinationId });

  const updateSql = 'UPDATE painike SET nimi = ?, destination_id = ? WHERE id = ?';
  const updateValues = [nimi, destinationId, id];

  return new Promise((resolve, reject) => {
    db.query(updateSql, updateValues, (err, result) => {
      if (err) {
        console.error('Error editing Painike:', err);
        reject(err);
        return;
      }

      console.log('Painike edited successfully. Result:', result);

      // Fetch the updated Painike data
      const selectSql = 'SELECT * FROM painike WHERE id = ?';
      db.query(selectSql, [id], (selectErr, selectResult) => {
        if (selectErr) {
          console.error('Error fetching updated Painike data:', selectErr);
          reject(selectErr);
          return;
        }

        const updatedPainike = selectResult[0]; // Assuming it returns a single row

        console.log('Updated Painike data:', updatedPainike);
        resolve(updatedPainike);
      });
    });
  });
};

const deletePainike = (id, callback) => {
  console.log('Deleting Painike with ID:', id);

  // Execute a SQL query to delete the Painike by its ID
  const sql = 'DELETE FROM painike WHERE id = ?';
  const values = [id];

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error('Error deleting Painike:', err);
      callback(err, null);
      return;
    }

    console.log('Painike deleted successfully. Result:', result);

    callback(null, result);
  });
};

const deleteNimikeById = (id, callback) => {
  // Define the SQL query to delete the nimike by its ID
  const sql = 'DELETE FROM runko WHERE id = ?';
  const values = [id];

  // Execute the query
  db.query(sql, values, (err, result) => {
    if (err) {
      console.error('Error deleting Nimike:', err);
      callback(err, null);
      return;
    }

    // Return the result, which contains information about the deletion (affectedRows)
    callback(null, result);
  });
};

// Import any necessary dependencies (e.g., mysql)

// Define the function to get kentta content by otsikko ID
const getKenttaContent = (Id, callback) => {
  // Define the SQL query to fetch kentta content based on otsikkoId
  const sql = 'SELECT kentta FROM sisalto WHERE id = ?';

  // Execute the query
  db.query(sql, [Id], (err, result) => {
    if (err) {
      console.error('Error fetching kentta content:', err);
      callback(err, null);
      return;
    }

    if (result.length === 0) {
      // If no kentta content is found, return null
      console.log('Kentta content not found for ID:', Id);
      callback(null, null);
      return;
    }

    // Extract the kentta content from the result
    const kenttaContent = result[0].kentta;

    // Log the fetched kentta content
    console.log('Fetched Kentta Content:', kenttaContent);

    // Return the kentta content
    callback(null, kenttaContent);
  });
};


module.exports = {
  haeRunkoData,
  haeRunkoById,
  haeSisaltoDataIdlla,
  haeSisaltoDataRunkoIdlla,
  haeSisaltoDataOtsikolla,
  haePainikkeetSisaltoIdlla,
  getNewTitle,
  insertTitle,
  updateTitle,
  getOtsikko,
  createOrUpdateOtsikko,
  getOtsikkoByRunkoId,
  updateOtsikko,
  updateOtsikkoOrder,
  deleteOtsikko,
  updateRichTextForOtsikko,
  insertPainike,
  haeSisaltoOptions,
  editPainike,
  deletePainike,
  deleteNimikeById,
  getKenttaContent,
};
