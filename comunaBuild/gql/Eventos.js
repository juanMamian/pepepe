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
const Evento_1 = require("../model/Evento");
const Proyecto_1 = require("../model/Proyecto");
const Nodo_1 = require("../model/atlas/Nodo");
const Usuario_1 = require("../model/Usuario");
exports.typeDefs = apollo_server_express_1.gql `
    
    type InfoEventoCalendario{
        id:ID,
        tipoParent:String,
        nombreParent:String,
        participantes:PublicUsuario
    }

    type EventoCalendario{
        id: ID,
        nombre: String,
        descripcion: String,
        responsables: [String],
        posiblesResponsables: [String]
        responsablesSolicitados: Int,
        participantes:[String],
        horarioInicio: Date,
        horarioFinal: Date,
        origen:String,
        idOrigen: ID,
        
    }

    extend type Query{
        evento(idEvento:ID!):EventoCalendario,
        eventosSegunOrigen(origen:String!, idOrigen:ID!):[EventoCalendario],
        eventosUsuario(idUsuario:ID!):[EventoCalendario],
        eventosCruceNuevoEventoClub(idClub: ID!):[EventoCalendario],
        eventosCruceNuevaClaseNodoConocimiento(idClase: ID!, idNodo: ID!):[EventoCalendario],
        infoAdicionalEvento(idEvento:ID!):InfoEventoCalendario
    }

    extend type Mutation{
        crearEventoProyectoCalendario(origen: String!, idOrigen:ID!, horarioInicio:Date!, horarioFinal: Date!):EventoCalendario,
        crearClaseNodoConocimientoCalendario(idNodo:ID!, idClase: ID!, horarioInicio:Date!, horarioFinal: Date!, nombre: String!, descripcion: String):EventoCalendario,
        eliminarEventoCalendario(idEvento:ID!):Boolean,
        setHorariosEvento(idEvento: ID!, nuevoHorarioInicio: Date!, nuevoHorarioFinal: Date!):EventoCalendario,
        editarNombreEventoCalendario(idEvento: ID!, nuevoNombre: String!):EventoCalendario,        
        editarDescripcionEventoCalendario(idEvento: ID!, nuevoDescripcion: String!):EventoCalendario,

        setAsistenciaUsuarioEventoCalendario(idEvento:ID!, idUsuario: ID!, nuevoAsistencia:Boolean!):EventoCalendario

    }
`;
const charProhibidosNombreEvento = /[^ a-zA-ZÀ-ž0-9_():.,-]/;
exports.resolvers = {
    Query: {
        evento: function (_, { idEvento }, context) {
            return __awaiter(this, void 0, void 0, function* () {
                try {
                    var elEvento = yield Evento_1.ModeloEvento.findById(idEvento).exec();
                    if (!elEvento) {
                        throw "Evento no existía";
                    }
                }
                catch (error) {
                    console.log(`error buscando un evento. E: ${error}`);
                    throw new apollo_server_express_1.ApolloError("");
                }
                return elEvento;
            });
        },
        eventosSegunOrigen(_, { origen, idOrigen }, context) {
            return __awaiter(this, void 0, void 0, function* () {
                console.log(`Solicitud de eventos de un ${origen} con id ${idOrigen}`);
                try {
                    var losEventos = yield Evento_1.ModeloEvento.find({ idOrigen }).exec();
                }
                catch (error) {
                    console.log(`error buscando eventos. E: ${error}`);
                    throw new apollo_server_express_1.ApolloError("");
                }
                console.log(`Enviando ${losEventos.length} eventos`);
                return losEventos;
            });
        },
        eventosUsuario(_, { idUsuario }, contexto) {
            return __awaiter(this, void 0, void 0, function* () {
                let credencialesUsuario = contexto.usuario;
                console.log(`Solicitud de eventosCalendario del usuario ${idUsuario}`);
                var permisosEspeciales = ["superadministrador"];
                if (credencialesUsuario.id != idUsuario && !permisosEspeciales.some(p => credencialesUsuario.permisos.includes(p))) {
                    console.log(`No autorizado`);
                    throw new apollo_server_express_1.AuthenticationError("No autorizado");
                }
                try {
                    var losEventos = yield Evento_1.ModeloEvento.find({ participantes: idUsuario }).exec();
                }
                catch (error) {
                    console.log(`error buscando eventos. E: ${error}`);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                //Buscar clases en las que está interesado el usuario.
                try {
                    var losNodosInteresantes = yield Nodo_1.ModeloNodo.find({ "clases.interesados": idUsuario }).exec();
                }
                catch (error) {
                    console.log(`Error buscando nodos con clases de interés para el usuario`);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                console.log(`El usuario está interesado en clases de los nodos: ${losNodosInteresantes.map(n => n.nombre)}`);
                var idsClasesInteresantes = [];
                losNodosInteresantes.forEach(nodo => {
                    let clasesInteresantes = nodo.clases.filter(c => c.interesados.includes(idUsuario));
                    idsClasesInteresantes = idsClasesInteresantes.concat(clasesInteresantes.map(c => c.id));
                });
                console.log(`El usuario está interesado en las clases: ${idsClasesInteresantes}`);
                try {
                    var losEventosClases = yield Evento_1.ModeloEvento.find({ idOrigen: { $in: idsClasesInteresantes } }).exec();
                }
                catch (error) {
                    console.log(`error buscando eventos de clases interesantes para el usuario. E: ${error}`);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                var todosEventos = losEventos.concat(losEventosClases);
                console.log(`Enviando ${todosEventos.length} eventos`);
                return todosEventos;
            });
        },
        eventosCruceNuevoEventoClub(_, { idClub }, contexto) {
            return __awaiter(this, void 0, void 0, function* () {
                console.log(`Solicitud de eventos que se cruzarían con un nuevo evento del club ${idClub}`);
                let credencialesUsuario = contexto.usuario;
                try {
                    var elProyecto = yield Proyecto_1.ModeloProyecto.findById(idClub).exec();
                    if (!elProyecto)
                        throw "Proyecto parent no encontrado";
                }
                catch (error) {
                    console.log(`Error buscando el club parent. E: ${error}`);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                var usuariosRelevantes = elProyecto.participantes;
                const indexU = usuariosRelevantes.indexOf(credencialesUsuario.id);
                if (indexU > -1) {
                    console.log(`El usuario que solicita ya era parte de los relevantes`);
                }
                else {
                    const todosMiembrosProyecto = elProyecto.responsables.concat(elProyecto.participantes);
                    if (todosMiembrosProyecto.includes(credencialesUsuario.id)) {
                        usuariosRelevantes.push(credencialesUsuario.id);
                    }
                }
                try {
                    var losEventosCruce = yield Evento_1.ModeloEvento.find({ participantes: { $in: usuariosRelevantes }, idOrigen: { $ne: idClub } }).exec();
                }
                catch (error) {
                    console.log(`Error buscando los eventos cruce: ${error}`);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                return losEventosCruce;
            });
        },
        eventosCruceNuevaClaseNodoConocimiento(_, { idClase, idNodo }, contexto) {
            return __awaiter(this, void 0, void 0, function* () {
                console.log(`Solicitud de eventos que se cruzarían con un nuevo evento de la clase ${idClase}`);
                let credencialesUsuario = contexto.usuario;
                try {
                    var elNodo = yield Nodo_1.ModeloNodo.findById(idNodo).exec();
                    if (!elNodo)
                        throw "Proyecto parent no encontrado";
                }
                catch (error) {
                    console.log(`Error buscando el nodo parent. E: ${error}`);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                var laClase = elNodo.clases.id(idClase);
                if (!laClase) {
                    console.log(`Error buscando la clase para buscar sus cruces`);
                    throw new apollo_server_express_1.UserInputError("Datos incorrectos");
                }
                var usuariosRelevantes = laClase.interesados;
                const indexU = usuariosRelevantes.indexOf(credencialesUsuario.id);
                if (indexU > -1) {
                    console.log(`El usuario que solicita ya era parte de los relevantes`);
                }
                else {
                    usuariosRelevantes.push(credencialesUsuario.id);
                }
                console.log(`Buscando cruces con eventos que incluyen a los usuariosRelevantes: ${usuariosRelevantes}`);
                try {
                    var losEventosCruce = yield Evento_1.ModeloEvento.find({ participantes: { $in: usuariosRelevantes }, idOrigen: { $ne: idClase } }).exec();
                }
                catch (error) {
                    console.log(`Error buscando los eventos cruce: ${error}`);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                return losEventosCruce;
            });
        },
        infoAdicionalEvento: function (_, { idEvento }, context) {
            return __awaiter(this, void 0, void 0, function* () {
                try {
                    var elEvento = yield Evento_1.ModeloEvento.findById(idEvento).exec();
                    if (!elEvento) {
                        throw "Evento no existía";
                    }
                }
                catch (error) {
                    console.log(`error buscando un evento. E: ${error}`);
                    throw new apollo_server_express_1.ApolloError("");
                }
                var infoEvento = null;
                if (elEvento.origen === 'club') {
                    try {
                        var elParent = yield Proyecto_1.ModeloProyecto.findById(elEvento.idOrigen).exec();
                    }
                    catch (error) {
                        console.log(`Error buscando el proyecto parent del evento`);
                        throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                    }
                    try {
                        console.log(`Buscando los ${elEvento.participantes.length} participantes del evento`);
                        var losParticipantes = yield Usuario_1.ModeloUsuario.find({ '_id': { $in: elEvento.participantes } }).exec();
                        console.log(`Encontrados ${losParticipantes.length} participantes del evento ${elEvento.nombre}`);
                    }
                    catch (error) {
                        console.log(`Error buscando los participantes del evento ${idEvento}: ${error}`);
                        throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                    }
                    infoEvento = {
                        id: elEvento.id,
                        nombreParent: elParent.nombre,
                        tipoParent: "Grupo",
                        participantes: losParticipantes
                    };
                }
                else if (elEvento.origen === 'claseNodoConocimiento') {
                    try {
                        var elParent = yield Nodo_1.ModeloNodo.findById(elEvento.idNodo).exec();
                    }
                    catch (error) {
                        console.log(`Error buscando el nodoConocimiento parent del evento`);
                        throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                    }
                    try {
                        console.log(`Buscando los ${elEvento.participantes.length} participantes del evento`);
                        var losParticipantes = yield Usuario_1.ModeloUsuario.find({ id: { $in: elEvento.participantes } }).exec();
                        console.log(`Encontrados ${losParticipantes.length} participantes del evento ${elEvento.nombre}`);
                    }
                    catch (error) {
                        console.log(`Error buscando los participantes del evento ${idEvento}: ${error}`);
                        throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                    }
                    infoEvento = {
                        id: elEvento.id,
                        nombreParent: elParent.nombre,
                        tipoParent: "Clase",
                        participantes: losParticipantes
                    };
                }
                return infoEvento;
            });
        },
    },
    Mutation: {
        crearEventoProyectoCalendario(_, { origen, idOrigen, horarioInicio, horarioFinal }, contexto) {
            return __awaiter(this, void 0, void 0, function* () {
                let credencialesUsuario = contexto.usuario;
                var idsAutorizados = [];
                var participantesEvento = [];
                if (origen === "club") {
                    try {
                        var elProyecto = yield Proyecto_1.ModeloProyecto.findById(idOrigen).exec();
                        if (!elProyecto)
                            throw "Proyecto parent no encontrado";
                    }
                    catch (error) {
                        console.log(`Error buscando el club parent. E: ${error}`);
                        throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                    }
                    idsAutorizados = elProyecto.responsables;
                    participantesEvento = elProyecto.participantes;
                    const indexU = participantesEvento.indexOf(credencialesUsuario.id);
                    if (indexU == -1) {
                        participantesEvento.push(credencialesUsuario.id);
                    }
                }
                console.log(`Creando evento con participantes: ${participantesEvento}`);
                //Autorización
                const permisosEspeciales = ["superadministrador"];
                if (!idsAutorizados.some(id => id === credencialesUsuario.id) && !permisosEspeciales.some(p => credencialesUsuario.permisos.includes(p))) {
                    console.log(`Error de autenticación`);
                    throw new apollo_server_express_1.AuthenticationError("No autorizado");
                }
                console.log(`Creando un evento que va desde ${horarioInicio} hasta ${horarioFinal}`);
                if (horarioFinal <= (horarioInicio + 600000)) {
                    throw new apollo_server_express_1.UserInputError("Datos de tiempo inválidos");
                }
                try {
                    var nuevoEvento = new Evento_1.ModeloEvento({ origen, idOrigen, horarioInicio, horarioFinal, participantes: participantesEvento });
                    yield nuevoEvento.save();
                }
                catch (error) {
                    console.log(`Error creando el nuevo evento. E: ${error}`);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                return nuevoEvento;
            });
        },
        crearClaseNodoConocimientoCalendario(_, { idNodo, idClase, horarioInicio, horarioFinal, nombre, descripcion }, contexto) {
            return __awaiter(this, void 0, void 0, function* () {
                let credencialesUsuario = contexto.usuario;
                var idsAutorizados = [];
                try {
                    var elNodo = yield Nodo_1.ModeloNodo.findById(idNodo).exec();
                    if (!elNodo)
                        throw "NodoConocimiento parent no encontrado";
                    idsAutorizados = elNodo.expertos;
                }
                catch (error) {
                    console.log(`Error buscando el nodoConocimiento parent. E: ${error}`);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                //Autorización
                const permisosEspeciales = ["superadministrador"];
                if (!idsAutorizados.some(id => id === credencialesUsuario.id) && !permisosEspeciales.some(p => credencialesUsuario.permisos.includes(p))) {
                    console.log(`Error de autenticación`);
                    throw new apollo_server_express_1.AuthenticationError("No autorizado");
                }
                nombre = nombre.replace(/\s\s+/g, " ");
                if (charProhibidosNombreEvento.test(nombre)) {
                    throw new apollo_server_express_1.UserInputError("Nombre ilegal");
                }
                const laClase = elNodo.clases.find(c => c.id === idClase);
                if (!laClase) {
                    console.log(`Error. La clase para la cual se crearía un evento no existía:`);
                    throw new apollo_server_express_1.UserInputError("Datos de clase inválidos para crear el evento");
                }
                var participantesEvento = [laClase.idExperto];
                console.log(`Creando una clase que va desde ${horarioInicio} hasta ${horarioFinal}`);
                if (horarioFinal <= (horarioInicio + 600000)) {
                    throw new apollo_server_express_1.UserInputError("Datos de tiempo inválidos");
                }
                try {
                    var nuevoEvento = new Evento_1.ModeloEvento({ origen: 'claseNodoConocimiento', idOrigen: idClase, idNodo, horarioInicio, horarioFinal, participantes: participantesEvento, descripcion, nombre });
                    yield nuevoEvento.save();
                }
                catch (error) {
                    console.log(`Error creando el nuevo evento. E: ${error}`);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                return nuevoEvento;
            });
        },
        eliminarEventoCalendario(_, { idEvento }, contexto) {
            return __awaiter(this, void 0, void 0, function* () {
                let credencialesUsuario = contexto.usuario;
                console.log(`Solicitud de eliminar un evento con id ${idEvento}`);
                try {
                    var elEvento = yield Evento_1.ModeloEvento.findById(idEvento).exec();
                    if (!elEvento)
                        throw "Evento no encontrado";
                }
                catch (error) {
                    console.log(`Error buscando el evento: ${error}`);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                var idsAutorizados = [];
                if (elEvento.origen === "club") {
                    try {
                        var elProyecto = yield Proyecto_1.ModeloProyecto.findById(elEvento.idOrigen).exec();
                        if (!elProyecto)
                            throw "Proyecto parent no encontrado";
                    }
                    catch (error) {
                        console.log(`Error buscando el club parent. E: ${error}`);
                        throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                    }
                    idsAutorizados = elProyecto.responsables;
                }
                //Autorización
                const permisosEspeciales = ["superadministrador"];
                if (!idsAutorizados.some(id => id === credencialesUsuario.id) && !permisosEspeciales.some(p => credencialesUsuario.permisos.includes(p))) {
                    console.log(`Error de autenticación`);
                    throw new apollo_server_express_1.AuthenticationError("No autorizado");
                }
                try {
                    yield Evento_1.ModeloEvento.findByIdAndDelete(idEvento).exec();
                }
                catch (error) {
                    console.log(`Error eliminando el evento: ${error}`);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                return true;
            });
        },
        setHorariosEvento(_, { idEvento, nuevoHorarioInicio, nuevoHorarioFinal }, contexto) {
            return __awaiter(this, void 0, void 0, function* () {
                let credencialesUsuario = contexto.usuario;
                console.log(`Solicitud de set tiempos de un evento en ${nuevoHorarioInicio} - ${nuevoHorarioFinal}`);
                try {
                    var elEvento = yield Evento_1.ModeloEvento.findById(idEvento).exec();
                    if (!elEvento)
                        throw "Evento no encontrado";
                }
                catch (error) {
                    console.log(`Error buscando el evento: ${error}`);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                var idsAutorizados = [];
                if (elEvento.origen === "club") {
                    try {
                        var elProyecto = yield Proyecto_1.ModeloProyecto.findById(elEvento.idOrigen).exec();
                        if (!elProyecto)
                            throw "Proyecto parent no encontrado";
                    }
                    catch (error) {
                        console.log(`Error buscando el club parent. E: ${error}`);
                        throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                    }
                    idsAutorizados = elProyecto.responsables;
                }
                //Autorización
                const permisosEspeciales = ["superadministrador"];
                if (!idsAutorizados.some(id => id === credencialesUsuario.id) && !permisosEspeciales.some(p => credencialesUsuario.permisos.includes(p))) {
                    console.log(`Error de autenticación`);
                    throw new apollo_server_express_1.AuthenticationError("No autorizado");
                }
                var dateInicio = new Date(nuevoHorarioInicio);
                var dateFinal = new Date(nuevoHorarioFinal);
                const duracionMinima = 300000; //5 minutos
                const duracion = dateFinal.getTime() - dateInicio.getTime();
                if (duracion < duracionMinima) {
                    console.log(`Ajustando a duracion mínima de ${duracionMinima / 60} minutos`);
                    dateFinal = new Date(dateInicio.getTime() + duracionMinima);
                }
                try {
                    elEvento.horarioInicio = nuevoHorarioInicio;
                    elEvento.horarioFinal = dateFinal;
                    yield elEvento.save();
                }
                catch (error) {
                    console.log(`Error guardando el nuevo horario de inicio: ${error}`);
                    throw new apollo_server_express_1.ApolloError("Error escribiendo en la base de datos");
                }
                console.log(`Quedó de ${elEvento.horarioInicio} a ${elEvento.horarioFinal}`);
                return elEvento;
            });
        },
        editarNombreEventoCalendario: function (_, { idEvento, nuevoNombre }, contexto) {
            return __awaiter(this, void 0, void 0, function* () {
                let credencialesUsuario = contexto.usuario;
                try {
                    var elEvento = yield Evento_1.ModeloEvento.findById(idEvento).exec();
                    if (!elEvento) {
                        throw "evento no encontrado";
                    }
                }
                catch (error) {
                    console.log(`error buscando el evento. E: ` + error);
                }
                var idsAutorizados = [];
                if (elEvento.origen === "club") {
                    try {
                        var elProyecto = yield Proyecto_1.ModeloProyecto.findById(elEvento.idOrigen).exec();
                        if (!elProyecto)
                            throw "Proyecto parent no encontrado";
                    }
                    catch (error) {
                        console.log(`Error buscando el club parent. E: ${error}`);
                        throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                    }
                    idsAutorizados = elProyecto.responsables;
                }
                //Autorización
                const permisosEspeciales = ["superadministrador"];
                if (!idsAutorizados.some(id => id === credencialesUsuario.id) && !permisosEspeciales.some(p => credencialesUsuario.permisos.includes(p))) {
                    console.log(`Error de autenticación`);
                    throw new apollo_server_express_1.AuthenticationError("No autorizado");
                }
                nuevoNombre = nuevoNombre.replace(/\s\s+/g, " ");
                if (charProhibidosNombreEvento.test(nuevoNombre)) {
                    throw new apollo_server_express_1.ApolloError("Nombre ilegal");
                }
                nuevoNombre = nuevoNombre.trim();
                try {
                    console.log(`guardando nuevo nombre ${elEvento.nombre} en la base de datos`);
                    var resEvento = yield Evento_1.ModeloEvento.findByIdAndUpdate(idEvento, { nombre: nuevoNombre }, { new: true }).exec();
                }
                catch (error) {
                    console.log(`error guardando el evento con coordenadas manuales: ${error}`);
                }
                console.log(`Nombre guardado`);
                return resEvento;
            });
        },
        editarDescripcionEventoCalendario: function (_, { idEvento, nuevoDescripcion }, contexto) {
            return __awaiter(this, void 0, void 0, function* () {
                console.log(`|||||||||||||||||||`);
                console.log(`Solicitud de set descripcion del evento con id ${idEvento}`);
                let credencialesUsuario = contexto.usuario;
                try {
                    var elEvento = yield Evento_1.ModeloEvento.findById(idEvento).exec();
                    if (!elEvento) {
                        throw "evento no encontrado";
                    }
                }
                catch (error) {
                    console.log(`error buscando el evento. E: ` + error);
                }
                var idsAutorizados = [];
                if (elEvento.origen === "club") {
                    try {
                        var elProyecto = yield Proyecto_1.ModeloProyecto.findById(elEvento.idOrigen).exec();
                        if (!elProyecto)
                            throw "Proyecto parent no encontrado";
                    }
                    catch (error) {
                        console.log(`Error buscando el club parent. E: ${error}`);
                        throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                    }
                    idsAutorizados = elProyecto.responsables;
                }
                //Autorización
                const permisosEspeciales = ["superadministrador"];
                if (!idsAutorizados.some(id => id === credencialesUsuario.id) && !permisosEspeciales.some(p => credencialesUsuario.permisos.includes(p))) {
                    console.log(`Error de autenticación`);
                    throw new apollo_server_express_1.AuthenticationError("No autorizado");
                }
                const charProhibidosDescripcionEvento = /[^\n\r a-zA-ZÀ-ž0-9_():;.,+¡!¿?@=-]/;
                if (charProhibidosDescripcionEvento.test(nuevoDescripcion)) {
                    throw new apollo_server_express_1.ApolloError("Descripcion ilegal");
                }
                nuevoDescripcion = nuevoDescripcion.trim();
                try {
                    console.log(`guardando nuevo descripcion ${nuevoDescripcion} en la base de datos`);
                    var resEvento = yield Evento_1.ModeloEvento.findByIdAndUpdate(idEvento, { descripcion: nuevoDescripcion }, { new: true }).exec();
                }
                catch (error) {
                    console.log(`error guardando el evento: ${error}`);
                }
                console.log(`Descripcion guardado`);
                return resEvento;
            });
        },
        setAsistenciaUsuarioEventoCalendario: function (_, { idEvento, idUsuario, nuevoAsistencia }, contexto) {
            return __awaiter(this, void 0, void 0, function* () {
                let credencialesUsuario = contexto.usuario;
                //Autorizacion
                const permisosEspeciales = ["superadministrador"];
                if (credencialesUsuario.id != idUsuario && !permisosEspeciales.some(p => credencialesUsuario.permisos.includes(p))) {
                    console.log(`Error de autenticación`);
                    throw new apollo_server_express_1.AuthenticationError("No autorizado");
                }
                try {
                    var elEvento = yield Evento_1.ModeloEvento.findById(idEvento).exec();
                    if (!elEvento) {
                        throw "evento no encontrado";
                    }
                }
                catch (error) {
                    console.log(`error buscando el evento. E: ` + error);
                }
                const indexU = elEvento.participantes.indexOf(idUsuario);
                if (indexU > -1 && !nuevoAsistencia) {
                    elEvento.participantes.splice(indexU, 1);
                }
                else if (indexU === -1 && nuevoAsistencia) {
                    elEvento.participantes.push(idUsuario);
                }
                try {
                    yield elEvento.save();
                }
                catch (error) {
                    console.log(`Error guardando el evento tras set asistencia de usuario ${idUsuario} a ${nuevoAsistencia}`);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                return elEvento;
            });
        }
    },
    EventoCalendario: {
        responsables(parent, _, __) {
            return __awaiter(this, void 0, void 0, function* () {
                var responsables = [];
                if (parent.origen === "club") {
                    try {
                        var elProyecto = yield Proyecto_1.ModeloProyecto.findById(parent.idOrigen).exec();
                        if (!elProyecto)
                            throw "Proyecto parent no encontrado buscando responsables de un evento";
                        responsables = elProyecto.responsables;
                    }
                    catch (error) {
                        console.log(`Error buscando el club parent. E: ${error}`);
                        throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                    }
                }
                else if (parent.origen === 'claseNodoConocimiento') {
                    try {
                        var elNodo = yield Nodo_1.ModeloNodo.findById(parent.idNodo).exec();
                        if (!elNodo)
                            throw "Nodo parent no encontrado buscando responsables de un evento";
                        console.log(`clases del nodo: ${elNodo.clases}`);
                        var laClase = elNodo.clases.find(c => c.id === parent.idOrigen);
                        console.log(`Error buscando la clase con id ${parent.idOrigen} en el nodo ${elNodo.nombre} para el evento ${parent.id}`);
                        if (!laClase)
                            throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                        console.log(`Buscando el responsable de la clase: ${laClase.nombre}`);
                        responsables = [laClase.idExperto];
                    }
                    catch (error) {
                        console.log(`Error buscando el nodo parent. E: ${error}`);
                        throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                    }
                }
                return responsables;
            });
        }
    }
};
