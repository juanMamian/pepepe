const mongoose = require("mongoose");



const esquemaProyecto = new mongoose.Schema({
    nombre: {
        type: String,
        min: 5,
        max: 1024,
        required: true
    },
    descripcion: {
        type: String
    },
    objetivos: [
        {
            ref: String
        }
    ],
    trabajos: [
        {
            ref: String
        }
    ],
    gestores: [
        {
            ref: String,

        }
    ]


});


module.exports.modeloProyecto = mongoose.model("Proyecto", esquemaProyecto);

