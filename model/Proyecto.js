const mongoose = require("mongoose");



const esquemaObjetivo = new mongoose.Schema();




esquemaObjetivo.add({
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
            id: String
        }
    ],
    objetivos: [esquemaObjetivo]
});

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
    objetivos: [esquemaObjetivo],
    gestores: [
        { type: String }
    ]


});


module.exports.modeloProyecto = mongoose.model("Proyecto", esquemaProyecto);
module.exports.esquemaObjetivo = esquemaObjetivo;

