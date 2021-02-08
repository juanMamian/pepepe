import { ApolloError, AuthenticationError, gql } from "apollo-server-express";
import { ModeloProyecto as Proyecto } from "../model/Proyecto";
import { ModeloTrabajo as Trabajo } from "../model/Trabajo";
import { contextoQuery } from "./tsObjetos"
import { ModeloUsuario as Usuario } from "../model/Usuario";
import { ModeloForo as Foro } from "../model/Foros/Foro"

export const typeDefs = gql`
    type Proyecto{
        id: ID,
        nombre: String,
        descripcion:String,
        responsables: [String],
        posiblesResponsables:[String],
        personasResponsables:[PublicUsuario]
        personasPosiblesResponsables:[PublicUsuario],
        trabajos: [Trabajo],
        objetivos: [Objetivo],
        idForo:ID,
        idsTrabajos:[ID],
    }
    type Objetivo{
       id: ID,
       nombre: String,
       descripcion:String,
   }
    extend type Query{
        proyectos: [Proyecto!],
        proyecto(idProyecto:ID!): Proyecto
    }
    extend type Mutation{
        editarNombreProyecto(idProyecto: ID!, nuevoNombre: String!):Proyecto,
        editarDescripcionProyecto(idProyecto: ID!, nuevoDescripcion: String!):Proyecto,
        crearProyecto:Proyecto, 
        eliminarProyecto(idProyecto:ID!):Boolean,       
        addResponsableProyecto(idProyecto:ID!, idUsuario:ID!):Proyecto,
        addPosibleResponsableProyecto(idProyecto:ID!, idUsuario:ID!):Proyecto,
        removeResponsableProyecto(idProyecto:ID!, idUsuario:ID!):Proyecto,
        
        crearTrabajoEnProyecto(idProyecto: ID!):ID,
        eliminarTrabajoDeProyecto(idTrabajo:ID!, idProyecto:ID!):Boolean,
        editarNombreTrabajoProyecto(idProyecto:ID!, idTrabajo:ID!, nuevoNombre: String!):Trabajo,
        editarDescripcionTrabajoProyecto(idProyecto:ID!, idTrabajo:ID!, nuevoDescripcion: String!):Trabajo,
        addResponsableTrabajo(idProyecto:ID!, idTrabajo:ID!,idUsuario:ID!):Trabajo,
        removeResponsableTrabajo(idProyecto:ID!, idTrabajo:ID!, idUsuario:ID!):Trabajo,

        crearObjetivoEnProyecto(idProyecto: ID!):Objetivo,
        eliminarObjetivoDeProyecto(idObjetivo:ID!, idProyecto:ID!):Boolean,
        editarNombreObjetivoProyecto(idProyecto:ID!, idObjetivo:ID!, nuevoNombre: String!):Objetivo,
        editarDescripcionObjetivoProyecto(idProyecto:ID!, idObjetivo:ID!, nuevoDescripcion: String!):Objetivo,
    }
    
`;

export const resolvers = {
    Query: {
        proyectos: async function (_: any, args: any, context: contextoQuery) {
            console.log(`enviando lista de todos los proyectos`);
            try {
                var listaP = await Proyecto.find({}).exec();
            } catch (error) {
                console.log(`error buscando la lista de proyectos. E: ${error}`);
                throw new ApolloError("");
            }
            return listaP;
        },
        proyecto: async function (_: any, { idProyecto }: any, context: any) {
            console.log(`Buscando proyecto con id ${idProyecto}`);
            try {
                var elProyecto: any = await Proyecto.findById(idProyecto).exec();
                if (!elProyecto) {
                    throw "proyecto no encontrado"
                }
            } catch (error) {
                console.log(`Error buscando el proyecto. E:${error}`);
                throw new ApolloError("Error en la conexión con la base de datos");
            }
            let tieneForo = true;

            if (!elProyecto.idForo) {
                tieneForo = false;
            }
            else {
                try {
                    let elForo: any = await Foro.findById(elProyecto.idForo).exec();
                    if (!elForo) {
                        console.log(`El foro no existía. Se creará uno nuevo`);
                        tieneForo = false;
                    }
                } catch (error) {
                    console.log(`Error buscando foro en la base de datos. E :${error}`);
                }
            }

            if (!tieneForo) {
                console.log(`El proyecto ${elProyecto.nombre} no tenía foro. Creando con responsables: ${elProyecto.responsables}.`);
                try {
                    var nuevoForo: any = await Foro.create({
                        miembros: elProyecto.responsables,
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
                    elProyecto.idForo = idNuevoForo;
                    await elProyecto.save();
                } catch (error) {
                    console.log(`Error guardando el proyecto`);
                    throw new ApolloError("Error conectando con la base de datos");
                }

            }
            return elProyecto
        }

    },

    Mutation: {
        addPosibleResponsableProyecto: async function (_: any, { idProyecto, idUsuario }: any, contexto: contextoQuery) {
            console.log(`añadiendo usuario ${idUsuario} a la lista de posibles responsables del proyecto ${idProyecto}`);
            let credencialesUsuario = contexto.usuario;
            try {
                var elProyecto: any = await Proyecto.findById(idProyecto).exec();
                if (!elProyecto) {
                    throw "proyecto no encontrado"
                }
            }
            catch (error) {
                console.log("Error buscando el proyecto en la base de datos. E: " + error);
                throw new ApolloError("Error de conexión con la base de datos");
            }

            //Authorización

            if (idUsuario != credencialesUsuario.id && !credencialesUsuario.permisos.includes("superadministrador")) {
                console.log(`Error de autenticacion añadiendo posible responsable del proyecto`);
                throw new AuthenticationError("No autorizado");
            }

            if (elProyecto.posiblesResponsables.includes(idUsuario) || elProyecto.responsables.includes(idUsuario)) {
                console.log(`el usuario ya estaba en la lista`);
                throw new ApolloError("El usuario ya estaba en la lista");
            }
            try {
                var elUsuario = await Usuario.findById(idUsuario).exec();
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
                elProyecto.posiblesResponsables.push(idUsuario);
                await elProyecto.save();
            }
            catch (error) {
                console.log("Error guardando datos en la base de datos. E: " + error);
                throw new ApolloError("Error conectando con la base de datos");
            }
            console.log(`Proyecto guardado`);
            return elProyecto
        },
        addResponsableProyecto: async function (_: any, { idProyecto, idUsuario }: any, contexto: contextoQuery) {
            console.log(`Solicitud de add un usuario con id ${idUsuario} a un proyecto con id ${idProyecto}`);
            let credencialesUsuario = contexto.usuario;

            try {
                var elProyecto: any = await Proyecto.findById(idProyecto).exec();
                if (!elProyecto) {
                    throw "proyecto no encontrado"
                }
            }
            catch (error) {
                console.log("Error buscando el proyecto en la base de datos. E: " + error);
                throw new ApolloError("Error de conexión con la base de datos");
            }

            //Authorización

            if (elProyecto.responsables.length > 0 && !elProyecto.responsables.includes(credencialesUsuario.id) && credencialesUsuario.permisos.includes("superadministrador")) {
                console.log(`Error de autenticacion. Hay ${elProyecto.responsables.length} responsable: ${elProyecto.responsables}`);
                throw new AuthenticationError("No autorizado");
            }

            try {
                var elUsuario = await Usuario.findById(idUsuario).exec();
                if (!elUsuario) {
                    console.log(`No se pudo encontrar al usuario con id ${idUsuario} en la base de datos`);
                    throw new ApolloError("Error buscando al usuario en la base de datos");
                }
            }
            catch (error) {
                console.log("Error buscando al usuario en la base de datos. E: " + error);
                throw new ApolloError("Error conectando con la base de datos");
            }

            if (elProyecto.responsables.includes(idUsuario)) {
                console.log(`El usuario ya era responsable de este proyecto`);
                throw new ApolloError("El usuario ya estaba incluido");
            }


            elProyecto.responsables.push(idUsuario);
            console.log(`Usuario añadido a la lista de responsables`);

            let indexPosibleResponsable = elProyecto.posiblesResponsables.indexOf(idUsuario);
            if (indexPosibleResponsable > -1) {
                console.log(`sacando al usuario ${idUsuario} de la lista de posibles responsables`);
                elProyecto.posiblesResponsables.splice(indexPosibleResponsable, 1);
            }

            try {
                await elProyecto.save();
            }
            catch (error) {
                console.log("Error guardando datos en la base de datos. E: " + error);
                throw new ApolloError("Error conectando con la base de datos");
            }

            //Mirror responsables del proyecto hacia miembros del foro
            try {
                await Foro.findByIdAndUpdate(elProyecto.idForo, { miembros: elProyecto.responsables });
            } catch (error) {
                console.log(`Error mirroring responsables del proyecto hacia miembros del foro. E: ${error}`);
            }
            console.log(`Proyecto guardado`);
            return elProyecto

        },
        removeResponsableProyecto: async function (_: any, { idProyecto, idUsuario }: any, contexto: contextoQuery) {
            console.log(`Solicitud de remover un usuario con id ${idUsuario} a un proyecto con id ${idProyecto}`);
            let credencialesUsuario = contexto.usuario;

            try {
                var elProyecto: any = await Proyecto.findById(idProyecto).exec();
                if (!elProyecto) {
                    throw "proyecto no encontrado"
                }
            }
            catch (error) {
                console.log("Error buscando el proyecto en la base de datos. E: " + error);
                throw new ApolloError("Error de conexión con la base de datos");
            }

            //Authorización

            if (idUsuario != credencialesUsuario.id && !credencialesUsuario.permisos.includes("superadministrador")) {
                console.log(`Error de autenticacion removiendo responsable o posible responsable de proyecto`);
                throw new AuthenticationError("No autorizado");
            }

            try {
                var elUsuario = await Usuario.findById(idUsuario).exec();
                if (!elUsuario) {
                    console.log(`No se pudo encontrar al usuario con id ${idUsuario} en la base de datos`);
                    throw new ApolloError("Error buscando al usuario en la base de datos");
                }
            }
            catch (error) {
                console.log("Error buscando al usuario en la base de datos. E: " + error);
                throw new ApolloError("Error conectando con la base de datos");
            }

            let indexPosibleResponsable = elProyecto.posiblesResponsables.indexOf(idUsuario);

            if (indexPosibleResponsable > -1) {
                console.log(`sacando al usuario ${idUsuario} de la lista de posibles responsables`);
                elProyecto.posiblesResponsables.splice(indexPosibleResponsable, 1);
            }

            let indexResponsable = elProyecto.responsables.indexOf(idUsuario);

            if (indexResponsable > -1) {
                console.log(`sacando al usuario ${idUsuario} de la lista de responsables`);
                elProyecto.responsables.splice(indexResponsable, 1);
            }

            try {
                await elProyecto.save();
            }
            catch (error) {
                console.log("Error guardando datos en la base de datos. E: " + error);
                throw new ApolloError("Error conectando con la base de datos");
            }

            //Mirror responsables del proyecto hacia miembros del foro
            try {
                await Foro.findByIdAndUpdate(elProyecto.idForo, { miembros: elProyecto.responsables });
            } catch (error) {
                console.log(`Error mirroring responsables del proyecto hacia miembros del foro. E: ${error}`);
            }

            console.log(`Proyecto guardado`);
            return elProyecto

        },
        editarNombreProyecto: async function (_: any, { idProyecto, nuevoNombre }: any, contexto: contextoQuery) {
            let credencialesUsuario = contexto.usuario;
            try {
                var elProyecto: any = await Proyecto.findById(idProyecto).exec();
                if (!elProyecto) {
                    throw "proyecto no encontrado"
                }
            }
            catch (error) {
                console.log(`error buscando el proyecto. E: ` + error);
            }

            //Authorización
            let permisosEspeciales = ["superadministrador"];
            if (!elProyecto.responsables.includes(credencialesUsuario.id) && !credencialesUsuario.permisos.some(p => permisosEspeciales.includes(p))) {
                console.log(`Error de autenticacion editando nombre de proyecto`);
                throw new AuthenticationError("No autorizado");
            }

            const charProhibidosNombreProyecto = /[^ a-zA-ZÀ-ž0-9_():.,-]/;

            nuevoNombre = nuevoNombre.replace(/\s\s+/g, " ");
            if (charProhibidosNombreProyecto.test(nuevoNombre)) {
                throw new ApolloError("Nombre ilegal");
            }


            nuevoNombre = nuevoNombre.trim();

            try {
                console.log(`guardando nuevo nombre ${elProyecto.nombre} en la base de datos`);
                var resProyecto: any = await Proyecto.findByIdAndUpdate(idProyecto, { nombre: nuevoNombre }, { new: true }).exec();
            } catch (error) {
                console.log(`error guardando el proyecto con coordenadas manuales: ${error}`);
            }
            console.log(`Nombre guardado`);
            return resProyecto;
        },
        editarDescripcionProyecto: async function (_: any, { idProyecto, nuevoDescripcion }: any, contexto: contextoQuery) {
            console.log(`|||||||||||||||||||`);
            console.log(`Solicitud de set descripcion del proyecto con id ${idProyecto}`);
            let credencialesUsuario = contexto.usuario;
            try {
                var elProyecto: any = await Proyecto.findById(idProyecto).exec();
                if (!elProyecto) {
                    throw "proyecto no encontrado"
                }
            }
            catch (error) {
                console.log(`error buscando el proyecto. E: ` + error);
            }

            //Authorización
            let permisosEspeciales = ["superadministrador"];
            if (!elProyecto.responsables.includes(credencialesUsuario.id) && !credencialesUsuario.permisos.some(p => permisosEspeciales.includes(p))) {
                console.log(`Error de autenticacion editando Descripcion de proyecto`);
                throw new AuthenticationError("No autorizado");
            }

            const charProhibidosDescripcionProyecto = /[^\n\r a-zA-ZÀ-ž0-9_():;.,+¡!¿?@=-]/;

            if (charProhibidosDescripcionProyecto.test(nuevoDescripcion)) {
                throw new ApolloError("Descripcion ilegal");
            }


            nuevoDescripcion = nuevoDescripcion.trim();

            try {
                console.log(`guardando nuevo descripcion ${nuevoDescripcion} en la base de datos`);
                var resProyecto: any = await Proyecto.findByIdAndUpdate(idProyecto, { descripcion: nuevoDescripcion }, { new: true }).exec();
            } catch (error) {
                console.log(`error guardando el proyecto: ${error}`);
            }
            console.log(`Descripcion guardado`);
            return resProyecto;
        },
        async crearProyecto(_: any, args: any, contexto: contextoQuery) {
            console.log(`mutacion`);
            let usuario = contexto.usuario;
            if (!usuario) {
                console.log(`Intento de crear un nuevo proyecto sin nombre de usuario seteado en el contexto`);
                //throw new AuthenticationError("No autorizado");
            }
            if (!usuario.id) {
                console.log(`No había id del usuario creador`);
                throw new ApolloError("No ID");
            }
            console.log(`el usuario ${usuario.username} intenta crear un nuevo proyecto`);
            let elProyecto: any = await new Proyecto({
                responsables: [usuario.id]
            });

            try {
                var nuevoForo: any = await Foro.create({
                    acceso: "privado",
                    miembros: elProyecto.responsables,
                });
                var idNuevoForo = nuevoForo._id;
                await nuevoForo.save();
            } catch (error) {
                console.log(`Error creando el nuevo foro. E: ${error}`);
                throw new ApolloError("Error conectando con la base de datos");
            }
            console.log(`Nuevo foro creado`);

            try {
                elProyecto.idForo = idNuevoForo;
                await elProyecto.save();
            } catch (error) {
                console.log(`error guardando el nuevo proyecto. E: ${error}`);
                throw new ApolloError("error");
            }
            console.log(`proyecto creado`);

            return elProyecto;
        },
        async eliminarProyecto(_: any, { idProyecto }: any, contexto: contextoQuery) {
            console.log(`peticion de eliminar un proyecto con id ${idProyecto}`);
            let credencialesUsuario = contexto.usuario;

            try {
                var elProyecto: any = await Proyecto.findById(idProyecto).exec();
                if (!elProyecto) {
                    throw "proyecto no encontrado"
                }
            }
            catch (error) {
                console.log("Error buscando el proyecto en la base de datos. E: " + error);
                throw new ApolloError("Error conectando con la base de datos");
            }
            //Authorización

            let permisosEspeciales = ["superadministrador"];
            let esUltimoResponsable = (elProyecto.responsables.length == 1 && elProyecto.responsables[0] == credencialesUsuario.id);

            if (!esUltimoResponsable && !credencialesUsuario.permisos.some(p => permisosEspeciales.includes(p))) {
                console.log(`Error de autenticacion editando nombre de proyecto`);
                throw new AuthenticationError("No autorizado");
            }

            try {
                await Proyecto.findByIdAndDelete(idProyecto).exec();
            }
            catch (error) {
                console.log("Error guardando el trabajo creado en el proyecto. E: " + error);
                throw new ApolloError("Error introduciendo el trabajo en el proyecto");
            }

            console.log(`eliminado`);

            return true;
        },
        async crearTrabajoEnProyecto(_: any, { idProyecto }: any, contexto: contextoQuery) {
            console.log(`Peticion de crear un nuevo trabajo en el proyecto con id ${idProyecto}`);

            try {
                var elProyecto: any = await Proyecto.findById(idProyecto).exec();
                if (!elProyecto) {
                    throw "proyecto no encontrado"
                }
            }
            catch (error) {
                console.log("Proyecto no encontrado. E: " + error);
                throw new ApolloError("Error conectandose con la base de datos");
            }

            //Authorización
            let credencialesUsuario = contexto.usuario;
            if (!elProyecto.responsables.includes(credencialesUsuario.id) && !credencialesUsuario.permisos.includes("superadministrador")) {
                console.log(`Error de autenticacion editando nombre de proyecto`);
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


            console.log(`creando un nuevo trabajo desde el proyecto ${elProyecto}`);
            try {
                var nuevoTrabajo: any = await new Trabajo({ idForo: idNuevoForo });
                var idNuevoTrabajo = nuevoTrabajo._id;
                await nuevoTrabajo.save();
            } catch (error) {
                console.log(`Error creando el nuevo trabajo. E: ${error}`);
                throw new ApolloError("Error conectando con la base de datos");
            }


            try {
                elProyecto.idsTrabajos.push(idNuevoTrabajo);
                await elProyecto.save();
            }
            catch (error) {
                console.log("Error guardando el trabajo creado en el proyecto. E: " + error);
                throw new ApolloError("Error introduciendo el trabajo en el proyecto");
            }
            return idNuevoTrabajo;
        },
        async eliminarTrabajoDeProyecto(_: any, { idTrabajo, idProyecto }: any, contexto: contextoQuery) {
            console.log(`peticion de eliminar un trabajo con id ${idTrabajo} de un proyecto con id ${idProyecto}`);
            let credencialesUsuario = contexto.usuario;

            try {
                var elProyecto: any = await Proyecto.findById(idProyecto).exec();
                if (!elProyecto) {
                    throw "proyecto no encontrado"
                }
            }
            catch (error) {
                console.log("Error buscando el proyecto en la base de datos. E: " + error);
                throw new ApolloError("Error conectando con la base de datos");
            }

            //Authorización
            let permisosEspeciales = ["superadministrador"];


            if (!elProyecto.responsables.includes(credencialesUsuario.id) && !credencialesUsuario.permisos.some(p => permisosEspeciales.includes(p))) {
                console.log(`Error de autenticacion editando nombre de proyecto`);
                throw new AuthenticationError("No autorizado");
            }


            try {
                await Trabajo.findByIdAndDelete(idTrabajo);
                await Proyecto.findByIdAndUpdate(idProyecto, { $pull: { idsTrabajos: idTrabajo } });
            }
            catch (error) {
                console.log("Error eliminando trabajo. E: " + error);
                throw new ApolloError("Error introduciendo el trabajo en el proyecto");
            }

            console.log(`eliminado`);

            return true;
        },
        async editarNombreTrabajoProyecto(_: any, { idProyecto, idTrabajo, nuevoNombre }, contexto: contextoQuery) {

            console.log(`cambiando el nombre del trabajo con id ${idTrabajo} del proyecto con id ${idProyecto}`);
            const charProhibidosNombreTrabajo = /[^ a-zA-ZÀ-ž0-9_():.,-]/;

            nuevoNombre = nuevoNombre.replace(/\s\s+/g, " ");
            if (charProhibidosNombreTrabajo.test(nuevoNombre)) {
                throw new ApolloError("Nombre ilegal");
            }

            nuevoNombre = nuevoNombre.trim();

            try {
                var elProyecto: any = await Proyecto.findById(idProyecto).exec();
                if (!elProyecto) {
                    throw "proyecto no encontrado"
                }
            }
            catch (error) {
                console.log("Error buscando el proyecto. E: " + error);
                throw new ApolloError("Erro en la conexión con la base de datos");
            }

            //Authorización
            let credencialesUsuario = contexto.usuario;
            if (!elProyecto.responsables.includes(credencialesUsuario.id) && !credencialesUsuario.permisos.includes("superadministrador")) {
                console.log(`Error de autenticacion editando nombre de proyecto`);
                throw new AuthenticationError("No autorizado");
            }

            try {
                var elTrabajo: any = await Trabajo.findById(idTrabajo).exec();
                if (!elTrabajo) {
                    throw "No existía el trabajo";
                }
                elTrabajo.nombre = nuevoNombre;
                await elTrabajo.save();
            }
            catch (error) {
                console.log("Error cambiando el nombre en la base de datos. E: " + error);
                throw new ApolloError("Error guardando el nombre en la base de datos");
            }

            console.log(`Nombre cambiado`);
            return elTrabajo;
        },
        async editarDescripcionTrabajoProyecto(_: any, { idProyecto, idTrabajo, nuevoDescripcion }, contexto: contextoQuery) {
            console.log(`|||||||||||||||||||`);
            console.log(`Solicitud de set descripcion de trabajo con id ${idTrabajo} del proyecto con id ${elProyecto}`);
            let credencialesUsuario = contexto.usuario;
            try {
                var elProyecto: any = await Proyecto.findById(idProyecto).exec();
                if (!elProyecto) {
                    throw "proyecto no encontrado"
                }
            }
            catch (error) {
                console.log(`error buscando el proyecto. E: ` + error);
            }

            //Authorización
            let permisosEspeciales = ["superadministrador"];
            if (!elProyecto.responsables.includes(credencialesUsuario.id) && !credencialesUsuario.permisos.some(p => permisosEspeciales.includes(p))) {
                console.log(`Error de autenticacion editando Descripcion de proyecto`);
                throw new AuthenticationError("No autorizado");
            }

            const charProhibidosDescripcionTrabajo = /[^\n\r a-zA-ZÀ-ž0-9_():;.,+¡!¿?@=-]/;

            if (charProhibidosDescripcionTrabajo.test(nuevoDescripcion)) {
                throw new ApolloError("Descripcion ilegal");
            }

            nuevoDescripcion = nuevoDescripcion.trim();

            
            try {
                var elTrabajo:any =await Trabajo.findById(idTrabajo).exec();
                if (!elTrabajo) {                
                    throw "Trabajo no existía";
                }
                elTrabajo.descripcion = nuevoDescripcion;
                console.log(`guardando nuevo descripcion ${nuevoDescripcion} en la base de datos`);
                await elTrabajo.save();
            } catch (error) {
                console.log(`error guardando el trabajo modificado: ${error}`);
            }
            console.log(`Descripcion guardado`);
            return elTrabajo;
        },
        addResponsableTrabajo: async function (_: any, { idProyecto, idTrabajo, idUsuario }: any, contexto: contextoQuery) {
            console.log(`Solicitud de add un usuario con id ${idUsuario} a un trabajo de id ${idTrabajo} en un proyecto con id ${idProyecto}`);
            let credencialesUsuario = contexto.usuario;

            try {
                var elProyecto: any = await Proyecto.findById(idProyecto).exec();
                if (!elProyecto) {
                    throw "proyecto no encontrado"
                }
            }
            catch (error) {
                console.log("Error buscando el proyecto en la base de datos. E: " + error);
                throw new ApolloError("Error de conexión con la base de datos");
            }

            //Authorización

            if (idUsuario != credencialesUsuario.id && !credencialesUsuario.permisos.includes("superadministrador")) {
                console.log(`Error de autenticacion editando nombre de proyecto`);
                throw new AuthenticationError("No autorizado");
            }

            try {
                var elUsuario = await Usuario.findById(idUsuario).exec();
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
                var elTrabajo:any=await Trabajo.findById(idTrabajo).exec();
                if(!elTrabajo) throw "Trabajo no existía";
            } catch (error) {
                console.log('Error buscando el trabajo . E: '+error);
                throw new ApolloError('Error conectando con la base de datos');
            }            

            if (elTrabajo.responsables.includes(idUsuario)) {
                console.log(`El usuario ya era responsable de este trabajo`);
                throw new ApolloError("El usuario ya estaba incluido");
            }

            try {
                elTrabajo.responsables.push(idUsuario);
                console.log(`Usuario añadido a la lista de responsables`);
                await elTrabajo.save();
            }
            catch (error) {
                console.log("Error guardando datos en la base de datos. E: " + error);
                throw new ApolloError("Error conectando con la base de datos");
            }
            console.log(`Trabajo guardado`);

            try {
                await Foro.findByIdAndUpdate(elTrabajo.idForo, { miembros: elTrabajo.responsables });
            } catch (error) {
                console.log(`Error mirroring responsables del proyecto hacia miembros del foro. E: ${error}`);
            }

            return elTrabajo;

        },
        removeResponsableTrabajo: async function (_: any, { idProyecto, idTrabajo, idUsuario }: any, contexto: contextoQuery) {
            console.log(`Solicitud de add un usuario con id ${idUsuario} a un trabajo de id ${idTrabajo} en un proyecto con id ${idProyecto}`);
            let credencialesUsuario = contexto.usuario;

            try {
                var elProyecto: any = await Proyecto.findById(idProyecto).exec();
                if (!elProyecto) {
                    throw "proyecto no encontrado"
                }
            }
            catch (error) {
                console.log("Error buscando el proyecto en la base de datos. E: " + error);
                throw new ApolloError("Error de conexión con la base de datos");
            }

            //Authorización

            if (idUsuario != credencialesUsuario.id && !credencialesUsuario.permisos.includes("superadministrador")) {
                console.log(`Error de autenticacion editando nombre de proyecto`);
                throw new AuthenticationError("No autorizado");
            }

            try {
                var elUsuario = await Usuario.findById(idUsuario).exec();
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
                var elTrabajo:any=await Trabajo.findById(idTrabajo).exec();
                if(!elTrabajo) throw "Trabajo no existía";
            } catch (error) {
                console.log('Error buscando el trabajo . E: '+error);
                throw new ApolloError('Error conectando con la base de datos');
            }    

            if (!elTrabajo.responsables.includes(idUsuario)) {
                console.log(`El usuario no era responsable de este trabajo`);
                throw new ApolloError("El usuario no participaba de este trabajo");
            }

            let indexResponsable = elTrabajo.responsables.indexOf(idUsuario);

            if (indexResponsable > -1) {
                console.log(`sacando al usuario ${idUsuario} de la lista de responsables`);
                elTrabajo.responsables.splice(indexResponsable, 1);
            }
            console.log(`Usuario retirado de la lista de responsables`);

            try {
                await elTrabajo.save();
            }
            catch (error) {
                console.log("Error guardando datos en la base de datos. E: " + error);
                throw new ApolloError("Error conectando con la base de datos");
            }
            console.log(`Trabajo guardado`);

            try {
                await Foro.findByIdAndUpdate(elTrabajo.idForo, { miembros: elTrabajo.responsables });
            } catch (error) {
                console.log(`Error mirroring responsables del proyecto hacia miembros del foro. E: ${error}`);
            }
            
            return elTrabajo;

        },
        async crearObjetivoEnProyecto(_: any, { idProyecto }: any, contexto: contextoQuery) {
            console.log(`Peticion de crear un nuevo objetivo en el proyecto con id ${idProyecto}`);


            try {
                var elProyecto: any = await Proyecto.findById(idProyecto).exec();
                if (!elProyecto) {
                    throw "proyecto no encontrado"
                }
            }
            catch (error) {
                console.log("Proyecto no encontrado. E: " + error);
                throw new ApolloError("Error conectandose con la base de datos");
            }

            //Authorización
            let credencialesUsuario = contexto.usuario;
            if (!elProyecto.responsables.includes(credencialesUsuario.id) && !credencialesUsuario.permisos.includes("superadministrador")) {
                console.log(`Error de autenticacion editando nombre de proyecto`);
                throw new AuthenticationError("No autorizado");
            }

            console.log(`creando un nuevo objetivo en el proyecto ${elProyecto}`);

            try {
                var nuevoObjetivo = elProyecto.objetivos.create();
                elProyecto.objetivos.push(nuevoObjetivo);
                await elProyecto.save();
            }
            catch (error) {
                console.log("Error guardando el objetivo creado en el proyecto. E: " + error);
                throw new ApolloError("Error introduciendo el objetivo en el proyecto");
            }
            return nuevoObjetivo;


        },
        async eliminarObjetivoDeProyecto(_: any, { idObjetivo, idProyecto }: any, contexto: contextoQuery) {
            console.log(`peticion de eliminar un objetivo con id ${idObjetivo} de un proyecto con id ${idProyecto}`);
            let credencialesUsuario = contexto.usuario;

            try {
                var elProyecto: any = await Proyecto.findById(idProyecto).exec();
                if (!elProyecto) {
                    throw "proyecto no encontrado"
                }
            }
            catch (error) {
                console.log("Error buscando el proyecto en la base de datos. E: " + error);
                throw new ApolloError("Error conectando con la base de datos");
            }

            //Authorización
            let permisosEspeciales = ["superadministrador"];


            if (!elProyecto.responsables.includes(credencialesUsuario.id) && !credencialesUsuario.permisos.some(p => permisosEspeciales.includes(p))) {
                console.log(`Error de autenticacion editando nombre de proyecto`);
                throw new AuthenticationError("No autorizado");
            }


            try {
                await Proyecto.findByIdAndUpdate(idProyecto, { $pull: { objetivos: { "_id": idObjetivo } } });
            }
            catch (error) {
                console.log("Error guardando el trabajo creado en el proyecto. E: " + error);
                throw new ApolloError("Error introduciendo el trabajo en el proyecto");
            }

            console.log(`eliminado`);

            return true;
        },
        async editarNombreObjetivoProyecto(_: any, { idProyecto, idObjetivo, nuevoNombre }, contexto: contextoQuery) {

            console.log(`cambiando el nombre del objetivo con id ${idObjetivo} del proyecto con id ${idProyecto}`);
            const charProhibidosNombreObjetivo = /[^ a-zA-ZÀ-ž0-9_():.,-]/;

            nuevoNombre = nuevoNombre.replace(/\s\s+/g, " ");
            if (charProhibidosNombreObjetivo.test(nuevoNombre)) {
                throw new ApolloError("Nombre ilegal");
            }

            nuevoNombre = nuevoNombre.trim();

            try {
                var elProyecto: any = await Proyecto.findById(idProyecto).exec();
                if (!elProyecto) {
                    throw "proyecto no encontrado"
                }
            }
            catch (error) {
                console.log("Error buscando el proyecto. E: " + error);
                throw new ApolloError("Erro en la conexión con la base de datos");
            }

            //Authorización
            let credencialesUsuario = contexto.usuario;
            if (!elProyecto.responsables.includes(credencialesUsuario.id) && !credencialesUsuario.permisos.includes("superadministrador")) {
                console.log(`Error de autenticacion editando nombre de proyecto`);
                throw new AuthenticationError("No autorizado");
            }

            try {
                var elObjetivo = elProyecto.objetivos.id(idObjetivo);
                if (!elObjetivo) {
                    console.log(`Objetivo no encontrado en el proyecto`);
                    throw "No existía el objetivo";
                }
                elObjetivo.nombre = nuevoNombre;
            }
            catch (error) {
                console.log("Error cambiando el nombre en la base de datos. E: " + error);
                throw new ApolloError("Error guardando el nombre en la base de datos");
            }
            try {
                await elProyecto.save();
            }
            catch (error) {
                console.log("Error guardando el objetivo creado en el proyecto. E: " + error);
                throw new ApolloError("Error introduciendo el objetivo en el proyecto");
            }
            console.log(`Nombre cambiado`);
            return elObjetivo;
        },
        async editarDescripcionObjetivoProyecto(_: any, { idProyecto, idObjetivo, nuevoDescripcion }, contexto: contextoQuery) {
            console.log(`|||||||||||||||||||`);
            console.log(`Solicitud de set descripcion de objetivo con id ${idObjetivo} del proyecto con id ${elProyecto}`);
            let credencialesUsuario = contexto.usuario;
            try {
                var elProyecto: any = await Proyecto.findById(idProyecto).exec();
                if (!elProyecto) {
                    throw "proyecto no encontrado"
                }
            }
            catch (error) {
                console.log(`error buscando el proyecto. E: ` + error);
            }

            //Authorización
            let permisosEspeciales = ["superadministrador"];
            if (!elProyecto.responsables.includes(credencialesUsuario.id) && !credencialesUsuario.permisos.some(p => permisosEspeciales.includes(p))) {
                console.log(`Error de autenticacion editando Descripcion de proyecto`);
                throw new AuthenticationError("No autorizado");
            }

            const charProhibidosDescripcionObjetivo = /[^\n\r a-zA-ZÀ-ž0-9_():;.,+¡!¿?@=-]/;

            if (charProhibidosDescripcionObjetivo.test(nuevoDescripcion)) {
                throw new ApolloError("Descripcion ilegal");
            }

            nuevoDescripcion = nuevoDescripcion.trim();
            let elObjetivo = elProyecto.objetivos.id(idObjetivo);
            if (!elObjetivo) {
                console.log(`No existía el objetivo`);
                throw new ApolloError("Error conectando con la base de datos");
            }
            elObjetivo.descripcion = nuevoDescripcion;
            try {
                console.log(`guardando nuevo descripcion ${nuevoDescripcion} en la base de datos`);
                await elProyecto.save();
            } catch (error) {
                console.log(`error guardando el proyecto con coordenadas manuales: ${error}`);
            }
            console.log(`Descripcion guardado`);
            return elObjetivo;
        },
    },
    Proyecto: {
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
                console.log(`error buscando a los responsables del proyecto. E: ${error}`);
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
                console.log(`error buscando a los posiblesResponsables del proyecto. E: ${error}`);
                return [];
            }

            return usuariosPosiblesResponsables;
        }, 
    }


}