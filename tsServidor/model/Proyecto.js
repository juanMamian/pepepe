const mongoose = require("mongoose");
const esquemaTrabajo = require("../model/Trabajo").esquemaTrabajo;
const esquemaObjetivo = require("../model/Objetivo").esquemaObjetivo;


const esquemaProyecto = new mongoose.Schema({
    nombre: {
        type: String,
        min: 2,
        max: 1024,
        required: true,
        default: "Nuevo proyecto"
    },
    descripcion: {
        type: String
    },
    objetivos: {
        type: [esquemaObjetivo],
        required:true,
        default:[]
    },
    trabajos: {
        type: [esquemaTrabajo],
        default: []
    },
    responsables: {
        type: [String],
        default: []
    },
    posiblesResponsables: {
        type: [String],
        default: []
    }

});

esquemaProyecto.methods.getTodosElementosDiagrama = function () {
    return this.objetivos.concat(this.trabajos);
};

function asignarColumna(col, id, elementosProyecto, elementosColumna) {
    let esteElemento = elementosProyecto.id(id);

    if ((esteElemento.columna > -1)) {
        console.log(`${esteElemento.nombre} cancelado`);
        return { columna: esteElemento.columna, fila: esteElemento.fila, elementosColumna: elementosColumna, elementosProyecto: elementosProyecto };
    }
    esteElemento.columna = col;
    var filaDeseada = 1;
    if (Array.isArray(esteElemento.vinculos)) {
        if (esteElemento.vinculos.length > 0) {
            esteElemento.columna++;
            var sumatoriaFilas = 0;
            var cuentaVinculos = 0;
            for (var i in esteElemento.vinculos) {
                let ref = esteElemento.vinculos[i].ref;
                if (!elementosProyecto.id(ref)) {
                    //console.log(`vinculo ${ref} huerfana`);
                    continue;
                }
                resultado = asignarColumna(0, ref, elementosProyecto, elementosColumna);
                esteElemento.columna = Math.max(esteElemento.columna, (resultado.columna + 1));
                elementosColumna = resultado.elementosColumna;
                elementosProyecto = resultado.elementosProyecto;
                sumatoriaFilas += resultado.fila;
                cuentaVinculos++;
            }
            if (cuentaVinculos == 0) {
                esteElemento.columna--;
            }
            filaDeseada = Math.round(sumatoriaFilas / cuentaVinculos);
        }
    }
    //Escoger fila
    if (!(esteElemento.columna in elementosColumna)) {
        elementosColumna[esteElemento.columna] = new Array();
    }
    var aEstaColumna = elementosColumna[esteElemento.columna];

    var ultimaFilaOcupada = 0;
    if (aEstaColumna.length > 0) {
        //console.log(`leyendo la ultima fila ocupada en la columna ${esteElemento.columna} que tiene ${aEstaColumna.length} elementos. El ultimo elemento es un ${esteElemento.tipo}`);
        ultimaFilaOcupada = elementosProyecto.id(aEstaColumna[aEstaColumna.length - 1].ref).fila;
    }
    else {
        ultimaFilaOcupada = -1;
    }
    if (filaDeseada >= ultimaFilaOcupada) {
        esteElemento.fila = filaDeseada;
        if (filaDeseada < (ultimaFilaOcupada + 2)) {
            console.log(`coincidencia de filas`);
            esteElemento.fila = ultimaFilaOcupada + 2;
            console.log(`quedará con fila ${esteElemento.fila}`);
        }
        elementosColumna[esteElemento.columna].push({ ref: esteElemento._id, fila: esteElemento.fila });
    }
    else {
        //  Buscar un huequito en las filas.
        var filaTocara = ultimaFilaOcupada + 2;
        var distanciaFilaDeseada = Math.abs(filaTocara - filaDeseada);
        console.log(`inicia a una distancia de ${distanciaFilaDeseada} de su fila ${filaDeseada} deseada`);
        var indexTocara = aEstaColumna.length;
        for (var i = (aEstaColumna.length - 1); i >= 0; i--) {
            //verificar que cabe
            let filaArriba = aEstaColumna[i].fila;
            let filaAbajo = 0;
            if (i > 0) {
                filaAbajo = aEstaColumna[i - 1].fila;
            }
            console.log(`probando si cabe entre ${i - 1} y ${i}. Espacio: ${filaArriba - filaAbajo} `);

            if ((filaArriba - filaAbajo) >= 4) {
                //hay hueco. Verificar si está mas cerca de su fila deseada
                var filaPosible = filaArriba - 2; //Posición pegada al siguiente elemento de la columna
                if (filaDeseada >= (filaAbajo + 2) && filaDeseada <= (filaArriba - 2)) { //üede ubicarse exactamente en la fila deseada
                    filaPosible = filaDeseada;
                }
                else {//Verificar cual de los dos bordes del hueco está más cerca de su fila deseada
                    if (Math.abs(filaDeseada - (filaAbajo + 2)) < Math.abs(filaDeseada - (filaArriba - 2))) { //Está mas cerca de la fila de abajo
                        filaPosible = filaAbajo + 2;
                    }
                }


                console.log(`En este hueco quedará a una distancia de ${Math.abs(filaPosible - filaDeseada)} comparada con ${distanciaFilaDeseada}`);
                if (Math.abs(filaPosible - filaDeseada) < distanciaFilaDeseada) {
                    //Está mas cerca, actualizarse.
                    filaTocara = filaPosible;
                    distanciaFilaDeseada = Math.abs(filaPosible - filaDeseada);
                    indexTocara = i;
                }
            }
        }
        esteElemento.fila = filaTocara;
        //Insertar en la posicion indexTocara 

        elementosColumna[esteElemento.columna].splice(indexTocara, 0, { ref: esteElemento._id, fila: esteElemento.fila });

    }
    console.log(`${esteElemento.nombre} - ${esteElemento._id}`);
    console.log(`${esteElemento.columna} - ${esteElemento.fila}`);

    console.log(`+++++++++++++`);
    console.log(``);



    //Guardar cambios en elementos proyecto y retornar.
    return { columna: esteElemento.columna, fila: esteElemento.fila, elementosColumna: elementosColumna, elementosProyecto: elementosProyecto };
}

esquemaProyecto.methods.ordenarFilasColumnas = async function () {
    console.log(`ordenando filas y columnas de ${this.nombre} con contenido: ${this}`);
    var elementosColumna = new Array();
    /*
        try {
            var this = await Proyecto.findById(idProyecto, "nombre trabajos objetivos");
        } catch (error) {
            console.log('error: ' + error);
        }*/
    var elementosProyecto = this.trabajos.concat(this.objetivos);

    //Eliminar columnas y reasignar
    for (var i in elementosProyecto) {
        elementosProyecto[i].columna = -1;
        elementosProyecto[i].fila = -1;
    }
    for (var i in elementosProyecto) {
        console.log(`CICLOSUPERIOR`);
        let resultado = asignarColumna(0, elementosProyecto[i]._id, elementosProyecto, elementosColumna);
        elementosColumna = resultado.elementosColumna;
        elementosProyecto = resultado.elementosProyecto;
    }

    console.log(`ordenamiento de ${this.nombre} finalizado`);
}



module.exports.modeloProyecto = mongoose.model("Proyecto", esquemaProyecto);

