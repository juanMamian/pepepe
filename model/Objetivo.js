const mongoose = require("mongoose");

esquemaObjetivo = new mongoose.Schema({
    nombre: {
        type: String,
        required: true,
        min: 3,
        max: 1024
    },
    descripcion: {
        type: String
    },
    dependencias: [
        {
            tipoElemento: String,
            ref: String,
            tipoDependencia: String
        }
    ],
    subobjetivos: [
        {
            ref: String
        }
    ],
});

module.exports.esquemaObjetivo = esquemaObjetivo;