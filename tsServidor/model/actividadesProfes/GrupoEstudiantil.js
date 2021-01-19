const mongoose = require("mongoose");


const esquemaParticipacion = new mongoose.Schema({
   
    fechaUpload:{
        type:Date
    },
    archivo:{
        nombre: String,
        extension:String        
    },
    comentario:{
        type:String,        
    },
    idAutor:{
        type:String,
        required:true,
    }

});

esquemaParticipacion.pre('validate', function () {
    if ((this.isNew || this.isModified) && !this.archivos) {
      this.archivos=[]
    }
  });

  
const esquemaDesarrollo = new mongoose.Schema({
    idEstudiante:{
        type:String,
        required:true
    },
    estado:{
        type:String,
        default:"desarrollando",
        required:true,
        enum: ["desarrollando", "completado"]
    },
    participaciones: {
        type: [esquemaParticipacion],
        required: true,
        default:[]
    }

});


const esquemaActividad = new mongoose.Schema({
    nombre:{
        type:String,
        min:3,
        max:50,
        required:true,
        default:"Nueva actividad"
    },
    desarrollos:{
        type:[esquemaDesarrollo],
        required:true,
        default:[],
    },
    fechaCreacion:{
        type: Date,

    },
    idCreador:{
        type: String,
        required:true
    }
});


esquemaActividad.pre('save', function () {    
    if ((this.isNew || this.isModified) && !this.desarrollo) {
      this.desarrollo=[]
    }
  });


const esquemaGrupoEstudiantil = new mongoose.Schema({
    nombre:{
        type:String,
        min:3,
        max:50,
        required:true,
    },
    estudiantes: {
        type: [String],
        default: []
    },
    actividades: {
        type: [esquemaActividad],
        required: true,
        default: []
    },

});

esquemaGrupoEstudiantil.pre('validate', function () {
    if ((this.isNew || this.isModified) && !this.actividades) {
      this.actividades=[]
    }
  });


module.exports.modeloGrupoEstudiantil = mongoose.model("GrupoEstudiantil", esquemaGrupoEstudiantil);
