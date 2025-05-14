const mongoose = require('mongoose');

let cistellaSchema = new mongoose.Schema({
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
});


let Cistella = mongoose.model('cistellas', cistellaSchema);
module.exports = Cistella;