const express=require("express");
const app=express();
const mongoose =require("mongoose");
const dotenv=require("dotenv");
const usuariosRoutes = require("./routes/usuarios");
const routesProyectos=require("./routes/proyectos");
const routesTrabajos = require("./routes/trabajos");
const routesNodos=require("./routes/atlas/nodos");

dotenv.config();

mongoose.connect(
    process.env.DB_CONNECT,    
    {useNewUrlParser : true,
    useUnifiedTopology: true },
    ()=>console.log("conexion exitosa a la b de datos")
);

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  // we're connected!
});

app.use( express.static("public"));

//Routes
app.use(express.json());
app.use("/api/usuarios", usuariosRoutes );
app.use("/api/proyectos", routesProyectos);
app.use("/api/trabajos/", routesTrabajos);
app.use("/atlas/api/nodos", routesNodos);
app.post("", (req, res) => {
    res.send("hola");
});
const port=process.env.PORT || 3000;
app.listen(port, ()=>{console.log(`servidor Up en ${port}`)});

