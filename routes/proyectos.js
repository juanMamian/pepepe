const mongoose = require("mongoose");
//const { route } = require("./auth");
const router = require("express").Router();
const Proyecto = require("../model/Proyecto").modeloProyecto;
const { estaLogeado } = require("./loginStatus");
const Trabajo = require("../model/Trabajo").modeloTrabajo;


//Funcion que recibe un pathId y retorna el objeto en la punta del pathId listo para create()
// u otra operacion y el
//objeto Proyecto completo listo para save()
async function getElementoPunta(pathId) {
    elems = false;
    console.log(`evaluando ${pathId}`);
    await Proyecto.findById(pathId[0], (err, proyectoPadre) => {
        if (err) {
            return false;
        }
        console.log("Proyecto padre: " + proyectoPadre.nombre);
        var elementoPunta = proyectoPadre;
        var i = 1;
        var encontrado = 0;
        while (pathId[i]) {
            //El siguiente elemento puede ser un objetivo o un trabajo
            if (!elementoPunta.objetivos.find(elemento => elemento._id == pathId[i])) {
                console.log(`objetivo ${pathId[i]} no encontrado en ${elementoPunta._id}. (Index=${i})`);
            }
            else {
                encontrado++;
                console.log(`objetivo ${pathId[i]} encontrado`);
                elementoPunta = elementoPunta.objetivos.find(elemento => elemento._id == pathId[i]);
            }
            if (!elementoPunta.trabajos.find(elemento => elemento._id == pathId[i])) {
                console.log(`trabajo ${pathId[i]} no encontrado en ${elementoPunta._id}. (Index=${i})`);
            }
            else {
                console.log(`trabajo ${pathId[i]} encontrado`);
                encontrado++;
                elementoPunta = elementoPunta.trabajos.find(elemento => elemento._id == pathId[i]);
            }
            if (encontrado != 1) {
                if (encontrado == 0) {
                    console.log(`elemento ${pathId[i]} no encontrado`);
                    return false;
                }
                if (encontrado > 1) {
                    console.log("conflicto de ids: " + pathId[i]);
                    return false;
                }
                console.log("error con 'encontrado': pathId: " + pathId[i]);
                return false;
            }
            i++;
        }
        elems = [proyectoPadre, elementoPunta];
        console.log("padre y punta encontrados");
    });
    return elems;
}


function findUpdateTareas(padre) {
    //preguntarse si tiene tareas
    var estosTrabajos = padre.trabajos ? padre.trabajos : [];
    console.log("Buscando tareas en " + padre.nombre + ` con id ${padre._id}`);
    if (estosTrabajos.length > 0) {
        estosTrabajos.forEach(trabajo => {
            const idTrabajo = trabajo.idTrabajo;
            Trabajo.findById(idTrabajo, "nombre", (err, infoTrabajo) => {
                if (err) {
                    console.log("Trabajo no encontrado");
                }
                console.log(`actualizando ${idTrabajo} con ${infoTrabajo.nombre}`);
                trabajo.nombre = infoTrabajo.nombre;
            });

            findUpdateTareas(trabajo);
        });
    }

    //Preguntarse si tiene objetivos
    var estosObjetivos = padre.objetivos ? padre.objetivos : [];
    if (estosObjetivos.length > 0) {
        estosObjetivos.forEach(objetivo => {
            findUpdateTareas(objetivo);
        });

    }
}

router.post("/listaCompleta", async (req, res) => {
    console.log("enviando información completa de los proyectos");
    Proyecto.find({}, function (err, proyectos) {
        res.send(proyectos);
    });
});

router.post("/crear", async (req, res) => {
    console.log("creando proyecto nuevo");
    const newProyecto = new Proyecto({
        nombre: req.body.nombre ? req.body.nombre : "nuevo proyecto",
        descripcion: req.body.descripcion ? req.body.descripcion : "sin descripcion"
        //gestores: [req.infoUsuario._id] ? [req.infoUsuario._id] : ""
    });

    newProyecto.save((err, resultado) => {
        if (err) {
            console.log("error guardando proyecto nuevo");
            return res.status(400).send("error");
        }
        console.log("proyecto creado");
        res.send({ proyecto: resultado });
    });
});

router.post("/eliminar", (req, res) =>{
    console.log("eliminando proyecto id: "+req.body.idProyecto);
    const idProyecto=req.body.idProyecto;
});


router.post("/objetivos/crear", async (req, res) => {//Se espera un array de ids que señalan el path en el que se debe insertar el objetivo: [id de proyecto, id de objetivo, ide de objetivo, etc.]
    const pathId = req.body.pathId;
    console.log(`enviando ${pathId}`);
    const elems = await getElementoPunta(pathId);
    if (!elems) {
        res.status(400).send("bad pathId");
    }
    const elProyecto = elems[0];
    const elementoPunta = elems[1];
    console.log(`seleccionado ${elementoPunta.nombre} en ${elProyecto.nombre}`);
    futuroParent = elementoPunta;
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
            encontrado
            while (pathId[i]) {
                if (!elementoPunta.objetivos && !elementoPunta.trabajos) {
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
        console.log("Proyecto padre: " + proyectoPadre.nombre);
        var elementoPunta = proyectoPadre;
        var i = 1;
        var encontrado = 0;
        while (pathId[i]) {
            //El siguiente elemento puede ser un objetivo o un trabajo
            if (!elementoPunta.objetivos.find(elemento => elemento._id == pathId[i])) {
                console.log(`objetivo ${pathId[i]} no encontrado en ${elementoPunta._id}. (Index=${i})`);
            }
            else {
                encontrado++;
                console.log(`objetivo ${pathId[i]} encontrado`);
                elementoPunta = elementoPunta.objetivos.find(elemento => elemento._id == pathId[i]);
            }
            if (!elementoPunta.trabajos.find(elemento => elemento._id == pathId[i])) {
                console.log(`objetivo ${pathId[i]} no encontrado en ${elementoPunta._id}. (Index=${i})`);
            }
            else {
                console.log(`trabajo ${pathId[i]} encontrado`);
                encontrado++;
                elementoPunta = elementoPunta.trabajos.find(elemento => elemento._id == pathId[i]);
            }
            if (encontrado != 1) {
                if (encontrado == 0) {
                    return res.status(400).send("bad pathId");
                }
                if (encontrado > 1) {
                    return res.status(500).send("conflicto de ids");
                }
                console.log("error con 'encontrado'");
                return res.status(500).send("error desconocido");

            }

            i++;
        }
        const nTrabajo = new Trabajo({
            nombre: req.body.nombre ? req.body.nombre : "Nuevo trabajo",
            descripcion: req.body.descripcion ? req.body.descripcion : null,
            responsables: req.body.responsables ? req.body.responsables : null,
            materiales: req.body.materiales ? req.body.materiales : null,
            enlacesAtlas: req.body.enlacesAtlas ? req.body.enlacesAtlas : null,
            enlacesProyectos: []
        });

        nTrabajo.enlacesProyectos.push({ pathId: pathId });
        console.log(`path en nTrabajo: ${nTrabajo.enlacesProyectos}`);

        //Guardar trabajo en colección de trabajos
        nTrabajo.save((err, resultadoT) => {

            if (err) {
                console.log(err);
                return res.status(400).send(err);
            }
            const idTrabajoNuevo = resultadoT._id;
            //Actualizar proyecto:
            elementoPunta.trabajos.push({ idTrabajo: idTrabajoNuevo });
            proyectoPadre.save((err, resultadoP) => {
                if (err) {
                    console.log(err);
                    return res.status(400).send(err);
                }
                console.log(resultadoP);
                return res.send({ trabajo: resultadoT });
            });
        });
    });
});



module.exports = router;
