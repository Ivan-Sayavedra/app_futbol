const Fixture = require("../models/fixture.js");

exports.getFixture = async (req, res, next) => {
  const day = req.params.day;
  try {
    const fixture = await Fixture.findOne({ day: day })
      .populate({ path: "matches.localTeam", select: "name badgeURL _id" })
      .populate({ path: "matches.awayTeam", select: "name badgeURL _id" })
      .exec();
    if (!fixture) {
      const error = new Error("La jornada no ha sido encontrada");
      error.statusCode = 404;
      throw error;
    }
    if (fixture.length === 0) {
      const error = new Error(
        "No se ha encontrado ningún partido en esta jornada"
      );
      error.statusCode = 404;
      throw error;
    }
    res.status(200).json({ fixture: fixture });
  } catch (err) {
    if (!err.statusCode) {
      err.statudCode = 500;
    }
    next(err);
  }
};

exports.getAllFixtures = async (req, res, next) => {
  try {
    const fixtures = await Fixture.find()
      .populate({ path: "matches.localTeam", select: "name badgeURL _id" })
      .populate({ path: "matches.awayTeam", select: "name badgeURL _id" })
      .exec();
    res.status(200).json({ fixtures: fixtures });
  } catch (err) {
    if (!err.statusCode) {
      err.statudCode = 500;
    }
    next(err);
  }
};

exports.createFixture = async (req, res, next) => {
  console.log(new Date());
  try {
    const day = req.body.day;
    const matches = req.body.matches;
    const fixture = new Fixture({
      matches: matches,
      day: day,
    });
    const fixtureDay = await Fixture.findOne({day: day})
    if(fixtureDay){
      const error = new Error(`La jornada número ${day} ya ha sido creada`)
      error.statusCode = 401
      throw error
    }
    await fixture.save()      
    res.status(200).json({
      message: "La jornada ha sido creada de forma exitosa"
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statudCode = 500;
    }
    next(err);
  }
};

exports.deleteFixture = async (req, res, next) => {
  try {
    const id = req.params.id;
    const fixture = await Fixture.findOne({ _id: id });
    if (!fixture) {
      const error = new Error("La jornada no ha sido encontrada");
      error.statusCode = 404;
      throw error;
    }
    await Fixture.findByIdAndRemove({ _id: id });
    res
      .status(200)
      .json({ message: "La jornada ha sido eliminada de forma exitosa" });
  } catch (err) {
    if (!err.statusCode) {
      err.statudCode = 500;
    }
    next(err);
  }
};

exports.changeDay = async (req, res, next) => {
  try {
    const day = req.body.actualDay;
    const fixture = await Fixture.findOne({ day: day });
    if (!fixture) {
      const error = new Error("La jornada no ha sido encontrada");
      error.statusCode = 404;
      throw error;
    }
    const newDay = req.body.newDay;
    fixture.day = newDay;
    const updatedFixture = await fixture
      .save()
    res.status(200).json({
      message: "La jornada ha sido actualizada"
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statudCode = 500;
    }
    next(err);
  }
};

exports.getMatchesByDate = async (req, res, next) => {
  const date = new Date(req.params.date);
  try {
    const matches = Fixture.find({ date: date }).populate(
      "matches.localTeam",
      "matches.awayTeam"
    );
    if (matches.length === 0) {
      const error = new Error(
        "No se ha encontrado ningún partido en esta jornada"
      );
      error.statusCode = 404;
      throw error;
    }
    res.status(200).json({ matches: matches });
  } catch (err) {
    if (!err.statusCode) {
      err.statudCode = 500;
    }
    next(err);
  }
};

exports.createMatch = async (req, res, next) => {
  const fixtureId = req.body.fixtureId;
  try {
    const fixture = await Fixture.findOne({ _id: fixtureId });
    if (!fixture) {
      const error = new Error("La jornada no ha sido encontrada");
      error.statusCode = 404;
      throw error;
    }
    const date = new Date(req.body.date);
    const localTeam = req.body.localTeam;
    const awayTeam = req.body.awayTeam;
    await fixture.createMatch(date, localTeam, awayTeam);
    res
      .status(200)
      .json({ message: "El partido ha sido creado satisfactoriamente" });
  } catch (err){
    if (!err.statusCode) {
      err.statudCode = 500;
    }
    next(err);
  }
};

exports.deleteMatch = async (req, res, next) => {
  const fixtureId = req.body.fixtureId;
  try {
    const fixture = await Fixture.findOne({ _id: fixtureId });
    if (!fixture) {
      const error = new Error("La jornada no ha sido encontrada");
      error.statusCode = 404;
      throw error;
    }
    const matchId = req.body.matchId;
    const updatedFixture = await fixture
      .deleteMatch(matchId)
    res.status(200).json({
      message: "El partido ha sido eliminado de forma satisfactoria",
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statudCode = 500;
    }
    next(err);
  }
};

exports.editMatch = async (req, res, next) => {
  const fixtureId = req.body.fixtureId;
  try {
    const fixture = await Fixture.findOne({ _id: fixtureId });
    if (!fixture) {
      const error = new Error("La jornada no ha sido encontrada");
      error.statusCode = 404;
      throw error;
    }
    const matchId = req.body.matchId;
    const localTeam = req.body.localTeam;
    const awayTeam = req.body.awayTeam;
    const date = req.body.newDate;
    const updatedFixture = await fixture
      .editMatch(matchId, localTeam, awayTeam, date)
    res
      .status(200)
      .json({
        message: "El partido ha sido actualizado",
      });
  } catch (err) {
    if (!err.statusCode) {
      err.statudCode = 500;
    }
    next(err);
  }
};
