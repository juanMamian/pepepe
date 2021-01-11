const { ApolloServer, gql } = require("apollo-server-express");
import { typeDefs as tdNodos, resolvers as rNodos } from "./NodosConocimiento"
import {typeDefs as tdUsuarios, resolvers as rUsuarios} from "./Usuarios"
import {typeDefs as tdProyectos, resolvers as rProyectos} from "./Proyectos"
import {typeDefs as tdTrabajos, resolvers as rTrabajos} from "./Trabajos"


import merge from "lodash/merge"
const jwt = require("jsonwebtoken");

const typeDefs = gql`
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

const context = ({ req, res }: any) => {
   // console.log(`creando contexto`);
    var usuario = {
        id: null,
        permisos: null
    }
    let headers: any = req.headers;
   // console.log(`headers: ${JSON.stringify(headers)}`);

    if (!headers.authorization) return usuario;
    const token: string = headers.authorization;
    try {
        usuario = jwt.verify(token, process.env.JWT_SECRET);
    }
    catch (error) {
        console.log(`Error verificando el token.E: ${error}`);
        var usuario = {
            id: null,
            permisos: null
        }
    }
    //console.log(`Decodifcado el token así: ${JSON.stringify(usuario)}`);
    return { usuario };

}

export const aServer = new ApolloServer({
    typeDefs: [typeDefs, tdNodos, tdUsuarios, tdProyectos, tdTrabajos],
    resolvers: merge({}, rNodos, rUsuarios, rProyectos, rTrabajos),
    context
});
