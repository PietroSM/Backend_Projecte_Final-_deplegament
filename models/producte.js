const mongoose = require('mongoose');


let producteSchema = new mongoose.Schema({
    nom: {
        type: String,
        required: [true, 'El Nom es obligatori.'],
        minlength: [3, 'El Nom es massa curt.'],
        maxlength: [25, 'El Nom es massa llarg.']
    },
    client: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'clients',
        required: true
    },
    stock: {
        type: Number,
        min: [1, 'El Stock ha de ser positiu.'],
        required: [true, 'El Stock es obligatori']
    },
    preu: {
        type: Number,
        min: [0.01, 'El Preu ha de ser positu'],
        required: [true, 'El Preu es obligatori']
    },
    imatge: {
        type: String
    },
    lat:{
        type: Number,
        required: [true, 'La Lat es obligatoria.'],
    },
    lng:{
        type: Number,
        required: [true, 'La Lng es obligatoria.']
    },
    adresa:{
        type: String,
        maxlength: [100, 'L\'Adreça es molt llarga.']
    },
    enviament: {
        type: Boolean
    },
    recogida: {
        type: Boolean
    },
    temporada: {
        type: String,
        required: [true, 'La Temporada es obligatoria'],
        enum: ['Hivern', 'Tardor', 'Primavera', 'Estiu']
    },
    tipus: {
        type: String,
        required: [true, 'El tipus es obligatori'],
        enum: ['Creilla', 'Taronja', 'Raim', 'Coliflor', 'Tomaca', 'Maduixa'] //TODO
    },
    borrat: {
        type: Boolean,
        default: false,
    },
});


let Producte = mongoose.model('products', producteSchema);
module.exports = Producte;