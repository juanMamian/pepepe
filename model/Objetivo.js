const mongoose = require("mongoose");

esquemaObjetivo = new mongoose.Schema ({
    nombre: {
        type: String,
        required: true,
        min: 3,
        max: 1024
    },
    descripcion: {
        type: String
    },
    trabajos: [
        {
            ref: String
        }
    ],
    objetivos: [
        {
            ref: String
        }
    ],
});

module.exports.modeloObjetivo=mongoose.model("Objetivo", esquemaObjetivo);