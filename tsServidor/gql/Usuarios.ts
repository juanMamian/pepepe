// import { ModeloUsuario as Usuario, permisosDeUsuario,  validarDatosUsuario} from "../model/Usuario"
import { ModeloUsuario as Usuario, permisosDeUsuario, validarDatosUsuario, charProhibidosNombresUsuario, charProhibidosUsername, minLengthNombresUsuario, minLengthApellidosUsuario, minLengthUsername, minLengthEmail, minLengthPassword, maxLengthPassword, charProhibidosPassword, emailValidator, type DocUsuario } from "../model/Usuario"

import { contextoQuery } from "./tsObjetos"
import { ModeloNodo as Nodo } from "../model/atlas/Nodo";
import { ModeloEspacio as Espacio } from "../model/Espacio";
import { permisosEspecialesDefault } from "./Schema";
import { validatorNombreCosa } from "../model/config";
import { ApolloError, AuthenticationError, UserInputError } from "./misc";
import { ModeloNodoSolidaridad } from "../model/atlasSolidaridad/NodoSolidaridad";
import {getIdsRedRequerimentosNodo} from "./NodosConocimiento"

import jwt from "jsonwebtoken"
import bcrypt from "bcryptjs";
import { ObjectId } from "mongoose";


interface Usuario {
    username: string,
    permisos: Array<string>,
    id: string
}


export const typeDefs = `#graphql
    scalar Date   



enum EstadoAprendizajeNodo{
NINGUNO
ESTUDIADO
OLVIDADO
APRENDIDO
}

    type ConfiguracionAtlasUsuario{
        modo:String
    }

    type NotificacionActividadForos{
        idParent:ID,
        tipoParent:String,
        nombreParent:String,
        numeroRespuestasNuevas:Int,        
    }
    type DatoNodoUsuario{
        id: ID,
        idNodo:ID,
        nombreNodo: String,
        aprendido:Boolean,
        estudiado: Date,
        periodoRepaso:Float,
        diasRepaso: Int,
        estadoAprendizaje: EstadoAprendizajeNodo
        iteracionesRepaso: [IteracionRepasoNodoConocimiento]
    }

    type ColeccionNodosAtlasConocimiento{
        id:ID,
        nombre: String,
        idsNodos: [ID],
        nodos:[NodoConocimiento],
        progreso: Float,
        idUsuario: ID,
        idsRed:[ID],

    }

    type IteracionRepasoNodoConocimiento{
        id: ID,
        intervalo: Float,
    }    

    type InfoAtlas{
        id: ID,
        centroVista:Coords,
        datosNodos:[DatoNodoUsuario],
        idNodoTarget:ID,
        configuracion: ConfiguracionAtlasUsuario,
        colecciones:[ColeccionNodosAtlasConocimiento],
    }
    type InfoAtlasSolidaridad{
        id:ID,
        coordsVista:Coords, 
        idsNodosDesplegados: [String]      
    }
    enum relacionUsuarioConocimiento{
        APRENDIENDO
        APRENDIDO
    }

    type ConocimientoUsuario{
        tipo: relacionUsuarioConocimiento,
        nodoConocimiento: NodoConocimiento
    }

    type InfoConversacionesUsuario{
        idConversacion:ID,
        respuestasLeidas:Int,
    }

    type InfoForosUsuario{
        idForo:ID,
        conversaciones:[InfoConversacionesUsuario]
    }

    type InformeEstudianteMaestraVida{
        id: ID,
        year: Int,
        periodo:String,
        idProfe:ID,
        nombreProfe:String,
        categoria:String,
        texto:String
    }

    type Usuario{
        id: ID,
        nombres:String,
        apellidos: String,
        titulo:String,
        fechaNacimiento:Date,
        edad:Int,
        lugarResidencia:String,
        email:String,
        numeroTel:String,
        username:String,
        nodosConocimiento: [ConocimientoUsuario],
        nodosCompletadosRutaGrado: [ID],
        informesMaestraVida: [InformeEstudianteMaestraVida],
        atlas:InfoAtlas,        
        atlasSolidaridad:InfoAtlasSolidaridad,
        responsables:[String],
        responsablesAmplio:[String],
        administradores:[String],
        permisos:[String]
        idGrupoEstudiantil:String,       
        nombreGrupoEstudiantil:String,
        foros:[InfoForosUsuario],
        coords:Coords,
        fuerzaColision: FuerzaPolar,
       fuerzaCentroMasa: FuerzaPolar,
       nombre:String,
       objetivos:[String],
       espacioActual: String,

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

    extend type Query {
        todosUsuarios(dateActual: Date):[Usuario],
        usuariosByPermisos(listaPermisos:[String]):[Usuario],
        usuariosProfe:[Usuario],
        yo:Usuario,
        Usuario(idUsuario:ID!): Usuario,
        buscarPersonas(textoBuscar:String!):[Usuario],
        participantesCasaMaestraVida:[Usuario],

        login(username: String!, password:String!):String,
        alienarUsuario(idAlienado: ID!):String!,

        coleccionNodosConocimiento(idUsuario: ID!, idColeccion: ID!):ColeccionNodosAtlasConocimiento,
    }
    extend type Mutation{
        setCentroVista(idUsuario:ID, centroVista: CoordsInput):Boolean,
        editarDatosUsuario(nuevosDatos: DatosEditablesUsuario):Usuario,
        addPermisoUsuario(nuevoPermiso:String!, idUsuario:ID!):Usuario,  
        eliminarUsuario(idUsuario:ID!):Boolean,
        setNodoAtlasAprendidoUsuario(idNodo:ID!, nuevoEstadoAprendido:Boolean):[DatoNodoUsuario]        
        setNodoAtlasTarget(idNodo:ID):Boolean,
        nulificarNodoTargetUsuarioAtlas:Boolean,
        setModoUsuarioAtlas(idUsuario:ID!, nuevoModo:String!):Usuario,

        setNodoGradoCompletadoUsuario(idUsuario: ID!, idNodo: ID!, nuevoEstado: Boolean!):Usuario,

        guardarInformeEstudianteMaestraVida(idUsuario:ID!, year: Int!, periodo: String!, idProfe: ID!, categoria: String!, texto: String!):InformeEstudianteMaestraVida,

        asignarPermisoTodosUsuarios(nuevoPermiso:String!):Boolean,
        togglePermisoUsuario(permiso:String!, idUsuario:ID!):Usuario,


        crearColeccionNodosAtlasConocimientoUsuario(nombre: String, idsNodos:[String]):ColeccionNodosAtlasConocimiento,
        eliminarColeccionNodosAtlasConocimientoUsuario(idColeccion:ID!):Boolean,
        setNombreColeccionNodosAtlasConocimientoUsuario(idColeccion:ID!, nuevoNombre:String!):ColeccionNodosAtlasConocimiento,
        removeNodoColeccionNodosAtlasConocimientoUsuario(idColeccion:ID!, idNodo:ID!):Boolean,
        toggleNodoColeccionNodosAtlasConocimientoUsuario(idColeccion:ID!, idNodo:ID!, idUsuario:ID!):ColeccionNodosAtlasConocimiento,
        
        crearIteracionRepasoNodoConocimientoUsuario(idUsuario: ID!, idNodo: ID!, intervalo: Int):DatoNodoUsuario,
        eliminarIteracionRepaso(idUsuario: ID!, idNodo: ID!, idIteracion:ID!):Boolean,
        setIntervaloIteracionRepaso(idUsuario: ID!, idNodo: ID!, idIteracion:ID!, nuevoIntervalo:Float!):IteracionRepasoNodoConocimiento,

        setDateNodoConocimientoEstudiadoUsuario(idUsuario: ID!, idNodo: ID!, fecha:Date!):DatoNodoUsuario,
        setDiasRepasoNodoConocimientoUsuario(idNodo: ID!, nuevoDiasRepaso: Int!):DatoNodoUsuario,

        setCoordsVistaAtlasSolidaridadUsuario(coords:CoordsInput):Boolean,
        setNodosSolidaridadDesplegadosUsuario(idsNodos:[ID!]):Boolean,

        cambiarPassword(dizqueCurrentPassword: String!, newPassword: String!) :Boolean,
        resetearPasswordUsuario(idUsuario:ID!):Boolean,


    }
   
`


export const resolvers = {
    Query: {
        usuariosProfe: async function (_: any, args: any, context: contextoQuery) {
            console.log(`Fetching la lista de todos los profes`);
            var profes: any;
            try {
                profes = await Usuario.find({ permisos: "maestraVida-profesor" }).exec();
            } catch (error) {
                console.log(`Error buscando profes en la base de datos`);
                ApolloError("Error conectando con la base de datos");
            }
            return profes;
        },
        usuariosByPermisos: async function (_:any, {listaPermisos}: {listaPermisos:string[]} , context: contextoQuery){
            let losUsuarios: DocUsuario[]  = [];

            try{
                losUsuarios=await Usuario.find({"permisos": {$in: listaPermisos}}).exec();
            }
            catch(error){
                console.log("error getting la lista de usuarios: " + error);
                return ApolloError("Error descargando la lista de usuarios");
            }

            return losUsuarios;


        },
        todosUsuarios: async function (_: any, args: any, context: contextoQuery) {
            console.log(`Solicitud de la lista de todos los usuarios`);

            try {
                var todosUsuarios: any = await Usuario.find({}).select("nombres objetivos informesMaestraVida apellidos permisos fechaNacimiento email username numeroTel email").exec();
            }
            catch (error) {
                console.log("Error fetching la lista de usuarios de la base de datos. E: " + error);
                ApolloError("Error de conexión a la base de datos");
            }

            console.log(`Enviando lista de todos los usuarios`);
            // for(const usuario of todosUsuarios){
            //     if(usuario.objetivos.length>0){
            //         console.log(`Usuario ${usuario.username} tiene ${usuario.objetivos.length} objetivos`);
            //     }
            // }
            return todosUsuarios;
        },
        Usuario: async function (_: any, { idUsuario }: any, context: contextoQuery) {
            try {
                var elUsuario: any = await Usuario.findById(idUsuario).exec();
            } catch (error) {
                console.log(`error buscando usuario con id ${idUsuario} en la base de datos`);
                ApolloError("Error buscando usuario");
            }
            return elUsuario;
        },
        yo: async function (_: any, __: any, context: contextoQuery) {

            let credencialesUsuario = context.usuario;
            console.log('\x1b[35m%s\x1b[0m', `Query for yo de ${context.usuario.id}`);

            try {
                var elUsuario: any = await Usuario.findById(credencialesUsuario.id);
            }
            catch (error) {
                console.log("Error buscando el usuario en la base de datos. E: " + error);
                ApolloError("Error accediendo a los datos de usuario");
            }
            return elUsuario;
        },
        buscarPersonas: async function (_: any, { textoBuscar }: any, context: contextoQuery) {
            console.log(`Solicitud de la lista de todos los usuarios`);
            textoBuscar = textoBuscar.trim();
            textoBuscar = new RegExp(textoBuscar, "i");

            var todosUsuarios: any;

            try {
                todosUsuarios = await Usuario.find({}).select("nombres apellidos permisos fechaNacimiento email username numeroTel email").exec();
            }
            catch (error) {
                console.log("Error fetching la lista de usuarios de la base de datos. E: " + error);
                ApolloError("Error de conexión a la base de datos");
            }

            var usuariosMatch = todosUsuarios.filter((u: any) => (u.nombres + u.apellidos).search(textoBuscar) > -1);
            console.log(`Enviando lista de matchs de los usuarios: ${usuariosMatch.length}`);
            return usuariosMatch;
        },
        login: async function (_: any, { username, password }: any, context: contextoQuery) {
            let credencialesUsuario = context.usuario;
            console.log(`Solicitud de login`);

            username = username.trim();
            if (charProhibidosUsername.test(username)) {
                console.log(`Username inválido`);
                UserInputError("Datos inválidos");
            }

            try {
                var elUsuario: any = await Usuario.findOne({ username }, "username password permisos").exec();
            } catch (error) {
                console.log(`Error buscando el usuario en la base de datos. E: ${error}`);
                ApolloError("Error conectando con la base de datos");
            }

            if (!elUsuario) UserInputError("Datos inválidos");

            const correctLogin = await bcrypt.compare(password, elUsuario.password);
            if (!correctLogin) {
                console.log(`Contraseña errada. Rechazando`);
                UserInputError("Datos incorrectos");
            }

            console.log(`login correcto de ${username}. Enviando JWT`);
            const datosToken = {
                id: elUsuario._id,
                permisos: elUsuario.permisos,
                username: elUsuario.username,
                version: 1,
            }
            if (!process.env.JWT_SECRET) {
                throw "ENV DE JWT SECRET NO CONFIGURADO";
            }
            const token = jwt.sign(datosToken, process.env.JWT_SECRET,);
            const respuesta = {
                username: elUsuario.username,
                permisos: elUsuario.permisos,
                token
            }

            return token;
        },
        alienarUsuario: async function (_: any, { idAlienado }: any, context: contextoQuery) {
            console.log('\x1b[35m%s\x1b[0m', `Query de alienar usuario con id ${idAlienado}`);

            if (!context.usuario) {
                console.log(`Login requerido`);
                AuthenticationError("Login requerido");
            }

            const credencialesUsuario = context.usuario;



            const permisosEspeciales = ["superadministrador", "maestraVida-profesor"];
            const permisosNoAlienables = ["superadministrador", "maestraVida-profesor", "atlasAdministrador"];

            if (!credencialesUsuario.permisos.some(p => permisosEspeciales.includes(p))) {
                AuthenticationError("No autorizado");
            }

            try {
                var elUsuario: any = await Usuario.findById(idAlienado, "username password permisos").exec();
            } catch (error) {
                console.log(`Error buscando el usuario en la base de datos. E: ${error}`);
                ApolloError("Error conectando con la base de datos");
            }

            if (elUsuario.permisos.some(p => permisosNoAlienables.includes(p)) && !credencialesUsuario.permisos.includes("superadministrador")) {
                console.log(`El usuario no podía ser alienado`);
                UserInputError("No permitido");
            }

            const datosToken = {
                id: elUsuario._id,
                permisos: elUsuario.permisos,
                username: elUsuario.username,
                version: 1,
            }
            if (!process.env.JWT_SECRET) {
                throw "JWT ENV NO CONFIGURADO"
            }
            const token = jwt.sign(datosToken, process.env.JWT_SECRET,);

            return token;
        },
        participantesCasaMaestraVida: async function (_: any, __: any, contexto: contextoQuery) {
            if (!contexto.usuario?.id) {
                AuthenticationError('loginRequerido');
            }

            const credencialesUsuario = contexto.usuario;


            try {
                var losParticipantes: any = await Usuario.find({ $or: [{ permisos: "maestraVida-estudiante" }, { permisos: "maestraVida-profesor" }] }).exec();
            } catch (error) {
                console.log(`Error getting lista de usuarios participantes de Maestra Vida : ` + error);
                ApolloError('Error conectando con la base de datos');

            }

            return losParticipantes;
        },

        async coleccionNodosConocimiento(_: any, { idUsuario, idColeccion }: any, contexto: contextoQuery) {
            if (!contexto.usuario?.id) {
                AuthenticationError('loginRequerido');
            }

            const credencialesUsuario = contexto.usuario;

            try {
                var elUsuario: any = await Usuario.findById(idUsuario).exec();
                if (!elUsuario) throw 'Usuario no encontrado';
            } catch (error) {
                console.log('Error descargando el usuario de la base de datos: ' + error)
                ApolloError('Error conectando con la base de datos');
            };

            var laColeccion = elUsuario.atlas.colecciones.id(idColeccion);

            if (!laColeccion) {
                console.log(`Error getting la colección : `);
                UserInputError('Colección no encontrada');

            }

            return laColeccion;
        },


    },
    Mutation: {
        editarDatosUsuario: async function (_: any, { nuevosDatos }: any, context: contextoQuery) {
            console.log(`solicitud de edicion de datos de usuario`);
            let credencialesUsuario = context.usuario;
            console.log(`Usuario: Id: ${credencialesUsuario.id}, username: ${credencialesUsuario.username}`);
            if (!credencialesUsuario.permisos) {
                console.log(`No habia campo permisos activado en las credenciales del usuario`);
                AuthenticationError("No autorizado");
            }

            try {
                var elUsuario: any = await Usuario.findById(credencialesUsuario.id).exec();
                if (!elUsuario) {
                    throw "Usuario no encontrado"
                }
            }
            catch (error) {
                console.log("Error buscando el usuario en la base de datos. E: " + error);
                ApolloError("Error conectando con la base de datos");
            }

            let errores: Array<string> = validarDatosUsuario(nuevosDatos);

            if (errores.length > 0) {
                console.log(`Error validando datos: ${errores}`);
                ApolloError("Datos invalidos");
            }
            console.log(`asignando ${nuevosDatos} al usuario`);

            try {
                Object.assign(elUsuario, nuevosDatos);
                await elUsuario.save()
            }
            catch (error) {
                console.log("Error guardando el usuario merged con nuevos datos. E: " + error);
                ApolloError("Error guardando datos");
            }
            console.log(`Nuevos datos guardados`);
            return elUsuario;

        },
        setCentroVista: async function (_: any, { idUsuario, centroVista }: any, context: contextoQuery) {
            console.log(`Seting centro vista en ${JSON.stringify(centroVista)} para el usuario ${idUsuario}`);
            try {
                var elUsuario: any = await Usuario.findById(idUsuario, "atlas").exec();
                if (!elUsuario) {
                    throw "Error recopilando datos";
                }
            } catch (error) {
                console.log(`error buscando usuario en la base de datos`);
                ApolloError("");
            }
            elUsuario.atlas.centroVista = centroVista;

            try {
                await elUsuario.save();
            } catch (error) {
                console.log(`error buscando usuario en la base de datos: ${error}`);
                ApolloError("");

            }
            console.log(`Set`);
            return true;
        },
        addPermisoUsuario: async function (_: any, { idUsuario, nuevoPermiso }, contexto: contextoQuery) {
            console.log(`Peticion de dar permiso ${nuevoPermiso} a un usuario con id ${idUsuario}`);
            let credencialesUsuario = contexto.usuario;

            if (!credencialesUsuario.permisos) {
                console.log(`No habia permisos en las credenciales`);
                AuthenticationError("No autorizado");
            }

            let permisosValidos = ["superadministrador"];

            if (!credencialesUsuario.permisos.some(p => permisosValidos.includes(p))) {
                console.log(`Usuario no tiene permisos válidos`);
                AuthenticationError("No autorizado");
            }

            if (!permisosDeUsuario.includes(nuevoPermiso)) {
                console.log(`${nuevoPermiso} no es un permiso de usuario válido`);
                console.log(`los permisos válidos son: ${permisosDeUsuario}`);
                AuthenticationError("Permiso no reconocido");
            }

            try {
                var elUsuario: any = await Usuario.findById(idUsuario).exec();
                if (!Array.isArray(elUsuario.permisos)) {
                    console.log(`Los permisos no eran un array: Eran: ${elUsuario.permisos}`);
                }
                if (!elUsuario.permisos.includes(nuevoPermiso)) {
                    console.log(`Añadiendo ${nuevoPermiso} a la lista de permisos`);
                    elUsuario.permisos.push(nuevoPermiso);
                    elUsuario.permisos = elUsuario.permisos.filter(p => p != "actividadesProfes-profe");
                }
                else {
                    console.log(`El usuario ya tenía ese permiso`);
                }
                await elUsuario.save();
            } catch (error) {
                console.log(`Error updating el usuario en la base de datos. e. ${error}`);
                ApolloError("Error conectando con la base de datos");
            }

            console.log(`Permiso añadido.Quedó con: ${elUsuario.permisos}`);
            return elUsuario;
        },
        eliminarUsuario: async function (_: any, { idUsuario }, contexto: contextoQuery) {
            console.log(`||||||||||||||||||||||`);
            console.log(`Solicitud de eliminar un usuario con id ${idUsuario} de la base de datos`);

            let credencialesUsuario = contexto.usuario;

            if (!credencialesUsuario.permisos) {
                console.log(`No habia permisos en las credenciales`);
                AuthenticationError("No autorizado");
            }

            let permisosValidos = ["superadministrador"];

            if (!credencialesUsuario.permisos.some(p => permisosValidos.includes(p))) {
                console.log(`Usuario no tiene permisos válidos`);
                AuthenticationError("No autorizado");
            }

            try {
                let elEliminado: any = await Usuario.findByIdAndDelete(idUsuario).exec();
                if (!elEliminado) {
                    throw "Usuario no encontrado";
                }
                console.log(`Eliminado ${elEliminado.username}`);
            } catch (error) {
                console.log(`Error eliminando usuario. E: ${error}`);
                AuthenticationError("Error conectando con la base de datos");
            }
            return true;


        },


        setNodoAtlasTarget: async function (_: any, { idNodo }: {idNodo: ObjectId}, contexto: contextoQuery) {
            let credencialesUsuario = contexto.usuario;
            if (!credencialesUsuario || !credencialesUsuario.id) {
                AuthenticationError("No autenticado");
            }

            console.log(`Seting nodo ${idNodo} como target para el usuario ${credencialesUsuario.id}`);

            try {
                var elUsuario: any = await Usuario.findById(credencialesUsuario.id).exec();
                elUsuario.atlas.idNodoTarget = idNodo;
                await elUsuario.save();
            } catch (error) {
                console.log(`error guardando usuario en la base de datos: ${error}`);
                ApolloError("");
            }

            return true;

        },
        nulificarNodoTargetUsuarioAtlas: async function (_: any, __: any, contexto: contextoQuery) {
            let credencialesUsuario = contexto.usuario;
            if (!credencialesUsuario || !credencialesUsuario.id) {
                AuthenticationError("No autenticado");
            }

            console.log(`Seting nodo target null para el usuario ${credencialesUsuario.id}`);

            try {
                var elUsuario: any = await Usuario.findById(credencialesUsuario.id).exec();
                elUsuario.atlas.idNodoTarget = null;
                await elUsuario.save();
            } catch (error) {
                console.log(`error guardando usuario en la base de datos: ${error}`);
                ApolloError("");
            }
            return true;
        },
        setModoUsuarioAtlas: async function (_: any, { idUsuario, nuevoModo }: any, contexto: contextoQuery) {
            let credencialesUsuario = contexto.usuario;
            if (!credencialesUsuario || !credencialesUsuario.id) {
                AuthenticationError("No autenticado");
            }

            console.log(`Seting modo ${nuevoModo} para el usuario ${idUsuario}`);

            // try {
            //     var losUsuarios:any=await Usuario.find({}).exec();
            //     losUsuarios.forEach(async (u)=>{
            //         u.atlas.colecciones=[];
            //         await u.save();
            //     })

            // } catch (error) {
            //     console.log(`Error corrigiendo todos los usuarios`);
            // }

            try {
                var elUsuario: any = await Usuario.findById(idUsuario).exec();

                elUsuario.atlas.configuracion.modo = nuevoModo;
                // console.log(`Guardando usuario.atlas con valor: ${elUsuario.atlas}`);
                console.log(`Guardando usuario.atlas.colecciones con valor: ${elUsuario.atlas.colecciones}`);
                await elUsuario.save();

            } catch (error) {
                console.log(`error guardando usuario en la base de datos: ${error}`);
                ApolloError("");
            }

            return elUsuario;

        },

        async setNodoGradoCompletadoUsuario(_: any, { idUsuario, idNodo, nuevoEstado }: any, contexto: contextoQuery) {
            console.log('\x1b[35m%s\x1b[0m', `Mutacion de set en ${nuevoEstado} el nodo ${idNodo} para el usuario ${idUsuario}`);
            if (!contexto.usuario?.id) {
                AuthenticationError('loginRequerido');
            }

            const credencialesUsuario = contexto.usuario;

            const tienePermisosEspeciales = permisosEspecialesDefault.some(p => credencialesUsuario.permisos.includes(p));
            const esProfe = credencialesUsuario.permisos.includes("maestraVida-profesor");

            if (!tienePermisosEspeciales && !esProfe) {
                console.log("No autorizado");
                AuthenticationError("No autorizado");
            }

            try {
                var elUsuario: any = await Usuario.findById(idUsuario).exec();
                if (!elUsuario) throw 'Usuario no encontrado';
            }
            catch (error) {
                ApolloError('Error conectando con la base de datos');
            }

            const indexN = elUsuario.nodosCompletadosRutaGrado.indexOf(idNodo);

            if (nuevoEstado) {
                if (indexN > -1) {
                    UserInputError("El nodo ya estaba completado");
                }

                elUsuario.nodosCompletadosRutaGrado.push(idNodo);
            }
            else {
                if (indexN === -1) {
                    UserInputError("El nodo no estaba completado");
                }

                elUsuario.nodosCompletadosRutaGrado.splice(indexN, 1);
            }

            try {
                elUsuario.save();
            } catch (error) {
                console.log(`Error guardando el usuario con cambio en nodosGrado completados : ` + error);
                ApolloError('Error conectando con la base de datos');

            }

            console.log("Toggling completado");
            return elUsuario;




        },

        guardarInformeEstudianteMaestraVida: async function (_: any, { idUsuario, year, periodo, idProfe, categoria, texto }: any, contexto: contextoQuery) {
            console.log('\x1b[35m%s\x1b[0m', `Solicitud de guardar informe del periodo ${periodo} de ${year} maestra vida del estudiante con id ${idUsuario} con texto: ${texto}`);
            try {
                var elUsuario: any = await Usuario.findById(idUsuario).exec();
                if (!elUsuario) {
                    throw "usuario no encontrado"
                }

                var elProfe: any = await Usuario.findById(idProfe).exec();
                if (!elProfe) {
                    throw "profe no encontrado"
                }
            }
            catch (error) {
                console.log(`error buscando usuarios. E: ` + error);
                ApolloError("Error conectando con la base de datos");
            }

            var esProfe = false;
            if (elProfe.permisos.includes("maestraVida-profesor")) {
                esProfe = true;
            }

            let credencialesUsuario = contexto.usuario;

            let permisosEspeciales = ["atlasAdministrador", "administrador", "superadministrador"];

            if (!credencialesUsuario.permisos.some(p => permisosEspeciales.includes(p)) && !esProfe) {
                console.log(`El usuario no tenia permisos para efectuar esta operación`);
                AuthenticationError("No autorizado");
            }

            texto = texto.trim();

            var elInforme: any = elUsuario.informesMaestraVida.find(i => i.year == year && i.periodo === periodo && i.idProfe === idProfe && i.categoria === categoria)
            if (!elInforme) {
                console.log("Informe no existía, creando.");
                elInforme = elUsuario.informesMaestraVida.create({
                    year, periodo, idProfe, categoria, texto,
                })
                elUsuario.informesMaestraVida.push(elInforme);
            }
            else {
                console.log("El informe ya existía");
                elInforme.texto = texto;
            }

            try {
                console.log(`guardando nuevo texto en la base de datos`);
                await elUsuario.save();
            } catch (error) {
                console.log(`error guardando el nodo: ${error}`);
            }
            console.log(`Informe guardado`);
            return elInforme;
        },

        async asignarPermisoTodosUsuarios(_: any, { nuevoPermiso }: any, contexto: contextoQuery) {
            const credencialesUsuario = contexto.usuario;
            const permisosAutorizados = ["superadministrador"];

            if (!credencialesUsuario.permisos.some(async (p) => permisosAutorizados.includes(p))) {
                console.log(`El usuario no tenía los permisos correctos`);
                AuthenticationError("No autorizado");
            }

            try {
                var losUsuarios: any = await Usuario.find({}).exec();
            } catch (error) {
                console.log(`Error buscando los usuarios: ${error}`);
                ApolloError("Error conectando con la base de datos");
            }

            losUsuarios.forEach(async (usuario) => {
                const indexP = usuario.permisos.indexOf(nuevoPermiso);
                if (indexP > -1) {
                    usuario.permisos.splice(indexP, 1);
                }
                usuario.permisos.push(nuevoPermiso);

                try {
                    await usuario.save();
                } catch (error) {
                    console.log(`Error guardando el usuario con el nuevo permiso: ${error}`);
                    ApolloError("Error conectando con la base de datos");
                }
            });

            return true;



        },
        async togglePermisoUsuario(_: any, { permiso, idUsuario }: any, contexto: contextoQuery) {
            const credencialesUsuario = contexto.usuario;
            const permisosAutorizados = ["superadministrador"];

            if (!credencialesUsuario.permisos.some(async (p) => permisosAutorizados.includes(p))) {
                console.log(`El usuario no tenía los permisos correctos`);
                AuthenticationError("No autorizado");
            }

            try {
                var elUsuario: any = await Usuario.findById(idUsuario).exec();
                if (!elUsuario) throw "Usuario no encontrado";
            } catch (error) {
                console.log(`Error buscando el usuario: ${error}`);
                ApolloError("Error conectando con la base de datos");
            }

            const indexP = elUsuario.permisos.indexOf(permiso);

            if (indexP > -1) {
                elUsuario.permisos.splice(indexP, 1);
            }
            else {
                elUsuario.permisos.push(permiso)
            }

            try {
                await elUsuario.save();
            } catch (error) {
                console.log(`Error guardando el usuario: ${error}`);
                ApolloError("Error conectando con la base de datos");
            }

            return elUsuario;


        },



        async crearColeccionNodosAtlasConocimientoUsuario(_: any, { nombre, idsNodos }: any, contexto: contextoQuery) {
            const credencialesUsuario = contexto.usuario;

            if (!credencialesUsuario.id) {
                console.log(`Error: no hay id en las credenciales de usuario`);
                AuthenticationError("No logeado");
            }

            try {
                var elUsuario: any = await Usuario.findById(credencialesUsuario.id).exec();
                if (!elUsuario) {
                    throw "Usuario no encontrado";
                }
            } catch (error) {
                console.log(`Error buscando el usuario en la base de datos`);
                ApolloError("Usuario no encontrado");
            }
            let infoNuevaColeccion: { nombre?: string, idsNodos?: string[] } = {};
            if (nombre) {
                nombre = nombre.trim();
                if (!validatorNombreCosa.validator(nombre)) {
                    UserInputError("Nombre de colección inválido");
                }

                infoNuevaColeccion.nombre = nombre;
            }
            if (idsNodos) {
                infoNuevaColeccion.idsNodos = idsNodos;
            }

            var nuevaColeccion = elUsuario.atlas.colecciones.create(infoNuevaColeccion);
            elUsuario.atlas.colecciones.push(nuevaColeccion);

            try {
                await elUsuario.save();
            } catch (error) {
                console.log(`Error guardando la colección en la base de datos`);
                ApolloError("Error conectando con la base de datos");
            }

            return nuevaColeccion;

        },
        async eliminarColeccionNodosAtlasConocimientoUsuario(_: any, { idColeccion }: any, contexto: contextoQuery) {
            const credencialesUsuario = contexto.usuario;

            if (!credencialesUsuario.id) {
                console.log(`Error: no hay id en las credenciales de usuario`);
                AuthenticationError("No logeado");
            }

            try {
                var elUsuario: any = await Usuario.findById(credencialesUsuario.id).exec();
                if (!elUsuario) {
                    throw "Usuario no encontrado";
                }
            } catch (error) {
                console.log(`Error buscando el usuario en la base de datos`);
                ApolloError("Usuario no encontrado");
            }

            const indexC = elUsuario.atlas.colecciones.findIndex(c => c.id === idColeccion);

            if (indexC > -1) {
                elUsuario.atlas.colecciones.splice(indexC, 1);
            }
            else {
                UserInputError("Colección no encontrada");
            }

            try {
                await elUsuario.save();
            } catch (error) {
                console.log(`Error guardando la colección en la base de datos`);
                ApolloError("Error conectando con la base de datos");
            }
            console.log(`Colección eliminada`);
            return true;

        },
        async setNombreColeccionNodosAtlasConocimientoUsuario(_: any, { idColeccion, nuevoNombre }: any, contexto: contextoQuery) {
            const credencialesUsuario = contexto.usuario;

            try {
                var elUsuario: any = await Usuario.findById(credencialesUsuario.id).exec();
                if (!elUsuario) {
                    throw "Usuario no encontrado";
                }
            } catch (error) {
                console.log(`Error buscando el usuario`);
                ApolloError("Usuario no encontrado");
            }

            nuevoNombre = nuevoNombre.trim();
            const charProhibidosNombreColeccion = /[^ a-zA-ZÀ-ž0-9_():.,-]/;
            if (charProhibidosNombreColeccion.test(nuevoNombre)) {
                UserInputError("Nombre ilegal");
            }

            const indexC = elUsuario.atlas.colecciones.findIndex(c => c.id === idColeccion);

            let laColeccion: any = {};
            if (indexC > -1) {

                elUsuario.atlas.colecciones[indexC].nombre = nuevoNombre;
            }
            else {
                UserInputError("Colección no encontrada");
            }

            try {
                await elUsuario.save();
            } catch (error) {
                console.log(`Error guardando los datos del usuario`);
                ApolloError("Error conectando con la base de datos");
            }

            return laColeccion;

        },

        async removeNodoColeccionNodosAtlasConocimientoUsuario(_: any, { idColeccion, idNodo }: any, contexto: contextoQuery) {
            const credencialesUsuario = contexto.usuario;

            try {
                var elUsuario: any = await Usuario.findById(credencialesUsuario.id).exec();
                if (!elUsuario) {
                    throw "Usuario no encontrado";
                }
            } catch (error) {
                console.log(`Error buscando el usuario`);
                ApolloError("Usuario no encontrado");
            }

            var laColeccion = elUsuario.atlas.colecciones.id(idColeccion);
            if (!laColeccion) {
                console.log(`Coleccion no encontrada`);
                UserInputError("Colección no encontrada");
            }

            var indexN = laColeccion.idsNodos.indexOf(idNodo);
            if (indexN > -1) {
                laColeccion.idsNodos.splice(indexN, 1);
            }
            else {
                UserInputError("Nodo no existía en la colección")
            }

            try {
                await elUsuario.save();
            } catch (error) {
                ApolloError("Error guardando datos de usuario en la base de datos");
            }

            return true;
        },
        async toggleNodoColeccionNodosAtlasConocimientoUsuario(_: any, { idColeccion, idNodo, idUsuario }: any, contexto: contextoQuery) {
            const credencialesUsuario = contexto.usuario;
            console.log(`Toggling nodo ${idNodo} en colección ${idColeccion} para el usuario ${idUsuario}`);
            try {
                var elUsuario: any = await Usuario.findById(credencialesUsuario.id).exec();
                if (!elUsuario) {
                    throw "Usuario no encontrado";
                }
            } catch (error) {
                console.log(`Error buscando el usuario`);
                ApolloError("Usuario no encontrado");
            }

            //Autorizacion
            const permisosEspeciales = ["superadministrador"];
            if (!permisosEspeciales.some(p => credencialesUsuario.permisos.includes(p)) && credencialesUsuario.id != idUsuario) {
                console.log(`No autorizado`);
                AuthenticationError("No autorizado");
            }

            var laColeccion = elUsuario.atlas.colecciones.id(idColeccion);
            if (!laColeccion) {
                console.log(`Coleccion no encontrada`);
                UserInputError("Colección no encontrada");
            }

            const indexN = laColeccion.idsNodos.indexOf(idNodo);
            if (indexN === -1) {
                try {
                    var elNodo: any = await Nodo.findById(idNodo).exec();
                    if (!elNodo) throw 'Nodo no encontrado';
                } catch (error) {
                    console.log('Error descargando el nodo de la base de datos: ' + error)
                    ApolloError('Error conectando con la base de datos');
                };

                let idsRed = (await getNodosRedByOriginalIds(laColeccion.idsNodos)).map(n => n.id);

                if (idsRed.includes(idNodo)) {
                    console.log("Se intentaba introducir un nodo que ya hacía parte de la red.");
                    UserInputError("El nodo ya estaba en la colección como dependencia de otro");
                }

                laColeccion.idsNodos.push(idNodo);

                const idsRedPrevia = await getIdsRedRequerimentosNodo(elNodo);

                if(!idsRedPrevia){
                    return ApolloError("Error getting red previa de nodo");
                }

                laColeccion.idsNodos = laColeccion.idsNodos.filter(idN => !idsRedPrevia.includes(idN));
            }
            else {
                laColeccion.idsNodos.splice(indexN, 1);
            }

            try {
                await elUsuario.save();
            } catch (error) {
                ApolloError("Error guardando datos de usuario en la base de datos");
            }

            return laColeccion;
        },

        async crearIteracionRepasoNodoConocimientoUsuario(_: any, { idUsuario, idNodo, intervalo }: any, contexto: contextoQuery) {
            console.log('\x1b[35m%s\x1b[0m', `Mutation for crear iteracion de repaso para nodo ${idNodo} con intervalo ${intervalo}`);

            if (!contexto.usuario) {
                console.log(`No había credenciales`);
                AuthenticationError("Login requerido");
            }
            const credencialesUsuario = contexto.usuario;

            try {
                var elUsuario: any = await Usuario.findById(idUsuario).exec();
                if (!elUsuario) {
                    throw "Usuario no encontrado";
                }
            } catch (error) {
                console.log(`Error buscando el usuario en la base de datos`);
                ApolloError("Usuario no encontrado");
            }

            //Authentication

            const permisosEspeciales = ["superadministrador"];
            if (credencialesUsuario.id != idUsuario && !credencialesUsuario.permisos.some(p => permisosEspeciales.includes(p))) {
                AuthenticationError("No autorizado");
            }

            var elDatoNodo = elUsuario.atlas.datosNodos.find(dn => dn.idNodo === idNodo);
            if (!elDatoNodo) {
                elDatoNodo = elUsuario.atlas.datosNodos.create({
                    idNodo: idNodo
                });
                elUsuario.atlas.datosNodos.push(elDatoNodo);
            }

            var nuevaIteracion = elDatoNodo.iteracionesRepaso.create();
            if (intervalo) {
                nuevaIteracion.intervalo = intervalo;
            }


            elDatoNodo.iteracionesRepaso.push(nuevaIteracion);

            try {
                await elUsuario.save();
            } catch (error) {
                console.log(`Error guardando el usuario en la base de datos: ${error}`);
                ApolloError("Error conectando con la base de datos");
            }
            console.log(`Creado`);
            return elDatoNodo;

        },
        async eliminarIteracionRepaso(_: any, { idUsuario, idNodo, idIteracion }: any, contexto: contextoQuery) {
            console.log('\x1b[35m%s\x1b[0m', `Query for eliminar iteracion de repaso con id ${idIteracion} del nodo ${idNodo} del usuario ${idUsuario}`);

            if (!contexto.usuario) {
                console.log(`No había credenciales`);
                AuthenticationError("Login requerido");
            }
            const credencialesUsuario = contexto.usuario;

            try {
                var elUsuario: any = await Usuario.findById(idUsuario).exec();
                if (!elUsuario) {
                    throw "Usuario no encontrado";
                }
            } catch (error) {
                console.log(`Error buscando el usuario en la base de datos`);
                ApolloError("Usuario no encontrado");
            }

            //Authentication

            const permisosEspeciales = ["superadministrador"];
            if (credencialesUsuario.id != idUsuario && !credencialesUsuario.permisos.some(p => permisosEspeciales.includes(p))) {
                AuthenticationError("No autorizado");
            }

            var elDatoNodo = elUsuario.atlas.datosNodos.find(dn => dn.idNodo === idNodo);
            if (!elDatoNodo) {
                console.log(`Dato nodo no encontrado`);
                UserInputError("Datos inválidos");
            }

            const indexI = elDatoNodo.iteracionesRepaso.findIndex(i => i.id === idIteracion);

            if (indexI > -1) {
                elDatoNodo.iteracionesRepaso.splice(indexI, 1);
            }
            else {
                UserInputError("Iteración no existía");
            }

            try {
                await elUsuario.save();
            } catch (error) {
                console.log(`Error guardando el usuario en la base de datos: ${error}`);
                ApolloError("Error conectando con la base de datos");
            }


            return true;
        },
        async setIntervaloIteracionRepaso(_: any, { idUsuario, idNodo, idIteracion, nuevoIntervalo }: any, contexto: contextoQuery) {
            console.log('\x1b[35m%s\x1b[0m', `Query for set intervalo de iteracionRepaso con id ${idIteracion} del nodo ${idNodo} del usuario ${idUsuario} en valor ${nuevoIntervalo}`);

            if (!contexto.usuario) {
                console.log(`No había credenciales`);
                AuthenticationError("Login requerido");
            }
            const credencialesUsuario = contexto.usuario;

            try {
                var elUsuario: any = await Usuario.findById(idUsuario).exec();
                if (!elUsuario) {
                    throw "Usuario no encontrado";
                }
            } catch (error) {
                console.log(`Error buscando el usuario en la base de datos`);
                ApolloError("Usuario no encontrado");
            }

            //Authentication

            const permisosEspeciales = ["superadministrador"];
            if (credencialesUsuario.id != idUsuario && !credencialesUsuario.permisos.some(p => permisosEspeciales.includes(p))) {
                AuthenticationError("No autorizado");
            }

            var elDatoNodo = elUsuario.atlas.datosNodos.find(dn => dn.idNodo === idNodo);
            if (!elDatoNodo) {
                UserInputError("Datos de nodo no encontrados");
            }

            var laIteracion = elDatoNodo.iteracionesRepaso.find(i => i.id === idIteracion);
            if (!laIteracion) {
                UserInputError("Iteracion no encontrado");
            }

            laIteracion.intervalo = nuevoIntervalo;
            try {
                await elUsuario.save();
            } catch (error) {
                console.log(`Error guardando el usuario en la base de datos: ${error}`);
                ApolloError("Error conectando con la base de datos");
            }

            return laIteracion;
        },

        async setDateNodoConocimientoEstudiadoUsuario(_: any, { idUsuario, idNodo, fecha }: any, contexto: contextoQuery) {
            console.log('\x1b[35m%s\x1b[0m', `Query for set nodo ${idNodo} estudiado en ${fecha} por el usuario ${idUsuario}`);

            if (!contexto.usuario) {
                console.log(`No había credenciales`);
                AuthenticationError("Login requerido");
            }
            const credencialesUsuario = contexto.usuario;

            try {
                var elUsuario: any = await Usuario.findById(idUsuario).exec();
                if (!elUsuario) {
                    throw "Usuario no encontrado";
                }
            } catch (error) {
                console.log(`Error buscando el usuario en la base de datos`);
                ApolloError("Usuario no encontrado");
            }

            //Authentication

            const permisosEspeciales = ["superadministrador"];
            if (credencialesUsuario.id != idUsuario && !credencialesUsuario.permisos.some(p => permisosEspeciales.includes(p))) {
                AuthenticationError("No autorizado");
            }

            var elDatoNodo = elUsuario.atlas.datosNodos.find(dn => dn.idNodo === idNodo);
            if (!elDatoNodo) {
                console.log(`Datos de nodo no encontrados. Creando`);
                elDatoNodo = elUsuario.atlas.datosNodos.create({ idNodo });
                elUsuario.atlas.datosNodos.push(elDatoNodo)
            }

            if (elDatoNodo.iteracionesRepaso.length > 0) {
                elDatoNodo.iteracionesRepaso.shift();
            }
            if (elDatoNodo.iteracionesRepaso.legth < 1) {
                var nuevaIteracion = elDatoNodo.iteracionesRepaso.create({
                    intervalo: 172800000,
                })
                elDatoNodo.iteracionesRepaso.push(nuevaIteracion);
            }
            elDatoNodo.estudiado = fecha;
            console.log(JSON.stringify(elDatoNodo, null, 2));

            try {
                await elUsuario.save();
            } catch (error) {
                console.log(`Error guardando el usuario en la base de datos: ${error}`);
                ApolloError("Error conectando con la base de datos");
            }

            return elDatoNodo;
        },
        setNodoAtlasAprendidoUsuario: async function (_: any, { idNodo, nuevoEstadoAprendido }: any, contexto: contextoQuery) {
            let credencialesUsuario = contexto.usuario;
            if (!credencialesUsuario || !credencialesUsuario.id) {
                AuthenticationError("No autenticado");
            }

            console.log('\x1b[35m%s\x1b[0m', `Seting nodo ${idNodo} en estado de aprendido ${nuevoEstadoAprendido} para el usuario ${credencialesUsuario.id}`);

            try {
                var elUsuario: any = await Usuario.findById(credencialesUsuario.id).exec();

            } catch (error) {
                console.log(`error buscando usuario en la base de datos: ${error}`);
                ApolloError("");
            }
            var todosNodosAfectados: Array<any> = [];
            var tipoRol: string = "";
            if (nuevoEstadoAprendido) {
                tipoRol = "target"
            }
            else {
                tipoRol = "source";
            }
            console.log(`Setting este y todos los nodos de conocimiento encadenados como aprendidos: ${nuevoEstadoAprendido}`);
            var currentIds: Array<any> = [idNodo];
            var currentNodos: Array<any> = [];
            var cuenta = 0;
            while (currentIds && currentIds.length > 0 && cuenta < 200) {
                cuenta++;
                try {
                    currentNodos = await Nodo.find({ _id: { $in: currentIds } }).select("nombre vinculos").exec();
                } catch (error) {
                    console.log(`Error buscando current nodos: ${error}`);
                    ApolloError("Error ejecutando operación");
                }
                console.log(`Encontrados ${currentNodos.length} nodos current`);
                todosNodosAfectados.push(...currentNodos);
                currentIds = currentNodos.reduce((acc, nodo) => acc.concat(nodo.vinculos.filter(v => v.rol === tipoRol).map(v => v.idRef)), []);
                console.log(`Current ids queda en ${currentIds} con length ${currentIds.length}`);

            }
            console.log(`Encontrados ${todosNodosAfectados.length} nodos encadenados: ${todosNodosAfectados.map(n => n.nombre)}`);
            var idsNodosAfectados = todosNodosAfectados.map(na => na.id);

            idsNodosAfectados.forEach((idN) => {
                var indexN = elUsuario.atlas.datosNodos.findIndex(n => n.idNodo == idN);
                if (indexN > -1) {
                    elUsuario.atlas.datosNodos[indexN].aprendido = nuevoEstadoAprendido;
                }
                else {
                    if (nuevoEstadoAprendido) {
                        elUsuario.atlas.datosNodos.push({
                            idNodo: idN,
                            aprendido: nuevoEstadoAprendido
                        });
                    }

                }
            });

            try {
                await elUsuario.save();
            } catch (error) {
                console.log(`error guardando usuario en la base de datos: ${error}`);
                ApolloError("");
            }

            let datosNodoAfectados = elUsuario.atlas.datosNodos.filter(dn => idsNodosAfectados.includes(dn.idNodo));
            console.log(`Se afectaron ${datosNodoAfectados.length} datos de nodo`);
            // for(const dato of datosNodoAfectados){
            //     console.log(`${JSON.stringify(dato)}`);
            // }
            return datosNodoAfectados;

        },
        setDiasRepasoNodoConocimientoUsuario: async function (_: any, { idNodo, nuevoDiasRepaso }: any, contexto: contextoQuery) {

            console.log('\x1b[35m%s\x1b[0m', `Peticion de set dias de repaso en ${nuevoDiasRepaso} para el nodo ${idNodo}`);
            if (!contexto.usuario?.id) {
                AuthenticationError('loginRequerido');
            }

            const credencialesUsuario = contexto.usuario;


            try {
                var elUsuario: any = await Usuario.findById(credencialesUsuario.id).exec();

            } catch (error) {
                console.log(`error buscando usuario en la base de datos: ${error}`);
                ApolloError("");
            }

            var elDatoNodo = elUsuario.atlas.datosNodos.find(dn => dn.idNodo === idNodo);

            if (!elDatoNodo) {
                let elDatoNodo = elUsuario.atlas.datosNodos.create({
                    idNodo,
                })

                elUsuario.atlas.datosNodos.push(elDatoNodo);
            }

            elDatoNodo.diasRepaso = nuevoDiasRepaso;


            try {
                await elUsuario.save();
            } catch (error) {
                console.log(`error guardando usuario en la base de datos: ${error}`);
                ApolloError("");
            }
            return elDatoNodo;
        },


        async setCoordsVistaAtlasSolidaridadUsuario(_: any, { coords }: any, contexto: contextoQuery) {
            const credencialesUsuario = contexto.usuario;

            if (!credencialesUsuario.id) {
                AuthenticationError("No Autenticado");
            }

            try {
                var elUsuario: any = await Usuario.findById(credencialesUsuario.id).exec();
            } catch (error) {
                console.log(`Error buscando el usuario`);
                ApolloError("Usuario no encontrado");
            }
            elUsuario.atlasSolidaridad.coordsVista = coords;

            try {
                await elUsuario.save();
            } catch (error) {
                console.log(`Error guardando el usuario con el nuevo coords de centroVista`);
                ApolloError("Error conectando con la base de datos");
            }

            console.log(`Nuevo coords vista en atlas solidaridad setted en ${JSON.stringify(coords)}`);
            return true;
        },
        async setNodosSolidaridadDesplegadosUsuario(_: any, { idsNodos }: any, contexto: contextoQuery) {
            const credencialesUsuario = contexto.usuario;
            if (!credencialesUsuario) {
                AuthenticationError("No autorizardo")
            }
            const idUsuario = credencialesUsuario.id;
            try {
                var elUsuario: any = await Usuario.findById(idUsuario).exec();
                if (!elUsuario) throw "Usuario no encontrado";
            } catch (error) {
                console.log(`Error buscando el usuario: ${error}`);
                ApolloError("Error conectando con la base de datos");
            }

            elUsuario.atlasSolidaridad.idsNodosDesplegados = idsNodos;

            try {
                await elUsuario.save();
            } catch (error) {
                console.log(`Error guardando el usuario`);
                ApolloError("Error conectando con la base de datos");
            }

            return true;
        },

        async cambiarPassword(_: any, { dizqueCurrentPassword, newPassword }, context: contextoQuery) {
            if (!context.usuario) {
                AuthenticationError("Login necesario");
            }
            const usuario = context.usuario;

            console.log(`Solicitud de cambio de password del usuario ${usuario.id}`);

            try {
                var elUsuario: any = await Usuario.findById(usuario.id).exec();
                if (!elUsuario) throw "Usuario no encontrado";
            } catch (error) {
                console.log(`Error descargando el usuario: ${error}`);
                UserInputError("Datos inválidos");
            }

            //Validar currentPass

            if (!await bcrypt.compare(dizqueCurrentPassword, elUsuario.password)) {
                UserInputError("Datos inválidos");
            }

            //Validar nuevo pass

            if (charProhibidosPassword.test(newPassword)) {
                console.log(`El nuevo password contenía caracteres ilegales`);
                UserInputError("Caracteres ilegales");
            }


            if (newPassword.length < minLengthPassword || newPassword.length > maxLengthPassword) {
                console.log(`Longitud inválida del nuevo pass`);
                UserInputError("Nuevo password no válido");
            }

            const salt = await bcrypt.genSalt(10);
            const hashPassword = await bcrypt.hash(newPassword, salt);

            elUsuario.password = hashPassword;
            try {
                await elUsuario.save();
            } catch (error) {
                console.log(`Error guardando el usuario con el nuevo pass: ${error}`);
                ApolloError("Error conectando con la base de datos");
            }
            return true;

        },
        async resetearPasswordUsuario(_: any, { idUsuario }, context: contextoQuery) {
            if (!context.usuario) {
                AuthenticationError("Login necesario");
            }
            const usuario = context.usuario;

            console.log(`Solicitud de reset de password del usuario ${usuario.id}`);

            //Authorization
            const permisosEspeciales = ["superadministrador"];

            if (!usuario.permisos.some(p => permisosEspeciales.includes(p))) {
                console.log(`Sin permisos suficientes`);
                AuthenticationError("No autorizado");
            }

            try {
                var elUsuario: any = await Usuario.findById(idUsuario).exec();
                if (!elUsuario) throw "Usuario no encontrado";
            } catch (error) {
                console.log(`Error descargando el usuario: ${error}`);
                UserInputError("Datos inválidos");
            }

            const newPassword = "123456";
            //Validar nuevo pass

            if (charProhibidosPassword.test(newPassword)) {
                console.log(`El nuevo password contenía caracteres ilegales`);
                UserInputError("Caracteres ilegales");
            }


            if (newPassword.length < minLengthPassword || newPassword.length > maxLengthPassword) {
                console.log(`Longitud inválida del nuevo pass`);
                UserInputError("Nuevo password no válido");
            }

            const salt = await bcrypt.genSalt(10);
            const hashPassword = await bcrypt.hash(newPassword, salt);

            elUsuario.password = hashPassword;
            try {
                await elUsuario.save();
            } catch (error) {
                console.log(`Error guardando el usuario con el nuevo pass: ${error}`);
                ApolloError("Error conectando con la base de datos");
            }
            return true;

        },



    },
    Usuario: {
        edad: function (parent: any, _: any, __: any) {
            if (!parent.fechaNacimiento) {
                return 0;
            }
            let edad = Date.now() - parent.fechaNacimiento;
            console.log(`Usuario tiene edad: ${edad}`);
            let edadAños = Math.floor(edad / (60 * 60 * 24 * 365 * 1000));
            edadAños = parseInt(edadAños.toFixed());
            return edadAños;
        },
        nombre: function (parent: any, _: any, __: any) {
            return parent.username;
        },
        espacioActual: async function (parent: any, { dateActual }: any, __: any) {
            try {
                var losEspacios: any = await Espacio.find({ "iteracionesSemanales.idsAsistentesConstantes": parent.id }).exec();
            }
            catch (error) {
                ApolloError('Error conectando con la base de datos');
            }

            var stringFinal = "";
            for (const espacio of losEspacios) {
                if (stringFinal.length > 0) {
                    stringFinal += ", ";
                }
                stringFinal += espacio.nombre;
            }

            return stringFinal;

        }
    },
    ColeccionNodosAtlasConocimiento: {
        nodos: async function (parent: any, _: any, __: any) {
            // console.log(`Resolviendo nodos de coleccion con parent: ${parent}`);
            try {
                var losNodos: any = await Nodo.find({ _id: { $in: parent.idsNodos } }).exec();
            } catch (error) {
                console.log(`Error buscando los nodos de la coleccion ${parent.id}`);
            }
            if (!losNodos) losNodos = [];
            return losNodos;
        },
        progreso: async function (parent: any, _: any, __: any) {
            console.log('\x1b[35m%s\x1b[0m', `Calculando progreso de colección ${parent.nombre} en usuario ${parent.idUsuario}`);

            let nodosRed = await getNodosRedByOriginalIds(parent.idsNodos);



            for (const nodo of nodosRed) {

                if (nodosRed.length < 1) {
                    return 0;
                }
                try {
                    var elUsuario: any = await Usuario.findById(parent.idUsuario).exec();
                    if (!elUsuario) throw 'usuario no encontrado';
                }
                catch (error) {
                    console.log("Error getting usuario: " + error);
                    ApolloError('Error conectando con la base de datos');
                }
                let idsNodosRed = nodosRed.map(n => n.id);

                const nodosAprendidos = elUsuario.atlas.datosNodos.filter(dn => dn.aprendido).filter(dn => idsNodosRed.includes(dn.idNodo));
                const nodosFrescos = elUsuario.atlas.datosNodos.filter(dn => idsNodosRed.includes(dn.idNodo)).filter(dn => {
                    if (!dn.estudiado || !dn.diasRepaso) {
                        return false;
                    }

                    let tiempoLimite = (new Date(dn.estudiado).getTime() + dn.diasRepaso * 86400000);
                    if (tiempoLimite > Date.now()) {
                        return true;
                    }

                    return false;

                })
                let nodosProgreso = nodosAprendidos.concat(nodosFrescos.filter(n => !nodosAprendidos.map(n => n.id).includes(n.id)));

                console.log(`nodos en coleccion: ${nodosRed.length}`);
                console.log(`${nodosAprendidos.length} nodos aprendidos de la colección. Nodos frescos en la coleccion: ${nodosFrescos.length}`);
                console.table(nodosFrescos.map(n => { return { nombre: n.nombre } }));

                const progreso = (100 / nodosRed.length) * (nodosProgreso.length);

                return Number(progreso.toFixed(2));
            }
        },
        idsRed: async function (parent: any, _: any, __: any) {
            let nodosRed = await getNodosRedByOriginalIds(parent.idsNodos);
            return nodosRed.map(n => n.id);
        }
    },
    DatoNodoUsuario: {
        nombreNodo: async function (parent: any, _: any, __: any) {
            try {
                var elNodo: any = await Nodo.findById(parent.idNodo).select("nombre").exec();
                if (!elNodo) throw "Nodo no encontrado resolviendo nombre de dato nodo con id " + parent.idNodo
            } catch (error) {
                console.log(`error: ${error}`);
                return "";
            }

            return elNodo.nombre;
        },
        estadoAprendizaje(parent: any, _: any, __: any) {
            let estado = "NINGUNO"
            if (parent.aprendido) {
                return "APRENDIDO"
            }
            if (parent.estudiado) {
                if (parent.diasRepaso && parent.diasRepaso * 86400000 + (new Date(parent.estudiado)).getTime() < Date.now()) {
                    return "OLVIDADO"
                }
                return "ESTUDIADO"
            }

        },
    },
    InformeEstudianteMaestraVida: {
        nombreProfe: async function (parent: any) {
            try {
                var elProfe: any = await Usuario.findById(parent.idProfe).select("nombres apellidos").exec();
                if (!elProfe) throw "Profe no encontrado";
            } catch (error) {
                console.log(`Error buscando el nombre del profe de un informe: ${error}`);
                return "Error"
            }
            return elProfe.nombres + " " + elProfe.apellidos;
        }
    },
}

async function getNodosRedByOriginalIds(idsNodos) {
    let idsNodosActuales = idsNodos;

    let todosNodos: any[] = [];

    let guarda = 0;

    while (guarda < 100 && idsNodosActuales.length > 0) {
        guarda++;
        let estosNodos: any = [];
        try {
            estosNodos = await Nodo.find({ "_id": { $in: idsNodosActuales } }).exec();
        } catch (error) {
            console.log("Error buscando nodos: " + error);
            return [];
        }

        let nodosNuevos = estosNodos.filter(n => !todosNodos.map(tn => tn.id).includes(n.id));
        todosNodos.push(...nodosNuevos);
        idsNodosActuales = estosNodos.map(n => n.vinculos.filter(v => v.tipo === 'continuacion' && v.rol === 'target')).flat().map(v => v.idRef);
    }
    return todosNodos || [];

}

// Funcion que retira un idNodo de todas las colecciones y datos nodos de los usuarios.
export async function purgarIdNodo(idNodo) {

    let losUsuarios: any[] = [];

    try {
        losUsuarios = await Usuario.find({ $or: [{ "atlas.colecciones.idsNodos": idNodo }, { "atlas.datosNodos.idNodo": idNodo }] }).exec();
    } catch (error) {
        console.log("Error buscando usuarios con el idNodo necesario: " + error);
        return
    }
    console.log(`Encontrados ${losUsuarios.length} usuarios con el nodo ${idNodo} en sus datos Atlas`);

    for (let us of losUsuarios) {
        console.log(`Usuario ${us.nombres} analiza.`);
        // Eliminar idNodo de cada una de las colecciones que lo contenga.
        for (let col of us.atlas.colecciones) {
            if (!col.idsNodos.includes(idNodo)) {
                continue
            }
            console.log(`Sacando de ${col.nombre}`);

            col.idsNodos = col.idsNodos.filter(id => id != idNodo);
        }
        if (us.atlas?.datosNodos) {
            console.log("Elimina de sus datos nodos");
            us.atlas.datosNodos = us.atlas.datosNodos.filter(dn => dn.idNodo != idNodo);
        }


        try {
            us.save();
        } catch (error) {
            console.log("Error guardando un usuario después de retirar el id nodo");

        }
    }
}



// migrarPeriodoRepaso();
async function migrarPeriodoRepaso() {
    console.log("Migrando periodo repaso a dias repaso");
    let todosUsuarios: any;
    try {
        todosUsuarios = await Usuario.find({}).exec();
    } catch (error) {
        console.log("Error buscando usuarios: " + error);
        return;
    }

    for (var usuario of todosUsuarios) {
        let datosNodos = usuario.atlas.datosNodos;
        let datosNodosRelevantes = datosNodos.filter(dn => dn.periodoRepaso);

        for (var datoNodo of datosNodosRelevantes) {
            datoNodo.diasRepaso = datoNodo.periodoRepaso / 86400000;
        }

        try {
            await usuario.save();
            console.log(usuario.nombres + " " + usuario.apellidos + " migrado");
        } catch (error) {
            console.log("Error guardando usuario: " + error);

        }
    }
}

//migrarObjetivos();
async function migrarObjetivos() {
    console.log("Migrando objetivos de usuarios a una lista simple");
    let todosUsuarios: any;
    try {
        todosUsuarios = await Usuario.find({}).exec();
    }
    catch (error) {
        console.log("Error buscando usuarios: " + error);
        return;
    }

    for (var usuario of todosUsuarios) {
        let nodosObjetivo: any;

        try {
            nodosObjetivo = await ModeloNodoSolidaridad.find({ nodoParent: usuario.id }).exec();
        } catch (error) {
            console.log("Error buscando nodos objetivo de usuario " + usuario.nombres + " " + usuario.apellidos + ": " + error);
            continue;
        }

        let nombresObjetivo = nodosObjetivo.filter(n => n.nombre != 'Nuevo nodo de solidaridad').map(n => n.nombre);

        // console.table({usuario: usuario.nombres + " " + usuario.apellidos, objetivos: nombresObjetivo});

        usuario.objetivos = nombresObjetivo;

        try {
            await usuario.save();
            console.log(usuario.nombres + " " + usuario.apellidos + " migrado");
        }
        catch (error) {
            console.log("Error guardando usuario: " + error);

        }

    }

}

// Reset info de datos nodos y colecciones para que no contengan referencias a nodos eliminados.
async function resetInfoAtlas() {
    let todosUsuarios: any = [];
    try {
        todosUsuarios = await Usuario.find({}).exec();
    } catch (error) {
        console.log("Error descargando todos los usuarios." + error);
        return

    }

    for (let us of todosUsuarios) {
        //Check if deleted nodos en datosUsuario.
        let datosNodos = us.atlas.datosNodos;
        let nuevoDatosNodos: Array<any> = [];
        for (const dn of datosNodos) {
            let existe: Boolean = true;
            try {
                existe = await Nodo.countDocuments({ "_id": dn.idNodo }).exec() > 0;
            } catch (error) {
                console.log("Error contando nodos para ver si existen. " + error);
                return
            }
            if (existe) {
                nuevoDatosNodos.push(dn);
            }
            else {
                console.log(`Usuario ${us.nombres} tenia datos nodo de un nodo eliminado con id ${dn.idNodo}`);
            }
        }
        us.atlas.datosNodos = nuevoDatosNodos;

        // Revisando si colecciones con nodos eliminados.
        for (let col of us.atlas.colecciones) {
            let nuevoIdsNodos: string[] = [];
            for (const idN of col.idsNodos) {
                let existe: Boolean = true;
                try {
                    existe = await Nodo.countDocuments({ "_id": idN }).exec() > 0;
                } catch (error) {
                    console.log("Error contando nodos para ver si existen " + error);
                    return
                }
                if (existe) {
                    nuevoIdsNodos.push(idN);

                }
                else {
                    console.log(`El usuario ${us.nombres} tenía en la colección ${col.nombre} a un nodo eliminado con id ${idN}`);
                }
            }
            col.idsNodos = nuevoIdsNodos;
        }
        try {
            await us.save();
        } catch (error) {
            console.log("Error guardando usuario: " + error);
            return;
        }
    }
}

resetInfoAtlas();
