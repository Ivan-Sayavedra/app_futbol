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
    const team2 = await Team.findOne({ _id: team2Data.id });
    const oldScoreTeam1 = match.teams[0].score;
    const oldScoreTeam2 = match.teams[1].score;
    const newScoreTeam1 = team1Data.newScore;
    const newScoreTeam2 = team2Data.newScore;
    for (let index = 0; index < match.teams.length; index++) {
      if (match.teams[index].team._id.toString() === team1Data.id) {
        match.teams[index].score = newScoreTeam1;
      }
    }
    for (let index = 0; index < match.teams.length; index++) {
      if (match.teams[index].team._id.toString() === team2Data.id) {
        match.teams[index].score = newScoreTeam2;
      }
    }
    await match.save();
    await team1.assignResult(oldScoreTeam1, oldScoreTeam2, false);
    await team2.assignResult(oldScoreTeam2, oldScoreTeam1, false);
    await team1.assignResult(newScoreTeam1, newScoreTeam2, true);
    await team2.assignResult(newScoreTeam2, newScoreTeam1, true);
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.assignInjuredPlayer = async (req,res,next) => {
  const matchId = req.body.matchId
  try{
    const match = await Match.findOne({_id: matchId})
    if(!match){
      const error = new Error("La planilla de partido no ha sido encontrada")
      error.statusCode = 404
      throw error
    }
    const teamId = req.body.teamId
    const player = req.body.player
    await match.addInjuredPlayers(teamId,player)
    res.status(200).json({message: "El jugador ha sido añadido de forma exitosa", player: player})
  }catch(err){
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
}

exports.deleteInjuredPlayer = async (req,res,next) => {
  const matchId = req.body.matchId
  try{
    const match = await Match.findOne({_id: matchId})
    if(!match){
      const error = new Error("La planilla de partido no ha sido encontrada")
      error.statusCode = 404
      throw error
    }
    const teamId = req.body.teamId
    const playerId = req.body.playerId
    await match.deleteInjuredPlayers(teamId,playerId)
    res.status(200).json({message: "El jugador ha sido eliminado de forma exitosa"})
  }catch(err){
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
}

exports.assignPlayerWithRedCard = async (req,res,next) => {
  const matchId = req.body.matchId
  try{
    const match = await Match.findOne({_id: matchId})
    if(!match){
      const error = new Error("La planilla de partido no ha sido encontrada")
      error.statusCode = 404
      throw error
    }
    const teamId = req.body.teamId
    const player = req.body.player
    await match.addPlayersWithRedCard(teamId,player)
    res.status(200).json({message: "La tarjeta amarilla ha sido añadida de forma exitosa", player: player})
  }catch(err){
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
}

exports.deletePlayerWithRedCard = async (req,res,next) => {
  const matchId = req.body.matchId
  try{
    const match = await Match.findOne({_id: matchId})
    if(!match){
      const error = new Error("La planilla de partido no ha sido encontrada")
      error.statusCode = 404
      throw error
    }
    const teamId = req.body.teamId
    const playerId = req.body.playerId
    await match.deletePlayersWithRedCard(teamId,playerId)
    res.status(200).json({message: "La tarjeta roja ha sido eliminada de forma exitosa"})
  }catch(err){
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
}

exports.assignPlayerWithYellowCard = async (req,res,next) => {
  const matchId = req.body.matchId
  try{
    const match = await Match.findOne({_id: matchId})
    if(!match){
      const error = new Error("La planilla de partido no ha sido encontrada")
      error.statusCode = 404
      throw error
    }
    const teamId = req.body.teamId
    const player = req.body.player
    await match.addPlayersWithYellowCard(teamId,player)
    res.status(200).json({message: "La tarjeta amarilla ha sido añadida de forma exitosa"})
  }catch(err){
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
}

exports.deletePlayerWithYellowCard = async (req,res,next) => {
  const matchId = req.body.matchId
  try{
    const match = await Match.findOne({_id: matchId})
    if(!match){
      const error = new Error("La planilla de partido no ha sido encontrada")
      error.statusCode = 404
      throw error
    }
    const teamId = req.body.teamId
    const playerId = req.body.playerId
    await match.deletePlayersWithYellowCard(teamId,playerId)
    res.status(200).json({message: "La tarjeta amarilla ha sido eliminada de forma exitosa"})
  }catch(err){
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
}

exports.addScorer = async (req,res,next) => {
  const matchId = req.body.matchId
  try{
    const match = await Match.findOne({_id: matchId})
    if(!match){
      const error = new Error("La planilla de partido no ha sido encontrada")
      error.statusCode = 404
      throw error
    }
    const player = req.body.player
    const teamId = req.body.teamId
    const oldScoreTeam1 = match.teams[0].score;
    const oldScoreTeam2 = match.teams[1].score;
    const team1 = await Team.findOne({_id: match.teams[0].team._id.toString()})
    const team2 = await Team.findOne({_id: match.teams[1].team._id.toString()})
    const updatedMatch = await match.addScorers(teamId,player)
    const newScoreTeam1 = updatedMatch.teams[0].score;
    const newScoreTeam2 = updatedMatch.teams[1].score;
    await team1.assignResult(oldScoreTeam1, oldScoreTeam2, false);
    await team2.assignResult(oldScoreTeam2, oldScoreTeam1, false);
    await team1.assignResult(newScoreTeam1, newScoreTeam2, true);
    await team2.assignResult(newScoreTeam2, newScoreTeam1, true);
    res.status(200).json({message: "El jugador ha sido añadido correctamente", player: player})
  }catch(err){
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
}