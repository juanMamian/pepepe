import { ApolloError, AuthenticationError, gql, withFilter } from "apollo-server-express";
import mongoose from "mongoose";
import fs from "fs";
import { ModeloForo as Foro } from "../model/Foros/Foro";
import { ModeloProyecto as Proyecto } from "../model/Proyecto";
import { ModeloConversacion as Conversacion, esquemaRespuestaConversacion, charProhibidosMensajeRespuesta } from "../model/Foros/Conversacion";
import { ModeloUsuario as Usuario } from "../model/Usuario";
import path from "path"
import { contextoQuery } from "./tsObjetos"
import { drive, jwToken } from "../routes/utilidades"
import { ModeloNodo as NodoConocimiento } from "../model/atlas/Nodo";
import { ModeloTrabajo as Trabajo } from "../model/Trabajo"; const Nodo = require("../model/atlas/Nodo");
import { ModeloLibro as Libro } from "../model/cuentos/Libro";


export const typeDefs = gql`

    input InputNuevaRespuesta{
        mensaje:String,
        infoArchivo:InfoArchivoSubido,
        enlaceAdjunto:[String],
    }

    input InputParent{
        id:ID,
        nombre:String,
        tipo: String,
    }

    input InputIniciarConversacion{
        titulo:String,
        primeraRespuesta:InputNuevaRespuesta
    }

    type RespuestaConversacionForo{
        id: ID
        fecha:Date,
        archivo:InfoArchivo,
        mensaje:String,
        enlaceAdjunto:[String],
        autor: PublicUsuario,
        infoAutor:PublicUsuario,
    }

    type InfoRespuestasPaginasConversacion{
        numPaginas: Int,
        pagina:Int,
        respuestas: [RespuestaConversacionForo]
    }

    type InfoConversacionesPaginaForo{
        numPaginas: Int,
        pagina:Int,
        conversaciones: [Conversacion]
    }

    type InfoUltimaRespuesta{
        autor:PublicUsuario,
        fecha:Date
    }

    type Conversacion{
        id:ID,
        titulo: String,
        estado:String,
        creador: PublicUsuario,
        acceso:String,
        cantidadRespuestas:Int,
        infoUltimaRespuesta:InfoUltimaRespuesta,        
    }
  
    type Foro{
        id:ID,
        acceso:String,
        miembros:[String]       
        conversaciones:[Conversacion], 
    }

    extend type Query{
        foro(idForo:ID!):Foro,
        numPaginasConversacion(idConversacion: ID!):Int
        numPagsConversacionesForo(idForo: ID!):Int
        respuestasPaginaDeConversacion(idConversacion:ID!, pagina: Int!):InfoRespuestasPaginasConversacion,
        conversacionesPaginaForo(idForo:ID!, pagina: Int!):InfoConversacionesPaginaForo
    }

    extend type Mutation{
        iniciarConversacionConPrimerMensajeForo(idForo: ID!, input: InputIniciarConversacion, parent:InputParent):Conversacion,
        eliminarRespuesta(idRespuesta:ID!, idConversacion:ID!):Boolean,
        postRespuestaConversacion(idConversacion: ID!, nuevaRespuesta: InputNuevaRespuesta, parent: InputParent):RespuestaConversacionForo,
        setCantidadRespuestasConversacionLeidasPorUsuario(idUsuario:ID!, idForo:ID!, idConversacion: ID!, cantidadRespuestasLeidas:Int!):Boolean
        setTodasRespuestasConversacionLeidasPorUsuario(idUsuario:ID!, idForo:ID!, idConversacion: ID!):Int
    }

`;

const sizePaginaConversacion = 5;
const sizePaginaForo = 6

export const resolvers = {
    Query: {
        async foro(_: any, { idForo }, contexto: contextoQuery) {
            try {
                var elForo: any = await Foro.findById(idForo).exec();
                if (!elForo) {
                    throw "foro no encontrado"
                }
            } catch (error) {
                console.log(`Error buscando el foro con id ${idForo} en la base de datos. E:${error}`);
                throw new ApolloError("Error conectando con la base de datos");
            }

            return elForo;
        },
        async numPaginasConversacion(_: any, { idConversacion }, __: any) {

            let Respuesta = mongoose.model("respuestasDeConversacion" + idConversacion, esquemaRespuestaConversacion, "respuestasDeConversacion" + idConversacion);
            try {
                var num: any = await Respuesta.countDocuments().exec();
                var pags = Math.ceil(num / sizePaginaConversacion);
            } catch (error) {
                console.log(`Error contando las respuestas. E: ${error}`);
                return 0
            }
            return pags;
        },
        async numPagsConversacionesForo(_: any, { idForo }, __: any) {

            try {
                let elForo: any = await Foro.findById(idForo).exec();
                let num = elForo.conversaciones.length;
                var pags = Math.ceil(num / sizePaginaForo);
            } catch (error) {
                console.log(`Error contando las conversaciones. E: ${error}`);
                return 0
            }
            return pags;
        },
        async respuestasPaginaDeConversacion(_: any, { idConversacion, pagina }, __: any) {
            let Respuesta = mongoose.model("respuestasDeConversacion" + idConversacion, esquemaRespuestaConversacion, "respuestasDeConversacion" + idConversacion);
            let numRespuestas: any = await Respuesta.countDocuments().exec();

            var numPaginas = 0;
            if (numRespuestas > 0) {
                numPaginas = Math.ceil(numRespuestas / sizePaginaConversacion);
            }


            if (pagina < 1 || pagina > numPaginas) {
                pagina = numPaginas;
            }

            try {
                var lasRespuestas: any = await Respuesta.find({}).limit(sizePaginaConversacion).skip((pagina - 1) * sizePaginaConversacion).exec();
            } catch (error) {
                console.log(`Error descargando respuestas`);
                new ApolloError("Error conectando con la base de datos");
            }
            return { numPaginas, pagina, respuestas: lasRespuestas };
        },
        async conversacionesPaginaForo(_: any, { idForo, pagina }, __: any) {
            console.log(`Solicitud de conversaciones de foro ${idForo} para la página ${pagina}`);
            try {
                var elForo: any = await Foro.findById(idForo).exec();
                if (!elForo) {
                    throw "Foro no encontrado"
                }
            } catch (error) {
                console.log(`Error buscando el foro`);
                new ApolloError("Error conectando con la base de datos");
            }
            
            let todasConversaciones = elForo.conversaciones.sort((b, a)=>a.infoUltimaRespuesta.fecha-b.infoUltimaRespuesta.fecha);

            let numConversaciones = todasConversaciones.length;
            console.log(`Hay un total de ${numConversaciones}`);

            var numPaginas = 0;
            if (numConversaciones > 0) {
                numPaginas = Math.ceil(numConversaciones / sizePaginaForo);
            }
            if (pagina < 1 || pagina > numPaginas) {
                pagina = 1;
            }

            let conversacionesPagina = todasConversaciones.splice((pagina - 1) * sizePaginaForo, sizePaginaForo);
            return { pagina, numPaginas, conversaciones: conversacionesPagina };
        }


    },
    Mutation: {

        async iniciarConversacionConPrimerMensajeForo(_: any, { idForo, input, parent }: any, contexto: contextoQuery) {
            console.log(`|||||||||||||||||||||`);
            console.log(`Recibida solicitud de iniciar una conversacion con primera respuesta en foro con id ${idForo} con input: ${JSON.stringify(input)}`);

            try {
                var elForo: any = await Foro.findById(idForo).exec();
                if (!elForo) {
                    throw "foro no encontrado"
                }
            }
            catch (error) {
                console.log("Foro no encontrado. E: " + error);
                throw new ApolloError("Error conectandose con la base de datos");
            }

            //Authorización
            let permisosEspeciales = ["superadministrador"]
            let credencialesUsuario = contexto.usuario;

            try {
                var elUsuario: any = await Usuario.findById(credencialesUsuario.id).exec();
            } catch (error) {
                console.log(`Error buscando al usuario en la base de datos. E:${error}`);
                throw new AuthenticationError("No autorizado");
            }

            if (elForo.acceso == "privado") {
                if (!elForo.miembros.includes(credencialesUsuario.id) && !credencialesUsuario.permisos.some(p => permisosEspeciales.includes(p))) {
                    console.log(`Error de autenticacion para crear conversacio en el foro`);
                    throw new AuthenticationError("No autorizado");
                }
            }
            const charProhibidosTitulo = /[^ a-zA-ZÀ-ž0-9_():.,-¡!¿?]/;
            let titulo = input.titulo;
            titulo = titulo.trim();
            titulo = titulo.replace(/\s\s+/g, " ");
            if (charProhibidosTitulo.test(titulo)) {
                console.log(`El titulo contenia caracteres ilegales`);
                throw new ApolloError("Titulo ilegal");
            }

            let primeraRespuesta = input.primeraRespuesta;

            let mensaje = primeraRespuesta.mensaje;
            mensaje = mensaje.trim();
            if (charProhibidosMensajeRespuesta.test(mensaje)) {
                console.log(`El mensaje contenia caracteres ilegales`);
                throw new ApolloError("Mensaje ilegal");
            }

            primeraRespuesta.mensaje = mensaje;
            primeraRespuesta.archivo = primeraRespuesta.infoArchivo;

            primeraRespuesta.idAutor = credencialesUsuario.id;
            let infoAutor = {
                id: elUsuario._id,
                nombres: elUsuario.nombres,
                apellidos: elUsuario.apellidos,
                username: elUsuario.username,
            }
            primeraRespuesta.infoAutor = infoAutor;


            let nuevaConversacion = elForo.conversaciones.create({
                titulo,
                idCreador: credencialesUsuario.id,
                acceso: "publico",
                cantidadRespuestas: 1
            });

            let idConversacion = nuevaConversacion._id;

            try {
                await elForo.conversaciones.push(nuevaConversacion);

                let Respuesta = mongoose.model("respuestasDeConversacion" + idConversacion, esquemaRespuestaConversacion, "respuestasDeConversacion" + idConversacion);
                let laRespuesta = new Respuesta(primeraRespuesta);
                await laRespuesta.save();
                await elForo.save();
            } catch (error) {
                console.log(`Error guardando el foro con la nueva conversacion. E: ${error}`);
                throw new ApolloError("Error conectando con la base de datos");
            }

            //Crear notificacion para los miembros del parent.

            console.log(`Creando notificacion para los miembros del ${parent.tipo} ${parent.nombre}`);
            try {
                if (parent.tipo == "proyecto") {
                    var elParent: any = await Proyecto.findById(parent.id, "_id responsables").exec();
                    var idsMiembros = elParent.responsables;
                }
                else if (parent.tipo == "trabajo") {
                    var elParent: any = await Trabajo.findById(parent.id, "_id responsables").exec();
                    var idsMiembros = elParent.responsables;
                }
                else if (parent.tipo == "nodoConocimiento") {
                    var elParent: any = await NodoConocimiento.findById(parent.id, "_id expertos").exec();
                    var idsMiembros = elParent.expertos;
                }
                else if (parent.tipo == "libro") {
                    var elParent: any = await Libro.findById(parent.id, "_id idsEditores").exec();
                    var idsMiembros = elParent.idsEditores;
                }
                else if(parent.tipo == "forosGenerales") {
                    var idsMiembros:any=[];                    
                }
                else {
                    console.log(`Error: tipo de parent no reconocido`);
                }

            } catch (error) {
                console.log(`Error recopilando la lista de miembros. E: ${error}`);
            }

            if (idsMiembros) {
                console.log(`notificando a ${idsMiembros.length} usuarios: ${idsMiembros}`);
                let indexU = idsMiembros.indexOf(credencialesUsuario.id);
                if (indexU > -1) {
                    idsMiembros.splice(indexU, 1);
                }

                for (let idMiembro of idsMiembros) {
                    try {
                        let elNotificado: any = await Usuario.findById(idMiembro).exec();
                        if (!elNotificado) throw "Notificado " + idMiembro + " no encontrado";
                        var indexNotificacion = elNotificado.notificacionesActividadForos.findIndex(n => n.tipoParent == parent.tipo && n.idParent == parent.id);
                        if (indexNotificacion > -1) {
                            console.log(`Ya existía notificacion (${indexNotificacion}) de actividad en este elemento con cantidad ${elNotificado.notificacionesActividadForos[indexNotificacion].numeroRespuestasNuevas}`);
                            elNotificado.notificacionesActividadForos[indexNotificacion].numeroRespuestasNuevas++;
                        }
                        else {
                            elNotificado.notificacionesActividadForos.push({
                                idParent: parent.id,
                                tipoParent: parent.tipo,
                                nombreParent: parent.nombre,
                                numeroRespuestasNuevas: 1,
                            });
                        }
                        await elNotificado.save();
                    } catch (error) {
                        console.log(`Error buscando el notificado: E: ${error}`);
                    }
                }
            }


            console.log(`Nueva conversacion creada`);
            return nuevaConversacion;

        },
        async eliminarRespuesta(_: any, { idRespuesta, idConversacion }: any, contexto: contextoQuery) {
            console.log(`|||||||||||||||||`);
            console.log(`Solicitud de eliminar una respuesta con id ${idRespuesta}`);

            let Respuesta = mongoose.model("respuestasDeConversacion" + idConversacion, esquemaRespuestaConversacion, "respuestasDeConversacion" + idConversacion);
            try {
                var laRespuesta: any = await Respuesta.findById(idRespuesta).exec();
                if (!laRespuesta) {
                    throw "Respuesta no encontrada"
                }
            } catch (error) {
                console.log(`Error buscando la respuesta. E: ${error}`);
                throw new ApolloError("Error conectando con la base de datos");
            }

            //Authorización
            let permisosEspeciales = ["superadministrador"]
            let credencialesUsuario = contexto.usuario;

            if (credencialesUsuario.id != laRespuesta.idAutor && !credencialesUsuario.permisos.some(p => permisosEspeciales.includes(p))) {
                console.log(`Error de autorización`);
                throw new AuthenticationError("No autorizado");
            }

            try {
                await Respuesta.findByIdAndDelete(idRespuesta).exec();
            } catch (error) {
                console.log(`Error eliminando respuesta. E: ${error}`);
            }

            const cantRespuestas: number = await Respuesta.countDocuments().exec();

            if (cantRespuestas < 1) {
                console.log(`La conversación quedó vacía. Eliminando`);

                try {
                    let elForo: any = await Foro.findOne({ "conversaciones._id": idConversacion }).exec();
                    if (!elForo) {
                        console.log(`Foro no encontrado`);
                        throw "Foro no encontrado";
                    }
                    elForo.conversaciones.id(idConversacion).remove();
                    await elForo.save();
                } catch (error) {
                    console.log(`Error buscando y guardando el foro para eliminar la conversación`);
                }
                console.log(`Conversación eliminada del foro`);

                mongoose.connection.db.dropCollection("respuestasDeConversacion" + idConversacion, function (
                    err,
                    result
                ) {
                    if (err) {
                        console.log(`Error eliminando la coleccion. E: ${err}`);
                    }
                    console.log("Collection droped");
                });

            }
            else {
                //Actualizar el número de respuestas en esta conversación
                console.log(`Setting cant respuestas en ${cantRespuestas}`);

                try {
                    let elForo: any = await Foro.findOne({ "conversaciones._id": idConversacion }).exec();
                    if (!elForo) {
                        console.log(`Foro no encontrado`);
                        throw "Foro no encontrado";
                    }
                    elForo.conversaciones.id(idConversacion).cantidadRespuestas = cantRespuestas;
                    await elForo.save();
                } catch (error) {
                    console.log(`Error actualizando la cantidad de respuestas en esta conversación`);
                    throw new ApolloError("Error conectando con la base de datos");
                }
            }
            console.log(`Respuesta eliminada`);

            return true;

        },
        async postRespuestaConversacion(_: any, { idConversacion, nuevaRespuesta, parent }: any, contexto: contextoQuery) {
            console.log(`||||||||||||||||||||||||||||||||`);
            console.log(`Peticion de post respuesta en la conversación con id ${idConversacion}`);
            console.log(`La respuesta será: ${JSON.stringify(nuevaRespuesta)}`);

            try {
                var elForo: any = await Foro.findOne({ "conversaciones._id": idConversacion }).exec();
                if (!elForo) {
                    throw "Foro no existía"
                }
            } catch (error) {
                console.log(`Error buscando el foro de la conversación. E: ${error}`);
                throw new ApolloError("Error conectando con la base de datos");
            }

            //Authorización
            let permisosEspeciales = ["superadministrador"]
            let credencialesUsuario = contexto.usuario;

            try {
                var elUsuario: any = await Usuario.findById(credencialesUsuario.id).exec();
            } catch (error) {
                console.log(`Error buscando al usuario en la base de datos. E:${error}`);
                throw new AuthenticationError("No autorizado");
            }

            let laConversacion = elForo.conversaciones.id(idConversacion);
            if (!laConversacion) {
                console.log(`La conversación no existía`);
                throw new ApolloError("Error conectando con la base de datos");
            }

            if (laConversacion.acceso == "privado") {
                if (!elForo.miembros.includes(credencialesUsuario.id) && !credencialesUsuario.permisos.some(p => permisosEspeciales.includes(p))) {
                    console.log(`Error de autenticacion para crear conversacio en el foro`);
                    throw new AuthenticationError("No autorizado");
                }
            }

            let mensaje = nuevaRespuesta.mensaje;
            mensaje = mensaje.trim();
            if (charProhibidosMensajeRespuesta.test(mensaje)) {
                console.log(`El mensaje contenia caracteres ilegales`);
                throw new ApolloError("Mensaje ilegal");
            }

            nuevaRespuesta.mensaje = mensaje;
            nuevaRespuesta.archivo = nuevaRespuesta.infoArchivo;

            nuevaRespuesta.idAutor = credencialesUsuario.id;
            let infoAutor = {
                id: elUsuario._id,
                nombres: elUsuario.nombres,
                apellidos: elUsuario.apellidos,
                username: elUsuario.username,
            }
            nuevaRespuesta.infoAutor = infoAutor;


            console.log(`En la conversación ${laConversacion.titulo}`);


            let Respuesta = mongoose.model("respuestasDeConversacion" + idConversacion, esquemaRespuestaConversacion, "respuestasDeConversacion" + idConversacion);

            try {
                var ultimaRespuesta:any=await Respuesta.findOne({}).sort({fecha:-1}).limit(1).exec();
                if(!ultimaRespuesta)throw "Ultima respuesta no encontrada";
                var ultimoRespondedor=ultimaRespuesta.idAutor;
            } catch (error) {
                console.log(`Error buscando la ultima respuesta. E: ${error}`);
            }
            
            const laRespuesta = new Respuesta(nuevaRespuesta);

            try {
                await laRespuesta.save();
            } catch (error) {
                console.log(`Error guardando la respuesta. E: ${error}`);
                throw new ApolloError("Error conectando con la base de datos");
            }
            let cantRespuestas: number = await Respuesta.countDocuments().exec();
            console.log(`Cant respuestas después: ${cantRespuestas}`);
            try {
                laConversacion.cantidadRespuestas = cantRespuestas;
                laConversacion.infoUltimaRespuesta = {
                    idAutor: credencialesUsuario.id,
                    fecha:Date.now()
                }
                await elForo.save();
            } catch (error) {
                console.log(`Error guardando cant respuestas y info ultima respuesta. E: ${error}`);
            }

            //Crear notificacion para los miembros del parent.

            console.log(`Creando notificacion para los miembros del ${parent.tipo} ${parent.nombre}`);
            try {
                if (parent.tipo == "proyecto") {
                    var elParent: any = await Proyecto.findById(parent.id, "_id responsables").exec();
                    var idsMiembros = elParent.responsables;
                }
                else if (parent.tipo == "trabajo") {
                    var elParent: any = await Trabajo.findById(parent.id, "_id responsables").exec();
                    var idsMiembros = elParent.responsables;
                }
                else if (parent.tipo == "nodoConocimiento") {
                    var elParent: any = await NodoConocimiento.findById(parent.id, "_id expertos").exec();
                    var idsMiembros = elParent.expertos;
                }
                else if (parent.tipo == "libro") {
                    var elParent: any = await Libro.findById(parent.id, "_id idsEditores").exec();
                    var idsMiembros = elParent.idsEditores;
                }
                else {
                    console.log(`Error: tipo de parent no reconocido`);
                }

            } catch (error) {
                console.log(`Error recopilando la lista de miembros. E: ${error}`);
            }
            if(idsMiembros && !idsMiembros.includes(ultimoRespondedor)){
                idsMiembros.push(ultimoRespondedor);
            }

            if (idsMiembros) {
                console.log(`notificando a ${idsMiembros.length} usuarios: ${idsMiembros}`);
                let indexU = idsMiembros.indexOf(credencialesUsuario.id);
                if (indexU > -1) {
                    idsMiembros.splice(indexU, 1);
                }

                for (let idMiembro of idsMiembros) {
                    try {
                        let elNotificado: any = await Usuario.findById(idMiembro).exec();
                        if (!elNotificado) throw "Notificado " + idMiembro + " no encontrado";
                        var indexNotificacion = elNotificado.notificacionesActividadForos.findIndex(n => n.tipoParent == parent.tipo && n.idParent == parent.id);
                        if (indexNotificacion > -1) {
                            console.log(`Ya existía notificacion (${indexNotificacion}) de actividad en este elemento con cantidad ${elNotificado.notificacionesActividadForos[indexNotificacion].numeroRespuestasNuevas}`);
                            elNotificado.notificacionesActividadForos[indexNotificacion].numeroRespuestasNuevas++;
                        }
                        else {
                            elNotificado.notificacionesActividadForos.push({
                                idParent: parent.id,
                                tipoParent: parent.tipo,
                                nombreParent: parent.nombre,
                                numeroRespuestasNuevas: 1,
                            });
                        }
                        await elNotificado.save();
                    } catch (error) {
                        console.log(`Error buscando el notificado: E: ${error}`);
                    }
                }
            }
            console.log(`Respuesta posted`);

            return laRespuesta;

        },
        async setCantidadRespuestasConversacionLeidasPorUsuario(_: any, { idUsuario, idForo, idConversacion, cantidadRespuestasLeidas }: any, contexto: contextoQuery) {
            console.log(`///////////////////`);
            console.log(`Setting respuestas leidas en conversacion ${idConversacion} en foro con id ${idForo}`);
            const credencialesUsuario = contexto.usuario;
            if (idUsuario != credencialesUsuario.id) {
                throw new AuthenticationError("No autorizado");
            }

            try {
                var elUsuario: any = await Usuario.findById(idUsuario).select("foros").exec();
                if (!elUsuario) throw "Usuario no encontrado en la base de datos";
            } catch (error) {
                console.log(`Error buscando el usuario. E: ${error}`);
                throw new ApolloError("Error conectando con la base de datos");
            }

            var infoForo = elUsuario.foros.find(f => f.idForo == idForo);
            if (!infoForo) {
                var nuevoInfoForo = {
                    idForo,
                    conversaciones: []
                }
                elUsuario.foros.push(nuevoInfoForo);
                infoForo = elUsuario.foros.find(f => f.idForo == idForo);
            }

            var infoConversacion = infoForo.conversaciones.find(c => c.idConversacion == idConversacion);
            if (!infoConversacion) {
                var nuevoInfoConversacion = {
                    idConversacion,
                    respuestasLeidas: 0,
                };
                infoForo.conversaciones.push(nuevoInfoConversacion);
                infoConversacion = infoForo.conversaciones.find(c => c.idConversacion == idConversacion);
            }

            infoConversacion.respuestasLeidas = cantidadRespuestasLeidas;


            try {
                await elUsuario.save();
            } catch (error) {
                console.log(`Error guardando nuevos datos del usuario. E: ${error}`);
                throw new ApolloError("Error conectando con la base de datos");
            }
            return true;
        },
        async setTodasRespuestasConversacionLeidasPorUsuario(_: any, { idUsuario, idForo, idConversacion }: any, contexto: contextoQuery) {
            console.log(`///////////////////`);
            console.log(`Setting todas respuestas leidas en conversacion ${idConversacion} en foro con id ${idForo}`);
            const credencialesUsuario = contexto.usuario;
            if (idUsuario != credencialesUsuario.id) {
                throw new AuthenticationError("No autorizado");
            }

            try {
                var elUsuario: any = await Usuario.findById(idUsuario).select("foros").exec();
                if (!elUsuario) throw "Usuario no encontrado en la base de datos";
            } catch (error) {
                console.log(`Error buscando el usuario. E: ${error}`);
                throw new ApolloError("Error conectando con la base de datos");
            }

            var infoForo = elUsuario.foros.find(f => f.idForo == idForo);
            if (!infoForo) {
                var nuevoInfoForo = {
                    idForo,
                    conversaciones: []
                }
                elUsuario.foros.push(nuevoInfoForo);
                infoForo = elUsuario.foros.find(f => f.idForo == idForo);
            }

            var infoConversacion = infoForo.conversaciones.find(c => c.idConversacion == idConversacion);
            if (!infoConversacion) {
                var nuevoInfoConversacion = {
                    idConversacion,
                    respuestasLeidas: 0,
                };
                infoForo.conversaciones.push(nuevoInfoConversacion);
                infoConversacion = infoForo.conversaciones.find(c => c.idConversacion == idConversacion);
            }

            const Respuesta:any = mongoose.model("respuestasDeConversacion" + idConversacion, esquemaRespuestaConversacion, "respuestasDeConversacion" + idConversacion);
            try {
                var cantRespuestas: number = await Respuesta.countDocuments().exec();                
            } catch (error) {
                console.log(`Error contando las respuestas. E: ${error}`);
                throw new ApolloError("Error conectando con la base de datos");
            }

            infoConversacion.respuestasLeidas = cantRespuestas;

            try {
                await elUsuario.save();
            } catch (error) {
                console.log(`Error guardando nuevos datos del usuario. E: ${error}`);
                throw new ApolloError("Error conectando con la base de datos");
            }
            return cantRespuestas;
        }
    },

    Conversacion: {
        creador: async function (parent: any, _: any, __: any) {
            if (!parent.idCreador) {
                return [];
            }
            let idCreador = parent.idCreador;

            try {
                var usuarioCreador: any = await Usuario.findById(idCreador).exec();
                if (!usuarioCreador) {
                    console.log(`El usuario no existe en la base de datos enviando un dummy`);
                    return {
                        id: "-1",
                        username: "?",
                        nombres: "?",
                        apellidos: "?",
                        email: "?",
                        numeroTel: "?",
                        lugarResidencia: "?",
                        edad: 0,
                        idGrupoEstudiantil: "?",
                        nombreGrupoEstudiantil: "?",
                    }
                }
            } catch (error) {
                console.log(`error buscando al creador de la conversación. E: ${error}`);
                return [];
            }
            return usuarioCreador;
        },
    },
    RespuestaConversacionForo: {
        autor: async function (parent: any, _: any, __: any) {
            if (!parent.idAutor) {
                return [];
            }
            let idAutor = parent.idAutor;

            try {
                var usuarioAutor: any = await Usuario.findById(idAutor).exec();
                if (!usuarioAutor) {
                    console.log(`El usuario no existe en la base de datos enviando un dummy`);
                    return {
                        id: "-1",
                        username: "?",
                        nombres: "?",
                        apellidos: "?",
                        email: "?",
                        numeroTel: "?",
                        lugarResidencia: "?",
                        edad: 0,
                        idGrupoEstudiantil: "?",
                        nombreGrupoEstudiantil: "?",
                    }
                }
            } catch (error) {
                console.log(`error buscando al autor de la respuesta. E: ${error}`);
                return [];
            }
            return usuarioAutor;
        },
    },
    InfoUltimaRespuesta: {
        autor: async function (parent: any, _: any, __: any) {
            if (!parent.idAutor) {
                return [];
            }
            let idAutor = parent.idAutor;

            try {
                var usuarioAutor: any = await Usuario.findById(idAutor).exec();
                if (!usuarioAutor) {
                    console.log(`El usuario no existe en la base de datos enviando un dummy`);
                    return {
                        id: "-1",
                        username: "?",
                        nombres: "?",
                        apellidos: "?",
                        email: "?",
                        numeroTel: "?",
                        lugarResidencia: "?",
                        edad: 0,
                        idGrupoEstudiantil: "?",
                        nombreGrupoEstudiantil: "?",
                    }
                }
            } catch (error) {
                console.log(`error buscando al autor de la respuesta. E: ${error}`);
                return [];
            }
            return usuarioAutor;
        },
    }


}

