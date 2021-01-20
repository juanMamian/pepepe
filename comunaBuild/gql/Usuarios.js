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
exports.resolvers = exports.typeDefs = void 0;
const apollo_server_express_1 = require("apollo-server-express");
const Usuario_1 = require("../model/Usuario");
const graphql_iso_date_1 = require("graphql-iso-date");
const GrupoEstudiantil_1 = require("../model/actividadesProfes/GrupoEstudiantil");
exports.typeDefs = apollo_server_express_1.gql `
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
        idGrupoEstudiantil:String,       
        nombreGrupoEstudiantil:String,
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
        lugarResidencia:String,
        edad:Int,
        idGrupoEstudiantil:String,       
        nombreGrupoEstudiantil:String,
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
`;
exports.resolvers = {
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
                    var todosUsuarios = yield Usuario_1.ModeloUsuario.find({}).exec();
                }
                catch (error) {
                    console.log("Error fetching la lista de usuarios de la base de datos. E: " + error);
                    throw new apollo_server_express_1.ApolloError("Error de conexión a la base de datos");
                }
                console.log(`Enviando lista de todos los usuarios`);
                return todosUsuarios;
            });
        },
        publicUsuario: function (_, args, context) {
            return __awaiter(this, void 0, void 0, function* () {
                try {
                    var elUsuario = yield Usuario_1.ModeloUsuario.findById(args.idUsuario).exec();
                }
                catch (error) {
                    console.log(`error buscando usuario en la base de datos`);
                    throw new apollo_server_express_1.ApolloError("");
                }
                return elUsuario;
            });
        },
        yo: function (_, __, context) {
            return __awaiter(this, void 0, void 0, function* () {
                let credencialesUsuario = context.usuario;
                console.log(`el usuario con credenciales ${credencialesUsuario.username} accede a su propia información personal`);
                try {
                    var elUsuario = yield Usuario_1.ModeloUsuario.findById(credencialesUsuario.id);
                }
                catch (error) {
                    console.log("Error buscando el usuario en la base de datos. E: " + error);
                    throw new apollo_server_express_1.ApolloError("Error accediendo a los datos de usuario");
                }
                return elUsuario;
            });
        }
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
                let errores = elUsuario.validarDatosUsuario(nuevosDatos);
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
        }
    },
    Usuario: {
        edad: function (parent, _, __) {
            if (!parent.fechaNacimiento) {
                return 0;
            }
            let edad = Date.now() - parent.fechaNacimiento;
            let edadAños = edad / (60 * 60 * 24 * 365 * 1000);
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
        }
    },
    PublicUsuario: {
        edad: function (parent, _, __) {
            if (!parent.fechaNacimiento) {
                return 0;
            }
            let edad = Date.now() - parent.fechaNacimiento;
            let edadAños = edad / (60 * 60 * 24 * 365 * 1000);
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
                    let elGrupo = yield GrupoEstudiantil_1.ModeloGrupoEstudiantil.findOne({ estudiantes: parent._id }).exec();
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
        }
    },
    Date: {
        GraphQLDateTime: graphql_iso_date_1.GraphQLDateTime
    }
};