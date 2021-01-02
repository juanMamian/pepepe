
import express, {Application, Request, Response, NextFunction} from "express"
const app: Application = express();
const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();
const usuariosRoutes = require("./routes/usuarios");
const routesProyectos = require("./routes/proyectos");
const routesTrabajos = require("./routes/trabajos");
const routesNodos = require("./routes/atlas/nodos");
const {ApolloServer, gql} = require("apollo-server-express");
const passport = require("passport");
const ejwt=require("express-jwt");
import cors from "cors";

import { typeDefs, resolvers, context } from "./gql/NodosConocimiento";



const aServer= new ApolloServer({
  typeDefs,
  resolvers,
  context
});


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

app.use(passport.initialize());
app.use(passport.session());

aServer.applyMiddleware({app});

//Routes
app.use(express.json());
app.use("/api/usuarios", cors(), usuariosRoutes);
app.use("/api/proyectos", routesProyectos);
app.use("/api/trabajos/", routesTrabajos);
app.use("/api/atlas", routesNodos);
app.get("/prueba", ejwt({secret: process.env.JWT_SECRET, algorithms: ['HS256']}),(req, res)=>{res.send("Prueba exitosa")});
const port = process.env.PORT || 3000;
app.listen(port, () => { console.log(`servidor Up en ${port}. Path gql: ${aServer.graphqlPath}. Subscriptions en ${aServer.subscriptionsPath}`) });

