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
            idTrabajo: String
        }
    ],
    objetivos: [
        {
            idObjetivo: String
        }
    ],
});