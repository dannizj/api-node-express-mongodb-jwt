// Importaciones
const path = require("path");
const bcrypt = require("bcryptjs");
const validate = require("../Helpers/validate-user");
const jwt = require("../Helpers/jwt");
const User = require("../Models/user");
const fs = require("fs");

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
                message: "El usuario ya existe !!!"
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
    //Recoger los datos del body
    let body = req.body;

    //Comprobar que llegan bien
    if(!body.email || !body.password){        
        return res.status(400).json({
                status: "error",
                message: "Faltan datos por enviar"
            });
    }


    //Comprobar que el usuario existe
    User.findOne({
        email: body.email.toLowerCase()
    }).then( user => {
        //Comprobar el password
        let pwd = bcrypt.compareSync(body.password, user.password);

        if(!pwd){
            return res.status(400).json({
                status: "error",
                message: "La password es incorrecto"
            });
        }

        //Crear el token jwt
        let token = jwt.createToken(user);

        //Devuelver el resultado
        return res.status(200).json({
            status: "success",
            user: {
                _id: user.id,
                name: user.name,
                nick: user.nick
            },
            token
        });

    }).catch( error => {
        console.log(error);
        return res.status(500).json({
                status: "error",
                message: "Error al buscar al usuario"
            });
    })

       
}

const profile = (req, res) => {

    let id = req.params.id;

    User.findById(id)
        .select({
            "password": 0,
            "created_at": 0
        })
        .then(userFinded => {

            if(!userFinded){
                 return res.status(404).json({
                    status: "error",
                    message: "El usuario no existe",
                    id
                });
            }


            return res.status(200).json({
                status: "success",
                user: userFinded
            });
        }).catch(error => {
            return res.status(404).json({
                status: "error",
                message: "Error al buscar al usuario"
            });
        })


    
}

const update = async (req, res) => {

    try {
        // Conseguir identidad del usuario
        const userIdentity = req.user;

        // Crear objeto con datos nuevos
        let userToUpdate = {
            name: req.body.name ?? userIdentity.name,
            surname: req.body.surname ?? userIdentity.surname,
            nick: req.body.nick.toLowerCase() ?? userIdentity.nick,
            email: req.body.email.toLowerCase() ?? userIdentity.email,
            bio: req.body.bio ?? userIdentity.bio
        }

        // Validar los datos
        validate(userToUpdate, false);

        // Buscar si el usuario ya existe en la bd
        const users = await User.find({
            $or: [
                { email: userToUpdate.email.toLowerCase()},
                { nick: userToUpdate.nick.toLowerCase()}
            ]
        });        

        // Recorrer y comprobar los usuarios
        const userExist = users.some(user => user._id.toString() != userIdentity.id);

        if(userExist){
            return res.status(400).json({
                status: "error",
                message: "El email o el nick name ya estan en uso"
            });
        }
        
        // Actualizar el usuario en la base de datos
        const userUpdated = await User.findByIdAndUpdate(userIdentity.id, userToUpdate, { new: true, select: "-password"});

        if(!userUpdated){
             return res.status(404).json({
                status: "error",
                message: "No se puede actualizar el usuario"
            });
        }

        return res.status(200).json({
            status: "success",
            user: userUpdated
        });
        
    } catch (error) {
        console.log(error);

        return res.status(500).json({
            status: "error",
            message: "Error al actualizar usuario"
        });
    }

    
}

const upload = async (req, res) => {
    // Recoger id de usuario
    const id = req.user.id;

    // Recoger el fichero y comprobar que existe
    if(!req.file){
        return res.status(400).json({
            status: "error",
            message: "La peticion no incluye la imagen de avatar"
        });
    }

    try {
        // Nombre del archivo
        const { originalname, filename, path: filePath } = req.file;

        // Sacar extension del archivo
        const ext = path.extname(originalname).toLowerCase();
        const validExtensions = [".png", ".jpg", ".jpeg", ".gif"];

        // Si no es correcta la extension borrar el archivo
        if(!validExtensions.includes(ext)){
            fs.unlinkSync(filePath);
            
            return res.status(400).json({
                status: "error",
                message: "Extension del avatar invalida"
            });
        }

        // Buscar y actualizar el usuario en la bd
        const userUpdated = await User.findByIdAndUpdate(id, {avatar: filename}, {new: true});

        if(!userUpdated){
            return res.status(404).json({
                status: "error",
                message: "El usuario no existe"
            });

        }


        return res.status(200).json({
            status: "success",
            user: userUpdated
        });
    } catch (error) {
        return res.status(500).json({
            status: "error",
            message: "Error al actualizar el usuario",
            error: error.message
        });
    }

    
}

const avatar = (req, res) => {
    let file = req.params.file;
    let filePath = "./Uploads/Avatars/" + file;

    fs.stat(filePath, (error, exist) => {
        if(!error && exist){
            return res.sendFile(path.resolve(filePath));

        }else{
            return res.status(404).json({
            status: "error",
            message: "La imagen no existe"
            });
        }
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