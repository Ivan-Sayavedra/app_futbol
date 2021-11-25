const Match = require("../models/match");
const Team = require("../models/team");

exports.createMatch = async (req, res, next) => {
  const date = new Date(req.body.date);
  const localTeamData = req.body.localTeam;
  const awayTeamData = req.body.awayTeam;
  try {
    const localTeam = await Team.findOne({ _id: localTeamData.teamId });
    if (!localTeam) {
      const error = new Error("El equipo local no ha sido encontrado");
      error.statusCode = 404;
      throw error;
    }
    const awayTeam = await Team.findOne({ _id: awayTeamData.teamId });
    if (!awayTeam) {
      const error = new Error("El equipo visitante no ha sido encontrado");
      error.statusCode = 404;
      throw error;
    }
    localTeamData.team = {
      _id: localTeam._id,
      name: localTeam.name,
      badgeURL: localTeam.badgeURL,
    };
    awayTeamData.team = {
      _id: awayTeam._id,
      name: awayTeam.name,
      badgeURL: awayTeam.badgeURL,
    };
    const match = new Match({
      date: date,
      teams: [localTeamData, awayTeamData],
    });
    await localTeam.assignResult(localTeamData.score, awayTeamData.score, true);
    await awayTeam.assignResult(awayTeamData.score, localTeamData.score, true);
    const savedMatch = await match.save();
    res.status(200).json({
      message: "La planilla de partido ha sido creada satisfactoriamente",
      match: savedMatch,
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.getMatch = async (req, res, next) => {
  const id = req.params.id;
  try {
    const match = await Match.findOne({ _id: id });
    if (!match) {
      const error = new Error("La planilla de partido no ha sido encontrada");
      error.statusCode = 404;
      throw error;
    }
    res.status(200).json(match);
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.getAllMatches = async (req, res, next) => {
  try {
    const matches = await Match.find().select(
      "date teams.team._id teams.team.name teams.team.badgeURL teams.score "
    );
    res.status(200).json(matches);
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.deleteMatch = async (req, res, next) => {
  const matchId = req.params.id;
  try {
    const match = await Match.findOne({ _id: matchId });
    if (!match) {
      const error = new Error("La planilla de partido no ha sido encontrada");
      error.statusCode = 404;
      throw error;
    }
    const oldScorelocalTeam = match.teams[0].score;
    const oldScoreAwayTeam = match.teams[1].score;
    const localTeam = await Team.findOne({ _id: match.teams[0].team._id });
    if (localTeam) {
      await localTeam.assignResult(oldScorelocalTeam, oldScoreAwayTeam, false);
    }
    const awayTeam = await Team.findOne({ _id: match.teams[1].team._id });
    if (awayTeam) {
      await awayTeam.assignResult(oldScoreAwayTeam, oldScorelocalTeam, false);
    }
    await Match.findOneAndRemove({ _id: matchId });
    res.status(200).json({
      message: "La planilla de partido ha sido eliminada satisfactoriamente",
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.updateDate = async (req, res, next) => {
  const matchId = req.body.matchId;
  try {
    const match = Match.findOne({ _id: matchId });
    if (!match) {
      const error = new Error("La planilla de partido no ha sido encontrada");
      error.statusCode = 404;
      throw error;
    }
    const date = new Date(req.body.date);
    match.date = date;
    await match.save();
    res.status(200).json({
      message: "La fecha ha sido actualizada satisfactoriamente",
      date: date,
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.updateScore = async (req, res, next) => {
  const matchId = req.body.matchId;
  try {
    const match = await Match.findOne({ _id: matchId });
    if (!match) {
      const error = new Error("La planilla de partido no ha sido encontrada");
      error.statusCode = 404;
      throw error;
    }
    const newScoreLocalTeam = req.body.localTeamScore;
    const newScoreAwayTeam = req.body.awayTeamScore;
    const oldScorelocalTeam = match.teams[0].score;
    const oldScoreAwayTeam = match.teams[1].score;
    match.teams[0].score = newScoreLocalTeam;
    match.teams[1].score = newScoreAwayTeam;
    const localTeam = await Team.findOne({ _id: match.teams[0].team._id });
    if (localTeam) {
      await localTeam.assignResult(oldScorelocalTeam, oldScoreAwayTeam, false);
      await localTeam.assignResult(newScoreLocalTeam, newScoreAwayTeam, true);
    }
    const awayTeam = await Team.findOne({ _id: match.teams[1].team._id });
    if (awayTeam) {
      await awayTeam.assignResult(oldScoreAwayTeam, oldScorelocalTeam, false);
      await awayTeam.assignResult(newScoreAwayTeam, newScoreLocalTeam, true);
    }
    await match.save();
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.assignInjuredPlayer = async (req, res, next) => {
  const matchId = req.body.matchId;
  try {
    const match = await Match.findOne({ _id: matchId });
    if (!match) {
      const error = new Error("La planilla de partido no ha sido encontrada");
      error.statusCode = 404;
      throw error;
    }
    const teamId = req.body.teamId;
    const player = req.body.player;
    await match.addInjuredPlayers(teamId, player);
    res.status(200).json({
      message: "El jugador ha sido añadido de forma exitosa",
      player: player,
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.deleteInjuredPlayer = async (req, res, next) => {
  const matchId = req.body.matchId;
  try {
    const match = await Match.findOne({ _id: matchId });
    if (!match) {
      const error = new Error("La planilla de partido no ha sido encontrada");
      error.statusCode = 404;
      throw error;
    }
    const teamId = req.body.teamId;
    const playerId = req.body.playerId;
    await match.deleteInjuredPlayers(teamId, playerId);
    res
      .status(200)
      .json({ message: "El jugador ha sido eliminado de forma exitosa" });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.assignPlayerWithRedCard = async (req, res, next) => {
  const matchId = req.body.matchId;
  try {
    const match = await Match.findOne({ _id: matchId });
    if (!match) {
      const error = new Error("La planilla de partido no ha sido encontrada");
      error.statusCode = 404;
      throw error;
    }
    const teamId = req.body.teamId;
    const player = req.body.player;
    await match.addPlayersWithRedCard(teamId, player);
    res.status(200).json({
      message: "La tarjeta amarilla ha sido añadida de forma exitosa",
      player: player,
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.deletePlayerWithRedCard = async (req, res, next) => {
  const matchId = req.body.matchId;
  try {
    const match = await Match.findOne({ _id: matchId });
    if (!match) {
      const error = new Error("La planilla de partido no ha sido encontrada");
      error.statusCode = 404;
      throw error;
    }
    const teamId = req.body.teamId;
    const playerId = req.body.playerId;
    await match.deletePlayersWithRedCard(teamId, playerId);
    res
      .status(200)
      .json({ message: "La tarjeta roja ha sido eliminada de forma exitosa" });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.assignPlayerWithYellowCard = async (req, res, next) => {
  const matchId = req.body.matchId;
  try {
    const match = await Match.findOne({ _id: matchId });
    if (!match) {
      const error = new Error("La planilla de partido no ha sido encontrada");
      error.statusCode = 404;
      throw error;
    }
    const teamId = req.body.teamId;
    const player = req.body.player;
    await match.addPlayersWithYellowCard(teamId, player);
    res.status(200).json({
      message: "La tarjeta amarilla ha sido añadida de forma exitosa",
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.deletePlayerWithYellowCard = async (req, res, next) => {
  const matchId = req.body.matchId;
  try {
    const match = await Match.findOne({ _id: matchId });
    if (!match) {
      const error = new Error("La planilla de partido no ha sido encontrada");
      error.statusCode = 404;
      throw error;
    }
    const teamId = req.body.teamId;
    const playerId = req.body.playerId;
    await match.deletePlayersWithYellowCard(teamId, playerId);
    res.status(200).json({
      message: "La tarjeta amarilla ha sido eliminada de forma exitosa",
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.addScorer = async (req, res, next) => {
  const matchId = req.body.matchId;
  try {
    const match = await Match.findOne({ _id: matchId });
    if (!match) {
      const error = new Error("La planilla de partido no ha sido encontrada");
      error.statusCode = 404;
      throw error;
    }
    const player = req.body.player;
    const teamId = req.body.teamId;
    const oldScorelocalTeam = match.teams[0].score;
    const oldScoreAwayTeam = match.teams[1].score;
    const updatedMatch = await match.addScorers(teamId, player);
    const newScoreLocalTeam = updatedMatch.teams[0].score;
    const newScoreAwayTeam = updatedMatch.teams[1].score;
    const localTeam = await Team.findOne({
      _id: match.teams[0].team._id.toString(),
    });
    if (localTeam) {
      await localTeam.assignResult(oldScorelocalTeam, oldScoreAwayTeam, false);
      await localTeam.assignResult(newScoreLocalTeam, newScoreAwayTeam, true);
    }
    const awayTeam = await Team.findOne({
      _id: match.teams[1].team._id.toString(),
    });
    if (awayTeam) {
      await awayTeam.assignResult(oldScoreAwayTeam, oldScorelocalTeam, false);
      await awayTeam.assignResult(newScoreAwayTeam, newScoreLocalTeam, true);
    }
    res.status(200).json({
      message: "El jugador ha sido añadido correctamente",
      player: player,
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.deleteScorer = async (req, res, next) => {
  const matchId = req.body.matchId;
  try {
    const match = await Match.findOne({ _id: matchId });
    if (!match) {
      const error = new Error("La planilla de partido no ha sido encontrada");
      error.statusCode = 404;
      throw error;
    }
    const player = req.body.player;
    const teamId = req.body.teamId;
    const oldScorelocalTeam = match.teams[0].score;
    const oldScoreAwayTeam = match.teams[1].score;
    const updatedMatch = await match.deleteScorers(teamId, player);
    const newScoreLocalTeam = updatedMatch.teams[0].score;
    const newScoreAwayTeam = updatedMatch.teams[1].score;
    const localTeam = await Team.findOne({
      _id: match.teams[0].team._id.toString(),
    });
    if (localTeam) {
      await localTeam.assignResult(oldScorelocalTeam, oldScoreAwayTeam, false);
      await localTeam.assignResult(newScoreLocalTeam, newScoreAwayTeam, true);
    }
    const awayTeam = await Team.findOne({
      _id: match.teams[1].team._id.toString(),
    });
    if (awayTeam) {
      await awayTeam.assignResult(oldScoreAwayTeam, oldScorelocalTeam, false);
      await awayTeam.assignResult(newScoreAwayTeam, newScoreLocalTeam, true);
    }
    res.status(200).json({
      message: "El jugador ha sido añadido correctamente",
      player: player,
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};
