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
const Foro_1 = require("../model/Foros/Foro");
exports.typeDefs = apollo_server_express_1.gql `
   type Trabajo{
       id: ID,
       nombre: String,
       descripcion:String,
       responsables: [String],
       nodosConocimiento:[String],
       idForo:ID
   }

   extend type Query{
       trabajo(idTrabajo: ID!):Trabajo
   }

`;
exports.resolvers = {
    Query: {
        trabajo: function (_, { idTrabajo }, context) {
            return __awaiter(this, void 0, void 0, function* () {
                console.log(`Solicitado un trabajo de id ${idTrabajo} `);
                let tieneForo = true;
                try {
                    var elTrabajo = yield Trabajo_1.ModeloTrabajo.findById(idTrabajo).exec();
                    if (!elTrabajo) {
                        throw "Trabajo no existía";
                    }
                }
                catch (error) {
                    console.log(`error buscando un trabajo. E: ${error}`);
                    throw new apollo_server_express_1.ApolloError("");
                }
                if (!elTrabajo.idForo) {
                    tieneForo = false;
                }
                else {
                    try {
                        let elForo = yield Foro_1.ModeloForo.findById(elTrabajo.idForo).exec();
                        if (!elForo) {
                            console.log(`El foro no existía. Se creará uno nuevo`);
                            tieneForo = false;
                        }
                    }
                    catch (error) {
                        console.log(`Error buscando foro en la base de datos. E :${error}`);
                    }
                }
                if (!tieneForo) {
                    console.log(`El trabajo ${elTrabajo.nombre} no tenía foro. Creando con miembros: ${elTrabajo.responsables}.`);
                    try {
                        var nuevoForo = yield Foro_1.ModeloForo.create({
                            miembros: elTrabajo.responsables,
                            acceso: "privado"
                        });
                        var idNuevoForo = nuevoForo._id;
                        yield nuevoForo.save();
                    }
                    catch (error) {
                        console.log(`Error creando el nuevo foro. E: ${error}`);
                        throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                    }
                    console.log(`Nuevo foro creado`);
                    try {
                        elTrabajo.idForo = idNuevoForo;
                        yield elTrabajo.save();
                    }
                    catch (error) {
                        console.log(`Error guardando el trabajo`);
                        throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                    }
                }
                console.log(`Enviando trabajo`);
                return elTrabajo;
            });
        }
    },
};
