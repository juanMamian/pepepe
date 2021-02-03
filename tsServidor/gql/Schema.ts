const { ApolloServer, gql, PubSub } = require("apollo-server-express");
import { typeDefs as tdNodos, resolvers as rNodos } from "./NodosConocimiento"
import { typeDefs as tdUsuarios, resolvers as rUsuarios } from "./Usuarios"
import { typeDefs as tdProyectos, resolvers as rProyectos } from "./Proyectos"
import { typeDefs as tdTrabajos, resolvers as rTrabajos } from "./Trabajos"
import { typeDefs as tdGruposEstudiantiles, resolvers as rGruposEstudiantiles } from "./GruposEstudiantiles"
import { typeDefs as tdForos, resolvers as rForos } from "./Foros"
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

const typeDefs = [globalTypeDefs, tdNodos, tdUsuarios, tdProyectos, tdTrabajos, tdGruposEstudiantiles, tdForos];
const resolvers = merge({}, rNodos, rUsuarios, rProyectos, rTrabajos, rGruposEstudiantiles, rForos);

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
        
        const token: string = headers.authorization;
        try {
            usuario = jwt.verify(token, process.env.JWT_SECRET);
        }
        catch (error) {
            console.log(`HTTP: Error verificando el token ${token}.E: ${error}`);
            usuario = {
                id: "",
                permisos: []
            }
        }
    }
    return { usuario: usuario, pubsub };

}

const onConnect=function(connectionParams, webSocket){
    
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
            console.log(`WS Error verificando el token ${token}.E: ${error}`);
            usuario = {
                id: "",
                permisos: []
            }
        }
    }
    else{
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
