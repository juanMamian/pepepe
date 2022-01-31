import { ApolloError, AuthenticationError, gql, UserInputError } from "apollo-server-express";
import { contextoQuery } from "./tsObjetos"
import { ModeloEventoPublico as EventoPublico, ModeloEventoPersonal as EventoPersonal } from "../model/Evento";
import { ModeloUsuario as Usuario } from "../model/Usuario";
import { charProhibidosNombreCosa, charProhibidosTexto } from "../model/config";
import { ModeloEspacio as Espacio } from "../model/Espacio";
import { ModeloNodoSolidaridad as NodoSolidaridad } from "../model/atlasSolidaridad/NodoSolidaridad";
import { getResponsablesAmplioNodo } from "./AtlasSolidaridad";


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
    input InputCrearEventoPersonal{        
        idPersona:ID!,
        idParent: ID,
        tipoParent:String,
        nombre:String,
        descripcion: String,
        horarioInicio:Date,
        horarioFinal:Date,
        idEventoMarco:ID,
        lugar:ID,

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
        lugar:ID,
    }

    union Evento = EventoPersonal | EventoPublico

    extend type Query{
        eventoPublico(idEvento:ID!):EventoPublico,
        todosEventosPublicos:[EventoPublico],
        eventosPublicosDia(dateInicioDia:Date!):[EventoPublico],
        eventosPublicosEspacio(idEspacio:ID!):[EventoPublico],

        eventosPersonalesDia(dateInicioDia:Date!, idUsuario:ID!):[EventoPersonal],

        eventoPersonal(idEvento:ID!):EventoPersonal,
    }

    extend type Mutation{
        crearEventoPublico(infoNuevoEvento:InputCrearEventoPublico):EventoPublico,        

        crearEventoPersonal(infoEventoPersonal:InputCrearEventoPersonal):EventoPersonal,
        
        eliminarEvento(idEvento:ID!, tipoEvento:String!):Boolean,        
        editarNombreEvento(idEvento:ID!, tipoEvento: String!, nuevoNombre: String!):Evento,
        editarDescripcionEvento(idEvento:ID!, tipoEvento: String!, nuevoDescripcion: String!):Evento,
        setDateFinalEvento(nuevoDate:Date!, tipoEvento: String!, idEvento:ID!):Evento,
        setDateInicioEvento(nuevoDate:Date!, tipoEvento: String!, idEvento:ID!):Evento,
        setDateInicioEventoHoldDuration(nuevoDate:Date!, tipoEvento: String!, idEvento:ID!):Evento,
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
            dateInicioDia = new Date(dateInicioDia);
            const millisInicioDia = dateInicioDia.getTime();
            const millisFinalDia = millisInicioDia + 86400000;

            const dateFinalDia = new Date(millisFinalDia);

            try {
                var losEventosPublicosDia: any = await EventoPublico.find({ horarioInicio: { $gt: dateInicioDia.getTime(), $lt: dateFinalDia.getTime() } }).exec();
            } catch (error) {
                console.log(`Error buscando eventos publicos: ${error}`);
                throw new ApolloError("Error conectando con la base de datos");
            }
            return losEventosPublicosDia
        },
        async eventosPublicosEspacio(_: any, { idEspacio }: any, contexto: contextoQuery) {
            console.log(`Query de eventos publicos del espacio ${idEspacio}`);

            try {
                var losEventosPublicosEspacio: any = await EventoPublico.find({ "idParent": idEspacio }).exec();
            } catch (error) {
                console.log(`Error buscando eventos publicos: ${error}`);
                throw new ApolloError("Error conectando con la base de datos");
            }
            console.log(`Enviando ${losEventosPublicosEspacio.length} eventos públicos del espacio`);
            return losEventosPublicosEspacio
        },

        async eventosPersonalesDia(_: any, { dateInicioDia, idUsuario }: any, contexto: contextoQuery) {
            dateInicioDia = new Date(dateInicioDia);
            const millisInicioDia = dateInicioDia.getTime();
            const millisFinalDia = millisInicioDia + 86400000;

            const dateFinalDia = new Date(millisFinalDia);

            try {
                var losEventosPersonalesDia: any = await EventoPersonal.find({ horarioInicio: { $gt: dateInicioDia.getTime(), $lt: dateFinalDia.getTime() }, idPersona: idUsuario }).exec();
            } catch (error) {
                console.log(`Error buscando eventos personales: ${error}`);
                throw new ApolloError("Error conectando con la base de datos");
            }
            return losEventosPersonalesDia
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

                nuevoEventoPublico.idParent = elEspacioParent.id;
                nuevoEventoPublico.idAdministrador = elEspacioParent.idAdministrador;
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

        async crearEventoPersonal(_: any, { infoEventoPersonal }: any, contexto: contextoQuery) {
            console.log(`Query de crear un nuevo evento personal`);
            console.log(`Datos: ${JSON.stringify(infoEventoPersonal)}`);
            if (!contexto.usuario || !contexto.usuario.id) {
                console.log(`Usuario no logeado`);
                throw new AuthenticationError("Login requerido");
            }


            var nuevoEventoPersonal: any = new EventoPersonal({
                ...infoEventoPersonal
            })



            if (infoEventoPersonal.idEventoMarco) {
                console.log(`Está enmarcado en el evento ${infoEventoPersonal.idEventoMarco}`);

                try {
                    var elEventoMarco: any = await EventoPublico.findById(infoEventoPersonal.idEventoMarco).exec();
                    if (!elEventoMarco) throw "Evento marco no encontrado"
                } catch (error) {
                    console.log(`Error buscando evento marco: ${error}`);
                    throw new ApolloError("Error conectando con la base de datos");
                }

                if (!infoEventoPersonal.nombre) {
                    var nombreAutomatico = 'Asistir a ' + elEventoMarco.nombre;
                    nuevoEventoPersonal.nombre = nombreAutomatico;
                }

                if (!infoEventoPersonal.horarioInicio) {
                    nuevoEventoPersonal.horarioInicio = elEventoMarco.horarioInicio;
                }
                if (!infoEventoPersonal.horarioFinal) {
                    nuevoEventoPersonal.horarioFinal = elEventoMarco.horarioFinal;
                }
                nuevoEventoPersonal.lugar = elEventoMarco.lugar;

                //Validar horarios.

                if (infoEventoPersonal.horarioInicio < elEventoMarco.horarioInicio || infoEventoPersonal.horarioFinal > elEventoMarco.horarioFinal) {
                    throw new UserInputError("El evento debe estar dentro del evento marco");
                }
            }

            if (infoEventoPersonal.idParent) {

                var elParent: any = null;
                try {
                    console.log(`Es la ejecución de un nodoSolidaridad`);

                    if (infoEventoPersonal.tipoParent === 'nodoSolidaridad') {
                        elParent = await NodoSolidaridad.findById(infoEventoPersonal.idParent)
                    }
                    else {
                        console.log(`Tipo ${infoEventoPersonal.tipoParent} no reconocido`);
                        throw new UserInputError("Tipo de evento no conocido");
                    }
                } catch (error) {
                    console.log(`Error buscando el parent del evento: ${error}`);
                    throw new ApolloError("Error conectando con la base de datos");
                }



                //Authorización nodoSolidaridad
                const responsablesAmplioNodo = await getResponsablesAmplioNodo(elParent);
                const permisosEspeciales = ["superadministrador"];
                const credencialesUsuario = contexto.usuario;
                if (!responsablesAmplioNodo.includes(credencialesUsuario.id) && !credencialesUsuario.permisos.some(p => permisosEspeciales.includes(p))) {
                    console.log(`Error de autenticacion creando evento personal`);
                    throw new AuthenticationError("No autorizado");
                }

                if (!infoEventoPersonal.nombre) {
                    var nombreAutomatico = 'Realización de ' + elParent.nombre;
                    nuevoEventoPersonal.nombre = nombreAutomatico;
                }
                if (!infoEventoPersonal.descripcion) {
                    nuevoEventoPersonal.descripcion = elParent.descripcion
                }

                nuevoEventoPersonal.idParent = elParent.id;
                nuevoEventoPersonal.idAdministrador = elParent.idAdministrador;
            }


            try {
                await nuevoEventoPersonal.save();
            } catch (error) {
                console.log(`Error creando el evento personal: ${error}`);
                throw new ApolloError("Error conectando con la base de datos");
            }
            console.log(`Evento personal creado`);
            return nuevoEventoPersonal;
        },

        async eliminarEvento(_: any, { idEvento, tipoEvento }: any, contexto: contextoQuery) {
            if (!contexto.usuario || !contexto.usuario.id) {
                console.log(`Usuario no logeado`);
                throw new AuthenticationError("Login requerido");
            }

            console.log(`Query de eliminar evento con id ${idEvento}`);

            try {
                var elEvento: any = null;
                if (tipoEvento === 'eventoPublico') {
                    elEvento = await EventoPublico.findById(idEvento).exec();
                }
                else if (tipoEvento === 'eventoPersonal') {
                    elEvento = await EventoPersonal.findById(idEvento).exec();
                }
                else {
                    throw "Evento " + tipoEvento + " no reconocido";
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
            var usuarioAdministrador = false;
            if (tipoEvento === 'eventoPublico') {
                usuarioAdministrador = elEvento.idAdministrador === credencialesUsuario.id
            }
            else if (tipoEvento === 'eventoPersonal') {
                usuarioAdministrador = elEvento.idPersona === credencialesUsuario.id
            }
            else {
                throw new UserInputError("Tipo de evento no reconocido: " + tipoEvento);
            }
            if (!usuarioAdministrador && !credencialesUsuario.permisos.some(p => permisosEspeciales.includes(p))) {
                console.log(`Error de autenticacion`);
                throw new AuthenticationError("No autorizado");
            }

            try {
                if (tipoEvento === 'eventoPublico') {
                    await EventoPublico.findByIdAndRemove(idEvento).exec();
                }
                else if (tipoEvento === 'eventoPersonal') {
                    await EventoPersonal.findByIdAndRemove(idEvento).exec();
                }
                else {
                    throw "Evento " + tipoEvento + " no reconocido";
                }
            } catch (error) {
                console.log(`Error removiendo el evento: ${error}`);
                throw new ApolloError("Error conectando con la base de datos");
            }
            console.log(`Evento eliminado`);
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
                var elEvento: any = null;
                if (tipoEvento === 'eventoPublico') {
                    elEvento = await EventoPublico.findById(idEvento).exec();
                }
                else if (tipoEvento === 'eventoPersonal') {
                    elEvento = await EventoPersonal.findById(idEvento).exec();
                }
                else {
                    throw "Evento " + tipoEvento + " no reconocido";
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
            var usuarioAdministrador = false;
            if (tipoEvento === 'eventoPublico') {
                usuarioAdministrador = elEvento.idAdministrador === credencialesUsuario.id
            }
            else if (tipoEvento === 'eventoPersonal') {
                usuarioAdministrador = elEvento.idPersona === credencialesUsuario.id
            }
            else {
                throw new UserInputError("Tipo de evento no reconocido: " + tipoEvento);
            }
            if (!usuarioAdministrador && !credencialesUsuario.permisos.some(p => permisosEspeciales.includes(p))) {
                console.log(`Error de autenticacion`);
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
                var elEvento: any = null;
                if (tipoEvento === 'eventoPublico') {
                    elEvento = await EventoPublico.findById(idEvento).exec();
                }
                else if (tipoEvento === 'eventoPersonal') {
                    elEvento = await EventoPersonal.findById(idEvento).exec();
                }
                else {
                    throw "Evento " + tipoEvento + " no reconocido";
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
            var usuarioAdministrador = false;
            if (tipoEvento === 'eventoPublico') {
                usuarioAdministrador = elEvento.idAdministrador === credencialesUsuario.id
            }
            else if (tipoEvento === 'eventoPersonal') {
                usuarioAdministrador = elEvento.idPersona === credencialesUsuario.id
            }
            else {
                throw new UserInputError("Tipo de evento no reconocido: " + tipoEvento);
            }
            if (!usuarioAdministrador && !credencialesUsuario.permisos.some(p => permisosEspeciales.includes(p))) {
                console.log(`Error de autenticacion`);
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
                else if (tipoEvento === 'eventoPersonal') {
                    elEvento = await EventoPersonal.findById(idEvento).exec();
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
            var usuarioAdministrador = false;
            if (tipoEvento === 'eventoPublico') {
                usuarioAdministrador = elEvento.idAdministrador === credencialesUsuario.id
            }
            else if (tipoEvento === 'eventoPersonal') {
                usuarioAdministrador = elEvento.idPersona === credencialesUsuario.id
            }
            else {
                throw new UserInputError("Tipo de evento no reconocido: " + tipoEvento);
            }
            if (!usuarioAdministrador && !credencialesUsuario.permisos.some(p => permisosEspeciales.includes(p))) {
                console.log(`Error de autenticacion`);
                throw new AuthenticationError("No autorizado");
            }
            elEvento.horarioInicio = nuevoDate;

            if (elEvento.idEventoMarco) {
                console.log(`Tenia evento marco`);
                try {
                    var elEventoMarco: any = await EventoPublico.findById(elEvento.idEventoMarco).exec();
                } catch (error) {
                    console.log(`Error buscando evento marco`);
                    throw new ApolloError("Error conectando con la base de datos");
                }
                console.log(`Comparando ${nuevoDate} con ${elEventoMarco.horarioInicio}`);
                if (new Date(nuevoDate) < new Date(elEventoMarco.horarioInicio) || new Date(nuevoDate) > new Date(elEventoMarco.horarioFinal)) {
                    throw new UserInputError("El evento no puede tener horario por fuera de " + elEventoMarco.nombre);
                }
                if (elEvento.horarioFinal > new Date(elEventoMarco.horarioFinal)) {
                    elEvento.horarioFinal = elEventoMarco.horarioFinal
                }
            }



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
            console.log(`Query de cambiar el dateInicio del ${tipoEvento} con id ${idEvento} keeping duration`);
            if (!contexto.usuario || !contexto.usuario.id) {
                console.log(`Sin credenciales de usuario`);
                throw new AuthenticationError("Login requerido");
            }

            var elEvento: any = null;
            try {
                if (tipoEvento === 'eventoPublico') {
                    elEvento = await EventoPublico.findById(idEvento).exec();
                }
                else if (tipoEvento === 'eventoPersonal') {
                    elEvento = await EventoPersonal.findById(idEvento).exec();
                }
                else {
                    throw "Tipo de evento '" + tipoEvento + "' no reconocido";
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
            var usuarioAdministrador = false;
            if (tipoEvento === 'eventoPublico') {
                usuarioAdministrador = elEvento.idAdministrador === credencialesUsuario.id
            }
            else if (tipoEvento === 'eventoPersonal') {
                usuarioAdministrador = elEvento.idPersona === credencialesUsuario.id
            }
            else {
                throw new UserInputError("Tipo de evento no reconocido: " + tipoEvento);
            }
            if (!usuarioAdministrador && !credencialesUsuario.permisos.some(p => permisosEspeciales.includes(p))) {
                console.log(`Error de autenticacion`);
                throw new AuthenticationError("No autorizado");
            }

            const currentDuration = elEvento.horarioFinal - elEvento.horarioInicio;
            elEvento.horarioInicio = nuevoDate;
            elEvento.horarioFinal = new Date(new Date(nuevoDate).getTime() + currentDuration);

            if (elEvento.idEventoMarco) {
                console.log(`Tenia evento marco`);
                try {
                    var elEventoMarco: any = await EventoPublico.findById(elEvento.idEventoMarco).exec();
                } catch (error) {
                    console.log(`Error buscando evento marco`);
                    throw new ApolloError("Error conectando con la base de datos");
                }
                console.log(`Comparando ${nuevoDate} con ${elEventoMarco.horarioInicio}`);
                if (new Date(nuevoDate) < new Date(elEventoMarco.horarioInicio) || new Date(nuevoDate) > new Date(elEventoMarco.horarioFinal)) {
                    throw new UserInputError("El evento no puede tener horario por fuera de " + elEventoMarco.nombre);
                }
                if (elEvento.horarioFinal > new Date(elEventoMarco.horarioFinal)) {
                    elEvento.horarioFinal = elEventoMarco.horarioFinal
                }
            }




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
                else if (tipoEvento === 'eventoPersonal') {
                    elEvento = await EventoPersonal.findById(idEvento).exec();
                }
                else {
                    throw "Tipo de evento '" + tipoEvento + "' no reconocido";
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
            var usuarioAdministrador = false;
            if (tipoEvento === 'eventoPublico') {
                usuarioAdministrador = elEvento.idAdministrador === credencialesUsuario.id
            }
            else if (tipoEvento === 'eventoPersonal') {
                usuarioAdministrador = elEvento.idPersona === credencialesUsuario.id;
            }
            else {
                throw new UserInputError("Tipo de evento no reconocido: " + tipoEvento);
            }
            if (!usuarioAdministrador && !credencialesUsuario.permisos.some(p => permisosEspeciales.includes(p))) {
                console.log(`Error de autenticacion`);
                throw new AuthenticationError("No autorizado");
            }
            elEvento.horarioFinal = nuevoDate;

            if (elEvento.idEventoMarco) {
                console.log(`Tenia evento marco`);
                try {
                    var elEventoMarco: any = await EventoPublico.findById(elEvento.idEventoMarco).exec();
                } catch (error) {
                    console.log(`Error buscando evento marco`);
                    throw new ApolloError("Error conectando con la base de datos");
                }

                if (new Date(nuevoDate) < new Date(elEventoMarco.horarioInicio) || new Date(nuevoDate) > new Date(elEventoMarco.horarioFinal)) {
                    throw new UserInputError("El evento no puede tener horario por fuera de " + elEventoMarco.nombre);
                }

            }

            try {
                await elEvento.save();
            }
            catch (error) {
                console.log("Error guardando el eventopublico con nuevo nombre. E: " + error);
                throw new ApolloError("Error conectando con la base de datos");
            }
            console.log(`HorarioFinal cambiado`);
            return elEvento;
        },
        async repetirEventoPeriodicamente(_: any, { periodoRepetir, cantidadRepetir, idEvento, tipoEvento }, contexto: contextoQuery) {
            console.log(`Query de repetir ${periodoRepetir} el evento ${idEvento} ${cantidadRepetir} veces`);
            if (!contexto.usuario || !contexto.usuario.id) {
                console.log(`Sin credenciales de usuario`);
                throw new AuthenticationError("Login requerido");
            }

            if (cantidadRepetir < 1 || cantidadRepetir > 52) {
                throw new UserInputError("Cantidad de repeticiones inválida");
            }
            var periodoMillis = 86400000;
            if (periodoRepetir === 'semanalmente') {
                periodoMillis = 604800000;
            }
            else if (periodoRepetir === 'diariamente') {
                periodoMillis = 86400000
            }
            else {
                throw new UserInputError("Periodo " + periodoRepetir + " no reconocido");
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
            var usuarioAdministrador = false;
            if (tipoEvento === 'eventoPublico') {
                usuarioAdministrador = elEvento.idAdministrador === credencialesUsuario.id
            }
            else if (tipoEvento === 'eventoPersonal') {
                usuarioAdministrador = elEvento.idPersona === credencialesUsuario.id
            }
            else {
                throw new UserInputError("Tipo de evento no reconocido: " + tipoEvento);
            }
            if (!usuarioAdministrador && !credencialesUsuario.permisos.some(p => permisosEspeciales.includes(p))) {
                console.log(`Error de autenticacion`);
                throw new AuthenticationError("No autorizado");
            }

            var arrayNuevosEventos: Array<any> = [];
            var infoNuevosEventos = {
                nombre: elEvento.nombre,
                descripcion: elEvento.descripcion,
                idAdministrador: elEvento.idAdministrador,
                limiteDeCupos: elEvento.limiteDeCupos,
                horarioInicio: elEvento.horarioInicio,
                horarioFinal: elEvento.horarioFinal,
                lugar: elEvento.lugar,
                idParent: elEvento.idParent,
                tipoParent: elEvento.tipoParent,

            }


            for (var i = 1; i <= cantidadRepetir; i++) {
                let desplazamiento = periodoMillis * i;
                let infoNuevoEvento: any = {
                    ...infoNuevosEventos
                }
                infoNuevoEvento.horarioInicio = new Date(infoNuevoEvento.horarioInicio).getTime() + desplazamiento;
                infoNuevoEvento.horarioFinal = new Date(infoNuevoEvento.horarioFinal).getTime() + desplazamiento;

                arrayNuevosEventos.push(infoNuevoEvento);
            }

            var eventosCreados: any = []
            try {
                if (tipoEvento === 'eventoPublico') {
                    eventosCreados = await EventoPublico.create(arrayNuevosEventos);
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

    Evento: {
        __resolveType(evento: any, _: any, __: any) {
            if (evento.idPersona) {
                return "EventoPersonal"
            }

            return "EventoPublico"

        }
    }

}

