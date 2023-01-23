"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.aServer = exports.pubsub = exports.esquema = exports.permisosEspecialesDefault = void 0;
const { ApolloServer, gql, PubSub } = require("apollo-server-express");
const NodosConocimiento_1 = require("./NodosConocimiento");
const Usuarios_1 = require("./Usuarios");
const Eventos_1 = require("./Eventos");
const Atlases_1 = require("./Atlases");
const AtlasSolidaridad_1 = require("./AtlasSolidaridad");
const Espacios_1 = require("./Espacios");
// import { typeDefs as tdObjetivos, resolvers as rObjetivos } from "./Objetivos"
const GruposEstudiantiles_1 = require("./GruposEstudiantiles");
const Foros_1 = require("./Foros");
const Libro_1 = require("./cuentos/Libro");
const merge_1 = __importDefault(require("lodash/merge"));
const apollo_server_express_1 = require("apollo-server-express");
const jwt = require("jsonwebtoken");
exports.permisosEspecialesDefault = ["superadministrador"];
const globalTypeDefs = gql `
    type Query{
        fakeQuery:String,
    }
    type Mutation{
        fakeMutation:String
    }
    type Subscription{
        fakeSubscription:String
    }
    type Coords{
        x: Int,
        y: Int
    }
    type FuerzaPolar{
        fuerza: Int,
        direccion: Float,
    }
    input CoordsInput{
        x:Int,
        y:Int
    }


`;
const typeDefs = [globalTypeDefs, NodosConocimiento_1.typeDefs, Usuarios_1.typeDefs, GruposEstudiantiles_1.typeDefs, Foros_1.typeDefs, Libro_1.typeDefs, Atlases_1.typeDefs, AtlasSolidaridad_1.typeDefs, Espacios_1.typeDefs, Eventos_1.typeDefs];
const resolvers = merge_1.default({}, NodosConocimiento_1.resolvers, Usuarios_1.resolvers, GruposEstudiantiles_1.resolvers, Foros_1.resolvers, Libro_1.resolvers, Atlases_1.resolvers, AtlasSolidaridad_1.resolvers, Espacios_1.resolvers, Eventos_1.resolvers);
exports.esquema = apollo_server_express_1.makeExecutableSchema({
    typeDefs,
    resolvers
});
exports.pubsub = new PubSub();
const context = ({ req, res, connection }) => {
    // console.log(`creando contexto`);
    var usuario = {
        id: "",
        permisos: []
    };
    if (connection) {
        return connection.context;
    }
    else {
        //console.log(`Conexion normal`);
        let headers = req.headers;
        //console.log(`headers: ${JSON.stringify(headers)}`);
        if (!headers.authorization)
            return { usuario };
        const token = headers.authorization;
        try {
            usuario = jwt.verify(token, process.env.JWT_SECRET);
        }
        catch (error) {
            usuario = {
                id: "",
                permisos: []
            };
        }
    }
    return { usuario: usuario, pubsub: exports.pubsub };
};
const onConnect = function (connectionParams, webSocket) {
    var usuario = {
        id: "",
        permisos: []
    };
    if (connectionParams.headers && connectionParams.headers.Authorization) {
        let token = connectionParams.headers.Authorization.substr(7);
        try {
            usuario = jwt.verify(token, process.env.JWT_SECRET);
        }
        catch (error) {
            usuario = {
                id: "",
                permisos: []
            };
        }
    }
    else {
        console.log(`Sin token`);
    }
    return { usuario: usuario, pubsub: exports.pubsub };
};
exports.aServer = new ApolloServer({
    typeDefs,
    resolvers,
    context,
    subscriptions: {
        path: "/subscripciones",
        onConnect,
    }
});
