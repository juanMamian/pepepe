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
const Proyecto_1 = require("../model/Proyecto");
const Usuario_1 = require("../model/Usuario");
exports.typeDefs = apollo_server_express_1.gql `
    type Proyecto{
        id: ID,
        nombre: String,
        responsables: [PublicUsuario],
        posiblesResponsables:[PublicUsuario],
        trabajos: [Trabajo],
        objetivos: [Objetivo]
    }
    type Objetivo{
       id: ID,
       nombre: String,
       descripcion:String,
   }
    extend type Query{
        proyectos: [Proyecto!],
        proyecto(idProyecto:ID!): Proyecto
    }
    extend type Mutation{
        editarNombreProyecto(idProyecto: ID!, nuevoNombre: String!):Proyecto,
        crearProyecto:Proyecto,        
        addResponsableProyecto(idProyecto:ID!, idUsuario:ID!):Proyecto,
        addPosibleResponsableProyecto(idProyecto:ID!, idUsuario:ID!):Proyecto,
        removeResponsableProyecto(idProyecto:ID!, idUsuario:ID!):Proyecto,
        
        crearTrabajoEnProyecto(idProyecto: ID!):Trabajo,
        eliminarTrabajoDeProyecto(idTrabajo:ID!, idProyecto:ID!):Boolean,
        cambiarNombreTrabajo(idProyecto:ID!, idTrabajo:ID!, nuevoNombre: String!):Trabajo,
        cambiarDescripcionTrabajo(idProyecto:ID!, idTrabajo:ID!, nuevaDescripcion: String!):Trabajo,
        addResponsableTrabajo(idProyecto:ID!, idTrabajo:ID!,idUsuario:ID!):Trabajo,
        removeResponsableTrabajo(idProyecto:ID!, idTrabajo:ID!, idUsuario:ID!):Trabajo,



        crearObjetivoEnProyecto(idProyecto: ID!):Objetivo,
        eliminarObjetivoDeProyecto(idObjetivo:ID!, idProyecto:ID!):Boolean,
        cambiarNombreObjetivo(idProyecto:ID!, idObjetivo:ID!, nuevoNombre: String!):Objetivo,
        cambiarDescripcionObjetivo(idProyecto:ID!, idObjetivo:ID!, nuevaDescripcion: String!):Objetivo,

    }
    
`;
exports.resolvers = {
    Query: {
        proyectos: function (_, args, context) {
            return __awaiter(this, void 0, void 0, function* () {
                console.log(`enviando lista de todos los proyectos`);
                try {
                    var listaP = yield Proyecto_1.ModeloProyecto.find({}).exec();
                }
                catch (error) {
                    console.log(`error buscando la lista de proyectos. E: ${error}`);
                    throw new apollo_server_express_1.ApolloError("");
                }
                return listaP;
            });
        },
        proyecto: function (_, { idProyecto }, context) {
            return __awaiter(this, void 0, void 0, function* () {
                console.log(`Buscando proyecto con id ${idProyecto}`);
                try {
                    var elProyecto = yield Proyecto_1.ModeloProyecto.findById(idProyecto).exec();
                    if (!elProyecto) {
                        throw "proyecto no encontrado";
                    }
                }
                catch (error) {
                    console.log(`Error buscando el proyecto. E:${error}`);
                    throw new apollo_server_express_1.ApolloError("Error en la conexión con la base de datos");
                }
                return elProyecto;
            });
        }
    },
    Mutation: {
        addPosibleResponsableProyecto: function (_, { idProyecto, idUsuario }, contexto) {
            return __awaiter(this, void 0, void 0, function* () {
                console.log(`añadiendo usuario ${idUsuario} a la lista de posibles responsables del proyecto ${idProyecto}`);
                let credencialesUsuario = contexto.usuario;
                try {
                    var elProyecto = yield Proyecto_1.ModeloProyecto.findById(idProyecto).exec();
                    if (!elProyecto) {
                        throw "proyecto no encontrado";
                    }
                }
                catch (error) {
                    console.log("Error buscando el proyecto en la base de datos. E: " + error);
                    throw new apollo_server_express_1.ApolloError("Error de conexión con la base de datos");
                }
                //Authorización
                if (idUsuario != credencialesUsuario.id && !credencialesUsuario.permisos.includes("superadministrador")) {
                    console.log(`Error de autenticacion añadiendo posible responsable del proyecto`);
                    throw new apollo_server_express_1.AuthenticationError("No autorizado");
                }
                if (elProyecto.posiblesResponsables.includes(idUsuario)) {
                    console.log(`el usuario ya estaba en la lista`);
                    throw new apollo_server_express_1.ApolloError("El usuario ya estaba en la lista");
                }
                try {
                    var elUsuario = yield Usuario_1.ModeloUsuario.findById(idUsuario).exec();
                    if (!elUsuario) {
                        console.log(`No se pudo encontrar al usuario con id ${idUsuario} en la base de datos`);
                        throw new apollo_server_express_1.ApolloError("Error buscando al usuario en la base de datos");
                    }
                }
                catch (error) {
                    console.log("Error buscando al usuario en la base de datos. E: " + error);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                try {
                    elProyecto.posiblesResponsables.push(idUsuario);
                    yield elProyecto.save();
                }
                catch (error) {
                    console.log("Error guardando datos en la base de datos. E: " + error);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                console.log(`Proyecto guardado`);
                return elProyecto;
            });
        },
        addResponsableProyecto: function (_, { idProyecto, idUsuario }, contexto) {
            return __awaiter(this, void 0, void 0, function* () {
                console.log(`Solicitud de add un usuario con id ${idUsuario} a un proyecto con id ${idProyecto}`);
                let credencialesUsuario = contexto.usuario;
                try {
                    var elProyecto = yield Proyecto_1.ModeloProyecto.findById(idProyecto).exec();
                    if (!elProyecto) {
                        throw "proyecto no encontrado";
                    }
                }
                catch (error) {
                    console.log("Error buscando el proyecto en la base de datos. E: " + error);
                    throw new apollo_server_express_1.ApolloError("Error de conexión con la base de datos");
                }
                //Authorización
                if (elProyecto.responsables.length > 0 && !elProyecto.responsables.includes(credencialesUsuario.id) && credencialesUsuario.permisos.includes("superadministrador")) {
                    console.log(`Error de autenticacion editando nombre de proyecto`);
                    throw new apollo_server_express_1.AuthenticationError("No autorizado");
                }
                try {
                    var elUsuario = yield Usuario_1.ModeloUsuario.findById(idUsuario).exec();
                    if (!elUsuario) {
                        console.log(`No se pudo encontrar al usuario con id ${idUsuario} en la base de datos`);
                        throw new apollo_server_express_1.ApolloError("Error buscando al usuario en la base de datos");
                    }
                }
                catch (error) {
                    console.log("Error buscando al usuario en la base de datos. E: " + error);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                if (elProyecto.responsables.includes(idUsuario)) {
                    console.log(`El usuario ya era responsable de este proyecto`);
                    throw new apollo_server_express_1.ApolloError("El usuario ya estaba incluido");
                }
                elProyecto.responsables.push(idUsuario);
                console.log(`Usuario añadido a la lista de responsables`);
                let indexPosibleResponsable = elProyecto.posiblesResponsables.indexOf(idUsuario);
                if (indexPosibleResponsable > -1) {
                    console.log(`sacando al usuario ${idUsuario} de la lista de posibles responsables`);
                    elProyecto.posiblesResponsables.splice(indexPosibleResponsable, 1);
                }
                try {
                    yield elProyecto.save();
                }
                catch (error) {
                    console.log("Error guardando datos en la base de datos. E: " + error);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                console.log(`Proyecto guardado`);
                return elProyecto;
            });
        },
        removeResponsableProyecto: function (_, { idProyecto, idUsuario }, contexto) {
            return __awaiter(this, void 0, void 0, function* () {
                console.log(`Solicitud de remover un usuario con id ${idUsuario} a un proyecto con id ${idProyecto}`);
                let credencialesUsuario = contexto.usuario;
                try {
                    var elProyecto = yield Proyecto_1.ModeloProyecto.findById(idProyecto).exec();
                    if (!elProyecto) {
                        throw "proyecto no encontrado";
                    }
                }
                catch (error) {
                    console.log("Error buscando el proyecto en la base de datos. E: " + error);
                    throw new apollo_server_express_1.ApolloError("Error de conexión con la base de datos");
                }
                //Authorización
                if (idUsuario != credencialesUsuario.id && !credencialesUsuario.permisos.includes("superadministrador")) {
                    console.log(`Error de autenticacion removiendo responsable o posible responsable de proyecto`);
                    throw new apollo_server_express_1.AuthenticationError("No autorizado");
                }
                try {
                    var elUsuario = yield Usuario_1.ModeloUsuario.findById(idUsuario).exec();
                    if (!elUsuario) {
                        console.log(`No se pudo encontrar al usuario con id ${idUsuario} en la base de datos`);
                        throw new apollo_server_express_1.ApolloError("Error buscando al usuario en la base de datos");
                    }
                }
                catch (error) {
                    console.log("Error buscando al usuario en la base de datos. E: " + error);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                let indexPosibleResponsable = elProyecto.posiblesResponsables.indexOf(idUsuario);
                if (indexPosibleResponsable > -1) {
                    console.log(`sacando al usuario ${idUsuario} de la lista de posibles responsables`);
                    elProyecto.posiblesResponsables.splice(indexPosibleResponsable, 1);
                }
                let indexResponsable = elProyecto.responsables.indexOf(idUsuario);
                if (indexResponsable > -1) {
                    console.log(`sacando al usuario ${idUsuario} de la lista de responsables`);
                    elProyecto.responsables.splice(indexResponsable, 1);
                }
                try {
                    yield elProyecto.save();
                }
                catch (error) {
                    console.log("Error guardando datos en la base de datos. E: " + error);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                console.log(`Proyecto guardado`);
                return elProyecto;
            });
        },
        editarNombreProyecto: function (_, { idProyecto, nuevoNombre }, contexto) {
            return __awaiter(this, void 0, void 0, function* () {
                let credencialesUsuario = contexto.usuario;
                try {
                    var elProyecto = yield Proyecto_1.ModeloProyecto.findById(idProyecto).exec();
                    if (!elProyecto) {
                        throw "proyecto no encontrado";
                    }
                }
                catch (error) {
                    console.log(`error buscando el proyecto. E: ` + error);
                }
                //Authorización
                if (!elProyecto.responsables.includes(credencialesUsuario.id) && !credencialesUsuario.permisos.includes("superadministrador")) {
                    console.log(`Error de autenticacion editando nombre de proyecto`);
                    throw new apollo_server_express_1.AuthenticationError("No autorizado");
                }
                var charProhibidosNombreProyecto = /[^ a-zA-ZÀ-ž0-9_():.,-]/g;
                nuevoNombre = nuevoNombre.replace(/\s\s+/g, " ");
                if (charProhibidosNombreProyecto.test(nuevoNombre)) {
                    throw new apollo_server_express_1.ApolloError("Nombre ilegal");
                }
                elProyecto.nombre = nuevoNombre.trim();
                try {
                    console.log(`guardando nuevo nombre ${elProyecto.nombre} en la base de datos`);
                    yield elProyecto.save();
                }
                catch (error) {
                    console.log(`error guardando el proyecto con coordenadas manuales: ${error}`);
                }
                return elProyecto;
            });
        },
        crearProyecto(_, args, contexto) {
            return __awaiter(this, void 0, void 0, function* () {
                console.log(`mutacion`);
                let usuario = contexto.usuario;
                if (!usuario) {
                    console.log(`Intento de crear un nuevo proyecto sin nombre de usuario seteado en el contexto`);
                    //throw new AuthenticationError("No autorizado");
                }
                if (!usuario.id) {
                    console.log(`No había id del usuario creador`);
                    throw new apollo_server_express_1.ApolloError("No ID");
                }
                console.log(`el usuario ${usuario.username} intenta crear un nuevo proyecto`);
                let elProyecto = yield new Proyecto_1.ModeloProyecto({
                    responsables: [usuario.id]
                });
                try {
                    yield elProyecto.save();
                }
                catch (error) {
                    console.log(`error guardando el nuevo proyecto. E: ${error}`);
                    throw new apollo_server_express_1.ApolloError("error");
                }
                console.log(`proyecto creado`);
                return elProyecto;
            });
        },
        crearTrabajoEnProyecto(_, { idProyecto }, contexto) {
            return __awaiter(this, void 0, void 0, function* () {
                console.log(`Peticion de crear un nuevo trabajo en el proyecto con id ${idProyecto}`);
                try {
                    var elProyecto = yield Proyecto_1.ModeloProyecto.findById(idProyecto).exec();
                    if (!elProyecto) {
                        throw "proyecto no encontrado";
                    }
                }
                catch (error) {
                    console.log("Proyecto no encontrado. E: " + error);
                    throw new apollo_server_express_1.ApolloError("Error conectandose con la base de datos");
                }
                //Authorización
                let credencialesUsuario = contexto.usuario;
                if (!elProyecto.responsables.includes(credencialesUsuario.id) && !credencialesUsuario.permisos.includes("superadministrador")) {
                    console.log(`Error de autenticacion editando nombre de proyecto`);
                    throw new apollo_server_express_1.AuthenticationError("No autorizado");
                }
                console.log(`creando un nuevo trabajo desde el proyecto ${elProyecto}`);
                try {
                    var nuevoTrabajo = elProyecto.trabajos.create();
                    elProyecto.trabajos.push(nuevoTrabajo);
                    yield elProyecto.save();
                }
                catch (error) {
                    console.log("Error guardando el trabajo creado en el proyecto. E: " + error);
                    throw new apollo_server_express_1.ApolloError("Error introduciendo el trabajo en el proyecto");
                }
                return nuevoTrabajo;
            });
        },
        eliminarTrabajoDeProyecto(_, { idTrabajo, idProyecto }, contexto) {
            return __awaiter(this, void 0, void 0, function* () {
                console.log(`peticion de eliminar un trabajo con id ${idTrabajo} de un proyecto con id ${idProyecto}`);
                let credencialesUsuario = contexto.usuario;
                try {
                    var elProyecto = yield Proyecto_1.ModeloProyecto.findById(idProyecto).exec();
                    if (!elProyecto) {
                        throw "proyecto no encontrado";
                    }
                }
                catch (error) {
                    console.log("Error buscando el proyecto en la base de datos. E: " + error);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                //Authorización
                if (!elProyecto.responsables.includes(credencialesUsuario.id) && !credencialesUsuario.permisos.includes("superadministrador")) {
                    console.log(`Error de autenticacion editando nombre de proyecto`);
                    throw new apollo_server_express_1.AuthenticationError("No autorizado");
                }
                try {
                    yield elProyecto.trabajos.id(idTrabajo).remove();
                }
                catch (error) {
                    console.log(`Trabajo ${idTrabajo} no encontrado. E: ` + error);
                    throw new apollo_server_express_1.ApolloError("");
                }
                try {
                    yield elProyecto.save();
                }
                catch (error) {
                    console.log("Error guardando el trabajo creado en el proyecto. E: " + error);
                    throw new apollo_server_express_1.ApolloError("Error introduciendo el trabajo en el proyecto");
                }
                console.log(`eliminado`);
                return true;
            });
        },
        cambiarNombreTrabajo(_, { idProyecto, idTrabajo, nuevoNombre }, contexto) {
            return __awaiter(this, void 0, void 0, function* () {
                let credencialesUsuario = contexto.usuario;
                console.log(`cambiando el nombre del trabajo con id ${idTrabajo} del proyecto con id ${idProyecto}`);
                var charProhibidosNombre = /[^ a-zA-ZÀ-ž0-9_():.,-]/g;
                nuevoNombre = nuevoNombre.replace(/\s\s+/g, " ");
                if (charProhibidosNombre.test(nuevoNombre)) {
                    throw new apollo_server_express_1.ApolloError("Nombre ilegal");
                }
                nuevoNombre = nuevoNombre.trim();
                try {
                    var elProyecto = yield Proyecto_1.ModeloProyecto.findById(idProyecto).exec();
                    if (!elProyecto) {
                        throw "proyecto no encontrado";
                    }
                }
                catch (error) {
                    console.log("Error buscando el proyecto. E: " + error);
                    throw new apollo_server_express_1.ApolloError("Erro en la conexión con la base de datos");
                }
                //Authorización
                if (!elProyecto.responsables.includes(credencialesUsuario.id) && !credencialesUsuario.permisos.includes("superadministrador")) {
                    console.log(`Error de autenticacion editando nombre de proyecto`);
                    throw new apollo_server_express_1.AuthenticationError("No autorizado");
                }
                try {
                    elProyecto.trabajos.id(idTrabajo).nombre = nuevoNombre;
                }
                catch (error) {
                    console.log("Error cambiando el nombre en la base de datos. E: " + error);
                    throw new apollo_server_express_1.ApolloError("Error guardando el nombre en la base de datos");
                }
                try {
                    yield elProyecto.save();
                }
                catch (error) {
                    console.log("Error guardando el trabajo creado en el proyecto. E: " + error);
                    throw new apollo_server_express_1.ApolloError("Error introduciendo el trabajo en el proyecto");
                }
                console.log(`Nombre cambiado`);
                return elProyecto.trabajos.id(idTrabajo);
            });
        },
        cambiarDescripcionTrabajo(_, { idProyecto, idTrabajo, nuevaDescripcion }, contexto) {
            return __awaiter(this, void 0, void 0, function* () {
                let credencialesUsuario = contexto.usuario;
                console.log(`cambiando la descripcion del trabajo con id ${idTrabajo} del proyecto con id ${idProyecto}`);
                var charProhibidosNombre = /[^ a-zA-ZÀ-ž0-9_():.,-]/g;
                nuevaDescripcion = nuevaDescripcion.replace(/\s\s+/g, " ");
                if (charProhibidosNombre.test(nuevaDescripcion)) {
                    throw new apollo_server_express_1.ApolloError("Descripcion ilegal");
                }
                nuevaDescripcion = nuevaDescripcion.trim();
                try {
                    var elProyecto = yield Proyecto_1.ModeloProyecto.findById(idProyecto).exec();
                    if (!elProyecto) {
                        throw "proyecto no encontrado";
                    }
                }
                catch (error) {
                    console.log("Error buscando el proyecto. E: " + error);
                    throw new apollo_server_express_1.ApolloError("Error en la conexión con la base de datos");
                }
                //Authorización
                if (!elProyecto.responsables.includes(credencialesUsuario.id) && !credencialesUsuario.permisos.includes("superadministrador")) {
                    console.log(`Error de autenticacion editando nombre de proyecto`);
                    throw new apollo_server_express_1.AuthenticationError("No autorizado");
                }
                try {
                    elProyecto.trabajos.id(idTrabajo).descripcion = nuevaDescripcion;
                }
                catch (error) {
                    console.log("Error cambiando la descripcion en la base de datos. E: " + error);
                    throw new apollo_server_express_1.ApolloError("Error guardando la descripcion en la base de datos");
                }
                try {
                    yield elProyecto.save();
                }
                catch (error) {
                    console.log("Error guardando el trabajo creado en el proyecto. E: " + error);
                    throw new apollo_server_express_1.ApolloError("Error introduciendo el trabajo en el proyecto");
                }
                console.log(`Descripcion cambiada`);
                return elProyecto.trabajos.id(idTrabajo);
            });
        },
        addResponsableTrabajo: function (_, { idProyecto, idTrabajo, idUsuario }, contexto) {
            return __awaiter(this, void 0, void 0, function* () {
                console.log(`Solicitud de add un usuario con id ${idUsuario} a un trabajo de id ${idTrabajo} en un proyecto con id ${idProyecto}`);
                let credencialesUsuario = contexto.usuario;
                try {
                    var elProyecto = yield Proyecto_1.ModeloProyecto.findById(idProyecto).exec();
                    if (!elProyecto) {
                        throw "proyecto no encontrado";
                    }
                }
                catch (error) {
                    console.log("Error buscando el proyecto en la base de datos. E: " + error);
                    throw new apollo_server_express_1.ApolloError("Error de conexión con la base de datos");
                }
                //Authorización
                if (idUsuario != credencialesUsuario.id && !credencialesUsuario.permisos.includes("superadministrador")) {
                    console.log(`Error de autenticacion editando nombre de proyecto`);
                    throw new apollo_server_express_1.AuthenticationError("No autorizado");
                }
                try {
                    var elUsuario = yield Usuario_1.ModeloUsuario.findById(idUsuario).exec();
                    if (!elUsuario) {
                        console.log(`No se pudo encontrar al usuario con id ${idUsuario} en la base de datos`);
                        throw new apollo_server_express_1.ApolloError("Error buscando al usuario en la base de datos");
                    }
                }
                catch (error) {
                    console.log("Error buscando al usuario en la base de datos. E: " + error);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                var elTrabajo = elProyecto.trabajos.id(idTrabajo);
                if (!elTrabajo) {
                    console.log(`No se encontró el trabajo ${idTrabajo} en el proyecto ${idProyecto}`);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                if (elTrabajo.responsables.includes(idUsuario)) {
                    console.log(`El usuario ya era responsable de este trabajo`);
                    throw new apollo_server_express_1.ApolloError("El usuario ya estaba incluido");
                }
                try {
                    elTrabajo.responsables.push(idUsuario);
                    console.log(`Usuario añadido a la lista de responsables`);
                    yield elProyecto.save();
                }
                catch (error) {
                    console.log("Error guardando datos en la base de datos. E: " + error);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                console.log(`Proyecto guardado`);
                return elTrabajo;
            });
        },
        removeResponsableTrabajo: function (_, { idProyecto, idTrabajo, idUsuario }, contexto) {
            return __awaiter(this, void 0, void 0, function* () {
                console.log(`Solicitud de add un usuario con id ${idUsuario} a un trabajo de id ${idTrabajo} en un proyecto con id ${idProyecto}`);
                let credencialesUsuario = contexto.usuario;
                try {
                    var elProyecto = yield Proyecto_1.ModeloProyecto.findById(idProyecto).exec();
                    if (!elProyecto) {
                        throw "proyecto no encontrado";
                    }
                }
                catch (error) {
                    console.log("Error buscando el proyecto en la base de datos. E: " + error);
                    throw new apollo_server_express_1.ApolloError("Error de conexión con la base de datos");
                }
                //Authorización
                if (idUsuario != credencialesUsuario.id && !credencialesUsuario.permisos.includes("superadministrador")) {
                    console.log(`Error de autenticacion editando nombre de proyecto`);
                    throw new apollo_server_express_1.AuthenticationError("No autorizado");
                }
                try {
                    var elUsuario = yield Usuario_1.ModeloUsuario.findById(idUsuario).exec();
                    if (!elUsuario) {
                        console.log(`No se pudo encontrar al usuario con id ${idUsuario} en la base de datos`);
                        throw new apollo_server_express_1.ApolloError("Error buscando al usuario en la base de datos");
                    }
                }
                catch (error) {
                    console.log("Error buscando al usuario en la base de datos. E: " + error);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                var elTrabajo = elProyecto.trabajos.id(idTrabajo);
                if (!elTrabajo) {
                    console.log(`No se encontró el trabajo ${idTrabajo} en el proyecto ${idProyecto}`);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                if (!elTrabajo.responsables.includes(idUsuario)) {
                    console.log(`El usuario no era responsable de este trabajo`);
                    throw new apollo_server_express_1.ApolloError("El usuario no participaba de este trabajo");
                }
                let indexResponsable = elTrabajo.responsables.indexOf(idUsuario);
                if (indexResponsable > -1) {
                    console.log(`sacando al usuario ${idUsuario} de la lista de responsables`);
                    elTrabajo.responsables.splice(indexResponsable, 1);
                }
                console.log(`Usuario retirado de la lista de responsables`);
                try {
                    yield elProyecto.save();
                }
                catch (error) {
                    console.log("Error guardando datos en la base de datos. E: " + error);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                console.log(`Proyecto guardado`);
                return elTrabajo;
            });
        },
        crearObjetivoEnProyecto(_, { idProyecto }, contexto) {
            return __awaiter(this, void 0, void 0, function* () {
                console.log(`Peticion de crear un nuevo objetivo en el proyecto con id ${idProyecto}`);
                try {
                    var elProyecto = yield Proyecto_1.ModeloProyecto.findById(idProyecto).exec();
                    if (!elProyecto) {
                        throw "proyecto no encontrado";
                    }
                }
                catch (error) {
                    console.log("Proyecto no encontrado. E: " + error);
                    throw new apollo_server_express_1.ApolloError("Error conectandose con la base de datos");
                }
                //Authorización
                let credencialesUsuario = contexto.usuario;
                if (!elProyecto.responsables.includes(credencialesUsuario.id) && !credencialesUsuario.permisos.includes("superadministrador")) {
                    console.log(`Error de autenticacion editando nombre de proyecto`);
                    throw new apollo_server_express_1.AuthenticationError("No autorizado");
                }
                console.log(`creando un nuevo objetivo en el proyecto ${elProyecto}`);
                try {
                    var nuevoObjetivo = elProyecto.objetivos.create();
                    elProyecto.objetivos.push(nuevoObjetivo);
                    yield elProyecto.save();
                }
                catch (error) {
                    console.log("Error guardando el objetivo creado en el proyecto. E: " + error);
                    throw new apollo_server_express_1.ApolloError("Error introduciendo el objetivo en el proyecto");
                }
                return nuevoObjetivo;
            });
        },
        eliminarObjetivoDeProyecto(_, { idObjetivo, idProyecto }, contexto) {
            return __awaiter(this, void 0, void 0, function* () {
                console.log(`peticion de eliminar un objetivo con id ${idObjetivo} de un proyecto con id ${idProyecto}`);
                try {
                    var elProyecto = yield Proyecto_1.ModeloProyecto.findById(idProyecto).exec();
                    if (!elProyecto) {
                        throw "proyecto no encontrado";
                    }
                }
                catch (error) {
                    console.log("Error buscando el proyecto en la base de datos. E: " + error);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                //Authorización
                let credencialesUsuario = contexto.usuario;
                if (!elProyecto.responsables.includes(credencialesUsuario.id) && !credencialesUsuario.permisos.includes("superadministrador")) {
                    console.log(`Error de autenticacion editando nombre de proyecto`);
                    throw new apollo_server_express_1.AuthenticationError("No autorizado");
                }
                try {
                    yield elProyecto.objetivos.id(idObjetivo).remove();
                }
                catch (error) {
                    console.log(`Objetivo ${idObjetivo} no encontrado. E: ` + error);
                    throw new apollo_server_express_1.ApolloError("");
                }
                try {
                    yield elProyecto.save();
                }
                catch (error) {
                    console.log("Error guardando el objetivo creado en el proyecto. E: " + error);
                    throw new apollo_server_express_1.ApolloError("Error introduciendo el objetivo en el proyecto");
                }
                console.log(`eliminado`);
                return true;
            });
        },
        cambiarNombreObjetivo(_, { idProyecto, idObjetivo, nuevoNombre }, contexto) {
            return __awaiter(this, void 0, void 0, function* () {
                console.log(`cambiando el nombre del objetivo con id ${idObjetivo} del proyecto con id ${idProyecto}`);
                var charProhibidosNombre = /[^ a-zA-ZÀ-ž0-9_():.,-]/g;
                nuevoNombre = nuevoNombre.replace(/\s\s+/g, " ");
                if (charProhibidosNombre.test(nuevoNombre)) {
                    throw new apollo_server_express_1.ApolloError("Nombre ilegal");
                }
                nuevoNombre = nuevoNombre.trim();
                try {
                    var elProyecto = yield Proyecto_1.ModeloProyecto.findById(idProyecto).exec();
                    if (!elProyecto) {
                        throw "proyecto no encontrado";
                    }
                }
                catch (error) {
                    console.log("Error buscando el proyecto. E: " + error);
                    throw new apollo_server_express_1.ApolloError("Erro en la conexión con la base de datos");
                }
                //Authorización
                let credencialesUsuario = contexto.usuario;
                if (!elProyecto.responsables.includes(credencialesUsuario.id) && !credencialesUsuario.permisos.includes("superadministrador")) {
                    console.log(`Error de autenticacion editando nombre de proyecto`);
                    throw new apollo_server_express_1.AuthenticationError("No autorizado");
                }
                try {
                    elProyecto.objetivos.id(idObjetivo).nombre = nuevoNombre;
                }
                catch (error) {
                    console.log("Error cambiando el nombre en la base de datos. E: " + error);
                    throw new apollo_server_express_1.ApolloError("Error guardando el nombre en la base de datos");
                }
                try {
                    yield elProyecto.save();
                }
                catch (error) {
                    console.log("Error guardando el objetivo creado en el proyecto. E: " + error);
                    throw new apollo_server_express_1.ApolloError("Error introduciendo el objetivo en el proyecto");
                }
                console.log(`Nombre cambiado`);
                return elProyecto.objetivos.id(idObjetivo);
            });
        },
        cambiarDescripcionObjetivo(_, { idProyecto, idObjetivo, nuevaDescripcion }, contexto) {
            return __awaiter(this, void 0, void 0, function* () {
                console.log(`cambiando la descripcion del objetivo con id ${idObjetivo} del proyecto con id ${idProyecto}`);
                var charProhibidosNombre = /[^ a-zA-ZÀ-ž0-9_():.,-]/g;
                nuevaDescripcion = nuevaDescripcion.replace(/\s\s+/g, " ");
                if (charProhibidosNombre.test(nuevaDescripcion)) {
                    throw new apollo_server_express_1.ApolloError("Descripcion ilegal");
                }
                nuevaDescripcion = nuevaDescripcion.trim();
                try {
                    var elProyecto = yield Proyecto_1.ModeloProyecto.findById(idProyecto).exec();
                    if (!elProyecto) {
                        throw "proyecto no encontrado";
                    }
                }
                catch (error) {
                    console.log("Error buscando el proyecto. E: " + error);
                    throw new apollo_server_express_1.ApolloError("Error en la conexión con la base de datos");
                }
                //Authorización
                let credencialesUsuario = contexto.usuario;
                if (!elProyecto.responsables.includes(credencialesUsuario.id) && !credencialesUsuario.permisos.includes("superadministrador")) {
                    console.log(`Error de autenticacion editando nombre de proyecto`);
                    throw new apollo_server_express_1.AuthenticationError("No autorizado");
                }
                try {
                    elProyecto.objetivos.id(idObjetivo).descripcion = nuevaDescripcion;
                }
                catch (error) {
                    console.log("Error cambiando la descripcion en la base de datos. E: " + error);
                    throw new apollo_server_express_1.ApolloError("Error guardando la descripcion en la base de datos");
                }
                try {
                    yield elProyecto.save();
                }
                catch (error) {
                    console.log("Error guardando el objetivo creado en el proyecto. E: " + error);
                    throw new apollo_server_express_1.ApolloError("Error introduciendo el objetivo en el proyecto");
                }
                console.log(`Descripcion cambiada`);
                return elProyecto.objetivos.id(idObjetivo);
            });
        }
    },
    Proyecto: {
        responsables: function (parent, _, __) {
            return __awaiter(this, void 0, void 0, function* () {
                if (!parent.responsables) {
                    return [];
                }
                let idsResponsables = parent.responsables;
                try {
                    var usuariosResponsables = yield Usuario_1.ModeloUsuario.find({ _id: { $in: idsResponsables } }).exec();
                }
                catch (error) {
                    console.log(`error buscando a los responsables del proyecto. E: ${error}`);
                    return [];
                }
                return usuariosResponsables;
            });
        },
        posiblesResponsables: function (parent, _, __) {
            return __awaiter(this, void 0, void 0, function* () {
                if (!parent.posiblesResponsables) {
                    return [];
                }
                let idsPosiblesResponsables = parent.posiblesResponsables;
                try {
                    var usuariosPosiblesResponsables = Usuario_1.ModeloUsuario.find({ _id: { $in: idsPosiblesResponsables } }).exec();
                }
                catch (error) {
                    console.log(`error buscando a los posiblesResponsables del proyecto. E: ${error}`);
                    return [];
                }
                return usuariosPosiblesResponsables;
            });
        },
    }
};
