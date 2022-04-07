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
const config_1 = require("../model/config");
const Espacio_1 = require("../model/Espacio");
const Evento_1 = require("../model/Evento");
const Eventos_1 = require("./Eventos");
exports.typeDefs = apollo_server_express_1.gql `
    type Espacio{
        id:ID,
        nombre:String,
        descripcion:String,
        idAdministrador:ID
    }

    input InputCrearEspacio{
        nombre:String,
        descripcion:String,
        idAdministrador:String,
    }

    extend type Query{
        espacio(idEspacio:ID!):Espacio,
        todosEspacios:[Espacio],
    }

    extend type Mutation{
        crearEspacio(info:InputCrearEspacio):Espacio,
        eliminarEspacio(idEspacio:ID!):Boolean,
        editarNombreEspacio(idEspacio:ID!, nuevoNombre: String!):Espacio,
        editarDescripcionEspacio(idEspacio:ID!, nuevoDescripcion: String!):Espacio,
    }
`;
exports.resolvers = {
    Query: {
        espacio(_, { idEspacio }, contexto) {
            return __awaiter(this, void 0, void 0, function* () {
                try {
                    var elEspacio = yield Espacio_1.ModeloEspacio.findById(idEspacio).exec();
                }
                catch (error) {
                    console.log(`Error buscando espacio: ${error}`);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                return elEspacio;
            });
        },
        todosEspacios(_, __, contexto) {
            return __awaiter(this, void 0, void 0, function* () {
                try {
                    var losEspacios = yield Espacio_1.ModeloEspacio.find({}).exec();
                }
                catch (error) {
                    console.log(`Error buscando espacios: ${error}`);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                return losEspacios;
            });
        }
    },
    Mutation: {
        crearEspacio(_, { info }, contexto) {
            return __awaiter(this, void 0, void 0, function* () {
                console.log(`Solicitud de crear un nuevo espacio`);
                if (!contexto.usuario || !contexto.usuario.id) {
                    console.log(`El usuario no estaba logeado`);
                    throw new apollo_server_express_1.AuthenticationError("Login requerido");
                }
                const credencialesUsuario = contexto.usuario;
                const permisosAutorizados = ["superadministrador", "maestraVida-profesor"];
                if (!credencialesUsuario.permisos.some(p => permisosAutorizados.includes(p))) {
                    console.log(`El usuario no contaba con los permisos necesarios`);
                    throw new apollo_server_express_1.AuthenticationError("No autorizado");
                }
                var nuevoEspacio = new Espacio_1.ModeloEspacio(Object.assign({}, info));
                try {
                    yield nuevoEspacio.save();
                }
                catch (error) {
                    console.log(`Error creando el nuevo espacio: ${error}`);
                    throw new apollo_server_express_1.ApolloError("Error guardando");
                }
                return nuevoEspacio;
            });
        },
        eliminarEspacio(_, { idEspacio }, contexto) {
            return __awaiter(this, void 0, void 0, function* () {
                if (!contexto.usuario || !contexto.usuario.id) {
                    console.log(`Usuario no logeado`);
                    throw new apollo_server_express_1.AuthenticationError("Login requerido");
                }
                console.log(`Query de eliminar espaciocon id ${idEspacio}`);
                try {
                    var elEspacio = yield Espacio_1.ModeloEspacio.findById(idEspacio).exec();
                }
                catch (error) {
                    console.log(`Error buscando el espacio: ${error}`);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                //Authorización
                const permisosEspeciales = ["superadministrador"];
                const credencialesUsuario = contexto.usuario;
                if (elEspacio.idAdministrador != credencialesUsuario.id && !credencialesUsuario.permisos.some(p => permisosEspeciales.includes(p))) {
                    console.log(`Error de autenticacion eliminando espacio`);
                    throw new apollo_server_express_1.AuthenticationError("No autorizado");
                }
                try {
                    var losEventosAsociados = yield Evento_1.ModeloEventoPublico.find({ "idParent": elEspacio.id }).exec();
                }
                catch (error) {
                    console.log(`Error buscando eventos asociados al espacio que se eliminará: ${error}`);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                console.log(`Había ${losEventosAsociados.length} eventos publicos asociados a este espacio. Se eliminarán`);
                console.log(`${losEventosAsociados.map(e => e.horarioInicio)}`);
                const listaIds = losEventosAsociados.map(e => e._id);
                losEventosAsociados.forEach((eventoPublico) => __awaiter(this, void 0, void 0, function* () {
                    yield Eventos_1.reScheduleEventosEnmarcadosEnEventoPublicoEliminado(eventoPublico);
                }));
                try {
                    yield Evento_1.ModeloEventoPublico.deleteMany({ _id: { $in: listaIds } });
                    yield Espacio_1.ModeloEspacio.findByIdAndRemove(idEspacio).exec();
                }
                catch (error) {
                    console.log(`Error removiendo el espacio: ${error}`);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                console.log(`Espacio eliminado`);
                return true;
            });
        },
        editarNombreEspacio(_, { idEspacio, nuevoNombre }, contexto) {
            return __awaiter(this, void 0, void 0, function* () {
                console.log(`Query de cambiar el nombre del espacio con id ${idEspacio}`);
                if (!contexto.usuario || !contexto.usuario.id) {
                    console.log(`Sin credenciales de usuario`);
                    throw new apollo_server_express_1.AuthenticationError("Login requerido");
                }
                nuevoNombre = nuevoNombre.trim();
                nuevoNombre = nuevoNombre.replace(/[\n\r]/g, " ");
                nuevoNombre = nuevoNombre.replace(/\s\s+/g, " ");
                if (config_1.charProhibidosNombreCosa.test(nuevoNombre)) {
                    throw new apollo_server_express_1.UserInputError("Nombre ilegal");
                }
                try {
                    var elEspacio = yield Espacio_1.ModeloEspacio.findById(idEspacio).exec();
                    if (!elEspacio) {
                        throw "espacio no encontrado";
                    }
                }
                catch (error) {
                    console.log("Error buscando el espacio a cambiar nombre en la base de datos. E: " + error);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                //Authorización
                const permisosEspeciales = ["superadministrador"];
                const credencialesUsuario = contexto.usuario;
                if (elEspacio.idAdministrador != credencialesUsuario.id && !credencialesUsuario.permisos.some(p => permisosEspeciales.includes(p))) {
                    console.log(`Error de autenticacion editando nombre de espacio`);
                    throw new apollo_server_express_1.AuthenticationError("No autorizado");
                }
                elEspacio.nombre = nuevoNombre;
                try {
                    yield elEspacio.save();
                }
                catch (error) {
                    console.log("Error guardando el espacio con nuevo nombre. E: " + error);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                console.log(`Nombre cambiado`);
                return elEspacio;
            });
        },
        editarDescripcionEspacio(_, { idEspacio, nuevoDescripcion }, contexto) {
            return __awaiter(this, void 0, void 0, function* () {
                console.log(`Query de cambiar la descripcion del espacio con id ${idEspacio}`);
                if (!contexto.usuario || !contexto.usuario.id) {
                    console.log(`Sin credenciales de usuario`);
                    throw new apollo_server_express_1.AuthenticationError("Login requerido");
                }
                if (config_1.charProhibidosTexto.test(nuevoDescripcion)) {
                    throw new apollo_server_express_1.ApolloError("Descripcion ilegal");
                }
                nuevoDescripcion = nuevoDescripcion.trim();
                try {
                    var elEspacio = yield Espacio_1.ModeloEspacio.findById(idEspacio).exec();
                    if (!elEspacio) {
                        throw "espacio no encontrado";
                    }
                }
                catch (error) {
                    console.log("Error buscando el espacio a cambiar descripción en la base de datos. E: " + error);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                //Authorización
                const permisosEspeciales = ["superadministrador"];
                const credencialesUsuario = contexto.usuario;
                if (elEspacio.idAdministrador != credencialesUsuario.id && !credencialesUsuario.permisos.some(p => permisosEspeciales.includes(p))) {
                    console.log(`Error de autenticacion`);
                    throw new apollo_server_express_1.AuthenticationError("No autorizado");
                }
                elEspacio.descripcion = nuevoDescripcion;
                try {
                    yield elEspacio.save();
                }
                catch (error) {
                    console.log("Error guardando el espacio con nueva descripción. E: " + error);
                    throw new apollo_server_express_1.ApolloError("Error de conexión con la base de datos");
                }
                console.log(`Descripcion cambiado`);
                //Dar esta descripcion a los eventos públicos de este espacio que no la tengan.
                try {
                    yield Evento_1.ModeloEventoPublico.updateMany({ idParent: elEspacio.id, descripcion: null }, { $set: { descripcion: elEspacio.descripcion } });
                }
                catch (error) {
                    console.log(`Error updating los eventos publicos children.`);
                }
                return elEspacio;
            });
        },
    }
};
