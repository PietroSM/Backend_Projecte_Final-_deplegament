const mongoose = require('mongoose');


let userSchema = new mongoose.Schema({
    alies: {
        type: String,
        required: [true, 'El Alies es obligatori.'],
        unique: true,
        minlength: [3, 'El Alies es massa curt.']
    },
    contrasenya: {
        type: String,
        required: [true, 'La contrasenya es obligatoria.'],
        minlength: [8, 'La contrasenya es massa curta.']
    },
    rol: {
        type: String,
        required: true,
        enum: ['client', 'admin']
    }
});


let User = mongoose.model('users', userSchema);
module.exports = User;