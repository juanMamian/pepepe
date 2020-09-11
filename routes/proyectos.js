const mongoose = require("mongoose");
//const { route } = require("./auth");
const router = require("express").Router();
const Proyecto = require("../model/Proyecto").modeloProyecto;
const Trabajo = require("../model/Trabajo").modeloTrabajo;
const Objetivo = require("../model/Objetivo").modeloObjetivo;
const { estaLogeado } = require("./loginStatus");

modelo = new Object({
    proyecto: require("../model/Proyecto").modeloProyecto,
    trabajo: require("../model/Trabajo").modeloTrabajo,
    objetivo: require("../model/Objetivo").modeloObjetivo
});
mongoose.set('useFindAndModify', false);

//Funcion que recibe un pathId y retorna el objeto en la punta del pathId listo para create()
// u otra operacion y el
//objeto Proyecto completo listo para save()
async function getPadre(idPadre, tipoPadre) {
    switch (tipoPadre) {
        case "proyecto":
            try {
                elPadre = await Proyecto.findById(idPadre);
            }
            catch (err) {
                console.log(`Proyecto padre no encontrado: ${err}`);
                return false;
            }
            break;
        case "objetivo":
            try {
                elPadre = await Objetivo.findById(idPadre);
            }
            catch (err) {
                console.log(`Objetivo padre no encontrado: ${err}`);
                return false;
            }
            break;
        case "Trabajo":
            try {
                elPadre = await Trabajo.findById(idPadre);
            }
            catch (err) {
                console.log(`Trabajo padre no encontrado: ${err}`);
                return false;
            }
            break;
        default: return false;
    }
    return elPadre;
}




router.post("/listaCompleta", async (req, res) => {


    console.log("enviando información completa de los proyectos ");
    try {
        proyectos = await Proyecto.find({}).exec();
        console.log("proyectos completos retrieved");
    }
    catch (err) {
        console.log("error obteniendo lista completa de proyectos. Error: " + err);
        return res.status(400).send("");
    }
    res.send(proyectos);
});

router.post("/elementos/getSubElementos", async (req, res) => {

    const idPadre = req.body.idElemento;
    const tipoPadre = req.body.tipoPadre;
    var infoPadre = null;
    switch (tipoPadre) {
        case "proyecto":
            infoPadre = await Proyecto.findById(idPadre, "objetivos trabajos").exec();
            break;
        case "objetivo":
            infoPadre = await Objetivo.findById(idPadre, "objetivos trabajos").exec();
            break;
        case "trabajo":
            infoPadre = await Trabajo.findById(idPadre, "objetivos trabajos").exec();
            break;
    }

    console.log(`fetching subelementos de ${tipoPadre} con id ${idPadre}`);

    console.log(`lista de refs: `);

    //Fetch todos los objetivos
    aRefsObjetivos = [];
    aObjetivos = null;
    for (var i in infoPadre.objetivos) {
        aRefsObjetivos[i] = infoPadre.objetivos[i].ref;
    }
    try {
        aObjetivos = await Objetivo.find().where("_id").in(aRefsObjetivos).exec();
    } catch (error) {
        console.log('Error buscando objetivos en DB');
        return res.status(400).send('error');
    }

    //Fetch todos los trabajos
    aRefsTrabajos = [];
    aTrabajos = null;
    for (var i in infoPadre.trabajos) {
        aRefsTrabajos[i] = infoPadre.trabajos[i].ref;
    }
    try {
        aTrabajos = await Trabajo.find().where("_id").in(aRefsTrabajos).exec();
    }
    catch (err) {
        console.log('error obteniendo trabajos');
        return res.status(400).send('error');
    }

    res.send({ objetivos: aObjetivos, trabajos: aTrabajos });
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

router.post("/eliminar", async (req, res) => {
    console.log("eliminando proyecto id: " + req.body.idProyecto);
    const idProyecto = req.body.idProyecto;
    const elProyecto = await Proyecto.findById(idProyecto);
    elProyecto.remove((err, resultado) => {
        if (err) {
            console.log("error eliminando proyecto. Error: " + err);
            return res.status(400).send("proyecto no encontrado");
        }
        console.log("proyecto eliminado");
        console.log(resultado);
        return res.send({ eliminado: { _id: resultado._id } });
    });
});

router.post("/elementos/renombrar", async (req, res) => {
    const tipoDocumento = req.body.tipoDocumento;
    const idDocumento = req.body.id;
    const nuevoNombre = req.body.nuevoNombre;
    console.log("renombrando " + idDocumento + " a " + nuevoNombre);
    var elDocumento = null;
    switch (tipoDocumento) {
        case "proyecto":
            elDocumento = await Proyecto.findById(idDocumento);
            break;
        case "objetivo":
            elDocumento = await Objetivo.findById(idDocumento);
            break;
        case "trabajo":
            elDocumento = await Trabajo.findById(idDocumento);
            break;
        default:
            console.log("error identificando el tipo de documento a renombrar");

    }
    elDocumento.nombre = nuevoNombre;
    elDocumento.save((err, resultado) => {
        if (err) {
            console.log("error guardando " + tipoDocumento + " Error: " + err);
            return res.status(400).send("error");
        }
        console.log(`${tipoDocumento} con id: ${idDocumento} renombrado a ${resultado.nombre}`);
        return res.send({ documento: { nombre: resultado.nombre } });
    })
});

router.post("/elementos/crear", async (req, res) => {
    const idPadre = req.body.idPadre;
    const tipoPadre = req.body.tipoPadre;
    const tipoDocumento = req.body.tipoDocumento;
    const nuevoElemento = {
        nombre: req.body.nombre ? req.body.nombre : "Sin nombre",
    }

    console.log(`creando un ${tipoDocumento} hijo de un ${tipoPadre} con id ${idPadre}`);
    const elPadre = await getPadre(idPadre, tipoPadre);
    if (!elPadre) {
        console.log(`error encontrando el elemento Padre ${tipoPadre} con id ${idPadre}`);
        return res.status(400).send("Error");
    }
    var elElemento = null;
    switch (tipoDocumento) {
        case "objetivo":
            elElemento = await Objetivo.create(nuevoElemento);
            break;
        case "trabajo":
            elElemento = await Trabajo.create(nuevoElemento);
            break;
        default:
            console.log(`el tipo ${tipoDocumento} no está especificado`);
            return res.status(400).send("tipo elemento no reconocido");
    }
    const enlaceNuevoElemento = {
        ref: elElemento._id
    }
    try {
        console.log("actualizando informacion en el parent: " + elPadre.nombre);
        await elPadre[tipoDocumento + "s"].push(enlaceNuevoElemento);
    }
    catch (err) {
        console.log(`error pushing el enlace al nuevo documento en el ${tipoDocumento}. Error: ${err}`);
        return res.status(400).send("error");
    }
    try {
        console.log(await elPadre.save());
        console.log(await elElemento.save());
        return res.send({ elemento: elElemento });
    }
    catch (err) {
        console.log(`error saving padre o elemento. Error: ${err}`);
        return res.status(400).send("error");
    }
});

router.post("/elementos/desconectar", async (req, res) => { //Desconecta un trabajo o objetivo de su parent element en el diagrama de proyecto. NO ELIMINA el objetivo o trabajo
    const idElemento = req.body.idElemento;
    const tipoElemento = req.body.tipoElemento;
    const subArray = tipoElemento + "s";
    const idPadre = req.body.idPadre;
    const tipoPadre = req.body.tipoPadre;
    const elPadre = await getPadre(idPadre, tipoPadre);
    console.log(`padre: ${tipoPadre} con id: ${elPadre.nombre}. Se eliminara el ${tipoElemento} con ref: ${idElemento}`);
    const peticion=JSON.parse(`{ "${tipoElemento}s" : {"ref":"${idElemento}"} }`);
    modelo[tipoPadre].findOneAndUpdate({ _id: idPadre }, { $pull: peticion }, (err, resultado) => {
        if (err) {
            console.log('error asdasd');
            return res.status(400).send('');
        }
        console.log("resultado: " + resultado);
        res.send({idEliminado: idElelemento});
    });
    
});




module.exports = router;
