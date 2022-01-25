import mongoose from "mongoose";
import { charProhibidosNombreCosa, charProhibidosTexto } from "./config"

export const esquemaEvento = new mongoose.Schema({

    nombre: {
        type: String,
        default:"Nuevo espacio",
        validate: {
            validator: function (n) {
                return !charProhibidosNombreCosa.test(n);
            },
            message: props => `${props.value} contiene caracteres ilegales!`
        },
        minlength: 3,
        maxLength: 60,
    },
    descripcion:{
        type: String,
        validate:{
            validator: function(d){
                return !charProhibidosTexto.test(d);
            },
            message: props=>`${props.value} contiene caracteres ilegales`
        }
    },
    idAdministrador:{
        type:String,
        required:true,
    }
});

export const ModeloEspacio = mongoose.model("Espacio", esquemaEvento);
