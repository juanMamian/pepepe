import { ApolloError, AuthenticationError, gql, UserInputError } from "apollo-server-express";
import { withFilter } from "graphql-subscriptions";
import { ModeloAdministracionAtlas as AdministracionAtlas } from "../model/atlasSolidaridad/AdministracionAtlasSolidaridad";
import { ModeloUsuario as Usuario } from "../model/Usuario"
import { contextoQuery } from "./tsObjetos"
import { NUEVA_NOTIFICACION_PERSONAL } from "./Usuarios";
import { ejecutarPosicionamientoNodosSolidaridadByFuerzas } from "../control"
import { ModeloNodoSolidaridad as NodoSolidaridad, charProhibidosNombreRecursoExterno } from "../model/atlasSolidaridad/NodoSolidaridad";
import { isContext } from "vm";
const charProhibidosDescripcion = /[^\n\r a-zA-ZÀ-ž0-9_()":;.,+¡!¿?@=-]/;
const charProhibidosTexto = /[^\n\r a-zA-ZÀ-ž0-9_()":;.,+¡!¿?@=-]/;


export const typeDefs = gql`    

    input NodoSolidaridadInput{        
        tipoNodo:String,
        nombre: String,        
        coords:CoordsInput,
        vinculos:[vinculoInput]
    }    

    
    type InfoNodoSolidaridad{
        idNodo: ID        
        tipoNodo:String,
    }     

    type ItemsAdministracionNodoSolidaridad{
        movimientosDinero:[MovimientoDineroNodoSolidaridad]
    }

    type MovimientoDineroNodoSolidaridad{
        id: ID,
        fecha:Date,
        articulo: String,
        unidad:String,
        movimientoUnitario:Float,
        cantidad:Int,
        movimientoTotal:Float,   
        realizado:Boolean, 
        informacion:String,            
    }

    type EventoNodoSolidaridad{
        id: ID,
        fecha: Date,
        nombre: String,
        tipo:String,
        descripcion: String,
    }

    type RecursoExternoNodoSolidaridad{
        id: ID!, 
        nombre: String,
        descripcion: String,
        link: String,
        tipo: String
    }

   type NodoSolidaridad{
       id: ID,       
       nombre: String,
       descripcion:String,
       tipoNodo:String,
       recursosExternos: [RecursoExternoNodoSolidaridad], 
       responsables: [String],
       responsablesAmplio:[String],
       posiblesResponsables:[String],
       administradores:[String],
       responsablesSolicitados:Int,
       nodoParent:ID,       
       idForoResponsables:ID,       
       vinculos:[VinculoNodoSolidaridad],
       keywords:String,       
       estadoDesarrollo:String,
       movimientosDinero:[MovimientoDineroNodoSolidaridad],
       eventos: [EventoNodoSolidaridad]
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
       fuerzaColision: FuerzaPolar,
       fuerzaCentroMasa: FuerzaPolar
   }   

   type VinculoNodoSolidaridad{
        id:ID,
        idRef:ID,
        tipo:String,        
    }
    type ResultadoCrearNodoSolidaridadUnderNodo{
        nodosModificados: [NodoSolidaridad],
        nuevoNodo:NodoSolidaridad,
        usuariosModificados: [Usuario],
    }

    type ResultadoOperacionNodosAtlas{
        nodosModificados:[NodoSolidaridad],
        usuariosModificados:[Usuario],
    }

    type NodoAtlasSolidaridad{
        nodoSolidaridad: NodoSolidaridad,
        persona: Usuario
    }

    input InfoNodoDeAtlasSolidaridad{
        id: ID,
        tipo:String,
    }

    type NodosAtlasSolidaridadByType{
        nodosSolidaridad:[NodoSolidaridad],
        personas: [Usuario]
    }

    input vinculoInput{
    id:ID,
    tipo: String,
    idRef: ID,    
    }
   
   extend type Query{    
    nodosSolidaridad:[NodoSolidaridad],
    personas:[Usuario],        
    nodoSolidaridad(idNodo: ID!):NodoSolidaridad,
    nodosSolidaridadUsuario(idUsuario:ID!, incluirCompletados: Boolean):[NodoSolidaridad],    
    nodosSolidaridadByIds(idsNodos:[ID!]):[NodoSolidaridad],    
    nodosSolidaridadSegunCentro(centro:CoordsInput!, radio: Int!):[NodoSolidaridad],
    nodosSolidaridadRecursiveChildrenDeNodo(idParent:ID!):[NodoSolidaridad],
    nodosSolidaridadUnderNodo(idParent:ID!):[NodoSolidaridad],
    nodoAtlasSolidaridadByIdAndTipo(idNodo:ID!, tipoNodo:String!):NodoAtlasSolidaridad
    todosNodosSolidaridad:[NodoSolidaridad],
    nodosSolidaridadPropios:[NodoSolidaridad],
    nodosSolidaridadRoot:[NodoSolidaridad],
    nodosSolidaridadPropiosAndRoot:[NodoSolidaridad],
    nodosSolidaridadByNivel(nivel:Int!):[NodoSolidaridad],
    busquedaAmpliaNodosSolidaridad(textoBuscado:String!):[NodoSolidaridad],    
    posicionarNodosSolidaridadByFuerzas(ciclos:Int!):Boolean,

    relacionesNodosAtlasByIds(infoNodos: [InfoNodoDeAtlasSolidaridad!]!):NodosAtlasSolidaridadByType

    getItemsAdministracionNodosSolidaridadUnderParent(idNodoParent: ID!):ItemsAdministracionNodoSolidaridad

   }

   extend type Mutation{    
    

    crearNodoSolidaridad(infoNodo:NodoSolidaridadInput!):NodoSolidaridad,
    crearNuevoNodoSolidaridadUnderNodo(infoNodo:NodoSolidaridadInput!, idNodoParent:ID!, tipoParent:String!): ResultadoCrearNodoSolidaridadUnderNodo,
    eliminarNodoSolidaridad(idNodo:ID!):Boolean,
    editarNombreNodoSolidaridad(idNodo:ID!, nuevoNombre: String!):NodoSolidaridad,
    editarDescripcionNodoSolidaridad(idNodo:ID!, nuevoDescripcion: String!):NodoSolidaridad,
    editarKeywordsNodoSolidaridad(idNodo:ID!, nuevoKeywords: String!):NodoSolidaridad,
    usuarioEntrarResponsableNodoSolidaridad(idNodo:ID!):NodoSolidaridad,
    addResponsableNodoSolidaridad(idNodo:ID!,idUsuario:ID!):NodoSolidaridad,
    addPosibleResponsableNodoSolidaridad(idNodo:ID!, idUsuario:ID!):NodoSolidaridad,
    removeResponsableNodoSolidaridad(idNodo:ID!, idUsuario:ID!):NodoSolidaridad,
    setEstadoNodoSolidaridad(idNodo:ID!, nuevoEstado:String!):NodoSolidaridad,    
    setPosicionNodoSolidaridad(idNodo:ID!, nuevaPosicion:CoordsInput):NodoSolidaridad,
    deleteRequerimentoNodosAtlasSolidaridad(idNodoRequiriente:ID!, tipoRequiriente:String!, idNodoRequerido: ID!):ResultadoOperacionNodosAtlas,
    crearRequerimentoEntreNodosAtlasSolidaridad(idNodoRequiriente:ID!, tipoRequiriente:String!, idNodoRequerido:ID!):ResultadoOperacionNodosAtlas,
    crearParentingEntreNodosAtlasSolidaridad(idNodoRequiriente:ID!, tipoRequiriente: String!, idNodoRequerido:ID!):ResultadoOperacionNodosAtlas,
    transferirRequerimentoBetweenNodosSolidaridad(idNodoRequerido: ID!, idNodoSource: ID!, tipoNodoSource: String, idNodoTarget: ID!, tipoNodoTarget: String!, index: Int):ResultadoOperacionNodosAtlas

    crearRecursoExternoNodoSolidaridad(idNodo:ID!):RecursoExternoNodoSolidaridad,
    eliminarRecursoExternoNodoSolidaridad(idNodo:ID!, idRecursoExterno:ID!):Boolean,
    editarDatosRecursoExternoNodoSolidaridad(idNodo:ID!, idRecursoExterno:ID!, nuevoNombre: String!, nuevoDescripcion:String, nuevoLink: String!):RecursoExternoNodoSolidaridad,
    editarNombreRecursoExternoNodoSolidaridad(idNodo:ID!, idRecursoExterno: ID!, nuevoNombre: String!):RecursoExternoNodoSolidaridad,
    editarDescripcionRecursoExternoNodoSolidaridad(idNodo:ID!, idRecursoExterno: ID!, nuevoDescripcion: String!):RecursoExternoNodoSolidaridad,
    editarLinkRecursoExternoNodoSolidaridad(idNodo:ID!, idRecursoExterno: ID!, nuevoLink: String!):RecursoExternoNodoSolidaridad,    

    crearNuevoMovimientoDineroNodoSolidaridad(idNodo:ID!):MovimientoDineroNodoSolidaridad,
    eliminarMovimientoDineroNodoSolidaridad(idNodo:ID!, idMovimientoDinero: ID!):Boolean,
    editarArticuloMovimientoDineroNodoSolidaridad(idNodo:ID!, idMovimientoDinero: ID!, nuevoArticulo: String!):MovimientoDineroNodoSolidaridad,
    editarFechaMovimientoDineroNodoSolidaridad(idNodo:ID!, idMovimientoDinero: ID!, nuevoFecha: Date!):MovimientoDineroNodoSolidaridad,
    editarInformacionMovimientoDineroNodoSolidaridad(idNodo:ID!, idMovimientoDinero: ID!, nuevoInformacion: String!):MovimientoDineroNodoSolidaridad,
    editarCantidadMovimientoDineroNodoSolidaridad(idNodo: ID!, idMovimientoDinero:ID!, nuevoCantidad:Float!):MovimientoDineroNodoSolidaridad,
    editarMovimientoUnitarioMovimientoDineroNodoSolidaridad(idNodo: ID!, idMovimientoDinero:ID!, nuevoMovimientoUnitario:Float!):MovimientoDineroNodoSolidaridad,
    editarMovimientoTotalMovimientoDineroNodoSolidaridad(idNodo: ID!, idMovimientoDinero:ID!, nuevoMovimientoTotal:Float!):MovimientoDineroNodoSolidaridad,
    editarNumerosMovimientoDineroNodoSolidaridad(idNodo: ID!, idMovimientoDinero:ID!, nuevoMovimientoTotal:Float!, nuevoMovimientoUnitario: Float!, nuevoCantidad:Float!):MovimientoDineroNodoSolidaridad,
    setRealizadoMovimientoDineroNodoSolidaridad(idNodo:ID!, idMovimientoDinero: ID!, nuevoRealizado:Boolean!):MovimientoDineroNodoSolidaridad,

    crearNuevoEventoNodoSolidaridad(idNodo:ID!):EventoNodoSolidaridad,
    eliminarEventoNodoSolidaridad(idNodo:ID!, idEvento: ID!):Boolean,
    editarNombreEventoNodoSolidaridad(idNodo:ID!, idEvento: ID!, nuevoNombre: String!):EventoNodoSolidaridad,
    editarFechaEventoNodoSolidaridad(idNodo:ID!, idEvento: ID!, nuevoFecha: Date!):EventoNodoSolidaridad,
    editarDescripcionEventoNodoSolidaridad(idNodo:ID!, idEvento: ID!, nuevoDescripcion: String!):EventoNodoSolidaridad

   }

   extend type Subscription{
        nodoEditado(centro:CoordsInput!, radio:Int!):NodoSolidaridad
        nodoEliminado(centro:CoordsInput!, radio:Int!):ID,
        nodosEliminados:[ID],
        nodoSolidaridadFamilyEditado(idNodoParent:ID!):NodoSolidaridad,
        nodoSolidaridadFamilyEliminado(idNodoParent:ID!):ID,
        nodosSolidaridadFamilyEliminados(idNodoParent:ID!):[ID],

        nodosAtlasPosicionados(idAtlas:ID!):ID,
   }

`;
export const NODO_EDITADO = "nodo_solidaridad_editado";
export const NODO_ELIMINADO = "nodo_solidaridad_eliminado";
export const NODOS_ELIMINADOS = "nodos_solidaridad_eliminados";
export const NODO_FAMILY_EDITADO = "nodo_solidaridad_family_editado";
export const NODO_FAMILY_ELIMINADO = "nodo_solidaridad_family_eliminado";
export const NODOS_FAMILY_ELIMINADOS = "nodos_solidaridad_family_eliminados";
export const NODOS_ATLAS_POSICIONADOS = "nodos_de_atlas_posicionados";

export var timerPosicionamiento: any = null;
export const idAtlasSolidaridad = "61ea0b0f17a5d80da7e94320";
export const resolvers = {
    Subscription: {
        nodoEditado: {
            subscribe: withFilter(
                (_: any, { centro, radio }: any, contexto: contextoQuery) => {
                    return contexto.pubsub.asyncIterator(NODO_EDITADO)
                },
                (nodoEditado: any, variables, contexto: contextoQuery) => {
                    if (variables.radio === 0) {
                        return true;
                    }
                    if (nodoEditado.nodoEditado.coords.x > variables.centro.x + variables.radio || nodoEditado.nodoEditado.coords.x < variables.centro.x - variables.radio || nodoEditado.nodoEditado.coords.y > variables.centro.y + variables.radio || nodoEditado.nodoEditado.coords.y < variables.centro.y - variables.radio) {
                        return false;
                    }
                    return true;
                }
            )
        },
        nodoEliminado: {
            subscribe: withFilter(
                (_: any, { centro, radio }: any, contexto: contextoQuery) => {
                    return contexto.pubsub.asyncIterator(NODO_ELIMINADO)
                },
                (nodoEliminado: any, variables, contexto: contextoQuery) => {
                    var elNodoEliminado = nodoEliminado.elNodoEliminado;
                    var idNodoEliminado = nodoEliminado.nodoEliminado;
                    if (variables.radio === 0) {
                        return true;
                    }
                    if (elNodoEliminado.coords.x > variables.centro.x + variables.radio || elNodoEliminado.coords.x < variables.centro.x - variables.radio || elNodoEliminado.coords.y > variables.centro.y + variables.radio || elNodoEliminado.coords.y < variables.centro.y - variables.radio) {
                        return false;
                    }
                    return true;
                }
            )
        },
        nodosEliminados: {
            subscribe: withFilter(
                (_: any, __: any, contexto: contextoQuery) => {
                    return contexto.pubsub.asyncIterator(NODOS_ELIMINADOS)
                },
                ({ nodosEliminados }: any, variables, contexto: contextoQuery) => {
                    return true;
                }
            )
        },
        nodoSolidaridadFamilyEditado: {
            subscribe: withFilter(
                (_: any, { idNodoParent }: any, contexto: contextoQuery) => {
                    return contexto.pubsub.asyncIterator(NODO_FAMILY_EDITADO);
                },
                async (nodoEditado: any, variables, contexto: contextoQuery) => {
                    var elNodoEditado = nodoEditado.nodoSolidaridadFamilyEditado;
                    var idParentFamily = variables.idNodoParent;
                    if (elNodoEditado.id === idParentFamily) return true;

                    var idCurrent = elNodoEditado.nodoParent;
                    var cuenta = 0;
                    while (cuenta < 1000 && idCurrent) {
                        if (idCurrent === idParentFamily) {
                            return true;
                        }
                        //Este no es child de parentFamily, continuar

                        try {
                            var elProximo: any = await NodoSolidaridad.findById(idCurrent).exec();
                        } catch (error) {
                            console.log(`Error buscando parent: ${error}`);
                            return false;
                        }
                        idCurrent = elProximo.nodoParent;
                    }

                    return false;
                }
            )
        },
        nodoSolidaridadFamilyEliminado: {
            subscribe: withFilter(
                (_: any, { idNodoParent }: any, contexto: contextoQuery) => {
                    return contexto.pubsub.asyncIterator(NODO_FAMILY_ELIMINADO);
                },
                async (nodoEliminado: any, variables, contexto: contextoQuery) => {
                    var elNodoEliminado = nodoEliminado.elNodoEliminado;
                    var idParentFamily = variables.idNodoParent;
                    if (elNodoEliminado.id === idParentFamily) return true;
                    var idCurrent = elNodoEliminado.nodoParent;
                    var cuenta = 0;
                    while (cuenta < 1000 && idCurrent) {
                        if (idCurrent === idParentFamily) {
                            return true;
                        }
                        //Este no es child de parentFamily, continuar

                        try {
                            var elProximo: any = await NodoSolidaridad.findById(idCurrent).exec();
                        } catch (error) {
                            console.log(`Error buscando parent: ${error}`);
                            return false;
                        }
                        idCurrent = elProximo.nodoParent;
                    }

                    return false;
                }
            )
        },
        nodosSolidaridadFamilyEliminados: {
            subscribe: withFilter(
                (_: any, { idNodoParent }: any, contexto: contextoQuery) => {
                    return contexto.pubsub.asyncIterator(NODOS_FAMILY_ELIMINADOS);
                },
                async ({ primerEliminado }: any, variables, contexto: contextoQuery) => {

                    var idParentFamily = variables.idNodoParent;
                    if (primerEliminado.id === idParentFamily) return true;
                    var idCurrent = primerEliminado.nodoParent;
                    var cuenta = 0;
                    while (cuenta < 1000 && idCurrent) {
                        if (idCurrent === idParentFamily) {
                            return true;
                        }
                        //Este no es child de parentFamily, continuar

                        try {
                            var elProximo: any = await NodoSolidaridad.findById(idCurrent).exec();
                        } catch (error) {
                            console.log(`Error buscando parent: ${error}`);
                            return false;
                        }
                        idCurrent = elProximo.nodoParent;
                    }

                    return false;
                }
            )
        },
        nodosAtlasPosicionados: {
            subscribe: withFilter(
                (_: any, { idAtlas }: any, contexto: contextoQuery) => {
                    return contexto.pubsub.asyncIterator(NODOS_ATLAS_POSICIONADOS);
                },
                ({ nodosAtlasPosicionados }: any, { idAtlas }: any, contexto: contextoQuery) => {
                    if (nodosAtlasPosicionados === idAtlas) {
                        return true;
                    }
                    return false;
                }
            )
        }
    },
    Query: {
        
        nodoSolidaridad: async function (_: any, { idNodo }: any, context: contextoQuery) {

            try {
                var elNodo: any = await NodoSolidaridad.findById(idNodo).exec();
                if (!elNodo) {
                    throw "Nodo no existía"
                }
            } catch (error) {
                console.log(`error buscando un nodo. E: ${error}`);
                throw new ApolloError("");
            }

            return elNodo;
        },
        nodosSolidaridadUsuario: async function (_: any, { idUsuario, incluirCompletados }: any, contexto: contextoQuery) {
            console.log('Peticion de nodos de solidaridad de los cuales es responsable el usuario con id ' + idUsuario);
            console.log(`Incluir completados: ${incluirCompletados}`);
            try {
                var condicion: any = { "responsables": { $in: idUsuario } };
                if (!incluirCompletados) {
                    condicion.estadoDesarrollo = "noCompletado"
                }
                var losNodos: any = await NodoSolidaridad.find(condicion).exec();

            } catch (error) {
                console.log(`Error buscando nodos de usuario. E: ${error}`);
                throw new ApolloError("Error conectando con la base de datos");
            }

            console.log(`Enviando ${losNodos.length} nodos de usuario`);
            return losNodos;
        },
        nodosSolidaridadSegunCentro: async function (_: any, { centro, radio }: any, __: any) {
            console.log(`Nodos alrededor de un centro ${JSON.stringify(centro)} con radio ${radio} solicitados`);

            try {
                var losNodosSolidaridad: any = await NodoSolidaridad.find({ "coords.x": { $gt: centro.x - radio, $lt: centro.x + radio }, "coords.y": { $gt: centro.y - radio, $lt: centro.y + radio } }).exec();
            } catch (error) {
                console.log(`Error buscando nodosSolidaridad. E: ${error}`);
                throw new ApolloError("Error conectando con la base de datos");
            }

            console.log(`${losNodosSolidaridad.length} nodosSolidaridad encontrados.`);
            return losNodosSolidaridad;
        },
        nodosSolidaridadRecursiveChildrenDeNodo: async function (_: any, { idParent }: any, __: any) {
            console.log(`Nodos solidaridad children recursivamente de ${idParent} solicitados`);

            try {
                var losNodosSolidaridad: any = await NodoSolidaridad.find({}).exec();
            } catch (error) {
                console.log(`Error buscando nodosSolidaridad. E: ${error}`);
                throw new ApolloError("Error conectando con la base de datos");
            }

            var nodosChildren = losNodosSolidaridad.filter(n => {
                var cuenta = 0;
                var idCurrentParent = n.nodoParent;

                while (cuenta < 1000 && idCurrentParent) {
                    cuenta++;
                    if (idCurrentParent === idParent) {
                        return true
                    }
                    var nodoCurrentParent = losNodosSolidaridad.find(n => n.id === idCurrentParent);
                    if (!nodoCurrentParent) {
                        console.log(`Nodo con nodoParent no existente`);
                    }
                    idCurrentParent = nodoCurrentParent.nodoParent;
                }
                return false;

            });

            return nodosChildren;
        },
        nodosSolidaridadUnderNodo: async function (_: any, { idParent }: any, __: any) {
            console.log(`Nodos solidaridad under ${idParent} solicitados`);

            try {
                var elNodoParent: any = await NodoSolidaridad.findById(idParent).exec();
            } catch (error) {
                console.log(`Error buscando el nodoParent: ${error}`);
                throw new UserInputError("Datos inválidos");
            }

            var idsRequeridosParent = elNodoParent.vinculos.map(v => v.idRef);
            try {
                var losNodosUnder: any = await NodoSolidaridad.find({ "_id": { $in: idsRequeridosParent } }).exec();
            } catch (error) {
                console.log(`Error buscando nodosSolidaridad. E: ${error}`);
                throw new ApolloError("Error conectando con la base de datos");
            }
            console.log(`Enviando ${losNodosUnder.length} nodos under`);
            return losNodosUnder;
        },
        todosNodosSolidaridad: async function (_: any, ___: any, __: any) {
            console.log(`Todos nodos solidaridad solicitados`);

            try {
                var losNodosSolidaridad: any = await NodoSolidaridad.find({}).exec();
            } catch (error) {
                console.log(`Error buscando nodosSolidaridad. E: ${error}`);
                throw new ApolloError("Error conectando con la base de datos");
            }

            console.log(`${losNodosSolidaridad.length} nodosSolidaridad encontrados.`);
            return losNodosSolidaridad;
        },
        nodosSolidaridadByNivel: async function (_: any, { nivel }: any, __: any) {
            console.log(`Todos nodos solidaridad hasta el nivel ${nivel} solicitados`);
            const minNivel = 1;
            if (nivel < minNivel) nivel = minNivel;

            try {
                var losNodosSolidaridad: any = await NodoSolidaridad.find({ nodoParent: null }).exec();
            } catch (error) {
                console.log(`Error buscando nodosSolidaridad. E: ${error}`);
                throw new ApolloError("Error conectando con la base de datos");
            }
            for (var i = 1; i < nivel; i++) {
                console.log(`FALTA PROGRAMAR LA LOGICA DE LOS SIGUIENTES NIVELES`);
            }

            console.log(`${losNodosSolidaridad.length} nodosSolidaridad hasta nivel ${nivel} encontrados.`);
            return losNodosSolidaridad;
        },
        nodosSolidaridadPropios: async function (_: any, __: any, contexto: any) {
            console.log(`Todos nodos solidaridad propios solicitados`);
            if (!contexto.usuario) {
                console.log(`No habia info de logín`);
                throw new AuthenticationError("Login requerido");
            }
            const credencialesUsuario = contexto.usuario;

            try {
                var losNodosSolidaridad: any = await NodoSolidaridad.find({ nodoParent: credencialesUsuario.id }).exec();
            } catch (error) {
                console.log(`Error buscando nodosSolidaridad propios de ${credencialesUsuario.id}. E: ${error}`);
                throw new ApolloError("Error conectando con la base de datos");
            }


            console.log(`${losNodosSolidaridad.length} nodosSolidaridad propios de ${credencialesUsuario.id} encontrados.`);
            return losNodosSolidaridad;
        },
        nodoAtlasSolidaridadByIdAndTipo: async function (_: any, { idNodo, tipoNodo }: any, contexto: any) {
            console.log("\x1b[32m%s\x1b[0m", `Nodo solidaridad de tipo ${tipoNodo} con id ${idNodo} solicitado`);
            if (!contexto.usuario) {
                console.log(`No habia info de logín`);
                throw new AuthenticationError("Login requerido");
            }
            const credencialesUsuario = contexto.usuario;
            var elNodo: any = null;
            try {
                if (tipoNodo === 'usuario') {
                    elNodo = await Usuario.findById(idNodo).exec();
                }
                else {
                    elNodo = await NodoSolidaridad.findById(idNodo).exec();
                }
            } catch (error) {
                console.log(`Error buscando el nodo. E: ${error}`);
                throw new ApolloError("Error conectando con la base de datos");
            }
            
            var respuesta:any=null;
            if(tipoNodo==='usuario'){
                respuesta={
                    persona:elNodo
                }
            }
            else{
                respuesta={
                    nodoSolidaridad:elNodo
                }
            }
            return respuesta;
        },
        nodosSolidaridadRoot: async function (_: any, __: any, contexto: any) {
            console.log(`Todos nodos solidaridad root solicitados`);
            if (!contexto.usuario) {
                console.log(`No habia info de logín`);
                throw new AuthenticationError("Login requerido");
            }
            const credencialesUsuario = contexto.usuario;

            try {
                var losNodosSolidaridad: any = await NodoSolidaridad.find({ nodoParent: null }).exec();
            } catch (error) {
                console.log(`Error buscando nodosSolidaridad propios and root de ${credencialesUsuario.id}. E: ${error}`);
                throw new ApolloError("Error conectando con la base de datos");
            }


            console.log(`${losNodosSolidaridad.length} nodosSolidaridad propios and root de ${credencialesUsuario.id} encontrados.`);
            return losNodosSolidaridad;
        },
        nodosSolidaridadPropiosAndRoot: async function (_: any, __: any, contexto: any) {
            console.log(`Todos nodos solidaridad propios and root solicitados`);
            if (!contexto.usuario) {
                console.log(`No habia info de logín`);
                throw new AuthenticationError("Login requerido");
            }
            const credencialesUsuario = contexto.usuario;

            try {
                var losNodosSolidaridad: any = await NodoSolidaridad.find({ $or: [{ nodoParent: credencialesUsuario.id }, { nodoParent: null }] }).exec();
            } catch (error) {
                console.log(`Error buscando nodosSolidaridad propios and root de ${credencialesUsuario.id}. E: ${error}`);
                throw new ApolloError("Error conectando con la base de datos");
            }


            console.log(`${losNodosSolidaridad.length} nodosSolidaridad propios and root de ${credencialesUsuario.id} encontrados.`);
            return losNodosSolidaridad;
        },
        nodosSolidaridadByIds: async function (_: any, { idsNodos }: any, __: any) {
            // console.log(`nodos solidaridad by id list solicitados`);
            // console.log(`idsNodos: ${idsNodos}`);

            var losNodosSolidaridad: Array<any> = [];
            try {
                if (!idsNodos) {
                    losNodosSolidaridad = await NodoSolidaridad.find({ nodoParent: null }).exec();
                }
                else {
                    losNodosSolidaridad = await NodoSolidaridad.find({ "_id": { $in: idsNodos } }).exec();
                }
            } catch (error) {
                console.log(`Error buscando nodosSolidaridad. E: ${error}`);
                throw new ApolloError("Error conectando con la base de datos");
            }

            return losNodosSolidaridad;
        },
        busquedaAmpliaNodosSolidaridad: async function (_: any, { textoBuscado }, __: any) {
            console.log(`buscando nodos de solidaridad que contengan: ${textoBuscado}`);
            // console.log(`tipo de input: ${typeof (textoBuscado)}`);

            textoBuscado = textoBuscado.trim();
            textoBuscado = textoBuscado.replace(/[\n\r]/g, "");

            //Validar
            if (textoBuscado.length < 1) {
                console.log(`No habia palabras buscadas`);
            }

            try {
                var losNodosSolidaridad: any = await NodoSolidaridad.find({ estadoDesarrollo: "noCompletado", $text: { $search: textoBuscado } }, { score: { $meta: 'textScore' } }).collation({ locale: "en", strength: 1 }).select("nombre descripcion coords").sort({ score: { $meta: 'textScore' } }).limit(20).exec();
            }
            catch (error) {
                console.log(". E: " + error);
                throw new ApolloError("");
            }
            return losNodosSolidaridad
        },
        relacionesNodosAtlasByIds: async function (_: any, { infoNodos }: any, __: any) {
            const idsPersonasSolicitados = infoNodos.filter(info => info.tipo === 'usuario').map(info => info.id);
            const idsNodosSolidaridadSolicitados = infoNodos.filter(info => info.tipo === 'nodoSolidaridad').map(info => info.id);
            console.log(`Query for nodos relacionados con las personas ${idsPersonasSolicitados} y los nodosSolidaridad: ${idsNodosSolidaridadSolicitados}`);


            try {
                var losPersonasSolicitados: any = await Usuario.find({ "_id": { $in: idsPersonasSolicitados } }).exec();
                var losNodosSolidaridadSolicitados: any = await NodoSolidaridad.find({ "_id": { $in: idsNodosSolidaridadSolicitados } }).exec();
            } catch (error) {
                console.log(`Error buscando solicitados for query relaciones: ${error}`);
                throw new UserInputError("Datos inválidos");
            }

            var idsNodosSolidaridadRelacionados: Array<any> = [];
            var idsPersonasRelacionados: Array<any> = [];

            losPersonasSolicitados.concat(losNodosSolidaridadSolicitados).forEach(nodo => {
                let idsVinculos = nodo.vinculos.map(v => v.idRef);
                let nuevosIdsVinculos = idsVinculos.filter(iv => !idsNodosSolidaridadRelacionados.includes(iv));
                idsNodosSolidaridadRelacionados = idsNodosSolidaridadRelacionados.concat(nuevosIdsVinculos);
            })

            losNodosSolidaridadSolicitados.forEach(nodoS => {
                let idsResponsables = nodoS.responsables;
                let nuevosIdsResponsables = idsResponsables.filter(ir => !idsPersonasRelacionados.includes(ir));
                idsPersonasRelacionados = idsPersonasRelacionados.concat(nuevosIdsResponsables);
            })

            try {
                var losNodosSolidaridadRelacionados: any = await NodoSolidaridad.find({ "_id": { $in: idsNodosSolidaridadRelacionados } }).exec();
                var losPersonasRelacionados: any = await Usuario.find({ "_id": { $in: idsPersonasRelacionados } }).exec();
            } catch (error) {
                console.log(`Error buscando nodos relacionados. E: ${error}`);
                throw new ApolloError("Error conectando con la base de datos");
            }
            console.log(`Enviando ${losNodosSolidaridadRelacionados.length} nodosSolidaridad relacionados y ${losPersonasRelacionados.length} personas relacionadas`);
            return { personas: losPersonasRelacionados, nodosSolidaridad: losNodosSolidaridadRelacionados };
        },
        getItemsAdministracionNodosSolidaridadUnderParent: async function (_: any, { idNodoParent }, contexto: any) {
            console.log(`Peticion de items de administracion de nodos de solidaridad under ${idNodoParent}`);
            if (!contexto.usuario) {
                console.log(`No logeado`);
                throw new AuthenticationError("Login requerido");
            }

            try {
                var elNodoParent: any = await NodoSolidaridad.findById(idNodoParent).exec();
            } catch (error) {
                console.log(`Error buscando el nodo parent: ${error}`);
                throw new ApolloError("Error conectando con la base de datos");
            }
            var cuenta = 0;
            var currentIdsNodosUnder = elNodoParent.vinculos.map(v => v.idRef);
            var currentNodos: Array<any> = [];
            var totalMovimientosDinero: Array<any> = []

            while (currentIdsNodosUnder && currentIdsNodosUnder.length > 0) {
                cuenta++;
                if (cuenta > 1000) {
                    console.log(`Overflow de cuenta recogiendo itemsAdministracion `);
                }

                try {
                    currentNodos = await NodoSolidaridad.find({ "_id": { $in: currentIdsNodosUnder } }).exec();
                } catch (error) {
                    console.log(`Error recogiendo lista de nodosUnder: ${error}`);
                    throw new ApolloError("Error conectando con la base de datos");
                }

                let movimientosDinero = currentNodos.reduce((acc, cn) => acc.concat(cn.movimientosDinero), []);
                totalMovimientosDinero = totalMovimientosDinero.concat(movimientosDinero);

                let proximosIds = currentNodos.reduce((acc, cn) => acc.concat(cn.vinculos.map(v => v.idRef)), []);

                currentIdsNodosUnder = proximosIds;
            }

            return {
                movimientosDinero: totalMovimientosDinero
            }
        },

        async posicionarNodosSolidaridadByFuerzas(_: any, { ciclos }: any, contexto: contextoQuery) {
            console.log(`Peticion de ejecutar un posicionamiento de nodos de solidaridad by fuerzas de ${ciclos} ciclos`);
            ejecutarPosicionamientoNodosSolidaridadByFuerzas(ciclos, Date.now(), true);
            console.log(`Terminado`);
            return true;
        }
    },

    Mutation: {

        async setPosicionNodoSolidaridad(_: any, { idNodo, nuevaPosicion }, contexto: contextoQuery) {
            console.log(`Guardando posicion de nodo en el diagrama del grupo`);
            const credencialesUsuario = contexto.usuario;

            try {
                var elNodo: any = await NodoSolidaridad.findById(idNodo).exec();
                if (!elNodo) {
                    throw "Nodo no encontrado"
                }
            }
            catch (error) {
                console.log("Error buscando el nodo. E: " + error);
                throw new ApolloError("Error en la conexión con la base de datos");
            }

            var administradores = await getAdministradoresNodo(elNodo);

            //Authorización
            if (!administradores.includes(credencialesUsuario.id) && !credencialesUsuario.permisos.includes("superadministrador")) {
                console.log(`Error de autenticacion editando nombre de nodo`);
                throw new AuthenticationError("No autorizado");
            }

            try {
                elNodo.coords = nuevaPosicion;
                elNodo.autoCoords = nuevaPosicion;
                await elNodo.save();
            } catch (error) {
                console.log(`error guardando el nodo modificado: ${error}`);
            }

            return elNodo;

        },
        async crearNuevoNodoSolidaridadUnderNodo(_: any, { infoNodo, idNodoParent, tipoParent }, contexto: contextoQuery) {
            console.log(`Query de crear un nodo de solidaridad bajo el nodo con id ${idNodoParent} de tipo ${tipoParent}`);
            if (!contexto.usuario) {
                throw new AuthenticationError("Usuario no logeado");
            }
            const credencialesUsuario = contexto.usuario;

            var nuevoNodo:any = new NodoSolidaridad({
                ...infoNodo,
                nodoParent: idNodoParent
            });

            if (tipoParent === 'usuario') {
                nuevoNodo.tipoParent = tipoParent;
            }

            var nodoParent: any = null;
            try {
                if (tipoParent === 'usuario') {
                    nodoParent = await Usuario.findById(idNodoParent).exec();
                }
                else {
                    nodoParent = await NodoSolidaridad.findById(idNodoParent).exec();
                }
                if (!nodoParent) {
                    throw "Nodo parent no encontrado en la base de datos"
                }
            } catch (error) {
                console.log(`Error buscando el nodo parent: ${error}`);
                throw new ApolloError("Error conectando con la base de datos");
            }


            //Authorización
            const permisosEspeciales = ["superadministrador"];

            var responsablesAmplio: Array<any> = [];
            if (tipoParent === 'usuario') {
                responsablesAmplio = [nodoParent.id];
            }
            else {
                responsablesAmplio = await getResponsablesAmplioNodo(nodoParent);
            }
            if (!responsablesAmplio.includes(credencialesUsuario.id) && !credencialesUsuario.permisos.some(p => permisosEspeciales.includes(p))) {
                console.log(`Error de autenticacion creando nodo under nodoSolidaridad`);
                throw new AuthenticationError("No autorizado");
            }

            var nuevoVinculo = nodoParent.vinculos.create({
                tipo: 'requiere',
                idRef: nuevoNodo.id,
            })

            nodoParent.vinculos.push(nuevoVinculo);

            try {
                await nodoParent.save();
            } catch (error) {
                console.log(`Error guardando el nodo parent: ${error}`);
                throw new ApolloError("Error conectando con la base de datos");
            }

            //Ubicar el nuevo nodo
            var nuevaDireccion = Number((Math.random() * 2 * Math.PI).toFixed(3));
            const distanciaDefault = 100;
            const coords = {
                x: nodoParent.autoCoords.x + Math.round(distanciaDefault * Math.cos(nuevaDireccion)),
                y: nodoParent.autoCoords.y + Math.round(distanciaDefault * Math.sin(nuevaDireccion))
            }
            nuevoNodo.coords = coords;
            nuevoNodo.autoCoords = coords;

            try {
                await nuevoNodo.save();
            } catch (error) {
                console.log(`error guardando el nuevo nodo en la base de datos. E: ${error}`);
                throw new ApolloError("Error guardando en base de datos");
            }
            emitirPosicionamientoNodos();
            console.log(`nuevo nodo de solidaridad creado:`);

            var respuesta: any = null;
            if (tipoParent === 'usuario') {
                respuesta = {
                    nuevoNodo,
                    usuariosModificados: [nodoParent]
                }
            }
            else {
                respuesta = {
                    nodosModificados: [nodoParent],
                    nuevoNodo
                }
            }

            return respuesta
        },
        async eliminarNodoSolidaridad(_: any, { idNodo }: any, contexto: contextoQuery) {
            console.log(`peticion de eliminar un nodoSolidaridad con id ${idNodo}`);
            const credencialesUsuario = contexto.usuario;

            try {
                var elNodo: any = await NodoSolidaridad.findById(idNodo).exec();
                if (!elNodo) {
                    throw "Nodo no encontrado"
                }
                var idsNodosActuales = [elNodo.id];
                var idsNodosArbol = [elNodo.id];

                var cuenta = 0;
                while (cuenta < 1000 && idsNodosActuales && idsNodosActuales.length > 0) {
                    cuenta++;
                    let childrenElNodo = await NodoSolidaridad.find({ "nodoParent": { $in: idsNodosActuales } }).exec();
                    idsNodosArbol = idsNodosArbol.concat(childrenElNodo.map(c => c.id));
                    idsNodosActuales = childrenElNodo.map(n => n.id);
                }
                if (cuenta >= 1000) {
                    console.log(`OVERFLOW DE LOOP WHILE CREANDO LA LISTA DE NODOS A ELIMINAR JUNTO CON UN NODO PARENT DE ID ${idNodo}`);
                }

            }
            catch (error) {
                console.log("Error buscando el nodo. E: " + error);
                throw new ApolloError("Error en la conexión con la base de datos");
            }

            var administradores = await getAdministradoresNodo(elNodo);

            //Authorización
            let permisosEspeciales = ["superadministrador"];

            if (!administradores.includes(credencialesUsuario.id) && !credencialesUsuario.permisos.some(p => permisosEspeciales.includes(p))) {
                console.log(`Error de autenticacion eliminando nodo`);
                throw new AuthenticationError("No autorizado");
            }
            console.log(`Se eliminarán los nodos: `);
            idsNodosArbol.forEach(id => {
                console.log(`${id}`);
            })
            try {
                await NodoSolidaridad.deleteMany({ _id: { $in: idsNodosArbol } }).exec();
            }
            catch (error) {
                console.log("Error eliminando nodo. E: " + error);
                throw new ApolloError("Error eliminando elemento");
            }

            console.log(`eliminados`);

            emitirPosicionamientoNodos();
            contexto.pubsub.publish(NODOS_ELIMINADOS, { nodosEliminados: idsNodosArbol });
            contexto.pubsub.publish(NODOS_FAMILY_ELIMINADOS, { nodosSolidaridadFamilyEliminados: idsNodosArbol, primerEliminado: elNodo });

            //Actualizar vinculos que miraban hacia estos nodos
            var nodosRequirientes: Array<any> = [];

            try {
                if (elNodo.tipoParent === 'usuario') {
                    nodosRequirientes = await Usuario.find({ "vinculos.idRef": { $in: idsNodosArbol } }).exec();
                }
                else {
                    nodosRequirientes = await NodoSolidaridad.find({ "vinculos.idRef": { $in: idsNodosArbol } }).exec();
                }
            } catch (error) {
                console.log(`Error buscando nodos requirientes de nodos eliminados: ${error}`);
            }

            console.log(`${nodosRequirientes.length} nodos requerian a los nodos eliminados`);

            nodosRequirientes.forEach(nr => {
                console.log(`Retirando el nodo de ${nr.nombre || nr.username}`);
                let indexV = nr.vinculos.findIndex(v => idsNodosArbol.includes(v.idRef));
                nr.vinculos.splice(indexV, 1);
            })

            nodosRequirientes.forEach(async (nr) => {
                try {
                    await nr.save();
                } catch (error) {
                    console.log(`Error guardando un nodo (${nr.nombre}) después de retirarle un vínculo a un nodo eliminado: ${error}`);
                }
            })



            return true;
        },
        async crearNodoSolidaridad(_: any, { infoNodo }: any, contexto: contextoQuery) {
            console.log(`Query de crear un nodo de solidaridad en la posicion ${infoNodo.coords}`);
            const credencialesUsuario = contexto.usuario;

            if (!credencialesUsuario || !credencialesUsuario.id) {
                throw new AuthenticationError("Usuario no logeado");
            }

            const permisosAutorizados = ["superadministrador"];
            if (!credencialesUsuario.permisos.some(p => permisosAutorizados.includes(p))) {
                console.log(`Usuario no autorizado`);
                throw new AuthenticationError("No autorizado");
            }

            try {
                var nuevoNodo = new NodoSolidaridad({
                    ...infoNodo,
                    autoCoords: infoNodo.coords
                });

                await nuevoNodo.save();
            } catch (error) {
                console.log(`error guardando el nuevo nodo en la base de datos. E: ${error}`);

                throw new ApolloError("Error guardando en base de datos");
            }
            console.log(`nuevo nodo de solidaridad creado`);

            return nuevoNodo
        },
        async deleteRequerimentoNodosAtlasSolidaridad(_: any, { idNodoRequiriente, tipoRequiriente, idNodoRequerido }: any, contexto: contextoQuery) {
            console.log(`Query de delete requerimento entre ${idNodoRequiriente} de tipo ${tipoRequiriente} y ${idNodoRequerido}`);

            if (!contexto.usuario) {
                console.log(`Usuario no estaba logeado. Cancelando`);
                throw new AuthenticationError("Login requerido");
            }
            const credencialesUsuario = contexto.usuario;

            var nodoRequiriente: any = null;
            try {
                if (tipoRequiriente === 'usuario') {
                    nodoRequiriente = await Usuario.findById(idNodoRequiriente).exec();
                }
                else {
                    nodoRequiriente = await NodoSolidaridad.findById(idNodoRequiriente).exec();
                }
                if (!nodoRequiriente) throw "nodo requiriente no encontrado"

                var nodoRequerido: any = await NodoSolidaridad.findById(idNodoRequerido).exec();
                if (!nodoRequerido) throw "nodo requerido no encontrado"
            } catch (error) {
                console.log(`Error buscando los nodos a desvincular: ${error}`);
                throw new ApolloError("Error conectando con la base de datos");
            }

            var cambiosEnNodoRequerido = false;
            if (nodoRequerido.nodoParent === nodoRequiriente.id) {
                console.log(`El nodo requerido era child, buscándole nuevo parent`);

                try {
                    var tipoNuevoParent = "nodoSolidaridad"
                    var nuevoParent: any = await NodoSolidaridad.findOne({ "vinculos.idRef": nodoRequerido.id, "_id": { $ne: idNodoRequiriente } }).exec();
                    if (!nuevoParent) {
                        tipoNuevoParent = 'usuario'
                        nuevoParent = await Usuario.findOne({ "vinculos.idRef": nodoRequerido.id, "_id": { $ne: idNodoRequiriente } }).exec();
                    }
                    if (!nuevoParent) {
                        throw "El nodo requerido no tenía otro vínculo que lo recibiera"
                    }
                } catch (error) {
                    console.log(`Error buscándole nuevoParent al nodoRequerido: ${error}`);
                    throw new UserInputError("Operación no permitida")
                }
                console.log(`El nuevo parent será: ${nuevoParent.nombre || nuevoParent.nombres}`);
                nodoRequerido.nodoParent = nuevoParent.id;
                nodoRequerido.tipoParent = tipoNuevoParent;
                cambiosEnNodoRequerido = true;

            }

            const permisosEspeciales = ["superadministrador"];

            var indexV = nodoRequiriente.vinculos.findIndex(v => v.idRef === idNodoRequerido);
            if (indexV > -1) {
                var responsablesAmplioNodoRequiriente: Array<String> = [];
                if (tipoRequiriente === 'usuario') {
                    responsablesAmplioNodoRequiriente = [nodoRequiriente.id];
                }
                else {
                    responsablesAmplioNodoRequiriente = await getResponsablesAmplioNodo(nodoRequiriente);
                }
                if (responsablesAmplioNodoRequiriente.includes(credencialesUsuario.id) || permisosEspeciales.some(p => credencialesUsuario.permisos.includes(p))) {
                    nodoRequiriente.vinculos.splice(indexV, 1);
                }
                else {
                    console.log(`Fallo de autenticación al eliminar el vinculo de ${idNodoRequiriente} requiriendo ${idNodoRequerido}`);
                    throw new AuthenticationError("No autorizado");
                }
            }
            try {
                await nodoRequiriente.save();
                if (cambiosEnNodoRequerido) {
                    await nodoRequerido.save();
                }
            } catch (error) {
                console.log(`Error guardando los nodos después de la desvinculación: ${error}`);
                throw new ApolloError("Error conectando con la base de datos");
            }
            console.log(`Desrequerimentados`);
            var respuesta: any = null;
            if (tipoRequiriente === 'usuario') {
                respuesta = {
                    usuariosModificados: [nodoRequiriente]
                }
            }
            else {
                respuesta = {
                    nodosModificados: [nodoRequiriente]
                }
            }
            return respuesta;

        },
        async crearRequerimentoEntreNodosAtlasSolidaridad(_: any, { idNodoRequiriente, idNodoRequerido, tipoRequiriente }: any, contexto: contextoQuery) {

            console.log(`Query de set que nodo ${idNodoRequiriente} de tipo ${tipoRequiriente} requiere al nodo ${idNodoRequerido}`);

            if (!contexto.usuario) {
                console.log(`Usuario no logeado`);
                throw new AuthenticationError("Login required");
            }

            const credencialesUsuario = contexto.usuario;

            var nodoRequiriente: any = null;
            try {
                if (tipoRequiriente === 'usuario') {
                    nodoRequiriente = await Usuario.findById(idNodoRequiriente).exec();
                }
                else {
                    nodoRequiriente = await NodoSolidaridad.findById(idNodoRequiriente).exec();
                }
                if (!nodoRequiriente) throw "Nodo requiriente no encontrado"

                var nodoRequerido: any = await NodoSolidaridad.findById(idNodoRequerido).exec();
                if (!nodoRequerido) throw "Nodo requerido no encontrado"
            } catch (error) {
                console.log(`Error buscando los nodos a desvincular: ${error}`);
                throw new ApolloError("Error conectando con la base de datos");
            }

            //Authorization

            var responsablesAmplioNodoRequiriente: Array<any> = [];
            if (tipoRequiriente === 'usuario') {
                responsablesAmplioNodoRequiriente = [nodoRequiriente.id];
            }
            else {
                responsablesAmplioNodoRequiriente = await getResponsablesAmplioNodo(nodoRequiriente);
            }

            const permisosEspeciales = ["superadministrador"];

            if (!responsablesAmplioNodoRequiriente.includes(credencialesUsuario.id) && !permisosEspeciales.some(p => credencialesUsuario.permisos.includes(p))) {
                console.log(`Usuario no autorizado`);
                throw new AuthenticationError("No autorizado");
            }

            //Prevenir loop
            console.log(`Previniendo loop sobre ${nodoRequerido.nombre}`);
            if (await checkIfNodoRecursivelyUnderNodo(nodoRequerido, idNodoRequiriente)) {
                console.log(`Habría loop en esta operación. Cancelando.`);
                throw new UserInputError("Requerimento genera bucle");
            }

            //Introducir vínculo

            var indexV = nodoRequiriente.vinculos.findIndex(v => v.idRef === idNodoRequerido);
            if (indexV > -1) {
                nodoRequiriente.vinculos.splice(indexV, 1);
            }

            var nuevoVinculo = nodoRequiriente.vinculos.create({
                idRef: idNodoRequerido,
                tipo: "requiere",
            })

            nodoRequiriente.vinculos.push(nuevoVinculo);

            var indexOtroV = nodoRequerido.vinculos.findIndex(v => v.idRef === idNodoRequiriente);
            if (indexOtroV > -1) {
                nodoRequerido.vinculos.splice(indexOtroV, 1);
            }

            //Si el nodo requerido estaba huérfano, entonces lo toma bajo su control.

            // if ((!nodoRequerido.responsables || nodoRequerido.responsables.length < 1) && (!nodoRequerido.nodoParent) ) {
            //     console.log(`El nodo requerido estaba huérfano. Tomando bajo el control del nodo requiriente.`);
            //     nodoRequerido.nodoParent = idNodoRequiriente
            // }

            try {
                await nodoRequiriente.save();
                await nodoRequerido.save();
            } catch (error) {
                console.log(`Error guardando los nodos después de la vinculación: ${error}`);
                throw new ApolloError("Error conectando con la base de datos");
            }
            console.log(`Vinculados`);

            var respuesta: any = null;
            if (tipoRequiriente === 'usuario') {
                respuesta = {
                    nodosModificados: [nodoRequerido],
                    usuariosModificados: [nodoRequiriente]
                }
            }
            else {
                respuesta = {
                    nodosModificados: [nodoRequerido, nodoRequiriente]
                }
            }

            return respuesta;

        },
        async crearParentingEntreNodosAtlasSolidaridad(_: any, { idNodoRequiriente, tipoRequiriente, idNodoRequerido }: any, contexto: contextoQuery) {
            console.log(`Query de set que nodo ${idNodoRequiriente} de tipo ${tipoRequiriente} es parent del nodo ${idNodoRequerido}`);
            if (!contexto.usuario) {
                console.log(`Usuario no estaba logeado. Cancelando`);
                throw new AuthenticationError("Login requerido");
            }
            const credencialesUsuario = contexto.usuario;
            var nodoRequiriente: any = null;

            try {
                if (tipoRequiriente === 'usuario') {
                    nodoRequiriente = await Usuario.findById(idNodoRequiriente).exec();
                }
                else {
                    nodoRequiriente = await NodoSolidaridad.findById(idNodoRequiriente).exec();
                }
                if (!nodoRequiriente) throw "Nodo requiriente no encontrado"

                var nodoRequerido: any = await NodoSolidaridad.findById(idNodoRequerido).exec();
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
                throw new UserInputError("Los nodos no estaban vinculados");
            }

            console.log(`El nodo requerido queda bajo el control del nodo requiriente.`);
            nodoRequerido.nodoParent = idNodoRequiriente;
            nodoRequerido.tipoParent = tipoRequiriente;


            try {
                await nodoRequiriente.save();
                await nodoRequerido.save();
            } catch (error) {
                console.log(`Error guardando los nodos después de la vinculación: ${error}`);
                throw new ApolloError("Error conectando con la base de datos");
            }
            console.log(`Parented`);

            var respuesta: any = null;
            if (tipoRequiriente === 'usuario') {
                respuesta = {
                    nodosModificados: [nodoRequerido],
                    usuariosModificados: [nodoRequiriente]
                }
            }
            else {
                respuesta = {
                    nodosModificados: [nodoRequerido, nodoRequiriente]
                }
            }

            return respuesta;

        },
        async transferirRequerimentoBetweenNodosSolidaridad(_: any, { idNodoRequerido, idNodoSource, tipoNodoSource, idNodoTarget, tipoNodoTarget, index }, contexto: contextoQuery) {
            console.log(`Solicitud de transferencia del requerimento del nodo ${idNodoRequerido} desde ${idNodoSource} hacia ${idNodoTarget} en posicion ${index}`);
            if (!contexto || !contexto.usuario) {
                throw new AuthenticationError("No autorizado");
            }
            var nodosModificados:Array<any>=[];
            var usuariosModificados:Array<any>=[];

            var elNodoSource: any = null;
            try {
                var elNodoRequerido: any = await NodoSolidaridad.findById(idNodoRequerido).exec();
                if (tipoNodoSource === 'usuario') {
                    elNodoSource = await Usuario.findById(idNodoSource).exec();
                }
                else {
                    elNodoSource = await NodoSolidaridad.findById(idNodoSource).exec();
                }

                var elNodoTarget:any=null;
                if (idNodoTarget != idNodoSource) {
                    if(tipoNodoTarget==='usuario'){
                        elNodoTarget = await Usuario.findById(idNodoTarget).exec();
                    }
                    else{
                        elNodoTarget = await NodoSolidaridad.findById(idNodoTarget).exec();
                    }
                }
                else {
                    var elNodoTarget = elNodoSource;
                }
            } catch (error) {
                console.log(`Error getting nodos involucrados: ${error}`);
                throw new ApolloError("Error conectando con la base de datos");
            }

            var responsablesAmplioSource:Array<string>=[];
            if(tipoNodoSource==='usuario'){
                responsablesAmplioSource=[elNodoSource.id];
            }
            else{
                responsablesAmplioSource = await getResponsablesAmplioNodo(elNodoSource);
            }
            if (!responsablesAmplioSource.includes(contexto.usuario.id)) {
                console.log(`El usuario no era responsable amplio del nodoSource`);
                throw new AuthenticationError("No autorizado");
            }

            var responsablesAmplioTarget:Array<string>=[];
            if(tipoNodoTarget==='usuario'){
                responsablesAmplioTarget=[elNodoTarget.id];
            }
            else{
                responsablesAmplioTarget = await getResponsablesAmplioNodo(elNodoTarget);
            }

            if (!responsablesAmplioTarget.includes(contexto.usuario.id)) {
                console.log(`El usuario no era responsable amplio del nodoTarget`);
                throw new AuthenticationError("No autorizado");
            }

            //Prevenir loop
            if (await checkIfNodoRecursivelyUnderNodo(elNodoRequerido, idNodoTarget)) {
                console.log(`Habría loop en esta operación. Cancelando.`);
                throw new UserInputError("Requerimento genera bucle");
            }

            //Insertar vinculo en el nodo target            
            var nuevoVinculo = elNodoTarget.vinculos.create({
                tipo: 'requiere',
                idRef: elNodoRequerido.id,
            });
            elNodoTarget.vinculos.splice(index, 0, nuevoVinculo);
            if(tipoNodoTarget==='usuario'){
                usuariosModificados.push(elNodoTarget);
            }
            else{
                nodosModificados.push(elNodoTarget);
            }

            //Retirar vínculo del nodo source.
            const indexSource = elNodoSource.vinculos.findIndex(v => v.idRef === idNodoRequerido && v.id != nuevoVinculo.id);
            if (indexSource > -1) {
                elNodoSource.vinculos.splice(indexSource, 1);
            }
            else {
                console.log(`El nodoRequerido no aparecía en los vínculos del nodoSource`);
                throw new UserInputError("Datos inválidos");
            }
            if(tipoNodoSource==='usuario'){
                usuariosModificados.push(elNodoSource);
            }
            else{
                nodosModificados.push(elNodoSource);
            }

            //Si es necesario, cambiar parenting del nodo requerido.
            if (elNodoRequerido.nodoParent === idNodoSource && idNodoSource != idNodoTarget) {//Estaba siendo sacado de su nodo parent
                console.log(`Transfiriendo parenting`);
                elNodoRequerido.tipoParent = tipoNodoTarget;
                elNodoRequerido.nodoParent = idNodoTarget;
                nodosModificados.push(elNodoRequerido);
                try {
                    await elNodoRequerido.save();
                } catch (error) {
                    console.log(`Error guardando el nodo rquerido: ${error}`);
                    throw new ApolloError("Error conectando con la base de datos");
                }
            }

            try {
                await elNodoSource.save();
                if (idNodoTarget != idNodoSource) {
                    await elNodoTarget.save();
                }
            } catch (error) {
                console.log(`Error guardando los nodos source y target: ${error}`);
                throw new ApolloError("Error conectando con la base de datos");
            }

            if (idNodoSource != idNodoTarget) {
                emitirPosicionamientoNodos();
            }
            
            return {nodosModificados, usuariosModificados};
        },

        async crearRecursoExternoNodoSolidaridad(_: any, { idNodo }: any, contexto: contextoQuery) {
            console.log(`Peticion de crear un nuevo recursoExterno en el NodoSolidaridad con id ${idNodo}`);


            try {
                var elNodo:any = await NodoSolidaridad.findById(idNodo).exec();
                if (!elNodo) {
                    throw "nodo no encontrado"
                }
            }
            catch (error) {
                console.log("Error buscando el nodo a eliminar en la base de datos. E: " + error);
                throw new ApolloError("Error conectando con la base de datos");
            }

            //Authorización
            const permisosEspeciales = ["superadministrador"];

            const credencialesUsuario = contexto.usuario;
            var responsablesAmplio = await getResponsablesAmplioNodo(elNodo);
            if (!responsablesAmplio.includes(credencialesUsuario.id) && !credencialesUsuario.permisos.some(p => permisosEspeciales.includes(p))) {
                console.log(`Error de autenticacion creando movimientoDinero de nodoSolidaridad`);
                throw new AuthenticationError("No autorizado");
            }

            try {
                var nuevoRecursoExterno = elNodo.recursosExternos.create();
                elNodo.recursosExternos.push(nuevoRecursoExterno);
                await elNodo.save();
            }
            catch (error) {
                console.log("Error guardando el recursoExterno creado en el nodo. E: " + error);
                throw new ApolloError("Error introduciendo el recursoExterno en el nodo");
            }

            console.log(`Enviando nuevo recursoExterno: ${nuevoRecursoExterno}`);
            return nuevoRecursoExterno;
        },
        async eliminarRecursoExternoNodoSolidaridad(_: any, { idNodo, idRecursoExterno }: any, contexto: contextoQuery) {
            console.log(`Peticion de eliminar un recursoExterno con id ${idRecursoExterno} en el NodoSolidaridad con id ${idNodo}`);

            try {
                var elNodo:any = await NodoSolidaridad.findById(idNodo).exec();
                if (!elNodo) {
                    throw "nodo no encontrado"
                }
            }
            catch (error) {
                console.log("Error buscando el nodo a eliminar en la base de datos. E: " + error);
                throw new ApolloError("Error conectando con la base de datos");
            }

            //Authorización
            const permisosEspeciales = ["superadministrador"];

            const credencialesUsuario = contexto.usuario;
            var responsablesAmplio = await getResponsablesAmplioNodo(elNodo);
            if (!responsablesAmplio.includes(credencialesUsuario.id) && !credencialesUsuario.permisos.some(p => permisosEspeciales.includes(p))) {
                console.log(`Error de autenticacion creando movimientoDinero de nodoSolidaridad`);
                throw new AuthenticationError("No autorizado");
            }

            const indexE = elNodo.recursosExternos.findIndex(e => e.id === idRecursoExterno);

            if (indexE > -1) {
                elNodo.recursosExternos.splice(indexE, 1);
            }
            else {
                console.log(`Error. El recursoExterno a eliminar no existía.`);
                throw new UserInputError("RecursoExterno no encontrado");
            }

            try {
                await elNodo.save();
            }
            catch (error) {
                console.log("Error guardando el nodo. E: " + error);
                throw new ApolloError("Error introduciendo el recursoExterno en el nodo");
            }

            return true;
        },
        async editarDatosRecursoExternoNodoSolidaridad(_: any, { idNodo, idRecursoExterno, nuevoNombre, nuevoDescripcion, nuevoLink }, contexto: contextoQuery) {

            console.log(`cambiando la descripcion del recursoExterno con id ${idRecursoExterno} del nodosolidaridad con id ${idNodo}`);

            nuevoLink = nuevoLink.replace(/\s\s+/g, " ");
            nuevoLink = nuevoLink.trim();
            nuevoNombre = nuevoNombre.replace(/\s\s+/g, " ");
            nuevoNombre = nuevoNombre.trim();
            nuevoDescripcion = nuevoDescripcion.trim();


            if (charProhibidosDescripcion.test(nuevoDescripcion)) {
                throw new ApolloError("Descripcion ilegal");
            }
            if (charProhibidosNombreRecursoExterno.test(nuevoNombre)) {
                throw new ApolloError("Nombre ilegal");
            }


            try {
                var elNodo:any = await NodoSolidaridad.findById(idNodo).exec();
                if (!elNodo) {
                    throw "nodo no encontrado"
                }
            }
            catch (error) {
                console.log("Error buscando el nodo a eliminar en la base de datos. E: " + error);
                throw new ApolloError("Error conectando con la base de datos");
            }

            //Authorización
            const permisosEspeciales = ["superadministrador"];

            const credencialesUsuario = contexto.usuario;
            var responsablesAmplio = await getResponsablesAmplioNodo(elNodo);
            if (!responsablesAmplio.includes(credencialesUsuario.id) && !credencialesUsuario.permisos.some(p => permisosEspeciales.includes(p))) {
                console.log(`Error de autenticacion creando movimientoDinero de nodoSolidaridad`);
                throw new AuthenticationError("No autorizado");
            }

            try {
                var elRecursoExterno = elNodo.recursosExternos.id(idRecursoExterno);
                if (!elRecursoExterno) {
                    console.log(`RecursoExterno no encontrado en el nodosolidaridad`);
                    throw "No existía el recursoExterno";
                }
                elRecursoExterno.nombre = nuevoNombre;
                elRecursoExterno.descripcion = nuevoDescripcion;
                elRecursoExterno.link = nuevoLink;

            }
            catch (error) {
                console.log("Error cambiando los datos del recursoExterno en la base de datos. E: " + error);
                throw new ApolloError("Error guardando los datos del recursoExterno en la base de datos");
            }
            try {
                await elNodo.save();
            }
            catch (error) {
                console.log("Error guardando el recursoExterno editado en el nodosolidaridad. E: " + error);
                throw new ApolloError("Error introduciendo nuevos datos en el recursoExterno en el nodosolidaridad");
            }
            console.log(`Descripcion cambiado`);
            return elRecursoExterno;
        },
        async editarNombreRecursoExternoNodoSolidaridad(_: any, { idNodo, idRecursoExterno, nuevoNombre }, contexto: contextoQuery) {

            console.log(`cambiando el nombre del recursoExterno con id ${idRecursoExterno} del nodosolidaridad con id ${idNodo}`);

            nuevoNombre = nuevoNombre.trim();
            nuevoNombre = nuevoNombre.replace(/[\n\r]/g, " ");
            nuevoNombre = nuevoNombre.replace(/\s\s+/g, " ");
            if (charProhibidosNombreRecursoExterno.test(nuevoNombre)) {
                throw new ApolloError("Nombre ilegal");
            }

            nuevoNombre = nuevoNombre.trim();

            try {

                var elNodo:any = await NodoSolidaridad.findById(idNodo).exec();
                if (!elNodo) {
                    throw "nodo no encontrado"
                }
            }
            catch (error) {
                console.log("Error buscando el nodo a eliminar en la base de datos. E: " + error);
                throw new ApolloError("Error conectando con la base de datos");
            }

            //Authorización
            const responsablesAmplioNodo=await getResponsablesAmplioNodo(elNodo);
            const permisosEspeciales=["superadministrador"];
            const credencialesUsuario = contexto.usuario;
            if (!responsablesAmplioNodo.includes(credencialesUsuario.id) && !credencialesUsuario.permisos.some(p=>permisosEspeciales.includes(p))) {
                console.log(`Error de autenticacion editando nombre de nodosolidaridad`);
                throw new AuthenticationError("No autorizado");
            }

            try {
                var elRecursoExterno = elNodo.recursosExternos.id(idRecursoExterno);
                if (!elRecursoExterno) {
                    console.log(`RecursoExterno no encontrado en el nodosolidaridad`);
                    throw "No existía el recursoExterno";
                }
                elRecursoExterno.nombre = nuevoNombre;
            }
            catch (error) {
                console.log("Error cambiando el nombre en la base de datos. E: " + error);
                throw new ApolloError("Error guardando el nombre en la base de datos");
            }
            try {
                await elNodo.save();
            }
            catch (error) {
                console.log("Error guardando el recursoExterno creado en el nodosolidaridad. E: " + error);
                throw new ApolloError("Error introduciendo el recursoExterno en el nodosolidaridad");
            }
            console.log(`Nombre cambiado`);
            return elRecursoExterno;
        },
        async editarDescripcionRecursoExternoNodoSolidaridad(_: any, { idNodo, idRecursoExterno, nuevoDescripcion }, contexto: contextoQuery) {

            console.log(`cambiando la descripcion del recursoExterno con id ${idRecursoExterno} del nodosolidaridad con id ${idNodo}`);

            if (charProhibidosDescripcion.test(nuevoDescripcion)) {
                throw new ApolloError("Descripcion ilegal");
            }

            nuevoDescripcion = nuevoDescripcion.trim();

            try {
                var elNodo:any = await NodoSolidaridad.findById(idNodo).exec();
                if (!elNodo) {
                    throw "nodo no encontrado"
                }
            }
            catch (error) {
                console.log("Error buscando el nodo a eliminar en la base de datos. E: " + error);
                throw new ApolloError("Error conectando con la base de datos");
            }

            //Authorización
            const permisosEspeciales = ["superadministrador"];

            const credencialesUsuario = contexto.usuario;
            var responsablesAmplio = await getResponsablesAmplioNodo(elNodo);
            if (!responsablesAmplio.includes(credencialesUsuario.id) && !credencialesUsuario.permisos.some(p => permisosEspeciales.includes(p))) {
                console.log(`Error de autenticacion creando movimientoDinero de nodoSolidaridad`);
                throw new AuthenticationError("No autorizado");
            }


            try {
                var elRecursoExterno = elNodo.recursosExternos.id(idRecursoExterno);
                if (!elRecursoExterno) {
                    console.log(`RecursoExterno no encontrado en el nodosolidaridad`);
                    throw "No existía el recursoExterno";
                }
                elRecursoExterno.descripcion = nuevoDescripcion;
            }
            catch (error) {
                console.log("Error cambiando el descripcion en la base de datos. E: " + error);
                throw new ApolloError("Error guardando el descripcion en la base de datos");
            }
            try {
                await elNodo.save();
            }
            catch (error) {
                console.log("Error guardando el recursoExterno creado en el nodosolidaridad. E: " + error);
                throw new ApolloError("Error introduciendo el recursoExterno en el nodosolidaridad");
            }
            console.log(`Descripcion cambiado`);
            return elRecursoExterno;
        },
        async editarLinkRecursoExternoNodoSolidaridad(_: any, { idNodo, idRecursoExterno, nuevoLink }, contexto: contextoQuery) {

            console.log(`cambiando el link del recursoExterno con id ${idRecursoExterno} del nodosolidaridad con id ${idNodo}`);
            // const charProhibidosLinkRecursoExterno = /[^ a-zA-ZÀ-ž0-9_.-?/=:]/;

            nuevoLink = nuevoLink.replace(/\s\s+/g, " ");
            // if (charProhibidosLinkRecursoExterno.test(nuevoLink)) {
            //     throw new ApolloError("Link ilegal");
            // }

            nuevoLink = nuevoLink.trim();
            nuevoLink = nuevoLink.replace(/[\n\r]/g, "");
            nuevoLink = nuevoLink.replace(" ", "");
            try {
                var elNodo:any = await NodoSolidaridad.findById(idNodo).exec();
                if (!elNodo) {
                    throw "nodo no encontrado"
                }
            }
            catch (error) {
                console.log("Error buscando el nodo en la base de datos. E: " + error);
                throw new ApolloError("Error conectando con la base de datos");
            }

            //Authorización
            const credencialesUsuario = contexto.usuario;
            var responsablesAmplio = await getResponsablesAmplioNodo(elNodo);
            if (!responsablesAmplio.includes(credencialesUsuario.id) && !credencialesUsuario.permisos.includes("superadministrador")) {
                console.log(`Error de autenticacion editando link de nodosolidaridad`);
                throw new AuthenticationError("No autorizado");
            }

            try {
                var elRecursoExterno = elNodo.recursosExternos.id(idRecursoExterno);
                if (!elRecursoExterno) {
                    console.log(`RecursoExterno no encontrado en el nodosolidaridad`);
                    throw "No existía el recursoExterno";
                }
                elRecursoExterno.link = nuevoLink;
                elRecursoExterno.tipo = 'enlace';
            }
            catch (error) {
                console.log("Error cambiando el link en la base de datos. E: " + error);
                throw new ApolloError("Error guardando el link en la base de datos");
            }
            try {
                await elNodo.save();
            }
            catch (error) {
                console.log("Error guardando el recursoExterno editado en el nodosolidaridad. E: " + error);
                throw new ApolloError("Error introduciendo el recursoExterno en el nodosolidaridad");
            }
            console.log(`Link cambiado`);
            return elRecursoExterno;
        },


        async editarNombreNodoSolidaridad(_: any, { idNodo, nuevoNombre }, contexto: contextoQuery) {

            console.log(`Petición de cambiar el nombre del nodoSolidaridad con id ${idNodo}`);


            try {
                var elNodo: any = await NodoSolidaridad.findById(idNodo).exec();
                if (!elNodo) {
                    throw "NodoSolidaridad no encontrado"
                }
            }
            catch (error) {
                console.log("Error buscando el nodoSolidaridad. E: " + error);
                throw new ApolloError("Erro en la conexión con la base de datos");
            }

            var administradores = await getAdministradoresNodo(elNodo);

            //Authorización
            const credencialesUsuario = contexto.usuario;
            if (!administradores.includes(credencialesUsuario.id) && !credencialesUsuario.permisos.includes("superadministrador")) {
                console.log(`Error de autenticacion editando nombre de nodoSolidaridad`);
                throw new AuthenticationError("No autorizado");
            }

            const charProhibidosNombreNodoSolidaridad = /[^ a-zA-ZÀ-ž0-9_():.,-]/;

            nuevoNombre = nuevoNombre.replace(/\s\s+/g, " ");
            if (charProhibidosNombreNodoSolidaridad.test(nuevoNombre)) {
                throw new ApolloError("Nombre ilegal");
            }

            nuevoNombre = nuevoNombre.trim();
            nuevoNombre.replace(/  +/g, ' ');
            nuevoNombre = nuevoNombre.replace(/[\n\r]/g, "");

            try {
                elNodo.nombre = nuevoNombre;
                await elNodo.save();
            }
            catch (error) {
                console.log("Error cambiando el nombre en la base de datos. E: " + error);
                throw new ApolloError("Error guardando el nombre en la base de datos");
            }

            console.log(`Nombre cambiado`);

            return elNodo;
        },
        async editarDescripcionNodoSolidaridad(_: any, { idNodo, nuevoDescripcion }, contexto: contextoQuery) {
            const credencialesUsuario = contexto.usuario;

            try {
                var elNodo: any = await NodoSolidaridad.findById(idNodo).exec();
                if (!elNodo) {
                    throw "Nodo no encontrado"
                }
            }
            catch (error) {
                console.log("Error buscando el nodo. E: " + error);
                throw new ApolloError("Error en la conexión con la base de datos");
            }

            var administradores = await getAdministradoresNodo(elNodo);

            //Authorización
            if (!administradores.includes(credencialesUsuario.id) && !credencialesUsuario.permisos.includes("superadministrador")) {
                console.log(`Error de autenticacion editando descripció de nodoSolidaridad`);
                throw new AuthenticationError("No autorizado");
            }


            if (charProhibidosDescripcion.test(nuevoDescripcion)) {
                throw new ApolloError("Descripcion ilegal");
            }

            nuevoDescripcion = nuevoDescripcion.trim();
            nuevoDescripcion.replace("  ", "");

            try {
                elNodo.descripcion = nuevoDescripcion;
                await elNodo.save();
            } catch (error) {
                console.log(`error guardando el nodoSolidaridad modificado: ${error}`);
                throw new ApolloError("Error guardando información en la base de datos");

            }
            console.log(`Descripcion guardado`);

            return elNodo;
        },
        async editarKeywordsNodoSolidaridad(_: any, { idNodo, nuevoKeywords }, contexto: contextoQuery) {
            const credencialesUsuario = contexto.usuario;
            try {
                var elNodo: any = await NodoSolidaridad.findById(idNodo).exec();
                if (!elNodo) {
                    throw "nodoSolidaridad no encontrado"
                }
            }
            catch (error) {
                console.log("Error buscando el nodoSolidaridad. E: " + error);
                throw new ApolloError("Erro en la conexión con la base de datos");
            }

            var administradores = await getAdministradoresNodo(elNodo);

            //Authorización
            if (!administradores.includes(credencialesUsuario.id) && !credencialesUsuario.permisos.includes("superadministrador")) {
                console.log(`Error de autenticacion editando nombre de nodoSolidaridad`);
                throw new AuthenticationError("No autorizado");
            }

            const charProhibidosKeywordsNodoSolidaridad = /[^ a-zA-Zñ,]/;

            if (charProhibidosKeywordsNodoSolidaridad.test(nuevoKeywords)) {
                throw new ApolloError("Keywords ilegal");
            }

            nuevoKeywords = nuevoKeywords.trim();
            nuevoKeywords.replace(/  +/g, ' ');
            nuevoKeywords = nuevoKeywords.replace(/[\n\r]/g, "");

            try {
                elNodo.keywords = nuevoKeywords;
                console.log(`guardando nuevo keywords ${nuevoKeywords} en la base de datos`);
                await elNodo.save();
            } catch (error) {
                console.log(`error guardando el nodoSolidaridad modificado: ${error}`);
            }
            console.log(`Keywords guardado`);
            return elNodo;
        },
        addResponsableNodoSolidaridad: async function (_: any, { idNodo, idUsuario }: any, contexto: contextoQuery) {
            console.log(`Solicitud de add un usuario con id ${idUsuario} a un nodo de id ${idNodo}`);
            const credencialesUsuario = contexto.usuario;

            try {
                var elNodo: any = await NodoSolidaridad.findById(idNodo).exec();
                if (!elNodo) throw "Nodo no existía";
            } catch (error) {
                console.log('Error buscando el nodo . E: ' + error);
                throw new ApolloError('Error conectando con la base de datos');
            }

            //Authorización
            if (!credencialesUsuario.permisos.includes("superadministrador")) {
                console.log(`Error de autenticacion. `);
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

            if (elNodo.responsables.includes(idUsuario)) {
                console.log(`El usuario ya era responsable de este nodo`);
                throw new ApolloError("El usuario ya estaba incluido");
            }

            let indexPosibleResponsable = elNodo.posiblesResponsables.indexOf(idUsuario);
            if (indexPosibleResponsable > -1) {
                console.log(`sacando al usuario ${idUsuario} de la lista de posibles responsables`);
                elNodo.posiblesResponsables.splice(indexPosibleResponsable, 1);
            }
            else {
                if (elNodo.responsables.length > 0) {
                    console.log(`Error. Se intentaba add como responsable un usuario que no estaba en la lista de posibles responsables.`);
                    throw new UserInputError("El usuario no estaba en la lista de espera para responsables.")
                }
            }

            try {
                elNodo.responsables.push(idUsuario);
                console.log(`Usuario añadido a la lista de responsables`);
                await elNodo.save();
            }
            catch (error) {
                console.log("Error guardando datos en la base de datos. E: " + error);
                throw new ApolloError("Error conectando con la base de datos");
            }
            console.log(`NodoSolidaridad guardado`);


            return elNodo;

        },
        usuarioEntrarResponsableNodoSolidaridad: async function (_: any, { idNodo }: any, contexto: contextoQuery) {
            console.log(`Solicitud de un usuario para entrar cona un nodo de id ${idNodo}`);
            var credencialesUsuario = contexto.usuario;
            const idUsuario = credencialesUsuario.id;

            try {
                var elNodo: any = await NodoSolidaridad.findById(idNodo).exec();
                if (!elNodo) throw "Nodo no existía";
            } catch (error) {
                console.log('Error buscando el nodo . E: ' + error);
                throw new ApolloError('Error conectando con la base de datos');
            }

            if (elNodo.responsables.includes(idUsuario)) {
                console.log(`El usuario ya era responsable de este nodo`);
                throw new UserInputError("El usuario ya estaba incluido");
            }

            if (elNodo.posiblesResponsables.includes(idUsuario)) {
                console.log(`El usuario ya era posible responsable de este nodo`);
                throw new UserInputError("El usuario ya estaba incluido");
            }

            if (elNodo.responsables.length > 0) {
                elNodo.posiblesResponsables.push(idUsuario);
            }
            else {
                elNodo.responsables.push(idUsuario);
            }

            try {
                await elNodo.save();
            }
            catch (error) {
                console.log("Error guardando datos en la base de datos. E: " + error);
                throw new ApolloError("Error conectando con la base de datos");
            }
            console.log(`NodoSolidaridad guardado`);
            return elNodo;
        },
        addPosibleResponsableNodoSolidaridad: async function (_: any, { idNodo, idUsuario }: any, contexto: contextoQuery) {
            console.log(`añadiendo usuario ${idUsuario} a la lista de posibles responsables del nodo ${idNodo}`);
            const credencialesUsuario = contexto.usuario;
            try {
                var elNodo: any = await NodoSolidaridad.findById(idNodo).exec();
                if (!elNodo) {
                    throw "Nodo no encontrado"
                }
            }
            catch (error) {
                console.log("Error buscando el nodo en la base de datos. E: " + error);
                throw new ApolloError("Error de conexión con la base de datos");
            }

            //Authorización

            if (!credencialesUsuario.permisos.includes("superadministrador")) {
                console.log(`Error de autenticacion añadiendo posible responsable del nodo`);
                throw new AuthenticationError("No autorizado");
            }

            if (elNodo.posiblesResponsables.includes(idUsuario) || elNodo.responsables.includes(idUsuario)) {
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
                elNodo.posiblesResponsables.push(idUsuario);
                await elNodo.save();
            }
            catch (error) {
                console.log("Error guardando datos en la base de datos. E: " + error);
                throw new ApolloError("Error conectando con la base de datos");
            }
            console.log(`Nodo guardado`);

            //Crear notificacion para los responsables actuales del nodo

            try {
                var currentResponsables: any = await Usuario.find({ _id: { $in: elNodo.responsables } }).exec();
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
                            id: elNodo.id
                        },
                    });
                    responsable.notificaciones.push(newNotificacion);
                });
            }
            return elNodo
        },
        removeResponsableNodoSolidaridad: async function (_: any, { idNodo, idUsuario }: any, contexto: contextoQuery) {
            console.log(`Solicitud de remove un usuario con id ${idUsuario} de un nodo de id ${idNodo}`);
            const credencialesUsuario = contexto.usuario;

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
                var elNodo: any = await NodoSolidaridad.findById(idNodo).exec();
                if (!elNodo) throw "Nodo no existía";
            } catch (error) {
                console.log('Error buscando el nodo . E: ' + error);
                throw new ApolloError('Error conectando con la base de datos');
            }

            const indexPosibleResponsable = elNodo.posiblesResponsables.indexOf(idUsuario);

            if (indexPosibleResponsable > -1) {
                console.log(`sacando al usuario ${idUsuario} de la lista de posibles responsables`);
                elNodo.posiblesResponsables.splice(indexPosibleResponsable, 1);
            }

            const indexResponsable = elNodo.responsables.indexOf(idUsuario);

            if (indexResponsable > -1) {
                console.log(`sacando al usuario ${idUsuario} de la lista de responsables`);
                elNodo.responsables.splice(indexResponsable, 1);
            }
            console.log(`Usuario retirado de la lista de responsables`);

            try {
                await elNodo.save();
            }
            catch (error) {
                console.log("Error guardando datos en la base de datos. E: " + error);
                throw new ApolloError("Error conectando con la base de datos");
            }
            console.log(`NodoSolidaridad guardado`);

            return elNodo;
        },
        async setEstadoNodoSolidaridad(_: any, { idNodo, nuevoEstado }, contexto: contextoQuery) {

            const credencialesUsuario = contexto.usuario;
            try {
                var elNodo: any = await NodoSolidaridad.findById(idNodo).exec();
                if (!elNodo) {
                    throw "Nodo no encontrado"
                }
            }
            catch (error) {
                console.log("Error buscando el nodo. E: " + error);
                throw new ApolloError("Error en la conexión con la base de datos");
            }

            var administradores = await getAdministradoresNodo(elNodo);

            //Authorización
            if (!administradores.includes(credencialesUsuario.id) && !credencialesUsuario.permisos.includes("superadministrador")) {
                console.log(`Error de autenticacion editando nombre de nodoSolidaridad`);
                throw new AuthenticationError("No autorizado");
            }

            try {
                elNodo.estadoDesarrollo = nuevoEstado;
                console.log(`guardando nuevo estado ${nuevoEstado} en la base de datos`);
                await elNodo.save();
            } catch (error) {
                console.log(`error guardando el nodoSolidaridad modificado: ${error}`);
                throw new ApolloError("Error guardando información en la base de datos");

            }
            console.log(`Estado guardado`);

            return elNodo;
        },

        async crearNuevoMovimientoDineroNodoSolidaridad(_: any, { idNodo }: any, contexto: contextoQuery) {
            console.log(`Peticion de crear un nuevo movimientoDinero en el nodoSolidaridad con id ${idNodo}`);

            if (!contexto.usuario) {
                throw new AuthenticationError("Login requerido")
            }

            try {
                var elNodo: any = await NodoSolidaridad.findById(idNodo).exec();
                if (!elNodo) throw "NodoSolidaridad no encontrado"
            } catch (error) {
                console.log(`Error buscando el nodoSolidaridad. E: ${error}`);
                throw new ApolloError("Error conectando con la base de datos");
            }

            //Authorización
            const permisosEspeciales = ["superadministrador"];

            const credencialesUsuario = contexto.usuario;
            var responsablesAmplio = await getResponsablesAmplioNodo(elNodo);
            if (!responsablesAmplio.includes(credencialesUsuario.id) && !credencialesUsuario.permisos.some(p => permisosEspeciales.includes(p))) {
                console.log(`Error de autenticacion creando movimientoDinero de nodoSolidaridad`);
                throw new AuthenticationError("No autorizado");
            }

            try {
                var nuevoMovimiento = elNodo.movimientosDinero.create();
                elNodo.movimientosDinero.push(nuevoMovimiento);
                await elNodo.save();
            }
            catch (error) {
                console.log("Error guardando el movimientoDinero creado en el nodoSolidaridad. E: " + error);
                throw new ApolloError("Error introduciendo el movimientoDinero en el nodoSolidaridad");
            }

            return nuevoMovimiento;
        },
        async eliminarMovimientoDineroNodoSolidaridad(_: any, { idMovimientoDinero, idNodo }: any, contexto: contextoQuery) {
            console.log(`peticion de eliminar un movimientoDinero con id ${idMovimientoDinero} de un nodoSolidaridad con id ${idNodo}`);

            try {
                var elNodo: any = await NodoSolidaridad.findById(idNodo).exec();
                if (!elNodo) {
                    throw "nodoSolidaridad no encontrado"
                }
            }
            catch (error) {
                console.log("Error buscando el nodoSolidaridad en la base de datos. E: " + error);
                throw new ApolloError("Error conectando con la base de datos");
            }


            //Authorización
            const permisosEspeciales = ["superadministrador"];

            const credencialesUsuario = contexto.usuario;
            var responsablesAmplio = await getResponsablesAmplioNodo(elNodo);
            if (!responsablesAmplio.includes(credencialesUsuario.id) && !credencialesUsuario.permisos.some(p => permisosEspeciales.includes(p))) {
                console.log(`Error de autenticacion eliminando movimientoDinero de nodoSolidaridad`);
                throw new AuthenticationError("No autorizado");
            }

            try {
                elNodo.movimientosDinero.id(idMovimientoDinero).remove();
                await elNodo.save();
            }
            catch (error) {
                console.log("Error eliminando el movimientoDinero. E: " + error);
                throw new ApolloError("Error conectando con la base de datos");
            }

            console.log(`eliminado`);

            return true;
        },
        async editarFechaMovimientoDineroNodoSolidaridad(_: any, { idNodo, idMovimientoDinero, nuevoFecha }, contexto: contextoQuery) {

            console.log(`cambiando el fecha del movimientoDinero con id ${idMovimientoDinero} del nodoSolidaridad con id ${idNodo}`);


            try {
                var elNodo: any = await NodoSolidaridad.findById(idNodo).exec();
                if (!elNodo) {
                    throw "nodoSolidaridad no encontrado"
                }
            }
            catch (error) {
                console.log("Error buscando el nodoSolidaridad. E: " + error);
                throw new ApolloError("Erro en la conexión con la base de datos");
            }

            //Authorización
            const permisosEspeciales = ["superadministrador"];

            const credencialesUsuario = contexto.usuario;
            var responsablesAmplio = await getResponsablesAmplioNodo(elNodo);
            if (!responsablesAmplio.includes(credencialesUsuario.id) && !credencialesUsuario.permisos.some(p => permisosEspeciales.includes(p))) {
                console.log(`Error de autenticacion editando fecha de movimientoDinero de nodoSolidaridad`);
                throw new AuthenticationError("No autorizado");
            }

            try {
                var elMovimiento = elNodo.movimientosDinero.id(idMovimientoDinero);
                if (!elMovimiento) {
                    console.log(`MovimientoDinero no encontrado en el nodoSolidaridad`);
                    throw "No existía el movimientoDinero";
                }
                elMovimiento.fecha = nuevoFecha;
            }
            catch (error) {
                console.log("Error cambiando fecha en la base de datos. E: " + error);
                throw new ApolloError("Error guardando fecha en la base de datos");
            }
            try {
                await elNodo.save();
            }
            catch (error) {
                console.log("Error guardando el movimientoDinero creado en el nodoSolidaridad. E: " + error);
                throw new ApolloError("Error introduciendo el movimientoDinero en el nodoSolidaridad");
            }
            console.log(`Artículo cambiado`);
            return elMovimiento;
        },
        async editarArticuloMovimientoDineroNodoSolidaridad(_: any, { idNodo, idMovimientoDinero, nuevoArticulo }, contexto: contextoQuery) {

            console.log(`cambiando el articulo del movimientoDinero con id ${idMovimientoDinero} del nodoSolidaridad con id ${idNodo} a ${nuevoArticulo}`);


            try {
                var elNodo: any = await NodoSolidaridad.findById(idNodo).exec();
                if (!elNodo) {
                    throw "nodoSolidaridad no encontrado"
                }
            }
            catch (error) {
                console.log("Error buscando el nodoSolidaridad. E: " + error);
                throw new ApolloError("Erro en la conexión con la base de datos");
            }

            //Authorización
            const permisosEspeciales = ["superadministrador"];

            const credencialesUsuario = contexto.usuario;
            var responsablesAmplio = await getResponsablesAmplioNodo(elNodo);
            if (!responsablesAmplio.includes(credencialesUsuario.id) && !credencialesUsuario.permisos.some(p => permisosEspeciales.includes(p))) {
                console.log(`Error de autenticacion editando artículo de movimientoDinero de nodoSolidaridad`);
                throw new AuthenticationError("No autorizado");
            }
            const charProhibidosArticulo = /[^ a-zA-ZÀ-ž0-9_():.,-]/;

            nuevoArticulo = nuevoArticulo.replace(/\s\s+/g, " ");
            if (charProhibidosArticulo.test(nuevoArticulo)) {
                throw new ApolloError("Articulo ilegal");
            }

            nuevoArticulo = nuevoArticulo.trim();
            nuevoArticulo.replace(/  +/g, ' ');
            nuevoArticulo = nuevoArticulo.replace(/[\n\r]/g, "");
            try {
                var elMovimiento = elNodo.movimientosDinero.id(idMovimientoDinero);
                if (!elMovimiento) {
                    console.log(`MovimientoDinero no encontrado en el nodoSolidaridad`);
                    throw "No existía el movimientoDinero";
                }
                elMovimiento.articulo = nuevoArticulo;
            }
            catch (error) {
                console.log("Error cambiando el artículo en la base de datos. E: " + error);
                throw new ApolloError("Error guardando el artículo en la base de datos");
            }
            try {
                await elNodo.save();
            }
            catch (error) {
                console.log("Error guardando el movimientoDinero creado en el nodoSolidaridad. E: " + error);
                throw new ApolloError("Error introduciendo el movimientoDinero en el nodoSolidaridad");
            }
            console.log(`Artículo cambiado`);
            return elMovimiento;
        },
        async editarInformacionMovimientoDineroNodoSolidaridad(_: any, { idNodo, idMovimientoDinero, nuevoInformacion }, contexto: contextoQuery) {
            console.log(`|||||||||||||||||||`);
            console.log(`Solicitud de set informacion de movimientoDinero con id ${idMovimientoDinero} del nodoSolidaridad con id ${idNodo}`);
            try {
                var elNodo: any = await NodoSolidaridad.findById(idNodo).exec();
                if (!elNodo) {
                    throw "nodoSolidaridad no encontrado"
                }
            }
            catch (error) {
                console.log(`error buscando el nodoSolidaridad. E: ` + error);
            }

            //Authorización
            const permisosEspeciales = ["superadministrador"];

            const credencialesUsuario = contexto.usuario;
            var responsablesAmplio = await getResponsablesAmplioNodo(elNodo);
            if (!responsablesAmplio.includes(credencialesUsuario.id) && !credencialesUsuario.permisos.some(p => permisosEspeciales.includes(p))) {
                console.log(`Error de autenticacion editando información de movimientoDinero de nodoSolidaridad`);
                throw new AuthenticationError("No autorizado");
            }


            if (charProhibidosTexto.test(nuevoInformacion)) {
                throw new ApolloError("Informacion ilegal");
            }

            nuevoInformacion = nuevoInformacion.trim();
            nuevoInformacion.replace(/  +/g, ' ');
            let elMovimiento = elNodo.movimientosDinero.id(idMovimientoDinero);
            if (!elMovimiento) {
                console.log(`No existía el movimientoDinero`);
                throw new ApolloError("Error conectando con la base de datos");
            }
            elMovimiento.informacion = nuevoInformacion;
            try {
                console.log(`guardando nuevo informacion ${nuevoInformacion} en la base de datos`);
                await elNodo.save();
            } catch (error) {
                console.log(`error guardando el nodoSolidaridad con coordenadas manuales: ${error}`);
                throw new ApolloError("Error guardando información en la base de datos");
            }
            console.log(`Informacion guardado`);
            return elMovimiento;
        },
        async editarCantidadMovimientoDineroNodoSolidaridad(_: any, { idNodo, idMovimientoDinero, nuevoCantidad }, contexto: contextoQuery) {
            console.log(`|||||||||||||||||||`);
            console.log(`Solicitud de set cantidad de movimientoDinero con id ${idMovimientoDinero} del nodoSolidaridad con id ${idNodo}`);
            try {
                var elNodo: any = await NodoSolidaridad.findById(idNodo).exec();
                if (!elNodo) {
                    throw "nodoSolidaridad no encontrado"
                }
            }
            catch (error) {
                console.log(`error buscando el nodoSolidaridad. E: ` + error);
            }

            //Authorización
            const permisosEspeciales = ["superadministrador"];

            const credencialesUsuario = contexto.usuario;
            var responsablesAmplio = await getResponsablesAmplioNodo(elNodo);
            if (!responsablesAmplio.includes(credencialesUsuario.id) && !credencialesUsuario.permisos.some(p => permisosEspeciales.includes(p))) {
                console.log(`Error de autenticacion editando cantidad de movimientoDinero de nodoSolidaridad`);
                throw new AuthenticationError("No autorizado");
            }

            let elMovimiento = elNodo.movimientosDinero.id(idMovimientoDinero);
            if (!elMovimiento) {
                console.log(`No existía el movimientoDinero`);
                throw new ApolloError("Error conectando con la base de datos");
            }
            elMovimiento.cantidad = nuevoCantidad;

            try {
                await elNodo.save();
            } catch (error) {
                console.log(`error guardando el nodoSolidaridad con coordenadas manuales: ${error}`);
                throw new ApolloError("Error guardando información en la base de datos");
            }
            console.log(`Cantidades guardado`);
            return elMovimiento;
        },
        async editarMovimientoUnitarioMovimientoDineroNodoSolidaridad(_: any, { idNodo, idMovimientoDinero, nuevoMovimientoUnitario }, contexto: contextoQuery) {
            console.log(`|||||||||||||||||||`);
            console.log(`Solicitud de set movimientoUnitario de movimientoDinero con id ${idMovimientoDinero} del nodoSolidaridad con id ${idNodo}`);
            try {
                var elNodo: any = await NodoSolidaridad.findById(idNodo).exec();
                if (!elNodo) {
                    throw "nodoSolidaridad no encontrado"
                }
            }
            catch (error) {
                console.log(`error buscando el nodoSolidaridad. E: ` + error);
            }

            //Authorización
            const permisosEspeciales = ["superadministrador"];

            const credencialesUsuario = contexto.usuario;
            var responsablesAmplio = await getResponsablesAmplioNodo(elNodo);
            if (!responsablesAmplio.includes(credencialesUsuario.id) && !credencialesUsuario.permisos.some(p => permisosEspeciales.includes(p))) {
                console.log(`Error de autenticacion editando movimientoUnitario de movimientoDinero de nodoSolidaridad`);
                throw new AuthenticationError("No autorizado");
            }

            let elMovimiento = elNodo.movimientosDinero.id(idMovimientoDinero);
            if (!elMovimiento) {
                console.log(`No existía el movimientoDinero`);
                throw new ApolloError("Error conectando con la base de datos");
            }
            elMovimiento.movimientoUnitario = nuevoMovimientoUnitario;

            try {
                await elNodo.save();
            } catch (error) {
                console.log(`error guardando el nodoSolidaridad con coordenadas manuales: ${error}`);
                throw new ApolloError("Error guardando información en la base de datos");
            }
            console.log(`MovimientoUnitarioes guardado`);
            return elMovimiento;
        },
        async editarMovimientoTotalMovimientoDineroNodoSolidaridad(_: any, { idNodo, idMovimientoDinero, nuevoMovimientoTotal }, contexto: contextoQuery) {
            console.log(`|||||||||||||||||||`);
            console.log(`Solicitud de set movimientoTotal de movimientoDinero con id ${idMovimientoDinero} del nodoSolidaridad con id ${idNodo}`);
            try {
                var elNodo: any = await NodoSolidaridad.findById(idNodo).exec();
                if (!elNodo) {
                    throw "nodoSolidaridad no encontrado"
                }
            }
            catch (error) {
                console.log(`error buscando el nodoSolidaridad. E: ` + error);
            }

            //Authorización
            const permisosEspeciales = ["superadministrador"];

            const credencialesUsuario = contexto.usuario;
            var responsablesAmplio = await getResponsablesAmplioNodo(elNodo);
            if (!responsablesAmplio.includes(credencialesUsuario.id) && !credencialesUsuario.permisos.some(p => permisosEspeciales.includes(p))) {
                console.log(`Error de autenticacion editando movimientoTotal movimientoDinero de nodoSolidaridad`);
                throw new AuthenticationError("No autorizado");
            }

            let elMovimiento = elNodo.movimientosDinero.id(idMovimientoDinero);
            if (!elMovimiento) {
                console.log(`No existía el movimientoDinero`);
                throw new ApolloError("Error conectando con la base de datos");
            }
            elMovimiento.movimientoTotal = nuevoMovimientoTotal;

            try {
                await elNodo.save();
            } catch (error) {
                console.log(`error guardando el nodoSolidaridad con coordenadas manuales: ${error}`);
                throw new ApolloError("Error guardando información en la base de datos");
            }
            console.log(`MovimientoTotales guardado`);
            return elMovimiento;
        },
        async editarNumerosMovimientoDineroNodoSolidaridad(_: any, { idNodo, idMovimientoDinero, nuevoMovimientoUnitario, nuevoMovimientoTotal, nuevoCantidad }, contexto: contextoQuery) {
            console.log(`|||||||||||||||||||`);
            console.log(`Solicitud de set números de movimientoDinero con id ${idMovimientoDinero} del nodoSolidaridad con id ${idNodo}`);
            try {
                var elNodo: any = await NodoSolidaridad.findById(idNodo).exec();
                if (!elNodo) {
                    throw "nodoSolidaridad no encontrado"
                }
            }
            catch (error) {
                console.log(`error buscando el nodoSolidaridad. E: ` + error);
            }

            //Authorización
            const permisosEspeciales = ["superadministrador"];

            const credencialesUsuario = contexto.usuario;
            var responsablesAmplio = await getResponsablesAmplioNodo(elNodo);
            if (!responsablesAmplio.includes(credencialesUsuario.id) && !credencialesUsuario.permisos.some(p => permisosEspeciales.includes(p))) {
                console.log(`Error de autenticacion editando números movimientoDinero de nodoSolidaridad`);
                throw new AuthenticationError("No autorizado");
            }

            let elMovimiento = elNodo.movimientosDinero.id(idMovimientoDinero);
            if (!elMovimiento) {
                console.log(`No existía el movimientoDinero`);
                throw new ApolloError("Error conectando con la base de datos");
            }
            elMovimiento.movimientoUnitario = nuevoMovimientoUnitario;
            elMovimiento.movimientoTotal = nuevoMovimientoTotal;
            elMovimiento.cantidad = nuevoCantidad;

            try {
                await elNodo.save();
            } catch (error) {
                console.log(`error guardando el nodoSolidaridad con coordenadas manuales: ${error}`);
                throw new ApolloError("Error guardando información en la base de datos");
            }
            console.log(`MovimientoUnitarioes guardado`);
            return elMovimiento;
        },
        async setRealizadoMovimientoDineroNodoSolidaridad(_: any, { idNodo, idMovimientoDinero, nuevoRealizado }, contexto: contextoQuery) {
            console.log(`cambiando el realizado del movimientoDinero con id ${idMovimientoDinero} del nodoSolidaridad con id ${idNodo}`);


            try {
                var elNodo: any = await NodoSolidaridad.findById(idNodo).exec();
                if (!elNodo) {
                    throw "nodoSolidaridad no encontrado"
                }
            }
            catch (error) {
                console.log("Error buscando el nodoSolidaridad. E: " + error);
                throw new ApolloError("Erro en la conexión con la base de datos");
            }

            //Authorización
            const permisosEspeciales = ["superadministrador"];

            const credencialesUsuario = contexto.usuario;
            var responsablesAmplio = await getResponsablesAmplioNodo(elNodo);
            if (!responsablesAmplio.includes(credencialesUsuario.id) && !credencialesUsuario.permisos.some(p => permisosEspeciales.includes(p))) {
                console.log(`Error de autenticacion setting estado de movimientoDinero de nodoSolidaridad`);
                throw new AuthenticationError("No autorizado");
            }

            try {
                var elMovimiento = elNodo.movimientosDinero.id(idMovimientoDinero);
                if (!elMovimiento) {
                    console.log(`MovimientoDinero no encontrado en el nodoSolidaridad`);
                    throw "No existía el movimientoDinero";
                }
                elMovimiento.realizado = nuevoRealizado;
            }
            catch (error) {
                console.log("Error cambiando el realizado en la base de datos. E: " + error);
                throw new ApolloError("Error guardando el realizado en la base de datos");
            }
            try {
                await elNodo.save();
            }
            catch (error) {
                console.log("Error guardando el movimientoDinero creado en el nodoSolidaridad. E: " + error);
                throw new ApolloError("Error introduciendo el movimientoDinero en el nodoSolidaridad");
            }
            console.log(`Realizado cambiado`);
            return elMovimiento;

        },

        async crearNuevoEventoNodoSolidaridad(_: any, { idNodo }: any, contexto: contextoQuery) {
            console.log(`Peticion de crear un nuevo evento en el nodoSolidaridad con id ${idNodo}`);

            if (!contexto.usuario) {
                throw new AuthenticationError("Login requerido")
            }

            try {
                var elNodo: any = await NodoSolidaridad.findById(idNodo).exec();
                if (!elNodo) throw "NodoSolidaridad no encontrado"
            } catch (error) {
                console.log(`Error buscando el nodoSolidaridad. E: ${error}`);
                throw new ApolloError("Error conectando con la base de datos");
            }

            //Authorización
            const permisosEspeciales = ["superadministrador"];

            const credencialesUsuario = contexto.usuario;
            var responsablesAmplio = await getResponsablesAmplioNodo(elNodo);
            if (!responsablesAmplio.includes(credencialesUsuario.id) && !credencialesUsuario.permisos.some(p => permisosEspeciales.includes(p))) {
                console.log(`Error de autenticacion creando evento de nodoSolidaridad`);
                throw new AuthenticationError("No autorizado");
            }

            try {
                var nuevoEvento = elNodo.eventos.create();
                elNodo.eventos.push(nuevoEvento);
                await elNodo.save();
            }
            catch (error) {
                console.log("Error guardando el evento creado en el nodoSolidaridad. E: " + error);
                throw new ApolloError("Error introduciendo el evento en el nodoSolidaridad");
            }

            return nuevoEvento;
        },
        async eliminarEventoNodoSolidaridad(_: any, { idEvento, idNodo }: any, contexto: contextoQuery) {
            console.log(`peticion de eliminar un evento con id ${idEvento} de un nodoSolidaridad con id ${idNodo}`);

            try {
                var elNodo: any = await NodoSolidaridad.findById(idNodo).exec();
                if (!elNodo) {
                    throw "nodoSolidaridad no encontrado"
                }
            }
            catch (error) {
                console.log("Error buscando el nodoSolidaridad en la base de datos. E: " + error);
                throw new ApolloError("Error conectando con la base de datos");
            }


            //Authorización
            const permisosEspeciales = ["superadministrador"];

            const credencialesUsuario = contexto.usuario;
            var responsablesAmplio = await getResponsablesAmplioNodo(elNodo);
            if (!responsablesAmplio.includes(credencialesUsuario.id) && !credencialesUsuario.permisos.some(p => permisosEspeciales.includes(p))) {
                console.log(`Error de autenticacion eliminando evento de nodoSolidaridad`);
                throw new AuthenticationError("No autorizado");
            }

            try {
                elNodo.eventos.id(idEvento).remove();
                await elNodo.save();
            }
            catch (error) {
                console.log("Error eliminando el evento. E: " + error);
                throw new ApolloError("Error conectando con la base de datos");
            }

            console.log(`eliminado`);

            return true;
        },
        async editarFechaEventoNodoSolidaridad(_: any, { idNodo, idEvento, nuevoFecha }, contexto: contextoQuery) {

            console.log(`cambiando el fecha del evento con id ${idEvento} del nodoSolidaridad con id ${idNodo}`);


            try {
                var elNodo: any = await NodoSolidaridad.findById(idNodo).exec();
                if (!elNodo) {
                    throw "nodoSolidaridad no encontrado"
                }
            }
            catch (error) {
                console.log("Error buscando el nodoSolidaridad. E: " + error);
                throw new ApolloError("Erro en la conexión con la base de datos");
            }

            //Authorización
            const permisosEspeciales = ["superadministrador"];

            const credencialesUsuario = contexto.usuario;
            var responsablesAmplio = await getResponsablesAmplioNodo(elNodo);
            if (!responsablesAmplio.includes(credencialesUsuario.id) && !credencialesUsuario.permisos.some(p => permisosEspeciales.includes(p))) {
                console.log(`Error de autenticacion editando fecha de evento de nodoSolidaridad`);
                throw new AuthenticationError("No autorizado");
            }

            try {
                var elMovimiento = elNodo.eventos.id(idEvento);
                if (!elMovimiento) {
                    console.log(`Evento no encontrado en el nodoSolidaridad`);
                    throw "No existía el evento";
                }
                elMovimiento.fecha = nuevoFecha;
            }
            catch (error) {
                console.log("Error cambiando el artículo en la base de datos. E: " + error);
                throw new ApolloError("Error guardando el artículo en la base de datos");
            }
            try {
                await elNodo.save();
            }
            catch (error) {
                console.log("Error guardando el evento creado en el nodoSolidaridad. E: " + error);
                throw new ApolloError("Error introduciendo el evento en el nodoSolidaridad");
            }
            console.log(`Artículo cambiado`);
            return elMovimiento;
        },
        async editarNombreEventoNodoSolidaridad(_: any, { idNodo, idEvento, nuevoNombre }, contexto: contextoQuery) {

            console.log(`cambiando el nombre del evento con id ${idEvento} del nodoSolidaridad con id ${idNodo}`);


            try {
                var elNodo: any = await NodoSolidaridad.findById(idNodo).exec();
                if (!elNodo) {
                    throw "nodoSolidaridad no encontrado"
                }
            }
            catch (error) {
                console.log("Error buscando el nodoSolidaridad. E: " + error);
                throw new ApolloError("Erro en la conexión con la base de datos");
            }

            //Authorización
            const permisosEspeciales = ["superadministrador"];

            const credencialesUsuario = contexto.usuario;
            var responsablesAmplio = await getResponsablesAmplioNodo(elNodo);
            if (!responsablesAmplio.includes(credencialesUsuario.id) && !credencialesUsuario.permisos.some(p => permisosEspeciales.includes(p))) {
                console.log(`Error de autenticacion editando artículo de evento de nodoSolidaridad`);
                throw new AuthenticationError("No autorizado");
            }
            const charProhibidosNombre = /[^ a-zA-ZÀ-ž0-9_():.,-]/;

            nuevoNombre = nuevoNombre.replace(/\s\s+/g, " ");
            if (charProhibidosNombre.test(nuevoNombre)) {
                throw new ApolloError("Nombre ilegal");
            }

            nuevoNombre = nuevoNombre.trim();
            nuevoNombre.replace(/  +/g, ' ');

            nuevoNombre = nuevoNombre.replace(/[\n\r]/g, "");
            try {
                var elMovimiento = elNodo.eventos.id(idEvento);
                if (!elMovimiento) {
                    console.log(`Evento no encontrado en el nodoSolidaridad`);
                    throw "No existía el evento";
                }
                elMovimiento.nombre = nuevoNombre;
            }
            catch (error) {
                console.log("Error cambiando el artículo en la base de datos. E: " + error);
                throw new ApolloError("Error guardando el artículo en la base de datos");
            }
            try {
                await elNodo.save();
            }
            catch (error) {
                console.log("Error guardando el evento creado en el nodoSolidaridad. E: " + error);
                throw new ApolloError("Error introduciendo el evento en el nodoSolidaridad");
            }
            console.log(`Artículo cambiado`);
            return elMovimiento;
        },
        async editarDescripcionEventoNodoSolidaridad(_: any, { idNodo, idEvento, nuevoDescripcion }, contexto: contextoQuery) {
            console.log(`|||||||||||||||||||`);
            console.log(`Solicitud de set descripcion de evento con id ${idEvento} del nodoSolidaridad con id ${idNodo}`);
            try {
                var elNodo: any = await NodoSolidaridad.findById(idNodo).exec();
                if (!elNodo) {
                    throw "nodoSolidaridad no encontrado"
                }
            }
            catch (error) {
                console.log(`error buscando el nodoSolidaridad. E: ` + error);
            }

            //Authorización
            const permisosEspeciales = ["superadministrador"];

            const credencialesUsuario = contexto.usuario;
            var responsablesAmplio = await getResponsablesAmplioNodo(elNodo);
            if (!responsablesAmplio.includes(credencialesUsuario.id) && !credencialesUsuario.permisos.some(p => permisosEspeciales.includes(p))) {
                console.log(`Error de autenticacion editando información de evento de nodoSolidaridad`);
                throw new AuthenticationError("No autorizado");
            }


            if (charProhibidosTexto.test(nuevoDescripcion)) {
                throw new ApolloError("Descripcion ilegal");
            }

            nuevoDescripcion = nuevoDescripcion.trim();
            nuevoDescripcion.replace(/  +/g, ' ');

            let elMovimiento = elNodo.eventos.id(idEvento);
            if (!elMovimiento) {
                console.log(`No existía el evento`);
                throw new ApolloError("Error conectando con la base de datos");
            }
            elMovimiento.descripcion = nuevoDescripcion;
            try {
                console.log(`guardando nuevo descripcion ${nuevoDescripcion} en la base de datos`);
                await elNodo.save();
            } catch (error) {
                console.log(`error guardando el nodoSolidaridad con coordenadas manuales: ${error}`);
                throw new ApolloError("Error guardando información en la base de datos");
            }
            console.log(`Descripcion guardado`);
            return elMovimiento;
        },


    },

    Usuario:{
        responsables(usuario:any){
            return [usuario.id]
        },
        responsablesAmplio(usuario:any){
            return [usuario.id]
        },
        administradores(usuario:any){
            return [usuario.id]
        }
    },

    NodoSolidaridad: {
        async administradores(nodo: any) {
            return await getAdministradoresNodo(nodo);
        },

        async coords(nodo: any) {
            return nodo.autoCoords;
        },

        async responsablesAmplio(nodo: any) {
            return await getResponsablesAmplioNodo(nodo);
        }
    },

}

export const getResponsablesAmplioNodo = async function (nodo) {
    var responsablesAmplio: Array<string> = nodo.responsables;    
    if (responsablesAmplio.length < 1) {
        var idParent = nodo.nodoParent;
        var elParent: any = nodo;
        while (responsablesAmplio.length < 1 && idParent) {
            if (elParent.tipoParent === 'usuario') {
                return [elParent.nodoParent];
            }
            try {
                elParent = await NodoSolidaridad.findById(idParent).exec();
                if (!elParent) throw "Parent no encontrado"
                responsablesAmplio = elParent.responsables;
            } catch (error) {
                console.log(`Error descargando nodo parent con id ${idParent}: ${error}`);
                return responsablesAmplio;
            }
            idParent = elParent.nodoParent;
        }
    }
    return responsablesAmplio;
}

const checkIfNodoRecursivelyUnderNodo = async function (nodoParent, idNodoUnder) {
    var actualRequeridos = nodoParent.vinculos.filter(v => v.tipo === 'requiere').map(v => v.idRef);
    var recursivelyUnder = false;
    var cuenta = 0;
    while (actualRequeridos.length > 0) {
        cuenta++;
        if (cuenta > 1000) {
            console.log(`OVERFLOW CHECKING IF NODO RECURSIVELY UNDER`);
            throw new ApolloError("Error en el servidor");
            break;
        }
        try {
            var requeridos: any = await NodoSolidaridad.find({ _id: { $in: actualRequeridos } }).select("nombre vinculos").exec() || [];
        } catch (error) {
            console.log(`Error descargando nodos requeridos for checking if nodo recursively under: ${error}`);
            throw new ApolloError("Error conectando con la base de datos");
        }
        requeridos.forEach(r => console.log(r.nombre))

        if (requeridos.some(r =>
            r.vinculos.some(v => v.idRef === idNodoUnder)
        )) {
            return true;

        }
        actualRequeridos = requeridos.map(r => r.vinculos.filter(v => v.tipo === 'requiere').map(v => v.idRef)).flat(1);
    }
    return recursivelyUnder;
}

const getAdministradoresNodo = async function (nodo) {
    var administradores: Array<string> = [];

    var elNodoParent:any=null;
    if (nodo.tipoParent === 'usuario') {
        if (!nodo.nodoParent) {
            console.log(`Detectado un nodo de usuario sin nodoParent apuntando a usuario`);
        }
        administradores = [nodo.nodoParent];
    }
    else if (!nodo.nodoParent) {
        administradores = nodo.responsables;
    }
    else {
        var idParent = nodo.nodoParent;
        try {
            elNodoParent = await NodoSolidaridad.findById(idParent).exec()
            if (!elNodoParent) throw "Nodo parent no encontrado";
        } catch (error) {
            console.log(`Error buscando el nodo parent de ${nodo.nombre}: ${elNodoParent}`);
            return administradores;
        }
        administradores = await getResponsablesAmplioNodo(elNodoParent);
    }
    return administradores;

}



export const intervaloPosicionamiento = 30000; //En milisegundos
async function emitirPosicionamientoNodos() {

    try {
        var administracion: any = await AdministracionAtlas.findById(idAtlasSolidaridad).exec();
    } catch (error) {
        console.log(`Error buscando administracion de atlas`);
        return
    }
    if (!administracion.lastPosicionamientoNodos) {
        administracion.lastPosicionamientoNodos = new Date('1995-12-17T03:24:00');
        try {
            await administracion.save();
        } catch (error) {
            console.log(`Error guardando administración de atlas solidaridad: ${error}`);
            return;
        }
    }
    console.log(`Last posicionamiento de atlas ${administracion.id} en ${administracion.lastPosicionamientoNodos}`);
    const tiempoTranscurrido = Date.now() - administracion.lastPosicionamientoNodos.getTime();
    const tiempoTranscurridoSecs = tiempoTranscurrido / 1000;
    console.log(`Han pasado ${tiempoTranscurridoSecs} segundos`);
    var backoff = intervaloPosicionamiento - tiempoTranscurrido;
    if (backoff < 0) backoff = 0;
    timerPosicionamiento = setTimeout(() => {
        ejecutarPosicionamientoNodosSolidaridadByFuerzas(administracion.ciclosDefault, Date.now(), false);
    }, backoff)
    return;
}