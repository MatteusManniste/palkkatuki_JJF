require("dotenv").config();
const jwt = require("jsonwebtoken");
const express = require("express");
const cors = require("cors");
const multer = require("multer");
const app = express();
const port = process.env.PORT || 3001;
const Data = require("./data");
const cookieParser = require("cookie-parser");
const bcrypt = require("bcrypt");

app.use(cookieParser());

app.use(express.json());

const corsOptions = {
  origin: "http://localhost:3000",
  methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
  credentials: true,
};

app.use(cors(corsOptions));

const middleware = (req, res, next) => {
  try {
    const token = req.cookies.token;

    // this method throws errors if logins are invalid.
    jwt.verify(token, process.env.JWT_SECRET);

    // if verification went through, we can set this to quickly get our auth status in subsequent requests.
    req.isAuth = true;

    // no errors means that the token was created by us, allow this request.
    next();
  } catch (error) {
    // errors here are either that the token didn't exist, was invalid, or expired. 
    // either way, let's clear it to force the user to login again.
    console.error("Auth failed:", error.message);
    req.isAuth = false;
    res.clearCookie("token");
    res.status(401).json({ error: "Invalid token" });
  }
};

app.post("/api/login", (req, res) => {
  try {
    const { username, password } = req.body;

    if (username && password) {
      // attempt to get user data with given username
      Data.getUser(username, async (err, user) => {
        if (err) {
          console.error("Internal error:", err);
          res.status(500).json({ error: "Internal error" });
          return;
        }

        if (!user) {
          console.error("Invalid username");
          res.status(400).json({ error: "Invalid logins" });
          return;
        }

        // check if given password matches the password in database
        const validPassword = await bcrypt.compare(password, user.password);

        if (validPassword) {
          // TODO: maybe add some user data, e.g. username to payload?
          const jwtPayload = {};

          const token = jwt.sign(jwtPayload, process.env.JWT_SECRET, { expiresIn: "2h" });

          res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production" ? true : false,
            maxAge: new Date(Date.now() + 7200 * 1000), // 2 hours in milliseconds
          });

          console.log("Successfully logged in");
          res.json({ message: "Successfully logged in" });
          return;
        }
        console.error("Invalid password");
        res.status(400).json({ error: "Invalid logins" });
      });
    } else {
      console.error("Invalid logins");
      res.status(400).json({ error: "Invalid logins" });
    }
  } catch (error) {
    console.error("Error while attempting to login:", error.message);
    res.status(500).json({ error: "Internal error" });
  }
});

app.get("/api/logout", (req, res) => {
  try {
    res.clearCookie("token");
    res.json({ message: "Successfully logged out" });
    return;
  } catch (error) {
    console.error("Error while attempting to logout:", error.message);
    res.status(500).json({ error: "Internal error" });
  }
});

app.get("/api/runko", (req, res) => {
  try {
    Data.SelectFromRunko((err, result) => {
      if (err) {
        console.error("Virhe hakiessa runkoja:", err);
        res.status(500).json({ error: "Sisäinen palvelinvirhe" });
        return;
      }
      res.json(result);
    });
  } catch (error) {
    console.error("Virhe hakiessa runkoja:", error);
    res.status(500).json({ error: "Sisäinen palvelinvirhe" });
  }
});

app.get("/api/runko/:runkoId", (req, res) => {
  const { runkoId } = req.params;
  Data.SelectFromRunkoById(runkoId, (err, runkoData) => {
    if (err) {
      res.status(500).json({ error: "Sisäinen palvelinvirhe" });
      return;
    }
    res.json(runkoData);
  });
});

app.get("/api/questions", (req, res) => {
  Data.SelectFromQuestions((err, data) => {
    if (err) {
      console.error("Virhe datan hakemisessa:", err);
      res.status(500).json({ error: "Sisäinen palvelinvirhe" });
      return;
    }
    res.json(data);
  });
});

app.get("/api/vastaus", (req, res) => {
  Data.SelectFromQuestionsAnswers((err, data) => {
    if (err) {
      console.error("Virhe datan hakemisessa:", err);
      res.status(500).json({ error: "Sisäinen palvelinvirhe" });
      return;
    }
    res.json(data);
  });
});

app.get("/api/answers", (req, res) => {
  Data.SelectAllAnswers((err, data) => {
    if (err) {
      console.error("Virhe datan hakemisessa:", err);
      res.status(500).json({ error: "Sisäinen palvelinvirhe" });
      return;
    }
    res.json(data);
  });
});


app.get("/api/sisalto/runko/:runkoId", (req, res) => {
  const { runkoId } = req.params;
  Data.SelectFromSisaltoByRunkoId(runkoId, (err, data) => {
    if (err) {
      res.status(500).json({ error: "Sisäinen palvelinvirhe" });
      return;
    }
    res.json(data);
  });
});

app.post("/api/matrix/query", (req, res) => {
  const { questions, selectedAnswers } = req.body;

  const answerTexts = Object.values(selectedAnswers).map(
    (selectedAnswer) => selectedAnswer.optionText,
  );

  const conditions = questions.map((_, index) => {
    return `kysymys_${index + 1} = '${answerTexts[index]}'`;
  });

  const sql = `SELECT * FROM matrix WHERE ${conditions.join(" AND ")}`;

  Data.ExecuteMatrixQuery(sql, (err, data) => {
    if (err) {
      console.error("Virhe matriisin kyselyn suorittamisessa:", err);
      res.status(500).json({ error: "Sisäinen palvelinvirhe" });
      return;
    }
    res.json(data);
  });
});

app.get("/api/sisalto/id/:id", (req, res) => {
  const { id } = req.params;
  Data.SelectFromSisaltoById(id, (err, data) => {
    if (err) {
      console.error("Virhe sisällön noutamisessa:", err);
      res.status(500).json({ error: "Sisäinen palvelinvirhe" });
      return;
    }
    res.json(data);
  });
});

app.get("/api/painike/:sisaltoId", (req, res) => {
  const { sisaltoId } = req.params;
  Data.SelectFromPainikeBySisaltoId(sisaltoId, (err, data) => {
    if (err) {
      res.status(500).json({ error: "Sisäinen palvelinvirhe" });
      return;
    }
    res.json(data);
  });
});

// NOTE: middleware will only run on the routes below this line
app.use(middleware);

app.get("/api/authStatus", (req, res) => {
  try {
    // our middleware runs before this, 
    // meaning we have access to the isAuth variable

    if (req.isAuth) {
      res.json({ isAuth: true });
      return;
    }

    res.json({ isAuth: false });
  } catch (error) {
    console.error("Error while checking authStatus:", error.message);
    res.status(500).json({ error: "Internal error", isAuth: false });
  }
});

app.get("/api/sisalto/:otsikko", (req, res) => {
  const { otsikko } = req.params;
  Data.SelectFromSisaltoByOtsikko(otsikko, (err, data) => {
    if (err) {
      console.error("Virhe sisällön noutamisessa:", err);
      res.status(500).json({ error: "Sisäinen palvelinvirhe" });
      return;
    }
    res.json(data);
  });
});

app.get("/api/get-new-title", (req, res) => {
  Data.SelectNimikeFromRunko((err, title) => {
    if (err) {
      console.error("Virhe haettaessa uutta nimikettä:", err);
      res.status(500).json({ error: "Sisäinen palvelinvirhe" });
      return;
    }
    res.json({ title });
  });
});

app.get("/api/get-otsikko/:runko_id", (req, res) => {
  const { runko_id } = req.params;
  Data.getOtsikkoByRunkoId(runko_id, (err, data) => {
    if (err) {
      console.error("Virhe otsikon tietojen hakemisessa:", err);
      res.status(500).json({ error: "Sisäinen palvelinvirhe" });
      return;
    }
    res.json(data);
  });
});

app.get("/api/get-sisalto-options", (req, res) => {
  try {
    Data.haeSisaltoOptions((err, sisaltoOptions) => {
      if (err) {
        console.error("Virhe haettaessa sisällön asetuksia:", err);
        res.status(500).json({ error: "Sisäinen palvelinvirhe" });
        return;
      }
      res.json(sisaltoOptions);
    });
  } catch (error) {
    console.error("Virhe haettaessa sisällön asetuksia:", error);
    res.status(500).json({ error: "Sisäinen palvelinvirhe" });
  }
});

app.get("/api/get-kentta-content/:otsikkoId", (req, res) => {
  const { otsikkoId } = req.params;
  Data.getKenttaContent(parseInt(otsikkoId, 10), (err, kenttaContent) => {
    if (err) {
      console.error("Virhe haettaessa kenttäsisältöä:", err);
      res.status(500).json({ error: "Sisäinen palvelinvirhe" });
      return;
    }
    if (kenttaContent !== null) {
      res.json({ kentta: kenttaContent });
    } else {
      res.status(404).json({ error: "Otsikkoa ei löydy" });
    }
  });
});

app.delete("/api/delete-title/:id", (req, res) => {
  const { id } = req.params;
  Data.deleteNimikeById(id, (err, result) => {
    if (err) {
      console.error("Virhe poistettaessa Nimikettä:", err);
      res.status(500).json({ error: "Sisäinen palvelinvirhe" });
      return;
    }
    if (result.affectedRows === 0) {
      res.status(404).json({ error: "Nimikettä ei löydy" });
      return;
    }
    console.log("Nimike poistettu onnistuneesti");
    res.status(204).send();
  });
});

app.post("/api/create-title", (req, res) => {
  const { text } = req.body;
  Data.insertTitle(text, (err, result) => {
    if (err) {
      console.error("Virhe luotaessa nimikettä:", err);
      res.status(500).json({ error: "Sisäinen palvelinvirhe" });
      return;
    }
    const newTitleId = result.insertId;
    console.log("Nimike luotu onnistuneesti ID:llä:", newTitleId);
    res.json({ id: newTitleId });
  });
});

app.put("/api/update-otsikko/:id", (req, res) => {
  const { id } = req.params;
  const { text } = req.body;
  Data.updateOtsikko(id, text, (err, result) => {
    if (err) {
      console.error("Virhe päivitettäessä otsikkoa:", err);
      res.status(500).json({ error: "Sisäinen palvelinvirhe" });
      return;
    }
    res.json({ message: "Otsikko päivitetty onnistuneesti" });
  });
});

app.put("/api/update-title/:id", (req, res) => {
  const { id } = req.params;
  const { newText } = req.body;
  Data.updateTitle(id, newText, (err, result) => {
    if (err) {
      console.error("Virhe päivitettäessä nimikettä:", err);
      res.status(500).json({ error: "Sisäinen palvelinvirhe" });
      return;
    }
    res.json({ message: "Nimike päivitetty onnistuneesti" });
  });
});

app.post("/api/create-otsikko", (req, res) => {
  const { text, runko_id } = req.body;
  Data.createOrUpdateOtsikko(text, runko_id, (err, result, otsikkoIds) => {
    if (err) {
      console.error("Virhe luotaessa/päivitettäessä otsikkoa:", err);
      res.status(500).json({ error: "Sisäinen palvelinvirhe" });
      return;
    }

    console.log(result);
    res.json({ message: result, otsikkoIds });
  });
});

const { updateOtsikkoOrder } = require("./data");
app.put("/api/update-otsikko-order", async (req, res) => {
  const otsikkos = req.body;
  try {
    await updateOtsikkoOrder(otsikkos);
    res
      .status(200)
      .json({ message: "Otsikkojen järjestys päivitetty onnistuneesti" });
  } catch (error) {
    console.error("Virhe päivitettäessä otsikkojen järjestystä:", error);
    res.status(500).json({ error: "Sisäinen palvelinvirhe" });
  }
});

app.delete("/api/delete-otsikko/:id", (req, res) => {
  const otsikkoId = req.params.id;
  try {
    Data.deleteOtsikko(otsikkoId, (err, result) => {
      if (err) {
        console.error("Virhe poistettaessa otsikkoa:", err);
        res.status(500).json({ error: "Sisäinen palvelinvirhe" });
        return;
      }
      if (result.affectedRows > 0) {
        res.json({ message: "Otsikko poistettu onnistuneesti" });
      } else {
        res.status(404).json({ error: "Otsikkoa ei löytynyt" });
      }
    });
  } catch (error) {
    console.error("Virhe käsiteltäessä poistopyyntöä:", error);
    res.status(500).json({ error: "Sisäinen palvelinvirhe" });
  }
});

app.post("/api/save-rich-text/:id", async (req, res) => {
  const { id } = req.params;
  const { richText } = req.body;
  try {
    console.log("Vastaanotettiin rikas tekstidata palvelimella:", richText);
    Data.updateRichTextForOtsikko(id, richText, (err, result) => {
      if (err) {
        console.error(
          "Virhe päivitettäessä rikasta tekstisisältöä otsikolle:",
          err,
        );
        res.status(500).json({ error: "Sisäinen palvelinvirhe" });
        return;
      }
      res
        .status(200)
        .json({ message: "Rikas tekstisisältö tallennettu onnistuneesti" });
    });
  } catch (error) {
    console.error("Virhe tallennettaessa rikasta tekstisisältöä:", error);
    res.status(500).json({ error: "Sisäinen palvelinvirhe" });
  }
});

app.post("/api/create-painike", (req, res) => {
  const { sisaltoId, nimi, destinationId } = req.body;
  Data.insertPainike(sisaltoId, nimi, destinationId, (err, result) => {
    if (err) {
      console.error("Virhe luotaessa painiketta:", err);
      res.status(500).json({ error: "Sisäinen palvelinvirhe" });
      return;
    }
    const newPainikeId = result.insertId;
    console.log("Painike luotu onnistuneesti ID:llä:", newPainikeId);
    res.json({ id: newPainikeId, nimi: nimi });
  });
});

app.put("/api/edit-painike/:id", async (req, res) => {
  const { id } = req.params;
  const { nimi, destinationId } = req.body;
  try {
    const updatedPainike = await Data.editPainike(id, nimi, destinationId);
    console.log("Painike päivitetty onnistuneesti:", updatedPainike);
    res.json(updatedPainike);
  } catch (err) {
    console.error("Virhe painikkeen päivittämisessä:", err);
    res.status(500).json({ error: "Sisäinen palvelinvirhe" });
  }
});

app.delete("/api/delete-painike/:id", (req, res) => {
  const { id } = req.params;
  Data.deletePainike(id, (err, deletedPainike) => {
    if (err) {
      console.error("Virhe poistettaessa painiketta:", err);
      res.status(500).json({ error: "Sisäinen palvelinvirhe" });
      return;
    }
    console.log("Painike poistettu onnistuneesti:", deletedPainike);
    res.json(deletedPainike);
  });
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

app.post("/api/upload-image", upload.single("image"), (req, res) => {
  try {
    const imageUrl = `http://localhost:${port}/${req.file.path}`;
    res.json({ url: imageUrl });
  } catch (error) {
    console.error("Virhe kuvan lataamisessa:", error);
    res.status(500).json({ error: "Kuvan lataus epäonnistui" });
  }
});

app.listen(port, () => {
  console.log(`Palvelin on käynnissä portissa ${port}`);
});
