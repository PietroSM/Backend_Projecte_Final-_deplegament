const express = require('express');
const bcrypt = require('bcrypt');
const { validarToken } = require('../auth/auth');
const fs = require('fs');
const path = require('path');

const auth = require(__dirname + '/../auth/auth.js');
const User = require(__dirname + '/../models/user.js');
const Client = require(__dirname + '/../models/client.js');

let router = express.Router();


// Comprova si el login introduit es correcte ✔
router.post('/login', async(req, res) => {
    let alies = req.body.alies;
    let contrasenya = req.body.contrasenya;

    let existeixUsuari = await User.findOne({
        alies: alies,
    });

    if(existeixUsuari && bcrypt.compareSync(contrasenya,existeixUsuari.contrasenya)){
        res.status(200).send({accesToken: auth.generarToken(existeixUsuari.id ,alies, existeixUsuari.rol)});
    }else{
        res.status(401).send({error: "El Alies o Contrasenya es incorrecte"});
    }
});


// Retorna el id del usuari que ha iniciat sessió ✔
router.get('/client', async(req, res) => {
    let token = req.headers['authorization'];
    let validar = validarToken(token);
    let idClient = validar.id;

    res.status(200).send({idClient});
});


//TODO faltaria canviar la ruta de imatges en desplegament
// Registra un nou client/ususari ✔   
router.post('/registrar', async(req, res) => {
    let idUsuari = null;

    try{
        const hash = bcrypt.hashSync(req.body.contrasenya, 10);

        let nouUsuari = new User({
            alies: req.body.alies,
            contrasenya: hash,
            rol: 'client'
        });

        const resultatUsuari = await nouUsuari.save();
        idUsuari = resultatUsuari._id;


        //Eliminar el encabeçat de dades base64 si està present
        const base64Data = req.body.imatge.replace(/^data:image\/\w+;base64,/, '');
        const buffer = Buffer.from(base64Data, 'base64');

        //Generar un nom unic per a la imatge
        const nomImatge = `image_${Date.now()}.png`;
        const uploadPath = path.join(__dirname,"../public/uploads", nomImatge);

        fs.writeFile(uploadPath, buffer, async (error) => {

            if(error){
                return res.status(500).json({error: "Error al guardar la imatge."});
            }

            let nouClient = new Client({
                _id: idUsuari,
                nom: req.body.nom,
                cognom: req.body.cognom,
                correu: req.body.correu,
                imatge: `http://vps-281e1278.vps.ovh.net:8080/public/uploads/${nomImatge}`,
                lat: req.body.lat,
                lng: req.body.lng,
                adresa: req.body.adresa
            });

            const resultat = await nouClient.save();
            res.status(201).send({});
        });

    }catch(error){

        //Esborrar Usuari si no es crea el client
        if(idUsuari){
            await User.findByIdAndDelete(idUsuari);
        }

        let errors = {
            general: 'Error al registrar-se.'
        }

        //code == 11000 son els errors de unics
        if(error.code === 11000){
            if(error.keyPattern.alies){
                errors.alies = 'Aquest Alies ja existeix';
            }else if (error.keyPattern.correu){
                errors.correu = 'Aquest Correu ja està utilitzat.'
            }
        }else if(error.errors){

            if(error.errors.nom){
                errors.nom = error.errors.nom.message;
            }
            if(error.errors.cognom){
                errors.cognom = error.errors.cognom.message;
            }
            if(error.errors.correu){
                errrors.correu = error.errors.correu.message;
            }
            if(error.errors.lat){
                errrors.lat = error.errors.lat.message;
            }
            if(error.errors.lng){
                errrors.lng = error.errors.lng.message;
            }
            if(error.errors.adresa){
                errrors.adresa = error.errors.adresa.message;
            }
            if(error.errors.alies){
                errrors.alies = error.errors.alies.message;
            }
            if(error.errors.contrasenya){
                errrors.contrasenya = error.errors.contrasenya.message;
            }
        }

        res.status(400).send({errors});
    }
});


// Valida Si el token es valid ✔
router.get('/validar', async(req, res) => {
    let token = req.headers['authorization'];

    try{
        if(validarToken(token)){
            res.status(200).send({result: true});
        }else {
            res.status(403).send({result: false});
        }
    } catch(error){
        res.send({result: false})
    }
});


module.exports = router;