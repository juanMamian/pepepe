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
    ]
});

module.exports.modeloNodo = mongoose.model("Nodo", esquemaNodo);