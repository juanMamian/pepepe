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
const Trabajo_1 = require("../model/Trabajo");
const Nodo = require("../model/atlas/Nodo");
const Usuario_1 = require("../model/Usuario");
const Foro_1 = require("../model/Foros/Foro");
const Proyecto_1 = require("../model/Proyecto");
exports.typeDefs = apollo_server_express_1.gql `

    type MaterialTrabajo{
        id: ID,
        nombre: String,
        descripcion:String,
        cantidadNecesaria:Int,
        cantidadDisponible:Int,    
        idTrabajoParent:ID,
    }

   type Trabajo{
       id: ID,
       nombre: String,
       descripcion:String,
       responsables: [String],
       nodosConocimiento:[String],
       idForo:ID,
       diagramaProyecto:InfoDiagramaProyecto,
       vinculos:[VinculoNodoProyecto],
       keywords:String,
       idProyectoParent:ID,
       estadoDesarrollo:String,
       materiales:[MaterialTrabajo],
       coords: Coords,
       angulo:Float,
       stuck:Boolean,
       puntaje:Int,
       centroMasa:Coords,
   }

   type InfoBasicaTrabajo{
       id:ID,
       nombre: String,
       idProyecto:ID
   }

   extend type Query{
       trabajo(idTrabajo: ID!):Trabajo,
       busquedaTrabajosProyectos(textoBusqueda:String!):[InfoBasicaTrabajo],
       trabajosDeProyectoDeUsuario(idUsuario:ID!):[InfoBasicaTrabajo],
       trabajosSegunCentro(centro: CoordsInput, radio: Int!):[Trabajo],
       
   }

   extend type Mutation{
    crearTrabajoEnProyecto(idProyecto: ID!, posicion:CoordsInput):ID,
    eliminarTrabajoDeProyecto(idTrabajo:ID!, idProyecto:ID!):Boolean,
    editarNombreTrabajoProyecto(idProyecto:ID!, idTrabajo:ID!, nuevoNombre: String!):Trabajo,
    editarDescripcionTrabajoProyecto(idProyecto:ID!, idTrabajo:ID!, nuevoDescripcion: String!):Trabajo,
    addResponsableTrabajo(idTrabajo:ID!,idUsuario:ID!):Trabajo,
    removeResponsableTrabajo(idTrabajo:ID!, idUsuario:ID!):Trabajo,
    setPosicionTrabajoDiagramaProyecto(idTrabajo:ID!, nuevaPosicion:CoordsInput):Trabajo,
    editarKeywordsTrabajoProyecto(idProyecto:ID!, idTrabajo:ID!, nuevoKeywords: String!):Trabajo,
    setEstadoTrabajoProyecto(idProyecto:ID!, idTrabajo:ID!, nuevoEstado:String!):Trabajo,

    crearMaterialEnTrabajoDeProyecto(idProyecto:ID!, idTrabajo:ID!):MaterialTrabajo,
    eliminarMaterialDeTrabajo(idTrabajo:ID!, idMaterial: ID!):Boolean,
    editarNombreMaterialTrabajo(idTrabajo:ID!, idMaterial: ID!, nuevoNombre: String!):MaterialTrabajo,
    editarDescripcionMaterialTrabajo(idTrabajo:ID!, idMaterial: ID!, nuevoDescripcion: String!):MaterialTrabajo,
    editarCantidadesMaterialTrabajo(idTrabajo: ID!, idMaterial:ID!, nuevoCantidadNecesaria:Int!, nuevoCantidadDisponible:Int):MaterialTrabajo,
   }

`;
exports.resolvers = {
    Query: {
        trabajo: function (_, { idTrabajo }, context) {
            return __awaiter(this, void 0, void 0, function* () {
                let tieneForo = true;
                try {
                    var elTrabajo = yield Trabajo_1.ModeloTrabajo.findById(idTrabajo).exec();
                    if (!elTrabajo) {
                        throw "Trabajo no existía";
                    }
                }
                catch (error) {
                    console.log(`error buscando un trabajo. E: ${error}`);
                    throw new apollo_server_express_1.ApolloError("");
                }
                if (!elTrabajo.idProyectoParent) {
                    console.log(`Trabajo ${elTrabajo.nombre} no tenia idProyectoParent. Buscándole`);
                    try {
                        let elProyectoParent = yield Proyecto_1.ModeloProyecto.findOne({ idsTrabajos: { $in: elTrabajo._id } }).exec();
                        if (!elProyectoParent)
                            throw "No habia proyecto parent";
                        console.log(`Era del proyecto ${elProyectoParent.nombre}`);
                        elTrabajo.idProyectoParent = elProyectoParent._id;
                        yield elTrabajo.save();
                    }
                    catch (error) {
                        console.log(`Error buscando proyecto parent. E: ${error}`);
                        throw new apollo_server_express_1.ApolloError("Error conectando con la base datos");
                    }
                }
                if (!elTrabajo.idForo) {
                    tieneForo = false;
                }
                else {
                    try {
                        let elForo = yield Foro_1.ModeloForo.findById(elTrabajo.idForo).exec();
                        if (!elForo) {
                            console.log(`El foro no existía. Se creará uno nuevo`);
                            tieneForo = false;
                        }
                    }
                    catch (error) {
                        console.log(`Error buscando foro en la base de datos. E :${error}`);
                    }
                }
                if (!tieneForo) {
                    console.log(`El trabajo ${elTrabajo.nombre} no tenía foro. Creando con miembros: ${elTrabajo.responsables}.`);
                    try {
                        var nuevoForo = yield Foro_1.ModeloForo.create({
                            miembros: elTrabajo.responsables,
                            acceso: "privado"
                        });
                        var idNuevoForo = nuevoForo._id;
                        yield nuevoForo.save();
                    }
                    catch (error) {
                        console.log(`Error creando el nuevo foro. E: ${error}`);
                        throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                    }
                    console.log(`Nuevo foro creado`);
                    try {
                        elTrabajo.idForo = idNuevoForo;
                        yield elTrabajo.save();
                    }
                    catch (error) {
                        console.log(`Error guardando el trabajo`);
                        throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                    }
                }
                return elTrabajo;
            });
        },
        busquedaTrabajosProyectos: function (_, { textoBusqueda }, contexto) {
            return __awaiter(this, void 0, void 0, function* () {
                console.log(`Buscando trabajo usando texto de búsqueda: ${textoBusqueda}`);
                const sizePaginaTrabajos = 50;
                if (contexto.usuario.id === "") {
                    console.log(`Usuario no logeado`);
                    throw new apollo_server_express_1.AuthenticationError("No autorizado");
                }
                try {
                    var losTrabajos = yield Trabajo_1.ModeloTrabajo.find({ $text: { $search: textoBusqueda } }, { score: { $meta: 'textScore' } }).select("nombre").sort({ score: { $meta: 'textScore' } }).limit(sizePaginaTrabajos).exec();
                }
                catch (error) {
                    console.log(`Error buscando trabajos. E: ${error}`);
                    return new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                console.log(`Enviando ${losTrabajos.length} trabajos encontrados`);
                return losTrabajos;
            });
        },
        trabajosDeProyectoDeUsuario: function (_, { idUsuario }, contexto) {
            return __awaiter(this, void 0, void 0, function* () {
                console.log('Peticion de trabajos de usuario con id ' + idUsuario);
                try {
                    var losTrabajos = yield Trabajo_1.ModeloTrabajo.find({ "responsables": idUsuario }).exec();
                }
                catch (error) {
                    console.log(`Error buscando trabajos de usuario. E: ${error}`);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                console.log(`Enviando ${losTrabajos.length} trabajos`);
                return losTrabajos;
            });
        },
        trabajosSegunCentro: function (_, { centro, radio }, __) {
            return __awaiter(this, void 0, void 0, function* () {
                try {
                    var losTrabajos = yield Trabajo_1.ModeloTrabajo.find({}).exec();
                }
                catch (error) {
                    console.log(`Error buscando trabajos. E: ${error}`);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                return losTrabajos;
            });
        }
    },
    Mutation: {
        crearTrabajoEnProyecto(_, { idProyecto, posicion }, contexto) {
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
                console.log(`Creando un foro para este trabajo`);
                try {
                    var nuevoForo = yield Foro_1.ModeloForo.create({
                        acceso: "privado",
                        miembros: [],
                    });
                    var idNuevoForo = nuevoForo._id;
                    yield nuevoForo.save();
                }
                catch (error) {
                    console.log(`Error creando el nuevo foro. E: ${error}`);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                console.log(`Nuevo foro creado`);
                try {
                    var nuevoTrabajo = yield new Trabajo_1.ModeloTrabajo({ idProyectoParent: idProyecto, idForo: idNuevoForo, diagramaProyecto: { posicion } });
                    var idNuevoTrabajo = nuevoTrabajo._id;
                    yield nuevoTrabajo.save();
                }
                catch (error) {
                    console.log(`Error creando el nuevo trabajo. E: ${error}`);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                try {
                    elProyecto.idsTrabajos.push(idNuevoTrabajo);
                    yield elProyecto.save();
                }
                catch (error) {
                    console.log("Error guardando el trabajo creado en el proyecto. E: " + error);
                    throw new apollo_server_express_1.ApolloError("Error introduciendo el trabajo en el proyecto");
                }
                return idNuevoTrabajo;
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
                let permisosEspeciales = ["superadministrador"];
                if (!elProyecto.responsables.includes(credencialesUsuario.id) && !credencialesUsuario.permisos.some(p => permisosEspeciales.includes(p))) {
                    console.log(`Error de autenticacion editando nombre de proyecto`);
                    throw new apollo_server_express_1.AuthenticationError("No autorizado");
                }
                try {
                    yield Trabajo_1.ModeloTrabajo.findByIdAndDelete(idTrabajo);
                    yield Proyecto_1.ModeloProyecto.findByIdAndUpdate(idProyecto, { $pull: { idsTrabajos: idTrabajo } });
                }
                catch (error) {
                    console.log("Error eliminando trabajo. E: " + error);
                    throw new apollo_server_express_1.ApolloError("Error introduciendo el trabajo en el proyecto");
                }
                console.log(`eliminado`);
                return true;
            });
        },
        editarNombreTrabajoProyecto(_, { idProyecto, idTrabajo, nuevoNombre }, contexto) {
            return __awaiter(this, void 0, void 0, function* () {
                console.log(`cambiando el nombre del trabajo con id ${idTrabajo} del proyecto con id ${idProyecto}`);
                const charProhibidosNombreTrabajo = /[^ a-zA-ZÀ-ž0-9_():.,-]/;
                nuevoNombre = nuevoNombre.replace(/\s\s+/g, " ");
                if (charProhibidosNombreTrabajo.test(nuevoNombre)) {
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
                    var elTrabajo = yield Trabajo_1.ModeloTrabajo.findById(idTrabajo).exec();
                    if (!elTrabajo) {
                        throw "No existía el trabajo";
                    }
                    elTrabajo.nombre = nuevoNombre;
                    yield elTrabajo.save();
                }
                catch (error) {
                    console.log("Error cambiando el nombre en la base de datos. E: " + error);
                    throw new apollo_server_express_1.ApolloError("Error guardando el nombre en la base de datos");
                }
                console.log(`Nombre cambiado`);
                return elTrabajo;
            });
        },
        editarDescripcionTrabajoProyecto(_, { idProyecto, idTrabajo, nuevoDescripcion }, contexto) {
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
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                //Authorización
                let permisosEspeciales = ["superadministrador"];
                if (!elProyecto.responsables.includes(credencialesUsuario.id) && !credencialesUsuario.permisos.some(p => permisosEspeciales.includes(p))) {
                    console.log(`Error de autenticacion editando Descripcion de proyecto`);
                    throw new apollo_server_express_1.AuthenticationError("No autorizado");
                }
                const charProhibidosDescripcionTrabajo = /[^\n\r a-zA-ZÀ-ž0-9_():;.,+¡!¿?@=-]/;
                if (charProhibidosDescripcionTrabajo.test(nuevoDescripcion)) {
                    throw new apollo_server_express_1.ApolloError("Descripcion ilegal");
                }
                nuevoDescripcion = nuevoDescripcion.trim();
                try {
                    var elTrabajo = yield Trabajo_1.ModeloTrabajo.findById(idTrabajo).exec();
                    if (!elTrabajo) {
                        throw "Trabajo no existía";
                    }
                    elTrabajo.descripcion = nuevoDescripcion;
                    console.log(`guardando nuevo descripcion ${nuevoDescripcion} en la base de datos`);
                    yield elTrabajo.save();
                }
                catch (error) {
                    console.log(`error guardando el trabajo modificado: ${error}`);
                    throw new apollo_server_express_1.ApolloError("Error guardando información en la base de datos");
                }
                console.log(`Descripcion guardado`);
                return elTrabajo;
            });
        },
        editarKeywordsTrabajoProyecto(_, { idProyecto, idTrabajo, nuevoKeywords }, contexto) {
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
                let permisosEspeciales = ["superadministrador"];
                if (!elProyecto.responsables.includes(credencialesUsuario.id) && !credencialesUsuario.permisos.some(p => permisosEspeciales.includes(p))) {
                    console.log(`Error de autenticacion editando Keywords de proyecto`);
                    throw new apollo_server_express_1.AuthenticationError("No autorizado");
                }
                const charProhibidosKeywordsTrabajo = /[^ a-zA-Zñ,]/;
                if (charProhibidosKeywordsTrabajo.test(nuevoKeywords)) {
                    throw new apollo_server_express_1.ApolloError("Keywords ilegal");
                }
                nuevoKeywords = nuevoKeywords.trim();
                try {
                    var elTrabajo = yield Trabajo_1.ModeloTrabajo.findById(idTrabajo).exec();
                    if (!elTrabajo) {
                        throw "Trabajo no existía";
                    }
                    elTrabajo.keywords = nuevoKeywords;
                    console.log(`guardando nuevo keywords ${nuevoKeywords} en la base de datos`);
                    yield elTrabajo.save();
                }
                catch (error) {
                    console.log(`error guardando el trabajo modificado: ${error}`);
                }
                console.log(`Keywords guardado`);
                return elTrabajo;
            });
        },
        addResponsableTrabajo: function (_, { idTrabajo, idUsuario }, contexto) {
            return __awaiter(this, void 0, void 0, function* () {
                console.log(`Solicitud de add un usuario con id ${idUsuario} a un trabajo de id ${idTrabajo}`);
                let credencialesUsuario = contexto.usuario;
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
                try {
                    var elTrabajo = yield Trabajo_1.ModeloTrabajo.findById(idTrabajo).exec();
                    if (!elTrabajo)
                        throw "Trabajo no existía";
                }
                catch (error) {
                    console.log('Error buscando el trabajo . E: ' + error);
                    throw new apollo_server_express_1.ApolloError('Error conectando con la base de datos');
                }
                if (elTrabajo.responsables.includes(idUsuario)) {
                    console.log(`El usuario ya era responsable de este trabajo`);
                    throw new apollo_server_express_1.ApolloError("El usuario ya estaba incluido");
                }
                try {
                    const indexT = elUsuario.misTrabajos.indexOf(elTrabajo._id);
                    if (indexT > -1)
                        elUsuario.misTrabajos.splice(indexT, 1);
                    elTrabajo.responsables.push(idUsuario);
                    elUsuario.misTrabajos.push(elTrabajo._id);
                    console.log(`Usuario añadido a la lista de responsables`);
                    yield elTrabajo.save();
                }
                catch (error) {
                    console.log("Error guardando datos en la base de datos. E: " + error);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                console.log(`Trabajo guardado`);
                try {
                    yield Foro_1.ModeloForo.findByIdAndUpdate(elTrabajo.idForo, { miembros: elTrabajo.responsables });
                }
                catch (error) {
                    console.log(`Error mirroring responsables del proyecto hacia miembros del foro. E: ${error}`);
                }
                return elTrabajo;
            });
        },
        removeResponsableTrabajo: function (_, { idTrabajo, idUsuario }, contexto) {
            return __awaiter(this, void 0, void 0, function* () {
                console.log(`Solicitud de remove un usuario con id ${idUsuario} de un trabajo de id ${idTrabajo}`);
                let credencialesUsuario = contexto.usuario;
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
                try {
                    var elTrabajo = yield Trabajo_1.ModeloTrabajo.findById(idTrabajo).exec();
                    if (!elTrabajo)
                        throw "Trabajo no existía";
                }
                catch (error) {
                    console.log('Error buscando el trabajo . E: ' + error);
                    throw new apollo_server_express_1.ApolloError('Error conectando con la base de datos');
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
                    const indexT = elUsuario.misTrabajos.indexOf(elTrabajo._id);
                    if (indexT > -1)
                        elUsuario.misTrabajos.splice(indexT, 1);
                    yield elTrabajo.save();
                    yield elUsuario.save();
                }
                catch (error) {
                    console.log("Error guardando datos en la base de datos. E: " + error);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                console.log(`Trabajo guardado`);
                try {
                    yield Foro_1.ModeloForo.findByIdAndUpdate(elTrabajo.idForo, { miembros: elTrabajo.responsables });
                }
                catch (error) {
                    console.log(`Error mirroring responsables del proyecto hacia miembros del foro. E: ${error}`);
                }
                return elTrabajo;
            });
        },
        setPosicionTrabajoDiagramaProyecto: function (_, { idTrabajo, nuevaPosicion }, contexto) {
            return __awaiter(this, void 0, void 0, function* () {
                console.log(`Guardando posicion de trabajo en el diagrama del proyecto`);
                let credencialesUsuario = contexto.usuario;
                try {
                    var elTrabajo = yield Trabajo_1.ModeloTrabajo.findById(idTrabajo).exec();
                    if (!elTrabajo) {
                        throw "Trabajo no existía";
                    }
                }
                catch (error) {
                    console.log(`error buscando el trabajo: ${error}`);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                const idProyecto = elTrabajo.idProyectoParent;
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
                let permisosEspeciales = ["superadministrador"];
                if (!elProyecto.responsables.includes(credencialesUsuario.id) && !credencialesUsuario.permisos.some(p => permisosEspeciales.includes(p))) {
                    console.log(`Error de autenticacion editando Descripcion de proyecto`);
                    throw new apollo_server_express_1.AuthenticationError("No autorizado");
                }
                try {
                    elTrabajo.coords = nuevaPosicion;
                    yield elTrabajo.save();
                }
                catch (error) {
                    console.log(`error guardando el trabajo modificado: ${error}`);
                }
                return elTrabajo;
            });
        },
        setEstadoTrabajoProyecto(_, { idProyecto, idTrabajo, nuevoEstado }, contexto) {
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
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                //Authorización
                let permisosEspeciales = ["superadministrador"];
                if (!elProyecto.responsables.includes(credencialesUsuario.id) && !credencialesUsuario.permisos.some(p => permisosEspeciales.includes(p))) {
                    console.log(`Error de autenticacion editando Estado de proyecto`);
                    throw new apollo_server_express_1.AuthenticationError("No autorizado");
                }
                try {
                    var elTrabajo = yield Trabajo_1.ModeloTrabajo.findById(idTrabajo).exec();
                    if (!elTrabajo) {
                        throw "Trabajo no existía";
                    }
                    elTrabajo.estadoDesarrollo = nuevoEstado;
                    console.log(`guardando nuevo estado ${nuevoEstado} en la base de datos`);
                    yield elTrabajo.save();
                }
                catch (error) {
                    console.log(`error guardando el trabajo modificado: ${error}`);
                    throw new apollo_server_express_1.ApolloError("Error guardando información en la base de datos");
                }
                console.log(`Estado guardado`);
                return elTrabajo;
            });
        },
        crearMaterialEnTrabajoDeProyecto(_, { idProyecto, idTrabajo }, contexto) {
            return __awaiter(this, void 0, void 0, function* () {
                console.log(`Peticion de crear un nuevo material en el trabajo con id ${idTrabajo}`);
                //Authorización
                let credencialesUsuario = contexto.usuario;
                if (!credencialesUsuario.id) {
                    console.log(`Usuario no autenticado`);
                    throw new apollo_server_express_1.AuthenticationError("No autorizado");
                }
                try {
                    var elTrabajo = yield Trabajo_1.ModeloTrabajo.findById(idTrabajo).exec();
                    if (!elTrabajo)
                        throw "Trabajo no encontrado";
                }
                catch (error) {
                    console.log(`Error buscando el trabajo. E: ${error}`);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                try {
                    var nuevoMaterial = elTrabajo.materiales.create();
                    elTrabajo.materiales.push(nuevoMaterial);
                    yield elTrabajo.save();
                }
                catch (error) {
                    console.log("Error guardando el material creado en el trabajo. E: " + error);
                    throw new apollo_server_express_1.ApolloError("Error introduciendo el material en el trabajo");
                }
                console.log(`Enviando nuevo material: ${nuevoMaterial}`);
                return nuevoMaterial;
            });
        },
        editarNombreMaterialTrabajo(_, { idTrabajo, idMaterial, nuevoNombre }, contexto) {
            return __awaiter(this, void 0, void 0, function* () {
                console.log(`cambiando el nombre del material con id ${idMaterial} del trabajo con id ${idTrabajo}`);
                const charProhibidosNombreMaterial = /[^ a-zA-ZÀ-ž0-9_():.,-]/;
                nuevoNombre = nuevoNombre.replace(/\s\s+/g, " ");
                if (charProhibidosNombreMaterial.test(nuevoNombre)) {
                    throw new apollo_server_express_1.ApolloError("Nombre ilegal");
                }
                nuevoNombre = nuevoNombre.trim();
                try {
                    var elTrabajo = yield Trabajo_1.ModeloTrabajo.findById(idTrabajo).exec();
                    if (!elTrabajo) {
                        throw "trabajo no encontrado";
                    }
                }
                catch (error) {
                    console.log("Error buscando el trabajo. E: " + error);
                    throw new apollo_server_express_1.ApolloError("Erro en la conexión con la base de datos");
                }
                //Authorización
                let credencialesUsuario = contexto.usuario;
                if (!elTrabajo.responsables.includes(credencialesUsuario.id) && !credencialesUsuario.permisos.includes("superadministrador")) {
                    console.log(`Error de autenticacion editando nombre de trabajo`);
                    throw new apollo_server_express_1.AuthenticationError("No autorizado");
                }
                try {
                    var elMaterial = elTrabajo.materiales.id(idMaterial);
                    if (!elMaterial) {
                        console.log(`Material no encontrado en el trabajo`);
                        throw "No existía el material";
                    }
                    elMaterial.nombre = nuevoNombre;
                }
                catch (error) {
                    console.log("Error cambiando el nombre en la base de datos. E: " + error);
                    throw new apollo_server_express_1.ApolloError("Error guardando el nombre en la base de datos");
                }
                try {
                    yield elTrabajo.save();
                }
                catch (error) {
                    console.log("Error guardando el material creado en el trabajo. E: " + error);
                    throw new apollo_server_express_1.ApolloError("Error introduciendo el material en el trabajo");
                }
                console.log(`Nombre cambiado`);
                return elMaterial;
            });
        },
        editarDescripcionMaterialTrabajo(_, { idTrabajo, idMaterial, nuevoDescripcion }, contexto) {
            return __awaiter(this, void 0, void 0, function* () {
                console.log(`|||||||||||||||||||`);
                console.log(`Solicitud de set descripcion de material con id ${idMaterial} del trabajo con id ${idTrabajo}`);
                let credencialesUsuario = contexto.usuario;
                try {
                    var elTrabajo = yield Trabajo_1.ModeloTrabajo.findById(idTrabajo).exec();
                    if (!elTrabajo) {
                        throw "trabajo no encontrado";
                    }
                }
                catch (error) {
                    console.log(`error buscando el trabajo. E: ` + error);
                }
                //Authorización
                let permisosEspeciales = ["superadministrador"];
                if (!elTrabajo.responsables.includes(credencialesUsuario.id) && !credencialesUsuario.permisos.some(p => permisosEspeciales.includes(p))) {
                    console.log(`Error de autenticacion editando Descripcion de trabajo`);
                    throw new apollo_server_express_1.AuthenticationError("No autorizado");
                }
                const charProhibidosDescripcionMaterial = /[^\n\r a-zA-ZÀ-ž0-9_():;.,+¡!¿?@=-]/;
                if (charProhibidosDescripcionMaterial.test(nuevoDescripcion)) {
                    throw new apollo_server_express_1.ApolloError("Descripcion ilegal");
                }
                nuevoDescripcion = nuevoDescripcion.trim();
                let elMaterial = elTrabajo.materiales.id(idMaterial);
                if (!elMaterial) {
                    console.log(`No existía el material`);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                elMaterial.descripcion = nuevoDescripcion;
                try {
                    console.log(`guardando nuevo descripcion ${nuevoDescripcion} en la base de datos`);
                    yield elTrabajo.save();
                }
                catch (error) {
                    console.log(`error guardando el trabajo con coordenadas manuales: ${error}`);
                    throw new apollo_server_express_1.ApolloError("Error guardando información en la base de datos");
                }
                console.log(`Descripcion guardado`);
                return elMaterial;
            });
        },
        editarCantidadesMaterialTrabajo(_, { idTrabajo, idMaterial, nuevoCantidadNecesaria, nuevoCantidadDisponible }, contexto) {
            return __awaiter(this, void 0, void 0, function* () {
                console.log(`|||||||||||||||||||`);
                console.log(`Solicitud de set cantidades de material con id ${idMaterial} del trabajo con id ${idTrabajo}`);
                let credencialesUsuario = contexto.usuario;
                try {
                    var elTrabajo = yield Trabajo_1.ModeloTrabajo.findById(idTrabajo).exec();
                    if (!elTrabajo) {
                        throw "trabajo no encontrado";
                    }
                }
                catch (error) {
                    console.log(`error buscando el trabajo. E: ` + error);
                }
                //Authorización
                let permisosEspeciales = ["superadministrador"];
                if (!elTrabajo.responsables.includes(credencialesUsuario.id) && !credencialesUsuario.permisos.some(p => permisosEspeciales.includes(p))) {
                    console.log(`Error de autenticacion editando Descripcion de trabajo`);
                    throw new apollo_server_express_1.AuthenticationError("No autorizado");
                }
                //Validacion
                nuevoCantidadNecesaria = parseInt(nuevoCantidadNecesaria);
                nuevoCantidadDisponible = parseInt(nuevoCantidadDisponible);
                if (nuevoCantidadDisponible < 0 || nuevoCantidadNecesaria < 0) {
                    throw new apollo_server_express_1.UserInputError("Datos no válidos");
                }
                let elMaterial = elTrabajo.materiales.id(idMaterial);
                if (!elMaterial) {
                    console.log(`No existía el material`);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                elMaterial.cantidadNecesaria = nuevoCantidadNecesaria;
                elMaterial.cantidadDisponible = nuevoCantidadDisponible;
                try {
                    yield elTrabajo.save();
                }
                catch (error) {
                    console.log(`error guardando el trabajo con coordenadas manuales: ${error}`);
                    throw new apollo_server_express_1.ApolloError("Error guardando información en la base de datos");
                }
                console.log(`Cantidades guardado`);
                return elMaterial;
            });
        },
        eliminarMaterialDeTrabajo(_, { idMaterial, idTrabajo }, contexto) {
            return __awaiter(this, void 0, void 0, function* () {
                console.log(`peticion de eliminar un material con id ${idMaterial} de un trabajo con id ${idTrabajo}`);
                let credencialesUsuario = contexto.usuario;
                try {
                    var elTrabajo = yield Trabajo_1.ModeloTrabajo.findById(idTrabajo).exec();
                    if (!elTrabajo) {
                        throw "trabajo no encontrado";
                    }
                }
                catch (error) {
                    console.log("Error buscando el trabajo en la base de datos. E: " + error);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                //Authorización
                let permisosEspeciales = ["superadministrador"];
                if (!elTrabajo.responsables.includes(credencialesUsuario.id) && !credencialesUsuario.permisos.some(p => permisosEspeciales.includes(p))) {
                    console.log(`Error de autenticacion editando nombre de trabajo`);
                    throw new apollo_server_express_1.AuthenticationError("No autorizado");
                }
                try {
                    yield Trabajo_1.ModeloTrabajo.findByIdAndUpdate(idTrabajo, { $pull: { materiales: { "_id": idMaterial } } });
                }
                catch (error) {
                    console.log("Error eliminando el material. E: " + error);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                console.log(`eliminado`);
                return true;
            });
        },
    }
};
