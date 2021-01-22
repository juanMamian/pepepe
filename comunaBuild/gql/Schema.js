"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.aServer = exports.esquema = void 0;
const { ApolloServer, gql, PubSub } = require("apollo-server-express");
const NodosConocimiento_1 = require("./NodosConocimiento");
const Usuarios_1 = require("./Usuarios");
const Proyectos_1 = require("./Proyectos");
const Trabajos_1 = require("./Trabajos");
const GruposEstudiantiles_1 = require("./GruposEstudiantiles");
const merge_1 = __importDefault(require("lodash/merge"));
const apollo_server_express_1 = require("apollo-server-express");
const jwt = require("jsonwebtoken");
const globalTypeDefs = gql `
    type Query{
        fakeQuery:String
    }
    type Mutation{
        fakeMutation:String
    }
    type Coords{
        x: Int,
        y: Int
    }
    input CoordsInput{
        x:Int,
        y:Int
    }
`;
const typeDefs = [globalTypeDefs, NodosConocimiento_1.typeDefs, Usuarios_1.typeDefs, Proyectos_1.typeDefs, Trabajos_1.typeDefs, GruposEstudiantiles_1.typeDefs];
const resolvers = merge_1.default({}, NodosConocimiento_1.resolvers, Usuarios_1.resolvers, Proyectos_1.resolvers, Trabajos_1.resolvers, GruposEstudiantiles_1.resolvers);
exports.esquema = apollo_server_express_1.makeExecutableSchema({
    typeDefs,
    resolvers
});
const pubsub = new PubSub();
const context = ({ req, res, connection }) => {
    // console.log(`creando contexto`);
    var usuario = {
        id: "",
        permisos: []
    };
    if (connection) {
        console.log(`Una conexion ws`);
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
            console.log(`Error verificando el token.E: ${error}`);
            usuario = {
                id: "",
                permisos: []
            };
        }
    }
    return { usuario: usuario, pubsub };
};
exports.aServer = new ApolloServer({
    typeDefs,
    resolvers,
    context,
    subscriptions: {
        path: "/subscripciones",
        onConnect() {
            console.log(`Nueva conexion`);
        }
    }
});
