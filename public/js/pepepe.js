
const simboloCargando = "<div class='simboloCargando'></div>";
const codigoTrabajo = "<div class='elementoTrabajo elementoDiagrama'></div>";
const codigoObjetivo = "<div class='elementoObjetivo elementoDiagrama'></div>";

loginToken = null;
elementosProyecto = new Object();

//para el diagrama
heightCol = 80;
widthCol = 150;
function getDependenciasElemento(idProyecto, idElemento) {
    if(!(idElemento in elementosProyecto[idProyecto]) ){
        return [];
    }
    aDependencias = elementosProyecto[idProyecto][idElemento].dependencias;
    for (var i in aDependencias) {
        let ref = aDependencias[i].ref;
        aDependencias = aDependencias.concat(getDependenciasElemento(idProyecto, ref));
    }
    return aDependencias;
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
            dependencias: objetivos[i].dependencias
        });
        j++;
    }
    for (var i in trabajos) {
        aElementos[trabajos[i]._id] = new Object({
            tipo: "trabajo",
            nombre: trabajos[i].nombre,
            dependencias: trabajos[i].dependencias
        });
        j++;
    }
    elementosProyecto[idProyecto] = aElementos;
}

function addInfoToElementosProyecto(elemento, idProyecto){
    const idElemento=elemento._id;
    console.log(`añadiendo info al ${elemento.tipo} ${elemento.nombre} con id ${idElemento}`);

    if((idElemento in elementosProyecto[idProyecto])){
        console.log(`${elemento.nombre} ya existia en elementosProyecto`);
    }
    else{
        console.log(`creando nueva key ${idElemento} en elementosProyecto`);    
        elementosProyecto[idProyecto][idElemento]=new Object();
    }
    elementosProyecto[idProyecto][idElemento].nombre=elemento.nombre;
    elementosProyecto[idProyecto][idElemento].tipo=elemento.tipo;
    elementosProyecto[idProyecto][idElemento].dependencias=elemento.dependencias ? elemento.dependencias: [];
    elementosProyecto[idProyecto][idElemento].eDom= elemento.eDom ? elemento.eDom : elementosProyecto[idProyecto][idElemento].eDom

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
        esteE.css("top", top);
    }
}

function asignarColumna(col, id, idProyecto) {
    if(!(id in elementosProyecto[idProyecto])){
        return 1;
    }
    let esteElemento = elementosProyecto[idProyecto][id];
    if (esteElemento.columna) {
        return esteElemento.columna;
    }
    esteElemento.columna = col;
    if (Array.isArray(esteElemento.dependencias)) {
        if (esteElemento.dependencias.length > 0) {
            esteElemento.columna++;
            for (var i in esteElemento.dependencias) {
                let ref = esteElemento.dependencias[i].ref;
                esteElemento.columna =Math.max(esteElemento.columna, (asignarColumna(1, ref, idProyecto) + 1));
            }
        }
    }
    return esteElemento.columna;
}

function ubicarElementos(idProyecto) {

    //reiniciar columnas
    for (var i in elementosProyecto[idProyecto]) {
        delete elementosProyecto[idProyecto][i].columna;
    }
    for (var idElemento in elementosProyecto[idProyecto]) {
        asignarColumna(1, idElemento, idProyecto);
    }
    var sizeColumna = new Object();
    var columnest = 0;

    //Buscando la columna mas grande. Columnest
    for (var idElemento in elementosProyecto[idProyecto]) {
        let columnaE = elementosProyecto[idProyecto][idElemento].columna;
        var estaColumna = sizeColumna[columnaE];

        if (Number.isInteger(sizeColumna[columnaE])) {
            sizeColumna[columnaE]++
        }
        else {
            sizeColumna[columnaE] = 1;
        }
        if (sizeColumna[columnaE] > columnest) {
            columnest = sizeColumna[columnaE];
        }
    }

    //Ubicando segun columnest cada elemento. Falta la fila //Falta centrar verticalmente las columnas más pequeñas que columnest.
    var turnoColumna = new Object()
    for (var idElemento in elementosProyecto[idProyecto]) {
        console.log(`ubicando ${elementosProyecto[idProyecto][idElemento].nombre}`);
        let columnaE = elementosProyecto[idProyecto][idElemento].columna;
        let eDom = elementosProyecto[idProyecto][idElemento].eDom;
        if (!Number.isInteger(turnoColumna[columnaE])) {
            turnoColumna[columnaE] = 0;
        }
        let turno = turnoColumna[columnaE];       
        eDom.css("top", heightCol * turno + "px");
        eDom.css("left", widthCol * (columnaE - 1) + "px");

        turnoColumna[columnaE]++;

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

            console.log(resp);
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

        if ($(this).hasClass("seleccionado")) {
            return;
        }
        $("#paqueteProyectos").children(".nombreProyecto").removeClass("seleccionado");
        $(this).addClass("seleccionado");

        datos = {
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
                guardarInfoElementos(datos.idProyecto, objetivos, trabajos);
                dibujarElementos(datos.idProyecto);
                ubicarElementos(datos.idProyecto);
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

        datos = {
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
        $("#menuContextualCrearElemento, #menuContextualElementoDiagrama").css("display", "none");
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
        console.log(`Menu contextual para crear un elemento dependiente del ${tipoRef} en ${$(".nombreProyecto.seleccionado:first").html()}`);
        $("#menuContextualElementoDiagrama").attr("ref", idTarget);
        $("#menuContextualElementoDiagrama").attr("tipoRef", tipoRef);
        $(".menuContextualDiagrama").css("display", "none");
        console.log(`contextMenu de elementoDiagrama ${$(this).attr("id")}`);
        e.stopPropagation()
        e.preventDefault();
        coords = { x: e.screenX + 3, y: e.screenY - 100 };
        console.log("right click en " + `${coords.x}, ${coords.y}. Target: ${$(e.target).attr("id")}`);
        $("#menuContextualElementoDiagrama").css("top", `${coords.y}px`);
        $("#menuContextualElementoDiagrama").css("left", `${coords.x}px`);
        $("#menuContextualElementoDiagrama").css("display", "block");
    });

    ////////////////////////////////////////////////////////////////BOTONES DE CREAR TRABAJOS Y OBJETIVOS///////////////////////////////////////

    $("#crearTrabajo, #crearTrabajoAnterior, #crearTrabajoPosterior").on("click", function () {
        const idProyectoSeleccionado = $(".nombreProyecto.seleccionado:first").attr("id");
        const menuCx = $(this).closest(".menuContextualDiagrama");

        const botonClickado = $(this);
        console.log(`proyecto seleccionado: ${idProyectoSeleccionado}`)
        datos = {
            idProyecto: idProyectoSeleccionado
        }
        if (menuCx.attr("id") == "menuContextualElementoDiagrama") { //Informacion adicional para la dependencia.
            const ref = menuCx.attr("ref");
            var tipoRef = menuCx.attr("tipoRef");
            if (botonClickado.attr("id") == "crearTrabajoPosterior") {
                datos.dependenciaDelNuevo = {
                    ref: ref,
                    tipoElemento: tipoRef,
                    tipoDependencia: "requiere"
                };
            }
            if (botonClickado.attr("id") == "crearTrabajoAnterior") {
                datos.elementoViejo = {
                    id: ref,
                    tipo: tipoRef
                };
                datos.dependenciaDelViejo = {
                    tipoDependencia: "requiere"
                };
            }
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
            url: "api/proyectos/crearTrabajo",
            dataType: "text",
            contentType: "application/json",
            data: JSON.stringify(datos),
            success: function (resp) {
                console.log(resp);
                resp = JSON.parse(resp);
                
                var elementoNuevo=resp.nuevoTrabajo;
                console.log(`creado ${elementoNuevo._id}`);
                const elementoDomNuevo = dibujarTrabajo(resp.nuevoTrabajo._id, resp.nuevoTrabajo.nombre);
                //Añadir tipo a elementoNuevo

                elementoNuevo.tipo="trabajo";
                elementoNuevo.eDom=elementoDomNuevo;
                //introducir información a la variable elementosProyecto
                addInfoToElementosProyecto(resp.nuevoTrabajo, idProyectoSeleccionado);
                                
                if( ("elementoViejo" in resp) ){
                    var elementoViejo=resp.elementoViejo;
                    //Añadir "tipo" a resp.elementoViejo       
                    if(typeof(tipoRef)=="undefined"){
                        console.log(`error. Hay un elementoViejo pero no hay tipoRef`);
                        return;
                    }       
                    elementoViejo.tipo=tipoRef;
                    addInfoToElementosProyecto(elementoViejo, idProyectoSeleccionado);
                }
                
                elemCargando.remove();

                //ReorganizarDiagrama:
                ubicarElementos(idProyectoSeleccionado);
            },
            error: function (xhr, ajaxOptions, thrownError) {
                console.log("errores: " + xhr + "**" + ajaxOptions + "**" + thrownError);
            }
        });
    });

    $("#crearObjetivo").on("click", function () {//objetivo primario: sin dependencias
        const idProyectoSeleccionado = $(".nombreProyecto.seleccionado:first").attr("id");
        console.log(`proyecto seleccionado: ${idProyectoSeleccionado}`)
        datos = {
            idProyecto: idProyectoSeleccionado
        }
        if ($("#menuContextualCrearElemento").attr("ref").length > 0) {
            datos.dependencia = {
                ref: $("#menuContextualCrearElemento").attr("ref"),
                tipoElemento: $("#menuContextualCrearElemento").attr("tipoRef"),
                tipoDependencia: "requiere"
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
                    dependencias: resp.dependencias,
                    eDom: elementoNuevo
                }
                elemCargando.remove();
            },
            error: function (xhr, ajaxOptions, thrownError) {
                console.log("errores: " + xhr + "**" + ajaxOptions + "**" + thrownError);
            }
        });
    });




    $("#contenedorElementos").on("click", ".elementoDiagrama", function () {
        console.log("seleccionando un elemento");
        $(".elementoDiagrama").removeClass("selected");
        $(this).addClass("selected");


        //Cambios en la zona detalles.
        const idProyectoActivo = $(".nombreProyecto.seleccionado:first").attr("id");
        const idElemento = $(this).attr("id");
        const nombreElemento = elementosProyecto[idProyectoActivo][idElemento].nombre;
        const tipoElemento = elementosProyecto[idProyectoActivo][idElemento].tipo;
        $("#tituloZonaDetalles").html(nombreElemento);

        $("#tituloZonaDetalles").attr("nivelRef", "elementoDiagrama");
        $("#tituloZonaDetalles").attr("idRef", idElemento);
        $("#tituloZonaDetalles").attr("tipoRef", tipoElemento);
        $("#tituloZonaDetalles").attr("idParent", idProyectoActivo);

        //Resaltar dependencias
        aDependencias = getDependenciasElemento(idProyectoActivo, idElemento);
        $(".elementoDiagrama.resaltarComoDependencia").removeClass("resaltarComoDependencia");
        for (var i in aDependencias) {
            $(`#${aDependencias[i].ref}`).addClass("resaltarComoDependencia");
        }

    });

    $('#contenedorElementos').on('keypress', function (e) {
        console.log(`contenedor elementos detecta ${e.which}`);
        if (e.which = 127 && $(".elementoDiagrama.selected").length == 1) {
            const idElemento = $(".elementoDiagrama.selected").attr("id");
            const idProyectoActivo = $(".nombreProyecto.seleccionado:first").attr("id");
            console.log(`eliminando el elemento con id ${idElemento}`);

            datos = {
                tipoElemento: elementosProyecto[idProyectoActivo][idElemento].tipo,
                idElemento: idElemento,
                idProyecto: idProyectoActivo
            }
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
                },
                error: function (xhr, ajaxOptions, thrownError) {
                    console.log('errores: ' + xhr + '**' + ajaxOptions + '**' + thrownError);
                }
            });

        }
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
        if ($(this).attr("nivelRef") == "elementoDiagrama") {
            if ($("#tituloZonaDetalles").html().length < 5) {
                return;
            }
            const nuevoNombre = $("#tituloZonaDetalles").html();
            const idRef = $("#tituloZonaDetalles").attr("idRef");
            const idParent = $("#tituloZonaDetalles").attr("idParent");
            const tipoRef = $("#tituloZonaDetalles").attr("tipoRef");
            if ($("#tituloZonaDetalles").attr("tipoRef").length > 0) {
                datos = {
                    tipoRef: tipoRef,
                    idRef: idRef,
                    idParent: idParent,
                    nuevoNombre: nuevoNombre
                }
            }

            jQuery.ajax({
                type: "POST",
                url: "api/proyectos/elementos/renombrar",
                dataType: "text",
                contentType: "application/json",
                data: JSON.stringify(datos),
                success: function (resp) {
                    console.log(resp);
                    resp = JSON.parse(resp);
                    $("#tituloZonaDetalles").removeClass("editandose");
                    console.log(`elemento renombrado a ${resp.elemento.nombre}`);
                    //Cambiar nombre del elemento en el elementosProyecto

                    elementosProyecto[idParent][idRef].nombre = resp.elemento.nombre;
                    $(`#${idRef}`).html(elementosProyecto[idParent][idRef].nombre);
                },
                error: function (xhr, ajaxOptions, thrownError) {
                    console.log("errores: " + xhr + "**" + ajaxOptions + "**" + thrownError);
                }
            });
        }
    });





});