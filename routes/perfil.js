const express = require('express');
const { validarToken } = require('../auth/auth');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');


const Client = require(__dirname + '/../models/client.js');

let router = express.Router();


// mostrar el perfil del usuari que ha iniciat sessió ✔
router.get('/me', async(req, res) => {
    try {
        let token = req.headers['authorization'];
        let validar = validarToken(token);
        
        let idClient = validar.id;

        const resultat = await Client.findById(idClient);

        if(resultat) {
            const client = {
                'id': resultat._id,
                'nom': resultat.nom,
                'cognom': resultat.cognom,
                'correu': resultat.correu,
                'imatge': resultat.imatge,
                'lat': resultat.lat,
                'lng': resultat.lng,
                'adresa': resultat.adresa,
                'propietat': true
            };

            res.status(200).send({usuari: client});
        }else{
            res.status(404).send({error: "Client no trobat."});
        }

    } catch (error) {
        res.status(500).send({error: "Error obtenint client"});        
    }
});


// Edició d'imatge ✔
router.put('/:id/imatge', async(req, res) => {

    try {
        const resultatClient = await Client.findById(req.params.id);

        if (resultatClient && req.body.imatge != resultatClient) {


                //Eliminar el encabeçat de dades base64 si està present
                const base64Data = req.body.imatge.replace(/^data:image\/\w+;base64,/, '');
                const buffer = Buffer.from(base64Data, 'base64');


                //Generar un nom unic per a la imatge
                const nomImatge = `image_${Date.now()}.png`;
                const uploadPath = path.join(__dirname,"../public/uploads", nomImatge);

                if (resultatClient.imatge) {
                    const imatgeAntigaPath = path.join(__dirname, "../public/uploads", path.basename(resultatClient.imatge));
                    fs.unlink(imatgeAntigaPath, (err) => {
                        if (err) {
                            console.error('Error al esborrar la imatge antiga:', err);
                        }
                    });


                    fs.writeFile(uploadPath, buffer, async (error) => {
                        if(error){
                            return res.status.json({error: "Error al editar la imatge."});
                        }
                        resultatClient.imatge = `http://vps-281e1278.vps.ovh.net:8081/public/uploads/${nomImatge}`;
                        
                        const resultat = await resultatClient.save();
                        res.status(201).send({id: resultat._id});
    
                    });


                } else {
                    res.status(400).send({error: 'Perfil no trobat'});
                }
        }

    } catch (error) {
        res.status(500).send({error: 'Error modificant l\'imatge'});
    }
});

// Edició de contrasenya ✔
router.put('/:id/contrasenya', async(req, res) => {
    try {
        const resultatClient = await Client.findById(req.params.id);

        if(resultatClient) {
            resultatClient.contrasenya = bcrypt.hashSync(req.body.contrasenya, 10);

            const result = await resultatClient.save();

            res.status(201).send();
        }

    } catch (error) {
        res.status(500).send({error: "Error modificant la contrasenya."});
    }
});


// Edició de dades ✔
router.put('/:id/edit', async(req, res) => {

    try {
        const resultatClient = await Client.findById(req.params.id);
        
        if(resultatClient) {
            
            resultatClient.nom = req.body.nom;
            resultatClient.cognom = req.body.cognom;
            resultatClient.correu = req.body.correu;
            resultatClient.lat = req.body.lat;
            resultatClient.lng = req.body.lng;
            resultatClient.adresa = req.body.adresa;

            const result = await resultatClient.save();

            res.status(201).send();
        } else {
            res.status(400).send({error: "Client no trobat."});
        }
    } catch (error) {
        let errors = {
            general: 'Error al editar un producte'
        }

        if(error.errors){
            if(error.errors.nom){
                errors.nom = error.errors.nom.message;
            }
            if(error.errors.cognom){
                errors.cognom = error.errors.cognom.message;
            }
            if(error.errors.correu){
                errors.correu = error.errors.correu.message;
            }
            if(error.errors.lat){
                errors.lat = error.errors.lat.message;
            }
            if(error.errors.lng){
                errors.lng = error.errors.lng.message;
            }
            if(error.errors.adresa){
                errors.adresa = error.errors.adresa.message;
            }
        }
        res.status(400).send({errors});

    }
});


// Dades d'un usuari ✔
router.get('/:id', async(req, res) => {
    try {
        let token = req.headers['authorization'];
        let validar = validarToken(token);
        
        let idClient = validar.id;

        const resultat = await Client.findById(req.params.id);

        if(resultat) {
            const client = {
                'id': resultat._id,
                'nom': resultat.nom,
                'cognom': resultat.cognom,
                'correu': resultat.correu,
                'imatge': resultat.imatge,
                'lat': resultat.lat,
                'lng': resultat.lng,
                'adresa': resultat.adresa,
                'propietat': resultat._id == idClient ? true : false
            };

            res.status(200).send({usuari: client});
        }else{
            res.status(404).send({error: "Client no trobat."});
        }

    } catch (error) {
        res.status(500).send({error: "Error obtenint client"});        
    }
});





module.exports = router;