
const simboloCargando = "<div class='simboloCargando'></div>";
const codigoTrabajo = "<div class='elementoTrabajo elementoDiagrama'></div>";
const codigoObjetivo = "<div class='elementoObjetivo elementoDiagrama'></div>";

loginToken = null;
elementosProyecto = new Object();
elementosColumna = new Array();

//para el diagrama
heightCol = 35;
widthCol = 150;

function listarConocimientosVinculados(idProyecto, idElemento) {
    var vinculos = elementosProyecto[idProyecto][idElemento].conocimientosVinculados;
    $(".conocimientoVinculado").remove();
    if(typeof(vinculos)=="undefined")vinculos=new Array();
    for (conocimiento of vinculos) {
        const nuevoConocimientoVinculado = $("<div class='conocimientoVinculado bolitaNodo' id='cv" + conocimiento.idRef + "'><img src='atlas/api/nodos/iconos/" + conocimiento.idRef + "'><div class='nombreConocimiento'>" + conocimiento.nombre + "</div></div>")
        $("#contenedorConocimientosVinculados").prepend(nuevoConocimientoVinculado);
    }
}

function getVinculosElementoRecursivamente(idProyecto, idElemento) {
    if (!(idElemento in elementosProyecto[idProyecto])) {
        return [];
    }
    aVinculos = elementosProyecto[idProyecto][idElemento].vinculos;
    for (var i in aVinculos) {
        let ref = aVinculos[i].ref;
        if (!(ref in elementosProyecto[idProyecto])) {
            // elementosProyecto[idProyecto][idElemento].vinculos.splice(i, 1) ;
            continue;
        }

        aVinculos = aVinculos.concat(getVinculosElementoRecursivamente(idProyecto, ref));
        console.log(`vinculo: ${elementosProyecto[idProyecto][ref].nombre}`);
    }
    return aVinculos;
}

function crearItemProyecto(infoProyecto) {
    let nuevoItem = $(`<div class='itemPaqueteProyecto nombreProyecto' id='${infoProyecto._id}'>${infoProyecto.nombre}</div>`);
    $("#paqueteProyectos").append(nuevoItem);
    return nuevoItem;
}

function guardarInfoElementos(idProyecto, objetivos, trabajos) {
    console.log(`guardando info elementos de proyecto con id ${idProyecto}`);
    var aElementos = new Object();
    var j = 0;
    for (var i in objetivos) {
        console.log(`tenemos un objetivo ${objetivos[i].nombre}`);
        aElementos[objetivos[i]._id] = new Object({
            tipo: "objetivo",
            nombre: objetivos[i].nombre,
            vinculos: objetivos[i].vinculos
        });
        j++;
    }
    for (var i in trabajos) {
        aElementos[trabajos[i]._id] = new Object({
            tipo: "trabajo",
            nombre: trabajos[i].nombre,
            vinculos: trabajos[i].vinculos,
            fila: trabajos[i].fila,
            columna: trabajos[i].columna,
            descripcion: trabajos[i].descripcion,
            conocimientosVinculados:trabajos[i].conocimientosVinculados
        });
        j++;
    }
    elementosProyecto[idProyecto] = aElementos;
}

function addInfoToElementosProyecto(elemento, idProyecto) {
    const idElemento = elemento._id;
    console.log(`añadiendo info al ${elemento.tipo} ${elemento.nombre} con id ${idElemento}`);

    if ((idElemento in elementosProyecto[idProyecto])) {
        console.log(`${elemento.nombre} ya existia en elementosProyecto`);
    }
    else {
        console.log(`creando nueva key ${idElemento} en elementosProyecto`);
        elementosProyecto[idProyecto][idElemento] = new Object();
    }
    elementosProyecto[idProyecto][idElemento].nombre = elemento.nombre;
    elementosProyecto[idProyecto][idElemento].tipo = elemento.tipo;
    elementosProyecto[idProyecto][idElemento].vinculos = elemento.vinculos ? elemento.vinculos : [];
    elementosProyecto[idProyecto][idElemento].eDom = elemento.eDom ? elemento.eDom : null

}

function dibujarObjetivo(id, nombre) {
    var nuevoObjetivo = $(codigoObjetivo);
    nuevoObjetivo.attr("id", id);
    if (nombre) {
        nuevoObjetivo.html(nombre);
    }
    $("#contenedorElementos").append(nuevoObjetivo);
    return nuevoObjetivo;
}
function dibujarTrabajo(id, nombre) {
    var nuevoTrabajo = $(codigoTrabajo);
    nuevoTrabajo.attr("id", id);
    if (nombre) {
        nuevoTrabajo.html(nombre);
    }
    $("#contenedorElementos").append(nuevoTrabajo);
    return nuevoTrabajo;
}
function dibujarElementos(idProyecto) {
    $(".elementoDiagrama").remove();
    for (var idElemento in elementosProyecto[idProyecto]) {

        let nombreE = elementosProyecto[idProyecto][idElemento].nombre;
        let idE = idElemento;
        let tipo = elementosProyecto[idProyecto][idElemento].tipo;
        let fila = elementosProyecto[idProyecto][idElemento].fila;
        let columna = elementosProyecto[idProyecto][idElemento].columna;
        switch (tipo) {
            case "trabajo":
                elementosProyecto[idProyecto][idElemento].eDom = dibujarTrabajo(idE, nombreE);
                break;
            case "objetivo":
                elementosProyecto[idProyecto][idElemento].eDom = dibujarObjetivo(idE, nombreE);
                break;
            default:
                console.log("tipo de elemento desconocido");
        }
        let esteE = elementosProyecto[idProyecto][idElemento].eDom;
        esteE.css("top", heightCol * fila + "px");
        esteE.css("left", widthCol * (columna) + "px");
        //esteE.html(fila);
    }
}

function asignarColumna(col, id, idProyecto) {
    //A filas contiene la información de las filas ocupadas 

    let esteElemento = elementosProyecto[idProyecto][id];
    if (esteElemento.columna) {
        return { columna: esteElemento.columna, fila: esteElemento.fila };
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
                if (!(ref in elementosProyecto[idProyecto])) {
                    continue;
                }
                resultado = asignarColumna(1, ref, idProyecto);
                esteElemento.columna = Math.max(esteElemento.columna, (resultado.columna + 1));
                sumatoriaFilas += resultado.fila;
                cuentaVinculos++;
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
        ultimaFilaOcupada = elementosProyecto[idProyecto][aEstaColumna[aEstaColumna.length - 1].ref].fila;
    }
    if (filaDeseada > ultimaFilaOcupada) {
        esteElemento.fila = filaDeseada
    }
    else {
        esteElemento.fila = ultimaFilaOcupada + 2;
    }
    elementosColumna[esteElemento.columna].push({ ref: id });


    //Guardar cambios en elementos proyecto y retornar.
    elementosProyecto[idProyecto][id] = esteElemento;

    return { columna: esteElemento.columna, fila: esteElemento.fila };
}

function ubicarElementos(idProyecto, infoElementos) {
    console.log(`ubicando los elementos del proyecto con id ${idProyecto}`);
    if (infoElementos) {
        var localTemporal = new Object();
        for (var elemento of infoElementos) {
            console.log(`ubicando a ${elemento.nombre} en fila ${elemento.fila} y columna ${elemento.columna}`);
            localTemporal[elemento._id] = elementosProyecto[idProyecto][elemento._id];

            localTemporal[elemento._id].fila = elemento.fila;
            localTemporal[elemento._id].columna = elemento.columna
            localTemporal[elemento._id].vinculos = elemento.vinculos

            let eDom = localTemporal[elemento._id].eDom;

            eDom.css("top", heightCol * elemento.fila + "px");
            eDom.css("left", widthCol * (elemento.columna) + "px");
        }
        console.log(`el localTemporal tiene ${Object.keys(localTemporal).length} elementos`);
        elementosProyecto[idProyecto] = localTemporal;
        console.log(`elementos proyecto quedó con ${Object.keys(elementosProyecto[idProyecto]).length} elementos`);
    }
    else {
        for (var idElemento in elementosProyecto[idProyecto]) {
            console.log(`ubicando ${elementosProyecto[idProyecto][idElemento].nombre}`);
            let columnaE = elementosProyecto[idProyecto][idElemento].columna;
            let filaE = elementosProyecto[idProyecto][idElemento].fila;
            let eDom = elementosProyecto[idProyecto][idElemento].eDom;

            eDom.css("top", heightCol * filaE + "px");
            eDom.css("left", widthCol * (columnaE) + "px");
            //eDom.html(filaE);
        }
    }
}
$(document).ready(function () {

    //Recibir los proyectos.
    jQuery.ajax({
        type: "POST",
        url: "api/proyectos/listaNombres",
        dataType: "text",
        contentType: "application/json",
        data: {},
        success: function (resp) {
            resp = JSON.parse(resp);
            for (var i in resp) {
                console.log("nombre: " + resp[i].nombre);
                crearItemProyecto({ nombre: resp[i].nombre, _id: resp[i]._id });
            }
            $("#bDesplegarProyectos").css("pointer-events", "all");

        },
        error: function (xhr, ajaxOptions, thrownError) {
            console.log("errores: " + xhr + "**" + ajaxOptions + "**" + thrownError);
        }
    });

    //Hacer una lista con los conocimientos posibles.
    jQuery.ajax({
        type: 'POST',
        url: 'atlas/api/nodos/todosNombres',
        dataType: 'text',
        contentType: 'application/json',
        data: "",
        success: function (resp) {
            resp = JSON.parse(resp);
            for (var nodo of resp.nodos) {
                const nuevoConocimientoPosible = $("<div class='conocimientoPosible bolitaNodo' id='cp" + nodo._id + "'><img src='atlas/api/nodos/iconos/" + nodo._id + "'><div class='nombreConocimiento'>" + nodo.nombre + "</div></div>");
                $("#contenedorConocimientosPosibles").append(nuevoConocimientoPosible);
            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            console.log('errores: ' + xhr + '**' + ajaxOptions + '**' + thrownError);
        }
    });

    $("#bDesplegarProyectos").on("click", function (e) {
        e.stopPropagation();
        const boton = $(this);
        if (boton.hasClass("desplegando")) {
            $("#bDesplegarProyectos").removeClass("desplegando");
            $(".itemPaqueteProyecto").addClass("desplegado");
            $("#cuadroBusquedaProyectos").html("");
            $("#cuadroBusquedaProyectos").focus();
        }
        else {
            $("#bDesplegarProyectos").addClass("desplegando");
            $(".itemPaqueteProyecto:not(.seleccionado)").removeClass("desplegado");
        }

    });

    $("#cuadroBusquedaProyectos").on("input", function (e) {
        if ($(this).html().length > 5) {
            $("#bCrearProyecto").css("display", "block");
        }
        else {
            $("#bCrearProyecto").css("display", "none");
        }
    });

    $("#cuadroBusquedaProyectos").on("keypress", function (e) {

        if (e.which == 13) {
            e.preventDefault();
            e.stopPropagation();
            return;
        }
    });

    $("#paqueteProyectos").on("click", ".nombreProyecto", function () {
        $("#paqueteProyectos").children(".itemPaqueteProyecto").removeClass("desplegado");
        $(this).addClass("desplegado");
        $("#bDesplegarProyectos").addClass("desplegando");

        $("#contenedorConocimientosVinculados").css("display", "none");
        $("#zonaDetalles").attr("nivelRef", "proyecto");
        $("#zonaDetalles").attr("idRef", $(this).attr("id"));
        $("#tituloZonaDetalles").html($(this).html());

        if ($(this).hasClass("seleccionado")) {
            return;
        }
        $("#paqueteProyectos").children(".nombreProyecto").removeClass("seleccionado");
        $(this).addClass("seleccionado");

        const datos = {
            idProyecto: $(this).attr("id")
        }
        jQuery.ajax({
            type: "POST",
            url: "api/proyectos/getInfoElementos",
            dataType: "text",
            contentType: "application/json",
            data: JSON.stringify(datos),
            success: function (resp) {

                resp = JSON.parse(resp);
                objetivos = resp.proyecto.objetivos;
                trabajos = resp.proyecto.trabajos;
                console.log(`objetivos : ${objetivos.length}`);
                console.log(`trabajos: ${trabajos.length}`);
                $("#descripcionZonaDetalles").html(resp.proyecto.descripcion);
                $("#descripcionZonaDetalles").children("p").css("line-height", "");
                guardarInfoElementos(datos.idProyecto, objetivos, trabajos);
                dibujarElementos(datos.idProyecto);


            },
            error: function (xhr, ajaxOptions, thrownError) {
                console.log("errores: " + xhr + "**" + ajaxOptions + "**" + thrownError);
            }
        });
    });

    $("#bCrearProyecto").on("click", function () {
        //Validacion del contenido del buscador de proyectos
        if ($("#cuadroBusquedaProyectos").html().length < 5) {
            return;
        }
        nombre = $("#cuadroBusquedaProyectos").html();

        const datos = {
            nombre: nombre
        }

        jQuery.ajax({
            type: "POST",
            url: "api/proyectos/crear",
            dataType: "text",
            contentType: "application/json",
            data: JSON.stringify(datos),
            success: function (resp) {

                console.log(resp);
                resp = JSON.parse(resp);
                console.log(`creado ${resp.proyecto.nombre}`);
                crearItemProyecto(resp.proyecto).trigger("click");
            },
            error: function (xhr, ajaxOptions, thrownError) {
                console.log("errores: " + xhr + "**" + ajaxOptions + "**" + thrownError);
            }
        });
    });
    $("#zonaDiagrama").on("click", function (e) {
        $(".menuContextualDiagrama").css("display", "none");
    });

    $("#diagrama").on("contextmenu", function (e) {
        $(".menuContextualDiagrama").css("display", "none");
        $("#menuContextualCrearElemento").attr("ref", "");
        $("#menuContextualCrearElemento").attr("tipoRef", "");
        e.preventDefault();
        e.stopPropagation();
        coords = { x: e.screenX + 3, y: e.screenY - 100 };
        console.log("right click en " + `${coords.x}, ${coords.y}. Target: ${$(e.target).attr("id")}`);
        $("#menuContextualCrearElemento").css("top", `${coords.y}px`);
        $("#menuContextualCrearElemento").css("left", `${coords.x}px`);
        $("#menuContextualCrearElemento").css("display", "block");
    });

    $('#contenedorElementos').on('contextmenu', '.elementoDiagrama', function (e) {
        const idTarget = $(e.target).attr("id");
        const idProyectoActivo = $(".nombreProyecto.seleccionado:first").attr("id");
        const tipoRef = elementosProyecto[idProyectoActivo][idTarget].tipo;

        $("#menuContextualElementoDiagrama").attr("ref", idTarget);
        $("#menuContextualElementoDiagrama").attr("tipoRef", tipoRef);
        $(".menuContextualDiagrama").css("display", "none");
        e.stopPropagation()
        e.preventDefault();
        const coords = { x: e.screenX + 3, y: e.screenY - 100 };
        $("#menuContextualElementoDiagrama").css("top", `${coords.y}px`);
        $("#menuContextualElementoDiagrama").css("left", `${coords.x}px`);
        $("#menuContextualElementoDiagrama").css("display", "block");
    });

    ////////////////////////////////////////////////////////////////BOTONES DE CREAR TRABAJOS Y OBJETIVOS///////////////////////////////////////

    $("#crearTrabajo, #crearTrabajoAnterior, #crearTrabajoPosterior").on("click", function () {
        $("#diagrama").addClass("esperandoRespuesta");


        const idProyectoSeleccionado = $(".nombreProyecto.seleccionado:first").attr("id");
        const menuCx = $(this).closest(".menuContextualDiagrama");

        const botonClickado = $(this);
        console.log(`proyecto seleccionado: ${idProyectoSeleccionado}`)
        var datos = {
            idProyecto: idProyectoSeleccionado
        }
        if (menuCx.attr("id") == "menuContextualElementoDiagrama") { //Informacion adicional para el vinculo.
            const ref = menuCx.attr("ref");
            var tipoRef = menuCx.attr("tipoRef");
            if (botonClickado.attr("id") == "crearTrabajoPosterior") {
                datos.vinculoDelNuevo = {
                    ref: ref,
                    tipoTarget: tipoRef,
                    tipoVinculo: "requiere"
                };
            }
            if (botonClickado.attr("id") == "crearTrabajoAnterior") {
                datos.elementoViejo = {
                    id: ref,
                    tipo: tipoRef
                };
                datos.vinculoDelViejo = {
                    tipoVinculo: "requiere"
                };
            }
        }

        //simbolo cargando en el sitio donde está el menu contextual
        const elemCargando = $(simboloCargando);
        $("body").append(elemCargando);
        var lugar = $("#menuContextualCrearElemento").offset();
        elemCargando.css("left", lugar.left);
        elemCargando.css("top", lugar.top);
        elemCargando.css("display", "block");
        jQuery.ajax({
            type: "POST",
            url: "api/proyectos/crearTrabajo",
            dataType: "text",
            contentType: "application/json",
            data: JSON.stringify(datos),
            success: function (resp) {
                resp = JSON.parse(resp);
                var elementoNuevo = resp.nuevoTrabajo;
                const elementoDomNuevo = dibujarTrabajo(resp.nuevoTrabajo._id, resp.nuevoTrabajo.nombre);
                //Añadir tipo a elementoNuevo
                elementoNuevo.tipo = "trabajo";
                elementoNuevo.eDom = elementoDomNuevo;
                //introducir información a la variable elementosProyecto
                addInfoToElementosProyecto(resp.nuevoTrabajo, idProyectoSeleccionado);

                elemCargando.remove();
                elementoDomNuevo.trigger("click");
                //ReorganizarDiagrama:
                ubicarElementos(idProyectoSeleccionado, resp.infoElementos);

                $("#diagrama").removeClass("esperandoRespuesta");
            },
            error: function (xhr, ajaxOptions, thrownError) {
                console.log("errores: " + xhr + "**" + ajaxOptions + "**" + thrownError);
                $("#diagrama").removeClass("esperandoRespuesta");

            }
        });
    });

    $('#conectarRequeridoSeleccionando').on('click', function (e) {
        e.stopPropagation();
        e.preventDefault();

        const menuCx = $(this).closest(".menuContextualDiagrama");
        const idRequeridor = menuCx.attr("ref");

        const requeridor = $(`#${idRequeridor}`);
        $(".elementoDiagrama").addClass("optandoRequerido");
        requeridor.removeClass("optandoRequerido");
        requeridor.addClass("optandoRequeridor");
        menuCx.css("display", "none");
        $("#contenedorElementos").focus();
    });

    $('#desconectarSeleccionando').on('click', function (e) {
        e.stopPropagation();
        e.preventDefault();
        const menuCx = $(this).closest(".menuContextualDiagrama");
        const idSource = menuCx.attr("ref");
        const source = $(`#${idSource}`);
        const idProyectoActivo = $(".nombreProyecto.seleccionado:first").attr("id");

        var aVinculos = elementosProyecto[idProyectoActivo][idSource].vinculos;
        $(".elementoDiagrama").addClass("noclickable");
        for (var i in aVinculos) {
            ref = aVinculos[i].ref
            if (!(ref in elementosProyecto[idProyectoActivo])) continue;
            $(`#${ref}`).addClass("optandoDesconexionAsTarget");
            $(`#${ref}`).removeClass("noclickable");
        }
        source.addClass("optandoDesconexionAsSource");
        source.removeClass("noclickable");
        menuCx.css("display", "none");
        $("#contenedorElementos").focus();

    });

    $("#crearObjetivo").on("click", function () {//objetivo primario: sin vinculos
        const idProyectoSeleccionado = $(".nombreProyecto.seleccionado:first").attr("id");
        console.log(`proyecto seleccionado: ${idProyectoSeleccionado}`)
        const datos = {
            idProyecto: idProyectoSeleccionado
        }
        if ($("#menuContextualCrearElemento").attr("ref").length > 0) {
            datos.vinculo = {
                ref: $("#menuContextualCrearElemento").attr("ref"),
                tipoElemento: $("#menuContextualCrearElemento").attr("tipoRef"),
                tipoVinculo: "requiere"
            };

        }
        //simbolo cargando en el sitio donde está el menu contextual
        const elemCargando = $(simboloCargando);
        $("body").append(elemCargando);
        var lugar = $("#menuContextualCrearElemento").offset();
        console.log(`lugar: ${JSON.stringify(lugar)}`);
        elemCargando.css("left", lugar.left);
        elemCargando.css("top", lugar.top);
        elemCargando.css("display", "block");
        jQuery.ajax({
            type: "POST",
            url: "api/proyectos/crearObjetivo",
            dataType: "text",
            contentType: "application/json",
            data: JSON.stringify(datos),
            success: function (resp) {
                console.log(resp);
                resp = JSON.parse(resp);
                console.log(`creado ${resp.id}`);
                const elementoNuevo = dibujarObjetivo(resp.id, resp.nombre);

                //introducir información a la variable elementosProyectoo
                elementosProyecto[idProyectoSeleccionado][resp.id] = {
                    nombre: resp.nombre,
                    tipo: "objetivo",
                    vinculos: resp.vinculos,
                    eDom: elementoNuevo
                }
                elemCargando.remove();
            },
            error: function (xhr, ajaxOptions, thrownError) {
                console.log("errores: " + xhr + "**" + ajaxOptions + "**" + thrownError);
            }
        });
    });

    $("#contenedorElementos").on("click", ".elementoDiagrama", function () { ///CLICK en el elemento diagrama
        const idProyectoActivo = $(".nombreProyecto.seleccionado:first").attr("id");


        if ($(this).hasClass("optandoRequerido")) { //Crear una vinculo entre un requeridor y un requerido ya existentes
            const requeridor = $(".optandoRequeridor:first");
            const idRequeridor = requeridor.attr("id");
            const tipoRequeridor = elementosProyecto[idProyectoActivo][idRequeridor].tipo;

            const requerido = $(this);
            const idRequerido = requerido.attr("id");
            const tipoRequerido = elementosProyecto[idProyectoActivo][idRequerido].tipo;
            console.log(`enviando una nueva vinculo en proyecto con id ${idProyectoActivo}`);
            const datos = {
                idProyecto: idProyectoActivo,

                idSource: idRequeridor,
                tipoSource: tipoRequeridor,

                idTarget: idRequerido,
                tipoTarget: tipoRequerido,
                tipoVinculo: "requiere"
            }
            $("#diagrama").addClass("esperandoRespuesta");
            jQuery.ajax({
                type: 'POST',
                url: 'api/proyectos/crearVinculo',
                dataType: 'text',
                contentType: 'application/json',
                data: JSON.stringify(datos),
                success: function (resp) {
                    resp = JSON.parse(resp);
                    ubicarElementos(idProyectoActivo, resp.infoElementos);
                    $("#contenedorElementos").trigger("focusout");
                    $("#diagrama").removeClass("esperandoRespuesta");
                },
                error: function (xhr, ajaxOptions, thrownError) {
                    console.log('errores: ' + xhr + '**' + ajaxOptions + '**' + thrownError);
                    $("#diagrama").removeClass("esperandoRespuesta");

                }
            });

            return;
        }
        if ($(this).hasClass("optandoDesconexionAsTarget")) {           //Desconectando el vinculo entre un source y un target
            console.log(`desconectando`);
            idSource = $(`.optandoDesconexionAsSource:first`).attr("id");
            idTarget = $(this).attr("id");

            const datos = {
                idProyecto: idProyectoActivo,
                idSource: idSource,
                idTarget: idTarget
            }
            $("#diagrama").addClass("esperandoRespuesta");

            jQuery.ajax({
                type: 'POST',
                url: 'api/proyectos/desconectarVinculoBySourceTarget',
                dataType: 'text',
                contentType: 'application/json',
                data: JSON.stringify(datos),
                success: function (resp) {
                    resp = JSON.parse(resp);
                    ubicarElementos(idProyectoActivo, resp.infoElementos);
                    $("#contenedorElementos").trigger("focusout");
                    $("#diagrama").removeClass("esperandoRespuesta");

                },
                error: function (xhr, ajaxOptions, thrownError) {
                    console.log('errores: ' + xhr + '**' + ajaxOptions + '**' + thrownError);
                    $("#diagrama").removeClass("esperandoRespuesta");

                }
            });
            return;
        }


        //Seleccionar un elemento
        console.log("seleccionando un elemento");
        $(".elementoDiagrama").removeClass("selected");
        $(this).addClass("selected");
        $("#contenedorConocimientosPosibles").css("display", "none");

        //Cambios en la zona detalles.
        const idElemento = $(this).attr("id");
        const nombreElemento = elementosProyecto[idProyectoActivo][idElemento].nombre;
        const tipoElemento = elementosProyecto[idProyectoActivo][idElemento].tipo;
        var descripcionElemento = elementosProyecto[idProyectoActivo][idElemento].descripcion

        $("#tituloZonaDetalles").html(nombreElemento);
        $("#contenedorElementosPosibles").css("display", "none");
        $(".conocimientosVinculados").remove();
        listarConocimientosVinculados(idProyectoActivo, idElemento);
        if (typeof (descripcionElemento) == "undefined") descripcionElemento = "Descripcion";
        $("#contenedorConocimientosVinculados").css("display", "block");
        $("#descripcionZonaDetalles").html("");

        $("#descripcionZonaDetalles").html(descripcionElemento);
        $("#descripcionZonaDetalles").children("div").each(function () {
            if ($(this).html == "") {
                console.log(`una div vacía`);
            }
        });

        $("#zonaDetalles").attr("nivelRef", "elementoDiagrama");
        $("#zonaDetalles").attr("idRef", idElemento);
        $("#zonaDetalles").attr("tipoRef", tipoElemento);
        $("#zonaDetalles").attr("idParent", idProyectoActivo);
        $("#tituloZonaDetalles").removeClass("editandose");
        $("#descripcionZonaDetalles").removeClass("editandose");

        //Resaltar vinculos
        aVinculos = getVinculosElementoRecursivamente(idProyectoActivo, idElemento);
        $(".elementoDiagrama.resaltarComoVinculo").removeClass("resaltarComoVinculo");
        for (var i in aVinculos) {
            $(`#${aVinculos[i].ref}`).addClass("resaltarComoVinculo");
        }

    });

    $('#contenedorElementos').on('keypress', function (e) {
        if (e.which = 127 && $(".elementoDiagrama.selected").length == 1) { //Eliminacion de elemento
            const idElemento = $(".elementoDiagrama.selected").attr("id");
            const idProyectoActivo = $(".nombreProyecto.seleccionado:first").attr("id");
            console.log(`eliminando el elemento con id ${idElemento}`);

            const datos = {
                tipoElemento: elementosProyecto[idProyectoActivo][idElemento].tipo,
                idElemento: idElemento,
                idProyecto: idProyectoActivo
            }
            $("#diagrama").addClass("esperandoRespuesta");
            jQuery.ajax({
                type: 'POST',
                url: 'api/proyectos/eliminarElemento',
                dataType: 'text',
                contentType: 'application/json',
                data: JSON.stringify(datos),
                success: function (resp) {
                    resp = JSON.parse(resp);
                    console.log(`elemento ${idElemento} eliminado exitosamente`);
                    $(`#${idElemento}`).remove();
                    $(".elementosDiagrama:first").trigger("click");
                    ubicarElementos(idProyectoActivo, resp.infoElementos);
                    $("#diagrama").removeClass("esperandoRespuesta");
                },
                error: function (xhr, ajaxOptions, thrownError) {
                    console.log('errores: ' + xhr + '**' + ajaxOptions + '**' + thrownError);
                    $("#diagrama").removeClass("esperandoRespuesta");
                }
            });

        }
    });

    $('#contenedorElementos').on('focusout', function () {
        $(".elementoDiagrama").removeClass("optandoRequerido");
        $(".elementoDiagrama").removeClass("optandoRequeridor");
        $(".elementoDiagrama").removeClass("optandoDesconexionAsSource");
        $(".elementoDiagrama").removeClass("optandoDesconexionAsTarget");
        $(".elementoDiagrama").removeClass("noclickable");
    });

    $("#tituloZonaDetalles").on("input", function () {
        $(this).addClass("editandose");
    });

    $("#tituloZonaDetalles").on("keypress", function (e) {
        if (e.which == 13) {
            e.preventDefault();
            e.stopPropagation();
            $(this).trigger("focusout");
        }
    });
    $('#tituloZonaDetalles').on('focusout', function () {
        const nuevoNombre = $("#tituloZonaDetalles").html();
        const idRef = $("#zonaDetalles").attr("idRef");

        if ($("#zonaDetalles").attr("nivelRef") == "elementoDiagrama") {
            if ($("#tituloZonaDetalles").html().length < 5) {
                return;
            }
            const idParent = $("#zonaDetalles").attr("idParent");
            const tipoRef = $("#zonaDetalles").attr("tipoRef");
            const datos = {
                tipoRef: tipoRef,
                idRef: idRef,
                idParent: idParent,
                nuevoNombre: nuevoNombre
            }
            jQuery.ajax({
                type: "POST",
                url: "api/proyectos/elementos/renombrar",
                dataType: "text",
                contentType: "application/json",
                data: JSON.stringify(datos),
                success: function (resp) {
                    resp = JSON.parse(resp);
                    $("#tituloZonaDetalles").removeClass("editandose");
                    elementosProyecto[idParent][idRef].nombre = resp.elemento.nombre;
                    $(`#${idRef}`).html(elementosProyecto[idParent][idRef].nombre);
                },
                error: function (xhr, ajaxOptions, thrownError) {
                    console.log("errores: " + xhr + "**" + ajaxOptions + "**" + thrownError);
                }
            });
        }
        else if ($("#zonaDetalles").attr("nivelRef") == "proyecto") {
            console.log(`renombrando proyecto`);
            const datos = {
                idProyecto: idRef,
                nuevoNombre: nuevoNombre
            }
            jQuery.ajax({
                type: 'POST',
                url: 'api/proyectos/renombrar',
                dataType: 'text',
                contentType: 'application/json',
                data: JSON.stringify(datos),
                success: function (resp) {
                    resp = JSON.parse(resp);
                    $("#tituloZonaDetalles").removeClass("editandose");
                    $(`#${idRef}`).html(nuevoNombre);
                },
                error: function (xhr, ajaxOptions, thrownError) {
                    console.log('errores: ' + xhr + '**' + ajaxOptions + '**' + thrownError);
                }
            });
        }
    });

    $('#nuevoConocimientoVinculado').on('click', function () {
        if ($("#contenedorConocimientosPosibles").css("display") == "block") return $("#contenedorConocimientosPosibles").css("display", "none");
        $("#contenedorConocimientosPosibles").css("display", "block");
    });

    $('#contenedorConocimientosPosibles').on('click', '.conocimientoPosible', function (e) {
        $("#contenedorConocimientosPosibles").css("display", "none");
        const datos = {
            idProyecto: $(".nombreProyecto.seleccionado:first").attr("id"),
            idElemento: $("#zonaDetalles").attr("idRef"),
            idNuevoConocimiento: $(this).attr("id").substr(2)
        }
        console.log(`Vinculando un conocimiento posible de id ${datos.idNuevoConocimiento} a trabajo con id ${datos.idElemento}`);
        jQuery.ajax({
            type: 'POST',
            url: 'api/proyectos/elementos/vincularConocimiento',
            dataType: 'text',
            contentType: 'application/json',
            data: JSON.stringify(datos),
            success: function (resp) {
                resp = JSON.parse(resp);
                $(".conocimientosVinculados").remove();
                elementosProyecto[datos.idProyecto][datos.idElemento].conocimientosVinculados=resp.vinculos;
                listarConocimientosVinculados(datos.idProyecto, datos.idElemento);
                
            },
            error: function (xhr, ajaxOptions, thrownError) {
                console.log('errores: ' + xhr + '**' + ajaxOptions + '**' + thrownError);
            }
        });
    });

    $('#nuevoConocimientoVinculado').on('click', '.conocimientoPosible', function (e) {
        e.stopPropagation();
    });

    $("#descripcionZonaDetalles").on("input paste", function () {
        $(this).addClass("editandose");
    });

    $("#descripcionZonaDetalles").on("focusout", function () {
        if (!$(this).hasClass("editandose")) return;

        console.log(`enviando update de zona detalles`);
        const nuevaDescripcion = $("#descripcionZonaDetalles").html();
        const idRef = $("#zonaDetalles").attr("idRef");
        const nivelRef = $("#zonaDetalles").attr("nivelRef");
        if (nivelRef == "elementoDiagrama") {
            const idParent = $("#zonaDetalles").attr("idParent");
        }
        console.log(`actualizando descripcion de un ${nivelRef}`);

        var datos = {
            nuevaDescripcion: nuevaDescripcion,
            idRef: idRef,
            nivelRef: nivelRef
        };
        if (nivelRef == "elementoDiagrama") {
            const idParent = $("#zonaDetalles").attr("idParent");
            datos.idParent = idParent,
                urlApi = "elementos/updateDescripcion"
        }
        else if (nivelRef == "proyecto") {
            urlApi = "updateDescripcion"
        }
        jQuery.ajax({
            type: 'POST',
            url: 'api/proyectos/' + urlApi,
            dataType: 'text',
            contentType: 'application/json',
            data: JSON.stringify(datos),
            success: function (resp) {
                resp = JSON.parse(resp);
                if (nivelRef == "proyecto") $(`#descripcionZonaDetalles`).html(resp.proyecto.descripcion);
                if (nivelRef == "elementoDiagrama") $(`#descripcionZonaDetalles`).html(resp.descripcion);
                $("#descripcionZonaDetalles").removeClass("editandose");
            },
            error: function (xhr, ajaxOptions, thrownError) {
                console.log('errores: ' + xhr + '**' + ajaxOptions + '**' + thrownError);
            }
        });
    });
});