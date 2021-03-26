import mongoose from "mongoose";

const esquemaAudioEmbeded = new mongoose.Schema({
    archivo:Buffer,
    tipoReproduccion:{
        type:String,
        enum:["hover", "click"],
        default:"click",
    }
});

const esquemaCuadrosImagen= new mongoose.Schema({
    archivo:{
        type:Buffer,
    },
    archivoSecundario:{
        type: Buffer,
    },
    tipoActivacionSecundario:{
        type:String,
        enum: ["hover", "click"],
        default:"hover",
    },
    posicion:{
        x:Number,
        y:Number,
    },
    size:{
        x:Number,
        y:Number,
    },    
    originalSize:{
        x:Number,
        y:Number,
    },
    audio:{
        type:esquemaAudioEmbeded
    }
});

const esquemaCuadroTexto = new mongoose.Schema({
    texto:{
        type: String,
        max:3000,
    },
    posicion:{
        x:Number,
        y: Number,
    },
    size:{
        x:Number,
        y:Number,
    },
    formato:{
        alineacion:{
            type:String,
            default:"left"
        },
        fontSize:{
            type:Number,
            default:15,            
        },
        colorLetra:{
            type:String,
            max:40,
            default:"#000000"
        },
        tipoLetra:{
            type:String,
            default: "Arial"            
        }
    },
    audio: {
        type: esquemaAudioEmbeded,
    }

});

const esquemaPagina = new mongoose.Schema({
    cuadrosTexto:{
        type:[esquemaCuadroTexto],
        default:[],
    },
    cuadrosImagen:{
        type: [esquemaCuadrosImagen]
    },
    color:{
        type:String,
        max:30,
        default:"#000000"
    }
})

export const esquemaLibro = new mongoose.Schema({
    paginas:{
        type:[esquemaPagina],
        default:[],
    }
});

export const ModeloNodo=mongoose.model("Libro", esquemaLibro);