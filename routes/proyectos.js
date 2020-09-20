const mongoose = require("mongoose");
//const { route } = require("./auth");
const router = require("express").Router();
const Proyecto = require("../model/Proyecto").modeloProyecto;
const esquemaTrabajo = require("../model/Trabajo").esquemaTrabajo;
const esquemaObjetivo = require("../model/Objetivo").esquemaObjetivo;
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




router.post("/listaNombres", async (req, res) => {


    console.log("enviando información completa de los proyectos ");
    try {
        proyectos = await Proyecto.find({}, "nombre").exec();
        console.log("proyectos completos retrieved");
    }
    catch (err) {
        console.log("error obteniendo lista completa de proyectos. Error: " + err);
        return res.status(400).send("");
    }
    res.send(proyectos);
});

router.post("/getInfoElementos", async (req, res) => {
    if (!req.body.idProyecto) {
        console.log('error: No habia datos.');
        return res.status(400).send('');
    }
    const idProyecto = req.body.idProyecto;
    var elProyecto = null;
    try {
        elProyecto = await Proyecto.findById(idProyecto, "objetivos trabajos");
    }
    catch (error) {
        console.log('error buscando proyecto. e: ' + error);
        return res.status(400).send('');
    }


    res.send({ proyecto: elProyecto });
});

router.post("/elementos/getSubElementos", async (req, res) => {

    const idPadre = req.body.idElemento;
    const tipoPadre = req.body.tipoPadre;
    var infoPadre = null;

    infoPadre = modelo[tipopadre].findById(idPadre, `sub${tipoPadre}s`).exec()
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

router.post("/eliminarElemento", async (req, res) => {
    const tipoElemento = req.body.tipoElemento;
    const idElemento = req.body.idElemento;
    const idProyecto = req.body.idProyecto;

    const elProyecto = await Proyecto.findById(idProyecto);

    console.log(`eliminando ${tipoElemento} ${idElemento} de proyecto ${elProyecto.nombre}`);

    switch (tipoElemento) {
        case "objetivo":
            elProyecto.objetivos.id(idElemento).remove();
            break;
        case "trabajo":
            elProyecto.trabajos.id(idElemento).remove();
            break;
        default:
            console.log(`error elimnando: tipo ${tipoElemento} no reconocido`);
    }
    try {
        await elProyecto.save();
    }
    catch (error) {
        console.log(`error guardando el proyecto ${elProyecto.nombre}. e: ` + error);
        return res.status(400).send('');
    }
    res.send({ msj: "ok" });
});

router.post("/crearTrabajo", async (req, res) => {
    if (!req.body.idProyecto) {
        console.log('no habia datos');
        return res.status(400).send('');
    }
    const idProyecto = req.body.idProyecto;
    const nombreTrabajo = req.body.nombre ? req.body.nombre : "Nuevo trabajo"
    var dependenciasViejo = [];
    if (req.body.dependenciaDelNuevo) {
        var dependencias = req.body.dependenciaDelNuevo;
    }
    else if (req.body.dependenciaDelViejo) {
        var dependenciasViejo = req.body.dependenciaDelViejo;
        console.log(`dependencias para el elemento viejo(${req.body.elementoViejo.id}): ${dependenciasViejo}`);
    }

    console.log(`Creando nuevo trabajo con dependencias: ${dependencias}`);
    const infoNuevoTrabajo = {
        nombre: nombreTrabajo,
        dependencias: dependencias
    }
    var idNuevoTrabajo = null;
    //Encontrar el proyecto
    try {
        var elProyecto = await Proyecto.findById(idProyecto);
    }
    catch (error) {
        console.log('error ');
        return res.status(400).send('');
    }
    //Crear nuevo Trabajo
    nuevoTrabajo = elProyecto.trabajos.create(infoNuevoTrabajo);
    console.log(`Nuevo Trabajo: ${nuevoTrabajo}`);

    idNuevoTrabajo = nuevoTrabajo._id;
    elProyecto.trabajos.push(nuevoTrabajo);
    retorno={nuevoTrabajo:nuevoTrabajo};
    //Encontrar el elemento viejo:
    if (req.body.elementoViejo) {
        var elementoViejo = null;
        switch (req.body.elementoViejo.tipo) {
            case "trabajo":
                elementoViejo = elProyecto.trabajos.id(req.body.elementoViejo.id);
                break;
            case "objetivo":
                elementoViejo = elProyecto.objetivos.id(req.body.elementoViejo.id);
                break;
            default:
                console.log('error: No se puedo encontrar el elemento viejo.');
                return res.status(400).send('');
        }

        dependenciaParaElViejo=req.body.dependenciaDelViejo;
        dependenciaParaElViejo.ref=idNuevoTrabajo;
        dependenciaParaElViejo.tipo="trabajo";        
        console.log(`añadiendo dependencia ${dependenciaParaElViejo} en ${elementoViejo.nombre}`);
        elementoViejo.dependencias.push(dependenciaParaElViejo);
        retorno.elementoViejo=elementoViejo;
    }
    
    try {
        await elProyecto.save();
    }
    catch (error) {
        console.log('error guardando el proyecto con id ' + idProyecto + " error: " + error);
        return res.status(400).send('');
    }
    console.log(`creado trabajo ${nombreTrabajo} con id ${idNuevoTrabajo} en proyecto ${elProyecto.nombre}`);
    res.send(retorno);

});
router.post("/crearObjetivo", async (req, res) => {
    if (!req.body.idProyecto) {
        console.log('no habia datos');
        return res.status(400).send('');
    }

    const idProyecto = req.body.idProyecto;
    const nombreObjetivo = req.body.nombre ? req.body.nombre : "Nuevo objetivo"
    const dependencias = req.body.dependencias ? req.body.dependencias : [];
    const infoNuevoObjetivo = {
        nombre: nombreObjetivo,
        dependencias: dependencias
    }

    var idNuevoObjetivo = null;
    try {
        var elProyecto = await Proyecto.findById(idProyecto);
    }
    catch (error) {
        console.log('error ');
        return res.status(400).send('');
    }
    nuevoObjetivo = elProyecto.objetivos.create(infoNuevoObjetivo);
    idNuevoObjetivo = nuevoObjetivo._id;
    elProyecto.objetivos.push(nuevoObjetivo);
    console.log(idNuevoObjetivo);
    try {
        console.log(await elProyecto.save());
    }
    catch (error) {
        console.log('error guardando el proyecto con id ' + idProyecto + " error: " + error);
        return res.status(400).send('');
    }
    console.log(`creado objetivo ${nombreObjetivo} con id ${idNuevoObjetivo} en proyecto ${elProyecto.nombre}`);
    res.send({ id: idNuevoObjetivo, nombre: infoNuevoObjetivo.nombre });

});


router.post("/elementos/renombrar", async (req, res) => {
    const tipoElemento = req.body.tipoRef;
    const idElemento = req.body.idRef;
    const nuevoNombre = req.body.nuevoNombre;
    const idProyecto = req.body.idParent;
    console.log("renombrando " + idElemento + " a " + nuevoNombre);
    try {
        elProyecto = await Proyecto.findById(idProyecto);
        console.log(`proyecto encontrado: ${elProyecto.nombre}`);
    }
    catch (error) {
        console.log(`error buscando el proyecto ${idProyecto} . e: ` + error);
        return res.status(400).send('');
    }

    switch (tipoElemento) {
        case "proyecto":
            elProyecto.nombre = nuevoNombre;
            break;
        case "objetivo":
            try {
                var elemento = await elProyecto.objetivos.id(idElemento);
            }
            catch (error) {
                console.log(`error buscando el subelemento. e: ` + error);
                return res.status(400).send('');
            }

            break;
        case "trabajo":
            console.log(`cambiando nombre de trabajo`);
            try {
                var elemento = await elProyecto.trabajos.id(idElemento);
            }
            catch (error) {
                console.log(`error buscando el subelemento. e: ` + error);
                return res.status(400).send('');
            }
            break;
        default:
            console.log("error identificando el tipo de documento a renombrar");

    }
    elemento.nombre = nuevoNombre;
    elProyecto.save((err, resultado) => {
        if (err) {
            console.log("error guardando " + tipoElemento + " Error: " + err);
            return res.status(400).send("error");
        }
        console.log(`${tipoElemento} con id: ${idElemento} renombrado a ${nuevoNombre}`);
        return res.send({ elemento: { nombre: elemento.nombre } });
    })
});



//parte vieja
/*
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
    const peticion = JSON.parse(`{ "${tipoElemento}s" : {"ref":"${idElemento}"} }`);
    modelo[tipoPadre].findOneAndUpdate({ _id: idPadre }, { $pull: peticion }, (err, resultado) => {
        if (err) {
            console.log('error asdasd');
            return res.status(400).send('');
        }
        console.log("resultado: " + resultado);
        res.send({ idEliminado: idElelemento });
    });

});

*/


module.exports = router;
