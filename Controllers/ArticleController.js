// Importaciones
const validate = require("../Helpers/validate-article");
const Article = require("../Models/article");


// Acciones
const save = (req, res) => {

    let body = req.body;

    try {
        validate(body);
        
    } catch (error) {
        return res.status(400).json({
            status: "error",
            message: "Validacion del articulo no superada"
        });
    }

    // Sacar id de user logeado
    let identityId = req.user.id;
    body.user = identityId;

    // Crear objeto para articulo
    let articleToSave = new Article(body);

    // Guardar objeto en la bd
    articleToSave.save().then(article => {

        if(!article){
            return res.status(404).json({
                status: "error",
                message: "El articulo no se a guardado bien"
            });
        }
        
        // Devolver resultado
        return res.status(200).json({
            status: "success",
            article
        });

    }).catch(error => {
        return res.status(500).json({
            status: "error",
            message: "Error al guardar los articulos",
            error
        });
    });

   
}

const list = (req, res) => {

    // Sacar parametros
    let params = req.params;

    // Controlar la paginacion en la que estamos
    let page = 1;

    if(params.page){
        page = params.page;
    }

    // Configurar paginacion
    let itemsPerPage = 10;

    const options = {
        page,
        limit: itemsPerPage,
        sort: {created_at: -1},
        populate: {
            path: "user",
            select: "-password -__v -created_at -email"
        }
    }

    // Consultar y listar los articulos (mongoose paginate)
    Article.paginate({}, options)
            .then( result => {

                if(!result.docs){
                    return res.status(404).json({
                        status: "error",
                        message: "No hay articulos para mostrar"
                    });
                }

                // Devolver un resultado
                return res.status(200).json({
                    status: "success",
                    page,
                    itemsPerPage,
                    total: result.totalDocs,
                    articles: result.docs,
                    pages: Math.ceil(result.totalDocs / itemsPerPage)
                });

            }).catch(error => {
                return res.status(500).json({
                    status: "error",
                    message: "Error al listar ",
                    error
                });
            })

   
}

const detail = (req, res) => {
    const id = req.params.id;

    Article.findById(id)
            .populate({
                path: "user",
                select: "-password -__v -created_at"
            })
            .then(article => {
                if(!article){
                    return res.status(404).json({
                        status: "error",
                        message: "No existe el articulo"
                    });
                }

                return res.status(200).json({
                    status: "succes",
                    article
                });
            }).catch(error => {
                return res.status(500).json({
                        status: "error",
                        message: "No existe el articulo"
                    });
            });


   
}

const update = (req, res) => {
    return res.status(200).json({
        status: 200,
        message: "Accion para editar y actualizar la informacion de un articulo"
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

const generate = (req, res) => {
    return res.status(200).json({
        status: 200,
        message: "Accion para generar con IA un articulo"
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