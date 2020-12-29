import { gql } from "apollo-server-express";
const Nodo = require("../model/atlas/Nodo").modeloNodo;



export const typeDefs = gql`
type Vinculo{
    id:ID!,
    tipo: String!,
    idRef: ID!,
    rol: String!
}

type Coords{
    x: Int,
    y: Int
}

type NodoConocimiento{
    id: ID!
    nombre: String,
    coordX: Int,
    coordY: Int,
    vinculos: [Vinculo],
    coordsManuales: Coords    
}
type Error{
    tipo: String,
    mensaje: String
}

type RespuestaMutateVinculo{
    errores: [Error],
    modificados:[NodoConocimiento]
}

type Query{
    todosNodos: [NodoConocimiento],
    ping: String,
    nodo(idNodo: String): NodoConocimiento
},
type Mutation{
    setCoordsManuales(idNodo: String, x: Int, y: Int):NodoConocimiento,
    crearVinculo(tipo:String!, idSource:ID!, idTarget:ID!):RespuestaMutateVinculo,
    eliminarVinculoFromTo(idSource:ID!, idTarget:ID!):RespuestaMutateVinculo
}
`;

export const resolvers = {
    Query: {
        todosNodos: async function () {
            console.log(`enviando todos los nombres, vinculos y coordenadas`);
            try {
                var todosNodos = await Nodo.find({}, "nombre vinculos coordsManuales coordx coordy ubicado").exec();
                console.log(`encontrados ${todosNodos.length} nodos`);
            }
            catch (error) {
                console.log(`error fetching todos los nodos. e: ` + error);
                return;
            }

            return todosNodos;
        },
        nodo: async function (_: any, { idNodo }: any) {
            console.log(`Buscando el nodo con id ${idNodo}`);
            try {
                var elNodo = await Nodo.findById(idNodo, "nombre coordsManuales");
            }
            catch (error) {
                console.log(`error buscando el nodo. e: ` + error);
            }
            return elNodo;
        }
    },
    Mutation: {
        setCoordsManuales: async function (_: any, args: any) {
            let { idNodo, y, x } = args;

            try {
                var elNodo = await Nodo.findById(idNodo, "nombre coordsManuales");
            }
            catch (error) {
                console.log(`error buscando el nodo. E: ` + error);
            }
            let coordsManuales = {
                x, y
            }
            elNodo.coordsManuales = coordsManuales;
            try {
                console.log(`guardando ${elNodo.nombre} en la base de datos`);
                await elNodo.save();
            } catch (error) {
                console.log(`error guardando el nodo con coordenadas manuales: ${error}`);
            }
            return elNodo;
        },
        crearVinculo: async function (_: any, args: any) {
            let errores = [];
            let modificados = [];
            console.log(`recibida una peticion de vincular nodos con args: ${JSON.stringify(args)}`);
            try {
                var nodoSource = await Nodo.findById(args.idSource, "vinculos");
                var nodoTarget = await Nodo.findById(args.idTarget, "vinculos");
            }
            catch (error) {
                console.log(`error consiguiendo los nodos para crear el vínculo . e: ` + error);
                errores.push({
                    tipo: "database",
                    mensaje: "Error fetching nodos"
                });
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
            }
            const vinculoTargetSource = {
                idRef: args.idSource,
                rol: "target"
            }
            nodoSource.vinculos.push(vinculoSourceTarget);
            nodoTarget.vinculos.push(vinculoTargetSource);
            try {
                await nodoSource.save();
                await nodoTarget.save();
            }
            catch (error) {
                console.log(`error guardando los nodos despues de la creacion de vinculos. e: ` + error);
                errores.push({
                    tipo: "database",
                    mensaje: "error guardando los nodos"
                });
            }
            modificados.push(nodoSource);
            modificados.push(nodoTarget);
            console.log(`vinculo entre ${args.idSource} y ${args.idTarget} creado`);
            return {
                errores,
                modificados
            }
        },
        eliminarVinculoFromTo: async function (_: any, args: any) {
            let errores = [];
            let modificados = [];
            console.log(`desvinculando ${args.idSource} de ${args.idTarget}`);
            try {
                var elUno = await Nodo.findById(args.idSource, "nombre vinculos");
                var elOtro = await Nodo.findById(args.idTarget, "nombre vinculos");
            }
            catch (error) {
                console.log(`error . e: ` + error);
                errores.push({
                    tipo: "database",
                    mensaje: "Error conectandose con la base de datos"
                })
            }

            for (var vinculo of elUno.vinculos) {
                if (vinculo.idRef == args.idTarget) vinculo.remove();
            }
            for (var vinculo of elOtro.vinculos) {
                if (vinculo.idRef == args.idSource) vinculo.remove();
            }

            try {
                await elUno.save();
                await elOtro.save();
            }
            catch (error) {
                console.log(`error . e: ` + error);
                errores.push({
                    tipo: "database",
                    mensaje: "Error conectandose con la base de datos"
                })
            }
            modificados.push(elUno);
            modificados.push(elOtro);

            return {
                errores,
                modificados
            }

        }
    }
};

module.exports = { typeDefs: typeDefs, resolvers: resolvers }