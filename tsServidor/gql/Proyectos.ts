import { ApolloError, AuthenticationError, gql, UserInputError } from "apollo-server-express";
import { ModeloProyecto as Proyecto } from "../model/Proyecto";
import { ModeloTrabajo as Trabajo } from "../model/Trabajo";
import { contextoQuery } from "./tsObjetos"
import { ModeloUsuario as Usuario } from "../model/Usuario";
import { ModeloForo as Foro } from "../model/Foros/Foro"

export const typeDefs = gql`

    type InfoDiagramaProyecto{
        posicion:Coords
    }

    type VinculoNodoProyecto{
        idRef:ID,
        tipo:String,
        tipoRef:String,
    }

    type Proyecto{
        id: ID,
        nombre: String,
        descripcion:String,
        responsables: [String],
        posiblesResponsables:[String],
        personasResponsables:[PublicUsuario]
        personasPosiblesResponsables:[PublicUsuario],
        trabajos: [Trabajo],
        objetivos: [Objetivo],
        idForo:ID,        
        materiales:[MaterialTrabajo],
        centroMasa:Coords,
    }

   union NodoProyecto=Objetivo | Trabajo

   type RespuestaNodoProyecto{
       nodo: NodoProyecto,
   }

   type PaginaTrabajosProyectos{
        hayMas:Boolean,
        infoTrabajos:[InfoBasicaTrabajo]
    }

    extend type Query{
        proyectos: [Proyecto!],
        proyecto(idProyecto:ID!): Proyecto
        proyectosSegunCentro(centro: CoordsInput, radio:Int!):[Proyecto],       

        listaTodosTrabajosProyectos(pagina: Int!, pagina:Int!):PaginaTrabajosProyectos,
    }
    extend type Mutation{
        editarNombreProyecto(idProyecto: ID!, nuevoNombre: String!):Proyecto,
        editarDescripcionProyecto(idProyecto: ID!, nuevoDescripcion: String!):Proyecto,
        crearProyecto:Proyecto, 
        eliminarProyecto(idProyecto:ID!):Boolean,       
        addResponsableProyecto(idProyecto:ID!, idUsuario:ID!):Proyecto,
        addPosibleResponsableProyecto(idProyecto:ID!, idUsuario:ID!):Proyecto,
        removeResponsableProyecto(idProyecto:ID!, idUsuario:ID!):Proyecto,       

        crearRequerimentoEntreNodosProyecto(idProyecto:ID!, idNodoRequiere:ID!, idNodoRequerido:ID!, tipoNodoRequiere:String!, tipoNodoRequerido:String!):RespuestaNodoProyecto,
        desvincularNodosProyecto(idProyecto:ID!, idNodoRequiere:ID!, idNodoRequerido:ID!, tipoNodoRequiere:String!, tipoNodoRequerido:String!):RespuestaNodoProyecto,

    }
    
    
`;

export const resolvers = {
    Query: {
        proyectos: async function (_: any, args: any, context: contextoQuery) {
            console.log(`enviando lista de todos los proyectos`);
            try {
                var listaP = await Proyecto.find({}).exec();
            } catch (error) {
                console.log(`error buscando la lista de proyectos. E: ${error}`);
                throw new ApolloError("");
            }
            return listaP;
        },
        proyectosSegunCentro: async function (_: any, {centro, radio}: any, context: contextoQuery) {
            console.log(`enviando lista de todos los proyectos segun centro`);
            try {
                var listaP = await Proyecto.find({}).exec();
            } catch (error) {
                console.log(`error buscando la lista de proyectos. E: ${error}`);
                throw new ApolloError("");
            }
            return listaP;
        },
        proyecto: async function (_: any, { idProyecto }: any, context: any) {
            //   organizarDiagrama(idProyecto);
            console.log(`Buscando proyecto con id ${idProyecto}`);
            try {
                var elProyecto: any = await Proyecto.findById(idProyecto).exec();
                if (!elProyecto) {
                    throw "proyecto no encontrado"
                }

            } catch (error) {
                console.log(`Error buscando el proyecto. E:${error}`);
                throw new ApolloError("Error en la conexión con la base de datos");
            }
            let tieneForo = true;

            if (!elProyecto.idForo) {
                tieneForo = false;
            }
            else {
                try {
                    let elForo: any = await Foro.findById(elProyecto.idForo).exec();
                    if (!elForo) {
                        console.log(`El foro no existía. Se creará uno nuevo`);
                        tieneForo = false;
                    }
                } catch (error) {
                    console.log(`Error buscando foro en la base de datos. E :${error}`);
                }
            }

            if (!tieneForo) {
                console.log(`El proyecto ${elProyecto.nombre} no tenía foro. Creando con responsables: ${elProyecto.responsables}.`);
                try {
                    var nuevoForo: any = await Foro.create({
                        miembros: elProyecto.responsables,
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
                    elProyecto.idForo = idNuevoForo;
                    await elProyecto.save();
                } catch (error) {
                    console.log(`Error guardando el proyecto`);
                    throw new ApolloError("Error conectando con la base de datos");
                }

            }
            return elProyecto
        },
        async listaTodosTrabajosProyectos(_: any, { pagina }, contexto: contextoQuery) {
            console.log(`Petición de info basica de todos trabajos de proyectos`);
            const sizePaginaTrabajos = 35;
            if (contexto.usuario.id === "") {
                console.log(`Usuario no logeado`);
                throw new AuthenticationError("No autorizado");
            }

            try {
                var numTrabajos = await Trabajo.countDocuments({}).exec();
                console.log(`Hay ${numTrabajos} trabajos en la base de datos`);
                var losTrabajos: any = await Trabajo.find({}, "nombre").limit(sizePaginaTrabajos).skip(pagina * sizePaginaTrabajos).exec();
            } catch (error) {
                console.log(`Error buscando trabajos. E: ${error}`);
                return new ApolloError("Error conectando con la base de datos");
            }

            let hayMas = (pagina + 1) * sizePaginaTrabajos < numTrabajos;
            console.log(`Enviando pagina ${pagina} de trabajos`);
            return { hayMas, infoTrabajos: losTrabajos }
        },

    },

    Mutation: {
        addPosibleResponsableProyecto: async function (_: any, { idProyecto, idUsuario }: any, contexto: contextoQuery) {
            console.log(`añadiendo usuario ${idUsuario} a la lista de posibles responsables del proyecto ${idProyecto}`);
            let credencialesUsuario = contexto.usuario;
            try {
                var elProyecto: any = await Proyecto.findById(idProyecto).exec();
                if (!elProyecto) {
                    throw "proyecto no encontrado"
                }
            }
            catch (error) {
                console.log("Error buscando el proyecto en la base de datos. E: " + error);
                throw new ApolloError("Error de conexión con la base de datos");
            }

            //Authorización

            if (idUsuario != credencialesUsuario.id && !credencialesUsuario.permisos.includes("superadministrador")) {
                console.log(`Error de autenticacion añadiendo posible responsable del proyecto`);
                throw new AuthenticationError("No autorizado");
            }

            if (elProyecto.posiblesResponsables.includes(idUsuario) || elProyecto.responsables.includes(idUsuario)) {
                console.log(`el usuario ya estaba en la lista`);
                throw new ApolloError("El usuario ya estaba en la lista");
            }
            try {
                var elUsuario: any = await Usuario.findById(idUsuario).exec();
                if (!elUsuario) {
                    console.log(`No se pudo encontrar al usuario con id ${idUsuario} en la base de datos`);
                    throw new ApolloError("Error buscando al usuario en la base de datos");
                }
            }
            catch (error) {
                console.log("Error buscando al usuario en la base de datos. E: " + error);
                throw new ApolloError("Error conectando con la base de datos");
            }


            try {
                elProyecto.posiblesResponsables.push(idUsuario);
                await elProyecto.save();
            }
            catch (error) {
                console.log("Error guardando datos en la base de datos. E: " + error);
                throw new ApolloError("Error conectando con la base de datos");
            }
            console.log(`Proyecto guardado`);
            return elProyecto
        },
        addResponsableProyecto: async function (_: any, { idProyecto, idUsuario }: any, contexto: contextoQuery) {
            console.log(`Solicitud de add un usuario con id ${idUsuario} a un proyecto con id ${idProyecto}`);
            let credencialesUsuario = contexto.usuario;

            try {
                var elProyecto: any = await Proyecto.findById(idProyecto).exec();
                if (!elProyecto) {
                    throw "proyecto no encontrado"
                }
            }
            catch (error) {
                console.log("Error buscando el proyecto en la base de datos. E: " + error);
                throw new ApolloError("Error de conexión con la base de datos");
            }

            //Authorización

            if (elProyecto.responsables.length > 0 && !elProyecto.responsables.includes(credencialesUsuario.id) && credencialesUsuario.permisos.includes("superadministrador")) {
                console.log(`Error de autenticacion. Hay ${elProyecto.responsables.length} responsable: ${elProyecto.responsables}`);
                throw new AuthenticationError("No autorizado");
            }

            try {
                var elUsuario: any = await Usuario.findById(idUsuario).exec();
                if (!elUsuario) {
                    console.log(`No se pudo encontrar al usuario con id ${idUsuario} en la base de datos`);
                    throw new ApolloError("Error buscando al usuario en la base de datos");
                }
            }
            catch (error) {
                console.log("Error buscando al usuario en la base de datos. E: " + error);
                throw new ApolloError("Error conectando con la base de datos");
            }

            if (elProyecto.responsables.includes(idUsuario)) {
                console.log(`El usuario ya era responsable de este proyecto`);
                throw new ApolloError("El usuario ya estaba incluido");
            }


            elProyecto.responsables.push(idUsuario);
            console.log(`Usuario añadido a la lista de responsables`);

            let indexPosibleResponsable = elProyecto.posiblesResponsables.indexOf(idUsuario);
            if (indexPosibleResponsable > -1) {
                console.log(`sacando al usuario ${idUsuario} de la lista de posibles responsables`);
                elProyecto.posiblesResponsables.splice(indexPosibleResponsable, 1);
            }

            try {
                await elProyecto.save();
            }
            catch (error) {
                console.log("Error guardando datos en la base de datos. E: " + error);
                throw new ApolloError("Error conectando con la base de datos");
            }

            //Mirror responsables del proyecto hacia miembros del foro
            try {
                await Foro.findByIdAndUpdate(elProyecto.idForo, { miembros: elProyecto.responsables });
            } catch (error) {
                console.log(`Error mirroring responsables del proyecto hacia miembros del foro. E: ${error}`);
            }
            console.log(`Proyecto guardado`);
            return elProyecto

        },
        removeResponsableProyecto: async function (_: any, { idProyecto, idUsuario }: any, contexto: contextoQuery) {
            console.log(`Solicitud de remover un usuario con id ${idUsuario} a un proyecto con id ${idProyecto}`);
            let credencialesUsuario = contexto.usuario;

            try {
                var elProyecto: any = await Proyecto.findById(idProyecto).exec();
                if (!elProyecto) {
                    throw "proyecto no encontrado"
                }
            }
            catch (error) {
                console.log("Error buscando el proyecto en la base de datos. E: " + error);
                throw new ApolloError("Error de conexión con la base de datos");
            }

            //Authorización

            if (idUsuario != credencialesUsuario.id && !credencialesUsuario.permisos.includes("superadministrador")) {
                console.log(`Error de autenticacion removiendo responsable o posible responsable de proyecto`);
                throw new AuthenticationError("No autorizado");
            }

            try {
                var elUsuario: any = await Usuario.findById(idUsuario).exec();
                if (!elUsuario) {
                    console.log(`No se pudo encontrar al usuario con id ${idUsuario} en la base de datos`);
                    throw new ApolloError("Error buscando al usuario en la base de datos");
                }
            }
            catch (error) {
                console.log("Error buscando al usuario en la base de datos. E: " + error);
                throw new ApolloError("Error conectando con la base de datos");
            }

            let indexPosibleResponsable = elProyecto.posiblesResponsables.indexOf(idUsuario);

            if (indexPosibleResponsable > -1) {
                console.log(`sacando al usuario ${idUsuario} de la lista de posibles responsables`);
                elProyecto.posiblesResponsables.splice(indexPosibleResponsable, 1);
            }

            let indexResponsable = elProyecto.responsables.indexOf(idUsuario);

            if (indexResponsable > -1) {
                console.log(`sacando al usuario ${idUsuario} de la lista de responsables`);
                elProyecto.responsables.splice(indexResponsable, 1);
            }

            try {
                await elProyecto.save();
            }
            catch (error) {
                console.log("Error guardando datos en la base de datos. E: " + error);
                throw new ApolloError("Error conectando con la base de datos");
            }

            //Mirror responsables del proyecto hacia miembros del foro
            try {
                await Foro.findByIdAndUpdate(elProyecto.idForo, { miembros: elProyecto.responsables });
            } catch (error) {
                console.log(`Error mirroring responsables del proyecto hacia miembros del foro. E: ${error}`);
            }

            console.log(`Proyecto guardado`);
            return elProyecto

        },
        editarNombreProyecto: async function (_: any, { idProyecto, nuevoNombre }: any, contexto: contextoQuery) {
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
                console.log(`Error de autenticacion editando nombre de proyecto`);
                throw new AuthenticationError("No autorizado");
            }

            const charProhibidosNombreProyecto = /[^ a-zA-ZÀ-ž0-9_():.,-]/;

            nuevoNombre = nuevoNombre.replace(/\s\s+/g, " ");
            if (charProhibidosNombreProyecto.test(nuevoNombre)) {
                throw new ApolloError("Nombre ilegal");
            }


            nuevoNombre = nuevoNombre.trim();

            try {
                console.log(`guardando nuevo nombre ${elProyecto.nombre} en la base de datos`);
                var resProyecto: any = await Proyecto.findByIdAndUpdate(idProyecto, { nombre: nuevoNombre }, { new: true }).exec();
            } catch (error) {
                console.log(`error guardando el proyecto con coordenadas manuales: ${error}`);
            }
            console.log(`Nombre guardado`);
            return resProyecto;
        },
        editarDescripcionProyecto: async function (_: any, { idProyecto, nuevoDescripcion }: any, contexto: contextoQuery) {
            console.log(`|||||||||||||||||||`);
            console.log(`Solicitud de set descripcion del proyecto con id ${idProyecto}`);
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
                console.log(`Error de autenticacion editando Descripcion de proyecto`);
                throw new AuthenticationError("No autorizado");
            }

            const charProhibidosDescripcionProyecto = /[^\n\r a-zA-ZÀ-ž0-9_():;.,+¡!¿?@=-]/;

            if (charProhibidosDescripcionProyecto.test(nuevoDescripcion)) {
                throw new ApolloError("Descripcion ilegal");
            }


            nuevoDescripcion = nuevoDescripcion.trim();

            try {
                console.log(`guardando nuevo descripcion ${nuevoDescripcion} en la base de datos`);
                var resProyecto: any = await Proyecto.findByIdAndUpdate(idProyecto, { descripcion: nuevoDescripcion }, { new: true }).exec();
            } catch (error) {
                console.log(`error guardando el proyecto: ${error}`);
            }
            console.log(`Descripcion guardado`);
            return resProyecto;
        },
        async crearProyecto(_: any, args: any, contexto: contextoQuery) {
            console.log(`mutacion`);
            let usuario = contexto.usuario;
            if (!usuario) {
                console.log(`Intento de crear un nuevo proyecto sin nombre de usuario seteado en el contexto`);
                //throw new AuthenticationError("No autorizado");
            }
            if (!usuario.id) {
                console.log(`No había id del usuario creador`);
                throw new ApolloError("No ID");
            }
            console.log(`el usuario ${usuario.username} intenta crear un nuevo proyecto`);
            let elProyecto: any = await new Proyecto({
                responsables: [usuario.id]
            });

            try {
                var nuevoForo: any = await Foro.create({
                    acceso: "privado",
                    miembros: elProyecto.responsables,
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
                console.log(`error guardando el nuevo proyecto. E: ${error}`);
                throw new ApolloError("error");
            }
            console.log(`proyecto creado`);

            return elProyecto;
        },
        async eliminarProyecto(_: any, { idProyecto }: any, contexto: contextoQuery) {
            console.log(`peticion de eliminar un proyecto con id ${idProyecto}`);
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
            let esUltimoResponsable = (elProyecto.responsables.length == 1 && elProyecto.responsables[0] == credencialesUsuario.id);

            if (!esUltimoResponsable && !credencialesUsuario.permisos.some(p => permisosEspeciales.includes(p))) {
                console.log(`Error de autenticacion editando nombre de proyecto`);
                throw new AuthenticationError("No autorizado");
            }

            try {
                await Proyecto.findByIdAndDelete(idProyecto).exec();
            }
            catch (error) {
                console.log("Error guardando el trabajo creado en el proyecto. E: " + error);
                throw new ApolloError("Error introduciendo el trabajo en el proyecto");
            }

            console.log(`eliminado`);

            return true;
        },
                
        crearRequerimentoEntreNodosProyecto: async function (_: any, { idProyecto, idNodoRequiere, idNodoRequerido, tipoNodoRequiere, tipoNodoRequerido }, contexto: contextoQuery) {
            console.log(`Solicitud de crear un requerimento entre un ${tipoNodoRequiere} con id ${idNodoRequiere} que requiere a un ${tipoNodoRequerido} con id ${idNodoRequerido}`);

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
            const permisosEspeciales = ["superadministrador"];
            let credencialesUsuario = contexto.usuario;
            if (!elProyecto.responsables.includes(credencialesUsuario.id) && !credencialesUsuario.permisos.some(p => permisosEspeciales.includes(p))) {
                console.log(`Error de autenticacion creando vinculos en proyecto`);
                throw new AuthenticationError("No autorizado");
            }

            const vinculo = {
                idRef: idNodoRequerido,
                tipoRef: tipoNodoRequerido,
                tipo: "requiere"
            }

            if (tipoNodoRequiere === "objetivo") {
                try {
                    var elqueRequiere = elProyecto.objetivos.id(idNodoRequiere);
                    if (!elqueRequiere) throw "El objetivo que requiere no encontrado"
                } catch (error) {
                    console.log(`Error buscando al que requiere. E: ${error}`);
                    throw new ApolloError("Error conectando con la base de datos");
                }
            } else if (tipoNodoRequiere === "trabajo") {
                try {
                    var elqueRequiere: any = await Trabajo.findById(idNodoRequiere).exec();
                    if (!elqueRequiere) throw "El trabajo que requiere no encontrado"
                } catch (error) {
                    console.log(`Error buscando al que requiere. E: ${error}`);
                    throw new ApolloError("Error conectando con la base de datos");
                }
            } else {
                console.log(`Tipo de nodo que requiere no reconocido`);
                throw new ApolloError("Error. Tipo " + tipoNodoRequiere + " no soportado");
            }


            const indexV = elqueRequiere.vinculos.findIndex(v => v.idRef === idNodoRequerido);

            if (indexV > -1) {
                console.log(`Reemplazando un vinculo ya existente`);
                elqueRequiere.vinculos.splice(indexV, 1);
            }
            try {
                elqueRequiere.vinculos.push(vinculo);
                if (tipoNodoRequiere === "trabajo") {
                    await elqueRequiere.save();
                }
                else if (tipoNodoRequiere === "objetivo") {
                    await elProyecto.save()
                }
            } catch (error) {
                console.log(`Error guardando el nodo modificado en la base de datos. E: ${error}`);
                throw new ApolloError("Error conectando con la base de datos");
            }

            return { nodo: elqueRequiere };

        },
        desvincularNodosProyecto: async function (_: any, { idProyecto, idNodoRequiere, idNodoRequerido, tipoNodoRequiere, tipoNodoRequerido }, contexto: contextoQuery) {
            console.log(`Solicitud de eliminar vínculo entre un ${tipoNodoRequiere} con id ${idNodoRequiere} que requiere a un ${tipoNodoRequerido} con id ${idNodoRequerido}`);

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
            const permisosEspeciales = ["superadministrador"];
            let credencialesUsuario = contexto.usuario;
            if (!elProyecto.responsables.includes(credencialesUsuario.id) && !credencialesUsuario.permisos.some(p => permisosEspeciales.includes(p))) {
                console.log(`Error de autenticacion eliminando vinculos en proyecto`);
                throw new AuthenticationError("No autorizado");
            }


            if (tipoNodoRequiere === "objetivo") {
                try {
                    var elqueRequiere = elProyecto.objetivos.id(idNodoRequiere);
                    if (!elqueRequiere) throw "El objetivo que requiere no encontrado"
                } catch (error) {
                    console.log(`Error buscando al que requiere. E: ${error}`);
                    throw new ApolloError("Error conectando con la base de datos");
                }
            } else if (tipoNodoRequiere === "trabajo") {
                try {
                    var elqueRequiere: any = await Trabajo.findById(idNodoRequiere).exec();
                    if (!elqueRequiere) throw "El trabajo que requiere no encontrado"
                } catch (error) {
                    console.log(`Error buscando al que requiere. E: ${error}`);
                    throw new ApolloError("Error conectando con la base de datos");
                }
            } else {
                console.log(`Tipo de nodo que requiere no reconocido`);
                throw new ApolloError("Error. Tipo " + tipoNodoRequiere + " no soportado");
            }

            try {
                const indexV = elqueRequiere.vinculos.findIndex(v => v.idRef === idNodoRequerido);

                if (indexV > -1) {
                    console.log(`Eliminando vinculo`);
                    elqueRequiere.vinculos.splice(indexV, 1);
                }
                else {
                    console.log(`El vinculo no existía`);
                    throw new ApolloError("El vinculo no existia");
                }
                if (tipoNodoRequiere === "trabajo") {
                    await elqueRequiere.save();
                }
                else if (tipoNodoRequiere === "objetivo") {
                    await elProyecto.save()
                }
            } catch (error) {
                console.log(`Error guardando el nodo modificado en la base de datos. E: ${error}`);
                throw new ApolloError("Error conectando con la base de datos");
            }
            return { nodo: elqueRequiere };

        },

    },
    Proyecto: {
        personasResponsables: async function (parent: any, _: any, __: any) {

            if (!parent.responsables) {
                return [];
            }
            let idsResponsables = parent.responsables;

            try {
                var usuariosResponsables = await Usuario.find({ _id: { $in: idsResponsables } }).exec();
                if (!usuariosResponsables) {
                    console.log(`No habia usuarios responsables`);
                }
            } catch (error) {
                console.log(`error buscando a los responsables del proyecto. E: ${error}`);
                return [];
            }


            return usuariosResponsables;
        },
        personasPosiblesResponsables: async function (parent: any, _: any, __: any) {
            if (!parent.posiblesResponsables) {
                return [];
            }
            let idsPosiblesResponsables = parent.posiblesResponsables;

            try {
                var usuariosPosiblesResponsables = Usuario.find({ _id: { $in: idsPosiblesResponsables } }).exec();
            } catch (error) {
                console.log(`error buscando a los posiblesResponsables del proyecto. E: ${error}`);
                return [];
            }

            return usuariosPosiblesResponsables;
        },
        materiales: async function (parent: any, _: any, __: any) {
            console.log(`Resolviendo materiales de ${parent.id} con ${parent.idsTrabajos.length} trabajos`);

            try {
                var losTrabajos: any = await Trabajo.find({ "_id": { $in: parent.idsTrabajos } }).select("nombre materiales").exec();
            } catch (error) {
                console.log(`Error querying los trabajos. E: ${error}`);
                throw new ApolloError("Error conectando con la base de datos");
            }
            var aMateriales:any[] = [];
            for (var i = 0; i < losTrabajos.length; i++) {
                let esteTrabajo=losTrabajos[i];
                for(var j=0;j<esteTrabajo.materiales.length;j++){
                    let esteMaterial=esteTrabajo.materiales[j];
                    esteMaterial.idTrabajoParent=esteTrabajo._id;
                    aMateriales.push(esteMaterial);
                }                
            }
            return aMateriales;
        },
        trabajos: async function(parent: any, _:any, __:any){
            console.log(`Poblando trabajos con id proyecto: ${parent.id}`);

            try {
                var trabajosProyecto:any=await Trabajo.find({idProyectoParent: parent.id}).exec();
            } catch (error) {
                console.log(`Error buscando trabajos del proyecto`);
                throw new ApolloError("Error conectando con la base de datos");
            }
            return trabajosProyecto;
        }
    },

    NodoProyecto: {
        __resolveType: function (nodo) {
            if (nodo.responsables) {
                return "Trabajo"
            }
            else if (nodo.estado) {
                return "Objetivo"
            }
        }
    }
}