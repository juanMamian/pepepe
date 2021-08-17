import { ApolloError, AuthenticationError, gql, UserInputError } from "apollo-server-express";
import { ModeloTrabajo as Trabajo } from "../model/Trabajo"; const Nodo = require("../model/atlas/Nodo");
import { ModeloUsuario as Usuario } from "../model/Usuario"
import { contextoQuery } from "./tsObjetos"
import { ModeloForo as Foro } from "../model/Foros/Foro"
import { ModeloProyecto as Proyecto } from "../model/Proyecto";
import { ModeloObjetivo as Objetivo } from "../model/Objetivo";


export const typeDefs = gql`
    input NodoSolidaridadInput{        
        tipo:String,
        nombre: String,        
        coords:CoordsInput,
        vinculos:[vinculoInput]
    }
    type InfoNodoSolidaridad{
        idNodo: ID
        tipo: String
    }
    type Objetivo{
       id: ID,       
       nombre: String,
       responsables: [String],
       posiblesResponsables:[String],
       responsablesSolicitados:Int,
       administradores:[String],
       descripcion:String,       
       vinculos:[VinculoNodoProyecto],
       keywords:String,
       nodoParent:InfoNodoSolidaridad
       estadoDesarrollo:String,       
       coords: Coords,
       angulo:Float,
       stuck:Boolean,
       puntaje:Float,
       centroMasa:Coords,
       nivel: Int,
       turnoNivel:Float,
       peso:Int,
   }

   type InfoBasicaObjetivo{
       id:ID,
       nombre: String,
       idProyecto:ID
   }

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
       posiblesResponsables:[String],
       administradores:[String],
       responsablesSolicitados:Int,
       nodoParent:InfoNodoSolidaridad
       nodosConocimiento:[String],
       idForoResponsables:ID,
       diagramaProyecto:InfoDiagramaProyecto,
       vinculos:[VinculoNodoProyecto],
       keywords:String,       
       estadoDesarrollo:String,
       materiales:[MaterialTrabajo],
       estado:String,       
       coords: Coords,
       angulo:Float,
       stuck:Boolean,
       puntaje:Float,
       centroMasa:Coords,
       nivel: Int,
       turnoNivel:Float,
       peso:Int,

   }

   type InfoBasicaTrabajo{
       id:ID,
       nombre: String,
       idProyecto:ID
   }

   union NodoDeTrabajos = Trabajo | Objetivo

   extend type Query{
        objetivo(idObjetivo: ID!):Objetivo,
       busquedaObjetivosProyectos(textoBusqueda:String!):[InfoBasicaObjetivo],
       objetivosSegunCentro(centro: CoordsInput!, radio:Int!):[Objetivo],

       trabajo(idTrabajo: ID!):Trabajo,
       busquedaTrabajosProyectos(textoBusqueda:String!):[InfoBasicaTrabajo],
       trabajosDeProyectoDeUsuario(idUsuario:ID!):[InfoBasicaTrabajo],
       trabajosSegunCentro(centro: CoordsInput!, radio: Int!):[Trabajo],
       nodosTrabajosSegunCentro(centro:CoordsInput!, radio: Int!):[NodoDeTrabajos]
   }

   extend type Mutation{
    crearMaterialEnTrabajoDeProyecto(idProyecto:ID!, idTrabajo:ID!):MaterialTrabajo,
    eliminarMaterialDeTrabajo(idTrabajo:ID!, idMaterial: ID!):Boolean,
    editarNombreMaterialTrabajo(idTrabajo:ID!, idMaterial: ID!, nuevoNombre: String!):MaterialTrabajo,
    editarDescripcionMaterialTrabajo(idTrabajo:ID!, idMaterial: ID!, nuevoDescripcion: String!):MaterialTrabajo,
    editarCantidadesMaterialTrabajo(idTrabajo: ID!, idMaterial:ID!, nuevoCantidadNecesaria:Int!, nuevoCantidadDisponible:Int):MaterialTrabajo,

    crearObjetivo(posicion:CoordsInput):Objetivo,
    eliminarObjetivo(idObjetivo:ID!, idProyecto:ID!):Boolean,
    editarNombreObjetivo(idObjetivo:ID!, nuevoNombre: String!):Objetivo,
    editarDescripcionObjetivo(idObjetivo:ID!, nuevoDescripcion: String!):Objetivo,
    editarKeywordsObjetivo(idObjetivo:ID!, nuevoKeywords: String!):Objetivo,
    addResponsableObjetivo(idObjetivo:ID!,idUsuario:ID!):Objetivo,
    addPosibleResponsableObjetivo(idObjetivo:ID!, idUsuario:ID!):Objetivo,
    removeResponsableObjetivo(idObjetivo:ID!, idUsuario:ID!):Objetivo,
    setEstadoObjetivo(idObjetivo:ID!, nuevoEstado:String!):Objetivo,    
    setResponsablesSolicitadosObjetivo(idObjetivo:ID!, nuevoCantidadResponsablesSolicitados: Int!):Objetivo,
    setPosicionObjetivo(idObjetivo:ID!, nuevaPosicion:CoordsInput):Objetivo,


    crearTrabajo(idProyecto: ID!, posicion:CoordsInput):ID,
    eliminarTrabajo(idTrabajo:ID!, idProyecto:ID!):Boolean,
    editarNombreTrabajo(idTrabajo:ID!, nuevoNombre: String!):Trabajo,
    editarDescripcionTrabajo(idTrabajo:ID!, nuevoDescripcion: String!):Trabajo,
    editarKeywordsTrabajo(idTrabajo:ID!, nuevoKeywords: String!):Trabajo,
    addResponsableTrabajo(idTrabajo:ID!,idUsuario:ID!):Trabajo,
    addPosibleResponsableTrabajo(idTrabajo:ID!, idUsuario:ID!):Trabajo,
    removeResponsableTrabajo(idTrabajo:ID!, idUsuario:ID!):Trabajo,
    setEstadoTrabajo(idTrabajo:ID!, nuevoEstado:String!):Trabajo,    
    setResponsablesSolicitadosTrabajo(idTrabajo:ID!, nuevoCantidadResponsablesSolicitados: Int!):Trabajo,
    setPosicionTrabajo(idTrabajo:ID!, nuevaPosicion:CoordsInput):Trabajo,

    eliminarNodoDeTrabajos(idNodo:ID!, tipo: String!):Boolean,
    crearNodoSolidaridad(infoNodo:NodoSolidaridadInput!):NodoDeTrabajos,
    crearNodoSolidaridadRequerido(infoNodo:NodoSolidaridadInput!, idNodoRequiriente: ID!):[NodoDeTrabajos],
    desvincularNodosSolidaridad(idUnNodo:ID!, idOtroNodo:ID!):[NodoDeTrabajos],
    crearRequerimentoEntreNodosSolidaridad(idNodoRequiriente:ID!, idNodoRequerido:ID!):[NodoDeTrabajos],
   }

`;

export const resolvers = {
    Query: {
        objetivo: async function (_: any, { idObjetivo }: any, context: contextoQuery) {

            try {
                var elObjetivo: any = await Objetivo.findById(idObjetivo).exec();
                if (!elObjetivo) {
                    throw "Objetivo no existía"
                }
            } catch (error) {
                console.log(`error buscando un objetivo. E: ${error}`);
                throw new ApolloError("");
            }

            if (!elObjetivo.idProyectoParent) {
                console.log(`Objetivo ${elObjetivo.nombre} no tenia idProyectoParent. Buscándole`);
                try {
                    let elProyectoParent: any = await Proyecto.findOne({ idsObjetivos: { $in: elObjetivo._id } }).exec();
                    if (!elProyectoParent) throw "No habia proyecto parent";
                    console.log(`Era del proyecto ${elProyectoParent.nombre}`);
                    elObjetivo.idProyectoParent = elProyectoParent._id;
                    await elObjetivo.save();
                } catch (error) {
                    console.log(`Error buscando proyecto parent. E: ${error}`);
                    throw new ApolloError("Error conectando con la base datos");
                }
            }

            return elObjetivo;
        },
        busquedaObjetivosProyectos: async function (_: any, { textoBusqueda }: any, contexto: contextoQuery) {
            console.log(`Buscando objetivo usando texto de búsqueda: ${textoBusqueda}`);
            const sizePaginaObjetivos = 50;
            if (contexto.usuario.id === "") {
                console.log(`Usuario no logeado`);
                throw new AuthenticationError("No autorizado");
            }

            try {
                var losObjetivos: any = await Objetivo.find({ $text: { $search: textoBusqueda } }, { score: { $meta: 'textScore' } }).select("nombre").sort({ score: { $meta: 'textScore' } }).limit(sizePaginaObjetivos).exec();
            } catch (error) {
                console.log(`Error buscando objetivos. E: ${error}`);
                return new ApolloError("Error conectando con la base de datos");
            }

            console.log(`Enviando ${losObjetivos.length} objetivos encontrados`);
            return losObjetivos;
        },
        objetivosSegunCentro: async function (_: any, { centro, radio }: any, __: any) {
            try {
                var losObjetivos: any = await Objetivo.find({}).exec();
            } catch (error) {
                console.log(`Error buscando objetivos. E: ${error}`);
                throw new ApolloError("Error conectando con la base de datos");
            }
            console.log(`Enviando objetivos según centro`);
            return losObjetivos;
        },

        trabajo: async function (_: any, { idTrabajo }: any, context: contextoQuery) {
            let tieneForo = true;

            try {
                var elTrabajo: any = await Trabajo.findById(idTrabajo).exec();
                if (!elTrabajo) {
                    throw "Trabajo no existía"
                }
            } catch (error) {
                console.log(`error buscando un trabajo. E: ${error}`);
                throw new ApolloError("");
            }

            if (!elTrabajo.idProyectoParent) {
                console.log(`Trabajo ${elTrabajo.nombre} no tenia idProyectoParent. Buscándole`);
                try {
                    let elProyectoParent: any = await Proyecto.findOne({ idsTrabajos: { $in: elTrabajo._id } }).exec();
                    if (!elProyectoParent) throw "No habia proyecto parent";
                    console.log(`Era del proyecto ${elProyectoParent.nombre}`);
                    elTrabajo.idProyectoParent = elProyectoParent._id;
                    await elTrabajo.save();
                } catch (error) {
                    console.log(`Error buscando proyecto parent. E: ${error}`);
                    throw new ApolloError("Error conectando con la base datos");
                }
            }

            if (!elTrabajo.idForoResponsables) {
                tieneForo = false;
            }
            else {
                try {
                    let elForo: any = await Foro.findById(elTrabajo.idForoResponsables).exec();
                    if (!elForo) {
                        console.log(`El foro no existía. Se creará uno nuevo`);
                        tieneForo = false;
                    }
                } catch (error) {
                    console.log(`Error buscando foro en la base de datos. E :${error}`);
                }
            }

            if (!tieneForo) {
                console.log(`El trabajo ${elTrabajo.nombre} no tenía foro. Creando con miembros: ${elTrabajo.responsables}.`);
                try {
                    var nuevoForo: any = await Foro.create({
                        miembros: elTrabajo.responsables,
                        acceso: "privado"
                    });
                    var idNuevoForo = nuevoForo._id;
                    await nuevoForo.save();
                } catch (error) {
                    console.log(`Error creando el nuevo foro. E: ${error}`);
                    throw new ApolloError("Error conectando con la base de datos");
                }
                console.log(`Nuevo foro creado`);
                try {
                    elTrabajo.idForoResponsables = idNuevoForo;
                    await elTrabajo.save();
                } catch (error) {
                    console.log(`Error guardando el trabajo`);
                    throw new ApolloError("Error conectando con la base de datos");
                }
            }
            return elTrabajo;
        },
        busquedaTrabajosProyectos: async function (_: any, { textoBusqueda }: any, contexto: contextoQuery) {
            console.log(`Buscando trabajo usando texto de búsqueda: ${textoBusqueda}`);
            const sizePaginaTrabajos = 50;
            if (contexto.usuario.id === "") {
                console.log(`Usuario no logeado`);
                throw new AuthenticationError("No autorizado");
            }

            try {
                var losTrabajos: any = await Trabajo.find({ $text: { $search: textoBusqueda } }, { score: { $meta: 'textScore' } }).select("nombre").sort({ score: { $meta: 'textScore' } }).limit(sizePaginaTrabajos).exec();
            } catch (error) {
                console.log(`Error buscando trabajos. E: ${error}`);
                return new ApolloError("Error conectando con la base de datos");
            }


            console.log(`Enviando ${losTrabajos.length} trabajos encontrados`);
            return losTrabajos;
        },
        trabajosDeProyectoDeUsuario: async function (_: any, { idUsuario }: any, contexto: contextoQuery) {
            console.log('Peticion de trabajos de usuario con id ' + idUsuario);

            try {
                var losTrabajos: any = await Trabajo.find({ "responsables": idUsuario }).exec();

            } catch (error) {
                console.log(`Error buscando trabajos de usuario. E: ${error}`);
                throw new ApolloError("Error conectando con la base de datos");
            }

            console.log(`Enviando ${losTrabajos.length} trabajos`);
            return losTrabajos;
        },
        trabajosSegunCentro: async function (_: any, { centro, radio }: any, __: any) {
            try {
                var losTrabajos: any = await Trabajo.find({}).exec();
            } catch (error) {
                console.log(`Error buscando trabajos. E: ${error}`);
                throw new ApolloError("Error conectando con la base de datos");
            }
            return losTrabajos;
        },
        nodosTrabajosSegunCentro: async function (_: any, { centro, radio }: any, __: any) {
            console.log(`Nodos alrededor de un centro ${JSON.stringify(centro)} con radio ${radio} solicitados`);

            try {
                var losTrabajos: any = await Trabajo.find({ "coords.x": { $gt: centro.x - radio, $lt: centro.x + radio }, "coords.y": { $gt: centro.y - radio, $lt: centro.y + radio } }).exec();
                var losObjetivos: any = await Objetivo.find({ "coords.x": { $gt: centro.x - radio, $lt: centro.x + radio }, "coords.y": { $gt: centro.y - radio, $lt: centro.y + radio } }).exec();
            } catch (error) {
                console.log(`Error buscando trabajos. E: ${error}`);
                throw new ApolloError("Error conectando con la base de datos");
            }
            losTrabajos.forEach(t => t.tipoNodo = "trabajo");
            losObjetivos.forEach(o => o.tipoNodo = "objetivo");

            console.log(`${losTrabajos.length} trabajos encontrados.`);
            console.log(`${losObjetivos.length} objetivos encontrados.`);
            const todosNodos = losTrabajos.concat(losObjetivos);
            console.log(`Retornando ${todosNodos.length} nodos`);
            return todosNodos;
        }
    },

    Mutation: {
        async eliminarNodoDeTrabajos(_: any, { idNodo, tipo }: any, contexto: contextoQuery) {
            console.log(`peticion de eliminar un ${tipo} con id ${idNodo}`);
            let credencialesUsuario = contexto.usuario;

            try {
                var elNodo: any = null;
                if (tipo === 'objetivo') {
                    elNodo = await Objetivo.findById(idNodo).exec();
                }
                else if (tipo === 'trabajo') {
                    elNodo = await Trabajo.findById(idNodo).exec();
                }
                if (!elNodo) {
                    throw "nodo no encontrado"
                }
            }
            catch (error) {
                console.log("Error buscando el nodo a eliminar en la base de datos. E: " + error);
                throw new ApolloError("Error conectando con la base de datos");
            }

            var administradoresElNodo:Array<string>=[];
            if (!elNodo.nodoParent || !elNodo.nodoParent.idNodo || !elNodo.nodoParent.tipo) {
                administradoresElNodo= elNodo.responsables;
            }
            else {
                try {
                    var elNodoParent: any = null;                    
                    if (elNodo.nodoParent.tipo === 'trabajo') {
                        elNodoParent = await Trabajo.findById(elNodo.nodoParent.idNodo)
                    }
                    else if (elNodo.nodoParent.tipo === 'objetivo') {
                        elNodoParent = await Objetivo.findById(elNodo.nodoParent.idNodo)
                    }
                    if (!elNodoParent) throw "Nodo parent no encontrado"
                } catch (error) {
                    console.log(`Error buscando el nodo parent: ${elNodoParent}`);
                    throw new ApolloError("Error conectando con la base de datos");
                }
                administradoresElNodo= elNodoParent.responsables;
            }

            //Authorización
            let permisosEspeciales = ["superadministrador"];            

            if (!administradoresElNodo.includes(credencialesUsuario.id) && !credencialesUsuario.permisos.some(p => permisosEspeciales.includes(p))) {
                console.log(`Error de autenticacion eliminando nodo de tipo ${tipo}`);
                throw new AuthenticationError("No autorizado");
            }


            try {
                if (tipo === 'objetivo') {
                    await Objetivo.findByIdAndDelete(idNodo);
                }
                else if (tipo === 'trabajo') {
                    await Trabajo.findByIdAndDelete(idNodo);
                }
                else {
                    throw "Tipo de nodo no reconocido"
                }
            }
            catch (error) {
                console.log("Error eliminando nodo. E: " + error);
                throw new ApolloError("Error eliminando elemento");
            }

            console.log(`eliminado`);

            //Buscar nodos que tuvieran a este como nodoParent

            try {
                var trabajosHijos: any = await Trabajo.find({ "nodoParent.idNodo": idNodo });
                console.log(`${trabajosHijos.length} trabajos hijos encontrados`);
                var objetivosHijos: any = await Objetivo.find({ "nodoParent.idNodo": idNodo });
                console.log(`${objetivosHijos.length} objetivos hijos encontrados`);
                var todosHijos = trabajosHijos.concat(objetivosHijos);
            } catch (error) {
                console.log(`Error buscando los hijos del nodo eliminado: ${error}`);
            }

            todosHijos.forEach(async (hijo) => {
                hijo.nodoParent = null;
                try {
                    await hijo.save();
                } catch (error) {
                    console.log(`Error guardando el hijo con nodoParent nullificado`);
                }
            });


            //Eliminar foro
            try {
                await Foro.findByIdAndDelete(elNodo.idForoResponsables);
            } catch (error) {
                console.log(`Error buscando los foros para ser eliminados`);
            }

            return true;
        },
        async crearNodoSolidaridad(_: any, { infoNodo }: any, contexto: contextoQuery) {
            console.log(`Query de crear un nodo de solidaridad de tipo ${infoNodo.tipo} en la posicion ${infoNodo.coords}`);
            let credencialesUsuario = contexto.usuario;

            if (!credencialesUsuario || !credencialesUsuario.id) {
                throw new AuthenticationError("Usuario no logeado");
            }

            try {
                var nuevoForoResponsables: any = await Foro.create({
                    acceso: "privado",
                    miembros: [],
                });
                var idForoResponsables = nuevoForoResponsables._id;
                await nuevoForoResponsables.save();
            } catch (error) {
                console.log(`Error creando el nuevo foro de responsables. E: ${error}`);
                throw new ApolloError("Error conectando con la base de datos");
            }
            console.log(`Nuevo foro de responsables creado`);

            try {
                var nuevoNodo: any = null;
                if (infoNodo.tipo === 'trabajo')
                    nuevoNodo = new Trabajo({
                        ...infoNodo,
                        idForoResponsables
                    });
                else if (infoNodo.tipo === 'objetivo') {
                    nuevoNodo = new Objetivo({
                        ...infoNodo,
                        idForoResponsables
                    });
                }
                else {
                    throw "Tipo " + infoNodo.tipo + " no reconocido";
                }
                await nuevoNodo.save();
            } catch (error) {
                console.log(`error guardando el nuevo nodo en la base de datos. E: ${error}`);
                try {
                    await Foro.findByIdAndDelete(nuevoForoResponsables.id).exec();
                } catch (error) {
                    console.log(`Error eliminando el foro de responsables: ${error}`);
                }
                throw new ApolloError("Error guardando en base de datos");
            }
            console.log(`nuevo nodo de solidaridad creado`);
            nuevoNodo.tipoNodo = infoNodo.tipo;
            return nuevoNodo
        },
        async crearNodoSolidaridadRequerido(_: any, { infoNodo, idNodoRequiriente }: any, contexto: contextoQuery) {
            console.log(`Query de crear un nodo de solidaridad de tipo ${infoNodo.tipo} en la posicion ${infoNodo.coords} con requiriente ${idNodoRequiriente}`);
            let credencialesUsuario = contexto.usuario;

            if (!credencialesUsuario || !credencialesUsuario.id) {
                throw new AuthenticationError("Usuario no logeado");
            }

            try {
                var nuevoForoResponsables: any = await Foro.create({
                    acceso: "privado",
                    miembros: [],
                });
                var idForoResponsables = nuevoForoResponsables._id;
                await nuevoForoResponsables.save();
            } catch (error) {
                console.log(`Error creando el nuevo foro de responsables. E: ${error}`);
                throw new ApolloError("Error conectando con la base de datos");
            }
            console.log(`Nuevo foro de responsables creado`);

            try {
                var nuevoNodo: any = null;
                if (infoNodo.tipo === 'trabajo')
                    nuevoNodo = new Trabajo({
                        ...infoNodo,
                        idForoResponsables,
                    });
                else if (infoNodo.tipo === 'objetivo') {
                    nuevoNodo = new Objetivo({
                        ...infoNodo,
                        idForoResponsables
                    });
                }
                else {
                    throw "Tipo " + infoNodo.tipo + " no reconocido";
                }

                try {
                    var tipoRequiriente = 'trabajo';
                    var nodoRequiriente: any = await Trabajo.findById(idNodoRequiriente).exec();
                    if (!nodoRequiriente) {
                        tipoRequiriente = 'objetivo';
                        nodoRequiriente = await Objetivo.findById(idNodoRequiriente).exec();
                        if (!nodoRequiriente) {
                            throw "Nodo requiriente no encontrado en la base de datos"
                        }
                    }
                    var nuevoVinculo = nodoRequiriente.vinculos.create({
                        tipo: 'requiere',
                        idRef: nuevoNodo.id,
                        tipoRef: infoNodo.tipo
                    })

                    if (!nodoRequiriente.responsables.includes(credencialesUsuario.id) && !credencialesUsuario.permisos.includes('superadministrador')) {
                        console.log(`El usuario no podía crear este nodo requerido por no ser ni responsable ni superadministrador`);
                        throw new AuthenticationError("No autorizado");
                    }

                    nodoRequiriente.vinculos.push(nuevoVinculo);
                    console.log(`Guardando vínculo en el nodo requiriente ${nodoRequiriente.nombre}`);
                    await nodoRequiriente.save();
                    nodoRequiriente.tipoNodo = tipoRequiriente;
                } catch (error) {
                    console.log(`Error buscando el nodo requiriente: ${error}`);
                    throw new ApolloError("Error conectando con la base de datos");
                }
                nuevoNodo.nodoParent = {
                    idNodo: idNodoRequiriente,
                    tipo: tipoRequiriente
                }
                await nuevoNodo.save();
                nuevoNodo.tipoNodo = infoNodo.tipo;
            } catch (error) {
                console.log(`error guardando el nuevo nodo en la base de datos. E: ${error}`);
                try {
                    await Foro.findByIdAndDelete(nuevoForoResponsables.id).exec();
                } catch (error) {
                    console.log(`Error eliminando el foro de responsables: ${error}`);
                }
                throw new ApolloError("Error guardando en base de datos");
            }
            console.log(`nuevo nodo de solidaridad creado:`);
            nuevoNodo.tipoNodo = infoNodo.tipo;
            return [nuevoNodo, nodoRequiriente]
        },
        async desvincularNodosSolidaridad(_: any, { idUnNodo, idOtroNodo }: any, contexto: contextoQuery) {
            let credencialesUsuario = contexto.usuario;

            console.log(`Query de desvincular los nodos: ${idUnNodo}, ${idOtroNodo}`);

            try {
                var tipoUnNodo='trabajo'
                var unNodo: any = await Trabajo.findById(idUnNodo).exec();
                if (!unNodo) {          
                    tipoUnNodo='objetivo';
                    unNodo = await Objetivo.findById(idUnNodo).exec();                    
                }
                if (!unNodo) throw "Primer nodo no encontrado"

                var tipoOtroNodo='trabajo';
                var otroNodo: any = await Trabajo.findById(idOtroNodo).exec();
                if (!otroNodo) {
                tipoOtroNodo='objetivo';
                    otroNodo = await Objetivo.findById(idOtroNodo).exec();
                }
                if (!unNodo) throw "Primer nodo no encontrado"
            } catch (error) {
                console.log(`Error buscando los nodos a desvincular: ${error}`);
                throw new ApolloError("Error conectando con la base de datos");
            }                       
            const permisosEspeciales = ["superadministrador"];

            var indexUnV=unNodo.vinculos.findIndex(v=>v.idRef===idOtroNodo);
            if(indexUnV>-1){
                if(unNodo.responsables.includes(credencialesUsuario.id) || permisosEspeciales.some(p=>credencialesUsuario.permisos.includes(p))){
                    unNodo.vinculos.splice(indexUnV, 1);
                }
                else{
                    console.log(`Fallo al eliminar el vinculo de ${idUnNodo} requiriendo ${idOtroNodo}`);
                    throw new AuthenticationError("No autorizado");
                }
            }

            var indexOtroV=otroNodo.vinculos.findIndex(v=>v.idRef===idUnNodo);
            if(indexOtroV>-1){
                if(otroNodo.responsables.includes(credencialesUsuario.id) || permisosEspeciales.some(p=>credencialesUsuario.permisos.includes(p))){
                    otroNodo.vinculos.splice(indexOtroV, 1);
                }
                else{
                    console.log(`Fallo al eliminar el vinculo de ${idOtroNodo} requiriendo ${idUnNodo}`);
                    throw new AuthenticationError("No autorizado");
                }
            }

            //Al quedar desvinculados ya no puede haber una relación de administrador:

            if(unNodo.nodoParent && unNodo.nodoParent.idNodo===idOtroNodo){
                unNodo.nodoParent={};
            }
            if(otroNodo.nodoParent && otroNodo.nodoParent.idNodo===idUnNodo){
                otroNodo.nodoParent={};
            }

            try {
                await unNodo.save();
                await otroNodo.save();
            } catch (error) {
                console.log(`Error guardando los nodos después de la desvinculación: ${error}`);
                throw new ApolloError("Error conectando con la base de datos");
            }
            console.log(`Desvinculados`);
            unNodo.tipoNodo=tipoUnNodo;
            otroNodo.tipoNodo=tipoOtroNodo;
            return [unNodo, otroNodo];

        },
        async crearRequerimentoEntreNodosSolidaridad(_: any, { idNodoRequiriente, idNodoRequerido }: any, contexto: contextoQuery) {
            let credencialesUsuario = contexto.usuario;

            console.log(`Query de set que nodo ${idNodoRequiriente} requiere al nodo ${idNodoRequerido}`);

            try {
                var tipoNodoRequiriente='trabajo'
                var nodoRequiriente: any = await Trabajo.findById(idNodoRequiriente).exec();
                if (!nodoRequiriente) {          
                    tipoNodoRequiriente='objetivo';
                    nodoRequiriente = await Objetivo.findById(idNodoRequiriente).exec();                    
                }
                if (!nodoRequiriente) throw "Nodo requiriente no encontrado"

                var tipoNodoRequerido='trabajo';
                var nodoRequerido: any = await Trabajo.findById(idNodoRequerido).exec();
                if (!nodoRequerido) {
                tipoNodoRequerido='objetivo';
                    nodoRequerido = await Objetivo.findById(idNodoRequerido).exec();
                }
                if (!nodoRequerido) throw "Nodo requerido no encontrado"
            } catch (error) {
                console.log(`Error buscando los nodos a desvincular: ${error}`);
                throw new ApolloError("Error conectando con la base de datos");
            }
            //Administradores de nodoRequiriente

            var administradoresNodoRequiriente:Array<string>=[];
            if (!nodoRequiriente.nodoParent || !nodoRequiriente.nodoParent.idNodo || !nodoRequiriente.nodoParent.tipo) {
                administradoresNodoRequiriente= nodoRequiriente.responsables;
            }
            else {
                try {
                    var elNodoParent: any = null;                    
                    if (nodoRequiriente.nodoParent.tipo === 'trabajo') {
                        elNodoParent = await Trabajo.findById(nodoRequiriente.nodoParent.idNodo)
                    }
                    else if (nodoRequiriente.nodoParent.tipo === 'objetivo') {
                        elNodoParent = await Objetivo.findById(nodoRequiriente.nodoParent.idNodo)
                    }
                    if (!elNodoParent) throw "Nodo parent no encontrado"
                } catch (error) {
                    console.log(`Error buscando el nodo parent: ${elNodoParent}`);
                    throw new ApolloError("Error conectando con la base de datos");
                }
                administradoresNodoRequiriente= elNodoParent.responsables;
            }

            //Administradores de nodoRequerido

            var administradoresNodoRequerido:Array<string>=[];
            if (!nodoRequerido.nodoParent || !nodoRequerido.nodoParent.idNodo || !nodoRequerido.nodoParent.tipo) {
                administradoresNodoRequerido= nodoRequerido.responsables;
            }
            else {
                try {
                    var elNodoParent: any = null;
                    if (nodoRequerido.nodoParent.tipo === 'trabajo') {
                        elNodoParent = await Trabajo.findById(nodoRequerido.nodoParent.idNodo)
                    }
                    else if (nodoRequerido.nodoParent.tipo === 'objetivo') {
                        elNodoParent = await Objetivo.findById(nodoRequerido.nodoParent.idNodo)
                    }
                    if (!elNodoParent) throw "Nodo parent no encontrado"
                } catch (error) {
                    console.log(`Error buscando el nodo parent: ${elNodoParent}`);
                    throw new ApolloError("Error conectando con la base de datos");
                }
                administradoresNodoRequerido= elNodoParent.responsables;
            }


            const permisosEspeciales = ["superadministrador"];
            if (!permisosEspeciales.some(p => credencialesUsuario.permisos.includes(p)) && !nodoRequiriente.responsables.includes(credencialesUsuario.id) && !administradoresNodoRequiriente.includes(credencialesUsuario.id)) {
                console.log(`Fallo en autenticación`);
                throw new AuthenticationError("No autorizado");
            }

            var indexV=nodoRequiriente.vinculos.findIndex(v=>v.idRef===idNodoRequerido);
            if(indexV>-1){
                nodoRequiriente.vinculos.splice(indexV, 1);
            }

            var nuevoVinculo=nodoRequiriente.vinculos.create({
                idRef:idNodoRequerido,
                tipo:"requiere",
                tipoRef:tipoNodoRequerido
            })

            nodoRequiriente.vinculos.push(nuevoVinculo);

            var indexOtroV=nodoRequerido.vinculos.findIndex(v=>v.idRef===idNodoRequiriente);
            if(indexOtroV>-1){
                nodoRequerido.vinculos.splice(indexOtroV, 1);
            }

            //Si el nodo requerido estaba huérfano, entonces lo toma bajo su control

            if((!nodoRequerido.responsables || nodoRequerido.responsables.length<1) && (!nodoRequerido.nodoParent || !nodoRequerido.nodoParent.idNodo)){
                console.log(`El nodo requerido estaba huérfano. Tomando bajo el control del nodo requiriente.`);
                nodoRequerido.nodoParent={
                    idNodo:idNodoRequiriente,
                    tipo: tipoNodoRequiriente
                }
            }            

            try {
                await nodoRequiriente.save();
                await nodoRequerido.save();
            } catch (error) {
                console.log(`Error guardando los nodos después de la vinculación: ${error}`);
                throw new ApolloError("Error conectando con la base de datos");
            }
            console.log(`Vinculados`);
            nodoRequiriente.tipoNodo=tipoNodoRequiriente;
            nodoRequerido.tipoNodo=tipoNodoRequerido;
            return [nodoRequiriente, nodoRequerido];

        },

        async crearObjetivo(_: any, { posicion }: any, contexto: contextoQuery) {
            console.log(`Peticion de crear un nuevo objetivo`);

            //Authorización
            let credencialesUsuario = contexto.usuario;
            if (!credencialesUsuario.id || credencialesUsuario.id.length < 2) {
                console.log(`Error de autenticacion editando nombre de proyecto`);
                throw new AuthenticationError("No autorizado");
            }

            console.log(`Creando un foro para este objetivo`);
            try {
                var nuevoForo: any = await Foro.create({
                    acceso: "privado",
                    miembros: [credencialesUsuario.id],
                });
                var idNuevoForo = nuevoForo._id;
                await nuevoForo.save();
            } catch (error) {
                console.log(`Error creando el nuevo foro. E: ${error}`);
                throw new ApolloError("Error conectando con la base de datos");
            }
            console.log(`Nuevo foro creado`);

            try {
                var nuevoObjetivo: any = await new Objetivo({ idForoResponsables: idNuevoForo, diagramaProyecto: { posicion } });
                await nuevoObjetivo.save();
            } catch (error) {
                console.log(`Error creando el nuevo objetivo. E: ${error}`);
                throw new ApolloError("Error conectando con la base de datos");
            }
            return nuevoObjetivo;
        },
        async eliminarObjetivo(_: any, { idObjetivo, idProyecto }: any, contexto: contextoQuery) {
            console.log(`peticion de eliminar un objetivo con id ${idObjetivo} de un proyecto con id ${idProyecto}`);
            let credencialesUsuario = contexto.usuario;

            try {
                var elProyecto: any = await Proyecto.findById(idProyecto).exec();
                if (!elProyecto) {
                    throw "proyecto no encontrado"
                }
            }
            catch (error) {
                console.log("Error buscando el proyecto en la base de datos. E: " + error);
                throw new ApolloError("Error conectando con la base de datos");
            }

            //Authorización
            let permisosEspeciales = ["superadministrador"];


            if (!elProyecto.responsables.includes(credencialesUsuario.id) && !credencialesUsuario.permisos.some(p => permisosEspeciales.includes(p))) {
                console.log(`Error de autenticacion editando nombre de proyecto`);
                throw new AuthenticationError("No autorizado");
            }


            try {
                await Objetivo.findByIdAndDelete(idObjetivo);
                await Proyecto.findByIdAndUpdate(idProyecto, { $pull: { idsObjetivos: idObjetivo } });
            }
            catch (error) {
                console.log("Error eliminando objetivo. E: " + error);
                throw new ApolloError("Error introduciendo el objetivo en el proyecto");
            }

            console.log(`eliminado`);

            return true;
        },
        async editarNombreObjetivo(_: any, { idObjetivo, nuevoNombre }, contexto: contextoQuery) {

            console.log(`cambiando el nombre del objetivo con id ${idObjetivo}`);
            const charProhibidosNombreObjetivo = /[^ a-zA-ZÀ-ž0-9_():.,-]/;

            nuevoNombre = nuevoNombre.replace(/\s\s+/g, " ");
            if (charProhibidosNombreObjetivo.test(nuevoNombre)) {
                throw new ApolloError("Nombre ilegal");
            }

            nuevoNombre = nuevoNombre.trim();

            try {
                var elObjetivo: any = await Objetivo.findById(idObjetivo).exec();
                if (!elObjetivo) {
                    throw "Objetivo no encontrado"
                }
            }
            catch (error) {
                console.log("Error buscando el objetivo. E: " + error);
                throw new ApolloError("Erro en la conexión con la base de datos");
            }

            var administradores: Array<string> = [];

            if (!elObjetivo.nodoParent || !elObjetivo.nodoParent.idNodo || !elObjetivo.nodoParent.tipo) {
                administradores = elObjetivo.responsables;
            }
            else {
                try {
                    var elNodoParent: any = null;
                    if (elObjetivo.nodoParent.tipo === 'trabajo') {
                        elNodoParent = await Trabajo.findById(elObjetivo.nodoParent.idNodo)
                    }
                    else if (elObjetivo.nodoParent.tipo === 'objetivo') {
                        elNodoParent = await Objetivo.findById(elObjetivo.nodoParent.idNodo)
                    }
                    if (!elNodoParent) throw "Nodo parent no encontrado"
                } catch (error) {
                    console.log(`Error buscando el nodo parent: ${elNodoParent}`);
                    throw new ApolloError("Error conectando con la base de datos");
                }

                administradores = elNodoParent.responsables;
            }

            //Authorización
            let credencialesUsuario = contexto.usuario;
            if (!administradores.includes(credencialesUsuario.id) && !credencialesUsuario.permisos.includes("superadministrador")) {
                console.log(`Error de autenticacion editando nombre de objetivo`);
                throw new AuthenticationError("No autorizado");
            }

            try {
                elObjetivo.nombre = nuevoNombre;
                await elObjetivo.save();
            }
            catch (error) {
                console.log("Error cambiando el nombre en la base de datos. E: " + error);
                throw new ApolloError("Error guardando el nombre en la base de datos");
            }

            console.log(`Nombre cambiado`);
            return elObjetivo;
        },
        async editarDescripcionObjetivo(_: any, { idObjetivo, nuevoDescripcion }, contexto: contextoQuery) {
            const credencialesUsuario = contexto.usuario;

            try {
                var elObjetivo: any = await Objetivo.findById(idObjetivo).exec();
                if (!elObjetivo) {
                    throw "Objetivo no encontrado"
                }
            }
            catch (error) {
                console.log("Error buscando el objetivo. E: " + error);
                throw new ApolloError("Erro en la conexión con la base de datos");
            }

            var administradores: Array<string> = [];

            if (!elObjetivo.nodoParent || !elObjetivo.nodoParent.idNodo || !elObjetivo.nodoParent.tipo) {
                administradores = elObjetivo.responsables;
            }
            else {
                try {
                    var elNodoParent: any = null;
                    if (elObjetivo.nodoParent.tipo === 'trabajo') {
                        elNodoParent = await Trabajo.findById(elObjetivo.nodoParent.idNodo)
                    }
                    else if (elObjetivo.nodoParent.tipo === 'objetivo') {
                        elNodoParent = await Objetivo.findById(elObjetivo.nodoParent.idNodo)
                    }
                    if (!elNodoParent) throw "Nodo parent no encontrado"
                } catch (error) {
                    console.log(`Error buscando el nodo parent: ${elNodoParent}`);
                    throw new ApolloError("Error conectando con la base de datos");
                }

                administradores = elNodoParent.responsables;
            }

            //Authorización
            if (!administradores.includes(credencialesUsuario.id) && !credencialesUsuario.permisos.includes("superadministrador")) {
                console.log(`Error de autenticacion editando nombre de objetivo`);
                throw new AuthenticationError("No autorizado");
            }

            const charProhibidosDescripcionObjetivo = /[^\n\r a-zA-ZÀ-ž0-9_():;.,+¡!¿?@=-]/;

            if (charProhibidosDescripcionObjetivo.test(nuevoDescripcion)) {
                throw new ApolloError("Descripcion ilegal");
            }

            nuevoDescripcion = nuevoDescripcion.trim();

            try {
                elObjetivo.descripcion = nuevoDescripcion;
                console.log(`guardando nuevo descripcion ${nuevoDescripcion} en la base de datos`);
                await elObjetivo.save();
            } catch (error) {
                console.log(`error guardando el objetivo modificado: ${error}`);
                throw new ApolloError("Error guardando información en la base de datos");

            }
            console.log(`Descripcion guardado`);
            return elObjetivo;
        },
        async editarKeywordsObjetivo(_: any, { idProyecto, idObjetivo, nuevoKeywords }, contexto: contextoQuery) {
            let credencialesUsuario = contexto.usuario;
            try {
                var elObjetivo: any = await Objetivo.findById(idObjetivo).exec();
                if (!elObjetivo) {
                    throw "Objetivo no encontrado"
                }
            }
            catch (error) {
                console.log("Error buscando el objetivo. E: " + error);
                throw new ApolloError("Erro en la conexión con la base de datos");
            }

            var administradores: Array<string> = [];

            if (!elObjetivo.nodoParent || !elObjetivo.nodoParent.idNodo || !elObjetivo.nodoParent.tipo) {
                administradores = elObjetivo.responsables;
            }
            else {
                try {
                    var elNodoParent: any = null;
                    if (elObjetivo.nodoParent.tipo === 'trabajo') {
                        elNodoParent = await Trabajo.findById(elObjetivo.nodoParent.idNodo)
                    }
                    else if (elObjetivo.nodoParent.tipo === 'objetivo') {
                        elNodoParent = await Objetivo.findById(elObjetivo.nodoParent.idNodo)
                    }
                    if (!elNodoParent) throw "Nodo parent no encontrado"
                } catch (error) {
                    console.log(`Error buscando el nodo parent: ${elNodoParent}`);
                    throw new ApolloError("Error conectando con la base de datos");
                }

                administradores = elNodoParent.responsables;
            }

            //Authorización
            if (!administradores.includes(credencialesUsuario.id) && !credencialesUsuario.permisos.includes("superadministrador")) {
                console.log(`Error de autenticacion editando nombre de objetivo`);
                throw new AuthenticationError("No autorizado");
            }

            const charProhibidosKeywordsObjetivo = /[^ a-zA-Zñ,]/;

            if (charProhibidosKeywordsObjetivo.test(nuevoKeywords)) {
                throw new ApolloError("Keywords ilegal");
            }

            nuevoKeywords = nuevoKeywords.trim();

            try {
                elObjetivo.keywords = nuevoKeywords;
                console.log(`guardando nuevo keywords ${nuevoKeywords} en la base de datos`);
                await elObjetivo.save();
            } catch (error) {
                console.log(`error guardando el objetivo modificado: ${error}`);
            }
            console.log(`Keywords guardado`);
            return elObjetivo;
        },
        addResponsableObjetivo: async function (_: any, { idObjetivo, idUsuario }: any, contexto: contextoQuery) {
            console.log(`Solicitud de add un usuario con id ${idUsuario} a un objetivo de id ${idObjetivo}`);
            let credencialesUsuario = contexto.usuario;

            try {
                var elObjetivo: any = await Objetivo.findById(idObjetivo).exec();
                if (!elObjetivo) throw "Objetivo no existía";
            } catch (error) {
                console.log('Error buscando el objetivo . E: ' + error);
                throw new ApolloError('Error conectando con la base de datos');
            }

            //Authorización
            if (elObjetivo.responsables.length > 0 && !credencialesUsuario.permisos.includes("superadministrador") && !elObjetivo.responsables.includes(credencialesUsuario.id)) {
                console.log(`Error de autenticacion. Hay ${elObjetivo.responsables.length} responsables: ${elObjetivo.responsables}`);
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

            if (elObjetivo.responsables.includes(idUsuario)) {
                console.log(`El usuario ya era responsable de este objetivo`);
                throw new ApolloError("El usuario ya estaba incluido");
            }

            let indexPosibleResponsable = elObjetivo.posiblesResponsables.indexOf(idUsuario);
            if (indexPosibleResponsable > -1) {
                console.log(`sacando al usuario ${idUsuario} de la lista de posibles responsables`);
                elObjetivo.posiblesResponsables.splice(indexPosibleResponsable, 1);
            }
            else {
                if (elObjetivo.responsables.length > 0) {
                    console.log(`Error. Se intentaba add como responsable un usuario que no estaba en la lista de posibles responsables.`);
                    throw new UserInputError("El usuario no estaba en la lista de espera para responsables.")
                }
            }

            try {
                elObjetivo.responsables.push(idUsuario);
                if (elObjetivo.responsablesSolicitados > 0) elObjetivo.responsablesSolicitados--;
                console.log(`Usuario añadido a la lista de responsables`);
                await elObjetivo.save();
            }
            catch (error) {
                console.log("Error guardando datos en la base de datos. E: " + error);
                throw new ApolloError("Error conectando con la base de datos");
            }
            console.log(`Objetivo guardado`);

            try {
                await Foro.findByIdAndUpdate(elObjetivo.idForoResponsables, { miembros: elObjetivo.responsables });
            } catch (error) {
                console.log(`Error mirroring responsables del proyecto hacia miembros del foro. E: ${error}`);
            }

            return elObjetivo;

        },
        addPosibleResponsableObjetivo: async function (_: any, { idObjetivo, idUsuario }: any, contexto: contextoQuery) {
            console.log(`añadiendo usuario ${idUsuario} a la lista de posibles responsables del objetivo ${idObjetivo}`);
            let credencialesUsuario = contexto.usuario;
            try {
                var elObjetivo: any = await Objetivo.findById(idObjetivo).exec();
                if (!elObjetivo) {
                    throw "objetivo no encontrado"
                }
            }
            catch (error) {
                console.log("Error buscando el objetivo en la base de datos. E: " + error);
                throw new ApolloError("Error de conexión con la base de datos");
            }

            //Authorización

            if (idUsuario != credencialesUsuario.id && !credencialesUsuario.permisos.includes("superadministrador")) {
                console.log(`Error de autenticacion añadiendo posible responsable del objetivo`);
                throw new AuthenticationError("No autorizado");
            }

            if (elObjetivo.posiblesResponsables.includes(idUsuario) || elObjetivo.responsables.includes(idUsuario)) {
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
                elObjetivo.posiblesResponsables.push(idUsuario);
                await elObjetivo.save();
            }
            catch (error) {
                console.log("Error guardando datos en la base de datos. E: " + error);
                throw new ApolloError("Error conectando con la base de datos");
            }
            console.log(`Objetivo guardado`);
            return elObjetivo
        },
        removeResponsableObjetivo: async function (_: any, { idObjetivo, idUsuario }: any, contexto: contextoQuery) {
            console.log(`Solicitud de remove un usuario con id ${idUsuario} de un objetivo de id ${idObjetivo}`);
            let credencialesUsuario = contexto.usuario;

            //Authorización

            if (idUsuario != credencialesUsuario.id && !credencialesUsuario.permisos.includes("superadministrador")) {
                console.log(`Error de autenticacion editando nombre de proyecto`);
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

            try {
                var elObjetivo: any = await Objetivo.findById(idObjetivo).exec();
                if (!elObjetivo) throw "Objetivo no existía";
            } catch (error) {
                console.log('Error buscando el objetivo . E: ' + error);
                throw new ApolloError('Error conectando con la base de datos');
            }

            const indexPosibleResponsable = elObjetivo.posiblesResponsables.indexOf(idUsuario);

            if (indexPosibleResponsable > -1) {
                console.log(`sacando al usuario ${idUsuario} de la lista de posibles responsables`);
                elObjetivo.posiblesResponsables.splice(indexPosibleResponsable, 1);
            }

            const indexResponsable = elObjetivo.responsables.indexOf(idUsuario);

            if (indexResponsable > -1) {
                console.log(`sacando al usuario ${idUsuario} de la lista de responsables`);
                elObjetivo.responsables.splice(indexResponsable, 1);
            }
            console.log(`Usuario retirado de la lista de responsables`);

            try {


                await elObjetivo.save();
                await elUsuario.save();
            }
            catch (error) {
                console.log("Error guardando datos en la base de datos. E: " + error);
                throw new ApolloError("Error conectando con la base de datos");
            }
            console.log(`Objetivo guardado`);

            try {
                await Foro.findByIdAndUpdate(elObjetivo.idForoResponsables, { miembros: elObjetivo.responsables });
            } catch (error) {
                console.log(`Error mirroring responsables del proyecto hacia miembros del foro. E: ${error}`);
            }

            return elObjetivo;
        },
        async setEstadoObjetivo(_: any, { idObjetivo, nuevoEstado }, contexto: contextoQuery) {

            let credencialesUsuario = contexto.usuario;
            try {
                var elObjetivo: any = await Objetivo.findById(idObjetivo).exec();
                if (!elObjetivo) {
                    throw "Objetivo no encontrado"
                }
            }
            catch (error) {
                console.log("Error buscando el objetivo. E: " + error);
                throw new ApolloError("Error en la conexión con la base de datos");
            }

            var administradores: Array<string> = [];

            if (!elObjetivo.nodoParent || !elObjetivo.nodoParent.idNodo || !elObjetivo.nodoParent.tipo) {
                administradores = elObjetivo.responsables;
            }
            else {
                try {
                    var elNodoParent: any = null;
                    if (elObjetivo.nodoParent.tipo === 'trabajo') {
                        elNodoParent = await Trabajo.findById(elObjetivo.nodoParent.idNodo)
                    }
                    else if (elObjetivo.nodoParent.tipo === 'objetivo') {
                        elNodoParent = await Objetivo.findById(elObjetivo.nodoParent.idNodo)
                    }
                    if (!elNodoParent) throw "Nodo parent no encontrado"
                } catch (error) {
                    console.log(`Error buscando el nodo parent: ${elNodoParent}`);
                    throw new ApolloError("Error conectando con la base de datos");
                }

                administradores = elNodoParent.responsables;
            }

            //Authorización
            if (!administradores.includes(credencialesUsuario.id) && !credencialesUsuario.permisos.includes("superadministrador")) {
                console.log(`Error de autenticacion editando nombre de objetivo`);
                throw new AuthenticationError("No autorizado");
            }

            try {
                elObjetivo.estadoDesarrollo = nuevoEstado;
                console.log(`guardando nuevo estado ${nuevoEstado} en la base de datos`);
                await elObjetivo.save();
            } catch (error) {
                console.log(`error guardando el objetivo modificado: ${error}`);
                throw new ApolloError("Error guardando información en la base de datos");

            }
            console.log(`Estado guardado`);
            return elObjetivo;
        },
        setResponsablesSolicitadosObjetivo: async function (_: any, { idObjetivo, nuevoCantidadResponsablesSolicitados }, contexto: contextoQuery) {
            let credencialesUsuario = contexto.usuario;
            console.log(`Solicitud de set cantidad de responsables solicitados de ${nuevoCantidadResponsablesSolicitados} en objetivo con id ${idObjetivo}`);

            try {
                var elObjetivo: any = await Objetivo.findById(idObjetivo).exec();
                if (!elObjetivo) {
                    throw "objetivo no encontrado"
                }
            }
            catch (error) {
                console.log("Error buscando el objetivo en la base de datos. E: " + error);
                throw new ApolloError("Error de conexión con la base de datos");
            }

            if (!credencialesUsuario.permisos.includes("superadministrador") && !elObjetivo.responsables.includes(credencialesUsuario.id)) {
                console.log(`Error de autenticacion editando responsables solicitados.`);
                throw new AuthenticationError("No autorizado");
            }

            elObjetivo.responsablesSolicitados = nuevoCantidadResponsablesSolicitados;

            try {
                await elObjetivo.save();
            } catch (error) {
                console.log(`Error guardando el objetivo: ${error}`);
                throw new ApolloError("Error conectando con la base de datos");
            }
            console.log(`Retornando con ${elObjetivo.responsablesSolicitados} responsables solicitados`);
            return elObjetivo;
        },
        async setPosicionObjetivo(_: any, { idObjetivo, nuevaPosicion }, contexto: contextoQuery) {
            console.log(`Guardando posicion de objetivo en el diagrama del proyecto`);
            const credencialesUsuario = contexto.usuario;

            try {
                var elObjetivo: any = await Objetivo.findById(idObjetivo).exec();
                if (!elObjetivo) {
                    throw "Objetivo no encontrado"
                }
            }
            catch (error) {
                console.log("Error buscando el objetivo. E: " + error);
                throw new ApolloError("Erro en la conexión con la base de datos");
            }

            var administradores: Array<string> = [];

            if (!elObjetivo.nodoParent || !elObjetivo.nodoParent.idNodo || !elObjetivo.nodoParent.tipo) {
                administradores = elObjetivo.responsables;
            }
            else {
                try {
                    var elNodoParent: any = null;
                    if (elObjetivo.nodoParent.tipo === 'trabajo') {
                        elNodoParent = await Trabajo.findById(elObjetivo.nodoParent.idNodo)
                    }
                    else if (elObjetivo.nodoParent.tipo === 'objetivo') {
                        elNodoParent = await Objetivo.findById(elObjetivo.nodoParent.idNodo)
                    }
                    if (!elNodoParent) throw "Nodo parent no encontrado"
                } catch (error) {
                    console.log(`Error buscando el nodo parent: ${elNodoParent}`);
                    throw new ApolloError("Error conectando con la base de datos");
                }

                administradores = elNodoParent.responsables;
            }

            //Authorización
            if (!administradores.includes(credencialesUsuario.id) && !credencialesUsuario.permisos.includes("superadministrador")) {
                console.log(`Error de autenticacion editando nombre de objetivo`);
                throw new AuthenticationError("No autorizado");
            }

            try {
                elObjetivo.coords = nuevaPosicion;
                await elObjetivo.save();
            } catch (error) {
                console.log(`error guardando el objetivo modificado: ${error}`);
            }

            return elObjetivo;

        },

        async crearTrabajo(_: any, { idProyecto, posicion }: any, contexto: contextoQuery) {
            console.log(`Peticion de crear un nuevo trabajo en el proyecto con id ${idProyecto}`);

            try {
                var elProyecto: any = await Proyecto.findById(idProyecto).exec();
                if (!elProyecto) {
                    throw "proyecto no encontrado"
                }
            }
            catch (error) {
                console.log("Proyecto no encontrado. E: " + error);
                throw new ApolloError("Error conectandose con la base de datos");
            }

            //Authorización
            let credencialesUsuario = contexto.usuario;
            if (!elProyecto.responsables.includes(credencialesUsuario.id) && !credencialesUsuario.permisos.includes("superadministrador")) {
                console.log(`Error de autenticacion editando nombre de proyecto`);
                throw new AuthenticationError("No autorizado");
            }

            console.log(`Creando un foro para este trabajo`);
            try {
                var nuevoForo: any = await Foro.create({
                    acceso: "privado",
                    miembros: [],
                });
                var idNuevoForo = nuevoForo._id;
                await nuevoForo.save();
            } catch (error) {
                console.log(`Error creando el nuevo foro. E: ${error}`);
                throw new ApolloError("Error conectando con la base de datos");
            }
            console.log(`Nuevo foro creado`);


            try {
                var nuevoTrabajo: any = await new Trabajo({ idProyectoParent: idProyecto, idForoResponsables: idNuevoForo, diagramaProyecto: { posicion } });
                var idNuevoTrabajo = nuevoTrabajo._id;
                await nuevoTrabajo.save();
            } catch (error) {
                console.log(`Error creando el nuevo trabajo. E: ${error}`);
                throw new ApolloError("Error conectando con la base de datos");
            }


            try {
                elProyecto.idsTrabajos.push(idNuevoTrabajo);
                await elProyecto.save();
            }
            catch (error) {
                console.log("Error guardando el trabajo creado en el proyecto. E: " + error);
                throw new ApolloError("Error introduciendo el trabajo en el proyecto");
            }
            return idNuevoTrabajo;
        },
        async eliminarTrabajo(_: any, { idTrabajo, idProyecto }: any, contexto: contextoQuery) {
            console.log(`peticion de eliminar un trabajo con id ${idTrabajo} de un proyecto con id ${idProyecto}`);
            let credencialesUsuario = contexto.usuario;

            try {
                var elProyecto: any = await Proyecto.findById(idProyecto).exec();
                if (!elProyecto) {
                    throw "proyecto no encontrado"
                }
            }
            catch (error) {
                console.log("Error buscando el proyecto en la base de datos. E: " + error);
                throw new ApolloError("Error conectando con la base de datos");
            }

            //Authorización
            let permisosEspeciales = ["superadministrador"];


            if (!elProyecto.responsables.includes(credencialesUsuario.id) && !credencialesUsuario.permisos.some(p => permisosEspeciales.includes(p))) {
                console.log(`Error de autenticacion editando nombre de proyecto`);
                throw new AuthenticationError("No autorizado");
            }


            try {
                await Trabajo.findByIdAndDelete(idTrabajo);
                await Proyecto.findByIdAndUpdate(idProyecto, { $pull: { idsTrabajos: idTrabajo } });
            }
            catch (error) {
                console.log("Error eliminando trabajo. E: " + error);
                throw new ApolloError("Error introduciendo el trabajo en el proyecto");
            }

            console.log(`eliminado`);

            return true;
        },
        async editarNombreTrabajo(_: any, { idTrabajo, nuevoNombre }, contexto: contextoQuery) {

            console.log(`cambiando el nombre del trabajo con id ${idTrabajo}`);
            const charProhibidosNombreTrabajo = /[^ a-zA-ZÀ-ž0-9_():.,-]/;

            nuevoNombre = nuevoNombre.replace(/\s\s+/g, " ");
            if (charProhibidosNombreTrabajo.test(nuevoNombre)) {
                throw new ApolloError("Nombre ilegal");
            }

            nuevoNombre = nuevoNombre.trim();

            try {
                var elTrabajo: any = await Trabajo.findById(idTrabajo).exec();
                if (!elTrabajo) {
                    throw "Trabajo no encontrado"
                }
            }
            catch (error) {
                console.log("Error buscando el trabajo. E: " + error);
                throw new ApolloError("Erro en la conexión con la base de datos");
            }

            var administradores: Array<string> = [];

            if (!elTrabajo.nodoParent || !elTrabajo.nodoParent.idNodo || !elTrabajo.nodoParent.tipo) {
                administradores = elTrabajo.responsables;
            }
            else {
                try {
                    var elNodoParent: any = null;
                    if (elTrabajo.nodoParent.tipo === 'trabajo') {
                        elNodoParent = await Trabajo.findById(elTrabajo.nodoParent.idNodo)
                    }
                    else if (elTrabajo.nodoParent.tipo === 'objetivo') {
                        elNodoParent = await Objetivo.findById(elTrabajo.nodoParent.idNodo)
                    }
                    if (!elNodoParent) throw "Nodo parent no encontrado"
                } catch (error) {
                    console.log(`Error buscando el nodo parent: ${elNodoParent}`);
                    throw new ApolloError("Error conectando con la base de datos");
                }

                administradores = elNodoParent.responsables;
            }

            //Authorización
            let credencialesUsuario = contexto.usuario;
            if (!administradores.includes(credencialesUsuario.id) && !credencialesUsuario.permisos.includes("superadministrador")) {
                console.log(`Error de autenticacion editando nombre de trabajo`);
                throw new AuthenticationError("No autorizado");
            }

            try {
                elTrabajo.nombre = nuevoNombre;
                await elTrabajo.save();
            }
            catch (error) {
                console.log("Error cambiando el nombre en la base de datos. E: " + error);
                throw new ApolloError("Error guardando el nombre en la base de datos");
            }

            console.log(`Nombre cambiado`);
            return elTrabajo;
        },
        async editarDescripcionTrabajo(_: any, { idTrabajo, nuevoDescripcion }, contexto: contextoQuery) {
            const credencialesUsuario = contexto.usuario;

            try {
                var elTrabajo: any = await Trabajo.findById(idTrabajo).exec();
                if (!elTrabajo) {
                    throw "Trabajo no encontrado"
                }
            }
            catch (error) {
                console.log("Error buscando el trabajo. E: " + error);
                throw new ApolloError("Erro en la conexión con la base de datos");
            }

            var administradores: Array<string> = [];

            if (!elTrabajo.nodoParent || !elTrabajo.nodoParent.idNodo || !elTrabajo.nodoParent.tipo) {
                administradores = elTrabajo.responsables;
            }
            else {
                try {
                    var elNodoParent: any = null;
                    if (elTrabajo.nodoParent.tipo === 'trabajo') {
                        elNodoParent = await Trabajo.findById(elTrabajo.nodoParent.idNodo)
                    }
                    else if (elTrabajo.nodoParent.tipo === 'objetivo') {
                        elNodoParent = await Objetivo.findById(elTrabajo.nodoParent.idNodo)
                    }
                    if (!elNodoParent) throw "Nodo parent no encontrado"
                } catch (error) {
                    console.log(`Error buscando el nodo parent: ${elNodoParent}`);
                    throw new ApolloError("Error conectando con la base de datos");
                }

                administradores = elNodoParent.responsables;
            }

            //Authorización
            if (!administradores.includes(credencialesUsuario.id) && !credencialesUsuario.permisos.includes("superadministrador")) {
                console.log(`Error de autenticacion editando nombre de trabajo`);
                throw new AuthenticationError("No autorizado");
            }

            const charProhibidosDescripcionTrabajo = /[^\n\r a-zA-ZÀ-ž0-9_():;.,+¡!¿?@=-]/;

            if (charProhibidosDescripcionTrabajo.test(nuevoDescripcion)) {
                throw new ApolloError("Descripcion ilegal");
            }

            nuevoDescripcion = nuevoDescripcion.trim();

            try {
                elTrabajo.descripcion = nuevoDescripcion;
                console.log(`guardando nuevo descripcion ${nuevoDescripcion} en la base de datos`);
                await elTrabajo.save();
            } catch (error) {
                console.log(`error guardando el trabajo modificado: ${error}`);
                throw new ApolloError("Error guardando información en la base de datos");

            }
            console.log(`Descripcion guardado`);
            return elTrabajo;
        },
        async editarKeywordsTrabajo(_: any, { idProyecto, idTrabajo, nuevoKeywords }, contexto: contextoQuery) {
            let credencialesUsuario = contexto.usuario;
            try {
                var elTrabajo: any = await Trabajo.findById(idTrabajo).exec();
                if (!elTrabajo) {
                    throw "Trabajo no encontrado"
                }
            }
            catch (error) {
                console.log("Error buscando el trabajo. E: " + error);
                throw new ApolloError("Erro en la conexión con la base de datos");
            }

            var administradores: Array<string> = [];

            if (!elTrabajo.nodoParent || !elTrabajo.nodoParent.idNodo || !elTrabajo.nodoParent.tipo) {
                administradores = elTrabajo.responsables;
            }
            else {
                try {
                    var elNodoParent: any = null;
                    if (elTrabajo.nodoParent.tipo === 'trabajo') {
                        elNodoParent = await Trabajo.findById(elTrabajo.nodoParent.idNodo)
                    }
                    else if (elTrabajo.nodoParent.tipo === 'objetivo') {
                        elNodoParent = await Objetivo.findById(elTrabajo.nodoParent.idNodo)
                    }
                    if (!elNodoParent) throw "Nodo parent no encontrado"
                } catch (error) {
                    console.log(`Error buscando el nodo parent: ${elNodoParent}`);
                    throw new ApolloError("Error conectando con la base de datos");
                }

                administradores = elNodoParent.responsables;
            }

            //Authorización
            if (!administradores.includes(credencialesUsuario.id) && !credencialesUsuario.permisos.includes("superadministrador")) {
                console.log(`Error de autenticacion editando nombre de trabajo`);
                throw new AuthenticationError("No autorizado");
            }

            const charProhibidosKeywordsTrabajo = /[^ a-zA-Zñ,]/;

            if (charProhibidosKeywordsTrabajo.test(nuevoKeywords)) {
                throw new ApolloError("Keywords ilegal");
            }

            nuevoKeywords = nuevoKeywords.trim();

            try {
                elTrabajo.keywords = nuevoKeywords;
                console.log(`guardando nuevo keywords ${nuevoKeywords} en la base de datos`);
                await elTrabajo.save();
            } catch (error) {
                console.log(`error guardando el trabajo modificado: ${error}`);
            }
            console.log(`Keywords guardado`);
            return elTrabajo;
        },
        addResponsableTrabajo: async function (_: any, { idTrabajo, idUsuario }: any, contexto: contextoQuery) {
            console.log(`Solicitud de add un usuario con id ${idUsuario} a un trabajo de id ${idTrabajo}`);
            let credencialesUsuario = contexto.usuario;

            try {
                var elTrabajo: any = await Trabajo.findById(idTrabajo).exec();
                if (!elTrabajo) throw "Trabajo no existía";
            } catch (error) {
                console.log('Error buscando el trabajo . E: ' + error);
                throw new ApolloError('Error conectando con la base de datos');
            }

            //Authorización
            if (elTrabajo.responsables.length > 0 && !credencialesUsuario.permisos.includes("superadministrador") && !elTrabajo.responsables.includes(credencialesUsuario.id)) {
                console.log(`Error de autenticacion. Hay ${elTrabajo.responsables.length} responsables: ${elTrabajo.responsables}`);
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

            if (elTrabajo.responsables.includes(idUsuario)) {
                console.log(`El usuario ya era responsable de este trabajo`);
                throw new ApolloError("El usuario ya estaba incluido");
            }

            let indexPosibleResponsable = elTrabajo.posiblesResponsables.indexOf(idUsuario);
            if (indexPosibleResponsable > -1) {
                console.log(`sacando al usuario ${idUsuario} de la lista de posibles responsables`);
                elTrabajo.posiblesResponsables.splice(indexPosibleResponsable, 1);
            }
            else {
                if (elTrabajo.responsables.length > 0) {
                    console.log(`Error. Se intentaba add como responsable un usuario que no estaba en la lista de posibles responsables.`);
                    throw new UserInputError("El usuario no estaba en la lista de espera para responsables.")
                }
            }

            try {
                elTrabajo.responsables.push(idUsuario);
                if (elTrabajo.responsablesSolicitados > 0) elTrabajo.responsablesSolicitados--;
                console.log(`Usuario añadido a la lista de responsables`);
                await elTrabajo.save();
            }
            catch (error) {
                console.log("Error guardando datos en la base de datos. E: " + error);
                throw new ApolloError("Error conectando con la base de datos");
            }
            console.log(`Trabajo guardado`);

            try {
                await Foro.findByIdAndUpdate(elTrabajo.idForoResponsables, { miembros: elTrabajo.responsables });
            } catch (error) {
                console.log(`Error mirroring responsables del proyecto hacia miembros del foro. E: ${error}`);
            }

            return elTrabajo;

        },
        addPosibleResponsableTrabajo: async function (_: any, { idTrabajo, idUsuario }: any, contexto: contextoQuery) {
            console.log(`añadiendo usuario ${idUsuario} a la lista de posibles responsables del trabajo ${idTrabajo}`);
            let credencialesUsuario = contexto.usuario;
            try {
                var elTrabajo: any = await Trabajo.findById(idTrabajo).exec();
                if (!elTrabajo) {
                    throw "trabajo no encontrado"
                }
            }
            catch (error) {
                console.log("Error buscando el trabajo en la base de datos. E: " + error);
                throw new ApolloError("Error de conexión con la base de datos");
            }

            //Authorización

            if (idUsuario != credencialesUsuario.id && !credencialesUsuario.permisos.includes("superadministrador")) {
                console.log(`Error de autenticacion añadiendo posible responsable del trabajo`);
                throw new AuthenticationError("No autorizado");
            }

            if (elTrabajo.posiblesResponsables.includes(idUsuario) || elTrabajo.responsables.includes(idUsuario)) {
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
                elTrabajo.posiblesResponsables.push(idUsuario);
                await elTrabajo.save();
            }
            catch (error) {
                console.log("Error guardando datos en la base de datos. E: " + error);
                throw new ApolloError("Error conectando con la base de datos");
            }
            console.log(`Trabajo guardado`);
            return elTrabajo
        },
        removeResponsableTrabajo: async function (_: any, { idTrabajo, idUsuario }: any, contexto: contextoQuery) {
            console.log(`Solicitud de remove un usuario con id ${idUsuario} de un trabajo de id ${idTrabajo}`);
            let credencialesUsuario = contexto.usuario;

            //Authorización

            if (idUsuario != credencialesUsuario.id && !credencialesUsuario.permisos.includes("superadministrador")) {
                console.log(`Error de autenticacion editando nombre de proyecto`);
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

            try {
                var elTrabajo: any = await Trabajo.findById(idTrabajo).exec();
                if (!elTrabajo) throw "Trabajo no existía";
            } catch (error) {
                console.log('Error buscando el trabajo . E: ' + error);
                throw new ApolloError('Error conectando con la base de datos');
            }

            const indexPosibleResponsable = elTrabajo.posiblesResponsables.indexOf(idUsuario);

            if (indexPosibleResponsable > -1) {
                console.log(`sacando al usuario ${idUsuario} de la lista de posibles responsables`);
                elTrabajo.posiblesResponsables.splice(indexPosibleResponsable, 1);
            }

            const indexResponsable = elTrabajo.responsables.indexOf(idUsuario);

            if (indexResponsable > -1) {
                console.log(`sacando al usuario ${idUsuario} de la lista de responsables`);
                elTrabajo.responsables.splice(indexResponsable, 1);
            }
            console.log(`Usuario retirado de la lista de responsables`);

            try {


                await elTrabajo.save();
                await elUsuario.save();
            }
            catch (error) {
                console.log("Error guardando datos en la base de datos. E: " + error);
                throw new ApolloError("Error conectando con la base de datos");
            }
            console.log(`Trabajo guardado`);

            try {
                await Foro.findByIdAndUpdate(elTrabajo.idForoResponsables, { miembros: elTrabajo.responsables });
            } catch (error) {
                console.log(`Error mirroring responsables del proyecto hacia miembros del foro. E: ${error}`);
            }

            return elTrabajo;
        },
        async setEstadoTrabajo(_: any, { idTrabajo, nuevoEstado }, contexto: contextoQuery) {

            let credencialesUsuario = contexto.usuario;
            try {
                var elTrabajo: any = await Trabajo.findById(idTrabajo).exec();
                if (!elTrabajo) {
                    throw "Trabajo no encontrado"
                }
            }
            catch (error) {
                console.log("Error buscando el trabajo. E: " + error);
                throw new ApolloError("Error en la conexión con la base de datos");
            }

            var administradores: Array<string> = [];

            if (!elTrabajo.nodoParent || !elTrabajo.nodoParent.idNodo || !elTrabajo.nodoParent.tipo) {
                administradores = elTrabajo.responsables;
            }
            else {
                try {
                    var elNodoParent: any = null;
                    if (elTrabajo.nodoParent.tipo === 'trabajo') {
                        elNodoParent = await Trabajo.findById(elTrabajo.nodoParent.idNodo)
                    }
                    else if (elTrabajo.nodoParent.tipo === 'objetivo') {
                        elNodoParent = await Objetivo.findById(elTrabajo.nodoParent.idNodo)
                    }
                    if (!elNodoParent) throw "Nodo parent no encontrado"
                } catch (error) {
                    console.log(`Error buscando el nodo parent: ${elNodoParent}`);
                    throw new ApolloError("Error conectando con la base de datos");
                }

                administradores = elNodoParent.responsables;
            }

            //Authorización
            if (!administradores.includes(credencialesUsuario.id) && !credencialesUsuario.permisos.includes("superadministrador")) {
                console.log(`Error de autenticacion editando nombre de trabajo`);
                throw new AuthenticationError("No autorizado");
            }

            try {
                elTrabajo.estadoDesarrollo = nuevoEstado;
                console.log(`guardando nuevo estado ${nuevoEstado} en la base de datos`);
                await elTrabajo.save();
            } catch (error) {
                console.log(`error guardando el trabajo modificado: ${error}`);
                throw new ApolloError("Error guardando información en la base de datos");

            }
            console.log(`Estado guardado`);
            return elTrabajo;
        },
        setResponsablesSolicitadosTrabajo: async function (_: any, { idTrabajo, nuevoCantidadResponsablesSolicitados }, contexto: contextoQuery) {
            let credencialesUsuario = contexto.usuario;
            console.log(`Solicitud de set cantidad de responsables solicitados de ${nuevoCantidadResponsablesSolicitados} en trabajo con id ${idTrabajo}`);

            try {
                var elTrabajo: any = await Trabajo.findById(idTrabajo).exec();
                if (!elTrabajo) {
                    throw "trabajo no encontrado"
                }
            }
            catch (error) {
                console.log("Error buscando el trabajo en la base de datos. E: " + error);
                throw new ApolloError("Error de conexión con la base de datos");
            }

            if (!credencialesUsuario.permisos.includes("superadministrador") && !elTrabajo.responsables.includes(credencialesUsuario.id)) {
                console.log(`Error de autenticacion editando responsables solicitados.`);
                throw new AuthenticationError("No autorizado");
            }

            elTrabajo.responsablesSolicitados = nuevoCantidadResponsablesSolicitados;

            try {
                await elTrabajo.save();
            } catch (error) {
                console.log(`Error guardando el trabajo: ${error}`);
                throw new ApolloError("Error conectando con la base de datos");
            }
            console.log(`Retornando con ${elTrabajo.responsablesSolicitados} responsables solicitados`);
            return elTrabajo;
        },
        async setPosicionTrabajo(_: any, { idTrabajo, nuevaPosicion }, contexto: contextoQuery) {
            console.log(`Guardando posicion de trabajo en el diagrama del proyecto`);
            const credencialesUsuario = contexto.usuario;

            try {
                var elTrabajo: any = await Trabajo.findById(idTrabajo).exec();
                if (!elTrabajo) {
                    throw "Trabajo no encontrado"
                }
            }
            catch (error) {
                console.log("Error buscando el trabajo. E: " + error);
                throw new ApolloError("Error en la conexión con la base de datos");
            }

            var administradores: Array<string> = [];

            if (!elTrabajo.nodoParent || !elTrabajo.nodoParent.idNodo || !elTrabajo.nodoParent.tipo) {
                administradores = elTrabajo.responsables;
            }
            else {
                try {
                    var elNodoParent: any = null;
                    if (elTrabajo.nodoParent.tipo === 'trabajo') {
                        elNodoParent = await Trabajo.findById(elTrabajo.nodoParent.idNodo)
                    }
                    else if (elTrabajo.nodoParent.tipo === 'objetivo') {
                        elNodoParent = await Objetivo.findById(elTrabajo.nodoParent.idNodo)
                    }
                    if (!elNodoParent) throw "Nodo parent no encontrado"
                } catch (error) {
                    console.log(`Error buscando el nodo parent: ${elNodoParent}`);
                    throw new ApolloError("Error conectando con la base de datos");
                }

                administradores = elNodoParent.responsables;
            }

            //Authorización
            if (!administradores.includes(credencialesUsuario.id) && !credencialesUsuario.permisos.includes("superadministrador")) {
                console.log(`Error de autenticacion editando nombre de trabajo`);
                throw new AuthenticationError("No autorizado");
            }

            try {
                elTrabajo.coords = nuevaPosicion;
                await elTrabajo.save();
            } catch (error) {
                console.log(`error guardando el trabajo modificado: ${error}`);
            }

            return elTrabajo;

        },

        async crearObjetivoEnProyecto(_: any, { idProyecto, posicion }: any, contexto: contextoQuery) {
            console.log(`Peticion de crear un nuevo objetivo en el proyecto con id ${idProyecto}`);

            try {
                var elProyecto: any = await Proyecto.findById(idProyecto).exec();
                if (!elProyecto) {
                    throw "proyecto no encontrado"
                }
            }
            catch (error) {
                console.log("Proyecto no encontrado. E: " + error);
                throw new ApolloError("Error conectandose con la base de datos");
            }

            //Authorización
            let credencialesUsuario = contexto.usuario;
            if (!elProyecto.responsables.includes(credencialesUsuario.id) && !credencialesUsuario.permisos.includes("superadministrador")) {
                console.log(`Error de autenticacion editando nombre de proyecto`);
                throw new AuthenticationError("No autorizado");
            }

            try {
                var nuevoObjetivo = elProyecto.objetivos.create({
                    coords: posicion
                })
                elProyecto.objetivos.push(nuevoObjetivo);
                await elProyecto.save();
            } catch (error) {
                console.log(`Error creando el nuevo objetivo. E: ${error}`);
                throw new ApolloError("Error conectando con la base de datos");
            }
            return nuevoObjetivo;
        },
        async eliminarObjetivoDeProyecto(_: any, { idObjetivo, idProyecto }: any, contexto: contextoQuery) {
            console.log(`peticion de eliminar un objetivo con id ${idObjetivo} de un proyecto con id ${idProyecto}`);
            let credencialesUsuario = contexto.usuario;

            try {
                var elProyecto: any = await Proyecto.findById(idProyecto).exec();
                if (!elProyecto) {
                    throw "proyecto no encontrado"
                }
            }
            catch (error) {
                console.log("Error buscando el proyecto en la base de datos. E: " + error);
                throw new ApolloError("Error conectando con la base de datos");
            }

            //Authorización
            let permisosEspeciales = ["superadministrador"];


            if (!elProyecto.responsables.includes(credencialesUsuario.id) && !credencialesUsuario.permisos.some(p => permisosEspeciales.includes(p))) {
                console.log(`Error de autenticacion editando nombre de proyecto`);
                throw new AuthenticationError("No autorizado");
            }

            elProyecto.objetivos.pull({ id: idObjetivo });

            try {
                await elProyecto.save();
            }
            catch (error) {
                console.log("Error eliminando objetivo. E: " + error);
                throw new ApolloError("Error introduciendo el objetivo en el proyecto");
            }

            console.log(`eliminado`);

            return true;
        },
        async editarNombreObjetivoProyecto(_: any, { idProyecto, idObjetivo, nuevoNombre }, contexto: contextoQuery) {

            console.log(`cambiando el nombre del objetivo con id ${idObjetivo} del proyecto con id ${idProyecto}`);
            const charProhibidosNombreObjetivo = /[^ a-zA-ZÀ-ž0-9_():.,-]/;

            nuevoNombre = nuevoNombre.replace(/\s\s+/g, " ");
            if (charProhibidosNombreObjetivo.test(nuevoNombre)) {
                throw new ApolloError("Nombre ilegal");
            }

            nuevoNombre = nuevoNombre.trim();

            try {
                var elProyecto: any = await Proyecto.findById(idProyecto).exec();
                if (!elProyecto) {
                    throw "proyecto no encontrado"
                }
            }
            catch (error) {
                console.log("Error buscando el proyecto. E: " + error);
                throw new ApolloError("Erro en la conexión con la base de datos");
            }

            //Authorización
            let credencialesUsuario = contexto.usuario;
            if (!elProyecto.responsables.includes(credencialesUsuario.id) && !credencialesUsuario.permisos.includes("superadministrador")) {
                console.log(`Error de autenticacion editando nombre de proyecto`);
                throw new AuthenticationError("No autorizado");
            }

            var elObjetivo = elProyecto.objetivos.id(idObjetivo)

            try {
                elObjetivo.nombre = nuevoNombre;
                await elProyecto.save();
            }
            catch (error) {
                console.log("Error cambiando el nombre en la base de datos. E: " + error);
                throw new ApolloError("Error guardando el nombre en la base de datos");
            }

            console.log(`Nombre cambiado`);
            return elObjetivo;
        },
        async editarDescripcionObjetivoProyecto(_: any, { idProyecto, idObjetivo, nuevoDescripcion }, contexto: contextoQuery) {
            let credencialesUsuario = contexto.usuario;
            try {
                var elProyecto: any = await Proyecto.findById(idProyecto).exec();
                if (!elProyecto) {
                    throw "proyecto no encontrado"
                }
            }
            catch (error) {
                console.log(`error buscando el proyecto. E: ` + error);
                throw new ApolloError("Error conectando con la base de datos");
            }

            //Authorización
            let permisosEspeciales = ["superadministrador"];
            if (!elProyecto.responsables.includes(credencialesUsuario.id) && !credencialesUsuario.permisos.some(p => permisosEspeciales.includes(p))) {
                console.log(`Error de autenticacion editando Descripcion de proyecto`);
                throw new AuthenticationError("No autorizado");
            }

            const charProhibidosDescripcionObjetivo = /[^\n\r a-zA-ZÀ-ž0-9_():;.,+¡!¿?@=-]/;

            if (charProhibidosDescripcionObjetivo.test(nuevoDescripcion)) {
                throw new ApolloError("Descripcion ilegal");
            }

            nuevoDescripcion = nuevoDescripcion.trim();

            var elObjetivo = elProyecto.objetivos.id(idObjetivo);
            try {
                elObjetivo.descripcion = nuevoDescripcion;
                console.log(`guardando nuevo descripcion ${nuevoDescripcion} en la base de datos`);
                await elProyecto.save();
            } catch (error) {
                console.log(`error guardando el objetivo modificado: ${error}`);
                throw new ApolloError("Error guardando información en la base de datos");

            }
            console.log(`Descripcion guardado`);
            return elObjetivo;
        },
        async editarKeywordsObjetivoProyecto(_: any, { idProyecto, idObjetivo, nuevoKeywords }, contexto: contextoQuery) {
            let credencialesUsuario = contexto.usuario;
            try {
                var elProyecto: any = await Proyecto.findById(idProyecto).exec();
                if (!elProyecto) {
                    throw "proyecto no encontrado"
                }
            }
            catch (error) {
                console.log(`error buscando el proyecto. E: ` + error);
            }

            //Authorización
            let permisosEspeciales = ["superadministrador"];
            if (!elProyecto.responsables.includes(credencialesUsuario.id) && !credencialesUsuario.permisos.some(p => permisosEspeciales.includes(p))) {
                console.log(`Error de autenticacion editando Keywords de proyecto`);
                throw new AuthenticationError("No autorizado");
            }

            const charProhibidosKeywordsObjetivo = /[^ a-zA-Zñ,]/;

            if (charProhibidosKeywordsObjetivo.test(nuevoKeywords)) {
                throw new ApolloError("Keywords ilegal");
            }

            nuevoKeywords = nuevoKeywords.trim();

            var elObjetivo = elProyecto.objetivos.id(idObjetivo);

            try {

                elObjetivo.keywords = nuevoKeywords;
                console.log(`guardando nuevo keywords ${nuevoKeywords} en la base de datos`);
                await elProyecto.save();
            } catch (error) {
                console.log(`error guardando el objetivo modificado: ${error}`);
            }
            console.log(`Keywords guardado`);
            return elObjetivo;
        },
        addResponsableObjetivoProyecto: async function (_: any, { idProyecto, idObjetivo, idUsuario }: any, contexto: contextoQuery) {
            console.log(`Solicitud de add un usuario con id ${idUsuario} a un objetivo de id ${idObjetivo}`);
            let credencialesUsuario = contexto.usuario;

            try {
                var elProyecto: any = await Proyecto.findById(idProyecto).exec();
                if (!elProyecto) {
                    throw "proyecto no encontrado"
                }
            }
            catch (error) {
                console.log("Proyecto no encontrado. E: " + error);
                throw new ApolloError("Error conectandose con la base de datos");
            }


            //Authorización
            if (!elProyecto.responsables.includes(credencialesUsuario.id) && !credencialesUsuario.permisos.includes("superadministrador")) {
                console.log(`Error de autenticacion editando nombre de proyecto`);
                throw new AuthenticationError("No autorizado");
            }

            var elObjetivo = elProyecto.objetivos.id(idObjetivo);

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

            if (elObjetivo.responsables.includes(idUsuario)) {
                console.log(`El usuario ya era responsable de este objetivo`);
                throw new ApolloError("El usuario ya estaba incluido");
            }

            let indexPosibleResponsable = elObjetivo.posiblesResponsables.indexOf(idUsuario);
            if (indexPosibleResponsable > -1) {
                console.log(`sacando al usuario ${idUsuario} de la lista de posibles responsables`);
                elObjetivo.posiblesResponsables.splice(indexPosibleResponsable, 1);
            }

            try {


                elObjetivo.responsables.push(idUsuario);
                if (elObjetivo.responsablesSolicitados > 0) elObjetivo.responsablesSolicitados--;

                console.log(`Usuario añadido a la lista de responsables`);
                await elProyecto.save();
            }
            catch (error) {
                console.log("Error guardando datos en la base de datos. E: " + error);
                throw new ApolloError("Error conectando con la base de datos");
            }
            console.log(`Objetivo guardado`);

            return elObjetivo;

        },
        addPosibleResponsableObjetivoProyecto: async function (_: any, { idProyecto, idObjetivo, idUsuario }: any, contexto: contextoQuery) {
            console.log(`añadiendo usuario ${idUsuario} a la lista de posibles responsables del objetivo ${idObjetivo}`);
            let credencialesUsuario = contexto.usuario;

            try {
                var elProyecto: any = await Proyecto.findById(idProyecto).exec();
                if (!elProyecto) {
                    throw "proyecto no encontrado"
                }
            }
            catch (error) {
                console.log("Proyecto no encontrado. E: " + error);
                throw new ApolloError("Error conectandose con la base de datos");
            }


            //Authorización
            if (!elProyecto.responsables.includes(credencialesUsuario.id) && !credencialesUsuario.permisos.includes("superadministrador")) {
                console.log(`Error de autenticacion editando nombre de proyecto`);
                throw new AuthenticationError("No autorizado");
            }

            var elObjetivo = elProyecto.objetivos.id(idObjetivo);

            if (elObjetivo.posiblesResponsables.includes(idUsuario) || elObjetivo.responsables.includes(idUsuario)) {
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
                var elProyecto: any = await Proyecto.findById(idProyecto).exec();
                if (!elProyecto) {
                    throw "proyecto no encontrado"
                }
            }
            catch (error) {
                console.log("Proyecto no encontrado. E: " + error);
                throw new ApolloError("Error conectandose con la base de datos");
            }

            console.log(`Objetivo guardado`);
            return elObjetivo
        },
        removeResponsableObjetivoProyecto: async function (_: any, { idProyecto, idObjetivo, idUsuario }: any, contexto: contextoQuery) {
            console.log(`Solicitud de remove un usuario con id ${idUsuario} de un objetivo de id ${idObjetivo}`);
            let credencialesUsuario = contexto.usuario;

            //Authorización

            if (idUsuario != credencialesUsuario.id && !credencialesUsuario.permisos.includes("superadministrador")) {
                console.log(`Error de autenticacion editando nombre de proyecto`);
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

            try {
                var elProyecto: any = await Proyecto.findById(idProyecto).exec();
                if (!elProyecto) {
                    throw "proyecto no encontrado"
                }
            }
            catch (error) {
                console.log("Proyecto no encontrado. E: " + error);
                throw new ApolloError("Error conectandose con la base de datos");
            }

            var elObjetivo = elProyecto.objetivos.id(idObjetivo)

            const indexPosibleResponsable = elObjetivo.posiblesResponsables.indexOf(idUsuario);

            if (indexPosibleResponsable > -1) {
                console.log(`sacando al usuario ${idUsuario} de la lista de posibles responsables`);
                elObjetivo.posiblesResponsables.splice(indexPosibleResponsable, 1);
            }

            const indexResponsable = elObjetivo.responsables.indexOf(idUsuario);

            if (indexResponsable > -1) {
                console.log(`sacando al usuario ${idUsuario} de la lista de responsables`);
                elObjetivo.responsables.splice(indexResponsable, 1);
            }
            console.log(`Usuario retirado de la lista de responsables`);

            try {
                await elProyecto.save();
            }
            catch (error) {
                console.log("Error guardando datos en la base de datos. E: " + error);
                throw new ApolloError("Error conectando con la base de datos");
            }
            console.log(`Objetivo guardado`);

            return elObjetivo;
        },
        setPosicionObjetivoProyecto: async function (_: any, { idProyecto, idObjetivo, nuevaPosicion }, contexto: contextoQuery) {
            console.log(`Solicitud de set posicion de objetivo en el diagrama del proyecto`);

            let credencialesUsuario = contexto.usuario;
            try {
                var elProyecto: any = await Proyecto.findById(idProyecto).exec();
                if (!elProyecto) {
                    throw "proyecto no encontrado"
                }
            }
            catch (error) {
                console.log(`error buscando el proyecto. E: ` + error);
            }

            //Authorización
            let permisosEspeciales = ["superadministrador"];
            if (!elProyecto.responsables.includes(credencialesUsuario.id) && !credencialesUsuario.permisos.some(p => permisosEspeciales.includes(p))) {
                console.log(`Error de autenticacion editando Descripcion de proyecto`);
                throw new AuthenticationError("No autorizado");
            }

            var elObjetivo = elProyecto.objetivos.id(idObjetivo)

            try {
                elObjetivo.coords = nuevaPosicion;
                await elProyecto.save();
            } catch (error) {
                console.log(`error guardando el objetivo modificado: ${error}`);
            }

            return elObjetivo;

        },
        async setEstadoObjetivoProyecto(_: any, { idProyecto, idObjetivo, nuevoEstado }, contexto: contextoQuery) {
            let credencialesUsuario = contexto.usuario;
            try {
                var elProyecto: any = await Proyecto.findById(idProyecto).exec();
                if (!elProyecto) {
                    throw "proyecto no encontrado"
                }
            }
            catch (error) {
                console.log(`error buscando el proyecto. E: ` + error);
                throw new ApolloError("Error conectando con la base de datos");
            }

            //Authorización
            let permisosEspeciales = ["superadministrador"];
            if (!elProyecto.responsables.includes(credencialesUsuario.id) && !credencialesUsuario.permisos.some(p => permisosEspeciales.includes(p))) {
                console.log(`Error de autenticacion editando Estado de proyecto`);
                throw new AuthenticationError("No autorizado");
            }

            var elObjetivo = elProyecto.objetivos.id(idObjetivo);
            try {
                elObjetivo.estadoDesarrollo = nuevoEstado;
                console.log(`guardando nuevo estado ${nuevoEstado} en la base de datos`);
                await elProyecto.save();
            } catch (error) {
                console.log(`error guardando el objetivo modificado: ${error}`);
                throw new ApolloError("Error guardando información en la base de datos");

            }
            console.log(`Estado guardado`);
            return elObjetivo;
        },


        async crearMaterialEnTrabajoDeProyecto(_: any, { idProyecto, idTrabajo }: any, contexto: contextoQuery) {
            console.log(`Peticion de crear un nuevo material en el trabajo con id ${idTrabajo}`);

            //Authorización
            let credencialesUsuario = contexto.usuario;

            if (!credencialesUsuario.id) {
                console.log(`Usuario no autenticado`);
                throw new AuthenticationError("No autorizado");
            }

            try {
                var elTrabajo: any = await Trabajo.findById(idTrabajo).exec();
                if (!elTrabajo) throw "Trabajo no encontrado"
            } catch (error) {
                console.log(`Error buscando el trabajo. E: ${error}`);
                throw new ApolloError("Error conectando con la base de datos");
            }

            try {
                var nuevoMaterial = elTrabajo.materiales.create();
                elTrabajo.materiales.push(nuevoMaterial);
                await elTrabajo.save();
            }
            catch (error) {
                console.log("Error guardando el material creado en el trabajo. E: " + error);
                throw new ApolloError("Error introduciendo el material en el trabajo");
            }

            console.log(`Enviando nuevo material: ${nuevoMaterial}`);
            return nuevoMaterial;
        },
        async editarNombreMaterialTrabajo(_: any, { idTrabajo, idMaterial, nuevoNombre }, contexto: contextoQuery) {

            console.log(`cambiando el nombre del material con id ${idMaterial} del trabajo con id ${idTrabajo}`);
            const charProhibidosNombreMaterial = /[^ a-zA-ZÀ-ž0-9_():.,-]/;

            nuevoNombre = nuevoNombre.replace(/\s\s+/g, " ");
            if (charProhibidosNombreMaterial.test(nuevoNombre)) {
                throw new ApolloError("Nombre ilegal");
            }

            nuevoNombre = nuevoNombre.trim();

            try {
                var elTrabajo: any = await Trabajo.findById(idTrabajo).exec();
                if (!elTrabajo) {
                    throw "trabajo no encontrado"
                }
            }
            catch (error) {
                console.log("Error buscando el trabajo. E: " + error);
                throw new ApolloError("Erro en la conexión con la base de datos");
            }

            //Authorización
            let credencialesUsuario = contexto.usuario;
            if (!elTrabajo.responsables.includes(credencialesUsuario.id) && !credencialesUsuario.permisos.includes("superadministrador")) {
                console.log(`Error de autenticacion editando nombre de trabajo`);
                throw new AuthenticationError("No autorizado");
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
                throw new ApolloError("Error guardando el nombre en la base de datos");
            }
            try {
                await elTrabajo.save();
            }
            catch (error) {
                console.log("Error guardando el material creado en el trabajo. E: " + error);
                throw new ApolloError("Error introduciendo el material en el trabajo");
            }
            console.log(`Nombre cambiado`);
            return elMaterial;
        },
        async editarDescripcionMaterialTrabajo(_: any, { idTrabajo, idMaterial, nuevoDescripcion }, contexto: contextoQuery) {
            console.log(`|||||||||||||||||||`);
            console.log(`Solicitud de set descripcion de material con id ${idMaterial} del trabajo con id ${idTrabajo}`);
            let credencialesUsuario = contexto.usuario;
            try {
                var elTrabajo: any = await Trabajo.findById(idTrabajo).exec();
                if (!elTrabajo) {
                    throw "trabajo no encontrado"
                }
            }
            catch (error) {
                console.log(`error buscando el trabajo. E: ` + error);
            }

            //Authorización
            let permisosEspeciales = ["superadministrador"];
            if (!elTrabajo.responsables.includes(credencialesUsuario.id) && !credencialesUsuario.permisos.some(p => permisosEspeciales.includes(p))) {
                console.log(`Error de autenticacion editando Descripcion de trabajo`);
                throw new AuthenticationError("No autorizado");
            }

            const charProhibidosDescripcionMaterial = /[^\n\r a-zA-ZÀ-ž0-9_():;.,+¡!¿?@=-]/;

            if (charProhibidosDescripcionMaterial.test(nuevoDescripcion)) {
                throw new ApolloError("Descripcion ilegal");
            }

            nuevoDescripcion = nuevoDescripcion.trim();
            let elMaterial = elTrabajo.materiales.id(idMaterial);
            if (!elMaterial) {
                console.log(`No existía el material`);
                throw new ApolloError("Error conectando con la base de datos");
            }
            elMaterial.descripcion = nuevoDescripcion;
            try {
                console.log(`guardando nuevo descripcion ${nuevoDescripcion} en la base de datos`);
                await elTrabajo.save();
            } catch (error) {
                console.log(`error guardando el trabajo con coordenadas manuales: ${error}`);
                throw new ApolloError("Error guardando información en la base de datos");
            }
            console.log(`Descripcion guardado`);
            return elMaterial;
        },
        async editarCantidadesMaterialTrabajo(_: any, { idTrabajo, idMaterial, nuevoCantidadNecesaria, nuevoCantidadDisponible }, contexto: contextoQuery) {
            console.log(`|||||||||||||||||||`);
            console.log(`Solicitud de set cantidades de material con id ${idMaterial} del trabajo con id ${idTrabajo}`);
            let credencialesUsuario = contexto.usuario;
            try {
                var elTrabajo: any = await Trabajo.findById(idTrabajo).exec();
                if (!elTrabajo) {
                    throw "trabajo no encontrado"
                }
            }
            catch (error) {
                console.log(`error buscando el trabajo. E: ` + error);
            }

            //Authorización
            let permisosEspeciales = ["superadministrador"];
            if (!elTrabajo.responsables.includes(credencialesUsuario.id) && !credencialesUsuario.permisos.some(p => permisosEspeciales.includes(p))) {
                console.log(`Error de autenticacion editando Descripcion de trabajo`);
                throw new AuthenticationError("No autorizado");
            }

            //Validacion

            nuevoCantidadNecesaria = parseInt(nuevoCantidadNecesaria);
            nuevoCantidadDisponible = parseInt(nuevoCantidadDisponible);

            if (nuevoCantidadDisponible < 0 || nuevoCantidadNecesaria < 0) {
                throw new UserInputError("Datos no válidos");
            }

            let elMaterial = elTrabajo.materiales.id(idMaterial);
            if (!elMaterial) {
                console.log(`No existía el material`);
                throw new ApolloError("Error conectando con la base de datos");
            }
            elMaterial.cantidadNecesaria = nuevoCantidadNecesaria;
            elMaterial.cantidadDisponible = nuevoCantidadDisponible;

            try {
                await elTrabajo.save();
            } catch (error) {
                console.log(`error guardando el trabajo con coordenadas manuales: ${error}`);
                throw new ApolloError("Error guardando información en la base de datos");
            }
            console.log(`Cantidades guardado`);
            return elMaterial;
        },
        async eliminarMaterialDeTrabajo(_: any, { idMaterial, idTrabajo }: any, contexto: contextoQuery) {
            console.log(`peticion de eliminar un material con id ${idMaterial} de un trabajo con id ${idTrabajo}`);
            let credencialesUsuario = contexto.usuario;

            try {
                var elTrabajo: any = await Trabajo.findById(idTrabajo).exec();
                if (!elTrabajo) {
                    throw "trabajo no encontrado"
                }
            }
            catch (error) {
                console.log("Error buscando el trabajo en la base de datos. E: " + error);
                throw new ApolloError("Error conectando con la base de datos");
            }

            //Authorización
            let permisosEspeciales = ["superadministrador"];


            if (!elTrabajo.responsables.includes(credencialesUsuario.id) && !credencialesUsuario.permisos.some(p => permisosEspeciales.includes(p))) {
                console.log(`Error de autenticacion editando nombre de trabajo`);
                throw new AuthenticationError("No autorizado");
            }


            try {
                await Trabajo.findByIdAndUpdate(idTrabajo, { $pull: { materiales: { "_id": idMaterial } } });
            }
            catch (error) {
                console.log("Error eliminando el material. E: " + error);
                throw new ApolloError("Error conectando con la base de datos");
            }

            console.log(`eliminado`);

            return true;
        },

    },

    NodoDeTrabajos: {
        __resolveType(nodo: any) {
            console.log("Resolviendo tipo de nodo con tipoNodo " + nodo.tipoNodo)
            if (nodo.tipoNodo === "trabajo") {
                return "Trabajo"
            }
            else if (nodo.tipoNodo === "objetivo") {
                return "Objetivo"
            }
        },
    },
    Trabajo: {
        async administradores(nodo: any) {
            if (!nodo.nodoParent || !nodo.nodoParent.idNodo || !nodo.nodoParent.tipo) {
                return nodo.responsables;
            }
            else {
                try {
                    var elNodoParent: any = null;
                    if (nodo.nodoParent.tipo === 'trabajo') {
                        elNodoParent = await Trabajo.findById(nodo.nodoParent.idNodo)
                    }
                    else if (nodo.nodoParent.tipo === 'objetivo') {
                        elNodoParent = await Objetivo.findById(nodo.nodoParent.idNodo)
                    }
                    if (!elNodoParent) throw "Nodo parent no encontrado"
                } catch (error) {
                    console.log(`Error buscando el nodo parent: ${elNodoParent}`);
                    throw new ApolloError("Error conectando con la base de datos");
                }

                return elNodoParent.responsables;
            }
        }
    },
    Objetivo: {
        async administradores(nodo: any) {
            if (!nodo.nodoParent || !nodo.nodoParent.idNodo || !nodo.nodoParent.tipo) {
                return nodo.responsables;
            }
            else {
                try {
                    var elNodoParent: any = null;
                    if (nodo.nodoParent.tipo === 'trabajo') {
                        elNodoParent = await Trabajo.findById(nodo.nodoParent.idNodo)
                    }
                    else if (nodo.nodoParent.tipo === 'objetivo') {
                        elNodoParent = await Objetivo.findById(nodo.nodoParent.idNodo)
                    }
                    if (!elNodoParent) throw "Nodo parent no encontrado"
                } catch (error) {
                    console.log(`Error buscando el nodo parent: ${elNodoParent}`);
                    throw new ApolloError("Error conectando con la base de datos");
                }

                return elNodoParent.responsables;
            }
        }
    }
}