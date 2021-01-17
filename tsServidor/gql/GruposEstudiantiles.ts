import { ApolloError, AuthenticationError, gql } from "apollo-server-express";
import fs from "fs";
import util from "util";
const access=util.promisify(fs.access);
const GrupoEstudiantil = require("../model/actividadesProfes/GrupoEstudiantil").modeloGrupoEstudiantil;
const Usuario=require("../model/Usuario").Usuario;
const path=require("path");

import {contextoQuery} from "./tsObjetos"

export const typeDefs=gql`

    type InfoArchivo{
        nombre: String,
        extension: String,
    }

    type ParticipacionActividadGrupoEstudiantil{
        id: ID,
        fechaUpload:Date,
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
        actividadDeGrupoEstudiantil(idGrupo:ID!, idActividad:ID!):ActividadGrupoEstudiantil
    }
    extend type Mutation{
        addEstudianteGrupoEstudiantil(idEstudiante: ID!, idGrupoEstudiantil:ID!):GrupoEstudiantil,
        removeEstudianteGrupoEstudiantil(idEstudiante:ID!, idGrupo:ID!):GrupoEstudiantil,
        crearActividadEnGrupoEstudiantil(idGrupo:ID!):ActividadGrupoEstudiantil,
        eliminarActividadDeGrupoEstudiantil(idActividad:ID!, idGrupo: ID!):Boolean,
        cambiarNombreActividadGrupoEstudiantil(idGrupo:ID!, idActividad:ID!, nuevoNombre: String):ActividadGrupoEstudiantil
    }
`;

export const resolvers={
    Query:{
        grupoEstudiantil:async function(_:any, {idGrupo}:any, contexto:contextoQuery){
            try {
                var elGrupoEstudiantil= GrupoEstudiantil.findById(idGrupo).exec();
            } catch (error) {
                console.log(`Error buscando el grupo con id ${idGrupo} en la base de datos`);
                throw new ApolloError("Error conectando con la base de datos");
            }
            console.log(`enviando el grupo estudiantil`);
            return elGrupoEstudiantil;
        },
        gruposEstudiantiles:async function(_:any, __:any, contexto:contextoQuery){
            console.log(`solicitud de todos los grupos estudiantiles`);
            let credencialesUsuario=contexto.usuario;
            if(!contexto.usuario){
                console.log("Usuario no logeado");
                throw new AuthenticationError("No autorizado");
            }

            try{
                var elLogeado=await Usuario.findById(credencialesUsuario.id).exec();
            }
            catch(error){
                console.log("Error buscando el usuario en la base de datos. E: "+error );
                throw new ApolloError("");
            }
            if(!elLogeado){
                console.log(`${credencialesUsuario.id} no fue encontrado en la base de datos`);
                throw new AuthenticationError("No autorizado");
            }
            console.log(`Usuario logeado: ${credencialesUsuario.id}`);

            try{
                var gruposEstudiantiles=await GrupoEstudiantil.find({}).exec();
            }
            catch(error){
                console.log("Error descargando los grupos estudiantiles de la base de datos. E: "+error );
                throw new ApolloError("Error conectando con la base de datos");
            }

            console.log(`enviando todos los grupos estudiantiles`);
            return gruposEstudiantiles;
        },
        actividadDeGrupoEstudiantil:async function(_:any, {idGrupo, idActividad}, contexto: contextoQuery){
            try {
                let elGrupo=await GrupoEstudiantil.findById(idGrupo).exec();
                var laActividad=elGrupo.actividades.id(idActividad);
            } catch (error) {
                console.log(`Error buscando grupo y actividad en la base de datos`);
                throw new ApolloError("Error conectando con la base de datos");
            }
            return laActividad;
        }
    },
    Mutation:{
        addEstudianteGrupoEstudiantil:async function(_:any, {idEstudiante, idGrupoEstudiantil}, contexto:contextoQuery){
            console.log(`petición de añadir el estudiante con id ${idEstudiante} a grupo estudiantil con id ${idGrupoEstudiantil}`);
            let credencialesUsuario=contexto.usuario;
            if(!credencialesUsuario){
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

            let permisosValidos=["superadministrador"];

            //Authorizaion
            if (!credencialesUsuario.permisos.some(p=>permisosValidos.includes(p))){
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
    
            if(!credencialesUsuario){
                console.log("No habia credenciales de usuario")
                throw new AuthenticationError("No autorizado");             
            }
    
             //Authorización

             let permisosValidos=["superadministrador"];
    
             if (!credencialesUsuario.permisos.some(p=>permisosValidos.includes(p))) {
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
        crearActividadEnGrupoEstudiantil: async function (_: any, { idGrupo}: any, contexto: contextoQuery) {
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
            
            if (!credencialesUsuario.permisos.includes("actividadesProfes-profe")) {
                console.log(`Error: el usuario no era profe`);
                throw new AuthenticationError("No autorizado");
            }

            console.log(`creando una nueva actividad en el grupo ${elGrupoEstudiantil.nombre}`);
            console.log(`las actividades eran: ${elGrupoEstudiantil.actividades}`);
            try {
                var nuevaActividad = elGrupoEstudiantil.actividades.create({fechaCreacion: Date.now(), idCreador: credencialesUsuario.id});
                
                elGrupoEstudiantil.actividades.push(nuevaActividad);
                await elGrupoEstudiantil.save();
            }
            catch (error) {
                console.log("Error guardando la actividad creada en el grupo. E: " + error);
                throw new ApolloError("Error introduciendo la actividad en el proyecto");
            }

            
            console.log(`Actividad creada exitosamente: ${nuevaActividad}`);
            return nuevaActividad;


        },
        eliminarActividadDeGrupoEstudiantil: async function (_: any, { idActividad, idGrupo}: any, contexto: contextoQuery) {
            console.log(`peticion de eliminar una actividad con id ${idActividad} de un proyecto con id ${idGrupo}`);

            try {
                var elGrupo = await GrupoEstudiantil.findById(idGrupo).exec();
                console.log(`Grupo encontrado`);
                var laActividad=elGrupo.actividades.id(idActividad);
            }
            catch (error) {
                console.log("Error buscando el grupo en la base de datos. E: " + error);
                throw new ApolloError("Error conectando con la base de datos");
            }

            
            //Authorización
            let credencialesUsuario = contexto.usuario;
            if (!credencialesUsuario.permisos.includes("superadministrador") && laActividad.idCreador != credencialesUsuario.id) {
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

            let pathActividad=path.join(__dirname, "../public/actividadesProfes/actividades", idActividad);
            
            fs.rmdir(pathActividad, {recursive:true}, (err)=>{
                console.log(`Error eliminando carpeta de actividad. E: ${err}`);
            });
            
            return true;
        },
        async cambiarNombreActividadGrupoEstudiantil(_: any, { idGrupo, idActividad, nuevoNombre }, contexto: contextoQuery) {

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

            //Authorización
            let credencialesUsuario = contexto.usuario;
            if (elGrupo.idCreador!=credencialesUsuario.id && !credencialesUsuario.permisos.includes("superadministrador")) {
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

    ActividadGrupoEstudiantil:{
        creador:async function(parent:any, _:any, __:any){
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
        hayGuia: async function(parent: any){
            let idActividad=parent.id;
            let pathGuia=path.join(__dirname, "../public/actividadesProfes/actividades", idActividad, "guia.pdf");
            
            try {
                await access(pathGuia, fs.constants.R_OK);
            } catch (error) {
                if(error.message.substr(0,6)!="ENOENT"){
                console.log(`Error checkeando acceso a la guia en ${pathGuia}. E: ${error}`);
                }
                else{
                console.log(`Guia no existia`);
                }
                return false;
            }
            return true;
        }
    },

    DesarrolloActividadGrupoEstudiantil:{
        estudiante:async function(parent:any, _:any, __:any){
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
    }

    
}


