import { ApolloError, AuthenticationError, gql, UserInputError } from "apollo-server-express";
import { charProhibidosNombreCosa, charProhibidosTexto } from "../model/config";
import { ModeloEspacio as Espacio } from "../model/Espacio";
import { contextoQuery } from "./tsObjetos";
import { ModeloEventoPublico as EventoPublico, ModeloEventoPersonal as EventoPersonal } from "../model/Evento";
import { reScheduleEventosEnmarcadosEnEventoPublicoEliminado } from "./Eventos";

export const typeDefs = gql`
    type Espacio{
        id:ID,
        nombre:String,
        descripcion:String,
        idAdministrador:ID
    }

    input InputCrearEspacio{
        nombre:String,
        descripcion:String,
        idAdministrador:String,
    }

    extend type Query{
        espacio(idEspacio:ID!):Espacio,
        todosEspacios:[Espacio],
    }

    extend type Mutation{
        crearEspacio(info:InputCrearEspacio):Espacio,
        eliminarEspacio(idEspacio:ID!):Boolean,
        editarNombreEspacio(idEspacio:ID!, nuevoNombre: String!):Espacio,
        editarDescripcionEspacio(idEspacio:ID!, nuevoDescripcion: String!):Espacio,
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
            return elEspacio;
        },
    }
}