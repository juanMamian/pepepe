const mongoose=require("mongoose");
const multer=require("multer");
const upload=multer();
const router=require("express").Router();
const Nodo=require("../../model/atlas/Nodo").modeloNodo;
const gestionAtlas=require("../../gestionDatos/atlas");


router.post("/todosNombres", async function(req, res){
    try{
        var elGrafo=await gestionAtlas.getGrafo();        
        var todosNodos=await Nodo.find({}, "nombre vinculos coordx coordy ubicado").exec();
    }
    catch(error){
        console.log(`error fetching todos los nodos. e: `+error);
        return res.status(400).send('');
    }
    
    res.send({nodos: todosNodos, grafo: elGrafo});
});

router.post("/crear", async function(req, res){
    console.log(`creando un nodo`);
    const nuevoNodo=new Nodo({
        nombre: "Nuevo nodo de conocimiento"
    });

    if(req.body.vinculo){
        console.log(`creando vinculo con la informacion: ${JSON.stringify(req.body)}`);
        var vinculo=req.body.vinculo;
        const idRef=vinculo.idRef;

        try{
            var otroNodo=await Nodo.findById(idRef, "nombre vinculos");
        }
        catch(error){
            console.log(`error . e: `+error);
            return res.status(400).send('');
        }
        var otroVinculo= Object.assign({},vinculo);
        otroVinculo.idRef=nuevoNodo._id;
     
        if(vinculo.rol==="target"){
            otroVinculo.rol="source";
        }
        else{
            otroVinculo.rol="target"
        }        
        
        otroNodo.verificarVinculo(otroVinculo.idRef, true);
        otroNodo.vinculos.push(otroVinculo);

        try{
            await otroNodo.save();  
        }
        catch(error){
            console.log(`error guardando el otro nodo . e: `+error);
            return res.status(400).send('');
        }

        nuevoNodo.vinculos=new Array();
        nuevoNodo.vinculos.push(vinculo);
    }

    try{
        await nuevoNodo.save();
    }
    catch(error){
        console.log(`error guardando el nuevo nodo. e: `+error);
        return res.status(400).send('');
    }
    await gestionAtlas.posicionarNodos();
    res.send({nuevoNodo:nuevoNodo});
});

router.post("/renombrar", async function(req, res){
    datos=req.body;
    
    try{
        var elNodo=await Nodo.findById(datos.idNodo, "nombre");
    }
    catch(error){
        console.log(`error fetching el nodo para cambiar nombre. e: `+error);
        return res.status(400).send('');
    }
    console.log(`cambiando nombre de ${elNodo.nombre} a ${datos.nuevoNombre}`);
    
    elNodo.nombre=datos.nuevoNombre;
    try{
        await elNodo.save();
    }
    catch(error){
        console.log(`error salvando el nodo tras cambiar el nombre. e: `+error);
        return res.status(400).send('');
    }
    res.send({nodo:elNodo});
});

router.post("/updateIcono",upload.single("nuevoIcono"), async function(req, res){

    try{
        var elNodo=await Nodo.findById(req.body.idNodo, "nombre icono");
    }
    catch(error){
        console.log(`error buscando el nodo para cambio de icono. e: `+error);
        return res.status(400).send('');
    }

    console.log(`updating icono del nodo ${elNodo.nombre} con id ${req.body.idNodo}`);
   // console.log(`info en la request: files: ${req.files}, otros: ${req.body}`);
   elNodo.icono=req.file.buffer;

   try{
       await elNodo.save();
   }
   catch(error){
       console.log(`error guardando el nodo después de subir imagen. e: `+error);
       return res.status(400).send('');
   }
    res.send({resultado: "ok"});
});

router.post("/vincularBySourceTarget", async function(req, res){
    datos=req.body;

    try{
        var nodoSource=await Nodo.findById(datos.idSource, "vinculos");
        var nodoTarget=await Nodo.findById(datos.idTarget, "vinculos");
    }
    catch(error){
        console.log(`error consiguiendo los nodos para crear el vínculo . e: `+error);
        return res.status(400).send('');
    }

    //Buscar y eliminar vinculos previos entre estos dos nodos.
    for (var vinculo of nodoSource.vinculos){
        if(vinculo.idRef==datos.idTarget){
            vinculo.remove();
            console.log(`encontrado un vinculo viejo en el Source. Eliminando`);
        }
    }
    for (var vinculo of nodoTarget.vinculos){
        if(vinculo.idRef==datos.idSource){
            vinculo.remove();
            console.log(`encontrado un vinculo viejo en el target. Eliminando`);
        }
    }
    const vinculoSourceTarget={
        idRef:datos.idTarget,
        rol:"source"
    }
    const vinculoTargetSource={
        idRef:datos.idSource,
        rol:"target"
    }
    nodoSource.vinculos.push(vinculoSourceTarget);
    nodoTarget.vinculos.push(vinculoTargetSource);
    try{
        await nodoSource.save();
        await nodoTarget.save();
    }
    catch(error){
        console.log(`error guardando los nodos despues de la creacion de vinculos. e: `+error);
        return res.status(400).send('');
    }
    var resPosicionar=await gestionAtlas.posicionarNodos(); //Viene con nombre, vinculos, coords
    var nuevasPosicionesNodos=resPosicionar.nodos;
    var grafo=resPosicionar.grafo;
    
    console.log(`vinculo entre ${datos.idSource} y ${datos.idTarget} creado`);
    res.send({msjU: "Ok", posNodos:nuevasPosicionesNodos, grafo:grafo});

});

router.post("/desvincularDos", async function(req, res){
    const datos=req.body;
    console.log(`desvinculando ${datos.idUno} de ${datos.idOtro}`);
    try{
        var elUno=await Nodo.findById(datos.idUno, "nombre vinculos");
        var elOtro=await Nodo.findById(datos.idOtro, "nombre vinculos");
    }
    catch(error){
        console.log(`error . e: `+error);
        return res.status(400).send('');
    }
    
    var eliminarUno = elUno.vinculos.find(v=>v.idRef==""+datos.idOtro);
    var eliminarOtro = elOtro.vinculos.find(v=>v.idRef==""+datos.idUno);

    console.log(`Uno: ${elUno.vinculos}`);
    console.log(`Otro: ${elOtro.vinculos}`);
    for(var vinculo of elUno.vinculos){
        if(vinculo.idRef==datos.idOtro)vinculo.remove();
    }
    for(var vinculo of elOtro.vinculos){
        if(vinculo.idRef==datos.idUno)vinculo.remove();
    }

    console.log(`Uno: ${elUno.vinculos}`);
    console.log(`Otro: ${elOtro.vinculos}`);

    try{
        await elUno.save();
        await elOtro.save();
    }
    catch(error){
        console.log(`error . e: `+error);
        return res.status(400).send('');
    }
    var resPosicionar=await gestionAtlas.posicionarNodos(); //Viene con nombre, vinculos, coords
    var nuevasPosicionesNodos=resPosicionar.nodos;
    var grafo=resPosicionar.grafo;
    
    res.send({msjU: "Ok", posNodos:nuevasPosicionesNodos, grafo:grafo});


});

router.get("/iconos/:id", async function(req, res){
    const idNodo=req.params.id;
    try{
        var elNodo=await Nodo.findById(idNodo, "icono");
    }
    catch(error){
        console.log(`error buscando el nodo con icono. e: `+error);
        return res.status(400).send('');
    }
    res.set('Content-Type', 'image/png');
    res.send(elNodo.icono);
});
module.exports=router;