import mongoose from "mongoose";

export const esquemaRespuestaConversacion = new mongoose.Schema({

    fecha: {
        type: Date,
        required: true,
        default: Date.now
    },
    archivo: {
        nombre: String,
        extension: String,
        idGoogleDrive: String,
        googleDriveDirectLink: String,
    },
    mensaje: {
        type: String,
        required: true,
    },
    enlaceAdjunto:{
        type:[String],
        default:[]
    },
    idAutor: {
        type: String,
        required: true,
    },
    infoAutor:{
        id:String,
        nombres:String,
        apellidos:String,
        username:String
    },
    interpolaciones:{
        tipo:{
            type:String,
            required:true,
            enum:["video", "quote", "imagen"]
        },
        enlaceIframe:{
            type:String,            
        }
    }

});


export const esquemaConversacion = new mongoose.Schema({
    titulo: {
        type: String,
        default: "Nueva conversación",
        required: true
    },
    estado: {
        type: String,
        default: "abierta",
        required: true,
        enum: ["abierta", "cerrada"]
    },
    idCreador: {
        type: String,
    },
    acceso: {
        type: String,
        required: true,
        default: "publico",
        enum: ["publico", "privado"]
    },
    cantidadRespuestas: {
        type: Number,
        default: 0,
        required: true,
    },
    infoUltimaRespuesta: {
        idAutor: String,
        fecha: {
            type: Date,
            required:true,
            default:new Date(2021, 2, 1),
        }
    }
});

esquemaConversacion.pre('save', function (this: any, next) {
    if (!this.cantidadRespuestas) {
        console.log(`Llenando con cantidadRespuestas 0`);
        this.cantidadRespuestas = 0;
    }
    next();

});

export const charProhibidosMensajeRespuesta = /[^\n\r a-zA-ZÀ-ž0-9_()":;.,+¡!¿?@=-]/;


export const ModeloConversacion = mongoose.model("Conversacion", esquemaConversacion);