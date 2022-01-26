import { ApolloError, AuthenticationError, gql, UserInputError } from "apollo-server-express";
import { contextoQuery } from "./tsObjetos"
import { ModeloEventoPublico as EventoPublico, ModeloEventoPersonal as EventoPersonal } from "../model/Evento";
import { ModeloUsuario as Usuario } from "../model/Usuario";
import { charProhibidosNombreCosa, charProhibidosTexto } from "../model/config";
import { ModeloEspacio as Espacio } from "../model/Espacio";


export const typeDefs = gql`
    
    type InfoEventoCalendario{
        id:ID,
        tipoParent:String,
        nombreParent:String,
        participantes:PublicUsuario
    }

    input InputCrearEventoPublico{
        
        nombre:String,
        descripcion: String,
        horarioInicio:Date,
        horarioFinal:Date,
        idAdministrador:ID,
        limiteDeCupos:Int,
        lugar:ID,
        idParent: ID,
        tipoParent:String
    }

    type EventoPublico{
        id: ID,
        nombre: String,
        descripcion: String,  
        idAdministrador: ID,
        limiteDeCupos:Int,      
        horarioInicio: Date,
        horarioFinal: Date,
        participantes:[String],    
        lugar: ID,
        idParent:ID,
        tipoParent:String,
        
    }

    type EventoPersonal{
        id: ID,        
        idPersona:ID,
        idParent:ID,
        tipoParent:String,        
        nombre: String,
        descripcion: String,          
        horarioInicio: Date,
        horarioFinal: Date,        
        idEventoMarco:ID,
        
    }

    extend type Query{
        eventoPublico(idEvento:ID!):EventoPublico,
        todosEventosPublicos:[EventoPublico],
        eventosPublicosDia(dateInicioDia:Date!):[EventoPublico],
        eventosPublicosEspacio(idEspacio:ID!):[EventoPublico],

        eventoPersonal(idEvento:ID!):EventoPersonal,
    }

    extend type Mutation{
        crearEventoPublico(infoNuevoEvento:InputCrearEventoPublico):EventoPublico,        
        
        eliminarEvento(idEvento:ID!, tipoEvento:String!):Boolean,        
        editarNombreEvento(idEvento:ID!, tipoEvento: String!, nuevoNombre: String!):EventoPublico,
        editarDescripcionEvento(idEvento:ID!, tipoEvento: String!, nuevoDescripcion: String!):EventoPublico,
        setDateFinalEvento(nuevoDate:Date!, tipoEvento: String!, idEvento:ID!):Boolean,
        setDateInicioEvento(nuevoDate:Date!, tipoEvento: String!, idEvento:ID!):Boolean,
        setDateInicioEventoHoldDuration(nuevoDate:Date!, tipoEvento: String!, idEvento:ID!):EventoPublico,
        repetirEventoPeriodicamente(periodoRepetir: String, cantidadRepetir:Int!, idEvento:ID!, tipoEvento:String!):[EventoPublico],


    }
`;
const charProhibidosNombreEvento = /[^ a-zA-ZÀ-ž0-9_():.,-]/;

export const resolvers = {
    Query: {
        async eventoPublico(_: any, { idEvento }: any, contexto: contextoQuery) {
            try {
                var elEventoPublico: any = await EventoPublico.findById(idEvento).exec();
            } catch (error) {
                console.log(`Error buscando evento: ${error}`);
                throw new ApolloError("Error conectando con la base de datos");
            }

            return elEventoPublico
        },
        async todosEventosPublicos(_: any, __: any, contexto: contextoQuery) {
            try {
                var losEventosPublicos: any = await EventoPublico.find({}).exec();
            } catch (error) {
                console.log(`Error buscando eventos publicos: ${error}`);
                throw new ApolloError("Error conectando con la base de datos");
            }

            return losEventosPublicos
        },
        async eventosPublicosDia(_: any, { dateInicioDia }: any, contexto: contextoQuery) {
            console.log(`Query de eventos publicos del día que inicia en ${dateInicioDia}`);
            dateInicioDia=new Date(dateInicioDia);
            const millisInicioDia= dateInicioDia.getTime();
            const millisFinalDia = millisInicioDia + 86400000;

            console.log(`Millis final dia: ${millisFinalDia}`);
            const dateFinalDia=new Date(millisFinalDia);   
            console.log(`Date final dia: ${dateFinalDia}`); 

            console.log(`Hasta ${dateFinalDia}`);
            try {
                var losEventosPublicosDia: any = await EventoPublico.find({ horarioInicio: { $gt: dateInicioDia.getTime(), $lt: dateFinalDia.getTime() } }).exec();
            } catch (error) {
                console.log(`Error buscando eventos publicos: ${error}`);
                throw new ApolloError("Error conectando con la base de datos");
            }
            console.log(`Enviando ${losEventosPublicosDia.length} eventos públicos del día`);
            return losEventosPublicosDia
        },
        async eventosPublicosEspacio(_: any, { idEspacio }: any, contexto: contextoQuery) {
            console.log(`Query de eventos publicos del espacio ${idEspacio}`);
                        
            try {
                var losEventosPublicosEspacio: any = await EventoPublico.find({ "idParent": idEspacio}).exec();
            } catch (error) {
                console.log(`Error buscando eventos publicos: ${error}`);
                throw new ApolloError("Error conectando con la base de datos");
            }
            console.log(`Enviando ${losEventosPublicosEspacio.length} eventos públicos del espacio`);
            return losEventosPublicosEspacio
        },
        


        async eventoPersonal(_: any, { idEvento }: any, contexto: contextoQuery) {
            if (!contexto.usuario || !contexto.usuario.id) {
                console.log(`Usuario no logeado`);
                throw new AuthenticationError("Login requerido");
            }

            const permisosEspeciales = ["superadministrador", "maestraVida-profesor"];
            const credencialesUsuario = contexto.usuario;

            try {
                var elEventoPersonal: any = await EventoPersonal.findById(idEvento).exec();
            } catch (error) {
                console.log(`Error buscando evento: ${error}`);
                throw new ApolloError("Error conectando con la base de datos");
            }

            if (credencialesUsuario.id != elEventoPersonal.idParent && !credencialesUsuario.permisos.some(p => permisosEspeciales.includes(p))) {
                console.log(`Usuario no tenia permisos suficientes`);
                throw new AuthenticationError("No autorizado");
            }

            return elEventoPersonal
        },

    },

    Mutation: {
        async crearEventoPublico(_: any, { infoNuevoEvento }: any, contexto: contextoQuery) {
            console.log(`Query de crear un nuevo evento público`);
            console.log(`Datos: ${JSON.stringify(infoNuevoEvento)}`);
            if (!contexto.usuario || !contexto.usuario.id) {
                console.log(`Usuario no logeado`);
                throw new AuthenticationError("Login requerido");
            }
            

            var nuevoEventoPublico: any = new EventoPublico({
                ...infoNuevoEvento
            })

            if (infoNuevoEvento.tipoParent === 'espacio') {
                console.log(`Es la apertura de un espacio`);
                try {
                    var elEspacioParent: any = await Espacio.findById(infoNuevoEvento.idParent).exec();
                    if (!elEspacioParent) throw "Espacio parent no encontrado"
                } catch (error) {
                    console.log(`Error buscando el espacio parent: ${error}`);
                    throw new ApolloError("Error conectando con la base de datos");
                }


                //Authorización espacio
                const permisosEspeciales = ["superadministrador"];
                const credencialesUsuario = contexto.usuario;
                if (elEspacioParent.idAdministrador != credencialesUsuario.id && !credencialesUsuario.permisos.some(p => permisosEspeciales.includes(p))) {
                    console.log(`Error de autenticacion creando evento público`);
                    throw new AuthenticationError("No autorizado");
                }

                var nombreAutomatico = 'Encuentro de ' + elEspacioParent.nombre;
                nuevoEventoPublico.nombre = nombreAutomatico;

                var descripcionAutomatico = elEspacioParent.descripcion;
                nuevoEventoPublico.descripcion = descripcionAutomatico;

                nuevoEventoPublico.idParent=elEspacioParent.id;
                nuevoEventoPublico.idAdministrador=elEspacioParent.idAdministrador;
            }

            try {
                await nuevoEventoPublico.save();
            } catch (error) {
                console.log(`Error creando el evento público: ${error}`);
                throw new ApolloError("Error conectando con la base de datos");
            }
            console.log(`Evento publico creado`);
            return nuevoEventoPublico;


        },
        async eliminarEvento(_: any, { idEvento, tipoEvento }: any, contexto: contextoQuery) {
            if (!contexto.usuario || !contexto.usuario.id) {
                console.log(`Usuario no logeado`);
                throw new AuthenticationError("Login requerido");
            }

            console.log(`Query de eliminar evento con id ${idEvento}`);

            try {
                var elEvento:any=null;
                if(tipoEvento==='eventoPublico'){
                     elEvento = await EventoPublico.findById(idEvento).exec();
                }
                else{
                    throw "Evento "+tipoEvento+" no reconocido";
                }
                if (!elEvento) {
                    throw "evento no encontrado"
                }
            }
            catch (error) {
                console.log("Error buscando el evento a cambiar nombre en la base de datos. E: " + error);
                throw new ApolloError("Error conectando con la base de datos");
            }

            //Authorización
            const permisosEspeciales = ["superadministrador"];
            const credencialesUsuario = contexto.usuario;
            if (elEvento.idAdministrador != credencialesUsuario.id && !credencialesUsuario.permisos.some(p => permisosEspeciales.includes(p))) {
                console.log(`Error de autenticacion eliminando evento público`);
                throw new AuthenticationError("No autorizado");
            }

            try {
                if(tipoEvento==='eventoPublico'){
                    await EventoPublico.findByIdAndRemove(idEvento).exec();
                }
                else{
                    throw "Evento "+tipoEvento+" no reconocido";
                }
            } catch (error) {
                console.log(`Error removiendo el evento: ${error}`);
                throw new ApolloError("Error conectando con la base de datos");
            }
            console.log(`Evento público eliminado`);
            return true
        },
        async editarNombreEvento(_: any, { idEvento, tipoEvento, nuevoNombre }, contexto: contextoQuery) {
            console.log(`Query de cambiar el nombre del evento con id ${idEvento}`);
            if (!contexto.usuario || !contexto.usuario.id) {
                console.log(`Sin credenciales de usuario`);
                throw new AuthenticationError("Login requerido");
            }
            nuevoNombre = nuevoNombre.trim();
            nuevoNombre = nuevoNombre.replace(/[\n\r]/g, " ");
            nuevoNombre = nuevoNombre.replace(/\s\s+/g, " ");
            if (charProhibidosNombreCosa.test(nuevoNombre)) {
                throw new UserInputError("Nombre ilegal");
            }

            try {
                var elEvento:any=null;
                if(tipoEvento==='eventoPublico'){
                     elEvento = await EventoPublico.findById(idEvento).exec();
                }
                else{
                    throw "Evento "+tipoEvento+" no reconocido";
                }
                if (!elEvento) {
                    throw "eventopublico no encontrado"
                }
            }
            catch (error) {
                console.log("Error buscando el eventopublico a cambiar nombre en la base de datos. E: " + error);
                throw new ApolloError("Error conectando con la base de datos");
            }

            //Authorización
            const permisosEspeciales = ["superadministrador"];
            const credencialesUsuario = contexto.usuario;
            if (elEvento.idAdministrador != credencialesUsuario.id && !credencialesUsuario.permisos.some(p => permisosEspeciales.includes(p))) {
                console.log(`Error de autenticacion editando nombre de eventopublico`);
                throw new AuthenticationError("No autorizado");
            }
            elEvento.nombre = nuevoNombre;

            try {
                await elEvento.save();
            }
            catch (error) {
                console.log("Error guardando el eventopublico con nuevo nombre. E: " + error);
                throw new ApolloError("Error conectando con la base de datos");
            }
            console.log(`Nombre cambiado`);
            return elEvento;
        },
        async editarDescripcionEvento(_: any, { idEvento, tipoEvento, nuevoDescripcion }, contexto: contextoQuery) {
            console.log(`Query de cambiar el descripcion del evento con id ${idEvento}`);
            if (!contexto.usuario || !contexto.usuario.id) {
                console.log(`Sin credenciales de usuario`);
                throw new AuthenticationError("Login requerido");
            }
            if (charProhibidosTexto.test(nuevoDescripcion)) {
                throw new ApolloError("Descripcion ilegal");
            }

            nuevoDescripcion = nuevoDescripcion.trim();

            try {
                var elEvento:any=null;
                if(tipoEvento==='eventoPublico'){
                     elEvento = await EventoPublico.findById(idEvento).exec();
                }
                else{
                    throw "Evento "+tipoEvento+" no reconocido";
                }
                if (!elEvento) {
                    throw "evento no encontrado"
                }
            }
            catch (error) {
                console.log("Error buscando el evento a cambiar descripcion en la base de datos. E: " + error);
                throw new ApolloError("Error conectando con la base de datos");
            }

            //Authorización
            const permisosEspeciales = ["superadministrador"];
            const credencialesUsuario = contexto.usuario;
            if (elEvento.idAdministrador != credencialesUsuario.id && !credencialesUsuario.permisos.some(p => permisosEspeciales.includes(p))) {
                console.log(`Error de autenticacion editando descripcion de evento`);
                throw new AuthenticationError("No autorizado");
            }
            elEvento.descripcion = nuevoDescripcion;

            try {
                await elEvento.save();
            }
            catch (error) {
                console.log("Error guardando el evento con nuevo descripcion. E: " + error);
                throw new ApolloError("Error conectando con la base de datos");
            }
            console.log(`Descripcion cambiado`);
            return elEvento;
        },

        async setDateInicioEvento(_: any, { nuevoDate, tipoEvento, idEvento }, contexto: contextoQuery) {
            console.log(`Query de cambiar el dateInicio del eventopublico con id ${idEvento}`);
            if (!contexto.usuario || !contexto.usuario.id) {
                console.log(`Sin credenciales de usuario`);
                throw new AuthenticationError("Login requerido");
            }

            var elEvento: any = null;
            try {
                if (tipoEvento === 'eventoPublico') {
                    elEvento = await EventoPublico.findById(idEvento).exec();
                }
                else {
                    throw "Tipo de evento '" + tipoEvento + "' no reconocido";
                }
                if (!elEvento) {
                    throw "eventopublico no encontrado"
                }
            }
            catch (error) {
                console.log("Error buscando el eventopublico a cambiar nombre en la base de datos. E: " + error);
                throw new ApolloError("Error conectando con la base de datos");
            }

            //Authorización
            const permisosEspeciales = ["superadministrador"];
            const credencialesUsuario = contexto.usuario;
            if (elEvento.idAdministrador != credencialesUsuario.id && !credencialesUsuario.permisos.some(p => permisosEspeciales.includes(p))) {
                console.log(`Error de autenticacion editando nombre de eventopublico`);
                throw new AuthenticationError("No autorizado");
            }
            elEvento.horarioInicio = nuevoDate;
            const nuevaDuracion = elEvento.horarioFinal - elEvento.horarioInicio;
            console.log(`Quedará con duración: ${nuevaDuracion}`);

            try {
                await elEvento.save();
            }
            catch (error) {
                console.log("Error guardando el eventopublico con nuevo nombre. E: " + error);
                throw new ApolloError("Error conectando con la base de datos");
            }
            console.log(`HorarioInicio cambiado`);
            return true;
        },
        async setDateInicioEventoHoldDuration(_: any, { nuevoDate, tipoEvento, idEvento }, contexto: contextoQuery) {
            console.log(`Query de cambiar el dateInicio del eventopublico con id ${idEvento} keeping duration`);
            if (!contexto.usuario || !contexto.usuario.id) {
                console.log(`Sin credenciales de usuario`);
                throw new AuthenticationError("Login requerido");
            }

            var elEvento: any = null;
            try {
                if (tipoEvento === 'eventoPublico') {
                    elEvento = await EventoPublico.findById(idEvento).exec();
                }
                else {
                    throw "Tipo de evento '" + tipoEvento + "' no reconocido";
                }
                if (!elEvento) {
                    throw "eventopublico no encontrado"
                }
            }
            catch (error) {
                console.log("Error buscando el eventopublico a cambiar nombre en la base de datos. E: " + error);
                throw new ApolloError("Error conectando con la base de datos");
            }

            //Authorización
            const permisosEspeciales = ["superadministrador"];
            const credencialesUsuario = contexto.usuario;
            if (elEvento.idAdministrador != credencialesUsuario.id && !credencialesUsuario.permisos.some(p => permisosEspeciales.includes(p))) {
                console.log(`Error de autenticacion editando nombre de eventopublico`);
                throw new AuthenticationError("No autorizado");
            }
            const currentDuration=elEvento.horarioFinal - elEvento.horarioInicio;
            console.log(`Duraba ${currentDuration}`);

            elEvento.horarioInicio = nuevoDate;
            elEvento.horarioFinal=new Date(new Date(nuevoDate).getTime()+currentDuration);
            console.log(`Final quedará en ${elEvento.horarioFinal}`);

            const nuevaDuracion = elEvento.horarioFinal - elEvento.horarioInicio;
            console.log(`Quedará con duración: ${nuevaDuracion}`);

            try {
                await elEvento.save();
            }
            catch (error) {
                console.log("Error guardando el evento. E: " + error);
                throw new ApolloError("Error conectando con la base de datos");
            }
            console.log(`HorarioInicio cambiado`);
            return elEvento;
        },
        async setDateFinalEvento(_: any, { nuevoDate, tipoEvento, idEvento }, contexto: contextoQuery) {
            console.log(`Query de cambiar el dateFinal del evento con id ${idEvento}`);
            if (!contexto.usuario || !contexto.usuario.id) {
                console.log(`Sin credenciales de usuario`);
                throw new AuthenticationError("Login requerido");
            }

            var elEvento: any = null;
            try {
                if (tipoEvento === 'eventoPublico') {
                    elEvento = await EventoPublico.findById(idEvento).exec();
                }
                else {
                    throw "Tipo de evento '" + tipoEvento + "' no reconocido";
                }
                if (!elEvento) {
                    throw "eventopublico no encontrado"
                }
            }
            catch (error) {
                console.log("Error buscando el eventopublico a cambiar nombre en la base de datos. E: " + error);
                throw new ApolloError("Error conectando con la base de datos");
            }

            //Authorización
            const permisosEspeciales = ["superadministrador"];
            const credencialesUsuario = contexto.usuario;
            if (elEvento.idAdministrador != credencialesUsuario.id && !credencialesUsuario.permisos.some(p => permisosEspeciales.includes(p))) {
                console.log(`Error de autenticacion editando nombre de eventopublico`);
                throw new AuthenticationError("No autorizado");
            }
            elEvento.horarioFinal = nuevoDate;
            const nuevaDuracion = elEvento.horarioFinal - elEvento.horarioInicio;
            console.log(`Quedará con duración: ${nuevaDuracion}`);

            try {
                await elEvento.save();
            }
            catch (error) {
                console.log("Error guardando el eventopublico con nuevo nombre. E: " + error);
                throw new ApolloError("Error conectando con la base de datos");
            }
            console.log(`HorarioFinal cambiado`);
            return true;
        },
        async repetirEventoPeriodicamente(_: any, { periodoRepetir, cantidadRepetir, idEvento, tipoEvento }, contexto: contextoQuery) {
            console.log(`Query de repetir ${periodoRepetir} el evento ${idEvento} ${cantidadRepetir} veces`);
            if (!contexto.usuario || !contexto.usuario.id) {
                console.log(`Sin credenciales de usuario`);
                throw new AuthenticationError("Login requerido");
            }

            if(cantidadRepetir<1 || cantidadRepetir>52){
                throw new UserInputError("Cantidad de repeticiones inválida");
            }
            var periodoMillis=86400000;
            if(periodoRepetir==='semanalmente'){
                periodoMillis=604800000;
            }
            else if(periodoRepetir==='diariamente'){
                periodoMillis=86400000
            }
            else{
                throw new UserInputError("Periodo "+periodoRepetir+" no reconocido");
            }

            var elEvento: any = null;
            try {
                if (tipoEvento === 'eventoPublico') {
                    elEvento = await EventoPublico.findById(idEvento).exec();
                }
                else {
                    throw "Tipo de evento '" + tipoEvento + "' no reconocido";
                }
                if (!elEvento) {
                    throw "evento no encontrado"
                }
            }
            catch (error) {
                console.log("Error buscando el evento a repetir en la base de datos. E: " + error);
                throw new ApolloError("Error conectando con la base de datos");
            }

            //Authorización
            const permisosEspeciales = ["superadministrador"];
            const credencialesUsuario = contexto.usuario;
            if (elEvento.idAdministrador != credencialesUsuario.id && !credencialesUsuario.permisos.some(p => permisosEspeciales.includes(p))) {
                console.log(`Error de autenticacion repitiendo eventopublico`);
                throw new AuthenticationError("No autorizado");
            }

            var arrayNuevosEventos:Array<any>=[];
            var infoNuevosEventos={
                nombre: elEvento.nombre,
                descripcion: elEvento.descripcion,                
                idAdministrador:elEvento.idAdministrador,
                limiteDeCupos:elEvento.limiteDeCupos,
                horarioInicio:elEvento.horarioInicio,
                horarioFinal:elEvento.horarioFinal,
                lugar:elEvento.lugar,
                idParent:elEvento.idParent,
                tipoParent:elEvento.tipoParent,

            }
            

            for (var i=1;i<=cantidadRepetir; i++){
                let desplazamiento=periodoMillis*i;
                let infoNuevoEvento:any={
                    ...infoNuevosEventos
                }
                infoNuevoEvento.horarioInicio=new Date(infoNuevoEvento.horarioInicio).getTime()+desplazamiento;
                infoNuevoEvento.horarioFinal=new Date(infoNuevoEvento.horarioFinal).getTime()+desplazamiento;

                arrayNuevosEventos.push(infoNuevoEvento);
            }
            
            var eventosCreados:any=[]
            try {
                if(tipoEvento==='eventoPublico'){
                    eventosCreados=await EventoPublico.create(arrayNuevosEventos);
                }
            }
            catch (error) {
                console.log("Error guardando los eventos repetidos. E: " + error);
                throw new ApolloError("Error conectando con la base de datos");
            }
            console.log(`Evento repetido, enviando ${eventosCreados.length} repeticiones: `);
            console.log(`${eventosCreados}`);
            return eventosCreados;
        },
    },

}

