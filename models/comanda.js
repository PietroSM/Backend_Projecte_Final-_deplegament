const mongoose = require('mongoose');


let comandaSchema = new mongoose.Schema({
    client: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'clients',
        required: true
    },
    productes: [{
        producte: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'products',
            required: true
        },
        quantitat: {
            type: Number,
            required: true,
            min: 1
        }, 
        preu: {
            type: Number,
            required: true,
            min: 0.01
        }
    }],
    preuTotal: {
        type: Number,
        min: 0.01
    },
    estatComanda: {
        type: String,
        required: true,
        enum: ['Cancelat', 'Preparacio', 'Enviat', 'Entregat', 'Despositat']
    },
    enviament: {
        type: Boolean,
        required: true
    },
    puntRecogida: {
        type: Boolean,
        requires: true
    },
    Vendedor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'clients',
        required: true
    },
});

let Comanda = mongoose.model('comandas', comandaSchema);
module.exports = Comanda;