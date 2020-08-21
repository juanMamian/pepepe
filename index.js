const express=require("express");
const app=express();
const mongoose =require("mongoose");
const dotenv=require("dotenv");
const authRoutes = require("./routes/auth");
const routesProyectos=require("./routes/proyectos");

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

app.use(express.static("public"));

//Routes
app.use(express.json());
app.use("/api/usuarios", authRoutes );
app.use("/api/proyectos", routesProyectos);

app.post("", (req, res) => {
    res.send("hola");
});

app.listen(3000, ()=>{console.log(`servidor Up en 3000`)});
