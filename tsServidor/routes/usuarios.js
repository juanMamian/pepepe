const router=require("express").Router();
const User=require("../model/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

router.post("/registro", async (req, res)=>{
    console.log("peticion de registro: "+JSON.stringify(req.body));

    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(req.body.password, salt);

    const nuevoU=new User({        
        login: req.body.login,        
        password: hashPassword,
        email:"ad_"
    }); 

    nuevoU.save(function(err, resultado){
        if(err){
            console.log(err);
            return res.status(400).send(err);
        }
        return res.send(resultado._id);
    });
    
    
});

router.post("/login", async(req, res) =>{
    const login=req.body.login;
    const pass=req.body.password;
    console.log("logging "+JSON.stringify(req.body));
    const usuario= await User.findOne({login: login});
    if(!usuario){
        console.log("usuario no encontrado");
        return res.status(400).send("badLogin");
    }
    const correctLogin=await bcrypt.compare(pass, usuario.password);
    if(correctLogin){
        const token = jwt.sign({_id: usuario._id, login: usuario.login}, process.env.TOKEN_SECRET);
        res.header("loginToken", token).send({token:token, login: login});
        return ;
        
    }
    else{
        return res.status(400).send("badPass");
    }
});

module.exports=router;