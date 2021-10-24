import mongoose from "mongoose";
import {EsquemaVinculosNodosSolidaridad} from "./VinculosNodosSolidaridad";
import {pubsub} from "../../gql/Schema"
import {NODO_EDITADO} from "../../gql/AtlasSolidaridad"
const esquemaEnlace= new mongoose.Schema({
    nombre:{
        type: String,
        min: 2,
        max: 30,
        required: true,
        default: "Nuevo enlace"
    },
    descripcion: {
        type: String,
        max: 1000,
        default:"",
    },
    link:{
        type: String,
        min:6,
        max:500,
    },
    tipo:{
        type: String,
        enum: ["enlace", "hojaCalculo", "documentoTexto"],
        default:"enlace",
    }


})


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
    enlaces:{
        type: [esquemaEnlace],
        default:[]
    },
    estadoDesarrollo:{
        type:String,
        required:true,
        default:"noCompletado",
        enum:["noCompletado", "completado"],
    },
    vinculos:{
        type:[EsquemaVinculosNodosSolidaridad],
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


esquemaObjetivo.post("save", function(objetivo){
    objetivo.tipoNodo="objetivo";
    pubsub.publish(NODO_EDITADO, { nodoEditado: objetivo });    
});

esquemaObjetivo.index({keywords:"text", nombre: "text", descripcion: "text"});


export const ModeloObjetivo = mongoose.model("Objetivo", esquemaObjetivo);

