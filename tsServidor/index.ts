import express, {Application, Request, Response, NextFunction} from "express"
const app: Application = express();
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const usuariosRoutes = require("./routes/usuarios");
const routesProyectos = require("./routes/proyectos");
const routesTrabajos = require("./routes/trabajos");
const routesNodos = require("./routes/atlas/nodos");
const {ApolloServer, gql} = require("apollo-server-express");
const cors= require("cors");
import { typeDefs, resolvers } from "./gql/NodosConocimiento";

dotenv.config();

const aServer= new ApolloServer({
  typeDefs,
  resolvers
});


//gestionAtlas.posicionarNodos();
//nodosCoordsCartesianas();

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

app.use(cors());

aServer.applyMiddleware({app});
app.use(express.static("public"));

//Routes
app.use(express.json());
app.use("/api/usuarios", usuariosRoutes);
app.use("/api/proyectos", routesProyectos);
app.use("/api/trabajos/", routesTrabajos);
app.use("/atlas/api/nodos", routesNodos);
app.post("", (req: Request, res: Response) => {
  res.send("hola");
});
const port = process.env.PORT || 3000;
app.listen(port, () => { console.log(`servidor Up en ${port}. Path gql: ${aServer.graphqlPath}`) });

