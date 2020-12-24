const mongoose = require("mongoose");

esquemaObjetivo = new mongoose.Schema({
    nombre: {
        type: String,
        required: true,
        min: 3,
        max: 1024,
        default: "nuevo objetivo"
    },
    descripcion: {
        type: String
    },
    vinculos: [
        {
            tipoTarget: {
                type: String,
                required: true
            },
            ref: {
                type: String,
                required: true
            },
            tipoVinculo: {
                type: String,
                required: true
            }
        }
    ],
    subobjetivos: [
        {
            ref: String
        }
    ],
    estado: String,
    fila: Number,
    columna: Number
});

module.exports.esquemaObjetivo = esquemaObjetivo;