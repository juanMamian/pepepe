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
const Trabajo_1 = require("../model/Trabajo");
const Nodo = require("../model/atlas/Nodo");
const Usuario_1 = require("../model/Usuario");
exports.typeDefs = apollo_server_express_1.gql `
   type Trabajo{
       id: ID,
       nombre: String,
       descripcion:String,
       responsables: [PublicUsuario],
       nodosConocimiento:[NodoConocimiento]
   }

   extend type Query{
       trabajo(idTrabajo: ID!):Trabajo
   }

`;
exports.resolvers = {
    Query: {
        trabajo: function (_, args, context) {
            return __awaiter(this, void 0, void 0, function* () {
                console.log(`Enviando un trabajo de id ${args.idTrabajo} `);
                try {
                    var elTrabajo = yield Trabajo_1.ModeloTrabajo.findById(args.idTrabajo).exec();
                }
                catch (error) {
                    console.log(`error buscando un trabajo. E: ${error}`);
                    throw new apollo_server_express_1.ApolloError("");
                }
                return elTrabajo;
            });
        }
    },
    Trabajo: {
        responsables: function (parent, _, __) {
            return __awaiter(this, void 0, void 0, function* () {
                if (!parent.responsables) {
                    return [];
                }
                let idsResponsables = parent.responsables;
                try {
                    var usuariosResponsables = yield Usuario_1.ModeloUsuario.find({ _id: { $in: idsResponsables } }).exec();
                }
                catch (error) {
                    console.log(`error buscando a los responsables del trabajo. E: ${error}`);
                    return [];
                }
                return usuariosResponsables;
            });
        },
        nodosConocimiento: function (parent, _, __) {
            return __awaiter(this, void 0, void 0, function* () {
                console.log(`parent (nodos): ${JSON.stringify(parent.nodosConocimiento)}`);
                if (!parent.nodosConocimiento) {
                    return [];
                }
                let idsNodos = parent.nodosConocimiento;
                try {
                    var nodos = Nodo.find({ _id: { $in: idsNodos } }).exec();
                }
                catch (error) {
                    console.log(`error buscando a los nodosConocimiento del trabajo. E: ${error}`);
                    return [];
                }
                return nodos;
            });
        }
    },
};
