import { ApolloError, AuthenticationError, gql } from "apollo-server-express";
import fs from "fs";
import util from "util";
import mongoose from "mongoose";
import {ModeloGrupoEstudiantil as GrupoEstudiantil} from "../model/actividadesProfes/GrupoEstudiantil"
import {ModeloUsuario as Usuario} from "../model/Usuario";
import path from "path"
import { contextoQuery } from "./tsObjetos"

const access = util.promisify(fs.access);

export const typeDefs = gql`

    type InfoArchivo{
        nombre: String,
        extension: String,
        accesible:Boolean,
    }

    type ParticipacionActividadGrupoEstudiantil{
        id: ID,
        fechaUpload:Date,
        autor:PublicUsuario,
        comentario:String,
        archivo:InfoArchivo,        
    }

    type DesarrolloActividadGrupoEstudiantil{
        id: ID,
        estudiante: PublicUsuario,
        estado:String,
        participaciones: [ParticipacionActividadGrupoEstudiantil]
    }

    type ActividadGrupoEstudiantil{        
        id: ID,
        nombre: String,
        desarrollos:[DesarrolloActividadGrupoEstudiantil],
        creador: PublicUsuario,
        hayGuia: Boolean,
    }

    type GrupoEstudiantil{
        id:ID,
        nombre:String,
        estudiantes:[PublicUsuario],
        actividades:[ActividadGrupoEstudiantil]
    }

    extend type Query{
        grupoEstudiantil(idGrupo:ID!):GrupoEstudiantil,
        gruposEstudiantiles:[GrupoEstudiantil],
        addEstudianteGrupoEstudiantil:GrupoEstudiantil,
        actividadDeGrupoEstudiantil(idGrupo:ID!, idActividad:ID!):ActividadGrupoEstudiantil,
        actividadEstudiantil(idActividad:ID!):ActividadGrupoEstudiantil,
        actividadesEstudiantilesDeProfe(idProfe:ID!):[ActividadGrupoEstudiantil],
        actividadesEstudiantilesDeProfeDeGrupo(idProfe:ID!, idGrupo: ID!):[ActividadGrupoEstudiantil],
        desarrolloUsuarioEnActividadEstudiantil(idEstudiante:ID!, idActividad:ID!):DesarrolloActividadGrupoEstudiantil,
        desarrolloEnActividadEstudiantil(idDesarrollo:ID!, idActividad:ID!):DesarrolloActividadGrupoEstudiantil,

    }
    extend type Mutation{
        addEstudianteGrupoEstudiantil(idEstudiante: ID!, idGrupoEstudiantil:ID!):GrupoEstudiantil,
        removeEstudianteGrupoEstudiantil(idEstudiante:ID!, idGrupo:ID!):GrupoEstudiantil,
        crearActividadEnGrupoEstudiantil(idGrupo:ID!):ActividadGrupoEstudiantil,
        eliminarActividadDeGrupoEstudiantil(idActividad:ID!, idGrupo: ID!):Boolean,
        cambiarNombreActividadGrupoEstudiantil(idGrupo:ID!, idActividad:ID!, nuevoNombre: String):ActividadGrupoEstudiantil
        eliminarParticipacionActividadEstudiantil(idParticipacion:ID!):Boolean,
        setEstadoDesarrolloActividadEstudiantil(idDesarrollo:ID!, nuevoEstado: String):DesarrolloActividadGrupoEstudiantil
    }

    type Subscription{
        nuevaActividadEstudiantil:ActividadGrupoEstudiantil!,
        eliminadaParticipacionActividadEstudiantil:ID!
    }
`;

const NUEVA_ACTIVIDAD="nueva_actividad_estudiantil"

export const resolvers = {
    Subscription:{
        nuevaActividadEstudiantil:{            
            subscribe:(_:any, args:any, contexto)=>{
                return contexto.pubsub.asyncIterator([NUEVA_ACTIVIDAD]);
            }
        }
    },
    Query: {        
        desarrolloEnActividadEstudiantil: async function (_: any, { idDesarrollo, idActividad }: any, contexto: contextoQuery) {
            console.log(`|||||||||||||||||||||||||||||||`);
            console.log(`Solicitud de desarrollo con id ${idDesarrollo} en la actividad con id ${idActividad}`);

            try {
                var elGrupo = await GrupoEstudiantil.findOne({ "actividades._id": mongoose.Types.ObjectId(idActividad) }).exec();
                if (!elGrupo) {
                    console.log(`Grupo no encontrado`);
                    throw new Error("Grupo no encontrado")
                }

            } catch (error) {
                console.log(`Error buscando la actividad en los grupos estudiantiles. E: ${error}`);
                throw new ApolloError("Error conectando con la base de datos");
            }

            console.log(`Encontrado grupo: ${elGrupo.nombre}`);
            let laActividad = elGrupo.actividades.id(idActividad);

            console.log(`Encontrada actividad: ${laActividad.nombre}`);

            let elDesarrollo = laActividad.desarrollos.id(idDesarrollo);

            if (!elDesarrollo) {
                console.log(`Desarrollo no encontrado`);
                throw new ApolloError("Dato no existia");
            }

            console.log(`Enviando un desarrollo`);

            return elDesarrollo;

        },
        desarrolloUsuarioEnActividadEstudiantil: async function (_: any, { idEstudiante, idActividad }: any, contexto: contextoQuery) {
            console.log(`Solicitud de desarrollo de un usuario con id ${idEstudiante} en la actividad con id ${idActividad}`);
            // let credencialesUsuario=contexto.usuario;
            //     if(!credencialesUsuario.id){
            //         console.log(`Usuario no logeado`);
            //         throw new AuthenticationError("No autorizado");
            // }

            try {
                var elUsuario = await Usuario.findById(idEstudiante).exec();
                if (!elUsuario) throw new Error("Usuario no encontrado en la base de datos");
            } catch (error) {
                console.log(`Error buscando al usuario con id ${idEstudiante} en la base de datos. E: ${error}`);
                throw new ApolloError("Error conectando con la base de datos");
            }

            console.log(`Buscando el grupo`);

            try {
                var elGrupo = await GrupoEstudiantil.findOne({ "actividades._id": mongoose.Types.ObjectId(idActividad) }).exec();
                if (!elGrupo) {
                    console.log(`Grupo no encontrado`);
                    throw new Error("Grupo no encontrado")
                }

            } catch (error) {
                console.log(`Error buscando la actividad en los grupos estudiantiles. E: ${error}`);
                throw new ApolloError("Error conectando con la base de datos");
            }

            console.log(`Encontrado grupo: ${elGrupo.nombre}`);
            let laActividad = elGrupo.actividades.id(idActividad);

            console.log(`Encontrada actividad: ${laActividad.nombre}`);

            let elDesarrollo = laActividad.desarrollos.find(d => d.idEstudiante == idEstudiante);

            if (!elDesarrollo) elDesarrollo = [];
            console.log(`Enviando un desarrollo`);

            return elDesarrollo;

        },
        grupoEstudiantil: async function (_: any, { idGrupo }: any, contexto: contextoQuery) {
            try {
                var elGrupoEstudiantil = GrupoEstudiantil.findById(idGrupo).exec();
            } catch (error) {
                console.log(`Error buscando el grupo con id ${idGrupo} en la base de datos`);
                throw new ApolloError("Error conectando con la base de datos");
            }
            console.log(`enviando el grupo estudiantil`);
            return elGrupoEstudiantil;
        },
        gruposEstudiantiles: async function (_: any, __: any, contexto: contextoQuery) {
            console.log(`solicitud de todos los grupos estudiantiles`);
            let credencialesUsuario = contexto.usuario;
            if (!contexto.usuario) {
                console.log("Usuario no logeado");
                throw new AuthenticationError("No autorizado");
            }

            try {
                var elLogeado = await Usuario.findById(credencialesUsuario.id).exec();
            }
            catch (error) {
                console.log("Error buscando el usuario en la base de datos. E: " + error);
                throw new ApolloError("");
            }
            if (!elLogeado) {
                console.log(`${credencialesUsuario.id} no fue encontrado en la base de datos`);
                throw new AuthenticationError("No autorizado");
            }
            console.log(`Usuario logeado: ${credencialesUsuario.id}`);

            try {
                var gruposEstudiantiles = await GrupoEstudiantil.find({}).exec();
            }
            catch (error) {
                console.log("Error descargando los grupos estudiantiles de la base de datos. E: " + error);
                throw new ApolloError("Error conectando con la base de datos");
            }

            console.log(`enviando todos los grupos estudiantiles`);
            return gruposEstudiantiles;
        },
        actividadDeGrupoEstudiantil: async function (_: any, { idGrupo, idActividad }, contexto: contextoQuery) {
            try {
                let elGrupo = await GrupoEstudiantil.findById(idGrupo).exec();
                var laActividad = elGrupo.actividades.id(idActividad);
            } catch (error) {
                console.log(`Error buscando grupo y actividad en la base de datos. E: ${error}`);
                throw new ApolloError("Error conectando con la base de datos");
            }
            return laActividad;
        },
        actividadEstudiantil: async function (_: any, { idActividad }, contexto: contextoQuery) {
            console.log(`Solicitud de actividad con id ${idActividad}`);
            try {
                let elGrupo = await GrupoEstudiantil.findOne({"actividades._id":mongoose.Types.ObjectId(idActividad)}).exec();
                var laActividad = elGrupo.actividades.id(idActividad);
            } catch (error) {
                console.log(`Error buscando actividad en la base de datos. E: ${error}`);
                throw new ApolloError("Error conectando con la base de datos");
            }
            return laActividad;
        },
        actividadesEstudiantilesDeProfe: async function (_: any, { idProfe }: any, contexto: contextoQuery) {
            console.log(`||||||||||||||||||||||||||||||||||||||||||`);
            console.log(`Solicitud de actividades estudiantiles del profe con id ${idProfe}`);
            try {
                var todasLasActividades = await GrupoEstudiantil.find({}).distinct("actividades").exec();
            } catch (error) {
                console.log(`Error fetching grupos en la base de datos: E: ${error}`);
                throw new ApolloError("Error conectando con la base de datos");
            }

            let actividadesDelProfe = todasLasActividades.filter(a => a.idCreador == idProfe);
            for (var i = 0; i < actividadesDelProfe.length; i++) {
                if (!actividadesDelProfe[i].desarrollos) {
                    actividadesDelProfe[i].desarrollos = [];
                }
            }
            console.log(`Enviando ${actividadesDelProfe.length} actividades del profe: ${actividadesDelProfe[0].desarrollos[0].participaciones}.`);

            return actividadesDelProfe;
        },
        actividadesEstudiantilesDeProfeDeGrupo: async function (_: any, { idProfe, idGrupo }: any, contexto: contextoQuery) {
            console.log(`||||||||||||||||||||||||||||||||||||||||||`);
            console.log(`Solicitud de actividades estudiantiles del profe con id ${idProfe} para el grupo con id ${idGrupo}`);
            try {
                var elGrupo = await GrupoEstudiantil.findById(idGrupo).exec();
            } catch (error) {
                console.log(`Error fetching grupos en la base de datos: E: ${error}`);
                throw new ApolloError("Error conectando con la base de datos");
            }

            let actividadesDelProfe = elGrupo.actividades.filter(a => a.idCreador == idProfe);
            console.log(`Habia ${actividadesDelProfe.length} actividades de este profe en este grupo`);
            if (actividadesDelProfe.length == 0) {
                console.log(`Este profe no tenía actividades para este grupo. Enviando array vacío`);

            }
            else {
                for (var i = 0; i < actividadesDelProfe.length; i++) {
                    if (!actividadesDelProfe[i].desarrollos) {
                        actividadesDelProfe[i].desarrollos = [];
                    }
                }

            }
            console.log(`Enviando actividades del profe`);

            return actividadesDelProfe;
        },
    },
    Mutation: {
        setEstadoDesarrolloActividadEstudiantil: async function (_: any, { idDesarrollo, nuevoEstado }: any, contexto: contextoQuery) {
            console.log(`||||||||||||||||||||||||||`);
            console.log(`Solicitud de set estado ${nuevoEstado} en desarrollo con id ${idDesarrollo}`);
            try {
                var elGrupo = await GrupoEstudiantil.findOne({ "actividades.desarrollos._id": mongoose.Types.ObjectId(idDesarrollo) }).exec();
                if (!elGrupo) {
                    console.log(`No se encontró grupo`);
                }
                else {
                    console.log(`Encontrado grupo ${JSON.stringify(elGrupo.nombre)}`);

                    let laActividad = elGrupo.actividades.find(a => a.desarrollos.some(d=>d._id == idDesarrollo));
                    console.log(`Actividad: ${laActividad.nombre}`);
                    var elDesarrollo = laActividad.desarrollos.id(idDesarrollo);
                    elDesarrollo.estado=nuevoEstado;
                }
            } catch (error) {
                console.log(`Error buscando desarrollo en la base de datos: E: ${error}`);
                throw new ApolloError("Error conectando con la base de datos");
            }

            try {
                await elGrupo.save();
            } catch (error) {
                console.log(`Error guardando el grupo modificado en la base de datos. E: ${error}`);
                throw new ApolloError("Error conectando con la base de datos");
            }

            console.log(`Estado de desarrollo cambiado`);
            return elDesarrollo;

        },    
        addEstudianteGrupoEstudiantil: async function (_: any, { idEstudiante, idGrupoEstudiantil }, contexto: contextoQuery) {
            console.log(`petición de añadir el estudiante con id ${idEstudiante} a grupo estudiantil con id ${idGrupoEstudiantil}`);
            let credencialesUsuario = contexto.usuario;
            if (!credencialesUsuario) {
                console.log("No habia credenciales de usuario")
                throw new AuthenticationError("No autorizado");
            }

            try {
                var elGrupoEstudiantil = await GrupoEstudiantil.findById(idGrupoEstudiantil).exec();
            }
            catch (error) {
                console.log("Error buscando el grupo estudiantil en la base de datos. E: " + error);
                throw new ApolloError("Error de conexión con la base de datos");
            }


            //Authorizaion

            let permisosValidos = ["superadministrador"];

            if (!credencialesUsuario.permisos.some(p => permisosValidos.includes(p))) {
                console.log(`No tiene los permisos necesarios, cancelando.`);
                throw new AuthenticationError("No autorizado");
            }

            try {
                var elUsuario = await Usuario.findById(idEstudiante).exec();
                if (!elUsuario) {
                    console.log(`No se pudo encontrar al usuario con id ${idEstudiante} en la base de datos`);
                    throw new ApolloError("Error buscando al usuario en la base de datos");
                }
            }
            catch (error) {
                console.log("Error buscando al usuario en la base de datos. E: " + error);
                throw new ApolloError("Error conectando con la base de datos");
            }

            if (elGrupoEstudiantil.estudiantes.includes(idEstudiante)) {
                console.log(`El usuario ya era estudiante de este grupo estudiantil`);
                throw new ApolloError("El usuario ya estaba incluido");
            }

            elGrupoEstudiantil.estudiantes.push(idEstudiante);
            console.log(`Usuario añadido a la lista de estudiantes`);


            try {
                await elGrupoEstudiantil.save();
            }
            catch (error) {
                console.log("Error guardando datos en la base de datos. E: " + error);
                throw new ApolloError("Error conectando con la base de datos");
            }
            console.log(`Proyecto guardado`);
            return elGrupoEstudiantil
        },
        removeEstudianteGrupoEstudiantil: async function (_: any, { idGrupo, idEstudiante }: any, contexto: contextoQuery) {
            console.log(`Solicitud de remover un estudiante con id ${idEstudiante} de un grupo estudiantil con id ${idGrupo}`);
            let credencialesUsuario = contexto.usuario;

            if (!credencialesUsuario) {
                console.log("No habia credenciales de usuario")
                throw new AuthenticationError("No autorizado");
            }

            //Authorización

            let permisosValidos = ["superadministrador"];

            if (!credencialesUsuario.permisos.some(p => permisosValidos.includes(p))) {
                console.log(`Error de autenticacion removiendo responsable o posible responsable de grupo estudiantil`);
                throw new AuthenticationError("No autorizado");
            }

            try {
                var elGrupoEstudiantil = await GrupoEstudiantil.findById(idGrupo).exec();
            }
            catch (error) {
                console.log("Error buscando el grupo estudiantil en la base de datos. E: " + error);
                throw new ApolloError("Error de conexión con la base de datos");
            }


            try {
                var elUsuario = await Usuario.findById(idEstudiante).exec();
                if (!elUsuario) {
                    console.log(`No se pudo encontrar al usuario con id ${idEstudiante} en la base de datos`);
                    throw new ApolloError("Error buscando al usuario en la base de datos");
                }
            }
            catch (error) {
                console.log("Error buscando al usuario en la base de datos. E: " + error);
                throw new ApolloError("Error conectando con la base de datos");
            }

            let indexEstudiante = elGrupoEstudiantil.estudiantes.indexOf(idEstudiante);

            if (indexEstudiante > -1) {
                console.log(`sacando al estudiante ${idEstudiante} del grupo`);
                elGrupoEstudiantil.estudiantes.splice(indexEstudiante, 1);
            }

            try {
                await elGrupoEstudiantil.save();
            }
            catch (error) {
                console.log("Error guardando datos en la base de datos. E: " + error);
                throw new ApolloError("Error conectando con la base de datos");
            }
            console.log(`GrupoEstudiantil guardado`);
            return elGrupoEstudiantil

        },
        crearActividadEnGrupoEstudiantil: async function (_: any, { idGrupo }: any, contexto: contextoQuery) {
            console.log(`Peticion de crear ua nueva actividad en el grupo con id ${idGrupo}`);

            try {
                var elGrupoEstudiantil = await GrupoEstudiantil.findById(idGrupo).exec();
            }
            catch (error) {
                console.log("GrupoEstudiantil no encontrado. E: " + error);
                throw new ApolloError("Error conectandose con la base de datos");
            }

            //Authorización
            let credencialesUsuario = contexto.usuario;

            if (!credencialesUsuario.permisos.includes("actividadesEstudiantiles-profe")) {
                console.log(`Error: el usuario no era profe`);
                throw new AuthenticationError("No autorizado");
            }

            console.log(`creando una nueva actividad en el grupo ${elGrupoEstudiantil.nombre}`);
            console.log(`las actividades eran: ${elGrupoEstudiantil.actividades}`);
            try {
                var nuevaActividad = elGrupoEstudiantil.actividades.create({ fechaCreacion: Date.now(), idCreador: credencialesUsuario.id });

                elGrupoEstudiantil.actividades.push(nuevaActividad);
                await elGrupoEstudiantil.save();
            }
            catch (error) {
                console.log("Error guardando la actividad creada en el grupo. E: " + error);
                throw new ApolloError("Error introduciendo la actividad en el proyecto");
            }
            console.log(`Actividad creada exitosamente: ${nuevaActividad}`);
            contexto.pubsub.publish(NUEVA_ACTIVIDAD, {nuevaActividadEstudiantil: nuevaActividad});

            return nuevaActividad;
            
        },
        eliminarActividadDeGrupoEstudiantil: async function (_: any, { idActividad, idGrupo }: any, contexto: contextoQuery) {
            console.log(`|||||||||||||||||||||||||||`);
            console.log(`peticion de eliminar una actividad con id ${idActividad} de un proyecto con id ${idGrupo}`);

            try {
                var elGrupo = await GrupoEstudiantil.findById(idGrupo).exec();
                console.log(`Grupo encontrado`);
                var laActividad = elGrupo.actividades.id(idActividad);
            }
            catch (error) {
                console.log("Error buscando el grupo en la base de datos. E: " + error);
                throw new ApolloError("Error conectando con la base de datos");
            }


            //Authorización
            let credencialesUsuario = contexto.usuario;
            if (!credencialesUsuario.permisos.includes("actividadesEstudiantiles-administrador") && !credencialesUsuario.permisos.includes("superadministrador") && laActividad.idCreador != credencialesUsuario.id) {
                console.log(`Error de autenticacion editando nombre de grupo`);
                throw new AuthenticationError("No autorizado");
            }

            try {
                await elGrupo.actividades.id(idActividad).remove();
            }
            catch (error) {
                console.log(`Actividad ${idActividad} no encontrado. E: ` + error);
                throw new ApolloError("");
            }
            try {
                await elGrupo.save();
            }
            catch (error) {
                console.log("Error guardando el actividad creado en el grupo. E: " + error);
                throw new ApolloError("Error introduciendo el actividad en el grupo");
            }

            console.log(`eliminado`);

            //Eliminando carpeta

            let pathActividad = path.join(__dirname, "../public/actividadesProfes/actividades", idActividad);

            fs.rmdir(pathActividad, { recursive: true }, (err) => {
                if (err) {
                    console.log(`Error eliminando carpeta de actividad. E: ${err}`);
                }
            });

            return true;
        },
        async cambiarNombreActividadGrupoEstudiantil(_: any, { idGrupo, idActividad, nuevoNombre }, contexto: contextoQuery) {
            console.log(`|||||||||||||||||||||||||||`);
            console.log(`cambiando el nombre de la actividad con id ${idActividad} del grupo con id ${idGrupo}`);
            var charProhibidosNombre = /[^ a-zA-ZÀ-ž0-9_():.,-]/g;

            nuevoNombre = nuevoNombre.replace(/\s\s+/g, " ");
            if (charProhibidosNombre.test(nuevoNombre)) {
                throw new ApolloError("Nombre ilegal");
            }

            nuevoNombre = nuevoNombre.trim();

            try {
                var elGrupo = await GrupoEstudiantil.findById(idGrupo);
            }
            catch (error) {
                console.log("Error buscando el grupo. E: " + error);
                throw new ApolloError("Erro en la conexión con la base de datos");
            }

            if (!elGrupo.actividades.id(idActividad)) {
                console.log(`Actividad no encontrada en el grupo`);
                throw new ApolloError("Error conectando con la bse de datos");
            }


            //Authorización
            let credencialesUsuario = contexto.usuario;
            if (elGrupo.actividades.id(idActividad).idCreador != credencialesUsuario.id && !credencialesUsuario.permisos.includes("superadministrador")) {
                console.log(`Error de autenticacion editando nombre de grupo`);
                throw new AuthenticationError("No autorizado");
            }

            try {
                elGrupo.actividades.id(idActividad).nombre = nuevoNombre;
            }
            catch (error) {
                console.log("Error cambiando el nombre en la base de datos. E: " + error);
                throw new ApolloError("Error guardando el nombre en la base de datos");
            }

            try {
                await elGrupo.save();
            }
            catch (error) {
                console.log("Error guardando el grupo modificado en la base de datos. E: " + error);
                throw new ApolloError("Error cambiando el nombre de la actividad");
            }
            console.log(`Nombre cambiado`);
            return elGrupo.actividades.id(idActividad);
        },
        eliminarParticipacionActividadEstudiantil: async function (_: any, { idParticipacion }: any, contexto: contextoQuery) {
            console.log(`||||||||||||||||||||||`);
            console.log(`Solicitud de eliminar participacion con id ${idParticipacion}`);
            let credencialesUsuario = contexto.usuario;
            if (!credencialesUsuario) {
                console.log("No habia credenciales de usuario")
                throw new AuthenticationError("No autorizado");
            }
            //Authorizaion

            let permisosValidos = ["superadministrador", "actividadesEstudiantiles-administrador"];

            if (!credencialesUsuario.permisos.some(p => permisosValidos.includes(p))) {
                console.log(`No tiene los permisos necesarios, cancelando.`);
                throw new AuthenticationError("No autorizado");
            }

            try {
                var elGrupo = await GrupoEstudiantil.findOne({ "actividades.desarrollos.participaciones._id": mongoose.Types.ObjectId(idParticipacion) }).exec();
                if (!elGrupo) {
                    console.log(`No se encontró grupo`);
                    throw new ApolloError("Error conectando con la base de datos");
                }
                else {
                    console.log(`Encontrado grupo ${JSON.stringify(elGrupo.nombre)}`);

                    let laActividad = elGrupo.actividades.find(a => a.desarrollos.some(d => d.participaciones.some(p => p._id == idParticipacion)));
                    console.log(`Actividad: ${laActividad.nombre}`);
                    let elDesarrollo=laActividad.desarrollos.find(d => d.participaciones.some(p => p._id == idParticipacion));
                    let lasParticipaciones = elDesarrollo.participaciones;

                    console.log(`Participaciones: ${lasParticipaciones}`);
                    lasParticipaciones.pull({ _id: idParticipacion });
                    console.log(`Participaciones: ${lasParticipaciones}`);

                    if(elDesarrollo.participaciones.length<1){
                        let idDesarrollo=elDesarrollo.id
                        console.log(`Este desarrollo con id ${idDesarrollo} se quedó sin participaciones. Eliminando`);
                        laActividad.desarrollos.pull({_id:idDesarrollo});
                    }
                }
            } catch (error) {
                console.log(`Error buscando grupo en la base de datos: E: ${error}`);
                throw new ApolloError("Error conectando con la base de datos");
            }

            try {
                await elGrupo.save();
            } catch (error) {
                console.log(`Error guardando el grupo modificado en la base de datos. E: ${error}`);
                throw new ApolloError("Error conectando con la base de datos");
            }

            console.log(`Participacion eliminada`);
            return true;
        },
    },

    GrupoEstudiantil: {
        estudiantes: async function (parent: any, _: any, __: any) {
            if (!parent.estudiantes) {
                return [];
            }
            let idsEstudiantes = parent.estudiantes;

            try {
                var usuariosEstudiantes = await Usuario.find({ _id: { $in: idsEstudiantes } }).exec();
            } catch (error) {
                console.log(`error buscando a los estudiantes del proyecto. E: ${error}`);
                return [];
            }


            return usuariosEstudiantes;
        },
    },
    ParticipacionActividadGrupoEstudiantil: {
        autor: async function (parent: any, _: any, __: any) {
            if (!parent.idAutor) {
                return {
                    id: "0",
                    nombres: "?",
                    apellidos: "?"
                }
            }
            let idAutor = parent.idAutor;

            try {
                var usuarioAutor = await Usuario.findById(idAutor).exec();
            } catch (error) {
                console.log(`error buscando al autor de la participacion. E: ${error}`);
                return {
                    id: "0",
                    nombres: "?",
                    apellidos: "?"
                }
            }


            return usuarioAutor;
        },
    },

    ActividadGrupoEstudiantil: {
        creador: async function (parent: any, _: any, __: any) {
            if (!parent.idCreador) {
                return [];
            }
            let idCreador = parent.idCreador;

            try {
                var usuarioCreador = await Usuario.findById(idCreador).exec();
            } catch (error) {
                console.log(`error buscando a los responsables del proyecto. E: ${error}`);
                return [];
            }
            return usuarioCreador;
        },
        hayGuia: async function (parent: any) {
            let idActividad = "";
            if ("id" in parent) {
                idActividad = parent.id
            }
            else if ("_id" in parent) {
                idActividad = parent._id.toString();
            }
            else {
                console.log(`No habia campo id en el parent para decidir si HAY GUIA`);
                return false
            }

            let pathGuia = path.join(__dirname, "../public/actividadesProfes/actividades", idActividad, "guia.pdf");

            try {
                await access(pathGuia, fs.constants.R_OK);
            } catch (error) {
                if (error.message.substr(0, 6) != "ENOENT") {
                    console.log(`Error checkeando acceso a la guia en ${pathGuia}. E: ${error}`);
                }
                else {
                    console.log(`Guia no existia`);
                }
                return false;
            }
            return true;
        },
        id: async function (parent: any) {
            return parent._id;
        }
    },

    DesarrolloActividadGrupoEstudiantil: {
        estudiante: async function (parent: any, _: any, __: any) {
            if (!parent.idEstudiante) {
                return [];
            }
            let idEstudiante = parent.idEstudiante;

            try {
                var usuarioEstudiante = await Usuario.findById(idEstudiante).exec();
            } catch (error) {
                console.log(`error buscando a los responsables del proyecto. E: ${error}`);
                return [];
            }
            return usuarioEstudiante;
        },
    },
    InfoArchivo: {
        accesible: async function (parent: any) {
            let nombreArchivo = "";
            if ("nombre" in parent) {
                nombreArchivo += parent.nombre
            }
            else {
                console.log(`No habia nombre para buscar el archivo`);
                return false;
            }

            if ("extension" in parent) {
                nombreArchivo += "." + parent.extension;
            }
            else {
                console.log(`No habia info de la extension en la base de datos`);
                return false
            }

            let pathArchivo = path.join(__dirname, "../public/actividadesProfes/evidencias", nombreArchivo);

            try {
                await access(pathArchivo, fs.constants.R_OK);
            } catch (error) {
                if (error.message.substr(0, 6) != "ENOENT") {
                    console.log(`Error checkeando acceso a la guia en ${pathArchivo}. E: ${error}`);
                }
                else {
                    console.log(`Archivo no existia`);
                }
                return false;
            }
            return true;
        }
    }


}


