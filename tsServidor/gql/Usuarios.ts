import { ApolloError, AuthenticationError, gql, UserInputError, withFilter } from "apollo-server-express";
import { ModeloUsuario as Usuario, permisosDeUsuario, validarDatosUsuario } from "../model/Usuario"
import { GraphQLDateTime } from "graphql-iso-date";
import { ModeloGrupoEstudiantil as GrupoEstudiantil } from "../model/actividadesProfes/GrupoEstudiantil";
import { contextoQuery } from "./tsObjetos"
import { ModeloNodo as Nodo } from "../model/atlas/Nodo";
import { ModeloObjetivo as Objetivo } from "../model/Objetivo";
import { ModeloTrabajo as Trabajo } from "../model/Trabajo"; 

interface Usuario {
    username: string,
    permisos: Array<string>,
    id: string
}


interface InterfacePayloadNuevaNotificacion {
    idNotificado: string,
    nuevaNotificacion: any
}


export const typeDefs = gql`
    scalar Date

    type ConfiguracionAtlas{
        modo:String
    }

    type MinimoCausante{
        id:ID,
        tipo:String,
    }

    type NotificacionActividadForos{
        idParent:ID,
        tipoParent:String,
        nombreParent:String,
        numeroRespuestasNuevas:Int,        
    }

    type Notificacion{
        id:ID,
        texto:String,
        causante:MinimoCausante,
        elementoTarget: MinimoElemento,
        fecha:Date
    }

    type DatoNodoUsuario{
        idNodo:ID,
        objetivo:Boolean,
        aprendido:Boolean
    }

    type ColeccionNodosAtlasConocimiento{
        id:ID,
        nombre: String,
        idsNodos: [ID],
        nodos:[NodoConocimiento],
    }

    type infoAtlas{
        centroVista:Coords,
        datosNodos:[DatoNodoUsuario],
        idNodoTarget:ID,
        configuracion: ConfiguracionAtlas,
        colecciones:[ColeccionNodosAtlasConocimiento]
    }
    type InfoAtlasSolidaridad{
        coordsVista:Coords,       
    }
    enum relacionUsuarioConocimiento{
        APRENDIENDO
        APRENDIDO
        OBJETIVO
    }

    type ConocimientoUsuario{
        tipo: relacionUsuarioConocimiento,
        nodoConocimiento: NodoConocimiento
    }

    type InfoConversacionesUsuario{
        idConversacion:ID,
        respuestasLeidas:Int,
    }

    type InfoForosUsuario{
        idForo:ID,
        conversaciones:[InfoConversacionesUsuario]
    }

    type Usuario{
        id: ID,
        nombres:String,
        apellidos: String,
        fechaNacimiento:Date,
        edad:Int,
        lugarResidencia:String,
        email:String,
        numeroTel:String,
        username:String,
        nodosConocimiento: [ConocimientoUsuario],
        atlas:infoAtlas,        
        atlasSolidaridad:InfoAtlasSolidaridad,
        permisos:[String]
        idGrupoEstudiantil:String,       
        nombreGrupoEstudiantil:String,
        notificaciones:[Notificacion],
        notificacionesActividadForos:[NotificacionActividadForos],
        foros:[InfoForosUsuario],

    }
    input DatosEditablesUsuario{
        nombres:String,
        apellidos: String,
        fechaNacimiento:String,
        lugarResidencia:String,
        email:String,
        numeroTel:String,
        username:String
    }
    type PublicUsuario{
        id: ID,
        username:String, 
        nombres:String,
        apellidos:String,
        email:String,
        numeroTel:String,
        lugarResidencia:String,
        edad:Int,
        idGrupoEstudiantil:String,       
        nombreGrupoEstudiantil:String,
    }

    extend type Query {
        todosUsuarios:[PublicUsuario],
        usuariosProfe:[PublicUsuario],
        yo:Usuario,
        publicUsuario(idUsuario:ID!): PublicUsuario,
    }
    extend type Mutation{
        setCentroVista(idUsuario:ID, centroVista: CoordsInput):Boolean,
        editarDatosUsuario(nuevosDatos: DatosEditablesUsuario):Usuario,
        addPermisoUsuario(nuevoPermiso:String!, idUsuario:ID!):Usuario,  
        eliminarUsuario(idUsuario:ID!):Boolean,
        eliminarNotificacion(idNotificacion:ID!):Boolean,
        eliminarNotificacionActividadForos(idParent:ID!):Boolean,
        setNodoObjetivo(idNodo:ID!, nuevoEstadoObjetivo:Boolean):Boolean
        setNodoAtlasAprendidoUsuario(idNodo:ID!, nuevoEstadoAprendido:Boolean):Boolean        
        setNodoAtlasTarget(idNodo:ID!):Boolean,
        nulificarNodoTargetUsuarioAtlas:Boolean,
        setModoUsuarioAtlas(idUsuario:ID!, nuevoModo:String!):Usuario,

        crearColeccionNodosAtlasConocimientoUsuario:Usuario,
        eliminarColeccionNodosAtlasConocimientoUsuario(idColeccion:ID!):Usuario,
        setNombreColeccionNodosAtlasConocimientoUsuario(idColeccion:ID!, nuevoNombre:String!):Usuario,
        addNodoColeccionNodosAtlasConocimientoUsuario(idColeccion:ID!, idNuevoNodo:ID!):ColeccionNodosAtlasConocimiento,
        removeNodoColeccionNodosAtlasConocimientoUsuario(idColeccion:ID!, idNodo:ID!):ColeccionNodosAtlasConocimiento,
        toggleNodoColeccionNodosAtlasConocimientoUsuario(idColeccion:ID!, idNodo:ID!, idUsuario:ID!):ColeccionNodosAtlasConocimiento,

        setCoordsVistaAtlasSolidaridadUsuario(coords:CoordsInput):Boolean,
        setNodoSolidaridadAsCoordsVistaUsuario(idNodo:ID!):Boolean,
    }
    extend type Subscription{
        nuevaNotificacion:Notificacion
    }

`

export const NUEVA_NOTIFICACION_PERSONAL = "nueva_notificacion_personal";

export const resolvers = {
    Subscription: {
        nuevaNotificacion: {
            subscribe: withFilter(
                (_: any, __: any, contexto: contextoQuery) => {
                    console.log(`--------------------------Creando una subscripción a notificaciones personales de ${contexto.usuario.username}`);

                    return contexto.pubsub.asyncIterator(NUEVA_NOTIFICACION_PERSONAL)
                },
                (payloadNuevaNotificacion: InterfacePayloadNuevaNotificacion, variables, contexto: contextoQuery) => {
                    console.log(`Decidiendo si notificar a ${contexto.usuario.id} con idNotificado=${payloadNuevaNotificacion.idNotificado}`);
                    if (payloadNuevaNotificacion.idNotificado != contexto.usuario.id) {
                        return false;
                    }
                    console.log(`Nueva notificacion personal para ${contexto.usuario.username}`);
                    return true;
                }
            )
        }
    },
    Query: {
        usuariosProfe: async function (_: any, args: any, context: contextoQuery) {
            console.log(`Fetching la lista de todos los profes`);
            try {
                var profes = await Usuario.find({ permisos: "actividadesEstudiantiles-profe" }).exec();
            } catch (error) {
                console.log(`Error buscando profes en la base de datos`);
                throw new ApolloError("Error conectando con la base de datos");
            }
            return profes;
        },
        todosUsuarios: async function (_: any, args: any, context: contextoQuery) {
            console.log(`Solicitud de la lista de todos los usuarios`);

            try {
                var todosUsuarios = await Usuario.find({}).exec();
            }
            catch (error) {
                console.log("Error fetching la lista de usuarios de la base de datos. E: " + error);
                throw new ApolloError("Error de conexión a la base de datos");
            }
            console.log(`Enviando lista de todos los usuarios`);
            return todosUsuarios;
        },
        publicUsuario: async function (_: any, {idUsuario}: any, context: contextoQuery) {
            try {
                var elUsuario:any = await Usuario.findById(idUsuario).exec();
            } catch (error) {
                console.log(`error buscando usuario con id ${idUsuario} en la base de datos`);
                throw new ApolloError("Error buscando usuario");
            }
            return elUsuario;
        },
        yo: async function (_: any, __: any, context: contextoQuery) {
            let credencialesUsuario = context.usuario;

            try {
                var elUsuario:any = await Usuario.findById(credencialesUsuario.id);
            }
            catch (error) {
                console.log("Error buscando el usuario en la base de datos. E: " + error);
                throw new ApolloError("Error accediendo a los datos de usuario");
            }
            return elUsuario;
        },
        
    },
    Mutation: {
        editarDatosUsuario: async function (_: any, { nuevosDatos }: any, context: contextoQuery) {
            console.log(`solicitud de edicion de datos de usuario`);
            let credencialesUsuario = context.usuario;
            console.log(`Usuario: Id: ${credencialesUsuario.id}, username: ${credencialesUsuario.username}`);
            if (!credencialesUsuario.permisos) {
                console.log(`No habia campo permisos activado en las credenciales del usuario`);
                throw new AuthenticationError("No autorizado");
            }

            try {
                var elUsuario: any = await Usuario.findById(credencialesUsuario.id).exec();
                if (!elUsuario) {
                    throw "Usuario no encontrado"
                }
            }
            catch (error) {
                console.log("Error buscando el usuario en la base de datos. E: " + error);
                throw new ApolloError("Error conectando con la base de datos");
            }

            let errores: Array<string> = validarDatosUsuario(nuevosDatos);

            if (errores.length > 0) {
                console.log(`Error validando datos: ${errores}`);
                throw new ApolloError("Datos invalidos");
            }
            console.log(`asignando ${nuevosDatos} al usuario`);

            try {
                Object.assign(elUsuario, nuevosDatos);
                await elUsuario.save()
            }
            catch (error) {
                console.log("Error guardando el usuario merged con nuevos datos. E: " + error);
                throw new ApolloError("Error guardando datos");
            }
            console.log(`Nuevos datos guardados`);
            return elUsuario;

        },
        setCentroVista: async function (_: any, { idUsuario, centroVista }: any, context: contextoQuery) {
            console.log(`Seting centro vista en ${JSON.stringify(centroVista)} para el usuario ${idUsuario}`);
            try {
                var elUsuario: any = await Usuario.findById(idUsuario, "atlas").exec();
                if (!elUsuario) {
                    throw "Error recopilando datos";
                }
            } catch (error) {
                console.log(`error buscando usuario en la base de datos`);
                throw new ApolloError("");
            }
            elUsuario.atlas.centroVista = centroVista;

            try {
                await elUsuario.save();
            } catch (error) {
                console.log(`error buscando usuario en la base de datos: ${error}`);
                throw new ApolloError("");

            }
            console.log(`Set`);
            return true;
        },
        addPermisoUsuario: async function (_: any, { idUsuario, nuevoPermiso }, contexto: contextoQuery) {
            console.log(`Peticion de dar permiso ${nuevoPermiso} a un usuario con id ${idUsuario}`);
            let credencialesUsuario = contexto.usuario;

            if (!credencialesUsuario.permisos) {
                console.log(`No habia permisos en las credenciales`);
                throw new AuthenticationError("No autorizado");
            }

            let permisosValidos = ["superadministrador"];

            if (!credencialesUsuario.permisos.some(p => permisosValidos.includes(p))) {
                console.log(`Usuario no tiene permisos válidos`);
                throw new AuthenticationError("No autorizado");
            }

            if (!permisosDeUsuario.includes(nuevoPermiso)) {
                console.log(`${nuevoPermiso} no es un permiso de usuario válido`);
                console.log(`los permisos válidos son: ${permisosDeUsuario}`);
                throw new AuthenticationError("Permiso no reconocido");
            }

            try {
                var elUsuario: any = await Usuario.findById(idUsuario).exec();
                if (!Array.isArray(elUsuario.permisos)) {
                    console.log(`Los permisos no eran un array: Eran: ${elUsuario.permisos}`);
                }
                if (!elUsuario.permisos.includes(nuevoPermiso)) {
                    console.log(`Añadiendo ${nuevoPermiso} a la lista de permisos`);
                    elUsuario.permisos.push(nuevoPermiso);
                    elUsuario.permisos = elUsuario.permisos.filter(p => p != "actividadesProfes-profe");
                }
                else {
                    console.log(`El usuario ya tenía ese permiso`);
                }
                await elUsuario.save();
            } catch (error) {
                console.log(`Error updating el usuario en la base de datos. e. ${error}`);
                throw new ApolloError("Error conectando con la base de datos");
            }

            console.log(`Permiso añadido.Quedó con: ${elUsuario.permisos}`);
            return elUsuario;
        },
        eliminarUsuario: async function (_: any, { idUsuario }, contexto: contextoQuery) {
            console.log(`||||||||||||||||||||||`);
            console.log(`Solicitud de eliminar un usuario con id ${idUsuario} de la base de datos`);

            let credencialesUsuario = contexto.usuario;

            if (!credencialesUsuario.permisos) {
                console.log(`No habia permisos en las credenciales`);
                throw new AuthenticationError("No autorizado");
            }

            let permisosValidos = ["superadministrador"];

            if (!credencialesUsuario.permisos.some(p => permisosValidos.includes(p))) {
                console.log(`Usuario no tiene permisos válidos`);
                throw new AuthenticationError("No autorizado");
            }

            try {
                let elEliminado: any = await Usuario.findByIdAndDelete(idUsuario).exec();
                if (!elEliminado) {
                    throw "Usuario no encontrado";
                }
                console.log(`Eliminado ${elEliminado.username}`);
            } catch (error) {
                console.log(`Error eliminando usuario. E: ${error}`);
                throw new AuthenticationError("Error conectando con la base de datos");
            }
            return true;


        },
        eliminarNotificacion: async function (_: any, { idNotificacion }, contexto: contextoQuery) {
            console.log(`|||||||||||||||||||||1`);
            console.log(`Peticion de eliminar una notificacion con id ${idNotificacion}`);
            //Authorización
            let credencialesUsuario = contexto.usuario;
            if(credencialesUsuario.permisos.length<1){
                console.log(`El usuario no estaba logeado`);
                throw new AuthenticationError("No autorizado");
            }
            
            try {
                await Usuario.findByIdAndUpdate(credencialesUsuario.id, {$pull:{notificaciones:{_id:idNotificacion}}}).exec();
            } catch (error) {
                console.log(`Error eliminando la notificacion de la base de datos. E: ${error}`);
                throw new ApolloError("Error conectando con la base de datos");
            }
            console.log(`Notificacion eliminada`);
            return true;
        },
        eliminarNotificacionActividadForos: async function (_: any, { idParent }, contexto: contextoQuery) {
            console.log(`|||||||||||||||||||||1`);
            console.log(`Peticion de eliminar una notificacion de actividad en foros con id ${idParent}`);
            //Authorización
            let credencialesUsuario = contexto.usuario;
            if(credencialesUsuario.permisos.length<1){
                console.log(`El usuario no estaba logeado`);
                throw new AuthenticationError("No autorizado");
            }
            
            try {
                await Usuario.findByIdAndUpdate(credencialesUsuario.id, {$pull:{notificacionesActividadForos:{idParent:idParent}}}).exec();
            } catch (error) {
                console.log(`Error eliminando la notificacion de la base de datos. E: ${error}`);
                throw new ApolloError("Error conectando con la base de datos");
            }
            console.log(`Notificacion eliminada`);
            return true;
        },
        setNodoObjetivo: async function (_: any, { idNodo, nuevoEstadoObjetivo }: any, contexto: contextoQuery) {
            let credencialesUsuario = contexto.usuario;
            if(!credencialesUsuario||!credencialesUsuario.id){
                throw new AuthenticationError("No autenticado");
            }

            console.log(`Seting nodo objetivo de ${idNodo} en ${nuevoEstadoObjetivo} para el usuario ${credencialesUsuario.id}`);            

            try {
                var elUsuario:any= await Usuario.findById(credencialesUsuario.id).exec();
                var indexN = elUsuario.atlas.datosNodos.findIndex(n=>n.idNodo==idNodo);
                if(indexN>-1){
                    elUsuario.atlas.datosNodos[indexN].objetivo=nuevoEstadoObjetivo;
                }
                else{
                    elUsuario.atlas.datosNodos.push({
                        idNodo,
                        objetivo:nuevoEstadoObjetivo
                    });
                }
                await elUsuario.save();
                return true;
            } catch (error) {
                console.log(`error guardando usuario en la base de datos: ${error}`);
                throw new ApolloError("");
            }
            
        },
        setNodoAtlasAprendidoUsuario: async function (_: any, { idNodo, nuevoEstadoAprendido }: any, contexto: contextoQuery) {
            let credencialesUsuario = contexto.usuario;
            if(!credencialesUsuario||!credencialesUsuario.id){
                throw new AuthenticationError("No autenticado");
            }

            console.log(`Seting nodo ${idNodo} en estado de aprendido ${nuevoEstadoAprendido} para el usuario ${credencialesUsuario.id}`);            

            try {
                var elUsuario:any= await Usuario.findById(credencialesUsuario.id).exec();
                var indexN = elUsuario.atlas.datosNodos.findIndex(n=>n.idNodo==idNodo);
                if(indexN>-1){
                    elUsuario.atlas.datosNodos[indexN].aprendido=nuevoEstadoAprendido;
                }
                else{
                    elUsuario.atlas.datosNodos.push({
                        idNodo,
                        aprendido:nuevoEstadoAprendido
                    });
                }
                await elUsuario.save();
                return true;
            } catch (error) {
                console.log(`error guardando usuario en la base de datos: ${error}`);
                throw new ApolloError("");
            }
            
        },
        setNodoAtlasTarget: async function (_: any, { idNodo}: any, contexto: contextoQuery) {
            let credencialesUsuario = contexto.usuario;
            if(!credencialesUsuario||!credencialesUsuario.id){
                throw new AuthenticationError("No autenticado");
            }

            console.log(`Seting nodo ${idNodo} como target para el usuario ${credencialesUsuario.id}`);            

            try {
                var elUsuario:any= await Usuario.findById(credencialesUsuario.id).exec();
                elUsuario.atlas.idNodoTarget=idNodo;                
                await elUsuario.save();
                return true;
            } catch (error) {
                console.log(`error guardando usuario en la base de datos: ${error}`);
                throw new ApolloError("");
            }
            
        },  
        nulificarNodoTargetUsuarioAtlas: async function (_: any, __: any, contexto: contextoQuery) {
            let credencialesUsuario = contexto.usuario;
            if(!credencialesUsuario||!credencialesUsuario.id){
                throw new AuthenticationError("No autenticado");
            }

            console.log(`Seting nodo target null para el usuario ${credencialesUsuario.id}`);            

            try {
                var elUsuario:any= await Usuario.findById(credencialesUsuario.id).exec();
                elUsuario.atlas.idNodoTarget=null;                
                await elUsuario.save();
                return true;
            } catch (error) {
                console.log(`error guardando usuario en la base de datos: ${error}`);
                throw new ApolloError("");
            }
            
        },
        setModoUsuarioAtlas: async function (_: any, { idUsuario, nuevoModo}: any, contexto: contextoQuery) {
            let credencialesUsuario = contexto.usuario;
            if(!credencialesUsuario||!credencialesUsuario.id){
                throw new AuthenticationError("No autenticado");
            }

            console.log(`Seting modo ${nuevoModo} para el usuario ${idUsuario}`);            

            // try {
            //     var losUsuarios:any=await Usuario.find({}).exec();
            //     losUsuarios.forEach(async (u)=>{
            //         u.atlas.colecciones=[];
            //         await u.save();
            //     })

            // } catch (error) {
            //     console.log(`Error corrigiendo todos los usuarios`);
            // }

            try {
                var elUsuario:any= await Usuario.findById(idUsuario).exec();
                
                elUsuario.atlas.configuracion.modo=nuevoModo;                
                // console.log(`Guardando usuario.atlas con valor: ${elUsuario.atlas}`);
                console.log(`Guardando usuario.atlas.colecciones con valor: ${elUsuario.atlas.colecciones}`);
                await elUsuario.save();
            
            } catch (error) {
                console.log(`error guardando usuario en la base de datos: ${error}`);
                throw new ApolloError("");
            }
            
            return elUsuario;
            
        },
     
        async crearColeccionNodosAtlasConocimientoUsuario(_:any, __:any, contexto:contextoQuery){
            const credencialesUsuario=contexto.usuario;

            if(!credencialesUsuario.id){
                console.log(`Error: no hay id en las credenciales de usuario`);
                throw new AuthenticationError("No logeado");                
            }

            try {
                var elUsuario:any=await Usuario.findById(credencialesUsuario.id).exec();
                if(!elUsuario){
                    throw "Usuario no encontrado";
                }
            } catch (error) {
                console.log(`Error buscando el usuario en la base de datos`);                  
                throw new ApolloError("Usuario no encontrado");
            }

            var nuevaColeccion = elUsuario.atlas.colecciones.create();
            elUsuario.atlas.colecciones.push(nuevaColeccion);

            try {
                await elUsuario.save();
            } catch (error) {
                console.log(`Error guardando la colección en la base de datos`);
                throw new ApolloError("Error conectando con la base de datos");
            }

            return elUsuario;

        },
        async eliminarColeccionNodosAtlasConocimientoUsuario(_:any, {idColeccion}:any, contexto:contextoQuery){
            const credencialesUsuario=contexto.usuario;

            if(!credencialesUsuario.id){
                console.log(`Error: no hay id en las credenciales de usuario`);
                throw new AuthenticationError("No logeado");                
            }

            try {
                var elUsuario:any=await Usuario.findById(credencialesUsuario.id).exec();
                if(!elUsuario){
                    throw "Usuario no encontrado";
                }
            } catch (error) {
                console.log(`Error buscando el usuario en la base de datos`);                  
                throw new ApolloError("Usuario no encontrado");
            }

            const indexC=elUsuario.atlas.colecciones.findIndex(c=>c.id===idColeccion);

            if(indexC>-1){
                elUsuario.atlas.colecciones.splice(indexC, 1);
            }
            else{
                throw new UserInputError("Colección no encontrada");
            }

            try {
                await elUsuario.save();
            } catch (error) {
                console.log(`Error guardando la colección en la base de datos`);
                throw new ApolloError("Error conectando con la base de datos");
            }

            return elUsuario;

        },
        async setNombreColeccionNodosAtlasConocimientoUsuario(_:any, {idColeccion, nuevoNombre}:any, contexto:contextoQuery){
            const credencialesUsuario=contexto.usuario;

            try {
                var elUsuario:any=await Usuario.findById(credencialesUsuario.id).exec();
                if(!elUsuario){
                    throw "Usuario no encontrado";                    
                }
            } catch (error) {
                console.log(`Error buscando el usuario`);
                throw new ApolloError("Usuario no encontrado");
            }

            nuevoNombre = nuevoNombre.trim();
            const charProhibidosNombreColeccion = /[^ a-zA-ZÀ-ž0-9_():.,-]/;
            if (charProhibidosNombreColeccion.test(nuevoNombre)) {
                throw new UserInputError("Nombre ilegal");
            }

            const indexC=elUsuario.atlas.colecciones.findIndex(c=>c.id===idColeccion);

            if(indexC>-1){
                elUsuario.atlas.colecciones[indexC].nombre=nuevoNombre;
            }
            else{
                throw new UserInputError("Colección no encontrada");
            }

            try {
                await elUsuario.save();
            } catch (error) {
                console.log(`Error guardando los datos del usuario`);
                throw new ApolloError("Error conectando con la base de datos");
            }

            return elUsuario;

        },
        async addNodoColeccionNodosAtlasConocimientoUsuario(_:any, {idColeccion, idNuevoNodo}:any, contexto:contextoQuery){
            const credencialesUsuario=contexto.usuario;

            try {
                var elUsuario:any=await Usuario.findById(credencialesUsuario.id).exec();
                if(!elUsuario){
                    throw "Usuario no encontrado";                    
                }
            } catch (error) {
                console.log(`Error buscando el usuario`);
                throw new ApolloError("Usuario no encontrado");
            }

            var laColeccion=elUsuario.atlas.colecciones.id(idColeccion);
            if(!laColeccion){
                console.log(`Coleccion no encontrada`);
                throw new UserInputError("Colección no encontrada");
            }

            var indexN=laColeccion.idsNodos.indexOf(idNuevoNodo);
            if(indexN===-1){
                laColeccion.idsNodos.push(idNuevoNodo);
            }
            else{
                throw new UserInputError("Nodo ya existía en la colección");
            }

            try {
                await elUsuario.save();
            } catch (error) {
                throw new ApolloError("Error guardando datos de usuario en la base de datos");
            }

            return laColeccion;
        },
        async removeNodoColeccionNodosAtlasConocimientoUsuario(_:any, {idColeccion, idNodo}:any, contexto:contextoQuery){
            const credencialesUsuario=contexto.usuario;

            try {
                var elUsuario:any=await Usuario.findById(credencialesUsuario.id).exec();
                if(!elUsuario){
                    throw "Usuario no encontrado";                    
                }
            } catch (error) {
                console.log(`Error buscando el usuario`);
                throw new ApolloError("Usuario no encontrado");
            }

            var laColeccion=elUsuario.atlas.colecciones.id(idColeccion);
            if(!laColeccion){
                console.log(`Coleccion no encontrada`);
                throw new UserInputError("Colección no encontrada");
            }

            var indexN=laColeccion.idsNodos.indexOf(idNodo);
            if(indexN>-1){
                laColeccion.idsNodos.splice(indexN, 1);
            }
            else{
                throw new UserInputError("Nodo no existía en la colección")
            }

            try {
                await elUsuario.save();
            } catch (error) {
                throw new ApolloError("Error guardando datos de usuario en la base de datos");
            }

            return laColeccion;
        },
        async toggleNodoColeccionNodosAtlasConocimientoUsuario(_:any, {idColeccion, idNodo, idUsuario}:any, contexto:contextoQuery){
            const credencialesUsuario=contexto.usuario;

            try {
                var elUsuario:any=await Usuario.findById(credencialesUsuario.id).exec();
                if(!elUsuario){
                    throw "Usuario no encontrado";                    
                }
            } catch (error) {
                console.log(`Error buscando el usuario`);
                throw new ApolloError("Usuario no encontrado");
            }

            //Autorizacion
            const permisosEspeciales=["superadministrador"];
            if(!permisosEspeciales.some(p=>credencialesUsuario.permisos.includes(p)) && !credencialesUsuario.id!=idUsuario){
                console.log(`No autorizado`);
                throw new AuthenticationError("No autorizado");
            }

            var laColeccion=elUsuario.atlas.colecciones.id(idColeccion);
            if(!laColeccion){
                console.log(`Coleccion no encontrada`);
                throw new UserInputError("Colección no encontrada");
            }

            const indexN=laColeccion.idsNodos.indexOf(idNodo);
            if(indexN===-1){
                laColeccion.idsNodos.push(idNodo);
            }
            else{
                laColeccion.idsNodos.splice(indexN, 1);
            }

            try {
                await elUsuario.save();
            } catch (error) {
                throw new ApolloError("Error guardando datos de usuario en la base de datos");
            }

            return laColeccion;
        },

        async setCoordsVistaAtlasSolidaridadUsuario(_:any, {coords}:any, contexto:contextoQuery){
            const credencialesUsuario=contexto.usuario;

            if(!credencialesUsuario.id){
                throw new AuthenticationError("No Autenticado");
            }

            try {
                var elUsuario:any=await Usuario.findById(credencialesUsuario.id).exec();
            } catch (error) {
                console.log(`Error buscando el usuario`);
                throw new ApolloError("Usuario no encontrado");
            }            
            elUsuario.atlasSolidaridad.coordsVista=coords;

            try {
                await elUsuario.save();
            } catch (error) {
                console.log(`Error guardando el usuario con el nuevo coords de centroVista`);
                throw new ApolloError("Error conectando con la base de datos");
            }

            console.log(`Nuevo coords vista en atlas solidaridad setted en ${JSON.stringify(coords)}`);
            return true;
        },
        async setNodoSolidaridadAsCoordsVistaUsuario(_:any, {idNodo}:any, contexto:contextoQuery){
            const credencialesUsuario=contexto.usuario;

            if(!credencialesUsuario.id){
                throw new AuthenticationError("No Autenticado");
            }

            try {
                var elUsuario:any=await Usuario.findById(credencialesUsuario.id).exec();
            } catch (error) {
                console.log(`Error buscando el usuario`);
                throw new ApolloError("Usuario no encontrado");
            }            

            try {
                var tipoDeNodo='trabajo'
                var elNodo: any = await Trabajo.findById(idNodo).exec();                

                if (!elNodo) {
                    tipoDeNodo='objetivo';
                    elNodo = await Objetivo.findById(idNodo).exec();
                }    
                if (!elNodo) {
                    tipoDeNodo='';
                    throw "Nodo no encontrado"
                }
                elNodo.tipoNodo=tipoDeNodo;
            }
            catch (error) {
                console.log("Error buscando el nodo. E: " + error);
                throw new ApolloError("Error en la conexión con la base de datos");
            }
            elUsuario.atlasSolidaridad.coordsVista=elNodo.coords;

            try {
                await elUsuario.save();
            } catch (error) {
                console.log(`Error guardando el usuario con el nuevo coords de centroVista`);
                throw new ApolloError("Error conectando con la base de datos");
            }

            console.log(`Nuevo coords vista en atlas solidaridad setted en ${JSON.stringify(elNodo.coords)} del nodo ${idNodo}`);
            return true;
        }
        
        

    },
    Usuario: {
        edad: function (parent: any, _: any, __: any) {
            if (!parent.fechaNacimiento) {
                return 0;
            }
            let edad = Date.now() - parent.fechaNacimiento;
            console.log(`Usuario tiene edad: ${edad}`);
            let edadAños = Math.floor(edad / (60 * 60 * 24 * 365 * 1000));
            edadAños = parseInt(edadAños.toFixed());
            return edadAños;
        },
        nombreGrupoEstudiantil: async function (parent: any) {
            if (!parent._id) {

                return ""
            }
            try {
                let elGrupo: any = await GrupoEstudiantil.findOne({ estudiantes: parent._id }).exec();
                if (!elGrupo) return ""
                var nombreGrupo = elGrupo.nombre;
            } catch (error) {
                console.log(`Error buscando grupo en la base de datos. E: ${error}`);
                return ""
            }
            return nombreGrupo;
        },
        idGrupoEstudiantil: async function (parent: any) {
            if (!parent._id) {

                return ""
            }
            try {
                let elGrupo = await GrupoEstudiantil.findOne({ estudiantes: parent._id });
                if (!elGrupo) return ""
                var idGrupo = elGrupo._id;
            } catch (error) {
                console.log(`Error buscando grupo en la base de datos. E: ${error}`);
                return ""
            }
            return idGrupo;
        }
    },
    PublicUsuario: {
        edad: function (parent: any, _: any, __: any) {
            if (!parent.fechaNacimiento) {
                return 0;
            }
            let edad = Date.now() - parent.fechaNacimiento;
            let edadAños = edad / (60 * 60 * 24 * 365 * 1000);
            edadAños = parseInt(edadAños.toFixed());
            return edadAños;
        },        
    },
    Date: {
        GraphQLDateTime
    },
    ColeccionNodosAtlasConocimiento:{
        nodos: async function(parent: any, _:any, __:any){
            console.log(`Resolviendo nodos de coleccion con parent: ${parent}`);
            try {
                var losNodos:any=await Nodo.find({_id:{$in: parent.idsNodos}}).exec();
            } catch (error) {
                console.log(`Error buscando los nodos de la coleccion ${parent.id}`);
            }
            console.log(`Encontrados ${losNodos.length} nodos`);
            if(!losNodos)losNodos=[];
            return losNodos;
        }
    }


}