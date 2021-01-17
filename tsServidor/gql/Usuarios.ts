import { ApolloError, AuthenticationError, gql } from "apollo-server-express";
import { Usuario, permisosDeUsuario } from "../model/Usuario"
import { GraphQLDateTime } from "graphql-iso-date";

interface Usuario {
    username: string,
    permisos: Array<string>,
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
        permisos:[String]
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
        todosUsuarios:[PublicUsuario],
        publicUsuario(idUsuario:ID!):PublicUsuario,
        usuariosProfe:[PublicUsuario],
        yo:Usuario
    }
    extend type Mutation{
        setCentroVista(idUsuario:ID, centroVista: CoordsInput):Boolean,
        editarDatosUsuario(nuevosDatos: DatosEditablesUsuario):Usuario,
        addPermisoUsuario(nuevoPermiso:String!, idUsuario:ID!):Usuario,        
    }
`

export const resolvers = {
    Query: {
        usuariosProfe: async function (_: any, args: any, context: contextoQuery) {
            console.log(`Fetching la lista de todos los profes`);
            try {
                var profes=await Usuario.find({permisos:"actividadesProfes-profe"}).exec();
            } catch (error) {
                console.log(`Error buscando profes en la base de datos`);
                throw new ApolloError("Error conectando con la base de datos");
            }
            return profes;
        },
        todosUsuarios: async function (_: any, args: any, context: contextoQuery) {
            console.log(`Solicitud de la lista de todos los usuarios`);

            try {
                var todosUsuarios = await Usuario.find({}).exec();
            }
            catch (error) {
                console.log("Error fetching la lista de usuarios de la base de datos. E: " + error);
                throw new ApolloError("Error de conexión a la base de datos");
            }
            console.log(`Enviando lista de todos los usuarios`);
            return todosUsuarios;
        },
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
        editarDatosUsuario: async function (_: any, { nuevosDatos }: any, context: contextoQuery) {
            console.log(`solicitud de edicion de datos de usuario`);
            let credencialesUsuario = context.usuario;
            console.log(`Usuario: Id: ${credencialesUsuario.id}, username: ${credencialesUsuario.username}`);
            if (!credencialesUsuario.permisos) {
                console.log(`No habia campo permisos activado en las credenciales del usuario`);
                throw new AuthenticationError("No autorizado");
            }

            try {
                var elUsuario = await Usuario.findById(credencialesUsuario.id);
            }
            catch (error) {
                console.log("Error buscando el usuario en la base de datos. E: " + error);
                throw new ApolloError("Error conectando con la base de datos");
            }

            let errores: Array<string> = elUsuario.validarDatosUsuario(nuevosDatos);

            if (errores.length > 0) {
                console.log(`Error validando datos: ${errores}`);
                throw new ApolloError("Datos invalidos");
            }
            console.log(`asignando ${nuevosDatos} al usuario`);

            try {
                Object.assign(elUsuario, nuevosDatos);
                await elUsuario.save()
            }
            catch (error) {
                console.log("Error guardando el usuario merged con nuevos datos. E: " + error);
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
        },
        addPermisoUsuario: async function (_: any, { idUsuario, nuevoPermiso }, contexto: contextoQuery) {
            console.log(`Peticion de dar permiso ${nuevoPermiso} a un usuario con id ${idUsuario}`);
            let credencialesUsuario = contexto.usuario;

            if (!credencialesUsuario.permisos) {
                console.log(`No habia permisos en las credenciales`);
                throw new AuthenticationError("No autorizado");
            }

            let permisosValidos = ["superadministrador"];

            if (!credencialesUsuario.permisos.some(p => permisosValidos.includes(p))) {
                console.log(`Usuario no tiene permisos válidos`);
                throw new AuthenticationError("No autorizado");
            }

            if (!permisosDeUsuario.includes(nuevoPermiso)) {
                console.log(`${nuevoPermiso} no es un permiso de usuario válido`);
                console.log(`los permisos válidos son: ${permisosDeUsuario}`);
                throw new AuthenticationError("Permiso no reconocido");
            }

            try {
                var elUsuario = await Usuario.findById(idUsuario).exec();
                if (!Array.isArray(elUsuario.permisos)) {
                    console.log(`Los permisos no eran un array: Eran: ${elUsuario.permisos}`);
                }
                if (!elUsuario.permisos.includes(nuevoPermiso)) {
                    console.log(`Añadiendo ${nuevoPermiso} a la lista de permisos`);
                    elUsuario.permisos.push(nuevoPermiso);
                }
                else{
                    console.log(`El usuario ya tenía ese permiso`);
                }
                await elUsuario.save();
            } catch (error) {
                console.log(`Error updating el usuario en la base de datos. e. ${error}`);
                throw new ApolloError("Error conectando con la base de datos");
            }

            console.log(`Permiso añadido.Quedó con: ${elUsuario.permisos}`);
            return elUsuario;
        }
    },
    Usuario: {
        edad: function (parent: any, _: any, __: any) {
            if (!parent.fechaNacimiento) {
                return 0;
            }
            let edad = Date.now() - parent.fechaNacimiento;
            let edadAños = edad / (60 * 60 * 24 * 365 * 1000);
            edadAños = parseInt(edadAños.toFixed());
            return edadAños;
        }
    },
    Date: {
        GraphQLDateTime
    }

}