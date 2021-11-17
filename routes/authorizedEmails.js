const express = require("express");

const authorizedAdminController = require("../controllers/authorizedEmails");

const isAuth = require("../middleware/isAuth")

const router = express.Router();

router.post("/", authorizedAdminController.createAuthorizedEmail);

router.get("/", authorizedAdminController.getAuthorizedEmails);

router.delete("/:email",  authorizedAdminController.deleteAuthorizedEmail);

router.put("/",  authorizedAdminController.updateAuthorizedEmail)

module.exports = router;