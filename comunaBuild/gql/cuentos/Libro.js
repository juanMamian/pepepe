"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolvers = exports.typeDefs = void 0;
const apollo_server_express_1 = require("apollo-server-express");
const Libro_1 = require("../../model/cuentos/Libro");
exports.typeDefs = apollo_server_express_1.gql `

    type AudioEmbedded{
        tipoReproduccion:String,
    },

    type CuadroImagenCuento{
        id:ID,
        sinArchivo:Boolean
        tipoActivacionSecundario:String,
        posicion:Coords,
        size:Coords,
        originalSize:Coords,
        audio: AudioEmbedded,
    },

    type FormatoTexto{
        alineacion:String,
        fontSize:Int,
        colorLetra:String,
        tipoLetra:String,
    }

    type CuadroTextoCuento{
        id:ID,
        texto:String,
        posicion:Coords,
        size:Coords,
        formato:FormatoTexto,
        audio:AudioEmbedded,
    }

    type PaginaCuento{
        id:ID,
        numPag:Int,
        cuadrosTexto:[CuadroTextoCuento],
        cuadrosImagen:[CuadroImagenCuento],
        color:String,
    }

    type Libro{
        id:ID,
        paginas: [PaginaCuento],
        idsEditores: [String],
        titulo:String,
    }

    extend type Query{
        libro(idLibro:ID!):Libro,
        misLibros:[Libro],
        todosLibros:[Libro],

    }

    extend type Mutation{
        crearNuevoLibro:Libro,
        eliminarPaginaDeLibro(idLibro:ID!, idPagina:ID!):Boolean,
        editarTituloLibro(idLibro:ID!, nuevoTitulo:String):Libro,
        crearNuevaPaginaLibro(idLibro:ID!):PaginaCuento,
        crearCuadroTextoPaginaLibro(idLibro:ID!, idPagina:ID!, datosPosicion:CoordsInput!, datosSize: CoordsInput!):CuadroTextoCuento,
        crearCuadroImagenPaginaLibro(idLibro:ID!, idPagina:ID!, datosPosicion:CoordsInput!, datosSize: CoordsInput!):CuadroImagenCuento,
    
        updateTextoCuadroTextoCuento(idLibro:ID!, idPagina:ID!, idCuadroTexto:ID!, nuevoTexto:String!):CuadroTextoCuento,
        updateSizeCuadroTexto(idLibro:ID!, idPagina:ID!, idCuadroTexto:ID!, nuevoSize:CoordsInput!):CuadroTextoCuento,
        updatePosicionCuadroTexto(idLibro:ID!, idPagina:ID!, idCuadroTexto:ID!, nuevoPosicion:CoordsInput!):CuadroTextoCuento,
        eliminarCuadroTextoLibro(idLibro:ID!, idPagina:ID!, idCuadroTexto:ID!):Boolean,

        updatePosicionCuadroImagen(idLibro:ID!, idPagina:ID!, idCuadroImagen:ID!, nuevoPosicion:CoordsInput!):CuadroImagenCuento,
        eliminarCuadroImagenLibro(idLibro:ID!, idPagina:ID!, idCuadroImagen:ID!):Boolean,

    }

`;
exports.resolvers = {
    Query: {
        libro: function (_, { idLibro }, context) {
            return __awaiter(this, void 0, void 0, function* () {
                try {
                    var elLibro = yield Libro_1.ModeloLibro.findById(idLibro).exec();
                    if (!elLibro)
                        throw "libro no encontrado";
                }
                catch (error) {
                    console.log(`Error buscando libro. E: ${error}`);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                console.log(`enviando libro ${elLibro.id}`);
                return elLibro;
            });
        },
        misLibros: function (_, __, context) {
            return __awaiter(this, void 0, void 0, function* () {
                console.log(`Peticion mis libros de: `);
                const usuario = context.usuario;
                try {
                    var losLibros = yield Libro_1.ModeloLibro.find({ idsEditores: usuario.id }).exec();
                }
                catch (error) {
                    console.log(`Error buscando misLibros. E: ${error}`);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                console.log(`Enviando ${losLibros.length} libros`);
                return losLibros;
            });
        },
        todosLibros: function (_, __, context) {
            return __awaiter(this, void 0, void 0, function* () {
                console.log(`Peticion mis libros de: `);
                console.log(`Credenciales usuario: ${JSON.stringify(context)}`);
                const credencialesUsuario = context.usuario;
                let permisosEspeciales = ["superadministrador"];
                if (!credencialesUsuario.permisos.some(p => permisosEspeciales.includes(p))) {
                    console.log(`Error de autenticacion pidiendo todosLibros`);
                    throw new apollo_server_express_1.AuthenticationError("No autorizado");
                }
                try {
                    var losLibros = yield Libro_1.ModeloLibro.find({}).exec();
                }
                catch (error) {
                    console.log(`Error buscando misLibros. E: ${error}`);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                console.log(`Enviando ${losLibros.length} libros`);
                return losLibros;
            });
        }
    },
    Mutation: {
        eliminarPaginaDeLibro(_, { idLibro, idPagina }, contexto) {
            return __awaiter(this, void 0, void 0, function* () {
                let credencialesUsuario = contexto.usuario;
                try {
                    var elLibro = yield Libro_1.ModeloLibro.findById(idLibro).exec();
                    if (!elLibro) {
                        throw "libro no encontrado";
                    }
                }
                catch (error) {
                    console.log(`error buscando el libro. E: ` + error);
                }
                //Authorización
                let permisosEspeciales = ["superadministrador"];
                if (!elLibro.idsEditores.includes(credencialesUsuario.id) && !credencialesUsuario.permisos.some(p => permisosEspeciales.includes(p))) {
                    console.log(`Error de autenticacion editando titulo de libro`);
                    throw new apollo_server_express_1.AuthenticationError("No autorizado");
                }
                try {
                    elLibro.paginas.pull(idPagina);
                    yield elLibro.save();
                }
                catch (error) {
                    console.log(`Error eliminando la página ${idPagina} del libro`);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                return true;
            });
        },
        crearNuevoLibro(_, __, contexto) {
            return __awaiter(this, void 0, void 0, function* () {
                console.log(`Peticion de crear un nuevo libro`);
                const usuario = contexto.usuario;
                if (usuario.id.length == 0) {
                    throw new apollo_server_express_1.AuthenticationError("No logeado");
                }
                try {
                    var nuevoLibro = new Libro_1.ModeloLibro({
                        idsEditores: [usuario.id],
                    });
                    yield nuevoLibro.save();
                }
                catch (error) {
                    console.log(`Error creando el nuevo libro. E: ${error}`);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos.");
                }
                return nuevoLibro;
            });
        },
        editarTituloLibro: function (_, { idLibro, nuevoTitulo }, contexto) {
            return __awaiter(this, void 0, void 0, function* () {
                let credencialesUsuario = contexto.usuario;
                try {
                    var elLibro = yield Libro_1.ModeloLibro.findById(idLibro).exec();
                    if (!elLibro) {
                        throw "libro no encontrado";
                    }
                }
                catch (error) {
                    console.log(`error buscando el libro. E: ` + error);
                }
                //Authorización
                let permisosEspeciales = ["superadministrador"];
                if (!elLibro.idsEditores.includes(credencialesUsuario.id) && !credencialesUsuario.permisos.some(p => permisosEspeciales.includes(p))) {
                    console.log(`Error de autenticacion editando titulo de libro`);
                    throw new apollo_server_express_1.AuthenticationError("No autorizado");
                }
                const charProhibidosTituloLibro = /[^ a-zA-ZÀ-ž0-9_():.,-¿?¡!]/;
                nuevoTitulo = nuevoTitulo.replace(/\s\s+/g, " ");
                if (charProhibidosTituloLibro.test(nuevoTitulo)) {
                    throw new apollo_server_express_1.ApolloError("Titulo ilegal");
                }
                nuevoTitulo = nuevoTitulo.trim();
                try {
                    console.log(`guardando nuevo titulo ${elLibro.titulo} en la base de datos`);
                    var resLibro = yield Libro_1.ModeloLibro.findByIdAndUpdate(idLibro, { titulo: nuevoTitulo }, { new: true }).exec();
                }
                catch (error) {
                    console.log(`error guardando el libro con coordenadas manuales: ${error}`);
                }
                console.log(`Titulo guardado`);
                return resLibro;
            });
        },
        crearNuevaPaginaLibro(_, { idLibro }, contexto) {
            return __awaiter(this, void 0, void 0, function* () {
                console.log(`Petición de crear una nueva página en el libro con id ${idLibro}`);
                let credencialesUsuario = contexto.usuario;
                try {
                    var elLibro = yield Libro_1.ModeloLibro.findById(idLibro).exec();
                    if (!elLibro) {
                        throw "libro no encontrado";
                    }
                }
                catch (error) {
                    console.log(`error buscando el libro. E: ` + error);
                }
                //Authorización
                let permisosEspeciales = ["superadministrador"];
                if (!elLibro.idsEditores.includes(credencialesUsuario.id) && !credencialesUsuario.permisos.some(p => permisosEspeciales.includes(p))) {
                    console.log(`Error de autenticacion editando titulo de libro`);
                    throw new apollo_server_express_1.AuthenticationError("No autorizado");
                }
                var nuevaPagina = elLibro.paginas.create({});
                try {
                    elLibro.paginas.push(nuevaPagina);
                    yield elLibro.save();
                }
                catch (error) {
                    console.log(`Error guardando el libro con la nueva página`);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                return nuevaPagina;
            });
        },
        crearCuadroTextoPaginaLibro(_, { idLibro, idPagina, datosPosicion, datosSize }, contexto) {
            return __awaiter(this, void 0, void 0, function* () {
                console.log(`Solicitud de crear un cuadro texto en la pagina ${idPagina} del libro ${idLibro}`);
                let credencialesUsuario = contexto.usuario;
                try {
                    var elLibro = yield Libro_1.ModeloLibro.findById(idLibro).exec();
                    if (!elLibro) {
                        throw "libro no encontrado";
                    }
                }
                catch (error) {
                    console.log(`error buscando el libro. E: ` + error);
                }
                //Authorización
                let permisosEspeciales = ["superadministrador"];
                if (!elLibro.idsEditores.includes(credencialesUsuario.id) && !credencialesUsuario.permisos.some(p => permisosEspeciales.includes(p))) {
                    console.log(`Error de autenticacion insertando cuadro de texto`);
                    throw new apollo_server_express_1.AuthenticationError("No autorizado");
                }
                var laPagina = elLibro.paginas.id(idPagina);
                if (!laPagina) {
                    console.log(`Pagina no encontrada`);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                var nuevoCuadroTexto = laPagina.cuadrosTexto.create({
                    posicion: datosPosicion,
                    size: datosSize,
                });
                try {
                    laPagina.cuadrosTexto.push(nuevoCuadroTexto);
                    yield elLibro.save();
                }
                catch (error) {
                    console.log(`Erro guardando el libro con el nuevo cuadro texto`);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                return nuevoCuadroTexto;
            });
        },
        updateTextoCuadroTextoCuento(_, { idLibro, idPagina, idCuadroTexto, nuevoTexto }, contexto) {
            return __awaiter(this, void 0, void 0, function* () {
                console.log(`Solicitud de update texto en un cuadro texto en la pagina ${idPagina} del libro ${idLibro}`);
                let credencialesUsuario = contexto.usuario;
                try {
                    var elLibro = yield Libro_1.ModeloLibro.findById(idLibro).exec();
                    if (!elLibro) {
                        throw "libro no encontrado";
                    }
                }
                catch (error) {
                    console.log(`error buscando el libro. E: ` + error);
                }
                //Authorización
                let permisosEspeciales = ["superadministrador"];
                if (!elLibro.idsEditores.includes(credencialesUsuario.id) && !credencialesUsuario.permisos.some(p => permisosEspeciales.includes(p))) {
                    console.log(`Error de autenticacion updating texto de cuadro de texto`);
                    throw new apollo_server_express_1.AuthenticationError("No autorizado");
                }
                var laPagina = elLibro.paginas.id(idPagina);
                if (!laPagina) {
                    console.log(`Pagina no encontrada`);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                var elCuadroTexto = laPagina.cuadrosTexto.id(idCuadroTexto);
                if (!elCuadroTexto) {
                    console.log(`CuadroTexto no encontrado`);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                try {
                    elCuadroTexto.texto = nuevoTexto;
                    yield elLibro.save();
                }
                catch (error) {
                    console.log(`Error guardando el libro. E: ${error}`);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                return elCuadroTexto;
            });
        },
        updateSizeCuadroTexto(_, { idLibro, idPagina, idCuadroTexto, nuevoSize }, contexto) {
            return __awaiter(this, void 0, void 0, function* () {
                console.log(`Solicitud de update size de cuadro texto en la pagina ${idPagina} del libro ${idLibro}`);
                let credencialesUsuario = contexto.usuario;
                try {
                    var elLibro = yield Libro_1.ModeloLibro.findById(idLibro).exec();
                    if (!elLibro) {
                        throw "libro no encontrado";
                    }
                }
                catch (error) {
                    console.log(`error buscando el libro. E: ` + error);
                }
                //Authorización
                let permisosEspeciales = ["superadministrador"];
                if (!elLibro.idsEditores.includes(credencialesUsuario.id) && !credencialesUsuario.permisos.some(p => permisosEspeciales.includes(p))) {
                    console.log(`Error de autenticacion updating size de cuadro de texto`);
                    throw new apollo_server_express_1.AuthenticationError("No autorizado");
                }
                var laPagina = elLibro.paginas.id(idPagina);
                if (!laPagina) {
                    console.log(`Pagina no encontrada`);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                var elCuadroTexto = laPagina.cuadrosTexto.id(idCuadroTexto);
                if (!elCuadroTexto) {
                    console.log(`CuadroTexto no encontrado`);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                try {
                    elCuadroTexto.size = nuevoSize;
                    yield elLibro.save();
                }
                catch (error) {
                    console.log(`Error guardando el libro. E: ${error}`);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                return elCuadroTexto;
            });
        },
        updatePosicionCuadroTexto(_, { idLibro, idPagina, idCuadroTexto, nuevoPosicion }, contexto) {
            return __awaiter(this, void 0, void 0, function* () {
                console.log(`Solicitud de update posicion de cuadro texto en la pagina ${idPagina} del libro ${idLibro}`);
                let credencialesUsuario = contexto.usuario;
                try {
                    var elLibro = yield Libro_1.ModeloLibro.findById(idLibro).exec();
                    if (!elLibro) {
                        throw "libro no encontrado";
                    }
                }
                catch (error) {
                    console.log(`error buscando el libro. E: ` + error);
                }
                //Authorización
                let permisosEspeciales = ["superadministrador"];
                if (!elLibro.idsEditores.includes(credencialesUsuario.id) && !credencialesUsuario.permisos.some(p => permisosEspeciales.includes(p))) {
                    console.log(`Error de autenticacion updating posicion de cuadro de texto`);
                    throw new apollo_server_express_1.AuthenticationError("No autorizado");
                }
                var laPagina = elLibro.paginas.id(idPagina);
                if (!laPagina) {
                    console.log(`Pagina no encontrada`);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                var elCuadroTexto = laPagina.cuadrosTexto.id(idCuadroTexto);
                if (!elCuadroTexto) {
                    console.log(`CuadroTexto no encontrado`);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                try {
                    elCuadroTexto.posicion = nuevoPosicion;
                    yield elLibro.save();
                }
                catch (error) {
                    console.log(`Error guardando el libro. E: ${error}`);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                return elCuadroTexto;
            });
        },
        eliminarCuadroTextoLibro(_, { idLibro, idPagina, idCuadroTexto }, contexto) {
            return __awaiter(this, void 0, void 0, function* () {
                console.log(`Solicitud de eliminar cuadro texto en la pagina ${idPagina} del libro ${idLibro}`);
                let credencialesUsuario = contexto.usuario;
                try {
                    var elLibro = yield Libro_1.ModeloLibro.findById(idLibro).exec();
                    if (!elLibro) {
                        throw "libro no encontrado";
                    }
                }
                catch (error) {
                    console.log(`error buscando el libro. E: ` + error);
                }
                //Authorización
                let permisosEspeciales = ["superadministrador"];
                if (!elLibro.idsEditores.includes(credencialesUsuario.id) && !credencialesUsuario.permisos.some(p => permisosEspeciales.includes(p))) {
                    console.log(`Error de autenticacion eliminando cuadro de texto`);
                    throw new apollo_server_express_1.AuthenticationError("No autorizado");
                }
                var laPagina = elLibro.paginas.id(idPagina);
                if (!laPagina) {
                    console.log(`Pagina no encontrada`);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                try {
                    laPagina.cuadrosTexto.pull(idCuadroTexto);
                    yield elLibro.save();
                }
                catch (error) {
                    console.log(`Error guardando el libro. E: ${error}`);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                return true;
            });
        },
        crearCuadroImagenPaginaLibro(_, { idLibro, idPagina, datosPosicion, datosSize }, contexto) {
            return __awaiter(this, void 0, void 0, function* () {
                console.log(`Solicitud de crear un cuadro imágen en la pagina ${idPagina} del libro ${idLibro}`);
                let credencialesUsuario = contexto.usuario;
                try {
                    var elLibro = yield Libro_1.ModeloLibro.findById(idLibro).exec();
                    if (!elLibro) {
                        throw "libro no encontrado";
                    }
                }
                catch (error) {
                    console.log(`error buscando el libro. E: ` + error);
                }
                //Authorización
                let permisosEspeciales = ["superadministrador"];
                if (!elLibro.idsEditores.includes(credencialesUsuario.id) && !credencialesUsuario.permisos.some(p => permisosEspeciales.includes(p))) {
                    console.log(`Error de autenticacion insertando cuadro de imágen`);
                    throw new apollo_server_express_1.AuthenticationError("No autorizado");
                }
                var laPagina = elLibro.paginas.id(idPagina);
                if (!laPagina) {
                    console.log(`Pagina no encontrada`);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                var nuevoCuadroImagen = laPagina.cuadrosImagen.create({
                    posicion: datosPosicion,
                    size: datosSize,
                });
                try {
                    laPagina.cuadrosImagen.push(nuevoCuadroImagen);
                    yield elLibro.save();
                }
                catch (error) {
                    console.log(`Erro guardando el libro con el nuevo cuadro texto`);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                return nuevoCuadroImagen;
            });
        },
        updatePosicionCuadroImagen(_, { idLibro, idPagina, idCuadroImagen, nuevoPosicion }, contexto) {
            return __awaiter(this, void 0, void 0, function* () {
                console.log(`Solicitud de update posicion de cuadro imágen en la pagina ${idPagina} del libro ${idLibro}`);
                let credencialesUsuario = contexto.usuario;
                try {
                    var elLibro = yield Libro_1.ModeloLibro.findById(idLibro).exec();
                    if (!elLibro) {
                        throw "libro no encontrado";
                    }
                }
                catch (error) {
                    console.log(`error buscando el libro. E: ` + error);
                }
                //Authorización
                let permisosEspeciales = ["superadministrador"];
                if (!elLibro.idsEditores.includes(credencialesUsuario.id) && !credencialesUsuario.permisos.some(p => permisosEspeciales.includes(p))) {
                    console.log(`Error de autenticacion updating posicion de cuadro de imágen`);
                    throw new apollo_server_express_1.AuthenticationError("No autorizado");
                }
                var laPagina = elLibro.paginas.id(idPagina);
                if (!laPagina) {
                    console.log(`Pagina no encontrada`);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                var elCuadroImagen = laPagina.cuadrosImagen.id(idCuadroImagen);
                if (!elCuadroImagen) {
                    console.log(`CuadroImagen no encontrado`);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                try {
                    elCuadroImagen.posicion = nuevoPosicion;
                    yield elLibro.save();
                }
                catch (error) {
                    console.log(`Error guardando el libro. E: ${error}`);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                return elCuadroImagen;
            });
        },
        eliminarCuadroImagenLibro(_, { idLibro, idPagina, idCuadroImagen }, contexto) {
            return __awaiter(this, void 0, void 0, function* () {
                console.log(`Solicitud de eliminar cuadro imagen en la pagina ${idPagina} del libro ${idLibro}`);
                let credencialesUsuario = contexto.usuario;
                try {
                    var elLibro = yield Libro_1.ModeloLibro.findById(idLibro).exec();
                    if (!elLibro) {
                        throw "libro no encontrado";
                    }
                }
                catch (error) {
                    console.log(`error buscando el libro. E: ` + error);
                }
                //Authorización
                let permisosEspeciales = ["superadministrador"];
                if (!elLibro.idsEditores.includes(credencialesUsuario.id) && !credencialesUsuario.permisos.some(p => permisosEspeciales.includes(p))) {
                    console.log(`Error de autenticacion eliminando cuadro de imagen`);
                    throw new apollo_server_express_1.AuthenticationError("No autorizado");
                }
                var laPagina = elLibro.paginas.id(idPagina);
                if (!laPagina) {
                    console.log(`Pagina no encontrada`);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                try {
                    laPagina.cuadrosImagen.pull(idCuadroImagen);
                    yield elLibro.save();
                }
                catch (error) {
                    console.log(`Error guardando el libro. E: ${error}`);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                return true;
            });
        },
    }
};
