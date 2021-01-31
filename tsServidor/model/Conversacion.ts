import mongoose from "mongoose";

const esquemaRespuestaConversacion = new mongoose.Schema({

    fechaUpload: {
        type: Date
    },
    archivo: {
        nombre: String,
        extension: String,
        idGoogleDrive: String,
        googleDriveDirectLink: String,
    },
    comentario: {
        type: String,
    },
    idAutor: {
        type: String,
        required: true,
    }

});


const esquemaConversacion = new mongoose.Schema({    
    visibilidad:{
        type: String,
        default: "publica",
        required:true,
        enum:["publica", "privada"],
    },
    estado: {
        type: String,
        default: "abierta",
        required: true,
        enum: ["abierta", "cerrada"]
    },
    respuestas: {
        type: [esquemaRespuestaConversacion],
        required: true,
        default: []
    },    
});

export const ModeloConversacion=mongoose.model("Conversacion", esquemaConversacion);