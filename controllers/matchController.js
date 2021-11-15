const mongoose = require("mongoose");

const Match = require("../models/match");
const Team = require("../models/team");

exports.createMatch = async (req, res, next) => {
  const date = new Date(req.body.date);
  const team1Data = req.body.team1;
  const team2Data = req.body.team2;
  try {
    const team1 = await Team.findOne({ _id: team1Data.teamId });
    if (!team1) {
      const error = new Error("El equipo 1 no ha sido encontrado");
      error.statusCode = 404;
      throw error;
    }
    const team2 = await Team.findOne({ _id: team2Data.teamId });
    if (!team2) {
      const error = new Error("El equipo 2 no ha sido encontrado");
      error.statusCode = 404;
      throw error;
    }
    team1Data.team = {
      squad: team1.squad,
      _id: team1._id,
      name: team1.name,
      badgeURL: team1.badgeURL,
    };
    team2Data.team = {
      squad: team2.squad,
      _id: team2._id,
      name: team2.name,
      badgeURL: team2.badgeURL,
    };
    const match = new Match({
      date: date,
      teams: [team1Data, team2Data],
    });
    await team1.assignResult(team1Data.score, team2Data.score, true);
    await team2.assignResult(team2Data.score, team1Data.score, true);
    await match.save();
    res.status(200).json({
      message: "La planilla de partido ha sido creada satisfactoriamente",
      match: match,
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
    res.status(200).json({ match: match });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.getAllMatches = async (req, res, next) => {
  try {
    const matches = await Match.find();
    res.status(200).json({ matches: matches });
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
    const team1 = await Team.findOne({_id: match.teams[0].team._id})
    const team2 = await Team.findOne({_id: match.teams[1].team._id})
    const oldScoreTeam1 = match.teams[0].score;
    const oldScoreTeam2 = match.teams[1].score;
    await team1.assignResult(oldScoreTeam1, oldScoreTeam2, false);
    await team2.assignResult(oldScoreTeam2, oldScoreTeam1, false);
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
    const team1Data = req.body.team1;
    const team2Data = req.body.team2;
    const team1 = await Team.findOne({ _id: team1Data.id });
    if (!team1) {
      const error = new Error("El equipo 1 no ha sido encontrado");
      error.statusCode = 404;
      throw error;
    }
    const team2 = await Team.findOne({ _id: team2Data.id });
    if (!team2) {
      const error = new Error("El equipo 2 no ha sido encontrado");
      error.statusCode = 404;
      throw error;
    }
    const oldScoreTeam1 = match.teams[0].score;
    const oldScoreTeam2 = match.teams[1].score;
    const newScoreTeam1 = team1Data.newScore;
    const newScoreTeam2 = team2Data.newScore;
    for (let index = 0; index < match.teams.length; index++) {
      if (match.teams[index].team._id.toString() === team1._id.toString()) {
        match.teams[index].score = newScoreTeam1;
      }
    }
    for (let index = 0; index < match.teams.length; index++) {
      if (match.teams[index].team._id.toString() === team2._id.toString()) {
        match.teams[index].score = newScoreTeam2;
      }
    }
    await team1.assignResult(oldScoreTeam1, oldScoreTeam2, false);
    await team2.assignResult(oldScoreTeam2, oldScoreTeam1, false);
    await team1.assignResult(newScoreTeam1, newScoreTeam2, true);
    await team2.assignResult(newScoreTeam2, newScoreTeam1, true);
    await match.save();
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};
