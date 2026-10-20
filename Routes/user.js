//Importaciones
const express = require("express");
const router = express.Router();
const UserController = require("../Controllers/UserController");
const {auth} = require("../Middlewares/auth");

//Subida de archivos


//Definir las rutas
router.post("/register", UserController.register);
router.post("/login", UserController.login);
router.get("/profile/:id", UserController.profile);
router.put("/update", UserController.update);
router.put("/upload/:id", UserController.upload);
router.get("/avatar/:file", UserController.avatar);
router.get("/solo-para-identificados", auth, UserController.soloParaUsuariosIdentificados);

//Exportar las rutas
module.exports = router;

//reload

