const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const fixtureSchema = new Schema(
    {
        date: {
            type: Date,
            required:true
        },
        matches:[
            {
                team1:{required:true},
                team2:{required:true},
                required:true
            }
        ]
})

module.exports = mongoose.model("Fixture", fixtureSchema)