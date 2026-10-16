//Importaciones
const express = require("express");
const router = express.Router();

const ArticleController = require("../Controllers/ArticleController");

//Cargar middleware de autenticacion


//Subida de archivos


//Definir las rutas
router.post("/save", ArticleController.save);
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

