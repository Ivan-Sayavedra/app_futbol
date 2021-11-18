const sgMail = require("@sendgrid/mail");
const { numericCode } = require("numeric-code");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');

const Admin = require("../models/admin");
const AuthorizedAdmin = require("../models/authorizedEmail");
const config = require("../config");

exports.getAdmins = async (req, res, next) => {
  try {
    const admins = await Admin.find();
    res.status(200).json({
      admins: admins,
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.getAdminProfile = async (req,res,next) => {
  const adminId = req.adminId;
  try{
    const user = await Admin.findOne({ _id: adminId });
    if (!user) {
      const error = new Error("El usuario no ha sido encontrado");
      error.statusCode = 404;
      throw error;
    }
      res.status(200).json({user:user})
  }catch(err){
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
}

exports.signUp = async (req, res, next) => {
  
   const userEmail = req.body.userEmail;
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = new Error('Algo fallo!');
      error.statusCode = 422;
      error.data = errors.array();
      throw error;
    }
    const authorizedAdmin = await AuthorizedAdmin.findOne({
      authorizedEmail: userEmail,
    });
    if (!authorizedAdmin) {
      const error = new Error(
        "No está autorizado para acceder a esta función"
      );
      error.statusCode = 401;
      throw error;
    }
    const admin = await Admin.findOne({ email: userEmail });
    if (admin) {
      const error = new Error("El usuario ya existe");
      error.statusCode = 422;
      throw error;
    }
    let token = numericCode();
    const usedToken = await Admin.findOne({token: token})
    if(usedToken){
      token = numericCode()
    }
    const tokenExpiration = Date.now() + 3600000;
    authorizedAdmin.token = token;
    authorizedAdmin.tokenExpiration = tokenExpiration;
    await authorizedAdmin.save();
    console.log(token)
    sgMail.setApiKey(config.sendGrid_key);
    const mail = {
      to: userEmail,
      from: "miguelrvg5@gmail.com",
      subject: "Código de validación - Piedra del águila",
      text: "texto de prueba",
      html: `<p>Para continuar con su registro, por favor ingrese el siguiente código dentro de la aplicación: </p><br>
        <h3>${token}</h3>
      `,
    };
    await sgMail.send(mail);
    res.status(200).json({
      message: "Se ha enviado un correo electrónico con el código de registro",
      email: userEmail
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.postSignUp = async (req, res, next) => {
  
  const token = req.body.token;
  try {
    const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error('Algo fallo!');
    error.statusCode = 422;
    error.data = errors.array();
    throw error;
  }
    const authorizedAdmin = await AuthorizedAdmin.findOne({
      token: token,
      tokenExpiration: { $gt: Date.now() },
    });
    if (!authorizedAdmin) {
      const error = new Error("Token inválido");
      error.statusCode = 401;
      throw error;
    }
    const email = authorizedAdmin.authorizedEmail;
    const name = req.body.userName;
    const userName = await Admin.findOne({ name: name });
    if (userName) {
      const error = new Error("El nombre de usuario ya está en uso");
      error.statusCode = 422;
      throw error;
    }
    const password = req.body.password;
    const admin = new Admin({
      email: email,
      password: password,
      name: name,
    });
    const savedAdmin = await admin.save();
    const token = jwt.sign(
      {
        email: savedAdmin.email,
        adminId: savedAdmin._id.toString()
      },
      'somesupersecretsecret'
    );
    console.log(token)
    res.status(201).json({
      message: "El usuario fue creado de forma satisfactoria",
      admin: savedAdmin,
      token: token, adminId: savedAdmin._id.toString()
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.login = async (req,res,next) => {
  
  const email = req.body.email
  const password = req.body.password
  try{
    const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error('Algo fallo!');
    error.statusCode = 422;
    error.data = errors.array();
    throw error;
  }
    const admin = await Admin.findOne({email: email})
    if(!admin){
      const error = new Error("El usuario no ha sido encontrado")
      error.statusCode = 404
      throw error
    }
    const validPassword = await Admin.findOne({password: password})
    if(!validPassword){
      const error = new Error("La contraseña ingresada es incorrecta")
      error.statusCode = 401
      throw error
    }
    const token = jwt.sign(
      {
        email: admin.email,
        adminId: admin._id.toString()
      },
      'somesupersecretsecret',
      { expiresIn: '2h' }
    );
    console.log(token)
    res.status(200).json({ token: token, adminId: admin._id.toString() });
  }catch(err){
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
}

exports.updateAdmin = async (req, res, next) => {
 const adminId = req.adminId
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = new Error('Algo fallo!');
      error.statusCode = 422;
      error.data = errors.array();
      throw error;
    }
    const admin = await Admin.findOne({ _id: adminId });
    if (!admin) {
      const error = new Error("EL usuario no ha sido encontrado");
      error.statusCode = 404;
      throw error;
    }
    const actualPassword = req.body.password;
    if(actualPassword !== admin.password){
      const error = new Error("Contraseña incorrecta");
      error.statusCode = 401;
      throw error;
    }
    const name = req.body.newUserName;
    if(name !== admin.name){
      const userName = await Admin.findOne({ name: name });
      if (userName) {
        const error = new Error("El nombre de usuario ya está en uso");
        error.statusCode = 422;
        throw error;
      }
    }   
    admin.email = req.body.newEmail;
    admin.password = req.body.newPassword;
    admin.name = name
    await admin.save();
    res.status(200).json({
      message: "Los datos del usuario han sido actualizados satisfactoriamente",
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
  const adminId = req.adminId;
  try {
    const user = await Admin.findOne({ _id: adminId });
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
