const express = require("express");

const teamsController = require("../controllers/teams");

const router = express.Router();

router.post("/", teamsController.createTeam);

router.get("/", teamsController.getTeams);

router.delete("/:id", teamsController.deleteTeam);

router.patch("/name", teamsController.editTeamName);

router.patch("/badge", teamsController.editBadgeURL);

router.patch("/add-player", teamsController.addPlayer);

router.post("/delete-player", teamsController.removePlayer);

router.patch("/edit-player", teamsController.editPlayer);

router.get("/players/:teamId", teamsController.getPlayers);

router.get("/squad/:teamId", teamsController.getSquad);

router.post("/manager", teamsController.addManager);

router.get("/manager/:teamId", teamsController.getManager);

module.exports = router;

// router.post("/result", teamsController.assignResults);