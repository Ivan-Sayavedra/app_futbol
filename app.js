const express = require("express");
const mongoose = require("mongoose");

const adminValidationRoutes = require("./routes/adminValidation");
const authorizedEmailRoutes = require("./routes/authorizedEmails");
const teamRoutes = require("./routes/teams");
const matchRoutes = require("./routes/matches");

const app = express();

app.use(express.json());

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "OPTIONS, GET, POST, PUT, PATCH, DELETE"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

app.use("/adminAuth", adminValidationRoutes);
app.use("/authorizedAdmin", authorizedEmailRoutes);
app.use("/teams", teamRoutes);
app.use("/matches", matchRoutes);

app.use((error, req, res, next) => {
  console.log(error);
  const status = error.statusCode || 500;
  const message = error.message;
  const data = error.data;
  res.status(status).json({ message: message, data: data });
});

mongoose
  .connect("mongodb://Localhost:27017/football-app")
  .then((result) => {
    app.listen(3000);
    console.log("DB connected :)");
  })
  .catch((err) => console.log(err));
