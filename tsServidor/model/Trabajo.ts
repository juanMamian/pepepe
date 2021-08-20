import mongoose from "mongoose";
import {EsquemaVinculosNodosProyecto} from "./VinculosNodosProyecto";


const esquemaMaterial= new mongoose.Schema({
    nombre:{
        type:String,
        required:true,
        min:3,
        max:100,
        default:"Nuevo material"
    },
    descripcion:{
        type:String,
        max:2000,
    },
    cantidadNecesaria:{
        type:Number,
        required:true,
        default:1,
    },
    cantidadDisponible:{
        type:Number,
        required:true,
        default:0,
    }

});

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
    posiblesResponsables: {
        type: [String],
        default: []
    },
    responsablesSolicitados:{
        type: Number,
        default: 0,
    },    
    nodosConocimiento:{
        type:[String],
        required:true,
        default:[]
    },
    nodoParent:{
        idNodo: String,
        tipo:String,
    }, 
    idForoResponsables:{
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
    },
    materiales:{
        type:[esquemaMaterial],
        default:[],
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
    }
   
});


esquemaTrabajo.index({nombre:"text", keywords: "text", descripcion:"text"});
export const ModeloTrabajo = mongoose.model("Trabajo", esquemaTrabajo);
