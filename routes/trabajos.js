const mongoose = require("mongoose");
const router = require("express").Router();
const Trabajo = require("../model/Trabajo").modeloTrabajo;
const Proyecto = require("../model/Proyecto").modeloProyecto;

router.post("/crear", (req, res) => {
    const nTrabajo = new Trabajo({
        nombre : req.body.nombre ? req.body.nombre : "Nuevo trabajo",
        descripcion: req.body.descripcion ? req.body.descripcion : null,
        responsables: req.body.responsables ? req.body.responsables : null,
        materiales: req.body.materiales ? req.body.materiales : null,
        enlacesAtlas: req.body.enlacesAtlas ? req.body.enlacesAtlas : null,
        enlacesProyectos: req.body.enlacesProyectos ? req.body.enlacesProyectos : null,

    });

    nTrabajo.save((err, resultado)=>{
        
        
        if(err){
            console.log(err);
            return res.status(400).send(err);
        }


        return res.send({trabajo: resultado});
    });
});

module.exports=router;