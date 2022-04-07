"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.esquemaArchivo = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
exports.esquemaArchivo = new mongoose_1.default.Schema({
    nombre: {
        type: String,
        minlength: 3,
        maxlength: 30,
        required: true,
    },
    payload: {
        type: Buffer,
    }
});
