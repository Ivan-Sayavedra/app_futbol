const path = require('path');
const { v4: uuidv4 } = require('uuid');

const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer")

const adminAuthRoutes = require("./routes/adminAuth");
const authorizedEmailRoutes = require("./routes/authorizedEmails");
const teamRoutes = require("./routes/teams");
const matchRoutes = require("./routes/matches");
const fixtureRoutes = require("./routes/fixtures")
const config = require("./config")

const app = express();

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'images');
  },
  filename: (req, file, cb) => {
    cb(null, uuidv4() + file.originalname);
  }
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === 'image/png' ||
    file.mimetype === 'image/jpg' ||
    file.mimetype === 'image/jpeg'
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

app.use(express.json());

app.use(
  multer({ storage: fileStorage, fileFilter: fileFilter }).single('image')
);
app.use('/images', express.static(path.join(__dirname, 'images')));

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "OPTIONS, GET, POST, PUT, PATCH, DELETE"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

app.use("/adminAuth", adminAuthRoutes);
app.use("/authorizedEmail", authorizedEmailRoutes);
app.use("/teams", teamRoutes);
app.use("/matches", matchRoutes);
app.use("/fixtures", fixtureRoutes)

app.use((error, req, res, next) => {
  console.log(error);
  const status = error.statusCode || 500;
  const message = error.message;
  const data = error.data;
  res.status(status).json({ message: message, data: data });
});

mongoose
  .connect(config.mongodb_URI)
  .then((result) => {
    app.listen(config.PORT);
    console.log("DB connected :)");
  })
  .catch((err) => console.log(err));
