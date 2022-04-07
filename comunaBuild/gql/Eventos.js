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
exports.reScheduleEventosEnmarcadosEnEventoPublicoEliminado = exports.resolvers = exports.typeDefs = void 0;
const apollo_server_express_1 = require("apollo-server-express");
const Evento_1 = require("../model/Evento");
const Usuario_1 = require("../model/Usuario");
const config_1 = require("../model/config");
const Espacio_1 = require("../model/Espacio");
const NodoSolidaridad_1 = require("../model/atlasSolidaridad/NodoSolidaridad");
const AtlasSolidaridad_1 = require("./AtlasSolidaridad");
var mongoose = require('mongoose');
exports.typeDefs = apollo_server_express_1.gql `
    
    type InfoEventoCalendario{
        id:ID,
        tipoParent:String,
        nombreParent:String,
        participantes:PublicUsuario
    }

    input InputCrearEventoPublico{
        
        nombre:String,
        descripcion: String,
        horarioInicio:Date,
        horarioFinal:Date,
        idAdministrador:ID,
        limiteDeCupos:Int,
        lugar:ID,
        idParent: ID,
        tipoParent:String
    }
    input InputCrearEventoPersonal{        
        idPersona:ID!,
        idParent: ID,
        tipoParent:String,
        nombre:String,
        descripcion: String,
        horarioInicio:Date,
        horarioFinal:Date,
        idEventoMarco:ID,
        lugar:ID,

    }

    type EventoPublico{
        id: ID,
        nombre: String,
        descripcion: String,  
        idAdministrador: ID,
        limiteDeCupos:Int,      
        horarioInicio: Date,
        horarioFinal: Date,
        participantes:[String],    
        lugar: ID,
        idParent:ID,
        tipoParent:String,
        eventosEnmarcados:[EventoPersonal]
    }

    type EventoPersonal{
        id: ID,        
        idPersona:ID,
        idParent:ID,
        tipoParent:String,        
        nombre: String,
        descripcion: String,          
        horarioInicio: Date,
        horarioFinal: Date,        
        idEventoMarco:ID,
        lugar:ID,
        nombresPersona:String,
        idsParticipantes:[String],
    }

    type infoDiaEventos{
        year:Int,
        mes:Int,
        dia: Int,
        cantidadEventos:Int,
    }

    union Evento = EventoPersonal | EventoPublico

    extend type Query{
        eventoPublico(idEvento:ID!):EventoPublico,
        todosEventosPublicos:[EventoPublico],
        eventosPublicosDia(dateInicioDia:Date!):[EventoPublico],
        eventosPublicosEspacio(idEspacio:ID!):[EventoPublico],
        
        eventosPersonalesDia(dateInicioDia:Date!, idUsuario:ID!):[EventoPersonal],
        eventosPersonalesDeParentDia(dateInicioDia:Date!, idParent:ID!, tipoParent:String!):[EventoPersonal],

        eventoPersonal(idEvento:ID!):EventoPersonal,

        cantidadEventosRelevantesMes(year:Int!, mes: Int!, idParent:ID!, tipoParent:String!, timeZoneOffset:Int!):[infoDiaEventos],
    }

    extend type Mutation{
        crearEventoPublico(infoNuevoEvento:InputCrearEventoPublico):EventoPublico,        

        crearEventoPersonal(infoEventoPersonal:InputCrearEventoPersonal):EventoPersonal,
        
        eliminarEvento(idEvento:ID!, tipoEvento:String!):Boolean,        
        editarNombreEvento(idEvento:ID!, tipoEvento: String!, nuevoNombre: String!):Evento,
        editarDescripcionEvento(idEvento:ID!, tipoEvento: String!, nuevoDescripcion: String!):Evento,
        editarLimiteDeCuposEvento(idEvento:ID!, tipoEvento: String!, nuevoLimiteDeCupos: Int!):EventoPublico,
        setDateFinalEvento(nuevoDate:Date!, tipoEvento: String!, idEvento:ID!):Evento,
        setDateInicioEvento(nuevoDate:Date!, tipoEvento: String!, idEvento:ID!):Evento,
        setDateInicioEventoHoldDuration(nuevoDate:Date!, tipoEvento: String!, idEvento:ID!):Evento,
        repetirEventoPeriodicamente(periodoRepetir: String, cantidadRepetir:Int!, idEvento:ID!, tipoEvento:String!):[Evento],
        repetirEventosTroughInterval(idParent: ID!, tipoParent:String, idUsuario: ID!, numRepeticiones:Int!, dateFrom: Date!, dateTo:Date!):Boolean,
        deleteEventosTroughInterval(idParent: ID!, tipoParent:String, idUsuario: ID!, dateFrom: Date!, dateTo:Date!):Boolean,

        setLimiteDeCuposEventosPublicosEspacioFromDate(idEspacio:ID!, dateFrom: Date!, limiteDeCupos:Int!):Boolean,

    }
`;
const charProhibidosNombreEvento = /[^ a-zA-ZÀ-ž0-9_():.,-]/;
exports.resolvers = {
    Query: {
        eventoPublico(_, { idEvento }, contexto) {
            return __awaiter(this, void 0, void 0, function* () {
                try {
                    var elEventoPublico = yield Evento_1.ModeloEventoPublico.findById(idEvento).exec();
                }
                catch (error) {
                    console.log(`Error buscando evento: ${error}`);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                return elEventoPublico;
            });
        },
        todosEventosPublicos(_, __, contexto) {
            return __awaiter(this, void 0, void 0, function* () {
                try {
                    var losEventosPublicos = yield Evento_1.ModeloEventoPublico.find({}).exec();
                }
                catch (error) {
                    console.log(`Error buscando eventos publicos: ${error}`);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                return losEventosPublicos;
            });
        },
        eventosPublicosDia(_, { dateInicioDia }, contexto) {
            return __awaiter(this, void 0, void 0, function* () {
                dateInicioDia = new Date(dateInicioDia);
                const millisInicioDia = dateInicioDia.getTime();
                const millisFinalDia = millisInicioDia + 86400000;
                const dateFinalDia = new Date(millisFinalDia);
                try {
                    var losEventosPublicosDia = yield Evento_1.ModeloEventoPublico.find({ horarioInicio: { $gt: dateInicioDia.getTime(), $lt: dateFinalDia.getTime() } }).exec();
                }
                catch (error) {
                    console.log(`Error buscando eventos publicos: ${error}`);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                return losEventosPublicosDia;
            });
        },
        eventosPublicosEspacio(_, { idEspacio }, contexto) {
            return __awaiter(this, void 0, void 0, function* () {
                console.log(`Query de eventos publicos del espacio ${idEspacio}`);
                try {
                    var losEventosPublicosEspacio = yield Evento_1.ModeloEventoPublico.find({ "idParent": idEspacio }).exec();
                }
                catch (error) {
                    console.log(`Error buscando eventos publicos: ${error}`);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                console.log(`Enviando ${losEventosPublicosEspacio.length} eventos públicos del espacio`);
                return losEventosPublicosEspacio;
            });
        },
        eventosPersonalesDia(_, { dateInicioDia, idUsuario }, contexto) {
            return __awaiter(this, void 0, void 0, function* () {
                dateInicioDia = new Date(dateInicioDia);
                const millisInicioDia = dateInicioDia.getTime();
                const millisFinalDia = millisInicioDia + 86400000;
                const dateFinalDia = new Date(millisFinalDia);
                try {
                    var losEventosPersonalesDia = yield Evento_1.ModeloEventoPersonal.find().and([{ horarioInicio: { $gt: dateInicioDia.getTime(), $lt: dateFinalDia.getTime() } }, { $or: [{ idPersona: idUsuario }, { idsParticipantes: idUsuario }] }]).exec();
                }
                catch (error) {
                    console.log(`Error buscando eventos personales: ${error}`);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                return losEventosPersonalesDia;
            });
        },
        eventosPersonalesDeParentDia(_, { dateInicioDia, idParent, tipoParent }, contexto) {
            return __awaiter(this, void 0, void 0, function* () {
                console.log(`Query de eventos personales en el dia ${dateInicioDia} de un ${tipoParent} con id ${idParent}`);
                dateInicioDia = new Date(dateInicioDia);
                const millisInicioDia = dateInicioDia.getTime();
                const millisFinalDia = millisInicioDia + 86400000;
                const dateFinalDia = new Date(millisFinalDia);
                // get personas relevantes del parent
                var personasRelevantes = [];
                if (tipoParent === 'nodoSolidaridad') {
                    try {
                        var elNodo = yield NodoSolidaridad_1.ModeloNodoSolidaridad.findById(idParent).exec();
                    }
                    catch (error) {
                        console.log(`Error buscando el nodoSolidaridad parent: ${error}`);
                        throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                    }
                    personasRelevantes = yield AtlasSolidaridad_1.getResponsablesAmplioNodo(elNodo);
                }
                console.log(`Se buscaran eventos personales de ${personasRelevantes}`);
                try {
                    // var losEventosPersonalesDia: any = await EventoPersonal.find().and([{ horarioInicio: { $gt: dateInicioDia.getTime(), $lt: dateFinalDia.getTime() } }, {"idPersona":{$in:personasRelevantes} } ]).exec();
                    var losEventosPersonalesDia = yield Evento_1.ModeloEventoPersonal.find().and([{ horarioInicio: { $gt: dateInicioDia.getTime(), $lt: dateFinalDia.getTime() } }, { $or: [{ idPersona: { $in: personasRelevantes } }, { idsParticipantes: { $in: personasRelevantes } }] }]).exec();
                }
                catch (error) {
                    console.log(`Error buscando eventos personales: ${error}`);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                console.log("\x1b[32m%s\x1b[0m", `Enviando ${losEventosPersonalesDia.length} eventos relevantes`);
                console.log(`De ${losEventosPersonalesDia.map(e => e.idPersona)}`);
                console.log(`Llamados: ${losEventosPersonalesDia.map(e => e.nombre)}`);
                return losEventosPersonalesDia;
            });
        },
        eventoPersonal(_, { idEvento }, contexto) {
            return __awaiter(this, void 0, void 0, function* () {
                // if (!contexto.usuario || !contexto.usuario.id) {
                //     console.log(`Usuario no logeado`);
                //     throw new AuthenticationError("Login requerido");
                // }
                const permisosEspeciales = ["superadministrador", "maestraVida-profesor"];
                const credencialesUsuario = contexto.usuario;
                try {
                    var elEventoPersonal = yield Evento_1.ModeloEventoPersonal.findById(idEvento).exec();
                }
                catch (error) {
                    console.log(`Error buscando evento: ${error}`);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                if (credencialesUsuario.id != elEventoPersonal.idPersona && !elEventoPersonal.idsParticipantes.includes(credencialesUsuario.id) && !credencialesUsuario.permisos.some(p => permisosEspeciales.includes(p))) {
                    console.log(`Usuario no tenia permisos suficientes`);
                    throw new apollo_server_express_1.AuthenticationError("No autorizado");
                }
                return elEventoPersonal;
            });
        },
        cantidadEventosRelevantesMes(_, { year, mes, idParent, tipoParent, timeZoneOffset }, contexto) {
            return __awaiter(this, void 0, void 0, function* () {
                console.log('\x1b[35m%s\x1b[0m', `Query for cantidad de eventos relevantes de ${mes} de ${year} para ${tipoParent} con id ${idParent}. timeZoneOffset: ${timeZoneOffset}`);
                var dateInit = new Date(year, mes, 1);
                var dateFin = new Date(year, mes < 11 ? mes + 1 : 0, 1);
                var losEventosRelevantesMes = null;
                var eventosPersonalesRelevantesMes = null;
                var eventosPublicosRelevantesMes = null;
                timeZoneOffset = timeZoneOffset * 60000;
                dateInit = new Date(dateInit.getTime());
                dateFin = new Date(dateFin.getTime());
                try {
                    if (tipoParent === 'usuario') {
                        eventosPersonalesRelevantesMes = yield Evento_1.ModeloEventoPersonal.find().and([{ horarioInicio: { $gt: dateInit.getTime(), $lt: dateFin.getTime() } }, { idPersona: idParent }]).select("horarioInicio").exec();
                        var eventosParticipadosRelevantesMes = yield Evento_1.ModeloEventoPersonal.find({ horarioInicio: { $gt: dateInit.getTime(), $lt: dateFin.getTime() }, idsParticipantes: idParent }).exec();
                        eventosPublicosRelevantesMes = yield Evento_1.ModeloEventoPublico.find().and([{ horarioInicio: { $gt: dateInit.getTime(), $lt: dateFin.getTime() } }, { idAdministrador: idParent }]).select("horarioInicio").exec();
                        losEventosRelevantesMes = eventosPersonalesRelevantesMes.concat(eventosPublicosRelevantesMes).concat(eventosParticipadosRelevantesMes);
                    }
                    else if (tipoParent === 'nodoSolidaridad') {
                        losEventosRelevantesMes = yield Evento_1.ModeloEventoPersonal.find().and([{ horarioInicio: { $gt: dateInit.getTime(), $lt: dateFin.getTime() } }, { idParent: idParent }]).select("horarioInicio").exec();
                    }
                    else if (tipoParent === 'espacio') {
                        losEventosRelevantesMes = yield Evento_1.ModeloEventoPublico.find().and([{ horarioInicio: { $gt: dateInit.getTime(), $lt: dateFin.getTime() } }, { idParent: idParent }]).select("horarioInicio").exec();
                    }
                    else {
                        console.log(`Tipo ${tipoParent} no reconocido`);
                        throw new apollo_server_express_1.UserInputError("Tipo inválido");
                    }
                }
                catch (error) {
                    console.log(`Error buscando eventos personales: ${error}`);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                var objetoDias = {};
                losEventosRelevantesMes.forEach(ev => {
                    let dia = new Date(ev.horarioInicio).getDate();
                    if (!objetoDias[dia]) {
                        objetoDias[dia] = 1;
                    }
                    else {
                        objetoDias[dia]++;
                    }
                });
                console.log(`Objeto dias: ${JSON.stringify(objetoDias)}`);
                var arrayDias = [];
                Object.entries(objetoDias).forEach((pair) => {
                    arrayDias.push({
                        year,
                        mes,
                        dia: pair[0],
                        cantidadEventos: pair[1],
                    });
                });
                console.log(`arrayDias:`);
                arrayDias.forEach(item => {
                    console.log(`${JSON.stringify(item)}`);
                });
                return arrayDias;
            });
        },
    },
    Mutation: {
        crearEventoPublico(_, { infoNuevoEvento }, contexto) {
            return __awaiter(this, void 0, void 0, function* () {
                console.log('\x1b[35m%s\x1b[0m', `Query de crear un nuevo evento público`);
                console.log(`Datos: ${JSON.stringify(infoNuevoEvento)}`);
                if (!contexto.usuario || !contexto.usuario.id) {
                    console.log(`Usuario no logeado`);
                    throw new apollo_server_express_1.AuthenticationError("Login requerido");
                }
                var nuevoEventoPublico = new Evento_1.ModeloEventoPublico(Object.assign({}, infoNuevoEvento));
                if (infoNuevoEvento.tipoParent === 'espacio') {
                    console.log(`Es la apertura de un espacio`);
                    try {
                        var elEspacioParent = yield Espacio_1.ModeloEspacio.findById(infoNuevoEvento.idParent).exec();
                        if (!elEspacioParent)
                            throw "Espacio parent no encontrado";
                    }
                    catch (error) {
                        console.log(`Error buscando el espacio parent: ${error}`);
                        throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                    }
                    //Authorización espacio
                    const permisosEspeciales = ["superadministrador"];
                    const credencialesUsuario = contexto.usuario;
                    if (elEspacioParent.idAdministrador != credencialesUsuario.id && !credencialesUsuario.permisos.some(p => permisosEspeciales.includes(p))) {
                        console.log(`Error de autenticacion creando evento público`);
                        throw new apollo_server_express_1.AuthenticationError("No autorizado");
                    }
                    var nombreAutomatico = 'Encuentro de ' + elEspacioParent.nombre;
                    nuevoEventoPublico.nombre = nombreAutomatico;
                    var descripcionAutomatico = elEspacioParent.descripcion;
                    nuevoEventoPublico.descripcion = descripcionAutomatico;
                    nuevoEventoPublico.idParent = elEspacioParent.id;
                    nuevoEventoPublico.idAdministrador = elEspacioParent.idAdministrador;
                }
                try {
                    yield nuevoEventoPublico.save();
                }
                catch (error) {
                    console.log(`Error creando el evento público: ${error}`);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                console.log(`Evento publico creado`);
                return nuevoEventoPublico;
            });
        },
        crearEventoPersonal(_, { infoEventoPersonal }, contexto) {
            return __awaiter(this, void 0, void 0, function* () {
                console.log('\x1b[35m%s\x1b[0m', `Query de crear un nuevo evento personal`);
                console.log(`Datos: ${JSON.stringify(infoEventoPersonal)}`);
                if (!contexto.usuario || !contexto.usuario.id) {
                    console.log(`Usuario no logeado`);
                    throw new apollo_server_express_1.AuthenticationError("Login requerido");
                }
                var nuevoEventoPersonal = new Evento_1.ModeloEventoPersonal(Object.assign({}, infoEventoPersonal));
                if (infoEventoPersonal.idEventoMarco) {
                    console.log(`Está enmarcado en el evento ${infoEventoPersonal.idEventoMarco}`);
                    try {
                        var elEventoMarco = yield Evento_1.ModeloEventoPublico.findById(infoEventoPersonal.idEventoMarco).exec();
                        if (!elEventoMarco)
                            throw "Evento marco no encontrado";
                    }
                    catch (error) {
                        console.log(`Error buscando evento marco: ${error}`);
                        throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                    }
                    if (elEventoMarco.horarioFinal < new Date().getTime()) {
                        throw new apollo_server_express_1.UserInputError("No es posible asistir a eventos ya finalizados");
                    }
                    if (!infoEventoPersonal.nombre) {
                        var nombreAutomatico = 'Asistir a ' + elEventoMarco.nombre;
                        nuevoEventoPersonal.nombre = nombreAutomatico;
                    }
                    if (!infoEventoPersonal.horarioInicio) {
                        nuevoEventoPersonal.horarioInicio = elEventoMarco.horarioInicio;
                    }
                    if (!infoEventoPersonal.horarioFinal) {
                        nuevoEventoPersonal.horarioFinal = elEventoMarco.horarioFinal;
                    }
                    nuevoEventoPersonal.lugar = elEventoMarco.lugar;
                    //Validar horarios.
                    if (infoEventoPersonal.horarioInicio < elEventoMarco.horarioInicio || infoEventoPersonal.horarioFinal > elEventoMarco.horarioFinal) {
                        throw new apollo_server_express_1.UserInputError("El evento debe estar dentro del evento marco");
                    }
                }
                if (infoEventoPersonal.idParent) {
                    var elParent = null;
                    try {
                        if (infoEventoPersonal.tipoParent === 'nodoSolidaridad') {
                            console.log(`Es la ejecución de un nodoSolidaridad`);
                            elParent = yield NodoSolidaridad_1.ModeloNodoSolidaridad.findById(infoEventoPersonal.idParent);
                        }
                        else {
                            console.log(`Tipo ${infoEventoPersonal.tipoParent} no reconocido`);
                            throw new apollo_server_express_1.UserInputError("Tipo de evento no conocido");
                        }
                    }
                    catch (error) {
                        console.log(`Error buscando el parent del evento: ${error}`);
                        throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                    }
                    //Authorización nodoSolidaridad
                    var idsResponsables = [];
                    if (infoEventoPersonal.tipoParent === 'nodoSolidaridad') {
                        const responsablesAmplioNodo = yield AtlasSolidaridad_1.getResponsablesAmplioNodo(elParent);
                        idsResponsables = responsablesAmplioNodo;
                        console.log(`Los responsables amplios nodo son: ${idsResponsables}, adding ${responsablesAmplioNodo.filter(r => r != nuevoEventoPersonal.idPersona)} to participantes del evento creado`);
                        nuevoEventoPersonal.idsParticipantes = responsablesAmplioNodo.filter(r => r != nuevoEventoPersonal.idPersona);
                    }
                    const permisosEspeciales = ["superadministrador"];
                    const credencialesUsuario = contexto.usuario;
                    if (!idsResponsables.includes(credencialesUsuario.id) && !credencialesUsuario.permisos.some(p => permisosEspeciales.includes(p))) {
                        console.log(`Error de autenticacion creando evento personal`);
                        throw new apollo_server_express_1.AuthenticationError("No autorizado");
                    }
                    if (!infoEventoPersonal.nombre) {
                        var nombreAutomatico = 'Realización de ' + elParent.nombre;
                        nuevoEventoPersonal.nombre = nombreAutomatico;
                    }
                    if (!infoEventoPersonal.descripcion) {
                        nuevoEventoPersonal.descripcion = elParent.descripcion;
                    }
                    nuevoEventoPersonal.idParent = elParent.id;
                    nuevoEventoPersonal.idAdministrador = elParent.idAdministrador;
                }
                try {
                    yield nuevoEventoPersonal.save();
                }
                catch (error) {
                    console.log(`Error creando el evento personal: ${error}`);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                console.log(`Evento personal creado`);
                return nuevoEventoPersonal;
            });
        },
        eliminarEvento(_, { idEvento, tipoEvento }, contexto) {
            return __awaiter(this, void 0, void 0, function* () {
                if (!contexto.usuario || !contexto.usuario.id) {
                    console.log(`Usuario no logeado`);
                    throw new apollo_server_express_1.AuthenticationError("Login requerido");
                }
                console.log('\x1b[35m%s\x1b[0m', `Query de eliminar evento con id ${idEvento}`);
                try {
                    var elEvento = null;
                    if (tipoEvento === 'eventoPublico') {
                        elEvento = yield Evento_1.ModeloEventoPublico.findById(idEvento).exec();
                    }
                    else if (tipoEvento === 'eventoPersonal') {
                        elEvento = yield Evento_1.ModeloEventoPersonal.findById(idEvento).exec();
                    }
                    else {
                        throw "Evento " + tipoEvento + " no reconocido";
                    }
                    if (!elEvento) {
                        throw "evento no encontrado";
                    }
                }
                catch (error) {
                    console.log("Error buscando el evento a cambiar nombre en la base de datos. E: " + error);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                //Authorización
                const permisosEspeciales = ["superadministrador", "maestraVida-profesor"];
                const credencialesUsuario = contexto.usuario;
                var usuarioAdministrador = false;
                if (tipoEvento === 'eventoPublico') {
                    usuarioAdministrador = elEvento.idAdministrador === credencialesUsuario.id;
                }
                else if (tipoEvento === 'eventoPersonal') {
                    usuarioAdministrador = elEvento.idPersona === credencialesUsuario.id;
                }
                else {
                    throw new apollo_server_express_1.UserInputError("Tipo de evento no reconocido: " + tipoEvento);
                }
                if (!usuarioAdministrador && !credencialesUsuario.permisos.some(p => permisosEspeciales.includes(p))) {
                    console.log(`Error de autenticacion`);
                    throw new apollo_server_express_1.AuthenticationError("No autorizado");
                }
                if (tipoEvento === 'eventoPublico') {
                    //Buscando eventos personales que tengan como marco este evento publico
                    yield exports.reScheduleEventosEnmarcadosEnEventoPublicoEliminado(elEvento);
                }
                try {
                    if (tipoEvento === 'eventoPublico') {
                        yield Evento_1.ModeloEventoPublico.findByIdAndRemove(idEvento).exec();
                    }
                    else if (tipoEvento === 'eventoPersonal') {
                        yield Evento_1.ModeloEventoPersonal.findByIdAndRemove(idEvento).exec();
                    }
                    else {
                        throw "Evento " + tipoEvento + " no reconocido";
                    }
                }
                catch (error) {
                    console.log(`Error removiendo el evento: ${error}`);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                console.log(`Evento eliminado`);
                return true;
            });
        },
        editarNombreEvento(_, { idEvento, tipoEvento, nuevoNombre }, contexto) {
            return __awaiter(this, void 0, void 0, function* () {
                console.log(`Query de cambiar el nombre del evento con id ${idEvento}`);
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
                    var elEvento = null;
                    if (tipoEvento === 'eventoPublico') {
                        elEvento = yield Evento_1.ModeloEventoPublico.findById(idEvento).exec();
                    }
                    else if (tipoEvento === 'eventoPersonal') {
                        elEvento = yield Evento_1.ModeloEventoPersonal.findById(idEvento).exec();
                    }
                    else {
                        throw "Evento " + tipoEvento + " no reconocido";
                    }
                    if (!elEvento) {
                        throw "eventopublico no encontrado";
                    }
                }
                catch (error) {
                    console.log("Error buscando el eventopublico a cambiar nombre en la base de datos. E: " + error);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                //Authorización
                const permisosEspeciales = ["superadministrador"];
                const credencialesUsuario = contexto.usuario;
                var usuarioAdministrador = false;
                if (tipoEvento === 'eventoPublico') {
                    usuarioAdministrador = elEvento.idAdministrador === credencialesUsuario.id;
                }
                else if (tipoEvento === 'eventoPersonal') {
                    usuarioAdministrador = elEvento.idPersona === credencialesUsuario.id;
                }
                else {
                    throw new apollo_server_express_1.UserInputError("Tipo de evento no reconocido: " + tipoEvento);
                }
                if (!usuarioAdministrador && !credencialesUsuario.permisos.some(p => permisosEspeciales.includes(p))) {
                    console.log(`Error de autenticacion`);
                    throw new apollo_server_express_1.AuthenticationError("No autorizado");
                }
                elEvento.nombre = nuevoNombre;
                try {
                    yield elEvento.save();
                }
                catch (error) {
                    console.log("Error guardando el eventopublico con nuevo nombre. E: " + error);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                console.log(`Nombre cambiado`);
                return elEvento;
            });
        },
        editarDescripcionEvento(_, { idEvento, tipoEvento, nuevoDescripcion }, contexto) {
            return __awaiter(this, void 0, void 0, function* () {
                console.log(`Query de cambiar el descripcion del evento con id ${idEvento}`);
                if (!contexto.usuario || !contexto.usuario.id) {
                    console.log(`Sin credenciales de usuario`);
                    throw new apollo_server_express_1.AuthenticationError("Login requerido");
                }
                if (config_1.charProhibidosTexto.test(nuevoDescripcion)) {
                    throw new apollo_server_express_1.ApolloError("Descripcion ilegal");
                }
                nuevoDescripcion = nuevoDescripcion.trim();
                try {
                    var elEvento = null;
                    if (tipoEvento === 'eventoPublico') {
                        elEvento = yield Evento_1.ModeloEventoPublico.findById(idEvento).exec();
                    }
                    else if (tipoEvento === 'eventoPersonal') {
                        elEvento = yield Evento_1.ModeloEventoPersonal.findById(idEvento).exec();
                    }
                    else {
                        throw "Evento " + tipoEvento + " no reconocido";
                    }
                    if (!elEvento) {
                        throw "evento no encontrado";
                    }
                }
                catch (error) {
                    console.log("Error buscando el evento a cambiar descripcion en la base de datos. E: " + error);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                //Authorización
                const permisosEspeciales = ["superadministrador"];
                const credencialesUsuario = contexto.usuario;
                var usuarioAdministrador = false;
                if (tipoEvento === 'eventoPublico') {
                    usuarioAdministrador = elEvento.idAdministrador === credencialesUsuario.id;
                }
                else if (tipoEvento === 'eventoPersonal') {
                    usuarioAdministrador = elEvento.idPersona === credencialesUsuario.id;
                }
                else {
                    throw new apollo_server_express_1.UserInputError("Tipo de evento no reconocido: " + tipoEvento);
                }
                if (!usuarioAdministrador && !credencialesUsuario.permisos.some(p => permisosEspeciales.includes(p))) {
                    console.log(`Error de autenticacion`);
                    throw new apollo_server_express_1.AuthenticationError("No autorizado");
                }
                elEvento.descripcion = nuevoDescripcion;
                try {
                    yield elEvento.save();
                }
                catch (error) {
                    console.log("Error guardando el evento con nuevo descripcion. E: " + error);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                console.log(`Descripcion cambiado`);
                return elEvento;
            });
        },
        editarLimiteDeCuposEvento(_, { idEvento, tipoEvento, nuevoLimiteDeCupos }, contexto) {
            return __awaiter(this, void 0, void 0, function* () {
                console.log(`Query de cambiar el limitedecupos del evento con id ${idEvento}`);
                if (!contexto.usuario || !contexto.usuario.id) {
                    console.log(`Sin credenciales de usuario`);
                    throw new apollo_server_express_1.AuthenticationError("Login requerido");
                }
                try {
                    var elEvento = null;
                    if (tipoEvento === 'eventoPublico') {
                        elEvento = yield Evento_1.ModeloEventoPublico.findById(idEvento).exec();
                    }
                    else if (tipoEvento === 'eventoPersonal') {
                        elEvento = yield Evento_1.ModeloEventoPersonal.findById(idEvento).exec();
                    }
                    else {
                        throw "Evento " + tipoEvento + " no reconocido";
                    }
                    if (!elEvento) {
                        throw "evento no encontrado";
                    }
                }
                catch (error) {
                    console.log("Error buscando el evento a cambiar limitedecupos en la base de datos. E: " + error);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                //Authorización
                const permisosEspeciales = ["superadministrador"];
                const credencialesUsuario = contexto.usuario;
                var usuarioAdministrador = false;
                if (tipoEvento === 'eventoPublico') {
                    usuarioAdministrador = elEvento.idAdministrador === credencialesUsuario.id;
                }
                else if (tipoEvento === 'eventoPersonal') {
                    usuarioAdministrador = elEvento.idPersona === credencialesUsuario.id;
                }
                else {
                    throw new apollo_server_express_1.UserInputError("Tipo de evento no reconocido: " + tipoEvento);
                }
                if (!usuarioAdministrador && !credencialesUsuario.permisos.some(p => permisosEspeciales.includes(p))) {
                    console.log(`Error de autenticacion`);
                    throw new apollo_server_express_1.AuthenticationError("No autorizado");
                }
                elEvento.limiteDeCupos = nuevoLimiteDeCupos;
                try {
                    yield elEvento.save();
                }
                catch (error) {
                    console.log("Error guardando el evento con nuevo limitedecupos. E: " + error);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                console.log(`LimiteDeCupos cambiado`);
                return elEvento;
            });
        },
        setDateInicioEvento(_, { nuevoDate, tipoEvento, idEvento }, contexto) {
            return __awaiter(this, void 0, void 0, function* () {
                console.log(`Query de cambiar el dateInicio del eventopublico con id ${idEvento}`);
                if (!contexto.usuario || !contexto.usuario.id) {
                    console.log(`Sin credenciales de usuario`);
                    throw new apollo_server_express_1.AuthenticationError("Login requerido");
                }
                var elEvento = null;
                try {
                    if (tipoEvento === 'eventoPublico') {
                        elEvento = yield Evento_1.ModeloEventoPublico.findById(idEvento).exec();
                    }
                    else if (tipoEvento === 'eventoPersonal') {
                        elEvento = yield Evento_1.ModeloEventoPersonal.findById(idEvento).exec();
                    }
                    else {
                        throw "Tipo de evento '" + tipoEvento + "' no reconocido";
                    }
                    if (!elEvento) {
                        throw "eventopublico no encontrado";
                    }
                }
                catch (error) {
                    console.log("Error buscando el eventopublico a cambiar nombre en la base de datos. E: " + error);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                //Authorización
                const permisosEspeciales = ["superadministrador", "maestraVida-profesor"];
                const credencialesUsuario = contexto.usuario;
                var usuarioAdministrador = false;
                if (tipoEvento === 'eventoPublico') {
                    usuarioAdministrador = elEvento.idAdministrador === credencialesUsuario.id;
                }
                else if (tipoEvento === 'eventoPersonal') {
                    usuarioAdministrador = elEvento.idPersona === credencialesUsuario.id;
                }
                else {
                    throw new apollo_server_express_1.UserInputError("Tipo de evento no reconocido: " + tipoEvento);
                }
                if (!usuarioAdministrador && !credencialesUsuario.permisos.some(p => permisosEspeciales.includes(p))) {
                    console.log(`Error de autenticacion`);
                    throw new apollo_server_express_1.AuthenticationError("No autorizado");
                }
                elEvento.horarioInicio = nuevoDate;
                if (elEvento.idEventoMarco) {
                    console.log(`Tenia evento marco`);
                    try {
                        var elEventoMarco = yield Evento_1.ModeloEventoPublico.findById(elEvento.idEventoMarco).exec();
                    }
                    catch (error) {
                        console.log(`Error buscando evento marco`);
                        throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                    }
                    console.log(`Comparando ${nuevoDate} con ${elEventoMarco.horarioInicio}`);
                    if (new Date(nuevoDate) < new Date(elEventoMarco.horarioInicio) || new Date(nuevoDate) > new Date(elEventoMarco.horarioFinal)) {
                        throw new apollo_server_express_1.UserInputError("El evento no puede tener horario por fuera de " + elEventoMarco.nombre);
                    }
                    if (elEvento.horarioFinal > new Date(elEventoMarco.horarioFinal)) {
                        elEvento.horarioFinal = elEventoMarco.horarioFinal;
                    }
                }
                try {
                    yield elEvento.save();
                }
                catch (error) {
                    console.log("Error guardando el eventopublico con nuevo nombre. E: " + error);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                console.log(`HorarioInicio cambiado`);
                return true;
            });
        },
        setDateInicioEventoHoldDuration(_, { nuevoDate, tipoEvento, idEvento }, contexto) {
            return __awaiter(this, void 0, void 0, function* () {
                console.log(`Query de cambiar el dateInicio del ${tipoEvento} con id ${idEvento} keeping duration`);
                if (!contexto.usuario || !contexto.usuario.id) {
                    console.log(`Sin credenciales de usuario`);
                    throw new apollo_server_express_1.AuthenticationError("Login requerido");
                }
                var elEvento = null;
                try {
                    if (tipoEvento === 'eventoPublico') {
                        elEvento = yield Evento_1.ModeloEventoPublico.findById(idEvento).exec();
                    }
                    else if (tipoEvento === 'eventoPersonal') {
                        elEvento = yield Evento_1.ModeloEventoPersonal.findById(idEvento).exec();
                    }
                    else {
                        throw "Tipo de evento '" + tipoEvento + "' no reconocido";
                    }
                    if (!elEvento) {
                        throw "evento no encontrado";
                    }
                }
                catch (error) {
                    console.log("Error buscando el evento a cambiar nombre en la base de datos. E: " + error);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                //Authorización
                const permisosEspeciales = ["superadministrador", "maestraVida-profesor"];
                const credencialesUsuario = contexto.usuario;
                var usuarioAdministrador = false;
                if (tipoEvento === 'eventoPublico') {
                    usuarioAdministrador = elEvento.idAdministrador === credencialesUsuario.id;
                }
                else if (tipoEvento === 'eventoPersonal') {
                    usuarioAdministrador = elEvento.idPersona === credencialesUsuario.id;
                }
                else {
                    throw new apollo_server_express_1.UserInputError("Tipo de evento no reconocido: " + tipoEvento);
                }
                if (!usuarioAdministrador && !credencialesUsuario.permisos.some(p => permisosEspeciales.includes(p))) {
                    console.log(`Error de autenticacion`);
                    throw new apollo_server_express_1.AuthenticationError("No autorizado");
                }
                const currentDuration = elEvento.horarioFinal - elEvento.horarioInicio;
                elEvento.horarioInicio = nuevoDate;
                elEvento.horarioFinal = new Date(new Date(nuevoDate).getTime() + currentDuration);
                if (elEvento.idEventoMarco) {
                    console.log(`Tenia evento marco`);
                    try {
                        var elEventoMarco = yield Evento_1.ModeloEventoPublico.findById(elEvento.idEventoMarco).exec();
                    }
                    catch (error) {
                        console.log(`Error buscando evento marco`);
                        throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                    }
                    console.log(`Comparando ${nuevoDate} con ${elEventoMarco.horarioInicio}`);
                    if (new Date(nuevoDate) < new Date(elEventoMarco.horarioInicio) || new Date(nuevoDate) > new Date(elEventoMarco.horarioFinal)) {
                        throw new apollo_server_express_1.UserInputError("El evento no puede tener horario por fuera de " + elEventoMarco.nombre);
                    }
                    if (elEvento.horarioFinal > new Date(elEventoMarco.horarioFinal)) {
                        elEvento.horarioFinal = elEventoMarco.horarioFinal;
                    }
                }
                try {
                    yield elEvento.save();
                }
                catch (error) {
                    console.log("Error guardando el evento. E: " + error);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                console.log(`HorarioInicio cambiado`);
                return elEvento;
            });
        },
        setDateFinalEvento(_, { nuevoDate, tipoEvento, idEvento }, contexto) {
            return __awaiter(this, void 0, void 0, function* () {
                console.log(`Query de cambiar el dateFinal del evento con id ${idEvento}`);
                if (!contexto.usuario || !contexto.usuario.id) {
                    console.log(`Sin credenciales de usuario`);
                    throw new apollo_server_express_1.AuthenticationError("Login requerido");
                }
                var elEvento = null;
                try {
                    if (tipoEvento === 'eventoPublico') {
                        elEvento = yield Evento_1.ModeloEventoPublico.findById(idEvento).exec();
                    }
                    else if (tipoEvento === 'eventoPersonal') {
                        elEvento = yield Evento_1.ModeloEventoPersonal.findById(idEvento).exec();
                    }
                    else {
                        throw "Tipo de evento '" + tipoEvento + "' no reconocido";
                    }
                    if (!elEvento) {
                        throw "evento no encontrado";
                    }
                }
                catch (error) {
                    console.log("Error buscando el evento a cambiar nombre en la base de datos. E: " + error);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                //Authorización
                const permisosEspeciales = ["superadministrador", "maestraVida-profesor"];
                const credencialesUsuario = contexto.usuario;
                var usuarioAdministrador = false;
                if (tipoEvento === 'eventoPublico') {
                    usuarioAdministrador = elEvento.idAdministrador === credencialesUsuario.id;
                }
                else if (tipoEvento === 'eventoPersonal') {
                    usuarioAdministrador = elEvento.idPersona === credencialesUsuario.id;
                }
                else {
                    throw new apollo_server_express_1.UserInputError("Tipo de evento no reconocido: " + tipoEvento);
                }
                if (!usuarioAdministrador && !credencialesUsuario.permisos.some(p => permisosEspeciales.includes(p))) {
                    console.log(`Error de autenticacion`);
                    throw new apollo_server_express_1.AuthenticationError("No autorizado");
                }
                elEvento.horarioFinal = nuevoDate;
                if (elEvento.idEventoMarco) {
                    console.log(`Tenia evento marco`);
                    try {
                        var elEventoMarco = yield Evento_1.ModeloEventoPublico.findById(elEvento.idEventoMarco).exec();
                    }
                    catch (error) {
                        console.log(`Error buscando evento marco`);
                        throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                    }
                    if (new Date(nuevoDate) < new Date(elEventoMarco.horarioInicio) || new Date(nuevoDate) > new Date(elEventoMarco.horarioFinal)) {
                        throw new apollo_server_express_1.UserInputError("El evento no puede tener horario por fuera de " + elEventoMarco.nombre);
                    }
                }
                try {
                    yield elEvento.save();
                }
                catch (error) {
                    console.log("Error guardando el eventopublico con nuevo nombre. E: " + error);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                console.log(`HorarioFinal cambiado`);
                return elEvento;
            });
        },
        repetirEventoPeriodicamente(_, { periodoRepetir, cantidadRepetir, idEvento, tipoEvento }, contexto) {
            return __awaiter(this, void 0, void 0, function* () {
                console.log(`Query de repetir ${periodoRepetir} el evento ${idEvento} ${cantidadRepetir} veces`);
                if (!contexto.usuario || !contexto.usuario.id) {
                    console.log(`Sin credenciales de usuario`);
                    throw new apollo_server_express_1.AuthenticationError("Login requerido");
                }
                if (cantidadRepetir < 1 || cantidadRepetir > 52) {
                    throw new apollo_server_express_1.UserInputError("Cantidad de repeticiones inválida");
                }
                var periodoMillis = 86400000;
                if (periodoRepetir === 'semanalmente') {
                    periodoMillis = 604800000;
                }
                else if (periodoRepetir === 'diariamente') {
                    periodoMillis = 86400000;
                }
                else {
                    throw new apollo_server_express_1.UserInputError("Periodo " + periodoRepetir + " no reconocido");
                }
                var elEvento = null;
                try {
                    if (tipoEvento === 'eventoPublico') {
                        elEvento = yield Evento_1.ModeloEventoPublico.findById(idEvento).exec();
                    }
                    else if (tipoEvento === 'eventoPersonal') {
                        elEvento = yield Evento_1.ModeloEventoPersonal.findById(idEvento).exec();
                    }
                    else {
                        throw "Tipo de evento '" + tipoEvento + "' no reconocido";
                    }
                    if (!elEvento) {
                        throw "evento no encontrado";
                    }
                }
                catch (error) {
                    console.log("Error buscando el evento a repetir en la base de datos. E: " + error);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                //Authorización
                const permisosEspeciales = ["superadministrador"];
                const credencialesUsuario = contexto.usuario;
                var usuarioAdministrador = false;
                if (tipoEvento === 'eventoPublico') {
                    usuarioAdministrador = elEvento.idAdministrador === credencialesUsuario.id;
                }
                else if (tipoEvento === 'eventoPersonal') {
                    usuarioAdministrador = elEvento.idPersona === credencialesUsuario.id;
                }
                else {
                    throw new apollo_server_express_1.UserInputError("Tipo de evento no reconocido: " + tipoEvento);
                }
                if (!usuarioAdministrador && !credencialesUsuario.permisos.some(p => permisosEspeciales.includes(p))) {
                    console.log(`Error de autenticacion`);
                    throw new apollo_server_express_1.AuthenticationError("No autorizado");
                }
                var arrayNuevosEventos = [];
                var infoNuevosEventos = {
                    nombre: elEvento.nombre,
                    descripcion: elEvento.descripcion,
                    horarioInicio: elEvento.horarioInicio,
                    horarioFinal: elEvento.horarioFinal,
                    lugar: elEvento.lugar,
                    idParent: elEvento.idParent,
                    tipoParent: elEvento.tipoParent,
                };
                if (tipoEvento === 'eventoPublico') {
                    infoNuevosEventos.idAdministrador = elEvento.idAdministrador;
                    infoNuevosEventos.limiteDeCupos = elEvento.limiteDeCupos;
                }
                else if (tipoEvento === 'eventoPersonal') {
                    infoNuevosEventos.idPersona = elEvento.idPersona;
                    infoNuevosEventos.idsParticipantes = elEvento.idsParticipantes;
                    infoNuevosEventos.idEventoMarco = elEvento.idEventoMarco;
                }
                for (var i = 1; i <= cantidadRepetir; i++) {
                    let desplazamiento = periodoMillis * i;
                    let infoNuevoEvento = Object.assign({}, infoNuevosEventos);
                    infoNuevoEvento.horarioInicio = new Date(infoNuevoEvento.horarioInicio).getTime() + desplazamiento;
                    infoNuevoEvento.horarioFinal = new Date(infoNuevoEvento.horarioFinal).getTime() + desplazamiento;
                    arrayNuevosEventos.push(infoNuevoEvento);
                }
                var eventosCreados = [];
                try {
                    if (tipoEvento === 'eventoPublico') {
                        eventosCreados = yield Evento_1.ModeloEventoPublico.create(arrayNuevosEventos);
                    }
                    else if (tipoEvento === 'eventoPersonal') {
                        eventosCreados = yield Evento_1.ModeloEventoPersonal.create(arrayNuevosEventos);
                    }
                    else {
                        console.log(`Tipo ${tipoEvento} not developed`);
                    }
                }
                catch (error) {
                    console.log("Error guardando los eventos repetidos. E: " + error);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                console.log(`Evento repetido, enviando ${eventosCreados.length} repeticiones: `);
                console.log(`${eventosCreados}`);
                return eventosCreados;
            });
        },
        repetirEventosTroughInterval(_, { idParent, tipoParent, idUsuario, numRepeticiones, dateFrom, dateTo }, contexto) {
            return __awaiter(this, void 0, void 0, function* () {
                console.log('\x1b[35m%s\x1b[0m', `Query de repetir ${numRepeticiones} veces los eventos entre ${dateFrom} y ${dateTo} de tipo ${tipoParent} con idParent ${idParent}`);
                if (!contexto.usuario || !contexto.usuario.id) {
                    console.log(`Sin credenciales de usuario`);
                    throw new apollo_server_express_1.AuthenticationError("Login requerido");
                }
                if (numRepeticiones < 1 || numRepeticiones > 52) {
                    throw new apollo_server_express_1.UserInputError("Cantidad de repeticiones inválida");
                }
                dateFrom = new Date(dateFrom);
                dateTo = new Date(dateTo);
                var periodoMillis = dateTo.getTime() - dateFrom.getTime();
                var losEventos = null;
                try {
                    if (tipoParent === 'nodoSolidaridad') {
                        losEventos = yield Evento_1.ModeloEventoPersonal.find({ idParent, idPersona: idUsuario, horarioInicio: { $gt: dateFrom.getTime(), $lt: dateTo.getTime() } }).exec();
                    }
                    else if (tipoParent === 'usuario') {
                        var losEventosPersonales = yield Evento_1.ModeloEventoPersonal.find({ idPersona: idUsuario, horarioInicio: { $gt: dateFrom.getTime(), $lt: dateTo.getTime() } }).exec();
                        var losEventosPublicos = yield Evento_1.ModeloEventoPublico.find({ idAdministrador: idUsuario, horarioInicio: { $gt: dateFrom.getTime(), $lt: dateTo.getTime() } }).exec();
                        losEventos = losEventosPersonales.concat(losEventosPublicos);
                    }
                    else if (tipoParent === 'espacio') {
                        losEventos = yield Evento_1.ModeloEventoPublico.find({ idAdministrador: idUsuario, idParent, horarioInicio: { $gt: dateFrom.getTime(), $lt: dateTo.getTime() } }).exec();
                    }
                    else {
                        throw "Tipo de evento '" + tipoParent + "' no reconocido";
                    }
                    if (!losEventos) {
                        throw "eventos no encontrados";
                    }
                }
                catch (error) {
                    console.log("Error buscando los eventos a repetir en la base de datos. E: " + error);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                //Authorización
                const permisosEspeciales = ["superadministrador", "maestraVida-profesor"];
                const credencialesUsuario = contexto.usuario;
                var usuarioAdministrador = false;
                if (tipoParent === 'espacio') {
                    try {
                        var elEspacio = yield Espacio_1.ModeloEspacio.findById(idParent).exec();
                    }
                    catch (error) {
                        console.log(`Error buscando el espacio parent: ${error}`);
                        throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                    }
                    usuarioAdministrador = elEspacio.idAdministrador === credencialesUsuario.id;
                }
                else if (tipoParent === 'usuario') {
                    usuarioAdministrador = idUsuario === credencialesUsuario.id;
                }
                else if (tipoParent === 'nodoSolidaridad') {
                    try {
                        var elNodo = yield NodoSolidaridad_1.ModeloNodoSolidaridad.findById(idParent).exec();
                    }
                    catch (error) {
                        console.log(`Error buscando el espacio parent: ${error}`);
                        throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                    }
                    usuarioAdministrador = (yield AtlasSolidaridad_1.getResponsablesAmplioNodo(elNodo)).includes(credencialesUsuario.id);
                }
                else {
                    throw new apollo_server_express_1.UserInputError("Tipo de evento no reconocido: " + tipoParent);
                }
                if (!usuarioAdministrador && !credencialesUsuario.permisos.some(p => permisosEspeciales.includes(p))) {
                    console.log(`Error de autenticacion`);
                    throw new apollo_server_express_1.AuthenticationError("No autorizado");
                }
                var eventosEnmarcados = losEventos.filter(e => e.idEventoMarco);
                console.log(`${eventosEnmarcados.length} eventos están enmarcados y no se tiene seguridad de que exista una instancia del evento marco en el horario nuevo`);
                losEventos.forEach((evento) => __awaiter(this, void 0, void 0, function* () {
                    var dateInicioOriginal = new Date(evento.horarioInicio);
                    var dateFinalOriginal = new Date(evento.horarioFinal);
                    const idEventoMarcoOriginal = evento.idEventoMarco;
                    var idParentOriginal = null;
                    if (idEventoMarcoOriginal) {
                        try {
                            var eventoPublicoParent = yield Evento_1.ModeloEventoPublico.findById(idEventoMarcoOriginal).select("id nombre idParent").exec();
                        }
                        catch (error) {
                            console.log(`Error buscando nuevo eventoMarco para buscar nuevos eventos públicos que reciban los eventos repetidos: ${error}`);
                            throw new apollo_server_express_1.ApolloError("Error configurando la base de datos");
                        }
                        idParentOriginal = eventoPublicoParent.idParent;
                    }
                    for (var i = 1; i <= numRepeticiones; i++) {
                        evento._id = mongoose.Types.ObjectId();
                        evento.isNew = true;
                        let desplazamiento = periodoMillis * i;
                        evento.horarioInicio = new Date(dateInicioOriginal.getTime() + desplazamiento);
                        evento.horarioFinal = new Date(dateFinalOriginal.getTime() + desplazamiento);
                        if (idEventoMarcoOriginal) {
                            //Averiguar si hay un evento marco del mismo espacio para recibir este eventoPersonal.
                            try {
                                console.log(`Buscando un nuevo evento publico con idParent: ${idParentOriginal} `);
                                var nuevoEventoReceptor = yield Evento_1.ModeloEventoPublico.findOne({ idParent: idParentOriginal, horarioInicio: { $lte: evento.horarioInicio }, horarioFinal: { $gte: evento.horarioFinal } }).exec();
                                if (!nuevoEventoReceptor) {
                                    throw "no había evento receptor";
                                }
                            }
                            catch (error) {
                                console.log(`Error buscando nuevo eventoPublico del mismo espacio: ${error}`);
                                continue;
                            }
                            evento.idEventoMarco = nuevoEventoReceptor.id;
                        }
                        try {
                            console.log(`Guardando con id ${evento.id} y inicio ${evento.horarioInicio}`);
                            yield evento.save();
                        }
                        catch (error) {
                            console.log(`Error guardando repeticion del evento ${evento.nombre}: ${error}`);
                        }
                    }
                }));
                return true;
            });
        },
        deleteEventosTroughInterval(_, { idParent, tipoParent, idUsuario, dateFrom, dateTo }, contexto) {
            return __awaiter(this, void 0, void 0, function* () {
                console.log('\x1b[35m%s\x1b[0m', `Query de eliminar los eventos entre ${dateFrom} y ${dateTo} de tipo ${tipoParent} con idParent ${idParent}`);
                if (!contexto.usuario || !contexto.usuario.id) {
                    console.log(`Sin credenciales de usuario`);
                    throw new apollo_server_express_1.AuthenticationError("Login requerido");
                }
                dateFrom = new Date(dateFrom);
                dateTo = new Date(dateTo);
                var periodoMillis = dateTo.getTime() - dateFrom.getTime();
                var losEventos = null;
                try {
                    if (tipoParent === 'nodoSolidaridad') {
                        losEventos = yield Evento_1.ModeloEventoPersonal.find({ idParent, idPersona: idUsuario, horarioInicio: { $gt: dateFrom.getTime(), $lt: dateTo.getTime() } }).exec();
                    }
                    else if (tipoParent === 'usuario') {
                        var losEventosPersonales = yield Evento_1.ModeloEventoPersonal.find({ idPersona: idUsuario, horarioInicio: { $gt: dateFrom.getTime(), $lt: dateTo.getTime() } }).exec();
                        var losEventosPublicos = yield Evento_1.ModeloEventoPublico.find({ idAdministrador: idUsuario, horarioInicio: { $gt: dateFrom.getTime(), $lt: dateTo.getTime() } }).exec();
                        losEventos = losEventosPersonales.concat(losEventosPublicos);
                    }
                    else if (tipoParent === 'espacio') {
                        losEventos = yield Evento_1.ModeloEventoPublico.find({ idAdministrador: idUsuario, idParent, horarioInicio: { $gt: dateFrom.getTime(), $lt: dateTo.getTime() } }).exec();
                    }
                    else {
                        throw "Tipo de evento '" + tipoParent + "' no reconocido";
                    }
                    if (!losEventos) {
                        throw "eventos no encontrados";
                    }
                }
                catch (error) {
                    console.log("Error buscando los eventos a repetir en la base de datos. E: " + error);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                //Authorización
                const permisosEspeciales = ["superadministrador", "maestraVida-profesor"];
                const credencialesUsuario = contexto.usuario;
                var usuarioAdministrador = false;
                if (tipoParent === 'espacio') {
                    try {
                        var elEspacio = yield Espacio_1.ModeloEspacio.findById(idParent).exec();
                    }
                    catch (error) {
                        console.log(`Error buscando el espacio parent: ${error}`);
                        throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                    }
                    usuarioAdministrador = elEspacio.idAdministrador === credencialesUsuario.id;
                }
                else if (tipoParent === 'usuario') {
                    usuarioAdministrador = idUsuario === credencialesUsuario.id;
                }
                else if (tipoParent === 'nodoSolidaridad') {
                    try {
                        var elNodo = yield NodoSolidaridad_1.ModeloNodoSolidaridad.findById(idParent).exec();
                    }
                    catch (error) {
                        console.log(`Error buscando el espacio parent: ${error}`);
                        throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                    }
                    usuarioAdministrador = (yield AtlasSolidaridad_1.getResponsablesAmplioNodo(elNodo)).includes(credencialesUsuario.id);
                }
                else {
                    throw new apollo_server_express_1.UserInputError("Tipo de evento no reconocido: " + tipoParent);
                }
                if (!usuarioAdministrador && !credencialesUsuario.permisos.some(p => permisosEspeciales.includes(p))) {
                    console.log(`Error de autenticacion`);
                    throw new apollo_server_express_1.AuthenticationError("No autorizado");
                }
                console.log(`Se eliminará un set de ${losEventos.length} eventos`);
                const idsEliminar = losEventos.map(e => e.id);
                try {
                    yield Evento_1.ModeloEventoPersonal.deleteMany({ _id: { $in: idsEliminar } }).exec();
                    yield Evento_1.ModeloEventoPublico.deleteMany({ _id: { $in: idsEliminar } }).exec();
                }
                catch (error) {
                    console.log(`Error eliminando eventos: ${error}`);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                return true;
            });
        },
        setLimiteDeCuposEventosPublicosEspacioFromDate(_, { idEspacio, dateFrom, limiteDeCupos }, contexto) {
            return __awaiter(this, void 0, void 0, function* () {
                console.log(`Query de cambiar el limitedecupos de todos los eventos from ${dateFrom} del espacio ${idEspacio}`);
                if (!contexto.usuario || !contexto.usuario.id) {
                    console.log(`Sin credenciales de usuario`);
                    throw new apollo_server_express_1.AuthenticationError("Login requerido");
                }
                try {
                    var elEspacio = yield Espacio_1.ModeloEspacio.findById(idEspacio).exec();
                }
                catch (error) {
                    console.log("Error buscando el espacio: " + error);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                //Authorización
                const permisosEspeciales = ["superadministrador"];
                const credencialesUsuario = contexto.usuario;
                if (elEspacio.idAdministrador != credencialesUsuario.id && !credencialesUsuario.permisos.some(p => permisosEspeciales.includes(p))) {
                    console.log(`Error de autenticacion`);
                    throw new apollo_server_express_1.AuthenticationError("No autorizado");
                }
                try {
                    var losEventosFuturos = yield Evento_1.ModeloEventoPublico.find({ idParent: idEspacio, horarioInicio: { $gt: new Date(dateFrom).getTime() } }).exec();
                }
                catch (error) {
                    console.log(`Error buscando los eventos futuros: ${error}`);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                losEventosFuturos.forEach((ev) => __awaiter(this, void 0, void 0, function* () {
                    try {
                        ev.limiteDeCupos = limiteDeCupos;
                        yield ev.save();
                    }
                    catch (error) {
                        console.log(`Error guardando evento con nuevo límite de cupos: ${error}`);
                        throw new apollo_server_express_1.ApolloError("Error guardando en la base de datos");
                    }
                }));
                console.log(`Nuevo límite de cupos fijado en ${losEventosFuturos.length} eventos públicos.`);
                return true;
            });
        },
    },
    Evento: {
        __resolveType(evento, _, __) {
            if (evento.idPersona) {
                return "EventoPersonal";
            }
            return "EventoPublico";
        },
    },
    EventoPublico: {
        eventosEnmarcados(eventoPublico, _, __) {
            return __awaiter(this, void 0, void 0, function* () {
                try {
                    var losEventosEnmarcados = yield Evento_1.ModeloEventoPersonal.find({ idEventoMarco: eventoPublico.id }).exec();
                }
                catch (error) {
                    console.log(`Error buscando eventos enmarcados: ${error}`);
                }
                //Descargar nombres
                try {
                    var losNombres = yield Usuario_1.ModeloUsuario.find({ "_id": { $in: losEventosEnmarcados.map(ev => ev.idPersona) } }).select("id nombres apellidos").exec();
                }
                catch (error) {
                }
                return losEventosEnmarcados;
            });
        }
    },
    EventoPersonal: {
        nombresPersona(eventoPersonal, _, __) {
            return __awaiter(this, void 0, void 0, function* () {
                try {
                    var usuario = yield Usuario_1.ModeloUsuario.findById(eventoPersonal.idPersona).select("nombres").exec();
                }
                catch (error) {
                    console.log(`Error buscando nombres de persona de evento personal: ${error}`);
                }
                return usuario.nombres;
            });
        }
    }
};
const reScheduleEventosEnmarcadosEnEventoPublicoEliminado = function (eventoPublico) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            var losEventosEnmarcados = yield Evento_1.ModeloEventoPersonal.find({ idEventoMarco: eventoPublico.id }).exec();
        }
        catch (error) {
            console.log(`Error buscando los eventos enmarcados: ${error}`);
            throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
        }
        console.log(`Se encontraron ${losEventosEnmarcados.length} eventos enmarcados`);
        const idsEliminar = losEventosEnmarcados.filter(e => !e.idParent).map(e => e.id);
        const idsUpdate = losEventosEnmarcados.filter(e => e.idParent).map(e => e.id);
        console.log(`IDS a eliminar: ${idsEliminar}`);
        console.log(`IDS remove idParent, tipoParent: ${idsUpdate}`);
        try {
            var res = yield Evento_1.ModeloEventoPersonal.deleteMany({ "_id": { $in: idsEliminar } }).exec();
            yield Evento_1.ModeloEventoPersonal.updateMany({ "_id": { $in: idsUpdate } }, { $set: { "idEventoMarco": null } }).exec();
        }
        catch (error) {
            console.log(`Error eliminando eventos enmarcados: ${error}`);
            throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
        }
        console.log(`Res: ${res.ok}. Eventos enmarcados eliminados: ${res.n}`);
    });
};
exports.reScheduleEventosEnmarcadosEnEventoPublicoEliminado = reScheduleEventosEnmarcadosEnEventoPublicoEliminado;
