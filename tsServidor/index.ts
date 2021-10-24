import http from "http"
import express, { Application, Request, Response, NextFunction } from "express"
const app: Application = express();
const dotenv = require("dotenv");
dotenv.config();
const usuariosRoutes = require("./routes/usuarios");
const routesNodosConocimiento = require("./routes/atlasConocimiento/nodos");
const routesActividadesProfes = require("./routes/actividadesProfes");
const routesForos = require("./routes/foros");
const routesContenidosNodos=require("./routes/atlasConocimiento/contenidosNodos");
const routesCuentos=require("./routes/cuentos");
import { iniciarMongoose } from "./mongoose";

const ejwt = require("express-jwt");
import cors from "cors";
import { aServer } from "./gql/Schema";

//Rutas pepepe
console.log(`Carpeta estatica en ${__dirname + '/pepepe'}`);
app.use("/assetsAtlas/contenidosNodos/:idNodo/:nombreCategoria/default", express.static(__dirname + '/assetsAtlas/contenidosNodos/default/'));
app.use("/pepepe", express.static(__dirname + '/clientes/pepepe'));
app.get("/pepepe", function (req: Request, res: Response) {
  res.sendFile(__dirname + "/clientes/pepepe/index.html");
});

//rutas tallerCuentos
app.use("/tallerCuentos", express.static(__dirname+"/clientes/tallerCuentos"));
app.get("/tallerCuentos", function (req: Request, res: Response) {
  res.sendFile(__dirname + "/clientes/tallerCuentos/index.html");
});

//rutas libro
app.use("/libro", express.static(__dirname+"/clientes/libro"));
app.get("/libro", function (req: Request, res: Response) {
  res.sendFile(__dirname + "/clientes/libro/index.html");
});

//rutas observadores pájaros
app.use("/avesMaestrasPromocional", express.static(__dirname+"/clientes/observadoresPajaros"));
app.get("/avesMaestrasPromocional", function (req: Request, res: Response) {
  res.sendFile(__dirname + "/clientes/observadoresPajaros/index.html");
});


aServer.applyMiddleware({ app });

//Carpetas publicas

app.use("/assetsAtlas/contenidosNodos", routesContenidosNodos);
app.use("/assetsAtlas", express.static(__dirname + '/assetsAtlas'));


const rutaFotografias = /api\/usuarios\/fotografias\/\S+/;
const rutaGuias = /api\/actividadesProfes\/guia\/\S+/;
const rutaEvidencias = /api\/actividadesProfes\/evidencia\/\S+/;
const rutaAdjuntos = /api\/foros\/adjuntos\/\S+/;
const rutaIconos = /api\/atlas\/iconos\/\S+/;
const rutaContenidosSeccion = /api\/atlas\/seccion\/\S+/;

const rutaArchivosCuadroImagen=/apiCuentos\/imagenCuento\/\S+/;
const rutaArchivosAudioImagen=/apiCuentos\/audioImagen\/\S+/;
const rutaArchivosAudioTexto=/apiCuentos\/audioTexto\/\S+/;




//Routes
app.use(express.json());
app.use("/api/usuarios", cors(), ejwt({ secret: process.env.JWT_SECRET, algorithms: ['HS256'] }).unless({ path: ['/api/usuarios/login', '/api/usuarios/registro', rutaFotografias] }), usuariosRoutes);
app.use("/api/atlas", cors(), ejwt({ secret: process.env.JWT_SECRET, algorithms: ['HS256'] }).unless({ path: [rutaIconos, rutaContenidosSeccion] }), routesNodosConocimiento);
app.use("/api/actividadesProfes", cors(), ejwt({ secret: process.env.JWT_SECRET, algorithms: ['HS256'] }).unless({ path: [rutaGuias, rutaEvidencias] }), routesActividadesProfes);
app.use("/api/foros", cors(), ejwt({ secret: process.env.JWT_SECRET, algorithms: ['HS256'] }).unless({ path: [rutaAdjuntos] }), routesForos);

app.use("/apiCuentos", cors(), ejwt({ secret: process.env.JWT_SECRET, algorithms: ['HS256'] }).unless({ path: [rutaArchivosCuadroImagen, rutaArchivosAudioTexto, rutaArchivosAudioImagen] }), routesCuentos);
app.get("/", function (req: Request, res: Response) {
  return res.redirect("/pepepe");
});

const port = process.env.PORT || 3000;

const httpServer = http.createServer(app);
aServer.installSubscriptionHandlers(httpServer);


iniciarMongoose();


httpServer.listen(port, () => {
  console.log(`🚀 Server ready at http://localhost:${port}${aServer.graphqlPath}`)
  console.log(`🚀 Subscriptions ready at ws://localhost:${port}${aServer.subscriptionsPath}`)
})
//app.listen(port, () => { console.log(`servidor Up en ${port}. Path gql: ${aServer.graphqlPath}. Subscriptions en ${aServer.subscriptionsPath}`) });

