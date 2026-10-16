// Importaciones



// Acciones
const save = (req, res) => {
    return res.status(200).json({
        status: 200,
        message: "Accion para guardar un articulo"
    });
}

const list = (req, res) => {
    return res.status(200).json({
        status: 200,
        message: "Accion para listar articulos"
    });
}

const detail = (req, res) => {
    return res.status(200).json({
        status: 200,
        message: "Accion para mostrar un solo articulo"
    });
}

const update = (req, res) => {
    return res.status(200).json({
        status: 200,
        message: "Accion para editar y actualizar la informacion de un articulo"
    });
}

const generate = (req, res) => {
    return res.status(200).json({
        status: 200,
        message: "Accion para generar con IA un articulo"
    });
}

const remove = (req, res) => {
    return res.status(200).json({
        status: 200,
        message: "Accion para eliminar un articulo"
    });
}

const byUser = (req, res) => {
    return res.status(200).json({
        status: 200,
        message: "Accion para sacar articulos creados por un usuario"
    });
}

const search = (req, res) => {
    return res.status(200).json({
        status: 200,
        message: "Accion para buscar un articulo"
    });
}

const upload = (req, res) => {
    return res.status(200).json({
        status: 200,
        message: "Accion para subir imagen del articulo"
    });
}

const poster = (req, res) => {
    return res.status(200).json({
        status: 200,
        message: "Accion para sacar la imagen del articulo"
    });
}


//Exportaciones
module.exports = {
    save,
    list,
    detail,
    update,
    generate,
    remove,
    byUser,
    search,
    upload,
    poster
}