import { ApolloError, AuthenticationError, gql } from "apollo-server-express";
import Usuario from "../model/Usuario"
import { GraphQLDateTime } from "graphql-iso-date";

interface Usuario {
    username: string,
    permisos: string,
    id: string
}

interface contextoQuery {
    usuario: Usuario
}

export const typeDefs = gql`
    scalar Date

    type infoAtlas{
        centroVista:Coords
    }

    enum relacionUsuarioConocimiento{
        APRENDIENDO
        APRENDIDO
        OBJETIVO
    }

    type ConocimientoUsuario{
        tipo: relacionUsuarioConocimiento,
        nodoConocimiento: NodoConocimiento
    }

    type Usuario{
        id: ID,
        nombres:String,
        apellidos: String,
        fechaNacimiento:Date,
        edad:Int,
        lugarResidencia:String,
        email:String,
        numeroTel:String,
        username:String,
        nodosConocimiento: [ConocimientoUsuario],
        atlas:infoAtlas,
        permisos:String
    }
    input DatosEditablesUsuario{
        nombres:String,
        apellidos: String,
        fechaNacimiento:String,
        lugarResidencia:String,
        email:String,
        numeroTel:String,
        username:String
    }
    type PublicUsuario{
        id: ID!,
        username:String, 
        nombres:String,
        apellidos:String,
        email:String,
        numeroTel:String,
        lugarResidencia:String       
    }
    extend type Query {
        publicUsuario(idUsuario:ID!):PublicUsuario,
        yo:Usuario
    }
    extend type Mutation{
        setCentroVista(idUsuario:ID, centroVista: CoordsInput):Boolean,
        editarDatosUsuario(nuevosDatos: DatosEditablesUsuario):Usuario
    }
`

export const resolvers = {
    Query: {
        publicUsuario: async function (_: any, args: any, context: contextoQuery) {

            try {
                var elUsuario = await Usuario.findById(args.idUsuario).exec();
            } catch (error) {
                console.log(`error buscando usuario en la base de datos`);
                throw new ApolloError("");
            }

            return elUsuario;
        },
        yo: async function (_: any, __: any, context: contextoQuery) {
            let credencialesUsuario = context.usuario;
            console.log(`el usuario con credenciales ${credencialesUsuario.username} accede a su propia información personal`);

            try {
                var elUsuario = await Usuario.findById(credencialesUsuario.id);
            }
            catch (error) {
                console.log("Error buscando el usuario en la base de datos. E: " + error);
                throw new ApolloError("Error accediendo a los datos de usuario");
            }
            return elUsuario;
        }
    },
    Mutation: {
        editarDatosUsuario:async function(_: any, { nuevosDatos }: any, context: contextoQuery) {
            console.log(`solicitud de edicion de datos de usuario`);
            let credencialesUsuario=context.usuario;
            console.log(`Usuario: Id: ${credencialesUsuario.id}, username: ${credencialesUsuario.username}`);
            if(!credencialesUsuario.permisos){
                console.log(`No habia campo permisos activado en las credenciales del usuario`);
                throw new AuthenticationError("No autorizado");
            }

            try{
                var elUsuario=await Usuario.findById(credencialesUsuario.id);
            }
            catch(error){
                console.log("Error buscando el usuario en la base de datos. E: "+error );
                throw new ApolloError("Error conectando con la base de datos");
            }

            let errores:Array<string>=elUsuario.validarDatosUsuario(nuevosDatos);

            if(errores.length>0){
                console.log(`Error validando datos: ${errores}`);
                throw new ApolloError("Datos invalidos");
            }
            console.log(`asignando ${nuevosDatos} al usuario`);

            try{
                Object.assign(elUsuario, nuevosDatos);
                await elUsuario.save()
            }
            catch(error){
                console.log("Error guardando el usuario merged con nuevos datos. E: "+error );
                throw new ApolloError("Error guardando datos");
            }
            console.log(`Nuevos datos guardados`);
            return elUsuario;

        },
        setCentroVista: async function (_: any, { idUsuario, centroVista }: any, context: contextoQuery) {
            try {
                var elUsuario = await Usuario.findById(idUsuario, "atlas").exec();
            } catch (error) {
                console.log(`error buscando usuario en la base de datos`);
                throw new ApolloError("");
            }
            elUsuario.atlas.centroVista = centroVista;

            try {
                await elUsuario.save();
            } catch (error) {
                console.log(`error buscando usuario en la base de datos: ${error}`);
                throw new ApolloError("");

            }
            return true;
        }
    },
    Usuario:{
        edad:function(parent:any, _:any, __:any){
            if(!parent.fechaNacimiento){
                return 0;
            }
            let edad=Date.now()-parent.fechaNacimiento;
            let edadAños = edad / (60 * 60 * 24 * 365 * 1000);
            edadAños=parseInt(edadAños.toFixed());
            return edadAños;
        }
    },
    Date:{
        GraphQLDateTime
    }

}