const sgMail = require("@sendgrid/mail");
const crypto = require("crypto-js");

const Admin = require("../models/admin");
const AuthorizedAdmin = require("../models/authorizedEmail");

exports.getAdmins = async (req, res, next) => {
  try {
    const admins = await Admin.find();
    res.status(200).json({
      admins: admins,
    });
  } catch (err) {
    console.log(err);
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.createAdmin = async (req, res, next) => {
  const userEmail = req.body.userEmail;
  console.log(userEmail);
  try {
    const authorizedAdmin = await AuthorizedAdmin.findOne({
      authorizedEmail: userEmail,
    });
    if (!authorizedAdmin) {
      const error = new Error(
        "No cuenta con los permisos necesarios para acceder a esta función"
      );
      error.statusCode = 401;
      throw error;
    }
    const encrypt = crypto.AES.encrypt(
      "Email token",
      "super secret"
    ).toString();
    const token = encrypt.replace(/[^a-zA-Z0-9]/g,'');
    const tokenExpiration = Date.now() + 3600000;
    console.log(token);
    authorizedAdmin.token = token;
    authorizedAdmin.tokenExpiration = tokenExpiration;
    const authorizedAdminSaved = await authorizedAdmin.save();

    sgMail.setApiKey(
      "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"
    );
    const mail = {
      to: userEmail,
      from: "miguelrvg5@gmail.com",
      subject: "Hola",
      text: "texto de prueba",
      html: `<p>You requested a password reset</p>
      <p>Click this <a href="http://localhost:3000/adminAuth/register/${token}"> link</a> to set a new password.</p>`,
    };
    const sentEmail = await sgMail.send(mail);
    res.status(200).json({
      message: "Se ha enviado un correo electrónico con el link de registro",
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.postCreateAdmin = async (req, res, next) => {
  const token = req.params.token;
  try {
    const authorizedAdmin = await AuthorizedAdmin.findOne({
      token: token,
      tokenExpiration: { $gt: Date.now() },
    });
    if (!authorizedAdmin) {
      const error = new Error("Token inválido");
      error.statusCode = 401;
      throw error;
    }
    let admin = await Admin.findOne({ email: authorizedAdmin.authorizedEmail });
    if (admin) {
      const error = new Error("El usuario ya existe");
      error.statusCode = 422;
      throw error;
    }
    admin = new Admin({
      email: authorizedAdmin.authorizedEmail,
      password: "hola",
      name: "Miguel",
    });
    const savedAdmin = await admin.save();
    res.status(201).json({
      message: "El usuario fue creado de forma satisfactoria",
      admin: savedAdmin,
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.updateAdmin = async (req, res, next) => {
  const email = req.body.email;
  try {
    const admin = await Admin.findOne({ email: email });
    if (!admin) {
      const error = new Error("EL usuario no ha sido encontrado");
      error.statusCode = 404;
      throw error;
    }
    admin.email = req.body.newEmail;
    admin.password = req.body.newPassword;
    admin.name = req.body.newName;
    const adminUpdated = await admin.save();
    res.status(200).json({
      message: "El usuario se ha actualizado satisfactoriamente",
      admin: admin,
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.deleteAdmin = async (req, res, next) => {
  const email = req.body.email;
  try {
    const user = await Admin.findOne({ email: email });
    if (!user) {
      const error = new Error("El usuario no ha sido encontrado");
      error.statusCode = 404;
      throw error;
    }
    const password = req.body.password;
    if (password !== user.password) {
      const error = new Error("Contraseña incorrecta");
      error.statusCode = 401;
      throw error;
    }
    const deletedUser = await Admin.findOneAndRemove({ email: email });
    res
      .status(200)
      .json({ message: "El usuario ha sido eliminado", user: deletedUser });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};
