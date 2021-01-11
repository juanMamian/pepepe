import { ApolloError, AuthenticationError, gql } from "apollo-server-express";
const Nodo = require("../model/atlas/Nodo").modeloNodo;
import {contextoQuery} from "./tsObjetos"
/*
interface NodoConocimiento{
    nombre: string,
    id: string,
    vinculos:{
        idRef:string,
        rol: string,
        tipo: string
    },
    icono: buffer,
    coordsManuales:{
        x: number,
        y:number
    }
}
*/

interface Coords{
    x: number,
    y: number
}

interface NodoConocimiento{
    id: string
    nombre: string,
    coordX: number,
    coordY: number,
    vinculos: Array<Vinculo>,
    coordsManuales: Array<Coords>    
}

interface Vinculo{
    id:string,
    tipo: string,
    idRef: string,
    rol: string
}





export const typeDefs = gql`
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
    coordsManuales: Coords    
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

extend type Query{
    todosNodos: [NodoConocimiento],
    ping: String,
    nodo(idNodo: String): NodoConocimiento
},

type infoNodosModificados{
    modificados: [NodoConocimiento]
}

extend type Mutation{
    setCoordsManuales(idNodo: String, coordsManuales:CoordsInput):infoNodosModificados,
    crearVinculo(tipo:String!, idSource:ID!, idTarget:ID!):infoNodosModificados,
    eliminarVinculoFromTo(idSource:ID!, idTarget:ID!):infoNodosModificados,
    editarNombreNodo(idNodo: ID!, nuevoNombre: String!):infoNodosModificados,
    crearNodo(infoNodo:NodoConocimientoInput):infoNodosModificados
    eliminarNodo(idNodo:ID!):ID
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
        async eliminarNodo(_: any, { idNodo }: any, { req }: any) {
            console.log(`eliminando nodo con id ${idNodo} por el usuario ${req.user.id}`);
            let permisos: string = req.usuario.permisos;
            if (permisos == "atlasAdministrador" || permisos == "administrador" || permisos == "superadministrador") {
                try {
                    await Nodo.deleteOne({ _id: idNodo }).exec();
                } catch (error) {
                    console.log(`error eliminando nodo`);
                }
                console.log(`nodo ${idNodo} eliminado`);
                return idNodo;
            }
            else {
                throw new AuthenticationError("No autorizado");
            }
        },
        async crearNodo(_: any, { infoNodo }: any) {
            console.log(`Creando nuevo nodo de conocimiento`);
            let modificados:Array<NodoConocimiento> = new Array();
            let nuevoNodo = new Nodo({
                ...infoNodo
            });
            console.log(`nodo: ${JSON.stringify(nuevoNodo)}`);
            try {
                await nuevoNodo.save();
            } catch (error) {
                console.log(`error guardando el nuevo nodo en la base de datos`);
                throw new ApolloError("Error guardando en base de datos");
            }
            modificados.push(nuevoNodo);
            console.log(`nuevo nodo de conocimiento creado. ID: ${nuevoNodo._id} `);
            return {
                modificados
            }
        },
        setCoordsManuales: async function (_: any, { idNodo, coordsManuales }: any, {usuario}:contextoQuery) {
            console.log(`movimiento de coords manuales por ${usuario.username} con permisos ${usuario.permisos}`);
            let permisos: string = usuario.permisos;
            if (permisos == "atlasAdministrador" || permisos == "administrador" || permisos == "superadministrador") {

                let modificados:Array<NodoConocimiento> = new Array();
                try {
                    var elNodo = await Nodo.findById(idNodo, "nombre coordsManuales");
                }
                catch (error) {
                    console.log(`error buscando el nodo. E: ` + error);
                }
                elNodo.coordsManuales = coordsManuales;
                try {
                    console.log(`guardando coords de ${elNodo.nombre} en la base de datos`);
                    await elNodo.save();
                } catch (error) {
                    console.log(`error guardando el nodo con coordenadas manuales: ${error}`);
                }
                modificados.push(elNodo);
                return { modificados };
            }
            else{
                throw new AuthenticationError("No autorizado");
            }
        },
        crearVinculo: async function (_: any, args: any) {
            let modificados:Array<NodoConocimiento> = [];
            console.log(`recibida una peticion de vincular nodos con args: ${JSON.stringify(args)}`);
            try {
                var nodoSource = await Nodo.findById(args.idSource, "vinculos");
                var nodoTarget = await Nodo.findById(args.idTarget, "vinculos");
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
            }
            modificados.push(nodoSource);
            modificados.push(nodoTarget);
            console.log(`vinculo entre ${args.idSource} y ${args.idTarget} creado`);
            return { modificados };
        },
        eliminarVinculoFromTo: async function (_: any, args: any) {
            let modificados:Array<NodoConocimiento> = [];
            console.log(`desvinculando ${args.idSource} de ${args.idTarget}`);
            try {
                var elUno = await Nodo.findById(args.idSource, "nombre vinculos");
                var elOtro = await Nodo.findById(args.idTarget, "nombre vinculos");
            }
            catch (error) {
                console.log(`error . e: ` + error);                
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
                
            }
            modificados.push(elUno);
            modificados.push(elOtro);

            return { modificados };

        },
        editarNombreNodo: async function (_: any, { idNodo, nuevoNombre }: any) {
            let modificados:Array<NodoConocimiento> = [];
            try {
                var elNodo = await Nodo.findById(idNodo, "nombre coordsManuales");
            }
            catch (error) {
                console.log(`error buscando el nodo. E: ` + error);
            }
            nuevoNombre = nuevoNombre.replace(/\s\s+/g, " ");
            var charProhibidosNombreNodo = /[^ a-zA-ZÀ-ž0-9_():.,-]/g;
            if(charProhibidosNombreNodo.test(nuevoNombre)){
                throw new ApolloError("Nombre ilegal");
            }

            elNodo.nombre = nuevoNombre.trim();

            try {
                console.log(`guardando nuevo nombre ${elNodo.nombre} en la base de datos`);
                await elNodo.save();
            } catch (error) {
                console.log(`error guardando el nodo con coordenadas manuales: ${error}`);
            }
            modificados.push(elNodo);
            return { modificados }
        }
    }
};

 

