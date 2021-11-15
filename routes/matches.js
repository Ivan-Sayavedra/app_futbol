const express = require("express");

const matchController = require("../controllers/matchController");

const router = express.Router()

router.post("/", matchController.createMatch)

router.get("/:id", matchController.getMatch)

router.get("/", matchController.getAllMatches)

router.delete("/:id", matchController.deleteMatch)

router.patch("/date", matchController.updateDate)

router.patch("/score", matchController.updateScore)

module.exports = router;