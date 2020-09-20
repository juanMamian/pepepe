const mongoose = require("mongoose");
const esquemaTrabajo=require("../model/Trabajo").esquemaTrabajo;
const esquemaObjetivo=require("../model/Objetivo").esquemaObjetivo;


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
        esquemaObjetivo

    ],
    trabajos: [
        esquemaTrabajo
    ],
    gestores: [
        {
            ref: String,

        }
    ]


});


module.exports.modeloProyecto = mongoose.model("Proyecto", esquemaProyecto);

