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

const exportar = async function () {
    await iniciarMongoose();


    try {
        var losForos = await Foro.find({}).exec();
        //console.log(`Los foros son: ${losForos.length}`);
    }
    catch (error) {
        console.log(`error . e: ` + error);
    }

    var todasIdsConversaciones = [];

    for (var u = 0; u < losForos.length; u++) {
        let esteForo = losForos[u];
        //console.log(`+${esteForo.conversaciones.length}`);
        todasIdsConversaciones = todasIdsConversaciones.concat(esteForo.conversaciones.map(c => c._id));
    }
    console.log(`Hay ${todasIdsConversaciones.length} conversaciones`);
    //console.log(`Ids: ${todasIdsConversaciones}`);

    for (var i = 0; i < todasIdsConversaciones.length; i++) {
        let idEstaConversacion = todasIdsConversaciones[i];
        let RespuestasEstaConversacion = mongoose.model("respuestasDeConversacion" + idEstaConversacion, esquemaRespuestaConversacion, "respuestasDeConversacion" + idEstaConversacion);

        let cantRespuestas = await RespuestasEstaConversacion.countDocuments().exec();
        console.log(`Hay ${cantRespuestas} respuestas`);

        let todasRespuestas = await RespuestasEstaConversacion.find({}).exec();

        for (var j = 0; j < todasRespuestas.length; j++) {
            let estaRespuesta = todasRespuestas[j];
            if (!estaRespuesta.infoAutor || !estaRespuesta.infoAutor.id) {
                console.log(`   Introduciendo info de Autor: ${estaRespuesta.idAutor}`);
                try {
                    let elAutor = await Usuario.findById(estaRespuesta.idAutor).exec();
                    let nuevoInfoAutor = {
                        id: elAutor._id,
                        nombres: elAutor.nombres,
                        apellidos: elAutor.apellidos,
                        username: elAutor.username
                    }

                    estaRespuesta.infoAutor = nuevoInfoAutor
                    await estaRespuesta.save();
                }
                catch (error) {
                    console.log(`error . e: ` + error);

                }
            }
        }
    }


    console.log(`FINa`);
}

exportar();
