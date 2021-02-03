import mongoose from "mongoose";

export const esquemaRespuestaConversacion = new mongoose.Schema({

    fecha: {
        type: Date,
        required: true,
        default:Date.now
    },
    archivo: {
        nombre: String,
        extension: String,
        idGoogleDrive: String,
        googleDriveDirectLink: String,
    },
    mensaje: {
        type: String,
        required:true,
    },
    idAutor: {
        type: String,
        required: true,
    }

});


export const esquemaConversacion = new mongoose.Schema({    
    titulo:{
        type:String,
        default:"Nueva conversación",
        required:true
    },   
    estado: {
        type: String,
        default: "abierta",
        required: true,
        enum: ["abierta", "cerrada"]
    },
    idCreador:{
        type:String,
        required:true,
    },
    acceso:{
        type:String,
        required:true,  
        default:"publico",
        enum:["publico", "privado"]
    }
});

export const charProhibidosMensajeRespuesta = /[^\n\r a-zA-ZÀ-ž0-9_():;.,+¡!¿?@=-]/;


export const ModeloConversacion=mongoose.model("Conversacion", esquemaConversacion);