const { ApolloServer, gql, PubSub } = require("apollo-server-express");
import { typeDefs as tdNodos, resolvers as rNodos } from "./NodosConocimiento"
import { typeDefs as tdUsuarios, resolvers as rUsuarios } from "./Usuarios"
import { typeDefs as tdEventos, resolvers as rEventos } from "./Eventos"
import { typeDefs as tdAtlases, resolvers as rAtlases } from "./Atlases"
import { typeDefs as tdAtlasSolidaridad, resolvers as rAtlasSolidaridad } from "./AtlasSolidaridad"
import { typeDefs as tdEspacios, resolvers as rEspacios } from "./Espacios"
import { typeDefs as tdRutagrado, resolvers as rRutagrado } from "./RutaGrado"

// import { typeDefs as tdObjetivos, resolvers as rObjetivos } from "./Objetivos"
import { typeDefs as tdGruposEstudiantiles, resolvers as rGruposEstudiantiles } from "./GruposEstudiantiles"
import { typeDefs as tdForos, resolvers as rForos } from "./Foros"
import { typeDefs as tdCuentos, resolvers as rCuentos } from "./cuentos/Libro"
import merge from "lodash/merge"
import { InterfaceCredencialesUsuario } from "./tsObjetos"
import { makeExecutableSchema } from "apollo-server-express";
import jwt from "jsonwebtoken";

export const permisosEspecialesDefault = ["superadministrador"];

const globalTypeDefs = gql`
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

const typeDefs = [globalTypeDefs, tdNodos, tdUsuarios, tdGruposEstudiantiles, tdForos, tdCuentos, tdAtlases, tdAtlasSolidaridad, tdEspacios, tdEventos, tdRutagrado];
const resolvers = merge({}, rNodos, rUsuarios, rGruposEstudiantiles, rForos, rCuentos, rAtlases, rAtlasSolidaridad, rEspacios, rEventos, rRutagrado);

export const esquema = makeExecutableSchema({
    typeDefs,
    resolvers
});

export const pubsub = new PubSub();

const context = ({ req, res, connection }: any) => {
    var usuario: InterfaceCredencialesUsuario = {
        id: "",
        permisos: []
    }
    if (connection) {
        return connection.context;
    }
    else {

        let headers: any = req.headers;

        if (!headers.authorization) { 
            return usuario;
        };


        const token: string = headers.authorization.substr(7);
        try {
            usuario = jwt.verify(token, process.env.JWT_SECRET);
        }
        catch (error) {
            console.log(`error: ${error}`);
            usuario = {
                id: "",
                permisos: []
            }
        }
    }
    return { usuario: usuario, pubsub };

}

const onConnect = function (connectionParams, webSocket) {

    var usuario: InterfaceCredencialesUsuario = {
        id: "",
        permisos: []
    }
    if (connectionParams.headers && connectionParams.headers.Authorization) {
        let token = connectionParams.headers.Authorization.substr(7);
        try {
            usuario = jwt.verify(token, process.env.JWT_SECRET);

        }
        catch (error) {
            usuario = {
                id: "",
                permisos: []
            }
        }
    }
    else {
        console.log(`Sin token`);
    }
    return { usuario: usuario, pubsub };
}

export const aServer = new ApolloServer({
    typeDefs,
    resolvers,
    context,
    subscriptions: {
        path: "/subscripciones",
        onConnect,
    }
});
