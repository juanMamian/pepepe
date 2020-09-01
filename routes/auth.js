const router=require("express").Router();
const User=require("../model/User");



router.post("/registro", async (req, res)=>{
    console.log("peticion de registro");
    const nuevoU=new User({        
        login: req.body.login,        
        password: req.body.password
    }); 
    nuevoU.save(function(err, resultado){
        if(err){
            console.log(err);
            return res.status(400).send(err);
        }
        res.send(resultado);
    });
    
    
});

module.exports=router;