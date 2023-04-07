let charProhibidosNombreCosa = /[^ a-zA-ZÀ-ž0-9_():.,-]/;


export const validarNombreCosa = function(nombre){

    return !charProhibidosNombreCosa.test(nombre)
}