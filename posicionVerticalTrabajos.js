const mongoose = require("mongoose");
const Objetivo = require("./comunaBuild/model/Objetivo").ModeloObjetivo
const Trabajo = require("./comunaBuild/model/Trabajo").ModeloTrabajo
const Proyecto = require("./comunaBuild/model/Proyecto").ModeloProyecto
const dotenv = require("dotenv");
dotenv.config();
const nodoDeInteres = null//"Crear un futbolín";

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
//setInterval(() => posicionar(), 5000);
iniciar();

async function iniciar() {
    await iniciarMongoose();

    try {

        var todosObjetivos = await Objetivo.find({}).exec();
        var todosTrabajos = await Trabajo.find({}).exec();

        todosTrabajos.forEach(trabajo => trabajo.tipo = "trabajo");
        todosObjetivos.forEach(objetivo => objetivo.tipo = "objetivo");
        var todosNodos = todosObjetivos.concat(todosTrabajos);
    }
    catch (error) {
        console.log(`error getting todos nodos. e: ` + error);
        return;
    }


    //Limpiar de nodos huerfanos
    todosNodos.forEach(nodo => {
        var nodosHuerfanos = 0;
        var indexHuerfanos = [];
        nodo.vinculos.forEach((vinculo, index) => {
            if (!todosNodos.some(n => n.id == vinculo.idRef)) {
                nodosHuerfanos++;
                indexHuerfanos.push(index);
            }
        });
        if (nodosHuerfanos > 0) {
            console.log(`El nodo ${nodo.nombre} tiene ${nodosHuerfanos} vinculos huerfanos de ${nodo.vinculos.length}`);
            console.log(`Indexs: ${indexHuerfanos}`);
            indexHuerfanos = indexHuerfanos.sort((a, b) => b - a);
            console.log(`Ordenado: ${indexHuerfanos}`);
            indexHuerfanos.forEach(i => {
                console.log(`   Eliminando el ${i}`);
                nodo.vinculos.splice(i, 1);
            })
        }
    })

    //Reset niveles

    todosNodos.forEach(nodo => {
        nodo.nivel = null;
        nodo.turnoNivel = null;
        nodo.centroMasa.x = 0;
        nodo.coords.x = Math.round(nodo.coords.x);
        nodo.coords.y = 0;
        if (!nodo.coords) {
            console.log(`¡El nodo ${nodo.nombre} no tenia coords!`);
        }
    })

    //Definir niveles

    var nodosUbicados = 0;
    var nivel = 0;
    var puestoEnNivel = {};
    const stepNivel = 200;

    idsNodosNivel = [];
    var nodosSinRequerimentos = todosNodos.filter(n => n.vinculos.length == 0);
    idsNodosNivel[0] = nodosSinRequerimentos.map(n => n.id);
    nodosSinRequerimentos.forEach(nodo => {
        nodo.nivel = 0;
        nodo.coords.y = nivel * stepNivel;
        nodo.centroMasa.y = nodo.coords.y;
    });
    puestoEnNivel["0"] = 0;
    console.log(`${nodosSinRequerimentos.length} nodos ubicados en el nivel ${nivel}`);

    nodosUbicados += nodosSinRequerimentos.length;

    while (nodosUbicados < todosNodos.length && nivel < 100) {
        nivel++;

        let estosNodos = todosNodos.filter(n => {
            if (n.nivel != null) return false;
            const refsVinculos = n.vinculos.map(v => v.idRef);
            if (refsVinculos.length < 1) return false;

            return refsVinculos.every(v => {
                const nodoTarget = todosNodos.find(n => n.id == v);
                return nodoTarget.nivel != null;
            })
        });
        idsNodosNivel[nivel] = estosNodos.map(n => n.id);
        puestoEnNivel[nivel] = 0;
        estosNodos.forEach(nodo => {
            nodo.nivel = nivel;
            nodo.coords.y = nivel * stepNivel;
            nodo.centroMasa.y = nodo.coords.y;
        });
        console.log(`${estosNodos.length} nodos ubicados en el nivel ${nivel}`);


        nodosUbicados += estosNodos.length;
    }

    //Set celdas
    const anchoCelda = 300;
    celdas = {}
    todosNodos.forEach(nodo => {
        nodo.celda = calcularCelda(nodo.coords);

        if (!celdas[nodo.nivel]) celdas[nodo.nivel] = {};
        if (!celdas[nodo.nivel][nodo.celda]) celdas[nodo.nivel][nodo.celda] = [];
        celdas[nodo.nivel][nodo.celda].push(nodo);
    })


    //Ubicar puestoEnNivel
    // console.log(`Nodos en máximo nivel: `);

    // for(var niv=nivel; niv>=0; niv--){
    //     let nodosNoUbicadosNivel=todosNodos.filter(n=>idsNodosNivel[niv].includes(n.id) && n.turnoNivel===null);
    //     console.log(`${nodosNoUbicadosNivel.length} nodos no ubicados en el nivel ${niv}`);
    //     nodosNoUbicadosNivel.forEach((nodo)=>{                
    //         ubicarNodo(nodo, 0, todosNodos, puestoEnNivel );        
    //     });
    // }


    //Ubicar a los que faltaron (No son requerimento de nadie)

    // todosNodos.filter(n=>n.turnoNivel===null).forEach(nodo=>{
    //     ubicarNodo(nodo, 0, todosNodos, puestoEnNivel );        
    // });


    //Set coords
    // const stepY=200;
    // const stepX=200;
    // todosNodos.forEach(async function(nodo){
    //     nodo.coords.y=nodo.nivel*stepY;
    //     nodo.coords.x=nodo.turnoNivel*stepX;
    //     try{
    //         await nodo.save()            
    //     }
    //     catch(error){
    //         console.log(`error . e: `+error);            
    //     }
    // })


    while (true) {
        console.log(`****************`);
        if (nodoDeInteres == null) console.log(`Todos`);

        todosNodos.forEach(async function (nodo) {

            if (nodoDeInteres == null || nodo.nombre === nodoDeInteres) {
                calcularCentroMasa(nodo, todosNodos);
                decidirMovimiento(nodo, todosNodos, celdas);
            }

            try {
                await nodo.save()
            }
            catch (error) {
                console.log(`error . e: ` + error);
            }

        });



        await sleep(5000);
    }


}



// function ubicarNodo(nodo, minPuesto, todosNodos, puestoEnNivel){
//     if(nodo.nivel===null){
//         console.log(`Tratando de ubicar un nodo que no está en ningún nivel`);
//         return;
//     }

//     var turnoTentativo=Math.max(minPuesto, puestoEnNivel[nodo.nivel]);
//     var turnoFinal=turnoTentativo;

//     const idsHijos=nodo.vinculos.map(v=>v.idRef);
//     var hijosNoUbicados=todosNodos.filter(n=>idsHijos.includes(n.id)&&!n.turnoNivel);
//     if(hijosNoUbicados.length>0){
//         const minPuestoHijos=turnoTentativo-(hijosNoUbicados.length/2);

//         var posicionesHijos=[]
//         hijosNoUbicados.forEach(hijo=>{
//             posicionesHijos.push(ubicarNodo(hijo, minPuestoHijos, todosNodos, puestoEnNivel ) );
//         });

//         turnoFinal=posicionesHijos.reduce((a, b)=>a+b, 0)/posicionesHijos.length;
//     }

//     nodo.turnoNivel=Number(turnoFinal.toFixed(2));
//     puestoEnNivel[nodo.nivel]=nodo.turnoNivel+1;
//     return nodo.turnoNivel;
// }

function calcularCentroMasa(nodo, todosNodos) {
    const idsRequeridos = nodo.vinculos.map(v => v.idRef);
    const nodosVinculados = todosNodos.filter(n => {
        let idsVinculosNodo = n.vinculos.map(v => v.idRef);
        return idsRequeridos.includes(n.id) || idsVinculosNodo.includes(nodo.id)
    });

    if (nodo.nombre === nodoDeInteres) {
        console.log(`${idsRequeridos.length} nodos requeridos`);
        console.log(`${nodosVinculados.length} nodos vinculados`);
    }

    if (nodosVinculados.length === 0) {
        nodo.centroMasa.x = null;
        return;
    }

    var promedioX = nodosVinculados.map(n => n.coords.x).reduce((a, b) => a + b, 0) / nodosVinculados.length;

    nodo.centroMasa.x = Math.round(promedioX);
}

function calcularColisiones(nodo, posicion, todosNodos, celdas) {
    const celdaPosicion = Math.floor(posicion.x / 300);
    const distanciaCentroMasa=Math.abs(posicion.x-nodo.centroMasa.x);
    var nodosCercanos = (celdas[nodo.nivel][celdaPosicion - 1] || []).concat(celdas[nodo.nivel][celdaPosicion] || []).concat(celdas[nodo.nivel][celdaPosicion + 1] || []);
    const indexPropioNodo = nodosCercanos.findIndex(n => n.id == nodo.id);
    if (indexPropioNodo > -1) {
        nodosCercanos.splice(indexPropioNodo, 1);
    }

    var colisionResultante = 0;
    var colisiones=[];
    if (nodo.nombre === nodoDeInteres) {
        nodosCercanos.forEach(nodoCercano => console.log(`${nodoCercano.nombre}`));
    }
    const nodosCercanosRelevantes=nodosCercanos.filter(n=>{
        let distanciaCentroMasaNodoCercano=Math.abs(n.coords.x - n.centroMasa.x);
        return distanciaCentroMasaNodoCercano>distanciaCentroMasa;
    })

    nodosCercanos.forEach(nodoCercano => {
        let distancia = Math.abs(nodoCercano.coords.x - posicion.x);
        let colision = Math.pow((-(distancia-400)), 2);       
        colisiones.push(colision);
        //if(colision>colisionResultante)colisionResultante=colision;                 
    });

    colisiones=colisiones.sort((a, b)=>b-a);
    // console.log(`Colisiones: ${colisiones}`);
    var factorColision=1;
    colisiones.forEach(c=>{
        colisionResultante+=c*factorColision;
        factorColision=factorColision/2;
    });
    
    return colisionResultante;
}

function calcularPuntaje(nodo, posicion, todosNodos, celdas) {
    var puntajeDistancia = 0;
    var distanciaCentroMasa = 0;
    if (nodo.centroMasa.x != null) {
        distanciaCentroMasa = Math.abs(posicion.x - nodo.centroMasa.x);        
        puntajeDistancia = Math.pow(distanciaCentroMasa, 2);                
    }
    if (nodo.nombre === nodoDeInteres) {
        console.log(`Centro masa: ${JSON.stringify(nodo.centroMasa)}`);
        console.log(`Distancia centro masa: ${distanciaCentroMasa}`);
        console.log(`Puntaje distancia: ${puntajeDistancia}`);
    }
    var puntajeColision = 0;
    if (distanciaCentroMasa < 400) {
        puntajeColision = calcularColisiones(nodo, posicion, todosNodos, celdas);
        //console.log(`Puntaje colisión: ${puntajeColision}`);
    }
    const puntajeTotal = puntajeColision + puntajeDistancia;

    return puntajeTotal

}

function decidirMovimiento(nodo, todosNodos, celdas) {
    const step = 20;
    const sondas=60;

    const puntajeActual = calcularPuntaje(nodo, { x: nodo.coords.x }, todosNodos, celdas);    
    var puntajeGanador = puntajeActual;
    var xGanador = nodo.coords.x;
    var sitioEncontrado = false;
    

    for (var i = (-sondas/2); i <= (sondas/2); i++) {
        let posicionTentativa = { x: nodo.coords.x + (step * i) };
        let puntajeAqui = calcularPuntaje(nodo, posicionTentativa, todosNodos, celdas);
        if (puntajeAqui < puntajeGanador) {
            xGanador = posicionTentativa.x;
            puntajeGanador=puntajeAqui            
            sitioEncontrado=true;
        }
    }
    
    if (sitioEncontrado) {
        nodo.stuck = false;
        nodo.coords.x = Math.round(xGanador);

        //reubicar en celda
        const nuevaCelda = calcularCelda(nodo.coords);
        if (nuevaCelda != nodo.celda) {
            const indexN = celdas[nodo.nivel][nodo.celda].findIndex(n => n.id == nodo.id);
            if (indexN > -1) {
                celdas[nodo.nivel][nodo.celda].splice(indexN, 1);
            }
            if (!celdas[nodo.nivel][nuevaCelda]) celdas[nodo.nivel][nuevaCelda] = [];
            celdas[nodo.nivel][nuevaCelda].push(nodo);
            nodo.celda = nuevaCelda;
        }

    }
    else {
        nodo.stuck = true;
    }
    nodo.puntaje = puntajeGanador;


}

function calcularCelda(posicion) {
    const anchoCelda = 300;
    const celda = Math.floor(posicion.x / anchoCelda);
    return celda;
}

function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}