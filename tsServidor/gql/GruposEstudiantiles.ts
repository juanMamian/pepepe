import { ApolloError, AuthenticationError, gql } from "apollo-server-express";
const GrupoEstudiantil = require("../model/actividadesProfes/GrupoEstudiantil").modeloGrupoEstudiantil;
const Usuario=require("../model/Usuario");

import {contextoQuery} from "./tsObjetos"

export const typeDefs=gql`

    type Evidencia{
        fechaUpload:Date,
        comentario:String
    }

    type Actividad{
        id: ID,
        nombre: String,
        evidencias:[Evidencia]
    }

    type GrupoEstudiantil{
        id:ID,
        nombre:String,
        estudiantes:[PublicUsuario],
        actividades:[Actividad]
    }

    extend type Query{
        gruposEstudiantiles:[GrupoEstudiantil],
        addEstudianteGrupoEstudiantil:GrupoEstudiantil
    }
    extend type Mutation{
        addEstudianteGrupoEstudiantil(idEstudiante: ID!, idGrupoEstudiantil:ID!):GrupoEstudiantil,
        removeEstudianteGrupoEstudiantil(idEstudiante:ID!, idGrupo:ID!):GrupoEstudiantil
    }
`;

export const resolvers={
    Query:{
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

            //Authorizaion
            if (credencialesUsuario.permisos!="superadministrador"){
                console.log(`Esta acción sólo la puede ejecutar un superadministrador, cancelando.`);
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
    
             if (credencialesUsuario.permisos != "superadministrador") {
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
    }
}


