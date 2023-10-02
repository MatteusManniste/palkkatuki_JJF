const mysql = require('mysql');

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'palkkatuki',
});

db.connect((err) => {
  if (err) {
    console.error('Virhe yhdistettäessä MySQL-tietokantaan:', err);
    return;
  }
  console.log('Yhdistetty MySQL-tietokantaan');
});

// ----- HAKUFUNKTIOT -----

const SelectFromRunko = (callback) => {
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

const SelectFromRunkoById = (runkoId, callback) => {
  const sql = 'SELECT * FROM runko WHERE id = ?';
  const values = [runkoId];
  db.query(sql, values, (err, result) => {
    if (err) {
      console.error('Error fetching runko by ID:', err);
      callback(err, null);
      return;
    }
    if (result.length === 0) {
      callback(null, null);
      return;
    }
    const runkoData = result[0];
    callback(null, runkoData);
  })
}

const SelectFromSisaltoByRunkoId = (runkoId, callback) => {
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

const SelectFromSisaltoByOtsikko = (otsikko, callback) => {
  const sql = 'SELECT id, otsikko, kentta FROM sisalto WHERE otsikko = ?';
  db.query(sql, [otsikko], (err, tulokset) => {
    if (err) {
      console.error('Virhe sisällön hakemisessa:', err);
      callback(err, null);
      return;
    }
    callback(null, tulokset[0]);
  });
};

const SelectFromPainikeBySisaltoId = (sisaltoId, callback) => {
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

function SelectFromSisaltoById(id, callback) {
  const kysely = `SELECT * FROM sisalto WHERE id = ?`;
  db.query(kysely, [id], (virhe, tulokset) => {
    if (virhe) {
      callback(virhe, null);
      return;
    }
    const data = tulokset[0] || null;
    callback(null, data);
  });
}

const SelectNimikeFromRunko = (callback) => {
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

const SelectFromSisalto= (callback) => {
  const sql = 'SELECT otsikko FROM sisalto ORDER BY id DESC LIMIT 1';
  db.query(sql, (err, result) => {
    if (err) {
      callback(err, null);
      return;
    }
    callback(null, result[0] || null);
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


// ----- LISÄYSFUNKTIOT -----

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

const createOrUpdateOtsikko = (text, runko_id, callback) => {
  const insertSql = 'INSERT INTO sisalto (otsikko, runko_id) VALUES (?, ?)';
  db.query(insertSql, [text, runko_id], (err) => {
    if (err) {
      callback(err, null);
      return;
    }
    callback(null, 'Otsikko created successfully');
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
  const sql = 'SELECT s.id, s.runko_id, s.otsikko, r.nimike AS runko_nimi FROM sisalto AS s JOIN runko AS r ON s.runko_id = r.id';
  db.query(sql, (err, tulokset) => {
    if (err) {
      console.error('Error fetching sisalto options:', err);
      callback(err, null);
      return;
    }
    console.log('Sisalto options fetched successfully:', tulokset);
    callback(null, tulokset);
  });
};


const getKenttaContent = (Id, callback) => {
  const sql = 'SELECT kentta FROM sisalto WHERE id = ?';
  db.query(sql, [Id], (err, result) => {
    if (err) {
      console.error('Error fetching kentta content:', err);
      callback(err, null);
      return;
    }
    if (result.length === 0) {
      console.log('Kentta content not found for ID:', Id);
      callback(null, null);
      return;
    }
    const kenttaContent = result[0].kentta;
    console.log('Fetched Kentta Content:', kenttaContent);
    callback(null, kenttaContent);
  });
};
// ----- PÄIVITYSFUNKTIOT -----

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
      const selectSql = 'SELECT * FROM painike WHERE id = ?';
      db.query(selectSql, [id], (selectErr, selectResult) => {
        if (selectErr) {
          console.error('Error fetching updated Painike data:', selectErr);
          reject(selectErr);
          return;
        }
        const updatedPainike = selectResult[0];
        console.log('Updated Painike data:', updatedPainike);
        resolve(updatedPainike);
      });
    });
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

// ----- POISTOFUNKTIOT -----

const deleteNimikeById = (id, callback) => {
  const sql = 'DELETE FROM runko WHERE id = ?';
  const values = [id];
  db.query(sql, values, (err, result) => {
    if (err) {
      console.error('Error deleting Nimike:', err);
      callback(err, null);
      return;
    }
    callback(null, result);
  });
};

const deletePainike = (id, callback) => {
  console.log('Deleting Painike with ID:', id);
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

module.exports = {
  SelectFromRunko,
  SelectFromRunkoById,
  SelectFromSisaltoByRunkoId,
  SelectFromSisaltoByOtsikko,
  SelectFromPainikeBySisaltoId,
  SelectFromSisaltoById,
  SelectNimikeFromRunko,
  SelectFromSisalto,
  haeSisaltoOptions,
  insertTitle,
  updateTitle,
  createOrUpdateOtsikko,
  getOtsikkoByRunkoId,
  updateOtsikko,
  updateOtsikkoOrder,
  deleteOtsikko,
  updateRichTextForOtsikko,
  insertPainike,
  editPainike,
  deletePainike,
  deleteNimikeById,
  getKenttaContent,
};
