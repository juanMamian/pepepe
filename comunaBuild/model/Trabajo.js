"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModeloTrabajo = exports.esquemaTrabajo = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
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
    idForo: {
        type: String,
    },
});
exports.ModeloTrabajo = mongoose_1.default.model("Trabajo", exports.esquemaTrabajo);
