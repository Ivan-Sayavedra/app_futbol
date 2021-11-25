const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const fixtureSchema = new Schema({
  matches: [
    {
     localTeam: { type: Schema.Types.ObjectId, ref: "Team", required: true },
      awayTeam: { type: Schema.Types.ObjectId, ref: "Team", required: true },
      date: { type: Date, required: true }
    },
  ],
  day: {
    type: Number,
    required: true,
  },
});

fixtureSchema.methods.createMatch = function (date,localTeam, awayTeam) {
  const match = {
   localTeam:localTeam,
    awayTeam: awayTeam,
    date: date,
  };
  this.matches.push(match);
  return this.save();
};

fixtureSchema.methods.deleteMatch = function (matchId) {
  const updatedMatches = this.matches.filter((p) => {
    return p._id.toString() !== matchId;
  });
  this.matches = updatedMatches;
  return this.save();
};

fixtureSchema.methods.editMatch = function (matchId,localTeam, awayTeam, date) {
  this.matches.forEach((p) => {
    if (p._id.toString() === matchId) {
      p.localTeam =localTeam;
      p.awayTeam = awayTeam;
      p.date = date;
    }
  });
  return this.save();
};

module.exports = mongoose.model("Fixture", fixtureSchema);
