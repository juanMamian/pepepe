const mongoose = require("mongoose");

const Trabajo = require("./comunaBuild/model/Trabajo").ModeloTrabajo
const Objetivo = require("./comunaBuild/model/Objetivo").ModeloObjetivo
const dotenv = require("dotenv");
dotenv.config();


mongoose.set('useFindAndModify', false);
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
const anchoCeldas = 400;
const nodoDeInteres = null;

iniciar();

async function iniciar() {


    await iniciarMongoose();

    try {
        var todosObjetivos = await Objetivo.find({}).exec();
        var todosTrabajos = await Trabajo.find({}).exec();

        var todosNodos = todosObjetivos.concat(todosTrabajos);
        console.log(`Total: ${todosNodos.length} nodos`);
    }
    catch (error) {
        console.log(`error getting todos nodos. e: ` + error);
        return;
    }

    todosNodos.forEach(n=>{
        n.coords=n.autoCoords;
    })

    
        console.log(`Uploading...`);
        await uploadNodos(todosNodos);
    


}


async function uploadNodos(todosNodos) {
    todosNodos.forEach(async function (nodo) {
        try {
            await nodo.save();
        }
        catch (error) {
            console.log(`error guardando el nodo. e: ` + error);
            return res.status(400).send('');
        }
    })
}


function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}
