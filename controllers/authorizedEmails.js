const AuthorizedAdmin = require("../models/authorizedEmail");

exports.getAuthorizedEmails = async (req, res, next) => {
  try {
    const authorizedAdmins = await AuthorizedAdmin.find();
    res.status(200).json({
      authorizatedAdmins: authorizedAdmins,
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.createAuthorizedEmail = async (req, res, next) => {
  const email = req.params.email;
  try {
    const authorizedAdmin = await AuthorizedAdmin.findOne({
      authorizedEmail: email,
    });
    if (authorizedAdmin) {
      const error = new Error("El correo ya se encuentra registrado");
      error.statusCode = 422;
      throw error;
    }
    const newAuthorizedAdmin = new AuthorizedAdmin({
      authorizedEmail: email,
    });

    await newAuthorizedAdmin.save();
    res
      .status(201)
      .json({
        message: "El correo ha sido registrado satisfactoriamente",
        authorizedAdmin: newAuthorizedAdmin,
      });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.deleteAuthorizedEmail = async (req, res, next) => {
  const email = req.params.email;
  try {
    const authorizedAdmin = await AuthorizedAdmin.findOne({
      authorizedEmail: email,
    });
    if (!authorizedAdmin) {
      const error = new Error("El correo no ha sido encontrado");
      error.statusCode = 404;
      throw error;
    }
     await AuthorizedAdmin.findOneAndRemove({
      authorizedEmail: email,
    });
    res
      .status(200)
      .json({ message: "El correo ha sido eliminado satisfactoriamente" });
  } catch (err) {
    if (!err.statusCode) {
      err.statudCode = 500;
    }
    next(err);
  }
};

exports.updateAuthorizedEmail = async (req, res, next) => {
  const email = req.body.email;
  const newEmail = req.body.newEmail;
  try {
    const authorizedAdmin = await AuthorizedAdmin.findOne({
      authorizedEmail: email,
    });
    if (!authorizedAdmin) {
      const error = new Error("El correo no ha sido encontrado");
      error.statusCode = 404;
      throw error;
    }
    authorizedAdmin.authorizedEmail = newEmail;
    const authorizedAdminUpdated = await authorizedAdmin.save();
    res
      .status(200)
      .json({
        Message: "El correo ha sido actualizado",
        authorizedAdmin: authorizedAdminUpdated,
      });
  } catch (err) {
    if (!err.statusCode) {
      err.statudCode = 500;
    }
    next(err);
  }
};
