const mongoose = require("mongoose");
const router=require("express").Router();
const Proyecto=require("../model/Proyecto").modeloProyecto;

router.post("/listaCompleta", async(req, res) => {
    console.log("enviando información completa de los proyectos");
    Proyecto.find({}, function(err, objects){
        res.send(objects);
    });
});

router.post("/crear", async (req, res) =>{
    console.log("creando proyecto nuevo");
    const newProyecto=new Proyecto({
        nombre: req.body.nombre ? req.body.nombre : "nuevo proyecto",
        descripcion: req.body.descripcion ? req.body.descripcion : "sin descripcion"
    });

    try {
        const upload = await newProyecto.save();
        res.send({proyecto:newProyecto});
    } catch (error) {
        res.status(400).send(error);
    }
});

router.post("/eliminar", (req, res) => {
    if(!req.body.id){
        return res.status(400).send("wrong id");
    }
    const idProyecto=req.body.id;
    Proyecto.findByIdAndDelete(idProyecto, function(err){
        if(err){
            res.status(400).send(err);
        }
        else{
            res.send("ok");
        }
    });
})


router.post("/objetivos/crear", (req, res) => {//Se espera un array de ids que señalan el path en el que se debe insertar el objetivo: [id de proyecto, id de objetivo, ide de objetivo, etc.]
    const pathId = req.body.pathId;
    if(!pathId[0]){
        res.status(400).send("wrong id");
        return console.log("retornando");
    }
    console.log(`buscando el id: ${pathId[0]}`);
    Proyecto.findById(pathId[0], (err, elProyecto)=>{
        if(err){
            res.status(400).send(err);
        }
        else{
            const nuevoObjetivo={
                nombre: req.body.nombre ? req.body.nombre : "nuevo objetivo",
                descripcion:req.body.descripcion ? req.body.descripcion : ""
            }

            var futuroParent=elProyecto;
            var rutaNombres=elProyecto.nombre;
            var i = 1;

            while(pathId[i]){                
               //revisar si este objeto tiene una key "objetivos" en donde encontrar el nuevo futuro Parent
               console.log(`checkeando el nivel ${i} de nest`);
                if(!futuroParent.objetivos){
                   console.log(`en ${futuroParent.nombre} no hay objetivos`);
                   res.status(400).send("wrong id");
               }    
               console.log(typeof(futuroParent));
               //Verificar que existe el nuevo parent
               if(futuroParent.objetivos.find(elemento => elemento._id==pathId[i])){
                    futuroParent=futuroParent.objetivos.find(elemento => elemento._id==pathId[i]);
                    console.log(`seleccionando ${futuroParent.nombre}`);
               }
               else{
                   console.log(`elemento ${i} del path no encontrado`);
                   res.status(400).send("wrong id");
                   return;
               }
                i++;
            }
            //Introducir el nuevo objetivo y guardar en base de datos
            console.log(`futuro parent es ${futuroParent.nombre}`);
            futuroParent.objetivos.push(nuevoObjetivo);
            elProyecto.save(function(err, resultado){
                if(err) res.status(400).send(err);
                res.send({objetivo: resultado});
            });
           
        }
    });        
});

router.post("/objetivos/eliminar", (req, res) => {//Se espera un array de ids que señalan el path en el que se debe insertar el objetivo: [id de proyecto, id de objetivo, ide de objetivo, etc.]
    const pathId =  req.body.pathId;
    if(!pathId[0]){
        res.status(400).send("wrong id");
        return console.log("retornando");
    }
    Proyecto.findById(pathId[0], (err, elProyecto)=>{
        if(err){
            res.status(400).send(err);
        }
        else{
            var elementoPunta=elProyecto;
            var i=1;
            while(pathId[i]){
                if(!elementoPunta.objetivos){
                    res.status(400).send("wrong id");
                    return;
                }
                if(elementoPunta.objetivos.find(elemento => elemento.id==pathId[i])) {
                    elementoPunta=elementoPunta.objetivos.find(elemento => elemento.id==pathId[i]);
                }
                else{
                    res.status(400).send("wrong id");
                    return;
                }
                i++;
            }
            console.log(`elemento que se eliminará: ${elementoPunta.nombre}`);
            res.send(elProyecto);
        }
    });

});

router.post("/elementosDiagrama/renombrar", (req, res) => { //se espera un array con el path de ids en el que se encuentra el elemento. Incluyendo el objetivo
    const pathId =  req.body.pathId;
    console.log("req: " + JSON.stringify(req.body));
    console.log(`renombrando en ${pathId}`);
    const nuevoN=req.body.nombre;
    if(!pathId[0]){
        res.status(400).send("wrong id");
        return console.log("retornando");
    }
    Proyecto.findById(pathId[0], (err, elProyecto)=>{
        if(err){
            console.log("error en find by id");
            return res.status(400).send(err);            
        }
        else{
            var elementoPunta=elProyecto;
            var i=1;
            while(pathId[i]){
                if(!elementoPunta.objetivos){
                    res.status(400).send("wrong id");
                    return;
                }
                if(elementoPunta.objetivos.find(elemento => elemento.id==pathId[i])) {
                    elementoPunta=elementoPunta.objetivos.find(elemento => elemento.id==pathId[i]);
                }
                else{
                    res.status(400).send("wrong id");
                    return;
                }
                i++;
            }
            console.log(`elemento que se renombrará: ${elementoPunta.nombre}`);
            elementoPunta.nombre=nuevoN;
            console.log("subiendo "+ elProyecto);
            console.log("elemento punta: "+elementoPunta);
            elProyecto.save(function(err, resultado){                
                if(err){
                    console.log(err);
                    return res.status(400).send(err);
                }
                res.send(resultado);
            });
        }
    });

});

module.exports = router;
