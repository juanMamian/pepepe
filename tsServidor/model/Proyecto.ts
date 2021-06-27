import mongoose, { Schema } from "mongoose";
import {esquemaObjetivo} from "./Objetivo"
import {esquemaTrabajo} from "./Trabajo"

const esquemaPeticionBien=new mongoose.Schema({
    idBeneficiario:{
        type:String,
        required:true,
    },
    cantidadSolicitada:{
        type:String,
        required:true,
    },
    cantidadAsignada:{
        type:Number,
    }
});

const esquemaPeticionServicio=new mongoose.Schema({
    idBeneficiario:{
        type:String,
        required:true,
    },   
})

const esquemaBien = new mongoose.Schema({
    nombre:{
        type:String,
        default: "Nuevo bien",
    },
    descripcion:{
        type:String,        
    },
    unidad:{
        type: String,     
        required: true,   
        default:"unidades",
    },
    cantidad:{
        type:Number,
        default: 0,
    },
    fechaCierre:{
        type: Date,
        default: Date.now
    },
    fechaReparticion:{
        type: Date,
        default: Date.now
    },
    instruccionesRecibir:{
        type:String
    },
    listaPeticiones:{
        type: [esquemaPeticionBien],
        default:[],
    }

});
const esquemaServicio = new mongoose.Schema({
    nombre:{
        type:String,
        default: "Nuevo bien",
    },
    descripcion:{
        type:String,        
    },    
    listaPeticiones:{
        type: [esquemaPeticionServicio],
        default:[]
    }
});

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
    objetivos: {
        type: [esquemaObjetivo],
        required:true,
        default:[]
    },
    idsTrabajos:{
        type:[String],
        default:[],
        required: true,
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
    },
    responsablesSolicitados:{
        type: Number, 
        default:0,
    },
    idForo:{
        type:String,
        required:true,
    },
    bienes:{
        type:[esquemaBien],
        default:[]
    },
    servicios:{
        type: [esquemaServicio],
        default: []
    }

});




export const ModeloProyecto = mongoose.model("Proyecto", esquemaProyecto);

