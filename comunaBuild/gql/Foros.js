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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolvers = exports.typeDefs = void 0;
const apollo_server_express_1 = require("apollo-server-express");
const mongoose_1 = __importDefault(require("mongoose"));
const Foro_1 = require("../model/Foros/Foro");
const Proyecto_1 = require("../model/Proyecto");
const Conversacion_1 = require("../model/Foros/Conversacion");
const Usuario_1 = require("../model/Usuario");
const Nodo_1 = require("../model/atlas/Nodo");
const Trabajo_1 = require("../model/Trabajo");
const Nodo = require("../model/atlas/Nodo");
exports.typeDefs = apollo_server_express_1.gql `

    input InputNuevaRespuesta{
        mensaje:String
        infoArchivo:InfoArchivoSubido
    }

    input InputParent{
        id:ID,
        nombre:String,
        tipo: String,
    }

    input InputIniciarConversacion{
        titulo:String,
        primeraRespuesta:String
    }

    type RespuestaConversacionForo{
        id: ID
        fecha:Date,
        archivo:InfoArchivo,
        mensaje:String,
        autor: PublicUsuario,
        infoAutor:PublicUsuario,
    }

    type InfoRespuestasPaginasConversacion{
        numPaginas: Int,
        pagina:Int,
        respuestas: [RespuestaConversacionForo]
    }

    type InfoConversacionesPaginaForo{
        numPaginas: Int,
        pagina:Int,
        conversaciones: [Conversacion]
    }

    type InfoUltimaRespuesta{
        autor:PublicUsuario,
        fecha:Date
    }

    type Conversacion{
        id:ID,
        titulo: String,
        estado:String,
        creador: PublicUsuario,
        acceso:String,
        cantidadRespuestas:Int,
        infoUltimaRespuesta:InfoUltimaRespuesta,        
    }
  
    type Foro{
        id:ID,
        acceso:String,
        miembros:[PublicUsuario]       
        conversaciones:[Conversacion], 
    }

    extend type Query{
        foro(idForo:ID!):Foro,
        numPaginasConversacion(idConversacion: ID!):Int
        numPagsConversacionesForo(idForo: ID!):Int
        respuestasPaginaDeConversacion(idConversacion:ID!, pagina: Int!):InfoRespuestasPaginasConversacion,
        conversacionesPaginaForo(idForo:ID!, pagina: Int!):InfoConversacionesPaginaForo
    }

    extend type Mutation{
        iniciarConversacionConPrimerMensajeForo(idForo: ID!, input: InputIniciarConversacion):Conversacion,
        eliminarRespuesta(idRespuesta:ID!, idConversacion:ID!):Boolean,
        postRespuestaConversacion(idConversacion: ID!, nuevaRespuesta: InputNuevaRespuesta, parent: InputParent):RespuestaConversacionForo,
        setCantidadRespuestasConversacionLeidasPorUsuario(idUsuario:ID!, idForo:ID!, idConversacion: ID!, cantidadRespuestasLeidas:Int!):Boolean
    }

`;
const sizePaginaConversacion = 5;
const sizePaginaForo = 6;
exports.resolvers = {
    Query: {
        foro(_, { idForo }, contexto) {
            return __awaiter(this, void 0, void 0, function* () {
                try {
                    var elForo = yield Foro_1.ModeloForo.findById(idForo).exec();
                    if (!elForo) {
                        throw "foro no encontrado";
                    }
                }
                catch (error) {
                    console.log(`Error buscando el foro con id ${idForo} en la base de datos. E:${error}`);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                return elForo;
            });
        },
        numPaginasConversacion(_, { idConversacion }, __) {
            return __awaiter(this, void 0, void 0, function* () {
                let Respuesta = mongoose_1.default.model("respuestasDeConversacion" + idConversacion, Conversacion_1.esquemaRespuestaConversacion, "respuestasDeConversacion" + idConversacion);
                try {
                    var num = yield Respuesta.countDocuments().exec();
                    var pags = Math.ceil(num / sizePaginaConversacion);
                }
                catch (error) {
                    console.log(`Error contando las respuestas. E: ${error}`);
                    return 0;
                }
                return pags;
            });
        },
        numPagsConversacionesForo(_, { idForo }, __) {
            return __awaiter(this, void 0, void 0, function* () {
                try {
                    let elForo = yield Foro_1.ModeloForo.findById(idForo).exec();
                    let num = elForo.conversaciones.length;
                    var pags = Math.ceil(num / sizePaginaForo);
                }
                catch (error) {
                    console.log(`Error contando las conversaciones. E: ${error}`);
                    return 0;
                }
                return pags;
            });
        },
        respuestasPaginaDeConversacion(_, { idConversacion, pagina }, __) {
            return __awaiter(this, void 0, void 0, function* () {
                let Respuesta = mongoose_1.default.model("respuestasDeConversacion" + idConversacion, Conversacion_1.esquemaRespuestaConversacion, "respuestasDeConversacion" + idConversacion);
                let numRespuestas = yield Respuesta.countDocuments().exec();
                var numPaginas = 0;
                if (numRespuestas > 0) {
                    numPaginas = Math.ceil(numRespuestas / sizePaginaConversacion);
                }
                if (pagina < 1 || pagina > numPaginas) {
                    pagina = numPaginas;
                }
                try {
                    var lasRespuestas = yield Respuesta.find({}).limit(sizePaginaConversacion).skip((pagina - 1) * sizePaginaConversacion).exec();
                }
                catch (error) {
                    console.log(`Error descargando respuestas`);
                    new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                return { numPaginas, pagina, respuestas: lasRespuestas };
            });
        },
        conversacionesPaginaForo(_, { idForo, pagina }, __) {
            return __awaiter(this, void 0, void 0, function* () {
                try {
                    var elForo = yield Foro_1.ModeloForo.findById(idForo).exec();
                    if (!elForo) {
                        throw "Foro no encontrado";
                    }
                }
                catch (error) {
                    console.log(`Error buscando el foro`);
                    new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                let todasConversaciones = elForo.conversaciones;
                let numConversaciones = todasConversaciones.length;
                var numPaginas = 0;
                if (numConversaciones > 0) {
                    numPaginas = Math.ceil(numConversaciones / sizePaginaConversacion);
                }
                if (pagina < 1 || pagina > numPaginas) {
                    pagina = numPaginas;
                }
                let conversacionesPagina = todasConversaciones.splice((pagina - 1) * sizePaginaForo, sizePaginaForo);
                return { pagina, numPaginas, conversaciones: conversacionesPagina };
            });
        }
    },
    Mutation: {
        iniciarConversacionConPrimerMensajeForo(_, { idForo, input }, contexto) {
            return __awaiter(this, void 0, void 0, function* () {
                console.log(`|||||||||||||||||||||`);
                console.log(`Recibida solicitud de iniciar una conversacion con primera respuesta en foro con id ${idForo} con input: ${JSON.stringify(input)}`);
                try {
                    var elForo = yield Foro_1.ModeloForo.findById(idForo).exec();
                    if (!elForo) {
                        throw "foro no encontrado";
                    }
                }
                catch (error) {
                    console.log("Foro no encontrado. E: " + error);
                    throw new apollo_server_express_1.ApolloError("Error conectandose con la base de datos");
                }
                //Authorización
                let permisosEspeciales = ["superadministrador"];
                let credencialesUsuario = contexto.usuario;
                try {
                    var elUsuario = yield Usuario_1.ModeloUsuario.findById(credencialesUsuario.id).exec();
                }
                catch (error) {
                    console.log(`Error buscando al usuario en la base de datos. E:${error}`);
                    throw new apollo_server_express_1.AuthenticationError("No autorizado");
                }
                if (elForo.acceso == "privado") {
                    if (!elForo.miembros.includes(credencialesUsuario.id) && !credencialesUsuario.permisos.some(p => permisosEspeciales.includes(p))) {
                        console.log(`Error de autenticacion para crear conversacio en el foro`);
                        throw new apollo_server_express_1.AuthenticationError("No autorizado");
                    }
                }
                const charProhibidosTitulo = /[^ a-zA-ZÀ-ž0-9_():.,-¡!¿?]/;
                let titulo = input.titulo;
                titulo = titulo.trim();
                titulo = titulo.replace(/\s\s+/g, " ");
                if (charProhibidosTitulo.test(titulo)) {
                    console.log(`El titulo contenia caracteres ilegales`);
                    throw new apollo_server_express_1.ApolloError("Titulo ilegal");
                }
                let primeraRespuesta = input.primeraRespuesta;
                primeraRespuesta = primeraRespuesta.trim();
                if (Conversacion_1.charProhibidosMensajeRespuesta.test(primeraRespuesta)) {
                    console.log(`El mensaje contenia caracteres ilegales`);
                    throw new apollo_server_express_1.ApolloError("Mensaje ilegal");
                }
                let infoAutor = {
                    id: elUsuario._id,
                    nombres: elUsuario.nombres,
                    apellidos: elUsuario.apellidos,
                    username: elUsuario.username,
                };
                let respuesta = {
                    mensaje: primeraRespuesta,
                    idAutor: credencialesUsuario.id,
                    infoAutor,
                };
                let nuevaConversacion = elForo.conversaciones.create({
                    titulo,
                    idCreador: credencialesUsuario.id,
                    respuestas: [respuesta],
                    acceso: "publico"
                });
                let idConversacion = nuevaConversacion._id;
                try {
                    yield elForo.conversaciones.push(nuevaConversacion);
                    yield elForo.save();
                    let Respuesta = mongoose_1.default.model("respuestasDeConversacion" + idConversacion, Conversacion_1.esquemaRespuestaConversacion, "respuestasDeConversacion" + idConversacion);
                    let laRespuesta = new Respuesta(respuesta);
                    yield laRespuesta.save();
                }
                catch (error) {
                    console.log(`Error guardando el foro con la nueva conversacion. E: ${error}`);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                console.log(`Nueva conversacion creada`);
                return nuevaConversacion;
            });
        },
        eliminarRespuesta(_, { idRespuesta, idConversacion }, contexto) {
            return __awaiter(this, void 0, void 0, function* () {
                console.log(`|||||||||||||||||`);
                console.log(`Solicitud de eliminar una respuesta con id ${idRespuesta}`);
                let Respuesta = mongoose_1.default.model("respuestasDeConversacion" + idConversacion, Conversacion_1.esquemaRespuestaConversacion, "respuestasDeConversacion" + idConversacion);
                try {
                    var laRespuesta = yield Respuesta.findById(idRespuesta).exec();
                    if (!laRespuesta) {
                        throw "Respuesta no encontrada";
                    }
                }
                catch (error) {
                    console.log(`Error buscando la respuesta. E: ${error}`);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                //Authorización
                let permisosEspeciales = ["superadministrador"];
                let credencialesUsuario = contexto.usuario;
                if (credencialesUsuario.id != laRespuesta.idAutor && !credencialesUsuario.permisos.some(p => permisosEspeciales.includes(p))) {
                    console.log(`Error de autorización`);
                    throw new apollo_server_express_1.AuthenticationError("No autorizado");
                }
                try {
                    yield Respuesta.findByIdAndDelete(idRespuesta).exec();
                }
                catch (error) {
                    console.log(`Error eliminando respuesta. E: ${error}`);
                }
                if ((yield Respuesta.countDocuments().exec()) < 1) {
                    console.log(`La conversación quedó vacía. Eliminando`);
                    try {
                        let elForo = yield Foro_1.ModeloForo.findOne({ "conversaciones._id": idConversacion }).exec();
                        if (!elForo) {
                            console.log(`Foro no encontrado`);
                            throw "Foro no encontrado";
                        }
                        elForo.conversaciones.id(idConversacion).remove();
                        yield elForo.save();
                    }
                    catch (error) {
                        console.log(`Error buscando y guardando el foro para eliminar la conversación`);
                    }
                    console.log(`Conversación eliminada del foro`);
                    mongoose_1.default.connection.db.dropCollection("respuestasDeConversacion" + idConversacion, function (err, result) {
                        if (err) {
                            console.log(`Error eliminando la coleccion. E: ${err}`);
                        }
                        console.log("Collection droped");
                    });
                }
                console.log(`Respuesta eliminada`);
                return true;
            });
        },
        postRespuestaConversacion(_, { idConversacion, nuevaRespuesta, parent }, contexto) {
            return __awaiter(this, void 0, void 0, function* () {
                console.log(`||||||||||||||||||||||||||||||||`);
                console.log(`Peticion de post respuesta en la conversación con id ${idConversacion}`);
                console.log(`La respuesta será: ${JSON.stringify(nuevaRespuesta)}`);
                try {
                    var elForo = yield Foro_1.ModeloForo.findOne({ "conversaciones._id": idConversacion }).exec();
                    if (!elForo) {
                        throw "Foro no existía";
                    }
                }
                catch (error) {
                    console.log(`Error buscando el foro de la conversación. E: ${error}`);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                //Authorización
                let permisosEspeciales = ["superadministrador"];
                let credencialesUsuario = contexto.usuario;
                try {
                    var elUsuario = yield Usuario_1.ModeloUsuario.findById(credencialesUsuario.id).exec();
                }
                catch (error) {
                    console.log(`Error buscando al usuario en la base de datos. E:${error}`);
                    throw new apollo_server_express_1.AuthenticationError("No autorizado");
                }
                let laConversacion = elForo.conversaciones.id(idConversacion);
                if (!laConversacion) {
                    console.log(`La conversación no existía`);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                if (laConversacion.acceso == "privado") {
                    if (!elForo.miembros.includes(credencialesUsuario.id) && !credencialesUsuario.permisos.some(p => permisosEspeciales.includes(p))) {
                        console.log(`Error de autenticacion para crear conversacio en el foro`);
                        throw new apollo_server_express_1.AuthenticationError("No autorizado");
                    }
                }
                let mensaje = nuevaRespuesta.mensaje;
                mensaje = mensaje.trim();
                if (Conversacion_1.charProhibidosMensajeRespuesta.test(mensaje)) {
                    console.log(`El mensaje contenia caracteres ilegales`);
                    throw new apollo_server_express_1.ApolloError("Mensaje ilegal");
                }
                nuevaRespuesta.mensaje = mensaje;
                nuevaRespuesta.archivo = nuevaRespuesta.infoArchivo;
                nuevaRespuesta.idAutor = credencialesUsuario.id;
                let infoAutor = {
                    id: elUsuario._id,
                    nombres: elUsuario.nombres,
                    apellidos: elUsuario.apellidos,
                    username: elUsuario.username,
                };
                nuevaRespuesta.infoAutor = infoAutor;
                console.log(`En la conversación ${laConversacion.titulo}`);
                let Respuesta = mongoose_1.default.model("respuestasDeConversacion" + idConversacion, Conversacion_1.esquemaRespuestaConversacion, "respuestasDeConversacion" + idConversacion);
                const laRespuesta = new Respuesta(nuevaRespuesta);
                try {
                    yield laRespuesta.save();
                }
                catch (error) {
                    console.log(`Error guardando la respuesta. E: ${error}`);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                let cantRespuestas = yield Respuesta.countDocuments().exec();
                try {
                    laConversacion.cantidadRespuestas = cantRespuestas;
                    laConversacion.infoUltimaRespuesta = {
                        idAutor: credencialesUsuario.id,
                    };
                    yield elForo.save();
                }
                catch (error) {
                    console.log(`Error guardando cant respuestas y info ultima respuesta. E: ${error}`);
                }
                //Crear notificacion para los miembros del parent.
                console.log(`Creando notificacion para los miembros del ${parent.tipo} ${parent.nombre}`);
                try {
                    if (parent.tipo == "proyecto") {
                        var elParent = yield Proyecto_1.ModeloProyecto.findById(parent.id, "_id responsables").exec();
                        var idsMiembros = elParent.responsables;
                    }
                    else if (parent.tipo == "trabajo") {
                        var elParent = yield Trabajo_1.ModeloTrabajo.findById(parent.id, "_id responsables").exec();
                        var idsMiembros = elParent.responsables;
                    }
                    else if (parent.tipo == "nodoConocimiento") {
                        var elParent = yield Nodo_1.ModeloNodo.findById(parent.id, "_id expertos").exec();
                        var idsMiembros = elParent.expertos;
                    }
                    else {
                        console.log(`Error: tipo de parent no reconocido`);
                    }
                }
                catch (error) {
                    console.log(`Error recopilando la lista de miembros. E: ${error}`);
                }
                console.log(`notificando a ${idsMiembros.length} usuarios: ${idsMiembros}`);
                let indexU = idsMiembros.indexOf(credencialesUsuario.id);
                if (indexU > -1) {
                    idsMiembros.splice(indexU, 1);
                }
                for (let idMiembro of idsMiembros) {
                    try {
                        let elNotificado = yield Usuario_1.ModeloUsuario.findById(idMiembro).exec();
                        if (!elNotificado)
                            throw "Notificado " + idMiembro + " no encontrado";
                        var indexNotificacion = elNotificado.notificacionesActividadForos.findIndex(n => n.tipoParent == parent.tipo && n.idParent == parent.id);
                        if (indexNotificacion > -1) {
                            console.log(`Ya existía notificacion (${indexNotificacion}) de actividad en este elemento con cantidad ${elNotificado.notificacionesActividadForos[indexNotificacion].numeroRespuestasNuevas}`);
                            elNotificado.notificacionesActividadForos[indexNotificacion].numeroRespuestasNuevas++;
                        }
                        else {
                            elNotificado.notificacionesActividadForos.push({
                                idParent: parent.id,
                                tipoParent: parent.tipo,
                                nombreParent: parent.nombre,
                                numeroRespuestasNuevas: 1,
                            });
                        }
                        yield elNotificado.save();
                    }
                    catch (error) {
                        console.log(`Error buscando el notificado: E: ${error}`);
                    }
                }
                console.log(`Respuesta posted`);
                return laRespuesta;
            });
        },
        setCantidadRespuestasConversacionLeidasPorUsuario(_, { idUsuario, idForo, idConversacion, cantidadRespuestasLeidas }, contexto) {
            return __awaiter(this, void 0, void 0, function* () {
                console.log(`///////////////////`);
                console.log(`Setting respuestas leidas en conversacion ${idConversacion} en foro con id ${idForo}`);
                const credencialesUsuario = contexto.usuario;
                if (idUsuario != credencialesUsuario.id) {
                    throw new apollo_server_express_1.AuthenticationError("No autorizado");
                }
                try {
                    var elUsuario = yield Usuario_1.ModeloUsuario.findById(idUsuario).select("foros").exec();
                    if (!elUsuario)
                        throw "Usuario no encontrado en la base de datos";
                }
                catch (error) {
                    console.log(`Error buscando el usuario. E: ${error}`);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                var infoForo = elUsuario.foros.find(f => f.idForo == idForo);
                console.log(`** elUsuario.foros: ${elUsuario.foros}`);
                if (!infoForo) {
                    var nuevoInfoForo = {
                        idForo,
                        conversaciones: []
                    };
                    elUsuario.foros.push(nuevoInfoForo);
                    infoForo = elUsuario.foros.find(f => f.idForo == idForo);
                }
                console.log(`** elUsuario.foros despues de creado el foro: ${elUsuario.foros}`);
                var infoConversacion = infoForo.conversaciones.find(c => c.idConversacion == idConversacion);
                if (!infoConversacion) {
                    var nuevoInfoConversacion = {
                        idConversacion,
                        respuestasLeidas: 0,
                    };
                    infoForo.conversaciones.push(nuevoInfoConversacion);
                    infoConversacion = infoForo.conversaciones.find(c => c.idConversacion == idConversacion);
                }
                infoConversacion.respuestasLeidas = cantidadRespuestasLeidas;
                console.log(`** elUsuario.foros después de creada la conversación: ${elUsuario.foros}`);
                console.log(`el usuario quedó: ${elUsuario}`);
                try {
                    yield elUsuario.save();
                }
                catch (error) {
                    console.log(`Error guardando nuevos datos del usuario. E: ${error}`);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                return true;
            });
        }
    },
    Foro: {
        miembros: function (parent, _, __) {
            return __awaiter(this, void 0, void 0, function* () {
                if (!parent.miembros) {
                    return [];
                }
                let idsMiembros = parent.miembros;
                try {
                    var usuariosMiembros = yield Usuario_1.ModeloUsuario.find({ _id: { $in: idsMiembros } }).exec();
                    if (!usuariosMiembros) {
                        console.log(`No habia usuarios miembros`);
                    }
                }
                catch (error) {
                    console.log(`error buscando a los miembros del proyecto. E: ${error}`);
                    return [];
                }
                return usuariosMiembros;
            });
        },
    },
    Conversacion: {
        creador: function (parent, _, __) {
            return __awaiter(this, void 0, void 0, function* () {
                if (!parent.idCreador) {
                    return [];
                }
                let idCreador = parent.idCreador;
                try {
                    var usuarioCreador = yield Usuario_1.ModeloUsuario.findById(idCreador).exec();
                    if (!usuarioCreador) {
                        console.log(`El usuario no existe en la base de datos enviando un dummy`);
                        return {
                            id: "-1",
                            username: "?",
                            nombres: "?",
                            apellidos: "?",
                            email: "?",
                            numeroTel: "?",
                            lugarResidencia: "?",
                            edad: 0,
                            idGrupoEstudiantil: "?",
                            nombreGrupoEstudiantil: "?",
                        };
                    }
                }
                catch (error) {
                    console.log(`error buscando al creador de la conversación. E: ${error}`);
                    return [];
                }
                return usuarioCreador;
            });
        },
    },
    RespuestaConversacionForo: {
        autor: function (parent, _, __) {
            return __awaiter(this, void 0, void 0, function* () {
                if (!parent.idAutor) {
                    return [];
                }
                let idAutor = parent.idAutor;
                try {
                    var usuarioAutor = yield Usuario_1.ModeloUsuario.findById(idAutor).exec();
                    if (!usuarioAutor) {
                        console.log(`El usuario no existe en la base de datos enviando un dummy`);
                        return {
                            id: "-1",
                            username: "?",
                            nombres: "?",
                            apellidos: "?",
                            email: "?",
                            numeroTel: "?",
                            lugarResidencia: "?",
                            edad: 0,
                            idGrupoEstudiantil: "?",
                            nombreGrupoEstudiantil: "?",
                        };
                    }
                }
                catch (error) {
                    console.log(`error buscando al autor de la respuesta. E: ${error}`);
                    return [];
                }
                return usuarioAutor;
            });
        },
    },
    InfoUltimaRespuesta: {
        autor: function (parent, _, __) {
            return __awaiter(this, void 0, void 0, function* () {
                if (!parent.idAutor) {
                    return [];
                }
                let idAutor = parent.idAutor;
                try {
                    var usuarioAutor = yield Usuario_1.ModeloUsuario.findById(idAutor).exec();
                    if (!usuarioAutor) {
                        console.log(`El usuario no existe en la base de datos enviando un dummy`);
                        return {
                            id: "-1",
                            username: "?",
                            nombres: "?",
                            apellidos: "?",
                            email: "?",
                            numeroTel: "?",
                            lugarResidencia: "?",
                            edad: 0,
                            idGrupoEstudiantil: "?",
                            nombreGrupoEstudiantil: "?",
                        };
                    }
                }
                catch (error) {
                    console.log(`error buscando al autor de la respuesta. E: ${error}`);
                    return [];
                }
                return usuarioAutor;
            });
        },
    }
};
