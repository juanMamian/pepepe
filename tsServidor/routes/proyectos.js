const mongoose = require("mongoose");
//const { route } = require("./auth");
const router = require("express").Router();
const Proyecto = require("../model/Proyecto").modeloProyecto;
const Nodo=require("../model/atlas/Nodo").modeloNodo;
const esquemaTrabajo = require("../model/Trabajo").esquemaTrabajo;
const esquemaObjetivo = require("../model/Objetivo").esquemaObjetivo;
const { estaLogeado } = require("./loginStatus");

modelo = new Object({
    proyecto: require("../model/Proyecto").modeloProyecto,
    trabajo: require("../model/Trabajo").modeloTrabajo,
    objetivo: require("../model/Objetivo").modeloObjetivo
});
mongoose.set('useFindAndModify', false);

function eliminarVinculoHuerfano() {
    console.log("funcion to do");
}

function buscarVinculoRecursivamente(elProyecto, elemento, idObjetivo, tipos) {
    const elementos = elProyecto.getTodosElementosDiagrama();
    console.log(`************`);
    console.log(`buscando en ${elemento.nombre}`);
    var vinculos = elemento.vinculos;
    for (var i = 0; i < vinculos.length; i++) {
        if (vinculos[i].ref == idObjetivo) {
            for (var j in tipos) {
                if (vinculos[i].tipoVinculo = tipos[j]) return true;
            }
        }
        let subElemento = elementos.id(vinculos[i].ref);
        if (!subElemento) {
            console.log(`elemento no existía`);
            eliminarVinculoHuerfano();
            continue;
        }
        if (buscarVinculoRecursivamente(elProyecto, subElemento, idObjetivo, tipos)) {
            return true;
        }


    }
    return false;
}
async function detectarVinculoFuerte(idProyecto, idInicio, idObjetivo) {
    try {
        var elProyecto = await Proyecto.findById(idProyecto);
    }
    catch (error) {
        console.log(`error buscando el proyecto ${idProyecto}. e: ` + error);
    }

    const elementos = elProyecto.getTodosElementosDiagrama();
    const elementoInicio = elementos.id(idInicio);
    vinculosFuertes = ["requiere"];
    console.log(`iniciando busqueda de vinculo ${idObjetivo} desde ${elementoInicio.nombre}.`);

    if (buscarVinculoRecursivamente(elProyecto, elementoInicio, idObjetivo, vinculosFuertes)) {
        return true;
    }
    else {
        return false;
    }

}

//Funcion que recibe un pathId y retorna el objeto en la punta del pathId listo para create()
// u otra operacion y el
//objeto Proyecto completo listo para save()


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
    //ordenarFilasColumnas(proyectos[5]._id);
    res.send(proyectos);

    /*for (var i in proyectos) {
        ordenarFilasColumnas(proyectos[i]);
        try{
            proyectos[i].save();
        }
        catch(error){
            console.log(`error guardando el proyecto ${proyectos[i].nombre} tras organizar sus filas y columnas. e: `+error);
            return res.status(400).send('');
        }
    }*/
});

router.post("/getInfoElementos", async (req, res) => {
    if (!req.body.idProyecto) {
        console.log('error: No habia datos.');
        return res.status(400).send('');
    }
    const idProyecto = req.body.idProyecto;
    var elProyecto = null;
    try {
        elProyecto = await Proyecto.findById(idProyecto, "nombre descripcion objetivos trabajos conocimientosNecesarios");
    }
    catch (error) {
        console.log('error buscando proyecto. e: ' + error);
        return res.status(400).send('');
    }


    res.send({ proyecto: elProyecto });
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
router.post("/renombrar", async (req, res) => { 
    
    datos=req.body;
    console.log(`renombrando proyecto con id ${datos.idProyecto}`);
    try{
        var elProyecto=await Proyecto.findById(datos.idProyecto, "nombre");   
    }
    catch(error){
        console.log(`error buscando el proyecto con id ${datos.idProyecto} para renombrar. e: `+error);
        return res.status(400).send('');        
    }
    elProyecto.nombre=datos.nuevoNombre;
    try{
        await elProyecto.save();
    }
    catch(error){
        console.log(`error guardando el proyecto con id ${datos.idProyecto} tras renombrar. e: `+error);
        return res.status(400).send('');
    }
    res.send({proyecto: elProyecto});
});

router.post("/eliminar", async (req, res) => {
    console.log("eliminando proyecto id: " + req.body.idProyecto);
    const idProyecto = req.body.idProyecto;
    const elProyecto = await Proyecto.findById(idProyecto, "_id");
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

router.post("/updateDescripcion", async (req, res) => {
    
    datos=req.body;
    console.log(`updating descripcion de ${datos.nivelRef} con id ${datos.idRef}`);
    try{
        var elProyecto=await Proyecto.findById(datos.idRef, "nombre, descripcion");    
    }
    catch(error){
        console.log(`error buscando el proyecto con id ${datos.idRef} para update descripcion. e: `+error);
        return res.status(400).send('');
    }
    elProyecto.descripcion=datos.nuevaDescripcion;
    try{
        await elProyecto.save();
    }
    catch(error){
        console.log(`error guardando el proyecto con id ${datos.idRef} tras update descripcion. e: `+error);
        return res.status(400).send('');
    }
    res.send({proyecto: elProyecto});
    
});

router.post("/elementos/updateDescripcion", async (req, res) => {    
    datos=req.body;
    console.log(`updating descripcion de ${datos.nivelRef} con id ${datos.idRef}`);
    try{
        var elProyecto=await Proyecto.findById(datos.idParent, "trabajos objetivos");    
    }
    catch(error){
        console.log(`error buscando el proyecto con id ${datos.idParent} para update descripcion. e: `+error);
        return res.status(400).send('');
    }
    var elElemento= await elProyecto.getTodosElementosDiagrama().id(datos.idRef);
    elElemento.descripcion=datos.nuevaDescripcion;
    try{
        await elProyecto.save();
    }
    catch(error){
        console.log(`error guardando el proyecto con id ${datos.idParent} tras update descripcion. e: `+error);
        return res.status(400).send('');
    }
    res.send({descripcion: elElemento.descripcion});
    
});

router.post("/elementos/vincularConocimiento", async (req, res) => {    
    datos=req.body;
    try{
        var elProyecto=await Proyecto.findById(datos.idProyecto);
    }
    catch(error){
        console.log(`error buscando el proyecto para vincular conocimiento en uno de sus elementos. e: `+error);
        return res.status(400).send('');    
    }
    var elElemento= elProyecto.getTodosElementosDiagrama().id(datos.idElemento);

    //Verificar que no exista ya el vínculo.
    if(typeof(elElemento.conocimientosVinculados)=="undefined")elElemento.conocimientosVinculados=new Array();
    for (var vinculo of elElemento.conocimientosVinculados){
       // let vinculo=elElemento.conocimientosVinculados[i];
        console.log(`comparando ${vinculo.idRef} con ${datos.idNuevoConocimiento}`);
        if(vinculo.idRef==datos.idNuevoConocimiento){
            //ya existía este vínculo
            console.log(`Ya existia un vinculo hacia aquí. Removiendo el anterior`);
            vinculo.remove();
        }
    }

    //Verificar que este nodo existe y leer el nombre
    //Buscar el nombre de este conocimiento.
    try{
        var elNodo= await Nodo.findById(datos.idNuevoConocimiento);
    }
    catch(error){
        console.log(`error . e: `+error);
        return res.status(400).send('');
    }
    if(!elNodo){
        console.log(`el nodo de conocimiento no existía`);
        return res.status(400).send('');
    }
    
    try{
        await elElemento.conocimientosVinculados.push({idRef: datos.idNuevoConocimiento, nombre: elNodo.nombre});
    }
    catch(error){
        console.log(`error creando el nuevo conocimiento vinculado. e: `+error);
        return res.status(400).send('');
    }
    console.log(`vinculado el elemento ${elElemento.nombre} al nodo de conocimiento ${elNodo.nombre}`);
    try{
        await elProyecto.save();
    }
    catch(error){
        console.log(`error guardando el proyecto tras introducir nuevo conocimiento. e: `+error);
        return res.status(400).send('');
    }
    
    
    
    //console.log(`retornando los conocimientos vinculados: ${elElemento.conocimientosVinculados}`);
    res.send({vinculos:  elElemento.conocimientosVinculados});
});


router.post("/eliminarElemento", async (req, res) => {
    const tipoElemento = req.body.tipoElemento;
    const idElemento = req.body.idElemento;
    const idProyecto = req.body.idProyecto;

    const elProyecto = await Proyecto.findById(idProyecto, "nombre trabajos objetivos");

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
        await elProyecto.ordenarFilasColumnas();
    }
    catch (error) {
        console.log(`error ordenando filas y columnas tras eliminación de elemento ${elProyecto.nombre}. e: ` + error);
    }
    try {
        await elProyecto.save();
    }
    catch (error) {
        console.log(`error guardando el proyecto ${elProyecto.nombre}. e: ` + error);
        return res.status(400).send('');
    }
    res.send({ msj: "ok", infoElementos: elProyecto.getTodosElementosDiagrama() });
});

router.post("/crearTrabajo", async (req, res) => {
    if (!req.body.idProyecto) {
        console.log('no habia datos');
        return res.status(400).send('');
    }
    const idProyecto = req.body.idProyecto;
    const nombreTrabajo = req.body.nombre ? req.body.nombre : "Nuevo trabajo"
    var vinculosViejo = [];
    if (req.body.vinculoDelNuevo) {
        var vinculos = req.body.vinculoDelNuevo;
    }
    else if (req.body.vinculoDelViejo) {
        var vinculosViejo = req.body.vinculoDelViejo;
        console.log(`vinculos para el elemento viejo(${req.body.elementoViejo.id}): ${vinculosViejo}`);
    }

    console.log(`Creando nuevo trabajo con vinculos: ${vinculos}`);
    const infoNuevoTrabajo = {
        nombre: nombreTrabajo,
        vinculos: vinculos
    }
    var idNuevoTrabajo = null;
    //Encontrar el proyecto
    try {
        var elProyecto = await Proyecto.findById(idProyecto, "nombre trabajos objetivos");
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
    retorno = { nuevoTrabajo: nuevoTrabajo };
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

        vinculoParaElViejo = req.body.vinculoDelViejo;
        vinculoParaElViejo.ref = idNuevoTrabajo;
        vinculoParaElViejo.tipoTarget = "trabajo";
        console.log(`añadiendo vinculo ${vinculoParaElViejo} en ${elementoViejo.nombre}`);
        elementoViejo.vinculos.push(vinculoParaElViejo);
        retorno.elementoViejo = elementoViejo;
    }

    //if (req.body.vinculoDelNuevo || req.body.vinculoDelViejo) { //El nuevo elemento entró con vínculos, causando movimiento en los demás.
    console.log(`ordenando filas `);
    try {
        await elProyecto.ordenarFilasColumnas();
    }
    catch (error) {
        console.log('error guardando el proyecto con id ' + idProyecto + "tras crear un elemento error: " + error);
    }
    //}

    try {
        await elProyecto.save();
    }
    catch (error) {
        console.log('error guardando el proyecto con id ' + idProyecto + " error: " + error);
        return res.status(400).send('');
    }
    console.log(`creado trabajo ${nombreTrabajo} con id ${idNuevoTrabajo} en proyecto ${elProyecto.nombre}`);

    retorno.infoElementos = elProyecto.getTodosElementosDiagrama();
    res.send(retorno);

});
router.post("/crearObjetivo", async (req, res) => {
    if (!req.body.idProyecto) {
        console.log('no habia datos');
        return res.status(400).send('');
    }

    const idProyecto = req.body.idProyecto;
    const nombreObjetivo = req.body.nombre ? req.body.nombre : "Nuevo objetivo"
    const vinculos = req.body.vinculos ? req.body.vinculos : [];
    const infoNuevoObjetivo = {
        nombre: nombreObjetivo,
        vinculos: vinculos
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

router.post("/crearVinculo", async (req, res) => {
    const datos = req.body;
    console.log(`creando vinculo en proyecto ${datos.idProyecto} hacia un ${datos.tipoTarget}`);
    console.log(`tipo ${datos.tipoVinculo}`);

    try {
        var elProyecto = await Proyecto.findById(datos.idProyecto, "trabajos objetivos");
    }
    catch (error) {
        console.log(`error buscando el proyecto con id ${datos.idProyecto}. e: ` + error);
        return res.status(400).send('');
    }

    console.log(`encontrado el proyecto ${elProyecto.nombre}`);
    try {
        elSource = elProyecto.getTodosElementosDiagrama().id(datos.idSource);
    }
    catch (error) {
        console.log(`error en getTodosElementosDiagrama. e: ` + error);
    }

    //Verificar si el vinculo ya existe.
    for (var i = 0; i < elSource.vinculos.length; i++) {
        let elVinculo = elSource.vinculos[i];
        if (elVinculo.ref == datos.idTarget) {
            console.log(`vinculo repetido eliminando`);
            elSource.vinculos[i].remove();
        }
    }

    //Verificar que no se generen vínculos en bucle.
    if (await detectarVinculoFuerte(datos.idProyecto, datos.idTarget, datos.idSource)) {
        console.log('error: Tenemos un bucle de vinculo fuerte.');
        return res.status(400).send('');
    }

    //Todo bien, introducir el vinculo
    console.log(`todo bien. Introduciendo el nuevo vinculo en ${elSource.nombre}. Apunta al ${datos.tipoTarget}: ${datos.idTarget}`);

    const nuevoVinculo = elSource.vinculos.create({
        ref: datos.idTarget,
        tipoVinculo: datos.tipoVinculo,
        tipoTarget: datos.tipoTarget
    });
    elSource.vinculos.push(nuevoVinculo);

    try {
        await elProyecto.ordenarFilasColumnas();
    }
    catch (error) {
        console.log(`error ordenando filas y columnas tras creación de vínculo. e: ` + error);
    }

    try {
        await elProyecto.save();
    }
    catch (error) {
        console.log(`error guardando el proyecto con nuevo vinculo. e: ` + error);
        return res.status(400).send('');
    }
    res.send({ msjU: "Vinculo creado", infoElementos: elProyecto.getTodosElementosDiagrama() });

});

router.post("/desconectarVinculoBySourceTarget", async (req, res) => {

    const datos = req.body;
    try {
        var elProyecto = await Proyecto.findById(datos.idProyecto, "trabajos objetivos");
    }
    catch (error) {
        console.log(`error buscando proyecto para desconectar vínculo. e: ` + error);
        return res.status(400).send('');
    }
    viejosElementos = elProyecto.getTodosElementosDiagrama();

    var source = viejosElementos.id(datos.idSource);
    for (var i in source.vinculos) {
        ref = source.vinculos[i].ref;
        if (ref == datos.idTarget) {
            console.log(`vinculo encontrado. Eliminar`);
            source.vinculos[i].remove();
        }

    }
    try {
        await elProyecto.ordenarFilasColumnas();
    }
    catch (error) {
        console.log(`error ordenando filas y columnas tras eliminacion de vínculo by target source. Error: ${error}`);
    }
    try {
        elProyecto.save();
    }
    catch (error) {
        console.log(`error salvando el proyecto tra la eliminación del vínculo. e: ` + error);
        return res.status(400).send('');
    }
    //elementosCambiados=elProyecto.encontrarElementosCambiados(viejosElementos);

    res.send({ msjU: "Desconectado", infoElementos: elProyecto.getTodosElementosDiagrama() });
});

module.exports = router;
