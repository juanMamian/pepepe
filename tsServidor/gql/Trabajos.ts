import { ApolloError, AuthenticationError, gql } from "apollo-server-express";
import {ModeloTrabajo as Trabajo} from "../model/Trabajo";const Nodo= require("../model/atlas/Nodo");
import {ModeloUsuario as Usuario} from "../model/Usuario"
import {contextoQuery} from "./tsObjetos"

export const typeDefs = gql`
   type Trabajo{
       id: ID,
       nombre: String,
       descripcion:String,
       responsables: [PublicUsuario],
       nodosConocimiento:[NodoConocimiento]
   }

   extend type Query{
       trabajo(idTrabajo: ID!):Trabajo
   }

`;

export const resolvers ={
    Query:{
        trabajo: async function(_:any, args:any, context: contextoQuery){
            console.log(`Enviando un trabajo de id ${args.idTrabajo} `);

            try {
                var elTrabajo=await Trabajo.findById(args.idTrabajo).exec();
            } catch (error) {
                console.log(`error buscando un trabajo. E: ${error}`);
                throw new ApolloError("");
            }

            return elTrabajo;
        }
    },
    Trabajo:{
        responsables:async function(parent:any, _:any, __:any){
            console.log(`parent (responsables): ${JSON.stringify(parent.responsables)}`);
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