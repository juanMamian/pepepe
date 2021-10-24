const { ApolloServer, gql, PubSub } = require("apollo-server-express");
import { typeDefs as tdNodos, resolvers as rNodos } from "./AtlasConocimiento"
import { typeDefs as tdUsuarios, resolvers as rUsuarios } from "./Usuarios"
import { typeDefs as tdProyectos, resolvers as rProyectos } from "./Grupos"
import { typeDefs as tdTrabajos, resolvers as rTrabajos } from "./AtlasSolidaridad"
import { typeDefs as tdEventos, resolvers as rEventos } from "./Eventos"

import { typeDefs as tdGruposEstudiantiles, resolvers as rGruposEstudiantiles } from "./ActividadesEstudiantiles"
import { typeDefs as tdForos, resolvers as rForos } from "./Foros"
import {typeDefs as tdCuentos, resolvers as rCuentos} from "./cuentos/Libro"
import merge from "lodash/merge"
import { InterfaceCredencialesUsuario } from "./tsObjetos"
import { makeExecutableSchema } from "apollo-server-express";
const jwt = require("jsonwebtoken");



const globalTypeDefs = gql`
    type Query{
        fakeQuery:String
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
    input CoordsInput{
        x:Int,
        y:Int
    }
`;

const typeDefs = [globalTypeDefs, tdNodos, tdUsuarios, tdProyectos, tdTrabajos, tdEventos,  tdGruposEstudiantiles, tdForos, tdCuentos];
const resolvers = merge({}, rNodos, rUsuarios, rProyectos, rTrabajos, rEventos, rGruposEstudiantiles, rForos, rCuentos);

export const esquema = makeExecutableSchema({
    typeDefs,
    resolvers
});

export const pubsub = new PubSub();

const context = ({ req, res, connection }: any) => {
    // console.log(`creando contexto`);
    var usuario: InterfaceCredencialesUsuario = {
        id: "",
        permisos: []
    }
    if (connection) {        
        return connection.context;
    }
    else {
        //console.log(`Conexion normal`);
        let headers: any = req.headers;
        //console.log(`headers: ${JSON.stringify(headers)}`);
        if (!headers.authorization) return { usuario };
        
        const token: string = headers.authorization.substr(7);
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
    return { usuario: usuario, pubsub };

}

const onConnect=function(connectionParams, webSocket){    +
    console.log(`Subscription`);
    var usuario: InterfaceCredencialesUsuario = {
        id: "",
        permisos: []
    }
    if (connectionParams.headers && connectionParams.headers.Authorization) {
        let token=connectionParams.headers.Authorization.substr(7);
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
    else{
        console.log(`Sin token`);
        console.log(`Headers: ${JSON.stringify(connectionParams)}`);
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
