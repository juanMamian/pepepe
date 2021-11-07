"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModeloGrupo = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const esquemaVinculosNodosGrupo = new mongoose_1.default.Schema({
    idRef: {
        type: String,
        required: true,
    },
    tipo: {
        type: String,
        required: true,
        enum: ["requiere"]
    },
    tipoRef: {
        type: String,
        required: true,
        enum: ["trabajo", "objetivo"]
    }
});
const esquemaTrabajoDeGrupo = new mongoose_1.default.Schema({
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
    idObjetivoParent: {
        type: String,
    },
    nodosConocimiento: {
        type: [String],
        required: true,
        default: []
    },
    vinculos: {
        type: [esquemaVinculosNodosGrupo],
        required: true,
        default: []
    },
    keywords: {
        type: String,
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
});
const esquemaObjetivoDeGrupo = new mongoose_1.default.Schema({
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
    estadoDesarrollo: {
        type: String,
        required: true,
        default: "noCompletado",
        enum: ["noCompletado", "completado"]
    },
    vinculos: {
        type: [esquemaVinculosNodosGrupo],
        required: true,
        default: []
    },
    keywords: {
        type: String,
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
});
const esquemaPeticionBien = new mongoose_1.default.Schema({
    idBeneficiario: {
        type: String,
        required: true,
    },
    cantidadSolicitada: {
        type: String,
        required: true,
    },
    cantidadAsignada: {
        type: Number,
    }
});
const esquemaPeticionServicio = new mongoose_1.default.Schema({
    idBeneficiario: {
        type: String,
        required: true,
    },
});
const esquemaBien = new mongoose_1.default.Schema({
    nombre: {
        type: String,
        default: "Nuevo bien",
    },
    descripcion: {
        type: String,
    },
    unidad: {
        type: String,
        required: true,
        default: "unidades",
    },
    cantidad: {
        type: Number,
        default: 0,
    },
    fechaCierre: {
        type: Date,
        default: Date.now
    },
    fechaReparticion: {
        type: Date,
        default: Date.now
    },
    instruccionesRecibir: {
        type: String
    },
    listaPeticiones: {
        type: [esquemaPeticionBien],
        default: [],
    }
});
const esquemaServicio = new mongoose_1.default.Schema({
    nombre: {
        type: String,
        default: "Nuevo bien",
    },
    descripcion: {
        type: String,
    },
    listaPeticiones: {
        type: [esquemaPeticionServicio],
        default: []
    }
});
const esquemaGrupo = new mongoose_1.default.Schema({
    nombre: {
        type: String,
        min: 2,
        max: 1024,
        required: true,
        default: "Nuevo grupo"
    },
    descripcion: {
        type: String,
        default: "Sin descripción",
        required: true,
    },
    objetivos: {
        type: [esquemaObjetivoDeGrupo],
        required: true,
        default: []
    },
    trabajos: {
        type: [esquemaTrabajoDeGrupo],
        default: []
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
    participantes: {
        type: [String],
        default: []
    },
    idForo: {
        type: String,
        required: true,
    },
    bienes: {
        type: [esquemaBien],
        default: []
    },
    servicios: {
        type: [esquemaServicio],
        default: []
    }
});
exports.ModeloGrupo = mongoose_1.default.model("Grupo", esquemaGrupo);
