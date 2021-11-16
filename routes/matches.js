const express = require("express");

const matchController = require("../controllers/matchController");

const router = express.Router();

router.post("/", matchController.createMatch);

router.get("/:id", matchController.getMatch);

router.get("/", matchController.getAllMatches);

router.delete("/:id", matchController.deleteMatch);

router.patch("/date", matchController.updateDate);

router.patch("/score", matchController.updateScore);

router.patch("/scorers", matchController.addScorer);

router.patch("/add-injuries", matchController.assignInjuredPlayer);

router.patch("/delete-injuries", matchController.deleteInjuredPlayer);

router.patch("/add-red-card", matchController.assignPlayerWithRedCard);

router.patch("/delete-red-card", matchController.deletePlayerWithRedCard);

router.patch("/add-yellow-card", matchController.assignPlayerWithYellowCard);

router.patch("/delete-yellow-card", matchController.deletePlayerWithYellowCard);

module.exports = router;
