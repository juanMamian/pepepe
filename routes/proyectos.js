const mongoose = require("mongoose");
const { route } = require("./auth");
const router = require("express").Router();
const Proyecto = require("../model/Proyecto").modeloProyecto;
const { estaLogeado } = require("./loginStatus");
const Trabajo = require("../model/Trabajo").modeloTrabajo;



router.post("/listaCompleta", async (req, res) => {
    console.log("enviando información completa de los proyectos");
    Proyecto.find({}, function (err, objects) {
        res.send(objects);
    });
});

router.post("/crear", estaLogeado, async (req, res) => {
    console.log("creando proyecto nuevo");
    const newProyecto = new Proyecto({
        nombre: req.body.nombre ? req.body.nombre : "nuevo proyecto",
        descripcion: req.body.descripcion ? req.body.descripcion : "sin descripcion",
        gestores: [req.infoUsuario._id]
    });

    try {
        const upload = await newProyecto.save();
        res.send({ proyecto: newProyecto });
    } catch (error) {
        res.status(400).send(error);
    }
});
//Eliminar elemento                                                                 



router.post("/objetivos/crear", (req, res) => {//Se espera un array de ids que señalan el path en el que se debe insertar el objetivo: [id de proyecto, id de objetivo, ide de objetivo, etc.]
    const pathId = req.body.pathId;
    if (!pathId[0]) {
        res.status(400).send("wrong id");
        return console.log("retornando");
    }
    console.log(`buscando el id: ${pathId[0]}`);
    Proyecto.findById(pathId[0], (err, elProyecto) => {
        if (err) {
            res.status(400).send(err);
        }
        else {


            var futuroParent = elProyecto;
            var rutaNombres = elProyecto.nombre;
            var i = 1;

            while (pathId[i]) {
                //revisar si este objeto tiene una key "objetivos" en donde encontrar el nuevo futuro Parent
                console.log(`checkeando el nivel ${i} de nest`);
                if (!futuroParent.objetivos) {
                    console.log(`en ${futuroParent.nombre} no hay objetivos`);
                    res.status(400).send("wrong id");
                }
                console.log(typeof (futuroParent));
                //Verificar que existe el nuevo parent
                if (futuroParent.objetivos.find(elemento => elemento._id == pathId[i])) {
                    futuroParent = futuroParent.objetivos.find(elemento => elemento._id == pathId[i]);
                    console.log(`seleccionando ${futuroParent.nombre}`);
                }
                else {
                    console.log(`elemento ${i} del path no encontrado`);
                    res.status(400).send("wrong id");
                    return;
                }
                i++;
            }
            //Introducir el nuevo objetivo y guardar en base de datos
            const nuevoObjetivo = futuroParent.objetivos.create({
                nombre: req.body.nombre ? req.body.nombre : "nuevo objetivo",
                descripcion: req.body.descripcion ? req.body.descripcion : ""
            });

            console.log(`futuro parent es ${futuroParent.nombre}`);
            console.log(`nuevo id es: ${nuevoObjetivo._id}`);
            futuroParent.objetivos.push(nuevoObjetivo);
            elProyecto.save(function (err, resultado) {
                if (err) res.status(400).send(err);

                res.send({ objetivo: nuevoObjetivo });
            });

        }
    });
});

router.post("/elementos/eliminar", (req, res) => {//Se espera un array de ids que señalan el path en el que se debe insertar el objetivo: [id de proyecto, id de objetivo, ide de objetivo, etc.]
    const pathId = req.body.pathId;
    if (!pathId[0]) {
        res.status(400).send("wrong id");
        return console.log("retornando");
    }
    Proyecto.findById(pathId[0], (err, elProyecto) => {
        if (err) {
            return res.status(400).send(err);
        }
        else {
            var elementoPunta = elProyecto;
            var elementoPadre = null;
            var i = 1;
            while (pathId[i]) {
                if (!elementoPunta.objetivos) {
                    res.status(400).send("wrong id");
                    return;
                }
                if (elementoPunta.objetivos.find(elemento => elemento.id == pathId[i])) {
                    elementoPadre = elementoPunta;
                    elementoPunta = elementoPunta.objetivos.find(elemento => elemento.id == pathId[i]);
                }
                else {
                    res.status(400).send("wrong id");
                    return;
                }
                i++;
            }
            const idEliminado = elementoPunta._id;
            console.log(`elemento que se eliminará: ${elementoPunta.nombre}`);
            respuesta = { idEliminado: idEliminado };
            if (elementoPadre) {
                elementoPadre.objetivos.pull({ _id: idEliminado });
                elProyecto.save(function (err, resultado) {
                    if (err) return res.status(400).send("bad request");
                    return res.send(respuesta);
                });
            }
            else {
                elProyecto.remove(function (err) {
                    if (err) return res.status(400).send("bad request");
                    return res.send(respuesta);
                });
            }


        }
    });

});

router.post("/elementosDiagrama/renombrar", (req, res) => { //se espera un array con el path de ids en el que se encuentra el elemento. Incluyendo el objetivo
    const pathId = req.body.pathId;
    console.log("req: " + JSON.stringify(req.body));
    console.log(`renombrando en ${pathId}`);
    const nuevoN = req.body.nombre;
    if (!pathId[0]) {
        res.status(400).send("wrong id");
        return console.log("retornando");
    }
    Proyecto.findById(pathId[0], (err, elProyecto) => {
        if (err) {
            console.log("error en find by id");
            return res.status(400).send(err);
        }
        else {
            var elementoPunta = elProyecto;
            var i = 1;
            while (pathId[i]) {
                if (!elementoPunta.objetivos) {
                    res.status(400).send("wrong id");
                    return;
                }
                if (elementoPunta.objetivos.find(elemento => elemento.id == pathId[i])) {
                    elementoPunta = elementoPunta.objetivos.find(elemento => elemento.id == pathId[i]);
                }
                else {
                    res.status(400).send("wrong id");
                    return;
                }
                i++;
            }
            console.log(`elemento que se renombrará: ${elementoPunta.nombre}`);
            elementoPunta.nombre = nuevoN;
            console.log("subiendo " + elProyecto);
            console.log("elemento punta: " + elementoPunta);
            elProyecto.save(function (err, resultado) {
                if (err) {
                    console.log(err);
                    return res.status(400).send(err);
                }
                res.send(resultado);
            });
        }
    });

});

router.post("/trabajos/crear", (req, res) => {
    const pathId = req.body.pathId;
    console.log("creando un nuevo trabajo en el proyecto con id: " + req.body.pathId[0]);
    Proyecto.findById(pathId[0], (err, proyectoPadre) => {
        if (err) {
            return res.status(400).send(err);
        }
        console.log("Proyecto padre: "+proyectoPadre.nombre);
        var elementoPunta = proyectoPadre;
        var i = 1;
        while (pathId[i]) {
            //El siguiente elemento puede ser un objetivo o un trabajo
            if (!elementoPunta.objetivos.find(elemento => elemento._id== pathId[i])) {
                console.log(`${pathId[i]} no encontrado en ${elementoPunta._id}. (Index=${i})`);
                return res.status(400).send(err);
            }
            elementoPunta = elementoPunta.objetivos.find(elemento => elemento._id== pathId[i]);
            i++;
        }
        const nTrabajo = new Trabajo({
            nombre: req.body.nombre ? req.body.nombre : "Nuevo trabajo",
            descripcion: req.body.descripcion ? req.body.descripcion : null,
            responsables: req.body.responsables ? req.body.responsables : null,
            materiales: req.body.materiales ? req.body.materiales : null,
            enlacesAtlas: req.body.enlacesAtlas ? req.body.enlacesAtlas : null,


        });

        nTrabajo.save((err, resultado) => {

            if (err) {
                console.log(err);
                return res.status(400).send(err);
            }


            return res.send({ trabajo: resultado });
        });
    });


});
module.exports = router;
