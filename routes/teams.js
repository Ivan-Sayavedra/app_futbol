const express = require("express");
const { body } = require("express-validator");

const teamsController = require("../controllers/teamsController");
const isAuth = require("../middleware/isAuth");

const router = express.Router();

router.post(
  "/",
  isAuth,  teamsController.createTeam
);

router.get("/positions", teamsController.getPositions);

router.get("/:id", teamsController.getTeam);

router.get("/", teamsController.getAllTeams);

router.delete("/:id", isAuth, teamsController.deleteTeam);

router.patch(
  "/name",
  isAuth,
  teamsController.editTeamName
);

router.patch("/badge", isAuth, teamsController.editBadgeURL);

router.patch("/add-player", isAuth, teamsController.addPlayer);

router.post("/delete-player", isAuth, teamsController.removePlayer);

router.patch("/edit-player", isAuth, teamsController.editPlayer);

router.get("/players/:teamId", teamsController.getPlayers);

router.get("/squad/:teamId", teamsController.getSquad);

router.post("/manager", isAuth, teamsController.addManager);

router.get("/manager/:teamId", teamsController.getManager);

module.exports = router;

// router.post("/result", teamsController.assignResults);
