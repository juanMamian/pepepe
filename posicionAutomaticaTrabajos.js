const mongoose = require("mongoose");

const Trabajo = require("./comunaBuild/model/Trabajo").ModeloTrabajo
const Objetivo = require("./comunaBuild/model/Objetivo").ModeloObjetivo
const dotenv = require("dotenv");
dotenv.config();


mongoose.set('useFindAndModify', false);
const iniciarMongoose = async () => {
    try {
        await mongoose.connect(
            process.env.DB_CONNECT,
            {
                useNewUrlParser: true,
                useUnifiedTopology: true
            }
        );
    } catch (error) {
        console.log(`Error conectando con la base de datos: E:${error}`);
    }
}



const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
    console.log(`¡Base de datos conectada!`);
});
const anchoCeldas = 400;
const nodoDeInteres = null;

iniciar();

async function iniciar() {


    await iniciarMongoose();

    try {
        var todosObjetivos = await Objetivo.find({}).exec();
        var todosTrabajos = await Trabajo.find({}).exec();

        var todosNodos = todosObjetivos.concat(todosTrabajos);
        console.log(`Total: ${todosNodos.length} nodos`);
    }
    catch (error) {
        console.log(`error getting todos nodos. e: ` + error);
        return;
    }

    filtrarVinculosHuerfanos(todosNodos);
    
    //Iniciar coordenadas
    todosNodos.forEach(nodo => {
        if (!nodo.autoCoords.x) nodo.autoCoords.x = nodo.coords.x;
        if (!nodo.autoCoords.y) nodo.autoCoords.y = nodo.coords.y;
    });
    var celdas = setCeldas(todosNodos);
    // console.log(`Hay ${nodosCompletados.length} nodos completados`);

    while (true) {
        await posicionar(todosNodos, celdas);
        console.log(`Uploading...`);
        await uploadNodos(todosNodos);
        await sleep(5000);
    }


}

function posicionar(todosNodos, celdas) {
    todosNodos = todosNodos.sort((a, b) => b.peso - a.peso);
    todosNodos.forEach(nodo => {
        setFuerzaCentroMasa(nodo, todosNodos);
        setFuerzaColision(nodo, celdas, todosNodos);
        moverNodo(nodo, celdas);        
    });
}


function moverNodo(nodo, celdas){

    const viejaCelda={
        x: getCeldaH(nodo.autoCoords),
        y: getCeldaV(nodo.autoCoords),
    }

    nodo.autoCoords.x=Math.round(nodo.autoCoords.x+(nodo.fuerzaCentroMasa.fuerza*Math.cos(nodo.fuerzaCentroMasa.direccion)) + (nodo.fuerzaColision.fuerza*Math.cos(nodo.fuerzaColision.direccion)));
    nodo.autoCoords.y=Math.round(nodo.autoCoords.y+(nodo.fuerzaCentroMasa.fuerza*Math.sin(nodo.fuerzaCentroMasa.direccion)) + (nodo.fuerzaColision.fuerza*Math.sin(nodo.fuerzaColision.direccion)));
    
    const nuevaCelda={
        x: getCeldaH(nodo.autoCoords),
        y: getCeldaV(nodo.autoCoords),
    };

    if(viejaCelda.x!=nuevaCelda.x || viejaCelda.y != nuevaCelda.y){//Hay cambio de celda
        //Retirar el nodo de la vieja celda
        const indexN=celdas[viejaCelda.x][viejaCelda.y].indexOf(nodo.id);
        if(indexN>-1){
            celdas[viejaCelda.x][viejaCelda.y].splice(indexN, 1);
        }
        else{
            console.log(`Alerta!! El nodo no estaba en su celda`);
        }

        //Introducir el nodo a la nueva celda
        if(!celdas[nuevaCelda.x]){
            celdas[nuevaCelda.x]={}
        }
        if(!celdas[nuevaCelda.x][nuevaCelda.y]){
            celdas[nuevaCelda.x][nuevaCelda.y]=[];
        }
        const indexM=celdas[nuevaCelda.x][nuevaCelda.y].indexOf(nodo.id);
        if(indexM===-1){
            celdas[nuevaCelda.x][nuevaCelda.y].push(nodo.id);
        }
        else{
            console.log(`Alerta!!, el nodo estaba anotado en la nueva celda antes de entrar a ella`);
        }
    }
    
}

function setFuerzaColision(nodo, celdas, todosNodos) {
    const celdaX = getCeldaH(nodo.autoCoords);
    const celdaY = getCeldaV(nodo.autoCoords);
    var celdasRelevantes = [
        { x: celdaX - 1, y: celdaY - 1 }, { x: celdaX, y: celdaY - 1 }, { x: celdaX + 1, y: celdaY - 1 },
        { x: celdaX - 1, y: celdaY }, { x: celdaX, y: celdaY }, { x: celdaX + 1, y: celdaY },
        { x: celdaX - 1, y: celdaY + 1 }, { x: celdaX, y: celdaY + 1 }, { x: celdaX + 1, y: celdaY + 1 },
    ];
    if (nodo.nombre === nodoDeInteres) {
        console.log(`Setting fuerzaColision de ${nodo.nombre} en las coords: ${JSON.stringify(nodo.autoCoords)}`);
    }
    var idsNodosRelevantes = [];
    celdasRelevantes.forEach(celda => {                
        if (celdas[celda.x] && celdas[celda.x][celda.y]) {
            idsNodosRelevantes = idsNodosRelevantes.concat(celdas[celda.x][celda.y]);
        }
    });

    //Retirar el propio nodo de la lista.
    const indexN = idsNodosRelevantes.indexOf(nodo.id);
    if (indexN > -1) {
        idsNodosRelevantes.splice(indexN, 1);
    }

    var nodosRelevantes = todosNodos.filter(n => idsNodosRelevantes.includes(n.id));
    if (nodosRelevantes.length > 0) {
        var sumaX = nodosRelevantes.reduce((sum, n) => sum + n.autoCoords.x, 0);
        var centroX = sumaX / nodosRelevantes.length;

        var sumaY = nodosRelevantes.reduce((sum, n) => sum + n.autoCoords.y, 0);
        var centroY = sumaY / nodosRelevantes.length;
        
        centroColision={
            x : Math.round(centroX),
            y : Math.round(centroY)
        }
    }
    else {
        centroColision = { x: nodo.autoCoords.x, y: nodo.autoCoords.y }
    }
        
    var coordsFuerza = {
        x: nodo.autoCoords.x - centroColision.x,
        y: nodo.autoCoords.y - centroColision.y
    }

    const distanciaUnidad=300; //Distancia en la cual la fuerza de colision se reduce a 1.
    const factorFuerza=1/distanciaUnidad;
    var fuerzaPolar = cartesian2Polar(coordsFuerza.x, coordsFuerza.y);
    if(nodosRelevantes.length>0){
        fuerzaPolar.fuerza = nodosRelevantes.length/(factorFuerza*fuerzaPolar.fuerza);
    }
    nodo.fuerzaColision=fuerzaPolar;
}

function setFuerzaCentroMasa(nodo, todosNodos) {
    var idsRequeridos = nodo.vinculos.map(v => v.idRef);

    var idsRequirientes = todosNodos.filter(n => {
        var idsRequeridos = n.vinculos.filter(v => v.tipo = "requiere").map(v => v.idRef);
        return idsRequeridos.includes(nodo.id);
    }).map(n => n.id);

    var idsVinculos = idsRequeridos.concat(idsRequirientes);
    if (idsVinculos.length > 0) {
        var nodosVinculados = todosNodos.filter(n => idsVinculos.includes(n.id));
        var sumaX = nodosVinculados.reduce((sum, n) => sum + n.autoCoords.x, 0);
        var centroX = sumaX / nodosVinculados.length;

        var sumaY = nodosVinculados.reduce((sum, n) => sum + n.autoCoords.y, 0);
        var centroY = sumaY / nodosVinculados.length;

        nodo.centroMasa.x = Math.round(centroX);
        nodo.centroMasa.y = Math.round(centroY);
    }
    else {
        nodo.centroMasa.x = nodo.autoCoords.x;
        nodo.centroMasa.y = nodo.autoCoords.y;
    }
    nodo.peso = idsVinculos.length;

    var coordsFuerza = {
        x: nodo.centroMasa.x - nodo.autoCoords.x,
        y: nodo.centroMasa.y - nodo.autoCoords.y
    }

    var fuerzaPolar = cartesian2Polar(coordsFuerza.x, coordsFuerza.y);
    fuerzaPolar.fuerza = fuerzaPolar.fuerza / 2;

    nodo.fuerzaCentroMasa = fuerzaPolar;
}


function filtrarVinculosHuerfanos(todosNodos) {
    todosNodos.forEach(nodo => {
        let idsVinculos = nodo.vinculos.map(v => v.idRef);
        var indexHuerfanos = [];
        idsVinculos.forEach((idV, index) => {
            if (!todosNodos.some(n => n.id == idV)) {//Ningún nodo está apuntado por este idRef
                indexHuerfanos.push(index)
            }
        })

        if (indexHuerfanos.length > 0) {
            console.log(`Encontrados ${indexHuerfanos.length} nodos huerfanos en el nodo ${nodo.nombre}. Eliminando`);
            indexHuerfanos = indexHuerfanos.sort((a, b) => b - a);
            indexHuerfanos.forEach(i => {
                nodo.vinculos.splice(i, 1);
            })
        }

    });
}

function setCeldas(todosNodos) {
    celdas = {};
    todosNodos.forEach(nodo => {
        nodo.celdaH = getCeldaH(nodo.autoCoords);
        nodo.celdaV = getCeldaV(nodo.autoCoords);

        if (!celdas[nodo.celdaH]) {
            celdas[nodo.celdaH] = {};
        }
        if (!celdas[nodo.celdaH][nodo.celdaV]) {
            celdas[nodo.celdaH][nodo.celdaV] = []
        }
        celdas[nodo.celdaH][nodo.celdaV].push(nodo.id)
    });
    return celdas;
}

function getCeldaH(coords) {
    celda = Math.floor(coords.x / anchoCeldas);
    return celda;
}

function getCeldaV(coords) {
    celda = Math.floor(coords.y / anchoCeldas);
    return celda;
}

async function uploadNodos(todosNodos) {
    todosNodos.forEach(async function (nodo) {
        try {
            await nodo.save();
        }
        catch (error) {
            console.log(`error guardando el nodo. e: ` + error);
            return res.status(400).send('');
        }
    })
}


function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

function cartesian2Polar(x, y) {
    distance = Math.sqrt(x * x + y * y)
    radians = Math.atan2(y, x) //This takes y first
    polarCoor = { fuerza: distance, direccion: radians }
    return polarCoor
}