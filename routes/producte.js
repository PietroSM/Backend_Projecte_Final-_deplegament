const express = require('express');
const bcrypt = require('bcrypt');
const { validarToken } = require('../auth/auth');
const fs = require('fs');
const path = require('path');

const Producte = require(__dirname + '/../models/producte.js');
const Cistella = require(__dirname + '/../models/cistella.js');



let router = express.Router();

// Llistat dels productes. ✔
router.get('/', async(req, res) => {

    try{
        let token = req.headers['authorization'];
        let validar = validarToken(token);
        
        let idClient = validar.id;
        let propietat = false


        // Comprovar si existeix la cistella
        const existeixCistella = await Cistella.findOne({ client: idClient })
        .populate({
            path: 'productes.producte',
            populate: {
                path: 'client',
                model: 'clients'
            }
        })
        .lean();

        let clientFiltratId = null;
        if (existeixCistella && existeixCistella.productes.length > 0 && req.query.propis == '0') {
          // Agafem el client del primer producte
          clientFiltratId = existeixCistella.productes[0].producte.client;
        }

        let filtre = {
            $and: [
              {
                $or: [
                  { borrat: false },
                  { borrat: { $exists: false } },
                  { borrat: null }
                ]
              },
              {
                $or: [
                  { nom: { $regex: req.query.search || '', $options: 'i' } },
                  { adresa: { $regex: req.query.search || '', $options: 'i' } }
                ]
              },
              { temporada: { $regex: req.query.temporada || '', $options: 'i' }}
            ]
        };
    
        // Si tenim client, el afix al filtre
        if (clientFiltratId) {
        filtre.$and.push({ client: clientFiltratId });
        }




        const resultat = await Producte.find(filtre).populate("client");


        let productes = [];
        if(resultat.length > 0){

            
            resultat.forEach(element => {
                if(idClient == element.client._id){
                    propietat = true;
                } else {
                    propietat = false;
                }

                const producte = {
                    'nom': element.nom,
                    'stock': element.stock,
                    'preu': element.preu,
                    'imatge': element.imatge,
                    'lat': element.lat,
                    'lng': element.lng,
                    'enviament': element.enviament,
                    'recogida': element.recogida,
                    'temporada': element.temporada,
                    'tipus': element.tipus,
                    'id': element._id,
                    'adresa': element.adresa,
                    'client': {
                        'id': element.client._id,
                        'nom': element.client.nom,
                        'cognom': element.client.cognom,
                        'correu': element.client.correu,
                        'imatge': element.client.imatge,
                        'lat': element.client.lat,
                        'lng': element.client.lng
                    },
                    'propietat': propietat
                };
                productes.push(producte);
            });


            //Paginacio
            const pagina = req.query.pagina || 1;
            const tamanyPagina = 12;
            const inici = (pagina - 1) * tamanyPagina;
            const final = inici + tamanyPagina;

            const productesPaginats = productes.slice(inici, final);
            const hiHaMes = final < productes.length;

            res.status(200).send({productes: productesPaginats, niHaMes: hiHaMes});
        }else{
            res.status(200).send({productes: [], niHaMes: false});
        }

    }catch(error){
        console.log(error);
        res.status(500).send({error: "Error obtenint productes"});
    }
});


// Esborra un producte existent ✔
router.put('/borrar', async(req, res) => {
    try {
        const producteActualitzat = await Producte.findByIdAndUpdate(
            req.body.id,
            {borrat: true},
            {new: true}
        );

        if(!producteActualitzat){
            return res.status(404).send({error: "Producte no trobat"});
        }

        res.status(200).send({});

    } catch (error) {
        res.status(500).send({error: "Error al eliminar un producte"});
    }
});


// Edita un producte eixstent ✔
router.put('/:id/edit', async(req, res) => {
    let token = req.headers['authorization'];
    let validar = validarToken(token);
    let idClient = validar.id;

    try {
        const resultatProducte = await Producte.findById(req.params.id).populate('client');

        if(resultatProducte && resultatProducte.client._id == idClient){
            
            resultatProducte.nom = req.body.nom;
            resultatProducte.stock = req.body.stock;
            resultatProducte.preu = req.body.preu;
            resultatProducte.lat = req.body.lat;
            resultatProducte.lng = req.body.lng;
            resultatProducte.enviament = req.body.enviament;
            resultatProducte.recogida = req.body.recogida;
            resultatProducte.temporada = req.body.temporada;
            resultatProducte.tipus = req.body.tipus;
            

            if(req.body.imatge && req.body.imatge != resultatProducte.imatge){
                //Eliminar el encabeçat de dades base64 si està present
                const base64Data = req.body.imatge.replace(/^data:image\/\w+;base64,/, '');
                const buffer = Buffer.from(base64Data, 'base64');


                //Generar un nom unic per a la imatge
                const nomImatge = `image_${Date.now()}.png`;
                const uploadPath = path.join(__dirname,"../public/productes", nomImatge);

                
                if (resultatProducte.imatge) {
                    const imatgeAntigaPath = path.join(__dirname, "../public/productes", path.basename(resultatProducte.imatge));
                    fs.unlink(imatgeAntigaPath, (err) => {
                        if (err) {
                            console.error('Error al esborrar la imatge antiga:', err);
                        }
                    });
                }

                fs.writeFile(uploadPath, buffer, async (error) => {
                    if(error){
                        return res.status.json({error: "Error al editar la imatge."});
                    }

                    resultatProducte.imatge = `http://vps-281e1278.vps.ovh.net:8081/public/productes/${nomImatge}`;
                    
                    const resultat = await resultatProducte.save();
                    res.status(201).send({id: resultat._id});

                });
            } else {
                const resultat = await resultatProducte.save();
                res.status(201).send({id: resultat._id});
            }
        } else {
            res.status(400).send({error: 'Producte no trobat'});
        }

    } catch (error) {
        let errors = {
            general: 'Error al editar un producte'
        }
        
        if(error.errors){
            if(error.errors.nom){
                errors.nom = error.errors.nom.message;
            }
            if(error.errors.stock){
                errors.stock = error.errors.stock.message;
            }
            if(error.errors.preu){
                errors.preu = error.errors.preu.message;
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
            if(error.errors.temporada){
                errors.temporada = error.errors.temporada.message;
            }
            if(error.errors.tipus){
                errors.tipus = error.errors.tipus.message;
            }
        }        
        res.status(400).send({errors});
    }
});


// Detalls d'un producte específic. ✔
router.get('/:id', async(req, res) => {
    try{
        const resultat = await Producte.findById(req.params.id).populate('client');
        let token = req.headers['authorization'];
        let validar = validarToken(token);
        
        let idClient = validar.id;
        let propietat = false


        if(resultat){
            if(idClient == resultat.client._id){
                propietat = true;
            }

            const producte = {
                'nom': resultat.nom,
                'stock': resultat.stock,
                'preu': resultat.preu,
                'imatge': resultat.imatge,
                'lat': resultat.lat,
                'lng': resultat.lng,
                'enviament': resultat.enviament,
                'recogida': resultat.recogida,
                'temporada': resultat.temporada,
                'tipus': resultat.tipus,
                'id': resultat._id,
                'adresa': resultat.adresa,
                'client': {
                    'id': resultat.client._id,
                    'nom': resultat.client.nom,
                    'cognom': resultat.client.cognom,
                    'correu': resultat.client.correu,
                    'imatge': resultat.client.imatge,
                    'lat': resultat.client.lat,
                    'lng': resultat.client.lng
                },
                'propietat': propietat
            }

            res.status(200).send({producte: producte});
        }else{
            res.status(404).send({error: "Producte no trobat"});
        }
    }catch(error){
        res.status(500).send({error: "Error buscant el producte indicat"});
    }
});


// Inserta un nou producte asociat a un client ✔
router.post('/afegir', async(req, res) => {
    let token = req.headers['authorization'];
    let resultat = validarToken(token);
    let idClient = resultat.id;


    try{
        //Eliminar el encabeçat de dades base64 si està present
        const base64Data = req.body.imatge.replace(/^data:image\/\w+;base64,/, '');
        const buffer = Buffer.from(base64Data, 'base64');


        //Generar un nom unic per a la imatge
        const nomImatge = `image_${Date.now()}.png`;
        const uploadPath = path.join(__dirname,"../public/productes", nomImatge);


        fs.writeFile(uploadPath, buffer, async (error) => {

            if(error){
                return res.status(500).json({error: "Error al guardar la imatge"});
            }

            let nouProducte = new Producte({
                nom: req.body.nom,
                client: idClient,
                stock: req.body.stock,
                preu: req.body.preu,
                imatge: `http://vps-281e1278.vps.ovh.net:8081/public/productes/${nomImatge}`,
                lat: req.body.lat,
                lng: req.body.lng,
                enviament: req.body.enviament,
                recogida: req.body.recogida,
                temporada: req.body.temporada,
                tipus: req.body.tipus,
                adresa: req.body.adresa
            });

            const resultat = await nouProducte.save();
            res.status(201).send({id: resultat._id});
        });

    }catch(error){
        
        let errors = {
            general: 'Error al afegir un producte'
        }
        
        if(error.errors){
            if(error.errors.nom){
                errors.nom = error.errors.nom.message;
            }
            if(error.errors.stock){
                errors.stock = error.errors.stock.message;
            }
            if(error.errors.preu){
                errors.preu = error.errors.preu.message;
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
            if(error.errors.temporada){
                errors.temporada = error.errors.temporada.message;
            }
            if(error.errors.tipus){
                errors.tipus = error.errors.tipus.message;
            }
        }        
        res.status(400).send({errors});
    }

});



module.exports = router;