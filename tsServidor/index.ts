import http from "http"
import express, {Application, Request, Response, NextFunction} from "express"
const app: Application = express();
const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();
const usuariosRoutes = require("./routes/usuarios");
const routesNodos = require("./routes/atlas/nodos");
const routesActividadesProfes=require("./routes/actividadesProfes");



const ejwt=require("express-jwt");
import cors from "cors";
import {aServer} from "./gql/Schema";

mongoose.connect(
  process.env.DB_CONNECT,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true
  },
  () => console.log("conexion exitosa a la b de datos")
);

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
  // we're connected!
});

//Rutas pepepe
console.log(`Carpeta estatica en ${__dirname+'/pepepe'}`);
app.use("/pepepe",express.static(__dirname+'/clientes/pepepe'));
app.get("/pepepe", function(req:Request, res:Response){
  res.sendFile(__dirname+"/clientes/pepepe/index.html");
});
aServer.applyMiddleware({app});



const rutaFotografias=/api\/usuarios\/fotografias\/\S+/;
const rutaGuias=/api\/actividadesProfes\/guia\/\S+/;
const rutaEvidencias=/api\/actividadesProfes\/evidencia\/\S+/;


//Routes
app.use(express.json());
app.use("/api/usuarios", cors(), ejwt({secret: process.env.JWT_SECRET, algorithms: ['HS256']}).unless({path:['/api/usuarios/login', '/api/usuarios/registro', rutaFotografias]}), usuariosRoutes);
app.use("/api/atlas", routesNodos);
app.use("/api/actividadesProfes", cors(), ejwt({secret: process.env.JWT_SECRET, algorithms: ['HS256']}).unless({path:[rutaGuias, rutaEvidencias]}), routesActividadesProfes);


const port = process.env.PORT || 3000;

const httpServer = http.createServer(app);
aServer.installSubscriptionHandlers(httpServer);

httpServer.listen(port, () => {
  console.log(`🚀 Server ready at http://localhost:${port}${aServer.graphqlPath}`)
  console.log(`🚀 Subscriptions ready at ws://localhost:${port}${aServer.subscriptionsPath}`)
})
//app.listen(port, () => { console.log(`servidor Up en ${port}. Path gql: ${aServer.graphqlPath}. Subscriptions en ${aServer.subscriptionsPath}`) });

