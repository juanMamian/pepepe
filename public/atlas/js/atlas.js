var codigoNodo = "<div class='bolitaNodo'><div class='nombreBolitaNodo' contenteditable='true'></div><input type='file' class='inputIconoBolitaNodo'></input></div>"

var aNodos = new Object();

function cancelarClasesDeBolitas() {
    $(".bolitaNodo").removeClass("optandoVinculoAsTarget");
    $(".bolitaNodo").removeClass("optandoVinculoAsSource");
    $(".bolitaNodo").removeClass("noclickable");
}

function centrarVistaEn(idNodo) {

}

function getVinculos(idNodo, niveles) {
    console.log(`vinculos en ${idNodo}: ${JSON.stringify(aNodos[idNodo].vinculos)}`);
    return aNodos[idNodo].vinculos;
}

function actualizarNodosLocal(nodos) {
    for (var nodo of nodos) {
        if (!(nodo._id in aNodos)) aNodos[nodo._id] = new Object();
        aNodos[nodo._id].nombre = nodo.nombre;
        aNodos[nodo._id].vinculos = nodo.vinculos;
    }
}

$(document).ready(function () {

    jQuery.ajax({
        type: 'POST',
        url: 'api/nodos/todosNombres',
        dataType: 'text',
        contentType: 'application/json',
        data: "",
        success: function (resp) {
            resp = JSON.parse(resp);
            actualizarNodosLocal(resp.nodos);
            for (var nodo of resp.nodos) {
                var nuevoNodo = $(codigoNodo);
                var iconoNodo = $("<img class='iconoBolitaNodo' src='api/nodos/iconos/" + nodo._id + "'>");
                nuevoNodo.find(".nombreBolitaNodo").html(nodo.nombre);
                nuevoNodo.attr("id", nodo._id);
                nuevoNodo.append(iconoNodo);
                $("#contenedorNodos").append(nuevoNodo);

            }

        },
        error: function (xhr, ajaxOptions, thrownError) {
            console.log('errores: ' + xhr + '**' + ajaxOptions + '**' + thrownError);
        }
    });

    $('#contenedorNodos').on('click', function () {
        cancelarClasesDeBolitas();
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

    $('#contenedorNodos').on('contextmenu', '.bolitaNodo', function (e) {
        e.preventDefault();
        e.stopPropagation();
        const coords = { x: e.screenX + 3, y: e.screenY - 100 };

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

    $('#contenedorNodos').on('change', '.inputIconoBolitaNodo', function () {
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

    $('#contenedorNodos').on('click', '.bolitaNodo.optandoVinculoAsTarget.esperandoClick', function (e) {
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
                centrarVistaEn(datos.idSource);
            },
            error: function (xhr, ajaxOptions, thrownError) {
                console.log('errores: ' + xhr + '**' + ajaxOptions + '**' + thrownError);
            }
        });
    });

    $('#contenedorNodos').on('click', '.bolitaNodo.optandoVinculoAsSource.esperandoClick', function (e) {
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
                centrarVistaEn(datos.idSource);
            },
            error: function (xhr, ajaxOptions, thrownError) {
                console.log('errores: ' + xhr + '**' + ajaxOptions + '**' + thrownError);
            }
        });
    });
    $('#centrarEnNodo').on('click', function (e) {
        const menuCx = $(this).closest("#menuContextualBolitaNodo");
        const idNodo = menuCx.attr("idRef");
        const nodo = $("#" + idNodo);

        console.log(`centrando la vista en el nodo con id ${idNodo}`);

        $(".bolitaNodo").css("display", "none");
        nodo.css("display", "block");
        var vinculosDelNodo=getVinculos(idNodo);
        console.log(`vinculos del nodo recibidos: ${vinculosDelNodo}`);
        for (vinculo of vinculosDelNodo) {
            
            let idV = vinculo.idRef;
            console.log(`revelando al vinculo ${idV}`);
            $(`#${idV}`).css("display", "block");
        }

    });


    $("#contenedorNodos").on("click", function (e) {
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

    $('#contenedorNodos').on('keydown', '.nombreBolitaNodo', function (e) {
        if (e.which == 13) {
            e.stopPropagation();
            e.preventDefault();
            $(this).trigger("focusout");
        }

    });


    $('#contenedorNodos').on('input paste', '.nombreBolitaNodo', function () {
        $(this).addClass("editandose");
    });

    $('#contenedorNodos').on('focusout', '.nombreBolitaNodo', function () {
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