import mongoose from "mongoose";


export var esquemaTrabajo = new mongoose.Schema();


esquemaTrabajo.add({
    nombre: {
        type: String,
        required: true,
        min: 3,
        max: 600,
        default:"Nuevo trabajo"
    },
    descripcion: {
        type: String,
        max: 10000,
        default:""
    },
    responsables:{
        type: [String],
        default: []
    },
    nodosConocimiento:{
        type:[String],
        default:[]
    },
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

export const ModeloTrabajo = mongoose.model("Trabajo", esquemaTrabajo);
