import { ModeloNodo as NodoConocimiento } from "./model/atlas/Nodo";
const anchoCeldas = 400;
// const nodoDeInteres = 'Que la casa de Maestra Vida esté en condiciones óptimas para habitarla y disfrutarla.';
const nodoDeInteres = null;
export async function ejecutarPosicionamientoNodosConocimientoByFuerzas(ciclos, timeCalled, force) {
    const maxCiclos = 1000;
    if (ciclos > maxCiclos)
        ciclos = maxCiclos;
    console.log(`Iniciando un posicionamiento de fuerzas de ${ciclos} ciclos`);
    try {
        var todosNodos = await NodoConocimiento.find({}).exec();
        console.log(`Total: ${todosNodos.length} nodos`);
    }
    catch (error) {
        console.log(`error getting todos nodos. e: ` + error);
        return;
    }
    filtrarVinculosHuerfanos(todosNodos);
    setInformacionRelevante(todosNodos);
    //Iniciar coordenadas
    todosNodos.forEach(nodo => {
        if (!nodo.autoCoords.x)
            nodo.autoCoords.x = nodo.coords.x || Math.round(Math.random() * 700);
        if (!nodo.autoCoords.y)
            nodo.autoCoords.y = nodo.coords.y || Math.round(Math.random() * 700);
        // if(nodo.descripcion==="Sin descripcion" || nodo.descripcion==="Sin descripción")nodo.descripcion=null;
        // nodo.autoCoords.x=Math.round(Math.random()*100);
        // nodo.autoCoords.y=Math.round(Math.random()*100);
    });
    var celdas = setCeldas(todosNodos);
    for (var ciclo = 0; ciclo < ciclos; ciclo++) {
        posicionar(todosNodos, celdas);
    }
    console.log(`Uploading...`);
    await uploadNodos(todosNodos);
    // await sleep(10000);
}
function posicionar(todosNodos, celdas) {
    todosNodos = todosNodos.sort((a, b) => b.peso - a.peso);
    todosNodos.forEach(nodo => {
        if (nodo.nombre === nodoDeInteres || !nodoDeInteres) {
            setNivel(nodo, todosNodos);
            setFuerzaCentroMasa(nodo, todosNodos);
            setFuerzaColision(nodo, celdas, todosNodos);
            moverNodo(nodo, celdas);
        }
    });
}
function moverNodo(nodo, celdas) {
    const viejaCelda = {
        x: getCeldaH(nodo.autoCoords),
        y: getCeldaV(nodo.autoCoords),
    };
    const maxDesplazamiento = 50;
    var movimiento = {
        x: (nodo.fuerzaCentroMasa.fuerza * Math.cos(nodo.fuerzaCentroMasa.direccion)) + (nodo.fuerzaColision.fuerza * Math.cos(nodo.fuerzaColision.direccion)),
        y: (nodo.fuerzaCentroMasa.fuerza * Math.sin(nodo.fuerzaCentroMasa.direccion)) + (nodo.fuerzaColision.fuerza * Math.sin(nodo.fuerzaColision.direccion))
    };
    if (movimiento.x > maxDesplazamiento)
        movimiento.x = maxDesplazamiento;
    if (movimiento.x < -maxDesplazamiento)
        movimiento.x = -maxDesplazamiento;
    if (movimiento.y > maxDesplazamiento)
        movimiento.y = maxDesplazamiento;
    if (movimiento.y < -maxDesplazamiento)
        movimiento.y = -maxDesplazamiento;
    nodo.autoCoords.x = Math.round(nodo.autoCoords.x + movimiento.x);
    nodo.autoCoords.y = Math.round(nodo.autoCoords.y + movimiento.y);
    const nuevaCelda = {
        x: getCeldaH(nodo.autoCoords),
        y: getCeldaV(nodo.autoCoords),
    };
    if (viejaCelda.x != nuevaCelda.x || viejaCelda.y != nuevaCelda.y) { //Hay cambio de celda
        //Retirar el nodo de la vieja celda
        const indexN = celdas[viejaCelda.x][viejaCelda.y].indexOf(nodo.id);
        if (indexN > -1) {
            celdas[viejaCelda.x][viejaCelda.y].splice(indexN, 1);
        }
        else {
            console.log(`Alerta!! El nodo no estaba en su celda`);
        }
        //Introducir el nodo a la nueva celda
        if (!celdas[nuevaCelda.x]) {
            celdas[nuevaCelda.x] = {};
        }
        if (!celdas[nuevaCelda.x][nuevaCelda.y]) {
            celdas[nuevaCelda.x][nuevaCelda.y] = [];
        }
        const indexM = celdas[nuevaCelda.x][nuevaCelda.y].indexOf(nodo.id);
        if (indexM === -1) {
            celdas[nuevaCelda.x][nuevaCelda.y].push(nodo.id);
        }
        else {
            console.log(`Alerta!!, el nodo estaba anotado en la nueva celda antes de entrar a ella`);
        }
    }
}
function setNivel(nodo, todosNodos) {
    nodo.nivel = 0;
    let vinculosActuales = nodo.vinculos;
    if (nodo.nombre === nodoDeInteres) {
        //Log in yellow        
        console.log(`\x1b[33m%s\x1b[0m`, `Tiene: ${vinculosActuales.length} vinculos`);
    }
    while (vinculosActuales.length > 0) {
        nodo.nivel++;
        if (nodo.nombre === nodoDeInteres) {
            console.log(`Pasa a nivel ${nodo.nivel}`);
        }
        //prevent infinite loop
        if (nodo.nivel > 100)
            break;
        let vinculosRelevantes = vinculosActuales.filter(v => v.tipo == "continuacion" && v.rol == "target");
        console.log(`con ${vinculosRelevantes.length} vinculos relevantes con ids ${vinculosRelevantes.map(v => v.idRef).join(", ")}`);
        let idsSiguientesNodos = vinculosRelevantes.map(v => v.idRef);
        console.log(`Buscando ${idsSiguientesNodos.length} siguientes nodos en ${todosNodos.length} nodos`);
        let siguientesNodos = todosNodos.filter(nd => idsSiguientesNodos.includes(nd.id));
        if (nodo.nombre === nodoDeInteres) {
            console.log(`Siguientes nodos: ${siguientesNodos.map(n => n.nombre).join(", ")}`);
        }
        vinculosActuales = siguientesNodos.reduce((acc, n) => acc.concat(n.vinculos), []);
        console.log(`con ${vinculosActuales.length} vinculos`);
        //prevent repetition
        vinculosActuales = vinculosActuales.filter(v => !idsSiguientesNodos.includes(v.idRef));
        //purge repeated items
        vinculosActuales = vinculosActuales.filter((v, i) => vinculosActuales.findIndex(v2 => v2.idRef === v.idRef) === i);
        console.log(`Purgados quedan ${vinculosActuales.length} vinculos`);
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
    const rangoColision = 600; //Rango de acción de colisión
    const colisionMaxima = 900; //Colision maxima generada en distancia 0
    let factorFuerza = colisionMaxima / Math.pow(rangoColision, 2);
    //FactorFuerza grows linearlly in such a way that doubles if nivel is 3
    factorFuerza = factorFuerza * (1 + nodo.nivel / 3);
    var coordsFuerzaTotal = {
        x: 0,
        y: 0
    };
    if (nodoDeInteres === nodo.nombre) {
    }
    nodosRelevantes.forEach(nodoR => {
        let coordsDistancia = {
            x: nodo.autoCoords.x - nodoR.autoCoords.x,
            y: nodo.autoCoords.y - nodoR.autoCoords.y
        };
        if (nodoDeInteres === nodo.nombre) {
        }
        let vectorDistancia = cartesian2Polar(coordsDistancia.x, coordsDistancia.y);
        if (nodoDeInteres === nodo.nombre) {
        }
        if (vectorDistancia.fuerza > rangoColision)
            vectorDistancia.fuerza = rangoColision;
        let fuerzaColision = factorFuerza * Math.pow(rangoColision - vectorDistancia.fuerza, 2);
        if (!nodo.idsNodosConectados.includes(nodoR.id)) { //Colisión con un nodo no conectado (Mayor colisión)
            fuerzaColision = fuerzaColision * 1.1;
        }
        let compx = Math.cos(vectorDistancia.direccion) * fuerzaColision;
        let compy = Math.sin(vectorDistancia.direccion) * fuerzaColision;
        coordsFuerzaTotal.x += compx;
        coordsFuerzaTotal.y += compy;
    });
    var fuerzaPolar = cartesian2Polar(coordsFuerzaTotal.x, coordsFuerzaTotal.y);
    nodo.fuerzaColision = fuerzaPolar;
}
function setFuerzaCentroMasa(nodo, todosNodos) {
    var nodosRelevantes = todosNodos.filter(n => nodo.idsNodosConectados.includes(n.id));
    const distanciaUmbral = 400;
    const factorFuerza = 100 / Math.pow(distanciaUmbral, 2);
    var vectorCentro = cartesian2Polar(-nodo.autoCoords.x, -nodo.autoCoords.y);
    vectorCentro.fuerza = 2;
    //Fuerza default hacia el centro del diagrama
    var coordsFuerzaTotal = {
        x: vectorCentro.fuerza * Math.cos(vectorCentro.direccion),
        y: vectorCentro.fuerza * Math.sin(vectorCentro.direccion),
    };
    nodosRelevantes.forEach(nodoR => {
        let coordsDistancia = {
            x: nodoR.autoCoords.x - nodo.autoCoords.x,
            y: nodoR.autoCoords.y - nodo.autoCoords.y
        };
        let vectorDistancia = cartesian2Polar(coordsDistancia.x, coordsDistancia.y);
        let fuerzaCentroMasa = factorFuerza * Math.pow(vectorDistancia.fuerza, 2);
        if (nodo.idsRequeridos.includes(nodoR.id)) { //Fuerza de atracción de nodos requeridos
            if (nodoR.nodoParent === nodo.id) { //Fuerza de atracción de nodos chidlren.
                fuerzaCentroMasa = fuerzaCentroMasa * 0.9;
            }
            else { //Fuerza de atracción de requeridos pero no children
                fuerzaCentroMasa = fuerzaCentroMasa * 0.7;
            }
        }
        else { //Fuerza de atracción de requirientes
            if (nodoR.id === nodo.nodoParent) { //Fuerza de atracción del parent
                fuerzaCentroMasa = fuerzaCentroMasa * 1.1;
            }
            else { //Fuerza de atracción de requiriente no-parent
                fuerzaCentroMasa = fuerzaCentroMasa * 0.9;
            }
        }
        let compx = Math.cos(vectorDistancia.direccion) * fuerzaCentroMasa;
        let compy = Math.sin(vectorDistancia.direccion) * fuerzaCentroMasa;
        coordsFuerzaTotal.x += compx;
        coordsFuerzaTotal.y += compy;
    });
    var fuerzaPolar = cartesian2Polar(coordsFuerzaTotal.x, coordsFuerzaTotal.y);
    nodo.fuerzaCentroMasa = fuerzaPolar;
}
function filtrarVinculosHuerfanos(todosNodos) {
    todosNodos.forEach(nodo => {
        let idsVinculos = nodo.vinculos.map(v => v.idRef);
        var indexHuerfanos = [];
        idsVinculos.forEach((idV, index) => {
            if (!todosNodos.some(n => n.id == idV)) { //Ningún nodo está apuntado por este idRef
                indexHuerfanos.push(index);
            }
        });
        if (indexHuerfanos.length > 0) {
            console.log(`Encontrados ${indexHuerfanos.length} nodos huerfanos en el nodo ${nodo.nombre}. Eliminando`);
            indexHuerfanos = indexHuerfanos.sort((a, b) => b - a);
            indexHuerfanos.forEach(i => {
                nodo.vinculos.splice(i, 1);
            });
        }
    });
}
function setCeldas(todosNodos) {
    var celdas = {};
    todosNodos.forEach(nodo => {
        nodo.celdaH = getCeldaH(nodo.autoCoords);
        nodo.celdaV = getCeldaV(nodo.autoCoords);
        if (!celdas[nodo.celdaH]) {
            celdas[nodo.celdaH] = {};
        }
        if (!celdas[nodo.celdaH][nodo.celdaV]) {
            celdas[nodo.celdaH][nodo.celdaV] = [];
        }
        celdas[nodo.celdaH][nodo.celdaV].push(nodo.id);
    });
    return celdas;
}
function getCeldaH(coords) {
    const celda = Math.floor(coords.x / anchoCeldas);
    return celda;
}
function getCeldaV(coords) {
    var celda = Math.floor(coords.y / anchoCeldas);
    return celda;
}
async function uploadNodos(todosNodos) {
    todosNodos.forEach(async function (nodo) {
        if (nodo.nombre === nodoDeInteres || !nodoDeInteres) {
            try {
                nodo.fuerzaColision.fuerza = Math.round(nodo.fuerzaColision.fuerza);
                nodo.fuerzaCentroMasa.fuerza = Math.round(nodo.fuerzaCentroMasa.fuerza);
                nodo.posicionadoByFuerzas = true;
                console.log(`Guardando ${nodo.nombre} con nivel ${nodo.nivel}`);
                await nodo.save();
            }
            catch (error) {
                console.log(`error guardando el nodo ${nodo.nombre}. e: ` + error);
            }
        }
    });
}
function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}
function setInformacionRelevante(todosNodos) {
    todosNodos.forEach(nodo => {
        setNodosConectados(nodo, todosNodos);
    });
}
function setNodosConectados(nodo, todosNodos) {
    var idsRequeridos = nodo.vinculos.map(v => v.idRef);
    var idsRequirientes = todosNodos.filter(n => {
        var idsRequeridos = n.vinculos.map(v => v.idRef);
        return idsRequeridos.includes(nodo.id);
    }).map(n => n.id);
    nodo.idsRequeridos = idsRequeridos;
    nodo.idsNodosConectados = idsRequeridos.concat(idsRequirientes);
}
function cartesian2Polar(x, y) {
    const distance = Math.sqrt(x * x + y * y);
    const radians = Math.atan2(y, x); //This takes y first
    const polarCoor = { fuerza: distance, direccion: radians };
    return polarCoor;
}
