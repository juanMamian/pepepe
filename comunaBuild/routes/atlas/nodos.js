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
const Nodo_1 = require("../../model/atlas/Nodo");
router.post("/updateIcono", upload.single("nuevoIcono"), function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            var elNodo = yield Nodo_1.ModeloNodo.findById(req.body.idNodo, "nombre icono");
        }
        catch (error) {
            console.log(`error buscando el nodo para cambio de icono. e: ` + error);
            return res.status(400).send('');
        }
        console.log(`updating icono del nodo ${elNodo.nombre} con id ${req.body.idNodo}`);
        // console.log(`info en la request: files: ${req.files}, otros: ${req.body}`);
        elNodo.icono = req.file.buffer;
        try {
            yield elNodo.save();
        }
        catch (error) {
            console.log(`error guardando el nodo después de subir imagen. e: ` + error);
            return res.status(400).send('');
        }
        res.send({ resultado: "ok" });
    });
});
router.get("/iconos/:id", function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const idNodo = req.params.id;
        try {
            var elNodo = yield Nodo_1.ModeloNodo.findById(idNodo, "icono");
        }
        catch (error) {
            console.log(`error buscando el nodo con icono. e: ` + error);
            return res.status(400).send('');
        }
        res.set('Content-Type', 'image/png');
        res.send(elNodo.icono);
    });
});
module.exports = router;
