"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModeloNodo = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
var esquemaNodo = new mongoose_1.default.Schema();
esquemaNodo.add({
    nombre: {
        type: String,
        min: 3,
        max: 50,
        required: true,
        default: "nodo de conocimiento"
    },
    icono: {
        type: Buffer
    },
    vinculos: [
        {
            idRef: {
                type: mongoose_1.default.Types.ObjectId,
                required: true
            },
            rol: {
                type: String,
                required: true
            },
            tipo: {
                type: String,
                required: true,
                default: "continuacion"
            }
        }
    ],
    coordsManuales: {
        x: Number,
        y: Number
    },
    resumen: {
        type: String,
        max: 2000,
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
exports.ModeloNodo = mongoose_1.default.model("Nodo", esquemaNodo);
