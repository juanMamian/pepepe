"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModeloTrabajo = exports.esquemaTrabajo = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const VinculosNodosProyecto_1 = require("./VinculosNodosProyecto");
exports.esquemaTrabajo = new mongoose_1.default.Schema();
exports.esquemaTrabajo.add({
    nombre: {
        type: String,
        required: true,
        min: 3,
        max: 600,
        default: "Nuevo trabajo"
    },
    descripcion: {
        type: String,
        max: 10000,
        default: "Sin descripcion",
        required: true
    },
    responsables: {
        type: [String],
        default: []
    },
    nodosConocimiento: {
        type: [String],
        required: true,
        default: []
    },
    idProyectoParent: {
        type: String,
    },
    idForo: {
        type: String,
    },
    vinculos: {
        type: [VinculosNodosProyecto_1.EsquemaVinculosNodosProyecto],
        required: true,
        default: []
    },
    keywords: {
        type: String,
    },
    diagramaProyecto: {
        posicion: {
            x: {
                type: Number,
                required: true,
                default: 0
            },
            y: {
                type: Number,
                required: true,
                default: 0
            }
        }
    }
});
exports.esquemaTrabajo.index({ keywords: "text" });
exports.ModeloTrabajo = mongoose_1.default.model("Trabajo", exports.esquemaTrabajo);
