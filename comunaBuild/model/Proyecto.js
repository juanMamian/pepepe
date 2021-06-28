"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModeloProyecto = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const Objetivo_1 = require("./Objetivo");
const Trabajo_1 = require("./Trabajo");
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
    objetivos: {
        type: [Objetivo_1.esquemaObjetivo],
        required: true,
        default: []
    },
    idsTrabajos: {
        type: [String],
        default: [],
        required: true,
    },
    trabajos: {
        type: [Trabajo_1.esquemaTrabajo],
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
exports.ModeloProyecto = mongoose_1.default.model("Proyecto", esquemaProyecto);
