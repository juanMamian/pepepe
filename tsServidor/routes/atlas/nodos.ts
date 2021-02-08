const multer = require("multer");
const upload = multer();
const router = require("express").Router();
import { ModeloNodo as Nodo } from "../../model/atlas/Nodo";
import path from "path";

router.post("/updateIcono", upload.single("nuevoIcono"), async function (req, res) {

    try {
        var elNodo: any = await Nodo.findById(req.body.idNodo, "nombre icono");
    }
    catch (error) {
        console.log(`error buscando el nodo para cambio de icono. e: ` + error);
        return res.status(400).send('');
    }

    console.log(`updating icono del nodo ${elNodo.nombre} con id ${req.body.idNodo}`);
    // console.log(`info en la request: files: ${req.files}, otros: ${req.body}`);
    elNodo.icono = req.file.buffer;

    try {
        await elNodo.save();
    }
    catch (error) {
        console.log(`error guardando el nodo después de subir imagen. e: ` + error);
        return res.status(400).send('');
    }
    res.send({ resultado: "ok" });
});

router.get("/iconos/:id", async function (req, res) {

    const idNodo = req.params.id;
    if (idNodo == "null" || idNodo == "undefined" || idNodo == "-1" || !idNodo) {
        return res.sendFile(path.join(__dirname, '../../public/media/iconos/nodoConocimientoDefault.png'));
    }
    try {
        var elNodo: any = await Nodo.findById(idNodo, "icono");
    }
    catch (error) {
        console.log(`error buscando el nodo con icono. e: ` + error);
        return res.status(400).send('Nodo no encontrado');
    }
    if (!elNodo.icono) {
        return res.sendFile(path.join(__dirname, '../../public/media/iconos/nodoConocimientoDefault.png'));
    }
    res.set('Content-Type', 'image/png');
    return res.send(elNodo.icono);
});
module.exports = router;