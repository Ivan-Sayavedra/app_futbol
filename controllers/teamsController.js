const path = require("path");
const fs = require("fs");

const { validationResult } = require("express-validator");

const Team = require("../models/team");

exports.createTeam = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = new Error("Algo fallo!");
      error.statusCode = 422;
      error.data = errors.array();
      throw error;
    }
    const name = req.body.name;
    const badgeURL = req.file
      ? req.file.path.replace("\\", "/")
      : "images/generic-logo.jpg";
    const players = JSON.parse(req.body.players);
    const managerName = req.body.manager;
    const team = new Team({
      name: name,
      badgeURL: badgeURL,
      squad: {
        players: players,
        manager: managerName,
      },
    });
    const savedTeam = await team.save();
    res
      .status(201)
      .json({ message: "El equipo ha sido creado con exito", team: savedTeam });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.getTeam = async (req, res, next) => {
  const id = req.params.id;
  try {
    const team = await Team.findOne({ _id: id });
    if (!team) {
      const error = new Error("El equipo no ha sido encontrado");
      error.statusCode = 404;
      throw error;
    }
    res.status(200).json({ team: team });
  } catch (err) {
    if (!err.statusCode) {
      err.statudCode = 500;
    }
    next(err);
  }
};

exports.getAllTeams = async (req, res, next) => {
  try {
    const teams = await Team.find().select("name badgeURL");
    res.status(200).json({ teams: teams });
  } catch (err) {
    if (!err.statusCode) {
      err.statudCode = 500;
    }
    next(err);
  }
};

exports.getPositions = async (req, res, next) => {
  try {
    const teams = await Team.find().select(
      "name badgeURL record goalsScored goalsAgainst"
    );
    const updatedTeams = [];
    teams.forEach((p) => {
      const team = {
        name: p.name,
        badgeURL: p.badgeURL,
        record: p.record,
        goalsScored: p.goalsScored,
        goalsAgainst: p.goalsAgainst,
        points: p.record.wins * 3 + p.record.draws,
        balance: p.goalsScored - p.goalsAgainst,
      };

      updatedTeams.push(team);
    });
    updatedTeams.sort((a, b) => {
      b.points - a.points;
      if (b.points === a.points) {
        return b.balance - a.balance;
      }
    });

    res.status(200).json({ teams: updatedTeams });
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
    const genericLogoURL = "images/generic-logo.jpg";
    if (team.badgeURL !== genericLogoURL) {
      clearImage(team.badgeURL);
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
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = new Error("Algo fallo!");
      error.statusCode = 422;
      error.data = errors.array();
      throw error;
    }
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
    const genericLogoURL = "images/generic-logo.jpg";
    if (team.badgeURL !== genericLogoURL) {
      clearImage(team.badgeURL);
    }
    team.badgeURL = req.file.path.replace("\\", "/");
    await team.save();
    res.status(200).json({
      message: "El escudo del equipo ha sido actualziado con éxito",
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
    res.status(200).json({
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
  console.log(teamId);
  try {
    const team = await Team.findOne({ _id: teamId });
    if (!team) {
      const error = new Error("El equipo no ha sido encontrado");
      error.statusCode = 404;
      throw error;
    }
    const playerId = req.body.playerId;

    const updatedSquad = await team.removePlayerFromSquad(playerId);
    res.status(200).json({
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
      _id: playerId,
    };
    const result = await team.editPlayerFromSquad(player);
    if (!result.squad) {
      throw result;
    }
    res.status(200).json({
      message: "El jugador ha sido actualizado satisfactoriamente",
      squad: result.squad.players,
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
    const nonFormattedPlayers = await Team.findOne({ _id: teamId }).select("squad.players");
    if (!nonFormattedPlayers) {
      const error = new Error("El equipo no ha sido encontrado");
      error.statusCode = 404;
      throw error;
    }
    const players = nonFormattedPlayers.squad.players
    res.status(200).json( players );
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
    const nonFormattedSquad = await Team.findOne({ _id: teamId }).select("squad");
    if (!nonFormattedSquad) {
      const error = new Error("El equipo no ha sido encontrado");
      error.statusCode = 404;
      throw error;
    }
    const squad = nonFormattedSquad.squad
    res.status(200).json( squad);
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
    res.status(201).json({
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

exports.getManager = async (req, res, next) => {
  const teamId = req.params.teamId;
  try {
    const nonFormattedManager = await Team.findOne({ _id: teamId }).select("squad.manager");
    if (!nonFormattedManager) {
      const error = new Error("El equipo no ha sido encontrado");
      error.statusCode = 404;
      throw error;
    }

    const manager = nonFormattedManager.squad.manager
    if (!manager) {
      const error = new Error("El equipo no cuenta con un DT asignado");
      error.statusCode = 404;
      throw error;
    }
  
    res.status(200).json({ manager: manager });
  } catch (err) {
    if (!err.statusCode) {
      err.statudCode = 500;
    }
    next(err);
  }
};

const clearImage = (filePath) => {
  filePath = path.join(__dirname, "..", filePath);
  fs.unlink(filePath, (err) => console.log(err));
};
