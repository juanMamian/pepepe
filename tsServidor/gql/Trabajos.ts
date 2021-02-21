import { ApolloError, AuthenticationError, gql } from "apollo-server-express";
import { ModeloTrabajo as Trabajo } from "../model/Trabajo"; const Nodo = require("../model/atlas/Nodo");
import { ModeloUsuario as Usuario } from "../model/Usuario"
import { contextoQuery } from "./tsObjetos"
import { ModeloForo as Foro } from "../model/Foros/Foro"
import { ModeloProyecto as Proyecto } from "../model/Proyecto";

export const typeDefs = gql`
   type Trabajo{
       id: ID,
       nombre: String,
       descripcion:String,
       responsables: [String],
       nodosConocimiento:[String],
       idForo:ID,
       diagramaProyecto:InfoDiagramaProyecto,
       vinculos:[VinculoNodoProyecto],
       keywords:String,
       idProyectoParent:ID,
   }

   type InfoBasicaTrabajo{
       id:ID,
       nombre: String,
       idProyecto:ID
   }

   extend type Query{
       trabajo(idTrabajo: ID!):Trabajo,
       busquedaTrabajosProyectos(textoBusqueda:String!):[InfoBasicaTrabajo],
   }

`;

export const resolvers = {
    Query: {
        trabajo: async function (_: any, { idTrabajo }: any, context: contextoQuery) {
            let tieneForo = true;

            try {
                var elTrabajo: any = await Trabajo.findById(idTrabajo).exec();
                if (!elTrabajo) {
                    throw "Trabajo no existía"
                }
            } catch (error) {
                console.log(`error buscando un trabajo. E: ${error}`);
                throw new ApolloError("");
            }

            if(!elTrabajo.idProyectoParent){
                console.log(`Trabajo ${elTrabajo.nombre} no tenia idProyectoParent. Buscándole`);
                try {
                    let elProyectoParent:any=await Proyecto.findOne({idsTrabajos:{$in:elTrabajo._id}}).exec();
                    if(!elProyectoParent)throw "No habia proyecto parent";
                    console.log(`Era del proyecto ${elProyectoParent.nombre}`);
                    elTrabajo.idProyectoParent=elProyectoParent._id;
                    await elTrabajo.save();
                } catch (error) {
                    console.log(`Error buscando proyecto parent. E: ${error}`);
                    throw new ApolloError("Error conectando con la base datos");
                }
            }

            


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
        },
        busquedaTrabajosProyectos: async function (_: any, { textoBusqueda }: any, contexto: contextoQuery) {
            console.log(`Buscando trabajo usando texto de búsqueda: ${textoBusqueda}`);
            const sizePaginaTrabajos = 50;
            if (contexto.usuario.id === "") {
                console.log(`Usuario no logeado`);
                throw new AuthenticationError("No autorizado");
            }

            try {
                var losTrabajos: any = await Trabajo.find({ $text: { $search: textoBusqueda } }, { score: { $meta: 'textScore' } }).select("nombre").sort({ score: { $meta: 'textScore' } }).limit(sizePaginaTrabajos).exec();
            } catch (error) {
                console.log(`Error buscando trabajos. E: ${error}`);
                return new ApolloError("Error conectando con la base de datos");
            }


            console.log(`Enviando ${losTrabajos.length} trabajos encontrados`);
            return losTrabajos;
        }
    },




}