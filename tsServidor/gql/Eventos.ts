import { ApolloError, AuthenticationError, gql, UserInputError } from "apollo-server-express";
import { contextoQuery } from "./tsObjetos"
import { ModeloEvento as Evento } from "../model/Evento";
import { ModeloProyecto as Proyecto } from "../model/Proyecto";

export const typeDefs = gql`
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
        idOrigen: ID
    }

    extend type Query{
        evento(idEvento:ID!):EventoCalendario,
        eventosSegunOrigen(origen:String!, idOrigen:ID!):[EventoCalendario],
        eventosUsuario(idUsuario:ID!):[EventoCalendario,]
    }

    extend type Mutation{
        crearEventoCalendario(origen: String!, idOrigen:ID!, horarioInicio:Date!, horarioFinal: Date!):EventoCalendario,
        eliminarEventoCalendario(idEvento:ID!):Boolean,
        setHorariosEvento(idEvento: ID!, nuevoHorarioInicio: Date!, nuevoHorarioFinal: Date!):EventoCalendario,
        editarNombreEventoCalendario(idEvento: ID!, nuevoNombre: String!):EventoCalendario,        
        editarDescripcionEventoCalendario(idEvento: ID!, nuevoDescripcion: String!):EventoCalendario,

    }
`;

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
        async eventosSegunOrigen(_: any, { origen, idOrigen }: any, context: contextoQuery){
            console.log(`Solicitud de eventos de un ${origen} con id ${idOrigen}`);
            try {
                var losEventos: any = await Evento.find({idOrigen}).exec();
                
            } catch (error) {
                console.log(`error buscando eventos. E: ${error}`);
                throw new ApolloError("");
            }
            console.log(`Enviando ${losEventos.length} eventos`);
            return losEventos;
        },
        async eventosUsuario(_: any, { idUsuario }: any, contexto: contextoQuery){
            let credencialesUsuario = contexto.usuario;
            console.log(`Solicitud de eventosCalendario del usuario ${idUsuario}`);
            var permisosEspeciales=["superadministrador"];
            if(credencialesUsuario.id!=idUsuario && !permisosEspeciales.some(p=>credencialesUsuario.permisos.includes(p))){
                console.log(`No autorizado`);
                throw new AuthenticationError("No autorizado");
            }

            try {
                var losEventos: any = await Evento.find({participantes: idUsuario}).exec();
                
            } catch (error) {
                console.log(`error buscando eventos. E: ${error}`);
                throw new ApolloError("");
            }
            console.log(`Enviando ${losEventos.length} eventos`);
            return losEventos;
        }
    },

    Mutation:{
        async crearEventoCalendario(_: any, { origen, idOrigen, horarioInicio, horarioFinal }: any, contexto: contextoQuery){
            let credencialesUsuario = contexto.usuario;

            var idsAutorizados=[];
            var participantesEvento=[];
            if(origen==="club"){
                try {
                    var elProyecto:any=await Proyecto.findById(idOrigen).exec();                    
                    if(!elProyecto)throw "Proyecto parent no encontrado";
                } catch (error) {
                    console.log(`Error buscando el club parent. E: ${error}`);
                    throw new ApolloError("Error conectando con la base de datos")
                }
                idsAutorizados=elProyecto.responsables;
                participantesEvento=participantesEvento.concat(elProyecto.responsables).concat(elProyecto.participantes);
            }

            //Autorización
            const permisosEspeciales=["superadministrador"];

            if(!idsAutorizados.some(id=>id===credencialesUsuario.id) && !permisosEspeciales.some(p=>credencialesUsuario.permisos.includes(p))){
                console.log(`Error de autenticación`);
                throw new AuthenticationError("No autorizado");
            }

            console.log(`Creando un evento que va desde ${horarioInicio} hasta ${horarioFinal}`);

            if(horarioFinal<=(horarioInicio+600000)){
                throw new UserInputError("Datos de tiempo inválidos");
            }


            try {
                var nuevoEvento= new Evento({origen, idOrigen, horarioInicio, horarioFinal, participantes: participantesEvento});
                await nuevoEvento.save();
            } catch (error) {
                console.log(`Error creando el nuevo evento. E: ${error}`);
                throw new ApolloError("Error conectando con la base de datos");
            }
            return nuevoEvento
        },
        async eliminarEventoCalendario(_: any, { idEvento }: any, contexto: contextoQuery){
            let credencialesUsuario = contexto.usuario;
            console.log(`Solicitud de eliminar un evento con id ${idEvento}`);
            try {
                var elEvento:any=await Evento.findById(idEvento).exec();
                if(!elEvento)throw "Evento no encontrado"
            } catch (error) {
                console.log(`Error buscando el evento: ${error}`);
                throw new ApolloError("Error conectando con la base de datos");
            }

            var idsAutorizados=[];
            if(elEvento.origen==="club"){
                try {
                    var elProyecto:any=await Proyecto.findById(elEvento.idOrigen).exec();                    
                    if(!elProyecto)throw "Proyecto parent no encontrado";
                } catch (error) {
                    console.log(`Error buscando el club parent. E: ${error}`);
                    throw new ApolloError("Error conectando con la base de datos")
                }
                idsAutorizados=elProyecto.responsables                
            }

            //Autorización
            const permisosEspeciales=["superadministrador"];

            if(!idsAutorizados.some(id=>id===credencialesUsuario.id) && !permisosEspeciales.some(p=>credencialesUsuario.permisos.includes(p))){
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
        async setHorariosEvento(_: any, { idEvento, nuevoHorarioInicio, nuevoHorarioFinal}: any, contexto: contextoQuery){
            let credencialesUsuario = contexto.usuario;
            console.log(`Solicitud de set tiempos de un evento en ${nuevoHorarioInicio} - ${nuevoHorarioFinal}`);
            try {
                var elEvento:any=await Evento.findById(idEvento).exec();
                if(!elEvento)throw "Evento no encontrado"
            } catch (error) {
                console.log(`Error buscando el evento: ${error}`);
                throw new ApolloError("Error conectando con la base de datos");
            }

            var idsAutorizados=[];
            if(elEvento.origen==="club"){
                try {
                    var elProyecto:any=await Proyecto.findById(elEvento.idOrigen).exec();                    
                    if(!elProyecto)throw "Proyecto parent no encontrado";
                } catch (error) {
                    console.log(`Error buscando el club parent. E: ${error}`);
                    throw new ApolloError("Error conectando con la base de datos")
                }
                idsAutorizados=elProyecto.responsables                
            }

            //Autorización
            const permisosEspeciales=["superadministrador"];

            if(!idsAutorizados.some(id=>id===credencialesUsuario.id) && !permisosEspeciales.some(p=>credencialesUsuario.permisos.includes(p))){
                console.log(`Error de autenticación`);
                throw new AuthenticationError("No autorizado");
            }
            
            var dateInicio=new Date(nuevoHorarioInicio);
            var dateFinal= new Date(nuevoHorarioFinal);            

            const duracionMinima=300000; //5 minutos
            const duracion=dateFinal.getTime()-dateInicio.getTime();
            if(duracion<duracionMinima){
                console.log(`Ajustando a duracion mínima de ${duracionMinima/60} minutos`);
                dateFinal=new Date(dateInicio.getTime()+duracionMinima);
            }

            try {
                elEvento.horarioInicio=nuevoHorarioInicio;
                elEvento.horarioFinal=dateFinal;
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

            var idsAutorizados=[];
            if(elEvento.origen==="club"){
                try {
                    var elProyecto:any=await Proyecto.findById(elEvento.idOrigen).exec();                    
                    if(!elProyecto)throw "Proyecto parent no encontrado";
                } catch (error) {
                    console.log(`Error buscando el club parent. E: ${error}`);
                    throw new ApolloError("Error conectando con la base de datos")
                }
                idsAutorizados=elProyecto.responsables                
            }

            //Autorización
            const permisosEspeciales=["superadministrador"];

            if(!idsAutorizados.some(id=>id===credencialesUsuario.id) && !permisosEspeciales.some(p=>credencialesUsuario.permisos.includes(p))){
                console.log(`Error de autenticación`);
                throw new AuthenticationError("No autorizado");
            }

            const charProhibidosNombreEvento = /[^ a-zA-ZÀ-ž0-9_():.,-]/;

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

            var idsAutorizados=[];
            if(elEvento.origen==="club"){
                try {
                    var elProyecto:any=await Proyecto.findById(elEvento.idOrigen).exec();                    
                    if(!elProyecto)throw "Proyecto parent no encontrado";
                } catch (error) {
                    console.log(`Error buscando el club parent. E: ${error}`);
                    throw new ApolloError("Error conectando con la base de datos")
                }
                idsAutorizados=elProyecto.responsables                
            }

            //Autorización
            const permisosEspeciales=["superadministrador"];

            if(!idsAutorizados.some(id=>id===credencialesUsuario.id) && !permisosEspeciales.some(p=>credencialesUsuario.permisos.includes(p))){
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
    },

    EventoCalendario:{
        async responsables(parent: any, _:any, __:any){
            var responsables=[];
            console.log(`Buscandole responsables a un evento que tiene idOrigen: ${parent.idOrigen}`);
            if(parent.origen==="club"){
                try {
                    var elProyecto:any=await Proyecto.findById(parent.idOrigen).exec();                    
                    if(!elProyecto)throw "Proyecto parent no encontrado buscando responsables de un evento";
                    console.log(`Recogiendo los responsables del proyecto ${elProyecto.nombre}. Son ${elProyecto.responsables}`);
                    responsables=elProyecto.responsables;
                } catch (error) {
                    console.log(`Error buscando el club parent. E: ${error}`);
                    throw new ApolloError("Error conectando con la base de datos")
                }

            }
            console.log(`Enviando: ${responsables}`);
            return responsables;
        }
    }
}

