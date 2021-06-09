import mongoose from "mongoose";
import { esquemaObjetivo } from "./Objetivo";

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
    },
    centroMasa:{
        x:{
            type: Number,
            default: 0,
        },
        y:{
            type: Number,
            default: 0,
        },
    },
    objetivos:{
        type: [esquemaObjetivo],
        default:[]
    }

});




export const ModeloProyecto = mongoose.model("Proyecto", esquemaProyecto);

