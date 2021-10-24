import { ApolloError, AuthenticationError, gql, UserInputError } from "apollo-server-express";
import { ModeloGrupo as Grupo } from "../model/Grupo";
import { ModeloTrabajo as Trabajo } from "../model/atlasSolidaridad/Trabajo";
import { ModeloEvento as Evento } from "../model/Evento";
import { contextoQuery } from "./tsObjetos"
import { ModeloUsuario as Usuario } from "../model/Usuario";
import { ModeloForo as Foro } from "../model/Foros/Foro"

export const typeDefs = gql`

    type InfoDiagramaGrupo{
        posicion:Coords
    }

    type PeticionBienGrupo{
        id: ID,
        idBeneficiario:String,
        cantidadSolicitada: Float,
        cantidadAsignada: Float
    }

    type PeticionServicioGrupo{
        id: ID,
        idBeneficiario:String,        
    }
    

    type VinculoNodoGrupo{
        idRef:ID,
        tipo:String,
        tipoRef:String,
    }

    type ServicioGrupo{
        id: ID,
        nombre: String,
        descripcion: String,      
        listaPeticiones: [PeticionServicioGrupo]                  
    }

    input InputPeticionBienGrupo{
        id:ID,
        idBeneficiario: ID,
        cantidadSolicitada:Float,
        cantidadAsignada:Float,
    }

    type BienGrupo{
        id: ID,
        nombre: String,
        descripcion: String,
        unidad: String,
        cantidad: Float,
        fechaCierre: Date,
        fechaReparticion: Date,
        instruccionesRecibir:String,
        listaPeticiones: [PeticionBienGrupo]
    }

    type ObjetivoDeGrupo{
       id: ID,
       nombre: String,
       responsables: [String],
       posiblesResponsables:[String],
       responsablesSolicitados:Int,
       descripcion:String,       
       vinculos:[VinculoNodoGrupo],
       keywords:String,       
       estadoDesarrollo:String,       
       coords: Coords,       
   }

   type TrabajoDeGrupo{
       id: ID,       
       nombre: String,
       descripcion:String,
       responsables: [String],
       posiblesResponsables:[String],
       responsablesSolicitados:Int,       
       nodosConocimiento:[String],              
       vinculos:[VinculoNodoGrupo],
       keywords:String,       
       estadoDesarrollo:String,                   
       coords: Coords,       
   }

    type Grupo{
        id: ID,
        nombre: String,
        descripcion:String,
        responsables: [String],
        participantes: [String],
        posiblesResponsables:[String],
        responsablesSolicitados:Int,
        personasResponsables:[PublicUsuario]
        personasPosiblesResponsables:[PublicUsuario],
        bienes:[BienGrupo],
        servicios:[ServicioGrupo],
        trabajos: [TrabajoDeGrupo],
        objetivos: [ObjetivoDeGrupo],
        idForo:ID,
        idsTrabajos:[ID],
        materiales:[MaterialTrabajo],
    }    

   union NodoGrupo=ObjetivoDeGrupo | TrabajoDeGrupo

   type RespuestaNodoGrupo{
       nodo: NodoGrupo,
   }

   type PaginaTrabajosGrupos{
        hayMas:Boolean,
        infoTrabajos:[InfoBasicaTrabajo]
    }

    extend type Query{
        grupos: [Grupo!],
        grupo(idGrupo:ID!): Grupo

        listaTodosTrabajosGrupos(pagina: Int!, pagina:Int!):PaginaTrabajosGrupos,
    }
    extend type Mutation{
        editarNombreGrupo(idGrupo: ID!, nuevoNombre: String!):Grupo,
        editarDescripcionGrupo(idGrupo: ID!, nuevoDescripcion: String!):Grupo,
        crearGrupo:Grupo, 
        eliminarGrupo(idGrupo:ID!):Boolean,       
        addResponsableGrupo(idGrupo:ID!, idUsuario:ID!):Grupo,
        addParticipanteGrupo(idGrupo:ID!, idUsuario:ID!):Grupo,
        removeParticipanteGrupo(idGrupo:ID!, idUsuario:ID!):Grupo,
        addPosibleResponsableGrupo(idGrupo:ID!, idUsuario:ID!):Grupo,
        removeResponsableGrupo(idGrupo:ID!, idUsuario:ID!):Grupo,
        setResponsablesSolicitadosGrupo(idGrupo:ID!, nuevoCantidadResponsablesSolicitados: Int!):Grupo,
        
        crearTrabajoEnGrupo(idGrupo: ID!, posicion:CoordsInput):TrabajoDeGrupo,
        eliminarTrabajoDeGrupo(idTrabajo:ID!, idGrupo:ID!):Boolean,
        editarNombreTrabajoGrupo(idGrupo:ID!, idTrabajo:ID!, nuevoNombre: String!):TrabajoDeGrupo,
        editarDescripcionTrabajoGrupo(idGrupo:ID!, idTrabajo:ID!, nuevoDescripcion: String!):TrabajoDeGrupo,
        addResponsableTrabajoGrupo(idTrabajo:ID!,idUsuario:ID!):TrabajoDeGrupo,
        addPosibleResponsableTrabajoGrupo(idGrupo:ID!, idTrabajo:ID!, idUsuario:ID!):TrabajoDeGrupo,
        removeResponsableTrabajoGrupo(idGrupo: ID!, idTrabajo:ID!, idUsuario:ID!):TrabajoDeGrupo,
        setPosicionTrabajoGrupo(idGrupo:ID!, idTrabajo:ID!, nuevaPosicion:CoordsInput):TrabajoDeGrupo,
        editarKeywordsTrabajoGrupo(idGrupo:ID!, idTrabajo:ID!, nuevoKeywords: String!):TrabajoDeGrupo,
        setEstadoTrabajoGrupo(idGrupo:ID!, idTrabajo:ID!, nuevoEstado:String!):TrabajoDeGrupo,

        crearObjetivoEnGrupo(idGrupo: ID!, posicion:CoordsInput):ObjetivoDeGrupo,
        eliminarObjetivoDeGrupo(idObjetivo:ID!, idGrupo:ID!):Boolean,
        editarNombreObjetivoGrupo(idGrupo:ID!, idObjetivo:ID!, nuevoNombre: String!):ObjetivoDeGrupo,
        editarDescripcionObjetivoGrupo(idGrupo:ID!, idObjetivo:ID!, nuevoDescripcion: String!):ObjetivoDeGrupo,
        addResponsableObjetivoGrupo(idObjetivo:ID!,idUsuario:ID!):ObjetivoDeGrupo,
        addPosibleResponsableObjetivoGrupo(idObjetivo:ID!, idUsuario:ID!):ObjetivoDeGrupo,
        removeResponsableObjetivoGrupo(idObjetivo:ID!, idUsuario:ID!):ObjetivoDeGrupo,
        setPosicionObjetivoGrupo(idGrupo:ID!, idObjetivo:ID!, nuevaPosicion:CoordsInput):ObjetivoDeGrupo,
        editarKeywordsObjetivoGrupo(idGrupo:ID!, idObjetivo:ID!, nuevoKeywords: String!):ObjetivoDeGrupo,
        setEstadoObjetivoGrupo(idGrupo:ID!, idObjetivo:ID!, nuevoEstado:String!):ObjetivoDeGrupo,

        crearBienRepartirVacioGrupo(idGrupo: ID!):BienGrupo,
        setNombreBienGrupo(idGrupo: ID!, idBien: ID!, nuevoNombre: String!):BienGrupo,
        setUnidadBienGrupo(idGrupo: ID!, idBien: ID!, nuevoUnidad: String!):BienGrupo,
        setCantidadBienGrupo(idGrupo: ID!, idBien: ID!, nuevoCantidad: Float!):BienGrupo,
        setFechaCierreBienGrupo(idGrupo: ID!, idBien: ID!, nuevoFechaCierre: Date!):BienGrupo,
        setFechaReparticionBienGrupo(idGrupo: ID!, idBien: ID!, nuevoFechaReparticion: Date!):BienGrupo,
        eliminarBienGrupo(idGrupo: ID!, idBien: ID!):Boolean,
        addPeticionBienGrupo(idGrupo: ID!, idBien: ID!, peticion: InputPeticionBienGrupo!):PeticionBienGrupo,

        crearRequerimentoEntreNodosGrupo(idGrupo:ID!, idNodoRequiere:ID!, idNodoRequerido:ID!, tipoNodoRequiere:String!, tipoNodoRequerido:String!):RespuestaNodoGrupo,
        desvincularNodosGrupo(idGrupo:ID!, idNodoRequiere:ID!, idNodoRequerido:ID!, tipoNodoRequiere:String!, tipoNodoRequerido:String!):RespuestaNodoGrupo,

    }
    
    
`;

export const resolvers = {
    Query: {
        grupos: async function (_: any, args: any, context: contextoQuery) {
            console.log(`Lista de todos los grupos solicitada`);
            try {
                var listaP:any = await Grupo.find({}).exec();
            } catch (error) {
                console.log(`error buscando la lista de grupos. E: ${error}`);
                throw new ApolloError("");
            }
            console.log(`${listaP.length} grupos encontrados. Enviando...`);
            return listaP;
        },
        grupo: async function (_: any, { idGrupo }: any, context: any) {
            //   organizarDiagrama(idGrupo);
            console.log(`Buscando grupo con id ${idGrupo}`);
            try {
                var elGrupo: any = await Grupo.findById(idGrupo).exec();
                if (!elGrupo) {
                    throw "grupo no encontrado"
                }
                console.log(`En participantes: ${elGrupo.participantes}`);
            } catch (error) {
                console.log(`Error buscando el grupo. E:${error}`);
                throw new ApolloError("Error en la conexión con la base de datos");
            }
            let tieneForo = true;

            if (!elGrupo.idForo) {
                tieneForo = false;
            }
            else {
                try {
                    let elForo: any = await Foro.findById(elGrupo.idForo).exec();
                    if (!elForo) {
                        console.log(`El foro no existía. Se creará uno nuevo`);
                        tieneForo = false;
                    }
                } catch (error) {
                    console.log(`Error buscando foro en la base de datos. E :${error}`);
                }
            }

            if (!tieneForo) {
                console.log(`El grupo ${elGrupo.nombre} no tenía foro. Creando con responsables: ${elGrupo.responsables}.`);
                try {
                    var nuevoForo: any = await Foro.create({
                        miembros: elGrupo.responsables,
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
                    elGrupo.idForo = idNuevoForo;
                    await elGrupo.save();
                } catch (error) {
                    console.log(`Error guardando el grupo`);
                    throw new ApolloError("Error conectando con la base de datos");
                }

            }
            return elGrupo
        },
        async listaTodosTrabajosGrupos(_: any, { pagina }, contexto: contextoQuery) {
            console.log(`Petición de info basica de todos trabajos de grupos`);
            const sizePaginaTrabajos = 35;
            if (contexto.usuario.id === "") {
                console.log(`Usuario no logeado`);
                throw new AuthenticationError("No autorizado");
            }

            try {
                var numTrabajos = await Trabajo.countDocuments({}).exec();
                console.log(`Hay ${numTrabajos} trabajos en la base de datos`);
                var losTrabajos: any = await Trabajo.find({}, "nombre").limit(sizePaginaTrabajos).skip(pagina * sizePaginaTrabajos).exec();
            } catch (error) {
                console.log(`Error buscando trabajos. E: ${error}`);
                return new ApolloError("Error conectando con la base de datos");
            }

            let hayMas = (pagina + 1) * sizePaginaTrabajos < numTrabajos;
            console.log(`Enviando pagina ${pagina} de trabajos`);
            return { hayMas, infoTrabajos: losTrabajos }
        },
    },

    Mutation: {
        addPosibleResponsableGrupo: async function (_: any, { idGrupo, idUsuario }: any, contexto: contextoQuery) {
            console.log(`añadiendo usuario ${idUsuario} a la lista de posibles responsables del grupo ${idGrupo}`);
            let credencialesUsuario = contexto.usuario;
            try {
                var elGrupo: any = await Grupo.findById(idGrupo).exec();
                if (!elGrupo) {
                    throw "grupo no encontrado"
                }
            }
            catch (error) {
                console.log("Error buscando el grupo en la base de datos. E: " + error);
                throw new ApolloError("Error de conexión con la base de datos");
            }

            //Authorización

            if (idUsuario != credencialesUsuario.id && !credencialesUsuario.permisos.includes("superadministrador")) {
                console.log(`Error de autenticacion añadiendo posible responsable del grupo`);
                throw new AuthenticationError("No autorizado");
            }

            if (elGrupo.posiblesResponsables.includes(idUsuario) || elGrupo.responsables.includes(idUsuario)) {
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
                elGrupo.posiblesResponsables.push(idUsuario);
                await elGrupo.save();
            }
            catch (error) {
                console.log("Error guardando datos en la base de datos. E: " + error);
                throw new ApolloError("Error conectando con la base de datos");
            }
            console.log(`Grupo guardado`);
            return elGrupo
        },
        addResponsableGrupo: async function (_: any, { idGrupo, idUsuario }: any, contexto: contextoQuery) {
            console.log(`Solicitud de add un usuario con id ${idUsuario} a un grupo con id ${idGrupo}`);
            let credencialesUsuario = contexto.usuario;

            try {
                var elGrupo: any = await Grupo.findById(idGrupo).exec();
                if (!elGrupo) {
                    throw "grupo no encontrado"
                }
            }
            catch (error) {
                console.log("Error buscando el grupo en la base de datos. E: " + error);
                throw new ApolloError("Error de conexión con la base de datos");
            }
            
            //Authorización
            
            if ( elGrupo.responsables.length > 0 && !credencialesUsuario.permisos.includes("superadministrador") && !elGrupo.responsables.includes(credencialesUsuario.id) ) {
                console.log(`Error de autenticacion. Hay ${elGrupo.responsables.length} responsables: ${elGrupo.responsables}`);
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

            if (elGrupo.responsables.includes(idUsuario)) {
                console.log(`El usuario ya era responsable de este grupo`);
                throw new ApolloError("El usuario ya estaba incluido");
            }


            elGrupo.responsables.push(idUsuario);
            if(elGrupo.responsablesSolicitados>0)elGrupo.responsablesSolicitados--;
            console.log(`Usuario añadido a la lista de responsables`);

            let indexPosibleResponsable = elGrupo.posiblesResponsables.indexOf(idUsuario);
            if (indexPosibleResponsable > -1) {
                console.log(`sacando al usuario ${idUsuario} de la lista de posibles responsables`);
                elGrupo.posiblesResponsables.splice(indexPosibleResponsable, 1);
            }

            let indexParticipante = elGrupo.participantes.indexOf(idUsuario);
            if (indexParticipante > -1) {
                console.log(`sacando al usuario ${idUsuario} de la lista de participantes`);
                elGrupo.participantes.splice(indexParticipante, 1);
            }

            //Añadir como participante en todos los eventos de este grupo

            try {
                var eventosGrupo:any = await Evento.find({idOrigen: elGrupo.id}).exec();
            } catch (error) {
                console.log(`Error descargando los eventos del grupo: ${error}`);                
            }

            eventosGrupo.forEach(async function(e){
                let indexU=e.participantes.indexOf(idUsuario);
                if(indexU>-1){
                    e.participantes.splice(indexU, 1);
                }
                e.participantes.push(idUsuario);

                try {
                    await e.save();
                } catch (error) {
                    console.log(`Error guardando el evento con el nuevo participante: ${error}`);                    
                }
            })


            //Guardar grupo

            try {
                await elGrupo.save();
            }
            catch (error) {
                console.log("Error guardando datos en la base de datos. E: " + error);
                throw new ApolloError("Error conectando con la base de datos");
            }

            //Mirror responsables del grupo hacia miembros del foro
            try {
                await Foro.findByIdAndUpdate(elGrupo.idForo, { miembros: elGrupo.participantes.concat(elGrupo.responsables) });
            } catch (error) {
                console.log(`Error mirroring responsables del grupo hacia miembros del foro. E: ${error}`);
            }
            console.log(`Grupo guardado`);
            return elGrupo

        },
        removeResponsableGrupo: async function (_: any, { idGrupo, idUsuario }: any, contexto: contextoQuery) {
            console.log(`Solicitud de remover un usuario con id ${idUsuario} a un grupo con id ${idGrupo}`);
            let credencialesUsuario = contexto.usuario;

            try {
                var elGrupo: any = await Grupo.findById(idGrupo).exec();
                if (!elGrupo) {
                    throw "grupo no encontrado"
                }
            }
            catch (error) {
                console.log("Error buscando el grupo en la base de datos. E: " + error);
                throw new ApolloError("Error de conexión con la base de datos");
            }

            //Authorización

            if (idUsuario != credencialesUsuario.id && !credencialesUsuario.permisos.includes("superadministrador")) {
                console.log(`Error de autenticacion removiendo responsable o posible responsable de grupo`);
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

            let indexPosibleResponsable = elGrupo.posiblesResponsables.indexOf(idUsuario);

            if (indexPosibleResponsable > -1) {
                console.log(`sacando al usuario ${idUsuario} de la lista de posibles responsables`);
                elGrupo.posiblesResponsables.splice(indexPosibleResponsable, 1);
            }

            let indexResponsable = elGrupo.responsables.indexOf(idUsuario);

            if (indexResponsable > -1) {
                console.log(`sacando al usuario ${idUsuario} de la lista de responsables`);
                elGrupo.responsables.splice(indexResponsable, 1);
            }
            
            //Retirar como participante en todos los eventos de este grupo

            try {
                var eventosGrupo:any = await Evento.find({idOrigen: elGrupo.id}).exec();
            } catch (error) {
                console.log(`Error descargando los eventos del grupo: ${error}`);                
            }

            eventosGrupo.forEach(async function(e){
                let indexU=e.participantes.indexOf(idUsuario);
                if(indexU>-1){
                    e.participantes.splice(indexU, 1);
                }

                try {
                    await e.save();
                } catch (error) {
                    console.log(`Error guardando el evento con el nuevo participante: ${error}`);                    
                }
            });

            //Guardar el grupo

            try {
                await elGrupo.save();
            }
            catch (error) {
                console.log("Error guardando datos en la base de datos. E: " + error);
                throw new ApolloError("Error conectando con la base de datos");
            }

            //Mirror responsables del grupo hacia miembros del foro
            try {
                await Foro.findByIdAndUpdate(elGrupo.idForo, { miembros: elGrupo.participantes.concat(elGrupo.responsables) });        
            } catch (error) {
                console.log(`Error mirroring responsables del grupo hacia miembros del foro. E: ${error}`);
            }

            console.log(`Grupo guardado`);
            return elGrupo

        },
        addParticipanteGrupo: async function (_: any, { idGrupo, idUsuario }: any, contexto: contextoQuery) {
            console.log(`Solicitud de add como participante un usuario con id ${idUsuario} a un grupo con id ${idGrupo}`);
            let credencialesUsuario = contexto.usuario;

            try {
                var elGrupo: any = await Grupo.findById(idGrupo).exec();
                if (!elGrupo) {
                    throw "grupo no encontrado"
                }
            }
            catch (error) {
                console.log("Error buscando el grupo en la base de datos. E: " + error);
                throw new ApolloError("Error de conexión con la base de datos");
            }
            
            //Authorización

            const permisosEspeciales=["superadministrador"]
            
            if ( credencialesUsuario.id!= idUsuario && !credencialesUsuario.permisos.some(p=>permisosEspeciales.includes(p))) {
                console.log(`Error de autenticacion. Hay ${elGrupo.participantes.length} participantes: ${elGrupo.participantes}`);
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

            if (elGrupo.participantes.includes(idUsuario)) {
                console.log(`El usuario ya era participante de este grupo`);
                throw new UserInputError("El usuario ya estaba incluido");
            }

            elGrupo.participantes.push(idUsuario);            
            console.log(`Usuario añadido a la lista de participantes`);
            
            //Añadir como participante en todos los eventos de este grupo

            try {
                var eventosGrupo:any = await Evento.find({idOrigen: elGrupo.id}).exec();
            } catch (error) {
                console.log(`Error descargando los eventos del grupo: ${error}`);                
            }

            eventosGrupo.forEach(async function(e){
                let indexU=e.participantes.indexOf(idUsuario);
                if(indexU>-1){
                    e.participantes.splice(indexU, 1);
                }
                e.participantes.push(idUsuario);

                try {
                    await e.save();
                } catch (error) {
                    console.log(`Error guardando el evento con el nuevo participante: ${error}`);                    
                }
            })

            //Guardar grupo

            try {
                await elGrupo.save();
            }
            catch (error) {
                console.log("Error guardando datos en la base de datos. E: " + error);
                throw new ApolloError("Error conectando con la base de datos");
            }

            //Mirror participantes del grupo hacia miembros del foro
            try {
                await Foro.findByIdAndUpdate(elGrupo.idForo, { miembros: elGrupo.participantes.concat(elGrupo.responsables) });
            } catch (error) {
                console.log(`Error mirroring participantes del grupo hacia miembros del foro. E: ${error}`);
            }
            console.log(`Grupo guardado`);
            return elGrupo

        },
        removeParticipanteGrupo: async function (_: any, { idGrupo, idUsuario }: any, contexto: contextoQuery) {
            console.log(`Solicitud de remover un usuario con id ${idUsuario} a un grupo con id ${idGrupo}`);
            let credencialesUsuario = contexto.usuario;

            try {
                var elGrupo: any = await Grupo.findById(idGrupo).exec();
                if (!elGrupo) {
                    throw "grupo no encontrado"
                }
            }
            catch (error) {
                console.log("Error buscando el grupo en la base de datos. E: " + error);
                throw new ApolloError("Error de conexión con la base de datos");
            }

            //Authorización

            if (idUsuario != credencialesUsuario.id && !credencialesUsuario.permisos.includes("superadministrador")) {
                console.log(`Error de autenticacion removiendo participante o posible participante de grupo`);
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
            

            let indexParticipante = elGrupo.participantes.indexOf(idUsuario);

            if (indexParticipante > -1) {
                console.log(`sacando al usuario ${idUsuario} de la lista de participantes`);
                elGrupo.participantes.splice(indexParticipante, 1);
            }

            //Retirar como participante en todos los eventos de este grupo

            try {
                var eventosGrupo:any = await Evento.find({idOrigen: elGrupo.id}).exec();
            } catch (error) {
                console.log(`Error descargando los eventos del grupo: ${error}`);                
            }

            eventosGrupo.forEach(async function(e){
                let indexU=e.participantes.indexOf(idUsuario);
                if(indexU>-1){
                    e.participantes.splice(indexU, 1);
                }

                try {
                    await e.save();
                } catch (error) {
                    console.log(`Error guardando el evento con el nuevo participante: ${error}`);                    
                }
            });

            //Guardando el grupo

            try {
                await elGrupo.save();
            }
            catch (error) {
                console.log("Error guardando datos en la base de datos. E: " + error);
                throw new ApolloError("Error conectando con la base de datos");
            }

            //Mirror participantes del grupo hacia miembros del foro
            try {
                await Foro.findByIdAndUpdate(elGrupo.idForo, { miembros: elGrupo.participantes.concat(elGrupo.responsables) });
            } catch (error) {
                console.log(`Error mirroring participantes del grupo hacia miembros del foro. E: ${error}`);
            }

            console.log(`Grupo guardado`);
            return elGrupo

        },
        
        setResponsablesSolicitadosGrupo: async function(_: any, { idGrupo, nuevoCantidadResponsablesSolicitados}, contexto: contextoQuery){
            let credencialesUsuario = contexto.usuario;
            console.log(`Solicitud de set cantidad de responsables solicitados de ${nuevoCantidadResponsablesSolicitados} en grupo con id ${idGrupo}`);
            
            try {
                var elGrupo: any = await Grupo.findById(idGrupo).exec();
                if (!elGrupo) {
                    throw "grupo no encontrado"
                }
            }
            catch (error) {
                console.log("Error buscando el grupo en la base de datos. E: " + error);
                throw new ApolloError("Error de conexión con la base de datos");
            }

            if (!credencialesUsuario.permisos.includes("superadministrador") && !elGrupo.responsables.includes(credencialesUsuario.id)) {
                console.log(`Error de autenticacion editando responsables solicitados.`);
                throw new AuthenticationError("No autorizado");
            }

            elGrupo.responsablesSolicitados=nuevoCantidadResponsablesSolicitados;

            try {
                await elGrupo.save();
            } catch (error) {
                console.log(`Error guardando el grupo: ${error}`);
                throw new ApolloError("Error conectando con la base de datos");
            }
            console.log(`Retornando con ${elGrupo.responsablesSolicitados} responsables solicitados`);
            return elGrupo;
        },
        editarNombreGrupo: async function (_: any, { idGrupo, nuevoNombre }: any, contexto: contextoQuery) {
            let credencialesUsuario = contexto.usuario;
            try {
                var elGrupo: any = await Grupo.findById(idGrupo).exec();
                if (!elGrupo) {
                    throw "grupo no encontrado"
                }
            }
            catch (error) {
                console.log(`error buscando el grupo. E: ` + error);
            }

            //Authorización
            let permisosEspeciales = ["superadministrador"];
            if (!elGrupo.responsables.includes(credencialesUsuario.id) && !credencialesUsuario.permisos.some(p => permisosEspeciales.includes(p))) {
                console.log(`Error de autenticacion editando nombre de grupo`);
                throw new AuthenticationError("No autorizado");
            }

            const charProhibidosNombreGrupo = /[^ a-zA-ZÀ-ž0-9_():.,-]/;

            nuevoNombre = nuevoNombre.replace(/\s\s+/g, " ");
            if (charProhibidosNombreGrupo.test(nuevoNombre)) {
                throw new ApolloError("Nombre ilegal");
            }


            nuevoNombre = nuevoNombre.trim();

            try {
                console.log(`guardando nuevo nombre ${elGrupo.nombre} en la base de datos`);
                var resGrupo: any = await Grupo.findByIdAndUpdate(idGrupo, { nombre: nuevoNombre }, { new: true }).exec();
            } catch (error) {
                console.log(`error guardando el grupo con coordenadas manuales: ${error}`);
            }
            console.log(`Nombre guardado`);
            return resGrupo;
        },
        editarDescripcionGrupo: async function (_: any, { idGrupo, nuevoDescripcion }: any, contexto: contextoQuery) {
            console.log(`|||||||||||||||||||`);
            console.log(`Solicitud de set descripcion del grupo con id ${idGrupo}`);
            let credencialesUsuario = contexto.usuario;
            try {
                var elGrupo: any = await Grupo.findById(idGrupo).exec();
                if (!elGrupo) {
                    throw "grupo no encontrado"
                }
            }
            catch (error) {
                console.log(`error buscando el grupo. E: ` + error);
            }

            //Authorización
            let permisosEspeciales = ["superadministrador"];
            if (!elGrupo.responsables.includes(credencialesUsuario.id) && !credencialesUsuario.permisos.some(p => permisosEspeciales.includes(p))) {
                console.log(`Error de autenticacion editando Descripcion de grupo`);
                throw new AuthenticationError("No autorizado");
            }

            const charProhibidosDescripcionGrupo = /[^\n\r a-zA-ZÀ-ž0-9_():;.,+¡!¿?@=-]/;

            if (charProhibidosDescripcionGrupo.test(nuevoDescripcion)) {
                throw new ApolloError("Descripcion ilegal");
            }


            nuevoDescripcion = nuevoDescripcion.trim();

            try {
                console.log(`guardando nuevo descripcion ${nuevoDescripcion} en la base de datos`);
                var resGrupo: any = await Grupo.findByIdAndUpdate(idGrupo, { descripcion: nuevoDescripcion }, { new: true }).exec();
            } catch (error) {
                console.log(`error guardando el grupo: ${error}`);
            }
            console.log(`Descripcion guardado`);
            return resGrupo;
        },
        async crearGrupo(_: any, args: any, contexto: contextoQuery) {
            console.log(`mutacion`);
            let usuario = contexto.usuario;
            if (!usuario) {
                console.log(`Intento de crear un nuevo grupo sin nombre de usuario seteado en el contexto`);
                //throw new AuthenticationError("No autorizado");
            }
            if (!usuario.id) {
                console.log(`No había id del usuario creador`);
                throw new ApolloError("No ID");
            }
            console.log(`el usuario ${usuario.username} intenta crear un nuevo grupo`);
            let elGrupo: any = await new Grupo({
                responsables: [usuario.id]
            });

            try {
                var nuevoForo: any = await Foro.create({
                    acceso: "privado",
                    miembros: elGrupo.responsables,
                });
                var idNuevoForo = nuevoForo._id;
                await nuevoForo.save();
            } catch (error) {
                console.log(`Error creando el nuevo foro. E: ${error}`);
                throw new ApolloError("Error conectando con la base de datos");
            }
            console.log(`Nuevo foro creado`);

            try {
                elGrupo.idForo = idNuevoForo;
                await elGrupo.save();
            } catch (error) {
                console.log(`error guardando el nuevo grupo. E: ${error}`);
                throw new ApolloError("error");
            }
            console.log(`grupo creado`);

            return elGrupo;
        },
        async eliminarGrupo(_: any, { idGrupo }: any, contexto: contextoQuery) {
            console.log(`peticion de eliminar un grupo con id ${idGrupo}`);
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
            let esUltimoResponsable = (elGrupo.responsables.length == 1 && elGrupo.responsables[0] == credencialesUsuario.id);

            if (!esUltimoResponsable && !credencialesUsuario.permisos.some(p => permisosEspeciales.includes(p))) {
                console.log(`Error de autenticacion editando nombre de grupo`);
                throw new AuthenticationError("No autorizado");
            }

            console.log(`Eliminando eventos con idOrigen: ${idGrupo}`);
            try {
                await Evento.deleteMany({idOrigen:idGrupo}).exec();
            } catch (error) {
                console.log(`Error buscando eventos con idOrigen: ${idGrupo} para eliminarlos`);
            }

            try {
                await Grupo.findByIdAndDelete(idGrupo).exec();
            }
            catch (error) {
                console.log("Error guardando el trabajo creado en el grupo. E: " + error);
                throw new ApolloError("Error introduciendo el trabajo en el grupo");
            }

            console.log(`eliminado`);

            return true;
        },

        async crearTrabajoEnGrupo(_: any, { idGrupo, posicion }: any, contexto: contextoQuery) {
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
            
            try {
                var nuevoTrabajo=elGrupo.trabajos.create({
                    coords: posicion
                })    
                elGrupo.trabajos.push(nuevoTrabajo);
                await elGrupo.save();
            } catch (error) {
                console.log(`Error creando el nuevo trabajo. E: ${error}`);
                throw new ApolloError("Error conectando con la base de datos");
            }           
            return nuevoTrabajo;
        },
        async eliminarTrabajoDeGrupo(_: any, { idTrabajo, idGrupo }: any, contexto: contextoQuery) {
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

            elGrupo.trabajos.pull({id:idTrabajo});

            try {
                await elGrupo.save();
            }
            catch (error) {
                console.log("Error eliminando trabajo. E: " + error);
                throw new ApolloError("Error introduciendo el trabajo en el grupo");
            }

            console.log(`eliminado`);

            return true;
        },
        async editarNombreTrabajoGrupo(_: any, { idGrupo, idTrabajo, nuevoNombre }, contexto: contextoQuery) {

            console.log(`cambiando el nombre del trabajo con id ${idTrabajo} del grupo con id ${idGrupo}`);
            const charProhibidosNombreTrabajo = /[^ a-zA-ZÀ-ž0-9_():.,-]/;

            nuevoNombre = nuevoNombre.replace(/\s\s+/g, " ");
            if (charProhibidosNombreTrabajo.test(nuevoNombre)) {
                throw new ApolloError("Nombre ilegal");
            }

            nuevoNombre = nuevoNombre.trim();

            try {
                var elGrupo: any = await Grupo.findById(idGrupo).exec();
                if (!elGrupo) {
                    throw "grupo no encontrado"
                }
            }
            catch (error) {
                console.log("Error buscando el grupo. E: " + error);
                throw new ApolloError("Erro en la conexión con la base de datos");
            }

            //Authorización
            let credencialesUsuario = contexto.usuario;
            if (!elGrupo.responsables.includes(credencialesUsuario.id) && !credencialesUsuario.permisos.includes("superadministrador")) {
                console.log(`Error de autenticacion editando nombre de grupo`);
                throw new AuthenticationError("No autorizado");
            }

            var elTrabajo=elGrupo.trabajos.id(idTrabajo)

            try {                
                elTrabajo.nombre = nuevoNombre;
                await elGrupo.save();
            }
            catch (error) {
                console.log("Error cambiando el nombre en la base de datos. E: " + error);
                throw new ApolloError("Error guardando el nombre en la base de datos");
            }

            console.log(`Nombre cambiado`);
            return elTrabajo;
        },
        async editarDescripcionTrabajoGrupo(_: any, { idGrupo, idTrabajo, nuevoDescripcion }, contexto: contextoQuery) {
            let credencialesUsuario = contexto.usuario;
            try {
                var elGrupo: any = await Grupo.findById(idGrupo).exec();
                if (!elGrupo) {
                    throw "grupo no encontrado"
                }
            }
            catch (error) {
                console.log(`error buscando el grupo. E: ` + error);
                throw new ApolloError("Error conectando con la base de datos");
            }

            //Authorización
            let permisosEspeciales = ["superadministrador"];
            if (!elGrupo.responsables.includes(credencialesUsuario.id) && !credencialesUsuario.permisos.some(p => permisosEspeciales.includes(p))) {
                console.log(`Error de autenticacion editando Descripcion de grupo`);
                throw new AuthenticationError("No autorizado");
            }

            const charProhibidosDescripcionTrabajo = /[^\n\r a-zA-ZÀ-ž0-9_():;.,+¡!¿?@=-]/;

            if (charProhibidosDescripcionTrabajo.test(nuevoDescripcion)) {
                throw new ApolloError("Descripcion ilegal");
            }

            nuevoDescripcion = nuevoDescripcion.trim();

            var elTrabajo=elGrupo.trabajos.id(idTrabajo);
            try {                
                elTrabajo.descripcion = nuevoDescripcion;
                console.log(`guardando nuevo descripcion ${nuevoDescripcion} en la base de datos`);
                await elGrupo.save();
            } catch (error) {
                console.log(`error guardando el trabajo modificado: ${error}`);
                throw new ApolloError("Error guardando información en la base de datos");

            }
            console.log(`Descripcion guardado`);
            return elTrabajo;
        },
        async editarKeywordsTrabajoGrupo(_: any, { idGrupo, idTrabajo, nuevoKeywords }, contexto: contextoQuery) {
            let credencialesUsuario = contexto.usuario;
            try {
                var elGrupo: any = await Grupo.findById(idGrupo).exec();
                if (!elGrupo) {
                    throw "grupo no encontrado"
                }
            }
            catch (error) {
                console.log(`error buscando el grupo. E: ` + error);
            }

            //Authorización
            let permisosEspeciales = ["superadministrador"];
            if (!elGrupo.responsables.includes(credencialesUsuario.id) && !credencialesUsuario.permisos.some(p => permisosEspeciales.includes(p))) {
                console.log(`Error de autenticacion editando Keywords de grupo`);
                throw new AuthenticationError("No autorizado");
            }

            const charProhibidosKeywordsTrabajo = /[^ a-zA-Zñ,]/;

            if (charProhibidosKeywordsTrabajo.test(nuevoKeywords)) {
                throw new ApolloError("Keywords ilegal");
            }

            nuevoKeywords = nuevoKeywords.trim();

            var elTrabajo=elGrupo.trabajos.id(idTrabajo);

            try {
                
                elTrabajo.keywords = nuevoKeywords;
                console.log(`guardando nuevo keywords ${nuevoKeywords} en la base de datos`);
                await elGrupo.save();
            } catch (error) {
                console.log(`error guardando el trabajo modificado: ${error}`);
            }
            console.log(`Keywords guardado`);
            return elTrabajo;
        },
        addResponsableTrabajoGrupo: async function (_: any, { idGrupo, idTrabajo, idUsuario }: any, contexto: contextoQuery) {
            console.log(`Solicitud de add un usuario con id ${idUsuario} a un trabajo de id ${idTrabajo}`);
            let credencialesUsuario = contexto.usuario;

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
            if (!elGrupo.responsables.includes(credencialesUsuario.id) && !credencialesUsuario.permisos.includes("superadministrador")) {
                console.log(`Error de autenticacion editando nombre de grupo`);
                throw new AuthenticationError("No autorizado");
            }         

            var elTrabajo=elGrupo.trabajos.id(idTrabajo);

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

            try {
                const indexT = elUsuario.misTrabajos.indexOf(elTrabajo._id);
                if (indexT > -1) elUsuario.misTrabajos.splice(indexT, 1);

                elTrabajo.responsables.push(idUsuario);
                if(elTrabajo.responsablesSolicitados>0)elTrabajo.responsablesSolicitados--;
                elUsuario.misTrabajos.push(elTrabajo._id);
                console.log(`Usuario añadido a la lista de responsables`);
                await elGrupo.save();
            }
            catch (error) {
                console.log("Error guardando datos en la base de datos. E: " + error);
                throw new ApolloError("Error conectando con la base de datos");
            }
            console.log(`Trabajo guardado`);
            
            return elTrabajo;

        },
        addPosibleResponsableTrabajoGrupo: async function (_: any, {idGrupo, idTrabajo, idUsuario }: any, contexto: contextoQuery) {
            console.log(`añadiendo usuario ${idUsuario} a la lista de posibles responsables del trabajo ${idTrabajo}`);
            let credencialesUsuario = contexto.usuario;

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
            if (!elGrupo.responsables.includes(credencialesUsuario.id) && !credencialesUsuario.permisos.includes("superadministrador")) {
                console.log(`Error de autenticacion editando nombre de grupo`);
                throw new AuthenticationError("No autorizado");
            }         

            var elTrabajo=elGrupo.trabajos.id(idTrabajo);

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
                var elGrupo: any = await Grupo.findById(idGrupo).exec();
                if (!elGrupo) {
                    throw "grupo no encontrado"
                }
            }
            catch (error) {
                console.log("Grupo no encontrado. E: " + error);
                throw new ApolloError("Error conectandose con la base de datos");
            }

            console.log(`Trabajo guardado`);
            return elTrabajo
        },
        removeResponsableTrabajoGrupo: async function (_: any, { idGrupo, idTrabajo, idUsuario }: any, contexto: contextoQuery) {
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
                var elGrupo: any = await Grupo.findById(idGrupo).exec();
                if (!elGrupo) {
                    throw "grupo no encontrado"
                }
            }
            catch (error) {
                console.log("Grupo no encontrado. E: " + error);
                throw new ApolloError("Error conectandose con la base de datos");
            }

            var elTrabajo=elGrupo.trabajos.id(idTrabajo)

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
                await elGrupo.save();                
            }
            catch (error) {
                console.log("Error guardando datos en la base de datos. E: " + error);
                throw new ApolloError("Error conectando con la base de datos");
            }
            console.log(`Trabajo guardado`);            

            return elTrabajo;
        },
        setPosicionTrabajoGrupo: async function (_: any, { idGrupo, idTrabajo, nuevaPosicion }, contexto: contextoQuery) {
            console.log(`Solicitud de set posicion de trabajo en el diagrama del grupo`);
        
            let credencialesUsuario = contexto.usuario;
            try {
                var elGrupo: any = await Grupo.findById(idGrupo).exec();
                if (!elGrupo) {
                    throw "grupo no encontrado"
                }
            }
            catch (error) {
                console.log(`error buscando el grupo. E: ` + error);
            }

            //Authorización
            let permisosEspeciales = ["superadministrador"];
            if (!elGrupo.responsables.includes(credencialesUsuario.id) && !credencialesUsuario.permisos.some(p => permisosEspeciales.includes(p))) {
                console.log(`Error de autenticacion editando Descripcion de grupo`);
                throw new AuthenticationError("No autorizado");
            }

            var elTrabajo=elGrupo.trabajos.id(idTrabajo)

            try {                
                elTrabajo.coords = nuevaPosicion;
                await elGrupo.save();
            } catch (error) {
                console.log(`error guardando el trabajo modificado: ${error}`);
            }

            return elTrabajo;

        },
        async setEstadoTrabajoGrupo(_: any, { idGrupo, idTrabajo, nuevoEstado }, contexto: contextoQuery) {
            let credencialesUsuario = contexto.usuario;
            try {
                var elGrupo: any = await Grupo.findById(idGrupo).exec();
                if (!elGrupo) {
                    throw "grupo no encontrado"
                }
            }
            catch (error) {
                console.log(`error buscando el grupo. E: ` + error);
                throw new ApolloError("Error conectando con la base de datos");
            }

            //Authorización
            let permisosEspeciales = ["superadministrador"];
            if (!elGrupo.responsables.includes(credencialesUsuario.id) && !credencialesUsuario.permisos.some(p => permisosEspeciales.includes(p))) {
                console.log(`Error de autenticacion editando Estado de grupo`);
                throw new AuthenticationError("No autorizado");
            }

            var elTrabajo=elGrupo.trabajos.id(idTrabajo);
            try {                                
                elTrabajo.estadoDesarrollo = nuevoEstado;
                console.log(`guardando nuevo estado ${nuevoEstado} en la base de datos`);
                await elGrupo.save();
            } catch (error) {
                console.log(`error guardando el trabajo modificado: ${error}`);
                throw new ApolloError("Error guardando información en la base de datos");

            }
            console.log(`Estado guardado`);
            return elTrabajo;
        }, 
                          

        crearBienRepartirVacioGrupo: async function(_:any, {idGrupo}, contexto: contextoQuery){
            console.log(`Solicitud de crear nuevo bien para repartir vacío en el grupo con id ${idGrupo}`);
            let credencialesUsuario = contexto.usuario;
            try {
                var elGrupo: any = await Grupo.findById(idGrupo).exec();
                if (!elGrupo) {
                    throw "grupo no encontrado"
                }
            }
            catch (error) {
                console.log(`error buscando el grupo. E: ` + error);
                throw new ApolloError("Error conectando con la base de datos");
            }

            let permisosEspeciales = ["superadministrador"];
            if (!elGrupo.responsables.includes(credencialesUsuario.id) && !credencialesUsuario.permisos.some(p => permisosEspeciales.includes(p))) {
                console.log(`Error de autenticacion editando Estado de grupo`);
                throw new AuthenticationError("No autorizado");
            }

            var nuevoBien = elGrupo.bienes.create();

            elGrupo.bienes.push(nuevoBien);

            try {
                await elGrupo.save();
            } catch (error) {
                console.log(`Error guardando el grupo con un nuevo bien`);
                throw new ApolloError("Error conectando con la base de datos");
            }

            return nuevoBien;
        },
        setNombreBienGrupo: async function(_:any, {idGrupo, idBien, nuevoNombre}, contexto: contextoQuery){
            const charProhibidosNombreBien = /[^ a-zA-ZÀ-ž0-9_():.,-]/;
            if(charProhibidosNombreBien.test(nuevoNombre)){
                throw new UserInputError("El nuevo nombre contiene caracteres no permitidos");
            }

            console.log(`Solicitud de set nombre para un bien con id ${idBien} en un grupo con id ${idGrupo}`);
            let credencialesUsuario = contexto.usuario;
            try {
                var elGrupo: any = await Grupo.findById(idGrupo).exec();
                if (!elGrupo) {
                    throw "grupo no encontrado"
                }
            }
            catch (error) {
                console.log(`error buscando el grupo. E: ` + error);
                throw new ApolloError("Error conectando con la base de datos");
            }

            let permisosEspeciales = ["superadministrador"];
            if (!elGrupo.responsables.includes(credencialesUsuario.id) && !credencialesUsuario.permisos.some(p => permisosEspeciales.includes(p))) {
                console.log(`Error de autenticacion editando Estado de grupo`);
                throw new AuthenticationError("No autorizado");
            }

            var elBien = elGrupo.bienes.id(idBien);
            elBien.nombre=nuevoNombre;
            
            try {
                await elGrupo.save();
            } catch (error) {
                console.log(`Error guardando el grupo con un nuevo bien`);
                throw new ApolloError("Error conectando con la base de datos");
            }

            return elBien;
        },
        setUnidadBienGrupo: async function(_:any, {idGrupo, idBien, nuevoUnidad}, contexto: contextoQuery){
            const charProhibidosUnidadBien = /[^ a-zA-ZÀ-ž0-9_():.,-]/;
            if(charProhibidosUnidadBien.test(nuevoUnidad)){
                throw new UserInputError("La nuevo unidad contiene caracteres no permitidos");
            }

            console.log(`Solicitud de set unidad para un bien con id ${idBien} en un grupo con id ${idGrupo}`);
            let credencialesUsuario = contexto.usuario;
            try {
                var elGrupo: any = await Grupo.findById(idGrupo).exec();
                if (!elGrupo) {
                    throw "grupo no encontrado"
                }
            }
            catch (error) {
                console.log(`error buscando el grupo. E: ` + error);
                throw new ApolloError("Error conectando con la base de datos");
            }

            let permisosEspeciales = ["superadministrador"];
            if (!elGrupo.responsables.includes(credencialesUsuario.id) && !credencialesUsuario.permisos.some(p => permisosEspeciales.includes(p))) {
                console.log(`Error de autenticacion editando Estado de grupo`);
                throw new AuthenticationError("No autorizado");
            }

            var elBien = elGrupo.bienes.id(idBien);
            elBien.unidad=nuevoUnidad;
            
            try {
                await elGrupo.save();
            } catch (error) {
                console.log(`Error guardando el grupo con un nuevo bien`);
                throw new ApolloError("Error conectando con la base de datos");
            }

            return elBien;
        },
        setCantidadBienGrupo: async function(_:any, {idGrupo, idBien, nuevoCantidad}, contexto: contextoQuery){
           
            console.log(`Solicitud de set cantidad para un bien con id ${idBien} en un grupo con id ${idGrupo}`);
            let credencialesUsuario = contexto.usuario;
            try {
                var elGrupo: any = await Grupo.findById(idGrupo).exec();
                if (!elGrupo) {
                    throw "grupo no encontrado"
                }
            }
            catch (error) {
                console.log(`error buscando el grupo. E: ` + error);
                throw new ApolloError("Error conectando con la base de datos");
            }

            let permisosEspeciales = ["superadministrador"];
            if (!elGrupo.responsables.includes(credencialesUsuario.id) && !credencialesUsuario.permisos.some(p => permisosEspeciales.includes(p))) {
                console.log(`Error de autenticacion editando Estado de grupo`);
                throw new AuthenticationError("No autorizado");
            }

            var elBien = elGrupo.bienes.id(idBien);
            elBien.cantidad=nuevoCantidad;
            
            try {
                await elGrupo.save();
            } catch (error) {
                console.log(`Error guardando el grupo con un nuevo bien`);
                throw new ApolloError("Error conectando con la base de datos");
            }

            return elBien;
        },
        setFechaCierreBienGrupo: async function(_:any, {idGrupo, idBien, nuevoFechaCierre}, contexto: contextoQuery){
           
            console.log(`Solicitud de set fechaCierre para un bien con id ${idBien} en un grupo con id ${idGrupo}`);
            let credencialesUsuario = contexto.usuario;
            try {
                var elGrupo: any = await Grupo.findById(idGrupo).exec();
                if (!elGrupo) {
                    throw "grupo no encontrado"
                }
            }
            catch (error) {
                console.log(`error buscando el grupo. E: ` + error);
                throw new ApolloError("Error conectando con la base de datos");
            }

            let permisosEspeciales = ["superadministrador"];
            if (!elGrupo.responsables.includes(credencialesUsuario.id) && !credencialesUsuario.permisos.some(p => permisosEspeciales.includes(p))) {
                console.log(`Error de autenticacion editando Estado de grupo`);
                throw new AuthenticationError("No autorizado");
            }

            var elBien = elGrupo.bienes.id(idBien);
            elBien.fechaCierre=nuevoFechaCierre;
            
            try {
                await elGrupo.save();
            } catch (error) {
                console.log(`Error guardando el grupo con un nuevo bien`);
                throw new ApolloError("Error conectando con la base de datos");
            }

            return elBien;
        },
        setFechaReparticionBienGrupo: async function(_:any, {idGrupo, idBien, nuevoFechaReparticion}, contexto: contextoQuery){
           
            console.log(`Solicitud de set fechaReparticion para un bien con id ${idBien} en un grupo con id ${idGrupo}`);
            let credencialesUsuario = contexto.usuario;
            try {
                var elGrupo: any = await Grupo.findById(idGrupo).exec();
                if (!elGrupo) {
                    throw "grupo no encontrado"
                }
            }
            catch (error) {
                console.log(`error buscando el grupo. E: ` + error);
                throw new ApolloError("Error conectando con la base de datos");
            }

            let permisosEspeciales = ["superadministrador"];
            if (!elGrupo.responsables.includes(credencialesUsuario.id) && !credencialesUsuario.permisos.some(p => permisosEspeciales.includes(p))) {
                console.log(`Error de autenticacion editando Estado de grupo`);
                throw new AuthenticationError("No autorizado");
            }

            var elBien = elGrupo.bienes.id(idBien);
            elBien.fechaReparticion=nuevoFechaReparticion;
            
            try {
                await elGrupo.save();
            } catch (error) {
                console.log(`Error guardando el grupo con un nuevo bien`);
                throw new ApolloError("Error conectando con la base de datos");
            }

            return elBien;
        },
        eliminarBienGrupo: async function(_:any, {idGrupo, idBien}, contexto: contextoQuery){
           
            console.log(`Solicitud de eliminar un bien con id ${idBien} en un grupo con id ${idGrupo}`);
            let credencialesUsuario = contexto.usuario;
            try {
                var elGrupo: any = await Grupo.findById(idGrupo).exec();
                if (!elGrupo) {
                    throw "grupo no encontrado"
                }
            }
            catch (error) {
                console.log(`error buscando el grupo. E: ` + error);
                throw new ApolloError("Error conectando con la base de datos");
            }

            let permisosEspeciales = ["superadministrador"];
            if (!elGrupo.responsables.includes(credencialesUsuario.id) && !credencialesUsuario.permisos.some(p => permisosEspeciales.includes(p))) {
                console.log(`Error de autenticacion editando Estado de grupo`);
                throw new AuthenticationError("No autorizado");
            }

            var indexElBien = elGrupo.bienes.findIndex(b=>b.id==idBien);
            if(indexElBien>-1){
                elGrupo.bienes.splice(indexElBien, 1);
            }   
            else{
                console.log(`El bien no existía`);
                throw new UserInputError("El bien a eliminar no existía en el grupo")
            }
            
            
            try {
                await elGrupo.save();
            } catch (error) {
                console.log(`Error guardando el grupo tras eliminar un bien`);
                throw new ApolloError("Error conectando con la base de datos");
            }

            return true;
        },

        addPeticionBienGrupo: async function(_:any, {idGrupo, idBien, peticion}, contexto: contextoQuery){
            console.log(`Solicitud de crear una peticion para el bien con id ${idBien} con info ${peticion}`);
            try {
                var elGrupo: any = await Grupo.findById(idGrupo).exec();
                if (!elGrupo) {
                    throw "grupo no encontrado"
                }
            }
            catch (error) {
                console.log(`error buscando el grupo. E: ` + error);
                throw new ApolloError("Error conectando con la base de datos");
            }

            var elBien = elGrupo.bienes.id(idBien);            
            if(!elBien){
                console.log(`El bien no existía`);
                throw new UserInputError("El bien no existía en el grupo")
            }

            var indexPeticion=elBien.listaPeticiones.findIndex(p=>p.idBeneficiario==peticion.idBeneficiario);
            if(indexPeticion>-1){
                
                elBien.listaPeticiones.splice(indexPeticion, 1);
            }
            var laPeticion = elBien.listaPeticiones.create(peticion);
            if(peticion.cantidadSolicitada>0){        
                elBien.listaPeticiones.push(laPeticion);
            }

            try {
                await elGrupo.save();
            } catch (error) {
                console.log(`Error guardando el grupo con una nueva peticion en un bien`);
                throw new ApolloError("Error conectando con la base de datos");
            }
            return laPeticion;
        },

        crearRequerimentoEntreNodosGrupo: async function (_: any, { idGrupo, idNodoRequiere, idNodoRequerido, tipoNodoRequiere, tipoNodoRequerido }, contexto: contextoQuery) {
            console.log(`Solicitud de crear un requerimento entre un ${tipoNodoRequiere} con id ${idNodoRequiere} que requiere a un ${tipoNodoRequerido} con id ${idNodoRequerido}`);

            try {
                var elGrupo: any = await Grupo.findById(idGrupo).exec();
                if (!elGrupo) {
                    throw "grupo no encontrado"
                }
            }
            catch (error) {
                console.log("Error buscando el grupo. E: " + error);
                throw new ApolloError("Erro en la conexión con la base de datos");
            }

            //Authorización
            const permisosEspeciales = ["superadministrador"];
            let credencialesUsuario = contexto.usuario;
            if (!elGrupo.responsables.includes(credencialesUsuario.id) && !credencialesUsuario.permisos.some(p => permisosEspeciales.includes(p))) {
                console.log(`Error de autenticacion creando vinculos en grupo`);
                throw new AuthenticationError("No autorizado");
            }

            const vinculo = {
                idRef: idNodoRequerido,
                tipoRef: tipoNodoRequerido,
                tipo: "requiere"
            }

            if (tipoNodoRequiere === "objetivo") {
                try {
                    var elqueRequiere = elGrupo.objetivos.id(idNodoRequiere);
                    if (!elqueRequiere) throw "El objetivo que requiere no encontrado"
                    elqueRequiere.tipo="ObjetivoDeGrupo";
                } catch (error) {
                    console.log(`Error buscando al que requiere. E: ${error}`);
                    throw new ApolloError("Error conectando con la base de datos");
                }
            } else if (tipoNodoRequiere === "trabajo") {
                try {
                    var elqueRequiere = elGrupo.trabajos.id(idNodoRequiere);
                    if (!elqueRequiere) throw "El objetivo que requiere no encontrado";
                    elqueRequiere.tipo="TrabajoDeGrupo";
                } catch (error) {
                    console.log(`Error buscando al que requiere. E: ${error}`);
                    throw new ApolloError("Error conectando con la base de datos");
                }
            } else {
                console.log(`Tipo de nodo que requiere no reconocido`);
                throw new ApolloError("Error. Tipo " + tipoNodoRequiere + " no soportado");
            }

            const indexV = elqueRequiere.vinculos.findIndex(v => v.idRef === idNodoRequerido);

            if (indexV > -1) {
                console.log(`Reemplazando un vinculo ya existente`);
                elqueRequiere.vinculos.splice(indexV, 1);
            }
            try {
                elqueRequiere.vinculos.push(vinculo);                
                await elGrupo.save()                
            } catch (error) {
                console.log(`Error guardando el nodo modificado en la base de datos. E: ${error}`);
                throw new ApolloError("Error conectando con la base de datos");
            }

            return { nodo: elqueRequiere };

        },
        desvincularNodosGrupo: async function (_: any, { idGrupo, idNodoRequiere, idNodoRequerido, tipoNodoRequiere, tipoNodoRequerido }, contexto: contextoQuery) {
            console.log(`Solicitud de eliminar vínculo entre un ${tipoNodoRequiere} con id ${idNodoRequiere} que requiere a un ${tipoNodoRequerido} con id ${idNodoRequerido}`);

            try {
                var elGrupo: any = await Grupo.findById(idGrupo).exec();
                if (!elGrupo) {
                    throw "grupo no encontrado"
                }
            }
            catch (error) {
                console.log("Error buscando el grupo. E: " + error);
                throw new ApolloError("Erro en la conexión con la base de datos");
            }

            //Authorización
            const permisosEspeciales = ["superadministrador"];
            let credencialesUsuario = contexto.usuario;
            if (!elGrupo.responsables.includes(credencialesUsuario.id) && !credencialesUsuario.permisos.some(p => permisosEspeciales.includes(p))) {
                console.log(`Error de autenticacion eliminando vinculos en grupo`);
                throw new AuthenticationError("No autorizado");
            }

            if (tipoNodoRequiere === "objetivo") {
                try {
                    var elqueRequiere = elGrupo.objetivos.id(idNodoRequiere);
                    if (!elqueRequiere) throw "El objetivo que requiere no encontrado"
                    elqueRequiere.tipo="ObjetivoDeGrupo";
                } catch (error) {
                    console.log(`Error buscando al que requiere. E: ${error}`);
                    throw new ApolloError("Error conectando con la base de datos");
                }
            } else if (tipoNodoRequiere === "trabajo") {
                try {
                    var elqueRequiere = elGrupo.trabajos.id(idNodoRequiere);                
                    if (!elqueRequiere) throw "El trabajo que requiere no encontrado"
                    elqueRequiere.tipo="TrabajoDeGrupo";
                } catch (error) {
                    console.log(`Error buscando al que requiere. E: ${error}`);
                    throw new ApolloError("Error conectando con la base de datos");
                }
            } else {
                console.log(`Tipo de nodo que requiere no reconocido`);
                throw new ApolloError("Error. Tipo " + tipoNodoRequiere + " no soportado");
            }

            try {
                const indexV = elqueRequiere.vinculos.findIndex(v => v.idRef === idNodoRequerido);

                if (indexV > -1) {
                    console.log(`Eliminando vinculo`);
                    elqueRequiere.vinculos.splice(indexV, 1);
                }
                else {
                    console.log(`El vinculo no existía`);
                    throw new ApolloError("El vinculo no existia");
                }                
                await elGrupo.save()                
            } catch (error) {
                console.log(`Error guardando el nodo modificado en la base de datos. E: ${error}`);
                throw new ApolloError("Error conectando con la base de datos");
            }
            return { nodo: elqueRequiere };
        },


    },
    Grupo: {
        personasResponsables: async function (parent: any, _: any, __: any) {
            if (!parent.responsables) {
                return [];
            }
            let idsResponsables = parent.responsables;

            try {
                var usuariosResponsables = await Usuario.find({ _id: { $in: idsResponsables } }).exec();
                if (!usuariosResponsables) {
                    console.log(`No habia usuarios responsables`);
                }
            } catch (error) {
                console.log(`error buscando a los responsables del grupo. E: ${error}`);
                return [];
            }


            return usuariosResponsables;
        },
        personasPosiblesResponsables: async function (parent: any, _: any, __: any) {
            if (!parent.posiblesResponsables) {
                return [];
            }
            let idsPosiblesResponsables = parent.posiblesResponsables;

            try {
                var usuariosPosiblesResponsables = Usuario.find({ _id: { $in: idsPosiblesResponsables } }).exec();
            } catch (error) {
                console.log(`error buscando a los posiblesResponsables del grupo. E: ${error}`);
                return [];
            }

            return usuariosPosiblesResponsables;
        },
        materiales: async function (parent: any, _: any, __: any) {
            console.log(`Resolviendo materiales de ${parent.id} con ${parent.idsTrabajos.length} trabajos`);

            try {
                var losTrabajos: any = await Trabajo.find({ "_id": { $in: parent.idsTrabajos } }).select("nombre materiales").exec();
            } catch (error) {
                console.log(`Error querying los trabajos. E: ${error}`);
                throw new ApolloError("Error conectando con la base de datos");
            }
            var aMateriales:any[] = [];
            for (var i = 0; i < losTrabajos.length; i++) {
                let esteTrabajo=losTrabajos[i];
                for(var j=0;j<esteTrabajo.materiales.length;j++){
                    let esteMaterial=esteTrabajo.materiales[j];
                    esteMaterial.idTrabajoParent=esteTrabajo._id;
                    aMateriales.push(esteMaterial);
                }                
            }
            return aMateriales;
        },
    },

    NodoGrupo: {
        __resolveType: function (nodo) {
            return nodo.tipo
        }
    }
}