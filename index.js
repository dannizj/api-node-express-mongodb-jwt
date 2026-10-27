//Cargar variables de entorno (.env)
require("dotenv").config({ quiet: true });

//Importar dependencias
const express = require("express");
const cors = require("cors");

//Conectarme a la bd
const connection = require("./DataBase/connection");
connection();

//Crear servidor de Node
const app = express();
const port = 3907;

//Configurar el cors
app.use(cors());

//Convertir los datos del body a objectos de js
app.use(express.json());
app.use(express.urlencoded({extended: true}));

//Cargar configuraicon de rutas
const userRoutes = require("./Routes/user");
const articleRoutes = require("./Routes/article");

app.use("/api/user", userRoutes);
app.use("/api/article", articleRoutes);

//Ruta de pruebas
app.get("/pruebitas", (req, res) => {
    return res.status(200).json({
        "titulo": "man to the moon",
        "descripcion": "Pelicula de Jim carray"
    });
});

//Poner el servidor a escuchar peticiones https
app.listen(port, () =>{
    console.log("Servidor de Node escuchando en el puerto " + port);
})