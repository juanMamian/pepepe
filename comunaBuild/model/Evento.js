"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModeloEventoPublico = exports.ModeloEventoPersonal = exports.esquemaEventoPublico = exports.esquemaEventoPersonal = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const config_1 = require("./config");
const maxDuracionEventos = 1000 * 60 * 60 * 10; //10 horas
const minDuracionEventos = 1000 * 60 * 5; //5 minutos
exports.esquemaEventoPersonal = new mongoose_1.default.Schema({
    idPersona: {
        type: String,
        required: true,
    },
    idsParticipantes: {
        type: [String],
        validate: {
            validator: function (ids) {
                return !ids.includes(this.idPersona);
            },
            message: props => "idsParticipantes (" + props.value + ") no puede contener a la persona que creó el evento",
        },
        default: [],
    },
    idParent: {
        type: String,
        required: function () {
            return this.tipoParent;
        }
    },
    tipoParent: {
        type: String,
        enum: ["nodoSolidaridad"],
        required: function () {
            return this.idParent;
        }
    },
    nombre: {
        type: String,
        minLength: 3,
        maxLength: 1024,
        validate: config_1.validatorNombreCosa,
        default: "Nuevo evento"
    },
    descripcion: {
        type: String,
        validate: config_1.validatorTexto,
        maxLength: 2000
    },
    horarioInicio: {
        type: Date,
        required: true,
        validate: {
            validator: function () {
                const duracion = this.horarioFinal - this.horarioInicio;
                return duracion >= minDuracionEventos && duracion <= maxDuracionEventos;
            },
            message: props => props.value + "No es un valor válido"
        }
    },
    horarioFinal: {
        type: Date,
        required: true,
        validate: {
            validator: function () {
                const duracion = this.horarioFinal - this.horarioInicio;
                return duracion >= minDuracionEventos && duracion <= maxDuracionEventos;
            },
            message: props => props.value + "No es un valor válido"
        }
    },
    idEventoMarco: {
        type: String,
    },
    lugar: {
        type: String,
    },
});
exports.esquemaEventoPublico = new mongoose_1.default.Schema({
    nombre: {
        type: String,
        minLength: 3,
        maxLength: 1024,
        validate: config_1.validatorNombreCosa,
        default: "Nuevo evento"
    },
    descripcion: {
        type: String,
        validate: config_1.validatorTexto,
        maxLength: 2000
    },
    idAdministrador: {
        type: String,
        required: true,
    },
    limiteDeCupos: {
        type: Number,
    },
    horarioInicio: {
        type: Date,
        required: true,
        validate: {
            validator: function () {
                const duracion = this.horarioFinal - this.horarioInicio;
                return duracion >= minDuracionEventos && duracion <= maxDuracionEventos;
            },
            message: props => props.value + "No es un valor válido"
        }
    },
    horarioFinal: {
        type: Date,
        required: true,
        validate: {
            validator: function () {
                const duracion = this.horarioFinal - this.horarioInicio;
                return duracion >= minDuracionEventos && duracion <= maxDuracionEventos;
            },
            message: props => props.value + "No es un valor válido"
        },
    },
    lugar: {
        type: String,
    },
    idParent: {
        type: String,
    },
    tipoParent: {
        type: String,
        enum: ["espacio"],
        required: function () {
            return this.idParent != null;
        }
    }
});
exports.ModeloEventoPersonal = mongoose_1.default.model("EventoPersonal", exports.esquemaEventoPersonal);
exports.ModeloEventoPublico = mongoose_1.default.model("EventoPublico", exports.esquemaEventoPublico);
