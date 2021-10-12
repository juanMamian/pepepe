import { ApolloError, AuthenticationError, gql, UserInputError, withFilter } from "apollo-server-express";
import { ModeloConfiguracionAtlas as ConfiguracionAtlas } from "../model/ConfiguracionAtlas"
import { contextoQuery } from "./tsObjetos"


export const typeDefs = gql`

    type ConfiguracionAtlas{
        id:ID,
        posicionando:Boolean
    }

    extend type Query{
        configuracionAtlas(nombreAtlas: String!):ConfiguracionAtlas
    }
    extend type Mutation{
    togglePosicionamientoAutomaticoAtlas(nombreAtlas:String!):ConfiguracionAtlas,
}    
`

export const resolvers = {
    Query:{
        async configuracionAtlas(_:any, {nombreAtlas}:any, contexto: contextoQuery){
            console.log(`Query de configuracion del atlas de ${nombreAtlas}`);
            try {
                var configuracion:any=await ConfiguracionAtlas.findOne({nombre: nombreAtlas}).exec();
            } catch (error) {
                console.log(`Error buscando la configuración del atlas: ${error}`);
            }
            

            return configuracion;
        }
    },
    Mutation: {
        async togglePosicionamientoAutomaticoAtlas(_: any, {nombreAtlas}: any, contexto: contextoQuery) {
            console.log(`Toggling posicionamiento automatico del atlas ${nombreAtlas}`);
            const credencialesUsuario = contexto.usuario;

            //Authorización
            if (!credencialesUsuario.permisos.includes("superadministrador")) {
                console.log(`Error de autenticacion toggling posicionamiento automático`);
                throw new AuthenticationError("No autorizado");
            }

            try {
                var configuracion: any = await ConfiguracionAtlas.findOne({ nombre: nombreAtlas }).exec();

            } catch (error) {
                console.log(`error buscando configuración del atlas: ${error}`);
                throw new ApolloError("Error conectando con la base de datos");

            }
            console.log(`De ${configuracion.posicionando}`);
            configuracion.posicionando = !configuracion.posicionando;
            console.log(`A ${configuracion.posicionando}`);


            try {
                await configuracion.save();
            } catch (error) {
                console.log(`Error guardando la nueva configuración del atlas: ${error}`);
                throw new ApolloError("Error conectando con la base de datos");
            }

            return configuracion;

        },
    }


}