import { ApolloError, AuthenticationError, gql } from "apollo-server-express";
import {ModeloProyecto as Proyecto} from "../model/Proyecto";
import {ModeloTrabajo as Trabajo} from "../model/Trabajo";
import { contextoQuery } from "./tsObjetos"
import {ModeloUsuario as Usuario} from "../model/Usuario";

export const typeDefs = gql`
    type Proyecto{
        id: ID,
        nombre: String,
        responsables: [PublicUsuario],
        posiblesResponsables:[PublicUsuario],
        trabajos: [Trabajo],
        objetivos: [Objetivo]
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
        crearProyecto:Proyecto,        
        addResponsableProyecto(idProyecto:ID!, idUsuario:ID!):Proyecto,
        addPosibleResponsableProyecto(idProyecto:ID!, idUsuario:ID!):Proyecto,
        removeResponsableProyecto(idProyecto:ID!, idUsuario:ID!):Proyecto,
        
        crearTrabajoEnProyecto(idProyecto: ID!):Trabajo,
        eliminarTrabajoDeProyecto(idTrabajo:ID!, idProyecto:ID!):Boolean,
        cambiarNombreTrabajo(idProyecto:ID!, idTrabajo:ID!, nuevoNombre: String!):Trabajo,
        cambiarDescripcionTrabajo(idProyecto:ID!, idTrabajo:ID!, nuevaDescripcion: String!):Trabajo,
        addResponsableTrabajo(idProyecto:ID!, idTrabajo:ID!,idUsuario:ID!):Trabajo,
        removeResponsableTrabajo(idProyecto:ID!, idTrabajo:ID!, idUsuario:ID!):Trabajo,



        crearObjetivoEnProyecto(idProyecto: ID!):Objetivo,
        eliminarObjetivoDeProyecto(idObjetivo:ID!, idProyecto:ID!):Boolean,
        cambiarNombreObjetivo(idProyecto:ID!, idObjetivo:ID!, nuevoNombre: String!):Objetivo,
        cambiarDescripcionObjetivo(idProyecto:ID!, idObjetivo:ID!, nuevaDescripcion: String!):Objetivo,

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
                var elProyecto:any = await Proyecto.findById(idProyecto).exec();
                if(!elProyecto){
                    throw "proyecto no encontrado"
                }
            } catch (error) {
                console.log(`Error buscando el proyecto. E:${error}`);
                throw new ApolloError("Error en la conexión con la base de datos");
            }
            return elProyecto
        }

    },

    Mutation: {
        addPosibleResponsableProyecto: async function (_: any, { idProyecto, idUsuario }: any, contexto: contextoQuery) {
            console.log(`añadiendo usuario ${idUsuario} a la lista de posibles responsables del proyecto ${idProyecto}`);
            let credencialesUsuario = contexto.usuario;
            try {
                var elProyecto:any = await Proyecto.findById(idProyecto).exec();
                if(!elProyecto){
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

            if (elProyecto.posiblesResponsables.includes(idUsuario)) {
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
                var elProyecto:any = await Proyecto.findById(idProyecto).exec();
                if(!elProyecto){
                    throw "proyecto no encontrado"
                }
            }
            catch (error) {
                console.log("Error buscando el proyecto en la base de datos. E: " + error);
                throw new ApolloError("Error de conexión con la base de datos");
            }

            //Authorización

            if (elProyecto.responsables.length>0 && !elProyecto.responsables.includes(credencialesUsuario.id) && credencialesUsuario.permisos.includes("superadministrador")) {
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
            console.log(`Proyecto guardado`);
            return elProyecto

        },
        removeResponsableProyecto: async function (_: any, { idProyecto, idUsuario }: any, contexto: contextoQuery) {
            console.log(`Solicitud de remover un usuario con id ${idUsuario} a un proyecto con id ${idProyecto}`);
            let credencialesUsuario = contexto.usuario;

            try {
                var elProyecto:any = await Proyecto.findById(idProyecto).exec();
                if(!elProyecto){
                    throw "proyecto no encontrado"
                }
            }
            catch (error) {
                console.log("Error buscando el proyecto en la base de datos. E: " + error);
                throw new ApolloError("Error de conexión con la base de datos");
            }

            //Authorización

            if (idUsuario!=credencialesUsuario.id && !credencialesUsuario.permisos.includes("superadministrador")) {
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
            console.log(`Proyecto guardado`);
            return elProyecto

        },
        editarNombreProyecto: async function (_: any, { idProyecto, nuevoNombre }: any, contexto: contextoQuery) {
            let credencialesUsuario = contexto.usuario;
            try {
                var elProyecto:any = await Proyecto.findById(idProyecto).exec();
                if(!elProyecto){
                    throw "proyecto no encontrado"
                }
            }
            catch (error) {
                console.log(`error buscando el proyecto. E: ` + error);
            }

            //Authorización

            if (!elProyecto.responsables.includes(credencialesUsuario.id) && !credencialesUsuario.permisos.includes("superadministrador")) {
                console.log(`Error de autenticacion editando nombre de proyecto`);
                throw new AuthenticationError("No autorizado");
            }

            var charProhibidosNombreProyecto = /[^ a-zA-ZÀ-ž0-9_():.,-]/g;

            nuevoNombre = nuevoNombre.replace(/\s\s+/g, " ");
            if (charProhibidosNombreProyecto.test(nuevoNombre)) {
                throw new ApolloError("Nombre ilegal");
            }


            elProyecto.nombre = nuevoNombre.trim();

            try {
                console.log(`guardando nuevo nombre ${elProyecto.nombre} en la base de datos`);
                await elProyecto.save();
            } catch (error) {
                console.log(`error guardando el proyecto con coordenadas manuales: ${error}`);
            }
            return elProyecto
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
            let elProyecto = await new Proyecto({
                responsables: [usuario.id]
            });

            try {
                await elProyecto.save();
            } catch (error) {
                console.log(`error guardando el nuevo proyecto. E: ${error}`);
                throw new ApolloError("error");
            }
            console.log(`proyecto creado`);

            return elProyecto;
        },
        async crearTrabajoEnProyecto(_: any, { idProyecto }: any, contexto: contextoQuery) {
            console.log(`Peticion de crear un nuevo trabajo en el proyecto con id ${idProyecto}`);

            try {
                var elProyecto:any = await Proyecto.findById(idProyecto).exec();
                if(!elProyecto){
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

            console.log(`creando un nuevo trabajo desde el proyecto ${elProyecto}`);

            try {
                var nuevoTrabajo = elProyecto.trabajos.create();
                elProyecto.trabajos.push(nuevoTrabajo);
                await elProyecto.save();
            }
            catch (error) {
                console.log("Error guardando el trabajo creado en el proyecto. E: " + error);
                throw new ApolloError("Error introduciendo el trabajo en el proyecto");
            }
            return nuevoTrabajo;


        },
        async eliminarTrabajoDeProyecto(_: any, { idTrabajo, idProyecto }: any, contexto: contextoQuery) {
            console.log(`peticion de eliminar un trabajo con id ${idTrabajo} de un proyecto con id ${idProyecto}`);
            let credencialesUsuario = contexto.usuario;

            try {
                var elProyecto:any = await Proyecto.findById(idProyecto).exec();
                if(!elProyecto){
                    throw "proyecto no encontrado"
                }
            }
            catch (error) {
                console.log("Error buscando el proyecto en la base de datos. E: " + error);
                throw new ApolloError("Error conectando con la base de datos");
            }

            //Authorización

            if (!elProyecto.responsables.includes(credencialesUsuario.id) && !credencialesUsuario.permisos.includes("superadministrador")) {
                console.log(`Error de autenticacion editando nombre de proyecto`);
                throw new AuthenticationError("No autorizado");
            }

            try {
                await elProyecto.trabajos.id(idTrabajo).remove();
            }
            catch (error) {
                console.log(`Trabajo ${idTrabajo} no encontrado. E: ` + error);
                throw new ApolloError("");
            }
            try {
                await elProyecto.save();
            }
            catch (error) {
                console.log("Error guardando el trabajo creado en el proyecto. E: " + error);
                throw new ApolloError("Error introduciendo el trabajo en el proyecto");
            }

            console.log(`eliminado`);

            return true;
        },
        async cambiarNombreTrabajo(_: any, { idProyecto, idTrabajo, nuevoNombre }, contexto: contextoQuery) {
            let credencialesUsuario = contexto.usuario;

            console.log(`cambiando el nombre del trabajo con id ${idTrabajo} del proyecto con id ${idProyecto}`);
            var charProhibidosNombre = /[^ a-zA-ZÀ-ž0-9_():.,-]/g;

            nuevoNombre = nuevoNombre.replace(/\s\s+/g, " ");
            if (charProhibidosNombre.test(nuevoNombre)) {
                throw new ApolloError("Nombre ilegal");
            }

            nuevoNombre = nuevoNombre.trim();

            try {
                var elProyecto:any = await Proyecto.findById(idProyecto).exec();
                if(!elProyecto){
                    throw "proyecto no encontrado"
                }
            }
            catch (error) {
                console.log("Error buscando el proyecto. E: " + error);
                throw new ApolloError("Erro en la conexión con la base de datos");
            }

            //Authorización

            if (!elProyecto.responsables.includes(credencialesUsuario.id) && !credencialesUsuario.permisos.includes("superadministrador")) {
                console.log(`Error de autenticacion editando nombre de proyecto`);
                throw new AuthenticationError("No autorizado");
            }

            try {
                elProyecto.trabajos.id(idTrabajo).nombre = nuevoNombre;
            }
            catch (error) {
                console.log("Error cambiando el nombre en la base de datos. E: " + error);
                throw new ApolloError("Error guardando el nombre en la base de datos");
            }
            try {
                await elProyecto.save();
            }
            catch (error) {
                console.log("Error guardando el trabajo creado en el proyecto. E: " + error);
                throw new ApolloError("Error introduciendo el trabajo en el proyecto");
            }
            console.log(`Nombre cambiado`);
            return elProyecto.trabajos.id(idTrabajo);
        },
        async cambiarDescripcionTrabajo(_: any, { idProyecto, idTrabajo, nuevaDescripcion }, contexto: contextoQuery) {
            let credencialesUsuario = contexto.usuario;
            console.log(`cambiando la descripcion del trabajo con id ${idTrabajo} del proyecto con id ${idProyecto}`);
            var charProhibidosNombre = /[^ a-zA-ZÀ-ž0-9_():.,-]/g;

            nuevaDescripcion = nuevaDescripcion.replace(/\s\s+/g, " ");
            if (charProhibidosNombre.test(nuevaDescripcion)) {
                throw new ApolloError("Descripcion ilegal");
            }
            nuevaDescripcion = nuevaDescripcion.trim();
            try {
                var elProyecto:any = await Proyecto.findById(idProyecto).exec();
                if(!elProyecto){
                    throw "proyecto no encontrado"
                }
            }
            catch (error) {
                console.log("Error buscando el proyecto. E: " + error);
                throw new ApolloError("Error en la conexión con la base de datos");
            }

            //Authorización

            if (!elProyecto.responsables.includes(credencialesUsuario.id) && !credencialesUsuario.permisos.includes("superadministrador")) {
                console.log(`Error de autenticacion editando nombre de proyecto`);
                throw new AuthenticationError("No autorizado");
            }

            try {
                elProyecto.trabajos.id(idTrabajo).descripcion = nuevaDescripcion;
            }
            catch (error) {
                console.log("Error cambiando la descripcion en la base de datos. E: " + error);
                throw new ApolloError("Error guardando la descripcion en la base de datos");
            }
            try {
                await elProyecto.save();
            }
            catch (error) {
                console.log("Error guardando el trabajo creado en el proyecto. E: " + error);
                throw new ApolloError("Error introduciendo el trabajo en el proyecto");
            }
            console.log(`Descripcion cambiada`);
            return elProyecto.trabajos.id(idTrabajo);
        },
        addResponsableTrabajo: async function (_: any, { idProyecto, idTrabajo, idUsuario }: any, contexto: contextoQuery) {
            console.log(`Solicitud de add un usuario con id ${idUsuario} a un trabajo de id ${idTrabajo} en un proyecto con id ${idProyecto}`);
            let credencialesUsuario = contexto.usuario;

            try {
                var elProyecto:any = await Proyecto.findById(idProyecto).exec();
                if(!elProyecto){
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

            var elTrabajo = elProyecto.trabajos.id(idTrabajo);
            if (!elTrabajo) {
                console.log(`No se encontró el trabajo ${idTrabajo} en el proyecto ${idProyecto}`);
                throw new ApolloError("Error conectando con la base de datos");
            }

            if (elTrabajo.responsables.includes(idUsuario)) {
                console.log(`El usuario ya era responsable de este trabajo`);
                throw new ApolloError("El usuario ya estaba incluido");
            }

            try {
                elTrabajo.responsables.push(idUsuario);
                console.log(`Usuario añadido a la lista de responsables`);
                await elProyecto.save();
            }
            catch (error) {
                console.log("Error guardando datos en la base de datos. E: " + error);
                throw new ApolloError("Error conectando con la base de datos");
            }
            console.log(`Proyecto guardado`);
            return elTrabajo;

        },
        removeResponsableTrabajo: async function (_: any, { idProyecto, idTrabajo, idUsuario }: any, contexto: contextoQuery) {
            console.log(`Solicitud de add un usuario con id ${idUsuario} a un trabajo de id ${idTrabajo} en un proyecto con id ${idProyecto}`);
            let credencialesUsuario = contexto.usuario;

            try {
                var elProyecto:any = await Proyecto.findById(idProyecto).exec();
                if(!elProyecto){
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

            var elTrabajo = elProyecto.trabajos.id(idTrabajo);
            if (!elTrabajo) {
                console.log(`No se encontró el trabajo ${idTrabajo} en el proyecto ${idProyecto}`);
                throw new ApolloError("Error conectando con la base de datos");
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
                await elProyecto.save();
            }
            catch (error) {
                console.log("Error guardando datos en la base de datos. E: " + error);
                throw new ApolloError("Error conectando con la base de datos");
            }
            console.log(`Proyecto guardado`);
            return elTrabajo;

        },
        async crearObjetivoEnProyecto(_: any, { idProyecto }: any, contexto: contextoQuery) {
            console.log(`Peticion de crear un nuevo objetivo en el proyecto con id ${idProyecto}`);


            try {
                var elProyecto:any = await Proyecto.findById(idProyecto).exec();
                if(!elProyecto){
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

            try {
                var elProyecto:any = await Proyecto.findById(idProyecto).exec();
                if(!elProyecto){
                    throw "proyecto no encontrado"
                }
            }
            catch (error) {
                console.log("Error buscando el proyecto en la base de datos. E: " + error);
                throw new ApolloError("Error conectando con la base de datos");
            }
            //Authorización
            let credencialesUsuario = contexto.usuario;
            if (!elProyecto.responsables.includes(credencialesUsuario.id) && !credencialesUsuario.permisos.includes("superadministrador")) {
                console.log(`Error de autenticacion editando nombre de proyecto`);
                throw new AuthenticationError("No autorizado");
            }

            try {
                await elProyecto.objetivos.id(idObjetivo).remove();
            }
            catch (error) {
                console.log(`Objetivo ${idObjetivo} no encontrado. E: ` + error);
                throw new ApolloError("");
            }
            try {
                await elProyecto.save();
            }
            catch (error) {
                console.log("Error guardando el objetivo creado en el proyecto. E: " + error);
                throw new ApolloError("Error introduciendo el objetivo en el proyecto");
            }

            console.log(`eliminado`);

            return true;
        },
        async cambiarNombreObjetivo(_: any, { idProyecto, idObjetivo, nuevoNombre }, contexto: contextoQuery) {

            console.log(`cambiando el nombre del objetivo con id ${idObjetivo} del proyecto con id ${idProyecto}`);
            var charProhibidosNombre = /[^ a-zA-ZÀ-ž0-9_():.,-]/g;

            nuevoNombre = nuevoNombre.replace(/\s\s+/g, " ");
            if (charProhibidosNombre.test(nuevoNombre)) {
                throw new ApolloError("Nombre ilegal");
            }

            nuevoNombre = nuevoNombre.trim();

            try {
                var elProyecto:any = await Proyecto.findById(idProyecto).exec();
                if(!elProyecto){
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
                elProyecto.objetivos.id(idObjetivo).nombre = nuevoNombre;
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
            return elProyecto.objetivos.id(idObjetivo);
        },
        async cambiarDescripcionObjetivo(_: any, { idProyecto, idObjetivo, nuevaDescripcion }, contexto: contextoQuery) {

            console.log(`cambiando la descripcion del objetivo con id ${idObjetivo} del proyecto con id ${idProyecto}`);
            var charProhibidosNombre = /[^ a-zA-ZÀ-ž0-9_():.,-]/g;

            nuevaDescripcion = nuevaDescripcion.replace(/\s\s+/g, " ");
            if (charProhibidosNombre.test(nuevaDescripcion)) {
                throw new ApolloError("Descripcion ilegal");
            }
            nuevaDescripcion = nuevaDescripcion.trim();
            try {
                var elProyecto:any = await Proyecto.findById(idProyecto).exec();
                if(!elProyecto){
                    throw "proyecto no encontrado"
                }
            }
            catch (error) {
                console.log("Error buscando el proyecto. E: " + error);
                throw new ApolloError("Error en la conexión con la base de datos");
            }
            //Authorización
            let credencialesUsuario = contexto.usuario;
            if (!elProyecto.responsables.includes(credencialesUsuario.id) && !credencialesUsuario.permisos.includes("superadministrador")) {
                console.log(`Error de autenticacion editando nombre de proyecto`);
                throw new AuthenticationError("No autorizado");
            }
            try {
                elProyecto.objetivos.id(idObjetivo).descripcion = nuevaDescripcion;
            }
            catch (error) {
                console.log("Error cambiando la descripcion en la base de datos. E: " + error);
                throw new ApolloError("Error guardando la descripcion en la base de datos");
            }
            try {
                await elProyecto.save();
            }
            catch (error) {
                console.log("Error guardando el objetivo creado en el proyecto. E: " + error);
                throw new ApolloError("Error introduciendo el objetivo en el proyecto");
            }
            console.log(`Descripcion cambiada`);
            return elProyecto.objetivos.id(idObjetivo);
        }
    },
    Proyecto: {
        responsables: async function (parent: any, _: any, __: any) {
            if (!parent.responsables) {
                return [];
            }
            let idsResponsables = parent.responsables;

            try {
                var usuariosResponsables = await Usuario.find({ _id: { $in: idsResponsables } }).exec();
            } catch (error) {
                console.log(`error buscando a los responsables del proyecto. E: ${error}`);
                return [];
            }


            return usuariosResponsables;
        },
        posiblesResponsables: async function (parent: any, _: any, __: any) {
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
        // trabajos: async function (parent: any, _: any, __: any) {
        //     console.log(`parent (trabajos): ${JSON.stringify(parent.trabajos)}`);
        //     if (!parent.trabajos) {
        //         return [];
        //     }
        //     let idsTrabajos = parent.trabajos;

        //     try {
        //         var trabajos = Trabajo.find({ _id: { $in: idsTrabajos } }).exec();
        //     } catch (error) {
        //         console.log(`error buscando a los trabajos del proyecto. E: ${error}`);
        //         return [];
        //     }


        //     return trabajos;
        // },
    }


}