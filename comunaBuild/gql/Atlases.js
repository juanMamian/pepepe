import { ModeloConfiguracionAtlas as ConfiguracionAtlas } from "../model/ConfiguracionAtlas";
import { ApolloError, AuthenticationError } from "./misc";
export const typeDefs = `#graphql

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
`;
export const resolvers = {
    Query: {
        async configuracionAtlas(_, { nombreAtlas }, contexto) {
            console.log(`Query de configuracion del atlas de ${nombreAtlas}`);
            try {
                var configuracion = await ConfiguracionAtlas.findOne({ nombre: nombreAtlas }).exec();
            }
            catch (error) {
                console.log(`Error buscando la configuración del atlas: ${error}`);
            }
            return configuracion;
        }
    },
    Mutation: {
        async togglePosicionamientoAutomaticoAtlas(_, { nombreAtlas }, contexto) {
            console.log(`Toggling posicionamiento automatico del atlas ${nombreAtlas}`);
            const credencialesUsuario = contexto.usuario;
            //Authorización
            if (!credencialesUsuario.permisos.includes("superadministrador")) {
                console.log(`Error de autenticacion toggling posicionamiento automático`);
                AuthenticationError("No autorizado");
            }
            try {
                var configuracion = await ConfiguracionAtlas.findOne({ nombre: nombreAtlas }).exec();
            }
            catch (error) {
                console.log(`error buscando configuración del atlas: ${error}`);
                ApolloError("Error conectando con la base de datos");
            }
            console.log(`De ${configuracion.posicionando}`);
            configuracion.posicionando = !configuracion.posicionando;
            console.log(`A ${configuracion.posicionando}`);
            try {
                await configuracion.save();
            }
            catch (error) {
                console.log(`Error guardando la nueva configuración del atlas: ${error}`);
                ApolloError("Error conectando con la base de datos");
            }
            return configuracion;
        },
    }
};
