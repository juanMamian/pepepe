const mongoose = require("mongoose");

const esquemaTrabajo = new mongoose.Schema({
    nombre:{
        type:String,
        required: true,
        min: 3,
        max: 600
    },
    descripcion:{
        type:String,
        max:10000
    },
    responsables:[
        {
            id:String
        }   
    ],
    materiales:[
        {
            id:{
                type:String,
                min:24,
                max:24
            },
            nombre:{
                type:String,
                min:2,
                max:500
            },
            descripcion:{
                type:String
            },
            cantidad: Number,
            unidadReferencia: Number,
            valor_unitario: Number,            
        }
    ],
    enlacesAtlas:[{
        id:{
            type:String,
            min: 24,
            max: 24
        },
        tipo:{
            type:String
        }
    

    }],
    enlacesProyectos:[{
        pathId: [String],
        tipo: String
    }]
});

module.exports.modeloTrabajo=mongoose.model("Trabajo", esquemaTrabajo);