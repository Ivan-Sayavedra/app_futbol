const express = require("express");

const matchController = require("../controllers/matchController");

const router = express.Router()

router.post("/", matchController.createMatch)

router.get("/:id", matchController.getMatch)

router.post("/", matchController.getAllMatches)

module.exports = router;