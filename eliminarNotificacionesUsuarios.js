const mongoose = require("mongoose");
const Foro = require("./comunaBuild/model/Foros/Foro").ModeloForo;
const Conversacion = require("./comunaBuild/model/Foros/Conversacion").ModeloConversacion;
const esquemaRespuestaConversacion = require("./comunaBuild/model/Foros/Conversacion").esquemaRespuestaConversacion;
const Usuario = require("./comunaBuild/model/Usuario").ModeloUsuario;
const dotenv = require("dotenv");
const Proyecto = require("./comunaBuild/model/Proyecto").ModeloProyecto;
const Trabajo = require("./comunaBuild/model/Trabajo").ModeloTrabajo;
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

const depurar = async function () {
    await iniciarMongoose();


    try {
        var losUsuarios = await Usuario.find({}).exec();
        //console.log(`Los foros son: ${losForos.length}`);
    }
    catch (error) {
        console.log(`error . e: ` + error);
    }

    losUsuarios.forEach(async (usuario)=>{
        try{
            usuario.notificaciones=[];
            usuario.notificacionesActividadForos=[];
            usuario.notificacionesAtlasSolidaridad=[];
            await usuario.save();
        }
        catch(error){
            console.log(`error guardando usuario sin notificaciones. e: `+error);
            return res.status(400).send('');
        }
    })

    console.log(`FIN`);
}

depurar();
