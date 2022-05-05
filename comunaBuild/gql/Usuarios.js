"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolvers = exports.NUEVA_NOTIFICACION_PERSONAL = exports.typeDefs = void 0;
const apollo_server_express_1 = require("apollo-server-express");
// import { ModeloUsuario as Usuario, permisosDeUsuario,  validarDatosUsuario} from "../model/Usuario"
const Usuario_1 = require("../model/Usuario");
const graphql_iso_date_1 = require("graphql-iso-date");
const GrupoEstudiantil_1 = require("../model/actividadesProfes/GrupoEstudiantil");
const Nodo_1 = require("../model/atlas/Nodo");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
exports.typeDefs = apollo_server_express_1.gql `
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

    type InformeEstudianteMaestraVida{
        id: ID,
        year: Int,
        periodo:String,
        idProfe:ID,
        categoria:String,
        texto:String
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
        informesMaestraVida: [InformeEstudianteMaestraVida],
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

    extend type Query {
        todosUsuarios:[Usuario],
        usuariosProfe:[Usuario],
        yo:Usuario,
        Usuario(idUsuario:ID!): Usuario,
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

        guardarInformeEstudianteMaestraVida(idUsuario:ID!, year: Int!, periodo: String!, idProfe: ID!, categoria: String!, texto: String!):InformeEstudianteMaestraVida,

        asignarPermisoTodosUsuarios(nuevoPermiso:String!):Boolean,
        togglePermisoUsuario(permiso:String!, idUsuario:ID!):Usuario,

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

`;
exports.NUEVA_NOTIFICACION_PERSONAL = "nueva_notificacion_personal";
exports.resolvers = {
    Subscription: {
        nuevaNotificacion: {
            subscribe: apollo_server_express_1.withFilter((_, __, contexto) => {
                console.log(`--------------------------Creando una subscripción a notificaciones personales de ${contexto.usuario.username}`);
                return contexto.pubsub.asyncIterator(exports.NUEVA_NOTIFICACION_PERSONAL);
            }, (payloadNuevaNotificacion, variables, contexto) => {
                console.log(`Decidiendo si notificar a ${contexto.usuario.id} con idNotificado=${payloadNuevaNotificacion.idNotificado}`);
                if (payloadNuevaNotificacion.idNotificado != contexto.usuario.id) {
                    return false;
                }
                console.log(`Nueva notificacion personal para ${contexto.usuario.username}`);
                return true;
            })
        }
    },
    Query: {
        usuariosProfe: function (_, args, context) {
            return __awaiter(this, void 0, void 0, function* () {
                console.log(`Fetching la lista de todos los profes`);
                try {
                    var profes = yield Usuario_1.ModeloUsuario.find({ permisos: "actividadesEstudiantiles-profe" }).exec();
                }
                catch (error) {
                    console.log(`Error buscando profes en la base de datos`);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                return profes;
            });
        },
        todosUsuarios: function (_, args, context) {
            return __awaiter(this, void 0, void 0, function* () {
                console.log(`Solicitud de la lista de todos los usuarios`);
                try {
                    var todosUsuarios = yield Usuario_1.ModeloUsuario.find({}).select("nombres informesMaestraVida apellidos permisos fechaNacimiento email username numeroTel email").exec();
                }
                catch (error) {
                    console.log("Error fetching la lista de usuarios de la base de datos. E: " + error);
                    throw new apollo_server_express_1.ApolloError("Error de conexión a la base de datos");
                }
                console.log(`Enviando lista de todos los usuarios`);
                return todosUsuarios;
            });
        },
        Usuario: function (_, { idUsuario }, context) {
            return __awaiter(this, void 0, void 0, function* () {
                try {
                    var elUsuario = yield Usuario_1.ModeloUsuario.findById(idUsuario).exec();
                }
                catch (error) {
                    console.log(`error buscando usuario con id ${idUsuario} en la base de datos`);
                    throw new apollo_server_express_1.ApolloError("Error buscando usuario");
                }
                return elUsuario;
            });
        },
        yo: function (_, __, context) {
            return __awaiter(this, void 0, void 0, function* () {
                let credencialesUsuario = context.usuario;
                console.log('\x1b[35m%s\x1b[0m', `Query for yo de ${context.usuario.id}`);
                try {
                    var elUsuario = yield Usuario_1.ModeloUsuario.findById(credencialesUsuario.id);
                }
                catch (error) {
                    console.log("Error buscando el usuario en la base de datos. E: " + error);
                    throw new apollo_server_express_1.ApolloError("Error accediendo a los datos de usuario");
                }
                return elUsuario;
            });
        },
        buscarPersonas: function (_, { textoBuscar }, context) {
            return __awaiter(this, void 0, void 0, function* () {
                console.log(`Solicitud de la lista de todos los usuarios`);
                textoBuscar = textoBuscar.trim();
                textoBuscar = new RegExp(textoBuscar, "i");
                try {
                    var todosUsuarios = yield Usuario_1.ModeloUsuario.find({}).select("nombres apellidos permisos fechaNacimiento email username numeroTel email").exec();
                }
                catch (error) {
                    console.log("Error fetching la lista de usuarios de la base de datos. E: " + error);
                    throw new apollo_server_express_1.ApolloError("Error de conexión a la base de datos");
                }
                var usuariosMatch = todosUsuarios.filter((u) => (u.nombres + u.apellidos).search(textoBuscar) > -1);
                console.log(`Enviando lista de matchs de los usuarios: ${usuariosMatch.length}`);
                return usuariosMatch;
            });
        },
        login: function (_, { username, password }, context) {
            return __awaiter(this, void 0, void 0, function* () {
                let credencialesUsuario = context.usuario;
                console.log(`Solicitud de login`);
                username = username.trim();
                if (Usuario_1.charProhibidosUsername.test(username)) {
                    console.log(`Username inválido`);
                    throw new apollo_server_express_1.UserInputError("Datos inválidos");
                }
                try {
                    var elUsuario = yield Usuario_1.ModeloUsuario.findOne({ username }, "username password permisos").exec();
                    if (!elUsuario)
                        throw "Usuario no encontrado";
                }
                catch (error) {
                    console.log(`Error buscando el usuario en la base de datos. E: ${error}`);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                const correctLogin = yield bcrypt.compare(password, elUsuario.password);
                if (!correctLogin) {
                    console.log(`Contraseña errada. Rechazando`);
                    throw new apollo_server_express_1.UserInputError("Datos incorrectos");
                }
                console.log(`login correcto de ${username}. Enviando JWT`);
                const datosToken = {
                    id: elUsuario._id,
                    permisos: elUsuario.permisos,
                    username: elUsuario.username,
                    version: 1,
                };
                const token = jwt.sign(datosToken, process.env.JWT_SECRET);
                const respuesta = {
                    username: elUsuario.username,
                    permisos: elUsuario.permisos,
                    token
                };
                return token;
            });
        },
        alienarUsuario: function (_, { idAlienado }, context) {
            return __awaiter(this, void 0, void 0, function* () {
                console.log('\x1b[35m%s\x1b[0m', `Query de alienar usuario con id ${idAlienado}`);
                if (!context.usuario) {
                    console.log(`Login requerido`);
                    throw new apollo_server_express_1.AuthenticationError("Login requerido");
                }
                const credencialesUsuario = context.usuario;
                const permisosEspeciales = ["superadministrador", "maestraVida-profesor"];
                const permisosNoAlienables = ["superadministrador", "maestraVida-profesor", "atlasAdministrador"];
                if (!credencialesUsuario.permisos.some(p => permisosEspeciales.includes(p))) {
                    throw new apollo_server_express_1.AuthenticationError("No autorizado");
                }
                try {
                    var elUsuario = yield Usuario_1.ModeloUsuario.findById(idAlienado, "username password permisos").exec();
                }
                catch (error) {
                    console.log(`Error buscando el usuario en la base de datos. E: ${error}`);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                if (elUsuario.permisos.some(p => permisosNoAlienables.includes(p))) {
                    console.log(`El usuario no podía ser alienado`);
                    throw new apollo_server_express_1.UserInputError("No permitido");
                }
                const datosToken = {
                    id: elUsuario._id,
                    permisos: elUsuario.permisos,
                    username: elUsuario.username,
                    version: 1,
                };
                const token = jwt.sign(datosToken, process.env.JWT_SECRET);
                return token;
            });
        },
    },
    Mutation: {
        editarDatosUsuario: function (_, { nuevosDatos }, context) {
            return __awaiter(this, void 0, void 0, function* () {
                console.log(`solicitud de edicion de datos de usuario`);
                let credencialesUsuario = context.usuario;
                console.log(`Usuario: Id: ${credencialesUsuario.id}, username: ${credencialesUsuario.username}`);
                if (!credencialesUsuario.permisos) {
                    console.log(`No habia campo permisos activado en las credenciales del usuario`);
                    throw new apollo_server_express_1.AuthenticationError("No autorizado");
                }
                try {
                    var elUsuario = yield Usuario_1.ModeloUsuario.findById(credencialesUsuario.id).exec();
                    if (!elUsuario) {
                        throw "Usuario no encontrado";
                    }
                }
                catch (error) {
                    console.log("Error buscando el usuario en la base de datos. E: " + error);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                let errores = Usuario_1.validarDatosUsuario(nuevosDatos);
                if (errores.length > 0) {
                    console.log(`Error validando datos: ${errores}`);
                    throw new apollo_server_express_1.ApolloError("Datos invalidos");
                }
                console.log(`asignando ${nuevosDatos} al usuario`);
                try {
                    Object.assign(elUsuario, nuevosDatos);
                    yield elUsuario.save();
                }
                catch (error) {
                    console.log("Error guardando el usuario merged con nuevos datos. E: " + error);
                    throw new apollo_server_express_1.ApolloError("Error guardando datos");
                }
                console.log(`Nuevos datos guardados`);
                return elUsuario;
            });
        },
        setCentroVista: function (_, { idUsuario, centroVista }, context) {
            return __awaiter(this, void 0, void 0, function* () {
                console.log(`Seting centro vista en ${JSON.stringify(centroVista)} para el usuario ${idUsuario}`);
                try {
                    var elUsuario = yield Usuario_1.ModeloUsuario.findById(idUsuario, "atlas").exec();
                    if (!elUsuario) {
                        throw "Error recopilando datos";
                    }
                }
                catch (error) {
                    console.log(`error buscando usuario en la base de datos`);
                    throw new apollo_server_express_1.ApolloError("");
                }
                elUsuario.atlas.centroVista = centroVista;
                try {
                    yield elUsuario.save();
                }
                catch (error) {
                    console.log(`error buscando usuario en la base de datos: ${error}`);
                    throw new apollo_server_express_1.ApolloError("");
                }
                console.log(`Set`);
                return true;
            });
        },
        addPermisoUsuario: function (_, { idUsuario, nuevoPermiso }, contexto) {
            return __awaiter(this, void 0, void 0, function* () {
                console.log(`Peticion de dar permiso ${nuevoPermiso} a un usuario con id ${idUsuario}`);
                let credencialesUsuario = contexto.usuario;
                if (!credencialesUsuario.permisos) {
                    console.log(`No habia permisos en las credenciales`);
                    throw new apollo_server_express_1.AuthenticationError("No autorizado");
                }
                let permisosValidos = ["superadministrador"];
                if (!credencialesUsuario.permisos.some(p => permisosValidos.includes(p))) {
                    console.log(`Usuario no tiene permisos válidos`);
                    throw new apollo_server_express_1.AuthenticationError("No autorizado");
                }
                if (!Usuario_1.permisosDeUsuario.includes(nuevoPermiso)) {
                    console.log(`${nuevoPermiso} no es un permiso de usuario válido`);
                    console.log(`los permisos válidos son: ${Usuario_1.permisosDeUsuario}`);
                    throw new apollo_server_express_1.AuthenticationError("Permiso no reconocido");
                }
                try {
                    var elUsuario = yield Usuario_1.ModeloUsuario.findById(idUsuario).exec();
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
                    yield elUsuario.save();
                }
                catch (error) {
                    console.log(`Error updating el usuario en la base de datos. e. ${error}`);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                console.log(`Permiso añadido.Quedó con: ${elUsuario.permisos}`);
                return elUsuario;
            });
        },
        eliminarUsuario: function (_, { idUsuario }, contexto) {
            return __awaiter(this, void 0, void 0, function* () {
                console.log(`||||||||||||||||||||||`);
                console.log(`Solicitud de eliminar un usuario con id ${idUsuario} de la base de datos`);
                let credencialesUsuario = contexto.usuario;
                if (!credencialesUsuario.permisos) {
                    console.log(`No habia permisos en las credenciales`);
                    throw new apollo_server_express_1.AuthenticationError("No autorizado");
                }
                let permisosValidos = ["superadministrador"];
                if (!credencialesUsuario.permisos.some(p => permisosValidos.includes(p))) {
                    console.log(`Usuario no tiene permisos válidos`);
                    throw new apollo_server_express_1.AuthenticationError("No autorizado");
                }
                try {
                    let elEliminado = yield Usuario_1.ModeloUsuario.findByIdAndDelete(idUsuario).exec();
                    if (!elEliminado) {
                        throw "Usuario no encontrado";
                    }
                    console.log(`Eliminado ${elEliminado.username}`);
                }
                catch (error) {
                    console.log(`Error eliminando usuario. E: ${error}`);
                    throw new apollo_server_express_1.AuthenticationError("Error conectando con la base de datos");
                }
                return true;
            });
        },
        eliminarNotificacion: function (_, { idNotificacion }, contexto) {
            return __awaiter(this, void 0, void 0, function* () {
                console.log(`|||||||||||||||||||||1`);
                console.log(`Peticion de eliminar una notificacion con id ${idNotificacion}`);
                //Authorización
                let credencialesUsuario = contexto.usuario;
                if (credencialesUsuario.permisos.length < 1) {
                    console.log(`El usuario no estaba logeado`);
                    throw new apollo_server_express_1.AuthenticationError("No autorizado");
                }
                try {
                    yield Usuario_1.ModeloUsuario.findByIdAndUpdate(credencialesUsuario.id, { $pull: { notificaciones: { _id: idNotificacion } } }).exec();
                }
                catch (error) {
                    console.log(`Error eliminando la notificacion de la base de datos. E: ${error}`);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                console.log(`Notificacion eliminada`);
                return true;
            });
        },
        eliminarNotificacionActividadForos: function (_, { idParent }, contexto) {
            return __awaiter(this, void 0, void 0, function* () {
                console.log(`|||||||||||||||||||||1`);
                console.log(`Peticion de eliminar una notificacion de actividad en foros con id ${idParent}`);
                //Authorización
                let credencialesUsuario = contexto.usuario;
                if (credencialesUsuario.permisos.length < 1) {
                    console.log(`El usuario no estaba logeado`);
                    throw new apollo_server_express_1.AuthenticationError("No autorizado");
                }
                try {
                    yield Usuario_1.ModeloUsuario.findByIdAndUpdate(credencialesUsuario.id, { $pull: { notificacionesActividadForos: { idParent: idParent } } }).exec();
                }
                catch (error) {
                    console.log(`Error eliminando la notificacion de la base de datos. E: ${error}`);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                console.log(`Notificacion eliminada`);
                return true;
            });
        },
        setNodoObjetivo: function (_, { idNodo, nuevoEstadoObjetivo }, contexto) {
            return __awaiter(this, void 0, void 0, function* () {
                let credencialesUsuario = contexto.usuario;
                if (!credencialesUsuario || !credencialesUsuario.id) {
                    throw new apollo_server_express_1.AuthenticationError("No autenticado");
                }
                console.log(`Seting nodo objetivo de ${idNodo} en ${nuevoEstadoObjetivo} para el usuario ${credencialesUsuario.id}`);
                try {
                    var elUsuario = yield Usuario_1.ModeloUsuario.findById(credencialesUsuario.id).exec();
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
                    yield elUsuario.save();
                    return true;
                }
                catch (error) {
                    console.log(`error guardando usuario en la base de datos: ${error}`);
                    throw new apollo_server_express_1.ApolloError("");
                }
            });
        },
        setNodoAtlasAprendidoUsuario: function (_, { idNodo, nuevoEstadoAprendido }, contexto) {
            return __awaiter(this, void 0, void 0, function* () {
                let credencialesUsuario = contexto.usuario;
                if (!credencialesUsuario || !credencialesUsuario.id) {
                    throw new apollo_server_express_1.AuthenticationError("No autenticado");
                }
                console.log('\x1b[35m%s\x1b[0m', `Seting nodo ${idNodo} en estado de aprendido ${nuevoEstadoAprendido} para el usuario ${credencialesUsuario.id}`);
                try {
                    var elUsuario = yield Usuario_1.ModeloUsuario.findById(credencialesUsuario.id).exec();
                }
                catch (error) {
                    console.log(`error buscando usuario en la base de datos: ${error}`);
                    throw new apollo_server_express_1.ApolloError("");
                }
                var todosNodosAfectados = [];
                var tipoRol = null;
                if (nuevoEstadoAprendido) {
                    tipoRol = "target";
                }
                else {
                    tipoRol = "source";
                }
                console.log(`Setting este y todos los nodos de conocimiento encadenados como aprendidos: ${nuevoEstadoAprendido}`);
                var currentIds = [idNodo];
                var currentNodos = [];
                var cuenta = 0;
                while (currentIds && currentIds.length > 0 && cuenta < 200) {
                    cuenta++;
                    try {
                        currentNodos = yield Nodo_1.ModeloNodo.find({ _id: { $in: currentIds } }).select("nombre vinculos").exec();
                    }
                    catch (error) {
                        console.log(`Error buscando current nodos: ${error}`);
                        throw new apollo_server_express_1.ApolloError("Error ejecutando operación");
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
                    yield elUsuario.save();
                }
                catch (error) {
                    console.log(`error guardando usuario en la base de datos: ${error}`);
                    throw new apollo_server_express_1.ApolloError("");
                }
                return elUsuario.atlas.datosNodos.filter(dn => idsNodosAfectados.includes(dn.idNodo));
            });
        },
        setNodoAtlasTarget: function (_, { idNodo }, contexto) {
            return __awaiter(this, void 0, void 0, function* () {
                let credencialesUsuario = contexto.usuario;
                if (!credencialesUsuario || !credencialesUsuario.id) {
                    throw new apollo_server_express_1.AuthenticationError("No autenticado");
                }
                console.log(`Seting nodo ${idNodo} como target para el usuario ${credencialesUsuario.id}`);
                try {
                    var elUsuario = yield Usuario_1.ModeloUsuario.findById(credencialesUsuario.id).exec();
                    elUsuario.atlas.idNodoTarget = idNodo;
                    yield elUsuario.save();
                }
                catch (error) {
                    console.log(`error guardando usuario en la base de datos: ${error}`);
                    throw new apollo_server_express_1.ApolloError("");
                }
                return true;
            });
        },
        nulificarNodoTargetUsuarioAtlas: function (_, __, contexto) {
            return __awaiter(this, void 0, void 0, function* () {
                let credencialesUsuario = contexto.usuario;
                if (!credencialesUsuario || !credencialesUsuario.id) {
                    throw new apollo_server_express_1.AuthenticationError("No autenticado");
                }
                console.log(`Seting nodo target null para el usuario ${credencialesUsuario.id}`);
                try {
                    var elUsuario = yield Usuario_1.ModeloUsuario.findById(credencialesUsuario.id).exec();
                    elUsuario.atlas.idNodoTarget = null;
                    yield elUsuario.save();
                }
                catch (error) {
                    console.log(`error guardando usuario en la base de datos: ${error}`);
                    throw new apollo_server_express_1.ApolloError("");
                }
                return true;
            });
        },
        setModoUsuarioAtlas: function (_, { idUsuario, nuevoModo }, contexto) {
            return __awaiter(this, void 0, void 0, function* () {
                let credencialesUsuario = contexto.usuario;
                if (!credencialesUsuario || !credencialesUsuario.id) {
                    throw new apollo_server_express_1.AuthenticationError("No autenticado");
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
                    var elUsuario = yield Usuario_1.ModeloUsuario.findById(idUsuario).exec();
                    elUsuario.atlas.configuracion.modo = nuevoModo;
                    // console.log(`Guardando usuario.atlas con valor: ${elUsuario.atlas}`);
                    console.log(`Guardando usuario.atlas.colecciones con valor: ${elUsuario.atlas.colecciones}`);
                    yield elUsuario.save();
                }
                catch (error) {
                    console.log(`error guardando usuario en la base de datos: ${error}`);
                    throw new apollo_server_express_1.ApolloError("");
                }
                return elUsuario;
            });
        },
        guardarInformeEstudianteMaestraVida: function (_, { idUsuario, year, periodo, idProfe, categoria, texto }, contexto) {
            return __awaiter(this, void 0, void 0, function* () {
                console.log(`|||||||||||||||||||`);
                console.log(`Solicitud de guardar informe maestra vida del estudiante con id ${idUsuario} con texto: ${texto}`);
                try {
                    var elUsuario = yield Usuario_1.ModeloUsuario.findById(idUsuario).exec();
                    if (!elUsuario) {
                        throw "usuario no encontrado";
                    }
                    var elProfe = yield Usuario_1.ModeloUsuario.findById(idProfe).exec();
                    if (!elProfe) {
                        throw "profe no encontrado";
                    }
                }
                catch (error) {
                    console.log(`error buscando usuarios. E: ` + error);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                var esProfe = false;
                if (elProfe.permisos.includes("maestraVida-profesor")) {
                    esProfe = true;
                }
                let credencialesUsuario = contexto.usuario;
                let permisosEspeciales = ["atlasAdministrador", "administrador", "superadministrador"];
                if (!credencialesUsuario.permisos.some(p => permisosEspeciales.includes(p)) && !esProfe) {
                    console.log(`El usuario no tenia permisos para efectuar esta operación`);
                    throw new apollo_server_express_1.AuthenticationError("No autorizado");
                }
                texto = texto.trim();
                var elInforme = elUsuario.informesMaestraVida.find(i => i.year == year && i.periodo === periodo && i.idProfe === idProfe && i.categoria === categoria);
                if (!elInforme) {
                    console.log("Informe no existía, creando.");
                    elInforme = elUsuario.informesMaestraVida.create({
                        year, periodo, idProfe, categoria, texto,
                    });
                    elUsuario.informesMaestraVida.push(elInforme);
                }
                else {
                    console.log("El informe ya existía");
                    elInforme.texto = texto;
                }
                try {
                    console.log(`guardando nuevo texto en la base de datos`);
                    yield elUsuario.save();
                }
                catch (error) {
                    console.log(`error guardando el nodo: ${error}`);
                }
                console.log(`Descripcion guardado`);
                return elInforme;
            });
        },
        asignarPermisoTodosUsuarios(_, { nuevoPermiso }, contexto) {
            return __awaiter(this, void 0, void 0, function* () {
                const credencialesUsuario = contexto.usuario;
                const permisosAutorizados = ["superadministrador"];
                if (!credencialesUsuario.permisos.some((p) => __awaiter(this, void 0, void 0, function* () { return permisosAutorizados.includes(p); }))) {
                    console.log(`El usuario no tenía los permisos correctos`);
                    throw new apollo_server_express_1.AuthenticationError("No autorizado");
                }
                try {
                    var losUsuarios = yield Usuario_1.ModeloUsuario.find({}).exec();
                }
                catch (error) {
                    console.log(`Error buscando los usuarios: ${error}`);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                losUsuarios.forEach((usuario) => __awaiter(this, void 0, void 0, function* () {
                    const indexP = usuario.permisos.indexOf(nuevoPermiso);
                    if (indexP > -1) {
                        usuario.permisos.splice(indexP, 1);
                    }
                    usuario.permisos.push(nuevoPermiso);
                    try {
                        yield usuario.save();
                    }
                    catch (error) {
                        console.log(`Error guardando el usuario con el nuevo permiso: ${error}`);
                        throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                    }
                }));
                return true;
            });
        },
        togglePermisoUsuario(_, { permiso, idUsuario }, contexto) {
            return __awaiter(this, void 0, void 0, function* () {
                const credencialesUsuario = contexto.usuario;
                const permisosAutorizados = ["superadministrador"];
                if (!credencialesUsuario.permisos.some((p) => __awaiter(this, void 0, void 0, function* () { return permisosAutorizados.includes(p); }))) {
                    console.log(`El usuario no tenía los permisos correctos`);
                    throw new apollo_server_express_1.AuthenticationError("No autorizado");
                }
                try {
                    var elUsuario = yield Usuario_1.ModeloUsuario.findById(idUsuario).exec();
                    if (!elUsuario)
                        throw "Usuario no encontrado";
                }
                catch (error) {
                    console.log(`Error buscando el usuario: ${error}`);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                const indexP = elUsuario.permisos.indexOf(permiso);
                if (indexP > -1) {
                    elUsuario.permisos.splice(indexP, 1);
                }
                else {
                    elUsuario.permisos.push(permiso);
                }
                try {
                    yield elUsuario.save();
                }
                catch (error) {
                    console.log(`Error guardando el usuario: ${error}`);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                return elUsuario;
            });
        },
        setPlegarNodoSolidaridadUsuario(_, { idNodo }, contexto) {
            return __awaiter(this, void 0, void 0, function* () {
                const credencialesUsuario = contexto.usuario;
                const idUsuario = credencialesUsuario.id;
                try {
                    var elUsuario = yield Usuario_1.ModeloUsuario.findById(idUsuario).exec();
                    if (!elUsuario)
                        throw "Usuario no encontrado";
                }
                catch (error) {
                    console.log(`Error buscando el usuario: ${error}`);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                const indexN = elUsuario.atlasSolidaridad.idsNodosPlegados.indexOf(idNodo);
                if (indexN > -1) {
                    elUsuario.atlasSolidaridad.idsNodosPlegados.splice(indexN, 1);
                }
                else {
                    elUsuario.atlasSolidaridad.idsNodosPlegados.push(idNodo);
                }
                try {
                    yield elUsuario.save();
                }
                catch (error) {
                    console.log(`Error guardando el usuario`);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                return elUsuario;
            });
        },
        crearColeccionNodosAtlasConocimientoUsuario(_, __, contexto) {
            return __awaiter(this, void 0, void 0, function* () {
                const credencialesUsuario = contexto.usuario;
                if (!credencialesUsuario.id) {
                    console.log(`Error: no hay id en las credenciales de usuario`);
                    throw new apollo_server_express_1.AuthenticationError("No logeado");
                }
                try {
                    var elUsuario = yield Usuario_1.ModeloUsuario.findById(credencialesUsuario.id).exec();
                    if (!elUsuario) {
                        throw "Usuario no encontrado";
                    }
                }
                catch (error) {
                    console.log(`Error buscando el usuario en la base de datos`);
                    throw new apollo_server_express_1.ApolloError("Usuario no encontrado");
                }
                var nuevaColeccion = elUsuario.atlas.colecciones.create();
                elUsuario.atlas.colecciones.push(nuevaColeccion);
                try {
                    yield elUsuario.save();
                }
                catch (error) {
                    console.log(`Error guardando la colección en la base de datos`);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                return elUsuario;
            });
        },
        eliminarColeccionNodosAtlasConocimientoUsuario(_, { idColeccion }, contexto) {
            return __awaiter(this, void 0, void 0, function* () {
                const credencialesUsuario = contexto.usuario;
                if (!credencialesUsuario.id) {
                    console.log(`Error: no hay id en las credenciales de usuario`);
                    throw new apollo_server_express_1.AuthenticationError("No logeado");
                }
                try {
                    var elUsuario = yield Usuario_1.ModeloUsuario.findById(credencialesUsuario.id).exec();
                    if (!elUsuario) {
                        throw "Usuario no encontrado";
                    }
                }
                catch (error) {
                    console.log(`Error buscando el usuario en la base de datos`);
                    throw new apollo_server_express_1.ApolloError("Usuario no encontrado");
                }
                const indexC = elUsuario.atlas.colecciones.findIndex(c => c.id === idColeccion);
                if (indexC > -1) {
                    elUsuario.atlas.colecciones.splice(indexC, 1);
                }
                else {
                    throw new apollo_server_express_1.UserInputError("Colección no encontrada");
                }
                try {
                    yield elUsuario.save();
                }
                catch (error) {
                    console.log(`Error guardando la colección en la base de datos`);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                return elUsuario;
            });
        },
        setNombreColeccionNodosAtlasConocimientoUsuario(_, { idColeccion, nuevoNombre }, contexto) {
            return __awaiter(this, void 0, void 0, function* () {
                const credencialesUsuario = contexto.usuario;
                try {
                    var elUsuario = yield Usuario_1.ModeloUsuario.findById(credencialesUsuario.id).exec();
                    if (!elUsuario) {
                        throw "Usuario no encontrado";
                    }
                }
                catch (error) {
                    console.log(`Error buscando el usuario`);
                    throw new apollo_server_express_1.ApolloError("Usuario no encontrado");
                }
                nuevoNombre = nuevoNombre.trim();
                const charProhibidosNombreColeccion = /[^ a-zA-ZÀ-ž0-9_():.,-]/;
                if (charProhibidosNombreColeccion.test(nuevoNombre)) {
                    throw new apollo_server_express_1.UserInputError("Nombre ilegal");
                }
                const indexC = elUsuario.atlas.colecciones.findIndex(c => c.id === idColeccion);
                if (indexC > -1) {
                    elUsuario.atlas.colecciones[indexC].nombre = nuevoNombre;
                }
                else {
                    throw new apollo_server_express_1.UserInputError("Colección no encontrada");
                }
                try {
                    yield elUsuario.save();
                }
                catch (error) {
                    console.log(`Error guardando los datos del usuario`);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                return elUsuario;
            });
        },
        addNodoColeccionNodosAtlasConocimientoUsuario(_, { idColeccion, idNuevoNodo }, contexto) {
            return __awaiter(this, void 0, void 0, function* () {
                const credencialesUsuario = contexto.usuario;
                try {
                    var elUsuario = yield Usuario_1.ModeloUsuario.findById(credencialesUsuario.id).exec();
                    if (!elUsuario) {
                        throw "Usuario no encontrado";
                    }
                }
                catch (error) {
                    console.log(`Error buscando el usuario`);
                    throw new apollo_server_express_1.ApolloError("Usuario no encontrado");
                }
                var laColeccion = elUsuario.atlas.colecciones.id(idColeccion);
                if (!laColeccion) {
                    console.log(`Coleccion no encontrada`);
                    throw new apollo_server_express_1.UserInputError("Colección no encontrada");
                }
                var indexN = laColeccion.idsNodos.indexOf(idNuevoNodo);
                if (indexN === -1) {
                    laColeccion.idsNodos.push(idNuevoNodo);
                }
                else {
                    throw new apollo_server_express_1.UserInputError("Nodo ya existía en la colección");
                }
                try {
                    yield elUsuario.save();
                }
                catch (error) {
                    throw new apollo_server_express_1.ApolloError("Error guardando datos de usuario en la base de datos");
                }
                return laColeccion;
            });
        },
        removeNodoColeccionNodosAtlasConocimientoUsuario(_, { idColeccion, idNodo }, contexto) {
            return __awaiter(this, void 0, void 0, function* () {
                const credencialesUsuario = contexto.usuario;
                try {
                    var elUsuario = yield Usuario_1.ModeloUsuario.findById(credencialesUsuario.id).exec();
                    if (!elUsuario) {
                        throw "Usuario no encontrado";
                    }
                }
                catch (error) {
                    console.log(`Error buscando el usuario`);
                    throw new apollo_server_express_1.ApolloError("Usuario no encontrado");
                }
                var laColeccion = elUsuario.atlas.colecciones.id(idColeccion);
                if (!laColeccion) {
                    console.log(`Coleccion no encontrada`);
                    throw new apollo_server_express_1.UserInputError("Colección no encontrada");
                }
                var indexN = laColeccion.idsNodos.indexOf(idNodo);
                if (indexN > -1) {
                    laColeccion.idsNodos.splice(indexN, 1);
                }
                else {
                    throw new apollo_server_express_1.UserInputError("Nodo no existía en la colección");
                }
                try {
                    yield elUsuario.save();
                }
                catch (error) {
                    throw new apollo_server_express_1.ApolloError("Error guardando datos de usuario en la base de datos");
                }
                return laColeccion;
            });
        },
        toggleNodoColeccionNodosAtlasConocimientoUsuario(_, { idColeccion, idNodo, idUsuario }, contexto) {
            return __awaiter(this, void 0, void 0, function* () {
                const credencialesUsuario = contexto.usuario;
                console.log(`Toggling nodo ${idNodo} en colección ${idColeccion} para el usuario ${idUsuario}`);
                try {
                    var elUsuario = yield Usuario_1.ModeloUsuario.findById(credencialesUsuario.id).exec();
                    if (!elUsuario) {
                        throw "Usuario no encontrado";
                    }
                }
                catch (error) {
                    console.log(`Error buscando el usuario`);
                    throw new apollo_server_express_1.ApolloError("Usuario no encontrado");
                }
                //Autorizacion
                const permisosEspeciales = ["superadministrador"];
                if (!permisosEspeciales.some(p => credencialesUsuario.permisos.includes(p)) && credencialesUsuario.id != idUsuario) {
                    console.log(`No autorizado`);
                    throw new apollo_server_express_1.AuthenticationError("No autorizado");
                }
                var laColeccion = elUsuario.atlas.colecciones.id(idColeccion);
                if (!laColeccion) {
                    console.log(`Coleccion no encontrada`);
                    throw new apollo_server_express_1.UserInputError("Colección no encontrada");
                }
                const indexN = laColeccion.idsNodos.indexOf(idNodo);
                if (indexN === -1) {
                    laColeccion.idsNodos.push(idNodo);
                }
                else {
                    laColeccion.idsNodos.splice(indexN, 1);
                }
                try {
                    yield elUsuario.save();
                }
                catch (error) {
                    throw new apollo_server_express_1.ApolloError("Error guardando datos de usuario en la base de datos");
                }
                return laColeccion;
            });
        },
        crearIteracionRepasoNodoConocimientoUsuario(_, { idUsuario, idNodo, intervalo }, contexto) {
            return __awaiter(this, void 0, void 0, function* () {
                console.log('\x1b[35m%s\x1b[0m', `Mutation for crear iteracion de repaso para nodo ${idNodo} con intervalo ${intervalo}`);
                if (!contexto.usuario) {
                    console.log(`No había credenciales`);
                    throw new apollo_server_express_1.AuthenticationError("Login requerido");
                }
                const credencialesUsuario = contexto.usuario;
                try {
                    var elUsuario = yield Usuario_1.ModeloUsuario.findById(idUsuario).exec();
                    if (!elUsuario) {
                        throw "Usuario no encontrado";
                    }
                }
                catch (error) {
                    console.log(`Error buscando el usuario en la base de datos`);
                    throw new apollo_server_express_1.ApolloError("Usuario no encontrado");
                }
                //Authentication
                const permisosEspeciales = ["superadministrador"];
                if (credencialesUsuario.id != idUsuario && !credencialesUsuario.permisos.some(p => permisosEspeciales.includes(p))) {
                    throw new apollo_server_express_1.AuthenticationError("No autorizado");
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
                    yield elUsuario.save();
                }
                catch (error) {
                    console.log(`Error guardando el usuario en la base de datos: ${error}`);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                console.log(`Creado`);
                return elDatoNodo;
            });
        },
        eliminarIteracionRepaso(_, { idUsuario, idNodo, idIteracion }, contexto) {
            return __awaiter(this, void 0, void 0, function* () {
                console.log('\x1b[35m%s\x1b[0m', `Query for eliminar iteracion de repaso con id ${idIteracion} del nodo ${idNodo} del usuario ${idUsuario}`);
                if (!contexto.usuario) {
                    console.log(`No había credenciales`);
                    throw new apollo_server_express_1.AuthenticationError("Login requerido");
                }
                const credencialesUsuario = contexto.usuario;
                try {
                    var elUsuario = yield Usuario_1.ModeloUsuario.findById(idUsuario).exec();
                    if (!elUsuario) {
                        throw "Usuario no encontrado";
                    }
                }
                catch (error) {
                    console.log(`Error buscando el usuario en la base de datos`);
                    throw new apollo_server_express_1.ApolloError("Usuario no encontrado");
                }
                //Authentication
                const permisosEspeciales = ["superadministrador"];
                if (credencialesUsuario.id != idUsuario && !credencialesUsuario.permisos.some(p => permisosEspeciales.includes(p))) {
                    throw new apollo_server_express_1.AuthenticationError("No autorizado");
                }
                var elDatoNodo = elUsuario.atlas.datosNodos.find(dn => dn.idNodo === idNodo);
                if (!elDatoNodo) {
                    console.log(`Dato nodo no encontrado`);
                    throw new apollo_server_express_1.UserInputError("Datos inválidos");
                }
                const indexI = elDatoNodo.iteracionesRepaso.findIndex(i => i.id === idIteracion);
                if (indexI > -1) {
                    elDatoNodo.iteracionesRepaso.splice(indexI, 1);
                }
                else {
                    throw new apollo_server_express_1.UserInputError("Iteración no existía");
                }
                try {
                    yield elUsuario.save();
                }
                catch (error) {
                    console.log(`Error guardando el usuario en la base de datos: ${error}`);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                return true;
            });
        },
        setIntervaloIteracionRepaso(_, { idUsuario, idNodo, idIteracion, nuevoIntervalo }, contexto) {
            return __awaiter(this, void 0, void 0, function* () {
                console.log('\x1b[35m%s\x1b[0m', `Query for set intervalo de iteracionRepaso con id ${idIteracion} del nodo ${idNodo} del usuario ${idUsuario} en valor ${nuevoIntervalo}`);
                if (!contexto.usuario) {
                    console.log(`No había credenciales`);
                    throw new apollo_server_express_1.AuthenticationError("Login requerido");
                }
                const credencialesUsuario = contexto.usuario;
                try {
                    var elUsuario = yield Usuario_1.ModeloUsuario.findById(idUsuario).exec();
                    if (!elUsuario) {
                        throw "Usuario no encontrado";
                    }
                }
                catch (error) {
                    console.log(`Error buscando el usuario en la base de datos`);
                    throw new apollo_server_express_1.ApolloError("Usuario no encontrado");
                }
                //Authentication
                const permisosEspeciales = ["superadministrador"];
                if (credencialesUsuario.id != idUsuario && !credencialesUsuario.permisos.some(p => permisosEspeciales.includes(p))) {
                    throw new apollo_server_express_1.AuthenticationError("No autorizado");
                }
                var elDatoNodo = elUsuario.atlas.datosNodos.find(dn => dn.idNodo === idNodo);
                if (!elDatoNodo) {
                    throw new apollo_server_express_1.UserInputError("Datos de nodo no encontrados");
                }
                var laIteracion = elDatoNodo.iteracionesRepaso.find(i => i.id === idIteracion);
                if (!laIteracion) {
                    throw new apollo_server_express_1.UserInputError("Iteracion no encontrado");
                }
                laIteracion.intervalo = nuevoIntervalo;
                try {
                    yield elUsuario.save();
                }
                catch (error) {
                    console.log(`Error guardando el usuario en la base de datos: ${error}`);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                return laIteracion;
            });
        },
        setDateNodoConocimientoEstudiadoUsuario(_, { idUsuario, idNodo, fecha }, contexto) {
            return __awaiter(this, void 0, void 0, function* () {
                console.log('\x1b[35m%s\x1b[0m', `Query for set nodo ${idNodo} estudiado en ${fecha} por el usuario ${idUsuario}`);
                if (!contexto.usuario) {
                    console.log(`No había credenciales`);
                    throw new apollo_server_express_1.AuthenticationError("Login requerido");
                }
                const credencialesUsuario = contexto.usuario;
                try {
                    var elUsuario = yield Usuario_1.ModeloUsuario.findById(idUsuario).exec();
                    if (!elUsuario) {
                        throw "Usuario no encontrado";
                    }
                }
                catch (error) {
                    console.log(`Error buscando el usuario en la base de datos`);
                    throw new apollo_server_express_1.ApolloError("Usuario no encontrado");
                }
                //Authentication
                const permisosEspeciales = ["superadministrador"];
                if (credencialesUsuario.id != idUsuario && !credencialesUsuario.permisos.some(p => permisosEspeciales.includes(p))) {
                    throw new apollo_server_express_1.AuthenticationError("No autorizado");
                }
                var elDatoNodo = elUsuario.atlas.datosNodos.find(dn => dn.idNodo === idNodo);
                if (!elDatoNodo) {
                    console.log(`Datos de nodo no encontrados. Creando`);
                    elDatoNodo = elUsuario.atlas.datosNodos.create({ idNodo });
                    elUsuario.atlas.datosNodos.push(elDatoNodo);
                }
                if (elDatoNodo.iteracionesRepaso.length > 0) {
                    elDatoNodo.iteracionesRepaso.shift();
                }
                if (elDatoNodo.iteracionesRepaso.legth < 1) {
                    var nuevaIteracion = elDatoNodo.iteracionesRepaso.create({
                        intervalo: 172800000,
                    });
                    elDatoNodo.iteracionesRepaso.push(nuevaIteracion);
                }
                elDatoNodo.estudiado = fecha;
                try {
                    yield elUsuario.save();
                }
                catch (error) {
                    console.log(`Error guardando el usuario en la base de datos: ${error}`);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                return elDatoNodo;
            });
        },
        setCoordsVistaAtlasSolidaridadUsuario(_, { coords }, contexto) {
            return __awaiter(this, void 0, void 0, function* () {
                const credencialesUsuario = contexto.usuario;
                if (!credencialesUsuario.id) {
                    throw new apollo_server_express_1.AuthenticationError("No Autenticado");
                }
                try {
                    var elUsuario = yield Usuario_1.ModeloUsuario.findById(credencialesUsuario.id).exec();
                }
                catch (error) {
                    console.log(`Error buscando el usuario`);
                    throw new apollo_server_express_1.ApolloError("Usuario no encontrado");
                }
                elUsuario.atlasSolidaridad.coordsVista = coords;
                try {
                    yield elUsuario.save();
                }
                catch (error) {
                    console.log(`Error guardando el usuario con el nuevo coords de centroVista`);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                console.log(`Nuevo coords vista en atlas solidaridad setted en ${JSON.stringify(coords)}`);
                return true;
            });
        },
        setNodosSolidaridadDesplegadosUsuario(_, { idsNodos }, contexto) {
            return __awaiter(this, void 0, void 0, function* () {
                const credencialesUsuario = contexto.usuario;
                if (!credencialesUsuario) {
                    throw new apollo_server_express_1.AuthenticationError("No autorizardo");
                }
                const idUsuario = credencialesUsuario.id;
                try {
                    var elUsuario = yield Usuario_1.ModeloUsuario.findById(idUsuario).exec();
                    if (!elUsuario)
                        throw "Usuario no encontrado";
                }
                catch (error) {
                    console.log(`Error buscando el usuario: ${error}`);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                elUsuario.atlasSolidaridad.idsNodosDesplegados = idsNodos;
                try {
                    yield elUsuario.save();
                }
                catch (error) {
                    console.log(`Error guardando el usuario`);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                return true;
            });
        },
        cambiarPassword(_, { dizqueCurrentPassword, newPassword }, context) {
            return __awaiter(this, void 0, void 0, function* () {
                if (!context.usuario) {
                    throw new apollo_server_express_1.AuthenticationError("Login necesario");
                }
                const usuario = context.usuario;
                console.log(`Solicitud de cambio de password del usuario ${usuario.id}`);
                try {
                    var elUsuario = yield Usuario_1.ModeloUsuario.findById(usuario.id).exec();
                    if (!elUsuario)
                        throw "Usuario no encontrado";
                }
                catch (error) {
                    console.log(`Error descargando el usuario: ${error}`);
                    throw new apollo_server_express_1.UserInputError("Datos inválidos");
                }
                //Validar currentPass
                if (!(yield bcrypt.compare(dizqueCurrentPassword, elUsuario.password))) {
                    throw new apollo_server_express_1.UserInputError("Datos inválidos");
                }
                //Validar nuevo pass
                if (Usuario_1.charProhibidosPassword.test(newPassword)) {
                    console.log(`El nuevo password contenía caracteres ilegales`);
                    throw new apollo_server_express_1.UserInputError("Caracteres ilegales");
                }
                if (newPassword.length < Usuario_1.minLengthPassword || newPassword.length > Usuario_1.maxLengthPassword) {
                    console.log(`Longitud inválida del nuevo pass`);
                    throw new apollo_server_express_1.UserInputError("Nuevo password no válido");
                }
                const salt = yield bcrypt.genSalt(10);
                const hashPassword = yield bcrypt.hash(newPassword, salt);
                elUsuario.password = hashPassword;
                try {
                    yield elUsuario.save();
                }
                catch (error) {
                    console.log(`Error guardando el usuario con el nuevo pass: ${error}`);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                return true;
            });
        },
        resetearPasswordUsuario(_, { idUsuario }, context) {
            return __awaiter(this, void 0, void 0, function* () {
                if (!context.usuario) {
                    throw new apollo_server_express_1.AuthenticationError("Login necesario");
                }
                const usuario = context.usuario;
                console.log(`Solicitud de reset de password del usuario ${usuario.id}`);
                //Authorization
                const permisosEspeciales = ["superadministrador"];
                if (!usuario.permisos.some(p => permisosEspeciales.includes(p))) {
                    console.log(`Sin permisos suficientes`);
                    throw new apollo_server_express_1.AuthenticationError("No autorizado");
                }
                try {
                    var elUsuario = yield Usuario_1.ModeloUsuario.findById(idUsuario).exec();
                    if (!elUsuario)
                        throw "Usuario no encontrado";
                }
                catch (error) {
                    console.log(`Error descargando el usuario: ${error}`);
                    throw new apollo_server_express_1.UserInputError("Datos inválidos");
                }
                const newPassword = "123456";
                //Validar nuevo pass
                if (Usuario_1.charProhibidosPassword.test(newPassword)) {
                    console.log(`El nuevo password contenía caracteres ilegales`);
                    throw new apollo_server_express_1.UserInputError("Caracteres ilegales");
                }
                if (newPassword.length < Usuario_1.minLengthPassword || newPassword.length > Usuario_1.maxLengthPassword) {
                    console.log(`Longitud inválida del nuevo pass`);
                    throw new apollo_server_express_1.UserInputError("Nuevo password no válido");
                }
                const salt = yield bcrypt.genSalt(10);
                const hashPassword = yield bcrypt.hash(newPassword, salt);
                elUsuario.password = hashPassword;
                try {
                    yield elUsuario.save();
                }
                catch (error) {
                    console.log(`Error guardando el usuario con el nuevo pass: ${error}`);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                return true;
            });
        },
    },
    Usuario: {
        edad: function (parent, _, __) {
            if (!parent.fechaNacimiento) {
                return 0;
            }
            let edad = Date.now() - parent.fechaNacimiento;
            console.log(`Usuario tiene edad: ${edad}`);
            let edadAños = Math.floor(edad / (60 * 60 * 24 * 365 * 1000));
            edadAños = parseInt(edadAños.toFixed());
            return edadAños;
        },
        nombreGrupoEstudiantil: function (parent) {
            return __awaiter(this, void 0, void 0, function* () {
                if (!parent._id) {
                    return "";
                }
                try {
                    let elGrupo = yield GrupoEstudiantil_1.ModeloGrupoEstudiantil.findOne({ estudiantes: parent._id }).exec();
                    if (!elGrupo)
                        return "";
                    var nombreGrupo = elGrupo.nombre;
                }
                catch (error) {
                    console.log(`Error buscando grupo en la base de datos. E: ${error}`);
                    return "";
                }
                return nombreGrupo;
            });
        },
        idGrupoEstudiantil: function (parent) {
            return __awaiter(this, void 0, void 0, function* () {
                if (!parent._id) {
                    return "";
                }
                try {
                    let elGrupo = yield GrupoEstudiantil_1.ModeloGrupoEstudiantil.findOne({ estudiantes: parent._id });
                    if (!elGrupo)
                        return "";
                    var idGrupo = elGrupo._id;
                }
                catch (error) {
                    console.log(`Error buscando grupo en la base de datos. E: ${error}`);
                    return "";
                }
                return idGrupo;
            });
        },
        nombre: function (parent, _, __) {
            return parent.username;
        },
    },
    Date: {
        GraphQLDateTime: graphql_iso_date_1.GraphQLDateTime
    },
    ColeccionNodosAtlasConocimiento: {
        nodos: function (parent, _, __) {
            return __awaiter(this, void 0, void 0, function* () {
                // console.log(`Resolviendo nodos de coleccion con parent: ${parent}`);
                try {
                    var losNodos = yield Nodo_1.ModeloNodo.find({ _id: { $in: parent.idsNodos } }).exec();
                }
                catch (error) {
                    console.log(`Error buscando los nodos de la coleccion ${parent.id}`);
                }
                if (!losNodos)
                    losNodos = [];
                return losNodos;
            });
        }
    },
    DatoNodoUsuario: {
        nombreNodo: function (parent, _, __) {
            return __awaiter(this, void 0, void 0, function* () {
                try {
                    var elNodo = yield Nodo_1.ModeloNodo.findById(parent.idNodo).select("nombre").exec();
                    if (!elNodo)
                        throw "Nodo no encontrado resolviendo nombre de dato nodo";
                }
                catch (error) {
                    console.log(`error: ${error}`);
                    return "";
                }
                return elNodo.nombre;
            });
        }
    }
};
