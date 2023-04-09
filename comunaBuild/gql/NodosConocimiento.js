import { ModeloNodo as Nodo } from "../model/atlas/Nodo";
import { ModeloUsuario as Usuario } from "../model/Usuario";
import { ModeloCarpetaArchivos as CarpetasArchivos } from "../model/CarpetaArchivos";
import { ModeloEventoPublico as EventoPublico } from "../model/Evento";
import { ejecutarPosicionamientoNodosConocimientoByFuerzas } from "../controlAtlasConocimiento";
import { charProhibidosNombreCosa } from "../model/config";
import { purgarIdNodo } from "./Usuarios";
import { ApolloError, AuthenticationError, UserInputError } from "./misc";
export const idAtlasConocimiento = "61ea0b0f17a5d80da7e94320";
const permisosEspecialesAtlas = ["superadministrador", "atlasAdministrador"];
export const typeDefs = `#graphql
type Vinculo{
    id:ID!,
    tipo: String!,
    idRef: ID!,
    rol: String!,
    nodoContraparte:NodoConocimiento
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
    tipoNodo: String,
    vinculos: [Vinculo],
    porcentajeCompletado: Float,
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
    nivel: Int,
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
    nodosConocimientoByIds(idsNodos: [ID!]!):[NodoConocimiento],
    busquedaAmplia(palabrasBuscadas:String!):[NodoConocimiento],

    idsMisNodosEstudiables:[String],

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
    setTipoNodo(idNodo: ID!, nuevoTipoNodo: String!):NodoConocimiento,

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
export const NODOS_ATLAS_CONOCIMIENTO_POSICIONADOS = "nodos_de_atlas_conocimiento_posicionados";
export const resolvers = {
    Query: {
        busquedaAmplia: async function (_, { palabrasBuscadas }, __) {
            // console.log(`tipo de input: ${typeof (palabrasBuscadas)}`);
            if (palabrasBuscadas.length < 1) {
                console.log(`No habia palabras buscadas`);
            }
            try {
                var opciones = await Nodo.find({ $text: { $search: palabrasBuscadas } }, { score: { $meta: 'textScore' } }).collation({ locale: "en", strength: 1 }).select("nombre descripcion autoCoords").sort({ score: { $meta: 'textScore' } }).limit(10).exec();
            }
            catch (error) {
                console.log(". E: " + error);
                ApolloError("");
            }
            return opciones;
        },
        todosNodos: async function () {
            console.log(`enviando todos los nombres, vinculos y coordenadas`);
            try {
                var todosNodos = await Nodo.find({}).populate("vinculos.nodoContraparte", "nombre autoCoords").exec();
                console.log(`encontrados ${todosNodos.length} nodos`);
            }
            catch (error) {
                console.log(`error fetching todos los nodos. e: ` + error);
                return;
            }
            // console.log(`Primero enviado: ${JSON.stringify(todosNodos[0])}`);
            // console.log(`Enviando: ${todosNodos}`);
            return todosNodos;
        },
        nodo: async function (_, { idNodo }) {
            console.log(`Buscando el nodo con id ${idNodo}`);
            try {
                var elNodo = await Nodo.findById(idNodo).select("-icono").exec();
                if (!elNodo)
                    throw "Nodo no encontrado";
            }
            catch (error) {
                console.log(`error buscando el nodo. e: ` + error);
                ApolloError("Error conectando con la base de datos");
            }
            return elNodo;
        },
        async nodosConocimientoByIds(_, { idsNodos }, contexto) {
            if (!contexto.usuario?.id) {
                AuthenticationError('loginRequerido');
            }
            const credencialesUsuario = contexto.usuario;
            console.log("Getting nodos con ids " + idsNodos);
            try {
                var losNodos = await Nodo.find({ "_id": { $in: idsNodos } }).exec();
            }
            catch (error) {
                console.log(`Error getting nodosConocimiento by ids : ` + error);
                ApolloError('Error conectando con la base de datos');
            }
            console.log(`Retornando ${losNodos.length} nodos`);
            return losNodos;
        },
        async idsMisNodosEstudiables(_, __, contexto) {
            if (!contexto.usuario?.id) {
                AuthenticationError('loginRequerido');
            }
            const credencialesUsuario = contexto.usuario;
            console.log("Getting ids de mis nodos estudiables");
            try {
                var elUsuario = await Usuario.findById(credencialesUsuario.id).exec();
                if (!elUsuario)
                    throw 'Usuario no encontrado';
            }
            catch (error) {
                ApolloError('Error conectando con la base de datos');
            }
            let datosAtlasConocimiento = elUsuario.atlas.datosNodos;
            let datosNodosEstudiados = datosAtlasConocimiento.filter((dato) => dato.estudiado);
            let datosNodosAprendidos = datosAtlasConocimiento.filter((dato) => dato.aprendido);
            datosNodosEstudiados = datosNodosEstudiados.filter((dato) => {
                let dateEstudiado = new Date(dato.estudiado);
                let millisLimite = dateEstudiado.getTime() + dato.periodoRepaso;
                if (millisLimite > new Date().getTime())
                    return true;
            });
            let todosNodosSabidos = [...datosNodosEstudiados, ...datosNodosAprendidos];
            let idsTodosNodosSabidos = todosNodosSabidos.map((dato) => dato.idNodo);
            console.log(`Retornando ${idsTodosNodosSabidos.length} ids de nodos sabidos`);
            try {
                var losNodosSabidos = await Nodo.find({ "_id": { $in: idsTodosNodosSabidos } }).exec();
            }
            catch (error) {
                console.log('Error descargando nodos de la base de datos: ' + error);
                ApolloError('Error conectando con la base de datos');
            }
            ;
            console.log(`Retornando ${losNodosSabidos.length} nodos sabidos`);
            //Get  ids continuaciones. Ellos son los aprendibles
            let vinculosRelevantes = losNodosSabidos.map((nodo) => nodo.vinculos.filter((vinculo) => vinculo.tipo == "continuacion" && vinculo.rol === 'source')).flat();
            let idsNodosContinuacion = vinculosRelevantes.map((vinculo) => vinculo.idRef);
            try {
                var losNodosContinuacion = await Nodo.find({ "_id": { $in: idsNodosContinuacion } }).exec();
            }
            catch (error) {
                console.log('Error descargando nodos de la base de datos: ' + error);
                ApolloError('Error conectando con la base de datos');
            }
            ;
            let nodosAprendibles = losNodosContinuacion.filter((nodo) => {
                let idsDependencias = nodo.vinculos.filter((vinculo) => vinculo.tipo == "continuacion" && vinculo.rol === "target").map((vinculo) => vinculo.idRef);
                if (idsDependencias.every((id) => idsTodosNodosSabidos.includes(id)))
                    return true;
                return false;
            });
            let idsNodosAprendibles = nodosAprendibles.map((nodo) => nodo.id);
            return idsNodosAprendibles;
        }
    },
    Mutation: {
        async posicionarNodosConocimientoByFuerzas(_, { ciclos }, contexto) {
            console.log(`Peticion de ejecutar un posicionamiento de nodos de conocimiento by fuerzas de ${ciclos} ciclos`);
            ejecutarPosicionamientoNodosConocimientoByFuerzas(ciclos, Date.now(), true);
            console.log(`Terminado`);
            return true;
        },
        async eliminarNodo(_, { idNodo }, contexto) {
            console.log(`peticion de eliminar nodo con id ${idNodo}`);
            let credencialesUsuario = contexto.usuario;
            let permisosValidos = ["atlasAdministrador", "administrador", "superadministrador"];
            if (!credencialesUsuario.permisos.some(p => permisosValidos.includes(p))) {
                console.log(`El usuario no tenia permisos para efectuar esta operación`);
                AuthenticationError("No autorizado");
            }
            try {
                var elNodo = await Nodo.findById(idNodo);
                if (!elNodo)
                    throw "Nodo a eliminar no encontrado";
            }
            catch (error) {
                ApolloError("Error buscando el nodo a eliminar");
            }
            try {
                await Nodo.deleteOne({ _id: idNodo }).exec();
            }
            catch (error) {
                console.log(`error eliminando nodo`);
            }
            purgarIdNodo(idNodo);
            console.log(`nodo ${idNodo} eliminado`);
            //Eliminar vinculos que lo tuvieran en idRef.
            return idNodo;
        },
        async crearNodo(_, { infoNodo }, contexto) {
            let credencialesUsuario = contexto.usuario;
            let permisosEspeciales = ["atlasAdministrador", "administrador", "superadministrador"];
            ;
            if (!credencialesUsuario.permisos.some(p => permisosEspeciales.includes(p))) {
                console.log(`Error de autenticacion`);
                AuthenticationError("No autorizado");
            }
            console.log(`Creando nuevo nodo de conocimiento`);
            try {
                var nuevoNodo = new Nodo({
                    ...infoNodo,
                    expertos: [credencialesUsuario.id]
                });
                await nuevoNodo.save();
            }
            catch (error) {
                console.log(`error guardando el nuevo nodo en la base de datos. E: ${error}`);
                ApolloError("Error guardando en base de datos");
            }
            console.log(`nuevo nodo de conocimiento creado: ${nuevoNodo} `);
            return nuevoNodo;
        },
        setCoordsManuales: async function (_, { idNodo, coordsManuales }, contexto) {
            console.log(`peticion de movimiento de coords manuales`);
            let credencialesUsuario = contexto.usuario;
            let permisosValidos = ["atlasAdministrador", "administrador", "superadministrador"];
            if (!credencialesUsuario.permisos.some(p => permisosValidos.includes(p))) {
                console.log(`El usuario no tenia permisos para efectuar esta operación`);
                AuthenticationError("No autorizado");
            }
            let modificados = new Array();
            try {
                var elNodo = await Nodo.findById(idNodo, "nombre coordsManuales").exec();
            }
            catch (error) {
                console.log(`error buscando el nodo. E: ` + error);
            }
            elNodo.coords = coordsManuales;
            try {
                console.log(`guardando coords de ${elNodo.nombre} en la base de datos`);
                await elNodo.save();
            }
            catch (error) {
                console.log(`error guardando el nodo con coordenadas manuales: ${error}`);
            }
            modificados.push(elNodo);
            return { modificados };
        },
        crearVinculo: async function (_, { idSource, idTarget }, contexto) {
            let modificados = [];
            console.log(`recibida una peticion de vincular nodos  ${idSource} y ${idTarget}`);
            let credencialesUsuario = contexto.usuario;
            let permisosValidos = ["atlasAdministrador", "administrador", "superadministrador"];
            if (idSource == idTarget)
                UserInputError('No se puede vincular un nodo consigo mismo');
            if (!credencialesUsuario.permisos.some(p => permisosValidos.includes(p))) {
                console.log(`El usuario no tenia permisos para efectuar esta operación`);
                AuthenticationError("No autorizado");
            }
            try {
                var nodoSource = await Nodo.findById(idSource, "vinculos nombre").exec();
                var nodoTarget = await Nodo.findById(idTarget, "vinculos nombre").exec();
            }
            catch (error) {
                console.log(`error consiguiendo los nodos para crear el vínculo . e: ` + error);
            }
            //Prevenir loop.
            let idsRedPrevia = await getIdsRedRequerimentosNodo(nodoSource);
            if (idsRedPrevia.includes(nodoTarget.id)) {
                UserInputError('Una vinculación entre estos nodos produce loop');
            }
            console.log(`Los ids previos de la red son: ${idsRedPrevia}`);
            //Buscar y eliminar vinculos previos entre estos dos nodos.
            for (var vinculo of nodoSource.vinculos) {
                if (vinculo.idRef == idTarget) {
                    vinculo.remove();
                    console.log(`encontrado un vinculo viejo en el Source. Eliminando`);
                }
            }
            for (var vinculo of nodoTarget.vinculos) {
                if (vinculo.idRef == idSource) {
                    vinculo.remove();
                    console.log(`encontrado un vinculo viejo en el target. Eliminando`);
                }
            }
            const vinculoSourceTarget = {
                idRef: idTarget,
                rol: "source"
            };
            const vinculoTargetSource = {
                idRef: idSource,
                rol: "target"
            };
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
            console.log(`vinculo entre ${idSource} y ${idTarget} creado`);
            return { modificados };
        },
        eliminarVinculoFromTo: async function (_, args, contexto) {
            let modificados = [];
            console.log(`desvinculando ${args.idSource} de ${args.idTarget}`);
            let credencialesUsuario = contexto.usuario;
            let permisosValidos = ["atlasAdministrador", "administrador", "superadministrador"];
            if (!credencialesUsuario.permisos.some(p => permisosValidos.includes(p))) {
                console.log(`El usuario no tenia permisos para efectuar esta operación`);
                AuthenticationError("No autorizado");
            }
            try {
                var elUno = await Nodo.findById(args.idSource, "nombre vinculos").exec();
                var elOtro = await Nodo.findById(args.idTarget, "nombre vinculos").exec();
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
        editarNombreNodo: async function (_, { idNodo, nuevoNombre }, contexto) {
            let modificados = [];
            try {
                var elNodo = await Nodo.findById(idNodo, "nombre expertos coordsManuales").exec();
            }
            catch (error) {
                console.log(`error buscando el nodo. E: ` + error);
            }
            let credencialesUsuario = contexto.usuario;
            let permisosEspeciales = ["atlasAdministrador", "administrador", "superadministrador"];
            if (!elNodo.expertos.includes(credencialesUsuario.id) && !credencialesUsuario.permisos.some(p => permisosEspeciales.includes(p))) {
                console.log(`El usuario no tenia permisos para efectuar esta operación`);
                AuthenticationError("No autorizado");
            }
            nuevoNombre = nuevoNombre.trim();
            const charProhibidosNombreNodo = /[^ a-zA-ZÀ-ž0-9_():.,-]/;
            if (charProhibidosNombreNodo.test(nuevoNombre)) {
                ApolloError("Nombre ilegal");
            }
            elNodo.nombre = nuevoNombre;
            try {
                console.log(`guardando nuevo nombre ${elNodo.nombre} en la base de datos`);
                await elNodo.save();
            }
            catch (error) {
                console.log(`error guardando el nodo con coordenadas manuales: ${error}`);
            }
            modificados.push(elNodo);
            return { modificados };
        },
        editarDescripcionNodoConocimiento: async function (_, { idNodo, nuevoDescripcion }, contexto) {
            console.log(`|||||||||||||||||||`);
            console.log(`Solicitud de set descripcion del nodo con id ${idNodo}`);
            try {
                var elNodo = await Nodo.findById(idNodo).exec();
                if (!elNodo) {
                    throw "nodo no encontrado";
                }
            }
            catch (error) {
                console.log(`error buscando el nodo. E: ` + error);
                ApolloError("Error conectando con la base de datos");
            }
            let credencialesUsuario = contexto.usuario;
            let permisosEspeciales = ["atlasAdministrador", "administrador", "superadministrador"];
            if (!elNodo.expertos.includes(credencialesUsuario.id) && !credencialesUsuario.permisos.some(p => permisosEspeciales.includes(p))) {
                console.log(`El usuario no tenia permisos para efectuar esta operación`);
                AuthenticationError("No autorizado");
            }
            const charProhibidosDescripcionNodo = /[^\n\r a-zA-ZÀ-ž0-9_():;.,+¡!¿?"@=-]/;
            if (charProhibidosDescripcionNodo.test(nuevoDescripcion)) {
                ApolloError("Descripcion ilegal");
            }
            nuevoDescripcion = nuevoDescripcion.trim();
            try {
                console.log(`guardando nuevo descripcion ${nuevoDescripcion} en la base de datos`);
                var resNodo = await Nodo.findByIdAndUpdate(idNodo, { descripcion: nuevoDescripcion }, { new: true }).exec();
            }
            catch (error) {
                console.log(`error guardando el nodo: ${error}`);
            }
            console.log(`Descripcion guardado`);
            return resNodo;
        },
        editarKeywordsNodoConocimiento: async function (_, { idNodo, nuevoKeywords }, contexto) {
            console.log(`|||||||||||||||||||`);
            console.log(`Solicitud de set keywords del nodo con id ${idNodo}`);
            try {
                var elNodo = await Nodo.findById(idNodo).exec();
                if (!elNodo) {
                    throw "nodo no encontrado";
                }
            }
            catch (error) {
                console.log(`error buscando el nodo. E: ` + error);
                ApolloError("Error conectando con la base de datos");
            }
            let credencialesUsuario = contexto.usuario;
            let permisosEspeciales = ["atlasAdministrador", "administrador", "superadministrador"];
            if (!elNodo.expertos.includes(credencialesUsuario.id) && !credencialesUsuario.permisos.some(p => permisosEspeciales.includes(p))) {
                console.log(`El usuario no tenia permisos para efectuar esta operación`);
                AuthenticationError("No autorizado");
            }
            const charProhibidosKeywordsNodo = /[^ a-zA-Z0-9]/;
            if (charProhibidosKeywordsNodo.test(nuevoKeywords)) {
                ApolloError("Keywords ilegal");
            }
            nuevoKeywords = nuevoKeywords.trim();
            try {
                console.log(`guardando nuevo keywords ${nuevoKeywords} en la base de datos`);
                var resNodo = await Nodo.findByIdAndUpdate(idNodo, { keywords: nuevoKeywords }, { new: true }).exec();
            }
            catch (error) {
                console.log(`error guardando el nodo: ${error}`);
            }
            console.log(`Keywords guardado`);
            return resNodo;
        },
        addExpertoNodo: async function (_, { idNodo, idUsuario }, contexto) {
            console.log('\x1b[35m%s\x1b[0m', `Solicitud de add un usuario con id ${idUsuario} como experto a un nodo con id ${idNodo}`);
            if (!contexto.usuario) {
                AuthenticationError("Login requerido");
            }
            const credencialesUsuario = contexto.usuario;
            try {
                var elNodo = await Nodo.findById(idNodo).exec();
                if (!elNodo) {
                    throw "nodo no encontrado";
                }
            }
            catch (error) {
                console.log("Error buscando el nodo en la base de datos. E: " + error);
                ApolloError("Error de conexión con la base de datos");
            }
            //Authorización
            const permisosEspeciales = ["superadministrador", "atlasAdministrador"];
            const usuarioExperto = elNodo.expertos.includes(credencialesUsuario.id);
            if (idUsuario != credencialesUsuario.id && !usuarioExperto && !permisosEspeciales.some(p => credencialesUsuario.permisos.includes(p)) && !elNodo.expertos.includes(credencialesUsuario.id)) {
                console.log(`Error de autenticacion.`);
                AuthenticationError("No autorizado");
            }
            try {
                var elUsuario = await Usuario.findById(idUsuario).exec();
                if (!elUsuario) {
                    console.log(`No se pudo encontrar al usuario con id ${idUsuario} en la base de datos`);
                    ApolloError("Error buscando al usuario en la base de datos");
                }
            }
            catch (error) {
                console.log("Error buscando al usuario en la base de datos. E: " + error);
                ApolloError("Error conectando con la base de datos");
            }
            if (elNodo.expertos.includes(idUsuario)) {
                console.log(`El usuario ya era experto de este nodo`);
                ApolloError("El usuario ya estaba incluido");
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
                UserInputError("El usuario no podía ser added to expertos");
            }
            try {
                await elNodo.save();
            }
            catch (error) {
                console.log("Error guardando datos en la base de datos. E: " + error);
                ApolloError("Error conectando con la base de datos");
            }
            console.log(`Nodo guardado`);
            return elNodo;
        },
        addPosibleExpertoNodo: async function (_, { idNodo, idUsuario }, contexto) {
            console.log(`añadiendo usuario ${idUsuario} a la lista de posibles expertos del nodo ${idNodo}`);
            let credencialesUsuario = contexto.usuario;
            try {
                var elNodo = await Nodo.findById(idNodo).exec();
                if (!elNodo) {
                    throw "nodo no encontrado";
                }
            }
            catch (error) {
                console.log("Error buscando el nodo en la base de datos. E: " + error);
                ApolloError("Error de conexión con la base de datos");
            }
            //Authorización
            if (idUsuario != credencialesUsuario.id && !credencialesUsuario.permisos.includes("superadministrador") && !credencialesUsuario.permisos.includes("atlasAdministrador")) {
                console.log(`Error de autenticacion añadiendo posible experto del nodo`);
                AuthenticationError("No autorizado");
            }
            if (elNodo.posiblesExpertos.includes(idUsuario) || elNodo.expertos.includes(idUsuario)) {
                console.log(`el usuario ya estaba en la lista`);
                ApolloError("El usuario ya estaba en la lista");
            }
            try {
                var elUsuario = await Usuario.findById(idUsuario).exec();
                if (!elUsuario) {
                    console.log(`No se pudo encontrar al usuario con id ${idUsuario} en la base de datos`);
                    ApolloError("Error buscando al usuario en la base de datos");
                }
            }
            catch (error) {
                console.log("Error buscando al usuario en la base de datos. E: " + error);
                ApolloError("Error conectando con la base de datos");
            }
            try {
                elNodo.posiblesExpertos.push(idUsuario);
                await elNodo.save();
            }
            catch (error) {
                console.log("Error guardando datos en la base de datos. E: " + error);
                ApolloError("Error conectando con la base de datos");
            }
            console.log(`Nodo guardado`);
            return elNodo;
        },
        removeExpertoNodo: async function (_, { idNodo, idUsuario }, contexto) {
            console.log('\x1b[35m%s\x1b[0m', `Solicitud de remover un usuario con id ${idUsuario} de la lista de expertos de un nodo con id ${idNodo}`);
            if (!contexto.usuario || !contexto.usuario.id) {
                console.log(`Usuario no logeado`);
                AuthenticationError("Login requerido");
            }
            const credencialesUsuario = contexto.usuario;
            try {
                var elNodo = await Nodo.findById(idNodo).exec();
                if (!elNodo) {
                    throw "nodo no encontrado";
                }
            }
            catch (error) {
                console.log("Error buscando el nodo en la base de datos. E: " + error);
                ApolloError("Error de conexión con la base de datos");
            }
            //Authorización
            if (idUsuario != credencialesUsuario.id && !credencialesUsuario.permisos.includes("superadministrador") && !credencialesUsuario.permisos.includes("atlasAdministrador")) {
                console.log(`Error de autenticacion removiendo experto o posible experto de nodo`);
                AuthenticationError("No autorizado");
            }
            try {
                var elUsuario = await Usuario.findById(idUsuario).exec();
                if (!elUsuario) {
                    console.log(`No se pudo encontrar al usuario con id ${idUsuario} en la base de datos`);
                    ApolloError("Error buscando al usuario en la base de datos");
                }
            }
            catch (error) {
                console.log("Error buscando al usuario en la base de datos. E: " + error);
                ApolloError("Error conectando con la base de datos");
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
                ApolloError("Error conectando con la base de datos");
            }
            console.log(`Nodo guardado`);
            return elNodo;
        },
        setTipoNodo: async function (_, { idNodo, nuevoTipoNodo }, contexto) {
            if (!contexto.usuario?.id) {
                AuthenticationError('loginRequerido');
            }
            const credencialesUsuario = contexto.usuario;
            try {
                var elNodo = await Nodo.findById(idNodo).exec();
                if (!elNodo)
                    throw 'Nodo no encontrado';
            }
            catch (error) {
                console.log('Error descargando el nodo de la base de datos: ' + error);
                ApolloError('Error conectando con la base de datos');
            }
            ;
            const esExperto = elNodo.expertos.includes(credencialesUsuario.id);
            const tienePermisosEspeciales = permisosEspecialesAtlas.some(p => credencialesUsuario.permisos.includes(p));
            if (!esExperto && !tienePermisosEspeciales) {
                AuthenticationError("No autorizado");
            }
            elNodo.tipoNodo = nuevoTipoNodo;
            try {
                await elNodo.save();
            }
            catch (error) {
                console.log(`Error guardando el nodo: ${error}`);
                ApolloError(`Error conectando con la base de datos`);
            }
            return elNodo;
        },
        eliminarArchivoSeccionNodo: async function (_, { idNodo, idSeccion, nombreArchivo }, contexto) {
            console.log(`Solicitud de eliminar archivo ${nombreArchivo}`);
            try {
                var elNodo = await Nodo.findById(idNodo).exec();
                if (!elNodo) {
                    throw "nodo no encontrado";
                }
            }
            catch (error) {
                console.log(`error buscando el nodo. E: ` + error);
                ApolloError("Error conectando con la base de datos");
            }
            let credencialesUsuario = contexto.usuario;
            let permisosEspeciales = ["atlasAdministrador", "superadministrador"];
            if (!elNodo.expertos.includes(credencialesUsuario.id) && !credencialesUsuario.permisos.some(p => permisosEspeciales.includes(p))) {
                console.log(`El usuario no tenia permisos para efectuar esta operación`);
                AuthenticationError("No autorizado");
            }
            var laSeccion = elNodo.secciones.id(idSeccion);
            if (!laSeccion) {
                console.log(`Sección no encontrada`);
                ApolloError("Error conectando con la base de datos");
            }
            if (!laSeccion.idCarpeta) {
                console.log(`Carpeta no especificada`);
                ApolloError("Informacion de la seccion inesperada");
            }
            try {
                var laCarpeta = await CarpetasArchivos.findById(laSeccion.idCarpeta).exec();
                if (!laCarpeta)
                    throw "Carpeta no encontrada";
            }
            catch (error) {
                console.log(`Error buscando la carpeta de la seccion`);
                ApolloError("Error conectando con la base de datos");
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
                ApolloError("Error conectando con la base de datos");
            }
            try {
                console.log(`guardando la carpeta: ${laCarpeta}`);
                await laCarpeta.save();
            }
            catch (error) {
                console.log(`Error guardando carpeta. E: ${error}`);
                ApolloError("Error conectando con la base de datos");
            }
            console.log(`Archivo eliminado`);
            return true;
        },
        marcarPrimarioArchivoSeccionNodo: async function (_, { idNodo, idSeccion, nombreArchivo }, contexto) {
            try {
                var elNodo = await Nodo.findById(idNodo).exec();
                if (!elNodo) {
                    throw "nodo no encontrado";
                }
            }
            catch (error) {
                console.log(`error buscando el nodo. E: ` + error);
                ApolloError("Error conectando con la base de datos");
            }
            const credencialesUsuario = contexto.usuario;
            const permisosEspeciales = ["atlasAdministrador", "superadministrador"];
            if (!elNodo.expertos.includes(credencialesUsuario.id) && !credencialesUsuario.permisos.some(p => permisosEspeciales.includes(p))) {
                console.log(`El usuario no tenia permisos para efectuar esta operación`);
                AuthenticationError("No autorizado");
            }
            var laSeccion = elNodo.secciones.id(idSeccion);
            if (!laSeccion) {
                console.log(`Sección no encontrada`);
                ApolloError("Error conectando con la base de datos");
            }
            if (!laSeccion.idCarpeta) {
                console.log(`Carpeta no especificada`);
                ApolloError("Informacion de la seccion inesperada");
            }
            laSeccion.modo = "archivo";
            try {
                var laCarpeta = await CarpetasArchivos.findById(laSeccion.idCarpeta).exec();
                if (!laCarpeta)
                    throw "Carpeta no encontrada";
            }
            catch (error) {
                console.log(`Error buscando la carpeta de la seccion`);
                ApolloError("Error conectando con la base de datos");
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
                await laCarpeta.save();
            }
            catch (error) {
                console.log(`Error guardando carpeta. E: ${error}`);
                ApolloError("Error conectando con la base de datos");
            }
            try {
                await elNodo.save();
            }
            catch (error) {
                console.log(`Error guardando nodo. E: ${error}`);
                ApolloError("Error conectando con la base de datos");
            }
            console.log(`Archivo seteado`);
            return encontrado;
        },
        crearNuevaSeccionNodoConocimiento: async function (_, { idNodo }, contexto) {
            if (!contexto.usuario) {
                AuthenticationError("Login requerido");
            }
            let credencialesUsuario = contexto.usuario;
            try {
                var elNodo = await Nodo.findById(idNodo).exec();
                if (!elNodo) {
                    throw "Nodo no encontrado";
                }
            }
            catch (error) {
                console.log(`Error buscando el nodo`);
                ApolloError("Error conectando con la base de datos");
            }
            //Authorización
            const permisosEspeciales = ["superadministrador, atlasAdministrador"];
            if (!credencialesUsuario.permisos.some(p => permisosEspeciales.includes(p)) && !elNodo.expertos.includes(credencialesUsuario.id)) {
                console.log(`Error de autenticacion. Solo lo puede realizar un superadministrador o un atlasAdministrador o un experto`);
                AuthenticationError("No autorizado");
            }
            var nuevaSeccion = elNodo.secciones.create({});
            elNodo.secciones.push(nuevaSeccion);
            try {
                await elNodo.save();
            }
            catch (error) {
                console.log(`Error guardando el nodo`);
                ApolloError("Error conectando con la base de datos");
            }
            return nuevaSeccion;
        },
        eliminarSeccionNodoConocimiento: async function (_, { idNodo, idSeccion }, contexto) {
            let credencialesUsuario = contexto.usuario;
            try {
                var elNodo = await Nodo.findById(idNodo).exec();
                if (!elNodo) {
                    throw "Nodo no encontrado";
                }
            }
            catch (error) {
                console.log(`Error buscando el nodo`);
                ApolloError("Error conectando con la base de datos");
            }
            //Authorización
            if (!credencialesUsuario.permisos.includes("superadministrador") && !credencialesUsuario.permisos.includes("atlasAdministrador") && !elNodo.expertos.includes(credencialesUsuario.id)) {
                console.log(`Error de autenticacion. Solo lo puede realizar un superadministrador o un atlasAdministrador`);
                AuthenticationError("No autorizado");
            }
            var laSeccion = elNodo.secciones.id(idSeccion);
            if (!laSeccion) {
                ApolloError("Sección no encontrada");
            }
            const idCarpeta = laSeccion.idCarpeta;
            if (idCarpeta) {
                try {
                    await CarpetasArchivos.findByIdAndDelete(idCarpeta).exec();
                    console.log(`Carpeta eliminada`);
                }
                catch (error) {
                    console.log(`Error eliminando la carpeta con id: ${idCarpeta}. E: ${error}`);
                }
            }
            try {
                await Nodo.findByIdAndUpdate(idNodo, { $pull: { secciones: { _id: idSeccion } } });
            }
            catch (error) {
                console.log(`Error pulling la seccion`);
                ApolloError("Error conectando con la base de datos");
            }
            return true;
        },
        moverSeccionNodoConocimiento: async function (_, { idNodo, idSeccion, movimiento }, contexto) {
            let credencialesUsuario = contexto.usuario;
            console.log(`Peticion de mover una sección ${movimiento}`);
            try {
                var elNodo = await Nodo.findById(idNodo).exec();
                if (!elNodo) {
                    throw "Nodo no encontrado";
                }
            }
            catch (error) {
                console.log(`Error buscando el nodo`);
                ApolloError("Error conectando con la base de datos");
            }
            const usuarioExperto = elNodo.expertos.includes(credencialesUsuario.id);
            //Authorización
            const permisosEspeciales = ["superadministrador", "atlasAdministrador"];
            if (!credencialesUsuario.permisos.some(p => permisosEspeciales.includes(p)) && !usuarioExperto) {
                console.log(`Error de autenticacion. Solo lo puede realizar un experto, superadministrador o un atlasAdministrador`);
                AuthenticationError("No autorizado");
            }
            var laSeccion = elNodo.secciones.id(idSeccion);
            if (!laSeccion) {
                ApolloError("Sección no encontrada");
            }
            console.log(`Secciones estaba: ${elNodo.secciones.map(s => s.nombre)}`);
            const indexS = elNodo.secciones.findIndex(s => s.id == idSeccion);
            if (indexS > -1) {
                const nuevoIndexS = indexS + movimiento;
                if (nuevoIndexS < 0 || nuevoIndexS >= elNodo.secciones.length) {
                    ApolloError("Movimiento ilegal");
                }
                elNodo.secciones.splice(nuevoIndexS, 0, elNodo.secciones.splice(indexS, 1)[0]);
            }
            else {
                ApolloError("Error buscando la sección en la base de datos");
            }
            console.log(`Secciones quedó: ${elNodo.secciones.map(s => s.nombre)}`);
            try {
                await elNodo.save();
            }
            catch (error) {
                console.log(`Error pulling la seccion`);
                ApolloError("Error conectando con la base de datos");
            }
            return true;
        },
        async editarNombreSeccionNodoConocimiento(_, { idNodo, idSeccion, nuevoNombre }, contexto) {
            console.log(`cambiando el nombre del seccion con id ${idSeccion} del nodoConocimiento con id ${idNodo}`);
            try {
                var elNodo = await Nodo.findById(idNodo).exec();
                if (!elNodo) {
                    throw "nodoConocimiento no encontrado";
                }
            }
            catch (error) {
                console.log("Error buscando el nodoConocimiento. E: " + error);
                ApolloError("Erro en la conexión con la base de datos");
            }
            //Authorización
            const permisosEspeciales = ["superadministrador", "atlasAdministrador"];
            const credencialesUsuario = contexto.usuario;
            if (!elNodo.expertos.includes(credencialesUsuario.id) && !credencialesUsuario.permisos.some(p => permisosEspeciales.includes(p))) {
                console.log(`Error de autenticacion editando artículo de seccion de nodoConocimiento`);
                AuthenticationError("No autorizado");
            }
            nuevoNombre = nuevoNombre.replace(/\s\s+/g, " ");
            if (charProhibidosNombreCosa.test(nuevoNombre)) {
                ApolloError("Nombre ilegal");
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
                ApolloError("Error guardando el artículo en la base de datos");
            }
            try {
                await elNodo.save();
            }
            catch (error) {
                console.log("Error guardando el seccion creado en el nodoConocimiento. E: " + error);
                ApolloError("Error introduciendo el seccion en el nodoConocimiento");
            }
            console.log(`Nombre de sección cambiado`);
            return laSeccion;
        },
        async setNuevoEnlaceSeccionNodo(_, { idNodo, idSeccion, nuevoEnlace }, contexto) {
            console.log(`cambiando el enlace de seccion con id ${idSeccion} del nodoConocimiento con id ${idNodo}`);
            try {
                var elNodo = await Nodo.findById(idNodo).exec();
                if (!elNodo) {
                    throw "nodoConocimiento no encontrado";
                }
            }
            catch (error) {
                console.log("Error buscando el nodoConocimiento. E: " + error);
                ApolloError("Erro en la conexión con la base de datos");
            }
            //Authorización
            const permisosEspeciales = ["superadministrador", "atlasAdministrador"];
            const credencialesUsuario = contexto.usuario;
            if (!elNodo.expertos.includes(credencialesUsuario.id) && !credencialesUsuario.permisos.some(p => permisosEspeciales.includes(p))) {
                console.log(`Error de autenticacion editando artículo de seccion de nodoConocimiento`);
                AuthenticationError("No autorizado");
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
                ApolloError("Error guardando el artículo en la base de datos");
            }
            try {
                await elNodo.save();
            }
            catch (error) {
                console.log("Error guardando el seccion creado en el nodoConocimiento. E: " + error);
                ApolloError("Error introduciendo el seccion en el nodoConocimiento");
            }
            console.log(`Enlace cambiado`);
            return laSeccion;
        },
        crearClaseNodoConocimiento: async function (_, { idNodo, idExperto }, contexto) {
            let credencialesUsuario = contexto.usuario;
            console.log(`Peticion de crear una clase en el nodo ${idNodo}`);
            try {
                var elNodo = await Nodo.findById(idNodo).exec();
                if (!elNodo) {
                    throw "Nodo no encontrado";
                }
            }
            catch (error) {
                console.log(`Error buscando el nodo`);
                ApolloError("Error conectando con la base de datos");
            }
            const usuarioExperto = elNodo.expertos.includes(credencialesUsuario.id);
            //Authorización
            const permisosEspeciales = ["superadministrador", "atlasAdministrador"];
            if (!credencialesUsuario.permisos.some(p => permisosEspeciales.includes(p)) && !usuarioExperto) {
                console.log(`Error de autenticacion. Solo lo puede realizar un experto, superadministrador o un atlasAdministrador`);
                AuthenticationError("No autorizado");
            }
            var nuevaClase = elNodo.clases.create({
                nombre: "Clase de " + elNodo.nombre,
                idExperto,
            });
            elNodo.clases.push(nuevaClase);
            try {
                await elNodo.save();
            }
            catch (error) {
                console.log(`Error guardando el nodo con la nueva clase`);
                ApolloError("Error conectando con la base de datos");
            }
            return nuevaClase;
        },
        eliminarClaseNodoConocimiento: async function (_, { idNodo, idClase }, contexto) {
            let credencialesUsuario = contexto.usuario;
            console.log(`Peticion de eliminar una clase en el nodo ${idNodo}`);
            try {
                var elNodo = await Nodo.findById(idNodo).exec();
                if (!elNodo) {
                    throw "Nodo no encontrado";
                }
            }
            catch (error) {
                console.log(`Error buscando el nodo`);
                ApolloError("Error conectando con la base de datos");
            }
            const usuarioExperto = elNodo.expertos.includes(credencialesUsuario.id);
            //Authorización
            const permisosEspeciales = ["superadministrador", "atlasAdministrador"];
            if (!credencialesUsuario.permisos.some(p => permisosEspeciales.includes(p)) && !usuarioExperto) {
                console.log(`Error de autenticacion. Solo lo puede realizar un experto, superadministrador o un atlasAdministrador`);
                AuthenticationError("No autorizado");
            }
            var indexClase = elNodo.clases.findIndex(c => c.id === idClase);
            if (indexClase > -1) {
                elNodo.clases.splice(indexClase, 1);
            }
            else {
                console.log(`Error: No existía la clase ${idClase} en el nodo ${idNodo}`);
                UserInputError("La clase no existía en este nodo");
            }
            //Eliminar los eventos de esta clase
            console.log(`Eliminando eventos con idOrigen: ${idClase}`);
            try {
                await EventoPublico.deleteMany({ idOrigen: idClase }).exec();
            }
            catch (error) {
                console.log(`Error buscando eventos publicos con idOrigen: ${idClase} para eliminarlos`);
            }
            try {
                await elNodo.save();
            }
            catch (error) {
                console.log(`Error guardando el nodo con la nueva clase`);
                ApolloError("Error conectando con la base de datos");
            }
            return true;
        },
        addUsuarioInteresadosClaseNodoConocimiento: async function (_, { idNodo, idClase, idUsuario }, contexto) {
            let credencialesUsuario = contexto.usuario;
            console.log(`Solicitud de add un usuario a interesados en clase`);
            const permisosEspeciales = ["superadministrador", "atlasAdministrador"];
            if (!credencialesUsuario.permisos.some(p => permisosEspeciales.includes(p)) && credencialesUsuario.id != idUsuario) {
                console.log(`Error de autenticacion.`);
                AuthenticationError("No autorizado");
            }
            try {
                var elNodo = await Nodo.findById(idNodo).exec();
                if (!elNodo) {
                    throw "Nodo no encontrado";
                }
            }
            catch (error) {
                console.log(`Error buscando el nodo`);
                ApolloError("Error conectando con la base de datos");
            }
            var laClase = elNodo.clases.find(c => c.id === idClase);
            if (!laClase) {
                console.log(`Clase ${idClase} no encontrada`);
                UserInputError("Datos incorrectos");
            }
            if (idUsuario === laClase.idExperto) {
                console.log(`El dictador de la clase pretendia participar. Abortando`);
                UserInputError("El usuario que dictará la clase no puede ser un participante");
            }
            var indexU = laClase.interesados.indexOf(idUsuario);
            if (indexU > -1) {
                console.log(`El usuario ya estaba en la lista de interesados`);
                laClase.interesados.splice(indexU, 1);
            }
            laClase.interesados.push(idUsuario);
            try {
                await elNodo.save();
            }
            catch (error) {
                console.log(`Error guardando el nodo con interesado nuevo en clase`);
                ApolloError("Error conectando con la base de datos");
            }
            return laClase;
        },
        eliminarUsuarioInteresadosClaseNodoConocimiento: async function (_, { idNodo, idClase, idUsuario }, contexto) {
            let credencialesUsuario = contexto.usuario;
            console.log(`Solicitud de retirar un usuario de la lista de interesados en clase`);
            const permisosEspeciales = ["superadministrador", "atlasAdministrador"];
            if (!credencialesUsuario.permisos.some(p => permisosEspeciales.includes(p)) && credencialesUsuario.id != idUsuario) {
                console.log(`Error de autenticacion.`);
                AuthenticationError("No autorizado");
            }
            try {
                var elNodo = await Nodo.findById(idNodo).exec();
                if (!elNodo) {
                    throw "Nodo no encontrado";
                }
            }
            catch (error) {
                console.log(`Error buscando el nodo`);
                ApolloError("Error conectando con la base de datos");
            }
            var laClase = elNodo.clases.find(c => c.id === idClase);
            if (!laClase) {
                console.log(`Clase ${idClase} no encontrada`);
                UserInputError("Datos incorrectos");
            }
            var indexU = laClase.interesados.indexOf(idUsuario);
            if (indexU > -1) {
                console.log(`El usuario estaba en la lista de interesados`);
                laClase.interesados.splice(indexU, 1);
            }
            else {
                console.log(`El usuario ${idUsuario} a eliminar no estaba en la lista de interesados de la clase ${idClase}`);
                UserInputError("Datos incorrectos");
            }
            try {
                await elNodo.save();
            }
            catch (error) {
                console.log(`Error guardando el nodo con interesado nuevo en clase`);
                ApolloError("Error conectando con la base de datos");
            }
            return laClase;
        }
    },
    SeccionContenidoNodo: {
        async archivos(parent, _, __) {
            if (!parent.idCarpeta) {
                console.log(`No habia carpeta`);
                return [];
            }
            try {
                var laCarpeta = await CarpetasArchivos.findById(parent.idCarpeta, "archivos").exec();
                if (!laCarpeta)
                    throw "Carpeta no existía";
            }
            catch (error) {
                console.log(`Error buscando carpeta en base de datos. E: ${error}`);
                return [];
            }
            const infoArchivos = laCarpeta.archivos.map(a => { return { nombre: a.nombre, primario: a.primario }; });
            return infoArchivos;
        },
        async tipoPrimario(parent, _, __) {
            if (!parent.idCarpeta) {
                console.log(`No habia carpeta`);
                return null;
            }
            try {
                var laCarpeta = await CarpetasArchivos.findById(parent.idCarpeta, "archivos").exec();
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
        }
    },
    NodoConocimiento: {
        async porcentajeCompletado(parent, {}, contexto) {
            if (!contexto.usuario?.id) {
                AuthenticationError('loginRequerido');
            }
            const credencialesUsuario = contexto.usuario;
            try {
                var elUsuario = await Usuario.findById(credencialesUsuario.id).exec();
                if (!elUsuario)
                    throw 'Usuario no encontrado';
            }
            catch (error) {
                ApolloError('Error conectando con la base de datos');
            }
            let datosNodos = elUsuario.atlas.datosNodos;
            //Descargar progresivamente la red previa.
            let vinculos = parent.vinculos.filter(v => v.tipo === 'continuacion' && v.rol === 'target');
            let idsActuales = vinculos.map(v => v.idRef);
            let nodosActuales = [];
            let nodosRed = [parent];
            let guarda = 0;
            while (guarda < 100 && idsActuales.length > 0) {
                try {
                    nodosActuales = await Nodo.find({ "_id": { $in: idsActuales } }).exec();
                }
                catch (error) {
                    console.log(`Error getting nodos actuales : ` + error);
                    ApolloError('Error conectando con la base de datos');
                }
                let nodosNuevos = nodosActuales.filter(n => !nodosRed.some(nr => nr.id === n.id));
                nodosRed.push(...nodosNuevos);
                idsActuales = nodosNuevos.reduce((acc, n) => {
                    let vinculosPrevios = n.vinculos.filter(v => v.tipo === 'continuacion' && v.rol === 'target');
                    let idsPrevios = vinculosPrevios.map(v => v.idRef);
                    let idsNuevos = idsPrevios.filter(id => !acc.includes(id));
                    return acc.concat(idsNuevos);
                }, []);
                guarda++;
            }
            let nodosRedAprendidos = nodosRed.filter(n => datosNodos.some(dn => dn.idNodo === n.id && dn.aprendido));
            let porcentajeCompletado = (100 / nodosRed.length) * nodosRedAprendidos.length;
            return porcentajeCompletado;
        },
    }
};
export async function getIdsRedRequerimentosNodo(nodo) {
    console.log(`Getting red previa de ${nodo.nombre}`);
    let idsActuales = nodo.vinculos.filter(v => v.tipo === 'continuacion' && v.rol === 'target').map(v => v.idRef);
    let todosIds = idsActuales;
    let guarda = 0;
    let losNodosAnteriores = [nodo];
    console.log(`Tiene ${idsActuales.length} nodos previos`);
    while (guarda < 200 && idsActuales.length > 0) {
        try {
            losNodosAnteriores = await Nodo.find({ "_id": { $in: idsActuales } }).exec();
        }
        catch (error) {
            console.log(`Error getting nodos anteriores : ` + error);
            ApolloError('Error conectando con la base de datos');
        }
        console.log(`Anteriores: ${losNodosAnteriores.map(n => n.nombre)}`);
        let idsProx = losNodosAnteriores.reduce((acc, nod) => {
            let idsPrevios = nod.vinculos.filter(v => v.tipo === 'continuacion' && v.rol === 'target').map(v => v.idRef);
            return acc.concat(idsPrevios);
        }, []);
        let idsNuevos = idsProx.filter(id => !todosIds.includes(id));
        idsActuales = idsNuevos;
        todosIds.push(...idsNuevos);
        guarda++;
    }
    return todosIds;
}
export async function getNodosRedPreviaNodo(nodo) {
    let nodosActuales = [nodo];
    let todosNodos = [...nodosActuales];
    let guarda = 0;
    while (guarda < 300 && nodosActuales.length > 0) {
        guarda++;
        let idsSiguientes = nodosActuales.map(n => n.vinculos.filter(v => v.tipo === 'continuacion' && v.rol === 'target').map(v => v.idRef)).flat();
        let nodosNext = [];
        try {
            nodosNext = await Nodo.find({ "_id": { $in: idsSiguientes } }).exec();
        }
        catch (error) {
            console.log("Error getting nodos siguientes :" + error);
        }
        let nodosNuevos = nodosNext.filter(n => !todosNodos.map(tn => tn.id).includes(n.id));
        todosNodos.push(...nodosNuevos);
        nodosActuales = nodosNuevos;
    }
    return todosNodos;
}
export async function getIdsRedContinuacionesNodo(nodo) {
    console.log(`Getting red posterior de ${nodo.nombre}`);
    let idsActuales = nodo.vinculos.filter(v => v.tipo === 'continuacion' && v.rol === 'source').map(v => v.idRef);
    let todosIds = idsActuales;
    let guarda = 0;
    let losNodosPosteriores = [nodo];
    console.log(`Tiene ${idsActuales.length} nodos previos`);
    while (guarda < 200 && idsActuales.length > 0) {
        try {
            losNodosPosteriores = await Nodo.find({ "_id": { $in: idsActuales } }).exec();
        }
        catch (error) {
            console.log(`Error getting nodos posteriores : ` + error);
            ApolloError('Error conectando con la base de datos');
        }
        console.log(`Anteriores: ${losNodosPosteriores.map(n => n.nombre)}`);
        idsActuales = losNodosPosteriores.reduce((acc, nod) => {
            let idsPrevios = nod.vinculos.filter(v => v.tipo === 'continuacion' && v.rol === 'source').map(v => v.idRef);
            return acc.concat(idsPrevios);
        }, []);
        todosIds.push(...idsActuales);
        guarda++;
    }
    return todosIds;
}
