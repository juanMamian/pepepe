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
const Nodo_1 = require("../model/atlas/Nodo");
exports.typeDefs = apollo_server_express_1.gql `
type Vinculo{
    id:ID!,
    tipo: String!,
    idRef: ID!,
    rol: String!
}

input vinculoInput{
    id:ID,
    tipo: String,
    idRef: ID,
    rol: String
}



type NodoConocimiento{
    id: ID!
    nombre: String,
    coordX: Int,
    coordY: Int,
    vinculos: [Vinculo],
    coordsManuales: Coords,
    resumen:String    
}

input NodoConocimientoInput{
    id: ID,
    nombre: String,
    coordsManuales:CoordsInput,
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
    nodo(idNodo: String): NodoConocimiento,
    busquedaAmplia(palabrasBuscadas:[String]!):[NodoConocimiento]
},

extend type Mutation{
    setCoordsManuales(idNodo: String, coordsManuales:CoordsInput):infoNodosModificados,
    crearVinculo(tipo:String!, idSource:ID!, idTarget:ID!):infoNodosModificados,
    eliminarVinculoFromTo(idSource:ID!, idTarget:ID!):infoNodosModificados,
    editarNombreNodo(idNodo: ID!, nuevoNombre: String!):infoNodosModificados,
    crearNodo(infoNodo:NodoConocimientoInput):infoNodosModificados
    eliminarNodo(idNodo:ID!):ID
}
`;
exports.resolvers = {
    Query: {
        busquedaAmplia: function (_, { palabrasBuscadas }, __) {
            return __awaiter(this, void 0, void 0, function* () {
                console.log(`buscando nodos de conocimientos que contengan: ${palabrasBuscadas}`);
                console.log(`tipo de input: ${typeof (palabrasBuscadas)}`);
                if (palabrasBuscadas.length < 1) {
                    console.log(`No habia palabras buscadas`);
                }
                let palabrasBuscadasConcatenadas = palabrasBuscadas.join("|");
                try {
                    var opciones = yield Nodo_1.ModeloNodo.find({ nombre: { $regex: palabrasBuscadasConcatenadas, $options: "gi" } }, "nombre resumen").limit(5);
                }
                catch (error) {
                    console.log(". E: " + error);
                    throw new apollo_server_express_1.ApolloError("");
                }
                console.log(`opciones: ${opciones}`);
                return [{
                        id: 1,
                        nombre: "kuan"
                    }];
            });
        },
        todosNodos: function () {
            return __awaiter(this, void 0, void 0, function* () {
                console.log(`enviando todos los nombres, vinculos y coordenadas`);
                try {
                    var todosNodos = yield Nodo_1.ModeloNodo.find({}, "nombre vinculos coordsManuales coordx coordy ubicado").exec();
                    console.log(`encontrados ${todosNodos.length} nodos`);
                }
                catch (error) {
                    console.log(`error fetching todos los nodos. e: ` + error);
                    return;
                }
                return todosNodos;
            });
        },
        nodo: function (_, { idNodo }) {
            return __awaiter(this, void 0, void 0, function* () {
                console.log(`Buscando el nodo con id ${idNodo}`);
                try {
                    var elNodo = yield Nodo_1.ModeloNodo.findById(idNodo, "nombre coordsManuales");
                }
                catch (error) {
                    console.log(`error buscando el nodo. e: ` + error);
                }
                return elNodo;
            });
        }
    },
    Mutation: {
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
                    yield Nodo_1.ModeloNodo.deleteOne({ _id: idNodo }).exec();
                }
                catch (error) {
                    console.log(`error eliminando nodo`);
                }
                console.log(`nodo ${idNodo} eliminado`);
                return idNodo;
            });
        },
        crearNodo(_, { infoNodo }) {
            return __awaiter(this, void 0, void 0, function* () {
                console.log(`Creando nuevo nodo de conocimiento`);
                let modificados = new Array();
                let nuevoNodo = new Nodo_1.ModeloNodo(Object.assign({}, infoNodo));
                console.log(`nodo: ${JSON.stringify(nuevoNodo)}`);
                try {
                    yield nuevoNodo.save();
                }
                catch (error) {
                    console.log(`error guardando el nuevo nodo en la base de datos`);
                    throw new apollo_server_express_1.ApolloError("Error guardando en base de datos");
                }
                modificados.push(nuevoNodo);
                console.log(`nuevo nodo de conocimiento creado. ID: ${nuevoNodo._id} `);
                return {
                    modificados
                };
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
                elNodo.coordsManuales = coordsManuales;
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
        crearVinculo: function (_, args) {
            return __awaiter(this, void 0, void 0, function* () {
                let modificados = [];
                console.log(`recibida una peticion de vincular nodos con args: ${JSON.stringify(args)}`);
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
        eliminarVinculoFromTo: function (_, args) {
            return __awaiter(this, void 0, void 0, function* () {
                let modificados = [];
                console.log(`desvinculando ${args.idSource} de ${args.idTarget}`);
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
        editarNombreNodo: function (_, { idNodo, nuevoNombre }) {
            return __awaiter(this, void 0, void 0, function* () {
                let modificados = [];
                try {
                    var elNodo = yield Nodo_1.ModeloNodo.findById(idNodo, "nombre coordsManuales").exec();
                }
                catch (error) {
                    console.log(`error buscando el nodo. E: ` + error);
                }
                nuevoNombre = nuevoNombre.replace(/\s\s+/g, " ");
                var charProhibidosNombreNodo = /[^ a-zA-ZÀ-ž0-9_():.,-]/g;
                if (charProhibidosNombreNodo.test(nuevoNombre)) {
                    throw new apollo_server_express_1.ApolloError("Nombre ilegal");
                }
                elNodo.nombre = nuevoNombre.trim();
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
        }
    }
};
