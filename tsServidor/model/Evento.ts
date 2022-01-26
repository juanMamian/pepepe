import mongoose from "mongoose";
import { validatorNombreCosa, validatorTexto } from "./config";

export const esquemaEventoPersonal = new mongoose.Schema({
    idPersona:{
        type: String,
        required:true,
    },
    idParent:{
        type: String,
        required:function(this:any){
            return this.tipoParent
        }
    },
    tipoParent:{
        type:String,
        enum: ["nodoSolidaridad"],
        required:function(this:any){
            return this.idParent
        }
    },
    nombre: {
        type: String,
        minLength: 3,
        maxLength: 1024,
        validate: validatorNombreCosa,
        default: "Nuevo evento"
    },        
    descripcion: {
        type: String,
        validate: validatorTexto,
        maxLength:2000
    },
    horarioInicio:{
        type: Date,
        required:true,
        validate:{
            validator:function(this:any){
                return this.horarioFinal>this.horarioInicio
            },
            message: props=>props.value + "No es un valor válido"
        }
    },
    horarioFinal:{
        type: Date,
        required:true,
        validate:{
            validator:function(this:any){
                return this.horarioFinal>this.horarioInicio
            },
            message: props=>props.value + "No es un valor válido"
        }
    },
    idEventoMarco:{
        type:String,
    },
    lugar:{
        type:String,
    },
    
});

export const esquemaEventoPublico = new mongoose.Schema({
    nombre: {
        type: String,
        minLength: 3,
        maxLength: 1024,
        validate: validatorNombreCosa,
        default: "Nuevo evento"
    },        
    descripcion: {
        type: String,
        validate: validatorTexto,
        maxLength:2000
    },
    idAdministrador:{
        type:String,
        required:true,
    },
    limiteDeCupos:{
        type:Number,        
    },
    horarioInicio:{
        type: Date,
        required:true,
        validate:{
            validator:function(this:any){
                return this.horarioFinal>this.horarioInicio
            },
            message: props=>props.value + "No es un valor válido"
        }
    },
    horarioFinal:{
        type: Date,
        required:true,
        validate:{
            validator:function(this:any){
                return this.horarioFinal>this.horarioInicio
            },
            message: props=>props.value + "No es un valor válido"
        },
    },
    lugar:{
        type:String,
    },
    idParent:{
        type:String,
    },
    tipoParent:{
        type:String,
        enum: ["espacio"],
        required:function(this:any){
            return this.idParent!=null;
        }
    }
    
});

export const ModeloEventoPersonal= mongoose.model("EventoPersonal", esquemaEventoPersonal);
export const ModeloEventoPublico= mongoose.model("EventoPublico", esquemaEventoPublico);