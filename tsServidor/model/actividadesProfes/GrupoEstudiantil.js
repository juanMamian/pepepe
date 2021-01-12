const mongoose = require("mongoose");
const esquemaActividad = require("./Actividad").esquemaActividad;


const esquemaGrupoEstudiantil = new mongoose.Schema({
    nombre:{
        type:String,
        min:3,
        max:50,
        required:true,
    },
    estudiantes: {
        type: [String],
        default: []
    },
    actividades: {
        type: [esquemaActividad],
        default: []
    },

});


module.exports.modeloGrupoEstudiantil = mongoose.model("GrupoEstudiantil", esquemaGrupoEstudiantil);
