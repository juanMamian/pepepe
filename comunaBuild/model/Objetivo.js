"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModeloObjetivo = exports.esquemaObjetivo = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const VinculosNodosProyecto_1 = require("./VinculosNodosProyecto");
exports.esquemaObjetivo = new mongoose_1.default.Schema({
    nombre: {
        type: String,
        required: true,
        min: 3,
        max: 1024,
        default: "nuevo objetivo"
    },
    responsables: {
        type: [String],
        default: []
    },
    posiblesResponsables: {
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
    estado: {
        type: String,
        required: true,
        default: "noCumplido",
        enum: ["noCumplido", "cumplido"],
    },
    vinculos: {
        type: [VinculosNodosProyecto_1.EsquemaVinculosNodosProyecto],
        required: true,
        default: []
    },
    idNodoParent: {
        type: String
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
    },
    coords: {
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
    },
    angulo: {
        type: Number,
        default: 0,
    },
    stuck: {
        type: Boolean,
        default: true,
    },
    puntaje: {
        type: Number,
        default: 0,
    },
    centroMasa: {
        x: {
            type: Number,
            default: 0,
        },
        y: {
            type: Number,
            default: 0
        }
    },
    nivel: {
        type: Number,
    },
    turnoNivel: {
        type: Number,
    }
});
exports.esquemaObjetivo.index({ keywords: "text", nombre: "text", descripcion: "text" });
exports.ModeloObjetivo = mongoose_1.default.model("Objetivo", exports.esquemaObjetivo);
