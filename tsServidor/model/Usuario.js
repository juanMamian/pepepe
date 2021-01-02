const mongoose=require("mongoose");



const esquemaUsuario=mongoose.Schema({
    username:{
        type:String,
        min:3,
        max:50,
        unique: true
    },
    nombre:{
        type: String,        
        max: 255,
        min: 3
    },
    password:{
        type:String,
        required:true,
        max: 1024,
        min:6
    },
    permisos:{
        type:String,
        required:true,
        max: 100,
        min:2,
        default:"usuario"
    }
});


module.exports=mongoose.model("Usuario", esquemaUsuario);