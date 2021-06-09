const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Proyecto = require("./comunaBuild/model/Proyecto").ModeloProyecto;
const Objetivo = require("./comunaBuild/model/Objetivo").ModeloObjetivo;



dotenv.config();

mongoose.set('useFindAndModify', false);

const iniciarMongoose = async () => {
    try {
        await mongoose.connect(
            process.env.DB_CONNECT,
            {
                useNewUrlParser: true,
                useUnifiedTopology: true
            }
        );
    } catch (error) {
        console.log(`Error conectando con la base de datos: E:${error}`);
    }
}

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
    console.log(`¡Base de datos conectada!`);
});

const migrar = async function () {
    await iniciarMongoose();
    try {
        var losProyectos = await Proyecto.find({}).exec();
        console.log(`Hay ${losProyectos.length} proyectos`);
    }
    catch (error) {
        console.log(`error . e: ` + error);
    }

    losProyectos.forEach(async (proyecto)=>{
        console.log(`*`);
        console.log(`*`);
        console.log(`*`);
        console.log(`Proyecto ${proyecto.nombre}`);
        console.log(`:`);
        if(!proyecto.objetivos){
            console.log(`El proyecto ${proyecto.nombre} no tenía objetivos`);            
        }
        else{
            proyecto.objetivos.forEach(async (objetivo)=>{
                console.log(`--Migrando el objetivo: ${objetivo.nombre}`);
                var nuevo={}
                
                for(var campo in objetivo){
                    if(campo!="id" && campo !="_id"){
                        nuevo[campo]=objetivo[campo];
                    }
                }
                
                nuevo.idProyectoParent=proyecto.id;            
                
                let nuevoObjetivo=new Objetivo(nuevo);
                try {
                    await nuevoObjetivo.save();
                } catch (error) {
                    console.log(`Error guardando el objetivo ${nuevoObjetivo.nombre} - ${nuevoObjetivo.id}.`);
                    console.log(`E: ${error}`);
                }
            })
        }
        
    })

    console.log(`FIN`);
}

migrar();