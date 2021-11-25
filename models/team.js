const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const teamSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  badgeURL: {
    type: String,
  },
  squad: {
    players: [
      {
        name: {
          type: String,
          required: true,
        },
      },
    ],
    manager: String,
  },
  record: {
    wins: {
      type: Number,
      default: 0,
    },
    draws: {
      type: Number,
      default: 0,
    },
    losses: {
      type: Number,
      default: 0,
    },
  },
  goalsScored: {
    type: Number,
    default: 0,
  },
  goalsAgainst: {
    type: Number,
    default: 0,
  },
});

teamSchema.methods.addPlayerToSquad = function (player) {
  this.squad.players.push(player);
  return this.save();
};

teamSchema.methods.removePlayerFromSquad = function (playerId) {
  const updatedSquad = this.squad.players.filter((player) => {
    return player._id.toString() !== playerId;
  });
  this.squad.players = updatedSquad;
  return this.save();
};

teamSchema.methods.editPlayerFromSquad = async function (player) {
  try {
    const searchedPlayer = this.squad.players.filter((p) => {
      return p._id.toString() === player._id;
    });
    if (searchedPlayer.length === 0) {
      const error = new Error("El jugador no ha sido encontrado");
      error.statusCode = 404;
      throw error;
    }
    const updatedPlayers = this.squad.players.filter((p) => {
      return p._id.toString() !== player._id;
    });
    player._id = new mongoose.Types.ObjectId(player._id)
    updatedPlayers.push(player);
    this.squad.players = updatedPlayers;
    const updatedSquad = await this.save();
    return updatedSquad;
  } catch (err) {
    if (!err.statusCode) {
      err.statudCode = 500;
    }
    return err;
  }
};



teamSchema.methods.addManager = function (manager) {
  this.squad.manager = manager;
  return this.save();
};


teamSchema.methods.assignResult = function (result1, result2, boolean) {
  console.log(result1, result2);
  if (boolean === true) {
    this.goalsScored += result1;
    this.goalsAgainst += result2;
    if (result1 > result2) {
      this.record.wins += 1;
      return this.save();
    }
    if (result1 === result2) {
      this.record.draws += 1;
      return this.save();
    }
    this.record.losses += 1;
    return this.save();
  } else {
    this.goalsScored -= result1;
    this.goalsAgainst -= result2;
    if (result1 > result2) {
      this.record.wins -= 1;
      return this.save();
    }
    if (result1 === result2) {
      this.record.draws -= 1;
      return this.save();
    }
    this.record.losses -= 1;
    return this.save();
  }
};

module.exports = mongoose.model("Team", teamSchema);
