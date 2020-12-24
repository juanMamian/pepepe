const router = require("express").Router();
const jwt = require("jsonwebtoken");


const estaLogeado = function(req, res, next){
    const token=req.header("loginToken");
    console.log("req: "+JSON.stringify(req.header("loginToken")));
    if(!token){
        console.log("sin token");
        return res.status(401).send("login requerido1");        
    }
    
    try{
        const infoU=jwt.verify(token, process.env.TOKEN_SECRET);
        req.infoUsuario=infoU;
        console.log("request by " + infoU._id+" : "+infoU.login);
        next();
    }catch(err){
        return res.status(401).send("login requerido2");

    }    
}

module.exports.estaLogeado=estaLogeado;