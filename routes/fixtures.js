const express = require("express");

const fixturesController = require("../controllers/fixturesController");
const isAuth = require("../middleware/isAuth");

const router = express.Router()

router.get("/date/:date", fixturesController.getMatchesByDate);

router.get("/:day", fixturesController.getFixture);

router.get("/", fixturesController.getAllFixtures);

router.post("/", isAuth, fixturesController.createFixture);

router.delete("/:id", isAuth, fixturesController.deleteFixture);

router.patch("/day", isAuth, fixturesController.changeDay);

router.patch("/add-match", isAuth, fixturesController.createMatch);

router.patch("/delete-match", isAuth, fixturesController.deleteMatch);

router.patch("/edit-match", isAuth, fixturesController.editMatch);

module.exports = router;
