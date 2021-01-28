const multer = require("multer");
const upload = multer({ limits: { fileSize: 7000000 } });
const router = require("express").Router();
import { ModeloNotificacion, ModeloUsuario as Usuario } from "../model/Usuario";
import { ModeloGrupoEstudiantil as GrupoEstudiantil } from "../model/actividadesProfes/GrupoEstudiantil"
const path = require("path");
const fs = require("fs");
const util = require("util");
import mongoose from "mongoose"
const mkdir = util.promisify(fs.mkdir);
const writeFile = util.promisify(fs.writeFile);
import { drive, jwToken } from "./utilidades"
import { errorApi } from "../errorHandling"
import { Request, Response } from "express";
import streamifier from "streamifier";
import sharp from "sharp";
import { pubsub } from "../gql/Schema";
import { NUEVA_PARTICIPACION_ESTUDIANTIL } from "../gql/GruposEstudiantiles"
import { NUEVA_NOTIFICACION_PERSONAL } from "../gql/Usuarios";
//Google Drive


interface UsuarioInterface {
    username: string,
    password: string
}


router.post("/publicarRespuesta", upload.single("archivoAdjunto"), function (err, req, res, next) {
    console.log(`Errores: <<${err.message}>>`)
    let mensaje = "Archivo no permitido";
    if (err.message == "File too large") mensaje = "Archivo demasiado grande"
    return res.status(400).send({ msjUsuario: mensaje });
}, async function (req, res) {

    if (!("user" in req)) {
        console.log(`No habia info del bearer`);
        return;
    }
    if (!("id" in req.user)) {
        console.log(`no había id del usuario`);
        return;
    }
    let idUsuario = req.user.id;
    console.log(`Recibida peticion de subir respuesta por el usuario ${req.user.username}`);

    var charProhibidosComentario = /[^\n a-zA-ZÀ-ž0-9_():;.,+¡!¿?@=-]/;
    var comentario = req.body.comentario;
    if (charProhibidosComentario.test(comentario)) {
        return res.status(400).send({ msjUsuario: "El comentario contenía caracteres no válidos" });
    }

    var extensionDeArchivo = "";
    if ("file" in req) {
        console.log(`Participacion con archivo adjunto`);
        console.log(`El archivo uploaded pesaba ${req.file.size} de tipo ${req.file.mimetype}`);

        if (req.file.mimetype == "application/pdf") {
            extensionDeArchivo = "pdf"
        }
        else if (req.file.mimetype == "image/png") {
            extensionDeArchivo = "png"
        }
        else if (req.file.mimetype == "image/jpg") {
            extensionDeArchivo = "jpg"
        }
        else if (req.file.mimetype == "image/jpeg") {
            extensionDeArchivo = "jpg"
        }
        else if (req.file.mimetype == "audio/aac") {
            extensionDeArchivo = "aac"
        }
        else if (req.file.mimetype == "audio/x-wav") {
            extensionDeArchivo = "wav"
        }
        else if (req.file.mimetype == "audio/webm") {
            extensionDeArchivo = "weba"
        }
        else if (req.file.mimetype == "audio/mpeg") {
            extensionDeArchivo = "mpga"
        }
        else if (req.file.mimetype == "audio/mp4") {
            extensionDeArchivo = "mp4a"
        }
        else if (req.file.mimetype == "audio/ogg") {
            extensionDeArchivo = "oga"
        }
        else if (req.file.mimetype == "video/ogg") {
            extensionDeArchivo = "ogg"
        }
        else {
            console.log(`No habia extensión para el tipo de archivo ${req.file.mimetype}`);
            return res.status(400).send({ msjUsuario: "El mimetype " + req.file.mimetype + " no está soportado" });
        }


    }

    try {
        var elUsuario: any = await Usuario.findById(idUsuario, "username nombres apellidos id").exec();
        var nombreApellidoUsuario = elUsuario.nombres + " " + elUsuario.apellidos;
    }
    catch (error) {
        console.log(`error buscando el usuario para publicar respuesta. e: ` + error);
        return res.status(400).send('');
    }


    //Creando la nueva participacion

    let nuevaParticipacion = {
        fechaUpload: Date.now(),
        archivo: {
            extension: extensionDeArchivo
        },
        comentario,
        idAutor: idUsuario
    }

    let idActividad = req.body.idActividad;

    //Introducir la informacion en la base de datos.

    try {
        var elGrupo: any = await GrupoEstudiantil.findOne({ "actividades._id": mongoose.Types.ObjectId(idActividad) }).exec();
        var laActividad = elGrupo.actividades.id(idActividad);

        if (req.body.idDesarrollo == 0) {
            console.log(`Desarrollo 0. Era para el desarrollo del autor de la respuesta`);
            var elDesarrollo = laActividad.desarrollos.find(d => d.idEstudiante == idUsuario);
            if (!elDesarrollo) {
                console.log(`Este usuario no había iniciado un desarrollo. Creando un nuevo desarrollo`);
                var nuevoDesarrollo = laActividad.desarrollos.create({ idEstudiante: idUsuario, participaciones: [] });
                laActividad.desarrollos.push(nuevoDesarrollo);
                elDesarrollo = laActividad.desarrollos.id(nuevoDesarrollo.id);
            }
        }
        else {
            elDesarrollo = laActividad.desarrollos.id(req.body.idDesarrollo);
            if (!elDesarrollo) {
                console.log(`No se encontro el desarrollo ${req.body.idDesarrollo}`);
                throw new Error("Error localizando el desarrollo");
            }
        }

        if (elDesarrollo.estado == "completado") {
            console.log(`Este desarrollo estaba marcado como completado.`);
            throw new Error("El desarrollo ya esta completado");
        }

        var laParticipacion = elDesarrollo.participaciones.create(nuevaParticipacion);
        var idParticipacion = laParticipacion._id;
        laParticipacion.archivo.nombre = idParticipacion;

        if (elDesarrollo.idEstudiante == laParticipacion.idAutor) {
            console.log(`Modificado por el propio estudiante`);
            elDesarrollo.leidoPorProfe = false;
        }


    } catch (error) {
        console.log(`Error leyendo nombre de grupo y actividad en la base de dato. E: ${error}`);
        return res.status(500).send("Error conectando con la base de datos");
    }

    //Guardando el archivo
    if ("file" in req) {

        //resize
        let archivoFinal = req.file.buffer;
        if ((req.file.mimetype == "image/png" || req.file.mimetype == "image/jpg" || req.file.mimetype == "image/jpeg") && req.file.size > 2000000) {
            try {
                let imgPeque = await sharp(req.file.buffer).resize({ width: 800 }).toBuffer();
                archivoFinal = imgPeque;
            } catch (error) {
                console.log(`Error resizing image. E: ${error}`);
                return res.status(500).send("Error guardando el archivo");
            }
        }

        let idCarpetaEvidencias = "1DJR9u-rv7_jQweBMUesurZpmIPT-8MpO";
        try {
            await jwToken.authorize();
        }
        catch (error) {
            console.log(`Error autorizando token. E: ${error}`);
            return res.status(500).send("Error conectando con el servidor de google drive");
        }

        var fileMetadata = {
            'name': laActividad.nombre + '-' + nombreApellidoUsuario + '.' + laParticipacion.archivo.extension,
            parents: [idCarpetaEvidencias],
        };
        var media = {
            mimeType: req.file.mimetype,
            body: streamifier.createReadStream(archivoFinal)
        };

        try {
            let respuesta = await drive.files.create({
                auth: jwToken,
                resource: fileMetadata,
                media: media,
                fields: 'id, webContentLink'
            });
            console.log(`Creado archivo ${JSON.stringify(respuesta.data)}`);
            laParticipacion.archivo.idGoogleDrive = respuesta.data.id;
            laParticipacion.archivo.googleDriveDirectLink = respuesta.data.webContentLink;
        }
        catch (error) {
            console.log(`Error creando archivo: E: ${error}`);
            return res.status(500).send("Error conectando con el servidor de google drive");
        }

    }

    elDesarrollo.participaciones.push(laParticipacion)



    try {
        await elGrupo.save();
    } catch (error) {
        console.log(`Error guardando el grupo: E: ${error}`);
        return res.status(500).send("Error guardando la respuesta");
    }
    console.log(`publicando con idDesarrollo: ${elDesarrollo._id}`);

    //creando una notificacion en la base de datos
    var notificacion= new ModeloNotificacion({
        texto: "Nueva respuesta",
        elementoTarget: {
            tipo: "actividadEstudiantil",
            id: laActividad._id
        },
        causante: {
            tipo: "persona",
            id: elUsuario._id
        }

    });
    
    //Pregunta si notificar al estudiante del desarrollo de la actividad.
    if (laParticipacion.idAutor != elDesarrollo.idEstudiante) {
        try {
            await Usuario.findByIdAndUpdate(elDesarrollo.idEstudiante, { $push: { notificaciones: notificacion } }).exec();
            pubsub.publish(NUEVA_NOTIFICACION_PERSONAL, { idNotificado: elDesarrollo.idEstudiante, nuevaNotificacion: notificacion });
            console.log(`Crendo notificacion personal para ${elDesarrollo.idEstudiante}`);
        } catch (error) {
            console.log(`Error creando una notificacion con para ${elDesarrollo.idEstudiante}`);
        }
    }

    //Pregunta si notificar al autor de la actividad
    if (laParticipacion.idAutor != laActividad.idCreador) {
        try {
            await Usuario.findByIdAndUpdate(laActividad.idCreador, { $push: { notificaciones: notificacion } }).exec();
            pubsub.publish(NUEVA_NOTIFICACION_PERSONAL, { idNotificado: laActividad.idCreador, nuevaNotificacion: notificacion });
            console.log(`Crendo notificacion personal para ${laActividad.idCreador}`);
        } catch (error) {
            console.log(`Error creando una notificacion para ${laActividad.idCreador}`);
        }
    }


    try {
        //El estudiante de este desarrollo es notificado


        pubsub.publish(NUEVA_PARTICIPACION_ESTUDIANTIL, {
            nuevaRespuestaDesarrolloEstudiantil: {
                participacion: laParticipacion,
                idDesarrollo: elDesarrollo.id
            },
            idEstudianteDesarrollo: elDesarrollo.idEstudiante,
            idDesarrollo: elDesarrollo._id,
            idCreadorActividad: laActividad.idCreador,
            idGrupo: elGrupo._id,
            idActividad: laActividad._id
        });
    } catch (error) {
        console.log(`Error publicando en pubsub. E: ${error}`);
    }


    console.log(`Respuesta publicada`);

    res.send({ resultado: "ok" });
});


router.post("/updateGuia", upload.single("nuevaGuia"), function (err, req, res, next) {
    console.log(`Errores: <<${err.message}>>`)
    let mensaje = "Archivo no permitido";
    if (err.message == "File too large") mensaje = "Archivo demasiado grande"
    return res.status(400).send({ msjUsuario: mensaje });
}, async function (req, res) {


    if (!("user" in req)) {
        console.log(`No habia info del bearer`);
        return res.status(400).send();
    }
    if (!("id" in req.user)) {
        console.log(`no había id del usuario`);
        return res.status(400).send();
    }
    if (!("file" in req)) {
        console.log(`no había file en la request`);
        return res.status(400).send();
    }

    let idUsuario = req.user.id;
    console.log(`Recibida peticion de subir guia por el usuario ${req.user.username}`);

    if (req.file.mimetype != "application/pdf") {
        console.log(`Se intentó subir un archivo que no era PDF. era ${req.file.mimetype}`);
        return res.status(400).send({ msjUsuario: "Tu archivo debe ser PDF" });
    }

    try {
        var elUsuario: any = await Usuario.findById(idUsuario, "username nombres apellidos id").exec();
    }
    catch (error) {
        console.log(`error buscando el usuario para cambio de guia. e: ` + error);
        return res.status(400).send('');
    }

    let idGrupo = req.body.idGrupo;
    let idActividad = req.body.idActividad;

    try {
        var elGrupo: any = await GrupoEstudiantil.findById(idGrupo);
        var nombreGrupo = elGrupo.nombre;
        var nombreActividad = elGrupo.actividades.id(idActividad).nombre;
    } catch (error) {
        console.log(`Error leyendo nombre de grupo y actividad en la base de dato. E: ${error}`);
        return res.status(500).send("Error conectando con la base de datos");
    }

    let idCarpetaGuias = "1GCsyYWtEbv3zElcUXj7YWGXOoHUzNyfQ";
    try {
        await jwToken.authorize();
    }
    catch (error) {
        console.log(`Error autorizando token. E: ${error}`);
        return res.status(500).send("Error conectando con el servidor de google drive");
    }

    var fileMetadata = {
        name: nombreActividad + '-Guia.pdf',
        parents: [idCarpetaGuias],
    };
    var media = {
        mimeType: req.file.mimetype,
        body: streamifier.createReadStream(req.file.buffer)
    };

    try {
        let respuesta = await drive.files.create({
            auth: jwToken,
            resource: fileMetadata,
            media: media,
            fields: 'id, webContentLink'
        });
        console.log(`Creado archivo ${JSON.stringify(respuesta.data)}`);
        elGrupo.actividades.id(idActividad).guiaGoogleDrive.idArchivo = respuesta.data.id;
        elGrupo.actividades.id(idActividad).guiaGoogleDrive.enlace = respuesta.data.webContentLink;
    }
    catch (error) {
        console.log(`Error creando archivo: E: ${error}`);
        return res.status(500).send("Error conectando con el servidor de google drive");
    }


    try {
        await elGrupo.save();
    } catch (error) {
        console.log(`Error guardando el grupo: E: ${error}`);
        return res.status(500).send("Error guardando la guia");
    }


    console.log(`update terminado`);
    res.send({ resultado: "ok" });
});

router.get("/guia/:idGrupo/:idProfe/:idActividad", async function (req, res) {

    console.log(`Descargando guia del grupo con id ${req.params.idGrupo} del profe con id ${req.params.idProfe} de la actividad con id ${req.params.idActividad}`);
    res.sendFile(path.join(__dirname, '../archivosDeUsuario/actividadesProfes/actividades', req.params.idActividad, '/guia.pdf'), {}, (error) => {
        if (error) {
            console.log(`Error enviando archivo: ${error}`);
            return res.status(400).send({ msjUsuario: "Archivo no encontrado" });
        }
        else {
            console.log(`Archivo enviado`);
        }

    });


});
router.get("/evidencia/:nombreArchivo", async function (req, res) {

    console.log(`Descargando archivo de participacion  ${req.params.nombreArchivo}`);

    res.sendFile(path.join(__dirname, '../archivosDeUsuario/actividadesProfes/evidencias', req.params.nombreArchivo), {}, (error) => {
        if (error) {
            console.log(`Error enviando archivo: ${error}`);
            return res.status(400).send({ msjUsuario: "Archivo no encontrado" });
        }
        else {
            console.log(`Archivo enviado`);
        }

    });


});
module.exports = router;
