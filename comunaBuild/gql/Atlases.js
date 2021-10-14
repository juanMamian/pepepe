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
exports.resolvers = exports.typeDefs = void 0;
const apollo_server_express_1 = require("apollo-server-express");
const ConfiguracionAtlas_1 = require("../model/ConfiguracionAtlas");
exports.typeDefs = apollo_server_express_1.gql `

    type ConfiguracionAtlas{
        id:ID,
        posicionando:Boolean
    }

    extend type Query{
        configuracionAtlas(nombreAtlas: String!):ConfiguracionAtlas
    }
    extend type Mutation{
    togglePosicionamientoAutomaticoAtlas(nombreAtlas:String!):ConfiguracionAtlas,
}    
`;
exports.resolvers = {
    Query: {
        configuracionAtlas(_, { nombreAtlas }, contexto) {
            return __awaiter(this, void 0, void 0, function* () {
                console.log(`Query de configuracion del atlas de ${nombreAtlas}`);
                try {
                    var configuracion = yield ConfiguracionAtlas_1.ModeloConfiguracionAtlas.findOne({ nombre: nombreAtlas }).exec();
                }
                catch (error) {
                    console.log(`Error buscando la configuración del atlas: ${error}`);
                }
                return configuracion;
            });
        }
    },
    Mutation: {
        togglePosicionamientoAutomaticoAtlas(_, { nombreAtlas }, contexto) {
            return __awaiter(this, void 0, void 0, function* () {
                console.log(`Toggling posicionamiento automatico del atlas ${nombreAtlas}`);
                const credencialesUsuario = contexto.usuario;
                //Authorización
                if (!credencialesUsuario.permisos.includes("superadministrador")) {
                    console.log(`Error de autenticacion toggling posicionamiento automático`);
                    throw new apollo_server_express_1.AuthenticationError("No autorizado");
                }
                try {
                    var configuracion = yield ConfiguracionAtlas_1.ModeloConfiguracionAtlas.findOne({ nombre: nombreAtlas }).exec();
                }
                catch (error) {
                    console.log(`error buscando configuración del atlas: ${error}`);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                console.log(`De ${configuracion.posicionando}`);
                configuracion.posicionando = !configuracion.posicionando;
                console.log(`A ${configuracion.posicionando}`);
                try {
                    yield configuracion.save();
                }
                catch (error) {
                    console.log(`Error guardando la nueva configuración del atlas: ${error}`);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                return configuracion;
            });
        },
    }
};
