"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModeloEvento = exports.esquemaEvento = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
exports.esquemaEvento = new mongoose_1.default.Schema({
    nombre: {
        type: String,
        required: true,
        min: 3,
        max: 1024,
        default: "Nuevo evento"
    },
    responsables: {
        type: [String],
        default: []
    },
    posiblesResponsables: {
        type: [String],
        default: []
    },
    participantes: {
        type: [String],
        default: []
    },
    responsablesSolicitados: {
        type: Number,
        default: 0,
    },
    descripcion: {
        type: String,
        default: "Sin descripcion",
        required: true,
        max: 2000
    },
    horarioInicio: {
        type: Date
    },
    horarioFinal: {
        type: Date
    },
    origen: {
        type: String,
    },
    idOrigen: {
        type: String
    },
    idNodo: {
        type: String
    }
});
exports.ModeloEvento = mongoose_1.default.model("Evento", exports.esquemaEvento);
