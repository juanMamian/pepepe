import { ApolloError, AuthenticationError, gql } from "apollo-server-express";
import {ModeloTrabajo as Trabajo} from "../model/Trabajo";const Nodo= require("../model/atlas/Nodo");
import {ModeloUsuario as Usuario} from "../model/Usuario"
import {contextoQuery} from "./tsObjetos"
import { ModeloForo as Foro } from "../model/Foros/Foro"

export const typeDefs = gql`
   type Trabajo{
       id: ID,
       nombre: String,
       descripcion:String,
       responsables: [PublicUsuario],
       nodosConocimiento:[NodoConocimiento],
       idForo:ID
   }

   extend type Query{
       trabajo(idTrabajo: ID!):Trabajo
   }

`;

export const resolvers ={
    Query:{
        trabajo: async function(_:any, {idTrabajo}:any, context: contextoQuery){
            console.log(`Solicitado un trabajo de id ${idTrabajo} `);

            try {
                var elTrabajo:any=await Trabajo.findById(idTrabajo).exec();
            } catch (error) {
                console.log(`error buscando un trabajo. E: ${error}`);
                throw new ApolloError("");
            }

            let tieneForo = true;

            if (!elTrabajo.idForo) {
                tieneForo = false;
            }
            else {
                try {
                    let elForo: any = await Foro.findById(elTrabajo.idForo).exec();
                    if (!elForo) {
                        console.log(`El foro no existía. Se creará uno nuevo`);
                        tieneForo = false;
                    }
                } catch (error) {
                    console.log(`Error buscando foro en la base de datos. E :${error}`);
                }
            }

            if (!tieneForo) {
                console.log(`El trabajo ${elTrabajo.nombre} no tenía foro. Creando con miembros: ${elTrabajo.responsables}.`);
                try {
                    var nuevoForo: any = await Foro.create({
                        miembros: elTrabajo.responsables,
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
                    elTrabajo.idForo = idNuevoForo;
                    await elTrabajo.save();
                } catch (error) {
                    console.log(`Error guardando el trabajo`);
                    throw new ApolloError("Error conectando con la base de datos");
                }

            }

            return elTrabajo;
        }
    },
    Trabajo:{
        responsables:async function(parent:any, _:any, __:any){
            if(!parent.responsables){
                return [];
            }
            let idsResponsables=parent.responsables;
            
            try {
                var usuariosResponsables=await Usuario.find({_id: {$in : idsResponsables}}).exec();
            } catch (error) {
                console.log(`error buscando a los responsables del trabajo. E: ${error}`);
                return [];
            }

            return usuariosResponsables;
        },
        nodosConocimiento:async function(parent:any, _:any, __:any){
            console.log(`parent (nodos): ${JSON.stringify(parent.nodosConocimiento)}`);
            if(!parent.nodosConocimiento){
                return [];
            }
            let idsNodos=parent.nodosConocimiento;
            
            try {
                var nodos=Nodo.find({_id: {$in : idsNodos}}).exec();
            } catch (error) {
                console.log(`error buscando a los nodosConocimiento del trabajo. E: ${error}`);
                return [];
            }


            return nodos;
        }
    },



}