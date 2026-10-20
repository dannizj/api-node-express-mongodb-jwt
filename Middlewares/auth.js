// Importar modulos
const jwt = require("jwt-simple");

// Importar la clave secreta
const {secret} = require("../Helpers/jwt");

// Middleware de autenticacion
exports.auth = (req, res, next) => {

    // Comprobar si me llego la cabecera de autenticacion
    if(!req.headers.authorization){

        return res.status(404).json({
            status: "error",
            message: "La peticion no tiene la autenticacion !!"
        });
    }

    // Limpiar el token
    let token = req.headers.authorization.replace(/['"]+/g, "");

    // Decodificar el token
    try {

        let payload = jwt.decode(token, secret);

        // Comprobar la expiracion del token
        let now = Math.floor(Date.now() / 1000);

        if(payload.exp <= now){
             return res.status(401).json({
                status: "error",
                message: "Token expirado  !!"
            });
        }

        // Agregar los datos del usuario a la request
        req.user = payload;

        
    } catch (error) {
        return res.status(404).json({
            status: "error",
            message: "Token invalido !!"
        });
    }

   

    // Pasar a la accion
    next();
}




