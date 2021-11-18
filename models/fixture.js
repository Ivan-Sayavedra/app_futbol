const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const fixtureSchema = new Schema({
  matches: [
    {
      team1Id: { type: Schema.Types.ObjectId, ref: "Team", required: true },
      team2Id: { type: Schema.Types.ObjectId, ref: "Team", required: true },
      date: { type: Date, required: true }
    },
  ],
  day: {
    type: Number,
    required: true,
  },
});

fixtureSchema.methods.createMatch = function (date, team1Id, team2Id) {
  const match = {
    team1Id: team1Id,
    team2Id: team2Id,
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

fixtureSchema.methods.editMatch = function (matchId, team1Id, team2Id, date) {
  this.matches.forEach((p) => {
    if (p._id.toString() === matchId) {
      p.team1Id = team1Id;
      p.team2Id = team2Id;
      p.date = date;
    }
  });
  return this.save();
};

module.exports = mongoose.model("Fixture", fixtureSchema);
