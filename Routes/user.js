//Importaciones
const express = require("express");
const router = express.Router();
const UserController = require("../Controllers/UserController");
const {auth} = require("../Middlewares/auth");

//Subida de archivos
const multer = require("multer");

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./Uploads/Avatars");
    },
    filename: (req, file, cb) => {
        cb(null, "avatar-" + Date.now() + "-" + file.originalname);
    }
});

const uploadsAvatar = multer({storage});

//Definir las rutas
router.post("/register", UserController.register);
router.post("/login", UserController.login);
router.get("/profile/:id", UserController.profile);
router.put("/update", auth, UserController.update);
router.put("/upload", [auth, uploadsAvatar.single("file0")], UserController.upload);
router.get("/avatar/:file", UserController.avatar);

//Exportar las rutas
module.exports = router;

