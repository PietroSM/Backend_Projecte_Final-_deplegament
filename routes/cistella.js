const express = require('express');
const bcrypt = require('bcrypt');
const { validarToken } = require('../auth/auth');
const fs = require('fs');
const path = require('path');

const Cistella = require(__dirname+'/../models/cistella.js');
const Producte = require(__dirname+'/../models/producte.js');


let router = express.Router();


// Guardar un producte en la cistella del client ✔
router.post('/', async(req, res) => {
    let token = req.headers['authorization'];
    let resultat = validarToken(token);
    let idClient = resultat.id;

    
    try{
        const existeixCistella = await Cistella.findOne({ client: idClient })
        .populate({
            path: 'productes.producte',
            populate: {
                path: 'client',
                model: 'clients'
            }
        })
        .lean();

        const producteEditar = await Producte.findById(req.body.idProducte);

        
        if(existeixCistella){

            //Busca si existeix eixe producte en la cistella
            const existeixProducte = existeixCistella.productes
            .some(p => p.producte._id.toString() === req.body.idProducte);

            
            //Comprovar si ni ha suficient stock
            if (producteEditar.stock < req.body.quantitat) {
                return res.status(400).json({ error: 'No hi ha suficient stock disponible' });
            }


            //Llevar quantitat al producte
            const updateProducte = await Producte.findOneAndUpdate(
                {_id: req.body.idProducte},
                { $inc: { stock: -req.body.quantitat } },
                { new: true }
            );
                

            if(existeixProducte){
                const afegirProducte1 = await Cistella.findOneAndUpdate(
                    { client: idClient, "productes.producte": req.body.idProducte },
                    { 
                        $inc: {
                            "productes.$.quantitat": req.body.quantitat,
                            "productes.$.preu": req.body.preuTotal
                        }
                    },
                    { new: true }
                );
    
                res.status(200).send({ resultat: "S'ha actualitzat el producte en la cistella correctament" });
    
            }else{
                const afegirProducte2 = await Cistella.findOneAndUpdate(
                    {client: idClient},
                    { $push : {productes : {
                        producte: req.body.idProducte,
                        quantitat: req.body.quantitat,
                        preu: req.body.preuTotal
                    }} },
                    { new: true }
                );
                res.status(201).send({resultat: "S'ha afegit correctament"});

            }

        
        }else{
            
            const novaCistella = new Cistella({
                client: idClient,
                productes : [{
                    producte: req.body.idProducte,
                    quantitat: req.body.quantitat,
                    preu: req.body.preuTotal
                }]
            });


            //Comprovar si ni ha suficient stock
            if (producteEditar.stock < req.body.quantitat) {
                return res.status(400).json({ error: 'No hi ha suficient stock disponible' });
            }


            //Llevar quantitat al producte
            const updateProducte = await Producte.findOneAndUpdate(
                {_id: req.body.idProducte},
                { $inc: { stock: -req.body.quantitat } },
                { new: true }
            );

            const resultatNovaCistella = await novaCistella.save();

            res.status(201).send({resultat: "S'ha afegit correctament" })
        }
    } catch(error){
        console.log(error);
        res.status(500).send({error: "Error al afegir a la cistella"});
    }
});


// Obtindre el llistat de productes de una cistella. ✔
router.get('/', async(req, res) => {
    let token = req.headers['authorization'];
    let resultat = validarToken(token);
    
    let idClient = resultat.id;

    let productes = [];
    let preuTotal = 0;

    try {
        const existeixCistella = await Cistella.findOne({ client: idClient })
            .populate({
                path: 'productes.producte',
                populate: {
                    path: 'client',
                    model: 'clients'
                }
            })
            .lean();


        if(existeixCistella) {
            
            existeixCistella.productes.forEach(element => {

                productes.push({
                    producte: {
                                'nom': element.producte.nom,
                                'stock': element.producte.stock,
                                'preu': element.producte.preu,
                                'imatge': element.producte.imatge,
                                'lat': element.producte.lat,
                                'lng': element.producte.lng,
                                'enviament':element.producte.enviament,
                                'temporada': element.producte.temporada,
                                'tipus': element.producte.tipus,
                                'id': element.producte._id,
                                'client': {
                                    'id': element.producte.client._id,
                                    'nom': element.producte.client.nom,
                                    'preu': element.producte.client.preu,
                                    'imatge': element.producte.client.imatge,
                                    'lat': element.producte.client.lat,
                                    'lng': element.producte.client.lng,
                                    'enviament': element.producte.client.enviament,
                                    'recogida': element.producte.client.recogida,
                                    'temporada': element.producte.client.temporada,
                                    'tipus': element.producte.client.tipus
                                }
                    },
                    quantitat: element.quantitat,
                    preu: element.preu
                });

                preuTotal += element.preu

            });

            let idCistella =  existeixCistella._id;

            res.status(200).send({productes, idCistella, preuTotal});

        }
    } catch (error) {
        res.status(500).send({error: "Error Obtenint la cistella"});
    }
});


// Eliminar un producte de la cistella ✔
router.delete('/:id', async (req, res) => {
    try {
        let token = req.headers['authorization'];
        let resultat = validarToken(token);
        let idClient = resultat.id;

        const existeixCistella = await Cistella.findOne({ client: idClient });


        if (!existeixCistella) {
            return res.status(404).json({ error: 'Cistella no trobada' });
        }

        existeixCistella.productes = 
            existeixCistella.productes.filter((producte) => 
                producte.producte.toString() != req.params.id);
        

        // Comprovem si queden productes en la cistella
        if (existeixCistella.productes.length == 0) {
            await Cistella.findByIdAndDelete(existeixCistella._id);
            return res.status(200).send({});
        } else {
            await existeixCistella.save();
            return res.status(200).send({});
        }

    } catch (error) {
        return res.status(500).send({ error: 'Error eliminant el producte de la cistella.' });
    }
});


module.exports = router;