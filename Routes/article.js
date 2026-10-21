//Importaciones
const express = require("express");
const router = express.Router();
const {auth} = require("../Middlewares/auth");
const ArticleController = require("../Controllers/ArticleController");

//Subida de archivos
const multer = require("multer");

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./Uploads/Posters");
    },
    filename: (req, file, cb) => {
        cb(null, "poster-" + Date.now() + "-" + file.originalname);
    }
});

const uploadsPoster = multer({storage});


//Definir las rutas
router.post("/save", auth, ArticleController.save);
router.get("/list/:page", ArticleController.list );
router.get("/detail/:id", ArticleController.detail);
router.post("/generate-ia", ArticleController.generate);
router.put("/update", ArticleController.update);
router.delete("/remove/:id", ArticleController.remove);
router.get("/by-user/:id", ArticleController.byUser);
router.get("/search/:search", ArticleController.search);
router.put("/upload/:id", ArticleController.upload);
router.get("/poster/:id", ArticleController.poster);

//Exportar las rutas
module.exports = router;

