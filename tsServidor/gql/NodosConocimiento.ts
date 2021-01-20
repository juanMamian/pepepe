import { ApolloError, AuthenticationError, gql } from "apollo-server-express";
import {ModeloNodo as Nodo} from "../model/atlas/Nodo";
import { contextoQuery } from "./tsObjetos"
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

interface Coords {
    x: number,
    y: number
}

interface NodoConocimiento {
    id: string
    nombre: string,
    coordX: number,
    coordY: number,
    vinculos: Array<Vinculo>,
    coordsManuales: Array<Coords>
}

interface Vinculo {
    id: string,
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

export const resolvers = {
    Query: {
        busquedaAmplia: async function (_: any, { palabrasBuscadas }, __: any) {
            console.log(`buscando nodos de conocimientos que contengan: ${palabrasBuscadas}`);
            console.log(`tipo de input: ${typeof (palabrasBuscadas)}`);
            if (palabrasBuscadas.length < 1) {
                console.log(`No habia palabras buscadas`);
            }
            let palabrasBuscadasConcatenadas = palabrasBuscadas.join("|");
            try {
                var opciones = await Nodo.find({ nombre: { $regex: palabrasBuscadasConcatenadas, $options: "gi" } }, "nombre resumen").limit(5);
            }
            catch (error) {
                console.log(". E: " + error);
                throw new ApolloError("");
            }
            console.log(`opciones: ${opciones}`);
            return [{
                id: 1,
                nombre: "kuan"
            }]
        },
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
        async eliminarNodo(_: any, { idNodo }: any, contexto: contextoQuery) {
            console.log(`peticion de eliminar nodo con id ${idNodo}`);
            let credencialesUsuario = contexto.usuario;

            let permisosValidos = ["atlasAdministrador", "administrador", "superadministrador"];

            if (!credencialesUsuario.permisos.some(p => permisosValidos.includes(p))) {
                console.log(`El usuario no tenia permisos para efectuar esta operación`);
                throw new AuthenticationError("No autorizado");
            }
            try {
                await Nodo.deleteOne({ _id: idNodo }).exec();
            } catch (error) {
                console.log(`error eliminando nodo`);
            }
            console.log(`nodo ${idNodo} eliminado`);
            return idNodo;



        },
        async crearNodo(_: any, { infoNodo }: any) {
            console.log(`Creando nuevo nodo de conocimiento`);
            let modificados: Array<NodoConocimiento> = new Array();
            let nuevoNodo:any = new Nodo({
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
        setCoordsManuales: async function (_: any, { idNodo, coordsManuales }: any, contexto: contextoQuery) {
            console.log(`peticion de movimiento de coords manuales`);

            let credencialesUsuario = contexto.usuario;

            let permisosValidos = ["atlasAdministrador", "administrador", "superadministrador"];

            if (!credencialesUsuario.permisos.some(p => permisosValidos.includes(p))) {
                console.log(`El usuario no tenia permisos para efectuar esta operación`);
                throw new AuthenticationError("No autorizado");
            }
            let modificados: Array<NodoConocimiento> = new Array();
            
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

        },
        crearVinculo: async function (_: any, args: any) {
            let modificados: Array<NodoConocimiento> = [];
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
            let modificados: Array<NodoConocimiento> = [];
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
            let modificados: Array<NodoConocimiento> = [];
            try {
                var elNodo = await Nodo.findById(idNodo, "nombre coordsManuales");
            }
            catch (error) {
                console.log(`error buscando el nodo. E: ` + error);
            }
            nuevoNombre = nuevoNombre.replace(/\s\s+/g, " ");
            var charProhibidosNombreNodo = /[^ a-zA-ZÀ-ž0-9_():.,-]/g;
            if (charProhibidosNombreNodo.test(nuevoNombre)) {
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



