const { config } = require("dotenv");
config();

module.exports = {
    mongodb_URI: process.env.MONGODB_URI || "mongodb://Localhost:27017/football-app",
    sendGrid_key : process.env.SENDGRID_KEY,
    PORT : process.env.PORT || 3000  
  };
  