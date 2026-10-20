const validator = require("validator");

const validate = (params, withPassword = true) => {
    let validation = false;

    let name = !validator.isEmpty(params.name) &&
                validator.isLength(params.name, { min:3, max: 50}) &&
                validator.isAlpha(params.name, "es-ES");

    let surname = !validator.isEmpty(params.surname) &&
                validator.isLength(params.surname, { min:2, max: 80}) &&
                validator.isAlpha(params.surname.replace(/\s/g, ""), "es-ES");
    
    let nick = !validator.isEmpty(params.nick) &&
                validator.isLength(params.nick, { min:2, max: 60});

    let email = !validator.isEmpty(params.email) &&
                validator.isEmail(params.email);
    
    let password = true;
    if(withPassword){
        let password = !validator.isEmpty(params.password) &&
                    validator.isLength(params.password, { min:6, max: 100});
    }

    
                
    if(!name || !surname || !nick || !email || !password){
        throw new Error("No se ha superado la validacion!!");
        
    }else{
        console.log("Validacion superada");
        validation = true;
    }

    return validation;
}

module.exports = validate;