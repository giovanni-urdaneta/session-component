const express = require("express");
const dotenv = require("dotenv");
const session = require("express-session")
const routes = require("./routes/person");

// cargando variables de entorno
dotenv.config();

const app = express();

// estableciendo middlewares
app.use(
    session({
      secret: process.env.SECRET,
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: false,
        maxAge: 1000 * 60 * 60,
        store: new session.MemoryStore(),
      },
    })
  );
app.use(express.json());
app.use("/", routes);

app.listen(process.env.PORT);
