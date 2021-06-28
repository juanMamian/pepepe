import { ApolloError, AuthenticationError, gql, UserInputError } from "apollo-server-express";
import { ModeloObjetivo as Objetivo } from "../model/Objetivo"; 
const Nodo = require("../model/atlas/Nodo");
import { ModeloUsuario as Usuario } from "../model/Usuario"
import { contextoQuery } from "./tsObjetos"
import { ModeloForo as Foro } from "../model/Foros/Foro"
import { ModeloProyecto as Proyecto } from "../model/Proyecto";

export const typeDefs = gql`

   type Objetivo{
       id: ID,
       nombre: String,
       responsables: [String],
       posiblesResponsables:[String],
       responsablesSolicitados:Int,
       descripcion:String,       
       vinculos:[VinculoNodoProyecto],
       keywords:String,
       idProyectoParent:ID,
       estado:String,       
       coords: Coords,
       angulo:Float,
       stuck:Boolean,
       puntaje:Int,
       centroMasa:Coords,
       nivel: Int,
       turnoNivel:Float,
   }

   type InfoBasicaObjetivo{
       id:ID,
       nombre: String,
       idProyecto:ID
   }

   extend type Query{
       objetivo(idObjetivo: ID!):Objetivo,
       busquedaObjetivosProyectos(textoBusqueda:String!):[InfoBasicaObjetivo],
       objetivosSegunCentro(centro: CoordsInput!, radio:Int!):[Objetivo],       
   }   

   extend type Mutation{
    crearObjetivo(posicion:CoordsInput):Objetivo,
    eliminarObjetivoDeProyecto(idObjetivo:ID!, idProyecto:ID!):Boolean,
    editarNombreObjetivoProyecto(idProyecto:ID!, idObjetivo:ID!, nuevoNombre: String!):Objetivo,
    editarDescripcionObjetivoProyecto(idProyecto:ID!, idObjetivo:ID!, nuevoDescripcion: String!):Objetivo,
    setPosicionObjetivoDiagramaProyecto(idObjetivo:ID!, nuevaPosicion:CoordsInput):Objetivo,
    editarKeywordsObjetivoProyecto(idProyecto:ID!, idObjetivo:ID!, nuevoKeywords: String!):Objetivo,
    setEstadoObjetivoProyecto(idProyecto:ID!, idObjetivo:ID!, nuevoEstado:String!):Objetivo,    
   }
`;

export const resolvers = {
    Query: {
        objetivo: async function (_: any, { idObjetivo }: any, context: contextoQuery) {            

            try {
                var elObjetivo: any = await Objetivo.findById(idObjetivo).exec();
                if (!elObjetivo) {
                    throw "Objetivo no existía"
                }
            } catch (error) {
                console.log(`error buscando un objetivo. E: ${error}`);
                throw new ApolloError("");
            }

            if(!elObjetivo.idProyectoParent){
                console.log(`Objetivo ${elObjetivo.nombre} no tenia idProyectoParent. Buscándole`);
                try {
                    let elProyectoParent:any=await Proyecto.findOne({idsObjetivos:{$in:elObjetivo._id}}).exec();
                    if(!elProyectoParent)throw "No habia proyecto parent";
                    console.log(`Era del proyecto ${elProyectoParent.nombre}`);
                    elObjetivo.idProyectoParent=elProyectoParent._id;
                    await elObjetivo.save();
                } catch (error) {
                    console.log(`Error buscando proyecto parent. E: ${error}`);
                    throw new ApolloError("Error conectando con la base datos");
                }
            }            
                    
            return elObjetivo;
        },
        busquedaObjetivosProyectos: async function (_: any, { textoBusqueda }: any, contexto: contextoQuery) {
            console.log(`Buscando objetivo usando texto de búsqueda: ${textoBusqueda}`);
            const sizePaginaObjetivos = 50;
            if (contexto.usuario.id === "") {
                console.log(`Usuario no logeado`);
                throw new AuthenticationError("No autorizado");
            }

            try {
                var losObjetivos: any = await Objetivo.find({ $text: { $search: textoBusqueda } }, { score: { $meta: 'textScore' } }).select("nombre").sort({ score: { $meta: 'textScore' } }).limit(sizePaginaObjetivos).exec();
            } catch (error) {
                console.log(`Error buscando objetivos. E: ${error}`);
                return new ApolloError("Error conectando con la base de datos");
            }

            console.log(`Enviando ${losObjetivos.length} objetivos encontrados`);
            return losObjetivos;
        },
        objetivosSegunCentro: async function(_:any, {centro, radio}:any, __:any){
            try {
                var losObjetivos:any=await Objetivo.find({}).exec();
            } catch (error) {
                console.log(`Error buscando objetivos. E: ${error}`);
                throw new ApolloError("Error conectando con la base de datos");
            }
            console.log(`Enviando objetivos según centro`);
            return losObjetivos;
        }
    },

    Mutation:{
        async crearObjetivo(_: any, {posicion}: any, contexto: contextoQuery) {
            console.log(`Peticion de crear un nuevo objetivo`);           

            //Authorización
            let credencialesUsuario = contexto.usuario;
            if (!credencialesUsuario.id || credencialesUsuario.id.length<2) {
                console.log(`Error de autenticacion editando nombre de proyecto`);
                throw new AuthenticationError("No autorizado");
            }

            console.log(`Creando un foro para este objetivo`);
            try {
                var nuevoForo: any = await Foro.create({
                    acceso: "privado",
                    miembros: [credencialesUsuario.id],
                });
                var idNuevoForo = nuevoForo._id;
                await nuevoForo.save();
            } catch (error) {
                console.log(`Error creando el nuevo foro. E: ${error}`);
                throw new ApolloError("Error conectando con la base de datos");
            }
            console.log(`Nuevo foro creado`);            

            try {
                var nuevoObjetivo: any = await new Objetivo({idForo: idNuevoForo, diagramaProyecto: { posicion } });                
                await nuevoObjetivo.save();
            } catch (error) {
                console.log(`Error creando el nuevo objetivo. E: ${error}`);
                throw new ApolloError("Error conectando con la base de datos");
            }
            return nuevoObjetivo;
        },
        async eliminarObjetivoDeProyecto(_: any, { idObjetivo, idProyecto }: any, contexto: contextoQuery) {
            console.log(`peticion de eliminar un objetivo con id ${idObjetivo} de un proyecto con id ${idProyecto}`);
            let credencialesUsuario = contexto.usuario;

            try {
                var elProyecto: any = await Proyecto.findById(idProyecto).exec();
                if (!elProyecto) {
                    throw "proyecto no encontrado"
                }
            }
            catch (error) {
                console.log("Error buscando el proyecto en la base de datos. E: " + error);
                throw new ApolloError("Error conectando con la base de datos");
            }

            //Authorización
            let permisosEspeciales = ["superadministrador"];


            if (!elProyecto.responsables.includes(credencialesUsuario.id) && !credencialesUsuario.permisos.some(p => permisosEspeciales.includes(p))) {
                console.log(`Error de autenticacion editando nombre de proyecto`);
                throw new AuthenticationError("No autorizado");
            }


            try {
                await Objetivo.findByIdAndDelete(idObjetivo);
                await Proyecto.findByIdAndUpdate(idProyecto, { $pull: { idsObjetivos: idObjetivo } });
            }
            catch (error) {
                console.log("Error eliminando objetivo. E: " + error);
                throw new ApolloError("Error introduciendo el objetivo en el proyecto");
            }

            console.log(`eliminado`);

            return true;
        },
        async editarNombreObjetivoProyecto(_: any, { idProyecto, idObjetivo, nuevoNombre }, contexto: contextoQuery) {

            console.log(`cambiando el nombre del objetivo con id ${idObjetivo} del proyecto con id ${idProyecto}`);
            const charProhibidosNombreObjetivo = /[^ a-zA-ZÀ-ž0-9_():.,-]/;

            nuevoNombre = nuevoNombre.replace(/\s\s+/g, " ");
            if (charProhibidosNombreObjetivo.test(nuevoNombre)) {
                throw new ApolloError("Nombre ilegal");
            }

            nuevoNombre = nuevoNombre.trim();

            try {
                var elProyecto: any = await Proyecto.findById(idProyecto).exec();
                if (!elProyecto) {
                    throw "proyecto no encontrado"
                }
            }
            catch (error) {
                console.log("Error buscando el proyecto. E: " + error);
                throw new ApolloError("Erro en la conexión con la base de datos");
            }

            //Authorización
            let credencialesUsuario = contexto.usuario;
            if (!elProyecto.responsables.includes(credencialesUsuario.id) && !credencialesUsuario.permisos.includes("superadministrador")) {
                console.log(`Error de autenticacion editando nombre de proyecto`);
                throw new AuthenticationError("No autorizado");
            }

            try {
                var elObjetivo: any = await Objetivo.findById(idObjetivo).exec();
                if (!elObjetivo) {
                    throw "No existía el objetivo";
                }
                elObjetivo.nombre = nuevoNombre;
                await elObjetivo.save();
            }
            catch (error) {
                console.log("Error cambiando el nombre en la base de datos. E: " + error);
                throw new ApolloError("Error guardando el nombre en la base de datos");
            }

            console.log(`Nombre cambiado`);
            return elObjetivo;
        },
        async editarDescripcionObjetivoProyecto(_: any, { idProyecto, idObjetivo, nuevoDescripcion }, contexto: contextoQuery) {
            let credencialesUsuario = contexto.usuario;
            try {
                var elProyecto: any = await Proyecto.findById(idProyecto).exec();
                if (!elProyecto) {
                    throw "proyecto no encontrado"
                }
            }
            catch (error) {
                console.log(`error buscando el proyecto. E: ` + error);
                throw new ApolloError("Error conectando con la base de datos");
            }

            //Authorización
            let permisosEspeciales = ["superadministrador"];
            if (!elProyecto.responsables.includes(credencialesUsuario.id) && !credencialesUsuario.permisos.some(p => permisosEspeciales.includes(p))) {
                console.log(`Error de autenticacion editando Descripcion de proyecto`);
                throw new AuthenticationError("No autorizado");
            }

            const charProhibidosDescripcionObjetivo = /[^\n\r a-zA-ZÀ-ž0-9_():;.,+¡!¿?@=-]/;

            if (charProhibidosDescripcionObjetivo.test(nuevoDescripcion)) {
                throw new ApolloError("Descripcion ilegal");
            }

            nuevoDescripcion = nuevoDescripcion.trim();


            try {
                var elObjetivo: any = await Objetivo.findById(idObjetivo).exec();
                if (!elObjetivo) {
                    throw "Objetivo no existía";
                }
                elObjetivo.descripcion = nuevoDescripcion;
                console.log(`guardando nuevo descripcion ${nuevoDescripcion} en la base de datos`);
                await elObjetivo.save();
            } catch (error) {
                console.log(`error guardando el objetivo modificado: ${error}`);
                throw new ApolloError("Error guardando información en la base de datos");

            }
            console.log(`Descripcion guardado`);
            return elObjetivo;
        },
        async editarKeywordsObjetivoProyecto(_: any, { idProyecto, idObjetivo, nuevoKeywords }, contexto: contextoQuery) {
            let credencialesUsuario = contexto.usuario;
            try {
                var elProyecto: any = await Proyecto.findById(idProyecto).exec();
                if (!elProyecto) {
                    throw "proyecto no encontrado"
                }
            }
            catch (error) {
                console.log(`error buscando el proyecto. E: ` + error);
            }

            //Authorización
            let permisosEspeciales = ["superadministrador"];
            if (!elProyecto.responsables.includes(credencialesUsuario.id) && !credencialesUsuario.permisos.some(p => permisosEspeciales.includes(p))) {
                console.log(`Error de autenticacion editando Keywords de proyecto`);
                throw new AuthenticationError("No autorizado");
            }

            const charProhibidosKeywordsObjetivo = /[^ a-zA-Zñ,]/;

            if (charProhibidosKeywordsObjetivo.test(nuevoKeywords)) {
                throw new ApolloError("Keywords ilegal");
            }

            nuevoKeywords = nuevoKeywords.trim();


            try {
                var elObjetivo: any = await Objetivo.findById(idObjetivo).exec();
                if (!elObjetivo) {
                    throw "Objetivo no existía";
                }
                elObjetivo.keywords = nuevoKeywords;
                console.log(`guardando nuevo keywords ${nuevoKeywords} en la base de datos`);
                await elObjetivo.save();
            } catch (error) {
                console.log(`error guardando el objetivo modificado: ${error}`);
            }
            console.log(`Keywords guardado`);
            return elObjetivo;
        },        
        async setPosicionObjetivoDiagramaProyecto(_: any, { idObjetivo, nuevaPosicion }, contexto: contextoQuery) {
            console.log(`Guardando posicion de objetivo en el diagrama del proyecto`);
            
            try {
                var elObjetivo: any = await Objetivo.findById(idObjetivo).exec();
                if (!elObjetivo) {
                    throw "Objetivo no existía";
                }                
            } catch (error) {
                console.log(`error buscando el objetivo: ${error}`);
                throw new ApolloError("Error conectando con la base de datos");
            }

            let credencialesUsuario = contexto.usuario;
            const idProyecto=elObjetivo.idProyectoParent;
            try {
                var elProyecto: any = await Proyecto.findById(idProyecto).exec();
                if (!elProyecto) {
                    throw "proyecto no encontrado"
                }
            }
            catch (error) {
                console.log(`error buscando el proyecto. E: ` + error);
            }

            //Authorización
            let permisosEspeciales = ["superadministrador"];
            if (!elProyecto.responsables.includes(credencialesUsuario.id) && !credencialesUsuario.permisos.some(p => permisosEspeciales.includes(p))) {
                console.log(`Error de autenticacion editando Descripcion de proyecto`);
                throw new AuthenticationError("No autorizado");
            }

            try {                
                elObjetivo.coords = nuevaPosicion;
                await elObjetivo.save();
            } catch (error) {
                console.log(`error guardando el objetivo modificado: ${error}`);
            }

            return elObjetivo;

        },
        async setEstadoObjetivoProyecto(_: any, { idProyecto, idObjetivo, nuevoEstado }, contexto: contextoQuery) {
            let credencialesUsuario = contexto.usuario;
            try {
                var elProyecto: any = await Proyecto.findById(idProyecto).exec();
                if (!elProyecto) {
                    throw "proyecto no encontrado"
                }
            }
            catch (error) {
                console.log(`error buscando el proyecto. E: ` + error);
                throw new ApolloError("Error conectando con la base de datos");
            }

            //Authorización
            let permisosEspeciales = ["superadministrador"];
            if (!elProyecto.responsables.includes(credencialesUsuario.id) && !credencialesUsuario.permisos.some(p => permisosEspeciales.includes(p))) {
                console.log(`Error de autenticacion editando Estado de proyecto`);
                throw new AuthenticationError("No autorizado");
            }

            try {
                var elObjetivo: any = await Objetivo.findById(idObjetivo).exec();
                if (!elObjetivo) {
                    throw "Objetivo no existía";
                }
                elObjetivo.estado = nuevoEstado;
                console.log(`guardando nuevo estado ${nuevoEstado} en la base de datos`);
                await elObjetivo.save();
            } catch (error) {
                console.log(`error guardando el objetivo modificado: ${error}`);
                throw new ApolloError("Error guardando información en la base de datos");

            }
            console.log(`Estado guardado`);
            return elObjetivo;
        },
    }

}