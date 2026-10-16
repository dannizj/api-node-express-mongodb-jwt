// Importaciones
const validate = require("../Helpers/validate-user");


// Acciones
const register = (req, res) => {
    let body = req.body;

    

    try {
        validate(body);

    } catch (error) {
        return res.status(400).json({
            status: "error",
            message: "Validacion de usuario no superada"
        });
    }

    return res.status(200).json({
        status: 200,
        message: "Accion para registrar usuario",
        data: body
    });
}

const login = (req, res) => {
    return res.status(200).json({
        status: 200,
        message: "Accion para identificar al usuario"
    });
}

const profile = (req, res) => {
    return res.status(200).json({
        status: 200,
        message: "Accion para ver los datos de un usuario"
    });
}

const update = (req, res) => {
    return res.status(200).json({
        status: 200,
        message: "Accion para editar y actualizar la informacion de un usuario"
    });
}

const upload = (req, res) => {
    return res.status(200).json({
        status: 200,
        message: "Accion para subir avatar o imagen del usuario"
    });
}

const avatar = (req, res) => {
    return res.status(200).json({
        status: 200,
        message: "Accion para sacar el avatar del usuario"
    });
}

//Exportaciones
module.exports = {
    register,
    login,
    profile,
    update,
    upload,
    avatar
}