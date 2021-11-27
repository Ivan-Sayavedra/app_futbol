const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const adminRegisterSchema = new Schema(
    {
        authorizedEmail:{
            type: String,
            required: true
        },
        token:{
            type: String,
        },
        tokenExpiration:{
            type: Date,
        }
        
},
{
    versionKey: false,
  })

module.exports = mongoose.model("AdminsRegister", adminRegisterSchema)