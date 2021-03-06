import { ApolloError, AuthenticationError, gql, UserInputError } from "apollo-server-express";
import { ModeloNodo as Nodo } from "../model/atlas/Nodo";
import { contextoQuery } from "./tsObjetos"
import { ModeloUsuario as Usuario } from "../model/Usuario";
import { ModeloForo as Foro } from "../model/Foros/Foro"
import { ModeloCarpetaArchivos as CarpetasArchivos } from "../model/CarpetaArchivos";
import { EsquemaVinculosNodosProyecto } from "../model/VinculosNodosProyecto";

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
    coordsManuales: Array<Coords>,

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
}

input NodoConocimientoInput{
    id: ID,
    nombre: String,
    coordsManuales:CoordsInput,
    coords:CoordsInput,
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

    crearNuevaSeccionNodoConocimiento(idNodo:ID!, nombreNuevaSeccion:String!):SeccionContenidoNodo,
    eliminarSeccionNodoConocimiento(idNodo:ID!, idSeccion:ID!):Boolean,
    moverSeccionNodoConocimiento(idNodo:ID!, idSeccion: ID!, movimiento: Int!):Boolean,

    crearClaseNodoConocimiento(idNodo:ID!, idExperto: ID!):ClaseNodoConocimiento,
    eliminarClaseNodoConocimiento(idNodo:ID!, idClase: ID!):Boolean,
    addUsuarioInteresadosClaseNodoConocimiento(idNodo:ID!, idClase: ID!, idUsuario: ID!):ClaseNodoConocimiento,
    eliminarUsuarioInteresadosClaseNodoConocimiento(idNodo:ID!, idClase: ID!, idUsuario: ID!):ClaseNodoConocimiento,

}
`;

export const resolvers = {
    Query: {
        busquedaAmplia: async function (_: any, { palabrasBuscadas }, __: any) {
            console.log(`buscando nodos de conocimientos que contengan: ${palabrasBuscadas}`);
            // console.log(`tipo de input: ${typeof (palabrasBuscadas)}`);
            if (palabrasBuscadas.length < 1) {
                console.log(`No habia palabras buscadas`);
            }
            
            try {                
                var opciones:any = await Nodo.find({ $text: { $search: palabrasBuscadas } }, { score: { $meta: 'textScore' } }).collation({locale:"en", strength:1}).select("nombre descripcion coordsManuales coords").sort({ score: { $meta: 'textScore' } }).limit(10).exec();                
            }
            catch (error) {
                console.log(". E: " + error);
                throw new ApolloError("");
            }
            console.log(`${opciones.length} opciones: ${opciones}`);
            return opciones
        },
        todosNodos: async function () {
            console.log(`enviando todos los nombres, vinculos y coordenadas`);
            try {
                var todosNodos = await Nodo.find({}, "nombre descripcion vinculos coordsManuales coords centroMasa stuck angulo puntaje coordx coordy ubicado clases").exec();
                console.log(`encontrados ${todosNodos.length} nodos`);
            }
            catch (error) {
                console.log(`error fetching todos los nodos. e: ` + error);
                return;
            }

            // console.log(`Enviando: ${todosNodos}`);

            return todosNodos;
        },
        nodo: async function (_: any, { idNodo }: any) {
            console.log(`Buscando el nodo con id ${idNodo}`);
            try {
                var elNodo: any = await Nodo.findById(idNodo, "nombre vinculos coordsManuales descripcion idForoExpertos idForoPublico expertos posiblesExpertos secciones clases").exec();
                if (!elNodo) throw "Nodo no encontrado";
            } catch (error) {
                console.log(`error buscando el nodo. e: ` + error);
                throw new ApolloError("Error conectando con la base de datos");
            }

            let tieneForoPublico = true;

            if (!elNodo.idForoPublico) {
                tieneForoPublico = false;
            }
            else {
                try {
                    let elForoPublico: any = await Foro.findById(elNodo.idForoPublico).exec();
                    if (!elForoPublico) {
                        console.log(`El foro no existía. Se creará uno nuevo`);
                        tieneForoPublico = false;
                    }
                } catch (error) {
                    console.log(`Error buscando foro público en la base de datos. E :${error}`);
                }
            }

            if (!tieneForoPublico) {
                console.log(`El nodo ${elNodo.nombre} no tenía foro publico. Creando.`);
                try {
                    var nuevoForoPublico: any = await Foro.create({
                        miembros: elNodo.expertos,
                        acceso: "publico"
                    });
                    var idNuevoForoPublico = nuevoForoPublico._id;
                    await nuevoForoPublico.save();
                    elNodo.idForoPublico = idNuevoForoPublico;
                } catch (error) {
                    console.log(`Error creando el nuevo foro. E: ${error}`);
                    throw new ApolloError("Error conectando con la base de datos");
                }
                console.log(`Nuevo foro creado`);
            }

            let tieneForoExpertos = true;

            if (!elNodo.idForoExpertos) {
                tieneForoExpertos = false;
            }
            else {
                try {
                    let elForoExpertos: any = await Foro.findById(elNodo.idForoExpertos).exec();
                    if (!elForoExpertos) {
                        console.log(`El foro no existía. Se creará uno nuevo`);
                        tieneForoExpertos = false;
                    }
                } catch (error) {
                    console.log(`Error buscando foro público en la base de datos. E :${error}`);
                }
            }

            if (!tieneForoExpertos) {
                console.log(`El nodo ${elNodo.nombre} no tenía foro expertos. Creando.`);
                try {
                    var nuevoForoExpertos: any = await Foro.create({
                        miembros: elNodo.expertos,
                        acceso: "privado"
                    });
                    var idNuevoForoExpertos = nuevoForoExpertos._id;
                    await nuevoForoExpertos.save();
                    elNodo.idForoExpertos = idNuevoForoExpertos;

                } catch (error) {
                    console.log(`Error creando el nuevo foro. E: ${error}`);
                    throw new ApolloError("Error conectando con la base de datos");
                }
                console.log(`Nuevo foro creado`);
            }
            if (!tieneForoExpertos || !tieneForoPublico) {
                try {
                    await elNodo.save();
                } catch (error) {
                    console.log(`Error guardando el nodo`);
                    throw new ApolloError("Error conectando con la base de datos");
                }
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
        async crearNodo(_: any, { infoNodo }: any, contexto: contextoQuery) {
            let credencialesUsuario = contexto.usuario;
            let permisosEspeciales = ["atlasAdministrador", "administrador", "superadministrador"];;
            if (!credencialesUsuario.permisos.some(p => permisosEspeciales.includes(p))) {
                console.log(`Error de autenticacion`);
                throw new AuthenticationError("No autorizado");
            }
            console.log(`Creando nuevo nodo de conocimiento`);

            try {
                var nuevoForoPublico: any = await Foro.create({
                    acceso: "publico",
                    miembros: [],
                });
                var idForoPublico = nuevoForoPublico._id;
                await nuevoForoPublico.save();
            } catch (error) {
                console.log(`Error creando el nuevo foro publico. E: ${error}`);
                throw new ApolloError("Error conectando con la base de datos");
            }
            console.log(`Nuevo foro publico creado`);

            try {
                var nuevoForoExpertos: any = await Foro.create({
                    acceso: "privado",
                    miembros: [],
                });
                var idForoExpertos = nuevoForoExpertos._id;
                await nuevoForoExpertos.save();
            } catch (error) {
                console.log(`Error creando el nuevo foro expertos. E: ${error}`);
                throw new ApolloError("Error conectando con la base de datos");
            }
            console.log(`Nuevo foro expertos creado`);

            try {
                var nuevoNodo: any = new Nodo({
                    ...infoNodo,
                    idForoPublico,
                    idForoExpertos
                });
                await nuevoNodo.save();
            } catch (error) {
                console.log(`error guardando el nuevo nodo en la base de datos. E: ${error}`);
                throw new ApolloError("Error guardando en base de datos");
            }
            console.log(`nuevo nodo de conocimiento creado: ${nuevoNodo} `);
            return nuevoNodo
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
                var elNodo: any = await Nodo.findById(idNodo, "nombre coordsManuales").exec();
            }
            catch (error) {
                console.log(`error buscando el nodo. E: ` + error);
            }
            elNodo.coords = coordsManuales;
            try {
                console.log(`guardando coords de ${elNodo.nombre} en la base de datos`);
                await elNodo.save();
            } catch (error) {
                console.log(`error guardando el nodo con coordenadas manuales: ${error}`);
            }
            modificados.push(elNodo);
            return { modificados };

        },
        crearVinculo: async function (_: any, args: any, contexto: contextoQuery) {
            let modificados: Array<NodoConocimiento> = [];
            console.log(`recibida una peticion de vincular nodos con args: ${JSON.stringify(args)}`);
            let credencialesUsuario = contexto.usuario;

            let permisosValidos = ["atlasAdministrador", "administrador", "superadministrador"];

            if (!credencialesUsuario.permisos.some(p => permisosValidos.includes(p))) {
                console.log(`El usuario no tenia permisos para efectuar esta operación`);
                throw new AuthenticationError("No autorizado");
            }
            try {
                var nodoSource: any = await Nodo.findById(args.idSource, "vinculos").exec();
                var nodoTarget: any = await Nodo.findById(args.idTarget, "vinculos").exec();
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
        eliminarVinculoFromTo: async function (_: any, args: any, contexto: contextoQuery) {
            let modificados: Array<NodoConocimiento> = [];
            console.log(`desvinculando ${args.idSource} de ${args.idTarget}`);
            let credencialesUsuario = contexto.usuario;

            let permisosValidos = ["atlasAdministrador", "administrador", "superadministrador"];

            if (!credencialesUsuario.permisos.some(p => permisosValidos.includes(p))) {
                console.log(`El usuario no tenia permisos para efectuar esta operación`);
                throw new AuthenticationError("No autorizado");
            }
            try {
                var elUno: any = await Nodo.findById(args.idSource, "nombre vinculos").exec();
                var elOtro: any = await Nodo.findById(args.idTarget, "nombre vinculos").exec();
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
        editarNombreNodo: async function (_: any, { idNodo, nuevoNombre }: any, contexto: contextoQuery) {
            let modificados: Array<NodoConocimiento> = [];

            try {
                var elNodo: any = await Nodo.findById(idNodo, "nombre expertos coordsManuales").exec();
            }
            catch (error) {
                console.log(`error buscando el nodo. E: ` + error);
            }

            let credencialesUsuario = contexto.usuario;

            let permisosEspeciales = ["atlasAdministrador", "administrador", "superadministrador"];

            if (!elNodo.expertos.includes(credencialesUsuario.id) && !credencialesUsuario.permisos.some(p => permisosEspeciales.includes(p))) {
                console.log(`El usuario no tenia permisos para efectuar esta operación`);
                throw new AuthenticationError("No autorizado");
            }

            nuevoNombre = nuevoNombre.trim();
            const charProhibidosNombreNodo = /[^ a-zA-ZÀ-ž0-9_():.,-]/;
            if (charProhibidosNombreNodo.test(nuevoNombre)) {
                throw new ApolloError("Nombre ilegal");
            }

            elNodo.nombre = nuevoNombre;

            try {
                console.log(`guardando nuevo nombre ${elNodo.nombre} en la base de datos`);
                await elNodo.save();
            } catch (error) {
                console.log(`error guardando el nodo con coordenadas manuales: ${error}`);
            }
            modificados.push(elNodo);
            return { modificados }
        },
        editarDescripcionNodoConocimiento: async function (_: any, { idNodo, nuevoDescripcion }: any, contexto: contextoQuery) {
            console.log(`|||||||||||||||||||`);
            console.log(`Solicitud de set descripcion del nodo con id ${idNodo}`);
            try {
                var elNodo: any = await Nodo.findById(idNodo).exec();
                if (!elNodo) {
                    throw "nodo no encontrado"
                }
            }
            catch (error) {
                console.log(`error buscando el nodo. E: ` + error);
                throw new ApolloError("Error conectando con la base de datos");
            }

            let credencialesUsuario = contexto.usuario;

            let permisosEspeciales = ["atlasAdministrador", "administrador", "superadministrador"];

            if (!elNodo.expertos.includes(credencialesUsuario.id) && !credencialesUsuario.permisos.some(p => permisosEspeciales.includes(p))) {
                console.log(`El usuario no tenia permisos para efectuar esta operación`);
                throw new AuthenticationError("No autorizado");
            }


            const charProhibidosDescripcionNodo = /[^\n\r a-zA-ZÀ-ž0-9_():;.,+¡!¿?"@=-]/;

            if (charProhibidosDescripcionNodo.test(nuevoDescripcion)) {
                throw new ApolloError("Descripcion ilegal");
            }

            nuevoDescripcion = nuevoDescripcion.trim();

            try {
                console.log(`guardando nuevo descripcion ${nuevoDescripcion} en la base de datos`);
                var resNodo: any = await Nodo.findByIdAndUpdate(idNodo, { descripcion: nuevoDescripcion }, { new: true }).exec();
            } catch (error) {
                console.log(`error guardando el nodo: ${error}`);
            }
            console.log(`Descripcion guardado`);
            return resNodo;
        },
        editarKeywordsNodoConocimiento: async function (_: any, { idNodo, nuevoKeywords }: any, contexto: contextoQuery) {
            console.log(`|||||||||||||||||||`);
            console.log(`Solicitud de set keywords del nodo con id ${idNodo}`);
            try {
                var elNodo: any = await Nodo.findById(idNodo).exec();
                if (!elNodo) {
                    throw "nodo no encontrado"
                }
            }
            catch (error) {
                console.log(`error buscando el nodo. E: ` + error);
                throw new ApolloError("Error conectando con la base de datos");
            }

            let credencialesUsuario = contexto.usuario;

            let permisosEspeciales = ["atlasAdministrador", "administrador", "superadministrador"];

            if (!elNodo.expertos.includes(credencialesUsuario.id) && !credencialesUsuario.permisos.some(p => permisosEspeciales.includes(p))) {
                console.log(`El usuario no tenia permisos para efectuar esta operación`);
                throw new AuthenticationError("No autorizado");
            }


            const charProhibidosKeywordsNodo = /[^ a-zA-Z0-9]/;

            if (charProhibidosKeywordsNodo.test(nuevoKeywords)) {
                throw new ApolloError("Keywords ilegal");
            }

            nuevoKeywords = nuevoKeywords.trim();

            try {
                console.log(`guardando nuevo keywords ${nuevoKeywords} en la base de datos`);
                var resNodo: any = await Nodo.findByIdAndUpdate(idNodo, { keywords: nuevoKeywords }, { new: true }).exec();
            } catch (error) {
                console.log(`error guardando el nodo: ${error}`);
            }
            console.log(`Keywords guardado`);
            return resNodo;
        },
        addExpertoNodo: async function (_: any, { idNodo, idUsuario }: any, contexto: contextoQuery) {
            console.log(`Solicitud de add un usuario con id ${idUsuario} a un nodo con id ${idNodo}`);
            let credencialesUsuario = contexto.usuario;

            try {
                var elNodo: any = await Nodo.findById(idNodo).exec();
                if (!elNodo) {
                    throw "nodo no encontrado"
                }
            }
            catch (error) {
                console.log("Error buscando el nodo en la base de datos. E: " + error);
                throw new ApolloError("Error de conexión con la base de datos");
            }

            //Authorización

            if (!credencialesUsuario.permisos.includes("superadministrador") && !credencialesUsuario.permisos.includes("atlasAdministrador")) {
                console.log(`Error de autenticacion. Solo lo puede realizar un superadministrador o un atlasAdministrador`);
                throw new AuthenticationError("No autorizado");
            }

            try {
                var elUsuario: any = await Usuario.findById(idUsuario).exec();
                if (!elUsuario) {
                    console.log(`No se pudo encontrar al usuario con id ${idUsuario} en la base de datos`);
                    throw new ApolloError("Error buscando al usuario en la base de datos");
                }
            }
            catch (error) {
                console.log("Error buscando al usuario en la base de datos. E: " + error);
                throw new ApolloError("Error conectando con la base de datos");
            }

            if (elNodo.expertos.includes(idUsuario)) {
                console.log(`El usuario ya era experto de este nodo`);
                throw new ApolloError("El usuario ya estaba incluido");
            }


            elNodo.expertos.push(idUsuario);
            console.log(`Usuario añadido a la lista de expertos`);

            let indexPosibleExperto = elNodo.posiblesExpertos.indexOf(idUsuario);
            if (indexPosibleExperto > -1) {
                console.log(`sacando al usuario ${idUsuario} de la lista de posibles expertos`);
                elNodo.posiblesExpertos.splice(indexPosibleExperto, 1);
            }

            try {
                await elNodo.save();
            }
            catch (error) {
                console.log("Error guardando datos en la base de datos. E: " + error);
                throw new ApolloError("Error conectando con la base de datos");
            }

            //Mirror expertos del nodo hacia miembros del foro
            try {
                await Foro.findByIdAndUpdate(elNodo.idForoExpertos, { miembros: elNodo.expertos });
                await Foro.findByIdAndUpdate(elNodo.idForoPublico, { miembros: elNodo.expertos });
            } catch (error) {
                console.log(`Error mirroring expertos del nodo hacia miembros del foro. E: ${error}`);
            }
            console.log(`Nodo guardado`);
            return elNodo

        },
        addPosibleExpertoNodo: async function (_: any, { idNodo, idUsuario }: any, contexto: contextoQuery) {
            console.log(`añadiendo usuario ${idUsuario} a la lista de posibles expertos del nodo ${idNodo}`);
            let credencialesUsuario = contexto.usuario;
            try {
                var elNodo: any = await Nodo.findById(idNodo).exec();
                if (!elNodo) {
                    throw "nodo no encontrado"
                }
            }
            catch (error) {
                console.log("Error buscando el nodo en la base de datos. E: " + error);
                throw new ApolloError("Error de conexión con la base de datos");
            }

            //Authorización

            if (idUsuario != credencialesUsuario.id && !credencialesUsuario.permisos.includes("superadministrador") && !credencialesUsuario.permisos.includes("atlasAdministrador")) {
                console.log(`Error de autenticacion añadiendo posible experto del nodo`);
                throw new AuthenticationError("No autorizado");
            }

            if (elNodo.posiblesExpertos.includes(idUsuario) || elNodo.expertos.includes(idUsuario)) {
                console.log(`el usuario ya estaba en la lista`);
                throw new ApolloError("El usuario ya estaba en la lista");
            }
            try {
                var elUsuario: any = await Usuario.findById(idUsuario).exec();
                if (!elUsuario) {
                    console.log(`No se pudo encontrar al usuario con id ${idUsuario} en la base de datos`);
                    throw new ApolloError("Error buscando al usuario en la base de datos");
                }
            }
            catch (error) {
                console.log("Error buscando al usuario en la base de datos. E: " + error);
                throw new ApolloError("Error conectando con la base de datos");
            }


            try {
                elNodo.posiblesExpertos.push(idUsuario);
                await elNodo.save();
            }
            catch (error) {
                console.log("Error guardando datos en la base de datos. E: " + error);
                throw new ApolloError("Error conectando con la base de datos");
            }
            console.log(`Nodo guardado`);
            return elNodo
        },
        removeExpertoNodo: async function (_: any, { idNodo, idUsuario }: any, contexto: contextoQuery) {
            console.log(`Solicitud de remover un usuario con id ${idUsuario} a un nodo con id ${idNodo}`);
            let credencialesUsuario = contexto.usuario;

            try {
                var elNodo: any = await Nodo.findById(idNodo).exec();
                if (!elNodo) {
                    throw "nodo no encontrado"
                }
            }
            catch (error) {
                console.log("Error buscando el nodo en la base de datos. E: " + error);
                throw new ApolloError("Error de conexión con la base de datos");
            }

            //Authorización

            if (idUsuario != credencialesUsuario.id && !credencialesUsuario.permisos.includes("superadministrador") && !credencialesUsuario.permisos.includes("atlasAdministrador")) {
                console.log(`Error de autenticacion removiendo experto o posible experto de nodo`);
                throw new AuthenticationError("No autorizado");
            }

            try {
                var elUsuario: any = await Usuario.findById(idUsuario).exec();
                if (!elUsuario) {
                    console.log(`No se pudo encontrar al usuario con id ${idUsuario} en la base de datos`);
                    throw new ApolloError("Error buscando al usuario en la base de datos");
                }
            }
            catch (error) {
                console.log("Error buscando al usuario en la base de datos. E: " + error);
                throw new ApolloError("Error conectando con la base de datos");
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
                await elNodo.save();
            }
            catch (error) {
                console.log("Error guardando datos en la base de datos. E: " + error);
                throw new ApolloError("Error conectando con la base de datos");
            }

            //Mirror expertos del nodo hacia miembros del foro
            try {
                await Foro.findByIdAndUpdate(elNodo.idForoPublico, { miembros: elNodo.expertos });
                await Foro.findByIdAndUpdate(elNodo.idForoExpertos, { miembros: elNodo.expertos });
            } catch (error) {
                console.log(`Error mirroring expertos del nodo hacia miembros del foro. E: ${error}`);
            }

            console.log(`Nodo guardado`);
            return elNodo

        },
        eliminarArchivoSeccionNodo: async function (_: any, { idNodo, idSeccion, nombreArchivo }: any, contexto: contextoQuery) {
            console.log(`Solicitud de eliminar archivo ${nombreArchivo}`);
            try {
                var elNodo: any = await Nodo.findById(idNodo).exec();
                if (!elNodo) {
                    throw "nodo no encontrado"
                }
            }
            catch (error) {
                console.log(`error buscando el nodo. E: ` + error);
                throw new ApolloError("Error conectando con la base de datos");
            }

            let credencialesUsuario = contexto.usuario;

            let permisosEspeciales = ["atlasAdministrador", "superadministrador"];

            if (!elNodo.expertos.includes(credencialesUsuario.id) && !credencialesUsuario.permisos.some(p => permisosEspeciales.includes(p))) {
                console.log(`El usuario no tenia permisos para efectuar esta operación`);
                throw new AuthenticationError("No autorizado");
            }

            var laSeccion = elNodo.secciones.id(idSeccion);
            if (!laSeccion) {
                console.log(`Sección no encontrada`);
                throw new ApolloError("Error conectando con la base de datos")
            }

            if (!laSeccion.idCarpeta) {
                console.log(`Carpeta no especificada`);
                throw new ApolloError("Informacion de la seccion inesperada");
            }

            try {
                var laCarpeta: any = await CarpetasArchivos.findById(laSeccion.idCarpeta).exec();
                if (!laCarpeta) throw "Carpeta no encontrada"
            } catch (error) {
                console.log(`Error buscando la carpeta de la seccion`);
                throw new ApolloError("Error conectando con la base de datos");
            }

            laCarpeta.archivos.forEach(archivo => {
                console.log(`Nombre: ${archivo.nombre}`);
            })

            const indexA = laCarpeta.archivos.findIndex(a => a.nombre == nombreArchivo);
            if (indexA > -1) {
                laCarpeta.archivos.pull(laCarpeta.archivos[indexA]);
            }
            else {
                console.log(`Archivo no encontrado`);
                throw new ApolloError("Error conectando con la base de datos");
            }

            try {
                console.log(`guardando la carpeta: ${laCarpeta}`);
                await laCarpeta.save();
            } catch (error) {
                console.log(`Error guardando carpeta. E: ${error}`);
                throw new ApolloError("Error conectando con la base de datos");
            }

            console.log(`Archivo eliminado`);
            return true;
        },
        marcarPrimarioArchivoSeccionNodo: async function (_: any, { idNodo, idSeccion, nombreArchivo }: any, contexto: contextoQuery) {
            try {
                var elNodo: any = await Nodo.findById(idNodo).exec();
                if (!elNodo) {
                    throw "nodo no encontrado"
                }
            }
            catch (error) {
                console.log(`error buscando el nodo. E: ` + error);
                throw new ApolloError("Error conectando con la base de datos");
            }

            let credencialesUsuario = contexto.usuario;

            let permisosEspeciales = ["atlasAdministrador", "superadministrador"];

            if (!elNodo.expertos.includes(credencialesUsuario.id) && !credencialesUsuario.permisos.some(p => permisosEspeciales.includes(p))) {
                console.log(`El usuario no tenia permisos para efectuar esta operación`);
                throw new AuthenticationError("No autorizado");
            }

            var laSeccion = elNodo.secciones.id(idSeccion);
            if (!laSeccion) {
                console.log(`Sección no encontrada`);
                throw new ApolloError("Error conectando con la base de datos")
            }

            if (!laSeccion.idCarpeta) {
                console.log(`Carpeta no especificada`);
                throw new ApolloError("Informacion de la seccion inesperada");
            }

            try {
                var laCarpeta: any = await CarpetasArchivos.findById(laSeccion.idCarpeta).exec();
                if (!laCarpeta) throw "Carpeta no encontrada"
            } catch (error) {
                console.log(`Error buscando la carpeta de la seccion`);
                throw new ApolloError("Error conectando con la base de datos");
            }

            var encontrado = false;

            laCarpeta.archivos.forEach(archivo => {
                if (archivo.nombre == nombreArchivo) {
                    archivo.primario = true;
                    encontrado = true;
                }
                else {
                    archivo.primario = false;
                }
            });

            try {
                await laCarpeta.save();
            } catch (error) {
                console.log(`Error guardando carpeta. E: ${error}`);
                throw new ApolloError("Error conectando con la base de datos");
            }

            console.log(`Archivo seteado`);
            return encontrado;
        },

        crearNuevaSeccionNodoConocimiento: async function (_: any, { idNodo, nombreNuevaSeccion }: any, contexto: contextoQuery) {
            let credencialesUsuario = contexto.usuario;
            
            //Authorización

            if (!credencialesUsuario.permisos.includes("superadministrador") && !credencialesUsuario.permisos.includes("atlasAdministrador")) {
                console.log(`Error de autenticacion. Solo lo puede realizar un superadministrador o un atlasAdministrador`);
                throw new AuthenticationError("No autorizado");
            }

            try {
                var elNodo:any=await Nodo.findById(idNodo).exec();
                if(!elNodo){
                    throw "Nodo no encontrado";
                }
            } catch (error) {
                console.log(`Error buscando el nodo`);
                throw new ApolloError("Error conectando con la base de datos");
            }

            const charProhibidosNombreNuevaSeccion = /[^ a-zA-ZÀ-ž0-9_():.,-]/;
            if (charProhibidosNombreNuevaSeccion.test(nombreNuevaSeccion) || nombreNuevaSeccion.length>30) {
                throw new ApolloError("Nombre ilegal");
            }
            
            var nuevaSeccion=elNodo.secciones.create({
                nombre:nombreNuevaSeccion
            });
            console.log(`Secciones: ${elNodo.secciones}`);
            console.log(`Nueva Seccion: ${nuevaSeccion}`);
            elNodo.secciones.push(nuevaSeccion);
            console.log(`Secciones: ${elNodo.secciones}`);


            try {
               await elNodo.save();
            } catch (error) {
                console.log(`Error guardando el nodo`);
                throw new ApolloError("Error conectando con la base de datos");
            }
            
            return nuevaSeccion;
        },
        eliminarSeccionNodoConocimiento:async function(_:any, {idNodo, idSeccion}:any, contexto: contextoQuery){
            let credencialesUsuario = contexto.usuario;
            
            //Authorización

            if (!credencialesUsuario.permisos.includes("superadministrador") && !credencialesUsuario.permisos.includes("atlasAdministrador")) {
                console.log(`Error de autenticacion. Solo lo puede realizar un superadministrador o un atlasAdministrador`);
                throw new AuthenticationError("No autorizado");
            }

            try {
                var elNodo:any=await Nodo.findById(idNodo).exec();
                if(!elNodo){
                    throw "Nodo no encontrado";
                }
            } catch (error) {
                console.log(`Error buscando el nodo`);
                throw new ApolloError("Error conectando con la base de datos");
            }

            var laSeccion = elNodo.secciones.id(idSeccion);
            if(!laSeccion){
                throw new ApolloError("Sección no encontrada");
            }

            const idCarpeta=laSeccion.idCarpeta;
            if(idCarpeta){
                try {
                    await CarpetasArchivos.findByIdAndDelete(idCarpeta).exec();
                    console.log(`Carpeta eliminada`);
                } catch (error) {
                    console.log(`Error eliminando la carpeta con id: ${idCarpeta}. E: ${error}`);
                }
            }      

            try {
                await Nodo.findByIdAndUpdate(idNodo, {$pull:{secciones:{_id:idSeccion}}});
            } catch (error) {
                console.log(`Error pulling la seccion`);
                throw new ApolloError("Error conectando con la base de datos");
            }            

            return true;
        },        
        moverSeccionNodoConocimiento:async function(_:any, {idNodo, idSeccion, movimiento}:any, contexto: contextoQuery){
            let credencialesUsuario = contexto.usuario;
            console.log(`Peticion de mover una sección ${movimiento}`);
            try {
                var elNodo:any=await Nodo.findById(idNodo).exec();
                if(!elNodo){
                    throw "Nodo no encontrado";
                }
            } catch (error) {
                console.log(`Error buscando el nodo`);
                throw new ApolloError("Error conectando con la base de datos");
            }

            const usuarioExperto=elNodo.expertos.includes(credencialesUsuario.id);

            //Authorización
            const permisosEspeciales=["superadministrador", "atlasAdministrador"]

            if (!credencialesUsuario.permisos.some(p=>permisosEspeciales.includes(p)) && !usuarioExperto) {
                console.log(`Error de autenticacion. Solo lo puede realizar un experto, superadministrador o un atlasAdministrador`);
                throw new AuthenticationError("No autorizado");
            }
            
            var laSeccion = elNodo.secciones.id(idSeccion);
            if(!laSeccion){
                throw new ApolloError("Sección no encontrada");
            }           
            console.log(`Secciones estaba: ${elNodo.secciones.map(s=>s.nombre)}`);

            const indexS=elNodo.secciones.findIndex(s=>s.id==idSeccion);
            if(indexS>-1){
                const nuevoIndexS=indexS+movimiento;
                if(nuevoIndexS<0 || nuevoIndexS>=elNodo.secciones.length){
                    throw new ApolloError("Movimiento ilegal");
                }
                elNodo.secciones.splice(nuevoIndexS, 0, elNodo.secciones.splice(indexS, 1)[0]);
            }   
            else{
                throw new ApolloError("Error buscando la sección en la base de datos");
            }
            console.log(`Secciones quedó: ${elNodo.secciones.map(s=>s.nombre)}`);
            try {
                await elNodo.save();
            } catch (error) {
                console.log(`Error pulling la seccion`);
                throw new ApolloError("Error conectando con la base de datos");
            }            

            return true;
        },

        crearClaseNodoConocimiento:async function(_:any, {idNodo, idExperto}:any, contexto: contextoQuery){
            let credencialesUsuario = contexto.usuario;
            console.log(`Peticion de crear una clase en el nodo ${idNodo}`);
            try {
                var elNodo:any=await Nodo.findById(idNodo).exec();
                if(!elNodo){
                    throw "Nodo no encontrado";
                }
            } catch (error) {
                console.log(`Error buscando el nodo`);
                throw new ApolloError("Error conectando con la base de datos");
            }

            const usuarioExperto=elNodo.expertos.includes(credencialesUsuario.id);

            //Authorización
            const permisosEspeciales=["superadministrador", "atlasAdministrador"]

            if (!credencialesUsuario.permisos.some(p=>permisosEspeciales.includes(p)) && !usuarioExperto) {
                console.log(`Error de autenticacion. Solo lo puede realizar un experto, superadministrador o un atlasAdministrador`);
                throw new AuthenticationError("No autorizado");
            }

            var nuevaClase= elNodo.clases.create({
                nombre: "Clase de "+elNodo.nombre,
                idExperto,                
            });

            elNodo.clases.push(nuevaClase);

            try {
                await elNodo.save();
            } catch (error) {
                console.log(`Error guardando el nodo con la nueva clase`);
                throw new ApolloError("Error conectando con la base de datos");
            }

            return nuevaClase;
        },
        eliminarClaseNodoConocimiento:async function(_:any, {idNodo, idClase}:any, contexto: contextoQuery){
            let credencialesUsuario = contexto.usuario;
            console.log(`Peticion de eliminar una clase en el nodo ${idNodo}`);
            try {
                var elNodo:any=await Nodo.findById(idNodo).exec();
                if(!elNodo){
                    throw "Nodo no encontrado";
                }
            } catch (error) {
                console.log(`Error buscando el nodo`);
                throw new ApolloError("Error conectando con la base de datos");
            }

            const usuarioExperto=elNodo.expertos.includes(credencialesUsuario.id);

            //Authorización
            const permisosEspeciales=["superadministrador", "atlasAdministrador"]

            if (!credencialesUsuario.permisos.some(p=>permisosEspeciales.includes(p)) && !usuarioExperto) {
                console.log(`Error de autenticacion. Solo lo puede realizar un experto, superadministrador o un atlasAdministrador`);
                throw new AuthenticationError("No autorizado");
            }            
            
            var indexClase=elNodo.clases.findIndex(c=>c.id===idClase);

            if(indexClase>-1){
                elNodo.clases.splice(indexClase, 1);
            }
            else{
                console.log(`Error: No existía la clase ${idClase} en el nodo ${idNodo}`);
                throw new UserInputError("La clase no existía en este nodo");
            }            

            try {
                await elNodo.save();
            } catch (error) {
                console.log(`Error guardando el nodo con la nueva clase`);
                throw new ApolloError("Error conectando con la base de datos");
            }

            return true;
        },
        addUsuarioInteresadosClaseNodoConocimiento: async function(_:any, {idNodo, idClase, idUsuario}:any, contexto: contextoQuery){
            let credencialesUsuario = contexto.usuario;
            console.log(`Solicitud de add un usuario a interesados en clase`);
            const permisosEspeciales=["superadministrador", "atlasAdministrador"]

            if (!credencialesUsuario.permisos.some(p=>permisosEspeciales.includes(p)) && credencialesUsuario.id!=idUsuario) {
                console.log(`Error de autenticacion.`);
                throw new AuthenticationError("No autorizado");
            }  

            try {
                var elNodo:any=await Nodo.findById(idNodo).exec();
                if(!elNodo){
                    throw "Nodo no encontrado";
                }
            } catch (error) {
                console.log(`Error buscando el nodo`);
                throw new ApolloError("Error conectando con la base de datos");
            }


            var laClase=elNodo.clases.find(c=>c.id===idClase);
            if(!laClase){
                console.log(`Clase ${idClase} no encontrada`);
                throw new UserInputError("Datos incorrectos");
            }

            if(idUsuario===laClase.idExperto){
                console.log(`El dictador de la clase pretendia participar. Abortando`);
                throw new UserInputError("El usuario que dictará la clase no puede ser un participante");
            }


            var indexU=laClase.interesados.indexOf(idUsuario);
            if (indexU>-1){
                console.log(`El usuario ya estaba en la lista de interesados`);
                laClase.interesados.splice(indexU, 1);
            }

            laClase.interesados.push(idUsuario);
            
            try {
                await elNodo.save();
            } catch (error) {
                console.log(`Error guardando el nodo con interesado nuevo en clase`);
                throw new ApolloError("Error conectando con la base de datos");
            }

            return laClase;
        },
        eliminarUsuarioInteresadosClaseNodoConocimiento: async function(_:any, {idNodo, idClase, idUsuario}:any, contexto: contextoQuery){
            let credencialesUsuario = contexto.usuario;
            console.log(`Solicitud de retirar un usuario de la lista de interesados en clase`);
            const permisosEspeciales=["superadministrador", "atlasAdministrador"]

            if (!credencialesUsuario.permisos.some(p=>permisosEspeciales.includes(p)) && credencialesUsuario.id!=idUsuario) {
                console.log(`Error de autenticacion.`);
                throw new AuthenticationError("No autorizado");
            }  

            try {
                var elNodo:any=await Nodo.findById(idNodo).exec();
                if(!elNodo){
                    throw "Nodo no encontrado";
                }
            } catch (error) {
                console.log(`Error buscando el nodo`);
                throw new ApolloError("Error conectando con la base de datos");
            }

            var laClase=elNodo.clases.find(c=>c.id===idClase);
            if(!laClase){
                console.log(`Clase ${idClase} no encontrada`);
                throw new UserInputError("Datos incorrectos");
            }

            var indexU=laClase.interesados.indexOf(idUsuario);
            if (indexU>-1){
                console.log(`El usuario estaba en la lista de interesados`);
                laClase.interesados.splice(indexU, 1);
            }
            else{
                console.log(`El usuario ${idUsuario} a eliminar no estaba en la lista de interesados de la clase ${idClase}`);
                throw new UserInputError("Datos incorrectos");
            }

            try {
                await elNodo.save();
            } catch (error) {
                console.log(`Error guardando el nodo con interesado nuevo en clase`);
                throw new ApolloError("Error conectando con la base de datos");
            }

            return laClase;
        }
    },

    SeccionContenidoNodo: {
        async archivos(parent: any, _: any, __: any) {
            if (!parent.idCarpeta) {
                console.log(`No habia carpeta`);
                return []
            }

            try {
                var laCarpeta: any = await CarpetasArchivos.findById(parent.idCarpeta, "archivos").exec();
                if (!laCarpeta) throw "Carpeta no existía"
            } catch (error) {
                console.log(`Error buscando carpeta en base de datos. E: ${error}`);
                return []
            }

            const infoArchivos = laCarpeta.archivos.map(a => { return { nombre: a.nombre, primario: a.primario } });
            return infoArchivos
        },
        async tipoPrimario(parent: any, _: any, __: any) {
            if (!parent.idCarpeta) {
                console.log(`No habia carpeta`);
                return null
            }

            try {
                var laCarpeta: any = await CarpetasArchivos.findById(parent.idCarpeta, "archivos").exec();
                if (!laCarpeta) throw "Carpeta no existía";
                var elPrimario = laCarpeta.archivos.find(a => a.primario == true);
                if (!elPrimario) throw "No habia primario"

            } catch (error) {
                console.log(`Error buscando carpeta y primario en base de datos. E: ${error}`);
                return null
            }

            if (!elPrimario.mimetype) {
                console.log(`No habia mimetype`);
                return null
            }

            return elPrimario.mimetype;
        }
    }
};



