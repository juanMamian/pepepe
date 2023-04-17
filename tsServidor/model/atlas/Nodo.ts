import mongoose from "mongoose";

const esquemaClase = new mongoose.Schema({
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
})

const EsquemaVinculo = new mongoose.Schema({
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
    },
    nodoContraparte: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Nodo",
    }
})

EsquemaVinculo.pre("save", function (this: any, next) {
    if (this.tipo = "requiere") {
        this.tipo = "continuacion";
    }

    if (!this.nodoContraparte) {
        this.nodoContraparte = this.idRef;
    }

    next();
})


var esquemaNodo = new mongoose.Schema({
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
        modulo: {
            type: Number,
            default: 0
        },
        direccion: {
            type: Number,
            default: 0
        }
    },
    fuerzaColision: {
        modulo: {
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




esquemaNodo.methods.verificarVinculo = function (this: any, idRef, eliminar) {
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
}

esquemaNodo.index({ nombre: "text", keywords: "text", descripcion: "text" });

export const ModeloNodo = mongoose.model("Nodo", esquemaNodo);