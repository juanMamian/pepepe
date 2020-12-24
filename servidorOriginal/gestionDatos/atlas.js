const Nodo = require("../model/atlas/Nodo").modeloNodo;
const Grafo = require("../model/atlas/Grafo").modeloGrafo;
const mongoose = require("mongoose");

const versionGrafo = 1;

var cuenta = 0;

var distribuirNodosEnArco = null;

distribuirNodosEnArco = async function (elGrafo, nodos, idsNodos, centro, angulosOcupados) {

    const radio = 5;
    const cantNodos = idsNodos.length;
    if (cantNodos == 0) return;
    const amplitudAngularEnlace = 10;
    const arcoTotalLibre = 360 - (angulosOcupados.length * amplitudAngularEnlace);
    if (arcoTotalLibre < 0) return console.log(`NO HAY ESPACIO ALREDEDOR DE ESTE NODO`);

    var direccionInicial = 90;
    var distanciaAngularEntreNodos = arcoTotalLibre / cantNodos;

    if (angulosOcupados.length > 0) {
        direccionInicial = (angulosOcupados[0] + (amplitudAngularEnlace / 2) + (distanciaAngularEntreNodos / 2)) % 360;
    }
    var turno = 0;
    var angulo = direccionInicial;
    //Primero se ubica a todos estos 
    for (var idNodo of idsNodos) {
        var nodo = nodos[idNodo];

        if (nodo.ubicado) {
            continue;
        }
        if (nodo.nombre == "Las ecuaciones") {
            console.log(`UBICANDO LAS ECUACIONES OMG. Tienen un ubicado de ${nodo.ubicado}`);
        }

        angulo = angulo % 360;
        nodos[idNodo].coordx = centro.x + (radio * Math.cos(Math.PI * angulo / 180));
        nodos[idNodo].coordy = centro.y + (radio * Math.sin(Math.PI * angulo / 180));

        nodos[idNodo].coordx = nodos[idNodo].coordx.toFixed(2);
        nodos[idNodo].coordy = nodos[idNodo].coordy.toFixed(2);

        elGrafo.updateBordes({ x: nodos[idNodo].coordx, y: nodos[idNodo].coordy });
        nodos[idNodo].ubicado = true;
        nodos[idNodo].angulo = angulo;
        turno++;
        angulo += distanciaAngularEntreNodos;
    }
    //Segundo se repasan sus vínculos.
    for (var idNodo of idsNodos) {
        var nodo = nodos[idNodo];
        var subVinculos = nodo.vinculos.map(v => v.idRef);
        for (var i in subVinculos) {
            let ref = subVinculos[i];
            if (nodos[ref].nombre == "Las ecuaciones") {
                console.log(`las ecuaciones está en unos vínculos`);
            }
        }
        subVinculos=subVinculos.filter(sv=>!nodos[sv].ubicado);
        if (subVinculos.length > 0) {
            let nombresSv = subVinculos.map(sv => nodos[sv].nombre);
            if (nombresSv.find(e => e == "Las ecuaciones")) {
                console.log(`${nodo.nombre} está pidiendo ubicar las ecuaciones`);
            }
            distribuirNodosEnArco(elGrafo, nodos, subVinculos, { x: nodo.coordx, y: nodo.coordy }, [(nodo.angulo + 180) % 360]);
        }
        else {
            console.log(`----NO habia vínculos después de ${nodo.nombre}`);
        }
    }
}

module.exports = {
    posicionarNodos: async function () {
        var elGrafo = await this.getGrafo();
        try {
            var todosNodos = await Nodo.find({}, "nombre vinculos coordx coordy");
        }
        catch (error) {
            console.log(`error . e: ` + error);
        }

        todosNodos = todosNodos.map(n => {
            n.ubicado = false;
            return n;
        });

        todosNodos.sort(function (a, b) {
            return b.vinculos.length - a.vinculos.length;
        });

        var nodos = new Object();

        for (var nod of todosNodos) {
            nodos[nod._id] = nod;
        }

        posicionLibrex = 0;
        posicionLibrey = 0;

        for (var idNodo of Object.keys(nodos)) {
            var nodo = nodos[idNodo];
            if (nodo.vinculos.length == 0 || nodo.ubicado) continue;
            console.log(`${nodo.nombre}. Vinculos: ${nodo.vinculos.length}`);
            nodo.coordx = posicionLibrex;
            nodo.coordy = posicionLibrey;
            nodo.ubicado = true;

            elGrafo.updateBordes({ x: nodo.coordx, y: nodo.coordy });
            let vinculosNodo = nodo.vinculos.map(v => v.idRef);

            for (var i in vinculosNodo) {
                let idV = vinculosNodo[i];
                if (nodos[idV].ubicado == true) {
                    console.log(`CANCELANDO ${nodos[idV].nombre}`);
                    vinculosNodo.splice(i, 1);
                }
            }
            await distribuirNodosEnArco(elGrafo, nodos, vinculosNodo, { x: nodo.coordx, y: nodo.coordy }, []);
            posicionLibrex += 20;
        }
        var nodosUbicados=new Object();

        for(var [idN, cadNodo] of Object.entries(nodos)){
            if(cadNodo.ubicado){
            nodosUbicados[idN]=cadNodo;
            }
        }

        try {
            await elGrafo.save();
            for (var nodo of Object.values(nodos)) {
                await nodo.save();
            }
        }
        catch (error) {
            console.log(`error con ${nodo.nombre}. e: ` + error);
        }
        return {nodos: nodosUbicados, grafo: elGrafo};
    },
    getGrafo: async function () {
        try {
            var elGrafo = await Grafo.findOne({ version: versionGrafo }).exec();
        }
        catch (error) {
            console.log(`error . e: ` + error);
        }
        if (elGrafo.length == 0) {
            console.log(`no existía ese grafo version ${versionGrafo}`);
            var nuevoGrafo = Grafo.create({
                version: versionGrafo
            });

            try {
                nuevoGrafo = await nuevoGrafo.save();
            }
            catch (error) {
                console.log(`error . e: ` + error);

            }
            return nuevoGrafo;
        }
        return elGrafo;
    }
}