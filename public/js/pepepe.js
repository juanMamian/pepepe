loginToken = null;
estructuraProyectos = {};

function llenarDetallesElemento(elemento){
    
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
    var claseLista = "";
    const padre = parent ? parent : $(".elementoDiagrama.activo:first"); claseLista = "enLista";
    var divElemento = "";
    switch (tipo) {
        case "proyecto":
            divElemento = `<div id=${element._id} class="diagProyecto elementoDiagrama ${claseLista}" elemento='proyecto' ><div class='tituloElemento' contenteditable='true' >${element.nombre}</div></div>`;
            break;
        case "objetivo":
            divElemento = `<div id=${element._id} class="diagObjetivo elementoDiagrama  ${claseLista}" elemento='objetivo' ><div class='tituloElemento' contenteditable='true' >${element.nombre}</div></div>`;
            break;
        case "trabajo":
            divElemento = `<div id=${element._id} class="diagTrabajo elementoDiagrama  ${claseLista}" elemento='trabajo' ><div class='tituloElemento' contenteditable='true' >${element.nombre}</div></div>`;
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



function crearSubelementos(element) {
    const tipoPadre = element.attr("elemento");

    jQuery.ajax({
        type: "POST",
        url: "api/proyectos/elementos/getSubElementos",
        dataType: "text",
        contentType: "application/json",
        data: JSON.stringify({
            tipoPadre: tipoPadre,
            idElemento: element.attr("id")
        }),
        success: function (res) {
            //Dibujar los subElementos.
            res = JSON.parse(res);
            const aObjetivos = res.objetivos;
            const aTrabajos = res.trabajos;
            element.find(".elementoDiagrama").addClass(".paraEliminar");
            for (var i in aObjetivos) {
                console.log(`leido objetivo ${aObjetivos[i].nombre}. Verificando el id: ${aObjetivos[i]._id}`);
                if ($(`#${aObjetivos[i]._id}`).length == 0) {
                    dibujarElemento(aObjetivos[i], "objetivo", element);
                }
                else {
                    console.log(`objetivo ${aObjetivos[i].nombre} ya estaba presente.`);
                }
            }
            for (var j in aTrabajos) {
                console.log(`leido trabajo ${aTrabajos[j].nombre}`);
                if ($(`#${aTrabajos[j]._id}`).length == 0) {
                    dibujarElemento(aTrabajos[j], "trabajo", element);
                }
                else {
                    console.log(`trabajo ${aTrabajos[j].nombre} ya estaba presente`);
                }
            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            console.log(thrownError);
        }

    });
}

function dibujarDiagrama() {                                                  //Dibujar el diagrama completo
    console.log("dibujando diagrama");
    jQuery.ajax({
        type: "POST",
        url: "api/proyectos/listaCompleta",
        dataType: "text",
        contentType: "application/json",
        data: {

        },
        success: function (res) {
            //Dibujar los proyectos.
            console.log("lista completa proyectos: " + res);
            estructuraProyectos = JSON.parse(res);
            estructuraProyectos.forEach(proyecto => {
                dibujarElemento(proyecto, "proyecto", $("#contenedorProyectos"));
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
        const tipoPadre = padre.attr("elemento");
        const idPadre = padre.attr("id");

        console.log("creacion: " + creacion + " en " + padre.attr("id"));
        console.log("token: " + loginToken);
        switch (creacion) {                                                 //Creando un objetivo
            case "objetivo":
            case "trabajo":
                jQuery.ajax({
                    type: "POST",
                    url: "api/proyectos/elementos/crear",
                    dataType: "text",
                    contentType: "application/json",
                    data: JSON.stringify({
                        idPadre: idPadre,
                        tipoDocumento: creacion,
                        tipoPadre: tipoPadre
                    }),
                    success: function (res) {
                        console.log(res);
                        nElemento = JSON.parse(res).elemento;
                        console.log(nElemento);
                        dibujarElemento(nElemento, creacion);
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
                        dibujarElemento(nProyecto, "proyecto", "#contenedorProyecto");
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
                var funcionSuccess = function () {
                    console.log("funcion success no especificada");
                };
                var dataEliminar = null;
                const tipoElemento = elElem.attr("elemento");
                var urlRequest = "";
                const idElemento = elElem.attr("id");
                console.log(`enviando ${tipoElemento}:` + idElemento + " para eliminar");

                switch (tipoElemento) {
                    case "proyecto":
                        urlRequest = "api/proyectos/eliminar";
                        dataEliminar = {
                            idProyecto: idElemento
                        };
                        funcionSuccess = function (res) {
                            res = JSON.parse(res);
                            const idEliminado = res.eliminado._id;
                            $("#" + idEliminado).remove();
                        };
                        break;
                    case "objetivo":
                    case "trabajo":
                        const elPadre=elElem.parent().closest(".elementoDiagrama");
                        urlRequest = "api/proyectos/elementos/desconectar";
                        dataEliminar = {
                            idPadre:elPadre.attr("id"),
                            tipoPadre:elPadre.attr("elemento"),
                            idElemento: idElemento,
                            tipoElemento:tipoElemento
                        };
                        funcionSuccess = function (res) {
                            res = JSON.parse(res);
                            const idEliminado = res.eliminado._id;
                            $("#" + idEliminado).remove();
                        };
                        break;
                    default:
                        return console.log("error. Tipo de documento no conocido");
                }
                jQuery.ajax({
                    type: "POST",
                    url: urlRequest,
                    dataType: "text",
                    contentType: "application/json",
                    data: JSON.stringify(dataEliminar),
                    success: function (res) {
                        funcionSuccess(res);
                    },
                    error: function (xhr, ajaxOptions, thrownError) {
                        console.log("error en " + urlRequest);
                        console.log(thrownError);
                    }
                });

            }
        }
    });


    $("#contenedorDiagrama").on("dblclick", ".elementoDiagrama.enLista", function (e) {//Abrir un elemento
        e.stopPropagation();
        crearSubelementos($(this));
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

        llenarDetallesElemento();



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
        const nuevoNombre = $(this).html().replace(/(<([^>]+)>)/gi, "").replace(/\&nbsp;/gi, "").replace(/[^a-zA-ZÀ-Üà-ü0-9 ]/gi, "").replace(/\s\s+/g, ' ');
        const data = {
            id: elElem.attr("id"),
            nuevoNombre: nuevoNombre,
            tipoDocumento: elElem.attr("elemento")
        };
        jQuery.ajax({
            type: "POST",
            url: "api/proyectos/elementos/renombrar",
            contentType: "application/json",
            data: JSON.stringify(data),
            success: function (res) {
                elementoRespuesta = res.documento;
                console.log(res);

                elTitulo.removeClass("editado");
                elTitulo.html(elementoRespuesta.nombre);
                $(".itemNBDiagrama[idSel='" + elElem.attr("id") + "']").html(elementoRespuesta.nombre);
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
            $("#botonEnviarLogin").attr("disabled", false);
        }
        else {
            $("#botonEnviarLogin").attr("disabled", true);
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

    $("#botonEnviarLogin").click(function () {                                    ///LOGIN//////////////////
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
                $("#contenedorLogin").css("display", "none");
            },
            error: function (xhr, ajaxOptions, thrownError) {
                console.log(thrownError);
            }

        });


    });
});