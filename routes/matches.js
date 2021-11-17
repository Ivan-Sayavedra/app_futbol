const express = require("express");

const matchController = require("../controllers/matchController");

const isAuth = require("../middleware/isAuth")

const router = express.Router();

router.post("/", isAuth, matchController.createMatch);

router.get("/:id", matchController.getMatch);

router.get("/", matchController.getAllMatches);

router.delete("/:id", isAuth, matchController.deleteMatch);

router.patch("/date", isAuth, matchController.updateDate);

router.patch("/score", isAuth, matchController.updateScore);

router.patch("/add-injuries", isAuth, matchController.assignInjuredPlayer);

router.patch("/delete-injuries", isAuth, matchController.deleteInjuredPlayer);

router.patch("/add-red-card",isAuth,  matchController.assignPlayerWithRedCard);

router.patch("/delete-red-card", isAuth, matchController.deletePlayerWithRedCard);

router.patch("/add-yellow-card", isAuth, matchController.assignPlayerWithYellowCard);

router.patch("/delete-yellow-card", isAuth, matchController.deletePlayerWithYellowCard);

router.patch("/add-scorers", isAuth, matchController.addScorer);

router.patch("/delete-scorers", isAuth, matchController.deleteScorer);

module.exports = router;
