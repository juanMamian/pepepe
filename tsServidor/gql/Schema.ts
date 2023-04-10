import { ApolloServer } from '@apollo/server';
import { typeDefs as tdNodos, resolvers as rNodos } from "./NodosConocimiento"
import { typeDefs as tdUsuarios, resolvers as rUsuarios } from "./Usuarios"
import { typeDefs as tdAtlases, resolvers as rAtlases } from "./Atlases"
import { typeDefs as tdEspacios, resolvers as rEspacios } from "./Espacios"
import { typeDefs as tdRutagrado, resolvers as rRutagrado } from "./RutaGrado"

// import { typeDefs as tdObjetivos, resolvers as rObjetivos } from "./Objetivos"
import { typeDefs as tdCuentos, resolvers as rCuentos } from "./cuentos/Libro"
import merge from "lodash/merge"
import { InterfaceCredencialesUsuario } from "./tsObjetos"
import jwt from "jsonwebtoken";
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/dist/esm/plugin/drainHttpServer';

export const permisosEspecialesDefault = ["superadministrador"];

const globalTypeDefs = `#graphql
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

export const typeDefs = [globalTypeDefs, tdNodos, tdUsuarios, tdCuentos, tdAtlases, tdEspacios, tdRutagrado];
export const resolvers = merge({}, rNodos, rUsuarios, rCuentos, rAtlases, rEspacios, rRutagrado);


export const context = ({ req, res, connection }: any) => {
    var usuario: any=null;
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
            usuario = jwt.verify(token, process.env.JWT_SECRET || "");
        }
        catch (error) {
            console.log(`error: ${error}`);
            usuario = {
                id: "",
                permisos: []
            }
        }
    }
    return { usuario: usuario };

}

