//Importaciones de mongoose
const { Schema, model } = require("mongoose");

//Definicion del schema
const ArticleSchema = Schema({
    title: {type: String, required: true},
    content: {type: String, required: true},
    user: {
        type: Schema.ObjectId, 
        ref: "User"
    },
    image: {type: String, default: "default.png"},
    created_at: {type: Date, default: Date.now}
});

//Exportar modelo
module.exports = model('Article', ArticleSchema, "articles");

