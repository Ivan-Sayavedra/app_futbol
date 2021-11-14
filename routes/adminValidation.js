const express = require("express");

const adminAuthController = require("../controllers/adminValidation");

const router = express.Router();

router.get("/register/:token", adminAuthController.postCreateAdmin);

router.get("/", adminAuthController.getAdmins);

router.post("/", adminAuthController.createAdmin);

router.put("/", adminAuthController.updateAdmin)

router.delete("/", adminAuthController.deleteAdmin)

module.exports = router;
