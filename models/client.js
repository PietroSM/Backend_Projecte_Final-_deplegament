const mongoose = require('mongoose');


let clientSchema = new mongoose.Schema({
    nom: {
        type: String,
        required: [true, 'El Nom es obligatori.'],
        minlength: [3, 'El Nom es massa curt.'],
        maxlength: [25, 'El Nom es massa llarg.']
    },
    cognom: {
        type: String,
        required: [true, 'El Cognom es obligatori.'],
        minlength: [3, 'El Cognom es massa curt.'],
        maxlength: [25, 'El Cognom es massa llarg.']
    },
    correu: {
        type: String,
        unique: true,
        required: [true, 'El Correu es obligatori.']
    },
    imatge:{
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
    }
});


let Client = mongoose.model('clients', clientSchema);
module.exports = Client;