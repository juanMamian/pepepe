
var codigoNodo = "<div class='bolitaNodo'><div class='nombreBolitaNodo' contenteditable='true'></div><input type='file' class='inputIconoBolitaNodo'></input></div>"
var infoGrafo = new Object();
var aNodos = new Object();

canv = document.getElementById("canvasFlechas");
canvSel = document.getElementById("canvasBolitaSeleccionada");

lapizBolitaSel = canvSel.getContext("2d");
ctx = canv.getContext("2d");

const factorAmpliacionGrafo = 50; //Las coordenadas que llegan de la base de datos deben ser escaladas usando este factor para ajustarse a los tamaños locales.
const anchoBolitaNodo = 90;

function retrazarFlechas() {
    $(canv).css("top", infoGrafo.bordes.bottom + "px");
    $(canv).css("left", infoGrafo.bordes.left + "px");

    $(canvSel).css("top", infoGrafo.bordes.bottom + "px");
    $(canvSel).css("left", infoGrafo.bordes.left + "px");

    console.log(`retrazando flechas con infoGrafo: ${JSON.stringify(infoGrafo)}`);
    ctx.canvas.width = infoGrafo.bordes.right - infoGrafo.bordes.left;
    ctx.canvas.height = infoGrafo.bordes.top - infoGrafo.bordes.bottom;
    lapizBolitaSel.canvas.width = infoGrafo.bordes.right - infoGrafo.bordes.left;
    lapizBolitaSel.canvas.height = infoGrafo.bordes.top - infoGrafo.bordes.bottom;

    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    for (var nodo of Object.values(aNodos).filter(n => n.ubicado)) {
        console.log(`Trazando las flechas de ${JSON.stringify(nodo)}`);
        for (var vinculo of nodo.vinculos.filter(v => v.rol == "source")) {
            console.log(`linea de ${nodo.nombre} hacia ${aNodos[vinculo.idRef].nombre}`);
            const finx = aNodos[vinculo.idRef].coordx;
            const finy = aNodos[vinculo.idRef].coordy;
            trazarFlechaContinuacion({ x: nodo.coordx, y: nodo.coordy }, { x: finx, y: finy });
        }
    }
}

function trazarFlechaContinuacion(inicio, fin) {

    const largoAlas = 10;

    inicio.x = inicio.x + (anchoBolitaNodo / 2) - (infoGrafo.bordes.left);
    inicio.y = inicio.y + (anchoBolitaNodo / 2) - (infoGrafo.bordes.bottom);
    fin.x = fin.x + (anchoBolitaNodo / 2) - (infoGrafo.bordes.left);
    fin.y = fin.y + (anchoBolitaNodo / 2) - (infoGrafo.bordes.bottom);

    ctx.moveTo(inicio.x, inicio.y);
    ctx.lineTo(fin.x, fin.y);

    const intermedio = new Object({ x: ((inicio.x + fin.x) / 2), y: ((inicio.y + fin.y) / 2) });
    var anguloEnlace = Math.atan((fin.y - inicio.y) / (fin.x - inicio.x));

    if ((fin.y - inicio.y) == 0 && (fin.x - inicio.x) < 0) {
        anguloEnlace = Math.PI;
    }
    else if ((fin.y - inicio.y) < 0 && (fin.x - inicio.x) == 0) {
        anguloEnlace = Math.PI * 3 / 2;
    }
    else if (anguloEnlace < 0 && (fin.x - inicio.x) < 0) {
        anguloEnlace = anguloEnlace + Math.PI;
    }
    if ((fin.x - inicio.x) < 0 && (fin.y - inicio.y) < 0) {
        console.log(`(Cuarto cuadrante. Invirtiendo ángulo)`);
        anguloEnlace += Math.PI;
    }

    console.log(`(${fin.x - inicio.x}) -> (${fin.y - inicio.y}), angulo: ${anguloEnlace * 180 / Math.PI}, anguloFlechaDerecha: ${(anguloEnlace + (Math.PI * 7 / 8)) * 180 / Math.PI}`);
    const alaDerecha = new Object({ x: intermedio.x + (largoAlas * Math.cos(anguloEnlace + (Math.PI * 7 / 8))), y: intermedio.y + (largoAlas * Math.sin(anguloEnlace + (Math.PI * 7 / 8))) });
    const alaIzquierda = new Object({ x: intermedio.x + (largoAlas * Math.cos(anguloEnlace + (Math.PI * 9 / 8))), y: intermedio.y + (largoAlas * Math.sin(anguloEnlace + (Math.PI * 9 / 8))) });

    ctx.moveTo(intermedio.x, intermedio.y);
    ctx.lineTo(alaIzquierda.x, alaIzquierda.y);

    ctx.moveTo(intermedio.x, intermedio.y);
    ctx.lineTo(alaDerecha.x, alaDerecha.y);

    ctx.stroke();
}

function trazarFlechaEntreNodos(idUno, idOtro, color) {
    console.log(`trazando flecha entre ${aNodos[idUno].nombre} y ${aNodos[idOtro].nombre} de color ${color}`);
    const inicio = {
        x: parseInt($(`#${idUno}`).css("left")) + (anchoBolitaNodo / 2) - infoGrafo.bordes.left,
        y: parseInt($(`#${idUno}`).css("top")) + (anchoBolitaNodo / 2) - infoGrafo.bordes.bottom
    };
    const fin = {
        x: parseInt($(`#${idOtro}`).css("left")) + (anchoBolitaNodo / 2) - infoGrafo.bordes.left,
        y: parseInt($(`#${idOtro}`).css("top")) + (anchoBolitaNodo / 2) - infoGrafo.bordes.bottom
    };
    lapizBolitaSel.beginPath();
    lapizBolitaSel.strokeStyle = color;


    lapizBolitaSel.moveTo(inicio.x, inicio.y);
    lapizBolitaSel.lineTo(fin.x, fin.y);

    
    const intermedio = new Object({ x: ((inicio.x + fin.x) / 2), y: ((inicio.y + fin.y) / 2) });
    var anguloEnlace = Math.atan((fin.y - inicio.y) / (fin.x - inicio.x));

    if ((fin.y - inicio.y) == 0 && (fin.x - inicio.x) < 0) {
        anguloEnlace = Math.PI;
    }
    else if ((fin.y - inicio.y) < 0 && (fin.x - inicio.x) == 0) {
        anguloEnlace = Math.PI * 3 / 2;
    }
    else if (anguloEnlace < 0 && (fin.x - inicio.x) < 0) {
        anguloEnlace = anguloEnlace + Math.PI;
    }
    if ((fin.x - inicio.x) < 0 && (fin.y - inicio.y) < 0) {
        anguloEnlace += Math.PI;
    }
    const largoAlas=15;
    const alaDerecha = new Object({ x: intermedio.x + (largoAlas * Math.cos(anguloEnlace + (Math.PI * 7 / 8))), y: intermedio.y + (largoAlas * Math.sin(anguloEnlace + (Math.PI * 7 / 8))) });
    const alaIzquierda = new Object({ x: intermedio.x + (largoAlas * Math.cos(anguloEnlace + (Math.PI * 9 / 8))), y: intermedio.y + (largoAlas * Math.sin(anguloEnlace + (Math.PI * 9 / 8))) });

    lapizBolitaSel.moveTo(intermedio.x, intermedio.y);
    lapizBolitaSel.lineTo(alaIzquierda.x, alaIzquierda.y);

    lapizBolitaSel.moveTo(intermedio.x, intermedio.y);
    lapizBolitaSel.lineTo(alaDerecha.x, alaDerecha.y);


    lapizBolitaSel.stroke();
    
}

function cancelarClasesDeBolitas() {
    $(".bolitaNodo").removeClass("optandoVinculoAsTarget");
    $(".bolitaNodo").removeClass("optandoVinculoAsSource");
    $(".bolitaNodo").removeClass("optandoDesvinculacionUno");
    $(".bolitaNodo").removeClass("esperandoClick");
    $(".bolitaNodo").removeClass("noclickable");
}

function seleccionarNodo(idNodo) {
    console.log(`limpiando el canvas de flechas de selección`);
    var nodo=$(`#${idNodo}`);
    $(".bolitaNodo").removeClass("seleccionado");
    $(".bolitaNodo").removeClass("vinculoDelSeleccionado");


    nodo.addClass("seleccionado");

    const centro = {
        x: document.getElementById("diagrama").offsetWidth / 2,
        y: document.getElementById("diagrama").offsetHeight / 2
    };
    const posxNodo = $(`#${idNodo}`).css("left");
    const posyNodo = $(`#${idNodo}`).css("top");

    console.log(`centrando vista en ${aNodos[idNodo].nombre} ubicado en ${posxNodo}, ${posyNodo}`);
    $("#contenedorNodosUbicados").css("top", (centro.y - parseInt(posyNodo)) + "px");
    $("#contenedorNodosUbicados").css("left", (centro.x - parseInt(posxNodo)) + "px");

    lapizBolitaSel.clearRect(0, 0, lapizBolitaSel.canvas.width, lapizBolitaSel.canvas.height);
    lapizBolitaSel.beginPath();

    for (var vinc of getVinculos(idNodo)) {
        $(`#${vinc.idRef}`).addClass("vinculoDelSeleccionado");

        if (vinc.rol == "source") {
            let color = "#0000FF";
            trazarFlechaEntreNodos(idNodo, vinc.idRef, color);
        }
        else {
            let color = "#FF0000";
            trazarFlechaEntreNodos(vinc.idRef, idNodo, color);
        }

    }

}

function getVinculos(idNodo, niveles) {
    return aNodos[idNodo].vinculos;
}

function actualizarNodosLocal(nodos, grafo) {
    for (var [idN, nodo] of Object.entries(nodos)) {
        if (idN in aNodos) console.log(`introduciendo la informacion para ${aNodos[idN].nombre}: ${JSON.stringify(nodo)}`);
        if ("coordx" in nodo) nodo.coordx = nodo.coordx * factorAmpliacionGrafo;
        if ("coordy" in nodo) nodo.coordy = nodo.coordy * factorAmpliacionGrafo;
        if (!(nodo._id in aNodos)) aNodos[nodo._id] = new Object();
        for (var key of Object.keys(nodo)) {
            if (key == "_id") {
                continue;
            }
            aNodos[nodo._id][key] = nodo[key];
        }
    }
    console.log(`multiplicacion quedó con ${aNodos["5f871edc843f3b58e756362c"].vinculos.length}:`);
    for (var v of aNodos["5f871edc843f3b58e756362c"].vinculos) {
        console.log(`${aNodos[v.idRef].nombre}`);
    }
    if (grafo) {

        console.log(`introduciendo info de grafo: ${JSON.stringify(grafo)}`);
        infoGrafo = grafo;
        for (var coord of Object.keys(infoGrafo.bordes)) {
            infoGrafo.bordes[coord] *= factorAmpliacionGrafo;
        }
        infoGrafo.bordes.top += anchoBolitaNodo;
        infoGrafo.bordes.right += anchoBolitaNodo;

    }
}

function ubicarNodosEnDiagrama() {
    for (var [idNodo, nodo] of Object.entries(aNodos)) {
        if (nodo.ubicado) {
            $(`#${idNodo}`).css("top", nodo.coordy);
            $(`#${idNodo}`).css("left", nodo.coordx);
        }
    }
}

$(document).ready(function () {

    $("#diagrama").on("mousedown", function (e) {

        $(".menuContextualDiagrama").css("display", "none");
        console.log(`mousedown: ${e.which} en ${e.pageX}, ${e.pageY} sobre ${$(e.target).attr("class")}`);
        if (e.which != 1) return;

        var iniciox = e.pageX;
        var inicioy = e.pageY;
        let movimiento = false;

        $("#diagrama").on("mousemove", function (ev) {
            let deltax = Math.round((ev.pageX - iniciox));
            let deltay = Math.round((ev.pageY - inicioy));

            let distancia = Math.sqrt(Math.pow(deltax, 2) + Math.pow(deltay, 2));
            if (distancia > 20) movimiento = true;
            if (movimiento == true) {

                let viejoy = $("#contenedorNodosUbicados").css("top");
                let viejox = $("#contenedorNodosUbicados").css("left");

                console.log(`trasladando contenedor nodos ubicados`);
                let nuevox = parseInt(viejox) + parseInt(deltax);
                let nuevoy = parseInt(viejoy) + parseInt(deltay);

                $("#contenedorNodosUbicados").css("top", nuevoy + "px");
                $("#contenedorNodosUbicados").css("left", nuevox + "px");

                inicioy = ev.pageY;
                iniciox = ev.pageX;
            }

        });
    });

    $(document).on("mouseup", function () {
        $("#diagrama").off("mousemove");
    });

    jQuery.ajax({
        type: 'POST',
        url: 'api/nodos/todosNombres',
        dataType: 'text',
        contentType: 'application/json',
        data: "",
        success: function (resp) {
            resp = JSON.parse(resp);

            actualizarNodosLocal(resp.nodos, resp.grafo);
            for (var nodo of resp.nodos) {
                var nuevoNodo = $(codigoNodo);
                var iconoNodo = $("<img draggable='false' class='iconoBolitaNodo' src='api/nodos/iconos/" + nodo._id + "'>");
                nuevoNodo.find(".nombreBolitaNodo").html(nodo.nombre);
                nuevoNodo.attr("id", nodo._id);
                nuevoNodo.append(iconoNodo);

                if (!nodo.ubicado) {
                    //nuevoNodo.css("display", "none");
                    $("#contenedorNodosDesubicados").append(nuevoNodo);
                }
                else {
                    console.log(`${nodo.nombre} está ubicado`);
                    $("#contenedorNodosUbicados").append(nuevoNodo);

                }
            }
            ubicarNodosEnDiagrama();
            retrazarFlechas();


        },
        error: function (xhr, ajaxOptions, thrownError) {
            console.log('errores: ' + xhr + '**' + ajaxOptions + '**' + thrownError);
        }
    });

    $('.contenedorNodos, #diagrama').on('click', function () {
        cancelarClasesDeBolitas();
        $("#contenidoDelNodo").css("display", "none");
    });

    $('#contenedorNodos').on('contextmenu', function (e) {
        e.preventDefault();
        e.stopPropagation();
        $(".menuContextualDiagrama").css("display", "none");
        $("#menuContextualFondo").css("display", "block");

        const coords = { x: e.screenX + 3, y: e.screenY - 100 };
        $("#menuContextualFondo").css("top", `${coords.y}px`);
        $("#menuContextualFondo").css("left", `${coords.x}px`);
        $("#menuContextualFondo").css("display", "block");
    });

    $('.contenedorNodos').on('contextmenu', '.bolitaNodo', function (e) {
        e.preventDefault();
        e.stopPropagation();
        const coords = { x: e.screenX + 3, y: e.screenY - 100 };
        const idNodo=$(this).attr("id");

        $("#infoIdNodo").html(idNodo);
        $(".menuContextualDiagrama").css("display", "none");
        $("#menuContextualBolitaNodo").attr("idRef", $(this).attr("id"));

        $("#menuContextualBolitaNodo").css("display", "block");
        $("#menuContextualBolitaNodo").css("top", `${coords.y}px`);
        $("#menuContextualBolitaNodo").css("left", `${coords.x}px`);
        $("#menuContextualBolitaNodo").css("display", "block");
    });

    $("#updateIconoBolitaNodo").on("click", function () {
        const idRef = $(this).closest(".menuContextualDiagrama").attr("idRef");
        console.log(`click en update icono para id ${idRef}`);
        $(".menuContextualDiagrama").css("display", "none");
        $(`#${idRef}`).closest(".bolitaNodo").find(".inputIconoBolitaNodo").trigger("click");
    });

    $('.contenedorNodos').on('change', '.inputIconoBolitaNodo', function () {
        var datos = new FormData();
        datos.append("idNodo", $(this).closest(".bolitaNodo").attr("id"));
        datos.append("nuevoIcono", $(this).prop("files")[0]);
        //console.log(`enviando nuevo icono con datos: : `);
        $.ajax({
            type: 'POST',
            url: 'api/nodos/updateIcono',
            processData: false,
            contentType: false,
            data: datos,
            success: function (resp) {
                console.log(`respuesta: ${JSON.stringify(resp)}`);
                //resp=JSON.parse(resp);

            },
            error: function (xhr, ajaxOptions, thrownError) {
                console.log('errores: ' + xhr + '**' + ajaxOptions + '**' + thrownError);
            }
        });
    });

    $('.itemMenuContextual').on('click', function () {
        const menuCx = $(this).closest(".menuContextualDiagrama");
        menuCx.css("display", "none");
    });

    $('#vincularAsSource').on('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        const menuCx = $(this).closest("#menuContextualBolitaNodo");
        const idSource = menuCx.attr("idRef");
        var bolitaSource = $(`#${idSource}`);

        $(".bolitaNodo").addClass("optandoVinculoAsTarget esperandoClick");

        bolitaSource.removeClass("esperandoClick");
        bolitaSource.removeClass("optandoVinculoAsTarget");
        bolitaSource.addClass("optandoVinculoAsSource");
        bolitaSource.addClass("noclickable");

        menuCx.css("display", "none");
    });

    $('#vincularAsTarget').on('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        const menuCx = $(this).closest("#menuContextualBolitaNodo");
        const idTarget = menuCx.attr("idRef");
        var bolitaTarget = $(`#${idTarget}`);

        $(".bolitaNodo").addClass("optandoVinculoAsSource esperandoClick");

        bolitaTarget.removeClass("esperandoClick");
        bolitaTarget.removeClass("optandoVinculoAsSource");
        bolitaTarget.addClass("optandoVinculoAsTarget");
        bolitaTarget.addClass("noclickable");

        menuCx.css("display", "none");
    });

    $("#desvincularNodoDeTarget").on("click", function () {

        const menuCx = $(this).closest("#menuContextualBolitaNodo");
        const idNodo = menuCx.attr("idRef");
        var bolitaNodoUno = $(`#${idNodo}`);
        bolitaNodoUno.addClass("optandoDesvinculacionUno");
        $(".bolitaNodo").addClass("noclickable");

        for (var vinc of getVinculos(idNodo)) {
            $(`#${vinc.idRef}`).removeClass("noclickable");
            $(`#${vinc.idRef}`).addClass("optandoDesvinculacion esperandoClick");
        }
        menuCx.css("display", "none");

    });

    $('#crearNodoDespues').on('click', function () {
        const menuCx = $(this).closest("#menuContextualBolitaNodo");
        const idNodo = menuCx.attr("idRef");
        datos = {
            vinculo: {
                idRef: idNodo,
                tipo: "continuacion",
                rol: "target"
            }
        }

        jQuery.ajax({
            type: 'POST',
            url: 'api/nodos/crear',
            dataType: 'text',
            contentType: 'application/json',
            data: JSON.stringify(datos),
            success: function (resp) {
                resp = JSON.parse(resp);
                console.log(`nuevo nodo: ${JSON.stringify(resp.nuevoNodo)}`);

            },
            error: function (xhr, ajaxOptions, thrownError) {
                console.log('errores: ' + xhr + '**' + ajaxOptions + '**' + thrownError);
            }
        });
    });

    $('#crearNodoAntes').on('click', function () {
        const menuCx = $(this).closest("#menuContextualBolitaNodo");
        const idNodo = menuCx.attr("idRef");
        datos = {
            vinculo: {
                idRef: idNodo,
                tipo: "continuacion",
                rol: "source"
            }
        }

        jQuery.ajax({
            type: 'POST',
            url: 'api/nodos/crear',
            dataType: 'text',
            contentType: 'application/json',
            data: JSON.stringify(datos),
            success: function (resp) {
                resp = JSON.parse(resp);
                console.log(`nuevo nodo: ${JSON.stringify(resp.nuevoNodo)}`);
            },
            error: function (xhr, ajaxOptions, thrownError) {
                console.log('errores: ' + xhr + '**' + ajaxOptions + '**' + thrownError);
            }
        });
    });

    $('.contenedorNodos').on('click', '.bolitaNodo.optandoDesvinculacion.esperandoClick', function (e) {
        e.stopPropagation();
        console.log(`enviando peticion de desvinculacion`);
        const datos = {
            idUno: $(".optandoDesvinculacionUno:first").attr("id"),
            idOtro: $(this).attr("id")
        }
        jQuery.ajax({
            type: 'POST',
            url: 'api/nodos/desvincularDos',
            dataType: 'text',
            contentType: 'application/json',
            data: JSON.stringify(datos),
            success: function (resp) {
                resp = JSON.parse(resp);
                cancelarClasesDeBolitas();
                console.log(`pidiendo update de posicion de nodos: ${resp.posNodos}`);
                actualizarNodosLocal(resp.posNodos, resp.grafo);
                ubicarNodosEnDiagrama();
                retrazarFlechas();
            },
            error: function (xhr, ajaxOptions, thrownError) {
                console.log('errores: ' + xhr + '**' + ajaxOptions + '**' + thrownError);
            }
        });
    });

    $('.contenedorNodos').on('click', '.bolitaNodo.optandoVinculoAsTarget.esperandoClick', function (e) {
        e.stopPropagation();
        var datos = {
            idSource: $(".optandoVinculoAsSource:first").attr("id"),
            idTarget: $(this).attr("id")
        };
        console.log(`creando un vinculo de ${datos.idSource} hacia ${datos.idTarget}`);


        jQuery.ajax({
            type: 'POST',
            url: 'api/nodos/vincularBySourceTarget',
            dataType: 'text',
            contentType: 'application/json',
            data: JSON.stringify(datos),
            success: function (resp) {
                resp = JSON.parse(resp);
                seleccionarNodo(datos.idSource);
                cancelarClasesDeBolitas();
                console.log(`pidiendo actualizacion así. Nodos: ${resp.posNodos}, Grafo: ${resp.grafo}`);
                actualizarNodosLocal(resp.posNodos, resp.grafo);
                ubicarNodosEnDiagrama();
                retrazarFlechas();
            },
            error: function (xhr, ajaxOptions, thrownError) {
                console.log('errores: ' + xhr + '**' + ajaxOptions + '**' + thrownError);
            }
        });
    });

    $('.contenedorNodos').on('click', '.bolitaNodo.optandoVinculoAsSource.esperandoClick', function (e) {
        e.stopPropagation();
        var datos = {
            idTarget: $(".optandoVinculoAsTarget:first").attr("id"),
            idSource: $(this).attr("id")
        };
        console.log(`creando un vinculo de ${datos.idSource} hacia ${datos.idTarget}`);


        jQuery.ajax({
            type: 'POST',
            url: 'api/nodos/vincularBySourceTarget',
            dataType: 'text',
            contentType: 'application/json',
            data: JSON.stringify(datos),
            success: function (resp) {
                resp = JSON.parse(resp);
                seleccionarNodo(datos.idSource);
                cancelarClasesDeBolitas();
                console.log(`pidiendo actualizacion así. Nodos: ${resp.posNodos}, Grafo: ${resp.grafo}`);
                actualizarNodosLocal(resp.posNodos, resp.grafo);
                ubicarNodosEnDiagrama();
                retrazarFlechas();
            },
            error: function (xhr, ajaxOptions, thrownError) {
                console.log('errores: ' + xhr + '**' + ajaxOptions + '**' + thrownError);
            }
        });
    });

    $('#contenedorNodosUbicados').on('click', '.bolitaNodo', function () {//Seleccionando este nodo
        const idSelected = $(this).attr("id");
        console.log(`Seleccionando nodo`);
        seleccionarNodo(idSelected);
    });

    $('.contenedorNodos').on('dblclick', '.bolitaNodo',function(){
        console.log(`abriendo contenido de nodo`);
        const idNodo=$(this).attr("id");
        $("#contenidoDelNodo").css("display", "block");
        $("#contenidoDelNodo").attr("src", "contenidosNodos/"+idNodo);
    });

    $('#centrarEnNodo').on('click', function (e) {
        const menuCx = $(this).closest("#menuContextualBolitaNodo");
        menuCx.css("display", "none");
    });

    $(".contenedorNodos").on("click", function (e) {
        $(".menuContextualDiagrama").css("display", "none");
    });

    $('#crearNodo').on('click', function () {
        const datos = {
        }
        jQuery.ajax({
            type: 'POST',
            url: 'api/nodos/crear',
            dataType: 'text',
            contentType: 'application/json',
            data: JSON.stringify(datos),
            success: function (resp) {
                resp = JSON.parse(resp);
                console.log(`nuevo nodo: ${JSON.stringify(resp.nuevoNodo)}`);
            },
            error: function (xhr, ajaxOptions, thrownError) {
                console.log('errores: ' + xhr + '**' + ajaxOptions + '**' + thrownError);
            }
        });
    });

    $('#modoParrilla').on('click', function () {
        $(".bolitaNodo").css("display", "inline-block");
        $(".bolitaNodo").removeClass("nodoModoRed");
        $(".bolitaNodo").addClass("nodoModoParrilla");

    });

    $('.contenedorNodos').on('keydown', '.nombreBolitaNodo', function (e) {
        if (e.which == 13) {
            e.stopPropagation();
            e.preventDefault();
            $(this).trigger("focusout");
        }
    });

    $('.contenedorNodos').on('input paste', '.nombreBolitaNodo', function () {
        $(this).addClass("editandose");
    });

    $('.contenedorNodos').on('focusout', '.nombreBolitaNodo', function () {
        if (!$(this).hasClass("editandose")) {
            return;
        }
        var campoNombre = $(this);

        const datos = {
            idNodo: $(this).closest(".bolitaNodo").attr("id"),
            nuevoNombre: $(this).html()
        }
        jQuery.ajax({
            type: 'POST',
            url: 'api/nodos/renombrar',
            dataType: 'text',
            contentType: 'application/json',
            data: JSON.stringify(datos),
            success: function (resp) {
                resp = JSON.parse(resp);
                $(`#${datos.idNodo}`).find(".nombreBolitaNodo").html(resp.nodo.nombre);
                campoNombre.removeClass("editandose");
            },
            error: function (xhr, ajaxOptions, thrownError) {
                console.log('errores: ' + xhr + '**' + ajaxOptions + '**' + thrownError);
            }
        });
    });


});