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
    vinculos:{
        type:[EsquemaVinculosNodosProyecto],
        required:true,
        default:[]
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

export const ModeloTrabajo = mongoose.model("Trabajo", esquemaTrabajo);
