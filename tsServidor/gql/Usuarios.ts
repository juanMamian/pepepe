import { ApolloError, AuthenticationError, gql, UserInputError, withFilter } from "apollo-server-express";
// import { ModeloUsuario as Usuario, permisosDeUsuario,  validarDatosUsuario} from "../model/Usuario"
import { ModeloUsuario as Usuario, permisosDeUsuario, validarDatosUsuario, charProhibidosNombresUsuario, charProhibidosUsername, minLengthNombresUsuario, minLengthApellidosUsuario, minLengthUsername, minLengthEmail, minLengthPassword, maxLengthPassword, charProhibidosPassword, emailValidator } from "../model/Usuario"

import { GraphQLDateTime } from "graphql-iso-date";
import { ModeloGrupoEstudiantil as GrupoEstudiantil } from "../model/actividadesProfes/GrupoEstudiantil";
import { contextoQuery } from "./tsObjetos"
import { ModeloNodo as Nodo } from "../model/atlas/Nodo";
import { create } from "domain";
const jwt = require("jsonwebtoken");

const bcrypt = require("bcryptjs");


interface Usuario {
    username: string,
    permisos: Array<string>,
    id: string
}


interface InterfacePayloadNuevaNotificacion {
    idNotificado: string,
    nuevaNotificacion: any
}


export const typeDefs = gql`
    scalar Date   

    type MinimoCausante{
        id:ID,
        tipo:String,
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

    type Notificacion{
        id:ID,
        texto:String,
        causante:MinimoCausante,
        elementoTarget: MinimoElemento,
        fecha:Date
    }  

    type DatoNodoUsuario{
        id: ID,
        idNodo:ID,
        nombreNodo: String,
        objetivo:Boolean,
        aprendido:Boolean,
        estudiado: Date,
        iteracionesRepaso: [IteracionRepasoNodoConocimiento]
    }

    type ColeccionNodosAtlasConocimiento{
        id:ID,
        nombre: String,
        idsNodos: [ID],
        nodos:[NodoConocimiento],
    }

    type IteracionRepasoNodoConocimiento{
        id: ID,
        intervalo: Float,
    }    

    type InfoAtlas{
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
        OBJETIVO
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
        atlas:InfoAtlas,        
        atlasSolidaridad:InfoAtlasSolidaridad,
        responsables:[String],
        responsablesAmplio:[String],
        administradores:[String],
        permisos:[String]
        idGrupoEstudiantil:String,       
        nombreGrupoEstudiantil:String,
        notificaciones:[Notificacion],
        notificacionesActividadForos:[NotificacionActividadForos],
        foros:[InfoForosUsuario],
        coords:Coords,
        vinculos:[VinculoNodoSolidaridad],
        fuerzaColision: FuerzaPolar,
       fuerzaCentroMasa: FuerzaPolar,
       nombre:String,

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
        id: ID,
        username:String, 
        nombres:String,
        apellidos:String,
        email:String,
        numeroTel:String,
        permisos:[String],
        lugarResidencia:String,
        edad:Int,
        idGrupoEstudiantil:String,       
        nombreGrupoEstudiantil:String,
    }

    extend type Query {
        todosUsuarios:[PublicUsuario],
        usuariosProfe:[PublicUsuario],
        yo:Usuario,
        publicUsuario(idUsuario:ID!): PublicUsuario,
        buscarPersonas(textoBuscar:String!):[Usuario]

        login(username: String!, password:String!):String,
        alienarUsuario(idAlienado: ID!):String!,
    }
    extend type Mutation{
        setCentroVista(idUsuario:ID, centroVista: CoordsInput):Boolean,
        editarDatosUsuario(nuevosDatos: DatosEditablesUsuario):Usuario,
        addPermisoUsuario(nuevoPermiso:String!, idUsuario:ID!):Usuario,  
        eliminarUsuario(idUsuario:ID!):Boolean,
        eliminarNotificacion(idNotificacion:ID!):Boolean,
        eliminarNotificacionActividadForos(idParent:ID!):Boolean,
        setNodoObjetivo(idNodo:ID!, nuevoEstadoObjetivo:Boolean):Boolean
        setNodoAtlasAprendidoUsuario(idNodo:ID!, nuevoEstadoAprendido:Boolean):[DatoNodoUsuario]        
        setNodoAtlasTarget(idNodo:ID!):Boolean,
        nulificarNodoTargetUsuarioAtlas:Boolean,
        setModoUsuarioAtlas(idUsuario:ID!, nuevoModo:String!):Usuario,

        asignarPermisoTodosUsuarios(nuevoPermiso:String!):Boolean,
        togglePermisoUsuario(permiso:String!, idUsuario:ID!):PublicUsuario,

        setPlegarNodoSolidaridadUsuario(idNodo:ID!):Usuario,

        crearColeccionNodosAtlasConocimientoUsuario:Usuario,
        eliminarColeccionNodosAtlasConocimientoUsuario(idColeccion:ID!):Usuario,
        setNombreColeccionNodosAtlasConocimientoUsuario(idColeccion:ID!, nuevoNombre:String!):Usuario,
        addNodoColeccionNodosAtlasConocimientoUsuario(idColeccion:ID!, idNuevoNodo:ID!):ColeccionNodosAtlasConocimiento,
        removeNodoColeccionNodosAtlasConocimientoUsuario(idColeccion:ID!, idNodo:ID!):ColeccionNodosAtlasConocimiento,
        toggleNodoColeccionNodosAtlasConocimientoUsuario(idColeccion:ID!, idNodo:ID!, idUsuario:ID!):ColeccionNodosAtlasConocimiento,
        
        crearIteracionRepasoNodoConocimientoUsuario(idUsuario: ID!, idNodo: ID!, intervalo: Int):DatoNodoUsuario,
        eliminarIteracionRepaso(idUsuario: ID!, idNodo: ID!, idIteracion:ID!):Boolean,
        setIntervaloIteracionRepaso(idUsuario: ID!, idNodo: ID!, idIteracion:ID!, nuevoIntervalo:Float!):IteracionRepasoNodoConocimiento,

        setDateNodoConocimientoEstudiadoUsuario(idUsuario: ID!, idNodo: ID!, fecha:Date!):DatoNodoUsuario,

        setCoordsVistaAtlasSolidaridadUsuario(coords:CoordsInput):Boolean,
        setNodoSolidaridadAsCoordsVistaUsuario(idNodo:ID!):Boolean,
        setNodosSolidaridadDesplegadosUsuario(idsNodos:[ID!]):Boolean,

        cambiarPassword(dizqueCurrentPassword: String!, newPassword: String!) :Boolean,
        resetearPasswordUsuario(idUsuario:ID!):Boolean,


    }
    extend type Subscription{
        nuevaNotificacion:Notificacion
    }

`

export const NUEVA_NOTIFICACION_PERSONAL = "nueva_notificacion_personal";

export const resolvers = {
    Subscription: {
        nuevaNotificacion: {
            subscribe: withFilter(
                (_: any, __: any, contexto: contextoQuery) => {
                    console.log(`--------------------------Creando una subscripción a notificaciones personales de ${contexto.usuario.username}`);

                    return contexto.pubsub.asyncIterator(NUEVA_NOTIFICACION_PERSONAL)
                },
                (payloadNuevaNotificacion: InterfacePayloadNuevaNotificacion, variables, contexto: contextoQuery) => {
                    console.log(`Decidiendo si notificar a ${contexto.usuario.id} con idNotificado=${payloadNuevaNotificacion.idNotificado}`);
                    if (payloadNuevaNotificacion.idNotificado != contexto.usuario.id) {
                        return false;
                    }
                    console.log(`Nueva notificacion personal para ${contexto.usuario.username}`);
                    return true;
                }
            )
        }
    },
    Query: {
        usuariosProfe: async function (_: any, args: any, context: contextoQuery) {
            console.log(`Fetching la lista de todos los profes`);
            try {
                var profes = await Usuario.find({ permisos: "actividadesEstudiantiles-profe" }).exec();
            } catch (error) {
                console.log(`Error buscando profes en la base de datos`);
                throw new ApolloError("Error conectando con la base de datos");
            }
            return profes;
        },
        todosUsuarios: async function (_: any, args: any, context: contextoQuery) {
            console.log(`Solicitud de la lista de todos los usuarios`);

            try {
                var todosUsuarios = await Usuario.find({}).select("nombres apellidos permisos fechaNacimiento email username numeroTel email").exec();
            }
            catch (error) {
                console.log("Error fetching la lista de usuarios de la base de datos. E: " + error);
                throw new ApolloError("Error de conexión a la base de datos");
            }
            console.log(`Enviando lista de todos los usuarios`);
            return todosUsuarios;
        },
        publicUsuario: async function (_: any, { idUsuario }: any, context: contextoQuery) {
            try {
                var elUsuario: any = await Usuario.findById(idUsuario).exec();
            } catch (error) {
                console.log(`error buscando usuario con id ${idUsuario} en la base de datos`);
                throw new ApolloError("Error buscando usuario");
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
                throw new ApolloError("Error accediendo a los datos de usuario");
            }
            return elUsuario;
        },
        buscarPersonas: async function (_: any, { textoBuscar }: any, context: contextoQuery) {
            console.log(`Solicitud de la lista de todos los usuarios`);
            textoBuscar = textoBuscar.trim();
            textoBuscar = new RegExp(textoBuscar, "i");

            try {
                var todosUsuarios = await Usuario.find({}).select("nombres apellidos permisos fechaNacimiento email username numeroTel email").exec();
            }
            catch (error) {
                console.log("Error fetching la lista de usuarios de la base de datos. E: " + error);
                throw new ApolloError("Error de conexión a la base de datos");
            }

            var usuariosMatch = todosUsuarios.filter((u: any) => (u.nombres + u.apellidos).search(textoBuscar) > -1);
            console.log(`Enviando lista de matchs de los usuarios: ${usuariosMatch.length}`);
            return usuariosMatch;
        },
        login: async function (_: any, { username, password }: any, context: contextoQuery) {
            let credencialesUsuario = context.usuario;

            username = username.trim();
            if (charProhibidosUsername.test(username)) {
                console.log(`Username inválido`);
                throw new UserInputError("Datos inválidos");
            }

            try {
                var elUsuario: any = await Usuario.findOne({ username }, "username password permisos").exec();
            } catch (error) {
                console.log(`Error buscando el usuario en la base de datos. E: ${error}`);
                throw new ApolloError("Error conectando con la base de datos");

            }
            const correctLogin = await bcrypt.compare(password, elUsuario.password);
            if (!correctLogin) {
                console.log(`Contraseña errada. Rechazando`);
                throw new UserInputError("Datos incorrectos");
            }

            console.log(`login correcto de ${username}. Enviando JWT`);
            const datosToken = {
                id: elUsuario._id,
                permisos: elUsuario.permisos,
                username: elUsuario.username,
                version: 1,
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
                throw new AuthenticationError("Login requerido");
            }

            const credencialesUsuario = context.usuario;



            const permisosEspeciales = ["superadministrador", "maestraVida-profesor"];
            const permisosNoAlienables = ["superadministrador", "maestraVida-profesor", "atlasAdministrador"];

            if (!credencialesUsuario.permisos.some(p => permisosEspeciales.includes(p))) {
                throw new AuthenticationError("No autorizado");
            }

            try {
                var elUsuario: any = await Usuario.findById(idAlienado, "username password permisos").exec();
            } catch (error) {
                console.log(`Error buscando el usuario en la base de datos. E: ${error}`);
                throw new ApolloError("Error conectando con la base de datos");
            }

            if (elUsuario.permisos.some(p => permisosNoAlienables.includes(p))) {
                console.log(`El usuario no podía ser alienado`);
                throw new UserInputError("No permitido");
            }

            const datosToken = {
                id: elUsuario._id,
                permisos: elUsuario.permisos,
                username: elUsuario.username,
                version: 1,
            }
            const token = jwt.sign(datosToken, process.env.JWT_SECRET,);

            return token;
        },


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
                var elUsuario: any = await Usuario.findById(credencialesUsuario.id).exec();
                if (!elUsuario) {
                    throw "Usuario no encontrado"
                }
            }
            catch (error) {
                console.log("Error buscando el usuario en la base de datos. E: " + error);
                throw new ApolloError("Error conectando con la base de datos");
            }

            let errores: Array<string> = validarDatosUsuario(nuevosDatos);

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
            console.log(`Seting centro vista en ${JSON.stringify(centroVista)} para el usuario ${idUsuario}`);
            try {
                var elUsuario: any = await Usuario.findById(idUsuario, "atlas").exec();
                if (!elUsuario) {
                    throw "Error recopilando datos";
                }
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
            console.log(`Set`);
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
                throw new ApolloError("Error conectando con la base de datos");
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
                throw new AuthenticationError("No autorizado");
            }

            let permisosValidos = ["superadministrador"];

            if (!credencialesUsuario.permisos.some(p => permisosValidos.includes(p))) {
                console.log(`Usuario no tiene permisos válidos`);
                throw new AuthenticationError("No autorizado");
            }

            try {
                let elEliminado: any = await Usuario.findByIdAndDelete(idUsuario).exec();
                if (!elEliminado) {
                    throw "Usuario no encontrado";
                }
                console.log(`Eliminado ${elEliminado.username}`);
            } catch (error) {
                console.log(`Error eliminando usuario. E: ${error}`);
                throw new AuthenticationError("Error conectando con la base de datos");
            }
            return true;


        },
        eliminarNotificacion: async function (_: any, { idNotificacion }, contexto: contextoQuery) {
            console.log(`|||||||||||||||||||||1`);
            console.log(`Peticion de eliminar una notificacion con id ${idNotificacion}`);
            //Authorización
            let credencialesUsuario = contexto.usuario;
            if (credencialesUsuario.permisos.length < 1) {
                console.log(`El usuario no estaba logeado`);
                throw new AuthenticationError("No autorizado");
            }

            try {
                await Usuario.findByIdAndUpdate(credencialesUsuario.id, { $pull: { notificaciones: { _id: idNotificacion } } }).exec();
            } catch (error) {
                console.log(`Error eliminando la notificacion de la base de datos. E: ${error}`);
                throw new ApolloError("Error conectando con la base de datos");
            }
            console.log(`Notificacion eliminada`);
            return true;
        },
        eliminarNotificacionActividadForos: async function (_: any, { idParent }, contexto: contextoQuery) {
            console.log(`|||||||||||||||||||||1`);
            console.log(`Peticion de eliminar una notificacion de actividad en foros con id ${idParent}`);
            //Authorización
            let credencialesUsuario = contexto.usuario;
            if (credencialesUsuario.permisos.length < 1) {
                console.log(`El usuario no estaba logeado`);
                throw new AuthenticationError("No autorizado");
            }

            try {
                await Usuario.findByIdAndUpdate(credencialesUsuario.id, { $pull: { notificacionesActividadForos: { idParent: idParent } } }).exec();
            } catch (error) {
                console.log(`Error eliminando la notificacion de la base de datos. E: ${error}`);
                throw new ApolloError("Error conectando con la base de datos");
            }
            console.log(`Notificacion eliminada`);
            return true;
        },
        setNodoObjetivo: async function (_: any, { idNodo, nuevoEstadoObjetivo }: any, contexto: contextoQuery) {
            let credencialesUsuario = contexto.usuario;
            if (!credencialesUsuario || !credencialesUsuario.id) {
                throw new AuthenticationError("No autenticado");
            }

            console.log(`Seting nodo objetivo de ${idNodo} en ${nuevoEstadoObjetivo} para el usuario ${credencialesUsuario.id}`);

            try {
                var elUsuario: any = await Usuario.findById(credencialesUsuario.id).exec();
                var indexN = elUsuario.atlas.datosNodos.findIndex(n => n.idNodo == idNodo);
                if (indexN > -1) {
                    elUsuario.atlas.datosNodos[indexN].objetivo = nuevoEstadoObjetivo;
                }
                else {
                    elUsuario.atlas.datosNodos.push({
                        idNodo,
                        objetivo: nuevoEstadoObjetivo
                    });
                }
                await elUsuario.save();
                return true;
            } catch (error) {
                console.log(`error guardando usuario en la base de datos: ${error}`);
                throw new ApolloError("");
            }

        },
        setNodoAtlasAprendidoUsuario: async function (_: any, { idNodo, nuevoEstadoAprendido }: any, contexto: contextoQuery) {
            let credencialesUsuario = contexto.usuario;
            if (!credencialesUsuario || !credencialesUsuario.id) {
                throw new AuthenticationError("No autenticado");
            }

            console.log('\x1b[35m%s\x1b[0m', `Seting nodo ${idNodo} en estado de aprendido ${nuevoEstadoAprendido} para el usuario ${credencialesUsuario.id}`);

            try {
                var elUsuario: any = await Usuario.findById(credencialesUsuario.id).exec();

            } catch (error) {
                console.log(`error buscando usuario en la base de datos: ${error}`);
                throw new ApolloError("");
            }
            var todosNodosAfectados: Array<any> = [];
            var tipoRol = null;
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
                    throw new ApolloError("Error ejecutando operación");
                }
                console.log(`Encontrados ${currentNodos.length} nodos current`);
                todosNodosAfectados.push(...currentNodos);
                currentIds = currentNodos.reduce((acc, nodo) => acc.concat(nodo.vinculos.filter(v => v.tipo === 'requiere' && v.rol === tipoRol).map(v => v.idRef)), []);
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
                throw new ApolloError("");
            }
            return elUsuario.atlas.datosNodos.filter(dn=>idsNodosAfectados.includes(dn.idNodo));

        },
        setNodoAtlasTarget: async function (_: any, { idNodo }: any, contexto: contextoQuery) {
            let credencialesUsuario = contexto.usuario;
            if (!credencialesUsuario || !credencialesUsuario.id) {
                throw new AuthenticationError("No autenticado");
            }

            console.log(`Seting nodo ${idNodo} como target para el usuario ${credencialesUsuario.id}`);

            try {
                var elUsuario: any = await Usuario.findById(credencialesUsuario.id).exec();
                elUsuario.atlas.idNodoTarget = idNodo;
                await elUsuario.save();
            } catch (error) {
                console.log(`error guardando usuario en la base de datos: ${error}`);
                throw new ApolloError("");
            }

            return true;

        },
        nulificarNodoTargetUsuarioAtlas: async function (_: any, __: any, contexto: contextoQuery) {
            let credencialesUsuario = contexto.usuario;
            if (!credencialesUsuario || !credencialesUsuario.id) {
                throw new AuthenticationError("No autenticado");
            }

            console.log(`Seting nodo target null para el usuario ${credencialesUsuario.id}`);

            try {
                var elUsuario: any = await Usuario.findById(credencialesUsuario.id).exec();
                elUsuario.atlas.idNodoTarget = null;
                await elUsuario.save();
            } catch (error) {
                console.log(`error guardando usuario en la base de datos: ${error}`);
                throw new ApolloError("");
            }
            return true;
        },
        setModoUsuarioAtlas: async function (_: any, { idUsuario, nuevoModo }: any, contexto: contextoQuery) {
            let credencialesUsuario = contexto.usuario;
            if (!credencialesUsuario || !credencialesUsuario.id) {
                throw new AuthenticationError("No autenticado");
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
                throw new ApolloError("");
            }

            return elUsuario;

        },

        async asignarPermisoTodosUsuarios(_: any, { nuevoPermiso }: any, contexto: contextoQuery) {
            const credencialesUsuario = contexto.usuario;
            const permisosAutorizados = ["superadministrador"];

            if (!credencialesUsuario.permisos.some(async (p) => permisosAutorizados.includes(p))) {
                console.log(`El usuario no tenía los permisos correctos`);
                throw new AuthenticationError("No autorizado");
            }

            try {
                var losUsuarios: any = await Usuario.find({}).exec();
            } catch (error) {
                console.log(`Error buscando los usuarios: ${error}`);
                throw new ApolloError("Error conectando con la base de datos");
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
                    throw new ApolloError("Error conectando con la base de datos");
                }
            });

            return true;



        },
        async togglePermisoUsuario(_: any, { permiso, idUsuario }: any, contexto: contextoQuery) {
            const credencialesUsuario = contexto.usuario;
            const permisosAutorizados = ["superadministrador"];

            if (!credencialesUsuario.permisos.some(async (p) => permisosAutorizados.includes(p))) {
                console.log(`El usuario no tenía los permisos correctos`);
                throw new AuthenticationError("No autorizado");
            }

            try {
                var elUsuario: any = await Usuario.findById(idUsuario).exec();
                if (!elUsuario) throw "Usuario no encontrado";
            } catch (error) {
                console.log(`Error buscando el usuario: ${error}`);
                throw new ApolloError("Error conectando con la base de datos");
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
                throw new ApolloError("Error conectando con la base de datos");
            }

            return elUsuario;


        },

        async setPlegarNodoSolidaridadUsuario(_: any, { idNodo }: any, contexto: contextoQuery) {
            const credencialesUsuario = contexto.usuario;
            const idUsuario = credencialesUsuario.id;
            try {
                var elUsuario: any = await Usuario.findById(idUsuario).exec();
                if (!elUsuario) throw "Usuario no encontrado";
            } catch (error) {
                console.log(`Error buscando el usuario: ${error}`);
                throw new ApolloError("Error conectando con la base de datos");
            }

            const indexN = elUsuario.atlasSolidaridad.idsNodosPlegados.indexOf(idNodo);

            if (indexN > -1) {
                elUsuario.atlasSolidaridad.idsNodosPlegados.splice(indexN, 1);
            }
            else {
                elUsuario.atlasSolidaridad.idsNodosPlegados.push(idNodo)
            }

            try {
                await elUsuario.save();
            } catch (error) {
                console.log(`Error guardando el usuario`);
                throw new ApolloError("Error conectando con la base de datos");
            }

            return elUsuario;
        },

        async crearColeccionNodosAtlasConocimientoUsuario(_: any, __: any, contexto: contextoQuery) {
            const credencialesUsuario = contexto.usuario;

            if (!credencialesUsuario.id) {
                console.log(`Error: no hay id en las credenciales de usuario`);
                throw new AuthenticationError("No logeado");
            }

            try {
                var elUsuario: any = await Usuario.findById(credencialesUsuario.id).exec();
                if (!elUsuario) {
                    throw "Usuario no encontrado";
                }
            } catch (error) {
                console.log(`Error buscando el usuario en la base de datos`);
                throw new ApolloError("Usuario no encontrado");
            }

            var nuevaColeccion = elUsuario.atlas.colecciones.create();
            elUsuario.atlas.colecciones.push(nuevaColeccion);

            try {
                await elUsuario.save();
            } catch (error) {
                console.log(`Error guardando la colección en la base de datos`);
                throw new ApolloError("Error conectando con la base de datos");
            }

            return elUsuario;

        },
        async eliminarColeccionNodosAtlasConocimientoUsuario(_: any, { idColeccion }: any, contexto: contextoQuery) {
            const credencialesUsuario = contexto.usuario;

            if (!credencialesUsuario.id) {
                console.log(`Error: no hay id en las credenciales de usuario`);
                throw new AuthenticationError("No logeado");
            }

            try {
                var elUsuario: any = await Usuario.findById(credencialesUsuario.id).exec();
                if (!elUsuario) {
                    throw "Usuario no encontrado";
                }
            } catch (error) {
                console.log(`Error buscando el usuario en la base de datos`);
                throw new ApolloError("Usuario no encontrado");
            }

            const indexC = elUsuario.atlas.colecciones.findIndex(c => c.id === idColeccion);

            if (indexC > -1) {
                elUsuario.atlas.colecciones.splice(indexC, 1);
            }
            else {
                throw new UserInputError("Colección no encontrada");
            }

            try {
                await elUsuario.save();
            } catch (error) {
                console.log(`Error guardando la colección en la base de datos`);
                throw new ApolloError("Error conectando con la base de datos");
            }

            return elUsuario;

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
                throw new ApolloError("Usuario no encontrado");
            }

            nuevoNombre = nuevoNombre.trim();
            const charProhibidosNombreColeccion = /[^ a-zA-ZÀ-ž0-9_():.,-]/;
            if (charProhibidosNombreColeccion.test(nuevoNombre)) {
                throw new UserInputError("Nombre ilegal");
            }

            const indexC = elUsuario.atlas.colecciones.findIndex(c => c.id === idColeccion);

            if (indexC > -1) {
                elUsuario.atlas.colecciones[indexC].nombre = nuevoNombre;
            }
            else {
                throw new UserInputError("Colección no encontrada");
            }

            try {
                await elUsuario.save();
            } catch (error) {
                console.log(`Error guardando los datos del usuario`);
                throw new ApolloError("Error conectando con la base de datos");
            }

            return elUsuario;

        },
        async addNodoColeccionNodosAtlasConocimientoUsuario(_: any, { idColeccion, idNuevoNodo }: any, contexto: contextoQuery) {
            const credencialesUsuario = contexto.usuario;

            try {
                var elUsuario: any = await Usuario.findById(credencialesUsuario.id).exec();
                if (!elUsuario) {
                    throw "Usuario no encontrado";
                }
            } catch (error) {
                console.log(`Error buscando el usuario`);
                throw new ApolloError("Usuario no encontrado");
            }

            var laColeccion = elUsuario.atlas.colecciones.id(idColeccion);
            if (!laColeccion) {
                console.log(`Coleccion no encontrada`);
                throw new UserInputError("Colección no encontrada");
            }

            var indexN = laColeccion.idsNodos.indexOf(idNuevoNodo);
            if (indexN === -1) {
                laColeccion.idsNodos.push(idNuevoNodo);
            }
            else {
                throw new UserInputError("Nodo ya existía en la colección");
            }

            try {
                await elUsuario.save();
            } catch (error) {
                throw new ApolloError("Error guardando datos de usuario en la base de datos");
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
                throw new ApolloError("Usuario no encontrado");
            }

            var laColeccion = elUsuario.atlas.colecciones.id(idColeccion);
            if (!laColeccion) {
                console.log(`Coleccion no encontrada`);
                throw new UserInputError("Colección no encontrada");
            }

            var indexN = laColeccion.idsNodos.indexOf(idNodo);
            if (indexN > -1) {
                laColeccion.idsNodos.splice(indexN, 1);
            }
            else {
                throw new UserInputError("Nodo no existía en la colección")
            }

            try {
                await elUsuario.save();
            } catch (error) {
                throw new ApolloError("Error guardando datos de usuario en la base de datos");
            }

            return laColeccion;
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
                throw new ApolloError("Usuario no encontrado");
            }

            //Autorizacion
            const permisosEspeciales = ["superadministrador"];
            if (!permisosEspeciales.some(p => credencialesUsuario.permisos.includes(p)) && credencialesUsuario.id != idUsuario) {
                console.log(`No autorizado`);
                throw new AuthenticationError("No autorizado");
            }

            var laColeccion = elUsuario.atlas.colecciones.id(idColeccion);
            if (!laColeccion) {
                console.log(`Coleccion no encontrada`);
                throw new UserInputError("Colección no encontrada");
            }

            const indexN = laColeccion.idsNodos.indexOf(idNodo);
            if (indexN === -1) {
                laColeccion.idsNodos.push(idNodo);
            }
            else {
                laColeccion.idsNodos.splice(indexN, 1);
            }

            try {
                await elUsuario.save();
            } catch (error) {
                throw new ApolloError("Error guardando datos de usuario en la base de datos");
            }

            return laColeccion;
        },

        async crearIteracionRepasoNodoConocimientoUsuario(_: any, { idUsuario, idNodo, intervalo }: any, contexto: contextoQuery) {
            console.log('\x1b[35m%s\x1b[0m', `Mutation for crear iteracion de repaso para nodo ${idNodo} con intervalo ${intervalo}`);

            if (!contexto.usuario) {
                console.log(`No había credenciales`);
                throw new AuthenticationError("Login requerido");
            }
            const credencialesUsuario = contexto.usuario;

            try {
                var elUsuario: any = await Usuario.findById(idUsuario).exec();
                if (!elUsuario) {
                    throw "Usuario no encontrado";
                }
            } catch (error) {
                console.log(`Error buscando el usuario en la base de datos`);
                throw new ApolloError("Usuario no encontrado");
            }

            //Authentication

            const permisosEspeciales = ["superadministrador"];
            if (credencialesUsuario.id != idUsuario && !credencialesUsuario.permisos.some(p => permisosEspeciales.includes(p))) {
                throw new AuthenticationError("No autorizado");
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
                throw new ApolloError("Error conectando con la base de datos");
            }
            console.log(`Creado`);
            return elDatoNodo;

        },
        async eliminarIteracionRepaso(_: any, { idUsuario, idNodo, idIteracion }: any, contexto: contextoQuery) {
            console.log('\x1b[35m%s\x1b[0m', `Query for eliminar iteracion de repaso con id ${idIteracion} del nodo ${idNodo} del usuario ${idUsuario}`);

            if (!contexto.usuario) {
                console.log(`No había credenciales`);
                throw new AuthenticationError("Login requerido");
            }
            const credencialesUsuario = contexto.usuario;

            try {
                var elUsuario: any = await Usuario.findById(idUsuario).exec();
                if (!elUsuario) {
                    throw "Usuario no encontrado";
                }
            } catch (error) {
                console.log(`Error buscando el usuario en la base de datos`);
                throw new ApolloError("Usuario no encontrado");
            }

            //Authentication

            const permisosEspeciales = ["superadministrador"];
            if (credencialesUsuario.id != idUsuario && !credencialesUsuario.permisos.some(p => permisosEspeciales.includes(p))) {
                throw new AuthenticationError("No autorizado");
            }

            var elDatoNodo = elUsuario.atlas.datosNodos.find(dn => dn.idNodo === idNodo);
            if (!elDatoNodo) {
                console.log(`Dato nodo no encontrado`);
                throw new UserInputError("Datos inválidos");
            }

            const indexI = elDatoNodo.iteracionesRepaso.findIndex(i => i.id === idIteracion);

            if (indexI > -1) {
                elDatoNodo.iteracionesRepaso.splice(indexI, 1);
            }
            else {
                throw new UserInputError("Iteración no existía");
            }

            try {
                await elUsuario.save();
            } catch (error) {
                console.log(`Error guardando el usuario en la base de datos: ${error}`);
                throw new ApolloError("Error conectando con la base de datos");
            }


            return true;
        },
        async setIntervaloIteracionRepaso(_: any, { idUsuario, idNodo, idIteracion, nuevoIntervalo }: any, contexto: contextoQuery) {
            console.log('\x1b[35m%s\x1b[0m', `Query for set intervalo de iteracionRepaso con id ${idIteracion} del nodo ${idNodo} del usuario ${idUsuario} en valor ${nuevoIntervalo}`);

            if (!contexto.usuario) {
                console.log(`No había credenciales`);
                throw new AuthenticationError("Login requerido");
            }
            const credencialesUsuario = contexto.usuario;

            try {
                var elUsuario: any = await Usuario.findById(idUsuario).exec();
                if (!elUsuario) {
                    throw "Usuario no encontrado";
                }
            } catch (error) {
                console.log(`Error buscando el usuario en la base de datos`);
                throw new ApolloError("Usuario no encontrado");
            }

            //Authentication

            const permisosEspeciales = ["superadministrador"];
            if (credencialesUsuario.id != idUsuario && !credencialesUsuario.permisos.some(p => permisosEspeciales.includes(p))) {
                throw new AuthenticationError("No autorizado");
            }

            var elDatoNodo = elUsuario.atlas.datosNodos.find(dn => dn.idNodo === idNodo);
            if (!elDatoNodo) {
                throw new UserInputError("Datos de nodo no encontrados");
            }

            var laIteracion = elDatoNodo.iteracionesRepaso.find(i => i.id === idIteracion);
            if (!laIteracion) {
                throw new UserInputError("Iteracion no encontrado");
            }

            laIteracion.intervalo = nuevoIntervalo;
            try {
                await elUsuario.save();
            } catch (error) {
                console.log(`Error guardando el usuario en la base de datos: ${error}`);
                throw new ApolloError("Error conectando con la base de datos");
            }

            return laIteracion;
        },

        async setDateNodoConocimientoEstudiadoUsuario(_: any, { idUsuario, idNodo, fecha }: any, contexto: contextoQuery) {
            console.log('\x1b[35m%s\x1b[0m', `Query for set nodo ${idNodo} estudiado en ${fecha} por el usuario ${idUsuario}`);

            if (!contexto.usuario) {
                console.log(`No había credenciales`);
                throw new AuthenticationError("Login requerido");
            }
            const credencialesUsuario = contexto.usuario;

            try {
                var elUsuario: any = await Usuario.findById(idUsuario).exec();
                if (!elUsuario) {
                    throw "Usuario no encontrado";
                }
            } catch (error) {
                console.log(`Error buscando el usuario en la base de datos`);
                throw new ApolloError("Usuario no encontrado");
            }

            //Authentication

            const permisosEspeciales = ["superadministrador"];
            if (credencialesUsuario.id != idUsuario && !credencialesUsuario.permisos.some(p => permisosEspeciales.includes(p))) {
                throw new AuthenticationError("No autorizado");
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


            try {
                await elUsuario.save();
            } catch (error) {
                console.log(`Error guardando el usuario en la base de datos: ${error}`);
                throw new ApolloError("Error conectando con la base de datos");
            }

            return elDatoNodo;
        },


        async setCoordsVistaAtlasSolidaridadUsuario(_: any, { coords }: any, contexto: contextoQuery) {
            const credencialesUsuario = contexto.usuario;

            if (!credencialesUsuario.id) {
                throw new AuthenticationError("No Autenticado");
            }

            try {
                var elUsuario: any = await Usuario.findById(credencialesUsuario.id).exec();
            } catch (error) {
                console.log(`Error buscando el usuario`);
                throw new ApolloError("Usuario no encontrado");
            }
            elUsuario.atlasSolidaridad.coordsVista = coords;

            try {
                await elUsuario.save();
            } catch (error) {
                console.log(`Error guardando el usuario con el nuevo coords de centroVista`);
                throw new ApolloError("Error conectando con la base de datos");
            }

            console.log(`Nuevo coords vista en atlas solidaridad setted en ${JSON.stringify(coords)}`);
            return true;
        },
        async setNodosSolidaridadDesplegadosUsuario(_: any, { idsNodos }: any, contexto: contextoQuery) {
            const credencialesUsuario = contexto.usuario;
            if (!credencialesUsuario) {
                throw new AuthenticationError("No autorizardo")
            }
            const idUsuario = credencialesUsuario.id;
            try {
                var elUsuario: any = await Usuario.findById(idUsuario).exec();
                if (!elUsuario) throw "Usuario no encontrado";
            } catch (error) {
                console.log(`Error buscando el usuario: ${error}`);
                throw new ApolloError("Error conectando con la base de datos");
            }

            elUsuario.atlasSolidaridad.idsNodosDesplegados = idsNodos;

            try {
                await elUsuario.save();
            } catch (error) {
                console.log(`Error guardando el usuario`);
                throw new ApolloError("Error conectando con la base de datos");
            }

            return true;
        },

        async cambiarPassword(_: any, { dizqueCurrentPassword, newPassword }, context: contextoQuery) {
            if (!context.usuario) {
                throw new AuthenticationError("Login necesario");
            }
            const usuario = context.usuario;

            console.log(`Solicitud de cambio de password del usuario ${usuario.id}`);

            try {
                var elUsuario: any = await Usuario.findById(usuario.id).exec();
                if (!elUsuario) throw "Usuario no encontrado";
            } catch (error) {
                console.log(`Error descargando el usuario: ${error}`);
                throw new UserInputError("Datos inválidos");
            }

            //Validar currentPass

            if (!await bcrypt.compare(dizqueCurrentPassword, elUsuario.password)) {
                throw new UserInputError("Datos inválidos");
            }

            //Validar nuevo pass

            if (charProhibidosPassword.test(newPassword)) {
                console.log(`El nuevo password contenía caracteres ilegales`);
                throw new UserInputError("Caracteres ilegales");
            }


            if (newPassword.length < minLengthPassword || newPassword.length > maxLengthPassword) {
                console.log(`Longitud inválida del nuevo pass`);
                throw new UserInputError("Nuevo password no válido");
            }

            const salt = await bcrypt.genSalt(10);
            const hashPassword = await bcrypt.hash(newPassword, salt);

            elUsuario.password = hashPassword;
            try {
                await elUsuario.save();
            } catch (error) {
                console.log(`Error guardando el usuario con el nuevo pass: ${error}`);
                throw new ApolloError("Error conectando con la base de datos");
            }
            return true;

        },
        async resetearPasswordUsuario(_: any, { idUsuario }, context: contextoQuery) {
            if (!context.usuario) {
                throw new AuthenticationError("Login necesario");
            }
            const usuario = context.usuario;

            console.log(`Solicitud de reset de password del usuario ${usuario.id}`);

            //Authorization
            const permisosEspeciales = ["superadministrador"];

            if (!usuario.permisos.some(p => permisosEspeciales.includes(p))) {
                console.log(`Sin permisos suficientes`);
                throw new AuthenticationError("No autorizado");
            }

            try {
                var elUsuario: any = await Usuario.findById(idUsuario).exec();
                if (!elUsuario) throw "Usuario no encontrado";
            } catch (error) {
                console.log(`Error descargando el usuario: ${error}`);
                throw new UserInputError("Datos inválidos");
            }

            const newPassword = "123456";
            //Validar nuevo pass

            if (charProhibidosPassword.test(newPassword)) {
                console.log(`El nuevo password contenía caracteres ilegales`);
                throw new UserInputError("Caracteres ilegales");
            }


            if (newPassword.length < minLengthPassword || newPassword.length > maxLengthPassword) {
                console.log(`Longitud inválida del nuevo pass`);
                throw new UserInputError("Nuevo password no válido");
            }

            const salt = await bcrypt.genSalt(10);
            const hashPassword = await bcrypt.hash(newPassword, salt);

            elUsuario.password = hashPassword;
            try {
                await elUsuario.save();
            } catch (error) {
                console.log(`Error guardando el usuario con el nuevo pass: ${error}`);
                throw new ApolloError("Error conectando con la base de datos");
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
        nombreGrupoEstudiantil: async function (parent: any) {
            if (!parent._id) {

                return ""
            }
            try {
                let elGrupo: any = await GrupoEstudiantil.findOne({ estudiantes: parent._id }).exec();
                if (!elGrupo) return ""
                var nombreGrupo = elGrupo.nombre;
            } catch (error) {
                console.log(`Error buscando grupo en la base de datos. E: ${error}`);
                return ""
            }
            return nombreGrupo;
        },
        idGrupoEstudiantil: async function (parent: any) {
            if (!parent._id) {

                return ""
            }
            try {
                let elGrupo = await GrupoEstudiantil.findOne({ estudiantes: parent._id });
                if (!elGrupo) return ""
                var idGrupo = elGrupo._id;
            } catch (error) {
                console.log(`Error buscando grupo en la base de datos. E: ${error}`);
                return ""
            }
            return idGrupo;
        },
        nombre: function (parent: any, _: any, __: any) {
            return parent.username;
        },
    },
    PublicUsuario: {
        edad: function (parent: any, _: any, __: any) {
            if (!parent.fechaNacimiento) {
                return 0;
            }
            let edad = Date.now() - parent.fechaNacimiento;
            let edadAños = edad / (60 * 60 * 24 * 365 * 1000);
            edadAños = parseInt(edadAños.toFixed());
            return edadAños;
        },
    },
    Date: {
        GraphQLDateTime
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
        }
    },
    DatoNodoUsuario: {
        nombreNodo: async function (parent: any, _: any, __: any) {
            try {
                var elNodo: any = await Nodo.findById(parent.idNodo).select("nombre").exec();
                if(!elNodo)throw "Nodo no encontrado resolviendo nombre de dato nodo"
            } catch (error) {
                console.log(`error: ${error}`);
                return "";
            }
            
            return elNodo.nombre;
        }
    }
}