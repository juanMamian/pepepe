"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModeloNodoSolidaridad = exports.esquemaNodoSolidaridad = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const VinculosNodosSolidaridad_1 = require("./VinculosNodosSolidaridad");
const Schema_1 = require("../../gql/Schema");
const AtlasSolidaridad_1 = require("../../gql/AtlasSolidaridad");
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
const esquemaEnlace = new mongoose_1.default.Schema({
    nombre: {
        type: String,
        min: 2,
        max: 30,
        required: true,
        default: "Nuevo enlace"
    },
    descripcion: {
        type: String,
        max: 1000,
        default: "Sin descripción",
    },
    link: {
        type: String,
        min: 6,
        max: 500,
    },
    tipo: {
        type: String,
        enum: ["enlace", "hojaCalculo", "documentoTexto"],
        default: "enlace",
    }
});
exports.esquemaNodoSolidaridad = new mongoose_1.default.Schema();
exports.esquemaNodoSolidaridad.add({
    nombre: {
        type: String,
        required: true,
        min: 3,
        max: 600,
        default: "Nuevo nodo de solidaridad"
    },
    descripcion: {
        type: String,
        max: 10000,
        default: "Sin descripcion",
        required: true
    },
    tipoNodo:{
        type:String,
        required:true,
        default:"trabajo",
        enum: ["trabajo", "objetivo"]
    },
    enlaces: {
        type: [esquemaEnlace],
        default: []
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
    nodoParent: {
        type: String,
    },
    idForoResponsables: {
        type: String,
    },
    vinculos: {
        type: [VinculosNodosSolidaridad_1.EsquemaVinculosNodosSolidaridad],
        required: true,
        default: []
    },
    keywords: {
        type: String,
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
    autoCoords: {
        x: {
            type: Number,
            default: 0
        },
        y: {
            type: Number,
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
    },
    fuerzaCentroMasa: {
        fuerza: {
            type: Number,
            default: 0
        },
        direccion: {
            type: Number,
            default: 0
        }
    },
    fuerzaColision: {
        fuerza: {
            type: Number,
            default: 0
        },
        direccion: {
            type: Number,
            default: 0
        }
    }
});
exports.esquemaNodoSolidaridad.post("save", function (nodo) {
    Schema_1.pubsub.publish(AtlasSolidaridad_1.NODO_EDITADO, { nodoEditado: nodo });
});
exports.esquemaNodoSolidaridad.index({ nombre: "text", keywords: "text", descripcion: "text" });
exports.ModeloNodoSolidaridad = mongoose_1.default.model("NodoSolidaridad", exports.esquemaNodoSolidaridad);
