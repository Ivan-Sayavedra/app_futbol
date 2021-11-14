const mongoose = require("mongoose");

const Match = require("../models/match");

exports.createMatch = async (req, res, next) => {
  const date = new Date();
  const team1 = req.body.team1;
  const team2 = req.body.team2;
  team1.teamId = new mongoose.Types.ObjectId(team1.teamId);
  team2.teamId = new mongoose.Types.ObjectId(team2.teamId);
  try {
    const match = new Match({
      date: date,
      teams:  [team1, team2]
    });
    await match.save();
    res
      .status(200)
      .json({
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

exports.getMatch = async (req,res,next) => {
  const id = req.params.id
  try{
    const match = await Match.findOne({_id: id})
    if(!match){
      const error = new Error("La planilla de partido no ha sido encontrada")
      error.statusCode = 404
      throw error
    }
    res.status(200).json({match: match})
  }catch(err){
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
}

exports.getAllMatches = async (req,res,next) => {
  try{
    const matches = await Match.find()
    res.status(200).json({matches: matches})
  }catch(err){
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
}


