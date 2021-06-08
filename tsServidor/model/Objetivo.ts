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
    descripcion: {
        type: String,
        default:"Sin descripcion",
        required:true,
        max:2000
    },   
    estado:{
        type:String,
        required:true,
        default:"noCumplido",
        enum:["noCumplido", "cumplido"],
    },
    vinculos:{
        type:[EsquemaVinculosNodosProyecto],
        required:true,
        default:[]
    },
    idProyecto:{
        type:String
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
    keywords:{
        type:String,
    },
    
});

esquemaObjetivo.index({keywords:"text", nombre: "text", descripcion: "text"});


export const ModeloObjetivo = mongoose.model("Objetivo", esquemaObjetivo);

