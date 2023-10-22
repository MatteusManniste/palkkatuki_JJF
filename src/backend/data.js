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
// Luo uusi Excel-työkirja
const workbook = new ExcelJS.Workbook();

try {
  // Lue Excel-tiedosto
  workbook.xlsx.readFile('matrix.xlsx').then(async () => {
    // Hae taulukon toinen työlehti
    const worksheet = workbook.getWorksheet(2);
    const questions = [];
    const types = [];
    const newEntries = [];
    let firstRow;

    // Käy läpi ensimmäinen rivi ja hae kysymykset ja tyypit
    worksheet.getRow(1).eachCell((cell) => {
      const question = cell.value;
      questions.push(question);
      types.push(question.endsWith("?") ? "Kysymys" : "Vastaus");
      firstRow = firstRow || worksheet.getRow(1);
    });

    // SQL-lause taulukon tyhjentämiseksi
    const truncateTableQuery = 'TRUNCATE TABLE matrix';

    // Tyhjennä taulukko ja lisää uudet tiedot
    db.query(truncateTableQuery, (truncateError) => {
      if (truncateError) {
        console.error('Virhe taulukon tyhjentämisessä:', truncateError);
      } else {
        console.log('Taulukko tyhjennetty. Lisätään uudet tiedot...');

        for (let rowIndex = 2; rowIndex <= worksheet.rowCount; rowIndex++) {
          const currentRow = worksheet.getRow(rowIndex);

          const values = [];
          for (let i = 1; i <= firstRow.actualCellCount; i++) {
            const cellValue = currentRow.getCell(i).value;

            const valueToInsert = typeof cellValue === 'number' ? cellValue.toString() : cellValue;

            values.push(valueToInsert);
          }

          if (!values.some((value) => value !== null && value !== '')) {
            console.log(`Rivi ${rowIndex} on tyhjä tai siinä ei ole tietoja. Ohitetaan...`);
            continue;
          }

          // Luo sarakkeiden nimet
          const columnNames = questions
            .map((_, index) => {
              const prefix = types[index] === 'Kysymys' ? 'kysymys' : 'vastaus';
              return `${prefix}_${index + 1}`;
            })
            .join(', ');

          // Luo paikat uusille tiedoille
          const placeholders = new Array(firstRow.actualCellCount).fill('?').join(', ');
          const insertDataQuery = `INSERT INTO matrix (${columnNames}) VALUES (${placeholders})`;

          // Lisää tiedot taulukkoon
          db.query(insertDataQuery, values, (insertDataError) => {
            if (insertDataError) {
              console.error(`Virhe rivin ${rowIndex} tietojen lisäämisessä:`, insertDataError);
            } else {
              // Tietojen lisääminen onnistui
            }
          });
        }
      }
    });

    // Lisää uudet kysymykset ja sarakkeet
    async function insertQuestionAndColumn(question, type, index) {
      return new Promise(async (resolve) => {
        const questionToInsert = question;
        db.query('SELECT id FROM questions WHERE text = ?', [questionToInsert], async (selectError, selectResults) => {
          if (selectError) {
            console.error('Virhe tarkistaessa mahdollisia päällekkäisiä:', selectError);
            resolve(false);
          } else {
            if (selectResults.length === 0) {
              const insertQuery = 'INSERT INTO questions (text, type) VALUES (?, ?)';
              const questionType = type;

              db.query(insertQuery, [question, questionType], async (insertError, insertResults) => {
                if (insertError) {
                  console.error('Virhe kysymyksen lisäämisessä:', insertError);
                  resolve(false);
                } else {
                  const insertedId = insertResults.insertId;

                  const prefix = questionType === 'Kysymys' ? 'kysymys' : 'vastaus';
                  const columnName = `${prefix}_${insertedId}`;
                  const columnExists = await checkIfColumnExists(columnName);

                  if (!columnExists) {
                    const createMatrixColumnQuery = `ALTER TABLE matrix ADD COLUMN ${columnName} VARCHAR(255)`;
                    db.query(createMatrixColumnQuery, async (createColumnError) => {
                      if (createColumnError) {
                        console.error('Virhe matriisin sarakkeen luomisessa:', createColumnError);
                        resolve(false);
                      } else {
                        newEntries.push(insertedId);
                        console.log(`Matriisin sarake luotu: ${columnName}`);
                        resolve(true);
                      }
                    });
                  } else {
                    resolve(true);
                  }
                }
              });
            } else {
              resolve(false);
            }
          }
        });
      });
    }

    // Tarkista, onko sarake olemassa
    async function checkIfColumnExists(columnName) {
      return new Promise((resolve) => {
        const checkColumnQuery = `SELECT * FROM information_schema.columns WHERE table_name = 'matrix' AND column_name = ?`;
        db.query(checkColumnQuery, [columnName], (checkColumnError, checkColumnResults) => {
          if (checkColumnError) {
            console.error('Virhe tarkistaessa, onko sarake olemassa:', checkColumnError);
            resolve(false);
          } else {
            resolve(checkColumnResults.length > 0);
          }
        });
      });
    }

    // Lisää uudet kysymykset ja sarakkeet
    await Promise.all(
      questions.map(async (column, index) => {
        const isNewEntry = await insertQuestionAndColumn(column, types[index], index);
      })
    );

    if (newEntries.length > 0) {
      console.log('Uusi merkintä:', newEntries.map((id) => `${types[id - 1]}_${id}`).join(', '));
    }
    if (questions.length === 0) {
      console.log('Ei uusia merkintöjä.');
    }
  });
} catch (error) {
  console.error('Virhe:', error);
}

try {
  // SQL-lause taulukon "answers" tyhjentämiseksi
  const truncateAnswersQuery = 'TRUNCATE TABLE answers';

  // Tyhjennä "answers" taulukko ja lisää uudet tiedot
  db.query(truncateAnswersQuery, (truncateError) => {
    if (truncateError) {
      console.error('Virhe "answers" taulukon tyhjentämisessä:', truncateError);
    } else {
      console.log('Answers-taulukko tyhjennetty. Lisätään uudet tiedot...');

      // Lue Excel-tiedosto
      workbook.xlsx.readFile('matrix.xlsx')
        .then(async () => {
          // Hae taulukon ensimmäinen työlehti
        })
        .catch((error) => {
          console.error('Virhe Excel-tiedoston lukemisessa:', error);
        });
    }
  });
} catch (error) {
  console.error('Tapahtui virhe:', error);
}

try {
  // Lue Excel-tiedosto
  workbook.xlsx.readFile('matrix.xlsx')
    .then(async () => {
      const worksheet = workbook.getWorksheet(1);

      const questions = [];
      const types = [];

      // Käy läpi työarkin sarakkeet
      for (let columnIndex = 1; columnIndex <= worksheet.actualColumnCount; columnIndex++) {
        const question = worksheet.getRow(1).getCell(columnIndex).value;
        questions.push(question);

        // Lisää kysymys ja sarakkeet tietokantaan
        insertQuestionAndColumn(question, 'Kysymys', columnIndex - 1);

        worksheet.eachRow({ includeEmpty: true }, (row, rowNumber) => {
          if (rowNumber === 1) return;

          const optionText = row.getCell(columnIndex).value;

          // Lisää vastausvaihtoehto tietokantaan
          insertAnswerOption(optionText, columnIndex - 1, rowNumber - 2);
        });
      }

      // Lisää kysymys ja sarakkeet tietokantaan
      async function insertQuestionAndColumn(question, type, index) {
        // Tarkista, onko kysymys jo olemassa ja lisää tarvittaessa
      }

      // Lisää vastausvaihtoehto tietokantaan
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
    })
    .catch((error) => {
      console.error('Virhe Excel-tiedoston lukemisessa:', error);
    });
} catch (error) {
  console.error('Tapahtui virhe:', error);
}

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
