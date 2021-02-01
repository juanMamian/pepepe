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

    type Conversacion{
        id:ID,
        titulo: String,
        estado:String,
        creador: PublicUsuario,
    }

    type Categoria{
        id: ID
        nombre: String,
        conversaciones:[Conversacion],
    }

    type Foro{
        id:ID,
        categorias:[Categoria],
        acceso:String,
        miembros:[PublicUsuario]        
    }

    extend type Query{
        foro(idForo:ID!):Foro,
        numPaginasConversacion(idConversacion: ID!):Int,
        respuestasPaginaDeConversacion(idConversacion:ID!, pagina: Int!):[Respuesta]
    }

    extend type Mutation{
        crearForoProyecto(idProyecto: ID!):Proyecto,
        iniciarConversacionConPrimerMensajeForo(idForo: ID!, idCategoria: ID!, input: InputIniciarConversacion):Conversacion,
        eliminarRespuesta(idRespuesta:ID!, idConversacion:ID!):Boolean,
        postRespuestaConversacion(idConversacion: ID!, nuevaRespuesta: InputNuevaRespuesta):Respuesta
    }

`;

const sizePaginaConversacion=10;

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
        async numPaginasConversacion(_:any, {idConversacion}, __:any){
            console.log(`||||||||||||`);
            
            
            let Respuesta=mongoose.model("respuestasDeConversacion"+idConversacion, esquemaRespuestaConversacion, "respuestasDeConversacion"+idConversacion);
            try {
                var num:any=await Respuesta.countDocuments().exec();
                var pags=Math.ceil(num/sizePaginaConversacion);
            } catch (error) {
                console.log(`Error contando las respuestas. E: ${error}`);
                return 0
            }            
            return pags;            
        },
        async respuestasPaginaDeConversacion(_:any, {idConversacion, pagina}, __:any){

            let Respuesta=mongoose.model("respuestasDeConversacion"+idConversacion, esquemaRespuestaConversacion, "respuestasDeConversacion"+idConversacion);

            try {
                var lasRespuestas:any=await Respuesta.find({}).limit(sizePaginaConversacion).skip((pagina-1)*sizePaginaConversacion).exec();
            } catch (error) {
                console.log(`Error descargando respuestas`);
                new ApolloError("Error conectando con la base de datos");
            }
            return lasRespuestas;
        }   


    },
    Mutation: {
        async crearForoProyecto(_: any, { idProyecto }: any, contexto: contextoQuery) {
            console.log(`||||||||||||||||||||||||||||`);
            console.log(`Solicitud de crear un foro para el proyecto con id ${idProyecto}`);

            try {
                var elProyecto: any = await Proyecto.findById(idProyecto).exec();
                if (!elProyecto) {
                    console.log(`El proyecto no fue encontrado`);
                    throw "Proyecto no encontrado";
                }
            } catch (error) {
                console.log(`Error buscando el proyecto en la base de datos. E: ${error}`);
                throw new ApolloError("Error conectando con la base de datos");
            }

            if (!elProyecto.idForo) {
                console.log(`Creando nuevo foro para este proyecto`);

                try {
                    var nuevoForo = await Foro.create({
                        categorias: [{ nombre: "General" }]
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
            else {
                console.log(`El proyecto ya tenía un foro.`);
                throw new ApolloError("Operacion ilegal");
            }

            return elProyecto;
        },
        async iniciarConversacionConPrimerMensajeForo(_: any, { idForo, idCategoria, input }: any, contexto: contextoQuery) {
            console.log(`|||||||||||||||||||||`);
            console.log(`Recibida solicitud de iniciar una conversacion con primera respuesta en foro con id ${idForo} en categoria con id ${idCategoria}, con input: ${JSON.stringify(input)}`);

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
            let laCategoria = elForo.categorias.id(idCategoria);
            if (!laCategoria) {
                console.log(`La categoría no existía`);
                throw new ApolloError("Error conectando con la base de datos");
            }

            let nuevaConversacion = laCategoria.conversaciones.create({
                titulo,
                idCreador: credencialesUsuario.id,
                respuestas: [respuesta]
            });

            try {
                await laCategoria.conversaciones.push(nuevaConversacion);
                await elForo.save();
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

            let Respuesta=mongoose.model("respuestasDeConversacion"+idConversacion, esquemaRespuestaConversacion, "respuestasDeConversacion"+idConversacion);
            try {
                var laRespuesta:any=await Respuesta.findById(idRespuesta).exec();
                if(!laRespuesta){
                    throw "Respuesta no encontrada"
                }
            } catch (error) {
                console.log(`Error buscando la respuesta. E: ${error}`);
                throw new ApolloError("Error conectando con la base de datos");
            }

            //Authorización
            let permisosEspeciales = ["superadministrador"]
            let credencialesUsuario = contexto.usuario;

            if(credencialesUsuario.id!=laRespuesta.idAutor && !credencialesUsuario.permisos.some(p=>permisosEspeciales.includes(p))){
                console.log(`Error de autorización`);
                throw new AuthenticationError("No autorizado");
            }
        
            try {
                await Respuesta.findByIdAndDelete(idRespuesta).exec();
            } catch (error) {
                console.log(`Error eliminando respuesta. E: ${error}`);
            }

            console.log(`Respuesta eliminada`);

            return true;

        },
        async postRespuestaConversacion(_: any, { idConversacion, nuevaRespuesta }: any, contexto: contextoQuery) {
            console.log(`||||||||||||||||||||||||||||||||`);
            console.log(`Peticion de post respuesta en la conversación con id ${idConversacion}`);
            console.log(`La respuesta será: ${JSON.stringify(nuevaRespuesta)}`);

            try {
                var elForo: any = await Foro.findOne({ "categorias.conversaciones._id": idConversacion }).exec();
                if (!elForo) {
                    throw "Foro no existía"
                }
            } catch (error) {
                console.log(`Error buscando el foro de la conversación`);
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

            if (elForo.acceso == "privado") {
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
            if(!nuevaRespuesta.idAutor){
                nuevaRespuesta.idAutor=credencialesUsuario.id;
            }

            let laCategoria = elForo.categorias.find(c => c.conversaciones.some(conv => conv._id==idConversacion));
            let laConversacion = laCategoria.conversaciones.find(conv => conv._id==idConversacion);
            console.log(`En la conversación ${laConversacion.titulo}`);
            
            let Respuesta=mongoose.model("respuestasDeConversacion"+idConversacion, esquemaRespuestaConversacion, "respuestasDeConversacion"+idConversacion);

            const laRespuesta=new Respuesta(nuevaRespuesta);

            try {                                               
                await laRespuesta.save();
            } catch (error) {
                console.log(`Error guardando el foro. E: ${error}`);
                throw new ApolloError("Error conectando con la base de datos");
            }

            console.log(`Respuesta posted`);

            return laRespuesta;

        }
    },
    Foro: {
        miembros: async function (parent: any, _: any, __: any) {
            console.log(`parent miembros (foro): ${JSON.stringify(parent.miembros)}`);

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
    }


}

