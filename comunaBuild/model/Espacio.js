"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModeloEspacio = exports.esquemaEspacio = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const config_1 = require("./config");
const EsquemaIteracionSemanal = new mongoose_1.default.Schema({
    diaSemana: {
        type: Number,
        min: 0,
        max: 6
    },
    millisInicio: {
        type: Number,
        required: true,
        max: 86400000,
        validate: {
            validator: function () {
                return this.millisFinal > this.millisInicio;
            },
            message: "El tiempo de inicio debería ser menor que el tiempo de finalización"
        }
    },
    millisFinal: {
        type: Number,
        required: true,
        max: 86400000,
        validate: {
            validator: function () {
                return this.millisFinal > this.millisInicio;
            },
            message: "El tiempo de finalización debería ser mayor que el tiempo de inicio"
        }
    },
    idsParticipantesConstantes: {
        type: [String],
        default: []
    },
});
EsquemaIteracionSemanal.virtual('nombreEspacio').get(function () {
    return this.parent().nombre;
});
EsquemaIteracionSemanal.virtual('idAdministradorEspacio').get(function () {
    return this.parent().idAdministrador;
});
EsquemaIteracionSemanal.virtual('idEspacio').get(function () {
    return this.parent()._id;
});
EsquemaIteracionSemanal.virtual('paraChiquis').get(function () {
    return this.parent().paraChiquis;
});
exports.esquemaEspacio = new mongoose_1.default.Schema({
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
    },
    iteracionesSemanales: {
        type: [EsquemaIteracionSemanal],
        default: [],
    },
    paraChiquis: {
        type: Boolean,
        default: false,
    }
});
exports.ModeloEspacio = mongoose_1.default.model("Espacio", exports.esquemaEspacio);
