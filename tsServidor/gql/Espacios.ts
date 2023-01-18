import { ApolloError, AuthenticationError, gql, UserInputError } from "apollo-server-express";
import { charProhibidosNombreCosa, charProhibidosTexto } from "../model/config";
import { ModeloEspacio as Espacio } from "../model/Espacio";
import { contextoQuery } from "./tsObjetos";
import { ModeloEventoPublico as EventoPublico, ModeloEventoPersonal as EventoPersonal } from "../model/Evento";
import { reScheduleEventosEnmarcadosEnEventoPublicoEliminado } from "./Eventos";
import { permisosEspecialesDefault } from "./Schema";



export const typeDefs = gql`

    type IteracionSemanalEspacio{
        id: ID,
        millisInicio: Int,
        millisFinal:Int,
        idsParticipantesConstantes: [ID],
        diaSemana:Int,
        nombreEspacio:String,
        idAdministradorEspacio:String,
        idEspacio:ID,
    }

    type Espacio{
        id:ID,
        nombre:String,
        descripcion:String,
        idAdministrador:ID,
        iteracionesSemanales:[IteracionSemanalEspacio],
    }

    input InputCrearEspacio{
        nombre:String,
        descripcion:String,
        idAdministrador:String,
    }

    extend type Query{
        espacio(idEspacio:ID!):Espacio,
        todosEspacios:[Espacio],
        espaciosByUsuariosAdmin(idsUsuarios: [ID]!):[Espacio],
        iteracionesSemanalesEspaciosByAdministradores(idsAdministradores: [ID]!): [IteracionSemanalEspacio],
    }

    extend type Mutation{
        crearEspacio(info:InputCrearEspacio):Espacio,
        eliminarEspacio(idEspacio:ID!):Boolean,
        editarNombreEspacio(idEspacio:ID!, nuevoNombre: String!):Espacio,
        editarDescripcionEspacio(idEspacio:ID!, nuevoDescripcion: String!):Espacio,
        
        crearBloqueHorario(idEspacio: ID!, diaSemana: Int!, millisInicio: Int!, millisFinal: Int): IteracionSemanalEspacio,
        eliminarIteracionSemanalEspacio(idEspacio: ID!, idIteracion: ID!):Boolean,
    }
`

export const resolvers = {
    Query: {
        async espacio(_: any, { idEspacio }: any, contexto: contextoQuery) {
            try {
                var elEspacio: any = await Espacio.findById(idEspacio).exec();
            } catch (error) {
                console.log(`Error buscando espacio: ${error}`);
                throw new ApolloError("Error conectando con la base de datos");
            }

            return elEspacio
        },
        async todosEspacios(_: any, __: any, contexto: contextoQuery) {
            try {
                var losEspacios: any = await Espacio.find({}).exec();
            } catch (error) {
                console.log(`Error buscando espacios: ${error}`);
                throw new ApolloError("Error conectando con la base de datos");
            }

            return losEspacios
        },
        async espaciosByUsuariosAdmin(_:any, {idsUsuarios}:any, contexto:contextoQuery){

            try {
                var losEspacios:any=await Espacio.find({idAdministrador: idsUsuarios}).exec();
            } catch (error) {
                console.log(`Error getting espacios : `+ error);
                throw new ApolloError('Error conectando con la base de datos');

            }

            return losEspacios;
        },
        async iteracionesSemanalesEspaciosByAdministradores(_:any, {idsAdministradores}:any, contexto: contextoQuery){
            console.log(`Getting iteraciones semanales para espacios administrados por ${idsAdministradores}`);
            try {
                var losEspacios:any=await Espacio.find({idAdministrador: {$in: idsAdministradores}}).exec();
            } catch (error) {
                console.log(`Error getting espacios de los administradores : `+ error);
                throw new ApolloError('Error conectando con la base de datos');
                
            }

            console.log(`Encontrados ${losEspacios.length} espacios`);

            var lasIteraciones=losEspacios.reduce((acc, espacio)=>acc.concat(espacio.iteracionesSemanales), []);

            console.log(`Encontradas ${lasIteraciones.length} iteraciones`);

            return lasIteraciones;
        }
    },

    Mutation: {
        async crearEspacio(_: any, { info }: any, contexto: contextoQuery) {
            console.log(`Solicitud de crear un nuevo espacio`);
            if (!contexto.usuario || !contexto.usuario.id) {
                console.log(`El usuario no estaba logeado`);
                throw new AuthenticationError("Login requerido");
            }

            const credencialesUsuario = contexto.usuario;
            const permisosAutorizados = ["superadministrador", "maestraVida-profesor"];
            if (!credencialesUsuario.permisos.some(p => permisosAutorizados.includes(p))) {
                console.log(`El usuario no contaba con los permisos necesarios`);
                throw new AuthenticationError("No autorizado");
            }

            var nuevoEspacio: any = new Espacio({
                ...info
            });

            try {
                await nuevoEspacio.save();
            } catch (error) {
                console.log(`Error creando el nuevo espacio: ${error}`);
                throw new ApolloError("Error guardando");
            }

            return nuevoEspacio;
        },
        async eliminarEspacio(_: any, { idEspacio }: any, contexto: contextoQuery) {
            if (!contexto.usuario || !contexto.usuario.id) {
                console.log(`Usuario no logeado`);
                throw new AuthenticationError("Login requerido");
            }

            console.log(`Query de eliminar espaciocon id ${idEspacio}`);

            try {
                var elEspacio: any = await Espacio.findById(idEspacio).exec();
            } catch (error) {
                console.log(`Error buscando el espacio: ${error}`);
                throw new ApolloError("Error conectando con la base de datos");
            }

            //Authorización
            const permisosEspeciales = ["superadministrador"];
            const credencialesUsuario = contexto.usuario;
            if (elEspacio.idAdministrador != credencialesUsuario.id && !credencialesUsuario.permisos.some(p => permisosEspeciales.includes(p))) {
                console.log(`Error de autenticacion eliminando espacio`);
                throw new AuthenticationError("No autorizado");
            }

            try {
                var losEventosAsociados:any=await EventoPublico.find({"idParent":elEspacio.id}).exec();
            } catch (error) {
                console.log(`Error buscando eventos asociados al espacio que se eliminará: ${error}`);
                throw new ApolloError("Error conectando con la base de datos");
            }

            console.log(`Había ${losEventosAsociados.length} eventos publicos asociados a este espacio. Se eliminarán`);
            console.log(`${losEventosAsociados.map(e=>e.horarioInicio)}`);
            const listaIds=losEventosAsociados.map(e=>e._id);

            losEventosAsociados.forEach(async(eventoPublico)=>{
                await reScheduleEventosEnmarcadosEnEventoPublicoEliminado(eventoPublico);
            })

            try {
                await EventoPublico.deleteMany({_id:{$in:listaIds}})
                await Espacio.findByIdAndRemove(idEspacio).exec();
            } catch (error) {
                console.log(`Error removiendo el espacio: ${error}`);
                throw new ApolloError("Error conectando con la base de datos");
            }
            console.log(`Espacio eliminado`);
            return true
        },
        async editarNombreEspacio(_: any, { idEspacio, nuevoNombre }, contexto: contextoQuery) {
            console.log(`Query de cambiar el nombre del espacio con id ${idEspacio}`);
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
                var elEspacio: any = await Espacio.findById(idEspacio).exec();
                if (!elEspacio) {
                    throw "espacio no encontrado"
                }
            }
            catch (error) {
                console.log("Error buscando el espacio a cambiar nombre en la base de datos. E: " + error);
                throw new ApolloError("Error conectando con la base de datos");
            }

            //Authorización
            const permisosEspeciales = ["superadministrador"];
            const credencialesUsuario = contexto.usuario;
            if (elEspacio.idAdministrador != credencialesUsuario.id && !credencialesUsuario.permisos.some(p => permisosEspeciales.includes(p))) {
                console.log(`Error de autenticacion editando nombre de espacio`);
                throw new AuthenticationError("No autorizado");
            }
            elEspacio.nombre = nuevoNombre;

            try {
                await elEspacio.save();
            }
            catch (error) {
                console.log("Error guardando el espacio con nuevo nombre. E: " + error);
                throw new ApolloError("Error conectando con la base de datos");
            }
            console.log(`Nombre cambiado`);
            return elEspacio;
        },
        async editarDescripcionEspacio(_: any, { idEspacio, nuevoDescripcion }, contexto: contextoQuery) {

            console.log(`Query de cambiar la descripcion del espacio con id ${idEspacio}`);
            if (!contexto.usuario || !contexto.usuario.id) {
                console.log(`Sin credenciales de usuario`);
                throw new AuthenticationError("Login requerido");
            }
            if (charProhibidosTexto.test(nuevoDescripcion)) {
                throw new ApolloError("Descripcion ilegal");
            }

            nuevoDescripcion = nuevoDescripcion.trim();

            try {
                var elEspacio: any = await Espacio.findById(idEspacio).exec();
                if (!elEspacio) {
                    throw "espacio no encontrado"
                }
            }
            catch (error) {
                console.log("Error buscando el espacio a cambiar descripción en la base de datos. E: " + error);
                throw new ApolloError("Error conectando con la base de datos");
            }

            //Authorización
            const permisosEspeciales = ["superadministrador"];

            const credencialesUsuario = contexto.usuario;
            if (elEspacio.idAdministrador != credencialesUsuario.id && !credencialesUsuario.permisos.some(p => permisosEspeciales.includes(p))) {
                console.log(`Error de autenticacion`);
                throw new AuthenticationError("No autorizado");
            }

            elEspacio.descripcion = nuevoDescripcion;


            try {
                await elEspacio.save();
            }
            catch (error) {
                console.log("Error guardando el espacio con nueva descripción. E: " + error);
                throw new ApolloError("Error de conexión con la base de datos");
            }
            console.log(`Descripcion cambiado`);

            //Dar esta descripcion a los eventos públicos de este espacio que no la tengan.

            try {
                await EventoPublico.updateMany({idParent:elEspacio.id, descripcion:null}, {$set:{descripcion:elEspacio.descripcion}})
            } catch (error) {
                console.log(`Error updating los eventos publicos children.`);                
            }

            return elEspacio;
        },
        async crearBloqueHorario(_:any, {idEspacio, millisInicio, millisFinal, diaSemana}:any, contexto:contextoQuery){
            console.log('\x1b[35m%s\x1b[0m', `Query de crear iteración semanal de espacio ${idEspacio} con inicio ${millisInicio} y final ${millisFinal} en dia ${diaSemana} de la semana`);
            
            if(!contexto.usuario?.id){
                throw new AuthenticationError('loginRequerido');
            }
            
            const credencialesUsuario=contexto.usuario;
            

            try {
                var elEspacio:any = await Espacio.findById(idEspacio).exec();
                if (!elEspacio) throw 'Espacio no encontrado';
            } catch (error){
                console.log('Error descargando el espacio de la base de datos: '+error)
                throw new ApolloError('Error conectando con la base de datos');
            };

            const esAdministradorEspacio=elEspacio.idAdministrador === credencialesUsuario.id;
            const tienePermisosEspeciales=permisosEspecialesDefault.some(p=>credencialesUsuario.permisos.includes(p));

            if(!esAdministradorEspacio && !tienePermisosEspeciales){
                throw new AuthenticationError("No autorizado");
            }

            var nuevoBloque=elEspacio.iteracionesSemanales.create({millisInicio, millisFinal, diaSemana});

            elEspacio.iteracionesSemanales.push(nuevoBloque);

            try {
                await elEspacio.save();
            } catch (error) {
                console.log(`Error guardando espacio con nuevo bloque de horario : `+ error);
                throw new ApolloError('Error conectando con la base de datos');                
            }

            console.log("Iteración Semanal creada");
            return nuevoBloque;

        },

        async eliminarIteracionSemanalEspacio(_:any, {idEspacio, idIteracion}:any, contexto: contextoQuery){
            console.log('\x1b[35m%s\x1b[0m', `Query de eliminar iteración semanal de espacio ${idEspacio} con id de iteración ${idIteracion}`);
            
            if(!contexto.usuario?.id){
                throw new AuthenticationError('loginRequerido');
            }
            
            const credencialesUsuario=contexto.usuario;
            
            
            try {
                var elEspacio:any=await Espacio.findById(idEspacio).exec();
                if(!elEspacio)throw "Espacio no encontrado";
            } catch (error) {
                console.log(`Error getting espacio : `+ error);
                throw new ApolloError('Error conectando con la base de datos');
                
            }
            const esAdministradorEspacio=elEspacio.idAdministrador===credencialesUsuario.id;
            const tienePermisosEspeciales=permisosEspecialesDefault.some(p=>credencialesUsuario.permisos.includes(p));

            if(!esAdministradorEspacio && !tienePermisosEspeciales){
                throw new AuthenticationError("No autorizado");
            }

            const laIteracion=elEspacio.iteracionesSemanales.find(iteracion=>iteracion.id===idIteracion);

            if(!laIteracion){
                throw new UserInputError("Iteración no encontrada");
            }


            laIteracion.remove();

            try {
                await elEspacio.save();
            } catch (error) {
                console.log(`Error saving espacio tras eliminación de iteración : `+ error);
                throw new ApolloError('Error conectando con la base de datos');
                
            }
            console.log("Eliminada");
            return true;
        }
    },

    
}