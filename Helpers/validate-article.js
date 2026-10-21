const validator = require("validator");

const validate = (params) => {
    let validation = false;

    let title = !validator.isEmpty(params.title) &&
                validator.isLength(params.title, { min:3, max: 150});

    let content = !validator.isEmpty(params.content) &&
                validator.isLength(params.content, { min:2});   
  
    
                
    if(!title || !content){
        throw new Error("No se ha superado la validacion!!");
        
    }else{
        console.log("Validacion superada");
        validation = true;
    }

    return validation;
}

module.exports = validate;