const mongoose = require("mongoose");
const Nodo = require("./comunaBuild/model/atlas/Nodo").ModeloNodo
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
var anchoCeldas = 250;
var pasoBase = 10;
const umbralDistancia = 170;

//setInterval(() => posicionar(), 5000);
 iniciar();

async function iniciar() {
    await iniciarMongoose();

    try {
        var todosNodos = await Nodo.find({}).exec();
    }
    catch (error) {
        console.log(`error getting todos nodos. e: ` + error);
        return;
    }

    todosNodos.forEach(nodo=>{
        var nodosHuerfanos=0;
        var indexHuerfanos=[];
        nodo.vinculos.forEach((vinculo, index)=>{
            if(!todosNodos.some(n=>n.id==vinculo.idRef)){
                nodosHuerfanos++;
                indexHuerfanos.push(index);
            }
        });
        if(nodosHuerfanos>0){
            console.log(`El nodo ${nodo.nombre} tiene ${nodosHuerfanos} nodos huerfanos de ${nodo.vinculos.length}`);
            console.log(`Indexs: ${indexHuerfanos}`);
            indexHuerfanos=indexHuerfanos.sort((a, b)=>b-a);
            console.log(`Ordenado: ${indexHuerfanos}`);
            indexHuerfanos.forEach(i=>{
                console.log(`   Eliminando el ${i}`);
                nodo.vinculos.splice(i, 1);
            })
        }
    })

    while(true){
        await posicionar(todosNodos);
        await sleep(5000);
    }

    
}

async function posicionar(todosNodos){
    console.log(`posicionando ${todosNodos.length} nodos`);

    matrizNodos = {};

    //Confirmar coords
    todosNodos.forEach((nodo) => {

        if (!nodo.coords.x) {
            nodo.coords.x = nodo.coordsManuales.x;
        }

        if (!nodo.coords.y) {
            nodo.coords.y = nodo.coordsManuales.y
        }
        // nodo.coords.x=nodo.coordsManuales.x;
        // nodo.coords.y=nodo.coordsManuales.y

        var celda = getCelda(nodo.coords);
        celdaX = celda.x;
        celdaY = celda.y

        if (!matrizNodos[celdaX]) {
            matrizNodos[celdaX] = {};
            matrizNodos[celdaX][celdaY] = [];
        } else {
            if (!matrizNodos[celdaX][celdaY]) {
                matrizNodos[celdaX][celdaY] = [];
            }
        }
        matrizNodos[celdaX][celdaY].push(nodo.id);
    });


    //Get centros de masa
    todosNodos.forEach(nodo => {
        let vinculos = nodo.vinculos;
        if (vinculos.length > 0) {
            let nodosVinculos = todosNodos.filter(n => vinculos.map(v => v.idRef).includes(n.id));
            nodo.centroMasa = getCentroMasa(nodosVinculos);
        }
        else {
            nodo.centroMasa = nodo.coords;
        }
    });


    //Caminar hacia el centro de masa
    todosNodos.forEach(nodo => {
        //if (nodo.nombre=='Combinar dos ecuaciones con dos incógnitas') {
        if(true){
            console.log(`[[[[[[[[[[[[[[[[${nodo.nombre}]]]]]]]]]]]]]]]]`);
            console.log(`${nodo.nombre} (${nodo.coords.x}, ${nodo.coords.y}) apunta hacia (${nodo.centroMasa.x}, ${nodo.centroMasa.y})`);            

        
            // var angulo = Math.atan(disty / distx);
            // if (disty < 0 && distx < 0) angulo += Math.PI;
            // if (distx < 0 && disty >= 0) angulo += Math.PI;

            // var deltax = paso * Math.cos(angulo);
            // var deltay = paso * Math.sin(angulo);

            // if(deltax>distx)deltax=distx;
            // if(deltay>disty)deltay=disty;

            
            // let actualColision=checkColision(nodo.coords, matrizNodos, todosNodos, [nodo.id]);
            // let nuevaColision=checkColision({ x: nodo.coords.x + deltax, y: nodo.coords.y + deltay }, matrizNodos, todosNodos, [nodo.id]);
            
            let {paso, angulo}=decidirMovimiento(nodo, matrizNodos, todosNodos);
            nodo.angulo=angulo;
            if (Math.abs(paso.x)>0 || Math.abs(paso.y)>0) {
                console.log(`CAMINANDO`);
                nodo.stuck = false;
                let viejoCelda = getCelda(nodo.coords);
                nodo.coords.x = Math.round(nodo.coords.x + paso.x);
                nodo.coords.y = Math.round(nodo.coords.y + paso.y);
                let nuevoCelda = getCelda(nodo.coords);

                if (nuevoCelda.x != viejoCelda.x || nuevoCelda.y != viejoCelda.y) {
                    console.log(`Cambio de celda de ${nodo.nombre} - ${nodo.id}`);
                    let indexN = matrizNodos[viejoCelda.x][viejoCelda.y].indexOf(nodo.id);
                    if (indexN > -1) {
                        matrizNodos[viejoCelda.x][viejoCelda.y].splice(indexN, 1);
                    } else {
                        console.log(`¡EL NODO NO ESTABA EN SU CELDA OMG!`);
                        console.log(`La celda era (${viejoCelda.x}, ${viejoCelda.y}) con ${matrizNodos[viejoCelda.x][viejoCelda.y]}`);
                    }
                    console.log(`Cambiandose a la celda (${nuevoCelda.x}, ${nuevoCelda.y})`);
                    if (!matrizNodos[nuevoCelda.x]) matrizNodos[nuevoCelda.x] = {}
                    if (!matrizNodos[nuevoCelda.x][nuevoCelda.y]) matrizNodos[nuevoCelda.x][nuevoCelda.y] = []
                    matrizNodos[nuevoCelda.x][nuevoCelda.y].push(nodo.id);
                }
            }
            else {
                console.log(`STUCK`);
                nodo.stuck = true;
            }
            nodo.puntaje=Math.round(getPuntaje(nodo, nodo.coords, matrizNodos, todosNodos));
        }

        
    })

    todosNodos.forEach(async (nodoGuardable) => {
        try {
            await nodoGuardable.save();
        }
        catch (error) {
            console.log(`Error guardando nodo: ${error}`);
        }
    })
}

function getCentroMasa(nodos) {
    var sumatoriaX = 0, sumatoriaY = 0;

    nodos.forEach(nodo => {
        sumatoriaX += nodo.coords.x
        sumatoriaY += nodo.coords.y
    });

    var promedioX = sumatoriaX / nodos.length;
    var promedioY = sumatoriaY / nodos.length;

    return {
        x: Math.round(promedioX),
        y: Math.round(promedioY)
    }
}

function checkColision(posicion, matriz, todosNodos, nodo, empujar) {

    //console.log(`Checking colision de la posición ${JSON.stringify(posicion)}`);
    

    var celda = getCelda(posicion);

    celdaX = celda.x;
    celdaY = celda.y;

    var nodosCercanos = matriz[celdaX] && matriz[celdaX][celdaY]?matriz[celdaX][celdaY]:[];
    nodosCercanos = nodosCercanos.concat(matriz[celdaX + anchoCeldas] && matriz[celdaX + anchoCeldas][celdaY] ? matriz[celdaX + anchoCeldas][celdaY]:[]).concat(matriz[celdaX + anchoCeldas] && matriz[celdaX + anchoCeldas][celdaY + anchoCeldas] ? matriz[celdaX + anchoCeldas][celdaY + anchoCeldas]:[]).concat(matriz[celdaX + anchoCeldas] && matriz[celdaX + anchoCeldas][celdaY - anchoCeldas] ? matriz[celdaX + anchoCeldas][celdaY - anchoCeldas]:[])
       .concat(matriz[celdaX] && matriz[celdaX][celdaY+anchoCeldas] ? matriz[celdaX][celdaY+anchoCeldas]:[]).concat(matriz[celdaX] && matriz[celdaX][celdaY-anchoCeldas] ? matriz[celdaX][celdaY-anchoCeldas]:[])
       .concat(matriz[celdaX - anchoCeldas] && matriz[celdaX - anchoCeldas][celdaY] ? matriz[celdaX - anchoCeldas][celdaY]:[]).concat(matriz[celdaX - anchoCeldas] && matriz[celdaX - anchoCeldas][celdaY + anchoCeldas] ? matriz[celdaX - anchoCeldas][celdaY + anchoCeldas]:[]).concat(matriz[celdaX - anchoCeldas] && matriz[celdaX - anchoCeldas][celdaY - anchoCeldas] ? matriz[celdaX - anchoCeldas][celdaY - anchoCeldas]:[])
    

    //console.log(`${nodosCercanos.length} nodos cercanos`);
    nodosCercanos = todosNodos.filter(n => nodosCercanos.includes(n.id) && n.id!=nodo.id)
    var colision = 0;
    // console.log(`Colision: `);
    nodosCercanos.forEach(nodoCercano => {
        //console.log(`Checking cercanía con ${JSON.stringify(nodoCercano)}`);
        
        //console.log(`${nodoCercano.nombre}`);
        let umbralDistanciaNodo=umbralDistancia+(Math.max(nodoCercano.vinculos.length, nodo.vinculos.length)*5);

        let distanciaNodoCercano = Math.sqrt((Math.pow(nodoCercano.coords.x - posicion.x, 2)) + (Math.pow(nodoCercano.coords.y - posicion.y, 2)));        
        let factorDivisor=1/umbralDistanciaNodo;
        let estaColision=1/(factorDivisor*distanciaNodoCercano);
        if(estaColision>1)colision +=estaColision;
        // console.log(`+${estaColision} - (${nodoCercano.nombre})`);
    });
    // console.log(`= ${colision}`);
    return colision;

}

function getCelda(posicion) {
    var celdaX = posicion.x - (posicion.x % anchoCeldas);
    if (posicion.x < 0) celdaX -= anchoCeldas;
    var celdaY = posicion.y - (posicion.y % anchoCeldas);
    if (posicion.y < 0) celdaY -= anchoCeldas;
    return { x: celdaX, y: celdaY }
}

function decidirMovimiento(nodo, matriz, todosNodos){
    const distx = nodo.centroMasa.x - nodo.coords.x;
    const disty = nodo.centroMasa.y - nodo.coords.y;
    console.log(`Puntajes: `);
    const puntajeActual=getPuntaje(nodo, nodo.coords, matriz, todosNodos, false);
    var anguloCentroMasa=0
    if (distx != 0 || disty != 0) {
        anguloCentroMasa = Math.atan(disty / distx);
        if (disty < 0 && distx < 0) anguloCentroMasa += Math.PI;
        if (distx < 0 && disty >= 0) anguloCentroMasa += Math.PI;
    }    

    //Probar en dirección de centro masa

    var puntajeMinimo=100000;
    var mejorPaso={
        x:0,
        y:0,
    }
    var mejorAngulo=0;
    var mejorIndex=0;
    console.log(`Actual: ${puntajeActual}`);
    for(var i=0; i<5;i++){
        let angulo=anguloCentroMasa+(((Math.PI*2)/5)*i);
        let deltax = pasoBase * Math.cos(angulo);
        let deltay = pasoBase * Math.sin(angulo);

        if(i==0){
            if(Math.abs(deltax)>Math.abs(distx))deltax=distx;
            if(Math.abs(deltay)>Math.abs(disty))deltay=disty;
        }

        let nuevaPos={
            x:nodo.coords.x+deltax,
            y:nodo.coords.y+deltay
        }

        let puntaje=getPuntaje(nodo, nuevaPos, matriz, todosNodos, true);
        console.log(`Angulo número ${i} - ${puntaje}`);
        if(puntaje<puntajeMinimo){
            console.log(`-------`);
            puntajeMinimo=puntaje;
            mejorAngulo=angulo;
            mejorPaso={
                x:deltax,
                y:deltay
            }
            mejorIndex=i;
        }
    }

    if(puntajeActual<=puntajeMinimo){
        //No vale la pena moverse
        console.log(`El puntaje actual es ${puntajeActual} vs puntaje mínimo de ${puntajeMinimo}`);
        return {
            angulo:0,
            paso:{x:0, y:0}
        }
    }

    console.log(`Se caminara hacia el ángulo número ${mejorIndex} con vector (${mejorPaso.x}, ${mejorPaso.y})`);
    return {
        paso:mejorPaso, angulo:mejorAngulo
    }
}

function getPuntaje(nodo, posicion, matriz, todosNodos, empujando){
    var colision=checkColision(posicion, matriz, todosNodos, nodo, empujando);
    
    const distx = nodo.centroMasa.x - posicion.x;
    const disty = nodo.centroMasa.y - posicion.y;

    var distancia=Math.sqrt(Math.pow(distx, 2) + Math.pow(disty, 2));
    const umbralDistanciaNodo=umbralDistancia+(nodo.vinculos.length*5);    

    var puntajeDistancia=Math.pow(distancia, 2)/147275;
    if(nodo.vinculos.length==1){
        console.log(`***^***`);
        puntajeDistancia=distancia<=umbralDistanciaNodo ? 0 : Math.pow(distancia, 2)/47275
    }
    console.log(`Distancia: ${distancia}`);
    console.log(`Puntajes: Distancia: ${puntajeDistancia}, Colision: ${colision}`);

    puntaje=puntajeDistancia+colision;
    return puntaje;
}

function sleep(ms) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  }   