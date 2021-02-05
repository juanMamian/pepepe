const mongoose = require("mongoose");
const Foro = require("./comunaBuild/model/Foros/Foro").ModeloForo;
const Conversacion=require("./comunaBuild/model/Foros/Conversacion").ModeloConversacion;
const esquemaRespuestaConversacion=require("./comunaBuild/model/Foros/Conversacion").esquemaConversacion;
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
});

const exportar = async function () {
    await iniciarMongoose();


    try {        
        var losForos = await Foro.find({}).exec();
        console.log(`Los foros son: ${losForos.length}`);
    }
    catch (error) {
        console.log(`error . e: ` + error);
    }

    var todasIdsConversaciones=[];

    for (var u=0;u<losForos.length;u++){
        let esteForo=losForos[u];
        console.log(`+${esteForo.conversaciones.length}`);
        todasIdsConversaciones=todasIdsConversaciones.concat(esteForo.conversaciones.map(c=>c._id));
    }

    console.log(`Hay ${todasIdsConversaciones.length} conversaciones`);
    
    for(var i=0;i < todasIdsConversaciones.length;i++){   
        
        let idConversacion=todasIdsConversaciones[i];
        console.log(`Conversacion ${i} - ${idConversacion}:`);     
        

        try{
            let RespuestasConversacion = mongoose.model("respuestasDeConversacion" + idConversacion, esquemaRespuestaConversacion, "respuestasDeConversacion" + idConversacion);
            let respuestasEstaConversacion=await RespuestasConversacion.find({});

            for(var j=0;j<respuestasEstaConversacion.length;j++){
                
                let estaRespuesta=respuestasEstaConversacion[j];
                
                if(!estaRespuesta.infoAutor || !estaRespuesta.infoAutor.id){
                    let autorEstaRespuesta=await Usuario.findById(respuestasEstaConversacion[j].toObject().idAutor).exec();
                    console.log(`   idAutor: ${autorEstaRespuesta._id}`);
                    estaRespuesta.infoAutor={
                        id: autorEstaRespuesta._id,
                        nombres: autorEstaRespuesta.nombres,
                        apellidos: autorEstaRespuesta.apellidos,
                        username:autorEstaRespuesta.username,
                    }
                    console.log(`Insertando info autor`);
                    await estaRespuesta.save();
                }
                else{
                    console.log(`Tenía infoAutor: ${JSON.stringify(estaRespuesta.infoAutor)}`);
                }
            }

        }
        catch(error){
            console.log(`error migrando respuestas. e: `+error);            
        }
    }
    console.log(`FINa`);
}

exportar();
