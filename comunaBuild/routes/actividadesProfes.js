"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const multer = require("multer");
const upload = multer({ limits: { fileSize: 5000000 } });
const router = require("express").Router();
const Usuario_1 = require("../model/Usuario");
const GrupoEstudiantil_1 = require("../model/actividadesProfes/GrupoEstudiantil");
const path = require("path");
const fs = require("fs");
const util = require("util");
const mongoose_1 = __importDefault(require("mongoose"));
const mkdir = util.promisify(fs.mkdir);
const writeFile = util.promisify(fs.writeFile);
router.post("/publicarRespuesta", upload.single("archivoAdjunto"), function (err, req, res, next) {
    console.log(`Errores: <<${err.message}>>`);
    let mensaje = "Archivo no permitido";
    if (err.message == "File too large")
        mensaje = "Archivo demasiado grande";
    return res.status(400).send({ msjUsuario: mensaje });
}, function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
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
        var extensionDeArchivo = "";
        if ("file" in req) {
            console.log(`Participacion con archivo adjunto`);
            console.log(`El archivo uploaded pesaba ${req.file.size} de tipo ${req.file.mimetype}`);
            let tiposDeArchivoPermitidos = ["application/pdf", "image/png", "image/jpg"];
            if (!tiposDeArchivoPermitidos.includes(req.file.mimetype)) {
                console.log(`Se intentó subir un archivo que no estaba permitido. era ${req.file.mimetype}`);
                return res.status(400).send({ msjUsuario: "Este tipo de archivos no está soportado" });
            }
            if (req.file.mimetype == "application/pdf") {
                extensionDeArchivo = "pdf";
            }
            else if (req.file.mimetype == "image/png") {
                extensionDeArchivo = "png";
            }
            else if (req.file.mimetype == "image/jpg") {
                extensionDeArchivo = "jpg";
            }
            else {
                console.log(`No habia extensión para el tipo de archivo ${req.file.mimetype}`);
                return res.status(400).send({ msjUsuario: "Este tipo de archivos no está soportado" });
            }
        }
        else {
            console.log(`Participacion sin archivo adjunto`);
        }
        try {
            var elUsuario = yield Usuario_1.ModeloUsuario.findById(idUsuario, "username nombres apellidos id");
        }
        catch (error) {
            console.log(`error buscando el usuario para publicar respuesta. e: ` + error);
            return res.status(400).send('');
        }
        //Creando la nueva participacion
        var comentario = req.body.comentario;
        let nuevaParticipacion = {
            fechaUpload: Date.now(),
            archivo: {
                extension: extensionDeArchivo
            },
            comentario,
            idAutor: idUsuario
        };
        let idActividad = req.body.idActividad;
        //Introducir la informacion en la base de datos.
        try {
            var elGrupo = yield GrupoEstudiantil_1.ModeloGrupoEstudiantil.findOne({ "actividades._id": mongoose_1.default.Types.ObjectId(idActividad) }).exec();
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
            elDesarrollo.participaciones.push(laParticipacion);
        }
        catch (error) {
            console.log(`Error leyendo nombre de grupo y actividad en la base de dato. E: ${error}`);
            return res.status(500).send("Error conectando con la base de datos");
        }
        //Guardando el archivo
        if ("file" in req) {
            console.log(`Verificando la existencia de la carpeta de esta actividad: ${idActividad}`);
            let carpetaEvidencias = "../archivosDeUsuario/actividadesProfes/evidencias";
            console.log(`guardando el archivo con nombre idParticipacion`);
            let archivo = path.join(__dirname, carpetaEvidencias) + "/" + idParticipacion + "." + laParticipacion.archivo.extension;
            console.log(`el archivo quedará: ${archivo}`);
            try {
                yield writeFile(archivo, req.file.buffer);
            }
            catch (error) {
                console.log(`error escribiendo el archivo. E: ${error}`);
                return res.status(500).send("Error guardando archivo");
            }
        }
        //Guardando elGrupo
        try {
            yield elGrupo.save();
        }
        catch (error) {
            console.log(`Error guardando el grupo: E: ${error}`);
            return res.status(500).send("Error guardando la respuesta");
        }
        console.log(`Respuesta publicada`);
        res.send({ resultado: "ok" });
    });
});
router.post("/updateGuia", upload.single("nuevaGuia"), function (err, req, res, next) {
    console.log(`Errores: <<${err.message}>>`);
    let mensaje = "Archivo no permitido";
    if (err.message == "File too large")
        mensaje = "Archivo demasiado grande";
    return res.status(400).send({ msjUsuario: mensaje });
}, function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
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
            var elUsuario = yield Usuario_1.ModeloUsuario.findById(idUsuario, "username nombres apellidos id");
        }
        catch (error) {
            console.log(`error buscando el usuario para cambio de guia. e: ` + error);
            return res.status(400).send('');
        }
        let idGrupo = req.body.idGrupo;
        let idActividad = req.body.idActividad;
        try {
            var elGrupo = yield GrupoEstudiantil_1.ModeloGrupoEstudiantil.findById(idGrupo);
            var nombreGrupo = elGrupo.nombre;
            var nombreActividad = elGrupo.actividades.id(idActividad).nombre;
        }
        catch (error) {
            console.log(`Error leyendo nombre de grupo y actividad en la base de dato. E: ${error}`);
            return res.status(500).send("Error conectando con la base de datos");
        }
        console.log(`Verificando la existencia de las carpetas ${idGrupo}, actividades y ${idUsuario}`);
        let carpetaActividades = "../archivosDeUsuario/actividadesProfes/actividades";
        try {
            yield mkdir(path.join(__dirname, carpetaActividades, idActividad));
        }
        catch (error) {
            if (error.message.substr(0, 6) != "EEXIST") {
                console.log(`Error creando la carpeta de la actividad. E: ${error.message.substr(0, 6)}`);
                return res.status(500).send("Error accediendo al servidor");
            }
        }
        console.log(`El archivo uploaded pesaba ${req.file.size} de tipo ${req.file.mimetype}`);
        let archivo = path.join(__dirname, carpetaActividades, idActividad, "guia.pdf");
        try {
            yield writeFile(archivo, req.file.buffer);
        }
        catch (error) {
            console.log(`error escribiendo el archivo. E: ${error}`);
            return res.status(500).send("Error guardando archivo");
        }
        console.log(`update terminado`);
        res.send({ resultado: "ok" });
    });
});
router.get("/guia/:idGrupo/:idProfe/:idActividad", function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
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
});
router.get("/evidencia/:nombreArchivo", function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
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
});
module.exports = router;