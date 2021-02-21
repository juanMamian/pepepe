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
const Proyecto_1 = require("../model/Proyecto");
exports.typeDefs = apollo_server_express_1.gql `
   type Trabajo{
       id: ID,
       nombre: String,
       descripcion:String,
       responsables: [String],
       nodosConocimiento:[String],
       idForo:ID,
       diagramaProyecto:InfoDiagramaProyecto,
       vinculos:[VinculoNodoProyecto],
       keywords:String,
       idProyectoParent:ID,
   }

   type InfoBasicaTrabajo{
       id:ID,
       nombre: String,
       idProyecto:ID
   }

   extend type Query{
       trabajo(idTrabajo: ID!):Trabajo,
       busquedaTrabajosProyectos(textoBusqueda:String!):[InfoBasicaTrabajo],
       trabajosDeProyectoDeUsuario(idUsuario:ID!):[InfoBasicaTrabajo]
   }

`;
exports.resolvers = {
    Query: {
        trabajo: function (_, { idTrabajo }, context) {
            return __awaiter(this, void 0, void 0, function* () {
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
                if (!elTrabajo.idProyectoParent) {
                    console.log(`Trabajo ${elTrabajo.nombre} no tenia idProyectoParent. Buscándole`);
                    try {
                        let elProyectoParent = yield Proyecto_1.ModeloProyecto.findOne({ idsTrabajos: { $in: elTrabajo._id } }).exec();
                        if (!elProyectoParent)
                            throw "No habia proyecto parent";
                        console.log(`Era del proyecto ${elProyectoParent.nombre}`);
                        elTrabajo.idProyectoParent = elProyectoParent._id;
                        yield elTrabajo.save();
                    }
                    catch (error) {
                        console.log(`Error buscando proyecto parent. E: ${error}`);
                        throw new apollo_server_express_1.ApolloError("Error conectando con la base datos");
                    }
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
                return elTrabajo;
            });
        },
        busquedaTrabajosProyectos: function (_, { textoBusqueda }, contexto) {
            return __awaiter(this, void 0, void 0, function* () {
                console.log(`Buscando trabajo usando texto de búsqueda: ${textoBusqueda}`);
                const sizePaginaTrabajos = 50;
                if (contexto.usuario.id === "") {
                    console.log(`Usuario no logeado`);
                    throw new apollo_server_express_1.AuthenticationError("No autorizado");
                }
                try {
                    var losTrabajos = yield Trabajo_1.ModeloTrabajo.find({ $text: { $search: textoBusqueda } }, { score: { $meta: 'textScore' } }).select("nombre").sort({ score: { $meta: 'textScore' } }).limit(sizePaginaTrabajos).exec();
                }
                catch (error) {
                    console.log(`Error buscando trabajos. E: ${error}`);
                    return new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                console.log(`Enviando ${losTrabajos.length} trabajos encontrados`);
                return losTrabajos;
            });
        },
        trabajosDeProyectoDeUsuario: function (_, { idUsuario }, contexto) {
            return __awaiter(this, void 0, void 0, function* () {
                console.log('Peticion de trabajos de usuario con id ' + idUsuario);
                try {
                    var losTrabajos = yield Trabajo_1.ModeloTrabajo.find({ "responsables": idUsuario }).exec();
                }
                catch (error) {
                    console.log(`Error buscando trabajos de usuario. E: ${error}`);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                console.log(`Enviando ${losTrabajos.length} trabajos`);
                return losTrabajos;
            });
        }
    },
};
