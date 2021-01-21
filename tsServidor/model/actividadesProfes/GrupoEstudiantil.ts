import mongoose from "mongoose";

const esquemaParticipacion = new mongoose.Schema({
   
    fechaUpload:{
        type:Date
    },
    archivo:{
        nombre: String,
        extension:String,
        idGoogleDrive:String,
        googleDriveDirectLink:String,        
    },
    comentario:{
        type:String,        
    },
    idAutor:{
        type:String,
        required:true,
    }

});

esquemaParticipacion.pre('validate', function (this:any) {
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
    },
    leidoPorProfe:{
        type:Boolean,
        required:true,
        default:true
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
    },
    guiaGoogleDrive:{
        idArchivo:{
            type:String,            
        },
        enlace:{
            type:String
        }
    }
});


esquemaActividad.pre('save', function (this:any) {    
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

esquemaGrupoEstudiantil.pre('validate', function (this:any) {
    if ((this.isNew || this.isModified) && !this.actividades) {
      this.actividades=[]
    }
  });


export const ModeloGrupoEstudiantil = mongoose.model("GrupoEstudiantil", esquemaGrupoEstudiantil);
