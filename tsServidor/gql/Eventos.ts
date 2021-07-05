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
        horarioInicio: Date,
        horarioFinal: Date,
        origen:String,
        idOrigen: ID
    }

    extend type Query{
        evento(idEvento:ID!):EventoCalendario,
        eventosSegunOrigen(origen:String!, idOrigen:ID!):[EventoCalendario],
    }

    extend type Mutation{
        crearEventoCalendario(origen: String!, idOrigen:ID!, horarioInicio:Date!, horarioFinal: Date!):EventoCalendario,
        setHorarioInicioEvento(idEvento: ID!, nuevoHorarioInicio: Date!):EventoCalendario,
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
        }
    },

    Mutation:{
        async crearEventoCalendario(_: any, { origen, idOrigen, horarioInicio, horarioFinal }: any, contexto: contextoQuery){
            let credencialesUsuario = contexto.usuario;
            const permisosEspeciales=["superadministrador"]
            
            if ( credencialesUsuario.id==="") {
                console.log(`Error de autenticacion`);
                throw new AuthenticationError("No autorizado");
            }

            console.log(`Creando un evento que va desde ${horarioInicio} hasta ${horarioFinal}`);

            if(horarioFinal<=(horarioInicio+600000)){
                throw new UserInputError("Datos de tiempo inválidos");
            }

            try {
                var nuevoEvento= new Evento({origen, idOrigen, horarioInicio, horarioFinal});
                await nuevoEvento.save();
            } catch (error) {
                console.log(`Error creando el nuevo evento. E: ${error}`);
                throw new ApolloError("Error conectando con la base de datos");
            }
            return nuevoEvento
        },
        async setHorarioInicioEvento(_: any, { idEvento, nuevoHorarioInicio}: any, contexto: contextoQuery){
            let credencialesUsuario = contexto.usuario;

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

            try {
                elEvento.horarioInicio=nuevoHorarioInicio;
                await elEvento.save();
            } catch (error) {
                console.log(`Error guardando el nuevo horario de inicio: ${error}`);
                throw new ApolloError("Error escribiendo en la base de datos");
            }
            return elEvento;
        }
    }
}

