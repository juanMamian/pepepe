import mongoose from "mongoose";

const esquemaProyecto = new mongoose.Schema({
    nombre: {
        type: String,
        min: 2,
        max: 1024,
        required: true,
        default: "Nuevo proyecto"
    },
    descripcion: {
        type: String,
        default:"Sin descripción",
        required:true,
    },        
    responsables: {
        type: [String],
        default: []
    },
    posiblesResponsables: {
        type: [String],
        default: []
    },
    idForo:{
        type:String,
        required:true,
    }

});




export const ModeloProyecto = mongoose.model("Proyecto", esquemaProyecto);

