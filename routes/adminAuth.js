const express = require("express");
const { body } = require("express-validator");

const adminAuthController = require("../controllers/adminAuth");
const isAuth = require("../middleware/isAuth");

const router = express.Router();

router.get("/all", adminAuthController.getAdmins);

router.get("/", isAuth, adminAuthController.getAdminProfile);

router.post(
  "/register",
  [
    body("password").trim().isLength({ min: 8 }).withMessage("La contraseña debe de tener un mínimo de 8 carácteres"),
    body("userName").trim().not().isEmpty(),
  ],
  adminAuthController.postSignUp
);

router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Ingresar un email válido"),
    body("password").trim(),
  ],
  adminAuthController.login
);

router.post(
  "/",
  [body("userEmail").isEmail().withMessage("Ingresar un email válido")],
  adminAuthController.signUp
);

router.put(
  "/",
  isAuth,
  [
    body("newEmail")
      .isEmail()
      .withMessage("Ingresar un email válido")
      .normalizeEmail(),
    body("newPassword").trim().isLength({ min: 8 }).withMessage("La contraseña debe de tener un mínimo de 8 carácteres"),
    body("newUserName").trim().not().isEmpty(),
  ],
  adminAuthController.updateAdmin
);

router.delete("/", isAuth, adminAuthController.deleteAdmin);

module.exports = router;
