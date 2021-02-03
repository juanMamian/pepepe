"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModeloConversacion = exports.charProhibidosMensajeRespuesta = exports.esquemaConversacion = exports.esquemaRespuestaConversacion = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
exports.esquemaRespuestaConversacion = new mongoose_1.default.Schema({
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
    idAutor: {
        type: String,
        required: true,
    }
});
exports.esquemaConversacion = new mongoose_1.default.Schema({
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
        required: true,
    },
    acceso: {
        type: String,
        required: true,
        default: "publico",
        enum: ["publico", "privado"]
    }
});
exports.charProhibidosMensajeRespuesta = /[^\n\r a-zA-ZÀ-ž0-9_():;.,+¡!¿?@=-]/;
exports.ModeloConversacion = mongoose_1.default.model("Conversacion", exports.esquemaConversacion);
