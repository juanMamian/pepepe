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
        type: String,
        max:2000
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
    estado:{
        type:String,
        required:true,
        default:"noCumplido",
        enum:["noCumplido", "cumplido"],
    }
});

module.exports.esquemaObjetivo = esquemaObjetivo;