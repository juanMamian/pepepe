const router=require("express").Router();
const User=require("../model/User");



router.post("/registro", async (req, res)=>{
    const nuevoU=new User({
        nombre: req.body.nombre,
        email: req.body.email,
        password: req.body.password
    });
    try {
        console.log("enviando a BD");
        const savedU= await nuevoU.save();
        res.send(nuevoU);
    }catch (error) {
        console.log("error guardando en base de datos");
        res.status(400).send(`errores: ${error}`);
    }
    //nuevoU.save();
    //res.send("registro de nuevo usuario");
    console.log("peticion de registro");
});

module.exports=router;