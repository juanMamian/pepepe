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
        gruposEstudiantiles:[GrupoEstudiantil]
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

            console.log(`enviando todos los grupos estudiantiles: ${gruposEstudiantiles}`);
            return gruposEstudiantiles;
        }
    }
}