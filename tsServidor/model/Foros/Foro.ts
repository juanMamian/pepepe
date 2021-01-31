import mongoose from "mongoose";
import {esquemaConversacion} from "./Conversacion"


const esquemaCategoria= new mongoose.Schema({
    nombre: {
        type: String,        
        default: "Nueva categoria"
    },   
    conversaciones: {
        type: [esquemaConversacion],
        required: true,
        default: []
    }
})

const esquemaForo = new mongoose.Schema({
    acceso:{
        type:String,
        required:true,
        default:"publico",
        enum: ["privado", "publico"]
    },
    miembros:{
        type:[String],
        required:true,
        default:[]
    },
    categorias: {
        type:[esquemaCategoria],
        required:true,
        default:[]
    },
    
});

export const ModeloForo=mongoose.model("Foro", esquemaForo)