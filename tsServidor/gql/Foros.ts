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

export const typeDefs = gql`

    input InputNuevaRespuesta{
        mensaje:String
    }

    input InputIniciarConversacion{
        titulo:String,
        primeraRespuesta:String
    }

    type Respuesta{
        id: ID
        fecha:Date,
        archivo:InfoArchivo,
        mensaje:String,
        autor: PublicUsuario
    }

    type InfoRespuestasPaginasConversacion{
        numPaginas: Int,
        pagina:Int,
        respuestas: [Respuesta]
    }

    type InfoConversacionesPaginaForo{
        numPaginas: Int,
        pagina:Int,
        conversaciones: [Conversacion]
    }

    type InfoUltimaRespuesta{
        autor:MinimoUsuario,
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
        miembros:[PublicUsuario]       
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
        iniciarConversacionConPrimerMensajeForo(idForo: ID!, input: InputIniciarConversacion):Conversacion,
        eliminarRespuesta(idRespuesta:ID!, idConversacion:ID!):Boolean,
        postRespuestaConversacion(idConversacion: ID!, nuevaRespuesta: InputNuevaRespuesta):Respuesta
    }

`;

const sizePaginaConversacion = 5;
const sizePaginaForo=6

export const resolvers = {
    Query: {
        async foro(_: any, { idForo }, contexto: contextoQuery) {
            console.log(`||||||||||||||||||||||`);
            console.log(`Peticion de un foro id ${idForo}`);
            try {
                var elForo: any = await Foro.findById(idForo).exec();
                if (!elForo) {
                    throw "foro no encontrado"
                }
            } catch (error) {
                console.log(`Error buscando el foro con id ${idForo} en la base de datos. E:${error}`);
                throw new ApolloError("Error conectando con la base de datos");
            }

            console.log(`enviando el foro`);
            return elForo;
        },
        async numPaginasConversacion(_: any, { idConversacion }, __: any) {
            console.log(`||||||||||||`);


            let Respuesta = mongoose.model("respuestasDeConversacion" + idConversacion, esquemaRespuestaConversacion, "respuestasDeConversacion" + idConversacion);
            try {
                var num: any = await Respuesta.countDocuments().exec();
                var pags = Math.ceil(num / sizePaginaConversacion);
            } catch (error) {
                console.log(`Error contando las respuestas. E: ${error}`);
                return 0
            }
            console.log(`Enviando numpags: ${pags}`);
            return pags;
        },
        async numPagsConversacionesForo(_: any, { idForo }, __: any) {
            console.log(`||||||||||||`);
            
            try {
                let elForo:any=await Foro.findById(idForo).exec();
                let num=elForo.conversaciones.length;
                var pags = Math.ceil(num / sizePaginaForo);
            } catch (error) {
                console.log(`Error contando las conversaciones. E: ${error}`);
                return 0
            }
            console.log(`Enviando numpags: ${pags}`);
            return pags;
        },
        async respuestasPaginaDeConversacion(_: any, { idConversacion, pagina }, __: any) {
            console.log(`Peticion de respuestas de la pagina ${pagina} en la conversacion ${idConversacion}`);
            let Respuesta = mongoose.model("respuestasDeConversacion" + idConversacion, esquemaRespuestaConversacion, "respuestasDeConversacion" + idConversacion);
            let numRespuestas:any=await Respuesta.countDocuments().exec();
            
            var numPaginas=0;
            if(numRespuestas>0){
                 numPaginas=Math.ceil(numRespuestas / sizePaginaConversacion);
            }
            

            if(pagina<1 || pagina>numPaginas){
                pagina=numPaginas;
            }

            try {
                var lasRespuestas: any = await Respuesta.find({}).limit(sizePaginaConversacion).skip((pagina - 1) * sizePaginaConversacion).exec();
            } catch (error) {
                console.log(`Error descargando respuestas`);
                new ApolloError("Error conectando con la base de datos");
            }
            console.log(`Enviando ${lasRespuestas.length} respuestas en la pagina ${pagina} de ${numPaginas}`);
            return {numPaginas, pagina, respuestas: lasRespuestas};
        },
        async conversacionesPaginaForo(_: any, { idForo, pagina }, __: any) {
            console.log(`Peticion de respuestas de la pagina ${pagina} en el foro ${idForo}`);
         
            try {
                var elForo: any = await Foro.findById(idForo).exec();
                if(!elForo){
                    throw "Foro no encontrado"
                }
            } catch (error) {
                console.log(`Error buscando el foro`);
                new ApolloError("Error conectando con la base de datos");
            }

            let todasConversaciones=elForo.conversaciones;
            let numConversaciones=todasConversaciones.length;
            
            var numPaginas=0;
            if(numConversaciones>0){
                 numPaginas=Math.ceil(numConversaciones / sizePaginaConversacion);
            }
            if(pagina<1 || pagina>numPaginas){
                pagina=numPaginas;
            }
                
            let conversacionesPagina=todasConversaciones.splice((pagina-1)*sizePaginaForo, sizePaginaForo);
            console.log(`Enviando ${conversacionesPagina.length} conversaciones para la pagina ${pagina} de ${numPaginas}`);
            return {pagina, numPaginas, conversaciones: conversacionesPagina};
        }


    },
    Mutation: {
       
        async iniciarConversacionConPrimerMensajeForo(_: any, { idForo, input }: any, contexto: contextoQuery) {
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
            const charProhibidosTitulo = /[^ a-zA-ZÀ-ž0-9_():.,-]/;
            let titulo = input.titulo;
            titulo = titulo.trim();
            titulo = titulo.replace(/\s\s+/g, " ");
            if (charProhibidosTitulo.test(titulo)) {
                console.log(`El titulo contenia caracteres ilegales`);
                throw new ApolloError("Titulo ilegal");
            }

            let primeraRespuesta = input.primeraRespuesta;

            primeraRespuesta = primeraRespuesta.trim();
            if (charProhibidosMensajeRespuesta.test(primeraRespuesta)) {
                console.log(`El mensaje contenia caracteres ilegales`);
                throw new ApolloError("Mensaje ilegal");
            }

            let respuesta = {
                mensaje: primeraRespuesta,
                idAutor: credencialesUsuario.id
            }

            let nuevaConversacion = elForo.conversaciones.create({
                titulo,
                idCreador: credencialesUsuario.id,
                respuestas: [respuesta],
                acceso:"publico"
            });

            let idConversacion=nuevaConversacion._id;

            try {
                await elForo.conversaciones.push(nuevaConversacion);
                await elForo.save();
                let Respuesta = mongoose.model("respuestasDeConversacion" + idConversacion, esquemaRespuestaConversacion, "respuestasDeConversacion" + idConversacion);
                let laRespuesta=new Respuesta(respuesta);
                await laRespuesta.save();
            } catch (error) {
                console.log(`Error guardando el foro con la nueva conversacion. E: ${error}`);
                throw new ApolloError("Error conectando con la base de datos");
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

            if (await Respuesta.countDocuments().exec() < 1) {
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
                
                mongoose.connection.db.dropCollection("respuestasDeConversacion"+idConversacion, function(
                    err,
                    result
                ) {
                    if(err){
                        console.log(`Error eliminando la coleccion. E: ${err}`);
                    }
                    console.log("Collection droped");
                });

            }
            console.log(`Respuesta eliminada`);

            return true;

        },
        async postRespuestaConversacion(_: any, { idConversacion, nuevaRespuesta }: any, contexto: contextoQuery) {
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

            let laConversacion=elForo.conversaciones.id(idConversacion);
            if(!laConversacion){
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
            if (!nuevaRespuesta.idAutor) {
                nuevaRespuesta.idAutor = credencialesUsuario.id;
            }

            console.log(`En la conversación ${laConversacion.titulo}`);

            let Respuesta = mongoose.model("respuestasDeConversacion" + idConversacion, esquemaRespuestaConversacion, "respuestasDeConversacion" + idConversacion);
            const laRespuesta = new Respuesta(nuevaRespuesta);

            try {
                await laRespuesta.save();
            } catch (error) {
                console.log(`Error guardando el foro. E: ${error}`);
                throw new ApolloError("Error conectando con la base de datos");
            }
            let cantRespuestas:number=await Respuesta.countDocuments().exec();

            try {
                laConversacion.cantidadRespuestas=cantRespuestas;
                laConversacion.infoUltimaRespuesta={
                    idAutor:credencialesUsuario.id,                    
                }
                await elForo.save();
            } catch (error) {
                console.log(`Error guardando cant respuestas y info ultima respuesta. E: ${error}`);
            }

            console.log(`Respuesta posted`);

            return laRespuesta;

        }
    },
    Foro: {
        miembros: async function (parent: any, _: any, __: any) {
            

            if (!parent.miembros) {
                return [];
            }
            let idsMiembros = parent.miembros;

            try {
                var usuariosMiembros = await Usuario.find({ _id: { $in: idsMiembros } }).exec();
                if (!usuariosMiembros) {
                    console.log(`No habia usuarios miembros`);
                }
            } catch (error) {
                console.log(`error buscando a los miembros del proyecto. E: ${error}`);
                return [];
            }


            return usuariosMiembros;
        },
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
    Respuesta: {
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
    InfoUltimaRespuesta:{
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

