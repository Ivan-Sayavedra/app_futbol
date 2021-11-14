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
        return p._id.toString() === player.playerId;
      });
      if(searchedPlayer.length === 0){
        const error = new Error("El jugador no ha sido encontrado")
        error.statusCode = 404
        throw error
      }
   const updatedPlayers =  this.squad.players.filter((p) => {
    return p._id.toString() !== player.playerId;
  });
  updatedPlayers.push(player)
  this.squad.players = updatedPlayers
  const updatedSquad = await this.save()
  return updatedSquad

  } catch (err) {
    if (!err.statusCode) {
      err.statudCode = 500;
    }
    return err;
  }
};

teamSchema.methods.getPlayers = function () {
  return this.squad.players;
};

teamSchema.methods.addManager = function (manager) {
  this.squad.manager = manager;
  return this.save();
};

teamSchema.methods.getManager = function () {
  return this.squad.manager;
};

teamSchema.methods.getSquad = function () {
  return this.squad;
};



module.exports = mongoose.model("Team", teamSchema);


/* record: {
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
*/

/*teamSchema.methods.assignResult = function (result1, result2) {
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
};
*/