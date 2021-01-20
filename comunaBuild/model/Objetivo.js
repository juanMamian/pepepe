"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.esquemaObjetivo = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
exports.esquemaObjetivo = new mongoose_1.default.Schema({
    nombre: {
        type: String,
        required: true,
        min: 3,
        max: 1024,
        default: "nuevo objetivo"
    },
    descripcion: {
        type: String,
        max: 2000
    },
    vinculos: [
        {
            tipoTarget: {
                type: String,
                required: true
            },
            ref: {
                type: String,
                required: true
            },
            tipoVinculo: {
                type: String,
                required: true
            }
        }
    ],
    estado: {
        type: String,
        required: true,
        default: "noCumplido",
        enum: ["noCumplido", "cumplido"],
    }
});
