const { ApolloServer, gql } = require("apollo-server-express");
import { typeDefs as tdNodos, resolvers as rNodos } from "./NodosConocimiento"
import {typeDefs as tdUsuarios, resolvers as rUsuarios} from "./Usuarios"
import {typeDefs as tdProyectos, resolvers as rProyectos} from "./Proyectos"
import {typeDefs as tdTrabajos, resolvers as rTrabajos} from "./Trabajos"
import {typeDefs as tdGruposEstudiantiles, resolvers as rGruposEstudiantiles} from "./GruposEstudiantiles"
import merge from "lodash/merge"
import {InterfaceCredencialesUsuario} from "./tsObjetos"
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
    var usuario:InterfaceCredencialesUsuario = {
        id: "",
        permisos: []
    }
    let headers: any = req.headers;
   // console.log(`headers: ${JSON.stringify(headers)}`);

    if (!headers.authorization) return {usuario};
    const token: string = headers.authorization;
    try {
        usuario = jwt.verify(token, process.env.JWT_SECRET);
    }
    catch (error) {
        console.log(`Error verificando el token.E: ${error}`);
        usuario = {
            id: "",
            permisos: []
        }
    }
    //console.log(`Decodifcado el token así: ${JSON.stringify(usuario)}`);
    return { usuario:usuario };

}

export const aServer = new ApolloServer({
    typeDefs: [typeDefs, tdNodos, tdUsuarios, tdProyectos, tdTrabajos, tdGruposEstudiantiles],
    resolvers: merge({}, rNodos, rUsuarios, rProyectos, rTrabajos, rGruposEstudiantiles),
    context
});
