const mysql = require('mysql');
const ExcelJS = require('exceljs');

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'palkkatuki',
});
// Yhdistä MySQL-tietokantaan
db.connect((err) => {
  if (err) {
    console.error('Virhe yhdistettäessä MySQL-tietokantaan:', err);
    return;
  }
  console.log('Yhdistetty MySQL-tietokantaan');
});

async function dropMatrixTable() {
  const dropTableQuery = 'DROP TABLE matrix';
  return new Promise((resolve) => {
    db.query(dropTableQuery, (dropTableError) => {
      if (dropTableError) {
        console.error('Virhe taulukon poistossa:', dropTableError);
        resolve(false);
      } else {
        console.log('Taulukko "matrix" poistettu');
        resolve(true);
      }
    });
  });
}

async function recreateMatrixTable() {
  const recreateTableQuery = 'CREATE TABLE matrix (id INT AUTO_INCREMENT PRIMARY KEY)';
  return new Promise((resolve) => {
    db.query(recreateTableQuery, (recreateTableError) => {
      if (recreateTableError) {
        console.error('Virhe taulukon luomisessa:', recreateTableError);
        resolve(false);
      } else {
        console.log('Taulukko "matrix" uudelleenluotu');
        resolve(true);
      }
    });
  });
}

async function truncateAnswersTable() {
  try {
    const truncateAnswersQuery = 'TRUNCATE TABLE answers';
    await new Promise((resolve) => {
      db.query(truncateAnswersQuery, (truncateError) => {
        if (truncateError) {
          console.error('Virhe "answers" taulukon tyhjentämisessä:', truncateError);
          resolve(false);
        } else {
          console.log('Answers-taulukko tyhjennetty.');
          resolve(true);
        }
      });
    });
  } catch (error) {
    console.error('Tapahtui virhe:', error);
  }
}

async function truncateQuestionsTable() {
  try {
    const truncateQuestionsQuery = 'TRUNCATE TABLE questions';
    await new Promise((resolve) => {
      db.query(truncateQuestionsQuery, (truncateError) => {
        if (truncateError) {
          console.error('Virhe "questions" taulukon tyhjentämisessä:', truncateError);
          resolve(false);
        } else {
          console.log('Questions-taulukko tyhjennetty.');
          resolve(true);
        }
      });
    });
  } catch (error) {
    console.error('Tapahtui virhe:', error);
  }
}

async function insertQuestionsAndAnswersIntoQuestionsTable(questions, answers) {
  try {
    const values = [
      ...questions.map((question) => [null, question, "Kysymys"]),
      ...answers.map((answer) => [null, answer, "Vastaus"]),
    ];

    const insertQuery = 'INSERT INTO questions (id, text, type) VALUES ?';

    await new Promise((resolve) => {
      db.query(insertQuery, [values], (insertError) => {
        if (insertError) {
          console.error('Error inserting questions and answers into questions table:', insertError);
          resolve(false);
        } else {
          console.log('Questions and answers inserted into questions table');
          resolve(true);
        }
      });
    });
  } catch (error) {
    console.error('Error inserting questions and answers into questions table:', error);
  }
}
      async function insertAnswerOption(optionText, questionIndex, optionIndex) {
        if (optionText !== null && optionText !== '') {
          const insertAnswerQuery = 'INSERT INTO answers (option_text, question_id) VALUES (?, ?)';
          db.query(insertAnswerQuery, [optionText, questionIndex + 1], (insertError) => {
            if (insertError) {
              console.error(`Virhe vastausvaihtoehdon lisäämisessä kysymykselle ${questionIndex + 1}, vaihtoehto ${optionIndex}:`, insertError);
            } else {
              console.log(`Vastausvaihtoehto ${optionText} lisätty kysymykselle ${questionIndex + 1}`);
            }
          });
        } else {
          console.warn(`Ohitettiin NULL- tai tyhjän vastausvaihtoehdon lisääminen kysymykselle ${questionIndex + 1}, vaihtoehto ${optionIndex}`);
        }
      }

async function fetchAndInsertQuestionsAndAnswersFromExcel() {
  try {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile('matrix.xlsx');
    const worksheet = workbook.getWorksheet(1);

    for (let columnIndex = 1; columnIndex <= worksheet.actualColumnCount; columnIndex++) {
      worksheet.eachRow({ includeEmpty: true }, (row, rowNumber) => {
        if (rowNumber === 1) return;
        const optionText = row.getCell(columnIndex).value;

        insertAnswerOption(optionText, columnIndex - 1, rowNumber - 2);
      });
    }

    console.log('Answers inserted into the database');
  } catch (error) {
    console.error('Error fetching and inserting answers from Excel:', error);
  }
}

async function createMatrixColumns(questions, answers) {
  const newEntries = [];
  let questionIndex = 0;
  let answerIndex = questions.length;

  for (let index = 0; index < questions.length + answers.length; index++) {
    let columnName;

    if (index < questions.length) {
      columnName = `kysymys_${++questionIndex}`;
    } else {
      columnName = `vastaus_${++answerIndex}`;
    }

    const createMatrixColumnQuery = `ALTER TABLE matrix ADD COLUMN ${columnName} VARCHAR(255)`;

    await new Promise((resolve) => {
      db.query(createMatrixColumnQuery, async (createColumnError) => {
        if (createColumnError) {
          console.error('Error creating matrix column:', createColumnError);
          resolve(false);
        } else {
          newEntries.push(columnName);
          console.log(`Matrix column created: ${columnName}`);
          resolve(true);
        }
      });
    });
  }

  return newEntries;
}






async function insertMatrixDataFromExcel(questions, answers) {
  try {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile('matrix.xlsx');
    const worksheet = workbook.getWorksheet(2);

    const insertPromises = [];

    for (let rowIndex = 2; rowIndex <= worksheet.rowCount; rowIndex++) {
      const currentRow = worksheet.getRow(rowIndex);
      const values = [];

      for (let i = 1; i <= questions.length + answers.length; i++) {
        const cellValue = currentRow.getCell(i).value;
        const valueToInsert = cellValue !== null ? cellValue.toString() : null;
        values.push(valueToInsert || null);
      }

      if (values.some((value) => value !== null && value !== '')) {
        // Create column names for insertion
        const columnNames = [
          ...questions.map((_, index) => `kysymys_${index + 1}`),
          ...answers.map((_, index) => `vastaus_${questions.length + index + 1}`) // Start answers after questions
        ].join(', ');

        // Create placeholders for the values
        const placeholders = new Array(values.length).fill('?').join(', ');
        const insertDataQuery = `INSERT INTO matrix (${columnNames}) VALUES (${placeholders})`;

        const insertPromise = new Promise((resolve) => {
          db.query(insertDataQuery, values, (insertDataError) => {
            if (insertDataError) {
              console.error(`Error inserting data for row ${rowIndex}:`, insertDataError);
              resolve(false);
            } else {
              console.log(`Data inserted for row ${rowIndex}`);
              resolve(true);
            }
          });
        });

        insertPromises.push(insertPromise);
      }
    }

    await Promise.all(insertPromises);
    console.log('Matrix data inserted into the database');
  } catch (error) {
    console.error('Error inserting matrix data from Excel:', error);
  }
}

async function Mörönheräys() {
  try {
    const questions = [];
    const answers = [];
    let firstRow;
    let worksheet;
    
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile('matrix.xlsx');
    worksheet = workbook.getWorksheet(2);
    
    worksheet.getRow(1).eachCell((cell) => {
      const question = cell.value;
      if (question.endsWith("?")) {
        questions.push(question);
      } else {
        answers.push(question);
      }
      firstRow = firstRow || worksheet.getRow(1);
    });
    
    await dropMatrixTable();
    await recreateMatrixTable();
    await truncateQuestionsTable();
    await truncateAnswersTable();
    console.log(questions)
    console.log(answers)
    insertQuestionsAndAnswersIntoQuestionsTable(questions, answers);
    fetchAndInsertQuestionsAndAnswersFromExcel()
    await createMatrixColumns(questions, answers)
    insertMatrixDataFromExcel(questions, answers)
  } catch (error) {
    console.error('Virhe Mörönheräyksen aikana:', error);
  }
}


Mörönheräys();

// Kantojen haku

// Hae kaikki tiedot taulukosta "runko"
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

// Hae tiedot taulukosta "runko" ID:n perusteella
const SelectFromRunkoById = (runkoId, callback) => {
  const sql = 'SELECT * FROM runko WHERE id = ?';
  const values = [runkoId];
  db.query(sql, values, (err, result) => {
    if (err) {
      console.error('Virhe datan hakemisessa ID:n perusteella:', err);
      callback(err, null);
      return;
    }
    if (result.length === 0) {
      callback(null, null);
      return;
    }
    const runkoData = result[0];
    callback(null, runkoData);
  });
}

// Hae tiedot taulukosta "sisalto" runko_id:n perusteella järjestyksessä
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

// Hae tiedot taulukosta "sisalto" otsikon perusteella
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

// Hae tiedot taulukosta "painike" sisalto_id:n perusteella
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

// Hae tiedot taulukosta "sisalto" ID:n perusteella
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

// Hae uusin nimike taulukosta "runko"
const SelectNimikeFromRunko = (callback) => {
  const sql = 'SELECT nimike FROM runko ORDER BY id DESC LIMIT 1';
  db.query(sql, (err, result) => {
    if (err) {
      console.error('Virhe uusimman nimikkeen hakemisessa:', err);
      callback(err, null);
      return;
    }
    callback(null, result[0] ? result[0].nimike : '');
  });
};

// Hae uusin otsikko taulukosta "sisalto"
const SelectFromSisalto = (callback) => {
  const sql = 'SELECT otsikko FROM sisalto ORDER BY id DESC LIMIT 1';
  db.query(sql, (err, result) => {
    if (err) {
      callback(err, null);
      return;
    }
    callback(null, result[0] || null);
  });
};

// Hae otsikot runko_id:n perusteella
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

// Lisää uusi nimike taulukkoon "runko"
const insertTitle = (titleText, callback) => {
  const sql = 'INSERT INTO runko (nimike) VALUES (?)';
  db.query(sql, [titleText], (err, result) => {
    if (err) {
      console.error('Virhe nimikkeen lisäämisessä:', err);
      callback(err, null);
      return;
    }
    callback(null, result);
  });
};

// Luo tai päivitä otsikko taulukossa "sisalto"
const createOrUpdateOtsikko = (text, runko_id, callback) => {
  const insertSql = 'INSERT INTO sisalto (otsikko, runko_id) VALUES (?, ?)';
  db.query(insertSql, [text, runko_id], (err) => {
    if (err) {
      callback(err, null);
      return;
    }
    callback(null, 'Otsikko luotu onnistuneesti');
  });
};

// Lisää uusi painike taulukkoon "painike"
const insertPainike = (sisaltoId, nimi, destinationId, callback) => {
  const sql = 'INSERT INTO painike (sisalto_id, nimi, destination_id) VALUES (?, ?, ?)';
  db.query(sql, [sisaltoId, nimi, destinationId], (err, result) => {
    if (err) {
      console.error('Virhe painikkeen lisäämisessä:', err);
      callback(err, null);
      return;
    }
    callback(null, result);
  });
};

// Hae sisältövaihtoehdot
const haeSisaltoOptions = (callback) => {
  const sql = 'SELECT s.id, s.runko_id, s.otsikko, r.nimike AS runko_nimi FROM sisalto AS s JOIN runko AS r ON s.runko_id = r.id';
  db.query(sql, (err, tulokset) => {
    if (err) {
      console.error('Virhe sisältövaihtoehtojen hakemisessa:', err);
      callback(err, null);
      return;
    }
    console.log('Sisältövaihtoehdot haettu onnistuneesti:', tulokset);
    callback(null, tulokset);
  });
};

// Hae kenttäsisu sisältö ID:n perusteella
const getKenttaContent = (Id, callback) => {
  const sql = 'SELECT kentta FROM sisalto WHERE id = ?';
  db.query(sql, [Id], (err, result) => {
    if (err) {
      console.error('Virhe kenttäsisällön hakemisessa:', err);
      callback(err, null);
      return;
    }
    if (result.length === 0) {
      console.log('Kenttäsisältöä ei löytynyt ID:llä:', Id);
      callback(null, null);
      return;
    }
    const kenttaContent = result[0].kentta;
    console.log('Haettu kenttäsisältö:', kenttaContent);
    callback(null, kenttaContent);
  });
};

// Päivitä nimike
const updateTitle = (id, newText, callback) => {
  const sql = 'UPDATE runko SET nimike = ? WHERE id = ?';
  db.query(sql, [newText, id], (err, result) => {
    if (err) {
      console.error('Virhe nimikkeen päivittämisessä:', err);
      callback(err, null);
      return;
    }
    callback(null, result);
  });
};

// Muokkaa painiketta
const editPainike = async (id, nimi, destinationId) => {
  console.log('Saatu tiedot painikkeen muokkaamiseen:', { id, nimi, destinationId });
  const updateSql = 'UPDATE painike SET nimi = ?, destination_id = ? WHERE id = ?';
  const updateValues = [nimi, destinationId, id];
  return new Promise((resolve, reject) => {
    db.query(updateSql, updateValues, (err, result) => {
      if (err) {
        console.error('Virhe painikkeen muokkaamisessa:', err);
        reject(err);
        return;
      }
      console.log('Painiketta on muokattu onnistuneesti. Tulos:', result);
      const selectSql = 'SELECT * FROM painike WHERE id = ?';
      db.query(selectSql, [id], (selectErr, selectResult) => {
        if (selectErr) {
          console.error('Virhe päivitettyjen painiketietojen hakemisessa:', selectErr);
          reject(selectErr);
          return;
        }
        const updatedPainike = selectResult[0];
        console.log('Päivitetyt painiketiedot:', updatedPainike);
        resolve(updatedPainike);
      });
    });
  });
};

// Päivitä rikas tekstisisältö otsikon ID:n perusteella
const updateRichTextForOtsikko = (otsikkoId, richText, callback) => {
  const sql = 'UPDATE sisalto SET kentta = ? WHERE id = ?';
  console.log('Rikas teksti:', richText);
  db.query(sql, [richText, otsikkoId], (err, result) => {
    if (err) {
      console.error('Virhe rikkaan tekstin päivittämisessä otsikolle:', err);
      callback(err, null);
      return;
    }
    callback(null, result);
  });
};

// Päivitä otsikon järjestys
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

// Päivitä otsikko
const updateOtsikko = (id, text, callback) => {
  const sql = 'UPDATE sisalto SET otsikko = ? WHERE id = ?';
  db.query(sql, [text, id], (err, result) => {
    if (err) {
      console.error('Virhe otsikon päivittämisessä:', err);
      callback(err, null);
      return;
    }
    callback(null, result);
  });
};

// Poista nimike ID:n perusteella
const deleteNimikeById = (id, callback) => {
  const sql = 'DELETE FROM runko WHERE id = ?';
  const values = [id];
  db.query(sql, values, (err, result) => {
    if (err) {
      console.error('Virhe nimikkeen poistamisessa:', err);
      callback(err, null);
      return;
    }
    callback(null, result);
  });
};

// Poista painike
const deletePainike = (id, callback) => {
  console.log('Poistetaan painike ID:llä:', id);
  const sql = 'DELETE FROM painike WHERE id = ?';
  const values = [id];
  db.query(sql, values, (err, result) => {
    if (err) {
      console.error('Virhe painikkeen poistamisessa:', err);
      callback(err, null);
      return;
    }
    console.log('Painike on poistettu onnistuneesti. Tulos:', result);
    callback(null, result);
  });
};

// Poista otsikko
const deleteOtsikko = (otsikkoId, callback) => {
  const sql = 'DELETE FROM sisalto WHERE id = ?';
  db.query(sql, [otsikkoId], (err, result) => {
    if (err) {
      console.error('Virhe otsikon poistamisessa tietokannasta:', err);
      callback(err, null);
      return;
    }
    callback(null, result);
  });
};

// Hae kaikki kysymykset tietokannasta
const SelectFromQuestions = (callback) => {
  const sql = 'SELECT * FROM questions WHERE type = "Kysymys"';
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Virhe datan hakemisessa tietokannasta:', err);
      callback(err, null);
      return;
    }
    callback(null, results);
  });
};

// Hae kaikki vastaukset tietokannasta
const SelectFromQuestionsAnswers = (callback) => {
  const sql = 'SELECT * FROM questions WHERE type = "Vastaus"';
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Virhe datan hakemisessa tietokannasta:', err);
      callback(err, null);
      return;
    }
    callback(null, results);
  });
};

// Hae kaikki vastaukset tietokannasta
const SelectAllAnswers = (callback) => {
  const sql = 'SELECT * FROM answers';
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Virhe datan hakemisessa tietokannasta:', err);
      callback(err, null);
      return;
    }
    callback(null, results);
  });
};

// Suorita mukautettu kysely
const ExecuteMatrixQuery = (sql, callback) => {
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Virhe mukautetun kyselyn suorittamisessa:', err);
      callback(err, null);
      return;
    }
    callback(null, results);
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
  getOtsikkoByRunkoId,
  insertTitle,
  createOrUpdateOtsikko,
  insertPainike,
  haeSisaltoOptions,
  getKenttaContent,
  updateTitle,
  editPainike,
  updateRichTextForOtsikko,
  updateOtsikkoOrder,
  updateOtsikko,
  deleteNimikeById,
  deletePainike,
  deleteOtsikko,
  SelectFromQuestions,
  SelectFromQuestionsAnswers,
  SelectAllAnswers,
  ExecuteMatrixQuery,
};
