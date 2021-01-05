import { Model } from "mongoose";

const router = require("express").Router();
const Usuario = require("../model/Usuario");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

import { errorApi } from "../errorHandling"
import { Request, Response } from "express";

var charProhibidosUsername = /[^a-zA-Z0-9_]/g;
var charProhibidosPassword = /[^a-zA-Z0-9*@_-]/g;

const minPassword = 6;
const minUsername = 4;

interface UsuarioInterface {
    username: string,
    password: string
}

router.post("/registro", async (req: Request, res: Response) => {
    console.log("peticion de registro: " + JSON.stringify(req.body));


    try {
        var nuevoU: UsuarioInterface = Object.assign({}, req.body.usuario);
    }
    catch (e) {
        console.log(`error creando el nuevo Usuario. E: ${e}`);
        return res.status(400).send();
    }
    if (!usuarioPassLegales(nuevoU.username, nuevoU.password)) {
        console.log(`Nombre de usuario o password ilegales`);
        return res.status(400).send();
    }

    if (await Usuario.findOne({ username: nuevoU.username }).exec()) {
        let respuesta = errorApi(null, "noerror", "", "El nombre de usuario ya estaba registrado");
        return res.status(400).send(respuesta);
    }

    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(nuevoU.password, salt);

    nuevoU.password = hashPassword;

    try {
        var nuevoUsuario = new Usuario({ ...nuevoU });
    }
    catch (error) {
        let respuesta = errorApi(error, "database", "Error creando el objeto mongoose antes de subirlo a la DB", null);
        return res.status(400).send(respuesta);
    }

    try {
        await nuevoUsuario.save();
    } catch (error) {
        let respuesta = errorApi(error, "database", "Error guardando el objeto en mongoDB", null);
        return res.status(400).send(respuesta);
    }
    console.log(`Registro exitoso de ${nuevoUsuario.username} con id ${nuevoUsuario._id}`);
    return res.status(200).send({ msjUsuario: "Registro exitoso" });
});

router.post("/login", async (req: Request, res: Response) => {
    console.log(`LOGIN`);
    if (!usuarioPassLegales(req.body.username, req.body.password)) {
        let respuesta = errorApi("", "noerror", "Se introdujeron credenciales ilegales en un intento de login", "Datos inválidos");
        return res.status(400).send(respuesta);
    }

    const username = req.body.username;
    const pass = req.body.password;
    console.log("loging " + JSON.stringify(req.body));
    const usuario = await Usuario.findOne({ username }, "username password permisos");
    if (!usuario) {
        console.log("usuario no encontrado");
        let respuesta = errorApi("", "noerror", "", "El usuario no existe");
        return res.status(400).send(respuesta);
    }
    const correctLogin = await bcrypt.compare(pass, usuario.password);
    if (correctLogin) {
        console.log(`login correcto de ${username}. Enviando JWT`);
        let datosToken={
            id: usuario._id,
            permisos:usuario.permisos,
            username:usuario.username
        }
        let token=jwt.sign(datosToken, process.env.JWT_SECRET, {expiresIn: "2h"});
        let respuesta={
            username:usuario.username,
            permisos: usuario.permisos,
            token
        }
        res.status(200).send(respuesta);
        return;
    }
    else {
        console.log(`Contraseña errada. Rechazando`);
        return res.status(400).send("badPass");
    }
});

module.exports = router;

const usuarioPassLegales = function (username: string, password: string) {
    console.log(`verificando ${username} - ${password}`);
    if (!username || !password) return false
    if (charProhibidosUsername.test(username) || charProhibidosPassword.test(password) || password.length < minPassword || username.length < minUsername) return false
    return true;
}