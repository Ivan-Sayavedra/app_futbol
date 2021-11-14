const Team = require("../models/team");

exports.createTeam = async (req, res, next) => {
  const name = req.body.name;
  const badgeURL = req.body.badgeURL;
  const players = req.body.players;
  const managerName = req.body.manager;
  const team = new Team({
    name: name,
    badgeURL: badgeURL,
    squad: {
      players: players,
      manager: managerName
    },
  });
  try {
    const savedTeam = await team.save();
    res
      .status(201)
      .json({ message: "El equipo ha sido creado con exito", team: savedTeam });
  } catch (err) {
    if (!err.statusCode) {
      err.statudCode = 500;
    }
    next(err);
  }
};

exports.getTeams = async (req, res, next) => {
  try {
    const teams = await Team.find();
    res.status(200).json({ teams: teams });
  } catch (err) {
    if (!err.statusCode) {
      err.statudCode = 500;
    }
    next(err);
  }
};

exports.deleteTeam = async (req, res, next) => {
  const teamId = req.params.id;
  try {
    const team = await Team.findOne({ _id: teamId });
    if (!team) {
      const error = new Error("El equipo no ha sido encontrado");
      error.statusCode = 404;
      throw error;
    }
    const deletedTeam = await Team.findOneAndRemove({ _id: teamId });
    res.status(200).json({
      message: "El equipo ha sido eliminado con exito",
      team: deletedTeam,
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statudCode = 500;
    }
    next(err);
  }
};

exports.editTeamName = async (req, res, next) => {
  const teamId = req.body.teamId;
  try {
    const team = await Team.findOne({ _id: teamId });
    if (!team) {
      const error = new Error("El equipo no ha sido encontrado");
      error.statusCode = 404;
      throw error;
    }
    const newName = req.body.newName;
    team.name = newName;
    const updatedTeam = await team.save();
    res.status(200).json({
      message: "El nombre del equipo ha sido actualziado con éxito",
      name: updatedTeam.name,
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statudCode = 500;
    }
    next(err);
  }
};

exports.editBadgeURL = async (req, res, next) => {
  const teamId = req.body.teamId;
  try {
    const team = await Team.findOne({ _id: teamId });
    if (!team) {
      const error = new Error("El equipo no ha sido encontrado");
      error.statusCode = 404;
      throw error;
    }
    team.badgeURL = req.body.badgeURL;
    const updatedTeam = await team.save();
    res.status(200).json({
      message: "El escudo del equipo ha sido actualziado con éxito",
      badgeURL: updatedTeam.name,
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statudCode = 500;
    }
    next(err);
  }
};



exports.addPlayer = async (req, res, next) => {
  const teamId = req.body.teamId;
  try {
    const team = await Team.findOne({ _id: teamId });
    if (!team) {
      const error = new Error("El equipo no ha sido encontrado");
      error.statusCode = 404;
      throw error;
    }
    const name = req.body.name;
    const player = {
      name: name,
    };
    const updatedSquad = await team.addPlayerToSquad(player);
    res
      .status(200)
      .json({
        message: "El jugador ha sido agregado satisfactoriamente",
        squad: updatedSquad.squad.players,
      });
  } catch (err) {
    if (!err.statusCode) {
      err.statudCode = 500;
    }
    next(err);
  }
};

exports.removePlayer = async (req, res, next) => {
  const teamId = req.body.teamId;
  console.log(teamId)
  try {
    const team = await Team.findOne({ _id: teamId });
    if (!team) {
      const error = new Error("El equipo no ha sido encontrado");
      error.statusCode = 404;
      throw error;
    }
    const playerId = req.body.playerId;

    const updatedSquad = await team.removePlayerFromSquad(playerId);
    res
      .status(200)
      .json({
        message: "El jugador ha sido eliminado satisfactoriamente",
        squad: updatedSquad.squad.players,
      });
  } catch (err) {
    if (!err.statusCode) {
      err.statudCode = 500;
    }
    next(err);
  }
};

exports.editPlayer = async (req, res, next) => {
  const teamId = req.body.teamId;
  try {
    const team = await Team.findOne({ _id: teamId });
    if (!team) {
      const error = new Error("El equipo no ha sido encontrado");
      error.statusCode = 404;
      throw error;
    }
    const newName = req.body.newName;
    const playerId = req.body.playerId;
    const player = {
      name: newName,
      playerId: playerId
    };
    const result = await team.editPlayerFromSquad(player);
    if(!result.squad){
      throw result   
    }
    res
      .status(200)
      .json({
        message: "El jugador ha sido actualizado satisfactoriamente",
        squad: result.squad.players
      });
  } catch (err) {
    if (!err.statusCode) {
      err.statudCode = 500;
    }
    next(err);
  }
};

exports.getPlayers = async (req, res, next) => {
  const teamId = req.params.teamId;
  try {
    const team = await Team.findOne({ _id: teamId });
    if (!team) {
      const error = new Error("El equipo no ha sido encontrado");
      error.statusCode = 404;
      throw error;
    }
    const players = await team.getPlayers();
    res.status(200).json({ players: players });
  } catch (err) {
    if (!err.statusCode) {
      err.statudCode = 500;
    }
    next(err);
  }
};

exports.getSquad = async (req, res, next) => {
  const teamId = req.params.teamId;
  try {
    const team = await Team.findOne({ _id: teamId });
    if (!team) {
      const error = new Error("El equipo no ha sido encontrado");
      error.statusCode = 404;
      throw error;
    }
    const squad = await team.getSquad();
    res.status(200).json({ squad: squad });
  } catch (err) {
    if (!err.statusCode) {
      err.statudCode = 500;
    }
    next(err);
  }
};

exports.addManager = async (req, res, next) => {
  const teamId = req.body.teamId;
  try {
    const team = await Team.findOne({ _id: teamId });
    if (!team) {
      const error = new Error("El equipo no ha sido encontrado");
      error.statusCode = 404;
      throw error;
    }
    const manager = req.body.manager;
    const updatedSquad = await team.addManager(manager);
    res
      .status(201)
      .json({
        message: "Se ha añadido al manager de forma exitosa",
        manager: updatedSquad.squad.manager,
      });
  } catch (err) {
    if (!err.statusCode) {
      err.statudCode = 500;
    }
    next(err);
  }
};

exports.getManager = async (req,res,next) => {
    const teamId = req.params.teamId;
    try {
      const team = await Team.findOne({ _id: teamId });
      if (!team) {
        const error = new Error("El equipo no ha sido encontrado");
        error.statusCode = 404;
        throw error;
      }
      const manager = await team.getManager()
      res.status(200).json({manager: manager})
    }catch(err){
        if (!err.statusCode) {
            err.statudCode = 500;
          }
          next(err);
    }
}

/*
exports.assignResults = async (req, res, next) => {
  const teamId = req.body.teamId;
  try {
    const team = await Team.findOne({ _id: teamId });
    if (!team) {
      const error = new Error("EL equipo no ha sido encontrado");
      error.statusCode = 404;
      throw error;
    }
    const result1 = req.body.result1;
    const result2 = req.body.result2;
    const updatedTeam = await team.assignResult(result1,result2);
    res.status(200).json({
      message: "El resultado ha sido asignado",
      record: updatedTeam.record,
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statudCode = 500;
    }
    next(err);
  }
};
*/