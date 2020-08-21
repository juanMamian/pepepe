
$(document).ready(function(){
    

    jQuery.ajax({
        type: "POST",
        url: "api/proyectos/listaCompleta",
        dataType: "text",
        data:{

        },
        success:function(res){
            proyectos=JSON.parse(res);
            //Dibujar los proyectos.
            proyectos.forEach(element => {
                document.write(element.nombre);
            });
            console.log(res);
        },
        error:function (xhr, ajaxOptions, thrownError){
            console.log(thrownError);
        }

    });
});