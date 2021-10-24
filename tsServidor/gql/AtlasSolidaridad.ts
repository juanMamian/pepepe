import { ApolloError, AuthenticationError, gql, UserInputError, withFilter } from "apollo-server-express";
import { ModeloUsuario as Usuario } from "../model/Usuario"
import { contextoQuery } from "./tsObjetos"
import { ModeloForo as Foro } from "../model/Foros/Foro"
import { NUEVA_NOTIFICACION_PERSONAL } from "./Usuarios";

import { ModeloObjetivo as Objetivo } from "../model/atlasSolidaridad/Objetivo";
import { ModeloTrabajo as Trabajo } from "../model/atlasSolidaridad/Trabajo";
import { ModeloGrupo as Grupo} from "../model/Grupo"


export const typeDefs = gql`
    input NodoSolidaridadInput{        
        tipo:String,
        nombre: String,        
        coords:CoordsInput,
        vinculos:[vinculoInput]
    }    

    type ResultadoBusquedaNodosSolidaridad{
        trabajos:[Trabajo]
        objetivos:[Objetivo]
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
       enlaces: [EnlaceNodoSolidaridad], 
       vinculos:[VinculoNodoGrupo],
       keywords:String,
       nodoParent:InfoNodoSolidaridad,
       idForoResponsables:ID,
       estadoDesarrollo:String,       
       coords: Coords,
       autoCoords: Coords,
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
       idGrupo:ID
   }

    type MaterialTrabajo{
        id: ID,
        nombre: String,
        descripcion:String,
        cantidadNecesaria:Int,
        cantidadDisponible:Int,    
        idTrabajoParent:ID,
        
    }

    type EnlaceNodoSolidaridad{
        id: ID!, 
        nombre: String,
        descripcion: String,
        link: String,
        tipo: String
    }

   type Trabajo{
       id: ID,       
       nombre: String,
       descripcion:String,
       enlaces: [EnlaceNodoSolidaridad], 
       responsables: [String],
       posiblesResponsables:[String],
       administradores:[String],
       responsablesSolicitados:Int,
       nodoParent:InfoNodoSolidaridad
       nodosConocimiento:[String],
       idForoResponsables:ID,
       diagramaGrupo:InfoDiagramaGrupo,
       vinculos:[VinculoNodoGrupo],
       keywords:String,       
       estadoDesarrollo:String,
       materiales:[MaterialTrabajo],
       estado:String,       
       coords: Coords,
       autoCoords: Coords,
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
       idGrupo:ID
   }

   union NodoDeTrabajos = Trabajo | Objetivo

   extend type Query{
        objetivo(idObjetivo: ID!):Objetivo,
       objetivosSegunCentro(centro: CoordsInput!, radio:Int!):[Objetivo],

       trabajo(idTrabajo: ID!):Trabajo,
       trabajosDeGrupoDeUsuario(idUsuario:ID!):[InfoBasicaTrabajo],
       trabajosSegunCentro(centro: CoordsInput!, radio: Int!):[Trabajo],
       nodosTrabajosSegunCentro(centro:CoordsInput!, radio: Int!):[NodoDeTrabajos],
       todosNodosSolidaridad:[NodoDeTrabajos],
        busquedaAmpliaNodosSolidaridad(palabrasBuscadas:String!):ResultadoBusquedaNodosSolidaridad,
        
        todosMateriales:[MaterialTrabajo],

   }

   extend type Mutation{

    crearMaterialEnTrabajoSolidaridad(idTrabajo:ID!):MaterialTrabajo,
    eliminarMaterialDeTrabajoSolidaridad(idTrabajo:ID!, idMaterial: ID!):Boolean,
    editarNombreMaterialTrabajo(idTrabajo:ID!, idMaterial: ID!, nuevoNombre: String!):MaterialTrabajo,
    editarDescripcionMaterialTrabajo(idTrabajo:ID!, idMaterial: ID!, nuevoDescripcion: String!):MaterialTrabajo,
    editarCantidadesMaterialTrabajo(idTrabajo: ID!, idMaterial:ID!, nuevoCantidadNecesaria:Int!, nuevoCantidadDisponible:Int):MaterialTrabajo,

    crearEnlaceNodoSolidaridad(idNodo:ID!, tipoNodo:String!):EnlaceNodoSolidaridad,
    eliminarEnlaceNodoSolidaridad(idNodo:ID!, tipoNodo:String!, idEnlace:ID!):Boolean,
    editarNombreEnlaceNodoSolidaridad(idNodo:ID!, tipoNodo:String!, idEnlace: ID!, nuevoNombre: String!):EnlaceNodoSolidaridad,
    editarDescripcionEnlaceNodoSolidaridad(idNodo:ID!, tipoNodo:String!, idEnlace: ID!, nuevoDescripcion: String!):EnlaceNodoSolidaridad,
    editarLinkEnlaceNodoSolidaridad(idNodo:ID!, tipoNodo:String!, idEnlace: ID!, nuevoLink: String!):EnlaceNodoSolidaridad,

    crearObjetivo(posicion:CoordsInput):Objetivo,
    eliminarObjetivo(idObjetivo:ID!, idGrupo:ID!):Boolean,
    editarNombreObjetivo(idObjetivo:ID!, nuevoNombre: String!):Objetivo,
    editarDescripcionObjetivo(idObjetivo:ID!, nuevoDescripcion: String!):Objetivo,
    editarKeywordsObjetivo(idObjetivo:ID!, nuevoKeywords: String!):Objetivo,
    addResponsableObjetivo(idObjetivo:ID!,idUsuario:ID!):Objetivo,
    addPosibleResponsableObjetivo(idObjetivo:ID!, idUsuario:ID!):Objetivo,
    removeResponsableObjetivo(idObjetivo:ID!, idUsuario:ID!):Objetivo,
    setEstadoObjetivo(idObjetivo:ID!, nuevoEstado:String!):Objetivo,    
    setResponsablesSolicitadosObjetivo(idObjetivo:ID!, nuevoCantidadResponsablesSolicitados: Int!):Objetivo,
    setPosicionObjetivo(idObjetivo:ID!, nuevaPosicion:CoordsInput):Objetivo,

    crearTrabajo(idGrupo: ID!, posicion:CoordsInput):ID,
    eliminarTrabajo(idTrabajo:ID!, idGrupo:ID!):Boolean,
    editarNombreTrabajo(idTrabajo:ID!, nuevoNombre: String!):Trabajo,
    editarDescripcionTrabajo(idTrabajo:ID!, nuevoDescripcion: String!):Trabajo,
    editarKeywordsTrabajo(idTrabajo:ID!, nuevoKeywords: String!):Trabajo,
    addResponsableTrabajo(idTrabajo:ID!,idUsuario:ID!):Trabajo,
    addPosibleResponsableTrabajo(idTrabajo:ID!, idUsuario:ID!):Trabajo,
    removeResponsableTrabajo(idTrabajo:ID!, idUsuario:ID!):Trabajo,
    setEstadoTrabajo(idTrabajo:ID!, nuevoEstado:String!):Trabajo,    
    setResponsablesSolicitadosTrabajo(idTrabajo:ID!, nuevoCantidadResponsablesSolicitados: Int!):Trabajo,
    setPosicionTrabajo(idTrabajo:ID!, nuevaPosicion:CoordsInput):Trabajo,

    setPosicionNodoSolidaridad(idNodo:ID!, nuevaPosicion:CoordsInput):NodoDeTrabajos,
    eliminarNodoSolidaridad(idNodo:ID!, tipo: String!):Boolean,
    crearNodoSolidaridad(infoNodo:NodoSolidaridadInput!):NodoDeTrabajos,
    crearNodoSolidaridadRequerido(infoNodo:NodoSolidaridadInput!, idNodoRequiriente: ID!):[NodoDeTrabajos],
    desvincularNodosSolidaridad(idUnNodo:ID!, idOtroNodo:ID!):[NodoDeTrabajos],
    crearRequerimentoEntreNodosSolidaridad(idNodoRequiriente:ID!, idNodoRequerido:ID!):[NodoDeTrabajos],
    crearParentingEntreNodosSolidaridad(idNodoRequiriente:ID!, idNodoRequerido:ID!):[NodoDeTrabajos],

   }

   extend type Subscription{
        nodoEditado(centro:CoordsInput!, radio:Int!):NodoDeTrabajos
   }

`;
export const NODO_EDITADO = "nodo_solidaridad_editado";

export const resolvers = {
    Subscription: {
        nodoEditado: {
            subscribe: withFilter(
                (_: any, { centro, radio }: any, contexto: contextoQuery) => {
                    console.log(`--------------------------Creando una subscripción a nodos editados de ${contexto.usuario.username} con centro en ${centro} y de radio ${radio}`);
                    return contexto.pubsub.asyncIterator(NODO_EDITADO)
                },
                (nodoEditado: any, variables, contexto: contextoQuery) => {
                    if (variables.radio === 0) {
                        return true;
                    }
                    if (nodoEditado.nodoEditado.coords.x > variables.centro.x + variables.radio || nodoEditado.nodoEditado.coords.x < variables.centro.x - variables.radio || nodoEditado.nodoEditado.coords.y > variables.centro.y + variables.radio || nodoEditado.nodoEditado.coords.y < variables.centro.y - variables.radio) {
                        console.log(`No se notificara`);
                        return false;
                    }
                    console.log(`Nueva notificacion de un nodo editado para ${contexto.usuario.username}`);
                    return true;
                }
            )
        }
    },
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

            if (!elObjetivo.idForoResponsables) {
                console.log(`El objetivo no tenía foro`);
            }

            return elObjetivo;
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

            try {
                var elTrabajo: any = await Trabajo.findById(idTrabajo).exec();
                if (!elTrabajo) {
                    throw "Trabajo no existía"
                }
            } catch (error) {
                console.log(`error buscando un trabajo. E: ${error}`);
                throw new ApolloError("");
            }

            if (!elTrabajo.idForoResponsables) {
                console.log(`El trabajo no tenía foro`);
            }

            return elTrabajo;
        },
        
        trabajosDeGrupoDeUsuario: async function (_: any, { idUsuario }: any, contexto: contextoQuery) {
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
        },
        todosNodosSolidaridad: async function (_: any, ___: any, __: any) {
            console.log(`Todos nodos solidaridad solicitados`);

            try {
                var losTrabajos: any = await Trabajo.find({}).exec();
                var losObjetivos: any = await Objetivo.find({}).exec();
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
        },

        busquedaAmpliaNodosSolidaridad: async function (_: any, { palabrasBuscadas }, __: any) {
            console.log(`buscando nodos de solidaridad que contengan: ${palabrasBuscadas}`);
            // console.log(`tipo de input: ${typeof (palabrasBuscadas)}`);
            if (palabrasBuscadas.length < 1) {
                console.log(`No habia palabras buscadas`);
            }

            try {
                var losTrabajos: any = await Trabajo.find({ $text: { $search: palabrasBuscadas } }, { score: { $meta: 'textScore' } }).collation({ locale: "en", strength: 1 }).select("nombre descripcion coords").sort({ score: { $meta: 'textScore' } }).limit(20).exec();
                var losObjetivos: any = await Objetivo.find({ $text: { $search: palabrasBuscadas } }, { score: { $meta: 'textScore' } }).collation({ locale: "en", strength: 1 }).select("nombre descripcion coords").sort({ score: { $meta: 'textScore' } }).limit(20).exec();

                losTrabajos.forEach(t => t.tipoNodo = 'trabajo');
                losObjetivos.forEach(o => o.tipoNodo = 'objetivo');
                // var opciones:any = await Nodo.find({ $text: { $search: palabrasBuscadas } }, { score: { $meta: 'textScore' } }).collation({locale:"en", strength:1}).select("nombre descripcion coordsManuales coords").sort({ score: { $meta: 'textScore' } }).limit(10).exec();                

                var opciones = losTrabajos.concat(losObjetivos);
            }
            catch (error) {
                console.log(". E: " + error);
                throw new ApolloError("");
            }
            console.log(`${opciones.length} opciones: ${opciones}`);
            return { trabajos: losTrabajos, objetivos: losObjetivos }
        },

        todosMateriales: async function (_: any, __: any, contexto: contextoQuery) {
            const credencialesUsuario = contexto.usuario;

            try {
                var losTrabajos: any = await Trabajo.find({}).exec();

            } catch (error) {
                console.log(`Error buscando los trabajos`);
                throw new ApolloError("Error conectando con la base de datos");
            }

            var listaMateriales: Array<string> = [];

            losTrabajos.forEach(trabajo => {
                trabajo.materiales.forEach(material => {
                    material.idTrabajoParent = trabajo.id
                })
                listaMateriales = listaMateriales.concat(trabajo.materiales);
            })

            return listaMateriales;
        }
    },

    Mutation: {
       
        async setPosicionNodoSolidaridad(_: any, { idNodo, nuevaPosicion }, contexto: contextoQuery) {
            console.log(`Guardando posicion de nodo en el diagrama del grupo`);
            const credencialesUsuario = contexto.usuario;

            try {
                var tipoDeNodo = 'trabajo'
                var elNodo: any = await Trabajo.findById(idNodo).exec();

                if (!elNodo) {
                    tipoDeNodo = 'objetivo';
                    elNodo = await Objetivo.findById(idNodo).exec();
                }
                if (!elNodo) {
                    tipoDeNodo = '';
                    throw "Nodo no encontrado"
                }
                elNodo.tipoNodo = tipoDeNodo;
            }
            catch (error) {
                console.log("Error buscando el nodo. E: " + error);
                throw new ApolloError("Error en la conexión con la base de datos");
            }

            var administradores: Array<string> = [];

            if (!elNodo.nodoParent || !elNodo.nodoParent.idNodo || !elNodo.nodoParent.tipo) {
                administradores = elNodo.responsables;
            }
            else {
                var idParent=elNodo.nodoParent.idNodo;
                var tipoParent=elNodo.nodoParent.tipo;
                var elNodoParent: any = null;
                do{
                    try {
                        elNodoParent = null;
                        if (tipoParent === 'trabajo') {
                            elNodoParent = await Trabajo.findById(idParent)
                        }
                        else if (tipoParent === 'objetivo') {
                            elNodoParent = await Objetivo.findById(idParent)
                        }
                        if (!elNodoParent) throw "Nodo parent no encontrado"
                    } catch (error) {
                        console.log(`Error buscando el nodo parent de ${elNodo.nombre}: ${elNodoParent}`);
                        throw new ApolloError("Error conectando con la base de datos");
                    }
                    if(elNodoParent.nodoParent){
                        idParent=elNodoParent.nodoParent.idNodo;
                        tipoParent=elNodoParent.nodoParent.tipo;
                    }
                }while(elNodoParent.responsables.length<1 && elNodoParent.nodoParent && elNodoParent.nodoParent.idNodo && elNodoParent.nodoParent.tipo)

                administradores = elNodoParent.responsables;
            }

            //Authorización
            if (!administradores.includes(credencialesUsuario.id) && !credencialesUsuario.permisos.includes("superadministrador")) {
                console.log(`Error de autenticacion editando nombre de nodo`);
                throw new AuthenticationError("No autorizado");
            }

            try {
                elNodo.coords = nuevaPosicion;
                await elNodo.save();
            } catch (error) {
                console.log(`error guardando el nodo modificado: ${error}`);
            }

            return elNodo;

        },
        async eliminarNodoSolidaridad(_: any, { idNodo, tipo }: any, contexto: contextoQuery) {
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

            var administradoresElNodo: Array<string> = [];
            if (!elNodo.nodoParent || !elNodo.nodoParent.idNodo || !elNodo.nodoParent.tipo) {
                administradoresElNodo = elNodo.responsables;
            }
            else {
                    var idNodoParent=elNodo.nodoParent.idNodo;
                    while(administradoresElNodo.length<1 && idNodoParent){//Buscar responsables heredados
                        try {                            
                            var elParent:any=await Trabajo.findById(idNodoParent).exec();
                            if(!elParent){
                                elParent=await Objetivo.findById(idNodoParent).exec();
                            }
                            if(elParent){
                                administradoresElNodo=elParent.responsables;
                                idNodoParent=elParent.nodoParent?elParent.nodoParent.idNodo:null;
                            }
                            else{
                                idNodoParent=null;
                            }
                        } catch (error) {
                            console.log(`Error buscando un parent para heredar responsables: ${error}`);
                        }
                }
                // try {
                //     var elNodoParent: any = null;
                //     if (elNodo.nodoParent.tipo === 'trabajo') {
                //         elNodoParent = await Trabajo.findById(elNodo.nodoParent.idNodo)
                //     }
                //     else if (elNodo.nodoParent.tipo === 'objetivo') {
                //         elNodoParent = await Objetivo.findById(elNodo.nodoParent.idNodo)
                //     }
                //     if (!elNodoParent) throw "Nodo parent no encontrado"
                // } catch (error) {
                //     console.log(`Error buscando el nodo parent: ${elNodoParent}`);
                //     throw new ApolloError("Error conectando con la base de datos");
                // }
                // administradoresElNodo = elNodoParent.responsables;
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

            const permisosAutorizados=["superAdministrador"];
            if(!credencialesUsuario.permisos.some(p=>permisosAutorizados.includes(p))){
                console.log(`Usuario no autorizado`);
                throw new AuthenticationError("No autorizado");
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

            //PUBSUB

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
            } catch (error) {
                console.log(`Error creando el nuevo foro de responsables. E: ${error}`);
                throw new ApolloError("Error conectando con la base de datos");
            }
            console.log(`Nuevo foro de responsables creado (Pero no guardado)`);

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

                    var responsablesAutorizados=nodoRequiriente.responsables;
                    var idNodoParent=nodoRequiriente.nodoParent?nodoRequiriente.nodoParent.idNodo:null;
                    while(responsablesAutorizados.length<1 && idNodoParent){//Buscar responsables heredados
                        try {                            
                            var elParent:any=await Trabajo.findById(idNodoParent).exec();
                            if(!elParent){
                                elParent=await Objetivo.findById(idNodoParent).exec();
                            }
                            if(elParent){
                                responsablesAutorizados=elParent.responsables;
                                idNodoParent=elParent.nodoParent?elParent.nodoParent.idNodo:null;
                            }
                            else{
                                idNodoParent=null;
                            }
                        } catch (error) {
                            console.log(`Error buscando un parent para heredar responsables: ${error}`);
                        }
                    }

                    var nuevoVinculo = nodoRequiriente.vinculos.create({
                        tipo: 'requiere',
                        idRef: nuevoNodo.id,
                        tipoRef: infoNodo.tipo
                    })

                    if (!responsablesAutorizados.includes(credencialesUsuario.id) && !credencialesUsuario.permisos.includes('superadministrador')) {
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
                await nuevoForoResponsables.save();

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
                var tipoUnNodo = 'trabajo'
                var unNodo: any = await Trabajo.findById(idUnNodo).exec();
                if (!unNodo) {
                    tipoUnNodo = 'objetivo';
                    unNodo = await Objetivo.findById(idUnNodo).exec();
                }
                if (!unNodo) throw "Primer nodo no encontrado"

                var tipoOtroNodo = 'trabajo';
                var otroNodo: any = await Trabajo.findById(idOtroNodo).exec();
                if (!otroNodo) {
                    tipoOtroNodo = 'objetivo';
                    otroNodo = await Objetivo.findById(idOtroNodo).exec();
                }
                if (!unNodo) throw "Primer nodo no encontrado"
            } catch (error) {
                console.log(`Error buscando los nodos a desvincular: ${error}`);
                throw new ApolloError("Error conectando con la base de datos");
            }
            const permisosEspeciales = ["superadministrador"];

            var indexUnV = unNodo.vinculos.findIndex(v => v.idRef === idOtroNodo);
            if (indexUnV > -1) {
                if (unNodo.responsables.includes(credencialesUsuario.id) || permisosEspeciales.some(p => credencialesUsuario.permisos.includes(p))) {
                    unNodo.vinculos.splice(indexUnV, 1);
                }
                else {
                    console.log(`Fallo al eliminar el vinculo de ${idUnNodo} requiriendo ${idOtroNodo}`);
                    throw new AuthenticationError("No autorizado");
                }
            }

            var indexOtroV = otroNodo.vinculos.findIndex(v => v.idRef === idUnNodo);
            if (indexOtroV > -1) {
                if (otroNodo.responsables.includes(credencialesUsuario.id) || permisosEspeciales.some(p => credencialesUsuario.permisos.includes(p))) {
                    otroNodo.vinculos.splice(indexOtroV, 1);
                }
                else {
                    console.log(`Fallo al eliminar el vinculo de ${idOtroNodo} requiriendo ${idUnNodo}`);
                    throw new AuthenticationError("No autorizado");
                }
            }

            //Al quedar desvinculados ya no puede haber una relación de administrador:

            if (unNodo.nodoParent && unNodo.nodoParent.idNodo === idOtroNodo) {
                unNodo.nodoParent = {};
            }
            if (otroNodo.nodoParent && otroNodo.nodoParent.idNodo === idUnNodo) {
                otroNodo.nodoParent = {};
            }

            try {
                await unNodo.save();
                await otroNodo.save();
            } catch (error) {
                console.log(`Error guardando los nodos después de la desvinculación: ${error}`);
                throw new ApolloError("Error conectando con la base de datos");
            }
            console.log(`Desvinculados`);
            unNodo.tipoNodo = tipoUnNodo;
            otroNodo.tipoNodo = tipoOtroNodo;
            
            return [unNodo, otroNodo];

        },
        async crearRequerimentoEntreNodosSolidaridad(_: any, { idNodoRequiriente, idNodoRequerido }: any, contexto: contextoQuery) {
            let credencialesUsuario = contexto.usuario;

            console.log(`Query de set que nodo ${idNodoRequiriente} requiere al nodo ${idNodoRequerido}`);

            try {
                var tipoNodoRequiriente = 'trabajo'
                var nodoRequiriente: any = await Trabajo.findById(idNodoRequiriente).exec();
                if (!nodoRequiriente) {
                    tipoNodoRequiriente = 'objetivo';
                    nodoRequiriente = await Objetivo.findById(idNodoRequiriente).exec();
                }
                if (!nodoRequiriente) throw "Nodo requiriente no encontrado"

                var tipoNodoRequerido = 'trabajo';
                var nodoRequerido: any = await Trabajo.findById(idNodoRequerido).exec();
                if (!nodoRequerido) {
                    tipoNodoRequerido = 'objetivo';
                    nodoRequerido = await Objetivo.findById(idNodoRequerido).exec();
                }
                if (!nodoRequerido) throw "Nodo requerido no encontrado"
            } catch (error) {
                console.log(`Error buscando los nodos a desvincular: ${error}`);
                throw new ApolloError("Error conectando con la base de datos");
            }
            //Administradores de nodoRequiriente

            var administradoresNodoRequiriente: Array<string> = [];
            if (!nodoRequiriente.nodoParent || !nodoRequiriente.nodoParent.idNodo || !nodoRequiriente.nodoParent.tipo) {
                administradoresNodoRequiriente = nodoRequiriente.responsables;
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
                administradoresNodoRequiriente = elNodoParent.responsables;
            }

            //Administradores de nodoRequerido

            var administradoresNodoRequerido: Array<string> = [];
            if (!nodoRequerido.nodoParent || !nodoRequerido.nodoParent.idNodo || !nodoRequerido.nodoParent.tipo) {
                administradoresNodoRequerido = nodoRequerido.responsables;
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
                administradoresNodoRequerido = elNodoParent.responsables;
            }


            const permisosEspeciales = ["superadministrador"];
            if (!permisosEspeciales.some(p => credencialesUsuario.permisos.includes(p)) && !nodoRequiriente.responsables.includes(credencialesUsuario.id) && !administradoresNodoRequiriente.includes(credencialesUsuario.id)) {
                console.log(`Fallo en autenticación`);
                throw new AuthenticationError("No autorizado");
            }

            var indexV = nodoRequiriente.vinculos.findIndex(v => v.idRef === idNodoRequerido);
            if (indexV > -1) {
                nodoRequiriente.vinculos.splice(indexV, 1);
            }

            var nuevoVinculo = nodoRequiriente.vinculos.create({
                idRef: idNodoRequerido,
                tipo: "requiere",
                tipoRef: tipoNodoRequerido
            })

            nodoRequiriente.vinculos.push(nuevoVinculo);

            var indexOtroV = nodoRequerido.vinculos.findIndex(v => v.idRef === idNodoRequiriente);
            if (indexOtroV > -1) {
                nodoRequerido.vinculos.splice(indexOtroV, 1);
            }

            //Si el nodo requerido estaba huérfano, entonces lo toma bajo su control

            if ((!nodoRequerido.responsables || nodoRequerido.responsables.length < 1) && (!nodoRequerido.nodoParent || !nodoRequerido.nodoParent.idNodo)) {
                console.log(`El nodo requerido estaba huérfano. Tomando bajo el control del nodo requiriente.`);
                nodoRequerido.nodoParent = {
                    idNodo: idNodoRequiriente,
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
            nodoRequiriente.tipoNodo = tipoNodoRequiriente;
            nodoRequerido.tipoNodo = tipoNodoRequerido;
            
            return [nodoRequiriente, nodoRequerido];

        },
        async crearParentingEntreNodosSolidaridad(_: any, { idNodoRequiriente, idNodoRequerido }: any, contexto: contextoQuery) {
            let credencialesUsuario = contexto.usuario;

            console.log(`Query de set que nodo ${idNodoRequiriente} es parent del nodo ${idNodoRequerido}`);

            try {
                var tipoNodoRequiriente = 'trabajo'
                var nodoRequiriente: any = await Trabajo.findById(idNodoRequiriente).exec();
                if (!nodoRequiriente) {
                    tipoNodoRequiriente = 'objetivo';
                    nodoRequiriente = await Objetivo.findById(idNodoRequiriente).exec();
                }
                if (!nodoRequiriente) throw "Nodo requiriente no encontrado"

                var tipoNodoRequerido = 'trabajo';
                var nodoRequerido: any = await Trabajo.findById(idNodoRequerido).exec();
                if (!nodoRequerido) {
                    tipoNodoRequerido = 'objetivo';
                    nodoRequerido = await Objetivo.findById(idNodoRequerido).exec();
                }
                if (!nodoRequerido) throw "Nodo requerido no encontrado"
            } catch (error) {
                console.log(`Error buscando los nodos a desvincular: ${error}`);
                throw new ApolloError("Error conectando con la base de datos");
            }

            //Autorización

            const permisosEspeciales = ["superadministrador"];
            if (!permisosEspeciales.some(p => credencialesUsuario.permisos.includes(p))) {
                console.log(`Fallo en autenticación`);
                throw new AuthenticationError("No autorizado");
            }

            var indexV = nodoRequiriente.vinculos.findIndex(v => v.idRef === idNodoRequerido);
            if (indexV === -1) {
                console.log(`Error: No había vínculo previo entre estos nodos`);
                throw new UserInputError("Los nodos no estavan vinculados");
            }


            //Si el nodo requerido estaba huérfano, entonces lo toma bajo su control


            console.log(`El nodo requerido queda bajo el control del nodo requiriente.`);
            nodoRequerido.nodoParent = {
                idNodo: idNodoRequiriente,
                tipo: tipoNodoRequiriente
            }

            try {
                await nodoRequiriente.save();
                await nodoRequerido.save();
            } catch (error) {
                console.log(`Error guardando los nodos después de la vinculación: ${error}`);
                throw new ApolloError("Error conectando con la base de datos");
            }
            console.log(`Parented`);
            nodoRequiriente.tipoNodo = tipoNodoRequiriente;
            nodoRequerido.tipoNodo = tipoNodoRequerido;
            
            return [nodoRequiriente, nodoRequerido];

        },

        async crearEnlaceNodoSolidaridad(_: any, { idNodo, tipoNodo }: any, contexto: contextoQuery) {
            console.log(`Peticion de crear un nuevo enlace en el NodoSolidaridad con id ${idNodo}`);

            //Authorización
            let credencialesUsuario = contexto.usuario;

            try {

                var elNodo: any = null;
                if (tipoNodo === 'objetivo') {
                    elNodo = await Objetivo.findById(idNodo).exec();
                }
                else if (tipoNodo === 'trabajo') {
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

            const permisosEspeciales = ["superadministrador"];
            if (!credencialesUsuario.id || (!permisosEspeciales.some(p => credencialesUsuario.permisos.includes(p)) && !elNodo.responsables.includes(credencialesUsuario.id))) {
                console.log(`Error de autenticación`);
                throw new AuthenticationError("No autorizado");
            }

            try {
                var nuevoEnlace = elNodo.enlaces.create();
                elNodo.enlaces.push(nuevoEnlace);
                await elNodo.save();
            }
            catch (error) {
                console.log("Error guardando el enlace creado en el nodo. E: " + error);
                throw new ApolloError("Error introduciendo el enlace en el nodo");
            }

            console.log(`Enviando nuevo enlace: ${nuevoEnlace}`);
            return nuevoEnlace;
        },
        async eliminarEnlaceNodoSolidaridad(_: any, { idNodo, tipoNodo, idEnlace }: any, contexto: contextoQuery) {
            console.log(`Peticion de eliminar un enlace con id ${idEnlace} en el NodoSolidaridad con id ${idNodo}`);

            //Authorización
            let credencialesUsuario = contexto.usuario;

            try {

                var elNodo: any = null;
                if (tipoNodo === 'objetivo') {
                    elNodo = await Objetivo.findById(idNodo).exec();
                }
                else if (tipoNodo === 'trabajo') {
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

            const permisosEspeciales = ["superadministrador"];
            if (!credencialesUsuario.id || (!permisosEspeciales.some(p => credencialesUsuario.permisos.includes(p)) && !elNodo.responsables.includes(credencialesUsuario.id))) {
                console.log(`Error de autenticación`);
                throw new AuthenticationError("No autorizado");
            }

            const indexE = elNodo.enlaces.findIndex(e => e.id === idEnlace);

            if (indexE > -1) {
                elNodo.enlaces.splice(indexE, 1);
            }
            else {
                console.log(`Error. El enlace a eliminar no existía.`);
                throw new UserInputError("Enlace no encontrado");
            }

            try {
                await elNodo.save();
            }
            catch (error) {
                console.log("Error guardando el nodo. E: " + error);
                throw new ApolloError("Error introduciendo el enlace en el nodo");
            }

            return true;
        },
        async editarNombreEnlaceNodoSolidaridad(_: any, { idNodo, tipoNodo, idEnlace, nuevoNombre }, contexto: contextoQuery) {

            console.log(`cambiando el nombre del enlace con id ${idEnlace} del nodosolidaridad con id ${idNodo}`);
            const charProhibidosNombreEnlace = /[^ a-zA-ZÀ-ž0-9_():.,-]/;

            nuevoNombre = nuevoNombre.replace(/\s\s+/g, " ");
            if (charProhibidosNombreEnlace.test(nuevoNombre)) {
                throw new ApolloError("Nombre ilegal");
            }

            nuevoNombre = nuevoNombre.trim();

            try {
                var elNodo: any = null;
                if (tipoNodo === 'objetivo') {
                    elNodo = await Objetivo.findById(idNodo).exec();
                }
                else if (tipoNodo === 'trabajo') {
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

            //Authorización
            let credencialesUsuario = contexto.usuario;
            if (!elNodo.responsables.includes(credencialesUsuario.id) && !credencialesUsuario.permisos.includes("superadministrador")) {
                console.log(`Error de autenticacion editando nombre de nodosolidaridad`);
                throw new AuthenticationError("No autorizado");
            }

            try {
                var elEnlace = elNodo.enlaces.id(idEnlace);
                if (!elEnlace) {
                    console.log(`Enlace no encontrado en el nodosolidaridad`);
                    throw "No existía el enlace";
                }
                elEnlace.nombre = nuevoNombre;
            }
            catch (error) {
                console.log("Error cambiando el nombre en la base de datos. E: " + error);
                throw new ApolloError("Error guardando el nombre en la base de datos");
            }
            try {
                await elNodo.save();
            }
            catch (error) {
                console.log("Error guardando el enlace creado en el nodosolidaridad. E: " + error);
                throw new ApolloError("Error introduciendo el enlace en el nodosolidaridad");
            }
            console.log(`Nombre cambiado`);
            return elEnlace;
        },
        async editarDescripcionEnlaceNodoSolidaridad(_: any, { idNodo, tipoNodo, idEnlace, nuevoDescripcion }, contexto: contextoQuery) {

            console.log(`cambiando la descripcion del enlace con id ${idEnlace} del nodosolidaridad con id ${idNodo}`);
            const charProhibidosDescripcion = /[^\n\r a-zA-ZÀ-ž0-9_():;.,+¡!¿?@=-]/;

            if (charProhibidosDescripcion.test(nuevoDescripcion)) {
                throw new ApolloError("Descripcion ilegal");
            }

            nuevoDescripcion = nuevoDescripcion.trim();

            try {
                var elNodo: any = null;
                if (tipoNodo === 'objetivo') {
                    elNodo = await Objetivo.findById(idNodo).exec();
                }
                else if (tipoNodo === 'trabajo') {
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

            //Authorización
            let credencialesUsuario = contexto.usuario;
            if (!elNodo.responsables.includes(credencialesUsuario.id) && !credencialesUsuario.permisos.includes("superadministrador")) {
                console.log(`Error de autenticacion editando descripcion de nodosolidaridad`);
                throw new AuthenticationError("No autorizado");
            }

            try {
                var elEnlace = elNodo.enlaces.id(idEnlace);
                if (!elEnlace) {
                    console.log(`Enlace no encontrado en el nodosolidaridad`);
                    throw "No existía el enlace";
                }
                elEnlace.descripcion = nuevoDescripcion;
            }
            catch (error) {
                console.log("Error cambiando el descripcion en la base de datos. E: " + error);
                throw new ApolloError("Error guardando el descripcion en la base de datos");
            }
            try {
                await elNodo.save();
            }
            catch (error) {
                console.log("Error guardando el enlace creado en el nodosolidaridad. E: " + error);
                throw new ApolloError("Error introduciendo el enlace en el nodosolidaridad");
            }
            console.log(`Descripcion cambiado`);
            return elEnlace;
        },
        async editarLinkEnlaceNodoSolidaridad(_: any, { idNodo, tipoNodo, idEnlace, nuevoLink }, contexto: contextoQuery) {

            console.log(`cambiando el link del enlace con id ${idEnlace} del nodosolidaridad con id ${idNodo}`);
            // const charProhibidosLinkEnlace = /[^ a-zA-ZÀ-ž0-9_.-?/=:]/;

            nuevoLink = nuevoLink.replace(/\s\s+/g, " ");
            // if (charProhibidosLinkEnlace.test(nuevoLink)) {
            //     throw new ApolloError("Link ilegal");
            // }

            nuevoLink = nuevoLink.trim();

            try {
                var elNodo: any = null;
                if (tipoNodo === 'objetivo') {
                    elNodo = await Objetivo.findById(idNodo).exec();
                }
                else if (tipoNodo === 'trabajo') {
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

            //Authorización
            let credencialesUsuario = contexto.usuario;
            if (!elNodo.responsables.includes(credencialesUsuario.id) && !credencialesUsuario.permisos.includes("superadministrador")) {
                console.log(`Error de autenticacion editando link de nodosolidaridad`);
                throw new AuthenticationError("No autorizado");
            }

            try {
                var elEnlace = elNodo.enlaces.id(idEnlace);
                if (!elEnlace) {
                    console.log(`Enlace no encontrado en el nodosolidaridad`);
                    throw "No existía el enlace";
                }
                elEnlace.link = nuevoLink;
            }
            catch (error) {
                console.log("Error cambiando el link en la base de datos. E: " + error);
                throw new ApolloError("Error guardando el link en la base de datos");
            }
            try {
                await elNodo.save();
            }
            catch (error) {
                console.log("Error guardando el enlace creado en el nodosolidaridad. E: " + error);
                throw new ApolloError("Error introduciendo el enlace en el nodosolidaridad");
            }
            console.log(`Link cambiado`);
            return elEnlace;
        },

        async crearObjetivo(_: any, { posicion }: any, contexto: contextoQuery) {
            console.log(`Peticion de crear un nuevo objetivo`);

            //Authorización
            let credencialesUsuario = contexto.usuario;
            if (!credencialesUsuario.id || credencialesUsuario.id.length < 2) {
                console.log(`Error de autenticacion editando nombre de grupo`);
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
                var nuevoObjetivo: any = await new Objetivo({ idForoResponsables: idNuevoForo, diagramaGrupo: { posicion } });
                await nuevoObjetivo.save();
            } catch (error) {
                console.log(`Error creando el nuevo objetivo. E: ${error}`);
                throw new ApolloError("Error conectando con la base de datos");
            }
            return nuevoObjetivo;
        },
        async eliminarObjetivo(_: any, { idObjetivo, idGrupo }: any, contexto: contextoQuery) {
            console.log(`peticion de eliminar un objetivo con id ${idObjetivo} de un grupo con id ${idGrupo}`);
            let credencialesUsuario = contexto.usuario;

            try {
                var elGrupo: any = await Grupo.findById(idGrupo).exec();
                if (!elGrupo) {
                    throw "grupo no encontrado"
                }
            }
            catch (error) {
                console.log("Error buscando el grupo en la base de datos. E: " + error);
                throw new ApolloError("Error conectando con la base de datos");
            }

            //Authorización
            let permisosEspeciales = ["superadministrador"];


            if (!elGrupo.responsables.includes(credencialesUsuario.id) && !credencialesUsuario.permisos.some(p => permisosEspeciales.includes(p))) {
                console.log(`Error de autenticacion editando nombre de grupo`);
                throw new AuthenticationError("No autorizado");
            }


            try {
                await Objetivo.findByIdAndDelete(idObjetivo);
                await Grupo.findByIdAndUpdate(idGrupo, { $pull: { idsObjetivos: idObjetivo } });
            }
            catch (error) {
                console.log("Error eliminando objetivo. E: " + error);
                throw new ApolloError("Error introduciendo el objetivo en el grupo");
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
                var idParent=elObjetivo.nodoParent.idNodo;
                var tipoParent=elObjetivo.nodoParent.tipo;
                var elNodoParent: any = null;
                do{
                    try {
                        elNodoParent = null;
                        if (tipoParent === 'trabajo') {
                            elNodoParent = await Trabajo.findById(idParent)
                        }
                        else if (tipoParent === 'objetivo') {
                            elNodoParent = await Objetivo.findById(idParent)
                        }
                        if (!elNodoParent) throw "Nodo parent no encontrado"
                    } catch (error) {
                        console.log(`Error buscando el nodo parent de ${elObjetivo.nombre}: ${elNodoParent}`);
                        throw new ApolloError("Error conectando con la base de datos");
                    }
                    if(elNodoParent.nodoParent){
                        idParent=elNodoParent.nodoParent.idNodo;
                        tipoParent=elNodoParent.nodoParent.tipo;
                    }
                }while(elNodoParent.responsables.length<1 && elNodoParent.nodoParent && elNodoParent.nodoParent.idNodo && elNodoParent.nodoParent.tipo)

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
            elObjetivo.tipoNodo = 'objetivo';
            

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
            else {//Buscar el proximo nodo parent con responsables.
                var idParent=elObjetivo.nodoParent.idNodo;
                var tipoParent=elObjetivo.nodoParent.tipo;
                var elNodoParent: any = null;
                do{
                    try {
                        elNodoParent = null;
                        if (tipoParent === 'trabajo') {
                            elNodoParent = await Trabajo.findById(idParent)
                        }
                        else if (tipoParent === 'objetivo') {
                            elNodoParent = await Objetivo.findById(idParent)
                        }
                        if (!elNodoParent) throw "Nodo parent no encontrado"
                    } catch (error) {
                        console.log(`Error buscando el nodo parent de ${elObjetivo.nombre}: ${elNodoParent}`);
                        throw new ApolloError("Error conectando con la base de datos");
                    }
                    if(elNodoParent.nodoParent){
                        idParent=elNodoParent.nodoParent.idNodo;
                        tipoParent=elNodoParent.nodoParent.tipo;
                    }
                }while(elNodoParent.responsables.length<1 && elNodoParent.nodoParent && elNodoParent.nodoParent.idNodo && elNodoParent.nodoParent.tipo)
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

            elObjetivo.tipoNodo = 'objetivo';
            
            return elObjetivo;
        },
        async editarKeywordsObjetivo(_: any, { idGrupo, idObjetivo, nuevoKeywords }, contexto: contextoQuery) {
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
                var idParent=elObjetivo.nodoParent.idNodo;
                var tipoParent=elObjetivo.nodoParent.tipo;
                var elNodoParent: any = null;
                do{
                    try {
                        elNodoParent = null;
                        if (tipoParent === 'trabajo') {
                            elNodoParent = await Trabajo.findById(idParent)
                        }
                        else if (tipoParent === 'objetivo') {
                            elNodoParent = await Objetivo.findById(idParent)
                        }
                        if (!elNodoParent) throw "Nodo parent no encontrado"
                    } catch (error) {
                        console.log(`Error buscando el nodo parent de ${elObjetivo.nombre}: ${elNodoParent}`);
                        throw new ApolloError("Error conectando con la base de datos");
                    }
                    if(elNodoParent.nodoParent){
                        idParent=elNodoParent.nodoParent.idNodo;
                        tipoParent=elNodoParent.nodoParent.tipo;
                    }
                }while(elNodoParent.responsables.length<1 && elNodoParent.nodoParent && elNodoParent.nodoParent.idNodo && elNodoParent.nodoParent.tipo)

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
                console.log(`Error mirroring responsables del grupo hacia miembros del foro. E: ${error}`);
            }
            elObjetivo.tipoNodo = 'objetivo';
            

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
            elObjetivo.tipoNodo = 'objetivo';            

            //Crear notificacion para los responsables actuales del objetivo

            try {
                var currentResponsables: any = await Usuario.find({ _id: { $in: elObjetivo.responsables } }).exec();
            } catch (error) {
                console.log('Error buscando current responsables: ' + error);
            }

            if (currentResponsables) {
                console.log("Se creará notificación de usuario para " + currentResponsables.length + " responsables actuales")
                currentResponsables.forEach(async (responsable) => {
                    let newNotificacion = responsable.notificaciones.create({
                        texto: "Nueva solicitud de participación en un nodo de solidaridad del que eres responsable",
                        causante: {
                            tipo: 'persona',
                            id: idUsuario
                        },
                        elementoTarget: {
                            tipo: 'nodoAtlasSolidaridad',
                            id: elObjetivo.id
                        },
                    });
                    responsable.notificaciones.push(newNotificacion);
                    try {
                        await responsable.save();
                        const pubsub=contexto.pubsub;
                        pubsub.publish(NUEVA_NOTIFICACION_PERSONAL, { idNotificado: responsable.id, nuevaNotificacion: newNotificacion });

                    } catch (error) {
                        console.log("Error guardando el responsable con nueva notificación: " + error)
                    }
                });
            }

            return elObjetivo
        },
        removeResponsableObjetivo: async function (_: any, { idObjetivo, idUsuario }: any, contexto: contextoQuery) {
            console.log(`Solicitud de remove un usuario con id ${idUsuario} de un objetivo de id ${idObjetivo}`);
            let credencialesUsuario = contexto.usuario;

            //Authorización

            if (idUsuario != credencialesUsuario.id && !credencialesUsuario.permisos.includes("superadministrador")) {
                console.log(`Error de autenticacion editando nombre de grupo`);
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
                console.log(`Error mirroring responsables del grupo hacia miembros del foro. E: ${error}`);
            }
            elObjetivo.tipoNodo = 'objetivo';
            

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
                var idParent=elObjetivo.nodoParent.idNodo;
                var tipoParent=elObjetivo.nodoParent.tipo;
                var elNodoParent: any = null;
                do{
                    try {
                        elNodoParent = null;
                        if (tipoParent === 'trabajo') {
                            elNodoParent = await Trabajo.findById(idParent)
                        }
                        else if (tipoParent === 'objetivo') {
                            elNodoParent = await Objetivo.findById(idParent)
                        }
                        if (!elNodoParent) throw "Nodo parent no encontrado"
                    } catch (error) {
                        console.log(`Error buscando el nodo parent de ${elObjetivo.nombre}: ${elNodoParent}`);
                        throw new ApolloError("Error conectando con la base de datos");
                    }
                    if(elNodoParent.nodoParent){
                        idParent=elNodoParent.nodoParent.idNodo;
                        tipoParent=elNodoParent.nodoParent.tipo;
                    }
                }while(elNodoParent.responsables.length<1 && elNodoParent.nodoParent && elNodoParent.nodoParent.idNodo && elNodoParent.nodoParent.tipo)

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
            elObjetivo.tipoNodo = 'objetivo';
            
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
            elObjetivo.tipoNodo = 'objetivo';
            
            return elObjetivo;
        },
        

        async crearTrabajo(_: any, { idGrupo, posicion }: any, contexto: contextoQuery) {
            console.log(`Peticion de crear un nuevo trabajo en el grupo con id ${idGrupo}`);

            try {
                var elGrupo: any = await Grupo.findById(idGrupo).exec();
                if (!elGrupo) {
                    throw "grupo no encontrado"
                }
            }
            catch (error) {
                console.log("Grupo no encontrado. E: " + error);
                throw new ApolloError("Error conectandose con la base de datos");
            }

            //Authorización
            let credencialesUsuario = contexto.usuario;
            if (!elGrupo.responsables.includes(credencialesUsuario.id) && !credencialesUsuario.permisos.includes("superadministrador")) {
                console.log(`Error de autenticacion editando nombre de grupo`);
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
                var nuevoTrabajo: any = await new Trabajo({ idGrupoParent: idGrupo, idForoResponsables: idNuevoForo, diagramaGrupo: { posicion } });
                var idNuevoTrabajo = nuevoTrabajo._id;
                await nuevoTrabajo.save();
            } catch (error) {
                console.log(`Error creando el nuevo trabajo. E: ${error}`);
                throw new ApolloError("Error conectando con la base de datos");
            }


            try {
                elGrupo.idsTrabajos.push(idNuevoTrabajo);
                await elGrupo.save();
            }
            catch (error) {
                console.log("Error guardando el trabajo creado en el grupo. E: " + error);
                throw new ApolloError("Error introduciendo el trabajo en el grupo");
            }
            return idNuevoTrabajo;
        },
        async eliminarTrabajo(_: any, { idTrabajo, idGrupo }: any, contexto: contextoQuery) {
            console.log(`peticion de eliminar un trabajo con id ${idTrabajo} de un grupo con id ${idGrupo}`);
            let credencialesUsuario = contexto.usuario;

            try {
                var elGrupo: any = await Grupo.findById(idGrupo).exec();
                if (!elGrupo) {
                    throw "grupo no encontrado"
                }
            }
            catch (error) {
                console.log("Error buscando el grupo en la base de datos. E: " + error);
                throw new ApolloError("Error conectando con la base de datos");
            }

            //Authorización
            let permisosEspeciales = ["superadministrador"];


            if (!elGrupo.responsables.includes(credencialesUsuario.id) && !credencialesUsuario.permisos.some(p => permisosEspeciales.includes(p))) {
                console.log(`Error de autenticacion editando nombre de grupo`);
                throw new AuthenticationError("No autorizado");
            }


            try {
                await Trabajo.findByIdAndDelete(idTrabajo);
                await Grupo.findByIdAndUpdate(idGrupo, { $pull: { idsTrabajos: idTrabajo } });
            }
            catch (error) {
                console.log("Error eliminando trabajo. E: " + error);
                throw new ApolloError("Error introduciendo el trabajo en el grupo");
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
                var idParent=elTrabajo.nodoParent.idNodo;
                var tipoParent=elTrabajo.nodoParent.tipo;
                var elNodoParent: any = null;
                do{
                    try {
                        elNodoParent = null;
                        if (tipoParent === 'trabajo') {
                            elNodoParent = await Trabajo.findById(idParent)
                        }
                        else if (tipoParent === 'objetivo') {
                            elNodoParent = await Objetivo.findById(idParent)
                        }
                        if (!elNodoParent) throw "Nodo parent no encontrado"
                    } catch (error) {
                        console.log(`Error buscando el nodo parent de ${elTrabajo.nombre}: ${elNodoParent}`);
                        throw new ApolloError("Error conectando con la base de datos");
                    }
                    if(elNodoParent.nodoParent){
                        idParent=elNodoParent.nodoParent.idNodo;
                        tipoParent=elNodoParent.nodoParent.tipo;
                    }
                }while(elNodoParent.responsables.length<1 && elNodoParent.nodoParent && elNodoParent.nodoParent.idNodo && elNodoParent.nodoParent.tipo)

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

            elTrabajo.tipoNodo = 'trabajo';            
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
                throw new ApolloError("Error en la conexión con la base de datos");
            }

            var administradores: Array<string> = [];

            if (!elTrabajo.nodoParent || !elTrabajo.nodoParent.idNodo || !elTrabajo.nodoParent.tipo) {
                administradores = elTrabajo.responsables;
            }
            else {
                var idParent=elTrabajo.nodoParent.idNodo;
                var tipoParent=elTrabajo.nodoParent.tipo;
                var elNodoParent: any = null;
                do{
                    try {
                        elNodoParent = null;
                        if (tipoParent === 'trabajo') {
                            elNodoParent = await Trabajo.findById(idParent)
                        }
                        else if (tipoParent === 'objetivo') {
                            elNodoParent = await Objetivo.findById(idParent)
                        }
                        if (!elNodoParent) throw "Nodo parent no encontrado"
                    } catch (error) {
                        console.log(`Error buscando el nodo parent de ${elTrabajo.nombre}: ${elNodoParent}`);
                        throw new ApolloError("Error conectando con la base de datos");
                    }
                    if(elNodoParent.nodoParent){
                        idParent=elNodoParent.nodoParent.idNodo;
                        tipoParent=elNodoParent.nodoParent.tipo;
                    }
                }while(elNodoParent.responsables.length<1 && elNodoParent.nodoParent && elNodoParent.nodoParent.idNodo && elNodoParent.nodoParent.tipo)

                administradores = elNodoParent.responsables;
            }

            //Authorización
            if (!administradores.includes(credencialesUsuario.id) && !credencialesUsuario.permisos.includes("superadministrador")) {
                console.log(`Error de autenticacion editando descripció de trabajo`);
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
            elTrabajo.tipoNodo = 'trabajo';
            
            return elTrabajo;
        },
        async editarKeywordsTrabajo(_: any, { idGrupo, idTrabajo, nuevoKeywords }, contexto: contextoQuery) {
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
                var idParent=elTrabajo.nodoParent.idNodo;
                var tipoParent=elTrabajo.nodoParent.tipo;
                var elNodoParent: any = null;
                do{
                    try {
                        elNodoParent = null;
                        if (tipoParent === 'trabajo') {
                            elNodoParent = await Trabajo.findById(idParent)
                        }
                        else if (tipoParent === 'objetivo') {
                            elNodoParent = await Objetivo.findById(idParent)
                        }
                        if (!elNodoParent) throw "Nodo parent no encontrado"
                    } catch (error) {
                        console.log(`Error buscando el nodo parent de ${elTrabajo.nombre}: ${elNodoParent}`);
                        throw new ApolloError("Error conectando con la base de datos");
                    }
                    if(elNodoParent.nodoParent){
                        idParent=elNodoParent.nodoParent.idNodo;
                        tipoParent=elNodoParent.nodoParent.tipo;
                    }
                }while(elNodoParent.responsables.length<1 && elNodoParent.nodoParent && elNodoParent.nodoParent.idNodo && elNodoParent.nodoParent.tipo)

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
                console.log(`Error mirroring responsables del grupo hacia miembros del foro. E: ${error}`);
            }
            elTrabajo.tipoNodo = 'trabajo';
            
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
            elTrabajo.tipoNodo = 'trabajo';            

            //Crear notificacion para los responsables actuales del trabajo

            try {
                var currentResponsables: any = await Usuario.find({ _id: { $in: elTrabajo.responsables } }).exec();
            } catch (error) {
                console.log('Error buscando current responsables: ' + error);
            }

            if (currentResponsables) {
                console.log("Se creará notificación de usuario para " + currentResponsables.length + " responsables actuales")
                currentResponsables.forEach(async (responsable) => {
                    let newNotificacion = responsable.notificaciones.create({
                        texto: "Nueva solicitud de participación en un nodo de solidaridad del que eres responsable",
                        causante: {
                            tipo: 'persona',
                            id: idUsuario
                        },
                        elementoTarget: {
                            tipo: 'nodoAtlasSolidaridad',
                            id: elTrabajo.id
                        },
                    });
                    responsable.notificaciones.push(newNotificacion);
                    try {
                        await responsable.save();
                        const pubsub=contexto.pubsub;
                        pubsub.publish(NUEVA_NOTIFICACION_PERSONAL, { idNotificado: responsable.id, nuevaNotificacion: newNotificacion });

                    } catch (error) {
                        console.log("Error guardando el responsable con nueva notificación: " + error)
                    }
                });
            }
            return elTrabajo
        },
        removeResponsableTrabajo: async function (_: any, { idTrabajo, idUsuario }: any, contexto: contextoQuery) {
            console.log(`Solicitud de remove un usuario con id ${idUsuario} de un trabajo de id ${idTrabajo}`);
            let credencialesUsuario = contexto.usuario;

            //Authorización

            if (idUsuario != credencialesUsuario.id && !credencialesUsuario.permisos.includes("superadministrador")) {
                console.log(`Error de autenticacion editando nombre de grupo`);
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
                console.log(`Error mirroring responsables del grupo hacia miembros del foro. E: ${error}`);
            }
            elTrabajo.tipoNodo = 'trabajo';
            
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
                var idParent=elTrabajo.nodoParent.idNodo;
                var tipoParent=elTrabajo.nodoParent.tipo;
                var elNodoParent: any = null;
                do{
                    try {
                        elNodoParent = null;
                        if (tipoParent === 'trabajo') {
                            elNodoParent = await Trabajo.findById(idParent)
                        }
                        else if (tipoParent === 'objetivo') {
                            elNodoParent = await Objetivo.findById(idParent)
                        }
                        if (!elNodoParent) throw "Nodo parent no encontrado"
                    } catch (error) {
                        console.log(`Error buscando el nodo parent de ${elTrabajo.nombre}: ${elNodoParent}`);
                        throw new ApolloError("Error conectando con la base de datos");
                    }
                    if(elNodoParent.nodoParent){
                        idParent=elNodoParent.nodoParent.idNodo;
                        tipoParent=elNodoParent.nodoParent.tipo;
                    }
                }while(elNodoParent.responsables.length<1 && elNodoParent.nodoParent && elNodoParent.nodoParent.idNodo && elNodoParent.nodoParent.tipo)

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
            elTrabajo.tipoNodo = 'trabajo';
            
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
            elTrabajo.tipoNodo = 'trabajo';            
            
            return elTrabajo;
        },
        async setPosicionTrabajo(_: any, { idTrabajo, nuevaPosicion }, contexto: contextoQuery) {
            console.log(`Guardando posicion de trabajo en el diagrama del grupo`);
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
                var idParent=elTrabajo.nodoParent.idNodo;
                var tipoParent=elTrabajo.nodoParent.tipo;
                var elNodoParent: any = null;
                do{
                    try {
                        elNodoParent = null;
                        if (tipoParent === 'trabajo') {
                            elNodoParent = await Trabajo.findById(idParent)
                        }
                        else if (tipoParent === 'objetivo') {
                            elNodoParent = await Objetivo.findById(idParent)
                        }
                        if (!elNodoParent) throw "Nodo parent no encontrado"
                    } catch (error) {
                        console.log(`Error buscando el nodo parent de ${elTrabajo.nombre}: ${elNodoParent}`);
                        throw new ApolloError("Error conectando con la base de datos");
                    }
                    if(elNodoParent.nodoParent){
                        idParent=elNodoParent.nodoParent.idNodo;
                        tipoParent=elNodoParent.nodoParent.tipo;
                    }
                }while(elNodoParent.responsables.length<1 && elNodoParent.nodoParent && elNodoParent.nodoParent.idNodo && elNodoParent.nodoParent.tipo)

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

        async crearMaterialEnTrabajoSolidaridad(_: any, { idTrabajo }: any, contexto: contextoQuery) {
            console.log(`Peticion de crear un nuevo material en el trabajo con id ${idTrabajo}`);

            //Authorización
            let credencialesUsuario = contexto.usuario;

            try {
                var elTrabajo: any = await Trabajo.findById(idTrabajo).exec();
                if (!elTrabajo) throw "Trabajo no encontrado"
            } catch (error) {
                console.log(`Error buscando el trabajo. E: ${error}`);
                throw new ApolloError("Error conectando con la base de datos");
            }



            const permisosEspeciales = ["superadministrador"];
            if (!credencialesUsuario.id || (!permisosEspeciales.some(p => credencialesUsuario.permisos.includes(p)) && !elTrabajo.responsables.includes(credencialesUsuario.id))) {
                console.log(`Error de autenticación`);
                throw new AuthenticationError("No autorizado");
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
        async eliminarMaterialDeTrabajoSolidaridad(_: any, { idMaterial, idTrabajo }: any, contexto: contextoQuery) {
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
                var idParent = nodo.nodoParent.idNodo;
                var tipoParent = nodo.nodoParent.tipo;
                var elNodoParent: any = null;
                do {
                    try {
                        elNodoParent = null;
                        if (tipoParent === 'trabajo') {
                            elNodoParent = await Trabajo.findById(idParent)
                        }
                        else if (tipoParent === 'objetivo') {
                            elNodoParent = await Objetivo.findById(idParent)
                        }
                        if (!elNodoParent) throw "Nodo parent no encontrado"
                    } catch (error) {
                        console.log(`Error buscando el nodo parent de ${nodo.nombre}: ${elNodoParent}`);
                        throw new ApolloError("Error conectando con la base de datos");
                    }
                    if (elNodoParent.nodoParent) {
                        idParent = elNodoParent.nodoParent.idNodo;
                        tipoParent = elNodoParent.nodoParent.tipo;
                    }
                } while (elNodoParent.responsables.length < 1 && elNodoParent.nodoParent && elNodoParent.nodoParent.idNodo && elNodoParent.nodoParent.tipo)


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