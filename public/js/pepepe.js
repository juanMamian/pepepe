loginToken = null;

function eliminarElemento(pathId) {
    jQuery.ajax({
        type: "POST",
        url: "api/proyectos/elementos/eliminar",
        dataType: "text",
        contentType: "application/json",
        data: JSON.stringify({
            pathId: pathId
        }),
        success: function (res) {
            res = JSON.parse(res);
            const idEliminado = res.idEliminado;
            //Dibujar los proyectos.
            $("#" + idEliminado).remove();
        },
        error: function (xhr, ajaxOptions, thrownError) {
            console.log(thrownError);
        }

    });
}

function getPathIds(elElem) {
    var esteId = elElem.attr("id");
    var idSel = new Array();
    var index = elElem.parents(".elementoDiagrama").length;
    idSel[index] = esteId;
    elElem.parents(".elementoDiagrama").each(function () {
        index--;
        idSel[index] = $(this).attr("id");
    });
    return idSel;
}
function getPathIdsDB(elElem) {
    var esteId = elElem.attr("id");
    var idSel = new Array();
    var index = elElem.parents(".elementoDiagrama").length;
    idSel[index] = esteId;
    elElem.parents(".elementoDiagrama").each(function () {
        index--;
        idSel[index] = $(this).attr("id");
    });
    idSel.shift();
    return idSel;
}


function dibujarElemento(element, tipo, parent) {
    var claseLista="";
    const padre = parent ? parent : $(".elementoDiagrama.activo:first"); claseLista = "enLista";
    var divElemento = "";
    switch (tipo) {
        case "proyecto":
            divElemento = `<div id=${element._id} class="diagProyecto elementoDiagrama  ${claseLista}" nivel=1 ><div class='tituloElemento' contenteditable='true' >${element.nombre}</div></div>`;
            break;
        case "objetivo":
            divElemento = `<div id=${element._id} class="diagObjetivo elementoDiagrama  ${claseLista}" nivel=1 ><div class='tituloElemento' contenteditable='true' >${element.nombre}</div></div>`;
            break;
        case "trabajo":
            divElemento = `<div id=${element._id} class="diagTrabajo elementoDiagrama  ${claseLista}" nivel=1 ><div class='tituloElemento' contenteditable='true' >${element.nombre}</div></div>`;
    }

    padre.append(divElemento);
    return padre.find(`#${element._id}`);
}

function ubicarseEnDiagrama(nivel, aId) {
    //Vista de proyectos - nivel 0    
    $(".primerPlano").removeClass("primerPlano");

    var i = 0;
    for (i = 0; i < aId.length; i++) {
        //Ocultar todos los elementos de este nivel excepto el seleccionado mediante idSel           
        $(`#${aId[i]}`).addClass("primerPlano");

    }
    //Clase "activo" para el último elemento en primer plano. Revelar los children de este elemento activo
    console.log(`activando ${aId[i - 1]}`);
    $(".activo").removeClass("activo");
    $(`#${aId[i - 1]}`).addClass("activo");
    $(".enLista").removeClass("enLista");
    $(".activo:first").children().addClass("enLista");
}



function dibujarObjetivos(element) {
    objs = element.objetivos.length > 0 ? element.objetivos : null;
    trabajos = element.trabajos ? element.trabajos : [];
    if (trabajos.length > 0) {//Buscar y dibujar los trabajos
        console.log(`encontrados ${trabajos.length} trabajos en ${element.nombre}`);
        trabajos.forEach(trabajo => {
            dibujarElemento(trabajo, "trabajo", $(`#${element._id}`));    
        });
        
    }
    if (objs) {
        objs.forEach(objetivo => {
            dibujarElemento(objetivo, "objetivo", $(`#${element._id}`));
            dibujarObjetivos(objetivo);
        });
    }
}

function dibujarDiagrama() {                                                  //Dibujar el diagrama completo
    console.log("dibujando diagrama");
    jQuery.ajax({
        type: "POST",
        url: "api/proyectos/listaCompleta",
        dataType: "text",
        data: {

        },
        success: function (res) {
            proyectos = JSON.parse(res);
            //Dibujar los proyectos.
            proyectos.forEach(element => {
                dibujarElemento(element, "proyecto", $("#contenedorProyectos"));
                dibujarObjetivos(element);

            });
        },
        error: function (xhr, ajaxOptions, thrownError) {
            console.log(thrownError);
        }

    });

}

$(document).ready(function () {

    dibujarDiagrama();

    $(".botonCrear").on("click", function (e) {                         //Crear un nuevo elemento en el diagrama
        const creacion = $(this).attr("id").substr(2).toLowerCase();
        const padre = $(".elementoDiagrama.activo:first");
        const pathIds = getPathIdsDB(padre);

        console.log("creacion: " + creacion + " en " + padre.attr("id"));
        console.log("token: " + loginToken);
        switch (creacion) {                                                 //Creando un objetivo
            case "objetivo":
                jQuery.ajax({
                    type: "POST",
                    url: "api/proyectos/objetivos/crear",
                    dataType: "text",
                    contentType: "application/json",

                    data: JSON.stringify({
                        pathId: pathIds
                    }),
                    success: function (res) {
                        console.log(res);
                        nElemento = JSON.parse(res).objetivo;
                        console.log(nElemento);
                        dibujarElemento(nElemento, "objetivo");
                    },
                    error: function (xhr, ajaxOptions, thrownError) {
                        console.log(thrownError);
                    }

                });

                /*
                    jQuery.ajax({
                        beforeSend: function (request) {
                            request.setRequestHeader("loginToken", loginToken);
                        },
                        headers: {
                            Authorization: 'Bearer '+loginToken
                        },
                        type: "POST",
                        url: "api/proyectos/objetivos/crear",
                        dataType: "text",
                        contentType: "application/json",
                        data: JSON.stringify({
                            pathId: pathId
                        }),
                        success: function (res) {
                            const nElemento = JSON.parse(res).objetivo;
                            console.log("recibido: " + JSON.stringify(nElemento));
                            dibujarElemento(nElemento, "objetivo");
                        },
                        error: function (xhr, ajaxOptions, thrownError) {
                            console.log(thrownError);
                        }
    
                    });*/
                break;
            case "trabajo":
                const padre = $(".elementoDiagrama.primerPlano.activo:first");
                const pathId = getPathIdsDB(padre);
                console.log("creando un trabajo en " + padre.attr("id") + ` con pathId: ${pathId}`);

                jQuery.ajax({
                    type: "POST",
                    url: "api/proyectos/trabajos/crear",
                    dataType: "text",
                    contentType: "application/json",

                    data: JSON.stringify({
                        pathId: pathId,

                    }),
                    success: function (res) {
                        console.log(res);
                        nElemento = JSON.parse(res).trabajo;
                        console.log("nuevo Elemento: " + nElemento);
                        dibujarElemento(nElemento, "trabajo");
                    },
                    error: function (xhr, ajaxOptions, thrownError) {
                        console.log(thrownError);
                    }

                });

                break;
            case "proyecto":
                console.log("creando un nuevo proyecto");
                jQuery.ajax({
                    type: "POST",
                    url: "api/proyectos/crear",
                    dataType: "text",
                    contentType: "application/json",
                    headers: { "loginToken": loginToken },
                    data: {

                    },
                    success: function (res) {
                        nProyecto = JSON.parse(res).proyecto;
                        dibujarElemento(nProyecto, "proyecto");
                    },
                    error: function (xhr, ajaxOptions, thrownError) {
                        console.log(thrownError);
                    }

                });
                break;

        }


    });
    //Seleccionar un elemento
    $("#contenedorDiagrama").on("click", ".elementoDiagrama.enLista", function (e) {
        const seleccionado = $(this).hasClass("seleccionado");
        $(".seleccionado").removeClass("seleccionado");
        if (!seleccionado) {
            $(this).addClass("seleccionado");
        }

    });
    //Keydown para elementos diagrama
    $(document).on("keydown", function (e) {

        if ($(".elementoDiagrama.enLista.seleccionado").length > 0) {
            const elElem = $(".elementoDiagrama.enLista.seleccionado:first");
            e.stopPropagation();
            //tecla supr
            if (e.keyCode == 46) {
                const pathId = getPathIds(elElem);
                pathId.shift();
                eliminarElemento(pathId);
            }
        }

    });


    $("#contenedorDiagrama").on("dblclick", ".elementoDiagrama.enLista", function (e) {//Abrir un elemento
        e.stopPropagation();

        var nivel = $(this).parents(".elementoDiagrama").length;
        var id = $(this).attr("id");
        var idElementoAnterior = $(`.itemNBDiagrama[nivel="${nivel - 1}"]`).attr("idSel");
        //Añadir un elemento a la barra de navegacion

        `.itemNBDiagrama:eq(${nivel})` ? $(`.itemNBDiagrama:eq(${nivel})`).remove() : console.log("");
        const nuevoItem = `<div class='itemNBDiagrama' id="itemNBDiagrama${id}" nivel='${nivel}' idSel="${id}">` + $(this).find(".tituloElemento").html() + "</div>";
        $(nuevoItem).insertAfter($(`#itemNBDiagrama${idElementoAnterior}`));

        //Crear el array de direccion en el diagrama
        var arrayId = new Array();
        for (var i = 0; i <= nivel; i++) {
            arrayId[i] = $(`.itemNBDiagrama[nivel="${i}"]`).attr("idSel");
        }

        ubicarseEnDiagrama(nivel, arrayId);

    });
    $("#contenedorProyectos").on("input", ".tituloElemento", function () {
        $(this).addClass("editado");
    });
    $("#contenedorProyectos").on("keydown", ".tituloElemento", function (e) {                                    //Enter key en input titulo elemento
        if (e.keyCode == 13) {
            $(this).blur();
        }
    });



    $("#contenedorProyectos").on("focusout", ".tituloElemento.editado", function () {                                    //Renombrando el elemento después de que el título ha perdido foco
        const elTitulo = $(this);
        const elElem = $(this).closest(".elementoDiagrama");
        console.log($(this).html());
        const nuevoN = $(this).html().replace(/(<([^>]+)>)/gi, "").replace(/\&nbsp;/gi, "").replace(/[^a-zA-ZÀ-Üà-ü0-9 ]/gi, "").replace(/\s\s+/g, ' ');

        const pathId = getPathIds(elElem);
        pathId.shift();
        const data = {
            pathId: pathId,
            nombre: nuevoN
        };
        console.log("replacing: " + nuevoN);
        jQuery.ajax({
            type: "POST",
            url: "api/proyectos/elementosDiagrama/renombrar",
            contentType: "application/json",
            data: JSON.stringify(data),
            success: function (res) {
                console.log("res: " + JSON.stringify(res));
                proyecto = res;
                //Dibujar los proyectos.
                elTitulo.removeClass("editado");
                elTitulo.html(nuevoN);
                $(".itemNBDiagrama[idSel='" + elElem.attr("id") + "']").html(nuevoN);
            },
            error: function (xhr, ajaxOptions, thrownError) {
                console.log(thrownError);
            }

        });
    });


    $("#navbarDiagrama").on("click", ".itemNBDiagrama", function () {
        var nivel = $(this).attr("nivel");
        var esteId = $(this).attr("idSel")
        var elElem = $("#" + esteId);

        var idSel = getPathIds(elElem);

        ubicarseEnDiagrama(nivel, idSel);
    });

    $("#inputLogin, #inputPassword").on("input paste", function () {
        if ($("#inputLogin").val().length > 0 && $("#inputPassword").val().length > 0) {
            $("#bEnviarLogin").attr("disabled", false);
        }
        else {
            $("#bEnviarLogin").attr("disabled", true);
        }
    });

    $("#bAbrirLogin").on("click", function () {
        if (!$(this).hasClass("logged")) {
            $("#contenedorLogin").css("display", "block");
        }
        else { //Deslogearse
            loginToken = null
            $(this).removeClass("logged");
        }
    });

    $("#bEnviarLogin").click(function () {                                    ///LOGIN//////////////////
        const login = $("#inputLogin").val();
        const password = $("#inputPassword").val();

        const data = {
            login: login,
            password: password
        };
        console.log(`iniciando intento de login con ${login} y ${password}`);

        jQuery.ajax({
            type: "POST",
            url: "api/usuarios/login",
            dataType: "text",
            contentType: "application/json",
            data: JSON.stringify(data),
            success: function (res) {
                console.log("recibido token: " + res);
                res = JSON.parse(res);
                loginToken = res.token;
                $("#bAbrirLogin").addClass("logged");
                $("#infoLogeado").html(res.login);

            },
            error: function (xhr, ajaxOptions, thrownError) {
                console.log(thrownError);
            }

        });


    });
});