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
exports.resolvers = exports.NODOS_ATLAS_CONOCIMIENTO_POSICIONADOS = exports.typeDefs = exports.idAtlasConocimiento = void 0;
const apollo_server_express_1 = require("apollo-server-express");
const Nodo_1 = require("../model/atlas/Nodo");
const Usuario_1 = require("../model/Usuario");
const Foro_1 = require("../model/Foros/Foro");
const CarpetaArchivos_1 = require("../model/CarpetaArchivos");
const Evento_1 = require("../model/Evento");
const controlAtlasConocimiento_1 = require("../controlAtlasConocimiento");
const config_1 = require("../model/config");
exports.idAtlasConocimiento = "61ea0b0f17a5d80da7e94320";
exports.typeDefs = apollo_server_express_1.gql `
type Vinculo{
    id:ID!,
    tipo: String!,
    idRef: ID!,
    rol: String!
}



type InfoArchivoContenidoNodo{
    
    nombre:String,
    primario:Boolean,
    mimetype:String,
}

type SeccionContenidoNodo{
    id:ID,
    nombre:String,
    archivos:[InfoArchivoContenidoNodo],
    tipoPrimario:String,
    modo:String,
    enlace:String
}

type ClaseNodoConocimiento{
    id: ID,
    nombre:String,
    idExperto: ID,
    interesados: [String],
    descripcion:String,
}

type NodoConocimiento{
    id: ID!
    nombre: String,
    clases: [ClaseNodoConocimiento],
    coordX: Int,
    coordY: Int,
    vinculos: [Vinculo],
    coordsManuales: Coords,
    coords:Coords,
    autoCoords:Coords,
    centroMasa:Coords,
    stuck:Boolean,
    puntaje:Int,
    resumen:String,
    descripcion:String,
    keywords:String,
    idForoPublico:ID,
    idForoExpertos:ID,
    expertos: [String],
    posiblesExpertos:[String],
    secciones:[SeccionContenidoNodo],
    angulo:Float
    fuerzaCentroMasa:FuerzaPolar,
    fuerzaColision:FuerzaPolar
}

input NodoConocimientoInput{
    id: ID,
    nombre: String,
    coordsManuales:CoordsInput,
    coords:CoordsInput,
    autoCoords:CoordsInput,
    vinculos:[vinculoInput]
}

type Error{
    tipo: String,
    mensaje: String
}

type infoNodosModificados{
    modificados: [NodoConocimiento]
}

extend type Query{
    todosNodos: [NodoConocimiento],
    ping: String,
    nodo(idNodo: ID!): NodoConocimiento,
    busquedaAmplia(palabrasBuscadas:String!):[NodoConocimiento]


},

extend type Mutation{
    posicionarNodosConocimientoByFuerzas(ciclos:Int!):Boolean,

    setCoordsManuales(idNodo: String, coordsManuales:CoordsInput):infoNodosModificados,
    crearVinculo(tipo:String!, idSource:ID!, idTarget:ID!):infoNodosModificados,
    eliminarVinculoFromTo(idSource:ID!, idTarget:ID!):infoNodosModificados,
    editarNombreNodo(idNodo: ID!, nuevoNombre: String!):infoNodosModificados,
    crearNodo(infoNodo:NodoConocimientoInput):NodoConocimiento
    eliminarNodo(idNodo:ID!):ID,
    editarDescripcionNodoConocimiento(idNodo:ID!, nuevoDescripcion:String!):NodoConocimiento,
    editarKeywordsNodoConocimiento(idNodo:ID!, nuevoKeywords:String!):NodoConocimiento,

    addExpertoNodo(idNodo:ID!, idUsuario:ID!):NodoConocimiento,
    addPosibleExpertoNodo(idNodo:ID!, idUsuario:ID!):NodoConocimiento,
    removeExpertoNodo(idNodo:ID!, idUsuario:ID!):NodoConocimiento,

    eliminarArchivoSeccionNodo(idNodo:ID!, idSeccion:ID!, nombreArchivo:String!):Boolean
    marcarPrimarioArchivoSeccionNodo(idNodo:ID!, idSeccion:ID!, nombreArchivo:String!):Boolean,

    crearNuevaSeccionNodoConocimiento(idNodo:ID!):SeccionContenidoNodo,
    eliminarSeccionNodoConocimiento(idNodo:ID!, idSeccion:ID!):Boolean,
    moverSeccionNodoConocimiento(idNodo:ID!, idSeccion: ID!, movimiento: Int!):Boolean,
    editarNombreSeccionNodoConocimiento(idNodo:ID!, idSeccion: ID!, nuevoNombre: String!):SeccionContenidoNodo,
    setNuevoEnlaceSeccionNodo(idNodo: ID!, idSeccion:ID!, nuevoEnlace:String!):SeccionContenidoNodo,

    crearClaseNodoConocimiento(idNodo:ID!, idExperto: ID!):ClaseNodoConocimiento,
    eliminarClaseNodoConocimiento(idNodo:ID!, idClase: ID!):Boolean,
    addUsuarioInteresadosClaseNodoConocimiento(idNodo:ID!, idClase: ID!, idUsuario: ID!):ClaseNodoConocimiento,
    eliminarUsuarioInteresadosClaseNodoConocimiento(idNodo:ID!, idClase: ID!, idUsuario: ID!):ClaseNodoConocimiento,

}
`;
exports.NODOS_ATLAS_CONOCIMIENTO_POSICIONADOS = "nodos_de_atlas_conocimiento_posicionados";
exports.resolvers = {
    Query: {
        busquedaAmplia: function (_, { palabrasBuscadas }, __) {
            return __awaiter(this, void 0, void 0, function* () {
                console.log(`buscando nodos de conocimientos que contengan: ${palabrasBuscadas}`);
                // console.log(`tipo de input: ${typeof (palabrasBuscadas)}`);
                if (palabrasBuscadas.length < 1) {
                    console.log(`No habia palabras buscadas`);
                }
                try {
                    var opciones = yield Nodo_1.ModeloNodo.find({ $text: { $search: palabrasBuscadas } }, { score: { $meta: 'textScore' } }).collation({ locale: "en", strength: 1 }).select("nombre descripcion autoCoords").sort({ score: { $meta: 'textScore' } }).limit(10).exec();
                }
                catch (error) {
                    console.log(". E: " + error);
                    throw new apollo_server_express_1.ApolloError("");
                }
                console.log(`${opciones.length} opciones: ${opciones}`);
                return opciones;
            });
        },
        todosNodos: function () {
            return __awaiter(this, void 0, void 0, function* () {
                console.log(`enviando todos los nombres, vinculos y coordenadas`);
                try {
                    var todosNodos = yield Nodo_1.ModeloNodo.find({}, "nombre descripcion expertos vinculos secciones coordsManuales autoCoords coords centroMasa stuck angulo puntaje coordx coordy ubicado clases fuerzaCentroMasa fuerzaColision").exec();
                    console.log(`encontrados ${todosNodos.length} nodos`);
                }
                catch (error) {
                    console.log(`error fetching todos los nodos. e: ` + error);
                    return;
                }
                // console.log(`Primero enviado: ${JSON.stringify(todosNodos[0])}`);
                // console.log(`Enviando: ${todosNodos}`);
                return todosNodos;
            });
        },
        nodo: function (_, { idNodo }) {
            return __awaiter(this, void 0, void 0, function* () {
                console.log(`Buscando el nodo con id ${idNodo}`);
                try {
                    var elNodo = yield Nodo_1.ModeloNodo.findById(idNodo, "nombre vinculos autoCoords coordsManuales descripcion idForoExpertos idForoPublico expertos posiblesExpertos secciones clases").exec();
                    if (!elNodo)
                        throw "Nodo no encontrado";
                }
                catch (error) {
                    console.log(`error buscando el nodo. e: ` + error);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                let tieneForoPublico = true;
                if (!elNodo.idForoPublico) {
                    tieneForoPublico = false;
                }
                else {
                    try {
                        let elForoPublico = yield Foro_1.ModeloForo.findById(elNodo.idForoPublico).exec();
                        if (!elForoPublico) {
                            console.log(`El foro no existía. Se creará uno nuevo`);
                            tieneForoPublico = false;
                        }
                    }
                    catch (error) {
                        console.log(`Error buscando foro público en la base de datos. E :${error}`);
                    }
                }
                if (!tieneForoPublico) {
                    console.log(`El nodo ${elNodo.nombre} no tenía foro publico. Creando.`);
                    try {
                        var nuevoForoPublico = yield Foro_1.ModeloForo.create({
                            miembros: elNodo.expertos,
                            acceso: "publico"
                        });
                        var idNuevoForoPublico = nuevoForoPublico._id;
                        yield nuevoForoPublico.save();
                        elNodo.idForoPublico = idNuevoForoPublico;
                    }
                    catch (error) {
                        console.log(`Error creando el nuevo foro. E: ${error}`);
                        throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                    }
                    console.log(`Nuevo foro creado`);
                }
                let tieneForoExpertos = true;
                if (!elNodo.idForoExpertos) {
                    tieneForoExpertos = false;
                }
                else {
                    try {
                        let elForoExpertos = yield Foro_1.ModeloForo.findById(elNodo.idForoExpertos).exec();
                        if (!elForoExpertos) {
                            console.log(`El foro no existía. Se creará uno nuevo`);
                            tieneForoExpertos = false;
                        }
                    }
                    catch (error) {
                        console.log(`Error buscando foro público en la base de datos. E :${error}`);
                    }
                }
                if (!tieneForoExpertos) {
                    console.log(`El nodo ${elNodo.nombre} no tenía foro expertos. Creando.`);
                    try {
                        var nuevoForoExpertos = yield Foro_1.ModeloForo.create({
                            miembros: elNodo.expertos,
                            acceso: "privado"
                        });
                        var idNuevoForoExpertos = nuevoForoExpertos._id;
                        yield nuevoForoExpertos.save();
                        elNodo.idForoExpertos = idNuevoForoExpertos;
                    }
                    catch (error) {
                        console.log(`Error creando el nuevo foro. E: ${error}`);
                        throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                    }
                    console.log(`Nuevo foro creado`);
                }
                if (!tieneForoExpertos || !tieneForoPublico) {
                    try {
                        yield elNodo.save();
                    }
                    catch (error) {
                        console.log(`Error guardando el nodo`);
                        throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                    }
                }
                return elNodo;
            });
        }
    },
    Mutation: {
        posicionarNodosConocimientoByFuerzas(_, { ciclos }, contexto) {
            return __awaiter(this, void 0, void 0, function* () {
                console.log(`Peticion de ejecutar un posicionamiento de nodos de conocimiento by fuerzas de ${ciclos} ciclos`);
                controlAtlasConocimiento_1.ejecutarPosicionamientoNodosConocimientoByFuerzas(ciclos, Date.now(), true);
                console.log(`Terminado`);
                return true;
            });
        },
        eliminarNodo(_, { idNodo }, contexto) {
            return __awaiter(this, void 0, void 0, function* () {
                console.log(`peticion de eliminar nodo con id ${idNodo}`);
                let credencialesUsuario = contexto.usuario;
                let permisosValidos = ["atlasAdministrador", "administrador", "superadministrador"];
                if (!credencialesUsuario.permisos.some(p => permisosValidos.includes(p))) {
                    console.log(`El usuario no tenia permisos para efectuar esta operación`);
                    throw new apollo_server_express_1.AuthenticationError("No autorizado");
                }
                try {
                    var elNodo = yield Nodo_1.ModeloNodo.findById(idNodo);
                    if (!elNodo)
                        throw "Nodo a eliminar no encontrado";
                }
                catch (error) {
                    throw new apollo_server_express_1.ApolloError("Error buscando el nodo a eliminar");
                }
                try {
                    yield Nodo_1.ModeloNodo.deleteOne({ _id: idNodo }).exec();
                }
                catch (error) {
                    console.log(`error eliminando nodo`);
                }
                console.log(`nodo ${idNodo} eliminado`);
                //Eliminar foros del nodo
                try {
                    yield Foro_1.ModeloForo.findByIdAndDelete(elNodo.idForoPublico).exec();
                    yield Foro_1.ModeloForo.findByIdAndDelete(elNodo.idForoExpertos).exec();
                }
                catch (error) {
                    console.log(`Error buscando los foros para ser eliminados`);
                }
                return idNodo;
            });
        },
        crearNodo(_, { infoNodo }, contexto) {
            return __awaiter(this, void 0, void 0, function* () {
                let credencialesUsuario = contexto.usuario;
                let permisosEspeciales = ["atlasAdministrador", "administrador", "superadministrador"];
                ;
                if (!credencialesUsuario.permisos.some(p => permisosEspeciales.includes(p))) {
                    console.log(`Error de autenticacion`);
                    throw new apollo_server_express_1.AuthenticationError("No autorizado");
                }
                console.log(`Creando nuevo nodo de conocimiento`);
                try {
                    var nuevoForoPublico = yield Foro_1.ModeloForo.create({
                        acceso: "publico",
                        miembros: [],
                    });
                    var idForoPublico = nuevoForoPublico._id;
                    yield nuevoForoPublico.save();
                }
                catch (error) {
                    console.log(`Error creando el nuevo foro publico. E: ${error}`);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                console.log(`Nuevo foro publico creado`);
                try {
                    var nuevoForoExpertos = yield Foro_1.ModeloForo.create({
                        acceso: "privado",
                        miembros: [],
                    });
                    var idForoExpertos = nuevoForoExpertos._id;
                    yield nuevoForoExpertos.save();
                }
                catch (error) {
                    console.log(`Error creando el nuevo foro expertos. E: ${error}`);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                console.log(`Nuevo foro expertos creado`);
                try {
                    var nuevoNodo = new Nodo_1.ModeloNodo(Object.assign(Object.assign({}, infoNodo), { idForoPublico,
                        idForoExpertos }));
                    yield nuevoNodo.save();
                }
                catch (error) {
                    console.log(`error guardando el nuevo nodo en la base de datos. E: ${error}`);
                    throw new apollo_server_express_1.ApolloError("Error guardando en base de datos");
                }
                console.log(`nuevo nodo de conocimiento creado: ${nuevoNodo} `);
                return nuevoNodo;
            });
        },
        setCoordsManuales: function (_, { idNodo, coordsManuales }, contexto) {
            return __awaiter(this, void 0, void 0, function* () {
                console.log(`peticion de movimiento de coords manuales`);
                let credencialesUsuario = contexto.usuario;
                let permisosValidos = ["atlasAdministrador", "administrador", "superadministrador"];
                if (!credencialesUsuario.permisos.some(p => permisosValidos.includes(p))) {
                    console.log(`El usuario no tenia permisos para efectuar esta operación`);
                    throw new apollo_server_express_1.AuthenticationError("No autorizado");
                }
                let modificados = new Array();
                try {
                    var elNodo = yield Nodo_1.ModeloNodo.findById(idNodo, "nombre coordsManuales").exec();
                }
                catch (error) {
                    console.log(`error buscando el nodo. E: ` + error);
                }
                elNodo.coords = coordsManuales;
                try {
                    console.log(`guardando coords de ${elNodo.nombre} en la base de datos`);
                    yield elNodo.save();
                }
                catch (error) {
                    console.log(`error guardando el nodo con coordenadas manuales: ${error}`);
                }
                modificados.push(elNodo);
                return { modificados };
            });
        },
        crearVinculo: function (_, args, contexto) {
            return __awaiter(this, void 0, void 0, function* () {
                let modificados = [];
                console.log(`recibida una peticion de vincular nodos con args: ${JSON.stringify(args)}`);
                let credencialesUsuario = contexto.usuario;
                let permisosValidos = ["atlasAdministrador", "administrador", "superadministrador"];
                if (!credencialesUsuario.permisos.some(p => permisosValidos.includes(p))) {
                    console.log(`El usuario no tenia permisos para efectuar esta operación`);
                    throw new apollo_server_express_1.AuthenticationError("No autorizado");
                }
                try {
                    var nodoSource = yield Nodo_1.ModeloNodo.findById(args.idSource, "vinculos").exec();
                    var nodoTarget = yield Nodo_1.ModeloNodo.findById(args.idTarget, "vinculos").exec();
                }
                catch (error) {
                    console.log(`error consiguiendo los nodos para crear el vínculo . e: ` + error);
                }
                //Buscar y eliminar vinculos previos entre estos dos nodos.
                for (var vinculo of nodoSource.vinculos) {
                    if (vinculo.idRef == args.idTarget) {
                        vinculo.remove();
                        console.log(`encontrado un vinculo viejo en el Source. Eliminando`);
                    }
                }
                for (var vinculo of nodoTarget.vinculos) {
                    if (vinculo.idRef == args.idSource) {
                        vinculo.remove();
                        console.log(`encontrado un vinculo viejo en el target. Eliminando`);
                    }
                }
                const vinculoSourceTarget = {
                    idRef: args.idTarget,
                    rol: "source"
                };
                const vinculoTargetSource = {
                    idRef: args.idSource,
                    rol: "target"
                };
                nodoSource.vinculos.push(vinculoSourceTarget);
                nodoTarget.vinculos.push(vinculoTargetSource);
                try {
                    yield nodoSource.save();
                    yield nodoTarget.save();
                }
                catch (error) {
                    console.log(`error guardando los nodos despues de la creacion de vinculos. e: ` + error);
                }
                modificados.push(nodoSource);
                modificados.push(nodoTarget);
                console.log(`vinculo entre ${args.idSource} y ${args.idTarget} creado`);
                return { modificados };
            });
        },
        eliminarVinculoFromTo: function (_, args, contexto) {
            return __awaiter(this, void 0, void 0, function* () {
                let modificados = [];
                console.log(`desvinculando ${args.idSource} de ${args.idTarget}`);
                let credencialesUsuario = contexto.usuario;
                let permisosValidos = ["atlasAdministrador", "administrador", "superadministrador"];
                if (!credencialesUsuario.permisos.some(p => permisosValidos.includes(p))) {
                    console.log(`El usuario no tenia permisos para efectuar esta operación`);
                    throw new apollo_server_express_1.AuthenticationError("No autorizado");
                }
                try {
                    var elUno = yield Nodo_1.ModeloNodo.findById(args.idSource, "nombre vinculos").exec();
                    var elOtro = yield Nodo_1.ModeloNodo.findById(args.idTarget, "nombre vinculos").exec();
                }
                catch (error) {
                    console.log(`error . e: ` + error);
                }
                for (var vinculo of elUno.vinculos) {
                    if (vinculo.idRef == args.idTarget)
                        vinculo.remove();
                }
                for (var vinculo of elOtro.vinculos) {
                    if (vinculo.idRef == args.idSource)
                        vinculo.remove();
                }
                try {
                    yield elUno.save();
                    yield elOtro.save();
                }
                catch (error) {
                    console.log(`error . e: ` + error);
                }
                modificados.push(elUno);
                modificados.push(elOtro);
                return { modificados };
            });
        },
        editarNombreNodo: function (_, { idNodo, nuevoNombre }, contexto) {
            return __awaiter(this, void 0, void 0, function* () {
                let modificados = [];
                try {
                    var elNodo = yield Nodo_1.ModeloNodo.findById(idNodo, "nombre expertos coordsManuales").exec();
                }
                catch (error) {
                    console.log(`error buscando el nodo. E: ` + error);
                }
                let credencialesUsuario = contexto.usuario;
                let permisosEspeciales = ["atlasAdministrador", "administrador", "superadministrador"];
                if (!elNodo.expertos.includes(credencialesUsuario.id) && !credencialesUsuario.permisos.some(p => permisosEspeciales.includes(p))) {
                    console.log(`El usuario no tenia permisos para efectuar esta operación`);
                    throw new apollo_server_express_1.AuthenticationError("No autorizado");
                }
                nuevoNombre = nuevoNombre.trim();
                const charProhibidosNombreNodo = /[^ a-zA-ZÀ-ž0-9_():.,-]/;
                if (charProhibidosNombreNodo.test(nuevoNombre)) {
                    throw new apollo_server_express_1.ApolloError("Nombre ilegal");
                }
                elNodo.nombre = nuevoNombre;
                try {
                    console.log(`guardando nuevo nombre ${elNodo.nombre} en la base de datos`);
                    yield elNodo.save();
                }
                catch (error) {
                    console.log(`error guardando el nodo con coordenadas manuales: ${error}`);
                }
                modificados.push(elNodo);
                return { modificados };
            });
        },
        editarDescripcionNodoConocimiento: function (_, { idNodo, nuevoDescripcion }, contexto) {
            return __awaiter(this, void 0, void 0, function* () {
                console.log(`|||||||||||||||||||`);
                console.log(`Solicitud de set descripcion del nodo con id ${idNodo}`);
                try {
                    var elNodo = yield Nodo_1.ModeloNodo.findById(idNodo).exec();
                    if (!elNodo) {
                        throw "nodo no encontrado";
                    }
                }
                catch (error) {
                    console.log(`error buscando el nodo. E: ` + error);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                let credencialesUsuario = contexto.usuario;
                let permisosEspeciales = ["atlasAdministrador", "administrador", "superadministrador"];
                if (!elNodo.expertos.includes(credencialesUsuario.id) && !credencialesUsuario.permisos.some(p => permisosEspeciales.includes(p))) {
                    console.log(`El usuario no tenia permisos para efectuar esta operación`);
                    throw new apollo_server_express_1.AuthenticationError("No autorizado");
                }
                const charProhibidosDescripcionNodo = /[^\n\r a-zA-ZÀ-ž0-9_():;.,+¡!¿?"@=-]/;
                if (charProhibidosDescripcionNodo.test(nuevoDescripcion)) {
                    throw new apollo_server_express_1.ApolloError("Descripcion ilegal");
                }
                nuevoDescripcion = nuevoDescripcion.trim();
                try {
                    console.log(`guardando nuevo descripcion ${nuevoDescripcion} en la base de datos`);
                    var resNodo = yield Nodo_1.ModeloNodo.findByIdAndUpdate(idNodo, { descripcion: nuevoDescripcion }, { new: true }).exec();
                }
                catch (error) {
                    console.log(`error guardando el nodo: ${error}`);
                }
                console.log(`Descripcion guardado`);
                return resNodo;
            });
        },
        editarKeywordsNodoConocimiento: function (_, { idNodo, nuevoKeywords }, contexto) {
            return __awaiter(this, void 0, void 0, function* () {
                console.log(`|||||||||||||||||||`);
                console.log(`Solicitud de set keywords del nodo con id ${idNodo}`);
                try {
                    var elNodo = yield Nodo_1.ModeloNodo.findById(idNodo).exec();
                    if (!elNodo) {
                        throw "nodo no encontrado";
                    }
                }
                catch (error) {
                    console.log(`error buscando el nodo. E: ` + error);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                let credencialesUsuario = contexto.usuario;
                let permisosEspeciales = ["atlasAdministrador", "administrador", "superadministrador"];
                if (!elNodo.expertos.includes(credencialesUsuario.id) && !credencialesUsuario.permisos.some(p => permisosEspeciales.includes(p))) {
                    console.log(`El usuario no tenia permisos para efectuar esta operación`);
                    throw new apollo_server_express_1.AuthenticationError("No autorizado");
                }
                const charProhibidosKeywordsNodo = /[^ a-zA-Z0-9]/;
                if (charProhibidosKeywordsNodo.test(nuevoKeywords)) {
                    throw new apollo_server_express_1.ApolloError("Keywords ilegal");
                }
                nuevoKeywords = nuevoKeywords.trim();
                try {
                    console.log(`guardando nuevo keywords ${nuevoKeywords} en la base de datos`);
                    var resNodo = yield Nodo_1.ModeloNodo.findByIdAndUpdate(idNodo, { keywords: nuevoKeywords }, { new: true }).exec();
                }
                catch (error) {
                    console.log(`error guardando el nodo: ${error}`);
                }
                console.log(`Keywords guardado`);
                return resNodo;
            });
        },
        addExpertoNodo: function (_, { idNodo, idUsuario }, contexto) {
            return __awaiter(this, void 0, void 0, function* () {
                console.log('\x1b[35m%s\x1b[0m', `Solicitud de add un usuario con id ${idUsuario} como experto a un nodo con id ${idNodo}`);
                if (!contexto.usuario) {
                    throw new apollo_server_express_1.AuthenticationError("Login requerido");
                }
                const credencialesUsuario = contexto.usuario;
                try {
                    var elNodo = yield Nodo_1.ModeloNodo.findById(idNodo).exec();
                    if (!elNodo) {
                        throw "nodo no encontrado";
                    }
                }
                catch (error) {
                    console.log("Error buscando el nodo en la base de datos. E: " + error);
                    throw new apollo_server_express_1.ApolloError("Error de conexión con la base de datos");
                }
                //Authorización
                const permisosEspeciales = ["superadministrador", "atlasAdministrador"];
                const usuarioExperto = elNodo.expertos.includes(credencialesUsuario.id);
                if (idUsuario != credencialesUsuario.id && !usuarioExperto && !permisosEspeciales.some(p => credencialesUsuario.permisos.includes(p)) && !elNodo.expertos.includes(credencialesUsuario.id)) {
                    console.log(`Error de autenticacion.`);
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
                if (elNodo.expertos.includes(idUsuario)) {
                    console.log(`El usuario ya era experto de este nodo`);
                    throw new apollo_server_express_1.ApolloError("El usuario ya estaba incluido");
                }
                let indexPosibleExperto = elNodo.posiblesExpertos.indexOf(idUsuario);
                //Entrar a expertos
                if (elNodo.expertos.length === 0 || (usuarioExperto && indexPosibleExperto > -1)) {
                    elNodo.expertos.push(idUsuario);
                    console.log(`Usuario añadido a la lista de expertos`);
                    if (indexPosibleExperto > -1) {
                        console.log(`sacando al usuario ${idUsuario} de la lista de posibles expertos`);
                        elNodo.posiblesExpertos.splice(indexPosibleExperto, 1);
                    }
                }
                else if (credencialesUsuario.id === idUsuario && indexPosibleExperto === -1) {
                    elNodo.posiblesExpertos.push(idUsuario);
                    console.log(`Usuario añadido a la lista de posibles expertos`);
                }
                else {
                    throw new apollo_server_express_1.UserInputError("El usuario no podía ser added to expertos");
                }
                try {
                    yield elNodo.save();
                }
                catch (error) {
                    console.log("Error guardando datos en la base de datos. E: " + error);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                //Mirror expertos del nodo hacia miembros del foro
                try {
                    yield Foro_1.ModeloForo.findByIdAndUpdate(elNodo.idForoExpertos, { miembros: elNodo.expertos });
                    yield Foro_1.ModeloForo.findByIdAndUpdate(elNodo.idForoPublico, { miembros: elNodo.expertos });
                }
                catch (error) {
                    console.log(`Error mirroring expertos del nodo hacia miembros del foro. E: ${error}`);
                }
                console.log(`Nodo guardado`);
                return elNodo;
            });
        },
        addPosibleExpertoNodo: function (_, { idNodo, idUsuario }, contexto) {
            return __awaiter(this, void 0, void 0, function* () {
                console.log(`añadiendo usuario ${idUsuario} a la lista de posibles expertos del nodo ${idNodo}`);
                let credencialesUsuario = contexto.usuario;
                try {
                    var elNodo = yield Nodo_1.ModeloNodo.findById(idNodo).exec();
                    if (!elNodo) {
                        throw "nodo no encontrado";
                    }
                }
                catch (error) {
                    console.log("Error buscando el nodo en la base de datos. E: " + error);
                    throw new apollo_server_express_1.ApolloError("Error de conexión con la base de datos");
                }
                //Authorización
                if (idUsuario != credencialesUsuario.id && !credencialesUsuario.permisos.includes("superadministrador") && !credencialesUsuario.permisos.includes("atlasAdministrador")) {
                    console.log(`Error de autenticacion añadiendo posible experto del nodo`);
                    throw new apollo_server_express_1.AuthenticationError("No autorizado");
                }
                if (elNodo.posiblesExpertos.includes(idUsuario) || elNodo.expertos.includes(idUsuario)) {
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
                    elNodo.posiblesExpertos.push(idUsuario);
                    yield elNodo.save();
                }
                catch (error) {
                    console.log("Error guardando datos en la base de datos. E: " + error);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                console.log(`Nodo guardado`);
                return elNodo;
            });
        },
        removeExpertoNodo: function (_, { idNodo, idUsuario }, contexto) {
            return __awaiter(this, void 0, void 0, function* () {
                console.log('\x1b[35m%s\x1b[0m', `Solicitud de remover un usuario con id ${idUsuario} de la lista de expertos de un nodo con id ${idNodo}`);
                if (!contexto.usuario || !contexto.usuario.id) {
                    console.log(`Usuario no logeado`);
                    throw new apollo_server_express_1.AuthenticationError("Login requerido");
                }
                const credencialesUsuario = contexto.usuario;
                try {
                    var elNodo = yield Nodo_1.ModeloNodo.findById(idNodo).exec();
                    if (!elNodo) {
                        throw "nodo no encontrado";
                    }
                }
                catch (error) {
                    console.log("Error buscando el nodo en la base de datos. E: " + error);
                    throw new apollo_server_express_1.ApolloError("Error de conexión con la base de datos");
                }
                //Authorización
                if (idUsuario != credencialesUsuario.id && !credencialesUsuario.permisos.includes("superadministrador") && !credencialesUsuario.permisos.includes("atlasAdministrador")) {
                    console.log(`Error de autenticacion removiendo experto o posible experto de nodo`);
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
                let indexPosibleExperto = elNodo.posiblesExpertos.indexOf(idUsuario);
                if (indexPosibleExperto > -1) {
                    console.log(`sacando al usuario ${idUsuario} de la lista de posibles expertos`);
                    elNodo.posiblesExpertos.splice(indexPosibleExperto, 1);
                }
                let indexExperto = elNodo.expertos.indexOf(idUsuario);
                if (indexExperto > -1) {
                    console.log(`sacando al usuario ${idUsuario} de la lista de expertos`);
                    elNodo.expertos.splice(indexExperto, 1);
                }
                try {
                    yield elNodo.save();
                }
                catch (error) {
                    console.log("Error guardando datos en la base de datos. E: " + error);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                //Mirror expertos del nodo hacia miembros del foro
                try {
                    yield Foro_1.ModeloForo.findByIdAndUpdate(elNodo.idForoPublico, { miembros: elNodo.expertos });
                    yield Foro_1.ModeloForo.findByIdAndUpdate(elNodo.idForoExpertos, { miembros: elNodo.expertos });
                }
                catch (error) {
                    console.log(`Error mirroring expertos del nodo hacia miembros del foro. E: ${error}`);
                }
                console.log(`Nodo guardado`);
                return elNodo;
            });
        },
        eliminarArchivoSeccionNodo: function (_, { idNodo, idSeccion, nombreArchivo }, contexto) {
            return __awaiter(this, void 0, void 0, function* () {
                console.log(`Solicitud de eliminar archivo ${nombreArchivo}`);
                try {
                    var elNodo = yield Nodo_1.ModeloNodo.findById(idNodo).exec();
                    if (!elNodo) {
                        throw "nodo no encontrado";
                    }
                }
                catch (error) {
                    console.log(`error buscando el nodo. E: ` + error);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                let credencialesUsuario = contexto.usuario;
                let permisosEspeciales = ["atlasAdministrador", "superadministrador"];
                if (!elNodo.expertos.includes(credencialesUsuario.id) && !credencialesUsuario.permisos.some(p => permisosEspeciales.includes(p))) {
                    console.log(`El usuario no tenia permisos para efectuar esta operación`);
                    throw new apollo_server_express_1.AuthenticationError("No autorizado");
                }
                var laSeccion = elNodo.secciones.id(idSeccion);
                if (!laSeccion) {
                    console.log(`Sección no encontrada`);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                if (!laSeccion.idCarpeta) {
                    console.log(`Carpeta no especificada`);
                    throw new apollo_server_express_1.ApolloError("Informacion de la seccion inesperada");
                }
                try {
                    var laCarpeta = yield CarpetaArchivos_1.ModeloCarpetaArchivos.findById(laSeccion.idCarpeta).exec();
                    if (!laCarpeta)
                        throw "Carpeta no encontrada";
                }
                catch (error) {
                    console.log(`Error buscando la carpeta de la seccion`);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                laCarpeta.archivos.forEach(archivo => {
                    console.log(`Nombre: ${archivo.nombre}`);
                });
                const indexA = laCarpeta.archivos.findIndex(a => a.nombre == nombreArchivo);
                if (indexA > -1) {
                    laCarpeta.archivos.pull(laCarpeta.archivos[indexA]);
                }
                else {
                    console.log(`Archivo no encontrado`);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                try {
                    console.log(`guardando la carpeta: ${laCarpeta}`);
                    yield laCarpeta.save();
                }
                catch (error) {
                    console.log(`Error guardando carpeta. E: ${error}`);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                console.log(`Archivo eliminado`);
                return true;
            });
        },
        marcarPrimarioArchivoSeccionNodo: function (_, { idNodo, idSeccion, nombreArchivo }, contexto) {
            return __awaiter(this, void 0, void 0, function* () {
                try {
                    var elNodo = yield Nodo_1.ModeloNodo.findById(idNodo).exec();
                    if (!elNodo) {
                        throw "nodo no encontrado";
                    }
                }
                catch (error) {
                    console.log(`error buscando el nodo. E: ` + error);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                const credencialesUsuario = contexto.usuario;
                const permisosEspeciales = ["atlasAdministrador", "superadministrador"];
                if (!elNodo.expertos.includes(credencialesUsuario.id) && !credencialesUsuario.permisos.some(p => permisosEspeciales.includes(p))) {
                    console.log(`El usuario no tenia permisos para efectuar esta operación`);
                    throw new apollo_server_express_1.AuthenticationError("No autorizado");
                }
                var laSeccion = elNodo.secciones.id(idSeccion);
                if (!laSeccion) {
                    console.log(`Sección no encontrada`);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                if (!laSeccion.idCarpeta) {
                    console.log(`Carpeta no especificada`);
                    throw new apollo_server_express_1.ApolloError("Informacion de la seccion inesperada");
                }
                laSeccion.modo = "archivo";
                try {
                    var laCarpeta = yield CarpetaArchivos_1.ModeloCarpetaArchivos.findById(laSeccion.idCarpeta).exec();
                    if (!laCarpeta)
                        throw "Carpeta no encontrada";
                }
                catch (error) {
                    console.log(`Error buscando la carpeta de la seccion`);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                var encontrado = false;
                laCarpeta.archivos.forEach(archivo => {
                    if (archivo.nombre == nombreArchivo) {
                        console.log(`Marcando ${archivo.nombre} como primario`);
                        archivo.primario = true;
                        encontrado = true;
                    }
                    else {
                        console.log(`Marcando ${archivo.nombre} como secundario`);
                        archivo.primario = false;
                    }
                });
                try {
                    yield laCarpeta.save();
                }
                catch (error) {
                    console.log(`Error guardando carpeta. E: ${error}`);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                try {
                    yield elNodo.save();
                }
                catch (error) {
                    console.log(`Error guardando nodo. E: ${error}`);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                console.log(`Archivo seteado`);
                return encontrado;
            });
        },
        crearNuevaSeccionNodoConocimiento: function (_, { idNodo }, contexto) {
            return __awaiter(this, void 0, void 0, function* () {
                if (!contexto.usuario) {
                    throw new apollo_server_express_1.AuthenticationError("Login requerido");
                }
                let credencialesUsuario = contexto.usuario;
                try {
                    var elNodo = yield Nodo_1.ModeloNodo.findById(idNodo).exec();
                    if (!elNodo) {
                        throw "Nodo no encontrado";
                    }
                }
                catch (error) {
                    console.log(`Error buscando el nodo`);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                //Authorización
                const permisosEspeciales = ["superadministrador, atlasAdministrador"];
                if (!credencialesUsuario.permisos.some(p => permisosEspeciales.includes(p)) && !elNodo.expertos.includes(credencialesUsuario.id)) {
                    console.log(`Error de autenticacion. Solo lo puede realizar un superadministrador o un atlasAdministrador o un experto`);
                    throw new apollo_server_express_1.AuthenticationError("No autorizado");
                }
                var nuevaSeccion = elNodo.secciones.create({});
                elNodo.secciones.push(nuevaSeccion);
                try {
                    yield elNodo.save();
                }
                catch (error) {
                    console.log(`Error guardando el nodo`);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                return nuevaSeccion;
            });
        },
        eliminarSeccionNodoConocimiento: function (_, { idNodo, idSeccion }, contexto) {
            return __awaiter(this, void 0, void 0, function* () {
                let credencialesUsuario = contexto.usuario;
                try {
                    var elNodo = yield Nodo_1.ModeloNodo.findById(idNodo).exec();
                    if (!elNodo) {
                        throw "Nodo no encontrado";
                    }
                }
                catch (error) {
                    console.log(`Error buscando el nodo`);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                //Authorización
                if (!credencialesUsuario.permisos.includes("superadministrador") && !credencialesUsuario.permisos.includes("atlasAdministrador") && !elNodo.expertos.includes(credencialesUsuario.id)) {
                    console.log(`Error de autenticacion. Solo lo puede realizar un superadministrador o un atlasAdministrador`);
                    throw new apollo_server_express_1.AuthenticationError("No autorizado");
                }
                var laSeccion = elNodo.secciones.id(idSeccion);
                if (!laSeccion) {
                    throw new apollo_server_express_1.ApolloError("Sección no encontrada");
                }
                const idCarpeta = laSeccion.idCarpeta;
                if (idCarpeta) {
                    try {
                        yield CarpetaArchivos_1.ModeloCarpetaArchivos.findByIdAndDelete(idCarpeta).exec();
                        console.log(`Carpeta eliminada`);
                    }
                    catch (error) {
                        console.log(`Error eliminando la carpeta con id: ${idCarpeta}. E: ${error}`);
                    }
                }
                try {
                    yield Nodo_1.ModeloNodo.findByIdAndUpdate(idNodo, { $pull: { secciones: { _id: idSeccion } } });
                }
                catch (error) {
                    console.log(`Error pulling la seccion`);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                return true;
            });
        },
        moverSeccionNodoConocimiento: function (_, { idNodo, idSeccion, movimiento }, contexto) {
            return __awaiter(this, void 0, void 0, function* () {
                let credencialesUsuario = contexto.usuario;
                console.log(`Peticion de mover una sección ${movimiento}`);
                try {
                    var elNodo = yield Nodo_1.ModeloNodo.findById(idNodo).exec();
                    if (!elNodo) {
                        throw "Nodo no encontrado";
                    }
                }
                catch (error) {
                    console.log(`Error buscando el nodo`);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                const usuarioExperto = elNodo.expertos.includes(credencialesUsuario.id);
                //Authorización
                const permisosEspeciales = ["superadministrador", "atlasAdministrador"];
                if (!credencialesUsuario.permisos.some(p => permisosEspeciales.includes(p)) && !usuarioExperto) {
                    console.log(`Error de autenticacion. Solo lo puede realizar un experto, superadministrador o un atlasAdministrador`);
                    throw new apollo_server_express_1.AuthenticationError("No autorizado");
                }
                var laSeccion = elNodo.secciones.id(idSeccion);
                if (!laSeccion) {
                    throw new apollo_server_express_1.ApolloError("Sección no encontrada");
                }
                console.log(`Secciones estaba: ${elNodo.secciones.map(s => s.nombre)}`);
                const indexS = elNodo.secciones.findIndex(s => s.id == idSeccion);
                if (indexS > -1) {
                    const nuevoIndexS = indexS + movimiento;
                    if (nuevoIndexS < 0 || nuevoIndexS >= elNodo.secciones.length) {
                        throw new apollo_server_express_1.ApolloError("Movimiento ilegal");
                    }
                    elNodo.secciones.splice(nuevoIndexS, 0, elNodo.secciones.splice(indexS, 1)[0]);
                }
                else {
                    throw new apollo_server_express_1.ApolloError("Error buscando la sección en la base de datos");
                }
                console.log(`Secciones quedó: ${elNodo.secciones.map(s => s.nombre)}`);
                try {
                    yield elNodo.save();
                }
                catch (error) {
                    console.log(`Error pulling la seccion`);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                return true;
            });
        },
        editarNombreSeccionNodoConocimiento(_, { idNodo, idSeccion, nuevoNombre }, contexto) {
            return __awaiter(this, void 0, void 0, function* () {
                console.log(`cambiando el nombre del seccion con id ${idSeccion} del nodoConocimiento con id ${idNodo}`);
                try {
                    var elNodo = yield Nodo_1.ModeloNodo.findById(idNodo).exec();
                    if (!elNodo) {
                        throw "nodoConocimiento no encontrado";
                    }
                }
                catch (error) {
                    console.log("Error buscando el nodoConocimiento. E: " + error);
                    throw new apollo_server_express_1.ApolloError("Erro en la conexión con la base de datos");
                }
                //Authorización
                const permisosEspeciales = ["superadministrador", "atlasAdministrador"];
                const credencialesUsuario = contexto.usuario;
                if (!elNodo.expertos.includes(credencialesUsuario.id) && !credencialesUsuario.permisos.some(p => permisosEspeciales.includes(p))) {
                    console.log(`Error de autenticacion editando artículo de seccion de nodoConocimiento`);
                    throw new apollo_server_express_1.AuthenticationError("No autorizado");
                }
                nuevoNombre = nuevoNombre.replace(/\s\s+/g, " ");
                if (config_1.charProhibidosNombreCosa.test(nuevoNombre)) {
                    throw new apollo_server_express_1.ApolloError("Nombre ilegal");
                }
                nuevoNombre = nuevoNombre.trim();
                nuevoNombre.replace(/  +/g, ' ');
                nuevoNombre = nuevoNombre.replace(/[\n\r]/g, "");
                try {
                    var laSeccion = elNodo.secciones.id(idSeccion);
                    if (!laSeccion) {
                        console.log(`Seccion no encontrado en el nodoConocimiento`);
                        throw "No existía el seccion";
                    }
                    laSeccion.nombre = nuevoNombre;
                }
                catch (error) {
                    console.log("Error cambiando el artículo en la base de datos. E: " + error);
                    throw new apollo_server_express_1.ApolloError("Error guardando el artículo en la base de datos");
                }
                try {
                    yield elNodo.save();
                }
                catch (error) {
                    console.log("Error guardando el seccion creado en el nodoConocimiento. E: " + error);
                    throw new apollo_server_express_1.ApolloError("Error introduciendo el seccion en el nodoConocimiento");
                }
                console.log(`Nombre de sección cambiado`);
                return laSeccion;
            });
        },
        setNuevoEnlaceSeccionNodo(_, { idNodo, idSeccion, nuevoEnlace }, contexto) {
            return __awaiter(this, void 0, void 0, function* () {
                console.log(`cambiando el enlace de seccion con id ${idSeccion} del nodoConocimiento con id ${idNodo}`);
                try {
                    var elNodo = yield Nodo_1.ModeloNodo.findById(idNodo).exec();
                    if (!elNodo) {
                        throw "nodoConocimiento no encontrado";
                    }
                }
                catch (error) {
                    console.log("Error buscando el nodoConocimiento. E: " + error);
                    throw new apollo_server_express_1.ApolloError("Erro en la conexión con la base de datos");
                }
                //Authorización
                const permisosEspeciales = ["superadministrador", "atlasAdministrador"];
                const credencialesUsuario = contexto.usuario;
                if (!elNodo.expertos.includes(credencialesUsuario.id) && !credencialesUsuario.permisos.some(p => permisosEspeciales.includes(p))) {
                    console.log(`Error de autenticacion editando artículo de seccion de nodoConocimiento`);
                    throw new apollo_server_express_1.AuthenticationError("No autorizado");
                }
                try {
                    var laSeccion = elNodo.secciones.id(idSeccion);
                    if (!laSeccion) {
                        console.log(`Seccion no encontrado en el nodoConocimiento`);
                        throw "No existía el seccion";
                    }
                    laSeccion.enlace = nuevoEnlace;
                    laSeccion.modo = "enlace";
                }
                catch (error) {
                    console.log("Error cambiando el artículo en la base de datos. E: " + error);
                    throw new apollo_server_express_1.ApolloError("Error guardando el artículo en la base de datos");
                }
                try {
                    yield elNodo.save();
                }
                catch (error) {
                    console.log("Error guardando el seccion creado en el nodoConocimiento. E: " + error);
                    throw new apollo_server_express_1.ApolloError("Error introduciendo el seccion en el nodoConocimiento");
                }
                console.log(`Enlace cambiado`);
                return laSeccion;
            });
        },
        crearClaseNodoConocimiento: function (_, { idNodo, idExperto }, contexto) {
            return __awaiter(this, void 0, void 0, function* () {
                let credencialesUsuario = contexto.usuario;
                console.log(`Peticion de crear una clase en el nodo ${idNodo}`);
                try {
                    var elNodo = yield Nodo_1.ModeloNodo.findById(idNodo).exec();
                    if (!elNodo) {
                        throw "Nodo no encontrado";
                    }
                }
                catch (error) {
                    console.log(`Error buscando el nodo`);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                const usuarioExperto = elNodo.expertos.includes(credencialesUsuario.id);
                //Authorización
                const permisosEspeciales = ["superadministrador", "atlasAdministrador"];
                if (!credencialesUsuario.permisos.some(p => permisosEspeciales.includes(p)) && !usuarioExperto) {
                    console.log(`Error de autenticacion. Solo lo puede realizar un experto, superadministrador o un atlasAdministrador`);
                    throw new apollo_server_express_1.AuthenticationError("No autorizado");
                }
                var nuevaClase = elNodo.clases.create({
                    nombre: "Clase de " + elNodo.nombre,
                    idExperto,
                });
                elNodo.clases.push(nuevaClase);
                try {
                    yield elNodo.save();
                }
                catch (error) {
                    console.log(`Error guardando el nodo con la nueva clase`);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                return nuevaClase;
            });
        },
        eliminarClaseNodoConocimiento: function (_, { idNodo, idClase }, contexto) {
            return __awaiter(this, void 0, void 0, function* () {
                let credencialesUsuario = contexto.usuario;
                console.log(`Peticion de eliminar una clase en el nodo ${idNodo}`);
                try {
                    var elNodo = yield Nodo_1.ModeloNodo.findById(idNodo).exec();
                    if (!elNodo) {
                        throw "Nodo no encontrado";
                    }
                }
                catch (error) {
                    console.log(`Error buscando el nodo`);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                const usuarioExperto = elNodo.expertos.includes(credencialesUsuario.id);
                //Authorización
                const permisosEspeciales = ["superadministrador", "atlasAdministrador"];
                if (!credencialesUsuario.permisos.some(p => permisosEspeciales.includes(p)) && !usuarioExperto) {
                    console.log(`Error de autenticacion. Solo lo puede realizar un experto, superadministrador o un atlasAdministrador`);
                    throw new apollo_server_express_1.AuthenticationError("No autorizado");
                }
                var indexClase = elNodo.clases.findIndex(c => c.id === idClase);
                if (indexClase > -1) {
                    elNodo.clases.splice(indexClase, 1);
                }
                else {
                    console.log(`Error: No existía la clase ${idClase} en el nodo ${idNodo}`);
                    throw new apollo_server_express_1.UserInputError("La clase no existía en este nodo");
                }
                //Eliminar los eventos de esta clase
                console.log(`Eliminando eventos con idOrigen: ${idClase}`);
                try {
                    yield Evento_1.ModeloEventoPublico.deleteMany({ idOrigen: idClase }).exec();
                }
                catch (error) {
                    console.log(`Error buscando eventos publicos con idOrigen: ${idClase} para eliminarlos`);
                }
                try {
                    yield elNodo.save();
                }
                catch (error) {
                    console.log(`Error guardando el nodo con la nueva clase`);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                return true;
            });
        },
        addUsuarioInteresadosClaseNodoConocimiento: function (_, { idNodo, idClase, idUsuario }, contexto) {
            return __awaiter(this, void 0, void 0, function* () {
                let credencialesUsuario = contexto.usuario;
                console.log(`Solicitud de add un usuario a interesados en clase`);
                const permisosEspeciales = ["superadministrador", "atlasAdministrador"];
                if (!credencialesUsuario.permisos.some(p => permisosEspeciales.includes(p)) && credencialesUsuario.id != idUsuario) {
                    console.log(`Error de autenticacion.`);
                    throw new apollo_server_express_1.AuthenticationError("No autorizado");
                }
                try {
                    var elNodo = yield Nodo_1.ModeloNodo.findById(idNodo).exec();
                    if (!elNodo) {
                        throw "Nodo no encontrado";
                    }
                }
                catch (error) {
                    console.log(`Error buscando el nodo`);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                var laClase = elNodo.clases.find(c => c.id === idClase);
                if (!laClase) {
                    console.log(`Clase ${idClase} no encontrada`);
                    throw new apollo_server_express_1.UserInputError("Datos incorrectos");
                }
                if (idUsuario === laClase.idExperto) {
                    console.log(`El dictador de la clase pretendia participar. Abortando`);
                    throw new apollo_server_express_1.UserInputError("El usuario que dictará la clase no puede ser un participante");
                }
                var indexU = laClase.interesados.indexOf(idUsuario);
                if (indexU > -1) {
                    console.log(`El usuario ya estaba en la lista de interesados`);
                    laClase.interesados.splice(indexU, 1);
                }
                laClase.interesados.push(idUsuario);
                try {
                    yield elNodo.save();
                }
                catch (error) {
                    console.log(`Error guardando el nodo con interesado nuevo en clase`);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                return laClase;
            });
        },
        eliminarUsuarioInteresadosClaseNodoConocimiento: function (_, { idNodo, idClase, idUsuario }, contexto) {
            return __awaiter(this, void 0, void 0, function* () {
                let credencialesUsuario = contexto.usuario;
                console.log(`Solicitud de retirar un usuario de la lista de interesados en clase`);
                const permisosEspeciales = ["superadministrador", "atlasAdministrador"];
                if (!credencialesUsuario.permisos.some(p => permisosEspeciales.includes(p)) && credencialesUsuario.id != idUsuario) {
                    console.log(`Error de autenticacion.`);
                    throw new apollo_server_express_1.AuthenticationError("No autorizado");
                }
                try {
                    var elNodo = yield Nodo_1.ModeloNodo.findById(idNodo).exec();
                    if (!elNodo) {
                        throw "Nodo no encontrado";
                    }
                }
                catch (error) {
                    console.log(`Error buscando el nodo`);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                var laClase = elNodo.clases.find(c => c.id === idClase);
                if (!laClase) {
                    console.log(`Clase ${idClase} no encontrada`);
                    throw new apollo_server_express_1.UserInputError("Datos incorrectos");
                }
                var indexU = laClase.interesados.indexOf(idUsuario);
                if (indexU > -1) {
                    console.log(`El usuario estaba en la lista de interesados`);
                    laClase.interesados.splice(indexU, 1);
                }
                else {
                    console.log(`El usuario ${idUsuario} a eliminar no estaba en la lista de interesados de la clase ${idClase}`);
                    throw new apollo_server_express_1.UserInputError("Datos incorrectos");
                }
                try {
                    yield elNodo.save();
                }
                catch (error) {
                    console.log(`Error guardando el nodo con interesado nuevo en clase`);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                return laClase;
            });
        }
    },
    SeccionContenidoNodo: {
        archivos(parent, _, __) {
            return __awaiter(this, void 0, void 0, function* () {
                if (!parent.idCarpeta) {
                    console.log(`No habia carpeta`);
                    return [];
                }
                try {
                    var laCarpeta = yield CarpetaArchivos_1.ModeloCarpetaArchivos.findById(parent.idCarpeta, "archivos").exec();
                    if (!laCarpeta)
                        throw "Carpeta no existía";
                }
                catch (error) {
                    console.log(`Error buscando carpeta en base de datos. E: ${error}`);
                    return [];
                }
                const infoArchivos = laCarpeta.archivos.map(a => { return { nombre: a.nombre, primario: a.primario }; });
                return infoArchivos;
            });
        },
        tipoPrimario(parent, _, __) {
            return __awaiter(this, void 0, void 0, function* () {
                if (!parent.idCarpeta) {
                    console.log(`No habia carpeta`);
                    return null;
                }
                try {
                    var laCarpeta = yield CarpetaArchivos_1.ModeloCarpetaArchivos.findById(parent.idCarpeta, "archivos").exec();
                    if (!laCarpeta)
                        throw "Carpeta no existía";
                    var elPrimario = laCarpeta.archivos.find(a => a.primario == true);
                    if (!elPrimario)
                        throw "No habia primario";
                }
                catch (error) {
                    console.log(`Error buscando carpeta y primario en base de datos. E: ${error}`);
                    return null;
                }
                if (!elPrimario.mimetype) {
                    console.log(`No habia mimetype`);
                    return null;
                }
                return elPrimario.mimetype;
            });
        }
    }
};
