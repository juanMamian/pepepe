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


function dibujarElemento(element, tipo, parent) {
    const padre= parent ? parent : $(".elementoDiagrama.activo:first");
    console.log("dibujando elemento "+tipo);
    var divElemento="";
    switch(tipo){
        case "proyecto":
             divElemento = `<div id=${element._id} class="diagProyecto elementoDiagrama" nivel=1><div class='tituloElemento' contenteditable='true'>${element.nombre}</div></div>`;
        break;
        case "objetivo":
            divElemento = `<div id=${element._id} class="diagObjetivo elementoDiagrama" nivel=1><div class='tituloElemento' contenteditable='true'>${element.nombre}</div></div>`;
        break;
    }
    
    padre.append(divElemento);
    return padre.find(`#${element.nombre}`);
}

function ubicarseEnDiagrama(nivel, aId) {
    //Vista de proyectos - nivel 0    
    $(".primerPlano").removeClass("primerPlano");
    
    var i=0;
    for (i = 0; i < aId.length; i++) {
        //Ocultar todos los elementos de este nivel excepto el seleccionado mediante idSel           
        $(`#${aId[i]}`).addClass("primerPlano");

    }
    //Clase "activo" para el último elemento en primer plano. Revelar los children de este elemento activo
    console.log(`activando ${aId[i-1]}`);
    $(".activo").removeClass("activo");
    $(`#${aId[i-1]}`).addClass("activo");
    $(".enLista").removeClass("enLista");
    $(".activo:first").children().addClass("enLista");
}

function dibujarObjetivos(element){
    objs = element.objetivos.length>0 ? element.objetivos : null;
    
    if(objs){
        console.log("objetivos encontrados: "+objs);
        objs.forEach(objetivo => {
            dibujarElemento(objetivo, "objetivo", $(`#${element._id}`));
            dibujarObjetivos(objetivo) ;
        });
    }
}

function dibujarDiagrama(){                                                  //Dibujar el diagrama completo
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
        const padre=$("elementoDiagrama.activo:first");
        const pathId=getPathIds(padre);
        console.log("creacion: " + creacion);
        switch (creacion) {                                                 //Creando un objetivo
            case "objetivo":
                jQuery.ajax({
                    type: "POST",
                    url: "api/objetivos/crear",
                    dataType: "text",
                    data: {
                        pathId: pathId
                    },
                    success: function (res) {
                        nElemento = JSON.parse(res).objetivo;
                        dibujarElemento(nElemento, "objetivo");
                    },
                    error: function (xhr, ajaxOptions, thrownError) {
                        console.log(thrownError);
                    }

                });
                break;
            case "tarea":
                console.log("creando una tarea");
            break;

        }
        /*
                console.log("creando un nuevo proyecto");
                jQuery.ajax({
                    type: "POST",
                    url: "api/proyectos/crear",
                    dataType: "text",
                    data: {
        
                    },
                    success: function (res) {
                        nProyecto = JSON.parse(res);
                        dibujarProyecto(nProyecto);
                    },
                    error: function (xhr, ajaxOptions, thrownError) {
                        console.log(thrownError);
                    }
        
                });
        */
    });
    $("#contenedorDiagrama").on("dblclick", ".elementoDiagrama:not(.primerPlano)", function (e) {//Abrir un elemento
        e.stopPropagation();

        var nivel = $(this).parents(".elementoDiagrama").length;
        var id = $(this).attr("id");
        var idElementoAnterior = $(`.itemNBDiagrama[nivel="${nivel - 1}"]`).attr("idSel");
        console.log(`expandiendo a ${id} del nivel ${nivel} despues de ${idElementoAnterior}`);

        //Añadir un elemento a la barra de navegacion
        
        `.itemNBDiagrama:eq(${nivel})` ? $(`.itemNBDiagrama:eq(${nivel})`).remove() : console.log("");
        const nuevoItem = `<div class='itemNBDiagrama' id="itemNBDiagrama${id}" nivel='${nivel}' idSel="${id}">` + $(this).find(".tituloElemento").html() + "</div>";
        $(nuevoItem).insertAfter($(`#itemNBDiagrama${idElementoAnterior}`));

        //Crear el array de direccion en el diagrama
        var arrayId = new Array();
        for (var i = 0; i <= nivel; i++) {
            arrayId[i] = $(`.itemNBDiagrama[nivel="${i}"]`).attr("idSel");
            console.log(`guardando ${$(`.itemNBDiagrama[nivel="${i}"]`).attr("idSel")} en el array`);
        }

        ubicarseEnDiagrama(nivel, arrayId);

    });
    $("#contenedorProyectos").on("input", ".tituloElemento", function(){
        $(this).addClass("editado");
    });
    $("#contenedorProyectos").on("keydown", ".tituloElemento", function(e){                                    //
        if(e.keyCode==13){
            $(this).blur();
        }
    });

    $("#contenedorProyectos").on("focusout", ".tituloElemento.editado", function(){                                    //Renombrando el elemento después de que el título ha perdido foco
        const elTitulo=$(this);
        const elElem=$(this).closest(".elementoDiagrama");
        console.log($(this).html());
        const nuevoN=$(this).html().replace(/(<([^>]+)>)/gi, "").replace(/\&nbsp;/gi, "").replace(/[^a-zA-ZÀ-Üà-ü0-9 ]/gi, "").replace(/\s\s+/g, ' ');

        const pathId=getPathIds(elElem);
        pathId.shift();
        const data={                
            pathId: pathId,
           nombre: nuevoN
        };
        console.log("replaced: "+nuevoN);
        jQuery.ajax({
            type: "POST",
            url: "api/proyectos/elementosDiagrama/renombrar",
            contentType: "application/json",            
            data:JSON.stringify(data),
            success: function (res) {
                console.log("res: "+JSON.stringify(res));
                proyecto = res;
                //Dibujar los proyectos.
                elTitulo.removeClass("editado");
                elTitulo.html(nuevoN);
                $(".itemNBDiagrama[idSel='"+elElem.attr("id")+"']").html(nuevoN);
            },
            error: function (xhr, ajaxOptions, thrownError) {
                console.log(thrownError);
            }
    
        });
        $(this).removeClass("editado");
    });

    $("#navbarDiagrama").on("click", ".itemNBDiagrama", function () {
        var nivel = $(this).attr("nivel");
        var esteId = $(this).attr("idSel")
        var elElem = $("#" + esteId);

        var idSel = getPathIds(elElem);

        ubicarseEnDiagrama(nivel, idSel);
    })
});