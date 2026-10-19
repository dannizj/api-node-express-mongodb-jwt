// Importaciones
const bcrypt = require("bcryptjs");
const validate = require("../Helpers/validate-user");
const User = require("../Models/user");

// Acciones
const register = (req, res) => {

    //Recoger los datos de la peticion
    let body = req.body;    

    //Validar los datos
    try {
        validate(body);

    } catch (error) {
        return res.status(400).json({
            status: "error",
            message: "Validacion de usuario no superada"
        });
    }

    //Control de usuarios duplicados
    User.find({
        $or: [
            { email: body.email.toLowerCase()},
            { nick: body.nick.toLowerCase()}
        ]
    }).then(async (users) => {
        if(users && users.length >= 1){
            return res.status(400).json({
                status: "error",
                message: "El usuario ya exsiste !!!"
            });
        }
   

        //Cifrar el password
        let password = await bcrypt.hash(body.password, 10);
        body.password = password;

        //Crear objeto de usuario
        body.email = body.email.toLowerCase();
        body.nick = body.nick.toLowerCase();

        let userToSave = new User(body);

        //Guardar usuario en la bd
        userToSave.save().then( (userSaved) => {

            if(!userSaved){
                console.log(error);
                return res.status(500).json({
                        status: "error",
                        message: "Usuario no se ha guardado correctamente!"
                    });
            }

            //Quitar password
            const userCleaned = userSaved.toObject();
            delete userCleaned.password;

            //Develver Respuesta
            return res.status(200).json({
                status: "success",
                user: userCleaned
            });

        }).catch( (error) => {
            console.log(error);
            return res.status(500).json({
                    status: "error",
                    message: "Error al guardar el usuario !!!"
                });

        });

      

    }).catch(error => {
        console.log(error);
        return res.status(500).json({
                status: "error",
                message: "Error en la consulta del usuario duplicado !!!"
            });
         
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