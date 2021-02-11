const multer = require("multer");
const upload = multer({ limits: { fileSize: 7000000 } });
const router = require("express").Router();
import { ModeloGrupoEstudiantil as GrupoEstudiantil, esquemaActividad } from "../model/actividadesProfes/GrupoEstudiantil"
import {ModeloUsuario as Usuario} from "../model/Usuario";
const path = require("path");
import { drive, jwToken } from "./utilidades"
import streamifier from "streamifier";
import sharp from "sharp";
//Google Drive
import mongoose from "mongoose";

interface UsuarioInterface {
    username: string,
    password: string
}


router.post("/adjuntarArchivoParaRespuestaActividadEstudiantil", upload.single("archivoAdjunto"), function (err, req, res, next) {
    console.log(`Errores: <<${err.message}>>`)
    let mensaje = "Archivo no permitido";
    if (err.message == "File too large") mensaje = "Archivo demasiado grande"
    return res.status(400).send({ msjUsuario: mensaje });
}, async function (req, res) {

    if (!("user" in req)) {
        console.log(`No habia info del bearer`);
        return res.status(401).send('');
    }
    if (!("id" in req.user)) {
        console.log(`no había id del usuario`);
        return res.status(401).send('');
    }
    let idUsuario = req.user.id;
    console.log(`Recibida peticion de subir archivo por el usuario ${req.user.username}`);

    try {
        var elUsuario:any=await Usuario.findById(idUsuario).exec();
        if(!elUsuario)throw "Usuario no encontrado";
        var nombreApellido=elUsuario.nombres+" "+elUsuario.apellidos;
    } catch (error) {
        console.log('Error buscando el usuario . E: '+error);
        return res.status(400).send("Error identificando usuario");
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
        else if (req.file.mimetype == "audio/amr") {
            extensionDeArchivo = "amr"
        }
        else if (req.file.mimetype == "video/3gpp") {
            extensionDeArchivo = "3gpp"
        }
        else if (req.file.mimetype == "video/x-m4a") {
            extensionDeArchivo = "m4a"
        }
        else if (req.file.mimetype == "audio/x-m4a") {
            extensionDeArchivo = "m4a"
        }
        else {
            console.log(`No habia extensión para el tipo de archivo ${req.file.mimetype}`);
            return res.status(400).send({ msjUsuario: "El mimetype " + req.file.mimetype + " no está soportado" });
        }
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
            'name': 'respuesta de '+nombreApellido+'.' + extensionDeArchivo,
            parents: [idCarpetaEvidencias],
        };
        var media = {
            mimeType: req.file.mimetype,
            body: streamifier.createReadStream(archivoFinal)
        };

        var infoArchivo:any={};

        try {
            let respuesta = await drive.files.create({
                auth: jwToken,
                resource: fileMetadata,
                media: media,
                fields: 'id, webContentLink'
            });
            console.log(`Creado archivo ${JSON.stringify(respuesta.data)}`);
            infoArchivo.idGoogleDrive = respuesta.data.id;
            infoArchivo.googleDriveDirectLink = respuesta.data.webContentLink;
            infoArchivo.nombre=fileMetadata.name;
            infoArchivo.extension=extensionDeArchivo;

        }
        catch (error) {
            console.log(`Error creando archivo: E: ${error}`);
            return res.status(500).send("Error conectando con el servidor de google drive");
        }

    }
    else{
        res.status(400).send("No se adjuntó archivo");
    }
    
    console.log(`Archivo subido`);
    res.send({infoArchivo});
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
        var ColeccionActividadesEsteGrupo = mongoose.model("actividadesGrupo" + idGrupo, esquemaActividad, "actividadesGrupo" + idGrupo);
        var laActividad:any=await ColeccionActividadesEsteGrupo.findById(idActividad).exec();
        var nombreActividad = laActividad.nombre;
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
        laActividad.guiaGoogleDrive.idArchivo = respuesta.data.id;
        laActividad.guiaGoogleDrive.enlace = respuesta.data.webContentLink;
    }
    catch (error) {
        console.log(`Error creando archivo: E: ${error}`);
        return res.status(500).send("Error conectando con el servidor de google drive");
    }


    try {
        await laActividad.save();
    } catch (error) {
        console.log(`Error guardando la actividad: E: ${error}`);
        return res.status(500).send("Error guardando la guia");
    }


    console.log(`update terminado`);
    res.send({ resultado: "ok", enlace: laActividad.guiaGoogleDrive.enlace });
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
