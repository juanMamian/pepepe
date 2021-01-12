const mongoose = require("mongoose");
const esquemaEvidencia = require("./Evidencia").esquemaEvidencia;


const esquemaActividad = new mongoose.Schema({
    nombre:{
        type:String,
        min:3,
        max:50,
        required:true,
        default:"actividad"
    },
    evidencias:{
        type:[esquemaEvidencia]
    },
});



module.exports.modeloActividad = mongoose.model("Actividad", esquemaActividad);
