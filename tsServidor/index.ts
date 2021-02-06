import http from "http"
import express, { Application, Request, Response, NextFunction } from "express"
const app: Application = express();
const dotenv = require("dotenv");
dotenv.config();
const usuariosRoutes = require("./routes/usuarios");
const routesNodos = require("./routes/atlas/nodos");
const routesActividadesProfes = require("./routes/actividadesProfes");
const routesForos = require("./routes/foros");
import { iniciarMongoose } from "./mongoose";


const ejwt = require("express-jwt");
import cors from "cors";
import { aServer } from "./gql/Schema";


//Rutas pepepe
console.log(`Carpeta estatica en ${__dirname + '/pepepe'}`);
app.use("/pepepe", express.static(__dirname + '/clientes/pepepe'));
app.get("/pepepe", function (req: Request, res: Response) {
  res.sendFile(__dirname + "/clientes/pepepe/index.html");
});
aServer.applyMiddleware({ app });

//Carpetas publicas

app.use("/assetsAtlas", express.static(__dirname + '/assetsAtlas'));


const rutaFotografias = /api\/usuarios\/fotografias\/\S+/;
const rutaGuias = /api\/actividadesProfes\/guia\/\S+/;
const rutaEvidencias = /api\/actividadesProfes\/evidencia\/\S+/;
const rutaAdjuntos = /api\/foros\/adjuntos\/\S+/;


//Routes
app.use(express.json());
app.use("/api/usuarios", cors(), ejwt({ secret: process.env.JWT_SECRET, algorithms: ['HS256'] }).unless({ path: ['/api/usuarios/login', '/api/usuarios/registro', rutaFotografias] }), usuariosRoutes);
app.use("/api/atlas", routesNodos);
app.use("/api/actividadesProfes", cors(), ejwt({ secret: process.env.JWT_SECRET, algorithms: ['HS256'] }).unless({ path: [rutaGuias, rutaEvidencias] }), routesActividadesProfes);
app.use("/api/foros", cors(), ejwt({ secret: process.env.JWT_SECRET, algorithms: ['HS256'] }).unless({ path: [rutaAdjuntos] }), routesForos);
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

