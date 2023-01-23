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
const Schema_1 = require("./Schema");
exports.typeDefs = apollo_server_express_1.gql `

    type IteracionSemanalEspacio{
        id: ID,
        millisInicio: Int,
        millisFinal:Int,
        idsParticipantesConstantes: [ID],
        diaSemana:Int,
        nombreEspacio:String,
        idAdministradorEspacio:String,
        idEspacio:ID,
        paraChiquis:Boolean,
    }

    type Espacio{
        id:ID,
        nombre:String,
        descripcion:String,
        idAdministrador:ID,
        iteracionesSemanales:[IteracionSemanalEspacio],
        paraChiquis:Boolean,
    }

    input InputCrearEspacio{
        nombre:String,
        descripcion:String,
        idAdministrador:String,
    }

    extend type Query{
        espacio(idEspacio:ID!):Espacio,
        todosEspacios:[Espacio],
        espaciosControladosUsuario:[Espacio],
        espaciosByUsuariosAdmin(idsUsuarios: [ID]!):[Espacio],
        iteracionesSemanalesEspaciosByAdministradores(idsAdministradores: [ID]!): [IteracionSemanalEspacio],
        bloquesHorarioUsuarioAsiste:[IteracionSemanalEspacio]
        
    }

    extend type Mutation{
        crearEspacio(info:InputCrearEspacio):Espacio,
        eliminarEspacio(idEspacio:ID!):Boolean,
        editarNombreEspacio(idEspacio:ID!, nuevoNombre: String!):Espacio,
        editarDescripcionEspacio(idEspacio:ID!, nuevoDescripcion: String!):Espacio,
        setEspacioParaChiquis(idEspacio: ID!, nuevoEstado: Boolean!): Espacio,
        
        crearBloqueHorario(idEspacio: ID!, diaSemana: Int!, millisInicio: Int!, millisFinal: Int): IteracionSemanalEspacio,
        setTiemposIteracionSemanalEspacio(idEspacio: ID!, idIteracion: ID!, millisInicio: Int!, millisFinal: Int!):IteracionSemanalEspacio,
        eliminarIteracionSemanalEspacio(idEspacio: ID!, idIteracion: ID!):Boolean,
        addAsistenteIteracionSemanalEspacio(idEspacio: ID!, idIteracion: ID!, idAsistente: ID!):IteracionSemanalEspacio,
        removeAsistenteIteracionSemanalEspacio(idEspacio: ID!, idIteracion: ID!, idAsistente: ID!):IteracionSemanalEspacio,
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
        },
        espaciosByUsuariosAdmin(_, { idsUsuarios }, contexto) {
            return __awaiter(this, void 0, void 0, function* () {
                try {
                    var losEspacios = yield Espacio_1.ModeloEspacio.find({ idAdministrador: idsUsuarios }).exec();
                }
                catch (error) {
                    console.log(`Error getting espacios : ` + error);
                    throw new apollo_server_express_1.ApolloError('Error conectando con la base de datos');
                }
                return losEspacios;
            });
        },
        iteracionesSemanalesEspaciosByAdministradores(_, { idsAdministradores }, contexto) {
            return __awaiter(this, void 0, void 0, function* () {
                console.log(`Getting iteraciones semanales para espacios administrados por ${idsAdministradores}`);
                try {
                    var losEspacios = yield Espacio_1.ModeloEspacio.find({ idAdministrador: { $in: idsAdministradores } }).exec();
                }
                catch (error) {
                    console.log(`Error getting espacios de los administradores : ` + error);
                    throw new apollo_server_express_1.ApolloError('Error conectando con la base de datos');
                }
                console.log(`Encontrados ${losEspacios.length} espacios`);
                var lasIteraciones = losEspacios.reduce((acc, espacio) => acc.concat(espacio.iteracionesSemanales), []);
                console.log(`Encontradas ${lasIteraciones.length} iteraciones`);
                return lasIteraciones;
            });
        },
        bloquesHorarioUsuarioAsiste(_, __, contexto) {
            var _a;
            return __awaiter(this, void 0, void 0, function* () {
                if (!((_a = contexto.usuario) === null || _a === void 0 ? void 0 : _a.id)) {
                    throw new apollo_server_express_1.AuthenticationError('loginRequerido');
                }
                const credencialesUsuario = contexto.usuario;
                try {
                    var losEspacios = yield Espacio_1.ModeloEspacio.find({ "iteracionesSemanales.idsParticipantesConstantes": credencialesUsuario.id }).exec();
                }
                catch (error) {
                    console.log(`Error getting espacios : ` + error);
                    throw new apollo_server_express_1.ApolloError('Error conectando con la base de datos');
                }
                var losBloques = [];
                for (const espacio of losEspacios) {
                    let bloquesUsuarioAsiste = espacio.iteracionesSemanales.filter(it => it.idsParticipantesConstantes.includes(credencialesUsuario.id));
                    losBloques.push(...bloquesUsuarioAsiste);
                }
                return losBloques;
            });
        },
        espaciosControladosUsuario(_, {}, contexto) {
            var _a;
            return __awaiter(this, void 0, void 0, function* () {
                if (!((_a = contexto.usuario) === null || _a === void 0 ? void 0 : _a.id)) {
                    throw new apollo_server_express_1.AuthenticationError('loginRequerido');
                }
                const credencialesUsuario = contexto.usuario;
                var queryOpts = {
                    idAdministrador: credencialesUsuario.id
                };
                if (credencialesUsuario.permisos.includes("superadministrador")) {
                    queryOpts = {};
                }
                try {
                    var losEspacios = yield Espacio_1.ModeloEspacio.find(queryOpts).exec();
                }
                catch (error) {
                    console.log(`Error getting espacios : ` + error);
                    throw new apollo_server_express_1.ApolloError('Error conectando con la base de datos');
                }
                if (credencialesUsuario.permisos.includes("superadministrador")) {
                    losEspacios.sort((a, b) => {
                        var res = 0;
                        if (a.idAdministrador === credencialesUsuario.id) {
                            res++;
                        }
                        if (b.idAdministrador === credencialesUsuario.id) {
                            res--;
                        }
                        return -res;
                    });
                }
                return losEspacios;
            });
        },
    },
    Mutation: {
        crearEspacio(_, { info }, contexto) {
            var _a;
            return __awaiter(this, void 0, void 0, function* () {
                if (!((_a = contexto.usuario) === null || _a === void 0 ? void 0 : _a.id)) {
                    throw new apollo_server_express_1.AuthenticationError('loginRequerido');
                }
                const credencialesUsuario = contexto.usuario;
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
        setEspacioParaChiquis(_, { idEspacio, nuevoEstado }, contexto) {
            var _a;
            return __awaiter(this, void 0, void 0, function* () {
                console.log('\x1b[35m%s\x1b[0m', `Mutación de set estado en ${nuevoEstado} para el espacio ${idEspacio}`);
                if (!((_a = contexto.usuario) === null || _a === void 0 ? void 0 : _a.id)) {
                    throw new apollo_server_express_1.AuthenticationError('loginRequerido');
                }
                const credencialesUsuario = contexto.usuario;
                try {
                    var elEspacio = yield Espacio_1.ModeloEspacio.findById(idEspacio).exec();
                    if (!elEspacio)
                        throw 'Espacio no encontrado';
                }
                catch (error) {
                    throw new apollo_server_express_1.ApolloError('Error conectando con la base de datos');
                }
                //Authorization
                const esAdministradorEspacio = elEspacio.idAdministrador === credencialesUsuario.id;
                const tienePermisosEspeciales = Schema_1.permisosEspecialesDefault.some(p => credencialesUsuario.permisos.includes(p));
                if (!esAdministradorEspacio && !tienePermisosEspeciales) {
                    throw new apollo_server_express_1.AuthenticationError('No autorizado');
                }
                elEspacio.paraChiquis = nuevoEstado;
                try {
                    yield elEspacio.save();
                }
                catch (error) {
                    throw new apollo_server_express_1.ApolloError('Error guardando espacio después de set paraChiquis');
                }
                console.log(`Estado para chiquis guardado`);
                return elEspacio;
            });
        },
        crearBloqueHorario(_, { idEspacio, millisInicio, millisFinal, diaSemana }, contexto) {
            var _a;
            return __awaiter(this, void 0, void 0, function* () {
                console.log('\x1b[35m%s\x1b[0m', `Query de crear iteración semanal de espacio ${idEspacio} con inicio ${millisInicio} y final ${millisFinal} en dia ${diaSemana} de la semana`);
                if (!((_a = contexto.usuario) === null || _a === void 0 ? void 0 : _a.id)) {
                    throw new apollo_server_express_1.AuthenticationError('loginRequerido');
                }
                const credencialesUsuario = contexto.usuario;
                try {
                    var elEspacio = yield Espacio_1.ModeloEspacio.findById(idEspacio).exec();
                    if (!elEspacio)
                        throw 'Espacio no encontrado';
                }
                catch (error) {
                    console.log('Error descargando el espacio de la base de datos: ' + error);
                    throw new apollo_server_express_1.ApolloError('Error conectando con la base de datos');
                }
                ;
                //Authorization
                const esAdministradorEspacio = elEspacio.idAdministrador === credencialesUsuario.id;
                const tienePermisosEspeciales = Schema_1.permisosEspecialesDefault.some(p => credencialesUsuario.permisos.includes(p));
                if (!esAdministradorEspacio && !tienePermisosEspeciales) {
                    throw new apollo_server_express_1.AuthenticationError("No autorizado");
                }
                var nuevoBloque = elEspacio.iteracionesSemanales.create({ millisInicio, millisFinal, diaSemana });
                elEspacio.iteracionesSemanales.push(nuevoBloque);
                try {
                    yield elEspacio.save();
                }
                catch (error) {
                    console.log(`Error guardando espacio con nuevo bloque de horario : ` + error);
                    throw new apollo_server_express_1.ApolloError('Error conectando con la base de datos');
                }
                console.log("Iteración Semanal creada");
                return nuevoBloque;
            });
        },
        setTiemposIteracionSemanalEspacio(_, { idEspacio, idIteracion, millisInicio, millisFinal }, contexto) {
            var _a;
            return __awaiter(this, void 0, void 0, function* () {
                console.log('\x1b[35m%s\x1b[0m', `Query de set tiempos de iteración semanal de espacio ${idEspacio} con id de iteración ${idIteracion} en inicio ${Math.round(millisInicio / 60000)}minutos y final ${Math.round(millisFinal / 60000)}minutos`);
                if (!((_a = contexto.usuario) === null || _a === void 0 ? void 0 : _a.id)) {
                    throw new apollo_server_express_1.AuthenticationError('loginRequerido');
                }
                const credencialesUsuario = contexto.usuario;
                try {
                    var elEspacio = yield Espacio_1.ModeloEspacio.findById(idEspacio).exec();
                    if (!elEspacio)
                        throw "Espacio no encontrado";
                }
                catch (error) {
                    console.log(`Error getting espacio : ` + error);
                    throw new apollo_server_express_1.ApolloError('Error conectando con la base de datos');
                }
                //Authorization
                const esAdministradorEspacio = elEspacio.idAdministrador === credencialesUsuario.id;
                const tienePermisosEspeciales = Schema_1.permisosEspecialesDefault.some(p => credencialesUsuario.permisos.includes(p));
                if (!esAdministradorEspacio && !tienePermisosEspeciales) {
                    throw new apollo_server_express_1.AuthenticationError("No autorizado");
                }
                var laIteracion = elEspacio.iteracionesSemanales.id(idIteracion);
                if (!laIteracion) {
                    throw new apollo_server_express_1.UserInputError("Iteración no encontrada");
                }
                laIteracion.millisInicio = millisInicio;
                laIteracion.millisFinal = millisFinal;
                try {
                    yield elEspacio.save();
                }
                catch (error) {
                    console.log(`Error guardando espacio después de set tiempos de iteración : ` + error);
                    throw new apollo_server_express_1.ApolloError('Error conectando con la base de datos');
                }
                console.log(`Tiempos set`);
                return laIteracion;
            });
        },
        eliminarIteracionSemanalEspacio(_, { idEspacio, idIteracion }, contexto) {
            var _a;
            return __awaiter(this, void 0, void 0, function* () {
                console.log('\x1b[35m%s\x1b[0m', `Query de eliminar iteración semanal de espacio ${idEspacio} con id de iteración ${idIteracion}`);
                if (!((_a = contexto.usuario) === null || _a === void 0 ? void 0 : _a.id)) {
                    throw new apollo_server_express_1.AuthenticationError('loginRequerido');
                }
                const credencialesUsuario = contexto.usuario;
                try {
                    var elEspacio = yield Espacio_1.ModeloEspacio.findById(idEspacio).exec();
                    if (!elEspacio)
                        throw "Espacio no encontrado";
                }
                catch (error) {
                    console.log(`Error getting espacio : ` + error);
                    throw new apollo_server_express_1.ApolloError('Error conectando con la base de datos');
                }
                const esAdministradorEspacio = elEspacio.idAdministrador === credencialesUsuario.id;
                const tienePermisosEspeciales = Schema_1.permisosEspecialesDefault.some(p => credencialesUsuario.permisos.includes(p));
                if (!esAdministradorEspacio && !tienePermisosEspeciales) {
                    throw new apollo_server_express_1.AuthenticationError("No autorizado");
                }
                const laIteracion = elEspacio.iteracionesSemanales.find(iteracion => iteracion.id === idIteracion);
                if (!laIteracion) {
                    throw new apollo_server_express_1.UserInputError("Iteración no encontrada");
                }
                laIteracion.remove();
                try {
                    yield elEspacio.save();
                }
                catch (error) {
                    console.log(`Error saving espacio tras eliminación de iteración : ` + error);
                    throw new apollo_server_express_1.ApolloError('Error conectando con la base de datos');
                }
                console.log("Eliminada");
                return true;
            });
        },
        addAsistenteIteracionSemanalEspacio(_, { idEspacio, idIteracion, idAsistente }, contexto) {
            var _a;
            return __awaiter(this, void 0, void 0, function* () {
                if (!((_a = contexto.usuario) === null || _a === void 0 ? void 0 : _a.id)) {
                    throw new apollo_server_express_1.AuthenticationError('loginRequerido');
                }
                const credencialesUsuario = contexto.usuario;
                try {
                    var elEspacio = yield Espacio_1.ModeloEspacio.findById(idEspacio).exec();
                    if (!elEspacio)
                        throw 'Espacio no encontrado';
                }
                catch (error) {
                    console.log('Error descargando el Espacio de la base de datos: ' + error);
                    throw new apollo_server_express_1.ApolloError('Error conectando con la base de datos');
                }
                ;
                var laIteracion = elEspacio.iteracionesSemanales.id(idIteracion);
                if (!laIteracion) {
                    throw new apollo_server_express_1.UserInputError("Iteración no encontrada");
                }
                // auth
                const esAdministradorEspacio = elEspacio.idAdministrador === credencialesUsuario.id;
                const tienePermisosEspeciales = Schema_1.permisosEspecialesDefault.some(p => credencialesUsuario.permisos.includes(p));
                if (!esAdministradorEspacio && !tienePermisosEspeciales) {
                    throw new apollo_server_express_1.AuthenticationError('No autorizado');
                }
                const indexA = laIteracion.idsParticipantesConstantes.indexOf(idAsistente);
                if (indexA > -1) {
                    console.log("El asistente ya estaba incluido");
                    throw new apollo_server_express_1.UserInputError("Asistente ya estaba registrado");
                }
                laIteracion.idsParticipantesConstantes.push(idAsistente);
                try {
                    yield elEspacio.save();
                }
                catch (error) {
                    console.log(`Error guardando el espacio con nuevo asistente en iteración semanal : ` + error);
                    throw new apollo_server_express_1.ApolloError('Error conectando con la base de datos');
                }
                console.log(`Asistente added`);
                return laIteracion;
            });
        },
        removeAsistenteIteracionSemanalEspacio(_, { idEspacio, idIteracion, idAsistente }, contexto) {
            var _a;
            return __awaiter(this, void 0, void 0, function* () {
                if (!((_a = contexto.usuario) === null || _a === void 0 ? void 0 : _a.id)) {
                    throw new apollo_server_express_1.AuthenticationError('loginRequerido');
                }
                const credencialesUsuario = contexto.usuario;
                try {
                    var elEspacio = yield Espacio_1.ModeloEspacio.findById(idEspacio).exec();
                    if (!elEspacio)
                        throw 'Espacio no encontrado';
                }
                catch (error) {
                    console.log('Error descargando el Espacio de la base de datos: ' + error);
                    throw new apollo_server_express_1.ApolloError('Error conectando con la base de datos');
                }
                ;
                var laIteracion = elEspacio.iteracionesSemanales.id(idIteracion);
                if (!laIteracion) {
                    throw new apollo_server_express_1.UserInputError("Iteración no encontrada");
                }
                // auth
                const esAdministradorEspacio = elEspacio.idAdministrador === credencialesUsuario.id;
                const tienePermisosEspeciales = Schema_1.permisosEspecialesDefault.some(p => credencialesUsuario.permisos.includes(p));
                if (!esAdministradorEspacio && !tienePermisosEspeciales) {
                    throw new apollo_server_express_1.AuthenticationError('No autorizado');
                }
                const indexA = laIteracion.idsParticipantesConstantes.indexOf(idAsistente);
                if (indexA === -1) {
                    console.log("El asistente no estaba incluido");
                    throw new apollo_server_express_1.UserInputError("Asistente no estaba registrado");
                }
                laIteracion.idsParticipantesConstantes.splice(indexA, 1);
                try {
                    yield elEspacio.save();
                }
                catch (error) {
                    console.log(`Error guardando el espacio con asistente removido de iteración semanal : ` + error);
                    throw new apollo_server_express_1.ApolloError('Error conectando con la base de datos');
                }
                console.log(`Asistente removed`);
                return laIteracion;
            });
        }
    },
};
