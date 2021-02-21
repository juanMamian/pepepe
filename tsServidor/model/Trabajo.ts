import mongoose from "mongoose";
import {EsquemaVinculosNodosProyecto} from "./VinculosNodosProyecto";


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
    estadoDesarrollo:{
        type:String,
        required:true,
        default:"noCompletado",
        enum:["noCompletado", "completado"]
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
    idProyectoParent:{
        type:String,
    },
    idForo:{
        type:String,        
    },
    vinculos:{
        type:[EsquemaVinculosNodosProyecto],
        required:true,
        default:[]
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

    }
   
});

esquemaTrabajo.index({keywords:"text"});

export const ModeloTrabajo = mongoose.model("Trabajo", esquemaTrabajo);
