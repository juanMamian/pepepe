import { ApolloError, AuthenticationError, gql, UserInputError, withFilter } from "apollo-server-express";
import fs from "fs";
import util from "util";
import mongoose from "mongoose";
import { ModeloGrupoEstudiantil as GrupoEstudiantil, esquemaActividad } from "../model/actividadesProfes/GrupoEstudiantil"
import { ModeloUsuario as Usuario, ModeloNotificacion as Notificacion } from "../model/Usuario";
import path from "path"
import { contextoQuery } from "./tsObjetos"
import { drive, jwToken } from "../routes/utilidades"
import { NUEVA_NOTIFICACION_PERSONAL } from "./Usuarios";



interface interfacePayloadNuevaRespuesta {
    nuevaRespuestaDesarrolloEstudiantil: any,
    idEstudianteDesarrollo: string,
    idDesarrollo: string,
    idCreadorActividad: string,
    idGrupo: string,
    idActividad: string
}

export const typeDefs = gql`

    input InfoArchivoSubido{
        idGoogleDrive:String,
        googleDriveDirectLink:String,
        extension: String,
        nombre: String,
    }

    input InputNuevaRespuestaActividadEstudiantil{
        mensaje:String,
        infoArchivo:InfoArchivoSubido,
        enlaceAdjunto:[String],
    }

    type MinimoElemento{
        tipo:String,
        id:ID,
        nombre:String 
    }

    type InfoParticipacionEnDesarrolloEstudiantil{        
        idDesarrollo:ID,
        participacion:ParticipacionActividadGrupoEstudiantil,
    }

    type InfoArchivo{
        nombre: String,
        extension: String,
        googleDriveDirectLink:String,        
    }

    type ParticipacionActividadGrupoEstudiantil{
        id: ID,
        fechaUpload:Date,
        comentario:String,
        archivo:InfoArchivo,        
        infoAutor:Usuario,
        enlaceAdjunto:[String],
    }

    type ResultadoPublicar{
        nuevaRespuesta:ParticipacionActividadGrupoEstudiantil,
        nuevoDesarrollo:DesarrolloActividadGrupoEstudiantil
    }

    type DesarrolloActividadGrupoEstudiantil{
        id: ID,        
        estado:String,
        participaciones: [ParticipacionActividadGrupoEstudiantil],
        leidoPorProfe:Boolean,
        infoEstudiante:Usuario
    }

    type ActividadGrupoEstudiantil{        
        id: ID,
        nombre: String,
        fechaUpload:Date,
        desarrollos:[DesarrolloActividadGrupoEstudiantil],
        infoCreador:Usuario
        hayGuia: String,
        idGrupo:ID,
    }

    type FirmaActividadEstudiantil{
        id:ID,
        idGrupo:ID,
        nombre:String
    }

    type PaginaActividadesGrupoEstudiantil{
        hayMas:Boolean,
        actividades:[ActividadGrupoEstudiantil]
    }

    type GrupoEstudiantil{
        id:ID!,
        nombre:String,        
        estudiantes:[Usuario],
    }

    extend type Query{
        grupoEstudiantil(idGrupo:ID!):GrupoEstudiantil,
        misActividadesCreadasGrupoEstudiantil(idGrupo: ID!, pagina:Int!):PaginaActividadesGrupoEstudiantil,
        todasActividadesGrupoEstudiantil(idGrupo: ID!, pagina:Int!):PaginaActividadesGrupoEstudiantil,
        gruposEstudiantiles:[GrupoEstudiantil],
        addEstudianteGrupoEstudiantil:GrupoEstudiantil,
        actividadDeGrupoEstudiantil(idGrupo:ID!, idActividad:ID!):ActividadGrupoEstudiantil,
        actividadEstudiantil(idActividad:ID!):ActividadGrupoEstudiantil,
        actividadesEstudiantilesDeProfe(idProfe:ID!):[ActividadGrupoEstudiantil],
        misActividadesEstudiantilesDeProfe(idProfe:ID!):[FirmaActividadEstudiantil],
        desarrolloUsuarioEnActividadEstudiantil(idEstudiante:ID!, idActividad:ID!):DesarrolloActividadGrupoEstudiantil,
        desarrolloEnActividadEstudiantil(idDesarrollo:ID!, idActividad:ID!):DesarrolloActividadGrupoEstudiantil,

    }
    extend type Mutation{
        addEstudianteGrupoEstudiantil(idEstudiante: ID!, idGrupoEstudiantil:ID!):GrupoEstudiantil,
        removeEstudianteGrupoEstudiantil(idEstudiante:ID!, idGrupo:ID!):GrupoEstudiantil,
        crearActividadEnGrupoEstudiantil(idGrupo:ID!):ActividadGrupoEstudiantil,
        eliminarActividadDeGrupoEstudiantil(idActividad:ID!, idGrupo: ID!):Boolean,
        cambiarNombreActividadEstudiantil(idActividad:ID!, nuevoNombre: String, idGrupo:ID!):ActividadGrupoEstudiantil,
        publicarRespuestaActividadEstudiantil(idGrupo:ID, idActividad:ID, idDesarrollo:ID, nuevaRespuesta:InputNuevaRespuestaActividadEstudiantil, nuevoDesarrollo:Boolean):ResultadoPublicar,
        eliminarParticipacionActividadEstudiantil(idParticipacion:ID!, idDesarrollo:ID!, idActividad:ID!, idGrupo:ID!):Boolean,
        setEstadoDesarrolloActividadEstudiantil(idDesarrollo:ID!, idActividad:ID!, idGrupo:ID!, nuevoEstado: String):DesarrolloActividadGrupoEstudiantil,
        setLeidoPorProfeDesarrolloEstudiantil(idDesarrollo:ID!, idActividad:ID!, idGrupo:ID!, nuevoLeidoPorProfe:Boolean):DesarrolloActividadGrupoEstudiantil
    }

    extend type Subscription{        
        nuevaRespuestaDesarrolloEstudiantil(idGrupo:ID, idProfe: ID, idActividad:ID):InfoParticipacionEnDesarrolloEstudiantil
    }
`;

export const NUEVA_PARTICIPACION_ESTUDIANTIL = "nueva_participacion_estudiantil"
const sizePaginaActividades = 5;

export const resolvers = {
    Subscription: {
        nuevaRespuestaDesarrolloEstudiantil: {
            subscribe: withFilter(
                (_: any, { idGrupo, idProfe, idActividad }: any, contexto: contextoQuery) => {
                    console.log(`--------------------------Creando una subscripción de ${contexto.usuario.username} a nuevas respuestas`);
                    if (idGrupo) {
                        console.log(`A nuevas respuestas en el grupo ${idGrupo}`);
                    }
                    if (idProfe) {
                        console.log(`A nuevas respuestas del profe ${idProfe}`);
                    }
                    if (idActividad) {
                        console.log(`A nuevas respuestas en la actividad ${idActividad}`);
                    }

                    return contexto.pubsub.asyncIterator(NUEVA_PARTICIPACION_ESTUDIANTIL)
                },
                (payloadNuevaRespuesta: interfacePayloadNuevaRespuesta, variables, contexto: contextoQuery) => {

                    //Si la respuesta ocurre en un profe distinto al target de la subscricpion
                    if (variables.idProfe) {
                        if (payloadNuevaRespuesta.idCreadorActividad != variables.idProfe) {
                            return false
                        }
                    }
                    //Si la respuesta ocurre en un grupo distinto al target de la subscricpion
                    if (variables.idGrupo) {
                        if (variables.idGrupo != payloadNuevaRespuesta.idGrupo) {
                            return false
                        }
                    }
                    if (variables.idActividad) {
                        if (variables.idActividad != payloadNuevaRespuesta.idActividad) {
                            return false
                        }
                    }

                    //El usuario es el mismo que publicó la respuesta. No se le notifica, se maneja en el cliente con cache de apollo-vue
                    if (payloadNuevaRespuesta.nuevaRespuestaDesarrolloEstudiantil.participacion.idAutor == contexto.usuario.id) {
                        return false;
                    }

                    let permisosAmplios = [
                        "actividadesEstudiantiles-profe",
                        "actividadesEstudiantiles-administrador",
                        "actividadesEstudiantiles-guia"
                    ];

                    //Si no hace parte de los permisos amplios, es un estudiante. Solo tiene acceso a respuestas publicadas en sus propios desarrollos
                    if (!contexto.usuario.permisos.some(p => permisosAmplios.includes(p))) {
                        if (payloadNuevaRespuesta.idEstudianteDesarrollo != contexto.usuario.id) {
                            return false
                        }
                    }
                    console.log(`Notificando a ${contexto.usuario.username}`);
                    return true;
                }
            )
        }
    },
    Query: {
        desarrolloEnActividadEstudiantil: async function (_: any, { idDesarrollo, idActividad }: any, contexto: contextoQuery) {
            console.log(`Solicitud de desarrollo con id ${idDesarrollo} en la actividad con id ${idActividad}`);

            try {
                var elGrupo: any = await GrupoEstudiantil.findOne({ "actividades._id": mongoose.Types.ObjectId(idActividad) }).exec();
                if (!elGrupo) {
                    throw "Grupo no encontrado";
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
                var elUsuario: any = await Usuario.findById(idEstudiante).exec();
                if (!elUsuario) throw "Usuario no encontrado en la base de datos";
            } catch (error) {
                console.log(`Error buscando al usuario con id ${idEstudiante} en la base de datos. E: ${error}`);
                throw new ApolloError("Error conectando con la base de datos");
            }


            try {
                var elGrupo: any = await GrupoEstudiantil.findOne({ "actividades._id": mongoose.Types.ObjectId(idActividad) }).exec();
                if (!elGrupo) {
                    throw "Grupo no encontrado";
                }

            } catch (error) {
                console.log(`Error buscando la actividad en los grupos estudiantiles. E: ${error}`);
                throw new ApolloError("Error conectando con la base de datos");
            }

            let laActividad = elGrupo.actividades.id(idActividad);


            let elDesarrollo = laActividad.desarrollos.find(d => d.idEstudiante == idEstudiante);

            if (!elDesarrollo) elDesarrollo = [];
            console.log(`Enviando un desarrollo`);

            return elDesarrollo;

        },
        grupoEstudiantil: async function (_: any, { idGrupo }: any, contexto: contextoQuery) {
            console.log(`Peticion de un grupo estudiantil con id ${idGrupo}`);
            try {
                var elGrupoEstudiantil: any = await GrupoEstudiantil.findById(idGrupo, "_id nombre estudiantes").exec();
                if (!elGrupoEstudiantil) {
                    throw "grupo no encontrado"
                }
            } catch (error) {
                console.log(`Error buscando el grupo con ide ${idGrupo} en la base de datos. E:${error}`);
                throw new ApolloError("Error conectando con la base de datos");
            }

            elGrupoEstudiantil.id=elGrupoEstudiantil._id;
            console.log(`enviando el grupo estudiantil ${elGrupoEstudiantil.nombre} - ${elGrupoEstudiantil.id}`);
            return elGrupoEstudiantil;
        },
        async misActividadesCreadasGrupoEstudiantil(_: any, { idGrupo, pagina }, contexto: contextoQuery) {
            console.log(`Petición de actividades creadas por el usuario: pagina ${pagina}`);
            let credencialesUsuario = contexto.usuario;

            try {
                var elGrupo: any = await GrupoEstudiantil.findById(idGrupo).exec();
                if (!elGrupo) throw "Grupo no encontrado";
            } catch (error) {
                console.log(`Error buscando el grupo. E: ${error}`);
                return new ApolloError("Error conectando con la base de datos");
            }

            var ColeccionActividadesEsteGrupo = mongoose.model("actividadesGrupo" + elGrupo._id, esquemaActividad, "actividadesGrupo" + elGrupo._id);

            try {
                var numActividades = await ColeccionActividadesEsteGrupo.countDocuments({ idCreador: credencialesUsuario.id }).exec();
                var actividadesCreadasUsuario: any = await ColeccionActividadesEsteGrupo.find({ idCreador: credencialesUsuario.id }).sort({ fechaUpload: -1 }).limit(sizePaginaActividades).skip(pagina * sizePaginaActividades).exec();
            } catch (error) {
                console.log(`Error buscando actividades creadas por el usuario en la colección. E: ${error}`);
                return new ApolloError("Error conectando con la base de datos");
            }

            for (var i = 0; i < actividadesCreadasUsuario.length; i++) {
                actividadesCreadasUsuario[i].idGrupo = idGrupo;
            }

            let hayMas = pagina * sizePaginaActividades < numActividades;
            console.log(`Enviando actividades creadas por el usuario`);
            return { hayMas, actividades: actividadesCreadasUsuario }
        },
        async todasActividadesGrupoEstudiantil(_: any, { idGrupo, pagina }, contexto: contextoQuery) {
            console.log(`Petición de todas actividades de grupo. Pagina ${pagina}`);

            try {
                var elGrupo: any = await GrupoEstudiantil.findById(idGrupo).exec();
                if (!elGrupo) throw "Grupo no encontrado";
            } catch (error) {
                console.log(`Error buscando el grupo. E: ${error}`);
                return new ApolloError("Error conectando con la base de datos");
            }

            var ColeccionActividadesEsteGrupo = mongoose.model("actividadesGrupo" + elGrupo._id, esquemaActividad, "actividadesGrupo" + elGrupo._id);

            try {
                var numActividades = await ColeccionActividadesEsteGrupo.countDocuments({}).exec();
                var actividadesGrupo: any = await ColeccionActividadesEsteGrupo.find({}).sort({ fechaUpload: -1 }).limit(sizePaginaActividades).skip(pagina * sizePaginaActividades).exec();
            } catch (error) {
                console.log(`Error buscando actividades creadas por el usuario en la colección. E: ${error}`);
                return new ApolloError("Error conectando con la base de datos");
            }

            for (var i = 0; i < actividadesGrupo.length; i++) {
                actividadesGrupo[i].idGrupo = idGrupo;
            }

            let hayMas = pagina * sizePaginaActividades < numActividades;
            return { hayMas, actividades: actividadesGrupo }
        },
        gruposEstudiantiles: async function (_: any, __: any, contexto: contextoQuery) {
            console.log(`solicitud de todos los grupos estudiantiles`);
            let credencialesUsuario = contexto.usuario;
                    
            try {
                var gruposEstudiantiles: any = await GrupoEstudiantil.find({}, "_id nombre").exec();
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
                const ColeccionActividades = mongoose.model("actividadesGrupo" + idGrupo, esquemaActividad, "actividadesGrupo" + idGrupo);
                var laActividad: any = await ColeccionActividades.findById(idActividad).exec();
                if (!laActividad) {
                    throw "grupo no encontrado"
                }
            } catch (error) {
                console.log(`Error buscando grupo y actividad en la base de datos. E: ${error}`);
                throw new ApolloError("Error conectando con la base de datos");
            }            
            return laActividad;
        },
        actividadEstudiantil: async function (_: any, { idActividad }, contexto: contextoQuery) {
            //Get todos los ids de grupos.
            try {
                var losGrupos: any = await GrupoEstudiantil.find({}, "_id nombre").exec();

            } catch (error) {
                console.log('Error buscando grupos . E: ' + error);
                throw new ApolloError('Error conectando con la base de datos');
            }

            for (var i = 0; i < losGrupos.length; i++) {
                let idGrupo = losGrupos[i]._id;                
                try {
                    let ColeccionActividades = await mongoose.model("actividadesGrupo" + idGrupo, esquemaActividad, "actividadesGrupo" + idGrupo);
                    var laActividad: any = await ColeccionActividades.findById(idActividad).exec();
                    if (laActividad) {
                        laActividad.idGrupo = idGrupo
                        break;
                    }
                } catch (error) {
                    console.log('Error buscando la actividad en loop de grupos . E: ' + error);
                    throw new ApolloError('Error conectando con la base de datos');
                }
            }

            return laActividad;
        },
        actividadesEstudiantilesDeProfe: async function (_: any, { idProfe }: any, contexto: contextoQuery) {
            console.log(`Solicitud de actividades estudiantiles del profe con id ${idProfe}`);
            try {
                var losGrupos: any = await GrupoEstudiantil.find({ "actividades.idCreador": idProfe }).exec();
            } catch (error) {
                console.log(`Error fetching grupos en la base de datos: E: ${error}`);
                throw new ApolloError("Error conectando con la base de datos");
            }
            let actividadesDelProfe = losGrupos.reduce((acc, g) => { return acc.concat(g.actividades) }, []).filter(a => a.idCreador == idProfe);

            console.log(`Enviando ${actividadesDelProfe.length} actividades del profe: ${actividadesDelProfe}`);
            return actividadesDelProfe;
        },
        misActividadesEstudiantilesDeProfe: async function (_: any, { idProfe }: any, contexto: contextoQuery) {
            console.log(`Solicitud de actividades estudiantiles del profe con id ${idProfe} para el usuario`);
            let credencialesUsuario = contexto.usuario;
            if (!credencialesUsuario || !credencialesUsuario.id) {
                console.log("No habia credenciales de usuario")
                throw new AuthenticationError("No autorizado");
            }

            let idUsuario = credencialesUsuario.id;

            try {
                var losGrupos: any = await GrupoEstudiantil.find({ estudiantes: idUsuario }, "_id nombre").exec();
                if (!losGrupos) {
                    throw "grupo no encontrado"
                }
                if (losGrupos.length < 1) {
                    return [];
                }
            } catch (error) {
                console.log(`Error fetching grupos en la base de datos: E: ${error}`);
                throw new ApolloError("Error conectando con la base de datos");
            }

            var actividadesDelProfe = []

            for (var i = 0; i < losGrupos.length; i++) {
                var idGrupo = losGrupos[i]._id;
                var ColeccionActividadesEsteGrupo = mongoose.model("actividadesGrupo" + idGrupo, esquemaActividad, "actividadesGrupo" + idGrupo);
                try {
                    let actsProfe: any = await ColeccionActividadesEsteGrupo.find({ idCreador: idProfe }).sort({ fechaUpload: -1 }).exec();
                    for (var j = 0; j < actsProfe.length; j++) {
                        actsProfe[j].idGrupo = idGrupo;
                    }
                    actividadesDelProfe = actividadesDelProfe.concat(actsProfe);

                } catch (error) {
                    console.log(`Error armando el array de actividades del profe en el grupo ${idGrupo}`);
                }
            }

            return actividadesDelProfe;
        },
    },
    Mutation: {
        setLeidoPorProfeDesarrolloEstudiantil: async function (_: any, { idDesarrollo, idActividad, idGrupo, nuevoLeidoPorProfe }: any, contexto: contextoQuery) {
            try {
                var ColeccionActividadesEsteGrupo = mongoose.model("actividadesGrupo" + idGrupo, esquemaActividad, "actividadesGrupo" + idGrupo);

                let laActividad: any = await ColeccionActividadesEsteGrupo.findById(idActividad).exec();

                var elDesarrollo = laActividad.desarrollos.id(idDesarrollo);
                elDesarrollo.leidoPorProfe = nuevoLeidoPorProfe;
                await laActividad.save();


            } catch (error) {
                console.log(`Error buscando desarrollo en la base de datos: E: ${error}`);
                throw new ApolloError("Error conectando con la base de datos");
            }

            return elDesarrollo;

        },
        setEstadoDesarrolloActividadEstudiantil: async function (_: any, { idDesarrollo, idActividad, idGrupo, nuevoEstado }: any, contexto: contextoQuery) {
            try {
                var ColeccionActividadesEsteGrupo = mongoose.model("actividadesGrupo" + idGrupo, esquemaActividad, "actividadesGrupo" + idGrupo);

                let laActividad: any = await ColeccionActividadesEsteGrupo.findById(idActividad).exec();
                var elDesarrollo = laActividad.desarrollos.id(idDesarrollo);
                elDesarrollo.estado = nuevoEstado;
                await laActividad.save();

            } catch (error) {
                console.log(`Error buscando desarrollo en la base de datos: E: ${error}`);
                throw new ApolloError("Error conectando con la base de datos");
            }


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
                var elGrupoEstudiantil: any = await GrupoEstudiantil.findById(idGrupoEstudiantil).exec();
                if (!elGrupoEstudiantil) {
                    throw "grupo no encontrado"
                }
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
                var elUsuario:any = await Usuario.findById(idEstudiante).exec();
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
                var elGrupoEstudiantil: any = await GrupoEstudiantil.findById(idGrupo).exec();
                if (!elGrupoEstudiantil) {
                    throw "grupo no encontrado"
                }
            }
            catch (error) {
                console.log("Error buscando el grupo estudiantil en la base de datos. E: " + error);
                throw new ApolloError("Error de conexión con la base de datos");
            }


            try {
                var elUsuario:any = await Usuario.findById(idEstudiante).exec();
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
                var elGrupoEstudiantil: any = await GrupoEstudiantil.findById(idGrupo).exec();
                if (!elGrupoEstudiantil) {
                    throw "grupo no encontrado"
                }
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

            try {
                var elUsuario: any = await Usuario.findById(credencialesUsuario.id).exec();
                if (!elUsuario) throw "Usuario no encontrado";
            } catch (error) {
                console.log(`Error buscando usuario en la base de datos`);
                throw new ApolloError("Error conectando con la base de datos");
            }
            var infoCreador = {
                id: elUsuario._id,
                nombres: elUsuario.nombres,
                apellidos: elUsuario.apellidos,
                username: elUsuario.username
            }

            console.log(`creando una nueva actividad en el grupo ${elGrupoEstudiantil.nombre}`);
            try {
                var ColeccionActividadesEsteGrupo = mongoose.model("actividadesGrupo" + idGrupo, esquemaActividad, "actividadesGrupo" + idGrupo);
                var nuevaActividad: any = await new ColeccionActividadesEsteGrupo({ idCreador: credencialesUsuario.id, infoCreador });

                await nuevaActividad.save();
            }
            catch (error) {
                console.log("Error guardando la actividad creada en el grupo. E: " + error);
                throw new ApolloError("Error conectando con la base de datos");
            }
            console.log(`Actividad creada exitosamente: ${nuevaActividad._id}`);
            nuevaActividad.idGrupo = idGrupo;
            return nuevaActividad;

        },
        eliminarActividadDeGrupoEstudiantil: async function (_: any, { idActividad, idGrupo }: any, contexto: contextoQuery) {
            console.log(`peticion de eliminar una actividad con id ${idActividad} de un grupo con id ${idGrupo}`);

            var ColeccionActividadesEsteGrupo = mongoose.model("actividadesGrupo" + idGrupo, esquemaActividad, "actividadesGrupo" + idGrupo);

            try {
                var elGrupo: any = await GrupoEstudiantil.findById(idGrupo).exec();
                if (!elGrupo) {
                    throw "grupo no encontrado"
                }
                var laActividad:any = await ColeccionActividadesEsteGrupo.findById(idActividad).exec();
                if(!laActividad) throw "Actividad no encontrada"
            }
            catch (error) {
                console.log("Error buscando el grupo en la base de datos. E: " + error);
                throw new ApolloError("Error conectando con la base de datos");
            }

            console.log(`Grupo ${elGrupo.nombre}`);

            //Authorización
            let credencialesUsuario = contexto.usuario;
            if (!credencialesUsuario.permisos.includes("actividadesEstudiantiles-administrador") && !credencialesUsuario.permisos.includes("superadministrador") && laActividad.idCreador != credencialesUsuario.id) {
                console.log(`Error de autenticacion editando nombre de grupo`);
                throw new AuthenticationError("No autorizado");
            }

            try {
                await ColeccionActividadesEsteGrupo.findByIdAndDelete(idActividad);
            }
            catch (error) {
                console.log(`Error eliminando la actividad. E: ` + error);
                throw new ApolloError("Error conectando con la base de datos");
            }


            //Eliminando carpeta
            
            return true;
        },
        async cambiarNombreActividadEstudiantil(_: any, { idActividad, nuevoNombre, idGrupo }, contexto: contextoQuery) {
        
            var charProhibidosNombre = /[^ a-zA-ZÀ-ž0-9_():.,-]/g;

            nuevoNombre = nuevoNombre.replace(/\s\s+/g, " ");
            if (charProhibidosNombre.test(nuevoNombre)) {
                throw new ApolloError("Nombre ilegal");
            }
            nuevoNombre = nuevoNombre.trim();
            var ColeccionActividadesEsteGrupo = mongoose.model("actividadesGrupo" + idGrupo, esquemaActividad, "actividadesGrupo" + idGrupo);

            //Authorización
            let credencialesUsuario = contexto.usuario;

            try {
                var laActividad: any = await ColeccionActividadesEsteGrupo.findById(idActividad).exec();
                if (!laActividad) throw "Actividad no encontrada"
            } catch (error) {
                console.log('Error buscando actividad en el grupo . E: ' + error);
                throw new ApolloError('Error conectando con la base de datos');
            }

            if (laActividad.idCreador != credencialesUsuario.id && !credencialesUsuario.permisos.includes("superadministrador")) {
                console.log(`Error de autenticacion editando nombre de grupo`);
                throw new AuthenticationError("No autorizado");
            }

            try {
                var resultado = await ColeccionActividadesEsteGrupo.findByIdAndUpdate(idActividad, { nombre: nuevoNombre }, { new: true }).exec();
            }
            catch (error) {
                console.log("Error guardando el nombre modificado en la base de datos. E: " + error);
                throw new ApolloError("Error cambiando el nombre de la actividad");
            }
            return resultado;
        },
        eliminarParticipacionActividadEstudiantil: async function (_: any, { idParticipacion, idDesarrollo, idActividad, idGrupo }: any, contexto: contextoQuery) {
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

            var ColeccionActividadesEsteGrupo = mongoose.model("actividadesGrupo" + idGrupo, esquemaActividad, "actividadesGrupo" + idGrupo);


            try {
                var laActividad: any = await ColeccionActividadesEsteGrupo.findById(idActividad).exec();
                let elDesarrollo = laActividad.desarrollos.id(idDesarrollo);
                let lasParticipaciones = elDesarrollo.participaciones;

                lasParticipaciones.pull({ _id: idParticipacion });

                if (elDesarrollo.participaciones.length < 1) {
                    let idDesarrollo = elDesarrollo.id
                    laActividad.desarrollos.pull({ _id: idDesarrollo });
                }

            } catch (error) {
                console.log(`Error editando actividad: E: ${error}`);
                throw new ApolloError("Error conectando con la base de datos");
            }

            try {
                await laActividad.save();
            } catch (error) {
                console.log(`Error guardando el grupo modificado en la base de datos. E: ${error}`);
                throw new ApolloError("Error conectando con la base de datos");
            }

            return true;
        },
        async publicarRespuestaActividadEstudiantil(_: any, { idGrupo, idActividad, idDesarrollo, nuevaRespuesta, nuevoDesarrollo }: any, contexto: contextoQuery) {
            console.log(`Solicitud de publicar respuesta ${JSON.stringify(nuevaRespuesta)}`);
            let credencialesUsuario = contexto.usuario;
            let permisosEspeciales = ["superadministrador", "actividadesEstudiantiles-administrador", "actividadesEstudiantiles-guia", "actividadesEstudiantiles-profe"];

            try {
                var elUsuario: any = await Usuario.findById(credencialesUsuario.id).exec();
                if (!elUsuario) throw "Usuario no encontrado"
            } catch (error) {
                console.log('Error identificando al autor . E: ' + error);
                throw new AuthenticationError('Error de credenciales');
            }

            try {
                var elGrupo: any = await GrupoEstudiantil.findById(idGrupo).exec()
                if (!elGrupo) throw "Grupo no encontrado"
            } catch (error) {
                console.log('Error buscando el grupo . E: ' + error);
                throw new ApolloError('${error conectando con la base de datos}');
            }

            var ColeccionActividadesEsteGrupo = mongoose.model("actividadesGrupo" + idGrupo, esquemaActividad, "actividadesGrupo" + idGrupo);

            var usuarioYaTeniaDesarrollo=false;
           
            try {
                var laActividad: any = await ColeccionActividadesEsteGrupo.findById(idActividad).exec();         
                if (!laActividad) throw "Actividad no encontrada";
                
                if(laActividad.desarrollos.some(d=>d.infoEstudiante.id==elUsuario._id)){
                    usuarioYaTeniaDesarrollo=true;
                }
                if (nuevoDesarrollo) {      
                    
                    if(usuarioYaTeniaDesarrollo){
                        throw "Intentando crear un nuevo desarrollo para un usuario que ya tenía desarrollo";
                    }

                    var desarrolloCreado = laActividad.desarrollos.create({
                        idEstudiante: elUsuario._id,
                        participaciones: [],
                        infoEstudiante: {
                            id: elUsuario._id,
                            nombres: elUsuario.nombres,
                            apellidos: elUsuario.apellidos,
                            username: elUsuario.username,
                        }
                    })
                    laActividad.desarrollos.push(desarrolloCreado);
                    idDesarrollo = desarrolloCreado._id;
                } 
                var elDesarrollo = laActividad.desarrollos.id(idDesarrollo);
            } catch (error) {
                console.log('Error buscando actividad y desarrollo. E: ' + error);
                throw new ApolloError('Error conectando con la base de datos');
            }

            if (elDesarrollo.estado == "completado") {
                console.log(`Este desarrollo estaba marcado como completado.`);
                throw new Error("El desarrollo ya esta completado");
            }

            var charProhibidosMensaje = /[^\n\r a-zA-ZÀ-ž0-9_():;.,+¡!¿?@*="&#-]/;
            var mensaje = nuevaRespuesta.mensaje;
            if (charProhibidosMensaje.test(mensaje)) {
                console.log(`Rechazando mensaje ${mensaje} por tener caracteres no válidos: ${mensaje.replace(charProhibidosMensaje, "*")}`);
                throw new UserInputError('Mensaje con caracteres inválidos');
            }

            //Creando la nueva participacion

            nuevaRespuesta.comentario = mensaje;
            nuevaRespuesta.archivo = nuevaRespuesta.infoArchivo;
            nuevaRespuesta.idAutor = elUsuario._id;
            nuevaRespuesta.infoAutor = {
                id: elUsuario._id,
                nombres: elUsuario.nombres,
                apellidos: elUsuario.apellidos,
                username: elUsuario.username
            }

            var laRespuesta = elDesarrollo.participaciones.create(nuevaRespuesta);

            if (elDesarrollo.idEstudiante == laRespuesta.idAutor) {
                elDesarrollo.leidoPorProfe = false;
            }

            elDesarrollo.participaciones.push(laRespuesta);

            try {
                await laActividad.save();
            } catch (error) {
                console.log(`Error guardando la actividad: E: ${error}`);
                throw new ApolloError('Error conectando con la base de datos');
            }

            var notificacion = new Notificacion({
                texto: "Nueva respuesta",
                elementoTarget: {
                    tipo: "actividadEstudiantil",
                    id: laActividad._id,
                    nombre: laActividad.nombre
                },
                causante: {
                    tipo: "persona",
                    id: elUsuario._id
                }
            });

            const pubsub = contexto.pubsub;
            //Pregunta si notificar al estudiante del desarrollo de la actividad.
            if (laRespuesta.idAutor != elDesarrollo.idEstudiante) {
                try {
                    await Usuario.findByIdAndUpdate(elDesarrollo.idEstudiante, { $push: { notificaciones: notificacion } }).exec();
                    pubsub.publish(NUEVA_NOTIFICACION_PERSONAL, { idNotificado: elDesarrollo.idEstudiante, nuevaNotificacion: notificacion });
                } catch (error) {
                    console.log(`Error creando una notificacion con para ${elDesarrollo.idEstudiante}`);
                }
            }

            //Pregunta si notificar al autor de la actividad
            if (laRespuesta.idAutor != laActividad.idCreador) {
                try {
                    await Usuario.findByIdAndUpdate(laActividad.idCreador, { $push: { notificaciones: notificacion } }).exec();
                    pubsub.publish(NUEVA_NOTIFICACION_PERSONAL, { idNotificado: laActividad.idCreador, nuevaNotificacion: notificacion });
                } catch (error) {
                    console.log(`Error creando una notificacion para ${laActividad.idCreador}`);
                }
            }

            try {
                //El estudiante de este desarrollo es notificado                
                pubsub.publish(NUEVA_PARTICIPACION_ESTUDIANTIL, {
                    nuevaRespuestaDesarrolloEstudiantil: {
                        participacion: laRespuesta,
                        idDesarrollo: elDesarrollo._id
                    },
                    idEstudianteDesarrollo: elDesarrollo.idEstudiante,
                    idDesarrollo: elDesarrollo._id,
                    idCreadorActividad: laActividad.idCreador,
                    idGrupo: elGrupo._id,
                    idActividad: laActividad._id
                });
            } catch (error) {
                console.log(`Error publicando en pubsub la nueva respuesta. E: ${error}`);
            }

            var ResultadoPublicar = {
                nuevaRespuesta: laRespuesta,
                nuevoDesarrollo: null
            }

            if (nuevoDesarrollo) {
                ResultadoPublicar.nuevoDesarrollo = elDesarrollo;
            }

            return ResultadoPublicar
        }
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

    ActividadGrupoEstudiantil: {
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
                return ""
            }

            if (parent.guiaGoogleDrive && parent.guiaGoogleDrive.enlace) {
                return parent.guiaGoogleDrive.enlace;
            }
            else {
                return "";
            }
            return "";


        },
        id: async function (parent: any) {
            return parent._id;
        }
    },
}


