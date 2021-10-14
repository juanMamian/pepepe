"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModeloConfiguracionAtlas = exports.esquemaConfiguracionAtlas = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
exports.esquemaConfiguracionAtlas = new mongoose_1.default.Schema({
    nombre: {
        type: String,
        required: true,
        enum: ["solidaridad", "conocimiento"],
    },
    posicionando: {
        type: Boolean,
        default: false,
    }
});
exports.ModeloConfiguracionAtlas = mongoose_1.default.model("ConfiguracionAtlas", exports.esquemaConfiguracionAtlas, "configuracionesAtlas");
