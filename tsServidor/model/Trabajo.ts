import mongoose from "mongoose";


export var esquemaTrabajo = new mongoose.Schema();


esquemaTrabajo.add({
    nombre: {
        type: String,
        required: true,
        min: 3,
        max: 600,
        default:"Nuevo trabajo"
    },
    descripcion: {
        type: String,
        max: 10000,
        default:"Sin descripcion",
        required:true
    },
    responsables:{
        type: [String],
        default: []
    },
    nodosConocimiento:{
        type:[String],
        required:true,
        default:[]
    },        
    idForo:{
        type:String,        
    },
   
});

export const ModeloTrabajo = mongoose.model("Trabajo", esquemaTrabajo);
