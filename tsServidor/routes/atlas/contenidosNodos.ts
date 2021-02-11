const router = require("express").Router();
import fs from "fs";
import path from "path"
import { promisify } from "util";
import { ModeloCarpetaArchivos as CarpetasArchivos } from "../../model/CarpetaArchivos";
import { ModeloNodo as Nodo } from "../../model/atlas/Nodo";

const access = promisify(fs.access);

router.get("/:idNodo/:nombreSeccion/:nombreArchivo", async function (req, res) {
    console.log(`Acceso a un archivo de contenido de sección de nodo`);
    const idNodo = req.params.idNodo;
    const nombreSeccion=req.params.nombreSeccion;
    const nombreArchivo=req.params.nombreArchivo;
    console.log(`Acceso al contenido de un nodo con id ${req.params.idNodo} para la seccion ${req.params.nombreSeccion}`);
    let pathDefault = path.join(__dirname, '../../assetsAtlas/contenidosNodos/', "default", "index.html");

    try {
        var elNodo:any=await Nodo.findById(idNodo, "nombre secciones").exec();
        if(!elNodo)throw "Nodo no encontrado";
    } catch (error) {
        console.log(`Error buscando el nodo en la base de datos`);
        return res.sendFile(pathDefault);
    }

    const laSeccion=elNodo.secciones.find(s=>s.nombre==nombreSeccion);

    if(!laSeccion){
        console.log(`Seccion no encontrada`);
        return res.sendFile(pathDefault);
    }

    if(!laSeccion.idCarpeta){
        console.log(`Carpeta no existente`);
        return res.sendFile(pathDefault);
    }

    try {
        var laCarpeta:any=await CarpetasArchivos.findById(laSeccion.idCarpeta).exec();
        if(!laCarpeta)throw "Carpeta no encontrada";
        if(nombreArchivo){
            var elArchivo=laCarpeta.archivos.find(a=>a.nombre==nombreArchivo);
            if(!elArchivo)throw "Archivo no existente";        
        }
        else{
            var elArchivo=laCarpeta.archivos.find(a=>a.primario==true);
            if(!elArchivo)throw "Archivo primario no existente";        
        }
    } catch (error) {
        console.log(`Error buscando el archivo. E: ${error}`);
        return res.sendFile(pathDefault);
    }

    return elArchivo        

});

router.get("/:idNodo/:nombreSeccion", async function (req, res) {
    console.log(`Acceso a un archivo de contenido de sección de nodo`);
    const idNodo = req.params.idNodo;
    const nombreSeccion=req.params.nombreSeccion;
    const nombreArchivo=req.params.nombreArchivo;
    console.log(`Acceso al contenido de un nodo con id ${req.params.idNodo} para la seccion ${req.params.nombreSeccion}`);
    let pathDefault = path.join(__dirname, '../../assetsAtlas/contenidosNodos/', "default", "index.html");

    try {
        var elNodo:any=await Nodo.findById(idNodo, "nombre secciones").exec();
        if(!elNodo)throw "Nodo no encontrado";
    } catch (error) {
        console.log(`Error buscando el nodo en la base de datos`);
        return res.sendFile(pathDefault);
    }

    const laSeccion=elNodo.secciones.find(s=>s.nombre==nombreSeccion);

    if(!laSeccion){
        console.log(`Seccion no encontrada`);
        return res.sendFile(pathDefault);
    }

    if(!laSeccion.idCarpeta){
        console.log(`Carpeta no existente`);
        return res.sendFile(pathDefault);
    }

    try {
        var laCarpeta:any=await CarpetasArchivos.findById(laSeccion.idCarpeta).exec();
        if(!laCarpeta)throw "Carpeta no encontrada";
        if(nombreArchivo){
            var elArchivo=laCarpeta.archivos.find(a=>a.nombre==nombreArchivo);
            if(!elArchivo)throw "Archivo no existente";        
        }
        else{
            var elArchivo=laCarpeta.archivos.find(a=>a.primario==true);
            if(!elArchivo)throw "Archivo primario no existente";       
            console.log(`encontrado ${elArchivo.nombre}`); 
        }
    } catch (error) {
        console.log(`Error buscando el archivo. E: ${error}`);
        return res.sendFile(pathDefault);
    }
    console.log(`Archivo encontrado. Enviando`);
    res.set('Content-Type', elArchivo.mimetype);
    return res.send(elArchivo.payload);

});

module.exports = router;
