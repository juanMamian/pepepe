import { ApolloError, AuthenticationError, gql, UserInputError } from "apollo-server-express";
import { contextoQuery } from "./tsObjetos"
import { ModeloEvento as Evento } from "../model/Evento";
import { ModeloProyecto as Proyecto } from "../model/Proyecto";
import { ModeloNodo as Nodo } from "../model/atlas/Nodo";
import { ModeloUsuario as Usuario } from "../model/Usuario";


export const typeDefs = gql`
    
    type InfoEventoCalendario{
        id:ID,
        tipoParent:String,
        nombreParent:String,
        participantes:PublicUsuario
    }

    type EventoCalendario{
        id: ID,
        nombre: String,
        descripcion: String,
        responsables: [String],
        posiblesResponsables: [String]
        responsablesSolicitados: Int,
        participantes:[String],
        horarioInicio: Date,
        horarioFinal: Date,
        origen:String,
        idOrigen: ID,
        
    }

    extend type Query{
        evento(idEvento:ID!):EventoCalendario,
        eventosSegunOrigen(origen:String!, idOrigen:ID!):[EventoCalendario],
        eventosUsuario(idUsuario:ID!):[EventoCalendario],
        eventosCruceNuevoEventoClub(idClub: ID!):[EventoCalendario],
        eventosCruceNuevaClaseNodoConocimiento(idClase: ID!, idNodo: ID!):[EventoCalendario],
        infoAdicionalEvento(idEvento:ID!):InfoEventoCalendario
    }

    extend type Mutation{
        crearEventoProyectoCalendario(origen: String!, idOrigen:ID!, horarioInicio:Date!, horarioFinal: Date!):EventoCalendario,
        crearClaseNodoConocimientoCalendario(idNodo:ID!, idClase: ID!, horarioInicio:Date!, horarioFinal: Date!, nombre: String!, descripcion: String):EventoCalendario,
        eliminarEventoCalendario(idEvento:ID!):Boolean,
        setHorariosEvento(idEvento: ID!, nuevoHorarioInicio: Date!, nuevoHorarioFinal: Date!):EventoCalendario,
        editarNombreEventoCalendario(idEvento: ID!, nuevoNombre: String!):EventoCalendario,        
        editarDescripcionEventoCalendario(idEvento: ID!, nuevoDescripcion: String!):EventoCalendario,

        setAsistenciaUsuarioEventoCalendario(idEvento:ID!, idUsuario: ID!, nuevoAsistencia:Boolean!):EventoCalendario

    }
`;
const charProhibidosNombreEvento = /[^ a-zA-ZÀ-ž0-9_():.,-]/;

export const resolvers = {
    Query: {
        evento: async function (_: any, { idEvento }: any, context: contextoQuery) {

            try {
                var elEvento: any = await Evento.findById(idEvento).exec();
                if (!elEvento) {
                    throw "Evento no existía"
                }
            } catch (error) {
                console.log(`error buscando un evento. E: ${error}`);
                throw new ApolloError("");
            }

            return elEvento;
        },
        async eventosSegunOrigen(_: any, { origen, idOrigen }: any, context: contextoQuery) {
            console.log(`Solicitud de eventos de un ${origen} con id ${idOrigen}`);
            try {
                var losEventos: any = await Evento.find({ idOrigen }).exec();

            } catch (error) {
                console.log(`error buscando eventos. E: ${error}`);
                throw new ApolloError("");
            }
            console.log(`Enviando ${losEventos.length} eventos`);
            return losEventos;
        },
        async eventosUsuario(_: any, { idUsuario }: any, contexto: contextoQuery) {
            let credencialesUsuario = contexto.usuario;
            console.log(`Solicitud de eventosCalendario del usuario ${idUsuario}`);
            var permisosEspeciales = ["superadministrador"];
            if (credencialesUsuario.id != idUsuario && !permisosEspeciales.some(p => credencialesUsuario.permisos.includes(p))) {
                console.log(`No autorizado`);
                throw new AuthenticationError("No autorizado");
            }

            try {
                var losEventos: any = await Evento.find({ participantes: idUsuario }).exec();
            } catch (error) {
                console.log(`error buscando eventos. E: ${error}`);
                throw new ApolloError("Error conectando con la base de datos");
            }

            //Buscar clases en las que está interesado el usuario.

            try {
                var losNodosInteresantes: any = await Nodo.find({ "clases.interesados": idUsuario }).exec();
            } catch (error) {
                console.log(`Error buscando nodos con clases de interés para el usuario`);
                throw new ApolloError("Error conectando con la base de datos");
            }
            console.log(`El usuario está interesado en clases de los nodos: ${losNodosInteresantes.map(n => n.nombre)}`);

            var idsClasesInteresantes: Array<string> = [];
            losNodosInteresantes.forEach(nodo => {
                let clasesInteresantes = nodo.clases.filter(c => c.interesados.includes(idUsuario));
                idsClasesInteresantes = idsClasesInteresantes.concat(clasesInteresantes.map(c => c.id));
            });

            console.log(`El usuario está interesado en las clases: ${idsClasesInteresantes}`);

            try {
                var losEventosClases: any = await Evento.find({ idOrigen: { $in: idsClasesInteresantes } }).exec();
            } catch (error) {
                console.log(`error buscando eventos de clases interesantes para el usuario. E: ${error}`);
                throw new ApolloError("Error conectando con la base de datos");
            }

            var todosEventos = losEventos.concat(losEventosClases);

            console.log(`Enviando ${todosEventos.length} eventos`);
            return todosEventos;
        },
        async eventosCruceNuevoEventoClub(_: any, { idClub }: any, contexto: contextoQuery) {
            console.log(`Solicitud de eventos que se cruzarían con un nuevo evento del club ${idClub}`);
            let credencialesUsuario = contexto.usuario;

            try {
                var elProyecto: any = await Proyecto.findById(idClub).exec();
                if (!elProyecto) throw "Proyecto parent no encontrado";
            } catch (error) {
                console.log(`Error buscando el club parent. E: ${error}`);
                throw new ApolloError("Error conectando con la base de datos")
            }

            var usuariosRelevantes = elProyecto.participantes;

            const indexU = usuariosRelevantes.indexOf(credencialesUsuario.id)
            if (indexU > -1) {
                console.log(`El usuario que solicita ya era parte de los relevantes`);
            }
            else {
                const todosMiembrosProyecto = elProyecto.responsables.concat(elProyecto.participantes);
                if (todosMiembrosProyecto.includes(credencialesUsuario.id)) {
                    usuariosRelevantes.push(credencialesUsuario.id);
                }
            }

            try {
                var losEventosCruce: any = await Evento.find({ participantes: { $in: usuariosRelevantes }, idOrigen: { $ne: idClub } }).exec();
            } catch (error) {
                console.log(`Error buscando los eventos cruce: ${error}`);
                throw new ApolloError("Error conectando con la base de datos");

            }
            return losEventosCruce;
        },
        async eventosCruceNuevaClaseNodoConocimiento(_: any, { idClase, idNodo }: any, contexto: contextoQuery) {
            console.log(`Solicitud de eventos que se cruzarían con un nuevo evento de la clase ${idClase}`);
            let credencialesUsuario = contexto.usuario;

            try {
                var elNodo: any = await Nodo.findById(idNodo).exec();
                if (!elNodo) throw "Proyecto parent no encontrado";
            } catch (error) {
                console.log(`Error buscando el nodo parent. E: ${error}`);
                throw new ApolloError("Error conectando con la base de datos")
            }

            var laClase = elNodo.clases.id(idClase);
            if (!laClase) {
                console.log(`Error buscando la clase para buscar sus cruces`);
                throw new UserInputError("Datos incorrectos");
            }

            var usuariosRelevantes = laClase.interesados;

            const indexU = usuariosRelevantes.indexOf(credencialesUsuario.id)
            if (indexU > -1) {
                console.log(`El usuario que solicita ya era parte de los relevantes`);
            }
            else {
                usuariosRelevantes.push(credencialesUsuario.id);
            }
            console.log(`Buscando cruces con eventos que incluyen a los usuariosRelevantes: ${usuariosRelevantes}`);

            try {
                var losEventosCruce: any = await Evento.find({ participantes: { $in: usuariosRelevantes }, idOrigen: { $ne: idClase } }).exec();
            } catch (error) {
                console.log(`Error buscando los eventos cruce: ${error}`);
                throw new ApolloError("Error conectando con la base de datos");

            }
            return losEventosCruce;
        },
        infoAdicionalEvento: async function (_: any, { idEvento }: any, context: contextoQuery) {

            try {
                var elEvento: any = await Evento.findById(idEvento).exec();
                if (!elEvento) {
                    throw "Evento no existía"
                }
            } catch (error) {
                console.log(`error buscando un evento. E: ${error}`);
                throw new ApolloError("");
            }
            var infoEvento:any=null;
            if (elEvento.origen === 'club') {
                try {
                    var elParent: any = await Proyecto.findById(elEvento.idOrigen).exec();
                } catch (error) {
                    console.log(`Error buscando el proyecto parent del evento`);
                    throw new ApolloError("Error conectando con la base de datos");
                }

                try {
                    console.log(`Buscando los ${elEvento.participantes.length} participantes del evento`);
                    var losParticipantes:any=await Usuario.find({'_id':{$in:elEvento.participantes}}).exec();
                    console.log(`Encontrados ${losParticipantes.length} participantes del evento ${elEvento.nombre}`);
                } catch (error) {
                    console.log(`Error buscando los participantes del evento ${idEvento}: ${error}`);
                    throw new ApolloError("Error conectando con la base de datos");
                }

                infoEvento={
                    id:elEvento.id,
                    nombreParent: elParent.nombre,
                    tipoParent:"Grupo",
                    participantes: losParticipantes
                }
            }
            else if (elEvento.origen === 'claseNodoConocimiento') {
                try {
                    var elParent: any = await Nodo.findById(elEvento.idNodo).exec();
                } catch (error) {
                    console.log(`Error buscando el nodoConocimiento parent del evento`);
                    throw new ApolloError("Error conectando con la base de datos");
                }

                try {
                    console.log(`Buscando los ${elEvento.participantes.length} participantes del evento`);
                    var losParticipantes:any=await Usuario.find({id:{$in:elEvento.participantes}}).exec();
                    console.log(`Encontrados ${losParticipantes.length} participantes del evento ${elEvento.nombre}`);
                } catch (error) {
                    console.log(`Error buscando los participantes del evento ${idEvento}: ${error}`);
                    throw new ApolloError("Error conectando con la base de datos");
                }

                infoEvento={
                    id:elEvento.id,
                    nombreParent: elParent.nombre,
                    tipoParent:"Clase",
                    participantes: losParticipantes
                }
            }
            
            return infoEvento;
        },

    },

    Mutation: {
        async crearEventoProyectoCalendario(_: any, { origen, idOrigen, horarioInicio, horarioFinal }: any, contexto: contextoQuery) {
            let credencialesUsuario = contexto.usuario;

            var idsAutorizados = [];
            var participantesEvento: Array<string> = [];
            if (origen === "club") {
                try {
                    var elProyecto: any = await Proyecto.findById(idOrigen).exec();
                    if (!elProyecto) throw "Proyecto parent no encontrado";
                } catch (error) {
                    console.log(`Error buscando el club parent. E: ${error}`);
                    throw new ApolloError("Error conectando con la base de datos")
                }
                idsAutorizados = elProyecto.responsables;
                participantesEvento = elProyecto.participantes;
                const indexU = participantesEvento.indexOf(credencialesUsuario.id);

                if (indexU == -1) {
                    participantesEvento.push(credencialesUsuario.id);
                }
            }

            console.log(`Creando evento con participantes: ${participantesEvento}`);

            //Autorización
            const permisosEspeciales = ["superadministrador"];

            if (!idsAutorizados.some(id => id === credencialesUsuario.id) && !permisosEspeciales.some(p => credencialesUsuario.permisos.includes(p))) {
                console.log(`Error de autenticación`);
                throw new AuthenticationError("No autorizado");
            }

            console.log(`Creando un evento que va desde ${horarioInicio} hasta ${horarioFinal}`);

            if (horarioFinal <= (horarioInicio + 600000)) {
                throw new UserInputError("Datos de tiempo inválidos");
            }

            try {
                var nuevoEvento = new Evento({ origen, idOrigen, horarioInicio, horarioFinal, participantes: participantesEvento });
                await nuevoEvento.save();
            } catch (error) {
                console.log(`Error creando el nuevo evento. E: ${error}`);
                throw new ApolloError("Error conectando con la base de datos");
            }
            return nuevoEvento
        },
        async crearClaseNodoConocimientoCalendario(_: any, { idNodo, idClase, horarioInicio, horarioFinal, nombre, descripcion }: any, contexto: contextoQuery) {
            let credencialesUsuario = contexto.usuario;

            var idsAutorizados: Array<string> = [];

            try {
                var elNodo: any = await Nodo.findById(idNodo).exec();
                if (!elNodo) throw "NodoConocimiento parent no encontrado";
                idsAutorizados = elNodo.expertos;
            } catch (error) {
                console.log(`Error buscando el nodoConocimiento parent. E: ${error}`);
                throw new ApolloError("Error conectando con la base de datos")
            }

            //Autorización
            const permisosEspeciales = ["superadministrador"];

            if (!idsAutorizados.some(id => id === credencialesUsuario.id) && !permisosEspeciales.some(p => credencialesUsuario.permisos.includes(p))) {
                console.log(`Error de autenticación`);
                throw new AuthenticationError("No autorizado");
            }

            nombre = nombre.replace(/\s\s+/g, " ");
            if (charProhibidosNombreEvento.test(nombre)) {
                throw new UserInputError("Nombre ilegal");
            }

            const laClase = elNodo.clases.find(c => c.id === idClase);

            if (!laClase) {
                console.log(`Error. La clase para la cual se crearía un evento no existía:`);
                throw new UserInputError("Datos de clase inválidos para crear el evento");
            }
            var participantesEvento = [laClase.idExperto];

            console.log(`Creando una clase que va desde ${horarioInicio} hasta ${horarioFinal}`);

            if (horarioFinal <= (horarioInicio + 600000)) {
                throw new UserInputError("Datos de tiempo inválidos");
            }

            try {
                var nuevoEvento = new Evento({ origen: 'claseNodoConocimiento', idOrigen: idClase, idNodo, horarioInicio, horarioFinal, participantes: participantesEvento, descripcion, nombre });
                await nuevoEvento.save();
            } catch (error) {
                console.log(`Error creando el nuevo evento. E: ${error}`);
                throw new ApolloError("Error conectando con la base de datos");
            }
            return nuevoEvento
        },
        async eliminarEventoCalendario(_: any, { idEvento }: any, contexto: contextoQuery) {
            let credencialesUsuario = contexto.usuario;
            console.log(`Solicitud de eliminar un evento con id ${idEvento}`);
            try {
                var elEvento: any = await Evento.findById(idEvento).exec();
                if (!elEvento) throw "Evento no encontrado"
            } catch (error) {
                console.log(`Error buscando el evento: ${error}`);
                throw new ApolloError("Error conectando con la base de datos");
            }

            var idsAutorizados = [];
            if (elEvento.origen === "club") {
                try {
                    var elProyecto: any = await Proyecto.findById(elEvento.idOrigen).exec();
                    if (!elProyecto) throw "Proyecto parent no encontrado";
                } catch (error) {
                    console.log(`Error buscando el club parent. E: ${error}`);
                    throw new ApolloError("Error conectando con la base de datos")
                }
                idsAutorizados = elProyecto.responsables
            }

            //Autorización
            const permisosEspeciales = ["superadministrador"];

            if (!idsAutorizados.some(id => id === credencialesUsuario.id) && !permisosEspeciales.some(p => credencialesUsuario.permisos.includes(p))) {
                console.log(`Error de autenticación`);
                throw new AuthenticationError("No autorizado");
            }

            try {
                await Evento.findByIdAndDelete(idEvento).exec();

            } catch (error) {
                console.log(`Error eliminando el evento: ${error}`);
                throw new ApolloError("Error conectando con la base de datos");
            }

            return true;
        },
        async setHorariosEvento(_: any, { idEvento, nuevoHorarioInicio, nuevoHorarioFinal }: any, contexto: contextoQuery) {
            let credencialesUsuario = contexto.usuario;
            console.log(`Solicitud de set tiempos de un evento en ${nuevoHorarioInicio} - ${nuevoHorarioFinal}`);
            try {
                var elEvento: any = await Evento.findById(idEvento).exec();
                if (!elEvento) throw "Evento no encontrado"
            } catch (error) {
                console.log(`Error buscando el evento: ${error}`);
                throw new ApolloError("Error conectando con la base de datos");
            }

            var idsAutorizados = [];
            if (elEvento.origen === "club") {
                try {
                    var elProyecto: any = await Proyecto.findById(elEvento.idOrigen).exec();
                    if (!elProyecto) throw "Proyecto parent no encontrado";
                } catch (error) {
                    console.log(`Error buscando el club parent. E: ${error}`);
                    throw new ApolloError("Error conectando con la base de datos")
                }
                idsAutorizados = elProyecto.responsables
            }

            //Autorización
            const permisosEspeciales = ["superadministrador"];

            if (!idsAutorizados.some(id => id === credencialesUsuario.id) && !permisosEspeciales.some(p => credencialesUsuario.permisos.includes(p))) {
                console.log(`Error de autenticación`);
                throw new AuthenticationError("No autorizado");
            }

            var dateInicio = new Date(nuevoHorarioInicio);
            var dateFinal = new Date(nuevoHorarioFinal);

            const duracionMinima = 300000; //5 minutos
            const duracion = dateFinal.getTime() - dateInicio.getTime();
            if (duracion < duracionMinima) {
                console.log(`Ajustando a duracion mínima de ${duracionMinima / 60} minutos`);
                dateFinal = new Date(dateInicio.getTime() + duracionMinima);
            }

            try {
                elEvento.horarioInicio = nuevoHorarioInicio;
                elEvento.horarioFinal = dateFinal;
                await elEvento.save();
            } catch (error) {
                console.log(`Error guardando el nuevo horario de inicio: ${error}`);
                throw new ApolloError("Error escribiendo en la base de datos");
            }
            console.log(`Quedó de ${elEvento.horarioInicio} a ${elEvento.horarioFinal}`);
            return elEvento;
        },
        editarNombreEventoCalendario: async function (_: any, { idEvento, nuevoNombre }: any, contexto: contextoQuery) {
            let credencialesUsuario = contexto.usuario;
            try {
                var elEvento: any = await Evento.findById(idEvento).exec();
                if (!elEvento) {
                    throw "evento no encontrado"
                }
            }
            catch (error) {
                console.log(`error buscando el evento. E: ` + error);
            }

            var idsAutorizados = [];
            if (elEvento.origen === "club") {
                try {
                    var elProyecto: any = await Proyecto.findById(elEvento.idOrigen).exec();
                    if (!elProyecto) throw "Proyecto parent no encontrado";
                } catch (error) {
                    console.log(`Error buscando el club parent. E: ${error}`);
                    throw new ApolloError("Error conectando con la base de datos")
                }
                idsAutorizados = elProyecto.responsables
            }

            //Autorización
            const permisosEspeciales = ["superadministrador"];

            if (!idsAutorizados.some(id => id === credencialesUsuario.id) && !permisosEspeciales.some(p => credencialesUsuario.permisos.includes(p))) {
                console.log(`Error de autenticación`);
                throw new AuthenticationError("No autorizado");
            }


            nuevoNombre = nuevoNombre.replace(/\s\s+/g, " ");
            if (charProhibidosNombreEvento.test(nuevoNombre)) {
                throw new ApolloError("Nombre ilegal");
            }


            nuevoNombre = nuevoNombre.trim();

            try {
                console.log(`guardando nuevo nombre ${elEvento.nombre} en la base de datos`);
                var resEvento: any = await Evento.findByIdAndUpdate(idEvento, { nombre: nuevoNombre }, { new: true }).exec();
            } catch (error) {
                console.log(`error guardando el evento con coordenadas manuales: ${error}`);
            }
            console.log(`Nombre guardado`);
            return resEvento;
        },
        editarDescripcionEventoCalendario: async function (_: any, { idEvento, nuevoDescripcion }: any, contexto: contextoQuery) {
            console.log(`|||||||||||||||||||`);
            console.log(`Solicitud de set descripcion del evento con id ${idEvento}`);
            let credencialesUsuario = contexto.usuario;
            try {
                var elEvento: any = await Evento.findById(idEvento).exec();
                if (!elEvento) {
                    throw "evento no encontrado"
                }
            }
            catch (error) {
                console.log(`error buscando el evento. E: ` + error);
            }

            var idsAutorizados = [];
            if (elEvento.origen === "club") {
                try {
                    var elProyecto: any = await Proyecto.findById(elEvento.idOrigen).exec();
                    if (!elProyecto) throw "Proyecto parent no encontrado";
                } catch (error) {
                    console.log(`Error buscando el club parent. E: ${error}`);
                    throw new ApolloError("Error conectando con la base de datos")
                }
                idsAutorizados = elProyecto.responsables
            }

            //Autorización
            const permisosEspeciales = ["superadministrador"];

            if (!idsAutorizados.some(id => id === credencialesUsuario.id) && !permisosEspeciales.some(p => credencialesUsuario.permisos.includes(p))) {
                console.log(`Error de autenticación`);
                throw new AuthenticationError("No autorizado");
            }

            const charProhibidosDescripcionEvento = /[^\n\r a-zA-ZÀ-ž0-9_():;.,+¡!¿?@=-]/;

            if (charProhibidosDescripcionEvento.test(nuevoDescripcion)) {
                throw new ApolloError("Descripcion ilegal");
            }


            nuevoDescripcion = nuevoDescripcion.trim();

            try {
                console.log(`guardando nuevo descripcion ${nuevoDescripcion} en la base de datos`);
                var resEvento: any = await Evento.findByIdAndUpdate(idEvento, { descripcion: nuevoDescripcion }, { new: true }).exec();
            } catch (error) {
                console.log(`error guardando el evento: ${error}`);
            }
            console.log(`Descripcion guardado`);
            return resEvento;
        },

        setAsistenciaUsuarioEventoCalendario: async function (_: any, { idEvento, idUsuario, nuevoAsistencia }: any, contexto: contextoQuery) {
            let credencialesUsuario = contexto.usuario;

            //Autorizacion
            const permisosEspeciales = ["superadministrador"];

            if (credencialesUsuario.id != idUsuario && !permisosEspeciales.some(p => credencialesUsuario.permisos.includes(p))) {
                console.log(`Error de autenticación`);
                throw new AuthenticationError("No autorizado");
            }

            try {
                var elEvento: any = await Evento.findById(idEvento).exec();
                if (!elEvento) {
                    throw "evento no encontrado"
                }
            }
            catch (error) {
                console.log(`error buscando el evento. E: ` + error);
            }

            const indexU = elEvento.participantes.indexOf(idUsuario);
            if (indexU > -1 && !nuevoAsistencia) {
                elEvento.participantes.splice(indexU, 1);
            }
            else if (indexU === -1 && nuevoAsistencia) {
                elEvento.participantes.push(idUsuario);
            }

            try {
                await elEvento.save();
            } catch (error) {
                console.log(`Error guardando el evento tras set asistencia de usuario ${idUsuario} a ${nuevoAsistencia}`);
                throw new ApolloError("Error conectando con la base de datos");
            }

            return elEvento;

        }
    },

    EventoCalendario: {
        async responsables(parent: any, _: any, __: any) {
            var responsables: Array<string> = [];
            if (parent.origen === "club") {
                try {
                    var elProyecto: any = await Proyecto.findById(parent.idOrigen).exec();
                    if (!elProyecto) throw "Proyecto parent no encontrado buscando responsables de un evento";
                    responsables = elProyecto.responsables;
                } catch (error) {
                    console.log(`Error buscando el club parent. E: ${error}`);
                    throw new ApolloError("Error conectando con la base de datos")
                }

            }
            else if (parent.origen === 'claseNodoConocimiento') {

                try {
                    var elNodo: any = await Nodo.findById(parent.idNodo).exec();
                    if (!elNodo) throw "Nodo parent no encontrado buscando responsables de un evento";
                    console.log(`clases del nodo: ${elNodo.clases}`);
                    var laClase = elNodo.clases.find(c => c.id === parent.idOrigen);
                    console.log(`Error buscando la clase con id ${parent.idOrigen} en el nodo ${elNodo.nombre} para el evento ${parent.id}`);
                    if(!laClase)throw new ApolloError("Error conectando con la base de datos");
                    console.log(`Buscando el responsable de la clase: ${laClase.nombre}`);
                    responsables = [laClase.idExperto];
                } catch (error) {
                    console.log(`Error buscando el nodo parent. E: ${error}`);
                    throw new ApolloError("Error conectando con la base de datos")
                }
            }
            return responsables;
        }
    }
}

