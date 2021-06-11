const mongoose = require("mongoose");
const Objetivo = require("./comunaBuild/model/Objetivo").ModeloObjetivo
const Trabajo = require("./comunaBuild/model/Trabajo").ModeloTrabajo
const Proyecto = require("./comunaBuild/model/Proyecto").ModeloProyecto
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
var anchoCeldas = 520;
var pasoBase = 30;
const umbralDistancia = 500;
const stepRadial= 500; // Distancia entre cada nivel concentrico

//setInterval(() => posicionar(), 5000);
 iniciar();

async function iniciar() {
    await iniciarMongoose();

    try {
        var todosProyectos= await Proyecto.find({}).exec();
        var todosObjetivos = await Objetivo.find({}).exec();
        var todosTrabajos = await Trabajo.find({}).exec();
        var todosNodos=todosObjetivos.concat(todosTrabajos);
    }
    catch (error) {
        console.log(`error getting todos nodos. e: ` + error);
        return;
    }

    
    //Limpiar de nodos huerfanos
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
            console.log(`El nodo ${nodo.nombre} tiene ${nodosHuerfanos} vinculos huerfanos de ${nodo.vinculos.length}`);
            console.log(`Indexs: ${indexHuerfanos}`);
            indexHuerfanos=indexHuerfanos.sort((a, b)=>b-a);
            console.log(`Ordenado: ${indexHuerfanos}`);
            indexHuerfanos.forEach(i=>{
                console.log(`   Eliminando el ${i}`);
                nodo.vinculos.splice(i, 1);
            })
        }
    })


    //Crear la lista de vinculos reales
    todosNodos.forEach(nodo=>{
        let nodosRequirientes=todosNodos.filter(tn=>tn.vinculos.map(v=>v.idRef).includes(nodo.id));
        nodo.todosVinculos=nodo.vinculos.concat(nodosRequirientes.map(req=>{ return {idRef:req.id, tipo:'requerido'}  })  );
    })    


    while(true){
        setCentrosProyectos(todosProyectos, todosNodos);
        setPosicionPolar(todosNodos, todosProyectos);
        setCentrosMasa(todosNodos, todosProyectos);
        await posicionar(todosNodos, todosProyectos);
        await sleep(5000);
    }

    
}

async function posicionar(todosNodos, todosProyectos){
    console.log(`posicionando ${todosNodos.length} nodos`);
    matrizNodos = {};
    todosNodos.forEach((nodo) => {       

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

    //Caminar hacia el centro de masa
    todosNodos.forEach(nodo => {
        //if (nodo.id=='60c111266aa1611e1de80bdc') {
        if(true){
            console.log(`[[[[[[[[[[[[[[[[${nodo.nombre}]]]]]]]]]]]]]]]]`);
            console.log(`${nodo.nombre} (${nodo.coords.x}, ${nodo.coords.y}) apunta hacia (${nodo.centroMasa.x}, ${nodo.centroMasa.y})`);            
        
            
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
    todosProyectos.forEach(async (proyectoGuardable) => {
        try {
            await proyectoGuardable.save();
        }
        catch (error) {
            console.log(`Error guardando proyecto: ${error}`);
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

function getDireccionPromedio(nodos){
    if(nodos.length<1)return 0;
    var sum=0;    
    console.log(`Geting direccion promedio entre ${nodos.length} nodos`);
    nodos.forEach(nodo=>{
        let angulo=nodo.coordsPolares.direccion;
        if(angulo>Math.PI){
            angulo=(Math.PI-angulo);
        };
        sum+=angulo;
    })
    console.log(`Direccion promedio: ${sum/nodos.length}`);
    return sum/nodos.length;
}

function checkColision(posicion, matriz, todosNodos, nodo, empujar) {

    //console.log(`Checking colision de la posición ${JSON.stringify(posicion)}`);    

    var celda = getCelda(posicion);

    celdaX = celda.x;
    celdaY = celda.y;

    var idsNodosCercanos = matriz[celdaX] && matriz[celdaX][celdaY]?matriz[celdaX][celdaY]:[];
    idsNodosCercanos = idsNodosCercanos.concat(matriz[celdaX + anchoCeldas] && matriz[celdaX + anchoCeldas][celdaY] ? matriz[celdaX + anchoCeldas][celdaY]:[]).concat(matriz[celdaX + anchoCeldas] && matriz[celdaX + anchoCeldas][celdaY + anchoCeldas] ? matriz[celdaX + anchoCeldas][celdaY + anchoCeldas]:[]).concat(matriz[celdaX + anchoCeldas] && matriz[celdaX + anchoCeldas][celdaY - anchoCeldas] ? matriz[celdaX + anchoCeldas][celdaY - anchoCeldas]:[])
       .concat(matriz[celdaX] && matriz[celdaX][celdaY+anchoCeldas] ? matriz[celdaX][celdaY+anchoCeldas]:[]).concat(matriz[celdaX] && matriz[celdaX][celdaY-anchoCeldas] ? matriz[celdaX][celdaY-anchoCeldas]:[])
       .concat(matriz[celdaX - anchoCeldas] && matriz[celdaX - anchoCeldas][celdaY] ? matriz[celdaX - anchoCeldas][celdaY]:[]).concat(matriz[celdaX - anchoCeldas] && matriz[celdaX - anchoCeldas][celdaY + anchoCeldas] ? matriz[celdaX - anchoCeldas][celdaY + anchoCeldas]:[]).concat(matriz[celdaX - anchoCeldas] && matriz[celdaX - anchoCeldas][celdaY - anchoCeldas] ? matriz[celdaX - anchoCeldas][celdaY - anchoCeldas]:[])
    

    //console.log(`${idsNodosCercanos.length} nodos cercanos`);
    var nodosCercanos = todosNodos.filter(n => idsNodosCercanos.includes(n.id) && n.id!=nodo.id);

    //Hacer la lista de vínculos reales
    
    var colision = 0;
    // console.log(`Colision: `);
    nodosCercanos.forEach(nodoCercano => {
        //console.log(`Checking cercanía con ${JSON.stringify(nodoCercano)}`);        
        //console.log(`${nodoCercano.nombre}`);
        let umbralDistanciaNodo=umbralDistancia+(Math.max(nodoCercano.todosVinculos.length, nodo.todosVinculos.length)*5);
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
        if(puntaje<puntajeMinimo){
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
        return {
            angulo:0,
            paso:{x:0, y:0}
        }
    }

    return {
        paso:mejorPaso, angulo:mejorAngulo
    }
}

function setCentrosProyectos(todosProyectos, todosNodos){
    todosProyectos.forEach(proyecto=>{
        let sumx=0;
        let sumy=0;

        let cantNodos=0;
        let nodosProyecto=todosNodos.filter(n=>n.idProyectoParent==proyecto.id);
        console.log(`Nodos proyecto: ${nodosProyecto.length}`);
        nodosProyecto.forEach(nodo=>{
            cantNodos++;
            sumx+=Number(nodo.coords.x);
            sumy+=Number(nodo.coords.y);
        });
        // console.log(`Sumx: ${sumx}`);
        // console.log(`Cant nodos: ${cantNodos}`);
        // console.log(`Resx: ${sumx/cantNodos}`);
        
        if(cantNodos>0){
            var centroMasa={
                x: (Math.round(sumx/cantNodos)),
                y: (Math.round(sumy/cantNodos))
            }
            proyecto.centroMasa=centroMasa;
        }else{
            proyecto.centroMasa={
                x:0,
                y:0
            }
        }         
        console.log(`${proyecto.nombre} quedó en centro ${JSON.stringify(proyecto.centroMasa)}`);
        
    });
}

function getPuntaje(nodo, posicion, matriz, todosNodos, empujando){
    var colision=checkColision(posicion, matriz, todosNodos, nodo, empujando);
    
    const distx = nodo.centroMasa.x - posicion.x;
    const disty = nodo.centroMasa.y - posicion.y;

    var distancia=Math.sqrt(Math.pow(distx, 2) + Math.pow(disty, 2));
    const umbralDistanciaNodo=umbralDistancia+(nodo.vinculos.length*5);    

    var puntajeDistancia=Math.pow(distancia, 2)/147275;
    if(nodo.vinculos.length==1){
        puntajeDistancia=distancia<=umbralDistanciaNodo ? 0 : Math.pow(distancia, 2)/47275
    }

    puntaje=puntajeDistancia+colision;
    return puntaje;
}

function setPosicionPolar(todosNodos, todosProyectos){
    todosNodos.forEach(nodo=>{
        let proyecto=todosProyectos.find(p=>p.id==nodo.idProyectoParent);
        let centroProyecto=proyecto.centroMasa;

        var distx=nodo.coords.x-centroProyecto.x;
        var disty=nodo.coords.y-centroProyecto.y;

        var anguloCentroProyecto=0
        if (distx != 0 || disty != 0) {
            anguloCentroProyecto = Math.atan(disty / distx);
            if (disty < 0 && distx < 0) anguloCentroProyecto += Math.PI;
            if (distx < 0 && disty >= 0) anguloCentroProyecto += Math.PI;
        }
        nodo.coordsPolares={};
        nodo.coordsPolares.radio=Math.hypot(distx, disty);
        nodo.coordsPolares.direccion=anguloCentroProyecto
    })
}

function setCentrosMasa(todosNodos, todosProyectos){
    //Get centros de masa
    todosNodos.forEach(nodo => {
        let proyectoParent=todosProyectos.find(tp=>tp.id==nodo.idProyectoParent);
        let centroProyecto=proyectoParent.centroMasa;
        let todosVinculos = nodo.todosVinculos;
        let nodosDependencias=todosNodos.filter(tn=>nodo.vinculos.map(v=>v.idRef).includes(tn.id));
        let direccion=0;
        if (todosVinculos.length > 0) {
            let nodosVinculos = todosNodos.filter(n => todosVinculos.map(v => v.idRef).includes(n.id));
            direccion=getDireccionPromedio(nodosVinculos);                        
        }       
        let radio=stepRadial;
        if (nodosDependencias.length>0) radio+=Math.max(...nodosDependencias.map(nd=>nd.coordsPolares.radio))
        
        console.log(`Se construye centro masa con ${centroProyecto.x} y radio: ${radio}, dirección: ${direccion}`);
        nodo.centroMasa = {
            x: Math.round(centroProyecto.x + (radio*Math.cos(direccion))),
            y: Math.round(centroProyecto.y + (radio*Math.sin(direccion)))
        }
    });
}

function sleep(ms) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  }   