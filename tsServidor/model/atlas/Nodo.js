const mongoose = require("mongoose");


const esquemaNodo = new mongoose.Schema();

esquemaNodo.add({
    nombre: {
        type: String,
        min: 3,
        max: 50,
        required: true,
        default: "nodo de conocimiento"
    },
    icono: {
        type: Buffer
    },
    vinculos: [
        {
            idRef: {
                type: mongoose.ObjectId,
                required:true
            },
            rol: {
                type: String,
                required: true
            },
            tipo: {
                type: String,
                required: true,
                default: "continuacion"
            }
        }
    ],
    coordsManuales:{
        x: Number,
        y:Number
    },
    coordx:Number,
    coordy:Number,
    radio: Number,
    angulo: Number,
    direccion:Number,
    ubicado:Boolean

});

esquemaNodo.methods.verificarVinculo=function(idRef, eliminar){
    console.log(`${this.nombre} está buscando un vinculo con ${idRef}. Eliminar es ${eliminar}`);
    var respuesta=false;
    for(var vinculo of this.vinculos){
        if(vinculo.idRef==idRef){
            console.log(`encontrado`);
            respuesta=true;
            if(eliminar){
                console.log(`eliminando`);
                vinculo.remove();
            }
        }
    }
    return respuesta;
}


module.exports.modeloNodo = mongoose.model("Nodo", esquemaNodo);