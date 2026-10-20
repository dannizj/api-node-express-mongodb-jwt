// Importar dependencias
const jwt = require("jwt-simple");

// Clave secreta
const secret = "Clave-de-mi-backend-DE-NODE-puntoJS";

// Crear funcion para generar tokens
const createToken = (user) => {

    let now = Math.floor(Date.now() / 1000);
    let expiration = now + 30 * 24 * 60 * 60;

    let payload = {
        id: user._id,
        name: user.name,
        surname: user.surname,
        nick: user.nick,
        email: user.email,
        bio: user.bio,
        avatar: user.avatar,
        iat: now,
        exp: expiration
    };

    return jwt.encode(payload, secret);
}


// Exportar funcion etc
module.exports = {
    createToken,
    secret
}