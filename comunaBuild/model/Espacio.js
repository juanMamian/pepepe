"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModeloEspacio = exports.esquemaEvento = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const config_1 = require("./config");
exports.esquemaEvento = new mongoose_1.default.Schema({
    nombre: {
        type: String,
        default: "Nuevo espacio",
        validate: {
            validator: function (n) {
                return !config_1.charProhibidosNombreCosa.test(n);
            },
            message: props => `${props.value} contiene caracteres ilegales!`
        },
        minlength: 3,
        maxLength: 60,
    },
    descripcion: {
        type: String,
        validate: {
            validator: function (d) {
                return !config_1.charProhibidosTexto.test(d);
            },
            message: props => `${props.value} contiene caracteres ilegales`
        }
    },
    idAdministrador: {
        type: String,
        required: true,
    }
});
exports.ModeloEspacio = mongoose_1.default.model("Espacio", exports.esquemaEvento);
