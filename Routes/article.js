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
router.post("/generate-ia/:theme", auth, ArticleController.generate);
router.put("/update", auth, ArticleController.update);
router.delete("/remove/:id", auth, ArticleController.remove);
router.get("/by-user/:userId/:page", ArticleController.byUser);
router.get("/search/:search", ArticleController.search);
router.put("/upload/:id", [auth, uploadsPoster.single("file0")], ArticleController.upload);
router.get("/poster/:file", ArticleController.poster);

//Exportar las rutas
module.exports = router;

