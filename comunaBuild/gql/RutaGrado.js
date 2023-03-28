"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.funcionesInicioRutaGrado = exports.resolvers = exports.typeDefs = void 0;
const apollo_server_express_1 = require("apollo-server-express");
const RutaGrado_1 = require("../model/rutaGrado/RutaGrado");
exports.typeDefs = apollo_server_express_1.gql `

    type NodoRutaGrado{
        id: ID,
        nombre: String,
        descripcion: String,        
    }

    type SubrutaGrado{
        id: ID,
        nombre: String,
        descripcion: String,
        nodos: [NodoRutaGrado],
        color: String,
    }
    
    extend type Query{
        subrutasGradoMaestraVida:[SubrutaGrado],
    },

    extend type Mutation{
        setColorSubrutaGrado(idSubruta: ID!, nuevoColor: String!):SubrutaGrado,
    }

   
`;
exports.resolvers = {
    Query: {
        subrutasGradoMaestraVida(_, {}, contexto) {
            var _a;
            return __awaiter(this, void 0, void 0, function* () {
                if (!((_a = contexto.usuario) === null || _a === void 0 ? void 0 : _a.id)) {
                    throw new apollo_server_express_1.AuthenticationError('loginRequerido');
                }
                const credencialesUsuario = contexto.usuario;
                try {
                    var lasSubrutas = yield RutaGrado_1.ModeloSubrutaGrado.find({}).exec();
                }
                catch (error) {
                    throw new apollo_server_express_1.ApolloError('Error conectando con la base de datos');
                }
                return lasSubrutas;
            });
        },
    },
    Mutation: {
        setColorSubrutaGrado(_, { idSubruta, nuevoColor }, contexto) {
            var _a;
            return __awaiter(this, void 0, void 0, function* () {
                if (!((_a = contexto.usuario) === null || _a === void 0 ? void 0 : _a.id)) {
                    throw new apollo_server_express_1.AuthenticationError('loginRequerido');
                }
                const credencialesUsuario = contexto.usuario;
                if (!credencialesUsuario.permisos.includes("superadministrador")) {
                    throw new apollo_server_express_1.AuthenticationError("No autorizado");
                }
                try {
                    var laSubruta = yield RutaGrado_1.ModeloSubrutaGrado.findById(idSubruta).exec();
                    if (!laSubruta)
                        throw 'Subruta no encontrado';
                }
                catch (error) {
                    throw new apollo_server_express_1.ApolloError('Error conectando con la base de datos');
                }
                laSubruta.color = nuevoColor;
                try {
                    yield laSubruta.save();
                }
                catch (error) {
                    throw new apollo_server_express_1.ApolloError('Error guardando la subruta: ' + error);
                }
                return laSubruta;
            });
        },
    }
};
const funcionesInicioRutaGrado = function () {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("Inicializando subrutas de grado");
        try {
            var lasSubrutas = yield RutaGrado_1.ModeloSubrutaGrado.find({}).exec();
        }
        catch (error) {
            throw new apollo_server_express_1.ApolloError('Error conectando con la base de datos');
        }
        if (lasSubrutas.length > 0) {
            console.log("Inicialización innecesaria");
        }
        console.log("No había subrutas, creando");
        var rutaNodos = new RutaGrado_1.ModeloSubrutaGrado(RutaGrado_1.laRutaNodosConocimiento);
        var rutaProyectoSocial = new RutaGrado_1.ModeloSubrutaGrado(RutaGrado_1.laRutaProyectoSocial);
        var rutaProyectoMediaTecnica = new RutaGrado_1.ModeloSubrutaGrado(RutaGrado_1.laRutaProyectoMediaTecnica);
        try {
            yield rutaNodos.save();
            yield rutaProyectoSocial.save();
            yield rutaProyectoMediaTecnica.save();
        }
        catch (error) {
            console.log("Error creando subrutas de grado: " + error);
        }
        console.log("Subrutas de grado inicializadas");
    });
};
exports.funcionesInicioRutaGrado = funcionesInicioRutaGrado;
