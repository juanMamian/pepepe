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
Object.defineProperty(exports, "__esModule", { value: true });
const multer = require("multer");
const upload = multer();
const router = require("express").Router();
const Usuario_1 = require("../model/Usuario");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const path = require("path");
const errorHandling_1 = require("../errorHandling");
var charProhibidosUsername = /[^a-zA-Z0-9_]/g;
var charProhibidosPassword = /[^a-zA-Z0-9*@_-]/g;
const minPassword = 6;
const minUsername = 4;
router.post("/registro", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("peticion de registro: " + JSON.stringify(req.body));
    if (!validarDatos(req.body.usuario)) {
        let respuesta = errorHandling_1.errorApi(null, "Bad request", "", "Datos de usuario no válidos");
        return res.status(400).send(respuesta);
    }
    try {
        var nuevoU = Object.assign({}, req.body.usuario);
    }
    catch (e) {
        console.log(`error creando el nuevo Usuario. E: ${e}`);
        return res.status(400).send();
    }
    try {
        if (yield Usuario_1.ModeloUsuario.findOne({ username: nuevoU.username }).exec()) {
            let respuesta = errorHandling_1.errorApi(null, "noerror", "", "El nombre de usuario ya estaba registrado");
            return res.status(400).send(respuesta);
        }
    }
    catch (error) {
        console.log("Error conectandose con la base de datos para verificar si ya existía el nombre de usuario. E: " + error);
        let respuesta = errorHandling_1.errorApi(null, "Error database", "", "Error conectando con la base de datos");
        return res.status(503).send(respuesta);
    }
    const salt = yield bcrypt.genSalt(10);
    const hashPassword = yield bcrypt.hash(nuevoU.password, salt);
    nuevoU.password = hashPassword;
    try {
        var nuevoUsuario = new Usuario_1.ModeloUsuario(Object.assign({}, nuevoU));
    }
    catch (error) {
        let respuesta = errorHandling_1.errorApi(error, "database", "Error creando el objeto mongoose antes de subirlo a la DB", null);
        return res.status(400).send(respuesta);
    }
    try {
        yield nuevoUsuario.save();
    }
    catch (error) {
        let respuesta = errorHandling_1.errorApi(error, "database", "Error guardando el objeto en mongoDB", null);
        return res.status(400).send(respuesta);
    }
    console.log(`Registro exitoso de ${nuevoUsuario.username} con id ${nuevoUsuario._id}`);
    return res.status(200).send({ registro: true, msjUsuario: "Registro exitoso" });
}));
router.post("/login", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(`LOGIN`);
    if (!usuarioPassLegales(req.body.username, req.body.password)) {
        let respuesta = errorHandling_1.errorApi("", "noerror", "Se introdujeron credenciales ilegales en un intento de login", "Datos inválidos");
        return res.status(400).send(respuesta);
    }
    const username = req.body.username;
    const pass = req.body.password;
    console.log("loging " + JSON.stringify(req.body));
    const usuario = yield Usuario_1.ModeloUsuario.findOne({ username }, "username password permisos");
    if (!usuario) {
        console.log("usuario no encontrado");
        let respuesta = errorHandling_1.errorApi("", "noerror", "", "El usuario no existe");
        return res.status(400).send(respuesta);
    }
    const correctLogin = yield bcrypt.compare(pass, usuario.password);
    if (correctLogin) {
        console.log(`login correcto de ${username}. Enviando JWT`);
        let datosToken = {
            id: usuario._id,
            permisos: usuario.permisos,
            username: usuario.username
        };
        let token = jwt.sign(datosToken, process.env.JWT_SECRET, { expiresIn: "2h" });
        let respuesta = {
            username: usuario.username,
            permisos: usuario.permisos,
            token
        };
        res.status(200).send(respuesta);
        return;
    }
    else {
        console.log(`Contraseña errada. Rechazando`);
        return res.status(400).send("badPass");
    }
}));
router.post("/updateFoto", upload.single("nuevaFoto"), function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log(`Recibida peticion de subir foto por el usuario ${req.user.username}`);
        if (!("user" in req)) {
            console.log(`No habia info del bearer`);
            return;
        }
        if (!("id" in req.user)) {
            console.log(`no había id del usuario`);
            return;
        }
        let idUsuario = req.user.id;
        try {
            var elUsuario = yield Usuario_1.ModeloUsuario.findById(idUsuario, "username fotografia");
        }
        catch (error) {
            console.log(`error buscando el usuario para cambio de fotografia. e: ` + error);
            return res.status(400).send('');
        }
        console.log(`updating fotografia del usuario ${elUsuario.nombre} con id ${idUsuario}`);
        // console.log(`info en la request: files: ${req.files}, otros: ${req.body}`);
        elUsuario.fotografia = req.file.buffer;
        try {
            yield elUsuario.save();
        }
        catch (error) {
            console.log(`error guardando el usuario después de subir imagen. e: ` + error);
            return res.status(400).send('');
        }
        console.log(`update terminado`);
        res.send({ resultado: "ok" });
    });
});
router.get("/fotografias/:id", function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const idUsuario = req.params.id;
        if (idUsuario == "null" || idUsuario == "undefined" || idUsuario == "-1" || !idUsuario) {
            return res.sendFile(path.join(__dirname, '../public/media/iconos/usuarioDefault.png'));
        }
        try {
            var elUsuario = yield Usuario_1.ModeloUsuario.findById(idUsuario, "fotografia");
        }
        catch (error) {
            console.log(`error buscando el usuario con fotografia. e: ` + error);
            return res.status(400).send('');
        }
        if (!elUsuario.fotografia) {
            res.sendFile(path.join(__dirname, '../public/media/iconos/usuarioDefault.png'));
        }
        else {
            res.set('Content-Type', 'image/png');
            res.send(elUsuario.fotografia);
        }
        return;
    });
});
module.exports = router;
const usuarioPassLegales = function (username, password) {
    console.log(`verificando ${username} - ${password}`);
    if (!username || !password)
        return false;
    if (charProhibidosUsername.test(username) || charProhibidosPassword.test(password) || password.length < minPassword || username.length < minUsername)
        return false;
    return true;
};
var charProhibidos = /[^ a-zA-ZÀ-ž0-9_():.,-]/g;
var charProhibidosNombre = /[^ a-zA-ZÀ-ž]/g;
var charProhibidosNumeroTel = /[^0-9+-]/g;
var emailChars = /\S+@\S+\.\S+/;
var dateChars = /[12][90][0-9][0-9]-[01][0-9]-[0-3][0-9]/;
function validarDatos(datos) {
    var errores = [];
    if (datos.nombres.length < 2) {
        errores.push("Tu nombre es muy corto");
    }
    if (charProhibidosNombre.test(datos.nombres)) {
        errores.push("Tu nombre contiene caracteres no permitidos");
    }
    if (datos.apellidos.length < 2) {
        errores.push("Tu apellido es muy corto");
    }
    if (charProhibidosNombre.test(datos.apellidos)) {
        errores.push("Tu apellido contiene caracteres no permitidos");
    }
    if (!dateChars.test(datos.fechaNacimiento)) {
        errores.push("Tu fecha de nacimiento es incorrecta");
    }
    if (datos.email.length > 0 && !emailChars.test(datos.email)) {
        errores.push("Tu e-mail no es válido");
    }
    if (charProhibidosNumeroTel.test(datos.numeroTel)) {
        errores.push("Tu número telefónico no es válido");
    }
    if (datos.lugarResidencia.length < 2) {
        errores.push("Tu lugar de residencia es muy corto");
    }
    if (charProhibidos.test(datos.lugarResidencia)) {
        errores.push("Tu lugar de residencia contiene caracteres no permitidos");
    }
    if (datos.username.length < 4) {
        errores.push("Tu nombre de usuario es muy corto");
    }
    if (charProhibidos.test(datos.username)) {
        errores.push("Tu nombre de usuario contiene caracteres no permitidos");
    }
    if (datos.password.length < 6 || datos.password.length > 32) {
        errores.push("Tu contraseña debe contener entre 6 y 32 caracteres");
    }
    if (errores.length > 0) {
        return false;
    }
    return true;
}
