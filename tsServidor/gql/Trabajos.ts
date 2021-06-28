import { ApolloError, AuthenticationError, gql, UserInputError } from "apollo-server-express";
import { ModeloTrabajo as Trabajo } from "../model/Trabajo"; const Nodo = require("../model/atlas/Nodo");
import { ModeloUsuario as Usuario } from "../model/Usuario"
import { contextoQuery } from "./tsObjetos"
import { ModeloForo as Foro } from "../model/Foros/Foro"
import { ModeloProyecto as Proyecto } from "../model/Proyecto";

export const typeDefs = gql`

    type MaterialTrabajo{
        id: ID,
        nombre: String,
        descripcion:String,
        cantidadNecesaria:Int,
        cantidadDisponible:Int,    
        idTrabajoParent:ID,
    }

   type Trabajo{
       id: ID,
       nombre: String,
       descripcion:String,
       responsables: [String],
       posiblesResponsables:[String],
       responsablesSolicitados:Int,
       idObjetivoParent:String,
       nodosConocimiento:[String],
       idForo:ID,
       diagramaProyecto:InfoDiagramaProyecto,
       vinculos:[VinculoNodoProyecto],
       keywords:String,
       idProyectoParent:ID,
       estadoDesarrollo:String,
       materiales:[MaterialTrabajo],
       estado:String,       
       coords: Coords,
       angulo:Float,
       stuck:Boolean,
       puntaje:Int,
       centroMasa:Coords,
   }

   type InfoBasicaTrabajo{
       id:ID,
       nombre: String,
       idProyecto:ID
   }

   extend type Query{
       trabajo(idTrabajo: ID!):Trabajo,
       busquedaTrabajosProyectos(textoBusqueda:String!):[InfoBasicaTrabajo],
       trabajosDeProyectoDeUsuario(idUsuario:ID!):[InfoBasicaTrabajo],
       trabajosSegunCentro(centro: CoordsInput!, radio: Int!):[Trabajo],
   }

   extend type Mutation{
    crearMaterialEnTrabajoDeProyecto(idProyecto:ID!, idTrabajo:ID!):MaterialTrabajo,
    eliminarMaterialDeTrabajo(idTrabajo:ID!, idMaterial: ID!):Boolean,
    editarNombreMaterialTrabajo(idTrabajo:ID!, idMaterial: ID!, nuevoNombre: String!):MaterialTrabajo,
    editarDescripcionMaterialTrabajo(idTrabajo:ID!, idMaterial: ID!, nuevoDescripcion: String!):MaterialTrabajo,
    editarCantidadesMaterialTrabajo(idTrabajo: ID!, idMaterial:ID!, nuevoCantidadNecesaria:Int!, nuevoCantidadDisponible:Int):MaterialTrabajo,
    setResponsablesSolicitadosTrabajo(idTrabajo:ID!, nuevoCantidadResponsablesSolicitados: Int!):Trabajo,
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
        },
        trabajosDeProyectoDeUsuario: async function (_: any, { idUsuario }: any, contexto: contextoQuery) {
            console.log('Peticion de trabajos de usuario con id '+idUsuario);

            try {
                var losTrabajos:any=await Trabajo.find({"responsables":idUsuario}).exec();

            } catch (error) {
                console.log(`Error buscando trabajos de usuario. E: ${error}`);
                throw new ApolloError("Error conectando con la base de datos");
            }

            console.log(`Enviando ${losTrabajos.length} trabajos`);
            return losTrabajos;
        },
        trabajosSegunCentro: async function(_:any, {centro, radio}:any, __:any){
            try {
                var losTrabajos:any=await Trabajo.find({}).exec();
            } catch (error) {
                console.log(`Error buscando trabajos. E: ${error}`);
                throw new ApolloError("Error conectando con la base de datos");
            }
            return losTrabajos;
        }
    },

    Mutation:{
        
        async crearMaterialEnTrabajoDeProyecto(_: any, { idProyecto, idTrabajo }: any, contexto: contextoQuery) {
            console.log(`Peticion de crear un nuevo material en el trabajo con id ${idTrabajo}`);            

            //Authorización
            let credencialesUsuario = contexto.usuario;         
            
            if(!credencialesUsuario.id){
                console.log(`Usuario no autenticado`);
                throw new AuthenticationError("No autorizado");
            }

            try {
                var elTrabajo:any=await Trabajo.findById(idTrabajo).exec();
                if(!elTrabajo)throw "Trabajo no encontrado"
            } catch (error) {
                console.log(`Error buscando el trabajo. E: ${error}`);
                throw new ApolloError("Error conectando con la base de datos");
            }

            try {
                var nuevoMaterial = elTrabajo.materiales.create();
                elTrabajo.materiales.push(nuevoMaterial);
                await elTrabajo.save();
            }
            catch (error) {
                console.log("Error guardando el material creado en el trabajo. E: " + error);
                throw new ApolloError("Error introduciendo el material en el trabajo");
            }

            console.log(`Enviando nuevo material: ${nuevoMaterial}`);
            return nuevoMaterial;
        },
        async editarNombreMaterialTrabajo(_: any, { idTrabajo, idMaterial, nuevoNombre }, contexto: contextoQuery) {

            console.log(`cambiando el nombre del material con id ${idMaterial} del trabajo con id ${idTrabajo}`);
            const charProhibidosNombreMaterial = /[^ a-zA-ZÀ-ž0-9_():.,-]/;

            nuevoNombre = nuevoNombre.replace(/\s\s+/g, " ");
            if (charProhibidosNombreMaterial.test(nuevoNombre)) {
                throw new ApolloError("Nombre ilegal");
            }

            nuevoNombre = nuevoNombre.trim();

            try {
                var elTrabajo: any = await Trabajo.findById(idTrabajo).exec();
                if (!elTrabajo) {
                    throw "trabajo no encontrado"
                }
            }
            catch (error) {
                console.log("Error buscando el trabajo. E: " + error);
                throw new ApolloError("Erro en la conexión con la base de datos");
            }

            //Authorización
            let credencialesUsuario = contexto.usuario;
            if (!elTrabajo.responsables.includes(credencialesUsuario.id) && !credencialesUsuario.permisos.includes("superadministrador")) {
                console.log(`Error de autenticacion editando nombre de trabajo`);
                throw new AuthenticationError("No autorizado");
            }

            try {
                var elMaterial = elTrabajo.materiales.id(idMaterial);
                if (!elMaterial) {
                    console.log(`Material no encontrado en el trabajo`);
                    throw "No existía el material";
                }
                elMaterial.nombre = nuevoNombre;
            }
            catch (error) {
                console.log("Error cambiando el nombre en la base de datos. E: " + error);
                throw new ApolloError("Error guardando el nombre en la base de datos");
            }
            try {
                await elTrabajo.save();
            }
            catch (error) {
                console.log("Error guardando el material creado en el trabajo. E: " + error);
                throw new ApolloError("Error introduciendo el material en el trabajo");
            }
            console.log(`Nombre cambiado`);
            return elMaterial;
        },
        async editarDescripcionMaterialTrabajo(_: any, { idTrabajo, idMaterial, nuevoDescripcion }, contexto: contextoQuery) {
            console.log(`|||||||||||||||||||`);
            console.log(`Solicitud de set descripcion de material con id ${idMaterial} del trabajo con id ${idTrabajo}`);
            let credencialesUsuario = contexto.usuario;
            try {
                var elTrabajo: any = await Trabajo.findById(idTrabajo).exec();
                if (!elTrabajo) {
                    throw "trabajo no encontrado"
                }
            }
            catch (error) {
                console.log(`error buscando el trabajo. E: ` + error);
            }

            //Authorización
            let permisosEspeciales = ["superadministrador"];
            if (!elTrabajo.responsables.includes(credencialesUsuario.id) && !credencialesUsuario.permisos.some(p => permisosEspeciales.includes(p))) {
                console.log(`Error de autenticacion editando Descripcion de trabajo`);
                throw new AuthenticationError("No autorizado");
            }

            const charProhibidosDescripcionMaterial = /[^\n\r a-zA-ZÀ-ž0-9_():;.,+¡!¿?@=-]/;

            if (charProhibidosDescripcionMaterial.test(nuevoDescripcion)) {
                throw new ApolloError("Descripcion ilegal");
            }

            nuevoDescripcion = nuevoDescripcion.trim();
            let elMaterial = elTrabajo.materiales.id(idMaterial);
            if (!elMaterial) {
                console.log(`No existía el material`);
                throw new ApolloError("Error conectando con la base de datos");
            }
            elMaterial.descripcion = nuevoDescripcion;
            try {
                console.log(`guardando nuevo descripcion ${nuevoDescripcion} en la base de datos`);
                await elTrabajo.save();
            } catch (error) {
                console.log(`error guardando el trabajo con coordenadas manuales: ${error}`);
                throw new ApolloError("Error guardando información en la base de datos");
            }
            console.log(`Descripcion guardado`);
            return elMaterial;
        },
        async editarCantidadesMaterialTrabajo(_: any, { idTrabajo, idMaterial, nuevoCantidadNecesaria, nuevoCantidadDisponible }, contexto: contextoQuery) {
            console.log(`|||||||||||||||||||`);
            console.log(`Solicitud de set cantidades de material con id ${idMaterial} del trabajo con id ${idTrabajo}`);
            let credencialesUsuario = contexto.usuario;
            try {
                var elTrabajo: any = await Trabajo.findById(idTrabajo).exec();
                if (!elTrabajo) {
                    throw "trabajo no encontrado"
                }
            }
            catch (error) {
                console.log(`error buscando el trabajo. E: ` + error);
            }

            //Authorización
            let permisosEspeciales = ["superadministrador"];
            if (!elTrabajo.responsables.includes(credencialesUsuario.id) && !credencialesUsuario.permisos.some(p => permisosEspeciales.includes(p))) {
                console.log(`Error de autenticacion editando Descripcion de trabajo`);
                throw new AuthenticationError("No autorizado");
            }

            //Validacion

            nuevoCantidadNecesaria=parseInt(nuevoCantidadNecesaria);
            nuevoCantidadDisponible=parseInt(nuevoCantidadDisponible);
            
            if(nuevoCantidadDisponible<0 || nuevoCantidadNecesaria<0){
                throw new UserInputError("Datos no válidos");
            }

            let elMaterial = elTrabajo.materiales.id(idMaterial);
            if (!elMaterial) {
                console.log(`No existía el material`);
                throw new ApolloError("Error conectando con la base de datos");
            }
            elMaterial.cantidadNecesaria = nuevoCantidadNecesaria;
            elMaterial.cantidadDisponible = nuevoCantidadDisponible;

            try {                
                await elTrabajo.save();
            } catch (error) {
                console.log(`error guardando el trabajo con coordenadas manuales: ${error}`);
                throw new ApolloError("Error guardando información en la base de datos");
            }
            console.log(`Cantidades guardado`);
            return elMaterial;
        },
        async eliminarMaterialDeTrabajo(_: any, { idMaterial, idTrabajo }: any, contexto: contextoQuery) {
            console.log(`peticion de eliminar un material con id ${idMaterial} de un trabajo con id ${idTrabajo}`);
            let credencialesUsuario = contexto.usuario;

            try {
                var elTrabajo: any = await Trabajo.findById(idTrabajo).exec();
                if (!elTrabajo) {
                    throw "trabajo no encontrado"
                }
            }
            catch (error) {
                console.log("Error buscando el trabajo en la base de datos. E: " + error);
                throw new ApolloError("Error conectando con la base de datos");
            }

            //Authorización
            let permisosEspeciales = ["superadministrador"];


            if (!elTrabajo.responsables.includes(credencialesUsuario.id) && !credencialesUsuario.permisos.some(p => permisosEspeciales.includes(p))) {
                console.log(`Error de autenticacion editando nombre de trabajo`);
                throw new AuthenticationError("No autorizado");
            }


            try {
                await Trabajo.findByIdAndUpdate(idTrabajo, { $pull: { materiales: { "_id": idMaterial } } });
            }
            catch (error) {
                console.log("Error eliminando el material. E: " + error);
                throw new ApolloError("Error conectando con la base de datos");
            }

            console.log(`eliminado`);

            return true;
        },
        setResponsablesSolicitadosTrabajo: async function(_: any, { idTrabajo, nuevoCantidadResponsablesSolicitados}, contexto: contextoQuery){
            let credencialesUsuario = contexto.usuario;
            console.log(`Solicitud de set cantidad de responsables solicitados de ${nuevoCantidadResponsablesSolicitados} en trabajo con id ${idTrabajo}`);
            
            try {
                var elTrabajo: any = await Trabajo.findById(idTrabajo).exec();
                if (!elTrabajo) {
                    throw "trabajo no encontrado"
                }
            }
            catch (error) {
                console.log("Error buscando el trabajo en la base de datos. E: " + error);
                throw new ApolloError("Error de conexión con la base de datos");
            }

            if (!credencialesUsuario.permisos.includes("superadministrador") && !elTrabajo.responsables.includes(credencialesUsuario.id)) {
                console.log(`Error de autenticacion editando responsables solicitados.`);
                throw new AuthenticationError("No autorizado");
            }

            elTrabajo.responsablesSolicitados=nuevoCantidadResponsablesSolicitados;

            try {
                await elTrabajo.save();
            } catch (error) {
                console.log(`Error guardando el trabajo: ${error}`);
                throw new ApolloError("Error conectando con la base de datos");
            }
            console.log(`Retornando con ${elTrabajo.responsablesSolicitados} responsables solicitados`);
            return elTrabajo;
        },
    }




}