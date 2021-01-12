const mongoose = require("mongoose");

const esquemaArchivo = new mongoose.Schema({
    fechaUpload:{
        type: Date,
        required:true
    },
    comentario:{
        type:String,
        default:""
    }
});


const esquemaEvidencia = new mongoose.Schema({
    idUploader:{
        type:String,
        required:true
    },
    archivos:[esquemaArchivo]

});


module.exports.modeloEvidencia = mongoose.model("Evidencia", esquemaEvidencia);
