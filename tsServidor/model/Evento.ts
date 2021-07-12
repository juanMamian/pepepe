import mongoose from "mongoose";

export const esquemaEvento = new mongoose.Schema({
    nombre: {
        type: String,
        required: true,
        min: 3,
        max: 1024,
        default: "Nuevo evento"
    },    
    responsables:{
        type: [String],
        default: []
    },
    posiblesResponsables: {
        type: [String],
        default: []
    },
    participantes:{
        type:[String],
        default:[]
    },
    responsablesSolicitados:{
        type: Number,
        default: 0,
    },
    descripcion: {
        type: String,
        default:"Sin descripcion",
        required:true,
        max:2000
    },
    horarioInicio:{
        type: Date
    },
    horarioFinal:{
        type: Date
    },
    origen:{
        type:String,
    },
    idOrigen:{
        type:String
    },
    idNodo:{
        type:String
    }
    
});

export const ModeloEvento= mongoose.model("Evento", esquemaEvento);