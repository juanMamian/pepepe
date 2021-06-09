"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModeloProyecto = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const Objetivo_1 = require("./Objetivo");
const esquemaProyecto = new mongoose_1.default.Schema({
    nombre: {
        type: String,
        min: 2,
        max: 1024,
        required: true,
        default: "Nuevo proyecto"
    },
    descripcion: {
        type: String,
        default: "Sin descripción",
        required: true,
    },
    responsables: {
        type: [String],
        default: []
    },
    posiblesResponsables: {
        type: [String],
        default: []
    },
    idForo: {
        type: String,
        required: true,
    },
    centroMasa: {
        x: {
            type: Number,
            default: 0,
        },
        y: {
            type: Number,
            default: 0,
        },
    },
    objetivos: {
        type: [Objetivo_1.esquemaObjetivo],
        default: []
    }
});
exports.ModeloProyecto = mongoose_1.default.model("Proyecto", esquemaProyecto);
