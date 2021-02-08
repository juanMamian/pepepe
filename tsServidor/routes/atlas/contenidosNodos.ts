const router = require("express").Router();
import fs from "fs";
import path from "path"
import {promisify} from "util";

const access=promisify(fs.access);

router.get("/:idNodo", async function(req, res){
    const idNodo=req.params.idNodo;
    console.log(`Acceso al contenido de un nodo con id ${req.params.idNodo}`);
    const pathIndex=path.join(__dirname, '../../assetsAtlas/contenidosNodos/', idNodo, "index.html");

    fs.access(pathIndex, (err)=>{
        if(err){
            let pathDefault=path.join(__dirname, '../../assetsAtlas/contenidosNodos/', "default", "index.html");
            console.log(`Error leyendo el archivo. Enviando default`);
            return res.sendFile(pathDefault);        
        }
        return res.sendFile(pathIndex);
    });

    
    

});

module.exports = router;
