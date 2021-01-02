const passport=require("passport");
const LocalStrategy=require("passport-local").Strategy
const Usuario=require("../model/Usuario");

passport.use(new LocalStrategy(
    async function (username, password, done) {
        try {
            var usuario = await Usuario.findOne({ username: username }, "username password").exec();
        }
        catch (error) {
            return done(error);
        }
        if (!usuario) return done(null, false, { mensaje: "Usuario no existe" });

        const correctLogin = await bcrypt.compare(password, usuario.password);
        if (correctLogin) {
            return done(null, usuario);
        }
        else {
            return done(null, false, { mensaje: "Contraseña equivocada" });
        }
    }
    )
);

passport.serializeUser(
  function(usuario, done){
      if(usuario.hasOwnProperty("key"))return done("Objeto usuario mal formado", false);                
      done(null, {id:usuario._id, permisos: usuario.permisos});
  }  
);

passport.deserializeUser(
    function(id, done){
        try{
            var elUsuario=Usuario.findOne({_id:id}, "nombre username permisos").exec();
        }
        catch(error){
            console.log(`error . e: `+error);
            return done("error buscando usuario en la base de datos (deserialize)", false);
        }
        if(!elUsuario)return done("Usuario no existente (Deserialize)", false);
        done(null, elUsuario);
    }   
);
module.exports=passport;