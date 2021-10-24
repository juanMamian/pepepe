const mongoose = require("mongoose");
const Grupo = require("./comunaBuild/model/actividadesProfes/GrupoEstudiantil").ModeloGrupoEstudiantil;
const Actividad = require("./comunaBuild/model/actividadesProfes/GrupoEstudiantil").ModeloActividad;
const esquemaActividad = require("./comunaBuild/model/actividadesProfes/GrupoEstudiantil").esquemaActividad;
const Usuario = require("./comunaBuild/model/Usuario").ModeloUsuario;
const dotenv = require("dotenv");
const Proyecto=require("./comunaBuild/model/Proyecto").ModeloProyecto;
const Trabajo=require("./comunaBuild/model/Trabajo").ModeloTrabajo;
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
    db.db.collection("proyectos").rename("grupos");
});

 const exportar = async function () {
     await iniciarMongoose();
//     try {
        
//         var losProyectos = await Proyecto.find({}).exec();
//         console.log(`Los proyectos son: ${losProyectos.length}`);
//         await mongoose.connection.db.dropCollection("trabajos");
//     }
//     catch (error) {
//         console.log(`error . e: ` + error);
//     }
        
//     console.log(`FIN`);
 }

 exportar();
