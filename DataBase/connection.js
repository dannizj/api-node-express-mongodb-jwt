//Importar la dependencia de mongoose
const mongoose = require("mongoose");

//Conectarme a mongodb
const connection = async() => {
    try {
        
        await mongoose.connect("mongodb://127.0.0.1:27017/bd-blog");
        console.log("Te has conectado correctamente a la BD Blog");

    } catch (error) {
        console.log(error);

        throw new Error("No se ha podido conectar a la base de datos");        
    }
}

//Exportar la conexion
module.exports = connection