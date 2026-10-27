// Importaciones
const path = require("path");
const fs = require("fs");
const dotenv = require("dotenv");
const OpenAI = require("openai");
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

const update = async (req, res) => {

    // Recoger los datos del body
    let body = req.body;

    // Validar los datos del articulo
     try {
        validate(body);
        
    } catch (error) {
        return res.status(400).json({
            status: "error",
            message: "Validacion del articulo no superada"
        });
    }

    try {
        // Sacar id de user logeado
        let userIdentity = req.user.id;         

        const articleUpdate = await Article.findByIdAndUpdate(body.id, body, {new:true});

        if(!articleUpdate){
            return res.status(404).json({
                        status: "error",
                        message: "El articulo no existe"
                    });
        }


        // Devolver un resultado
            return res.status(200).json({
                status: "success",
                article: articleUpdate
            });
        
    } catch (error) {
        return res.status(500).json({
            status: "error",
            message: "Error al actualizar el articulo"
        });
    }    
}

const remove = async (req, res) => {
     // Recoger los datos del body
    let id = req.params.id;
   
    try {
         // Sacar id de user logeado
        let userIdentity = req.user.id;

        const article = await Article.findById(id);
         if(!article){
            return res.status(404).json({
                status: "error",
                message: "El articulo no existe"
            });
        }

        if(article.user.toString() === userIdentity.toString()){
            const articleDelete = await Article.findByIdAndDelete(id);

            if(!articleDelete){
                return res.status(404).json({
                    status: "error",
                    message: "El articulo no existe"
                });
            }

            // Devolver un resultado
            return res.status(200).json({
                status: "success",
                article: articleDelete
            });
        }        
       
        
    } catch (error) {
        return res.status(500).json({
            status: "error",
            message: "Error al elimianar el articulo"
        });
    }    
}

const byUser = (req, res) => {
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
    Article.paginate({user: req.params.userId}, options)
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

const search = (req, res) => {

    let searchString = req.params.search;

    Article.find({
        "$or": [
            { "title": { "$regex": searchString, "$options": "i"}},
            { "content": { "$regex": searchString, "$options": "i"}}
        ]
    })
    .sort({ created_at: -1})
    .then(articles => {

        if(!articles){
            return res.status(404).json({
                status: "error",
                message: "No hay articulos que coincidan con tu busqueda"
            });
        }

        return res.status(200).json({
            status: "success",
            articles
        });
    })
    
}

const upload = async (req, res) => {
    // Recoger id de usuario
    const userId = req.user.id;
    const articleId = req.params.id;

    // Recoger el fichero y comprobar que existe
    if(!req.file){
        return res.status(400).json({
            status: "error",
            message: "La peticion no incluye la imagen del articulo"
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
                message: "Extension de la imagen del articulo invalida"
            });
        }       

        // Comprobar dueño del articulo
        const article = await Article.findById(articleId);
         if(!article){
            fs.unlinkSync(filePath);
            
            return res.status(400).json({
                status: "error",
                message: "El articulo no existe"
            });
        }

         if(article.user.toString() !== userId.toString()){
            fs.unlinkSync(filePath);
            
            return res.status(400).json({
                status: "error",
                message: "No tienes los permisos para subir imagenes a este articulo"
            });
        }

        // Buscar y actualizar el usuario en la bd
        const articleUpdated = await Article.findByIdAndUpdate(articleId, {image: filename}, {new: true});

        if(!articleUpdated){
            return res.status(404).json({
                status: "error",
                message: "El articulo no existe"
            });

        }


        return res.status(200).json({
            status: "success",
            article: articleUpdated
        });
    } catch (error) {
        return res.status(500).json({
            status: "error",
            message: "Error al actualizar el articulo",
            error: error.message
        });
    }

    
}

const poster = (req, res) => {
    let file = req.params.file;
    let filePath = "./Uploads/Posters/" + file;

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

dotenv.config();

const openai = new OpenAI({
    apiKey: process.env.OPENCODE_API_KEY,
    baseURL: process.env.OPENCODE_BASE_URL
})

const generate = async (req, res) => {
    // Recibir el prompt
    const { theme } = req.params;
    console.log(theme);

    // Organizar el promt

        // Prompt de sistemas
        const promptSystem = `
            Eres un redactor especializado en ${theme}.

            El usuario te va a pedir que redactes un articulo (titulo y texto para el contenido)

            Solo puedes responder con un articulo adecuado al tema que te pida el usuario,
            cualquier otra conversacion o respuesta, esta prohibida.

            El formato de salida del articulo debe ser la siguiente (un objeto json):

            {
                "title": "AQUI EL TITULO",
                "content": "AQUI EL CONTENIDO"
            }

            El titulo debe tener maximo 120 caracteres.
            El contenido debe tener maximo 1000 caracteres.
        `;

        // Prompt de usuario
        const promptUser = "Necesito que redactes un articulo de " + theme;

    // Llamar al llm 
    try {
        const completion = await openai.chat.completions.create({
                model: process.env.OPENCODE_MODEL,
                messages: [
                    {role: "system", content: promptSystem},
                    {role: "user", content: promptUser}
                ],
                max_tokens: 700,
                response_format: {type: "json_object"}
            });
        // Recoger el resultado
        const articleObject = JSON.parse(completion.choices[0].message.content);

        // Sacar id de user logeado
        let identityId = req.user.id;
        articleObject.user = identityId;

        // Crear objeto para articulo
        let articleToSave = new Article(articleObject);

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

        })
        
    } catch (error) {
        const status = error?.status || 500;

        if(status === 429){
            return res.status(429).json({
                status: "error",
                message: "Límite de uso de IA alcanzado. Inténtalo más tarde."
            });
        }

        return res.status(500).json({
            status: "error",
            message: "Error al generar el articulo"
        });
    }

    
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