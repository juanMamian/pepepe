import mongoose from "mongoose";
import { EsquemaVinculosNodosSolidaridad } from "./VinculosNodosSolidaridad";
import { pubsub } from "../../index"
import { NODO_EDITADO, NODO_FAMILY_EDITADO, NODO_ELIMINADO, NODO_FAMILY_ELIMINADO } from "../../gql/AtlasSolidaridad"
import { esquemaArchivo } from "../Misc";

const EsquemaEvento=new mongoose.Schema({
    fecha:{
        type: Date,
        required:true,
        default: Date.now
    },
    nombre:{
        type:String,
        required:true,
        min:2,
        maxLength:50,
        default:"Nuevo evento",
    },
    tipo:{
        type:String,        
        required:true,
        min:2,
        maxLength:50,
        default:"Default",
    },
    descripcion:{
        type:String,
        maxLength: 500,
    },
})

const esquemaMovimientoDinero=new mongoose.Schema({
    fecha:{
        type: Date,
        required:true,
        default: Date.now
    },
    articulo:{
        type:String,
        required:true,
        min:2,
        maxLength:150,
        default:"Artículo",
    },
    unidad:{
        type:String,
        default:"Unidad",
        min:2,
        maxLength:50,
    },
    cantidad:{
        type:Number,
        default:1,
        min:0,
    },
    movimientoUnitario:{
        type: Number,
        default: 1000,
        
    },
    movimientoTotal:{
        type:Number,
        default:1000,
    },
    informacion:{
        type:String,
        maxLength: 500,
    },
    realizado:{
        type: Boolean,
        default: false,
    },
    adjuntos:{
        type: [esquemaArchivo],
        default: []
    }

})

const esquemaMaterial = new mongoose.Schema({
    nombre: {
        type: String,
        required: true,
        min: 3,
        max: 100,
        default: "Nuevo material"
    },
    descripcion: {
        type: String,
        max: 2000,
    },
    cantidadNecesaria: {
        type: Number,
        required: true,
        default: 1,
    },
    cantidadDisponible: {
        type: Number,
        required: true,
        default: 0,
    }

});

export const charProhibidosNombreRecursoExterno = /[^ a-zA-ZÀ-ž0-9_():.,-]/;

const esquemaRecursoExterno = new mongoose.Schema({
    nombre: {
        type: String,
        min: 2,
        max: 30,
        required: true,
        default: "Nuevo enlace"
    },
    descripcion: {
        type: String,
        max: 200,
    },
    link: {
        type: String,
        min: 6,
        max: 500,
    },
    tipo: {
        type: String,
        enum: ["vacio", "enlace", "hojaCalculo", "documentoTexto", "archivo"],
        default: "vacio",
    }
})

export var esquemaNodoSolidaridad = new mongoose.Schema();


esquemaNodoSolidaridad.add({
    nombre: {
        type: String,
        required: true,
        min: 3,
        max: 600,
        default: "Nuevo nodo de solidaridad"
    },
    descripcion: {
        type: String,
        max: 10000,
    },
    tipoNodo: {
        type: String,
        required: true,
        default: "trabajo",
        enum: ["trabajo", "objetivo"]
    },
    recursosExternos: {
        type: [esquemaRecursoExterno],
        default: []
    },
    estadoDesarrollo: {
        type: String,
        required: true,
        default: "noCompletado",
        enum: ["noCompletado", "completado"]
    },
    responsables: {
        type: [String],
        default: []
    },
    posiblesResponsables: {
        type: [String],
        default: []
    },
    responsablesSolicitados: {
        type: Number,
        default: 0,
    },
    nodoParent: {
        type: String,
    },
    tipoParent:{
        type: String,
        enum: ["nodoSolidaridad", "usuario"],
        default: "nodoSolidaridad"
    },
    publicitado:{
        type: Boolean,
        default:false,
    },
    propietario:{
        type:String,        
    },
    idForoResponsables: {
        type: String,
    },
    vinculos: {
        type: [EsquemaVinculosNodosSolidaridad],        
        default: []
    },
    keywords: {
        type: String,
    },
    movimientosDinero:{
        type:[esquemaMovimientoDinero],
        default:[]
    },
    eventos:{
        type: [EsquemaEvento],
        default: []
    },
    
    coords: {
        x: {
            type: Number,
            required: true,
            default: 0,
            validate: {
                validator: Number.isInteger,
                message: '{VALUE} is not an integer value'
            }
        },
        y: {
            type: Number,
            required: true,
            default: 0,
            validate: {
                validator: Number.isInteger,
                message: '{VALUE} is not an integer value'
            }
        }
    },
    autoCoords: {
        x: {
            type: Number,
            default: 0,
            validate: {
                validator: Number.isInteger,
                message: '{VALUE} is not an integer value'
            }
        },
        y: {
            type: Number,
            default: 0,
            validate: {
                validator: Number.isInteger,
                message: '{VALUE} is not an integer value'
            }
        }
    },
    angulo: {
        type: Number,
        default: 0,
    },
    stuck: {
        type: Boolean,
        default: true,
    },
    puntaje: {
        type: Number,
        default: 0,
    },
    centroMasa: {
        x: {
            type: Number,
            default: 0,
        },
        y: {
            type: Number,
            default: 0
        }
    },
    nivel: {
        type: Number,
    },
    turnoNivel: {
        type: Number,
    },
    peso: {
        type: Number,
        default: 0
    },
    fuerzaCentroMasa: {
        fuerza: {
            type: Number,
            default: 0
        },
        direccion: {
            type: Number,
            default: 0
        }
    },
    fuerzaColision: {
        fuerza: {
            type: Number,
            default: 0
        },
        direccion: {
            type: Number,
            default: 0
        }
    }

});
esquemaMovimientoDinero.pre("save", function(this:any, next){
    if(this.movimientoUnitario*this.cantidad!=this.movimientoTotal){
        throw new Error("El gasto total("+this.movimientoTotal+") no coincidía con el gasto unitario ("+this.movimientoUnitario+") y la cantidad ("+this.cantidad+")");
        return;
    }
    next();
    
});

esquemaNodoSolidaridad.post("save", function (nodo) {
    if(!nodo.posicionadoByFuerzas){    
        pubsub.publish(NODO_EDITADO, { nodoEditado: nodo });
        pubsub.publish(NODO_FAMILY_EDITADO, {nodoSolidaridadFamilyEditado:nodo});
    }
    
});
esquemaNodoSolidaridad.post("remove", function(nodo){ 
    console.log(`Publicando la removida de un nodo`);   
    pubsub.publish(NODO_ELIMINADO, {nodoEliminado:nodo.id, elNodoEliminado:nodo})
    pubsub.publish(NODO_FAMILY_ELIMINADO, {nodoSolidaridadFamilyEliminado: nodo.id, elNodoEliminado:nodo})
});

esquemaNodoSolidaridad.index({ nombre: "text", keywords: "text", descripcion: "text" });
export const ModeloNodoSolidaridad = mongoose.model("NodoSolidaridad", esquemaNodoSolidaridad);
