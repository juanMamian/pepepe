<<<<<<< HEAD
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModeloSubrutaGrado = exports.laRutaProyectoMediaTecnica = exports.laRutaProyectoSocial = exports.laRutaNodosConocimiento = exports.EsquemaRutaGrado = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const EsquemaNodoRutaGrado = new mongoose_1.default.Schema({
=======
import mongoose from "mongoose";
const EsquemaNodoRutaGrado = new mongoose.Schema({
>>>>>>> 5e189828d6dd86bdccadb62738a42a8cd12c5205
    nombre: {
        type: String,
        required: true,
        minLength: 3,
        maxLength: 100,
    },
    descripcion: {
        type: String,
        maxLength: 5000,
    },
});
<<<<<<< HEAD
const EsquemaSubrutaGrado = new mongoose_1.default.Schema({
=======
const EsquemaSubrutaGrado = new mongoose.Schema({
>>>>>>> 5e189828d6dd86bdccadb62738a42a8cd12c5205
    nombre: {
        type: String,
        required: true,
    },
    nodos: {
        type: [EsquemaNodoRutaGrado],
        default: [],
    },
    color: {
        type: String,
    }
});
<<<<<<< HEAD
exports.EsquemaRutaGrado = new mongoose_1.default.Schema({
=======
export const EsquemaRutaGrado = new mongoose.Schema({
>>>>>>> 5e189828d6dd86bdccadb62738a42a8cd12c5205
    subrutas: {
        type: [EsquemaSubrutaGrado],
        default: [],
    }
});
<<<<<<< HEAD
exports.EsquemaRutaGrado.virtual("idUsuario").get(function () {
    return this.parent()._id;
});
exports.laRutaNodosConocimiento = {
=======
EsquemaRutaGrado.virtual("idUsuario").get(function () {
    return this.parent()._id;
});
export const laRutaNodosConocimiento = {
>>>>>>> 5e189828d6dd86bdccadb62738a42a8cd12c5205
    nombre: "Los nodos de conocimiento",
    nodos: [
        {
            nombre: "Definición de nodos",
            descripcion: "Hacer una lista de los nodos de conocimiento apropiados de acuerdo con tus planes para la vida."
        },
        {
            nombre: "Aprendizaje de los nodos",
            descripcion: "Actividades de estudio con las que se adquieren los nodos de conocimiento de la lista."
        },
        {
            nombre: "Refrendación del aprendizaje",
            descripcion: "Una reunión con familia y profes en la que se declaran completados los nodos de conocimiento seleccionados."
        },
    ]
};
<<<<<<< HEAD
exports.laRutaProyectoSocial = {
=======
export const laRutaProyectoSocial = {
>>>>>>> 5e189828d6dd86bdccadb62738a42a8cd12c5205
    nombre: "Proyecto social",
    nodos: [
        {
            nombre: "Idea de proyecto social",
            descripcion: "Una idea para desarrollar un proyecto de impacto social."
        },
        {
            nombre: "Aprobación de anteproyecto",
            descripcion: "Presentar el anteproyecto para decidir si está adecuadamente planteado."
        },
        {
            nombre: "Desarrollo del proyecto",
            descripcion: "Ejecución de los planes creados en el anteproyecto."
        },
        {
            nombre: "Presentación de avance",
            descripcion: "Presentación en la que se comparte con los demás el progreso de los trabajos."
        },
        {
            nombre: "Entrega de informa final",
            descripcion: "Entrega de un documento que contiene el informe final del desarrollo del proyecto."
        },
        {
            nombre: "Presentación de informe final",
            descripcion: "Presentación en la que se comparte con los demás el informe final del proyecto para recibir correcciones y sugerencias."
        },
        {
            nombre: "Entrega de informe final corregido",
            descripcion: "Entrega del documento de informe final con correcciones realizadas."
        },
    ]
};
<<<<<<< HEAD
exports.laRutaProyectoMediaTecnica = {
=======
export const laRutaProyectoMediaTecnica = {
>>>>>>> 5e189828d6dd86bdccadb62738a42a8cd12c5205
    nombre: "Proyecto agroecológico de media técnica",
    nodos: [
        {
            nombre: "Idea de proyecto agroecológico",
            descripcion: "Una idea para desarrollar un proyecto agroecológico."
        },
        {
            nombre: "Aprobación de anteproyecto",
            descripcion: "Presentar el anteproyecto para decidir si está adecuadamente planteado."
        },
        {
            nombre: "Desarrollo del proyecto",
            descripcion: "Ejecución de los planes creados en el anteproyecto."
        },
        {
            nombre: "Presentación de avance",
            descripcion: "Presentación en la que se comparte con los demás el progreso de los trabajos."
        },
        {
            nombre: "Entrega de informa final",
            descripcion: "Entrega de un documento que contiene el informe final del desarrollo del proyecto."
        },
        {
            nombre: "Presentación de informe final",
            descripcion: "Presentación en la que se comparte con los demás el informe final del proyecto para recibir correcciones y sugerencias."
        },
        {
            nombre: "Entrega de informe final corregido",
            descripcion: "Entrega del documento de informe final con correcciones realizadas."
        },
    ]
};
<<<<<<< HEAD
exports.ModeloSubrutaGrado = mongoose_1.default.model("SubrutaGrado", EsquemaSubrutaGrado);
=======
export const ModeloSubrutaGrado = mongoose.model("SubrutaGrado", EsquemaSubrutaGrado);
>>>>>>> 5e189828d6dd86bdccadb62738a42a8cd12c5205
