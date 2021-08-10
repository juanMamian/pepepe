import mongoose from "mongoose";
import {EsquemaVinculosNodosProyecto} from "./VinculosNodosProyecto";

export const esquemaObjetivo = new mongoose.Schema({
    nombre: {
        type: String,
        required: true,
        min: 3,
        max: 1024,
        default: "nuevo objetivo"
    },
    responsables:{
        type: [String],
        default: []
    },
    posiblesResponsables: {
        type: [String],
        default: []
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
    estadoDesarrollo:{
        type:String,
        required:true,
        default:"noCompletado",
        enum:["noCompletado", "completado"],
    },
    vinculos:{
        type:[EsquemaVinculosNodosProyecto],
        required:true,
        default:[]
    },
    nodoParent:{
        type:{
            idNodo: String,
            tipo:String,
        },        
        
    }, 
    keywords:{
        type:String,
    },
    diagramaProyecto:{
        posicion:{
            x:{
                type: Number,
                required:true,
                default:0
            },
            y:{
                type: Number,
                required:true,
                default:0
            }
        }
    },
    coords:{
        x:{
            type: Number,
            required:true,
            default:0
        },
        y:{
            type: Number,
            required:true,
            default:0
        }
    },
    angulo:{
        type: Number,
        default:0,
    },
    stuck:{
        type:Boolean,
        default:true,        
    },
    puntaje:{
        type:Number,
        default:0,
    },
    centroMasa:{
        x:{
            type:Number,
            default:0,
        },
        y:{
            type:Number,
            default:0
        }
    },
    nivel:{
        type: Number,
    },
    turnoNivel:{
        type: Number,
    },
    peso:{
        type:Number,
        default:0
    },
    idForoResponsables:{
        type:String,        
    },
    
});

esquemaObjetivo.index({keywords:"text", nombre: "text", descripcion: "text"});


export const ModeloObjetivo = mongoose.model("Objetivo", esquemaObjetivo);

