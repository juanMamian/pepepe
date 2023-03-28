"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModeloNodo = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const esquemaClase = new mongoose_1.default.Schema({
    idExperto: String,
    interesados: [String],
    nombre: {
        type: String,
        default: "Nombre"
    },
    descripion: {
        type: String,
        default: ""
    },
});
const EsquemaVinculo = new mongoose_1.default.Schema({
    idRef: {
        type: String,
        required: true
    },
    rol: {
        type: String,
        required: true,
        enum: ["target", "source"],
    },
    tipo: {
        type: String,
        required: true,
        default: "continuacion",
    }
});
EsquemaVinculo.pre("save", function (next) {
    if (this.tipo = "requiere") {
        this.tipo = "continuacion";
    }
    next();
});
var esquemaNodo = new mongoose_1.default.Schema({
    nombre: {
        type: String,
        min: 3,
        max: 50,
        required: true,
        default: "nodo de conocimiento"
    },
    nivel: {
        type: Number,
        default: 0
    },
    descripcion: {
        type: String
    },
    keywords: {
        type: String,
    },
    icono: {
        type: Buffer
    },
    tipoNodo: {
        type: String,
        enum: ["concepto", "skill"],
        default: "concepto",
    },
    vinculos: {
        type: [EsquemaVinculo],
        default: []
    },
    coordsManuales: {
        x: Number,
        y: Number
    },
    coords: {
        x: Number,
        y: Number,
    },
    autoCoords: {
        x: Number,
        y: Number,
    },
    centroMasa: {
        x: Number,
        y: Number,
    },
    stuck: Boolean,
    puntaje: Number,
    resumen: {
        type: String,
        max: 2000,
    },
    expertos: {
        type: [String],
        required: true,
        default: []
    },
    clases: {
        type: [esquemaClase],
        default: [],
    },
    posiblesExpertos: {
        type: [String],
        required: true,
        default: []
    },
    idForoPublico: {
        type: String,
        required: true,
    },
    idForoExpertos: {
        type: String,
        required: true,
    },
    secciones: {
        type: [{
                nombre: {
                    type: String,
                    max: 40,
                    min: 2,
                    default: "Nueva sección"
                },
                idCarpeta: {
                    type: String,
                },
                modo: {
                    type: String,
                    default: "archivo",
                    enum: ["archivo", "enlace"]
                },
                enlace: {
                    type: String,
                }
            }],
        default: []
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
    },
    coordx: Number,
    coordy: Number,
    radio: Number,
    angulo: Number,
    direccion: Number,
    ubicado: Boolean
});
esquemaNodo.methods.verificarVinculo = function (idRef, eliminar) {
    console.log(`${this.nombre} está buscando un vinculo con ${idRef}. Eliminar es ${eliminar}`);
    var respuesta = false;
    for (var vinculo of this.vinculos) {
        if (vinculo.idRef == idRef) {
            console.log(`encontrado`);
            respuesta = true;
            if (eliminar) {
                console.log(`eliminando`);
                vinculo.remove();
            }
        }
    }
    return respuesta;
};
esquemaNodo.index({ nombre: "text", keywords: "text", descripcion: "text" });
exports.ModeloNodo = mongoose_1.default.model("Nodo", esquemaNodo);
