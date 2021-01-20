import mongoose from "mongoose";
import {esquemaObjetivo} from "./Objetivo"
import {esquemaTrabajo} from "./Trabajo"

const esquemaProyecto = new mongoose.Schema({
    nombre: {
        type: String,
        min: 2,
        max: 1024,
        required: true,
        default: "Nuevo proyecto"
    },
    descripcion: {
        type: String
    },
    objetivos: {
        type: [esquemaObjetivo],
        required:true,
        default:[]
    },
    trabajos: {
        type: [esquemaTrabajo],
        default: []
    },
    responsables: {
        type: [String],
        default: []
    },
    posiblesResponsables: {
        type: [String],
        default: []
    }

});




export const ModeloProyecto = mongoose.model("Proyecto", esquemaProyecto);

