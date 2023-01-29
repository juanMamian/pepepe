import { ApolloError, AuthenticationError, gql, UserInputError } from "apollo-server-express";
import { contextoQuery } from "./tsObjetos"
import { charProhibidosNombreCosa, charProhibidosTexto } from "../model/config";
import { laRutaNodosConocimiento, laRutaProyectoMediaTecnica, laRutaProyectoSocial, ModeloSubrutaGrado as Subruta } from "../model/rutaGrado/RutaGrado";


export const typeDefs = gql`

    type NodoRutaGrado{
        id: ID,
        nombre: String,
        descripcion: String,        
    }

    type SubrutaGrado{
        id: ID,
        nombre: String,
        descripcion: String,
        nodos: [NodoRutaGrado],
    }
    
    extend type Query{
        subrutasGradoMaestraVida:[SubrutaGrado],
    }

   
`;

export const resolvers = {
    Query: {
        async subrutasGradoMaestraVida(_: any, { }: any, contexto: contextoQuery) {
            if (!contexto.usuario?.id) {
                throw new AuthenticationError('loginRequerido');
            }

            const credencialesUsuario = contexto.usuario;

            try {
                var lasSubrutas: any = await Subruta.find({}).exec();
            }
            catch (error) {
                throw new ApolloError('Error conectando con la base de datos');
            }


            return lasSubrutas;
        },
    }
}

export const funcionesInicioRutaGrado = async function(){

    console.log("Inicializando subrutas de grado")
    try {
        var lasSubrutas: any = await Subruta.find({}).exec();
    }
    catch (error) {
        throw new ApolloError('Error conectando con la base de datos');
    }

    if(lasSubrutas.length>0){
        console.log("Inicialización innecesaria");
    }
        console.log("No había subrutas, creando");

        var rutaNodos=new Subruta(laRutaNodosConocimiento);
        var rutaProyectoSocial=new Subruta(laRutaProyectoSocial);
        var rutaProyectoMediaTecnica=new Subruta(laRutaProyectoMediaTecnica);

    try {
        await rutaNodos.save();
        await rutaProyectoSocial.save();
        await rutaProyectoMediaTecnica.save();
    } catch (error) {
        console.log("Error creando subrutas de grado: "+error);
    }

    console.log("Subrutas de grado inicializadas");
}