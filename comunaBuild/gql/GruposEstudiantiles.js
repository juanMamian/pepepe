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
exports.resolvers = exports.NUEVA_PARTICIPACION_ESTUDIANTIL = exports.typeDefs = void 0;
const apollo_server_express_1 = require("apollo-server-express");
const fs_1 = __importDefault(require("fs"));
const mongoose_1 = __importDefault(require("mongoose"));
const GrupoEstudiantil_1 = require("../model/actividadesProfes/GrupoEstudiantil");
const Usuario_1 = require("../model/Usuario");
const path_1 = __importDefault(require("path"));
const utilidades_1 = require("../routes/utilidades");
exports.typeDefs = apollo_server_express_1.gql `

    type MinimoElemento{
        tipo:String,
        id:ID,
        nombre:String 
    }

    type InfoParticipacionEnDesarrolloEstudiantil{        
        idDesarrollo:ID,
        participacion:ParticipacionActividadGrupoEstudiantil,
    }

    type InfoArchivo{
        nombre: String,
        extension: String,
        accesible: String,        
    }

    type ParticipacionActividadGrupoEstudiantil{
        id: ID,
        fechaUpload:Date,
        comentario:String,
        archivo:InfoArchivo,        
        infoAutor:MinimoUsuario,
    }

    type DesarrolloActividadGrupoEstudiantil{
        id: ID,        
        estado:String,
        participaciones: [ParticipacionActividadGrupoEstudiantil],
        leidoPorProfe:Boolean,
        infoEstudiante:MinimoUsuario
    }

    type ActividadGrupoEstudiantil{        
        id: ID,
        nombre: String,
        fechaUpload:Date,
        desarrollos:[DesarrolloActividadGrupoEstudiantil],
        infoCreador:MinimoUsuario
        hayGuia: String,
    }

    type PaginaActividadesGrupoEstudiantil{
        hayMas:Boolean,
        actividades:[ActividadGrupoEstudiantil]
    }

    type GrupoEstudiantil{
        id:ID,
        nombre:String,        
        estudiantes:[PublicUsuario],
    }

    extend type Query{
        grupoEstudiantil(idGrupo:ID!):GrupoEstudiantil,
        misActividadesCreadasGrupoEstudiantil(idGrupo: ID!, pagina:Int!):PaginaActividadesGrupoEstudiantil,
        todasActividadesGrupoEstudiantil(idGrupo: ID!, pagina:Int!):PaginaActividadesGrupoEstudiantil,
        gruposEstudiantiles:[GrupoEstudiantil],
        addEstudianteGrupoEstudiantil:GrupoEstudiantil,
        actividadDeGrupoEstudiantil(idGrupo:ID!, idActividad:ID!):ActividadGrupoEstudiantil,
        actividadEstudiantil(idActividad:ID!):ActividadGrupoEstudiantil,
        actividadesEstudiantilesDeProfe(idProfe:ID!):[ActividadGrupoEstudiantil],
        misActividadesEstudiantilesDeProfe(idProfe:ID!):[ActividadGrupoEstudiantil],
        desarrolloUsuarioEnActividadEstudiantil(idEstudiante:ID!, idActividad:ID!):DesarrolloActividadGrupoEstudiantil,
        desarrolloEnActividadEstudiantil(idDesarrollo:ID!, idActividad:ID!):DesarrolloActividadGrupoEstudiantil,

    }
    extend type Mutation{
        addEstudianteGrupoEstudiantil(idEstudiante: ID!, idGrupoEstudiantil:ID!):GrupoEstudiantil,
        removeEstudianteGrupoEstudiantil(idEstudiante:ID!, idGrupo:ID!):GrupoEstudiantil,
        crearActividadEnGrupoEstudiantil(idGrupo:ID!):ActividadGrupoEstudiantil,
        eliminarActividadDeGrupoEstudiantil(idActividad:ID!, idGrupo: ID!):Boolean,
        cambiarNombreActividadEstudiantil(idActividad:ID!, nuevoNombre: String):ActividadGrupoEstudiantil
        eliminarParticipacionActividadEstudiantil(idParticipacion:ID!):Boolean,
        setEstadoDesarrolloActividadEstudiantil(idDesarrollo:ID!, nuevoEstado: String):DesarrolloActividadGrupoEstudiantil,
        setLeidoPorProfeDesarrolloEstudiantil(idDesarrollo:ID!, nuevoLeidoPorProfe:Boolean):DesarrolloActividadGrupoEstudiantil
    }

    extend type Subscription{        
        nuevaRespuestaDesarrolloEstudiantil(idGrupo:ID, idProfe: ID, idActividad:ID):InfoParticipacionEnDesarrolloEstudiantil
    }
`;
exports.NUEVA_PARTICIPACION_ESTUDIANTIL = "nueva_participacion_estudiantil";
const sizePaginaActividades = 5;
exports.resolvers = {
    Subscription: {
        nuevaRespuestaDesarrolloEstudiantil: {
            subscribe: apollo_server_express_1.withFilter((_, { idGrupo, idProfe, idActividad }, contexto) => {
                console.log(`--------------------------Creando una subscripción de ${contexto.usuario.username} a nuevas respuestas`);
                if (idGrupo) {
                    console.log(`A nuevas respuestas en el grupo ${idGrupo}`);
                }
                if (idProfe) {
                    console.log(`A nuevas respuestas del profe ${idProfe}`);
                }
                if (idActividad) {
                    console.log(`A nuevas respuestas en la actividad ${idActividad}`);
                }
                return contexto.pubsub.asyncIterator(exports.NUEVA_PARTICIPACION_ESTUDIANTIL);
            }, (payloadNuevaRespuesta, variables, contexto) => {
                //Si la respuesta ocurre en un profe distinto al target de la subscricpion
                if (variables.idProfe) {
                    if (payloadNuevaRespuesta.idCreadorActividad != variables.idProfe) {
                        return false;
                    }
                }
                //Si la respuesta ocurre en un grupo distinto al target de la subscricpion
                if (variables.idGrupo) {
                    if (variables.idGrupo != payloadNuevaRespuesta.idGrupo) {
                        return false;
                    }
                }
                if (variables.idActividad) {
                    if (variables.idActividad != payloadNuevaRespuesta.idActividad) {
                        return false;
                    }
                }
                //El usuario es el mismo que publicó la respuesta. No se le notifica, se maneja en el cliente con cache de apollo-vue
                if (payloadNuevaRespuesta.nuevaRespuestaDesarrolloEstudiantil.participacion.idAutor == contexto.usuario.id) {
                    return false;
                }
                let permisosAmplios = [
                    "actividadesEstudiantiles-profe",
                    "actividadesEstudiantiles-administrador",
                    "actividadesEstudiantiles-guia"
                ];
                //Si no hace parte de los permisos amplios, es un estudiante. Solo tiene acceso a respuestas publicadas en sus propios desarrollos
                if (!contexto.usuario.permisos.some(p => permisosAmplios.includes(p))) {
                    if (payloadNuevaRespuesta.idEstudianteDesarrollo != contexto.usuario.id) {
                        return false;
                    }
                }
                console.log(`Notificando a ${contexto.usuario.username}`);
                return true;
            })
        }
    },
    Query: {
        desarrolloEnActividadEstudiantil: function (_, { idDesarrollo, idActividad }, contexto) {
            return __awaiter(this, void 0, void 0, function* () {
                console.log(`|||||||||||||||||||||||||||||||`);
                console.log(`Solicitud de desarrollo con id ${idDesarrollo} en la actividad con id ${idActividad}`);
                try {
                    var elGrupo = yield GrupoEstudiantil_1.ModeloGrupoEstudiantil.findOne({ "actividades._id": mongoose_1.default.Types.ObjectId(idActividad) }).exec();
                    if (!elGrupo) {
                        throw "Grupo no encontrado";
                    }
                }
                catch (error) {
                    console.log(`Error buscando la actividad en los grupos estudiantiles. E: ${error}`);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                console.log(`Encontrado grupo: ${elGrupo.nombre}`);
                let laActividad = elGrupo.actividades.id(idActividad);
                console.log(`Encontrada actividad: ${laActividad.nombre}`);
                let elDesarrollo = laActividad.desarrollos.id(idDesarrollo);
                if (!elDesarrollo) {
                    console.log(`Desarrollo no encontrado`);
                    throw new apollo_server_express_1.ApolloError("Dato no existia");
                }
                console.log(`Enviando un desarrollo`);
                return elDesarrollo;
            });
        },
        desarrolloUsuarioEnActividadEstudiantil: function (_, { idEstudiante, idActividad }, contexto) {
            return __awaiter(this, void 0, void 0, function* () {
                console.log(`Solicitud de desarrollo de un usuario con id ${idEstudiante} en la actividad con id ${idActividad}`);
                // let credencialesUsuario=contexto.usuario;
                //     if(!credencialesUsuario.id){
                //         console.log(`Usuario no logeado`);
                //         throw new AuthenticationError("No autorizado");
                // }
                try {
                    var elUsuario = yield Usuario_1.ModeloUsuario.findById(idEstudiante).exec();
                    if (!elUsuario)
                        throw "Usuario no encontrado en la base de datos";
                }
                catch (error) {
                    console.log(`Error buscando al usuario con id ${idEstudiante} en la base de datos. E: ${error}`);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                console.log(`Buscando el grupo`);
                try {
                    var elGrupo = yield GrupoEstudiantil_1.ModeloGrupoEstudiantil.findOne({ "actividades._id": mongoose_1.default.Types.ObjectId(idActividad) }).exec();
                    if (!elGrupo) {
                        throw "Grupo no encontrado";
                    }
                }
                catch (error) {
                    console.log(`Error buscando la actividad en los grupos estudiantiles. E: ${error}`);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                console.log(`Encontrado grupo: ${elGrupo.nombre}`);
                let laActividad = elGrupo.actividades.id(idActividad);
                console.log(`Encontrada actividad: ${laActividad.nombre}`);
                let elDesarrollo = laActividad.desarrollos.find(d => d.idEstudiante == idEstudiante);
                if (!elDesarrollo)
                    elDesarrollo = [];
                console.log(`Enviando un desarrollo`);
                return elDesarrollo;
            });
        },
        grupoEstudiantil: function (_, { idGrupo }, contexto) {
            return __awaiter(this, void 0, void 0, function* () {
                console.log(`||||||||||||||||||||||`);
                console.log(`Peticion de un grupo estudiantil con id ${idGrupo}`);
                try {
                    var elGrupoEstudiantil = yield GrupoEstudiantil_1.ModeloGrupoEstudiantil.findById(idGrupo).exec();
                    if (!elGrupoEstudiantil) {
                        throw "grupo no encontrado";
                    }
                }
                catch (error) {
                    console.log(`Error buscando el grupo con ide ${idGrupo} en la base de datos. E:${error}`);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                console.log(`enviando el grupo estudiantil`);
                return elGrupoEstudiantil;
            });
        },
        misActividadesCreadasGrupoEstudiantil(_, { idGrupo, pagina }, contexto) {
            return __awaiter(this, void 0, void 0, function* () {
                console.log(`|||||||||||||||||||||1`);
                console.log(`Petición de actividades creadas por el usuario`);
                let credencialesUsuario = contexto.usuario;
                try {
                    var elGrupo = yield GrupoEstudiantil_1.ModeloGrupoEstudiantil.findById(idGrupo).exec();
                    if (!elGrupo)
                        throw "Grupo no encontrado";
                }
                catch (error) {
                    console.log(`Error buscando el grupo. E: ${error}`);
                    return new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                var ColeccionActividadesEsteGrupo = mongoose_1.default.model("actividadesGrupo" + elGrupo._id, GrupoEstudiantil_1.esquemaActividad, "actividadesGrupo" + elGrupo._id);
                try {
                    var numActividades = yield ColeccionActividadesEsteGrupo.countDocuments({ idCreador: credencialesUsuario.id }).exec();
                    var actividadesCreadasUsuario = yield ColeccionActividadesEsteGrupo.find({ idCreador: credencialesUsuario.id }).limit(sizePaginaActividades).skip(pagina * sizePaginaActividades).exec();
                }
                catch (error) {
                    console.log(`Error buscando actividades creadas por el usuario en la colección. E: ${error}`);
                    return new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                let hayMas = pagina * sizePaginaActividades < numActividades;
                console.log(`Enviando actividades creadas por el usuario`);
                return { hayMas, actividades: actividadesCreadasUsuario };
            });
        },
        todasActividadesGrupoEstudiantil(_, { idGrupo, pagina }, contexto) {
            return __awaiter(this, void 0, void 0, function* () {
                console.log(`|||||||||||||||||||||1`);
                console.log(`Petición de todas actividades de grupo`);
                try {
                    var elGrupo = yield GrupoEstudiantil_1.ModeloGrupoEstudiantil.findById(idGrupo).exec();
                    if (!elGrupo)
                        throw "Grupo no encontrado";
                }
                catch (error) {
                    console.log(`Error buscando el grupo. E: ${error}`);
                    return new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                var ColeccionActividadesEsteGrupo = mongoose_1.default.model("actividadesGrupo" + elGrupo._id, GrupoEstudiantil_1.esquemaActividad, "actividadesGrupo" + elGrupo._id);
                try {
                    var numActividades = yield ColeccionActividadesEsteGrupo.countDocuments({}).exec();
                    var actividadesGrupo = yield ColeccionActividadesEsteGrupo.find({}).sort({ fechaUpload: -1 }).limit(sizePaginaActividades).skip(pagina * sizePaginaActividades).exec();
                }
                catch (error) {
                    console.log(`Error buscando actividades creadas por el usuario en la colección. E: ${error}`);
                    return new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                let hayMas = pagina * sizePaginaActividades < numActividades;
                console.log(`Enviando todas actividades del grupo ${elGrupo.nombre}`);
                return { hayMas, actividades: actividadesGrupo };
            });
        },
        gruposEstudiantiles: function (_, __, contexto) {
            return __awaiter(this, void 0, void 0, function* () {
                console.log(`solicitud de todos los grupos estudiantiles`);
                let credencialesUsuario = contexto.usuario;
                if (!contexto.usuario) {
                    console.log("Usuario no logeado");
                    throw new apollo_server_express_1.AuthenticationError("No autorizado");
                }
                try {
                    var elLogeado = yield Usuario_1.ModeloUsuario.findById(credencialesUsuario.id).exec();
                    if (!elLogeado) {
                        throw "usuario no encontrado";
                    }
                }
                catch (error) {
                    console.log("Error buscando el usuario en la base de datos. E: " + error);
                    throw new apollo_server_express_1.ApolloError("");
                }
                if (!elLogeado) {
                    console.log(`${credencialesUsuario.id} no fue encontrado en la base de datos`);
                    throw new apollo_server_express_1.AuthenticationError("No autorizado");
                }
                console.log(`Usuario logeado: ${credencialesUsuario.id}`);
                try {
                    var gruposEstudiantiles = yield GrupoEstudiantil_1.ModeloGrupoEstudiantil.find({}).exec();
                }
                catch (error) {
                    console.log("Error descargando los grupos estudiantiles de la base de datos. E: " + error);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                console.log(`enviando todos los grupos estudiantiles`);
                return gruposEstudiantiles;
            });
        },
        actividadDeGrupoEstudiantil: function (_, { idGrupo, idActividad }, contexto) {
            return __awaiter(this, void 0, void 0, function* () {
                console.log(`|||||||||||||||||||`);
                console.log(`Solicitud de una actividad con id ${idActividad} de un grupo estudiantil con id ${idGrupo}`);
                try {
                    let elGrupo = yield GrupoEstudiantil_1.ModeloGrupoEstudiantil.findById(idGrupo).exec();
                    if (!elGrupo) {
                        throw "grupo no encontrado";
                    }
                    var laActividad = elGrupo.actividades.id(idActividad);
                }
                catch (error) {
                    console.log(`Error buscando grupo y actividad en la base de datos. E: ${error}`);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                return laActividad;
            });
        },
        actividadEstudiantil: function (_, { idActividad }, contexto) {
            return __awaiter(this, void 0, void 0, function* () {
                console.log(`Solicitud de actividad con id ${idActividad}`);
                try {
                    let elGrupo = yield GrupoEstudiantil_1.ModeloGrupoEstudiantil.findOne({ "actividades._id": mongoose_1.default.Types.ObjectId(idActividad) }).exec();
                    if (!elGrupo) {
                        throw "grupo no encontrado";
                    }
                    var laActividad = elGrupo.actividades.id(idActividad);
                }
                catch (error) {
                    console.log(`Error buscando actividad en la base de datos. E: ${error}`);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                console.log(`Enviando ${laActividad.nombre}`);
                return laActividad;
            });
        },
        actividadesEstudiantilesDeProfe: function (_, { idProfe }, contexto) {
            return __awaiter(this, void 0, void 0, function* () {
                console.log(`||||||||||||||||||||||||||||||||||||||||||`);
                console.log(`Solicitud de actividades estudiantiles del profe con id ${idProfe}`);
                try {
                    var losGrupos = yield GrupoEstudiantil_1.ModeloGrupoEstudiantil.find({ "actividades.idCreador": idProfe }).exec();
                }
                catch (error) {
                    console.log(`Error fetching grupos en la base de datos: E: ${error}`);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                console.log(`Encontrados grupos: ${losGrupos}`);
                let actividadesDelProfe = losGrupos.reduce((acc, g) => { return acc.concat(g.actividades); }, []).filter(a => a.idCreador == idProfe);
                console.log(`Enviando actividades del profe: ${actividadesDelProfe}`);
                return actividadesDelProfe;
            });
        },
        misActividadesEstudiantilesDeProfe: function (_, { idProfe }, contexto) {
            return __awaiter(this, void 0, void 0, function* () {
                console.log(`||||||||||||||||||||||||||||||||||||||||||`);
                console.log(`Solicitud de actividades estudiantiles del profe con id ${idProfe} para el usuario`);
                let credencialesUsuario = contexto.usuario;
                if (!credencialesUsuario || !credencialesUsuario.id) {
                    console.log("No habia credenciales de usuario");
                    throw new apollo_server_express_1.AuthenticationError("No autorizado");
                }
                let idUsuario = credencialesUsuario.id;
                try {
                    var losGrupos = yield GrupoEstudiantil_1.ModeloGrupoEstudiantil.find({ estudiantes: idUsuario }, "actividades").exec();
                    if (!losGrupos) {
                        throw "grupo no encontrado";
                    }
                    if (losGrupos.length < 1) {
                        console.log(`Usuario no hacia parte de ningún grupo`);
                        return [];
                    }
                }
                catch (error) {
                    console.log(`Error fetching grupos en la base de datos: E: ${error}`);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                let actividadesDelProfe = losGrupos.reduce((acc, g) => { return acc.concat(g.actividades); }, []).filter(a => a.idCreador == idProfe);
                console.log(`Enviando actividades del profe`);
                return actividadesDelProfe;
            });
        },
    },
    Mutation: {
        setLeidoPorProfeDesarrolloEstudiantil: function (_, { idDesarrollo, nuevoLeidoPorProfe }, contexto) {
            return __awaiter(this, void 0, void 0, function* () {
                console.log(`||||||||||||||||||||||||||`);
                console.log(`Solicitud de set leidoPorProfe en ${nuevoLeidoPorProfe} en desarrollo con id ${idDesarrollo}`);
                try {
                    var elGrupo = yield GrupoEstudiantil_1.ModeloGrupoEstudiantil.findOne({ "actividades.desarrollos._id": mongoose_1.default.Types.ObjectId(idDesarrollo) }).exec();
                    if (!elGrupo) {
                        throw "grupo no encontrado";
                    }
                    else {
                        let laActividad = elGrupo.actividades.find(a => a.desarrollos.some(d => d._id == idDesarrollo));
                        var elDesarrollo = laActividad.desarrollos.id(idDesarrollo);
                        elDesarrollo.leidoPorProfe = nuevoLeidoPorProfe;
                    }
                }
                catch (error) {
                    console.log(`Error buscando desarrollo en la base de datos: E: ${error}`);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                try {
                    yield elGrupo.save();
                }
                catch (error) {
                    console.log(`Error guardando el grupo modificado en la base de datos. E: ${error}`);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                console.log(`Set leido ok`);
                return elDesarrollo;
            });
        },
        setEstadoDesarrolloActividadEstudiantil: function (_, { idDesarrollo, nuevoEstado }, contexto) {
            return __awaiter(this, void 0, void 0, function* () {
                console.log(`||||||||||||||||||||||||||`);
                console.log(`Solicitud de set estado ${nuevoEstado} en desarrollo con id ${idDesarrollo}`);
                try {
                    var elGrupo = yield GrupoEstudiantil_1.ModeloGrupoEstudiantil.findOne({ "actividades.desarrollos._id": mongoose_1.default.Types.ObjectId(idDesarrollo) }).exec();
                    if (!elGrupo) {
                        throw "grupo no encontrado";
                    }
                    else {
                        console.log(`Encontrado grupo ${JSON.stringify(elGrupo.nombre)}`);
                        let laActividad = elGrupo.actividades.find(a => a.desarrollos.some(d => d._id == idDesarrollo));
                        console.log(`Actividad: ${laActividad.nombre}`);
                        var elDesarrollo = laActividad.desarrollos.id(idDesarrollo);
                        elDesarrollo.estado = nuevoEstado;
                    }
                }
                catch (error) {
                    console.log(`Error buscando desarrollo en la base de datos: E: ${error}`);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                try {
                    yield elGrupo.save();
                }
                catch (error) {
                    console.log(`Error guardando el grupo modificado en la base de datos. E: ${error}`);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                console.log(`Estado de desarrollo cambiado`);
                return elDesarrollo;
            });
        },
        addEstudianteGrupoEstudiantil: function (_, { idEstudiante, idGrupoEstudiantil }, contexto) {
            return __awaiter(this, void 0, void 0, function* () {
                console.log(`petición de añadir el estudiante con id ${idEstudiante} a grupo estudiantil con id ${idGrupoEstudiantil}`);
                let credencialesUsuario = contexto.usuario;
                if (!credencialesUsuario) {
                    console.log("No habia credenciales de usuario");
                    throw new apollo_server_express_1.AuthenticationError("No autorizado");
                }
                try {
                    var elGrupoEstudiantil = yield GrupoEstudiantil_1.ModeloGrupoEstudiantil.findById(idGrupoEstudiantil).exec();
                    if (!elGrupoEstudiantil) {
                        throw "grupo no encontrado";
                    }
                }
                catch (error) {
                    console.log("Error buscando el grupo estudiantil en la base de datos. E: " + error);
                    throw new apollo_server_express_1.ApolloError("Error de conexión con la base de datos");
                }
                //Authorizaion
                let permisosValidos = ["superadministrador"];
                if (!credencialesUsuario.permisos.some(p => permisosValidos.includes(p))) {
                    console.log(`No tiene los permisos necesarios, cancelando.`);
                    throw new apollo_server_express_1.AuthenticationError("No autorizado");
                }
                try {
                    var elUsuario = yield Usuario_1.ModeloUsuario.findById(idEstudiante).exec();
                    if (!elUsuario) {
                        console.log(`No se pudo encontrar al usuario con id ${idEstudiante} en la base de datos`);
                        throw new apollo_server_express_1.ApolloError("Error buscando al usuario en la base de datos");
                    }
                }
                catch (error) {
                    console.log("Error buscando al usuario en la base de datos. E: " + error);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                if (elGrupoEstudiantil.estudiantes.includes(idEstudiante)) {
                    console.log(`El usuario ya era estudiante de este grupo estudiantil`);
                    throw new apollo_server_express_1.ApolloError("El usuario ya estaba incluido");
                }
                elGrupoEstudiantil.estudiantes.push(idEstudiante);
                console.log(`Usuario añadido a la lista de estudiantes`);
                try {
                    yield elGrupoEstudiantil.save();
                }
                catch (error) {
                    console.log("Error guardando datos en la base de datos. E: " + error);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                console.log(`Proyecto guardado`);
                return elGrupoEstudiantil;
            });
        },
        removeEstudianteGrupoEstudiantil: function (_, { idGrupo, idEstudiante }, contexto) {
            return __awaiter(this, void 0, void 0, function* () {
                console.log(`Solicitud de remover un estudiante con id ${idEstudiante} de un grupo estudiantil con id ${idGrupo}`);
                let credencialesUsuario = contexto.usuario;
                if (!credencialesUsuario) {
                    console.log("No habia credenciales de usuario");
                    throw new apollo_server_express_1.AuthenticationError("No autorizado");
                }
                //Authorización
                let permisosValidos = ["superadministrador"];
                if (!credencialesUsuario.permisos.some(p => permisosValidos.includes(p))) {
                    console.log(`Error de autenticacion removiendo responsable o posible responsable de grupo estudiantil`);
                    throw new apollo_server_express_1.AuthenticationError("No autorizado");
                }
                try {
                    var elGrupoEstudiantil = yield GrupoEstudiantil_1.ModeloGrupoEstudiantil.findById(idGrupo).exec();
                    if (!elGrupoEstudiantil) {
                        throw "grupo no encontrado";
                    }
                }
                catch (error) {
                    console.log("Error buscando el grupo estudiantil en la base de datos. E: " + error);
                    throw new apollo_server_express_1.ApolloError("Error de conexión con la base de datos");
                }
                try {
                    var elUsuario = yield Usuario_1.ModeloUsuario.findById(idEstudiante).exec();
                    if (!elUsuario) {
                        console.log(`No se pudo encontrar al usuario con id ${idEstudiante} en la base de datos`);
                        throw new apollo_server_express_1.ApolloError("Error buscando al usuario en la base de datos");
                    }
                }
                catch (error) {
                    console.log("Error buscando al usuario en la base de datos. E: " + error);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                let indexEstudiante = elGrupoEstudiantil.estudiantes.indexOf(idEstudiante);
                if (indexEstudiante > -1) {
                    console.log(`sacando al estudiante ${idEstudiante} del grupo`);
                    elGrupoEstudiantil.estudiantes.splice(indexEstudiante, 1);
                }
                try {
                    yield elGrupoEstudiantil.save();
                }
                catch (error) {
                    console.log("Error guardando datos en la base de datos. E: " + error);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                console.log(`GrupoEstudiantil guardado`);
                return elGrupoEstudiantil;
            });
        },
        crearActividadEnGrupoEstudiantil: function (_, { idGrupo }, contexto) {
            return __awaiter(this, void 0, void 0, function* () {
                console.log(`Peticion de crear ua nueva actividad en el grupo con id ${idGrupo}`);
                try {
                    var elGrupoEstudiantil = yield GrupoEstudiantil_1.ModeloGrupoEstudiantil.findById(idGrupo).exec();
                    if (!elGrupoEstudiantil) {
                        throw "grupo no encontrado";
                    }
                }
                catch (error) {
                    console.log("GrupoEstudiantil no encontrado. E: " + error);
                    throw new apollo_server_express_1.ApolloError("Error conectandose con la base de datos");
                }
                //Authorización
                let credencialesUsuario = contexto.usuario;
                if (!credencialesUsuario.permisos.includes("actividadesEstudiantiles-profe")) {
                    console.log(`Error: el usuario no era profe`);
                    throw new apollo_server_express_1.AuthenticationError("No autorizado");
                }
                try {
                    var elUsuario = yield Usuario_1.ModeloUsuario.findById(credencialesUsuario.id).exec();
                    if (!elUsuario)
                        throw "Usuario no encontrado";
                }
                catch (error) {
                    console.log(`Error buscando usuario en la base de datos`);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                var infoCreador = {
                    id: elUsuario._id,
                    nombres: elUsuario.nombres,
                    apellidos: elUsuario.apellidos,
                    username: elUsuario.username
                };
                console.log(`creando una nueva actividad en el grupo ${elGrupoEstudiantil.nombre}`);
                console.log(`las actividades eran: ${elGrupoEstudiantil.actividades}`);
                try {
                    var nuevaActividad = elGrupoEstudiantil.actividades.create({ idCreador: credencialesUsuario.id, infoCreador });
                    elGrupoEstudiantil.actividades.push(nuevaActividad);
                    yield elGrupoEstudiantil.save();
                }
                catch (error) {
                    console.log("Error guardando la actividad creada en el grupo. E: " + error);
                    throw new apollo_server_express_1.ApolloError("Error introduciendo la actividad en el proyecto");
                }
                console.log(`Actividad creada exitosamente: ${nuevaActividad}`);
                return nuevaActividad;
            });
        },
        eliminarActividadDeGrupoEstudiantil: function (_, { idActividad, idGrupo }, contexto) {
            return __awaiter(this, void 0, void 0, function* () {
                console.log(`|||||||||||||||||||||||||||`);
                console.log(`peticion de eliminar una actividad con id ${idActividad} de un proyecto con id ${idGrupo}`);
                try {
                    var elGrupo = yield GrupoEstudiantil_1.ModeloGrupoEstudiantil.findById(idGrupo).exec();
                    if (!elGrupo) {
                        throw "grupo no encontrado";
                    }
                    console.log(`Grupo encontrado`);
                    var laActividad = elGrupo.actividades.id(idActividad);
                }
                catch (error) {
                    console.log("Error buscando el grupo en la base de datos. E: " + error);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                //Authorización
                let credencialesUsuario = contexto.usuario;
                if (!credencialesUsuario.permisos.includes("actividadesEstudiantiles-administrador") && !credencialesUsuario.permisos.includes("superadministrador") && laActividad.idCreador != credencialesUsuario.id) {
                    console.log(`Error de autenticacion editando nombre de grupo`);
                    throw new apollo_server_express_1.AuthenticationError("No autorizado");
                }
                try {
                    yield elGrupo.actividades.id(idActividad).remove();
                }
                catch (error) {
                    console.log(`Actividad ${idActividad} no encontrado. E: ` + error);
                    throw new apollo_server_express_1.ApolloError("");
                }
                try {
                    yield elGrupo.save();
                }
                catch (error) {
                    console.log("Error guardando el actividad creado en el grupo. E: " + error);
                    throw new apollo_server_express_1.ApolloError("Error introduciendo el actividad en el grupo");
                }
                console.log(`eliminado`);
                //Eliminando carpeta
                let pathActividad = path_1.default.join(__dirname, "../archivosDeUsuario/actividadesProfes/actividades", idActividad);
                fs_1.default.rmdir(pathActividad, { recursive: true }, (err) => {
                    if (err) {
                        console.log(`Error eliminando carpeta de actividad. E: ${err}`);
                    }
                });
                return true;
            });
        },
        cambiarNombreActividadEstudiantil(_, { idActividad, nuevoNombre }, contexto) {
            return __awaiter(this, void 0, void 0, function* () {
                console.log(`|||||||||||||||||||||||||||`);
                console.log(`cambiando el nombre de la actividad con id ${idActividad}`);
                var charProhibidosNombre = /[^ a-zA-ZÀ-ž0-9_():.,-]/g;
                nuevoNombre = nuevoNombre.replace(/\s\s+/g, " ");
                if (charProhibidosNombre.test(nuevoNombre)) {
                    throw new apollo_server_express_1.ApolloError("Nombre ilegal");
                }
                nuevoNombre = nuevoNombre.trim();
                try {
                    var elGrupo = yield GrupoEstudiantil_1.ModeloGrupoEstudiantil.findOne({ "actividades._id": idActividad }).exec();
                    if (!elGrupo) {
                        throw "grupo no encontrado";
                    }
                }
                catch (error) {
                    console.log("Error buscando el grupo. E: " + error);
                    throw new apollo_server_express_1.ApolloError("Erro en la conexión con la base de datos");
                }
                if (!elGrupo.actividades.id(idActividad)) {
                    console.log(`Actividad no encontrada en el grupo`);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la bse de datos");
                }
                //Authorización
                let credencialesUsuario = contexto.usuario;
                if (elGrupo.actividades.id(idActividad).idCreador != credencialesUsuario.id && !credencialesUsuario.permisos.includes("superadministrador")) {
                    console.log(`Error de autenticacion editando nombre de grupo`);
                    throw new apollo_server_express_1.AuthenticationError("No autorizado");
                }
                try {
                    elGrupo.actividades.id(idActividad).nombre = nuevoNombre;
                }
                catch (error) {
                    console.log("Error cambiando el nombre en la base de datos. E: " + error);
                    throw new apollo_server_express_1.ApolloError("Error guardando el nombre en la base de datos");
                }
                try {
                    yield elGrupo.save();
                }
                catch (error) {
                    console.log("Error guardando el grupo modificado en la base de datos. E: " + error);
                    throw new apollo_server_express_1.ApolloError("Error cambiando el nombre de la actividad");
                }
                console.log(`Nombre cambiado`);
                return elGrupo.actividades.id(idActividad);
            });
        },
        eliminarParticipacionActividadEstudiantil: function (_, { idParticipacion }, contexto) {
            return __awaiter(this, void 0, void 0, function* () {
                console.log(`||||||||||||||||||||||`);
                console.log(`Solicitud de eliminar participacion con id ${idParticipacion}`);
                let credencialesUsuario = contexto.usuario;
                if (!credencialesUsuario) {
                    console.log("No habia credenciales de usuario");
                    throw new apollo_server_express_1.AuthenticationError("No autorizado");
                }
                //Authorizaion
                let permisosValidos = ["superadministrador", "actividadesEstudiantiles-administrador"];
                if (!credencialesUsuario.permisos.some(p => permisosValidos.includes(p))) {
                    console.log(`No tiene los permisos necesarios, cancelando.`);
                    throw new apollo_server_express_1.AuthenticationError("No autorizado");
                }
                try {
                    var elGrupo = yield GrupoEstudiantil_1.ModeloGrupoEstudiantil.findOne({ "actividades.desarrollos.participaciones._id": mongoose_1.default.Types.ObjectId(idParticipacion) }).exec();
                    if (!elGrupo) {
                        console.log(`No se encontró grupo`);
                        throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                    }
                    else {
                        console.log(`Encontrado grupo ${JSON.stringify(elGrupo.nombre)}`);
                        let laActividad = elGrupo.actividades.find(a => a.desarrollos.some(d => d.participaciones.some(p => p._id == idParticipacion)));
                        console.log(`Actividad: ${laActividad.nombre}`);
                        let elDesarrollo = laActividad.desarrollos.find(d => d.participaciones.some(p => p._id == idParticipacion));
                        let lasParticipaciones = elDesarrollo.participaciones;
                        console.log(`Participaciones: ${lasParticipaciones}`);
                        lasParticipaciones.pull({ _id: idParticipacion });
                        console.log(`Participaciones: ${lasParticipaciones}`);
                        if (elDesarrollo.participaciones.length < 1) {
                            let idDesarrollo = elDesarrollo.id;
                            console.log(`Este desarrollo con id ${idDesarrollo} se quedó sin participaciones. Eliminando`);
                            laActividad.desarrollos.pull({ _id: idDesarrollo });
                        }
                    }
                }
                catch (error) {
                    console.log(`Error buscando grupo en la base de datos: E: ${error}`);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                try {
                    yield elGrupo.save();
                }
                catch (error) {
                    console.log(`Error guardando el grupo modificado en la base de datos. E: ${error}`);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                console.log(`Participacion eliminada`);
                return true;
            });
        },
    },
    GrupoEstudiantil: {
        estudiantes: function (parent, _, __) {
            return __awaiter(this, void 0, void 0, function* () {
                if (!parent.estudiantes) {
                    return [];
                }
                let idsEstudiantes = parent.estudiantes;
                try {
                    var usuariosEstudiantes = yield Usuario_1.ModeloUsuario.find({ _id: { $in: idsEstudiantes } }).exec();
                }
                catch (error) {
                    console.log(`error buscando a los estudiantes del proyecto. E: ${error}`);
                    return [];
                }
                return usuariosEstudiantes;
            });
        },
    },
    ActividadGrupoEstudiantil: {
        hayGuia: function (parent) {
            return __awaiter(this, void 0, void 0, function* () {
                let idActividad = "";
                if ("id" in parent) {
                    idActividad = parent.id;
                }
                else if ("_id" in parent) {
                    idActividad = parent._id.toString();
                }
                else {
                    console.log(`No habia campo id en el parent para decidir si HAY GUIA`);
                    return "";
                }
                if (parent.guiaGoogleDrive && parent.guiaGoogleDrive.enlace) {
                    return parent.guiaGoogleDrive.enlace;
                }
                else {
                    return "";
                }
                return "";
            });
        },
        id: function (parent) {
            return __awaiter(this, void 0, void 0, function* () {
                return parent._id;
            });
        }
    },
    InfoArchivo: {
        accesible: function (parent) {
            return __awaiter(this, void 0, void 0, function* () {
                let nombreArchivo = "";
                if ("nombre" in parent) {
                    nombreArchivo += parent.nombre;
                }
                else {
                    console.log(`No habia nombre para buscar el archivo`);
                    return "";
                }
                if ("extension" in parent) {
                    nombreArchivo += "." + parent.extension;
                }
                else {
                    console.log(`No habia info de la extension en la base de datos`);
                    return "";
                }
                if (parent.idGoogleDrive) {
                    try {
                        yield utilidades_1.jwToken.authorize();
                    }
                    catch (error) {
                        console.log(`Error autorizando token. E: ${error}`);
                    }
                    try {
                        let respuesta = yield utilidades_1.drive.files.get({ fileId: parent.idGoogleDrive, auth: utilidades_1.jwToken });
                        if (parent.googleDriveDirectLink) {
                            return parent.googleDriveDirectLink;
                        }
                    }
                    catch (error) {
                        console.log(`Error buscando archivo en google drive: E: ${error}`);
                        //return res.status(500).send("Error conectando con el servidor de google drive");
                    }
                }
                return "";
            });
        }
    },
};
