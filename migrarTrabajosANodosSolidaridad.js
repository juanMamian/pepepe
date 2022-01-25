const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Objetivo=require("./comunaBuild/model/atlasSolidaridad/Objetivo").ModeloObjetivo;
const Trabajo=require("./comunaBuild/model/atlasSolidaridad/Trabajo").ModeloTrabajo;
const NodoSolidaridad=require("./comunaBuild/model/atlasSolidaridad/NodoSolidaridad").ModeloNodoSolidaridad;
dotenv.config();

const iniciarMongoose = async () => {
    try {
        await mongoose.connect(
            process.env.DB_CONNECT,
            {
                useNewUrlParser: true,
                useUnifiedTopology: true
            }
        );
    } catch (error) {
        console.log(`Error conectando con la base de datos: E:${error}`);
    }
}

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
    console.log(`¡Base de datos conectada!`);
});

(async function () {
    await iniciarMongoose();
    try {
        
        var losTrabajos = await Trabajo.find({}).exec();
        var losObjetivos = await Objetivo.find({}).exec();
        console.log(`Trabajos: ${losTrabajos.length}, objetivos: ${losObjetivos.length}`);
    }
    catch (error) {
        console.log(`error . e: ` + error);
    }    
    losTrabajos.forEach(t=>{
        t.tipoNodo="trabajo";
    })
    losObjetivos.forEach(o=>{
        o.tipoNodo="objetivo";
    })
    var todosNodos=losTrabajos.concat(losObjetivos);
    console.log(`Los nodos son: ${todosNodos.length}`);   
    
   
    todosNodos.forEach(async(nodo)=>{
        
        try{            
            var nuevoNodo=new NodoSolidaridad({
                _id: nodo._id,                
                nombre: nodo.nombre,
                descripcion: nodo.descripcion,
                enlaces: nodo.enlaces,
                estadoDesarrollo: nodo.estadoDesarrollo,
                responsables: nodo.responsables,
                posiblesResponsables: nodo.posiblesResponsables,
                responsablesSolicitados: nodo.responsablesSolicitados,
                nodoParent: nodo.nodoParent ? nodo.nodoParent.idNodo: null,
                idForoResponsables: nodo.idForoResponsables,
                vinculos: nodo.vinculos,
                keywords: nodo.keywords,
                materiales: nodo.materiales,
                coords: nodo.coords,
                autoCoords: nodo.autoCoords,
                tipoNodo:nodo.tipoNodo
            });
            await nuevoNodo.save();
            console.log(`Guardado`);
        }
        catch(error){
            console.log(`error . e: `+error);
            return ;
        }
    })
    
    
})();

