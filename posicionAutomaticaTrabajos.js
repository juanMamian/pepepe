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
const altoFilaNodos=300;
var pasoBase = 10;

const nodoDeInteres = null;

//setInterval(() => posicionar(), 5000);
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
    todosNodos.forEach(nodo => {
        if (!nodo.coords.x) nodo.coords.x = 0;
    });
    var celdas = setCeldas(todosNodos);
    // console.log(`Hay ${nodosCompletados.length} nodos completados`);

    while (true) {
        await posicionar(todosNodos, celdas);
        await uploadNodos(todosNodos);
        await sleep(5000);
    }


}

function posicionar(todosNodos, celdas) {
    decidirNiveles(todosNodos);
    todosNodos.forEach(nodo=>{
        if(nodo.nivel===null)nodo.nivel=-1;
        nodo.coords.y=altoFilaNodos*nodo.nivel;
    })
    calcularCentrosMasa(todosNodos);
    todosNodos=todosNodos.sort((a, b)=>b.peso-a.peso);
    todosNodos.forEach(nodo => {        
        actualizarCentroMasa(nodo, todosNodos);
        posicionarHorizontalmente(nodo, celdas, todosNodos)
    });
}

function posicionarHorizontalmente(nodo, celdas, todosNodos) {

    if (nodoDeInteres != null && nodo.nombre != nodoDeInteres) return;
    const paso = 15;
    var balanceo = 0;
    var encontrado = false;
    if (nodo.nombre === nodoDeInteres) {
        console.log(`${nodo.nombre} intenta ubicarse en ${nodo.centroMasa.x}`);
    }
    while (!encontrado) {
        let coordsIntento = {
            x: nodo.centroMasa.x + balanceo,
            y: nodo.centroMasa.y
        };
        if (nodo.nombre === nodoDeInteres) {
            console.log(`Probando en ${coordsIntento.x}`);
        }
        var contacto = true;
        contacto = checkContacto(nodo, coordsIntento, celdas, todosNodos);
        if (!contacto) {
            if (nodo.nombre === nodoDeInteres) {
                console.log(`Encontrado`);
            }
            encontrado = true;
            nodo.coords.x = Math.round(coordsIntento.x);
            break;
        }
        let coordsIntentoIzq = {
            x: nodo.centroMasa.x - balanceo,
            y: nodo.centroMasa.y
        };
        if (nodo.nombre === nodoDeInteres) {
            console.log(`Probando en ${coordsIntentoIzq.x}`);
        }

        contacto = checkContacto(nodo, coordsIntentoIzq, celdas, todosNodos);
        if (!contacto) {
            if (nodo.nombre === nodoDeInteres) {
                console.log(`Encontrado`);
            }
            encontrado = true;
            nodo.coords.x = Math.round(coordsIntentoIzq.x);
        }
        balanceo += paso;
    }

    const nuevaCelda=getCelda(nodo.coords);
    
    if(nodo.celda!=nuevaCelda){
        const indexN=celdas[nodo.celda].indexOf(nodo.id);
        if(indexN>-1){
            celdas[nodo.celda].splice(indexN, 1);
            if(!celdas[nuevaCelda]){
                celdas[nuevaCelda]=[];
            }
            celdas[nuevaCelda].push(nodo.id);
        }
        else{
            console.log(`EL NODO NO ESTABA EN SU CELDA`);
        }
    }
    nodo.celda=nuevaCelda;
}

function checkContacto(nodo, coords, celdas, todosNodos) {
    const umbralContacto = 200;
    const celdaCoords=getCelda(coords);
    var celdasRelevantes = [celdaCoords - 1, celdaCoords, celdaCoords + 1];
    if (nodo.nombre === nodoDeInteres) {
        console.log(`Checking contacto de ${nodo.nombre} en las coords: ${JSON.stringify(coords)}`);
    }
    var idsNodosRelevantes = [];
    celdasRelevantes.forEach(celda => {
        if (celdas[celda]) {
            idsNodosRelevantes = idsNodosRelevantes.concat(celdas[celda]);
        }        
    });
    const indexN=idsNodosRelevantes.indexOf(nodo.id);
    if(indexN>-1){
        idsNodosRelevantes.splice(indexN, 1);
    }
    var nodosRelevantes = todosNodos.filter(n => idsNodosRelevantes.includes(n.id));

    nodosRelevantes = nodosRelevantes.filter(n => n.peso >= nodo.peso && n.nivel===nodo.nivel);

    if(nodo.nombre==="Hacer posible la colaboración en el desarrollo de proyectos"){
        console.log(`El nodo de interes considera relevantes ${nodosRelevantes.length} nodos para contacto: `);
        nodosRelevantes.forEach(n=>console.log(`${n.nombre.substr(0, 18)}`) );
    }

    var contacto = false;
    nodosRelevantes.forEach(nr => {
        if (nodo.nombre === nodoDeInteres) {
            console.log(`${nr.id}: ${nr.coords.x}`);
        }
        if (Math.abs(nr.coords.x - coords.x) < umbralContacto) {
            contacto = true;
        }
        else {

        }
    });
    return contacto;
}

function calcularCentrosMasa(todosNodos) {
    todosNodos.forEach(nodo => {
        var idsRequeridos = nodo.vinculos.map(v => v.idRef);

        var idsRequirientes = todosNodos.filter(n => {
            var idsRequeridos = n.vinculos.filter(v => v.tipo = "requiere").map(v => v.idRef);
            return idsRequeridos.includes(nodo.id);
        }).map(n => n.id);

        var idsVinculos = idsRequeridos.concat(idsRequirientes);
        if (idsVinculos.length > 0) {
            var nodosVinculados = todosNodos.filter(n => idsVinculos.includes(n.id));
            var sumaX = nodosVinculados.reduce((sum, n) => sum + n.coords.x, 0);
            var centroX = sumaX / nodosVinculados.length;
            nodo.centroMasa.x = Math.round(centroX);
        }
        else {
            nodo.centroMasa.x = nodo.coords.x;
        }
        nodo.peso = idsVinculos.length;

    })
}

function actualizarCentroMasa(nodo, todosNodos) {
    var idsRequeridos = nodo.vinculos.map(v => v.idRef);

    var idsRequirientes = todosNodos.filter(n => {
        var idsRequeridos = n.vinculos.filter(v => v.tipo = "requiere").map(v => v.idRef);
        return idsRequeridos.includes(nodo.id);
    }).map(n => n.id);

    var idsVinculos = idsRequeridos.concat(idsRequirientes);
    if (idsVinculos.length > 0) {
        var nodosVinculados = todosNodos.filter(n => idsVinculos.includes(n.id));
        var sumaX = nodosVinculados.reduce((sum, n) => sum + n.coords.x, 0);
        var centroX = sumaX / nodosVinculados.length;
        nodo.centroMasa.x = Math.round(centroX);
    }
    else {
        nodo.centroMasa.x = nodo.coords.x;
    }
    nodo.peso = idsVinculos.length;
}

function decidirNiveles(todosNodos) {

    todosNodos.forEach(n => {
        n.nivelado = false;
        n.nivel = -100000;
    });
    var nodosNoCompletados = todosNodos.filter(n => n.estadoDesarrollo == "noCompletado");
    console.log(`Hay ${nodosNoCompletados.length} nodos no completados`);

    //Set Nodos nivel 0
    nodosNoCompletados.forEach(nodo => {
        let idsVinculos = nodo.vinculos.map(v => v.idRef);
        if (idsVinculos.length === 0) {
            nodo.nivel = 0;
            nodo.nivelado = true;
            // console.log(`+`);
        }
        else {
            var idsVinculosRequeridos = nodo.vinculos.filter(v => v.tipo === "requiere").map(v => v.idRef);
            var nodosRequeridos = nodosNoCompletados.filter(n => idsVinculosRequeridos.includes(n.id));
            if (nodosRequeridos.every(n => n.estadoDesarrollo === "completado")) {
                nodo.nivel = 0;
                nodo.nivelado = true;
                // console.log(`++`);
            }
        }

    });
    
    console.log(`Hay ${todosNodos.filter(n=>n.nivel===0).length} nodos en cero`);
 
    // //Set nodos siguientes niveles.
    var nivelAnterior = 0;
    var nodosNivelAnterior = nodosNoCompletados.filter(n => n.nivel === 0);
    console.log(`Hay ${nodosNivelAnterior.length} nodos en el nivel 0`);

    while (nodosNivelAnterior.length > 0) {
        console.log(`Buscando nodos de nivel ${nivelAnterior + 1}`);

        var nodosEsteNivel = nodosNoCompletados.filter(n => {
            var idsVinculosRequeridos = n.vinculos.filter(v => v.tipo === 'requiere').map(v => v.idRef);
            var nodosRequeridos = nodosNoCompletados.filter(n => idsVinculosRequeridos.includes(n.id));
            return nodosRequeridos.some(n => n.nivel === nivelAnterior)
        });
        console.log(`Encontrados ${nodosEsteNivel.length} nodos para el nivel ${nivelAnterior + 1}`);

        nodosEsteNivel.forEach(n => {
            n.nivel = nivelAnterior + 1;
            n.ubicado = true;
        });

        nivelAnterior++;
        nodosNivelAnterior = nodosNoCompletados.filter(n => n.nivel === nivelAnterior);
    }
    
    var nodosCompletados= todosNodos.filter(n => n.estadoDesarrollo == "completado");
    var nivelAnterior = 0;
    var nodosNivelAnterior = todosNodos.filter(n => n.nivel === 0);
    console.log(`Hay ${nodosNivelAnterior.length} nodos en el nivel 0`);

    while (nodosNivelAnterior.length > 0) {
        console.log(`Buscando nodos de nivel ${nivelAnterior - 1}`);

        var idsNodosEsteNivel=[];
        nodosNivelAnterior.forEach(na=>{
            const idsVinculos=na.vinculos.filter(v=>v.tipo==='requiere').map(v=>v.idRef);
            idsNodosEsteNivel=idsNodosEsteNivel.concat(idsVinculos);
        });

        var nodosEsteNivel = nodosCompletados.filter(n=>idsNodosEsteNivel.includes(n.id));
        console.log(`Encontrados ${nodosEsteNivel.length} nodos para el nivel ${nivelAnterior - 1}`);

        nodosEsteNivel.forEach(n => {
            n.nivel = nivelAnterior - 1;
            n.ubicado = true;
        });

        nivelAnterior--;
        nodosNivelAnterior = nodosCompletados.filter(n => n.nivel === nivelAnterior);
    }
    
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
        let celdaNodo = getCelda(nodo.coords);
        nodo.celda = celdaNodo;
        if (!celdas[celdaNodo]) {
            celdas[celdaNodo] = []
        }
        celdas[celdaNodo].push(nodo.id)
    });
    return celdas;
}

function getCelda(coords) {
    celda = Math.floor(coords.x / anchoCeldas);
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