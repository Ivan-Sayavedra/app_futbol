const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const matchSchema = new Schema({
  date: {
    type: Date,
    required: true,
  },
  teams: [
    {
      team: {
        type: Object,
      },
      score: { type: Number, required: true },
      injuredPlayers: [],
      playersWithRedCard: [],
      playersWithYellowCard: [],
      scorers: [],
      _id: false,
    },
  ],
});

matchSchema.methods.assignScore = function (score1, score2) {
  this.teams[0].score = score1;
  this.teams[1].score = score2;
  return this.save();
};

matchSchema.methods.addInjuredPlayers = function (id, player) {
  for (let i = 0; i < this.teams.length; i++) {
    if (this.teams[i].team._id.toString() === id) {
      this.teams[i].injuredPlayers.push(player);
    }
  }
  return this.save();
};

matchSchema.methods.deleteInjuredPlayers = function (id, playerId) {
  for (let i = 0; i < this.teams.length; i++) {
    if (this.teams[i].team._id.toString() === id) {
      const updatedInjuredPlayers = this.teams[i].injuredPlayers.filter((p) => {
        return p.id.toString() !== playerId;
      });
      console.log(updatedInjuredPlayers);
      this.teams[i].injuredPlayers = updatedInjuredPlayers;
    }
  }

  return this.save();
};

matchSchema.methods.addPlayersWithRedCard = function (id, player) {
  for (let i = 0; i < this.teams.length; i++) {
    if (this.teams[i].team._id.toString() === id) {
      this.teams[i].playersWithRedCard.push(player);
    }
  }
  return this.save();
};

matchSchema.methods.deletePlayersWithRedCard = function (id, playerId) {
  for (let i = 0; i < this.teams.length; i++) {
    if (this.teams[i].team._id.toString() === id) {
      const updatedAdmonishedPlayers = this.teams[i].playersWithRedCard.filter(
        (p) => {
          return p.id.toString() !== playerId;
        }
      );
      this.teams[i].playersWithRedCard = updatedAdmonishedPlayers;
    }
  }
  return this.save();
};

matchSchema.methods.addPlayersWithYellowCard = function (id, player) {
  for (let i = 0; i < this.teams.length; i++) {
    if (this.teams[i].team._id.toString() === id) {
      this.teams[i].playersWithYellowCard.push(player);
    }
  }
  return this.save();
};

matchSchema.methods.deletePlayersWithYellowCard = function (id, playerId) {
  console.log(id,playerId)
  for (let i = 0; i < this.teams.length; i++) {
    if (this.teams[i].team._id.toString() === id) {
      const updatedAdmonishedPlayers = this.teams[
        i
      ].playersWithYellowCard.filter((p) => {
        return p.id.toString() !== playerId;
      });
      this.teams[i].playersWithYellowCard = updatedAdmonishedPlayers;
    }
  }
  return this.save();
};

matchSchema.methods.addScorers = function (id, player) {
  for (let i = 0; i < this.teams.length; i++) {
    if (this.teams[i].team._id.toString() === id) {
      this.teams[i].scorers.push(player);
      this.teams[i].score += player.goals
    }
  }
  return this.save();
};

matchSchema.methods.deleteScorers = function (id, player) {
  for (let i = 0; i < this.teams.length; i++) {
    if (this.teams[i].team._id.toString() === id) {
      const updatedScorers = this.teams[i].scorers.filter((p) => {
        return p.id.toString() !== player.id;
      });
      this.teams[i].scorers = updatedScorers;
      this.teams[i].score -= player.goals
    }
  }

  return this.save();
};

module.exports = mongoose.model("Match", matchSchema);
