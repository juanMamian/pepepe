"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModeloTrabajo = exports.esquemaTrabajo = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const VinculosNodosProyecto_1 = require("./VinculosNodosProyecto");
const esquemaMaterial = new mongoose_1.default.Schema({
    nombre: {
        type: String,
        required: true,
        min: 3,
        max: 100,
        default: "Nuevo material"
    },
    descripcion: {
        type: String,
        max: 2000,
    },
    cantidadNecesaria: {
        type: Number,
        required: true,
        default: 1,
    },
    cantidadDisponible: {
        type: Number,
        required: true,
        default: 0,
    }
});
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
    estadoDesarrollo: {
        type: String,
        required: true,
        default: "noCompletado",
        enum: ["noCompletado", "completado"]
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
    nodosConocimiento: {
        type: [String],
        required: true,
        default: []
    },
    nodoParent: {
        idNodo: String,
        tipo: String,
    },
    idForoResponsables: {
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
    },
    materiales: {
        type: [esquemaMaterial],
        default: [],
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
    },
    peso: {
        type: Number,
        default: 0
    }
});
exports.esquemaTrabajo.index({ nombre: "text", keywords: "text", descripcion: "text" });
exports.ModeloTrabajo = mongoose_1.default.model("Trabajo", exports.esquemaTrabajo);
