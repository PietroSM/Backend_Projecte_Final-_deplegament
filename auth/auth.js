const jwt = require('jsonwebtoken');

let generarToken = (id, login, rol) => jwt.sign(
    {id: id, login: login, rol: rol},
    process.env.SECRET,
    {expiresIn: "24 hours"});


let validarToken = token => {
    try {
        console.log();
        let resultat = jwt.verify(token.substring(7),process.env.SECRET);

        return resultat;
    } catch (e) {

        console.log(e);
        return false;
    }
}


module.exports = {
    generarToken: generarToken,
    validarToken: validarToken
};