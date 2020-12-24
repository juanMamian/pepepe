const mongoose = require("mongoose");

const esquemaTrabajo = new mongoose.Schema();


esquemaTrabajo.add({
    nombre: {
        type: String,
        required: true,
        min: 3,
        max: 600,
        default:"nuevo trabajo"
    },
    descripcion: {
        type: String,
        max: 10000
    },
    responsables: [
        {
            id: String
        }
    ],
    materiales: [
        {
            id: {
                type: String,
                min: 24,
                max: 24
            },
            nombre: {
                type: String,
                min: 2,
                max: 500
            },
            descripcion: {
                type: String
            },
            cantidad: Number,
            unidadReferencia: Number,
            valor_unitario: Number,
        }
    ],
    conocimientosVinculados:[
        {
            idRef:{
                type:String,
                required:true
            },
            nombre: String,
            tipoVinculo:{
                type:String,
                required:true,
                default:"requiere"
            }            
        }
    ],   
    subtrabajos: [
        esquemaTrabajo
    ],
    vinculos: [
        {
            tipoTarget: {
                type: String,
                required: true
            },
            ref: {
                type: String,
                required: true
            },
            tipoVinculo: {
                type: String,
                required: true
            }
        }
    ],
    enlacesProyectos: [{
        pathId: [String],
        tipo: String
    }],
    estado: String,
    fila: Number,
    columna: Number
});

//module.exports.modeloTrabajo = mongoose.model("Trabajo", esquemaTrabajo);
module.exports.esquemaTrabajo = esquemaTrabajo;
