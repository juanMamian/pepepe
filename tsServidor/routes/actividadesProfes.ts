const multer = require("multer");
const upload = multer({ limits: { fileSize: 5000000 } });
const router = require("express").Router();
const Usuario = require("../model/Usuario").Usuario;
const GrupoEstudiantil = require("../model/actividadesProfes/GrupoEstudiantil").modeloGrupoEstudiantil;
const path = require("path");
const fs = require("fs");
const util = require("util");

const mkdir = util.promisify(fs.mkdir);
const writeFile = util.promisify(fs.writeFile);

import { errorApi } from "../errorHandling"
import { Request, Response } from "express";


interface UsuarioInterface {
    username: string,
    password: string
}


router.post("/updateGuia", upload.single("nuevaGuia"), function (err, req, res, next) {
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
    console.log(`Recibida peticion de subir guia por el usuario ${req.user.username}`);

    if (req.file.mimetype != "application/pdf") {
        console.log(`Se intentó subir un archivo que no era PDF. era ${req.file.mimetype}`);
        return res.status(400).send({ msjUsuario: "Tu archivo debe ser PDF" });
    }

    try {
        var elUsuario = await Usuario.findById(idUsuario, "username nombres apellidos id");
    }
    catch (error) {
        console.log(`error buscando el usuario para cambio de guia. e: ` + error);
        return res.status(400).send('');
    }

    let idGrupo = req.body.idGrupo;
    let idActividad = req.body.idActividad;

    try {
        var elGrupo = await GrupoEstudiantil.findById(idGrupo);
        var nombreGrupo = elGrupo.nombre;
        var nombreActividad = elGrupo.actividades.id(idActividad).nombre;
    } catch (error) {
        console.log(`Error leyendo nombre de grupo y actividad en la base de dato. E: ${error}`);
        return res.status(500).send("Error conectando con la base de datos");
    }

    console.log(`Verificando la existencia de las carpetas ${idGrupo}, actividades y ${idUsuario}`);

    let carpetaActividades = "../public/actividadesProfes/actividades";


    try {
        await mkdir(path.join(__dirname, carpetaActividades, idActividad));
    } catch (error) {
        if (error.message.substr(0, 6) != "EEXIST") {
            console.log(`Error creando la carpeta de la actividad. E: ${error.message.substr(0, 6)}`);
            return res.status(500).send("Error accediendo al servidor");
        }
    }

    console.log(`El archivo uploaded pesaba ${req.file.size} de tipo ${req.file.mimetype}`);

    let archivo = path.join(__dirname, carpetaActividades, idActividad, "guia.pdf");
    try {
        await writeFile(archivo, req.file.buffer);
    } catch (error) {
        console.log(`error escribiendo el archivo. E: ${error}`);
        return res.status(500).send("Error guardando archivo");
    }

    console.log(`update terminado`);
    res.send({ resultado: "ok" });
});

router.get("/guia/:idGrupo/:idProfe/:idActividad", async function (req, res) {

    console.log(`Descargando guia del grupo con id ${req.params.idGrupo} del profe con id ${req.params.idProfe} de la actividad con id ${req.params.idActividad}`);
    res.sendFile(path.join(__dirname, '../public/actividadesProfes/actividades', req.params.idActividad, '/guia.pdf'), {}, (error) => {
        if(error){
            console.log(`Error enviando archivo: ${error}`);
            return res.status(400).send({ msjUsuario: "Archivo no encontrado" });
        }
        else{
            console.log(`Archivo enviado`);
        }

    });
    

});
module.exports = router;
